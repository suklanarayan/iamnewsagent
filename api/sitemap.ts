// Vercel Serverless Function: GET /sitemap.xml
import { getAllServerArticles, getAllServerAuthors, generateSitemapXml } from '../src/server/ssrEngine';

export default async function handler(_req: any, res: any) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=86400');

    const [articles, authors] = await Promise.all([
      getAllServerArticles(true),
      getAllServerAuthors(),
    ]);
    const xml = generateSitemapXml(articles, authors);

    res.status(200).send(xml);
  } catch (err: any) {
    console.error('Error generating dynamic sitemap.xml:', err?.message || err);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
}
