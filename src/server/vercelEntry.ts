import fs from 'fs';
import path from 'path';
import { getLegalPageByPath } from '../data/legalPages.js';
import {
  SITE_URL,
  getAllServerArticles,
  getAllServerAuthors,
  getServerArticleBySlug,
  getServerAuthorById,
  renderArticleSsrHtml,
  renderAuthorSsrHtml,
  renderHomeSsrHtml,
  renderLegalSsrHtml,
  generateSitemapXml,
  generateNewsSitemapXml,
  generateRobotsTxt,
  generateAiTxt,
  generateRssXml,
  generateLlmsTxt,
} from './ssrEngine.js';

declare const __SSR_TEMPLATE_HTML__: string | undefined;

function getTemplateHtml(): string {
  // 1. Prefer build-time Vite HTML template injected by scripts/prepare-ssr.mjs
  try {
    if (typeof __SSR_TEMPLATE_HTML__ === 'string' && __SSR_TEMPLATE_HTML__.includes('<div id="root">')) {
      return __SSR_TEMPLATE_HTML__;
    }
  } catch {
    // Fallback below
  }

  // 2. Fallback to reading from filesystem if available
  const possiblePaths = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html'),
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf-8');
      }
    } catch {
      // Continue
    }
  }

  return `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>iamquickagent.com</title></head><body><div id="root"></div></body></html>`;
}

export async function handleSsrRequest(req: any, res: any) {
  try {
    const rawUrl = req?.url || '/';
    const parsedUrl = new URL(rawUrl, SITE_URL);
    const routeParam =
      (typeof req?.query?.__route === 'string'
        ? req.query.__route
        : parsedUrl.searchParams.get('__route')) || '';
    const pathname =
      routeParam ||
      (parsedUrl.pathname === '/api/ssr' || parsedUrl.pathname === '/api/ssr/'
        ? '/'
        : parsedUrl.pathname);

    // 0. Permanent 301 Redirect for legacy /article/:slug URLs -> canonical /news/:slug
    const legacyArticleMatch = pathname.match(/^\/article\/([a-zA-Z0-9-_]+)\/?$/);
    if (legacyArticleMatch) {
      const slug = legacyArticleMatch[1];
      res.setHeader('Location', `${SITE_URL}/news/${encodeURIComponent(slug)}`);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.status(301).end();
    }

    const templateHtml = getTemplateHtml();

    // 1. Legal & Compliance Pages (/privacy-policy, /terms-of-service, /cookie-policy, /editorial-standards)
    const legalPage = getLegalPageByPath(pathname);
    if (legalPage) {
      const ssrHtml = renderLegalSsrHtml(legalPage, templateHtml);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
      return res.status(200).send(ssrHtml);
    }

    // 2. Dynamic News Article Page (/news/:slug)
    const newsMatch = pathname.match(/^\/news\/([a-zA-Z0-9-_]+)\/?$/);
    if (newsMatch) {
      const slug = newsMatch[1];
      const [article, allArticles, authors] = await Promise.all([
        getServerArticleBySlug(slug),
        getAllServerArticles(),
        getAllServerAuthors(),
      ]);

      if (article) {
        const ssrHtml = renderArticleSsrHtml(article, templateHtml, authors, allArticles);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
        return res.status(200).send(ssrHtml);
      }
    }

    // 3. Author Profile Page (/author/:id)
    const authorMatch = pathname.match(/^\/author\/([a-zA-Z0-9-_]+)\/?$/);
    if (authorMatch) {
      const authorId = authorMatch[1];
      const [author, allArticles] = await Promise.all([
        getServerAuthorById(authorId),
        getAllServerArticles(),
      ]);
      if (author) {
        const ssrHtml = renderAuthorSsrHtml(author, allArticles, templateHtml);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=86400');
        return res.status(200).send(ssrHtml);
      }
    }

    // 4. Homepage or Category Route (/, /?category=...)
    const [allArticles, authors] = await Promise.all([
      getAllServerArticles(),
      getAllServerAuthors(),
    ]);
    const categoryParam = parsedUrl.searchParams.get('category') || undefined;
    const homeHtml = renderHomeSsrHtml(allArticles, templateHtml, categoryParam, authors);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=180, stale-while-revalidate=86400');
    return res.status(200).send(homeHtml);
  } catch (err: any) {
    console.error('SSR Handler error:', err?.message || err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(getTemplateHtml());
  }
}

function resolveFeedType(req: any): string {
  const queryType = typeof req?.query?.type === 'string' ? req.query.type.toLowerCase().trim() : '';
  if (queryType) return queryType;

  const rawUrl = typeof req?.url === 'string' ? req.url : '';
  try {
    const parsed = new URL(rawUrl, SITE_URL);
    const urlType = (parsed.searchParams.get('type') || '').toLowerCase().trim();
    if (urlType) return urlType;

    const pathname = parsed.pathname.toLowerCase();
    if (pathname.includes('news-sitemap')) return 'news-sitemap';
    if (pathname.includes('sitemap')) return 'sitemap';
    if (pathname.includes('robots')) return 'robots';
    if (pathname.includes('ai.txt') || pathname.endsWith('/ai')) return 'ai';
    if (pathname.includes('rss') || pathname.includes('feed')) return 'rss';
    if (pathname.includes('llms-full')) return 'llms-full';
    if (pathname.includes('llms')) return 'llms';
  } catch {
    // Fallback below
  }
  return 'sitemap';
}

export async function handleSeoRequest(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const feedType = resolveFeedType(req);

  try {
    switch (feedType) {
      case 'robots': {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.status(200).send(generateRobotsTxt());
      }

      case 'ai': {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.status(200).send(generateAiTxt());
      }

      case 'news-sitemap': {
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=86400');
        const articles = await getAllServerArticles(true);
        return res.status(200).send(generateNewsSitemapXml(articles));
      }

      case 'rss': {
        res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=1800, stale-while-revalidate=86400');
        const [articles, authors] = await Promise.all([
          getAllServerArticles(),
          getAllServerAuthors(),
        ]);
        return res.status(200).send(generateRssXml(articles, authors));
      }

      case 'llms':
      case 'llms-full': {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=1800, stale-while-revalidate=86400');
        const articles = await getAllServerArticles();
        return res.status(200).send(generateLlmsTxt(articles, feedType === 'llms-full'));
      }

      case 'sitemap':
      default: {
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=86400');
        const [articles, authors] = await Promise.all([
          getAllServerArticles(true),
          getAllServerAuthors(),
        ]);
        return res.status(200).send(generateSitemapXml(articles, authors));
      }
    }
  } catch (err: any) {
    console.error(`Error generating dynamic SEO endpoint (${feedType}):`, err?.message || err);
    if (feedType === 'rss') {
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel></channel></rss>');
    }
    if (feedType === 'robots' || feedType === 'ai' || feedType === 'llms' || feedType === 'llms-full') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(500).send('# iamquickagent.com\n');
    }
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
}
