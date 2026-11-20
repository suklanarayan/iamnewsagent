import fs from 'fs';
import path from 'path';
import { SSR_TEMPLATE_HTML } from './_ssrTemplate';
import { getLegalPageByPath } from '../src/data/legalPages';
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
} from '../src/server/ssrEngine';

function getTemplateHtml(): string {
  // 1. Prefer bundled Vite-built HTML template captured during build by scripts/prepare-ssr.mjs
  if (typeof SSR_TEMPLATE_HTML === 'string' && SSR_TEMPLATE_HTML.includes('<div id="root">')) {
    return SSR_TEMPLATE_HTML;
  }

  // 2. Fallback to reading from filesystem if available (ESM-safe, no __dirname)
  const possiblePaths = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf-8');
    }
  }

  return `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>iamquickagent.com</title></head><body><div id="root"></div></body></html>`;
}

export default async function handler(req: any, res: any) {
  try {
    const rawUrl = req.url || '/';
    const parsedUrl = new URL(rawUrl, SITE_URL);
    const routeParam =
      (typeof req.query?.__route === 'string'
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
