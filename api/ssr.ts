import fs from 'fs';
import path from 'path';
import {
  getAllServerArticles,
  getServerArticleBySlug,
  renderArticleSsrHtml,
  renderHomeSsrHtml,
} from '../src/server/ssrEngine';

export default async function handler(req: any, res: any) {
  try {
    const rawUrl = req.url || '/';
    const parsedUrl = new URL(rawUrl, 'https://iamquickagent.com');
    const pathname = parsedUrl.pathname;

    // Load base index.html template
    let templateHtml = '';
    const possiblePaths = [
      path.join(process.cwd(), 'dist', 'index.html'),
      path.join(process.cwd(), 'index.html'),
      path.resolve(__dirname, '..', 'dist', 'index.html'),
      path.resolve(__dirname, '..', 'index.html'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        templateHtml = fs.readFileSync(p, 'utf-8');
        break;
      }
    }

    if (!templateHtml) {
      templateHtml = `<!doctype html><html><head><title>iamquickagent.com</title></head><body><div id="root"></div></body></html>`;
    }

    // 1. Article route: /news/:slug or /article/:slug
    const articleMatch = pathname.match(/^\/(?:news|article)\/([a-zA-Z0-9-_]+)/);
    if (articleMatch) {
      const slug = articleMatch[1];
      const article = await getServerArticleBySlug(slug);

      if (article) {
        const ssrHtml = renderArticleSsrHtml(article, templateHtml);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
        return res.status(200).send(ssrHtml);
      }
    }

    // 2. Homepage or Category route
    const allArticles = await getAllServerArticles();
    const categoryParam = parsedUrl.searchParams.get('category') || undefined;
    const homeHtml = renderHomeSsrHtml(allArticles, templateHtml, categoryParam);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=180, stale-while-revalidate=86400');
    return res.status(200).send(homeHtml);
  } catch (err: any) {
    console.error('SSR Handler error:', err?.message || err);
    // Graceful fallback to static index.html
    const fallbackPath = path.join(process.cwd(), 'index.html');
    const fallbackHtml = fs.existsSync(fallbackPath)
      ? fs.readFileSync(fallbackPath, 'utf-8')
      : '<!doctype html><html><head><title>iamquickagent.com</title></head><body><div id="root"></div></body></html>';
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(fallbackHtml);
  }
}
