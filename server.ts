import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

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

// 3. Fetch webpage text from URL
app.post('/api/news/fetch-url', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid URL is required.' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL, status ${response.status}`);
    }

    const html = await response.text();

    // Extract title
    const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
    const title = titleMatch ? stripHtml(decodeHtmlEntities(titleMatch[1])) : '';

    // Extract meta description
    const descMatch = /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i.exec(html) ||
                      /<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']/i.exec(html);
    const description = descMatch ? decodeHtmlEntities(descMatch[1]) : '';

    // Extract paragraph text
    const paragraphs: string[] = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let pMatch: RegExpExecArray | null;

    while ((pMatch = pRegex.exec(html)) !== null && paragraphs.length < 30) {
      const cleanP = stripHtml(decodeHtmlEntities(pMatch[1]));
      if (cleanP.length > 50 && !cleanP.toLowerCase().includes('cookie') && !cleanP.toLowerCase().includes('subscribe')) {
        paragraphs.push(cleanP);
      }
    }

    const extractedText = paragraphs.join('\n\n');

    res.json({
      success: true,
      title,
      description,
      text: extractedText || description || title,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: (err as Error).message || 'Failed to extract content from URL',
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

    const prompt = `You are a Senior Editor at "iamnewsagent.com" (tagline: "Real News. Broader Perspectives.").
Your task is to take this raw news wire story and rewrite it into a completely original, authoritative, balanced, and copyright-clean investigative news report.

Source Information:
- Source Wire / Agency: ${sourceName || 'International News Wire'}
- Original Headline Hint: ${headline || 'N/A'}
- Preferred Category Hint: ${preferredCategory || 'Auto-detect'}
- Editorial Tone: ${tone}

Raw Source Content:
"""
${(rawText || headline).substring(0, 7000)}
"""

REQUIREMENTS FOR YOUR REWRITE:
1. "headline": An impactful, clear, journalistic headline (60-90 characters). Never clickbait.
2. "deck": A powerful 1-2 sentence executive subheadline summarizing why this matters right now.
3. "category": Must be one of these exact values: "India", "World", "Business", "Technology", "Markets", "Science", "Health", "Sports", "Lifestyle", "Entertainment", "Explainers", "Opinion".
4. "keyTakeaways": An array of 3 to 4 crisp, high-impact bullet points (each 15-25 words) detailing core findings, data figures, and strategic implications. Optimized for AI answer engines (AEO/GEO).
5. "content": A comprehensive, well-structured news story formatted in clean Markdown (500 - 800 words):
   - Include 2-3 informative ## Subheadings.
   - Begin with a strong lede answering who, what, when, where, and why.
   - Include context, historical background, global or domestic economic impact, and diverse stakeholder perspectives.
   - Maintain objective, neutral, professional journalistic ethics.
   - Formatted with paragraphs and occasional quotes or key points.
6. "tags": An array of 4-6 specific search and SEO tags (e.g., ["Artificial Intelligence", "Regulatory Policy", "Global Trade"]).
7. "readTimeMinutes": Estimated reading time as an integer (e.g., 3, 4, or 5).
8. "imageTopic": A 2-4 word visual query for a stock cover photo (e.g., "satellite earth orbit", "financial trading floor", "solar farm field", "semiconductor cleanroom").
9. "imageCaption": A professional journalistic photo caption crediting the conceptual context.

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
  "imageCaption": string
}`;

    // Try models with fallback if primary is under high demand (503)
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let outputText = '';
    let lastError: any = null;

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
        if (outputText) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} attempt error, trying fallback...`, (err as Error)?.message);
      }
    }

    if (!outputText && lastError) {
      throw lastError;
    }

    const parsed = JSON.parse(outputText || '{}');

    res.json({
      success: true,
      data: parsed,
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
