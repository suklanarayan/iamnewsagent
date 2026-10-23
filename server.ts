import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { SEED_ARTICLES, SEED_AUTHORS, SEED_LIVE_STORIES } from './src/data/seedData';

const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const serverDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

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

// Helper: decode HTML entities in RSS and web scrapers
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

// Helper to sanitize object for Firestore writes
function cleanFirestoreDoc(obj: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
        clean[k] = cleanFirestoreDoc(v);
      } else {
        clean[k] = v;
      }
    }
  }
  return clean;
}

// ---------------------------------------------------------------------------
// ARTICLES REST API (Guarantees 100% Desktop-Mobile Cloud Parity)
// ---------------------------------------------------------------------------

// GET /api/articles
app.get('/api/articles', async (req, res) => {
  try {
    const colRef = collection(serverDb, 'articles');
    const q = query(colRef, orderBy('publishedAt', 'desc'), limit(100));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const articles = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.json(articles);
    }

    // If Firestore empty, seed it
    for (const art of SEED_ARTICLES) {
      await setDoc(doc(serverDb, 'articles', art.id), cleanFirestoreDoc(art));
    }
    return res.json(SEED_ARTICLES);
  } catch (err: any) {
    console.warn('Server GET /api/articles error:', err.message);
    return res.json(SEED_ARTICLES);
  }
});

// POST /api/articles (Create or Upsert)
app.post('/api/articles', async (req, res) => {
  try {
    const data = req.body;
    const id = data.id || 'art-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();
    const article = {
      ...data,
      id,
      publishedAt: data.publishedAt || now,
      updatedAt: now,
    };
    await setDoc(doc(serverDb, 'articles', id), cleanFirestoreDoc(article), { merge: true });
    return res.status(201).json(article);
  } catch (err: any) {
    console.error('Server POST /api/articles error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/articles/:id
app.put('/api/articles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const now = new Date().toISOString();
    const updated = {
      ...updates,
      id,
      updatedAt: now,
    };
    await setDoc(doc(serverDb, 'articles', id), cleanFirestoreDoc(updated), { merge: true });
    return res.json(updated);
  } catch (err: any) {
    console.error('Server PUT /api/articles error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/articles/:id
app.delete('/api/articles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await deleteDoc(doc(serverDb, 'articles', id));
    return res.json({ success: true, id });
  } catch (err: any) {
    console.error('Server DELETE /api/articles error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// LIVE STORIES REST API (Guarantees Ordered Sequences Sync Across Devices)
// ---------------------------------------------------------------------------

// GET /api/live-stories
app.get('/api/live-stories', async (req, res) => {
  try {
    const colRef = collection(serverDb, 'live_stories');
    const snap = await getDocs(colRef);

    if (!snap.empty) {
      const stories = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
      stories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return res.json(stories);
    }

    // If Firestore empty, seed it with ordered indices
    const seeded = SEED_LIVE_STORIES.map((s, idx) => ({ ...s, order: idx }));
    for (const story of seeded) {
      await setDoc(doc(serverDb, 'live_stories', story.id), cleanFirestoreDoc(story));
    }
    return res.json(seeded);
  } catch (err: any) {
    console.warn('Server GET /api/live-stories error:', err.message);
    return res.json(SEED_LIVE_STORIES.map((s, idx) => ({ ...s, order: idx })));
  }
});

// POST /api/live-stories/sync-order (Batch Persist Updated Story Sequence)
app.post('/api/live-stories/sync-order', async (req, res) => {
  try {
    const { stories } = req.body;
    if (!Array.isArray(stories)) {
      return res.status(400).json({ error: 'Expected stories array' });
    }

    const now = new Date().toISOString();
    await Promise.all(
      stories.map((story, idx) => {
        const item = {
          ...story,
          order: idx,
          updatedAt: now,
        };
        return setDoc(doc(serverDb, 'live_stories', story.id), cleanFirestoreDoc(item), { merge: true });
      })
    );

    return res.json({ success: true, count: stories.length });
  } catch (err: any) {
    console.error('Server POST /api/live-stories/sync-order error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/live-stories (Create)
app.post('/api/live-stories', async (req, res) => {
  try {
    const data = req.body;
    const id = data.id || 'story-' + Date.now();
    const now = new Date().toISOString();
    const story = {
      ...data,
      id,
      order: typeof data.order === 'number' ? data.order : 0,
      createdAt: data.createdAt || now,
      updatedAt: now,
    };
    await setDoc(doc(serverDb, 'live_stories', id), cleanFirestoreDoc(story), { merge: true });
    return res.status(201).json(story);
  } catch (err: any) {
    console.error('Server POST /api/live-stories error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/live-stories/:id
app.put('/api/live-stories/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const now = new Date().toISOString();
    const updated = {
      ...updates,
      id,
      updatedAt: now,
    };
    await setDoc(doc(serverDb, 'live_stories', id), cleanFirestoreDoc(updated), { merge: true });
    return res.json(updated);
  } catch (err: any) {
    console.error('Server PUT /api/live-stories error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/live-stories/:id
app.delete('/api/live-stories/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await deleteDoc(doc(serverDb, 'live_stories', id));
    return res.json({ success: true, id });
  } catch (err: any) {
    console.error('Server DELETE /api/live-stories error:', err.message);
    return res.status(500).json({ error: err.message });
  }
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

// Spam and content hygiene filter
function isSpamOrInappropriate(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const bannedPatterns = [
    '18video', '18+', 'mms', 'leak', 'leaked', 'hot video', 'telegram',
    'desihot', 'adult', 'nude', 'porn', 'xxx', 'sex', 'scandal video',
    'fabrykanorblina', 'viral mms', 'watch online full video', 'download link',
    '18videohot', 'bengali video viral', 'leaked video viral', 'onlyfans',
  ];
  return bannedPatterns.some(b => lower.includes(b));
}

// Helper: Curated photos for viral categories with comprehensive keyword matching
function resolveTrendingImage(category: string, title: string): string {
  const t = (title + ' ' + category).toLowerCase();
  // Legal / Judiciary / Court / Hindi law terms
  if (
    t.includes('court') || t.includes('न्यायालय') || t.includes('कोर्ट') ||
    t.includes('judge') || t.includes('bench') || t.includes('bail') ||
    t.includes('verdict') || t.includes('legal') || t.includes('advocate') ||
    t.includes('law') || t.includes('सुप्रीम') || t.includes('हाईकोर्ट')
  ) {
    return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
  }
  // Sports & Cricket
  if (t.includes('cricket') || t.includes('match') || t.includes('sport') || t.includes('ipl') || t.includes('t20') || t.includes('tennis') || t.includes('football') || t.includes('goal')) {
    return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80';
  }
  // Entertainment & Cinema & Film
  if (t.includes('movie') || t.includes('cinema') || t.includes('film') || t.includes('actor') || t.includes('box office') || t.includes('trailer') || t.includes('hollywood') || t.includes('bollywood') || t.includes('avengers') || t.includes('star')) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
  }
  // Technology, AI & Devices
  if (t.includes('tech') || t.includes('ai') || t.includes('apple') || t.includes('google') || t.includes('chip') || t.includes('musk') || t.includes('mobile') || t.includes('software') || t.includes('ipod')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
  }
  // Economy, Markets & Finance
  if (t.includes('market') || t.includes('sensex') || t.includes('nifty') || t.includes('stock') || t.includes('rbi') || t.includes('budget') || t.includes('economy') || t.includes('trade')) {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80';
  }
  // Politics, Parliament & Diplomacy
  if (t.includes('parliament') || t.includes('modi') || t.includes('election') || t.includes('minister') || t.includes('brics') || t.includes('government') || t.includes('diplomatic') || t.includes('संसद') || t.includes('सरकार')) {
    return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80';
  }
  // Space, Science & ISRO
  if (t.includes('space') || t.includes('isro') || t.includes('nasa') || t.includes('satellite') || t.includes('rocket')) {
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
  }
  // Default: Authoritative newspaper / newsroom editorial photography
  return 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80';
}

// In-memory cache for Social & TV trending
let cachedSocialTvTrends: any[] = [];
let lastSocialTvFetchTime = 0;
const SOCIAL_TV_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

// High-fidelity fallback seed for guaranteed instant availability
const FALLBACK_SOCIAL_TV_TRENDS = [
  {
    id: 'stv-seed-1',
    title: 'India Semiconductor Mission',
    headline: 'India Semiconductor Mission: New $10B Fabrication Facilities Approved in Gujarat & Tamil Nadu',
    platform: 'x',
    sourceName: '𝕏 Viral Tech Wire',
    hashtag: '#IndiaSemiconductors',
    approxTraffic: '240K+ posts on 𝕏',
    summary: 'Tech industry leaders, policymakers, and engineering faculties drive massive engagement as the government unveils key incentives for silicon fabrication in Gujarat and Tamil Nadu.',
    url: 'https://news.google.com/search?q=India+Semiconductor+Mission',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    category: 'Technology',
    isLiveBroadcast: false,
    publishedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    viralScore: 98,
  },
  {
    id: 'stv-seed-2',
    title: 'New Delhi BRICS Summit',
    headline: 'NDTV Prime Time Digital: Diplomatic Consensus on New Delhi Declaration and Bilateral Trade',
    platform: 'tv',
    sourceName: 'NDTV 24x7 Digital',
    hashtag: '#BRICS2026',
    approxTraffic: '🔴 LIVE Digital Broadcast',
    summary: 'Special digital newsroom stream tracking the unanimous adoption of the New Delhi Declaration and bilateral currency trade mechanisms.',
    url: 'https://www.ndtv.com',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    category: 'World',
    isLiveBroadcast: true,
    publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    viralScore: 95,
  },
  {
    id: 'stv-seed-3',
    title: 'ISRO Next-Gen Launch Vehicle',
    headline: 'ISRO Announces Next Generation Launch Vehicle (NGLV) Flight Readiness Roadmap',
    platform: 'facebook',
    sourceName: 'Meta Viral Pulse',
    hashtag: '#ISROSpaceVision',
    approxTraffic: '180K shares & interactions',
    summary: 'Heavy-lift rocket development milestones generate enthusiastic civic responses across social platforms following official briefing by ISRO scientists.',
    url: 'https://news.google.com/search?q=ISRO+NGLV',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    category: 'Science',
    isLiveBroadcast: false,
    publishedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    viralScore: 92,
  },
  {
    id: 'stv-seed-4',
    title: 'Clean Energy Corridors',
    headline: 'BBC World News TV: Clean Energy Transition & Global Grid Interconnection Talks',
    platform: 'tv',
    sourceName: 'BBC World News TV',
    hashtag: '#GlobalEnergySummit',
    approxTraffic: '🔴 Video Broadcast Feed',
    summary: 'International delegations conclude landmark cross-border green power sharing agreement across Asia and Europe.',
    url: 'https://www.bbc.com/news/world',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
    category: 'Business',
    isLiveBroadcast: true,
    publishedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    viralScore: 90,
  },
  {
    id: 'stv-seed-5',
    title: 'India vs Australia Cricket',
    headline: 'India vs Australia T20 Decider: Record Streaming Numbers and Fan Reactions',
    platform: 'x',
    sourceName: '𝕏 Sports Radar',
    hashtag: '#IndvsAus',
    approxTraffic: '420K+ posts on 𝕏',
    summary: 'High-voltage cricket showdown captures national social timelines with match predictions, video highlights, and expert commentary.',
    url: 'https://news.google.com/search?q=India+vs+Australia+Cricket',
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    category: 'Sports',
    isLiveBroadcast: false,
    publishedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    viralScore: 99,
  },
  {
    id: 'stv-seed-6',
    title: 'Supreme Court Privacy Bench',
    headline: 'India Today TV Digital: Supreme Court Hearing on Digital Personal Data Protection',
    platform: 'tv',
    sourceName: 'India Today Digital',
    hashtag: '#PrivacyRights2026',
    approxTraffic: '🔴 TV Live Bulletin',
    summary: 'Constitutional bench reviews data fiduciary compliance rules, sparking widespread debates among tech firms and civil rights advocates.',
    url: 'https://www.indiatoday.in',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    category: 'India',
    isLiveBroadcast: true,
    publishedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    viralScore: 88,
  }
];

// 2.5 Live Social Media & TV News Trending Aggregator (Fusion of Modern News)
app.get('/api/news/social-tv-trending', async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const platformFilter = (req.query.platform as string || 'all').toLowerCase();
  const now = Date.now();

  // If cached and not expired, and not force refreshing, return immediately
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
    const [trendsInXml, trendsUsXml, techNewsXml, entNewsXml, topNewsXml, ndtvXml, bbcXml] = await Promise.all([
      // 1. Google Trends (India)
      fetch('https://trends.google.com/trending/rss?geo=IN', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(6000),
      }).then(r => r.text()).catch(() => ''),

      // 2. Google Trends (US / Global)
      fetch('https://trends.google.com/trending/rss?geo=US', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(6000),
      }).then(r => r.text()).catch(() => ''),

      // 3. Google News Technology (Real verified tech news & viral discussions for X / Twitter)
      fetch('https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-IN&gl=IN&ceid=IN:en', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(6000),
      }).then(r => r.text()).catch(() => ''),

      // 4. Google News Entertainment (Real viral entertainment, cinema, pop culture for Meta / Facebook)
      fetch('https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-IN&gl=IN&ceid=IN:en', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(6000),
      }).then(r => r.text()).catch(() => ''),

      // 5. Google News Top National & World Breaking News
      fetch('https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(6000),
      }).then(r => r.text()).catch(() => ''),

      // 6. NDTV 24x7 Digital Video & Newsroom Top Stories
      fetch('https://feeds.feedburner.com/ndtvnews-top-stories', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(6000),
      }).then(r => r.text()).catch(() => ''),

      // 7. BBC World News Live Broadcast Feed
      fetch('https://feeds.bbci.co.uk/news/world/rss.xml', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(6000),
      }).then(r => r.text()).catch(() => ''),
    ]);

    const items: any[] = [];

    // Helper: Process Google Trends (India + US) with extraction of actual news headlines & real images
    const processTrends = (xml: string, region: string) => {
      if (!xml) return;
      let match: RegExpExecArray | null;
      let count = 0;
      const localRegex = /<item>([\s\S]*?)<\/item>/gi;
      while ((match = localRegex.exec(xml)) !== null && count < 6) {
        const raw = match[1];
        const rawTitle = cleanCdataAndEntities(raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
        if (!rawTitle) continue;
        if (isSpamOrInappropriate(rawTitle)) continue;

        const approx = raw.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/)?.[1] || '';
        const newsTitle = cleanCdataAndEntities(raw.match(/<ht:news_item_title>([\s\S]*?)<\/ht:news_item_title>/)?.[1] || '');
        const newsSnippet = cleanCdataAndEntities(raw.match(/<ht:news_item_snippet>([\s\S]*?)<\/ht:news_item_snippet>/)?.[1] || '');
        const newsSource = cleanCdataAndEntities(raw.match(/<ht:news_item_source>([\s\S]*?)<\/ht:news_item_source>/)?.[1] || (region === 'IN' ? 'Trending Wire (India)' : 'Global Viral Radar'));
        const newsUrl = cleanCdataAndEntities(raw.match(/<ht:news_item_url>([\s\S]*?)<\/ht:news_item_url>/)?.[1] || `https://news.google.com/search?q=${encodeURIComponent(rawTitle)}`);
        const pubDateMatch = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];

        // Extract real image from Google Trends RSS if present
        const pictureUrl = raw.match(/<ht:picture>([\s\S]*?)<\/ht:picture>/)?.[1] ||
                           raw.match(/<ht:news_item_picture>([\s\S]*?)<\/ht:news_item_picture>/)?.[1] || '';

        // Capitalize search query for clean topic display (e.g. "constance wu" -> "Constance Wu")
        const formattedTopic = rawTitle
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');

        // Choose the headline: use the full journalistic news headline if available
        const headline = newsTitle && newsTitle.length > 10 ? newsTitle : formattedTopic;
        if (isSpamOrInappropriate(headline)) continue;

        const hashtag = generateCleanHashtag(formattedTopic);
        if (isSpamOrInappropriate(hashtag)) continue;

        const platform = count % 2 === 0 ? 'x' : 'facebook';
        const formattedTraffic = approx
          ? `${approx.replace('+', '')}+ searches · Viral on ${platform === 'x' ? '𝕏' : 'Meta'}`
          : `Trending #${count + 1} on ${platform === 'x' ? '𝕏' : 'Meta'}`;

        const category = region === 'IN' ? 'India' : 'World';
        const finalImage = (pictureUrl && pictureUrl.startsWith('http'))
          ? pictureUrl
          : resolveTrendingImage(category, `${formattedTopic} ${headline}`);

        const summary = newsSnippet && newsSnippet.length > 20
          ? newsSnippet
          : `Top trending viral discussion, verified coverage from ${newsSource}, and real-time public engagement around ${formattedTopic}.`;

        items.push({
          id: `trend-${region.toLowerCase()}-${count}-${Buffer.from(rawTitle).toString('base64').substring(0, 8)}`,
          title: formattedTopic,
          headline,
          platform,
          sourceName: newsSource,
          hashtag,
          approxTraffic: formattedTraffic,
          summary,
          url: newsUrl,
          imageUrl: finalImage,
          category,
          isLiveBroadcast: false,
          publishedAt: safeIsoDate(pubDateMatch),
          viralScore: Math.floor(90 + Math.random() * 9),
        });
        count++;
      }
    };

    if (trendsInXml) processTrends(trendsInXml, 'IN');
    if (trendsUsXml) processTrends(trendsUsXml, 'US');

    // Helper to process standard Google News / Media RSS feeds
    const processGoogleNewsFeed = (xml: string, platform: 'x' | 'facebook' | 'tv', defaultCategory: string, defaultPlatformLabel: string, maxItems: number = 6) => {
      if (!xml) return;
      let match: RegExpExecArray | null;
      let count = 0;
      const localRegex = /<item>([\s\S]*?)<\/item>/gi;
      while ((match = localRegex.exec(xml)) !== null && count < maxItems) {
        const raw = match[1];
        let fullTitle = cleanCdataAndEntities(raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
        if (!fullTitle || fullTitle.toLowerCase() === 'google news') continue;
        if (isSpamOrInappropriate(fullTitle)) continue;

        let publisher = defaultPlatformLabel;
        let storyTitle = fullTitle;
        if (fullTitle.includes(' - ')) {
          const parts = fullTitle.split(' - ');
          publisher = parts.pop()?.trim() || publisher;
          storyTitle = parts.join(' - ').trim();
        }

        const link = cleanCdataAndEntities(raw.match(/<link>([\s\S]*?)<\/link>/)?.[1] || raw.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] || '');
        const desc = stripHtml(cleanCdataAndEntities(raw.match(/<description>([\s\S]*?)<\/description>/)?.[1] || ''));
        const pubDateMatch = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];

        // Extract media thumbnail if present
        const mediaThumb = raw.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)?.[1] ||
                           raw.match(/<media:content[^>]+url=["']([^"']+)["']/i)?.[1] ||
                           raw.match(/<enclosure[^>]+url=["']([^"']+)["']/i)?.[1] || '';

        const hashtag = generateCleanHashtag(storyTitle);
        if (isSpamOrInappropriate(hashtag)) continue;

        const engagements = Math.floor(140 + Math.random() * 320);
        const approxTraffic = platform === 'tv'
          ? '🔴 LIVE TV Digital Bulletin'
          : `${engagements}K+ discussions on ${platform === 'x' ? '𝕏' : 'Meta'}`;

        const summary = (desc && desc.length > 25 && !desc.includes('&nbsp;'))
          ? (desc.length > 210 ? desc.substring(0, 207) + '...' : desc)
          : `High-velocity public momentum, breaking digital dispatches, and trending reactions reported by ${publisher}.`;

        const finalImage = (mediaThumb && mediaThumb.startsWith('http'))
          ? mediaThumb
          : resolveTrendingImage(defaultCategory, storyTitle);

        items.push({
          id: `news-${platform}-${count}-${Buffer.from(storyTitle).toString('base64').substring(0, 8)}`,
          title: storyTitle,
          headline: storyTitle,
          platform,
          sourceName: platform === 'tv' ? `${publisher} Digital TV` : `${publisher} (${platform === 'x' ? '𝕏 Wire' : 'Meta Viral'})`,
          hashtag,
          approxTraffic,
          summary,
          url: link || `https://news.google.com/search?q=${encodeURIComponent(storyTitle)}`,
          imageUrl: finalImage,
          category: defaultCategory,
          isLiveBroadcast: platform === 'tv',
          publishedAt: safeIsoDate(pubDateMatch),
          viralScore: Math.floor(91 + Math.random() * 8),
        });
        count++;
      }
    };

    // Process Technology stream (viral on X)
    if (techNewsXml) processGoogleNewsFeed(techNewsXml, 'x', 'Technology', '𝕏 Tech Radar', 6);

    // Process Entertainment stream (viral on Meta)
    if (entNewsXml) processGoogleNewsFeed(entNewsXml, 'facebook', 'Entertainment', 'Meta Viral Wire', 6);

    // Process Top World/India stream
    if (topNewsXml) processGoogleNewsFeed(topNewsXml, 'x', 'India', 'Digital News Desk', 5);

    // Process TV Digital Broadcast Editions (NDTV & BBC)
    if (ndtvXml) processGoogleNewsFeed(ndtvXml, 'tv', 'India', 'NDTV 24x7 Digital', 5);
    if (bbcXml) processGoogleNewsFeed(bbcXml, 'tv', 'World', 'BBC World News TV', 5);

    // If live feeds returned less than 4 items, supplement with fallback seed
    if (items.length < 4) {
      items.push(...FALLBACK_SOCIAL_TV_TRENDS);
    }

    // Deduplicate by title similarity
    const seen = new Set<string>();
    const unique = items.filter(item => {
      const slug = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 22);
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
      title = stripHtml(decodeHtmlEntities(rawTitle))
        .replace(/\s*[-–—|]\s*(NDTV(\.com)?|BBC(\s+News)?|The\s+Hindu|CNN|Reuters|Times\s+of\s+India|India\s+Today|Hindustan\s+Times|Indian\s+Express|Zee\s+News|News18|ANI|Live\s*Mint).*$/i, '')
        .replace(/^(Breaking(\s+News)?|Alert|Exclusive|Watch|Just\s+In|Live\s+Updates?):\s*/i, '')
        .trim();

      const lowerTitle = title.toLowerCase();
      // Ignore generic bot blocks, 403s, and challenge page titles
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

    // Extract meta description
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

    // Extract paragraph text
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

// Helper: Escape XML/HTML special characters
function escapeHtmlMeta(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// SEO Pre-rendering & Metadata Generator for Search Engines & Social Platforms
function renderHtmlWithSeo(urlPath: string, templateHtml: string): string {
  let html = templateHtml;
  const baseUrl = 'https://iamquickagent.com';

  // 1. Article/News Page: /news/:slug or /article/:slug
  const articleMatch = urlPath.match(/^\/(?:news|article)\/([a-zA-Z0-9-_]+)/);
  if (articleMatch) {
    const slug = articleMatch[1];
    const article = SEED_ARTICLES.find((a) => a.slug === slug);
    if (article) {
      const pageTitle = `${article.headline} - iamquickagent.com`;
      const desc = escapeHtmlMeta(article.deck || article.keyTakeaways?.[0] || 'Live breaking news and intelligence from iamquickagent.com');
      const canonicalUrl = `${baseUrl}/news/${encodeURIComponent(article.slug)}`;
      const img = article.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=85';

      html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtmlMeta(pageTitle)}</title>`);
      html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${desc}" />`);

      // OpenGraph
      html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${escapeHtmlMeta(pageTitle)}" />`);
      html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${desc}" />`);
      html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
      html = html.replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="article" />`);
      html = html.replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${img}" />`);

      // Twitter Cards
      html = html.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${escapeHtmlMeta(pageTitle)}" />`);
      html = html.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${desc}" />`);
      html = html.replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="${img}" />`);

      // Self-referencing Canonical URL
      const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
      if (html.includes('rel="canonical"')) {
        html = html.replace(/<link[^>]*rel="canonical"[^>]*>/i, canonicalTag);
      } else {
        html = html.replace('</head>', `    ${canonicalTag}\n  </head>`);
      }

      // JSON-LD NewsArticle structured data
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
        'headline': article.headline,
        'description': article.deck || desc,
        'image': [img],
        'datePublished': article.publishedAt,
        'dateModified': article.updatedAt || article.publishedAt,
        'articleSection': article.category,
        'author': {
          '@type': 'Person',
          'name': (article as any).author?.name || article.authorId || 'iamquickagent.com Newsroom',
        },
        'publisher': {
          '@type': 'NewsMediaOrganization',
          'name': 'iamquickagent.com',
          'url': baseUrl,
          'logo': {
            '@type': 'ImageObject',
            'url': `${baseUrl}/favicon.svg`,
          },
        },
      };
      html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`);

      // Crawlable DOM inside root for Googlebot and non-JS search crawlers
      const noscriptHtml = `
        <noscript>
          <article itemscope itemtype="https://schema.org/NewsArticle">
            <h1 itemprop="headline">${article.headline}</h1>
            <p itemprop="description"><em>${article.deck || ''}</em></p>
            <div>
              <p>Category: ${article.category} | Published: ${article.publishedAt}</p>
              <div>${article.content || ''}</div>
            </div>
          </article>
        </noscript>
      `;
      html = html.replace('<div id="root"></div>', `<div id="root">${noscriptHtml}</div>`);
      return html;
    }
  }

  // 2. Author Profile Page: /author/:id
  const authorMatch = urlPath.match(/^\/author\/([a-zA-Z0-9-_]+)/);
  if (authorMatch) {
    const authorId = authorMatch[1];
    const author = SEED_AUTHORS.find((a) => a.id === authorId);
    if (author) {
      const pageTitle = `${author.name} - Editorial Profile & Wire Dispatches | iamquickagent.com`;
      const desc = escapeHtmlMeta(`${author.bio || author.role} at iamquickagent.com. Explore published investigative articles and intelligence briefings.`);
      const canonicalUrl = `${baseUrl}/author/${encodeURIComponent(author.id)}`;

      html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtmlMeta(pageTitle)}</title>`);
      html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${desc}" />`);
      html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${escapeHtmlMeta(pageTitle)}" />`);
      html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${desc}" />`);
      html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

      const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
      if (html.includes('rel="canonical"')) {
        html = html.replace(/<link[^>]*rel="canonical"[^>]*>/i, canonicalTag);
      } else {
        html = html.replace('</head>', `    ${canonicalTag}\n  </head>`);
      }
      return html;
    }
  }

  // 3. Homepage or Category default: Ensure valid canonical URL
  const canonicalUrl = urlPath.startsWith('/?category=')
    ? `${baseUrl}${urlPath}`
    : `${baseUrl}/`;

  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
  if (html.includes('rel="canonical"')) {
    html = html.replace(/<link[^>]*rel="canonical"[^>]*>/i, canonicalTag);
  } else {
    html = html.replace('</head>', `    ${canonicalTag}\n  </head>`);
  }

  return html;
}

// Start server
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Intercept HTML pages to inject dynamic SEO metadata and canonical tags
    app.get(['/', '/news/:slug', '/article/:slug', '/author/:id'], async (req, res, next) => {
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        const rawHtml = fs.readFileSync(indexPath, 'utf-8');
        const seoHtml = renderHtmlWithSeo(req.path, rawHtml);
        const transformedHtml = await vite.transformIndexHtml(req.originalUrl, seoHtml);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(transformedHtml);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      let rawHtml = '';
      try {
        rawHtml = fs.readFileSync(indexPath, 'utf-8');
      } catch {
        rawHtml = '<!doctype html><html><head><title>iamquickagent.com</title></head><body><div id="root"></div></body></html>';
      }
      const seoHtml = renderHtmlWithSeo(req.path, rawHtml);
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(seoHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`iamnewsagent server running on http://0.0.0.0:${PORT}`);
  });
}

start();

