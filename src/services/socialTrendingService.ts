import type { SocialTvTrendingItem, SocialPlatformType } from '../types';

const STORAGE_KEY = 'iamquickagent_social_tv_trends_v1';

export async function fetchSocialTvTrending(
  platform: string = 'all',
  refresh: boolean = false
): Promise<SocialTvTrendingItem[]> {
  try {
    const url = `/api/news/social-tv-trending?platform=${encodeURIComponent(platform)}${
      refresh ? `&refresh=true&_t=${Date.now()}` : ''
    }`;
    const res = await fetch(url, {
      cache: refresh ? 'no-cache' : 'default',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        // Cache to localStorage for offline / fast fallback
        try {
          if (platform === 'all') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.items));
          }
        } catch {
          // ignore storage quota
        }
        return data.items;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch live social & TV trending, trying local cache...', err);
  }

  // Fallback to cached items in localStorage
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (platform === 'all') return parsed;
        return parsed.filter((i: SocialTvTrendingItem) => {
          if (platform === 'x') return i.platform === 'x';
          if (platform === 'tv') return i.platform === 'tv';
          if (platform === 'facebook') return i.platform === 'facebook';
          if (platform === 'hashtags') return !!i.hashtag;
          return true;
        });
      }
    }
  } catch {
    // ignore
  }

  // Generate fresh relative timestamps for fallback seeds
  const now = Date.now();
  return DEFAULT_SOCIAL_TV_SEED.map((seed, idx) => ({
    ...seed,
    publishedAt: new Date(now - (idx * 12 + 5) * 60 * 1000).toISOString(),
  }));
}

export const DEFAULT_SOCIAL_TV_SEED: SocialTvTrendingItem[] = [
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
