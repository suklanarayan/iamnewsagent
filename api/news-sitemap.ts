// Vercel Serverless Function: GET /news-sitemap.xml
import { SEED_ARTICLES } from '../src/data/seedData';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=1800');

  const baseUrl = 'https://iamquickagent.com';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  for (const article of SEED_ARTICLES) {
    const pubDate = article.publishedAt || new Date().toISOString();
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/article/${encodeURIComponent(article.slug)}</loc>\n`;
    xml += `    <news:news>\n`;
    xml += `      <news:publication>\n`;
    xml += `        <news:name>iamquickagent.com</news:name>\n`;
    xml += `        <news:language>en</news:language>\n`;
    xml += `      </news:publication>\n`;
    xml += `      <news:publication_date>${pubDate}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(article.headline)}</news:title>\n`;
    if (article.tags && article.tags.length > 0) {
      xml += `      <news:keywords>${escapeXml(article.tags.join(', '))}</news:keywords>\n`;
    }
    xml += `    </news:news>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  res.status(200).send(xml);
}
