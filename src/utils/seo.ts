import type { Article, Author } from '../types';
import type { LegalPageData } from '../data/legalPages';

const NEWS_SCHEMA_ID = 'iamquickagent-news-schema';
const BREADCRUMB_SCHEMA_ID = 'iamquickagent-breadcrumb-schema';
const WEBSITE_SCHEMA_ID = 'iamquickagent-website-schema';
const KNOWLEDGE_GRAPH_SCHEMA_ID = 'iamquickagent-knowledge-graph-schema';
const CATEGORY_SCHEMA_ID = 'iamquickagent-category-schema';
const AUTHOR_SCHEMA_ID = 'iamquickagent-author-schema';
const LEGAL_SCHEMA_ID = 'iamquickagent-legal-schema';
const FAQ_SCHEMA_ID = 'iamquickagent-faq-schema';

export const DEFAULT_BASE_URL = 'https://www.iamquickagent.com';
const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=85';

function toAbsoluteImage(img?: string): string {
  if (!img) return DEFAULT_OG_IMAGE;
  if (img.startsWith('https://') || img.startsWith('http://')) return img;
  if (img.startsWith('/')) return `${DEFAULT_BASE_URL}${img}`;
  return `${DEFAULT_BASE_URL}/${img}`;
}

function buildDescriptionFromContent(candidates: Array<string | undefined>, fallback: string): string {
  for (const raw of candidates) {
    if (!raw) continue;
    const cleaned = decodeHtmlEntities(raw)
      .replace(/!\[.*?\]\(.*?\)/g, ' ')
      .replace(/[#*`_>[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned.length >= 25) {
      if (cleaned.length <= 160) return cleaned;
      const sliced = cleaned.slice(0, 157);
      const lastSpace = sliced.lastIndexOf(' ');
      return (lastSpace > 110 ? sliced.slice(0, lastSpace) : sliced).replace(/[.,;:\s]+$/, '') + '...';
    }
  }
  return fallback;
}

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
    'url': DEFAULT_OG_IMAGE,
    'caption': 'iamquickagent.com Logo',
    'width': 1200,
    'height': 630,
  },
  'image': DEFAULT_OG_IMAGE,
  'sameAs': [
    'https://twitter.com/iamquickagent',
    'https://facebook.com/iamquickagent',
    'https://linkedin.com/company/iamquickagent',
    'https://youtube.com/@iamquickagent',
  ],
  'description':
    'Real-time digital breaking news and multimedia publishing network delivering live coverage across India, World, Business, Markets, Technology, Politics, Sports, and in-depth explainers.',
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
  'ethicsPolicy': `${DEFAULT_BASE_URL}/editorial-standards`,
  'correctionsPolicy': `${DEFAULT_BASE_URL}/editorial-standards`,
  'masthead': `${DEFAULT_BASE_URL}/editorial-standards`,
  'contactPoint': {
    '@type': 'ContactPoint',
    'contactType': 'Newsroom Editorial Desk',
    'email': 'SUKLA.NARAYAN007@gmail.com',
    'availableLanguage': ['English', 'Hindi'],
  },
};

function clearSsrSchemaTag(): void {
  const ssrTag = document.getElementById('iamquickagent-ssr-schema');
  if (ssrTag) ssrTag.remove();
  const defaultTags = document.querySelectorAll('script[data-ssr-default="true"]');
  defaultTags.forEach((t) => t.remove());
}

/**
 * Injects complete NewsArticle, Person Author, WebPage, BreadcrumbList, and FAQPage Schema
 */
export function injectArticleSchema(article: Article, author: Author | null, _currentUrl?: string): void {
  removeArticleSchema();
  clearSsrSchemaTag();

  const canonicalUrl = `${DEFAULT_BASE_URL}/news/${encodeURIComponent(article.slug)}`;
  const wordCount = article.content ? article.content.split(/\s+/).filter(Boolean).length : 500;
  const publishedDate = article.publishedAt || new Date().toISOString();
  const modifiedDate = article.updatedAt || publishedDate;
  const rawTitle = decodeHtmlEntities(article.seoTitle || article.headline).trim();
  const fullTitle = rawTitle.toLowerCase().includes('iamquickagent.com')
    ? rawTitle
    : `${rawTitle} | iamquickagent.com`;
  const metaDescription = buildDescriptionFromContent(
    [article.seoDescription, article.deck, article.keyTakeaways?.[0], article.content],
    `Read the latest ${article.category} breaking news: ${article.headline} on iamquickagent.com.`
  );
  const featuredImg = toAbsoluteImage(article.featuredImage);
  const authorUrl = author
    ? `${DEFAULT_BASE_URL}/author/${encodeURIComponent(author.id)}`
    : `${DEFAULT_BASE_URL}/editorial-standards`;

  const newsArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${canonicalUrl}#article`,
    'isPartOf': {
      '@type': 'WebSite',
      '@id': `${DEFAULT_BASE_URL}/#website`,
      'name': 'iamquickagent.com',
      'url': `${DEFAULT_BASE_URL}/`,
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    'headline': article.headline,
    'alternativeHeadline': article.deck || article.keyTakeaways?.[0] || article.headline,
    'description': metaDescription,
    'image': [featuredImg],
    'datePublished': publishedDate,
    'dateModified': modifiedDate,
    'author': [
      {
        '@type': 'Person',
        '@id': `${authorUrl}#person`,
        'name': author ? author.name : 'iamquickagent Newsroom Desk',
        'jobTitle': author ? author.role : 'Staff Correspondent',
        'url': authorUrl,
        ...(author?.avatar ? { 'image': toAbsoluteImage(author.avatar) } : {}),
        ...(author?.twitter ? { 'sameAs': `https://twitter.com/${author.twitter.replace('@', '')}` } : {}),
      },
    ],
    'publisher': KNOWLEDGE_GRAPH_ORGANIZATION,
    'articleSection': article.category,
    'keywords': article.tags?.length ? article.tags.join(', ') : article.category,
    'wordCount': wordCount,
    'abstract': article.keyTakeaways?.length ? article.keyTakeaways.join(' • ') : metaDescription,
    'articleBody': article.content ? article.content.replace(/[#*`_]/g, '') : '',
    'inLanguage': 'en-US',
    'isAccessibleForFree': true,
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': ['[data-aeo-summary="true"]', '[data-aeo-takeaways="true"]', 'h1', '.deck-summary'],
    },
    'about': (article.tags || []).map((tag) => ({
      '@type': 'Thing',
      'name': tag,
    })),
  };

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

  appendJsonLd(NEWS_SCHEMA_ID, newsArticleSchema);
  appendJsonLd(BREADCRUMB_SCHEMA_ID, breadcrumbSchema);

  if (article.faq && article.faq.length > 0) {
    appendJsonLd(FAQ_SCHEMA_ID, {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      'mainEntity': article.faq.map((f) => ({
        '@type': 'Question',
        'name': f.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': f.answer,
        },
      })),
    });
  }

  // Update Document Title and Meta Tags
  document.title = fullTitle;
  updateMeta('description', metaDescription);
  updateMeta('news_keywords', article.tags?.length ? article.tags.join(', ') : article.category);
  updateMeta('keywords', article.tags?.length ? article.tags.join(', ') : article.category);
  updateMeta('author', author ? author.name : 'iamquickagent.com Newsroom');

  // OpenGraph Tags
  updateMeta('og:type', 'article');
  updateMeta('og:title', fullTitle);
  updateMeta('og:description', metaDescription);
  updateMeta('og:image', featuredImg);
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
  updateMeta('twitter:title', fullTitle);
  updateMeta('twitter:description', metaDescription);
  updateMeta('twitter:image', featuredImg);

  // Canonical Link
  updateCanonical(canonicalUrl);
}

/**
 * Injects Knowledge Graph NewsMediaOrganization and WebSite Schema for Homepage
 */
export function injectHomeSchema(): void {
  removeArticleSchema();
  clearSsrSchemaTag();

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${DEFAULT_BASE_URL}/#website`,
    'url': `${DEFAULT_BASE_URL}/`,
    'name': 'iamquickagent.com',
    'alternateName': ['iamquickagent', 'iamnewsagent'],
    'description':
      'Real-time breaking news portal delivering live headlines, market tracking, political coverage, and in-depth explainers.',
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

  const title = 'iamquickagent.com - Latest Breaking News, Live Updates & Global Headlines';
  const desc =
    'Live breaking news, real-time headlines, and in-depth reporting across India, World, Business, Tech, Markets, Sports, and Politics with executive takeaways.';

  document.title = title;
  updateMeta('description', desc);
  updateMeta('og:type', 'website');
  updateMeta('og:title', title);
  updateMeta('og:description', desc);
  updateMeta('og:url', `${DEFAULT_BASE_URL}/`);
  updateMeta('og:image', DEFAULT_OG_IMAGE);
  updateMeta('twitter:title', title);
  updateMeta('twitter:description', desc);
  updateMeta('twitter:image', DEFAULT_OG_IMAGE);
  updateCanonical(`${DEFAULT_BASE_URL}/`);
}

/**
 * Injects Category CollectionPage Schema
 */
export function injectCategorySchema(category: string, count: number): void {
  removeArticleSchema();
  clearSsrSchemaTag();

  const canonicalUrl = `${DEFAULT_BASE_URL}/?category=${encodeURIComponent(category)}`;
  const title = `${category} News, Breaking Headlines & Live Updates | iamquickagent.com`;
  const desc = `Read the latest ${category} breaking news, live dispatches, executive takeaways, and in-depth coverage from iamquickagent.com.`;

  const categorySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${canonicalUrl}#collection`,
    'name': title,
    'description': desc,
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${DEFAULT_BASE_URL}/` },
      { '@type': 'ListItem', 'position': 2, 'name': category, 'item': canonicalUrl },
    ],
  };

  appendJsonLd(KNOWLEDGE_GRAPH_SCHEMA_ID, KNOWLEDGE_GRAPH_ORGANIZATION);
  appendJsonLd(CATEGORY_SCHEMA_ID, categorySchema);
  appendJsonLd(BREADCRUMB_SCHEMA_ID, breadcrumbSchema);

  document.title = title;
  updateMeta('description', desc);
  updateMeta('og:type', 'website');
  updateMeta('og:title', title);
  updateMeta('og:description', desc);
  updateMeta('og:url', canonicalUrl);
  updateMeta('twitter:title', title);
  updateMeta('twitter:description', desc);
  updateCanonical(canonicalUrl);
}

/**
 * Injects Author ProfilePage & Person Schema
 */
export function injectAuthorSchema(author: Author, articlesCount: number): void {
  removeArticleSchema();
  clearSsrSchemaTag();

  const canonicalUrl = `${DEFAULT_BASE_URL}/author/${encodeURIComponent(author.id)}`;
  const title = `${author.name} - ${author.role} | iamquickagent.com`;
  const desc = buildDescriptionFromContent(
    [`${author.name} (${author.role}) at iamquickagent.com. ${author.bio || ''}`],
    `Read verified news reporting and analysis by ${author.name} (${articlesCount} reports) on iamquickagent.com.`
  );
  const avatarImg = toAbsoluteImage(author.avatar);

  const profileSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${canonicalUrl}#webpage`,
    'url': canonicalUrl,
    'name': title,
    'description': desc,
    'isPartOf': { '@id': `${DEFAULT_BASE_URL}/#website` },
    'mainEntity': {
      '@type': 'Person',
      '@id': `${canonicalUrl}#person`,
      'name': author.name,
      'jobTitle': author.role,
      'description': author.bio,
      'image': avatarImg,
      'url': canonicalUrl,
      ...(author.twitter ? { 'sameAs': [`https://twitter.com/${author.twitter.replace('@', '')}`] } : {}),
      'worksFor': { '@id': `${DEFAULT_BASE_URL}/#organization` },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${DEFAULT_BASE_URL}/` },
      { '@type': 'ListItem', 'position': 2, 'name': author.name, 'item': canonicalUrl },
    ],
  };

  appendJsonLd(KNOWLEDGE_GRAPH_SCHEMA_ID, KNOWLEDGE_GRAPH_ORGANIZATION);
  appendJsonLd(AUTHOR_SCHEMA_ID, profileSchema);
  appendJsonLd(BREADCRUMB_SCHEMA_ID, breadcrumbSchema);

  document.title = title;
  updateMeta('description', desc);
  updateMeta('og:type', 'profile');
  updateMeta('og:title', title);
  updateMeta('og:description', desc);
  updateMeta('og:image', avatarImg);
  updateMeta('og:url', canonicalUrl);
  updateMeta('twitter:title', title);
  updateMeta('twitter:description', desc);
  updateMeta('twitter:image', avatarImg);
  updateCanonical(canonicalUrl);
}

/**
 * Injects Legal / Compliance WebPage & BreadcrumbList Schema
 */
export function injectLegalPageSchema(page: LegalPageData): void {
  removeArticleSchema();
  clearSsrSchemaTag();

  const canonicalUrl = `${DEFAULT_BASE_URL}${page.path}`;

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    'url': canonicalUrl,
    'name': page.metaTitle,
    'description': page.description,
    'dateModified': page.lastUpdated,
    'isPartOf': { '@id': `${DEFAULT_BASE_URL}/#website` },
    'publisher': { '@id': `${DEFAULT_BASE_URL}/#organization` },
    'inLanguage': 'en-US',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${DEFAULT_BASE_URL}/` },
      { '@type': 'ListItem', 'position': 2, 'name': page.title, 'item': canonicalUrl },
    ],
  };

  appendJsonLd(KNOWLEDGE_GRAPH_SCHEMA_ID, KNOWLEDGE_GRAPH_ORGANIZATION);
  appendJsonLd(LEGAL_SCHEMA_ID, webPageSchema);
  appendJsonLd(BREADCRUMB_SCHEMA_ID, breadcrumbSchema);

  document.title = page.metaTitle;
  updateMeta('description', page.description);
  updateMeta('og:type', 'website');
  updateMeta('og:title', page.metaTitle);
  updateMeta('og:description', page.description);
  updateMeta('og:url', canonicalUrl);
  updateMeta('twitter:title', page.metaTitle);
  updateMeta('twitter:description', page.description);
  updateCanonical(canonicalUrl);
}

/**
 * Removes page-specific temporary schemas when navigating away
 */
export function removeArticleSchema(): void {
  const ids = [
    NEWS_SCHEMA_ID,
    BREADCRUMB_SCHEMA_ID,
    CATEGORY_SCHEMA_ID,
    AUTHOR_SCHEMA_ID,
    LEGAL_SCHEMA_ID,
    FAQ_SCHEMA_ID,
  ];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
}

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

export function updateCanonical(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
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
    .replace(/&nbsp;/gi, ' ')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&hellip;/gi, '…')
    .replace(/&lsquo;/gi, '‘')
    .replace(/&rsquo;/gi, '’')
    .replace(/&ldquo;/gi, '“')
    .replace(/&rdquo;/gi, '”')
    .replace(/&trade;/gi, '™')
    .replace(/&copy;/gi, '©')
    .replace(/&reg;/gi, '®')
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
}

export function slugify(text: string): string {
  const decoded = decodeHtmlEntities(text || '');
  return decoded
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['’‘`]/g, '')
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
