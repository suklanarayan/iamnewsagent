import { SEED_ARTICLES, SEED_AUTHORS } from '../data/seedData';
import type { Article, Author } from '../types';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase Firestore for server-side operations
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const serverDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// In-memory cache for server articles to prevent hitting Firestore on every single request
let cachedArticles: Article[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 20 * 1000; // 20 seconds TTL

export function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Fetch all published articles server-side from Firestore, merging with SEED_ARTICLES
 */
export async function getAllServerArticles(): Promise<Article[]> {
  const now = Date.now();
  if (cachedArticles && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedArticles;
  }

  let firestoreList: Article[] = [];
  try {
    const colRef = collection(serverDb, 'articles');
    const q = query(colRef, orderBy('publishedAt', 'desc'), limit(150));
    const snap = await getDocs(q);
    if (!snap.empty) {
      firestoreList = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Article, 'id'>) }));
    }
  } catch (err: any) {
    console.warn('Server failed to fetch articles from Firestore, using seed fallback:', err?.message || err);
  }

  // Merge seed articles with Firestore articles (Firestore takes priority)
  const firestoreSlugs = new Set(firestoreList.map((a) => a.slug));
  const firestoreIds = new Set(firestoreList.map((a) => a.id));

  const merged: Article[] = [...firestoreList];
  for (const seed of SEED_ARTICLES) {
    if (!firestoreSlugs.has(seed.slug) && !firestoreIds.has(seed.id)) {
      merged.push(seed);
    }
  }

  // Sort by publishedAt descending
  merged.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());

  cachedArticles = merged;
  cacheTimestamp = now;
  return merged;
}

/**
 * Find an article by slug (or ID) server-side
 */
export async function getServerArticleBySlug(slug: string): Promise<Article | undefined> {
  const articles = await getAllServerArticles();
  return articles.find((a) => a.slug === slug || a.id === slug);
}

/**
 * Find author by ID server-side
 */
export function getServerAuthorById(authorId: string): Author | undefined {
  return SEED_AUTHORS.find((a) => a.id === authorId);
}

/**
 * Simple markdown-to-HTML parser for server-side article body pre-rendering
 */
function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  const lines = markdown.split('\n\n');
  return lines
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';

      // Markdown image: ![alt](url)
      if (trimmed.startsWith('![') && trimmed.includes('](')) {
        const m = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
        if (m) {
          return `<figure class="my-6">
            <div class="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
              <img src="${escapeHtml(m[2])}" alt="${escapeHtml(m[1])}" width="1200" height="675" style="aspect-ratio: 16/9; width: 100%; height: 100%; object-fit: cover;" loading="lazy" decoding="async" />
            </div>
            ${m[1] ? `<figcaption class="text-xs text-slate-500 italic mt-1.5 px-1">${escapeHtml(m[1])}</figcaption>` : ''}
          </figure>`;
        }
      }

      // H2 Header
      if (trimmed.startsWith('## ')) {
        return `<h2 class="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2">${escapeHtml(trimmed.substring(3))}</h2>`;
      }

      // H3 Header
      if (trimmed.startsWith('### ')) {
        return `<h3 class="text-xl sm:text-2xl font-serif font-bold text-slate-900 mt-6 mb-3">${escapeHtml(trimmed.substring(4))}</h3>`;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        return `<blockquote class="p-4 my-6 rounded-r-xl border-l-4 border-red-600 bg-red-50/50 text-slate-800 italic font-serif text-lg leading-relaxed">${escapeHtml(trimmed.substring(2))}</blockquote>`;
      }

      // Ordered / Unordered list items
      if (trimmed.startsWith('1. ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').filter(Boolean);
        return `<ul class="space-y-2 my-4 list-disc list-inside text-slate-700">${items
          .map((it) => `<li>${escapeHtml(it.replace(/^(?:\d+\.|\-|\*)\s+/, ''))}</li>`)
          .join('')}</ul>`;
      }

      // Standard paragraph
      return `<p class="text-slate-800 text-base sm:text-lg leading-relaxed font-sans">${escapeHtml(trimmed)}</p>`;
    })
    .join('\n');
}

/**
 * Server-Side Render (SSR) full HTML for dynamic news article
 */
export function renderArticleSsrHtml(article: Article, templateHtml: string): string {
  let html = templateHtml;
  const baseUrl = 'https://iamquickagent.com';
  const canonicalUrl = `${baseUrl}/news/${encodeURIComponent(article.slug)}`;
  const pageTitle = `${article.headline} | iamquickagent.com`;
  const desc = article.deck || article.keyTakeaways?.[0] || 'Live breaking news and rapid intelligence dispatch from iamquickagent.com.';
  const featuredImg = article.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=85';
  const author = getServerAuthorById(article.authorId);
  const authorName = author ? author.name : 'iamquickagent Intelligence Desk';

  // 1. Title & Core Meta
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`);
  html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${escapeHtml(desc)}" />`);

  // 2. OpenGraph Meta Tags
  html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${escapeHtml(pageTitle)}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${escapeHtml(desc)}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="article" />`);
  html = html.replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${featuredImg}" />`);

  // 3. Twitter Meta Tags
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${escapeHtml(pageTitle)}" />`);
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${escapeHtml(desc)}" />`);
  html = html.replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="${featuredImg}" />`);

  // 4. Canonical & Preload Tags (Preload featured image to guarantee LCP < 2.5s)
  const headAdditions = `
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="preload" as="image" href="${featuredImg}" fetchpriority="high" />
  `;
  if (html.includes('rel="canonical"')) {
    html = html.replace(/<link[^>]*rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    html = html.replace('</head>', `${headAdditions}\n  </head>`);
  }

  // 5. Schema.org NewsArticle Structured Data (with Speakable specification for Google News & AEO)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${canonicalUrl}#article`,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    'headline': article.headline,
    'alternativeHeadline': article.deck || article.keyTakeaways?.[0] || article.headline,
    'description': desc,
    'image': [featuredImg],
    'datePublished': article.publishedAt,
    'dateModified': article.updatedAt || article.publishedAt,
    'articleSection': article.category,
    'keywords': (article.tags || []).join(', ') || article.category,
    'wordCount': article.content ? article.content.split(/\s+/).filter(Boolean).length : 500,
    'author': [
      {
        '@type': 'Person',
        'name': authorName,
        'jobTitle': author ? author.role : 'Staff Intelligence Analyst',
        'url': `${baseUrl}/author/${article.authorId}`,
      },
    ],
    'publisher': {
      '@type': 'NewsMediaOrganization',
      '@id': `${baseUrl}/#organization`,
      'name': 'iamquickagent.com',
      'url': baseUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}/favicon.svg`,
        'width': 600,
        'height': 120,
      },
    },
    'inLanguage': 'en-US',
    'isAccessibleForFree': 'True',
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': ['[data-aeo-summary="true"]', 'h1', '.deck-summary'],
    },
  };

  // Inject Schema and Initial In-Memory State for Instant React Hydration
  const scriptTags = `
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <script>window.__INITIAL_ARTICLE__ = ${JSON.stringify(article)};</script>
  `;
  html = html.replace('</head>', `${scriptTags}\n  </head>`);

  // 6. Pre-rendered Semantic HTML Tree inside <div id="root">
  // Immediately readable by Googlebot, curl, social parsers, and low-end mobile devices before JS boots
  const renderedBody = renderMarkdownToHtml(article.content || '');
  const takeawaysList = (article.keyTakeaways || [])
    .map((t) => `<li class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0"></span><span>${escapeHtml(t)}</span></li>`)
    .join('');

  const preRenderedHtml = `
    <div id="ssr-root-container" class="min-h-screen bg-white text-slate-900 font-sans">
      <!-- SSR Top Navigation Header -->
      <header class="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <a href="/" class="flex items-center gap-2 group">
            <span class="w-7 h-7 rounded-lg bg-red-700 text-white font-serif font-black flex items-center justify-center text-sm shadow-xs">Q</span>
            <span class="font-serif font-black text-xl tracking-tight text-slate-950">iamquickagent<span class="text-red-700">.com</span></span>
          </a>
          <nav class="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-600">
            <a href="/" class="hover:text-red-700">Top Wire</a>
            <a href="/?category=India" class="hover:text-red-700">India</a>
            <a href="/?category=World" class="hover:text-red-700">World</a>
            <a href="/?category=Business" class="hover:text-red-700">Business</a>
            <a href="/?category=Technology" class="hover:text-red-700">Tech</a>
            <a href="/?category=Explainers" class="hover:text-red-700">Explainers</a>
          </nav>
        </div>
      </header>

      <!-- SSR Main Article Container -->
      <main class="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <article itemscope itemtype="https://schema.org/NewsArticle" class="space-y-6">
          <!-- Category & Metadata Line -->
          <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex-wrap">
            <span class="px-2.5 py-1 rounded bg-slate-900 text-amber-400 font-bold">${escapeHtml(article.category)}</span>
            <span>&bull;</span>
            <time itemprop="datePublished" datetime="${article.publishedAt}">${new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
            <span>&bull;</span>
            <span>${article.readTimeMinutes || 4} min read</span>
          </div>

          <!-- Headline (LCP Anchor) -->
          <h1 itemprop="headline" class="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-950 leading-[1.18] [text-wrap:balance]">
            ${escapeHtml(article.headline)}
          </h1>

          <!-- Subheadline / Deck -->
          ${article.deck ? `<p itemprop="description" class="deck-summary text-lg sm:text-xl text-slate-600 font-serif leading-relaxed">${escapeHtml(article.deck)}</p>` : ''}

          <!-- Byline & Desk -->
          <div class="flex items-center gap-3 py-3 border-y border-slate-200 text-xs text-slate-600">
            <div class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold font-mono">
              ${escapeHtml(authorName.charAt(0))}
            </div>
            <div>
              <span class="font-bold text-slate-900 block">${escapeHtml(authorName)}</span>
              <span class="text-[11px] text-slate-500">${escapeHtml(article.sourceName || 'Editorial Newsroom Bureau')}</span>
            </div>
          </div>

          <!-- Mandatory Key Takeaways (Speakable AEO block) -->
          ${(article.keyTakeaways && article.keyTakeaways.length > 0) ? `
            <section class="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-slate-900 space-y-2.5" data-aeo-summary="true">
              <div class="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <span>⚡ Key Takeaway Summary</span>
              </div>
              <ul class="space-y-2 text-sm text-slate-800 leading-relaxed">
                ${takeawaysList}
              </ul>
            </section>
          ` : ''}

          <!-- Hero Image with explicit width & height and 16:9 aspect ratio to ELIMINATE CLS -->
          <figure class="space-y-2">
            <div class="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200" style="aspect-ratio: 16/9; width: 100%;">
              <img
                src="${featuredImg}"
                alt="${escapeHtml(article.headline)}"
                width="1200"
                height="675"
                fetchpriority="high"
                loading="eager"
                style="aspect-ratio: 16/9; width: 100%; height: 100%; object-fit: cover;"
              />
            </div>
            ${article.imageCaption ? `<figcaption class="text-xs text-slate-500 italic px-1 font-editorial">${escapeHtml(article.imageCaption)}</figcaption>` : ''}
          </figure>

          <!-- Semantic Body Content -->
          <div itemprop="articleBody" class="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans text-base sm:text-lg space-y-4 pt-4">
            ${renderedBody}
          </div>
        </article>
      </main>
    </div>
  `;

  html = html.replace('<div id="root"></div>', `<div id="root">${preRenderedHtml}</div>`);
  return html;
}

/**
 * Server-Side Render (SSR) for Homepage or Category view
 */
export function renderHomeSsrHtml(articles: Article[], templateHtml: string, activeCategory?: string): string {
  let html = templateHtml;
  const baseUrl = 'https://iamquickagent.com';
  const canonicalUrl = activeCategory ? `${baseUrl}/?category=${encodeURIComponent(activeCategory)}` : `${baseUrl}/`;

  const topNews = articles.slice(0, 15);
  const headlineList = topNews
    .map((a) => `
      <li class="py-2.5 border-b border-slate-100 flex items-start gap-3">
        <span class="text-xs font-bold text-amber-700 uppercase shrink-0 mt-0.5">${escapeHtml(a.category)}</span>
        <a href="/news/${encodeURIComponent(a.slug)}" class="text-slate-900 hover:text-red-700 font-serif font-bold text-base sm:text-lg leading-snug">
          ${escapeHtml(a.headline)}
        </a>
      </li>
    `)
    .join('');

  const preRenderedHome = `
    <div id="ssr-home-container" class="min-h-screen bg-white text-slate-900 font-sans">
      <header class="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <a href="/" class="flex items-center gap-2 group">
            <span class="w-7 h-7 rounded-lg bg-red-700 text-white font-serif font-black flex items-center justify-center text-sm shadow-xs">Q</span>
            <span class="font-serif font-black text-xl tracking-tight text-slate-950">iamquickagent<span class="text-red-700">.com</span></span>
          </a>
          <nav class="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-600">
            <a href="/" class="hover:text-red-700">Top Wire</a>
            <a href="/?category=India" class="hover:text-red-700">India</a>
            <a href="/?category=World" class="hover:text-red-700">World</a>
            <a href="/?category=Business" class="hover:text-red-700">Business</a>
            <a href="/?category=Technology" class="hover:text-red-700">Tech</a>
            <a href="/?category=Explainers" class="hover:text-red-700">Explainers</a>
          </nav>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div class="mb-6 pb-3 border-b border-slate-200 flex items-center justify-between">
          <h1 class="text-2xl sm:text-3xl font-serif font-bold text-slate-950">
            ${activeCategory ? `${escapeHtml(activeCategory)} News &amp; Headlines` : 'Breaking News &amp; Live Wire Dispatches'}
          </h1>
          <span class="text-xs text-slate-500 font-mono">Updated real-time</span>
        </div>

        <section aria-label="Latest News Dispatches">
          <ul class="space-y-1">
            ${headlineList}
          </ul>
        </section>
      </main>
    </div>
  `;

  // Canonical tag injection
  if (html.includes('rel="canonical"')) {
    html = html.replace(/<link[^>]*rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    html = html.replace('</head>', `    <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
  }

  html = html.replace('<div id="root"></div>', `<div id="root">${preRenderedHome}</div>`);
  return html;
}

/**
 * Generate dynamic sitemap.xml including ALL curated articles from Firestore
 */
export function generateSitemapXml(articles: Article[]): string {
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

  // All Published Articles (from Firestore + Seeds)
  const publishedArticles = articles.filter((a) => (a.status || 'published') === 'published');
  for (const article of publishedArticles) {
    const lastMod = article.updatedAt || article.publishedAt || new Date().toISOString();
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/news/${encodeURIComponent(article.slug)}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${article.isBreaking ? '0.95' : '0.85'}</priority>\n`;
    if (article.featuredImage) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(article.featuredImage)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(article.headline)}</image:title>\n`;
      if (article.deck) {
        xml += `      <image:caption>${escapeXml(article.deck)}</image:caption>\n`;
      }
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

/**
 * Generate dynamic news-sitemap.xml conforming to Google News Sitemap specifications
 */
export function generateNewsSitemapXml(articles: Article[]): string {
  const baseUrl = 'https://iamquickagent.com';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  // Google News accepts articles published within the last 48 hours, or the latest 100 articles
  const published = articles
    .filter((a) => (a.status || 'published') === 'published')
    .slice(0, 100);

  for (const article of published) {
    const pubDate = article.publishedAt || new Date().toISOString();
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/news/${encodeURIComponent(article.slug)}</loc>\n`;
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
  return xml;
}
