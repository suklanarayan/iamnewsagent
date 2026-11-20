// Consolidated Vercel Serverless Function for all SEO/Crawler/Feed endpoints:
// /sitemap.xml, /news-sitemap.xml, /robots.txt, /ai.txt, /rss.xml, /feed.xml, /llms.txt, /llms-full.txt
// Keeps total /api Serverless Functions well below Vercel Hobby plan's 12-function limit.
import {
  getAllServerArticles,
  getAllServerAuthors,
  generateSitemapXml,
  generateNewsSitemapXml,
  generateRobotsTxt,
  generateAiTxt,
  generateRssXml,
  generateLlmsTxt,
} from '../src/server/ssrEngine';

function resolveFeedType(req: any): string {
  const queryType = typeof req.query?.type === 'string' ? req.query.type.toLowerCase().trim() : '';
  if (queryType) return queryType;

  const rawUrl = typeof req.url === 'string' ? req.url : '';
  try {
    const parsed = new URL(rawUrl, 'https://www.iamquickagent.com');
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

export default async function handler(req: any, res: any) {
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
