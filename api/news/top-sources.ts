// Vercel Serverless Function: GET /api/news/top-sources

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

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '').trim();
}

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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const topic = ((req.query?.topic as string) || 'ALL').toUpperCase();
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
    } catch {
      // Continue
    }
  }

  const seenTitles = new Set<string>();
  const uniqueItems = items.filter((item) => {
    const simplified = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 30);
    if (seenTitles.has(simplified)) return false;
    seenTitles.add(simplified);
    return true;
  });

  return res.status(200).json({
    success: true,
    topic,
    count: uniqueItems.length,
    articles: uniqueItems,
  });
}
