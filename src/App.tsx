import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import type { Article, Author, LiveStory } from './types';
import {
  getArticles,
  getAuthors,
  getLiveStories,
  getLocalArticles,
  getLocalAuthors,
  getLocalLiveStories,
  getArticleBySlug,
  incrementArticleViews,
  getStorageStatus,
  subscribeToLiveStories,
  subscribeToArticles,
} from './services/articleRepository';
import { getLegalPageByPath, type LegalPageData } from './data/legalPages';
import { Header } from './components/Header';
import { BreakingTicker } from './components/BreakingTicker';
import { BannerAd } from './components/BannerAd';
import { PublicFooter } from './components/PublicFooter';
import { HomeView } from './views/HomeView';
import { ArticleView } from './views/ArticleView';
import { AuthorView } from './views/AuthorView';
import { LegalPageView } from './views/LegalPageView';
import { injectHomeSchema, injectCategorySchema } from './utils/seo';

// Lazy-load non-critical / admin views to eliminate ~240 KiB of unused JS from initial mobile paint
const CmsView = lazy(() => import('./views/CmsView').then((m) => ({ default: m.CmsView })));
const SearchModal = lazy(() =>
  import('./components/SearchModal').then((m) => ({ default: m.SearchModal }))
);

function getInitialHydratedArticles(): Article[] {
  const ssrArticle: Article | null =
    typeof window !== 'undefined' && (window as any).__INITIAL_ARTICLE__
      ? (window as any).__INITIAL_ARTICLE__
      : null;
  const ssrList: Article[] =
    typeof window !== 'undefined' && Array.isArray((window as any).__INITIAL_ARTICLES__)
      ? (window as any).__INITIAL_ARTICLES__
      : [];

  const localList = getLocalArticles();
  const base = ssrList.length > 0 ? ssrList : localList;

  if (ssrArticle && !base.some((a) => a.id === ssrArticle.id || a.slug === ssrArticle.slug)) {
    return [ssrArticle, ...base];
  }
  return base;
}

function getInitialHydratedAuthors(): Author[] {
  if (typeof window !== 'undefined' && Array.isArray((window as any).__INITIAL_AUTHORS__)) {
    const ssrAuthors = (window as any).__INITIAL_AUTHORS__ as Author[];
    if (ssrAuthors.length > 0) return ssrAuthors;
  }
  return getLocalAuthors();
}

export default function App() {
  // Synchronous instant hydration from SSR / local cache (ZERO blocking loading spinner, eliminates 24.7s LCP & 0.891 CLS!)
  const [articles, setArticles] = useState<Article[]>(getInitialHydratedArticles);
  const [authors, setAuthors] = useState<Author[]>(getInitialHydratedAuthors);
  const [liveStories, setLiveStories] = useState<LiveStory[]>(() => getLocalLiveStories());

  const initialArticle: Article | null =
    typeof window !== 'undefined' && (window as any).__INITIAL_ARTICLE__
      ? (window as any).__INITIAL_ARTICLE__
      : null;

  const initialLegalPage: LegalPageData | null =
    typeof window !== 'undefined' ? getLegalPageByPath(window.location.pathname) : null;

  const isInitialArticleRoute =
    typeof window !== 'undefined' &&
    /^\/(?:news|article)\/[a-zA-Z0-9-_]+/.test(window.location.pathname);

  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'article' | 'author' | 'legal' | 'cms'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/cms') || window.location.hash === '#cms') return 'cms';
      if (initialLegalPage) return 'legal';
      if (initialArticle || isInitialArticleRoute) return 'article';
      if (window.location.pathname.startsWith('/author/')) return 'author';
    }
    return 'home';
  });

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(() => {
    if (initialArticle) return initialArticle;
    if (typeof window !== 'undefined') {
      const m = window.location.pathname.match(/^\/(?:news|article)\/([a-zA-Z0-9-_]+)/);
      if (m) {
        const slug = m[1];
        return getInitialHydratedArticles().find((a) => a.slug === slug || a.id === slug) || null;
      }
    }
    return null;
  });

  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const m = window.location.pathname.match(/^\/author\/([a-zA-Z0-9-_]+)/);
      if (m) return m[1];
    }
    return null;
  });

  const [activeLegalPage, setActiveLegalPage] = useState<LegalPageData | null>(initialLegalPage);

  const [activeCategory, setActiveCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat && cat.trim()) return cat.trim();
    }
    return 'all';
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [storageStatus, setStorageStatus] = useState(getStorageStatus());

  // Background cloud data sync (non-blocking)
  const loadData = useCallback(async () => {
    try {
      const [fetchedArticles, fetchedAuthors, fetchedStories] = await Promise.all([
        getArticles(),
        getAuthors(),
        getLiveStories(),
      ]);
      if (fetchedArticles.length > 0) {
        if (initialArticle && !fetchedArticles.some((a) => a.id === initialArticle.id)) {
          setArticles([initialArticle, ...fetchedArticles]);
        } else {
          setArticles(fetchedArticles);
        }
      }
      if (fetchedAuthors.length > 0) setAuthors(fetchedAuthors);
      if (fetchedStories.length > 0) setLiveStories(fetchedStories);
      setStorageStatus(getStorageStatus());
    } catch (e) {
      console.error('Error syncing news data:', e);
    }
  }, [initialArticle]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time synchronization listeners across devices (mobile + desktop live sync)
  useEffect(() => {
    const handleNewsChange = () => {
      loadData();
    };

    const unsubStories = subscribeToLiveStories((updatedStories) => {
      if (updatedStories.length > 0) setLiveStories(updatedStories);
    });
    const unsubArticles = subscribeToArticles((updatedArticles) => {
      if (updatedArticles.length > 0) setArticles(updatedArticles);
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };

    window.addEventListener('articles-updated', handleNewsChange);
    window.addEventListener('news-data-changed', handleNewsChange);
    window.addEventListener('live-stories-updated', handleNewsChange);
    window.addEventListener('storage', handleNewsChange);
    window.addEventListener('focus', handleNewsChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const intervalId = setInterval(() => {
      loadData();
    }, 30000);

    return () => {
      if (unsubStories) unsubStories();
      if (unsubArticles) unsubArticles();
      window.removeEventListener('articles-updated', handleNewsChange);
      window.removeEventListener('news-data-changed', handleNewsChange);
      window.removeEventListener('live-stories-updated', handleNewsChange);
      window.removeEventListener('storage', handleNewsChange);
      window.removeEventListener('focus', handleNewsChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [loadData]);

  // Handle URL deep linking on initial load and browser back/forward (popstate)
  useEffect(() => {
    const handleLocationChange = async () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      if (pathname.startsWith('/cms') || hash === '#cms') {
        setCurrentView('cms');
        return;
      }

      // Handle direct hits for XML/text machine files if ever caught by SPA router
      if (
        pathname === '/sitemap.xml' ||
        pathname === '/news-sitemap.xml' ||
        pathname === '/robots.txt' ||
        pathname === '/ai.txt' ||
        pathname === '/rss.xml' ||
        pathname === '/feed.xml' ||
        pathname === '/llms.txt' ||
        pathname === '/llms-full.txt'
      ) {
        try {
          const res = await fetch(pathname);
          const raw = await res.text();
          document.open();
          const escaped = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          if (pathname.endsWith('.xml')) {
            document.write(
              `<pre style="word-wrap: break-word; white-space: pre-wrap; font-family: monospace; font-size: 13px; line-height: 1.5; padding: 16px; background: #0f172a; color: #38bdf8;">${escaped}</pre>`
            );
          } else {
            document.write(
              `<pre style="word-wrap: break-word; white-space: pre-wrap; font-family: monospace; font-size: 13px; line-height: 1.5; padding: 16px; background: #ffffff; color: #1e293b;">${escaped}</pre>`
            );
          }
          document.close();
          return;
        } catch {
          window.location.reload();
          return;
        }
      }

      // Legal & Compliance pages
      const legal = getLegalPageByPath(pathname);
      if (legal) {
        setActiveLegalPage(legal);
        setCurrentView('legal');
        return;
      }

      // Article routes: normalize legacy /article/:slug -> canonical /news/:slug in URL bar
      const articleMatch = pathname.match(/^\/(news|article)\/([a-zA-Z0-9-_]+)/);
      if (articleMatch) {
        const prefix = articleMatch[1];
        const slug = articleMatch[2];
        if (prefix === 'article') {
          window.history.replaceState({}, '', `/news/${slug}`);
        }
        if (initialArticle && (initialArticle.slug === slug || initialArticle.id === slug)) {
          setSelectedArticle(initialArticle);
          setCurrentView('article');
          incrementArticleViews(initialArticle.id);
          return;
        }
        const art = await getArticleBySlug(slug);
        if (art) {
          setSelectedArticle(art);
          setCurrentView('article');
          incrementArticleViews(art.id);
          return;
        }
      }

      const authorMatch = pathname.match(/^\/author\/([a-zA-Z0-9-_]+)/);
      if (authorMatch) {
        setSelectedAuthorId(authorMatch[1]);
        setCurrentView('author');
        return;
      }

      // Homepage or Category query param
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      setActiveCategory(cat && cat.trim() ? cat.trim() : 'all');
      setCurrentView('home');
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [initialArticle]);

  // Keep home / category SEO schema, canonical, title & description synced with active state
  useEffect(() => {
    if (currentView === 'home') {
      if (activeCategory && activeCategory !== 'all') {
        const count = articles.filter(
          (a) => a.category?.toLowerCase() === activeCategory.toLowerCase()
        ).length;
        injectCategorySchema(activeCategory, count);
      } else {
        injectHomeSchema();
      }
    }
  }, [currentView, activeCategory, articles]);

  // Navigate to News Story (canonical /news/:slug format)
  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    setCurrentView('article');
    incrementArticleViews(article.id);
    window.history.pushState({}, '', `/news/${article.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to Author
  const handleSelectAuthor = (authorId: string) => {
    setSelectedAuthorId(authorId);
    setCurrentView('author');
    window.history.pushState({}, '', `/author/${authorId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to Legal / Compliance Page
  const handleNavigateLegal = (path: string) => {
    const legal = getLegalPageByPath(path);
    if (!legal) return;
    setActiveLegalPage(legal);
    setCurrentView('legal');
    window.history.pushState({}, '', legal.path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to Category (keeps canonical /?category=... URL in sync)
  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    setCurrentView('home');
    const targetUrl = cat && cat !== 'all' ? `/?category=${encodeURIComponent(cat)}` : '/';
    window.history.pushState({}, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate Home
  const handleNavigateHome = () => {
    setActiveCategory('all');
    setSelectedArticle(null);
    setSelectedAuthorId(null);
    setActiveLegalPage(null);
    setCurrentView('home');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open CMS
  const handleOpenCms = () => {
    setCurrentView('cms');
    window.history.pushState({}, '', '/cms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerSearch = (q: string) => {
    setSearchQuery(q);
    setIsSearchOpen(true);
  };

  const publishedArticles = articles.filter((a) => (a.status || 'published') === 'published');
  const breakingArticles = publishedArticles.filter((a) => a.isBreaking);
  const activeAuthor = authors.find((a) => a.id === selectedAuthorId) || null;
  const selectedArticleAuthor = selectedArticle
    ? authors.find((a) => a.id === selectedArticle.authorId) || null
    : null;
  const relatedArticles = selectedArticle
    ? publishedArticles.filter(
        (a) => a.id !== selectedArticle.id && a.category === selectedArticle.category
      )
    : [];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#fcfcfd] text-slate-900 flex flex-col selection:bg-red-100 selection:text-red-900">
      {/* 1. REAL-TIME BREAKING DISPATCH TICKER */}
      {currentView !== 'cms' && (
        <BreakingTicker
          breakingArticles={breakingArticles}
          onSelectArticle={handleSelectArticle}
        />
      )}

      {/* 2. GLOBAL PLATFORM HEADER */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => {
          setSearchQuery('');
          setIsSearchOpen(true);
        }}
        onOpenCms={handleOpenCms}
        onNavigateHome={handleNavigateHome}
        isCloudStorage={storageStatus.isCloud}
      />

      {/* 3. MAIN CONTENT LANDMARK */}
      <main id="main-content" className="flex-1">
        {currentView === 'home' && (
          <HomeView
            articles={publishedArticles}
            authors={authors}
            liveStories={liveStories}
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
            onSelectArticle={handleSelectArticle}
            onSelectAuthor={handleSelectAuthor}
            onOpenSearch={() => {
              setSearchQuery('');
              setIsSearchOpen(true);
            }}
            onSearchQuery={handleTriggerSearch}
          />
        )}

        {currentView === 'article' && selectedArticle && (
          <ArticleView
            article={selectedArticle}
            author={selectedArticleAuthor}
            relatedArticles={relatedArticles}
            allArticles={publishedArticles}
            onBackToFeed={handleNavigateHome}
            onSelectArticle={handleSelectArticle}
            onSelectAuthor={handleSelectAuthor}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {currentView === 'author' && activeAuthor && (
          <AuthorView
            author={activeAuthor}
            articles={publishedArticles}
            onBackToFeed={handleNavigateHome}
            onSelectArticle={handleSelectArticle}
          />
        )}

        {currentView === 'legal' && activeLegalPage && (
          <LegalPageView
            page={activeLegalPage}
            onBackToFeed={handleNavigateHome}
            onNavigateLegal={handleNavigateLegal}
          />
        )}

        {currentView === 'cms' && (
          <Suspense
            fallback={
              <div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-600">
                Loading Editorial CMS Desk...
              </div>
            }
          >
            <CmsView
              articles={articles}
              authors={authors}
              liveStories={liveStories}
              onRefreshArticles={loadData}
              onRefreshLiveStories={loadData}
              onCloseCms={handleNavigateHome}
              onPreviewArticle={(art) => {
                setSelectedArticle(art);
                setCurrentView('article');
              }}
            />
          </Suspense>
        )}
      </main>

      {/* 4. REUSABLE STICKY BOTTOM ANCHOR BANNER AD */}
      {currentView !== 'cms' && <BannerAd format="sticky-bottom" />}

      {/* 5. LAZY-LOADED FAST SEARCH MODAL */}
      {isSearchOpen && (
        <Suspense fallback={null}>
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            initialQuery={searchQuery}
            articles={publishedArticles}
            onSelectArticle={handleSelectArticle}
          />
        </Suspense>
      )}

      {/* 6. PUBLIC FOOTER */}
      {currentView !== 'cms' && (
        <PublicFooter
          onOpenCms={handleOpenCms}
          onSelectCategory={handleSelectCategory}
          onNavigateLegal={handleNavigateLegal}
        />
      )}
    </div>
  );
}
