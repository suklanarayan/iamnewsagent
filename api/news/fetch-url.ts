// Vercel Serverless Function: POST /api/news/fetch-url

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '').trim();
}

function extractFromUrlSlug(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const slug = segments.reverse().find(s => s.length > 5 && !/^\d+$/.test(s)) || segments[0] || '';
    const cleanSlug = slug
      .replace(/\.[a-zA-Z0-9]+$/, '')
      .replace(/-\d+(\.\d+)?$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    const title = cleanSlug
      ? cleanSlug.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      : `${parsed.hostname} News Story`;
    const domain = parsed.hostname.replace(/^www\./, '');
    return {
      title,
      description: `Breaking news dispatch reported via ${domain} regarding ${title}.`,
      text: `Source: ${domain}\nStory Topic: ${title}\nOriginal Link: ${rawUrl}\n\nEditorial note: Extracted report topic for original news dispatch rewriting.`,
    };
  } catch {
    return {
      title: 'News Wire Article',
      description: 'Web source article dispatch',
      text: `Source link: ${rawUrl}`,
    };
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid URL is required in request body.' });
  }

  try {
    let html = '';
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(7000),
      });
      html = await response.text();
    } catch {
      // Fallback
    }

    if (!html || html.length < 500 || html.includes('cf-browser-verification') || html.includes('Just a moment...')) {
      try {
        const botResponse = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          signal: AbortSignal.timeout(6000),
        });
        const botHtml = await botResponse.text();
        if (botHtml && botHtml.length > html.length) {
          html = botHtml;
        }
      } catch {
        // Ignore
      }
    }

    let title = '';
    if (html) {
      const ogTitleMatch = /<meta\s+property=["']og:title["']\s+content=["']([\s\S]*?)["']/i.exec(html) ||
                           /<meta\s+name=["']twitter:title["']\s+content=["']([\s\S]*?)["']/i.exec(html);
      const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
      const h1Match = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);

      const rawTitle = ogTitleMatch ? ogTitleMatch[1] : titleMatch ? titleMatch[1] : h1Match ? h1Match[1] : '';
      title = stripHtml(decodeHtmlEntities(rawTitle));
      if (title.toLowerCase().includes('404') || title.toLowerCase().includes('not found') || title.toLowerCase().includes('blocked')) {
        title = '';
      }
    }

    let description = '';
    if (html) {
      const descMatch = /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i.exec(html) ||
                        /<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']/i.exec(html);
      description = descMatch ? decodeHtmlEntities(descMatch[1]) : '';
    }

    const paragraphs: string[] = [];
    if (html) {
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
      let pMatch: RegExpExecArray | null;

      while ((pMatch = pRegex.exec(html)) !== null && paragraphs.length < 35) {
        const cleanP = stripHtml(decodeHtmlEntities(pMatch[1]));
        if (
          cleanP.length > 50 &&
          !cleanP.toLowerCase().includes('cookie') &&
          !cleanP.toLowerCase().includes('subscribe') &&
          !cleanP.toLowerCase().includes('all rights reserved') &&
          !cleanP.toLowerCase().includes('javascript is disabled')
        ) {
          paragraphs.push(cleanP);
        }
      }
    }

    const extractedText = paragraphs.join('\n\n');

    if (title && (extractedText || description)) {
      return res.status(200).json({
        success: true,
        title,
        description,
        text: extractedText || description || title,
      });
    }

    const fallback = extractFromUrlSlug(url);
    return res.status(200).json({
      success: true,
      title: title || fallback.title,
      description: description || fallback.description,
      text: extractedText || description || fallback.text,
      isSlugFallback: !extractedText,
    });
  } catch (err) {
    const fallback = extractFromUrlSlug(url);
    return res.status(200).json({
      success: true,
      title: fallback.title,
      description: fallback.description,
      text: fallback.text,
      isSlugFallback: true,
    });
  }
}
