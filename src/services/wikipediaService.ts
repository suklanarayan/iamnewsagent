export interface WikipediaArticle {
  title: string;
  description?: string;
  extract: string;
  thumbnail?: string;
  pageUrl: string;
}

export interface WikipediaSearchResult {
  summary: WikipediaArticle | null;
  suggestions: { title: string; snippet: string; url: string }[];
}

const wikiCache = new Map<string, { data: WikipediaSearchResult; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 mins

export async function queryWikipediaKnowledge(rawQuery: string): Promise<WikipediaSearchResult> {
  const query = rawQuery.trim();
  if (!query || query.length < 2) {
    return { summary: null, suggestions: [] };
  }

  const cacheKey = query.toLowerCase();
  const cached = wikiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  let summary: WikipediaArticle | null = null;
  const suggestions: { title: string; snippet: string; url: string }[] = [];

  try {
    // 1. First attempt: Direct REST summary API (cleanest, high-quality extracts + photos)
    const formattedTitle = query.replace(/\s+/g, '_');
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formattedTitle)}`,
      { headers: { Accept: 'application/json' } }
    );

    if (summaryRes.ok) {
      const data = await summaryRes.json();
      if (data.type === 'standard' || data.extract) {
        summary = {
          title: data.title,
          description: data.description,
          extract: data.extract,
          thumbnail: data.thumbnail?.source,
          pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
        };
      }
    }
  } catch (e) {
    // Continue to search fallback
  }

  try {
    // 2. OpenSearch query for suggestions & fallback if direct summary was not found
    const openSearchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`
    );

    if (openSearchRes.ok) {
      const openSearchData = await openSearchRes.json();
      // Format: [query, [titles], [descriptions], [urls]]
      const titles: string[] = openSearchData[1] || [];
      const descriptions: string[] = openSearchData[2] || [];
      const urls: string[] = openSearchData[3] || [];

      titles.forEach((t, i) => {
        suggestions.push({
          title: t,
          snippet: descriptions[i] || '',
          url: urls[i] || `https://en.wikipedia.org/wiki/${encodeURIComponent(t)}`,
        });
      });

      // If we didn't get a direct summary, try fetching summary of the top OpenSearch match
      if (!summary && titles.length > 0 && titles[0]) {
        try {
          const topMatchTitle = titles[0].replace(/\s+/g, '_');
          const topRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topMatchTitle)}`
          );
          if (topRes.ok) {
            const topData = await topRes.json();
            if (topData.extract) {
              summary = {
                title: topData.title,
                description: topData.description,
                extract: topData.extract,
                thumbnail: topData.thumbnail?.source,
                pageUrl: topData.content_urls?.desktop?.page || urls[0],
              };
            }
          }
        } catch (err) {
          // Ignore secondary fetch error
        }
      }
    }
  } catch (e) {
    console.warn('Wikipedia query error:', e);
  }

  const result: WikipediaSearchResult = { summary, suggestions };
  wikiCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}
