import type { Article } from '../types';

const STORAGE_KEY_RECENT_SEARCHES = 'iamnewsagent_recent_searches_v1';

export const CURATED_TRENDING_TERMS: string[] = [
  'ISRO Gaganyaan',
  'Reserve Bank of India',
  'Semiconductor Fab',
  'AI Governance & Regulation',
  'Durga Puja Kolkata',
  'Green Hydrogen Mission',
  'Quantum Cryptography',
  'India GDP & Markets',
  'Sensex All-Time High',
  'Indo-Pacific Maritime Security',
  'Electric Vehicles & Batteries',
  'Global Supply Chain Resilience',
  'Space Tech & Satellites',
  'Renewable Clean Energy',
  'Digital Public Infrastructure',
];

// Extract all keywords, tags, phrases from live database articles
export function buildSearchDictionary(articles: Article[]): string[] {
  const set = new Set<string>();

  // Add curated trending terms
  CURATED_TRENDING_TERMS.forEach((t) => set.add(t));

  articles.forEach((art) => {
    // Categories
    set.add(art.category);

    // Tags
    art.tags.forEach((tag) => set.add(tag));

    // Key phrases from headline
    const cleanHeadline = art.headline.replace(/[:\-–—'"]/g, ' ').trim();
    // Split into 2-word & 3-word n-grams or major words
    const words = cleanHeadline.split(/\s+/).filter((w) => w.length > 3);
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i] && words[i + 1]) {
        set.add(`${words[i]} ${words[i + 1]}`);
      }
    }
    // Also add full key terms
    if (art.headline.length < 50) {
      set.add(art.headline);
    }

    // Key takeaways
    art.keyTakeaways.forEach((k) => {
      const parts = k.split(/[:;,]/);
      if (parts[0] && parts[0].length < 35) {
        set.add(parts[0].trim());
      }
    });
  });

  return Array.from(set);
}

// Predict autocomplete matching terms for a given query
export function getSearchPredictions(
  query: string,
  dictionary: string[],
  limit = 6
): { term: string; matchType: 'prefix' | 'contains' }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const prefixMatches: string[] = [];
  const containsMatches: string[] = [];

  for (const term of dictionary) {
    const tLower = term.toLowerCase();
    if (tLower === q) continue; // exact match not needed in predictions list
    if (tLower.startsWith(q)) {
      prefixMatches.push(term);
    } else if (tLower.includes(q)) {
      containsMatches.push(term);
    }
  }

  // Deduplicate and combine
  const combined = [
    ...prefixMatches.map((term) => ({ term, matchType: 'prefix' as const })),
    ...containsMatches.map((term) => ({ term, matchType: 'contains' as const })),
  ];

  // Limit to top results
  return combined.slice(0, limit);
}

// Get the best inline completion suggestion (e.g. typing "ind" -> suggests "India")
export function getInlineCompletion(query: string, dictionary: string[]): string | null {
  const q = query.trim();
  if (!q || q.length < 2) return null;
  const qLower = q.toLowerCase();

  for (const term of dictionary) {
    if (term.toLowerCase().startsWith(qLower) && term.length > q.length) {
      return term;
    }
  }
  return null;
}

// Recent search history helpers
export function getRecentSearches(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_RECENT_SEARCHES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed.slice(0, 6);
    }
  } catch (e) {
    // ignore
  }
  return ['ISRO', 'Markets', 'Semiconductor', 'AI'];
}

export function saveRecentSearch(query: string): void {
  const q = query.trim();
  if (!q || q.length < 2) return;
  try {
    const current = getRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase());
    current.unshift(q);
    localStorage.setItem(STORAGE_KEY_RECENT_SEARCHES, JSON.stringify(current.slice(0, 8)));
  } catch (e) {
    // ignore
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_RECENT_SEARCHES);
  } catch (e) {
    // ignore
  }
}
