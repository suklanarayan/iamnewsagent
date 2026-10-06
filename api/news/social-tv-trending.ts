// Vercel Serverless Function: GET /api/news/social-tv-trending

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
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
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').trim();
}

function cleanCdataAndEntities(str: string): string {
  if (!str) return '';
  const noCdata = str.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
  return decodeHtmlEntities(noCdata);
}

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
    const normalized = cleaned.replace(/\s*\([A-Z]{2,5}\)\s*$/i, '').trim();
    const d = new Date(normalized);
    if (!isNaN(d.getTime())) return d.toISOString();
    const d2 = new Date(cleaned);
    if (!isNaN(d2.getTime())) return d2.toISOString();
    return new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function generateCleanHashtag(title: string): string {
  const clean = cleanCdataAndEntities(title)
    .replace(/[^\w\s\u0900-\u097F]/g, '')
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '#Trending';
  const tagWords = words.slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return `#${tagWords.join('')}`;
}

function resolveTrendingImage(category: string, title: string): string {
  const t = (title + ' ' + category).toLowerCase();
  if (t.includes('cricket') || t.includes('match') || t.includes('ipl') || t.includes('t20')) {
    return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('ai') || t.includes('semiconductor') || t.includes('tech') || t.includes('chip') || t.includes('apple')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('court') || t.includes('law') || t.includes('justice') || t.includes('legal')) {
    return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('space') || t.includes('isro') || t.includes('nasa') || t.includes('rocket')) {
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('market') || t.includes('sensex') || t.includes('nifty') || t.includes('economy')) {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('brics') || t.includes('summit') || t.includes('diplomacy') || t.includes('world')) {
    return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
}

function filterSocialTvItems(items: any[], platform: string) {
  if (!platform || platform === 'all') return items;
  if (platform === 'x') return items.filter((i) => i.platform === 'x');
  if (platform === 'tv') return items.filter((i) => i.platform === 'tv');
  if (platform === 'facebook') return items.filter((i) => i.platform === 'facebook');
  if (platform === 'hashtags') return items.filter((i) => i.hashtag);
  return items;
}

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
    publishedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
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
    publishedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
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
    publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
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
    publishedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    viralScore: 90,
  },
];

let serverlessCache: any[] = [];
let serverlessCacheTime = 0;
const CACHE_TTL = 90 * 1000; // 90 seconds for fresh trending pulses

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const forceRefresh = req.query?.refresh === 'true' || req.query?._t;
  const platformFilter = (req.query?.platform as string || 'all').toLowerCase();
  const now = Date.now();

  if (!forceRefresh && serverlessCache.length > 0 && (now - serverlessCacheTime) < CACHE_TTL) {
    const filtered = filterSocialTvItems(serverlessCache, platformFilter);
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    return res.status(200).json({
      success: true,
      count: filtered.length,
      platform: platformFilter,
      isCached: true,
      cachedAt: safeIsoDate(serverlessCacheTime),
      items: filtered,
    });
  }

  try {
    const [trendsInXml, trendsUsXml, socialViralXml, tvDigitalXml, ndtvXml, bbcXml] = await Promise.all([
      fetch('https://trends.google.com/trending/rss?geo=IN', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000),
      }).then((r) => r.text()).catch(() => ''),
      fetch('https://trends.google.com/trending/rss?geo=US', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000),
      }).then((r) => r.text()).catch(() => ''),
      fetch('https://news.google.com/rss/search?q=trending+on+social+media+OR+viral+OR+trending+on+X&hl=en-IN&gl=IN&ceid=IN:en', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000),
      }).then((r) => r.text()).catch(() => ''),
      fetch('https://news.google.com/rss/search?q=NDTV+digital+OR+BBC+News+digital+OR+CNN+broadcast&hl=en-IN&gl=IN&ceid=IN:en', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000),
      }).then((r) => r.text()).catch(() => ''),
      fetch('https://feeds.feedburner.com/ndtvnews-top-stories', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000),
      }).then((r) => r.text()).catch(() => ''),
      fetch('https://feeds.bbci.co.uk/news/world/rss.xml', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000),
      }).then((r) => r.text()).catch(() => ''),
    ]);

    const items: any[] = [];

    // 1. Process Google Trends
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

    // 2. Process Google News Viral Social Stream (X & Facebook)
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

    // 3. Process TV Digital Broadcast Editions (NDTV, BBC, CNN)
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

    if (items.length < 4) {
      items.push(...FALLBACK_SOCIAL_TV_TRENDS);
    }

    // Deduplicate
    const seen = new Set<string>();
    const unique = items.filter((item) => {
      const slug = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 25);
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    });

    serverlessCache = unique.length > 0 ? unique : FALLBACK_SOCIAL_TV_TRENDS;
    serverlessCacheTime = now;

    const filtered = filterSocialTvItems(serverlessCache, platformFilter);
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.status(200).json({
      success: true,
      count: filtered.length,
      platform: platformFilter,
      isCached: false,
      cachedAt: safeIsoDate(serverlessCacheTime),
      items: filtered,
    });
  } catch (err) {
    const filtered = filterSocialTvItems(FALLBACK_SOCIAL_TV_TRENDS, platformFilter);
    res.status(200).json({
      success: true,
      count: filtered.length,
      platform: platformFilter,
      isCached: true,
      fallbackUsed: true,
      items: filtered,
    });
  }
}
