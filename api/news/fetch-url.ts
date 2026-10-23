// Vercel Serverless Function: POST /api/news/fetch-url

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    // Decimal numeric entities (e.g. &#039;, &#39;, &#8217;)
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return !isNaN(code) ? String.fromCharCode(code) : _;
    })
    // Hex numeric entities (e.g. &#x27;)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return !isNaN(code) ? String.fromCharCode(code) : _;
    })
    // Named entities
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&hellip;/gi, '…')
    .replace(/&lsquo;/gi, '‘')
    .replace(/&rsquo;/gi, '’')
    .replace(/&ldquo;/gi, '“')
    .replace(/&rdquo;/gi, '”')
    .replace(/&trade;/gi, '™')
    .replace(/&copy;/gi, '©')
    .replace(/&reg;/gi, '®')
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
      title = stripHtml(decodeHtmlEntities(rawTitle))
        .replace(/\s*[-–—|]\s*(NDTV(\.com)?|BBC(\s+News)?|The\s+Hindu|CNN|Reuters|Times\s+of\s+India|India\s+Today|Hindustan\s+Times|Indian\s+Express|Zee\s+News|News18|ANI|Live\s*Mint).*$/i, '')
        .replace(/^(Breaking(\s+News)?|Alert|Exclusive|Watch|Just\s+In|Live\s+Updates?):\s*/i, '')
        .trim();

      const lowerTitle = title.toLowerCase();
      if (
        !title ||
        lowerTitle.includes('404') ||
        lowerTitle.includes('403') ||
        lowerTitle.includes('not found') ||
        lowerTitle.includes('blocked') ||
        lowerTitle.includes('access denied') ||
        lowerTitle.includes('robot or human') ||
        lowerTitle.includes('cloudflare') ||
        lowerTitle.includes('just a moment') ||
        lowerTitle.includes('attention required')
      ) {
        title = '';
      }
    }

    let description = '';
    if (html) {
      const descMatch = /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i.exec(html) ||
                        /<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']/i.exec(html);
      description = descMatch ? decodeHtmlEntities(descMatch[1]) : '';
      if (description) {
        const lowerD = description.toLowerCase();
        if (lowerD.includes('access denied') || lowerD.includes('edgesuite') || lowerD.includes('reference #') || lowerD.includes('security check')) {
          description = '';
        }
      }
    }

    const paragraphs: string[] = [];
    if (html) {
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
      let pMatch: RegExpExecArray | null;

      while ((pMatch = pRegex.exec(html)) !== null && paragraphs.length < 35) {
        const cleanP = stripHtml(decodeHtmlEntities(pMatch[1]));
        const lowerP = cleanP.toLowerCase();
        if (
          cleanP.length > 50 &&
          !lowerP.includes('cookie') &&
          !lowerP.includes('subscribe') &&
          !lowerP.includes('all rights reserved') &&
          !lowerP.includes('javascript is disabled') &&
          !lowerP.includes('edgesuite.net') &&
          !lowerP.includes('reference #') &&
          !lowerP.includes('access denied') &&
          !lowerP.includes('cloudflare') &&
          !lowerP.includes('turn on javascript')
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
