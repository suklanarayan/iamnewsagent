import type { Article, Author } from '../types';

const NEWS_SCHEMA_ID = 'iamquickagent-news-schema';
const BREADCRUMB_SCHEMA_ID = 'iamquickagent-breadcrumb-schema';
const WEBSITE_SCHEMA_ID = 'iamquickagent-website-schema';
const KNOWLEDGE_GRAPH_SCHEMA_ID = 'iamquickagent-knowledge-graph-schema';
const CATEGORY_SCHEMA_ID = 'iamquickagent-category-schema';

const DEFAULT_BASE_URL = 'https://iamquickagent.com';

// Organization Knowledge Graph Schema (Unified Entity Reference)
const KNOWLEDGE_GRAPH_ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  '@id': `${DEFAULT_BASE_URL}/#organization`,
  'name': 'iamquickagent.com',
  'alternateName': ['iamquickagent', 'iamnewsagent', 'iamnewsagent.com'],
  'url': DEFAULT_BASE_URL,
  'logo': {
    '@type': 'ImageObject',
    '@id': `${DEFAULT_BASE_URL}/#logo`,
    'url': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&h=120&q=85',
    'caption': 'iamquickagent.com Logo',
    'width': 600,
    'height': 120,
  },
  'image': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=85',
  'sameAs': [
    'https://twitter.com/iamquickagent',
    'https://facebook.com/iamquickagent',
    'https://linkedin.com/company/iamquickagent',
    'https://youtube.com/@iamquickagent',
  ],
  'description': 'Real-time digital breaking news and multimedia publishing network delivering live coverage across India, World, Business, Markets, Technology, Politics, Sports, and in-depth explainers.',
  'foundingDate': '2024-03-01',
  'founder': {
    '@type': 'Person',
    'name': 'Narayan Shukla',
    'jobTitle': 'Editor-in-Chief & Founder',
    'url': `${DEFAULT_BASE_URL}/author/author-narayan-shukla`,
  },
  'knowsAbout': [
    'Breaking News',
    'India & Global Politics',
    'World Affairs',
    'Financial Markets',
    'Artificial Intelligence & Technology',
    'Economy & Business',
    'Science & Space',
    'Culture & Sports',
  ],
  'publishingPrinciples': `${DEFAULT_BASE_URL}/editorial-standards`,
  'ethicsPolicy': `${DEFAULT_BASE_URL}/editorial-standards#ethics`,
  'correctionsPolicy': `${DEFAULT_BASE_URL}/editorial-standards#corrections`,
  'diversityPolicy': `${DEFAULT_BASE_URL}/editorial-standards#diversity`,
  'masthead': `${DEFAULT_BASE_URL}/editorial-standards#team`,
  'contactPoint': {
    '@type': 'ContactPoint',
    'contactType': 'Newsroom Editorial Desk',
    'email': 'SUKLA.NARAYAN007@gmail.com',
    'availableLanguage': ['English', 'Hindi'],
  },
};

/**
 * Injects complete NewsArticle and Breadcrumb Schema for an article view,
 * optimized for Google News, Google Search, and AI Overviews (AEO).
 */
export function injectArticleSchema(article: Article, author: Author | null, currentUrl: string): void {
  removeArticleSchema();

  const canonicalUrl = currentUrl.startsWith('http') ? currentUrl : `${DEFAULT_BASE_URL}${currentUrl}`;
  const wordCount = article.content ? article.content.split(/\s+/).filter(Boolean).length : 500;
  const publishedDate = article.publishedAt || new Date().toISOString();
  const modifiedDate = article.updatedAt || publishedDate;

  // 1. NewsArticle Schema with AEO Speakable Specification
  const newsArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${canonicalUrl}#article`,
    'isPartOf': {
      '@type': 'WebSite',
      '@id': `${DEFAULT_BASE_URL}/#website`,
      'name': 'iamquickagent.com',
      'url': DEFAULT_BASE_URL,
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    'headline': article.headline,
    'alternativeHeadline': article.deck || article.keyTakeaways?.[0] || article.headline,
    'description': article.deck || article.keyTakeaways?.[0] || '',
    'image': [
      article.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=85',
    ],
    'datePublished': publishedDate,
    'dateModified': modifiedDate,
    'author': [
      {
        '@type': 'Person',
        '@id': author ? `${DEFAULT_BASE_URL}/author/${author.id}` : `${DEFAULT_BASE_URL}/#desk`,
        'name': author ? author.name : 'iamquickagent Intelligence Desk',
        'jobTitle': author ? author.role : 'Staff Intelligence Analyst',
        'url': author ? `${DEFAULT_BASE_URL}/author/${author.id}` : `${DEFAULT_BASE_URL}/editorial`,
        ...(author?.twitter ? { 'sameAs': `https://twitter.com/${author.twitter.replace('@', '')}` } : {}),
      },
    ],
    'publisher': KNOWLEDGE_GRAPH_ORGANIZATION,
    'articleSection': article.category,
    'keywords': article.tags ? article.tags.join(', ') : article.category,
    'wordCount': wordCount,
    'abstract': article.keyTakeaways ? article.keyTakeaways.join(' • ') : article.deck,
    'articleBody': article.content ? article.content.replace(/[#*`_]/g, '') : '',
    'inLanguage': 'en-US',
    'isAccessibleForFree': 'True',
    // AI Overview / Answer Engine Optimization (AEO) Speakable Tag
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': [
        '[data-aeo-summary="true"]',
        '[data-aeo-takeaways="true"]',
        'h1',
        '.deck-summary',
      ],
    },
    'about': (article.tags || []).map((tag) => ({
      '@type': 'Thing',
      'name': tag,
    })),
  };

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': `${DEFAULT_BASE_URL}/`,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': article.category,
        'item': `${DEFAULT_BASE_URL}/?category=${encodeURIComponent(article.category)}`,
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': article.headline,
        'item': canonicalUrl,
      },
    ],
  };

  // Inject Schemas into Document Head
  appendJsonLd(NEWS_SCHEMA_ID, newsArticleSchema);
  appendJsonLd(BREADCRUMB_SCHEMA_ID, breadcrumbSchema);

  // 3. Update Document Title and Meta Tags
  document.title = `${article.headline} | iamquickagent.com`;
  updateMeta('description', article.deck || article.keyTakeaways?.[0] || article.headline);
  updateMeta('news_keywords', article.tags ? article.tags.join(', ') : article.category);
  updateMeta('keywords', article.tags ? article.tags.join(', ') : article.category);
  updateMeta('author', author ? author.name : 'iamquickagent.com');

  // OpenGraph Tags
  updateMeta('og:type', 'article');
  updateMeta('og:title', `${article.headline} | iamquickagent.com`);
  updateMeta('og:description', article.deck || article.keyTakeaways?.[0] || article.headline);
  updateMeta('og:image', article.featuredImage);
  updateMeta('og:url', canonicalUrl);
  updateMeta('article:published_time', publishedDate);
  updateMeta('article:modified_time', modifiedDate);
  updateMeta('article:section', article.category);
  if (author) updateMeta('article:author', author.name);
  if (article.tags && article.tags.length > 0) {
    updateMeta('article:tag', article.tags.join(', '));
  }

  // Twitter Tags
  updateMeta('twitter:card', 'summary_large_image');
  updateMeta('twitter:title', article.headline);
  updateMeta('twitter:description', article.deck || article.keyTakeaways?.[0] || article.headline);
  updateMeta('twitter:image', article.featuredImage);

  // Canonical Link
  updateCanonical(canonicalUrl);
}

/**
 * Injects Knowledge Graph and WebSite Schema for Homepage,
 * supporting Google Sitelinks Searchbox and Knowledge Panels.
 */
export function injectHomeSchema(): void {
  removeArticleSchema();

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': `${DEFAULT_BASE_URL}/#website`,
    'url': DEFAULT_BASE_URL,
    'name': 'iamquickagent.com',
    'alternateName': ['iamquickagent', 'iamnewsagent'],
    'description': 'Real-time breaking news portal delivering live headlines, market tracking, political coverage, and in-depth explainers.',
    'publisher': {
      '@id': `${DEFAULT_BASE_URL}/#organization`,
    },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${DEFAULT_BASE_URL}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    'inLanguage': 'en-US',
  };

  appendJsonLd(WEBSITE_SCHEMA_ID, websiteSchema);
  appendJsonLd(KNOWLEDGE_GRAPH_SCHEMA_ID, KNOWLEDGE_GRAPH_ORGANIZATION);

  document.title = 'iamquickagent.com - Latest Breaking News, Live Updates & Global Headlines';
  updateMeta(
    'description',
    'Live breaking news, real-time headlines, and in-depth reporting across India, World, Business, Tech, Markets, Sports, and Politics with executive takeaways.'
  );
  updateMeta('og:type', 'website');
  updateMeta('og:title', 'iamquickagent.com - Latest Breaking News, Live Updates & Global Headlines');
  updateMeta(
    'og:description',
    'Live breaking news, real-time headlines, and in-depth reporting across India, World, Business, Tech, Markets, Sports, and Politics with executive takeaways.'
  );
  updateMeta('og:url', `${DEFAULT_BASE_URL}/`);
  updateCanonical(`${DEFAULT_BASE_URL}/`);
}

/**
 * Injects Category CollectionPage Schema
 */
export function injectCategorySchema(category: string, count: number): void {
  removeArticleSchema();

  const canonicalUrl = `${DEFAULT_BASE_URL}/?category=${encodeURIComponent(category)}`;
  const categorySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${canonicalUrl}#collection`,
    'name': `${category} News & Breaking Headlines | iamquickagent.com`,
    'description': `Latest breaking news, live reporting, and in-depth explainers in ${category}.`,
    'url': canonicalUrl,
    'isPartOf': {
      '@id': `${DEFAULT_BASE_URL}/#website`,
    },
    'about': {
      '@type': 'Thing',
      'name': category,
    },
    'numberOfItems': count,
  };

  appendJsonLd(CATEGORY_SCHEMA_ID, categorySchema);

  document.title = `${category} News & Breaking Headlines | iamquickagent.com`;
  updateMeta('description', `Read latest ${category} breaking news, live updates, and top stories from iamquickagent.com.`);
  updateMeta('og:title', `${category} News & Breaking Headlines | iamquickagent.com`);
  updateMeta('og:description', `Read latest ${category} breaking news, live updates, and top stories.`);
  updateMeta('og:url', canonicalUrl);
  updateCanonical(canonicalUrl);
}

/**
 * Removes temporary schemas when navigating away
 */
export function removeArticleSchema(): void {
  const ids = [NEWS_SCHEMA_ID, BREADCRUMB_SCHEMA_ID, CATEGORY_SCHEMA_ID];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
}

/**
 * Safely appends or updates a JSON-LD script tag in document.head
 */
function appendJsonLd(id: string, schema: object): void {
  let script = document.getElementById(id) as HTMLScriptElement;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(schema, null, 2);
}

/**
 * Updates or creates meta tags (supporting both 'name' and 'property' attributes)
 */
function updateMeta(nameOrProp: string, content: string): void {
  if (!content) return;
  let el = document.querySelector(`meta[name="${nameOrProp}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.querySelector(`meta[property="${nameOrProp}"]`) as HTMLMetaElement;
  }
  if (!el) {
    el = document.createElement('meta');
    if (nameOrProp.startsWith('og:') || nameOrProp.startsWith('article:')) {
      el.setAttribute('property', nameOrProp);
    } else {
      el.setAttribute('name', nameOrProp);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Updates or creates the canonical link tag in document.head
 */
export function updateCanonical(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Generates clean, URL-safe slugs
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
