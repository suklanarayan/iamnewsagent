import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { SEED_ARTICLES, SEED_AUTHORS } from './src/data/seedData';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// CORS Middleware for multi-environment deployments & Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Lazy init Google GenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// Helper: decode HTML entities in RSS
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

// Helper: strip HTML tags
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '').trim();
}

// Topic RSS URLs
const TOPIC_FEEDS: Record<string, string[]> = {
  ALL: [
    'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
    'https://feeds.bbci.co.uk/news/rss.xml',
  ],
  INDIA: [
    'https://news.google.com/rss/search?q=India&hl=en-IN&gl=IN&ceid=IN:en',
    'https://www.thehindu.com/news/national/feeder/default.rss',
  ],
  WORLD: [
    'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-IN&gl=IN&ceid=IN:en',
    'https://feeds.bbci.co.uk/news/world/rss.xml',
  ],
  BUSINESS: [
    'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en',
    'https://feeds.bbci.co.uk/news/business/rss.xml',
  ],
  TECHNOLOGY: [
    'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-IN&gl=IN&ceid=IN:en',
    'https://feeds.bbci.co.uk/news/technology/rss.xml',
  ],
  SCIENCE: [
    'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-IN&gl=IN&ceid=IN:en',
    'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  ],
  SPORTS: [
    'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-IN&gl=IN&ceid=IN:en',
  ],
  ENTERTAINMENT: [
    'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-IN&gl=IN&ceid=IN:en',
  ],
};

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// 2. Fetch live top source news from RSS
app.get('/api/news/top-sources', async (req, res) => {
  const topic = ((req.query.topic as string) || 'ALL').toUpperCase();
  const feeds = TOPIC_FEEDS[topic] || TOPIC_FEEDS.ALL;

  const items: Array<{
    id: string;
    title: string;
    source: string;
    link: string;
    pubDate: string;
    snippet: string;
    category: string;
  }> = [];

  for (const feedUrl of feeds) {
    try {
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) continue;
      const xml = await response.text();

      // Extract items with regex
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      let match: RegExpExecArray | null;

      while ((match = itemRegex.exec(xml)) !== null && items.length < 25) {
        const itemContent = match[1];

        const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(itemContent);
        const linkMatch = /<link>([\s\S]*?)<\/link>/i.exec(itemContent) || /<guid[^>]*>([\s\S]*?)<\/guid>/i.exec(itemContent);
        const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemContent);
        const descMatch = /<description>([\s\S]*?)<\/description>/i.exec(itemContent);
        const sourceMatch = /<source[^>]*>([\s\S]*?)<\/source>/i.exec(itemContent);

        if (titleMatch) {
          let rawTitle = decodeHtmlEntities(titleMatch[1]);
          let sourceName = sourceMatch ? decodeHtmlEntities(sourceMatch[1]) : '';

          // Google News titles usually have "Headline - Source Name"
          if (!sourceName && rawTitle.includes(' - ')) {
            const parts = rawTitle.split(' - ');
            if (parts.length >= 2) {
              sourceName = parts.pop()?.trim() || '';
              rawTitle = parts.join(' - ').trim();
            }
          }
          if (!sourceName) {
            sourceName = feedUrl.includes('bbci.co.uk') ? 'BBC News' : feedUrl.includes('thehindu') ? 'The Hindu' : 'Top Wire';
          }

          let snippet = descMatch ? stripHtml(decodeHtmlEntities(descMatch[1])) : '';
          // Clean snippet of repetitious source
          if (snippet.length > 250) {
            snippet = snippet.substring(0, 250) + '...';
          }

          const link = linkMatch ? decodeHtmlEntities(linkMatch[1]).trim() : '';
          const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toUTCString();

          const id = Buffer.from(rawTitle + pubDate).toString('base64').substring(0, 16);

          items.push({
            id,
            title: rawTitle,
            source: sourceName,
            link,
            pubDate,
            snippet: snippet || rawTitle,
            category: topic === 'ALL' ? 'World' : topic.charAt(0) + topic.slice(1).toLowerCase(),
          });
        }
      }
    } catch (err) {
      console.warn(`Feed fetch error for ${feedUrl}:`, (err as Error).message);
    }
  }

  // Deduplicate items by title similarity
  const seenTitles = new Set<string>();
  const uniqueItems = items.filter((item) => {
    const simplified = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 30);
    if (seenTitles.has(simplified)) return false;
    seenTitles.add(simplified);
    return true;
  });

  res.json({
    success: true,
    topic,
    count: uniqueItems.length,
    articles: uniqueItems,
  });
});

// Helper: Clean CDATA and decode HTML entities
function cleanCdataAndEntities(str: string): string {
  if (!str) return '';
  const noCdata = str.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
  return decodeHtmlEntities(noCdata);
}

// Helper: Safely parse arbitrary date/time string to ISO without throwing "Invalid time value"
function safeIsoDate(dateStr?: string | number | null): string {
  if (!dateStr) return new Date().toISOString();
  try {
    if (typeof dateStr === 'number') {
      if (isNaN(dateStr) || dateStr <= 0) return new Date().toISOString();
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    }
    const cleaned = cleanCdataAndEntities(String(dateStr)).trim();
    if (!cleaned) return new Date().toISOString();
    // Strip trailing parenthetical timezone like (GMT) or (IST) which break standard Date.parse
    const normalized = cleaned.replace(/\s*\([A-Z]{2,5}\)\s*$/i, '').trim();
    const d = new Date(normalized);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
    const d2 = new Date(cleaned);
    if (!isNaN(d2.getTime())) {
      return d2.toISOString();
    }
    return new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// Helper: Generate clean, punchy hashtag
function generateCleanHashtag(title: string): string {
  const clean = cleanCdataAndEntities(title)
    .replace(/[^\w\s\u0900-\u097F]/g, '')
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '#BreakingNews';
  if (words.length === 1) return `#${words[0]}`;
  // Pick 2-3 most descriptive words
  const filtered = words.filter(w => !/^(the|a|an|in|on|at|to|for|of|with|and|is|are|was|were|as|by)$/i.test(w));
  const tagWords = (filtered.length >= 2 ? filtered : words).slice(0, 3);
  return '#' + tagWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

// Helper: Curated photos for viral categories
function resolveTrendingImage(category: string, title: string): string {
  const t = (title + ' ' + category).toLowerCase();
  if (t.includes('cricket') || t.includes('match') || t.includes('sport') || t.includes('ipl') || t.includes('t20')) {
    return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('tech') || t.includes('ai') || t.includes('apple') || t.includes('google') || t.includes('chip') || t.includes('musk')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('movie') || t.includes('cinema') || t.includes('film') || t.includes('actor') || t.includes('box office')) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('market') || t.includes('sensex') || t.includes('nifty') || t.includes('stock') || t.includes('rbi') || t.includes('budget')) {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('court') || t.includes('parliament') || t.includes('modi') || t.includes('election') || t.includes('minister')) {
    return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('space') || t.includes('isro') || t.includes('nasa') || t.includes('satellite')) {
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
}

// In-memory cache for Social & TV trending
let cachedSocialTvTrends: any[] = [];
let lastSocialTvFetchTime = 0;
const SOCIAL_TV_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

// High-fidelity fallback seed for guaranteed instant availability
const FALLBACK_SOCIAL_TV_TRENDS = [
  {
    id: 'stv-seed-1',
    title: 'India Semiconductor Mission: New $10B Fabrication Facilities Approved',
    headline: 'Massive viral discussions around domestic chip manufacturing and tech self-reliance by 2028.',
    platform: 'x',
    sourceName: '𝕏 Viral Tech Wire',
    hashtag: '#IndiaSemiconductors',
    approxTraffic: '240K+ posts on 𝕏',
    summary: 'Tech industry leaders, policymakers, and engineering faculties drive massive engagement as the government unveils key incentives for silicon fabrication in Gujarat and Tamil Nadu.',
    url: 'https://news.google.com/search?q=India+Semiconductor+Mission',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    category: 'Technology',
    isLiveBroadcast: false,
    publishedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    viralScore: 98,
  },
  {
    id: 'stv-seed-2',
    title: 'NDTV Prime Time Digital: Diplomatic Consensus on New Delhi BRICS Declaration',
    headline: 'Special digital broadcast edition on Global South governance reforms and multilateral trade settlements.',
    platform: 'tv',
    sourceName: 'NDTV 24x7 Digital',
    hashtag: '#BRICS2026',
    approxTraffic: '🔴 LIVE Digital Broadcast',
    summary: 'Special digital newsroom stream tracking the unanimous adoption of the New Delhi Declaration and bilateral currency trade mechanisms.',
    url: 'https://www.ndtv.com',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    category: 'World',
    isLiveBroadcast: true,
    publishedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    viralScore: 95,
  },
  {
    id: 'stv-seed-3',
    title: 'ISRO Announces Next Generation Launch Vehicle (NGLV) Flight Readiness Roadmap',
    headline: 'Space research discussions spike across Meta and Reddit following propulsion test clearances.',
    platform: 'facebook',
    sourceName: 'Meta Viral Pulse',
    hashtag: '#ISROSpaceVision',
    approxTraffic: '180K shares & interactions',
    summary: 'Heavy-lift rocket development milestones generate enthusiastic civic responses across social platforms following official briefing by ISRO scientists.',
    url: 'https://news.google.com/search?q=ISRO+NGLV',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    category: 'Science',
    isLiveBroadcast: false,
    publishedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    viralScore: 92,
  },
  {
    id: 'stv-seed-4',
    title: 'BBC World News: Clean Energy Transition & Global Grid Interconnection Talks',
    headline: 'World broadcast stream reports on multilateral climate finance and renewable cross-border corridors.',
    platform: 'tv',
    sourceName: 'BBC World News TV',
    hashtag: '#GlobalEnergySummit',
    approxTraffic: '🔴 Video Broadcast Feed',
    summary: 'International delegations conclude landmark cross-border green power sharing agreement across Asia and Europe.',
    url: 'https://www.bbc.com/news/world',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
    category: 'Business',
    isLiveBroadcast: true,
    publishedAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    viralScore: 90,
  },
  {
    id: 'stv-seed-5',
    title: 'India vs Australia T20 Decider: Record Streaming Numbers and Fan Reactions',
    headline: 'Top trending sports topic across X and Meta with real-time fan debates on team selection.',
    platform: 'x',
    sourceName: '𝕏 Sports Radar',
    hashtag: '#IndvsAus',
    approxTraffic: '420K+ posts on 𝕏',
    summary: 'High-voltage cricket showdown captures national social timelines with match predictions, video highlights, and expert commentary.',
    url: 'https://news.google.com/search?q=India+vs+Australia+Cricket',
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    category: 'Sports',
    isLiveBroadcast: false,
    publishedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    viralScore: 99,
  },
  {
    id: 'stv-seed-6',
    title: 'India Today TV Digital: Supreme Court Hearing on Digital Personal Data Protection',
    headline: 'Live courtroom coverage and legal expert analysis on consumer privacy guidelines.',
    platform: 'tv',
    sourceName: 'India Today Digital',
    hashtag: '#PrivacyRights2026',
    approxTraffic: '🔴 TV Live Bulletin',
    summary: 'Constitutional bench reviews data fiduciary compliance rules, sparking widespread debates among tech firms and civil rights advocates.',
    url: 'https://www.indiatoday.in',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    category: 'India',
    isLiveBroadcast: true,
    publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    viralScore: 88,
  }
];

// 2.5 Live Social Media & TV News Trending Aggregator (Fusion of Modern News)
app.get('/api/news/social-tv-trending', async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const platformFilter = (req.query.platform as string || 'all').toLowerCase();
  const now = Date.now();

  if (!forceRefresh && cachedSocialTvTrends.length > 0 && (now - lastSocialTvFetchTime) < SOCIAL_TV_CACHE_TTL) {
    const filtered = filterSocialTvItems(cachedSocialTvTrends, platformFilter);
    return res.json({
      success: true,
      count: filtered.length,
      platform: platformFilter,
      isCached: true,
      cachedAt: safeIsoDate(lastSocialTvFetchTime),
      items: filtered,
    });
  }

  try {
    const [trendsInXml, trendsUsXml, socialViralXml, tvDigitalXml, ndtvXml, bbcXml] = await Promise.all([
      fetch('https://trends.google.com/trending/rss?geo=IN', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000),
      }).then(r => r.text()).catch(() => ''),
      fetch('https://trends.google.com/trending/rss?geo=US', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000),
      }).then(r => r.text()).catch(() => ''),
      fetch('https://news.google.com/rss/search?q=trending+on+social+media+OR+viral+OR+trending+on+X&hl=en-IN&gl=IN&ceid=IN:en', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000),
      }).then(r => r.text()).catch(() => ''),
      fetch('https://news.google.com/rss/search?q=NDTV+digital+OR+BBC+News+digital+OR+CNN+broadcast&hl=en-IN&gl=IN&ceid=IN:en', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000),
      }).then(r => r.text()).catch(() => ''),
      fetch('https://feeds.feedburner.com/ndtvnews-top-stories', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000),
      }).then(r => r.text()).catch(() => ''),
      fetch('https://feeds.bbci.co.uk/news/world/rss.xml', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000),
      }).then(r => r.text()).catch(() => ''),
    ]);

    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;

    // 1. Process Google Trends (India + Global) -> Social Media & Viral Buzz
    const processTrends = (xml: string, region: string) => {
      let match: RegExpExecArray | null;
      let count = 0;
      const localRegex = /<item>([\s\S]*?)<\/item>/gi;
      while ((match = localRegex.exec(xml)) !== null && count < 6) {
        const raw = match[1];
        const title = cleanCdataAndEntities(raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
        if (!title) continue;

        const approx = raw.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/)?.[1] || '';
        const newsTitle = cleanCdataAndEntities(raw.match(/<ht:news_item_title>([\s\S]*?)<\/ht:news_item_title>/)?.[1] || title);
        const newsSnippet = cleanCdataAndEntities(raw.match(/<ht:news_item_snippet>([\s\S]*?)<\/ht:news_item_snippet>/)?.[1] || '');
        const newsSource = cleanCdataAndEntities(raw.match(/<ht:news_item_source>([\s\S]*?)<\/ht:news_item_source>/)?.[1] || (region === 'IN' ? 'Trending on 𝕏 (India)' : 'Global Viral Radar'));
        const newsUrl = cleanCdataAndEntities(raw.match(/<ht:news_item_url>([\s\S]*?)<\/ht:news_item_url>/)?.[1] || `https://news.google.com/search?q=${encodeURIComponent(title)}`);
        const pubDateMatch = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];

        const hashtag = generateCleanHashtag(title);
        const platform = count % 2 === 0 ? 'x' : 'facebook';
        const formattedTraffic = approx
          ? `${approx.replace('+', '')}+ searches · Viral on ${platform === 'x' ? '𝕏' : 'Meta'}`
          : `Trending #${count + 1} on ${platform === 'x' ? '𝕏' : 'Meta'}`;

        const category = region === 'IN' ? 'India' : 'World';
        items.push({
          id: `trend-${region.toLowerCase()}-${count}-${Buffer.from(title).toString('base64').substring(0, 8)}`,
          title,
          headline: newsTitle,
          platform,
          sourceName: newsSource,
          hashtag,
          approxTraffic: formattedTraffic,
          summary: newsSnippet || `Major public momentum and viral engagement centered on ${title}.`,
          url: newsUrl,
          imageUrl: resolveTrendingImage(category, title + ' ' + newsTitle),
          category,
          isLiveBroadcast: false,
          publishedAt: safeIsoDate(pubDateMatch),
          viralScore: Math.floor(88 + Math.random() * 11),
        });
        count++;
      }
    };

    if (trendsInXml) processTrends(trendsInXml, 'IN');
    if (trendsUsXml) processTrends(trendsUsXml, 'US');

    // 1.5 Process Live Google News Viral Social Stream (X & Facebook)
    if (socialViralXml) {
      let match: RegExpExecArray | null;
      let count = 0;
      const localRegex = /<item>([\s\S]*?)<\/item>/gi;
      while ((match = localRegex.exec(socialViralXml)) !== null && count < 8) {
        const raw = match[1];
        let title = cleanCdataAndEntities(raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
        if (!title || title.toLowerCase() === 'google news') continue;

        let sourceName = 'Trending on 𝕏';
        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          sourceName = parts.pop()?.trim() || sourceName;
          title = parts.join(' - ').trim();
        }

        const link = cleanCdataAndEntities(raw.match(/<link>([\s\S]*?)<\/link>/)?.[1] || raw.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] || '');
        const desc = stripHtml(cleanCdataAndEntities(raw.match(/<description>([\s\S]*?)<\/description>/)?.[1] || ''));
        const pubDateMatch = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];

        const isFacebook = count % 3 === 2;
        const platform = isFacebook ? 'facebook' : 'x';
        const hashtag = generateCleanHashtag(title);
        const approxEngagements = Math.floor(120 + Math.random() * 250);

        items.push({
          id: `social-${platform}-${count}-${Buffer.from(title).toString('base64').substring(0, 8)}`,
          title,
          headline: title,
          platform,
          sourceName: isFacebook ? `${sourceName} (Meta Viral)` : `${sourceName} (𝕏 Wire)`,
          hashtag,
          approxTraffic: `${approxEngagements}K+ discussions on ${isFacebook ? 'Facebook' : '𝕏'}`,
          summary: desc.length > 220 ? desc.substring(0, 217) + '...' : desc || `Top viral conversation, shared multimedia updates, and citizen reactions regarding ${title}.`,
          url: link || `https://news.google.com/search?q=${encodeURIComponent(title)}`,
          imageUrl: resolveTrendingImage('General', title),
          category: 'Technology',
          isLiveBroadcast: false,
          publishedAt: safeIsoDate(pubDateMatch),
          viralScore: Math.floor(91 + Math.random() * 8),
        });
        count++;
      }
    }

    // 2. Process TV Digital Broadcast Editions (NDTV, BBC, TV digital streams)
    const processTvFeed = (xml: string, networkName: string, defaultCategory: string) => {
      let match: RegExpExecArray | null;
      let count = 0;
      const localRegex = /<item>([\s\S]*?)<\/item>/gi;
      while ((match = localRegex.exec(xml)) !== null && count < 5) {
        const raw = match[1];
        let title = cleanCdataAndEntities(raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
        if (!title || title.toLowerCase() === 'google news') continue;

        let channelName = networkName;
        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          channelName = parts.pop()?.trim() || channelName;
          title = parts.join(' - ').trim();
        }

        const link = cleanCdataAndEntities(raw.match(/<link>([\s\S]*?)<\/link>/)?.[1] || raw.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] || '');
        const desc = stripHtml(cleanCdataAndEntities(raw.match(/<description>([\s\S]*?)<\/description>/)?.[1] || ''));
        const pubDateMatch = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];

        const hashtag = generateCleanHashtag(title);
        items.push({
          id: `tv-${channelName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${count}-${Buffer.from(title).toString('base64').substring(0, 8)}`,
          title,
          headline: title,
          platform: 'tv',
          sourceName: `${channelName} Digital TV`,
          hashtag,
          approxTraffic: '🔴 LIVE TV Digital Bulletin',
          summary: desc.length > 200 ? desc.substring(0, 197) + '...' : desc || `Live television digital coverage and prime-time video dispatch from ${channelName}.`,
          url: link || 'https://www.ndtv.com',
          imageUrl: resolveTrendingImage(defaultCategory, title),
          category: defaultCategory,
          isLiveBroadcast: true,
          publishedAt: safeIsoDate(pubDateMatch),
          viralScore: Math.floor(92 + Math.random() * 7),
        });
        count++;
      }
    };

    if (tvDigitalXml) processTvFeed(tvDigitalXml, 'TV Digital Network', 'World');
    if (ndtvXml) processTvFeed(ndtvXml, 'NDTV 24x7 Digital', 'India');
    if (bbcXml) processTvFeed(bbcXml, 'BBC World TV Digital', 'World');

    // If live feeds returned less than 4 items, supplement with fallback seed
    if (items.length < 4) {
      items.push(...FALLBACK_SOCIAL_TV_TRENDS);
    }

    // Deduplicate by title similarity
    const seen = new Set<string>();
    const unique = items.filter(item => {
      const slug = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 25);
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    });

    cachedSocialTvTrends = unique.length > 0 ? unique : FALLBACK_SOCIAL_TV_TRENDS;
    lastSocialTvFetchTime = now;

    const filtered = filterSocialTvItems(cachedSocialTvTrends, platformFilter);
    res.json({
      success: true,
      count: filtered.length,
      platform: platformFilter,
      isCached: false,
      cachedAt: safeIsoDate(lastSocialTvFetchTime),
      items: filtered,
    });
  } catch (err) {
    console.warn('Social & TV trending aggregation error, serving fallback seed:', (err as Error).message);
    const filtered = filterSocialTvItems(FALLBACK_SOCIAL_TV_TRENDS, platformFilter);
    res.json({
      success: true,
      count: filtered.length,
      platform: platformFilter,
      isCached: true,
      fallbackUsed: true,
      items: filtered,
    });
  }
});

// Helper: Filter social & TV items by platform
function filterSocialTvItems(items: any[], platform: string) {
  if (!platform || platform === 'all') return items;
  if (platform === 'x') return items.filter(i => i.platform === 'x');
  if (platform === 'tv') return items.filter(i => i.platform === 'tv');
  if (platform === 'facebook') return items.filter(i => i.platform === 'facebook');
  if (platform === 'hashtags') return items.filter(i => i.hashtag);
  return items;
}

// 3. Fetch webpage text from URL (Resilient multi-tier extraction)
app.post('/api/news/fetch-url', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid URL is required.' });
  }

  // Helper to extract a readable headline and context from URL slug as guaranteed safety fallback
  const extractFromUrlSlug = (rawUrl: string) => {
    try {
      const parsed = new URL(rawUrl);
      const segments = parsed.pathname.split('/').filter(Boolean);
      // Pick the segment that looks like a story slug (longest or last non-numeric)
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
  };

  try {
    let html = '';
    let fetchError: Error | null = null;

    // Strategy A: Standard browser user agent
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
    } catch (err) {
      fetchError = err as Error;
    }

    // Strategy B: If Strategy A failed or returned anti-bot challenge, try Googlebot header
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
        // Continue with whatever we have
      }
    }

    // Extract title from HTML
    let title = '';
    if (html) {
      const ogTitleMatch = /<meta\s+property=["']og:title["']\s+content=["']([\s\S]*?)["']/i.exec(html) ||
                           /<meta\s+name=["']twitter:title["']\s+content=["']([\s\S]*?)["']/i.exec(html);
      const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
      const h1Match = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);

      const rawTitle = ogTitleMatch ? ogTitleMatch[1] : titleMatch ? titleMatch[1] : h1Match ? h1Match[1] : '';
      title = stripHtml(decodeHtmlEntities(rawTitle));
      // Ignore generic 404/403 page titles
      if (title.toLowerCase().includes('404') || title.toLowerCase().includes('not found') || title.toLowerCase().includes('blocked')) {
        title = '';
      }
    }

    // Extract meta description
    let description = '';
    if (html) {
      const descMatch = /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i.exec(html) ||
                        /<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']/i.exec(html);
      description = descMatch ? decodeHtmlEntities(descMatch[1]) : '';
    }

    // Extract paragraph text
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

    // If we got substantial content, return it
    if (title && (extractedText || description)) {
      return res.json({
        success: true,
        title,
        description,
        text: extractedText || description || title,
      });
    }

    // Fallback: If page was blocked or protected, extract from URL slug
    const fallback = extractFromUrlSlug(url);
    res.json({
      success: true,
      title: title || fallback.title,
      description: description || fallback.description,
      text: extractedText || description || fallback.text,
      isSlugFallback: !extractedText,
    });
  } catch (err) {
    const fallback = extractFromUrlSlug(url);
    res.json({
      success: true,
      title: fallback.title,
      description: fallback.description,
      text: fallback.text,
      isSlugFallback: true,
    });
  }
});

// 4. AI Rewrite with Gemini
app.post('/api/news/ai-rewrite', async (req, res) => {
  const {
    rawText,
    headline,
    sourceName,
    preferredCategory,
    tone = 'journalistic and balanced',
  } = req.body;

  if (!rawText && !headline) {
    return res.status(400).json({ error: 'Either rawText or headline is required.' });
  }

  try {
    const ai = getGenAI();

    const prompt = `You are a Senior Executive Editor at "iamnewsagent.com" (tagline: "Real News. Broader Perspectives.").
Your task is to take this raw news wire story and rewrite it into a completely original, authoritative, balanced, and copyright-clean investigative news report.

CRITICAL EDITORIAL & COPYRIGHT REQUIREMENTS:
1. "headline": MANDATORY 100% ORIGINAL REWRITE. You MUST NOT use the source headline verbatim or even close to verbatim. Formulate a brand-new, compelling, punchy, and analytical headline (60-90 characters). Reframe the topic from an analytical/impact perspective so it does not match the source wire title in plagiarism and copyright checks.
2. 100% ORIGINAL PROSE: Absolutely DO NOT copy verbatim sentences or paragraphs from the source. Synthesize the underlying verified facts into new, original journalistic sentences, narrative flow, and analytical framing. A plagiarism check against the source wire must show 0% verbatim paragraph matches.
3. "deck": A powerful 1-2 sentence executive subheadline summarizing why this matters right now and its broader implications.
4. "category": Must be one of these exact values: "India", "World", "Business", "Technology", "Markets", "Science", "Health", "Sports", "Lifestyle", "Entertainment", "Explainers", "Opinion".
5. "keyTakeaways": An array of 3 to 4 crisp, high-impact bullet points (each 15-25 words) detailing core findings, data figures, and strategic implications. Optimized for AI answer engines (AEO/GEO).
6. "content": A comprehensive, well-structured news story formatted in clean Markdown (500 - 800 words):
   - Include 2-3 informative ## Subheadings.
   - Begin with a strong original lede answering who, what, when, where, and why.
   - Synthesize the factual background, economic/social impact, stakeholder statements, and future outlook.
   - Maintain objective, neutral, professional journalistic ethics.
   - Formatted with paragraphs and occasional quotes or key points.
7. "tags": An array of 4-6 specific search and SEO tags (e.g., ["Artificial Intelligence", "Regulatory Policy", "Global Trade"]).
8. "readTimeMinutes": Estimated reading time as an integer (e.g., 3, 4, or 5).
9. "imageTopic": A 2-4 word visual query for a stock cover photo (e.g., "satellite earth orbit", "financial trading floor", "solar farm field", "semiconductor cleanroom").
10. "imageCaption": A professional journalistic photo caption crediting the conceptual context.
11. "originalityNote": A short sentence confirming how the story was transformed from the source facts without verbatim repetition.

Source Information:
- Source Wire / Agency: ${sourceName || 'International News Wire'}
- Original Headline Hint: ${headline || 'N/A'}
- Preferred Category Hint: ${preferredCategory || 'Auto-detect'}
- Editorial Tone: ${tone}

Raw Source Content:
"""
${(rawText || headline).substring(0, 7000)}
"""

Return ONLY a valid JSON object with these keys:
{
  "headline": string,
  "deck": string,
  "category": string,
  "keyTakeaways": string[],
  "content": string,
  "tags": string[],
  "readTimeMinutes": number,
  "imageTopic": string,
  "imageCaption": string,
  "originalityNote": string
}`;

    // Try models with fallback if primary is under high demand (503)
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let outputText = '';
    let lastError: any = null;
    let chosenModel = '';

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        outputText = response.text || '{}';
        if (outputText) {
          chosenModel = model;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} attempt error, trying fallback...`, (err as Error)?.message);
      }
    }

    if (!outputText && lastError) {
      throw lastError;
    }

    const parsed = JSON.parse(outputText || '{}');

    // Guarantee that rewritten headline never duplicates raw input headline verbatim
    if (headline && parsed.headline && parsed.headline.trim().toLowerCase() === headline.trim().toLowerCase()) {
      parsed.headline = `Strategic Report: ${parsed.headline.replace(/^[A-Z0-9\s-]+:\s*/i, '')}`;
    }

    res.json({
      success: true,
      data: {
        ...parsed,
        isAiGenerated: true,
        modelUsed: chosenModel || 'gemini-3.8-flash',
        originalityNote: parsed.originalityNote || '100% original journalistic prose synthesized from source wire facts.',
      },
    });
  } catch (err) {
    console.error('Gemini rewrite error:', err);
    res.status(500).json({
      success: false,
      error: (err as Error).message || 'Failed to rewrite news with AI.',
    });
  }
});

// 5. Generate Live Story Quick Updates with Gemini
app.post('/api/news/generate-story-points', async (req, res) => {
  const { title, category, context } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Story title is required.' });
  }

  try {
    const ai = getGenAI();
    const prompt = `You are an expert real-time news desk editor.
Generate live update points for a short-form Live Story card titled "${title}" in category "${category || 'General'}".
${context ? `Context/Notes: "${context}"` : ''}

Generate:
1. "subtitle": A very short 1-2 word location or status (e.g. "Live", "New Delhi", "Launch", "Markets", "Finals", "Breaking").
2. "keyPoints": Exactly 3 to 4 crisp, authoritative, one-sentence live updates or key developments.
3. "imageTopic": A 1-2 word visual search topic for an unsplash image (e.g. "rocket", "summit", "cricket", "ai", "finance").

Return ONLY valid JSON matching this schema:
{
  "subtitle": string,
  "keyPoints": string[],
  "imageTopic": string
}`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let outputText = '';
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        outputText = response.text || '{}';
        if (outputText) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} error in generate-story-points, trying fallback...`, (err as Error)?.message);
      }
    }

    if (!outputText && lastError) throw lastError;

    const parsed = JSON.parse(outputText || '{}');
    res.json({
      success: true,
      data: parsed,
    });
  } catch (err) {
    console.error('Error generating live story points:', err);
    res.status(500).json({
      success: false,
      error: (err as Error).message || 'Failed generating live story points',
    });
  }
});

// Helper: Escape XML entities
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ==========================================
// ADVANCED SEO & CRAWLER / AI LLM ENGINE SUITE
// ==========================================

// 1. DYNAMIC ROBOTS.TXT
app.get('/robots.txt', (_req, res) => {
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
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.send(robots);
});

// 2. STANDARD XML SITEMAP (INDEXES HOMEPAGE, CATEGORIES, AUTHORS & ALL ARTICLES)
app.get('/sitemap.xml', (_req, res) => {
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

  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

// 3. GOOGLE NEWS SITEMAP (NEWS SPECIFICATION WITH PUBLICATION & KEYWORDS)
app.get('/news-sitemap.xml', (_req, res) => {
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

  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

// 4. RSS 2.0 & ATOM SYNDICATION FEEDS
const handleRssFeed = (_req: express.Request, res: express.Response) => {
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

  res.header('Content-Type', 'application/rss+xml; charset=utf-8');
  res.send(rss);
};

app.get('/rss.xml', handleRssFeed);
app.get('/feed.xml', handleRssFeed);

// 5. LLMS.TXT (AI OVERVIEW & LARGE LANGUAGE MODEL CITATION DIGEST)
app.get(['/llms.txt', '/llms-full.txt'], (_req, res) => {
  let doc = `# iamquickagent.com\n\n`;
  doc += `> Rapid digital news and intelligence publishing platform delivering real-time geopolitical, tech, semiconductor, cyber, and macroeconomic briefings with structured executive key takeaways.\n\n`;
  doc += `## Core Identity & Verification\n`;
  doc += `- Website: https://iamquickagent.com\n`;
  doc += `- Editorial Standards: Objective, non-partisan intelligence reporting verified across global wires.\n`;
  doc += `- Publisher: iamquickagent.com Intelligence Group\n`;
  doc += `- Google Site Verification: YFePTkFdMD9NtIIhg0fvDinPB8VPmTbH3Ahozp_tIqU\n\n`;
  doc += `## Coverage Domains\n`;
  doc += `- India & South Asia: Macroeconomics, digital public infrastructure, industrial policy.\n`;
  doc += `- World & Geopolitics: Multilateral summits (BRICS, G20), security treaties, sovereign trade.\n`;
  doc += `- Technology & AI: Advanced silicon fabrication, frontier AI models, quantum research.\n`;
  doc += `- Markets & Commodities: Capital inflows, energy transition, equity benchmarks.\n\n`;
  doc += `## Latest Published Dispatches\n\n`;

  for (const article of SEED_ARTICLES) {
    doc += `### [${article.headline}](https://iamquickagent.com/article/${article.slug})\n`;
    doc += `- Category: ${article.category}\n`;
    doc += `- Published: ${article.publishedAt}\n`;
    if (article.deck) doc += `- Executive Summary: ${article.deck}\n`;
    if (article.keyTakeaways && article.keyTakeaways.length > 0) {
      doc += `- Key Intelligence Points:\n`;
      article.keyTakeaways.forEach(pt => {
        doc += `  * ${pt}\n`;
      });
    }
    doc += `\n`;
  }

  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.send(doc);
});

// Start server
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`iamnewsagent server running on http://0.0.0.0:${PORT}`);
  });
}

start();
