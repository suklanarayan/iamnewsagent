// Consolidated Vercel Serverless Function for /sitemap.xml, /news-sitemap.xml, /robots.txt, /ai.txt, /rss.xml, /feed.xml, /llms.txt, /llms-full.txt
// Imports pre-bundled self-contained ESM module (explicit .mjs extension required by Node ESM on Vercel)
import { handleSeoRequest } from './_ssrBundle.mjs';

export default async function handler(req: any, res: any) {
  return handleSeoRequest(req, res);
}
