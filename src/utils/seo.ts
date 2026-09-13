import type { Article, Author } from '../types';

const NEWS_SCHEMA_ID = 'iamquickagent-news-schema';
const BREADCRUMB_SCHEMA_ID = 'iamquickagent-breadcrumb-schema';
const WEBSITE_SCHEMA_ID = 'iamquickagent-website-schema';

export function injectArticleSchema(article: Article, author: Author | null, currentUrl: string): void {
  // 1. Remove previous dynamic scripts if present
  removeArticleSchema();

  // 2. Build NewsArticle Schema
  const newsArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
    'headline': article.headline,
    'description': article.deck || article.keyTakeaways[0] || '',
    'image': [article.featuredImage],
    'datePublished': article.publishedAt,
    'dateModified': article.updatedAt || article.publishedAt,
    'author': [
      {
        '@type': 'Person',
        'name': author ? author.name : 'iamquickagent Intelligence Desk',
        'jobTitle': author ? author.role : 'Staff Intelligence Analyst',
        'url': author ? `https://iamquickagent.com/author/${author.id}` : 'https://iamquickagent.com/editorial',
      },
    ],
    'publisher': {
      '@type': 'NewsMediaOrganization',
      'name': 'iamquickagent.com',
      'url': 'https://iamquickagent.com',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://iamquickagent.com/assets/logo.png',
        'width': 600,
        'height': 60,
      },
      'publishingPrinciples': 'https://iamquickagent.com/editorial-standards',
      'ethicsPolicy': 'https://iamquickagent.com/editorial-standards#ethics',
    },
    'articleSection': article.category,
    'keywords': article.tags.join(', '),
    'abstract': article.keyTakeaways.join(' \u2022 '),
    'articleBody': article.content.replace(/[#*`_]/g, ''),
    'inLanguage': 'en-US',
    // Speakable property specifically crafted for AEO / Voice search / Generative AI citations
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': ['[data-aeo-summary="true"]', 'h1', '.deck-summary'],
    },
  };

  // 3. Build BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://iamquickagent.com/',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': article.category,
        'item': `https://iamquickagent.com/?category=${encodeURIComponent(article.category)}`,
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': article.headline,
        'item': currentUrl,
      },
    ],
  };

  // 4. Inject into document.head
  const scriptNews = document.createElement('script');
  scriptNews.id = NEWS_SCHEMA_ID;
  scriptNews.type = 'application/ld+json';
  scriptNews.text = JSON.stringify(newsArticleSchema, null, 2);
  document.head.appendChild(scriptNews);

  const scriptBreadcrumb = document.createElement('script');
  scriptBreadcrumb.id = BREADCRUMB_SCHEMA_ID;
  scriptBreadcrumb.type = 'application/ld+json';
  scriptBreadcrumb.text = JSON.stringify(breadcrumbSchema, null, 2);
  document.head.appendChild(scriptBreadcrumb);

  // 5. Update standard document head meta tags
  document.title = `${article.headline} | iamquickagent.com`;
  updateMeta('description', article.deck || article.keyTakeaways[0]);
  updateMeta('og:title', article.headline);
  updateMeta('og:description', article.deck || article.keyTakeaways[0]);
  updateMeta('og:image', article.featuredImage);
  updateMeta('og:type', 'article');
  updateMeta('twitter:title', article.headline);
  updateMeta('twitter:description', article.deck || article.keyTakeaways[0]);
  updateMeta('twitter:image', article.featuredImage);
}

export function injectHomeSchema(): void {
  removeArticleSchema();

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    'name': 'iamquickagent.com',
    'url': 'https://iamquickagent.com',
    'description': 'Rapid digital news and intelligence publishing platform delivering real-time geopolitical, tech, cyber, and macro briefings.',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://iamquickagent.com/?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const existing = document.getElementById(WEBSITE_SCHEMA_ID);
  if (!existing) {
    const script = document.createElement('script');
    script.id = WEBSITE_SCHEMA_ID;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(websiteSchema, null, 2);
    document.head.appendChild(script);
  }

  document.title = 'iamquickagent.com - Rapid Digital News & Intelligence Agent';
  updateMeta('description', 'High-performance rapid digital news and intelligence publishing platform with key takeaway briefs, breaking dispatches, and deep analysis.');
}

export function removeArticleSchema(): void {
  const s1 = document.getElementById(NEWS_SCHEMA_ID);
  if (s1) s1.remove();

  const s2 = document.getElementById(BREADCRUMB_SCHEMA_ID);
  if (s2) s2.remove();
}

function updateMeta(nameOrProp: string, content: string): void {
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

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
