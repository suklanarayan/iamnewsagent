// Vercel Serverless Function: GET /sitemap.xml
import { SEED_ARTICLES, SEED_AUTHORS } from '../src/data/seedData';

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
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');

  const baseUrl = 'https://iamquickagent.com';
  const categories = [
    'India', 'World', 'Business', 'Technology', 'Markets',
    'Science', 'Health', 'Sports', 'Lifestyle', 'Entertainment', 'Explainers', 'Opinion'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
  xml += `    <changefreq>always</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // Categories
  for (const cat of categories) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/?category=${encodeURIComponent(cat)}</loc>\n`;
    xml += `    <changefreq>hourly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  // Authors
  for (const author of SEED_AUTHORS) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/author/${encodeURIComponent(author.id)}</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  }

  // Articles
  for (const article of SEED_ARTICLES) {
    const lastMod = article.updatedAt || article.publishedAt || new Date().toISOString();
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/article/${encodeURIComponent(article.slug)}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    if (article.featuredImage) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(article.featuredImage)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(article.headline)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  res.status(200).send(xml);
}
