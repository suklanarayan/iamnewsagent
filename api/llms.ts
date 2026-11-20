// Vercel Serverless Function: GET /llms.txt and /llms-full.txt
import { getAllServerArticles, generateLlmsTxt } from '../src/server/ssrEngine';

export default async function handler(req: any, res: any) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=1800, stale-while-revalidate=86400');

    const fullMode = typeof req.url === 'string' && req.url.includes('llms-full');
    const articles = await getAllServerArticles();
    res.status(200).send(generateLlmsTxt(articles, fullMode));
  } catch (err: any) {
    console.error('Error generating llms.txt:', err?.message || err);
    res.status(500).send('# iamquickagent.com\n');
  }
}
