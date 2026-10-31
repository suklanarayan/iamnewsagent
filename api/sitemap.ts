// Vercel Serverless Function: GET /sitemap.xml
import { getAllServerArticles, generateSitemapXml } from '../src/server/ssrEngine';

export default async function handler(req: any, res: any) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=1800, stale-while-revalidate=86400');

    const articles = await getAllServerArticles();
    const xml = generateSitemapXml(articles);

    res.status(200).send(xml);
  } catch (err: any) {
    console.error('Error generating dynamic sitemap.xml:', err?.message || err);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
}
