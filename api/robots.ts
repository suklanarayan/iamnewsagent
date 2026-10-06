// Vercel Serverless Function: GET /robots.txt
export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  const robots = `# robots.txt for iamquickagent.com / iamnewsagent
User-agent: *
Allow: /
Disallow: /cms
Disallow: /api/

# AI Search Agents & LLM Web Crawlers
# Explicitly permitted for AI Overviews, Answer Engine Optimization (AEO), and LLM knowledge citation
User-agent: Google-Extended
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: GoogleOther-Image
Allow: /

User-agent: GoogleOther-Video
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: Bytespider
Allow: /

# Canonical Sitemaps
Sitemap: https://iamquickagent.com/sitemap.xml
Sitemap: https://iamquickagent.com/news-sitemap.xml
`;

  res.status(200).send(robots);
}
