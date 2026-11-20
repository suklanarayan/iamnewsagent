import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_ARTICLES, SEED_AUTHORS } from '../data/seedData.js';
import { LEGAL_PAGE_LIST, type LegalPageData } from '../data/legalPages.js';
import type { Article, Author } from '../types.js';

interface FirebasePublicConfig {
  projectId: string;
  apiKey: string;
  firestoreDatabaseId?: string;
}

let cachedFirebaseConfig: FirebasePublicConfig | null = null;
function getServerFirebaseConfig(): FirebasePublicConfig {
  if (cachedFirebaseConfig) return cachedFirebaseConfig;

  const candidatePaths = [
    path.resolve(process.cwd(), 'firebase-applet-config.json'),
    path.resolve(process.cwd(), '..', 'firebase-applet-config.json'),
  ];

  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      candidatePaths.push(
        path.resolve(currentDir, '..', 'firebase-applet-config.json'),
        path.resolve(currentDir, '..', '..', 'firebase-applet-config.json')
      );
    }
  } catch {
    // CommonJS bundle fallback uses process.cwd()
  }

  for (const cfgPath of candidatePaths) {
    try {
      if (fs.existsSync(cfgPath)) {
        const parsed = JSON.parse(fs.readFileSync(cfgPath, 'utf-8')) as FirebasePublicConfig;
        if (parsed && parsed.projectId && parsed.apiKey) {
          cachedFirebaseConfig = parsed;
          return cachedFirebaseConfig;
        }
      }
    } catch {
      // Try next path or env vars
    }
  }

  cachedFirebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    apiKey: process.env.FIREBASE_API_KEY || '',
    firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || '(default)',
  };
  return cachedFirebaseConfig;
}

export const SITE_URL = 'https://www.iamquickagent.com';
export const SITE_NAME = 'iamquickagent.com';
export const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=85';

// In-memory cache for server articles & authors (initialized with seeds for 0ms startup)
let cachedArticles: Article[] = [...SEED_ARTICLES].sort(
  (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
);
let cachedAuthors: Author[] = [...SEED_AUTHORS];
let articlesCacheTimestamp = 0;
let authorsCacheTimestamp = 0;
let isRefreshingArticles = false;
let isRefreshingAuthors = false;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds TTL

export function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function safeJsonForScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function decodeBasicEntities(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return !isNaN(code) ? String.fromCharCode(code) : _;
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return !isNaN(code) ? String.fromCharCode(code) : _;
    })
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ');
}

/**
 * Category-appropriate HTTPS raster fallback for OpenGraph, Schema.org, RSS, and Google Image Sitemaps
 * (Crawlers & Sitemap validators reject relative paths, SVG files, and base64 data: URIs)
 */
function getCategoryFallbackImage(category?: string): string {
  const cat = (category || '').toLowerCase();
  if (cat === 'world') return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&h=630&q=85';
  if (cat === 'technology') return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=630&q=85';
  if (cat === 'business' || cat === 'markets') return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&h=630&q=85';
  if (cat === 'science') return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=630&q=85';
  if (cat === 'sports') return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&h=630&q=85';
  if (cat === 'entertainment') return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&h=630&q=85';
  return DEFAULT_OG_IMAGE;
}

/**
 * Normalize any image URL into a valid public absolute https:// raster URL for meta/OG/JSON-LD/Sitemap/RSS.
 * Rejects data: URIs and .svg placeholders which fail Google Sitemap & OpenGraph validation.
 */
export function toAbsoluteUrl(rawUrl?: string, category?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return getCategoryFallbackImage(category);
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.startsWith('data:')) return getCategoryFallbackImage(category);

  let resolved = trimmed;
  if (resolved.startsWith('https://iamquickagent.com/')) {
    resolved = resolved.replace('https://iamquickagent.com/', `${SITE_URL}/`);
  } else if (resolved.startsWith('http://iamquickagent.com/')) {
    resolved = resolved.replace('http://iamquickagent.com/', `${SITE_URL}/`);
  } else if (resolved.startsWith('//')) {
    resolved = `https:${resolved}`;
  } else if (resolved.startsWith('/')) {
    resolved = `${SITE_URL}${resolved}`;
  } else if (!resolved.startsWith('https://') && !resolved.startsWith('http://')) {
    resolved = `${SITE_URL}/${resolved}`;
  }

  if (resolved.toLowerCase().endsWith('.svg')) {
    return getCategoryFallbackImage(category);
  }
  return resolved;
}

function toSitemapImageUrl(rawUrl?: string, category?: string): string {
  return toAbsoluteUrl(rawUrl, category);
}

/**
 * Resolve image src for HTML <img> rendering (allows data: URIs for inline hero display, normalizes relative paths)
 */
function toRenderableImgSrc(rawUrl?: string, category?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return getCategoryFallbackImage(category);
  }
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('data:image/')) return trimmed;
  if (trimmed.startsWith('/')) return `${SITE_URL}${trimmed}`;
  return toAbsoluteUrl(trimmed, category);
}

function safeIsoDate(input?: string): string {
  if (!input) return new Date().toISOString();
  const d = new Date(input);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function buildMetaDescription(rawCandidates: Array<string | undefined>, fallback: string): string {
  for (const candidate of rawCandidates) {
    if (!candidate) continue;
    const cleaned = decodeBasicEntities(candidate)
      .replace(/!\[.*?\]\(.*?\)/g, ' ')
      .replace(/[#*`_>[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned.length >= 30) {
      if (cleaned.length <= 160) return cleaned;
      const sliced = cleaned.slice(0, 157);
      const lastSpace = sliced.lastIndexOf(' ');
      return (lastSpace > 110 ? sliced.slice(0, lastSpace) : sliced).replace(/[.,;:\s]+$/, '') + '...';
    }
  }
  return fallback;
}

export function buildArticleTitle(article: Article): string {
  const raw = decodeBasicEntities(article.seoTitle || article.headline || 'Breaking News').trim();
  if (raw.toLowerCase().includes('iamquickagent.com')) return raw;
  return `${raw} | ${SITE_NAME}`;
}

export function buildArticleDescription(article: Article): string {
  return buildMetaDescription(
    [article.seoDescription, article.deck, article.keyTakeaways?.[0], article.content],
    `Read the latest ${article.category || 'breaking'} news coverage: ${article.headline} on ${SITE_NAME}.`
  );
}

// ============================================================================
// LIGHTWEIGHT FIRESTORE REST API CLIENT (120ms cold-start safe on Vercel)
// ============================================================================

function decodeFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return null;
  if ('stringValue' in val) return val.stringValue;
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('timestampValue' in val) return val.timestampValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    const values = val.arrayValue?.values;
    return Array.isArray(values) ? values.map(decodeFirestoreValue) : [];
  }
  if ('mapValue' in val) {
    const fields = val.mapValue?.fields || {};
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = decodeFirestoreValue(v);
    }
    return out;
  }
  return null;
}

function decodeFirestoreDoc<T>(doc: any): T & { id: string } {
  const name: string = doc?.name || '';
  const id = name.split('/').pop() || '';
  const fields = doc?.fields || {};
  const result: Record<string, any> = { id };
  for (const [k, v] of Object.entries(fields)) {
    result[k] = decodeFirestoreValue(v);
  }
  return result as T & { id: string };
}

async function fetchFirestoreCollectionRest<T>(
  collectionName: string,
  options: { orderByField?: string; limit?: number; timeoutMs?: number } = {}
): Promise<Array<T & { id: string }>> {
  const firebaseConfig = getServerFirebaseConfig();
  if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
    throw new Error('Firebase public configuration is unavailable on server.');
  }
  const projectId = firebaseConfig.projectId;
  const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
  const runQueryEndpoint = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/${encodeURIComponent(databaseId)}/documents:runQuery`;

  const structuredQuery: Record<string, any> = {
    from: [{ collectionId: collectionName }],
    limit: options.limit || 250,
  };

  if (options.orderByField) {
    structuredQuery.orderBy = [
      { field: { fieldPath: options.orderByField }, direction: 'DESCENDING' },
    ];
  }

  const res = await fetch(runQueryEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Goog-Api-Key': firebaseConfig.apiKey,
    },
    body: JSON.stringify({ structuredQuery }),
    signal: AbortSignal.timeout(options.timeoutMs || 5000),
  });

  if (!res.ok) {
    throw new Error(`Firestore REST runQuery ${collectionName} HTTP ${res.status}`);
  }

  const rows: any[] = await res.json();
  const items: Array<T & { id: string }> = [];
  if (Array.isArray(rows)) {
    for (const row of rows) {
      if (row && row.document) {
        items.push(decodeFirestoreDoc<T>(row.document));
      }
    }
  }
  return items;
}

async function refreshFirestoreArticles(): Promise<Article[]> {
  if (isRefreshingArticles) return cachedArticles;
  isRefreshingArticles = true;
  try {
    const firestoreList = await fetchFirestoreCollectionRest<Article>('articles', {
      orderByField: 'publishedAt',
      limit: 300,
      timeoutMs: 5500,
    });
    if (firestoreList.length > 0) {
      const normalizedList: Article[] = firestoreList
        .filter((a) => a && a.slug && a.headline)
        .map((a) => ({
          ...a,
          headline: decodeBasicEntities(a.headline),
          deck: decodeBasicEntities(a.deck || ''),
          status: a.status || 'published',
          tags: Array.isArray(a.tags) ? a.tags : [],
          keyTakeaways: Array.isArray(a.keyTakeaways) ? a.keyTakeaways : [],
          publishedAt: safeIsoDate(a.publishedAt),
          updatedAt: safeIsoDate(a.updatedAt || a.publishedAt),
        }));

      const firestoreSlugs = new Set(normalizedList.map((a) => a.slug));
      const firestoreIds = new Set(normalizedList.map((a) => a.id));

      const merged: Article[] = [...normalizedList];
      for (const seed of SEED_ARTICLES) {
        if (!firestoreSlugs.has(seed.slug) && !firestoreIds.has(seed.id)) {
          merged.push(seed);
        }
      }

      merged.sort(
        (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
      );

      cachedArticles = merged;
      articlesCacheTimestamp = Date.now();
      return merged;
    }
  } catch (err: any) {
    console.warn('Server Firestore REST articles fetch fallback:', err?.message || err);
  } finally {
    isRefreshingArticles = false;
  }
  return cachedArticles;
}

async function refreshFirestoreAuthors(): Promise<Author[]> {
  if (isRefreshingAuthors) return cachedAuthors;
  isRefreshingAuthors = true;
  try {
    const firestoreAuthors = await fetchFirestoreCollectionRest<Author>('authors', {
      limit: 100,
      timeoutMs: 4000,
    });
    if (firestoreAuthors.length > 0) {
      const ids = new Set(firestoreAuthors.map((a) => a.id));
      const merged = [...firestoreAuthors];
      for (const seed of SEED_AUTHORS) {
        if (!ids.has(seed.id)) merged.push(seed);
      }
      cachedAuthors = merged;
      authorsCacheTimestamp = Date.now();
      return merged;
    }
  } catch (err: any) {
    console.warn('Server Firestore REST authors fetch fallback:', err?.message || err);
  } finally {
    isRefreshingAuthors = false;
  }
  return cachedAuthors;
}

/**
 * Fetch all articles server-side from Firestore REST API merged with SEED_ARTICLES.
 * Fast (~120ms) and cached for 30s so sitemaps & SSR always include newly added news.
 */
export async function getAllServerArticles(forceFresh: boolean = false): Promise<Article[]> {
  const now = Date.now();
  if (!forceFresh && now - articlesCacheTimestamp < CACHE_TTL_MS && articlesCacheTimestamp > 0) {
    return cachedArticles;
  }

  if (forceFresh || articlesCacheTimestamp === 0) {
    await refreshFirestoreArticles();
  } else {
    // Stale-while-revalidate refresh
    await refreshFirestoreArticles();
  }
  return cachedArticles;
}

export async function getAllServerAuthors(): Promise<Author[]> {
  const now = Date.now();
  if (now - authorsCacheTimestamp < CACHE_TTL_MS && authorsCacheTimestamp > 0) {
    return cachedAuthors;
  }
  await refreshFirestoreAuthors();
  return cachedAuthors;
}

export async function getServerArticleBySlug(slug: string): Promise<Article | undefined> {
  const articles = await getAllServerArticles();
  const direct = articles.find((a) => a.slug === slug || a.id === slug);
  if (direct) return direct;
  // If not in cache (brand new article just published), force one fresh check
  const fresh = await getAllServerArticles(true);
  return fresh.find((a) => a.slug === slug || a.id === slug);
}

export async function getServerAuthorById(authorId: string): Promise<Author | undefined> {
  const authors = await getAllServerAuthors();
  return authors.find((a) => a.id === authorId) || SEED_AUTHORS.find((a) => a.id === authorId);
}

// ============================================================================
// SHARED SCHEMA.ORG ENTITY BUILDERS
// ============================================================================

export function buildOrganizationSchema() {
  return {
    '@type': 'NewsMediaOrganization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ['iamquickagent', 'iamnewsagent', 'iamnewsagent.com'],
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#logo`,
      url: DEFAULT_OG_IMAGE,
      caption: 'iamquickagent.com Logo',
      width: 1200,
      height: 630,
    },
    image: DEFAULT_OG_IMAGE,
    sameAs: [
      'https://twitter.com/iamquickagent',
      'https://facebook.com/iamquickagent',
      'https://linkedin.com/company/iamquickagent',
      'https://youtube.com/@iamquickagent',
    ],
    description:
      'Real-time digital breaking news and multimedia publishing network delivering live coverage across India, World, Business, Markets, Technology, Politics, Sports, and in-depth explainers.',
    foundingDate: '2024-03-01',
    founder: {
      '@type': 'Person',
      '@id': `${SITE_URL}/author/author-narayan-shukla#person`,
      name: 'Narayan Shukla',
      jobTitle: 'Editor-in-Chief & Founder',
      url: `${SITE_URL}/author/author-narayan-shukla`,
    },
    publishingPrinciples: `${SITE_URL}/editorial-standards`,
    ethicsPolicy: `${SITE_URL}/editorial-standards`,
    correctionsPolicy: `${SITE_URL}/editorial-standards`,
    masthead: `${SITE_URL}/editorial-standards`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Newsroom Editorial Desk',
      email: 'SUKLA.NARAYAN007@gmail.com',
      availableLanguage: ['English', 'Hindi'],
    },
  };
}

export function buildWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    alternateName: ['iamquickagent', 'iamnewsagent'],
    description:
      'Live breaking news, real-time headlines, and in-depth reporting across India, World, Business, Tech, Markets, Sports, and Politics.',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  };
}

// ============================================================================
// HEAD METADATA & HTML MANIPULATION HELPERS
// ============================================================================

interface PageMetaInput {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: 'website' | 'article' | 'profile';
  imageUrl?: string;
  imageAlt?: string;
  keywords?: string;
  authorName?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  preloadImage?: string;
}

function applyHeadMeta(templateHtml: string, meta: PageMetaInput, jsonLdGraph: object, inlineScripts: string): string {
  let html = templateHtml;
  const img = toAbsoluteUrl(meta.imageUrl);
  const imgAlt = meta.imageAlt || meta.title;

  // Strip any existing default static JSON-LD block marked with data-ssr-default="true"
  html = html.replace(/<script[^>]*data-ssr-default="true"[^>]*>[\s\S]*?<\/script>/gi, '');

  // Helper to replace or insert meta tag reliably whether self-closing or not
  const setMetaByName = (name: string, content: string) => {
    const escaped = escapeHtml(content);
    const re = new RegExp(`<meta\\s+[^>]*name=["']${name}["'][^>]*\\/?>`, 'i');
    const tag = `<meta name="${name}" content="${escaped}" />`;
    if (re.test(html)) {
      html = html.replace(re, tag);
    } else {
      html = html.replace('</head>', `    ${tag}\n  </head>`);
    }
  };

  const setMetaByProp = (prop: string, content: string) => {
    const escaped = escapeHtml(content);
    const re = new RegExp(`<meta\\s+[^>]*property=["']${prop}["'][^>]*\\/?>`, 'i');
    const tag = `<meta property="${prop}" content="${escaped}" />`;
    if (re.test(html)) {
      html = html.replace(re, tag);
    } else {
      html = html.replace('</head>', `    ${tag}\n  </head>`);
    }
  };

  // Title
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  } else {
    html = html.replace('</head>', `    <title>${escapeHtml(meta.title)}</title>\n  </head>`);
  }

  // Standard SEO Meta
  setMetaByName('description', meta.description);
  if (meta.keywords) {
    setMetaByName('keywords', meta.keywords);
    setMetaByName('news_keywords', meta.keywords);
  }
  if (meta.authorName) {
    setMetaByName('author', meta.authorName);
  }

  // OpenGraph
  setMetaByProp('og:type', meta.ogType);
  setMetaByProp('og:site_name', SITE_NAME);
  setMetaByProp('og:title', meta.title);
  setMetaByProp('og:description', meta.description);
  setMetaByProp('og:url', meta.canonicalUrl);
  setMetaByProp('og:image', img);
  setMetaByProp('og:image:alt', imgAlt);

  if (meta.publishedTime) setMetaByProp('article:published_time', meta.publishedTime);
  if (meta.modifiedTime) setMetaByProp('article:modified_time', meta.modifiedTime);
  if (meta.section) setMetaByProp('article:section', meta.section);
  if (meta.authorName && meta.ogType === 'article') setMetaByProp('article:author', meta.authorName);

  // Twitter Cards
  setMetaByName('twitter:card', 'summary_large_image');
  setMetaByName('twitter:title', meta.title);
  setMetaByName('twitter:description', meta.description);
  setMetaByName('twitter:image', img);

  // Canonical Link
  const canonicalTag = `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`;
  if (/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i.test(html)) {
    html = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i, canonicalTag);
  } else {
    html = html.replace('</head>', `    ${canonicalTag}\n  </head>`);
  }

  // Optional LCP Image Preload
  const preloadTag = meta.preloadImage
    ? `    <link rel="preload" as="image" href="${escapeHtml(toAbsoluteUrl(meta.preloadImage))}" fetchpriority="high" />\n`
    : '';

  // Structured Data JSON-LD + Hydration Data
  const headInjection = `${preloadTag}    <script type="application/ld+json" id="iamquickagent-ssr-schema">${safeJsonForScript(
    jsonLdGraph
  )}</script>\n${inlineScripts}`;

  html = html.replace('</head>', `${headInjection}\n  </head>`);
  return html;
}

function renderSsrHeader(): string {
  return `
      <header class="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <a href="/" class="flex items-center gap-2">
            <span class="font-serif font-extrabold text-xl sm:text-2xl tracking-tight text-slate-950">Iam<span class="text-red-700">news</span>agent</span>
          </a>
          <nav aria-label="Primary Navigation" class="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-700">
            <a href="/" class="hover:text-red-700">All News</a>
            <a href="/?category=India" class="hover:text-red-700">India</a>
            <a href="/?category=World" class="hover:text-red-700">World</a>
            <a href="/?category=Business" class="hover:text-red-700">Business</a>
            <a href="/?category=Technology" class="hover:text-red-700">Technology</a>
            <a href="/?category=Markets" class="hover:text-red-700">Markets</a>
            <a href="/?category=Explainers" class="hover:text-red-700">Explainers</a>
          </nav>
        </div>
      </header>`;
}

function renderSsrFooter(): string {
  return `
      <footer class="border-t border-slate-200 bg-slate-900 text-slate-300 mt-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>&copy; 2026 iamquickagent.com. All rights reserved.</span>
          <nav aria-label="Compliance Links" class="flex flex-wrap items-center gap-4">
            <a href="/privacy-policy" class="hover:text-white">Privacy Policy</a>
            <a href="/terms-of-service" class="hover:text-white">Terms of Service</a>
            <a href="/cookie-policy" class="hover:text-white">Cookie Policy</a>
            <a href="/editorial-standards" class="hover:text-white">Editorial Standards</a>
            <a href="/ai.txt" class="hover:text-white">AI Policy (ai.txt)</a>
            <a href="/sitemap.xml" class="hover:text-white">Sitemap</a>
          </nav>
        </div>
      </footer>`;
}

function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  const blocks = markdown.split('\n\n');
  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';

      if (trimmed.startsWith('![') && trimmed.includes('](')) {
        const m = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
        if (m) {
          return `<figure class="my-6">
            <div class="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
              <img src="${escapeHtml(toAbsoluteUrl(m[2]))}" alt="${escapeHtml(m[1])}" width="1200" height="675" style="aspect-ratio:16/9;width:100%;height:100%;object-fit:cover;" loading="lazy" decoding="async" />
            </div>
            ${m[1] ? `<figcaption class="text-xs text-slate-600 italic mt-1.5 px-1">${escapeHtml(m[1])}</figcaption>` : ''}
          </figure>`;
        }
      }

      if (trimmed.startsWith('## ')) {
        return `<h2 class="text-2xl sm:text-3xl font-serif font-bold text-slate-950 mt-8 mb-4 border-b border-slate-200 pb-2">${escapeHtml(trimmed.substring(3))}</h2>`;
      }

      if (trimmed.startsWith('### ')) {
        return `<h3 class="text-xl sm:text-2xl font-serif font-bold text-slate-950 mt-6 mb-3">${escapeHtml(trimmed.substring(4))}</h3>`;
      }

      if (trimmed.startsWith('> ')) {
        return `<blockquote class="p-4 my-6 rounded-r-xl border-l-4 border-red-600 bg-red-50/50 text-slate-900 italic font-serif text-lg leading-relaxed">${escapeHtml(trimmed.substring(2))}</blockquote>`;
      }

      if (trimmed.startsWith('1. ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').filter(Boolean);
        return `<ul class="space-y-2 my-4 list-disc list-inside text-slate-800">${items
          .map((it) => `<li>${escapeHtml(it.replace(/^(?:\d+\.|-|\*)\s+/, ''))}</li>`)
          .join('')}</ul>`;
      }

      return `<p class="text-slate-800 text-base sm:text-lg leading-relaxed font-sans">${escapeHtml(trimmed)}</p>`;
    })
    .join('\n');
}

// ============================================================================
// 1. SSR RENDERER: DYNAMIC NEWS ARTICLE (/news/:slug)
// ============================================================================

export function renderArticleSsrHtml(
  article: Article,
  templateHtml: string,
  authors: Author[] = SEED_AUTHORS,
  allArticles: Article[] = []
): string {
  const canonicalUrl = `${SITE_URL}/news/${encodeURIComponent(article.slug)}`;
  const pageTitle = buildArticleTitle(article);
  const desc = buildArticleDescription(article);
  const featuredImg = toAbsoluteUrl(article.featuredImage, article.category);
  const renderImg = toRenderableImgSrc(article.featuredImage, article.category);
  const author = authors.find((a) => a.id === article.authorId) || SEED_AUTHORS.find((a) => a.id === article.authorId);
  const authorName = author ? author.name : 'iamquickagent Newsroom Desk';
  const authorUrl = author ? `${SITE_URL}/author/${encodeURIComponent(author.id)}` : `${SITE_URL}/editorial-standards`;
  const publishedIso = safeIsoDate(article.publishedAt);
  const modifiedIso = safeIsoDate(article.updatedAt || article.publishedAt);

  const graphNodes: Record<string, any>[] = [
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: pageTitle,
      description: desc,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: featuredImg,
        width: 1200,
        height: 675,
      },
      datePublished: publishedIso,
      dateModified: modifiedIso,
      inLanguage: 'en-US',
    },
    {
      '@type': 'Person',
      '@id': `${authorUrl}#person`,
      name: authorName,
      jobTitle: author ? author.role : 'Staff Correspondent',
      url: authorUrl,
      ...(author?.bio ? { description: author.bio } : {}),
      ...(author?.avatar ? { image: toAbsoluteUrl(author.avatar) } : {}),
      ...(author?.twitter ? { sameAs: [`https://twitter.com/${author.twitter.replace('@', '')}`] } : {}),
      worksFor: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'NewsArticle',
      '@id': `${canonicalUrl}#article`,
      mainEntityOfPage: { '@id': `${canonicalUrl}#webpage` },
      isPartOf: { '@id': `${SITE_URL}/#website` },
      headline: article.headline,
      alternativeHeadline: article.deck || article.keyTakeaways?.[0] || article.headline,
      description: desc,
      image: [
        {
          '@type': 'ImageObject',
          url: featuredImg,
          width: 1200,
          height: 675,
        },
      ],
      datePublished: publishedIso,
      dateModified: modifiedIso,
      articleSection: article.category,
      keywords: (article.tags || []).join(', ') || article.category,
      wordCount: article.content ? article.content.split(/\s+/).filter(Boolean).length : 450,
      author: { '@id': `${authorUrl}#person` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-US',
      isAccessibleForFree: true,
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['[data-aeo-summary="true"]', 'h1', '.deck-summary'],
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: article.category,
          item: `${SITE_URL}/?category=${encodeURIComponent(article.category)}`,
        },
        { '@type': 'ListItem', position: 3, name: article.headline, item: canonicalUrl },
      ],
    },
  ];

  if (article.faq && article.faq.length > 0) {
    graphNodes.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      mainEntity: article.faq.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    });
  }

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': graphNodes,
  };

  // Keep hydration JSON lightweight (<80KB) by omitting huge base64 strings from secondary sidebar articles
  const initialFeed = allArticles
    .filter((a) => (a.status || 'published') === 'published')
    .slice(0, 16)
    .map((a) => ({
      ...a,
      featuredImage:
        a.id === article.id
          ? a.featuredImage
          : (a.featuredImage || '').startsWith('data:')
            ? getCategoryFallbackImage(a.category)
            : a.featuredImage,
      content: a.id === article.id ? a.content : (a.content || '').slice(0, 300),
    }));

  const inlineScripts = `    <script>window.__INITIAL_ARTICLE__=${safeJsonForScript(
    article
  )};window.__INITIAL_ARTICLES__=${safeJsonForScript(initialFeed)};window.__INITIAL_AUTHORS__=${safeJsonForScript(
    authors.slice(0, 20)
  )};</script>`;

  let html = applyHeadMeta(
    templateHtml,
    {
      title: pageTitle,
      description: desc,
      canonicalUrl,
      ogType: 'article',
      imageUrl: featuredImg,
      imageAlt: article.headline,
      keywords: (article.tags || []).join(', ') || article.category,
      authorName,
      publishedTime: publishedIso,
      modifiedTime: modifiedIso,
      section: article.category,
      preloadImage: featuredImg,
    },
    jsonLdGraph,
    inlineScripts
  );

  const renderedBody = renderMarkdownToHtml(article.content || '');
  const takeawaysList = (article.keyTakeaways || [])
    .map(
      (t) =>
        `<li class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0"></span><span>${escapeHtml(
          t
        )}</span></li>`
    )
    .join('');

  const relatedLinks = allArticles
    .filter((a) => a.id !== article.id && (a.status || 'published') === 'published')
    .slice(0, 6)
    .map(
      (rel) =>
        `<li><a href="/news/${encodeURIComponent(rel.slug)}" class="text-slate-900 hover:text-red-700 font-serif font-semibold">${escapeHtml(
          rel.headline
        )}</a> <span class="text-xs text-slate-500">(${escapeHtml(rel.category)})</span></li>`
    )
    .join('');

  const preRenderedHtml = `
    <div id="ssr-root-container" class="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      ${renderSsrHeader()}
      <main id="main-content" class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
        <article itemscope itemtype="https://schema.org/NewsArticle" class="space-y-6">
          <div class="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider flex-wrap">
            <a href="/?category=${encodeURIComponent(article.category)}" class="px-2.5 py-1 rounded bg-red-700 text-white font-bold">${escapeHtml(
              article.category
            )}</a>
            <span>&bull;</span>
            <time itemprop="datePublished" datetime="${publishedIso}">${new Date(publishedIso).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}</time>
            <span>&bull;</span>
            <span>${article.readTimeMinutes || 4} min read</span>
          </div>

          <h1 itemprop="headline" class="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-950 leading-[1.16]">
            ${escapeHtml(article.headline)}
          </h1>

          ${
            article.deck
              ? `<p itemprop="description" class="deck-summary text-lg sm:text-xl text-slate-700 font-serif leading-relaxed">${escapeHtml(
                  article.deck
                )}</p>`
              : ''
          }

          <div class="flex items-center gap-3 py-3 border-y border-slate-200 text-xs text-slate-700">
            <a href="/author/${encodeURIComponent(article.authorId)}" class="font-bold text-slate-950 hover:text-red-700">${escapeHtml(
              authorName
            )}</a>
            <span>&bull;</span>
            <span>${escapeHtml(article.sourceName || 'iamquickagent Editorial Bureau')}</span>
          </div>

          ${
            article.keyTakeaways && article.keyTakeaways.length > 0
              ? `<section class="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-slate-900 space-y-2.5" data-aeo-summary="true">
                  <h2 class="text-xs font-bold text-amber-900 uppercase tracking-wider">Key Takeaway Summary</h2>
                  <ul class="space-y-2 text-sm text-slate-800 leading-relaxed">${takeawaysList}</ul>
                </section>`
              : ''
          }

          <figure class="space-y-2">
            <div class="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200" style="aspect-ratio:16/9;width:100%;">
              <img src="${escapeHtml(renderImg)}" alt="${escapeHtml(article.headline)}" width="1200" height="675" fetchpriority="high" loading="eager" style="aspect-ratio:16/9;width:100%;height:100%;object-fit:cover;" />
            </div>
            ${
              article.imageCaption
                ? `<figcaption class="text-xs text-slate-600 italic px-1">${escapeHtml(article.imageCaption)}</figcaption>`
                : ''
            }
          </figure>

          <div itemprop="articleBody" class="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans text-base sm:text-lg space-y-4 pt-2">
            ${renderedBody}
          </div>
        </article>

        ${
          relatedLinks
            ? `<section class="mt-10 pt-8 border-t border-slate-200 space-y-3" aria-label="More Latest News">
                <h2 class="text-xl font-serif font-bold text-slate-950">More Latest News</h2>
                <ul class="space-y-2 text-sm">${relatedLinks}</ul>
              </section>`
            : ''
        }
      </main>
      ${renderSsrFooter()}
    </div>`;

  html = html.replace('<div id="root"></div>', `<div id="root">${preRenderedHtml}</div>`);
  return html;
}

// ============================================================================
// 2. SSR RENDERER: HOMEPAGE & CATEGORY VIEW (/, /?category=...)
// ============================================================================

export function renderHomeSsrHtml(
  articles: Article[],
  templateHtml: string,
  activeCategory?: string,
  authors: Author[] = SEED_AUTHORS
): string {
  const published = articles.filter((a) => (a.status || 'published') === 'published');
  const cleanCategory = activeCategory && activeCategory !== 'all' ? activeCategory.trim() : '';
  const filtered = cleanCategory
    ? published.filter((a) => (a.category || '').toLowerCase() === cleanCategory.toLowerCase())
    : published;

  const displayList = filtered.length > 0 ? filtered : published;
  const hero = displayList[0];
  const canonicalUrl = cleanCategory
    ? `${SITE_URL}/?category=${encodeURIComponent(cleanCategory)}`
    : `${SITE_URL}/`;

  const pageTitle = cleanCategory
    ? `${cleanCategory} News, Breaking Headlines & Live Updates | ${SITE_NAME}`
    : `${SITE_NAME} - Latest Breaking News, Live Updates & Global Headlines`;

  const desc = cleanCategory
    ? `Latest ${cleanCategory} breaking news, real-time headlines, executive takeaways, and in-depth reporting from ${SITE_NAME}.`
    : 'Live breaking news, real-time headlines, and in-depth reporting across India, World, Business, Tech, Markets, Sports, and Politics with executive takeaways.';

  const heroImage = hero ? toAbsoluteUrl(hero.featuredImage, hero.category) : DEFAULT_OG_IMAGE;

  const graphNodes: Record<string, any>[] = [
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    cleanCategory
      ? {
          '@type': 'CollectionPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: pageTitle,
          description: desc,
          isPartOf: { '@id': `${SITE_URL}/#website` },
          about: { '@type': 'Thing', name: cleanCategory },
          numberOfItems: displayList.length,
          inLanguage: 'en-US',
        }
      : {
          '@type': 'WebPage',
          '@id': `${SITE_URL}/#webpage`,
          url: `${SITE_URL}/`,
          name: pageTitle,
          description: desc,
          isPartOf: { '@id': `${SITE_URL}/#website` },
          inLanguage: 'en-US',
        },
    {
      '@type': 'ItemList',
      '@id': `${canonicalUrl}#top-stories`,
      name: cleanCategory ? `${cleanCategory} Top Stories` : 'Top Breaking News Headlines',
      itemListElement: displayList.slice(0, 15).map((a, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_URL}/news/${encodeURIComponent(a.slug)}`,
        name: a.headline,
      })),
    },
  ];

  if (cleanCategory) {
    graphNodes.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: cleanCategory, item: canonicalUrl },
      ],
    });
  }

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': graphNodes,
  };

  // Inject compact lightweight initial articles (strip 200KB base64 images from SSR JSON to keep mobile payload tiny!)
  const compactArticles = published.slice(0, 30).map((a) => ({
    ...a,
    featuredImage: (a.featuredImage || '').startsWith('data:')
      ? getCategoryFallbackImage(a.category)
      : a.featuredImage,
    content: (a.content || '').slice(0, 350),
  }));

  const inlineScripts = `    <script>window.__INITIAL_ARTICLES__=${safeJsonForScript(
    compactArticles
  )};window.__INITIAL_AUTHORS__=${safeJsonForScript(authors.slice(0, 20))};</script>`;

  let html = applyHeadMeta(
    templateHtml,
    {
      title: pageTitle,
      description: desc,
      canonicalUrl,
      ogType: 'website',
      imageUrl: heroImage,
      imageAlt: hero ? hero.headline : `${SITE_NAME} Breaking News`,
      preloadImage: heroImage,
    },
    jsonLdGraph,
    inlineScripts
  );

  const topNews = displayList.slice(0, 20);
  const headlineList = topNews
    .map(
      (a) => `
      <li class="py-3 border-b border-slate-100 flex items-start gap-3">
        <span class="text-xs font-bold text-red-700 uppercase shrink-0 mt-0.5">${escapeHtml(a.category)}</span>
        <div class="min-w-0">
          <a href="/news/${encodeURIComponent(a.slug)}" class="text-slate-950 hover:text-red-700 font-serif font-bold text-base sm:text-lg leading-snug block">
            ${escapeHtml(a.headline)}
          </a>
          ${a.deck ? `<p class="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">${escapeHtml(a.deck)}</p>` : ''}
        </div>
      </li>`
    )
    .join('');

  const preRenderedHome = `
    <div id="ssr-home-container" class="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      ${renderSsrHeader()}
      <main id="main-content" class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        <div class="mb-6 pb-3 border-b border-slate-200 flex items-center justify-between gap-4">
          <h1 class="text-2xl sm:text-3xl font-serif font-bold text-slate-950">
            ${cleanCategory ? `${escapeHtml(cleanCategory)} News &amp; Headlines` : 'Breaking News &amp; Live Wire Dispatches'}
          </h1>
          <span class="text-xs text-slate-600 font-mono shrink-0">Updated real-time</span>
        </div>

        ${
          hero
            ? `<section class="mb-8 rounded-2xl border border-slate-200 overflow-hidden bg-white" aria-label="Lead Story">
                <div class="aspect-video w-full bg-slate-900 overflow-hidden" style="aspect-ratio:16/9;">
                  <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(hero.headline)}" width="1200" height="675" fetchpriority="high" loading="eager" style="width:100%;height:100%;object-fit:cover;" />
                </div>
                <div class="p-5 sm:p-6 space-y-2">
                  <span class="text-xs font-bold text-red-700 uppercase">${escapeHtml(hero.category)}</span>
                  <h2 class="text-2xl sm:text-3xl font-serif font-bold text-slate-950">
                    <a href="/news/${encodeURIComponent(hero.slug)}" class="hover:text-red-700">${escapeHtml(hero.headline)}</a>
                  </h2>
                  ${hero.deck ? `<p class="text-sm sm:text-base text-slate-700">${escapeHtml(hero.deck)}</p>` : ''}
                </div>
              </section>`
            : ''
        }

        <section aria-label="Latest News Dispatches">
          <h2 class="text-xl font-serif font-bold text-slate-950 mb-3">Latest Dispatches</h2>
          <ul class="space-y-1">${headlineList}</ul>
        </section>
      </main>
      ${renderSsrFooter()}
    </div>`;

  html = html.replace('<div id="root"></div>', `<div id="root">${preRenderedHome}</div>`);
  return html;
}

// ============================================================================
// 3. SSR RENDERER: AUTHOR PROFILE (/author/:id)
// ============================================================================

export function renderAuthorSsrHtml(
  author: Author,
  allArticles: Article[],
  templateHtml: string
): string {
  const canonicalUrl = `${SITE_URL}/author/${encodeURIComponent(author.id)}`;
  const pageTitle = `${author.name} - ${author.role} | ${SITE_NAME}`;
  const desc = buildMetaDescription(
    [`${author.name} (${author.role}) at ${SITE_NAME}. ${author.bio || ''}`],
    `Read verified news dispatches and analysis by ${author.name} on ${SITE_NAME}.`
  );
  const avatarUrl = toAbsoluteUrl(author.avatar);
  const authorArticles = allArticles.filter(
    (a) => a.authorId === author.id && (a.status || 'published') === 'published'
  );

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      {
        '@type': 'ProfilePage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: pageTitle,
        description: desc,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': `${canonicalUrl}#person` },
        inLanguage: 'en-US',
      },
      {
        '@type': 'Person',
        '@id': `${canonicalUrl}#person`,
        name: author.name,
        jobTitle: author.role,
        description: author.bio,
        image: avatarUrl,
        url: canonicalUrl,
        ...(author.twitter ? { sameAs: [`https://twitter.com/${author.twitter.replace('@', '')}`] } : {}),
        worksFor: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: author.name, item: canonicalUrl },
        ],
      },
    ],
  };

  const inlineScripts = `    <script>window.__INITIAL_ARTICLES__=${safeJsonForScript(
    allArticles.slice(0, 25).map((a) => ({
      ...a,
      featuredImage: (a.featuredImage || '').startsWith('data:')
        ? getCategoryFallbackImage(a.category)
        : a.featuredImage,
      content: (a.content || '').slice(0, 300),
    }))
  )};</script>`;

  let html = applyHeadMeta(
    templateHtml,
    {
      title: pageTitle,
      description: desc,
      canonicalUrl,
      ogType: 'profile',
      imageUrl: avatarUrl,
      imageAlt: author.name,
      authorName: author.name,
    },
    jsonLdGraph,
    inlineScripts
  );

  const listHtml = authorArticles
    .slice(0, 20)
    .map(
      (a) =>
        `<li class="py-2.5 border-b border-slate-100"><a href="/news/${encodeURIComponent(
          a.slug
        )}" class="font-serif font-bold text-slate-950 hover:text-red-700">${escapeHtml(
          a.headline
        )}</a> <span class="text-xs text-slate-500 ml-2">${escapeHtml(a.category)}</span></li>`
    )
    .join('');

  const preRendered = `
    <div class="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      ${renderSsrHeader()}
      <main id="main-content" class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <div class="flex items-center gap-4 pb-6 border-b border-slate-200">
          <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(author.name)}" width="96" height="96" class="w-24 h-24 rounded-2xl object-cover border border-slate-200" />
          <div>
            <h1 class="text-2xl sm:text-3xl font-serif font-bold text-slate-950">${escapeHtml(author.name)}</h1>
            <p class="text-sm font-semibold text-red-700">${escapeHtml(author.role)}</p>
            <p class="text-sm text-slate-700 mt-1">${escapeHtml(author.bio)}</p>
          </div>
        </div>
        <section>
          <h2 class="text-xl font-serif font-bold text-slate-950 mb-3">Published Reports (${authorArticles.length})</h2>
          <ul>${listHtml}</ul>
        </section>
      </main>
      ${renderSsrFooter()}
    </div>`;

  html = html.replace('<div id="root"></div>', `<div id="root">${preRendered}</div>`);
  return html;
}

// ============================================================================
// 4. SSR RENDERER: LEGAL & COMPLIANCE PAGES (/privacy-policy, etc.)
// ============================================================================

export function renderLegalSsrHtml(page: LegalPageData, templateHtml: string): string {
  const canonicalUrl = `${SITE_URL}${page.path}`;

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: page.metaTitle,
        description: page.description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        dateModified: page.lastUpdated,
        inLanguage: 'en-US',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: page.title, item: canonicalUrl },
        ],
      },
    ],
  };

  let html = applyHeadMeta(
    templateHtml,
    {
      title: page.metaTitle,
      description: page.description,
      canonicalUrl,
      ogType: 'website',
      imageUrl: DEFAULT_OG_IMAGE,
      imageAlt: page.title,
    },
    jsonLdGraph,
    ''
  );

  const sectionsHtml = page.sections
    .map(
      (sec) => `
      <section class="space-y-3">
        <h2 class="text-xl font-serif font-bold text-slate-950">${escapeHtml(sec.heading)}</h2>
        ${sec.paragraphs.map((p) => `<p class="text-slate-700 leading-relaxed">${escapeHtml(p)}</p>`).join('')}
        ${
          sec.bullets
            ? `<ul class="list-disc pl-5 space-y-1.5 text-slate-700">${sec.bullets
                .map((b) => `<li>${escapeHtml(b)}</li>`)
                .join('')}</ul>`
            : ''
        }
      </section>`
    )
    .join('');

  const preRendered = `
    <div class="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      ${renderSsrHeader()}
      <main id="main-content" class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <article class="space-y-6">
          <header class="space-y-3 pb-6 border-b border-slate-200">
            <span class="text-xs font-bold uppercase tracking-wider text-red-700">${escapeHtml(page.eyebrow)}</span>
            <h1 class="text-3xl sm:text-4xl font-serif font-bold text-slate-950">${escapeHtml(page.title)}</h1>
            <p class="text-xs text-slate-600">Effective: ${escapeHtml(page.effectiveDate)} &bull; Last Updated: ${escapeHtml(
              page.lastUpdated
            )}</p>
            <p class="text-base text-slate-700 leading-relaxed">${escapeHtml(page.intro)}</p>
          </header>
          <div class="space-y-8">${sectionsHtml}</div>
        </article>
      </main>
      ${renderSsrFooter()}
    </div>`;

  html = html.replace('<div id="root"></div>', `<div id="root">${preRendered}</div>`);
  return html;
}

// ============================================================================
// 5. XML SITEMAP, GOOGLE NEWS SITEMAP, RSS, ROBOTS.TXT, LLMS.TXT, AI.TXT
// ============================================================================

export function generateSitemapXml(articles: Article[], authors: Author[] = SEED_AUTHORS): string {
  const categories = [
    'India',
    'World',
    'Business',
    'Technology',
    'Markets',
    'Science',
    'Health',
    'Sports',
    'Lifestyle',
    'Entertainment',
    'Explainers',
    'Opinion',
  ];

  const nowIso = new Date().toISOString();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // 1. Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${SITE_URL}/</loc>\n`;
  xml += `    <lastmod>${nowIso}</lastmod>\n`;
  xml += `    <changefreq>always</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // 2. Categories
  for (const cat of categories) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/?category=${encodeURIComponent(cat)}</loc>\n`;
    xml += `    <lastmod>${nowIso}</lastmod>\n`;
    xml += `    <changefreq>hourly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  // 3. Compliance & Legal Pages
  for (const legal of LEGAL_PAGE_LIST) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}${legal.path}</loc>\n`;
    xml += `    <lastmod>${legal.lastUpdated}T00:00:00.000Z</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.5</priority>\n`;
    xml += `  </url>\n`;
  }

  // 4. Authors
  const seenAuthorIds = new Set<string>();
  for (const author of authors) {
    if (!author?.id || seenAuthorIds.has(author.id)) continue;
    seenAuthorIds.add(author.id);
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/author/${encodeURIComponent(author.id)}</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  }

  // 5. All Published Articles (Live Firestore + Seeds) under canonical /news/:slug
  const seenSlugs = new Set<string>();
  const publishedArticles = articles.filter((a) => (a.status || 'published') === 'published' && a.slug);
  for (const article of publishedArticles) {
    if (seenSlugs.has(article.slug)) continue;
    seenSlugs.add(article.slug);

    const lastMod = safeIsoDate(article.updatedAt || article.publishedAt);
    const imgLoc = toSitemapImageUrl(article.featuredImage, article.category);

    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/news/${encodeURIComponent(article.slug)}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${article.isBreaking ? '0.95' : '0.85'}</priority>\n`;
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${escapeXml(imgLoc)}</image:loc>\n`;
    xml += `      <image:title>${escapeXml(article.headline)}</image:title>\n`;
    if (article.deck) {
      xml += `      <image:caption>${escapeXml(article.deck)}</image:caption>\n`;
    }
    xml += `    </image:image>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

export function generateNewsSitemapXml(articles: Article[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  const seenSlugs = new Set<string>();
  const published = articles
    .filter((a) => (a.status || 'published') === 'published' && a.slug)
    .slice(0, 150);

  for (const article of published) {
    if (seenSlugs.has(article.slug)) continue;
    seenSlugs.add(article.slug);

    const pubDate = safeIsoDate(article.publishedAt);
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/news/${encodeURIComponent(article.slug)}</loc>\n`;
    xml += `    <news:news>\n`;
    xml += `      <news:publication>\n`;
    xml += `        <news:name>${SITE_NAME}</news:name>\n`;
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

export function generateRssXml(articles: Article[], authors: Author[] = SEED_AUTHORS): string {
  const now = new Date().toUTCString();
  const published = articles
    .filter((a) => (a.status || 'published') === 'published' && a.slug)
    .slice(0, 50);

  let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">\n`;
  rss += `  <channel>\n`;
  rss += `    <title>${SITE_NAME} - Breaking News, Live Updates &amp; Global Headlines</title>\n`;
  rss += `    <link>${SITE_URL}/</link>\n`;
  rss += `    <description>Real-time digital breaking news and intelligence reporting across India, World, Business, Markets, Technology, Science, Politics, and Sports.</description>\n`;
  rss += `    <language>en-US</language>\n`;
  rss += `    <lastBuildDate>${now}</lastBuildDate>\n`;
  rss += `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>\n`;

  for (const article of published) {
    const pubDate = new Date(safeIsoDate(article.publishedAt)).toUTCString();
    const articleUrl = `${SITE_URL}/news/${encodeURIComponent(article.slug)}`;
    const authorObj = authors.find((a) => a.id === article.authorId);
    const authorName = authorObj ? authorObj.name : 'iamquickagent Newsroom Desk';
    const imgUrl = toSitemapImageUrl(article.featuredImage, article.category);

    rss += `    <item>\n`;
    rss += `      <title>${escapeXml(article.headline)}</title>\n`;
    rss += `      <link>${articleUrl}</link>\n`;
    rss += `      <guid isPermaLink="true">${articleUrl}</guid>\n`;
    rss += `      <pubDate>${pubDate}</pubDate>\n`;
    rss += `      <dc:creator>${escapeXml(authorName)}</dc:creator>\n`;
    rss += `      <category>${escapeXml(article.category)}</category>\n`;
    rss += `      <description>${escapeXml(buildArticleDescription(article))}</description>\n`;
    rss += `      <enclosure url="${escapeXml(imgUrl)}" type="image/jpeg" length="102400" />\n`;
    rss += `    </item>\n`;
  }

  rss += `  </channel>\n`;
  rss += `</rss>`;
  return rss;
}

export function generateLlmsTxt(articles: Article[], fullMode: boolean = false): string {
  const published = articles
    .filter((a) => (a.status || 'published') === 'published' && a.slug)
    .slice(0, fullMode ? 100 : 35);

  let doc = `# ${SITE_NAME}\n\n`;
  doc += `> Real-time digital breaking news publication delivering verified India, World, Business, Markets, Technology, Science, Sports, and Explainer coverage with structured executive takeaways.\n\n`;
  doc += `## Core Identity & Policies\n`;
  doc += `- Canonical Website: ${SITE_URL}/\n`;
  doc += `- AI Policy: ${SITE_URL}/ai.txt\n`;
  doc += `- XML Sitemap: ${SITE_URL}/sitemap.xml\n`;
  doc += `- Google News Sitemap: ${SITE_URL}/news-sitemap.xml\n`;
  doc += `- RSS Feed: ${SITE_URL}/rss.xml\n`;
  doc += `- Privacy Policy: ${SITE_URL}/privacy-policy\n`;
  doc += `- Terms of Service: ${SITE_URL}/terms-of-service\n`;
  doc += `- Cookie Policy: ${SITE_URL}/cookie-policy\n`;
  doc += `- Editorial Standards: ${SITE_URL}/editorial-standards\n`;
  doc += `- Publisher: iamquickagent.com Newsroom\n\n`;
  doc += `## Latest Published News\n\n`;

  for (const article of published) {
    doc += `### [${article.headline}](${SITE_URL}/news/${encodeURIComponent(article.slug)})\n`;
    doc += `- Category: ${article.category}\n`;
    doc += `- Published: ${safeIsoDate(article.publishedAt)}\n`;
    doc += `- Summary: ${buildArticleDescription(article)}\n`;
    if (article.keyTakeaways && article.keyTakeaways.length > 0) {
      doc += `- Key Takeaways:\n`;
      for (const pt of article.keyTakeaways) {
        doc += `  * ${pt}\n`;
      }
    }
    doc += `\n`;
  }

  return doc;
}

export function generateRobotsTxt(): string {
  return `# robots.txt for ${SITE_URL}
User-agent: *
Allow: /
Disallow: /cms
Disallow: /api/

# AI Search & Answer Engine Crawlers (permitted with attribution per /ai.txt)
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

User-agent: OAI-SearchBot
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

# Canonical Sitemaps & AI Directives
Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/news-sitemap.xml
`;
}

export function generateAiTxt(): string {
  return `# ai.txt - AI Crawler, Citation & Content Usage Policy for iamquickagent.com
# Specification: https://site.spawning.ai/spawning-ai-txt

Site: ${SITE_URL}
Publisher: iamquickagent.com Newsroom
Contact: SUKLA.NARAYAN007@gmail.com
Last-Updated: 2026-11-20

# Directives for AI Search, Answer Engines, and Large Language Models
User-Agent: *
Allow: /
Allow: /news/
Allow: /author/
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /rss.xml
Disallow: /cms
Disallow: /api/

# Attribution & Citation Requirements
Attribution-Required: yes
Canonical-Domain: ${SITE_URL}
Citation-Format: "iamquickagent.com (<canonical-url>)"

# Structured Feeds & Machine-Readable Endpoints
Sitemap: ${SITE_URL}/sitemap.xml
News-Sitemap: ${SITE_URL}/news-sitemap.xml
LLMs-Index: ${SITE_URL}/llms.txt
RSS-Feed: ${SITE_URL}/rss.xml

# Legal & Compliance Policies
Privacy-Policy: ${SITE_URL}/privacy-policy
Terms-of-Service: ${SITE_URL}/terms-of-service
Cookie-Policy: ${SITE_URL}/cookie-policy
Editorial-Standards: ${SITE_URL}/editorial-standards
`;
}
