// Vercel Serverless Function: GET /rss.xml and /feed.xml
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
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const baseUrl = 'https://iamquickagent.com';
  const now = new Date().toUTCString();

  let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">\n`;
  rss += `  <channel>\n`;
  rss += `    <title>iamquickagent.com - Rapid Digital News &amp; Intelligence Agent</title>\n`;
  rss += `    <link>${baseUrl}</link>\n`;
  rss += `    <description>High-performance rapid digital news and intelligence publishing platform with key takeaway briefs, breaking dispatches, and deep analysis.</description>\n`;
  rss += `    <language>en-US</language>\n`;
  rss += `    <lastBuildDate>${now}</lastBuildDate>\n`;
  rss += `    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>\n`;

  for (const article of SEED_ARTICLES) {
    const pubDate = new Date(article.publishedAt || Date.now()).toUTCString();
    const articleUrl = `${baseUrl}/article/${article.slug}`;
    const authorObj = SEED_AUTHORS.find(a => a.id === article.authorId);
    const authorName = authorObj ? authorObj.name : 'iamquickagent Intelligence Desk';

    rss += `    <item>\n`;
    rss += `      <title>${escapeXml(article.headline)}</title>\n`;
    rss += `      <link>${articleUrl}</link>\n`;
    rss += `      <guid isPermaLink="true">${articleUrl}</guid>\n`;
    rss += `      <pubDate>${pubDate}</pubDate>\n`;
    rss += `      <dc:creator>${escapeXml(authorName)}</dc:creator>\n`;
    rss += `      <category>${escapeXml(article.category)}</category>\n`;
    rss += `      <description>${escapeXml(article.deck || article.keyTakeaways?.[0] || article.headline)}</description>\n`;
    if (article.featuredImage) {
      rss += `      <enclosure url="${escapeXml(article.featuredImage)}" type="image/jpeg" length="102400" />\n`;
    }
    rss += `    </item>\n`;
  }

  rss += `  </channel>\n`;
  rss += `</rss>`;

  res.status(200).send(rss);
}
