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
  try {
    const res = await fetch(`/api/news/top-sources?topic=${encodeURIComponent(topic)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.articles || [];
  } catch (err) {
    console.error('Failed to fetch wire news:', err);
    throw err;
  }
}

export async function fetchNewsFromUrl(url: string): Promise<{ title: string; text: string; description: string }> {
  try {
    const res = await fetch('/api/news/fetch-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return {
      title: data.title || '',
      text: data.text || '',
      description: data.description || '',
    };
  } catch (err) {
    console.error('Failed to fetch from URL:', err);
    throw err;
  }
}

export async function rewriteNewsWithGemini(params: {
  rawText: string;
  headline?: string;
  sourceName?: string;
  preferredCategory?: string;
  tone?: string;
}): Promise<RewrittenArticleResult> {
  try {
    const res = await fetch('/api/news/ai-rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Invalid response from AI rewriter.');
    }
    return data.data;
  } catch (err) {
    console.error('Failed to rewrite news with Gemini:', err);
    throw err;
  }
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
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed generating live story points');
    }
    return data.data;
  } catch (err) {
    console.error('Failed generating live story points:', err);
    throw err;
  }
}

