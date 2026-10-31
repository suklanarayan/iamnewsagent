import React, { useEffect, useState, useRef } from 'react';
import {
  Clock,
  Eye,
  Calendar,
  User,
  Share2,
  Check,
  Twitter,
  Linkedin,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Volume2,
  VolumeX,
  Globe,
  Compass,
  Sparkles,
  TrendingUp,
  Flame,
  ChevronRight,
  Layers,
} from 'lucide-react';
import type { Article, Author } from '../types';
import { KeyTakeawaysBlock } from '../components/KeyTakeawaysBlock';
import { BannerAd } from '../components/BannerAd';
import { injectArticleSchema, removeArticleSchema } from '../utils/seo';
import { getStatusMeta, formatTimeAgo } from '../utils/statusUtils';
import { NewsImage } from '../components/NewsImage';

interface ArticleViewProps {
  article: Article;
  author: Author | null;
  relatedArticles: Article[];
  allArticles?: Article[];
  onBackToFeed: () => void;
  onSelectArticle: (article: Article) => void;
  onSelectAuthor: (authorId: string) => void;
  onSelectCategory: (category: string) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  author,
  relatedArticles,
  allArticles = [],
  onBackToFeed,
  onSelectArticle,
  onSelectAuthor,
  onSelectCategory,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSpeakingFull, setIsSpeakingFull] = useState(false);

  // Canonical news site URL structure
  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/news/${article.slug}`
    : `https://iamquickagent.com/news/${article.slug}`;

  // Track the active article ID to prevent rogue auto-scroll resets during background sync
  const activeArticleIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only scroll to top when user actually navigates to a DIFFERENT article ID
    if (activeArticleIdRef.current !== article.id) {
      activeArticleIdRef.current = article.id;
      window.scrollTo(0, 0);
    }
  }, [article.id]);

  // Dynamically inject JSON-LD NewsArticle & Breadcrumbs schema markup without affecting scroll
  useEffect(() => {
    injectArticleSchema(article, author, currentUrl);

    return () => {
      removeArticleSchema();
    };
  }, [article, author, currentUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`"${article.headline}" via @iamnewsagent`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const toggleFullArticleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }
    if (isSpeakingFull) {
      window.speechSynthesis.cancel();
      setIsSpeakingFull(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = `${article.headline}. Published by ${author?.name || 'iamnewsagent'}. Key Takeaways: ${article.keyTakeaways.join('. ')}. ${article.content.replace(/[#*`]/g, '')}`;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeakingFull(false);
    utterance.onerror = () => setIsSpeakingFull(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeakingFull(true);
  };

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedUpdatedDate =
    article.updatedAt &&
    new Date(article.updatedAt).getTime() > new Date(article.publishedAt).getTime() + 60000
      ? new Date(article.updatedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

  // 1. Articles strictly matching this category (excluding current)
  const categoryArticles = (allArticles.length > 0 ? allArticles : relatedArticles).filter(
    (a) => a.id !== article.id && a.category?.toLowerCase() === article.category?.toLowerCase()
  );

  // 2. Cross-category dispatches from other desks
  const otherDeskArticles = (allArticles.length > 0 ? allArticles : relatedArticles).filter(
    (a) => a.id !== article.id && a.category?.toLowerCase() !== article.category?.toLowerCase()
  );

  // 3. Recommended related articles for bottom grid:
  // If we have >= 4 from the same category, use top 4.
  // Otherwise, combine whatever category stories exist with top stories from other desks up to 4 stories!
  const bottomRecommendedStories = [
    ...categoryArticles,
    ...otherDeskArticles,
  ].slice(0, 4);

  // 4. Sidebar related & trending stories (up to 3)
  const sidebarStories = [
    ...categoryArticles,
    ...otherDeskArticles,
  ].slice(0, 3);

  // 5. Next recommended story (next in feed to read)
  const nextStory = categoryArticles[0] || otherDeskArticles[0] || null;

  // 6. Trending Wire Across All Desks (4 top stories excluding current and bottomRecommended)
  const trendingDeskStories = (allArticles.length > 0 ? allArticles : relatedArticles)
    .filter(
      (a) =>
        a.id !== article.id &&
        !bottomRecommendedStories.some((s) => s.id === a.id)
    )
    .slice(0, 4);

  // Major categories directory for continuous browsing
  const DESK_CATEGORIES = [
    { name: 'India', desc: 'National politics, policy & parliament', icon: '🇮🇳' },
    { name: 'World', desc: 'Global geopolitics & diplomacy', icon: '🌐' },
    { name: 'Business', desc: 'Markets, corporate & economy', icon: '📈' },
    { name: 'Technology', desc: 'AI, cyber defense & computing', icon: '💻' },
    { name: 'Science', desc: 'Space exploration & breakthroughs', icon: '🔬' },
    { name: 'Health', desc: 'Public health & medical discoveries', icon: '🏥' },
    { name: 'Sports', desc: 'Cricket, football & tournaments', icon: '🏏' },
    { name: 'Entertainment', desc: 'Cinema, streaming & culture', icon: '🎬' },
    { name: 'Explainers', desc: 'Context, deep dives & history', icon: '💡' },
    { name: 'Opinion', desc: 'Editorials & analyst columns', icon: '✍️' },
  ];

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      {/* Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="border-b border-slate-200 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-slate-500">
          <ol className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
            <li>
              <button
                type="button"
                onClick={onBackToFeed}
                className="hover:text-red-700 transition-colors"
              >
                Home
              </button>
            </li>
            <li aria-hidden="true" className="text-slate-300">/</li>
            <li>
              <button
                type="button"
                onClick={() => onSelectCategory(article.category)}
                className="hover:text-red-700 transition-colors"
              >
                {article.category}
              </button>
            </li>
            <li aria-hidden="true" className="text-slate-300">/</li>
            <li className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
              {article.headline}
            </li>
          </ol>

          <button
            type="button"
            onClick={onBackToFeed}
            className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-red-700 ml-4 flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Wire</span>
          </button>
        </div>
      </nav>

      {/* Main Semantic Article Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Article Body (8 cols) */}
          <article className="lg:col-span-8 space-y-6">
            {/* Category Tag & Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => onSelectCategory(article.category)}
                className="px-2.5 py-1 rounded-md bg-red-700 text-white font-bold uppercase tracking-wider text-[10px]"
              >
                {article.category}
              </button>
              {article.articleType === 'announcement' && (
                <span className="px-2.5 py-1 rounded-md bg-blue-700 text-white font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 shadow-xs">
                  <span>📢</span>
                  <span>Official Announcement</span>
                </span>
              )}
              {article.articleType === 'investigation' && (
                <span className="px-2.5 py-1 rounded-md bg-amber-700 text-white font-bold uppercase tracking-wider text-[10px] shadow-xs">
                  Exclusive Investigation
                </span>
              )}
              {article.articleType === 'opinion' && (
                <span className="px-2.5 py-1 rounded-md bg-purple-700 text-white font-bold uppercase tracking-wider text-[10px] shadow-xs">
                  Analysis & Op-Ed
                </span>
              )}
              {article.articleType === 'live_coverage' && (
                <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>Live Wire Dispatch</span>
                </span>
              )}
              {article.articleType === 'research' && (
                <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white font-bold uppercase tracking-wider text-[10px] shadow-xs">
                  Research Digest
                </span>
              )}
              {article.isBreaking && (
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                  FLASH
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTimeMinutes} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {(article.views || 1).toLocaleString()} views
              </span>
            </div>

            {/* EDITORIAL LIFECYCLE STATUS BANNER (for draft, review, scheduled, unlisted, archived, retracted) */}
            {article.status && article.status !== 'published' && (() => {
              const meta = getStatusMeta(article.status);
              const StatusIcon = meta.icon;
              return (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs font-intel ${meta.colorClass.bg} ${meta.colorClass.border}`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${meta.colorClass.badge}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold uppercase tracking-wider text-[11px] ${meta.colorClass.text}`}>
                        {meta.label}
                      </span>
                      {article.status === 'scheduled' && article.scheduledPublishAt && (
                        <span className="font-mono text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-slate-300">
                          Embargo until: {new Date(article.scheduledPublishAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {meta.description}
                    </p>
                    {article.status === 'review' && article.reviewNotes && (
                      <p className="text-slate-800 bg-amber-100/70 p-2 rounded border border-amber-300/60 font-mono text-[11px]">
                        <strong>Desk Notes:</strong> {article.reviewNotes}
                      </p>
                    )}
                    {article.status === 'withdrawn' && article.retractionReason && (
                      <p className="text-red-900 bg-red-100/80 p-2 rounded border border-red-300/80 font-mono text-[11px]">
                        <strong>Retraction Notice:</strong> {article.retractionReason}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-slate-950 leading-[1.15]">
              {article.headline}
            </h1>

            {/* Subheadline / Deck */}
            {article.deck && (
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-editorial italic">
                {article.deck}
              </p>
            )}

            {/* Author Byline & Publishing Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-200">
              {author ? (
                <button
                  type="button"
                  onClick={() => onSelectAuthor(author.id)}
                  className="flex items-center gap-3 text-left group"
                >
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                      <span>{author.name}</span>
                      {author.verified && (
                        <ShieldCheck className="w-4 h-4 text-red-600" title="Verified Correspondent" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {author.role} &bull; {formattedDate}
                      {formattedUpdatedDate && (
                        <span className="text-slate-400 font-intel ml-1.5">
                          (Updated: {formattedUpdatedDate})
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ) : (
                <div className="text-xs text-slate-500">
                  Published by <span className="font-bold text-slate-900">iamnewsagent Bureau</span> &bull; {formattedDate}
                  {formattedUpdatedDate && (
                    <span className="text-slate-400 font-intel ml-1.5">
                      (Updated: {formattedUpdatedDate})
                    </span>
                  )}
                </div>
              )}

              {/* Share and Audio Synthesizer */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFullArticleAudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  {isSpeakingFull ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-red-600" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-slate-700" />
                      <span>Listen to Report</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareTwitter}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                  title="Share to X / Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleShareLinkedIn}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                  title="Share to LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                  title="Copy Permalink"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SOURCE ATTRIBUTION & INTEGRITY BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-intel">
              <div className="flex flex-wrap items-center gap-2 text-slate-700">
                <span className="font-bold flex items-center gap-1.5 text-slate-900">
                  <Globe className="w-3.5 h-3.5 text-red-600" />
                  <span>Origin & Source:</span>
                </span>
                <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                  {article.sourceName || 'Editorial Desk (Original Reporting)'}
                </span>
                {article.sourceType && (
                  <span className="text-[11px] text-slate-500 font-medium capitalize">
                    &bull; {article.sourceType.replace('_', ' ')}
                  </span>
                )}
              </div>

              {article.sourceUrl && (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-red-700 hover:text-red-800 font-semibold text-xs transition-colors shadow-xs"
                >
                  <span>Primary Document / Wire</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* MANDATORY KEY TAKEAWAY SUMMARY BLOCK (FOR AEO / ANSWER ENGINES) */}
            <KeyTakeawaysBlock
              takeaways={article.keyTakeaways}
              headline={article.headline}
            />

            {/* Featured Image (Zero CLS with aspect-video and width/height) */}
            {article.featuredImage && (
              <figure className="space-y-2">
                <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-video w-full border border-slate-200">
                  <NewsImage
                    src={article.featuredImage}
                    alt={article.headline}
                    category={article.category}
                    aspectRatio="16:9"
                    width={1200}
                    height={675}
                    priority={true}
                    className="w-full h-full object-cover"
                  />
                </div>
                {article.imageCaption && (
                  <figcaption className="text-xs text-slate-500 font-editorial italic px-1">
                    {article.imageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Semantic Article Body Content */}
            <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans text-base space-y-4 pt-4">
              {article.content.split('\n\n').map((paragraph, idx) => {
                const trimmed = paragraph.trim();

                // Markdown Image Tag: ![caption](url)
                if (trimmed.startsWith('![') && trimmed.includes('](')) {
                  const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
                  if (imgMatch) {
                    const caption = imgMatch[1];
                    const src = imgMatch[2];
                    return (
                      <figure key={idx} className="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                        <div className="aspect-video w-full overflow-hidden bg-slate-900">
                          <img
                            src={src}
                            alt={caption || 'Article Visual'}
                            width={1200}
                            height={675}
                            style={{ aspectRatio: '16/9' }}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        {caption && (
                          <figcaption className="p-2.5 text-xs text-slate-500 font-editorial italic bg-slate-50 border-t border-slate-100 text-center">
                            {caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }
                }

                if (paragraph.startsWith('## ')) {
                  return (
                    <h2
                      key={idx}
                      className="text-xl sm:text-2xl font-bold font-serif text-slate-950 pt-4 pb-1 border-b border-slate-100"
                    >
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }

                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote
                      key={idx}
                      className="p-4 rounded-xl border-l-4 border-red-600 bg-red-50/40 text-slate-900 font-serif italic text-base my-4"
                    >
                      {paragraph.replace('> ', '')}
                    </blockquote>
                  );
                }

                // Render in-article display banner ad halfway through
                if (idx === 2) {
                  return (
                    <React.Fragment key={idx}>
                      <p className="text-slate-700 leading-relaxed">{paragraph}</p>
                      <BannerAd format="native-inline" />
                    </React.Fragment>
                  );
                }

                return (
                  <p key={idx} className="text-slate-700 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* EDITORIAL ATTRIBUTION & TRANSPARENCY DISCLOSURE */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2 text-xs text-slate-600 font-intel">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span>Reporting Provenance & Editorial Disclosure</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  iamnewsagent Verification Standard
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                This dispatch is categorized under <strong className="text-slate-900 capitalize">{article.articleType || 'Standard News'}</strong>.
                {article.sourceType === 'original' ? (
                  <> Sourced via <strong className="text-slate-900">Original Desk Reporting & First-Hand Intelligence</strong>.</>
                ) : (
                  <> Sourced from <strong className="text-slate-900">{article.sourceName || 'External Wire'}</strong> ({article.sourceType || 'news agency'}).</>
                )}
                {article.sourceUrl && (
                  <> Readers can inspect the primary reference directly via{' '}
                    <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline font-semibold inline-flex items-center gap-0.5">
                      <span>external publication</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>.
                  </>
                )}
              </p>
            </div>

            {/* Article Tags */}
            <div className="pt-6 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Filed Under Topics:
              </div>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => onSelectCategory(article.category)}
                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Read Next Recommended Story Card */}
            {nextStory && (
              <div className="pt-6 border-t border-slate-200">
                <div
                  onClick={() => onSelectArticle(nextStory)}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-md hover:shadow-lg transition-all cursor-pointer group border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-800 relative">
                      <NewsImage
                        src={nextStory.featuredImage}
                        alt={nextStory.headline}
                        category={nextStory.category}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                          Next Story
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {nextStory.category} • {formatTimeAgo(nextStory.publishedAt)}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-serif font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                        {nextStory.headline}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-1 leading-relaxed">
                        {nextStory.deck}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/10">
                    <span>Read Next</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* Right Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Author Profile Card */}
            {author && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-14 h-14 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 font-serif text-base">
                      {author.name}
                    </h3>
                    <p className="text-xs text-slate-600">{author.role}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{author.location}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {author.bio}
                </p>

                <button
                  type="button"
                  onClick={() => onSelectAuthor(author.id)}
                  className="w-full py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  View All Stories by {author.name.split(' ')[0]}
                </button>
              </div>
            )}

            {/* Reusable MPU Display Ad Placeholder */}
            <BannerAd format="mpu" />

            {/* Related & Recommended Stories Box (Always Populated with Same Category or Trending Cross-Desk) */}
            {sidebarStories.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold font-serif text-slate-950 text-base">
                    {categoryArticles.length > 0 ? `Related in ${article.category}` : 'Trending News'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(article.category)}
                    className="text-[11px] font-semibold text-red-700 hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {sidebarStories.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectArticle(rel)}
                      className="py-3 flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 relative">
                        <NewsImage
                          src={rel.featuredImage}
                          alt={rel.headline}
                          category={rel.category}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px] font-bold uppercase tracking-wider">
                            {rel.category}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatTimeAgo(rel.publishedAt)}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold font-serif text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                          {rel.headline}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {rel.readTimeMinutes || 4} min read
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* High-Velocity Wire Headlines in Sidebar */}
            {trendingDeskStories.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Flame className="w-4 h-4 text-red-600" />
                  <h3 className="font-bold font-serif text-slate-950 text-sm">
                    Wire Dispatches Right Now
                  </h3>
                </div>
                <div className="divide-y divide-slate-200/60">
                  {trendingDeskStories.map((wire, idx) => (
                    <div
                      key={wire.id}
                      onClick={() => onSelectArticle(wire)}
                      className="py-2.5 flex items-start gap-3 group cursor-pointer"
                    >
                      <span className="text-xs font-mono font-bold text-red-700/80 shrink-0 mt-0.5">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 block">
                          {wire.category}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                          {wire.headline}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* COMPREHENSIVE BOTTOM RELATED NEWS & EXPLORATION HUB */}
        {/* ------------------------------------------------------------- */}
        <section className="mt-14 pt-10 border-t-2 border-slate-200 space-y-12" aria-label="Related and Category News">
          {/* 1. RELATED & RELEVANT NEWS GRID */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif text-slate-950">
                    {categoryArticles.length >= 3
                      ? `More from ${article.category}`
                      : `Related Stories & Top Desk Dispatches`}
                  </h3>
                  <div className="w-8 h-1 bg-red-600 rounded-full" />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Continuous reporting, field dispatches, and key developments from our journalists.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectCategory(article.category)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                <span>Browse All {article.category}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4-Card Editorial News Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bottomRecommendedStories.map((story) => (
                <article
                  key={story.id}
                  onClick={() => onSelectArticle(story)}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                      <NewsImage
                        src={story.featuredImage}
                        alt={story.headline}
                        category={story.category}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                        {story.category}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-slate-200 text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span>{story.readTimeMinutes || 4}m read</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{formatTimeAgo(story.publishedAt)}</span>
                        {story.isBreaking && (
                          <>
                            <span>•</span>
                            <span className="text-red-700 font-bold uppercase">Breaking</span>
                          </>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold font-serif text-slate-950 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                        {story.headline}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {story.deck}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px]">Editorial Desk</span>
                    <span className="text-red-700 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1 text-[11px]">
                      <span>Read Story</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* 2. EXPLORE MORE CATEGORIES & BEATS HUB */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-red-600" />
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-950">
                    Explore More News Categories &amp; Desks
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Dive into focused reporting and verified dispatches across all our major beats.
                </p>
              </div>

              <button
                type="button"
                onClick={onBackToFeed}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
              >
                Back to Front Page
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {DESK_CATEGORIES.map((cat) => {
                const count = allArticles.filter(
                  (a) => a.category?.toLowerCase() === cat.name.toLowerCase()
                ).length;
                const isCurrent = article.category?.toLowerCase() === cat.name.toLowerCase();

                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => onSelectCategory(cat.name)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-red-50/80 border-red-300 ring-2 ring-red-600/20'
                        : 'bg-white border-slate-200 hover:border-red-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">{cat.icon}</span>
                        {count > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-red-100 group-hover:text-red-700 transition-colors">
                            {count}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-red-700 transition-colors">
                        {cat.name}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-snug">
                        {cat.desc}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-slate-400 group-hover:text-red-700 transition-colors">
                      <span>Explore</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. TRENDING WIRE HEADLINES ACROSS THE NEWSROOM */}
          {trendingDeskStories.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <h4 className="text-base sm:text-lg font-bold font-serif text-slate-950">
                  Trending Wire Across All Desks
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingDeskStories.map((trend) => (
                  <div
                    key={trend.id}
                    onClick={() => onSelectArticle(trend)}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold uppercase tracking-wider text-red-700">
                          {trend.category}
                        </span>
                        <span>{formatTimeAgo(trend.publishedAt)}</span>
                      </div>
                      <h5 className="text-xs sm:text-sm font-bold font-serif text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                        {trend.headline}
                      </h5>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{trend.readTimeMinutes || 4}m read</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-red-700 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
