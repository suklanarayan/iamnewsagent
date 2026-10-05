import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Flame,
  ExternalLink,
  Check,
  RefreshCw,
  X,
  CheckCircle2,
  Share2,
  Tv,
} from 'lucide-react';
import type { Article, Author, LiveStory, TrendingItem, OpinionPiece, SocialTvTrendingItem } from '../types';
import { HeroSearchBanner } from '../components/HeroSearchBanner';
import { FeatureRibbon } from '../components/FeatureRibbon';
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
import {
  SEED_LIVE_STORIES,
  SEED_OPINIONS,
} from '../data/seedData';
import { getTrendingSettings, TrendingSettings } from '../utils/trendingManager';
import { slugify } from '../utils/seo';
import {
  rewriteNewsWithGemini,
  resolveCuratedImageUrl,
  type RewrittenArticleResult,
} from '../services/aiNewsService';
import { createArticle } from '../services/articleRepository';

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

  // Dynamic Trending Settings State
  const [trendingSettings, setTrendingSettings] = useState<TrendingSettings>(() => getTrendingSettings());

  // Social Media & TV News AI Rewrite Modal State
  const [rewriteTarget, setRewriteTarget] = useState<SocialTvTrendingItem | null>(null);
  const [isRewritingTarget, setIsRewritingTarget] = useState<boolean>(false);
  const [rewrittenStory, setRewrittenStory] = useState<RewrittenArticleResult | null>(null);
  const [isPublishingRewrite, setIsPublishingRewrite] = useState<boolean>(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);

  // Trigger Gemini AI Rewrite for trending social/TV item
  const handleOpenAiRewriteFromTrend = async (item: SocialTvTrendingItem) => {
    setRewriteTarget(item);
    setRewrittenStory(null);
    setPublishSuccessMsg(null);
    setIsRewritingTarget(true);

    try {
      const result = await rewriteNewsWithGemini({
        headline: item.title,
        rawText: item.summary,
        sourceName: item.sourceName,
        preferredCategory: item.category,
      });
      setRewrittenStory(result);
    } catch (err) {
      console.error('AI rewrite from trend failed:', err);
    } finally {
      setIsRewritingTarget(false);
    }
  };

  // 1-Click Publish Rewritten Trending Story to Site
  const handlePublishRewrittenToSite = async () => {
    if (!rewriteTarget || !rewrittenStory) return;
    setIsPublishingRewrite(true);
    try {
      const authorId = authors[0]?.id || 'author-1';
      const cleanSlug = slugify(rewrittenStory.headline);
      const now = new Date().toISOString();
      const coverImg =
        rewriteTarget.imageUrl ||
        resolveCuratedImageUrl(rewrittenStory.category, rewrittenStory.imageTopic);

      const newArticle = await createArticle({
        headline: rewrittenStory.headline,
        deck: rewrittenStory.deck,
        slug: cleanSlug,
        category: (rewrittenStory.category as any) || (rewriteTarget.category as any) || 'Technology',
        articleType: 'standard',
        authorId,
        publishedAt: now,
        updatedAt: now,
        readTimeMinutes: rewrittenStory.readTimeMinutes || 4,
        featuredImage: coverImg,
        imageCaption: rewrittenStory.imageCaption || `Viral discussions around ${rewriteTarget.title}`,
        keyTakeaways: rewrittenStory.keyTakeaways || [],
        content: rewrittenStory.content,
        tags: Array.from(new Set([...(rewrittenStory.tags || []), rewriteTarget.hashtag || 'Trending', rewriteTarget.platform])),
        isBreaking: rewriteTarget.isLiveBroadcast || false,
        sourceType: 'social',
        sourceName: rewriteTarget.sourceName,
        sourceUrl: rewriteTarget.url,
        status: 'published',
      });

      setPublishSuccessMsg('Published to live feed successfully! Opening article...');
      setTimeout(() => {
        setRewriteTarget(null);
        setRewrittenStory(null);
        setPublishSuccessMsg(null);
        onSelectArticle(newArticle);
      }, 900);
    } catch (err) {
      console.error('Publish error:', err);
      alert('Failed to publish: ' + (err as Error).message);
    } finally {
      setIsPublishingRewrite(false);
    }
  };

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

  // Filter articles based on activeCategory
  // Strictly sort articles by publication date (newest published timestamp always first)
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
  );

  const filteredArticles =
    activeCategory === 'all'
      ? sortedArticles
      : sortedArticles.filter((a) => a.category === activeCategory);

  // Lead hero article is ALWAYS the newest published article in front first
  const heroArticle = filteredArticles[0];

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
        stories={activeStoriesList}
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
                trending={trendingSettings.items}
                sectionTitle={trendingSettings.sectionTitle}
                isTrendingEnabled={trendingSettings.isEnabled}
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

        {/* 5.5 TOP TRENDING SOCIAL MEDIA & TV NEWS (Fusion of Modern News) */}
        <SocialTvTrendingSection
          onSelectTag={(tag) => {
            if (onSearchQuery) {
              onSearchQuery(tag);
            } else {
              onSelectCategory(tag.replace(/^#/, ''));
            }
          }}
          onOpenAiRewriteModal={handleOpenAiRewriteFromTrend}
        />

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

      {/* 8. AI REWRITE & FUSION NEWS MODAL */}
      {rewriteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold font-serif">
                      AI News Fusion & Rewrite
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      100% Original
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Transforming raw viral social radar & TV wire into structured journalistic reporting
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRewriteTarget(null);
                  setRewrittenStory(null);
                  setPublishSuccessMsg(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Wire Source Brief */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    {rewriteTarget.platform === 'tv' && <Tv className="w-3.5 h-3.5 text-red-600" />}
                    {rewriteTarget.platform === 'x' && <span className="font-bold text-xs">𝕏</span>}
                    {rewriteTarget.platform === 'facebook' && <Share2 className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{rewriteTarget.sourceName}</span>
                  </span>
                  <span className="font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    {rewriteTarget.hashtag}
                  </span>
                </div>
                <p className="text-slate-700 font-medium">{rewriteTarget.title}</p>
                <p className="text-slate-500 text-[11px] leading-relaxed">{rewriteTarget.summary}</p>
              </div>

              {/* Rewriting Progress State */}
              {isRewritingTarget && (
                <div className="p-8 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-900">
                    Synthesizing with Gemini AI...
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Analyzing public sentiment, cross-checking TV digital broadcasts, and drafting complete journalistic prose.
                  </p>
                </div>
              )}

              {/* Rewritten Story Preview */}
              {!isRewritingTarget && rewrittenStory && (
                <div className="space-y-4">
                  {publishSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{publishSuccessMsg}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded">
                      {rewrittenStory.category || 'Technology'}
                    </span>
                    <h4 className="text-xl sm:text-2xl font-bold font-serif text-slate-950 leading-snug">
                      {rewrittenStory.headline}
                    </h4>
                    <p className="text-sm text-slate-600 italic">
                      {rewrittenStory.deck}
                    </p>
                  </div>

                  {rewrittenStory.keyTakeaways && rewrittenStory.keyTakeaways.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        Key Intelligence Takeaways:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-200 list-disc list-inside">
                        {rewrittenStory.keyTakeaways.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700">Full Article Content Preview:</span>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                      {rewrittenStory.content}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <a
                href={rewriteTarget.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
              >
                <span>Original Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRewriteTarget(null);
                    setRewrittenStory(null);
                    setPublishSuccessMsg(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-slate-700 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                {rewrittenStory && (
                  <button
                    type="button"
                    onClick={handlePublishRewrittenToSite}
                    disabled={isPublishingRewrite || !!publishSuccessMsg}
                    className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isPublishingRewrite ? 'Publishing...' : 'Publish to Live Site'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
