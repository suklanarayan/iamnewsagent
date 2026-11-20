// Vercel Serverless Function: GET /rss.xml and /feed.xml
import { getAllServerArticles, getAllServerAuthors, generateRssXml } from '../src/server/ssrEngine';

export default async function handler(_req: any, res: any) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=1800, stale-while-revalidate=86400');

    const [articles, authors] = await Promise.all([
      getAllServerArticles(),
      getAllServerAuthors(),
    ]);
    res.status(200).send(generateRssXml(articles, authors));
  } catch (err: any) {
    console.error('Error generating RSS feed:', err?.message || err);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel></channel></rss>');
  }
}
