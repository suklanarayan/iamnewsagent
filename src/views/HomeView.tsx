import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Article, Author, LiveStory, TrendingItem, OpinionPiece } from '../types';
import { HeroSearchBanner } from '../components/HeroSearchBanner';
import { FeatureRibbon } from '../components/FeatureRibbon';
import { LiveStoriesBar } from '../components/LiveStoriesBar';
import { StoryModal } from '../components/StoryModal';
import { TopStoryHero } from '../components/TopStoryHero';
import { StackedStories } from '../components/StackedStories';
import { TrendingColumn } from '../components/TrendingColumn';
import { CategoryGrid } from '../components/CategoryGrid';
import { ExplainersRow } from '../components/ExplainersRow';
import { OpinionsColumn } from '../components/OpinionsColumn';
import { NewsletterBox } from '../components/NewsletterBox';
import { BannerAd } from '../components/BannerAd';
import {
  SEED_LIVE_STORIES,
  SEED_TRENDING_NOW,
  SEED_OPINIONS,
} from '../data/seedData';

interface HomeViewProps {
  articles: Article[];
  authors: Author[];
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
  activeCategory,
  onSelectCategory,
  onSelectArticle,
  onSelectAuthor,
  onOpenSearch,
  onSearchQuery,
}) => {
  // Live stories modal state
  const [activeStory, setActiveStory] = useState<LiveStory | null>(null);

  // Filter articles based on activeCategory
  const filteredArticles =
    activeCategory === 'all'
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  // Identify lead hero article (Space Ambitions or breaking)
  const heroArticle =
    filteredArticles.find((a) => a.isBreaking) ||
    filteredArticles.find((a) => a.slug === 'india-space-ambitions-reach-new-heights') ||
    filteredArticles[0];

  // Middle stacked stories (up to 4 articles excluding hero)
  const stackedArticles = filteredArticles
    .filter((a) => a.id !== heroArticle?.id && !a.isExplainer)
    .slice(0, 4);

  // Today's Insight article (Durga Puja explainer or first explainer)
  const insightArticle =
    articles.find((a) => a.slug === 'durga-puja-2025-tradition-culture-modern-kolkata') ||
    articles.find((a) => a.isExplainer) ||
    articles[1];

  // Explainers for row
  const explainers = articles.filter((a) => a.isExplainer || a.category === 'Explainers');

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
  };

  // Handle trending item click
  const handleSelectTrending = (item: TrendingItem) => {
    if (item.slug) {
      const match = articles.find((a) => a.slug === item.slug);
      if (match) {
        onSelectArticle(match);
        return;
      }
    }
    onOpenSearch();
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

  return (
    <div className="bg-white text-slate-900 pb-16 space-y-8 sm:space-y-10">
      {/* 1. HERO SEARCH & BRAND BANNER (EARTH FROM SPACE) */}
      <HeroSearchBanner
        onSearchSubmit={handleHeroSearch}
        onFilterClick={handleFilterClick}
      />

      {/* 2. VALUE PROPOSITION FEATURE RIBBON */}
      <FeatureRibbon />

      {/* 3. LIVE STORIES INSTAGRAM-STYLE STATUS BAR */}
      <LiveStoriesBar
        stories={SEED_LIVE_STORIES}
        onSelectStory={(story) => setActiveStory(story)}
      />

      {/* 4. MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-14">
        {/* TOP STORIES SECTION */}
        <section className="space-y-4 sm:space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-950">
                  Top Stories
                </h2>
                <div className="w-8 h-1 bg-red-600 rounded-full" />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                The day's most important stories, curated for you.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="text-xs font-semibold text-slate-700 hover:text-red-700 flex items-center gap-1 transition-colors group cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 3-COLUMN BENTO GRID MATCHING MOCKUP */}
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
                trending={SEED_TRENDING_NOW}
                insightArticle={insightArticle}
                onSelectTrending={handleSelectTrending}
                onSelectArticle={onSelectArticle}
              />
            </div>
          </div>
        </section>

        {/* REUSABLE LEADERBOARD DISPLAY AD */}
        <BannerAd format="leaderboard" />

        {/* 5. EXPLORE BY CATEGORY */}
        <CategoryGrid onSelectCategory={onSelectCategory} />

        {/* 6. BOTTOM SECTION: EXPLAINERS + OPINIONS + NEWSLETTER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start pt-2">
          {/* Left: Explainers Row (7 cols) */}
          <div className="lg:col-span-7">
            <ExplainersRow
              explainers={explainers}
              onSelectArticle={onSelectArticle}
              onViewAllExplainers={() => onSelectCategory('Explainers')}
            />
          </div>

          {/* Right: Opinions & Newsletter (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <OpinionsColumn
              opinions={SEED_OPINIONS}
              onSelectOpinion={handleSelectOpinion}
              onViewAllOpinions={() => onSelectCategory('Opinion')}
            />

            <NewsletterBox />
          </div>
        </div>
      </div>

      {/* INTERACTIVE WEB STORY MODAL */}
      {activeStory && (
        <StoryModal
          stories={SEED_LIVE_STORIES}
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
