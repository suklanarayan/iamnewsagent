import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  LayoutGrid,
  Grid,
  List,
  Rows,
  Clock,
  Sparkles,
  User,
  X,
  Compass,
  CheckCircle2,
  BookOpen,
  Filter,
} from 'lucide-react';
import type { Article, Author, LiveStory, TrendingItem, OpinionPiece } from '../types';
import { HeroSearchBanner } from '../components/HeroSearchBanner';
import { LiveStoriesBar } from '../components/LiveStoriesBar';
import { StoryModal } from '../components/StoryModal';
import { TopStoryHero } from '../components/TopStoryHero';
import { StackedStories } from '../components/StackedStories';
import { TrendingColumn } from '../components/TrendingColumn';
import { CategoryGrid } from '../components/CategoryGrid';
import { SocialTvTrendingSection } from '../components/SocialTvTrendingSection';
import { ExplainersRow } from '../components/ExplainersRow';
import { OpinionsColumn } from '../components/OpinionsColumn';
import { NewsletterBox } from '../components/NewsletterBox';
import { BannerAd } from '../components/BannerAd';
import { NewsImage } from '../components/NewsImage';
import {
  SEED_LIVE_STORIES,
  SEED_OPINIONS,
} from '../data/seedData';
import { getTrendingSettings, TrendingSettings } from '../utils/trendingManager';

export type NewsViewMode = 'bento' | 'grid' | 'list' | 'compact';

interface HomeViewProps {
  articles: Article[];
  authors: Author[];
  liveStories?: LiveStory[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onSelectArticle: (article: Article) => void;
  onSelectAuthor: (authorId: string) => void;
  onOpenSearch: () => void;
  onSearchQuery?: (q: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  articles,
  authors,
  liveStories = [],
  activeCategory,
  onSelectCategory,
  onSelectArticle,
  onSelectAuthor,
  onOpenSearch,
  onSearchQuery,
}) => {
  // Live stories modal state
  const [activeStory, setActiveStory] = useState<LiveStory | null>(null);
  const activeStoriesList = liveStories.length > 0 ? liveStories : SEED_LIVE_STORIES;

  // View Mode state: bento (editorial bento), grid (cards), list (horizontal), compact (wire headlines)
  const [viewMode, setViewMode] = useState<NewsViewMode>(() => {
    try {
      const saved = localStorage.getItem('preferred_news_view_mode') as NewsViewMode;
      if (['bento', 'grid', 'list', 'compact'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'bento';
  });

  // State to track whether user expanded "View All" in Top Stories
  const [isViewingAllTopStories, setIsViewingAllTopStories] = useState(false);

  // Dynamic Trending Settings State
  const [trendingSettings, setTrendingSettings] = useState<TrendingSettings>(() => getTrendingSettings());

  useEffect(() => {
    const handleUpdated = () => {
      setTrendingSettings(getTrendingSettings());
    };
    window.addEventListener('trending-updated', handleUpdated);
    window.addEventListener('storage', handleUpdated);
    return () => {
      window.removeEventListener('trending-updated', handleUpdated);
      window.removeEventListener('storage', handleUpdated);
    };
  }, []);

  const handleSetViewMode = (mode: NewsViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('preferred_news_view_mode', mode);
    } catch {}
  };

  // Strictly sort articles by publication date (newest published timestamp always first)
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
  );

  // Filter articles based on activeCategory
  const filteredArticles =
    activeCategory === 'all'
      ? sortedArticles
      : activeCategory === 'Explainers'
      ? sortedArticles.filter((a) => a.isExplainer || a.category === 'Explainers')
      : activeCategory === 'Opinion'
      ? sortedArticles.filter((a) => a.category === 'Opinion')
      : sortedArticles.filter((a) => a.category?.toLowerCase() === activeCategory.toLowerCase());

  // If filtered articles is empty for a specialized category like Opinion, provide fallback or opinions
  const displayArticles =
    filteredArticles.length > 0
      ? filteredArticles
      : activeCategory === 'Explainers'
      ? sortedArticles.filter((a) => a.keyTakeaways && a.keyTakeaways.length > 1)
      : sortedArticles;

  // Lead hero article
  const heroArticle = displayArticles[0];

  // Middle stacked stories (up to 4 articles excluding hero)
  const stackedArticles = displayArticles
    .filter((a) => a.id !== heroArticle?.id && !a.isExplainer)
    .slice(0, 4);

  // Remaining articles beyond the initial curated bento set
  const remainingArticles = displayArticles.filter(
    (a) => a.id !== heroArticle?.id && !stackedArticles.some((s) => s.id === a.id)
  );

  // Today's Insight article (Durga Puja explainer or first explainer)
  const insightArticle =
    articles.find((a) => a.slug === 'durga-puja-2025-tradition-culture-modern-kolkata') ||
    articles.find((a) => a.isExplainer) ||
    articles[1];

  // Explainers & In-Depth Deep Dives (ensures full coverage without desktop blank space)
  const explicitExplainers = articles.filter((a) => a.isExplainer || a.category === 'Explainers');
  const explainers = [
    ...explicitExplainers,
    ...articles.filter(
      (a) =>
        !explicitExplainers.some((e) => e.id === a.id) &&
        a.id !== heroArticle?.id &&
        (a.keyTakeaways?.length > 1 || a.category === 'Technology' || a.category === 'World')
    ),
  ].slice(0, 6);

  // Handle hero search submit
  const handleHeroSearch = (query: string) => {
    if (onSearchQuery) {
      onSearchQuery(query);
    } else {
      onOpenSearch();
    }
  };

  // Handle filter chip click
  const handleFilterClick = (filter: string) => {
    if (filter === 'all' || filter === 'Latest News') {
      onSelectCategory('all');
    } else if (filter === 'Trending') {
      onOpenSearch();
    } else {
      onSelectCategory(filter);
    }
    const el = document.getElementById('top-stories-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle trending item click with Destination Link support
  const handleSelectTrending = (item: TrendingItem) => {
    if (item.destinationUrl && item.destinationUrl.trim()) {
      const dest = item.destinationUrl.trim();
      if (dest.startsWith('http://') || dest.startsWith('https://')) {
        window.open(dest, '_blank', 'noopener,noreferrer');
        return;
      }
      if (dest.startsWith('/article/')) {
        const slug = dest.replace('/article/', '');
        const match = articles.find((a) => a.slug === slug || a.id === slug);
        if (match) {
          onSelectArticle(match);
          return;
        }
      }
      const directMatch = articles.find((a) => a.slug === dest || a.id === dest);
      if (directMatch) {
        onSelectArticle(directMatch);
        return;
      }
      if (dest.startsWith('/')) {
        window.history.pushState({}, '', dest);
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
      }
    }

    if (item.slug) {
      const match = articles.find((a) => a.slug === item.slug);
      if (match) {
        onSelectArticle(match);
        return;
      }
    }

    if (onSearchQuery) {
      onSearchQuery(item.title);
    } else {
      onOpenSearch();
    }
  };

  // Handle opinion click
  const handleSelectOpinion = (op: OpinionPiece) => {
    if (op.slug) {
      const match = articles.find((a) => a.slug === op.slug);
      if (match) {
        onSelectArticle(match);
        return;
      }
    }
    const authorMatch = authors.find((a) => a.name.toLowerCase().includes(op.authorName.toLowerCase()));
    if (authorMatch) {
      onSelectAuthor(authorMatch.id);
    }
  };

  // Helper to format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="bg-white text-slate-900 pb-16 space-y-8 sm:space-y-10">
      {/* 1. HERO SEARCH & BRAND BANNER (GOOGLE SEARCH TYPE VIEW) */}
      <HeroSearchBanner
        onSearchSubmit={handleHeroSearch}
        onFilterClick={handleFilterClick}
        articles={articles}
        onSelectArticle={onSelectArticle}
      />

      {/* 2. LIVE STORIES STATUS BAR */}
      <LiveStoriesBar
        stories={activeStoriesList}
        onSelectStory={(story) => setActiveStory(story)}
      />

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-14">
        {/* ACTIVE CATEGORY BANNER (If user navigated to a category or clicked View All on a section) */}
        {activeCategory !== 'all' && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs text-red-600 font-bold uppercase tracking-wider mb-1">
                <span>Category Archive</span>
                <span>•</span>
                <span>{filteredArticles.length} Stories Found</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-950">
                {activeCategory === 'Explainers'
                  ? 'Explainers & Deep Dives'
                  : activeCategory === 'Opinion'
                  ? 'Opinions & Guest Essays'
                  : `${activeCategory} News`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Comprehensive reporting, verified dispatches, and in-depth updates on {activeCategory}.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('all');
                  setIsViewingAllTopStories(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Show All News</span>
              </button>
            </div>
          </div>
        )}

        {/* TOP STORIES SECTION WITH CHANGE VIEW OPTION & VIEW ALL */}
        <section className="space-y-4 sm:space-y-6" id="top-stories-section">
          {/* Section Header with View Switcher & View All Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-950">
                  {activeCategory === 'all'
                    ? 'Top Stories'
                    : activeCategory === 'Explainers'
                    ? 'Explainers & Deep Dives'
                    : activeCategory === 'Opinion'
                    ? 'Opinions & Columns'
                    : `${activeCategory} Top Stories`}
                </h2>
                <div className="w-8 h-1 bg-red-600 rounded-full" />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {activeCategory === 'all'
                  ? "The day's most important stories, curated for you."
                  : `Real-time curated coverage in ${activeCategory}.`}
              </p>
            </div>

            {/* CONTROLS: VIEW SWITCHER + VIEW ALL TOGGLE */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Segmented View Mode Switcher */}
              <div
                className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs"
                role="group"
                aria-label="Change section layout view"
              >
                <button
                  type="button"
                  onClick={() => handleSetViewMode('bento')}
                  title="Bento Editorial View"
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'bento'
                      ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-red-600" />
                  <span className="hidden md:inline">Bento</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetViewMode('grid')}
                  title="3-Column Cards Grid View"
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 text-red-600" />
                  <span className="hidden md:inline">Grid</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetViewMode('list')}
                  title="Horizontal Editorial List View"
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5 text-red-600" />
                  <span className="hidden md:inline">List</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetViewMode('compact')}
                  title="High-Density Headline Wire View"
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'compact'
                      ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Rows className="w-3.5 h-3.5 text-red-600" />
                  <span className="hidden md:inline">Wire</span>
                </button>
              </div>

              {/* View All Option Button (Working Toggle for All Stories) */}
              <button
                type="button"
                onClick={() => {
                  setIsViewingAllTopStories((prev) => !prev);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  isViewingAllTopStories
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-white border-slate-300 text-slate-700 hover:text-red-700 hover:bg-slate-50'
                }`}
                title={isViewingAllTopStories ? 'Collapse to top curated stories' : 'View all published top stories'}
              >
                <span>
                  {isViewingAllTopStories
                    ? 'Curated Top Stories'
                    : `View All (${displayArticles.length})`}
                </span>
                <ArrowRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isViewingAllTopStories ? 'rotate-90 text-red-600' : 'group-hover:translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: BENTO VIEW (EDITORIAL FLAGSHIP) */}
          {viewMode === 'bento' && (
            <div className="space-y-8">
              {/* 3-Column Bento Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Lead Hero Article (5 cols) */}
                <div className="lg:col-span-5">
                  {heroArticle && (
                    <TopStoryHero
                      article={heroArticle}
                      onSelectArticle={onSelectArticle}
                    />
                  )}
                </div>

                {/* Middle Column: 4 Stacked Stories (4 cols) */}
                <div className="lg:col-span-4">
                  <StackedStories
                    articles={stackedArticles}
                    onSelectArticle={onSelectArticle}
                  />
                </div>

                {/* Right Column: Trending Now + Today's Insight (3 cols) */}
                <div className="lg:col-span-3">
                  <TrendingColumn
                    trending={trendingSettings.items}
                    sectionTitle={trendingSettings.sectionTitle}
                    isTrendingEnabled={trendingSettings.isEnabled}
                    insightArticle={insightArticle}
                    onSelectTrending={handleSelectTrending}
                    onSelectArticle={onSelectArticle}
                  />
                </div>
              </div>

              {/* Expanded "View All" remaining stories in Bento mode */}
              {isViewingAllTopStories && remainingArticles.length > 0 && (
                <div className="pt-6 border-t border-slate-200 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-950 flex items-center gap-2">
                      <span>More Stories in Desk</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-sans font-semibold">
                        {remainingArticles.length} additional stories
                      </span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {remainingArticles.map((art) => (
                      <article
                        key={art.id}
                        onClick={() => onSelectArticle(art)}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                            <NewsImage
                              src={art.featuredImage}
                              alt={art.headline}
                              category={art.category}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                              {art.category}
                            </div>
                            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-slate-200 text-[10px] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-300" />
                              <span>{art.readTimeMinutes || 4}m read</span>
                            </div>
                          </div>

                          <div className="p-4 space-y-2">
                            <div className="text-[11px] text-slate-500 font-medium">
                              {formatDate(art.publishedAt)}
                            </div>

                            <h4 className="text-sm sm:text-base font-bold font-serif text-slate-950 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                              {art.headline}
                            </h4>

                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {art.deck}
                            </p>
                          </div>
                        </div>

                        <div className="px-4 pb-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span>Staff Reporter</span>
                          <span className="text-red-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                            <span>Read</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: RESPONSIVE CARDS GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              {displayArticles.map((art) => (
                <article
                  key={art.id}
                  onClick={() => onSelectArticle(art)}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-48 w-full overflow-hidden bg-slate-900 relative">
                      <NewsImage
                        src={art.featuredImage}
                        alt={art.headline}
                        category={art.category}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                        {art.category}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-slate-200 text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span>{art.readTimeMinutes || 4}m read</span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{formatDate(art.publishedAt)}</span>
                        {art.isBreaking && (
                          <>
                            <span>•</span>
                            <span className="text-red-700 font-bold uppercase flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                              Breaking
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold font-serif text-slate-950 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                        {art.headline}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {art.deck}
                      </p>

                      {art.keyTakeaways && art.keyTakeaways.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 mt-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1 mb-0.5">
                            <Sparkles className="w-3 h-3" />
                            Key Takeaway
                          </div>
                          <p className="text-xs text-slate-700 line-clamp-1 italic">
                            "{art.keyTakeaways[0]}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate">Editorial Desk</span>
                    <span className="text-red-700 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* VIEW MODE 3: HORIZONTAL EDITORIAL LIST VIEW */}
          {viewMode === 'list' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {displayArticles.map((art) => (
                <article
                  key={art.id}
                  onClick={() => onSelectArticle(art)}
                  className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 hover:border-slate-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row items-start gap-4"
                >
                  <div className="w-full sm:w-56 md:w-64 h-44 sm:h-36 rounded-lg overflow-hidden shrink-0 bg-slate-900 relative">
                    <NewsImage
                      src={art.featuredImage}
                      alt={art.headline}
                      category={art.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                      {art.category}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2 flex flex-col justify-between h-full">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-bold text-red-700 uppercase tracking-wider">
                          {art.category}
                        </span>
                        <span>•</span>
                        <span>{formatDate(art.publishedAt)}</span>
                        <span>•</span>
                        <span>{art.readTimeMinutes || 4} min read</span>
                      </div>

                      <h3 className="text-base sm:text-xl font-bold font-serif text-slate-950 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                        {art.headline}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {art.deck}
                      </p>

                      {art.keyTakeaways && art.keyTakeaways.length > 0 && (
                        <p className="text-xs text-slate-500 italic line-clamp-1">
                          &ldquo;{art.keyTakeaways[0]}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>By Editorial Desk</span>
                      <span className="text-red-700 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        <span>Read Full Story</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* VIEW MODE 4: COMPACT DIGITAL WIRE ROWS */}
          {viewMode === 'compact' && (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs animate-in fade-in duration-200">
              {displayArticles.map((art, idx) => (
                <div
                  key={art.id}
                  onClick={() => onSelectArticle(art)}
                  className="p-3 sm:px-5 sm:py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group flex items-center justify-between gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider shrink-0 hidden sm:inline-block">
                      {art.category}
                    </span>

                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors truncate">
                        {art.headline}
                      </h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="sm:hidden font-semibold text-red-700">{art.category}</span>
                        <span className="sm:hidden">•</span>
                        <span>{formatDate(art.publishedAt)}</span>
                        <span>•</span>
                        <span>{art.readTimeMinutes || 4}m read</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs text-red-700 font-semibold hidden md:inline-block group-hover:translate-x-0.5 transition-transform">
                      Read
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* OPINIONS FULL FEED (If Opinion category is active) */}
        {activeCategory === 'Opinion' && (
          <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-xl font-bold font-serif text-slate-950">
              Featured Opinion Pieces &amp; Guest Columns
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SEED_OPINIONS.map((op) => (
                <div
                  key={op.id}
                  onClick={() => handleSelectOpinion(op)}
                  className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={op.authorAvatar}
                      alt={op.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{op.authorName}</div>
                      <div className="text-[10px] text-slate-500">Contributing Columnist</div>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold font-serif text-slate-900 hover:text-red-700 transition-colors line-clamp-3">
                    {op.title}
                  </h4>
                  <div className="text-xs font-bold text-red-700 flex items-center gap-1">
                    <span>Read Opinion</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* REUSABLE LEADERBOARD DISPLAY AD */}
        <BannerAd format="leaderboard" />

        {/* 4. EXPLORE BY CATEGORY (WITH EXPANDABLE DIRECTORY VIEW ALL) */}
        <CategoryGrid
          onSelectCategory={(cat) => {
            onSelectCategory(cat);
            const el = document.getElementById('top-stories-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          activeCategory={activeCategory}
        />

        {/* 5. TOP TRENDING SOCIAL MEDIA & TV NEWS */}
        <SocialTvTrendingSection
          onSelectTag={(tag) => {
            if (onSearchQuery) {
              onSearchQuery(tag);
            } else {
              onSelectCategory(tag.replace(/^#/, ''));
            }
          }}
        />

        {/* 6. BOTTOM SECTION: EXPLAINERS + OPINIONS + NEWSLETTER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start pt-2">
          {/* Left: Explainers Row (7 cols) */}
          <div className="lg:col-span-7">
            <ExplainersRow
              explainers={explainers}
              onSelectArticle={onSelectArticle}
              onViewAllExplainers={() => {
                onSelectCategory('Explainers');
                setIsViewingAllTopStories(true);
                const el = document.getElementById('top-stories-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            />
          </div>

          {/* Right: Opinions & Newsletter (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <OpinionsColumn
              opinions={SEED_OPINIONS}
              onSelectOpinion={handleSelectOpinion}
              onViewAllOpinions={() => {
                onSelectCategory('Opinion');
                const el = document.getElementById('top-stories-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            />

            <NewsletterBox />
          </div>
        </div>
      </div>

      {/* 7. INTERACTIVE WEB STORY MODAL */}
      {activeStory && (
        <StoryModal
          stories={activeStoriesList}
          currentStory={activeStory}
          onClose={() => setActiveStory(null)}
          onSelectStory={(story) => setActiveStory(story)}
          onSelectArticleSlug={(slug) => {
            const art = articles.find((a) => a.slug === slug);
            if (art) onSelectArticle(art);
          }}
        />
      )}
    </div>
  );
};
