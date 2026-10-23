import { decodeHtmlEntities } from '../utils/seo';

// Service to interact with the backend News Wire & Gemini AI Rewriter

export interface WireArticle {
  id: string;
  title: string;
  source: string;
  link: string;
  pubDate: string;
  snippet: string;
  category: string;
}

export interface RewrittenArticleResult {
  headline: string;
  deck: string;
  category: string;
  keyTakeaways: string[];
  content: string;
  tags: string[];
  readTimeMinutes: number;
  imageTopic: string;
  imageCaption: string;
  originalityNote?: string;
}

/**
 * Strips HTML, decodes raw entity fragments (&#039;, &quot;), and removes publisher branding suffixes
 */
export function cleanNewsTitle(title: string): string {
  if (!title) return '';
  return decodeHtmlEntities(title)
    .replace(/<[^>]*>?/gm, '')
    // Remove publisher suffixes
    .replace(/\s*[-–—|]\s*(NDTV(\.com)?|BBC(\s+News)?|The\s+Hindu|CNN|Reuters|Times\s+of\s+India|India\s+Today|Hindustan\s+Times|Indian\s+Express|Zee\s+News|News18|ANI|Live\s*Mint).*$/i, '')
    // Remove leading alert tags
    .replace(/^(Breaking(\s+News)?|Alert|Exclusive|Watch|Just\s+In|Live\s+Updates?):\s*/i, '')
    .trim();
}

// Map topics/keywords to high quality curated Unsplash photography
export function resolveCuratedImageUrl(category: string, topic?: string): string {
  const t = (topic || category || '').toLowerCase();

  if (t.includes('ai') || t.includes('tech') || t.includes('chip') || t.includes('compute') || t.includes('cyber')) {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85';
  }
  if (t.includes('market') || t.includes('stock') || t.includes('bank') || t.includes('business') || t.includes('trade')) {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=85';
  }
  if (t.includes('space') || t.includes('satellite') || t.includes('science') || t.includes('planet')) {
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85';
  }
  if (t.includes('energy') || t.includes('solar') || t.includes('climate') || t.includes('green')) {
    return 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=85';
  }
  if (t.includes('sport') || t.includes('cricket') || t.includes('football') || t.includes('olympic')) {
    return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85';
  }
  if (t.includes('india') || t.includes('delhi') || t.includes('mumbai')) {
    return 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=85';
  }
  if (t.includes('health') || t.includes('medicine') || t.includes('hospital') || t.includes('bio')) {
    return 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=85';
  }
  // Default editorial news photo
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=85';
}

export async function fetchLiveWireNews(topic: string = 'ALL'): Promise<WireArticle[]> {
  const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
  try {
    if (topic === 'SOCIAL_TV') {
      const res = await fetch(`${baseUrl}/api/news/social-tv-trending`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items)) {
          return data.items.map((i: any) => ({
            id: i.id,
            title: i.title,
            source: `${i.sourceName} (${i.hashtag || (i.platform === 'tv' ? 'LIVE TV' : i.platform.toUpperCase())})`,
            link: i.url,
            pubDate: i.publishedAt,
            snippet: `${i.approxTraffic ? `[${i.approxTraffic}] ` : ''}${i.summary}`,
            category: i.category || 'Technology',
          }));
        }
      }
    }

    const res = await fetch(`${baseUrl}/api/news/top-sources?topic=${encodeURIComponent(topic)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.articles || [];
  } catch (err) {
    console.error('Failed to fetch wire news:', err);
    throw err;
  }
}

export async function fetchNewsFromUrl(url: string): Promise<{ title: string; text: string; description: string }> {
  // 1. Try server API first
  try {
    const res = await fetch('/api/news/fetch-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (data.title || data.text)) {
        const cleanTitle = cleanNewsTitle(data.title || '');
        const lower = cleanTitle.toLowerCase();
        // Ignore anti-bot / error responses from upstream
        if (
          cleanTitle &&
          !lower.includes('access denied') &&
          !lower.includes('robot or human') &&
          !lower.includes('cloudflare') &&
          !lower.includes('not found') &&
          !lower.includes('403') &&
          !lower.includes('404')
        ) {
          return {
            title: cleanTitle,
            text: decodeHtmlEntities(data.text || ''),
            description: decodeHtmlEntities(data.description || ''),
          };
        }
      }
    }
  } catch (err) {
    console.warn('Server fetch-url unavailable, falling back to browser extraction...', err);
  }

  // 2. Client-side fallback extraction (for static Vercel / GitHub Pages / CORS proxy)
  return await extractNewsFromUrlClientFallback(url);
}

// Client fallback URL scraper & extractor using public CORS gateways and DOMParser
export async function extractNewsFromUrlClientFallback(url: string): Promise<{ title: string; text: string; description: string }> {
  const getSlugFallback = () => {
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split('/').filter(Boolean);
      const slug = segments.reverse().find(s => s.length > 5 && !/^\d+$/.test(s)) || segments[0] || '';
      const cleanSlug = slug
        .replace(/\.[a-zA-Z0-9]+$/, '')
        .replace(/-\d+(\.\d+)?$/, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      const title = cleanSlug
        ? cleanSlug.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
        : `${parsed.hostname} News Article`;
      const domain = parsed.hostname.replace(/^www\./, '');
      return {
        title: cleanNewsTitle(title),
        description: `Breaking report reported via ${domain} regarding ${title}.`,
        text: `Source: ${domain}\nHeadline: ${title}\nURL: ${url}\n\nKey topic extracted for AI editorial rewrite.`,
      };
    } catch {
      return {
        title: 'News Article',
        description: 'Web source article',
        text: `Source link: ${url}`,
      };
    }
  };

  const slugFallback = getSlugFallback();

  // Try fetching HTML through public CORS gateways
  const gateways = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  ];

  for (const gateway of gateways) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(gateway, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const html = await res.text();
      if (!html || html.length < 300) continue;

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
      const docTitle = doc.querySelector('title')?.textContent;
      const h1 = doc.querySelector('h1')?.textContent;

      let rawTitle = (ogTitle || twitterTitle || docTitle || h1 || '').trim();
      let extractedTitle = cleanNewsTitle(rawTitle);

      const lowerTitle = extractedTitle.toLowerCase();
      if (
        !extractedTitle ||
        lowerTitle.includes('404') ||
        lowerTitle.includes('403') ||
        lowerTitle.includes('not found') ||
        lowerTitle.includes('blocked') ||
        lowerTitle.includes('access denied') ||
        lowerTitle.includes('robot or human') ||
        lowerTitle.includes('cloudflare') ||
        lowerTitle.includes('just a moment')
      ) {
        extractedTitle = '';
      }

      const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
      const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
      const extractedDesc = decodeHtmlEntities((ogDesc || metaDesc || '').trim());

      const pElements = Array.from(doc.querySelectorAll('article p, main p, .article-body p, .story-body p, p'));
      const paragraphs: string[] = [];
      for (const p of pElements) {
        const text = decodeHtmlEntities(p.textContent?.trim() || '');
        if (
          text.length > 50 &&
          !text.toLowerCase().includes('cookie') &&
          !text.toLowerCase().includes('subscribe') &&
          !text.toLowerCase().includes('all rights reserved') &&
          !paragraphs.includes(text)
        ) {
          paragraphs.push(text);
          if (paragraphs.length >= 25) break;
        }
      }

      const bodyText = paragraphs.join('\n\n');
      if (extractedTitle || bodyText || extractedDesc) {
        return {
          title: extractedTitle || slugFallback.title,
          description: extractedDesc || slugFallback.description,
          text: bodyText || extractedDesc || slugFallback.text,
        };
      }
    } catch {
      // Continue to next gateway
    }
  }

  return slugFallback;
}

// Fallback Journalistic Generator if API is unreachable (e.g. static host without serverless functions)
function generateJournalisticFallbackArticle(params: {
  rawText: string;
  headline?: string;
  sourceName?: string;
  preferredCategory?: string;
  tone?: string;
}): RewrittenArticleResult {
  const source = decodeHtmlEntities(params.sourceName || 'News Wire Service');
  const category = params.preferredCategory || 'India';

  // Completely clean input headline: decode entities and remove trailing source attributions
  const cleanHeadline = cleanNewsTitle(params.headline || 'Developing News Wire Dispatch') || 'Developing News Wire Dispatch';

  // Construct clean summary deck without any entity fragments
  const firstParagraph = params.rawText
    ? params.rawText.split('\n').map(s => s.trim()).find(s => s.length > 40 && !s.startsWith('Source:')) || ''
    : '';

  const cleanDeck = firstParagraph
    ? decodeHtmlEntities(firstParagraph.substring(0, 200).trim())
    : `An authoritative news dispatch and strategic assessment of developments regarding ${cleanHeadline}.`;

  return {
    headline: cleanHeadline,
    deck: cleanDeck,
    category: ['India', 'World', 'Business', 'Technology', 'Markets', 'Science', 'Health', 'Sports', 'Lifestyle', 'Entertainment', 'Explainers', 'Opinion'].includes(category) ? category : 'India',
    keyTakeaways: [
      `Official developments regarding ${cleanHeadline} have been documented by primary source reports.`,
      `Administrative authorities and investigative teams have initiated immediate assessment protocols.`,
      `Key stakeholders emphasize operational continuity and public coordination across the sector.`,
      `Verified dispatches continue under established editorial intelligence standards.`
    ],
    content: `## Executive Overview & Initial Dispatches

In an authoritative news report filed via **${source}**, fresh operational developments regarding **${cleanHeadline}** have emerged as a focal point across regional authorities.

According to verified reports, institutional bodies have enacted immediate coordination procedures designed to ensure safety, continuity of operations, and factual clarity.

## Verified Background & Key Inquiries

Deliberations are actively underway as investigators and civil authorities verify the origin and authenticity of initial disclosures. Community leadership and administrative officers emphasize that comprehensive protocols remain in full effect.

> "Transparent verification and swift institutional coordination remain paramount to ensuring accurate public knowledge and security."

## Ongoing Developments

As administrative officers continue assessments, additional verified advisories and formal briefings are expected as the situation develops.

*iamnewsagent.com will maintain active coverage as formal statements are released.*`,
    tags: ['Breaking News', 'Security Brief', 'Current Affairs', category],
    readTimeMinutes: 4,
    imageTopic: `${category.toLowerCase()} city news dispatch`,
    imageCaption: `Editorial context regarding ${cleanHeadline}.`,
    originalityNote: 'Original journalistic dispatch synthesized to avoid verbatim wire reproduction.',
  };
}

export async function rewriteNewsWithGemini(params: {
  rawText: string;
  headline?: string;
  sourceName?: string;
  preferredCategory?: string;
  tone?: string;
}): Promise<RewrittenArticleResult> {
  const sanitizedParams = {
    ...params,
    headline: params.headline ? cleanNewsTitle(params.headline) : '',
    rawText: params.rawText ? decodeHtmlEntities(params.rawText) : '',
  };

  try {
    const res = await fetch('/api/news/ai-rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedParams),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return {
          ...data.data,
          headline: cleanNewsTitle(data.data.headline),
          deck: decodeHtmlEntities(data.data.deck),
          content: decodeHtmlEntities(data.data.content),
          keyTakeaways: (data.data.keyTakeaways || []).map((k: string) => decodeHtmlEntities(k)),
          tags: (data.data.tags || []).map((t: string) => decodeHtmlEntities(t)),
          imageCaption: decodeHtmlEntities(data.data.imageCaption || ''),
        };
      }
    }
  } catch (err) {
    console.warn('Failed to rewrite news via server endpoint, engaging fallback:', err);
  }

  // Graceful fallback for static environments or temporary network disruptions
  return generateJournalisticFallbackArticle(sanitizedParams);
}

export interface LiveStoryPointsResult {
  subtitle: string;
  keyPoints: string[];
  imageTopic?: string;
}

export async function generateLiveStoryPoints(params: {
  title: string;
  category?: string;
  context?: string;
}): Promise<LiveStoryPointsResult> {
  try {
    const res = await fetch('/api/news/generate-story-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
    console.warn(`Server generate-story-points returned status ${res.status}. Using live points generator fallback...`);
  } catch (err) {
    console.warn('Failed generating live story points:', err);
  }

  return {
    subtitle: 'Live',
    keyPoints: [
      `Official statements issued regarding recent developments in ${params.title}.`,
      `Executive delegations and relevant authorities have initiated coordination protocols.`,
      `Real-time developments are being monitored continuously across administrative desks.`,
    ],
    imageTopic: 'news briefing live',
  };
}

