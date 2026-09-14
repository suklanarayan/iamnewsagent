import React, { useState, useEffect, useCallback } from 'react';
import type { Article, Author, LiveStory } from './types';
import {
  getArticles,
  getAuthors,
  getLiveStories,
  getArticleBySlug,
  incrementArticleViews,
  getStorageStatus,
} from './services/articleRepository';
import { Header } from './components/Header';
import { BreakingTicker } from './components/BreakingTicker';
import { BannerAd } from './components/BannerAd';
import { SearchModal } from './components/SearchModal';
import { PublicFooter } from './components/PublicFooter';
import { HomeView } from './views/HomeView';
import { ArticleView } from './views/ArticleView';
import { AuthorView } from './views/AuthorView';
import { CmsView } from './views/CmsView';
import { injectHomeSchema } from './utils/seo';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [liveStories, setLiveStories] = useState<LiveStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'article' | 'author' | 'cms'>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Storage connection status
  const [storageStatus, setStorageStatus] = useState(getStorageStatus());

  // Load articles, authors & live stories
  const loadData = useCallback(async () => {
    try {
      const [fetchedArticles, fetchedAuthors, fetchedStories] = await Promise.all([
        getArticles(),
        getAuthors(),
        getLiveStories(),
      ]);
      setArticles(fetchedArticles);
      setAuthors(fetchedAuthors);
      setLiveStories(fetchedStories);
      setStorageStatus(getStorageStatus());
    } catch (e) {
      console.error('Error loading news data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle URL deep linking on initial load and popstate
  useEffect(() => {
    const handleLocationChange = async () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      if (pathname.startsWith('/cms') || hash === '#cms') {
        setCurrentView('cms');
        return;
      }

      const articleMatch = pathname.match(/\/article\/([a-zA-Z0-9-_]+)/);
      if (articleMatch) {
        const slug = articleMatch[1];
        const art = await getArticleBySlug(slug);
        if (art) {
          setSelectedArticle(art);
          setCurrentView('article');
          incrementArticleViews(art.id);
          return;
        }
      }

      const authorMatch = pathname.match(/\/author\/([a-zA-Z0-9-_]+)/);
      if (authorMatch) {
        setSelectedAuthorId(authorMatch[1]);
        setCurrentView('author');
        return;
      }

      // Default home
      setCurrentView('home');
      injectHomeSchema();
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Set home schema when on home
  useEffect(() => {
    if (currentView === 'home') {
      injectHomeSchema();
    }
  }, [currentView]);

  // Navigate to Article
  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    setCurrentView('article');
    incrementArticleViews(article.id);
    window.history.pushState({}, '', `/article/${article.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to Author
  const handleSelectAuthor = (authorId: string) => {
    setSelectedAuthorId(authorId);
    setCurrentView('author');
    window.history.pushState({}, '', `/author/${authorId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to Category
  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    setCurrentView('home');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate Home
  const handleNavigateHome = () => {
    setActiveCategory('all');
    setSelectedArticle(null);
    setSelectedAuthorId(null);
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

  // Trigger search with query
  const handleTriggerSearch = (q: string) => {
    setSearchQuery(q);
    setIsSearchOpen(true);
  };

  // Breaking articles
  const breakingArticles = articles.filter((a) => a.isBreaking && a.status === 'published');

  // Active Author object
  const activeAuthor = authors.find((a) => a.id === selectedAuthorId) || null;

  // Selected Article's Author object
  const selectedArticleAuthor = selectedArticle
    ? authors.find((a) => a.id === selectedArticle.authorId) || null
    : null;

  // Related articles
  const relatedArticles = selectedArticle
    ? articles.filter(
        (a) => a.id !== selectedArticle.id && a.category === selectedArticle.category
      )
    : [];

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-900 flex flex-col selection:bg-red-100 selection:text-red-900">
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

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1">
        {isLoading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
            <span className="text-xs text-slate-500 font-medium">
              Initializing Iamnewsagent intelligence feed...
            </span>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomeView
                articles={articles.filter((a) => a.status === 'published')}
                authors={authors}
                liveStories={liveStories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
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
                onBackToFeed={handleNavigateHome}
                onSelectArticle={handleSelectArticle}
                onSelectAuthor={handleSelectAuthor}
                onSelectCategory={handleSelectCategory}
              />
            )}

            {currentView === 'author' && activeAuthor && (
              <AuthorView
                author={activeAuthor}
                articles={articles.filter((a) => a.status === 'published')}
                onBackToFeed={handleNavigateHome}
                onSelectArticle={handleSelectArticle}
              />
            )}

            {currentView === 'cms' && (
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
            )}
          </>
        )}
      </div>

      {/* 4. REUSABLE STICKY BOTTOM ANCHOR BANNER AD */}
      {currentView !== 'cms' && <BannerAd format="sticky-bottom" />}

      {/* 5. FAST SEARCH MODAL */}
      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
          initialQuery={searchQuery}
          articles={articles.filter((a) => a.status === 'published')}
          onSelectArticle={handleSelectArticle}
        />
      )}

      {/* 6. PUBLIC FOOTER */}
      {currentView !== 'cms' && (
        <PublicFooter
          onOpenCms={handleOpenCms}
          onSelectCategory={handleSelectCategory}
        />
      )}
    </div>
  );
}
