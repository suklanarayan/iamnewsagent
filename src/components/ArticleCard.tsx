import React from 'react';
import { Clock, Eye, Sparkles, User, ArrowRight, Zap } from 'lucide-react';
import type { Article, Author } from '../types';
import { KeyTakeawaysBlock } from './KeyTakeawaysBlock';

interface ArticleCardProps {
  article: Article;
  author?: Author | null;
  variant?: 'hero' | 'grid' | 'compact' | 'horizontal';
  onSelect: (article: Article) => void;
  onSelectAuthor?: (authorId: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  author,
  variant = 'grid',
  onSelect,
  onSelectAuthor,
}) => {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Variant 1: Breaking News Hero Card (with mandatory Key Takeaway summary block)
  if (variant === 'hero') {
    return (
      <article
        id={`hero-article-${article.id}`}
        className="relative bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl transition-all hover:border-slate-700"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Hero Image Container */}
          <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-full min-h-[340px] overflow-hidden group cursor-pointer" onClick={() => onSelect(article)}>
            <img
              src={article.featuredImage}
              alt={article.headline}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent lg:hidden" />
            
            {/* Breaking Flash Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-red-600/90 text-white font-intel font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <Zap className="w-3.5 h-3.5 fill-white" />
                Breaking Intelligence Hero
              </span>
              <span className="px-2 py-1 rounded-full bg-slate-900/80 text-amber-400 border border-amber-500/30 font-intel font-medium text-xs backdrop-blur-sm">
                {article.category}
              </span>
            </div>

            {article.imageCaption && (
              <div className="absolute bottom-3 left-4 right-4 text-[11px] text-slate-300/80 font-intel bg-slate-950/60 backdrop-blur px-2.5 py-1 rounded truncate hidden sm:block">
                {article.imageCaption}
              </div>
            )}
          </div>

          {/* Hero Content Column */}
          <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between bg-gradient-to-b from-slate-900 to-[#0c0e14]">
            <div>
              {/* Category & Meta */}
              <div className="hidden lg:flex items-center gap-2 mb-3">
                <span className="text-xs font-intel font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {article.category}
                </span>
                <span className="text-xs font-intel text-slate-400">
                  {formattedDate}
                </span>
              </div>

              {/* Headline */}
              <h2
                onClick={() => onSelect(article)}
                className="text-xl sm:text-2xl lg:text-3xl font-bold font-editorial text-slate-100 hover:text-amber-400 cursor-pointer transition-colors leading-tight mb-3"
              >
                {article.headline}
              </h2>

              {/* Subheadline Deck */}
              <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed mb-5">
                {article.deck}
              </p>

              {/* Mandatory Key Takeaway Summary Block in Hero */}
              <KeyTakeawaysBlock
                takeaways={article.keyTakeaways}
                headline={article.headline}
                isHero={true}
              />
            </div>

            {/* Author Byline & CTA */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 mt-4">
              <div
                onClick={() => onSelectAuthor && onSelectAuthor(article.authorId)}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                {author?.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-9 h-9 rounded-full object-cover border border-amber-500/30 group-hover:border-amber-400 transition-colors"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                    {author?.name || 'Intelligence Correspondent'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-intel">
                    {article.readTimeMinutes} min brief &bull; {article.views.toLocaleString()} views
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelect(article)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-intel font-bold text-xs transition-all shadow-md shadow-amber-500/20"
              >
                <span>Read Full Wire</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Variant 2: Standard Category Grid Card
  if (variant === 'grid') {
    return (
      <article
        id={`grid-article-${article.id}`}
        className="bg-slate-900/80 rounded-xl border border-slate-800 hover:border-slate-700 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 group"
      >
        <div>
          {/* Card Image */}
          <div
            className="relative h-48 overflow-hidden cursor-pointer"
            onClick={() => onSelect(article)}
          >
            <img
              src={article.featuredImage}
              alt={article.headline}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-amber-400 font-intel font-semibold text-[11px] border border-amber-500/20 backdrop-blur-sm">
                {article.category}
              </span>
              {article.isBreaking && (
                <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-intel font-bold text-[10px] uppercase">
                  Flash
                </span>
              )}
            </div>
            <div className="absolute bottom-2 right-3 text-[11px] font-intel text-slate-300 flex items-center gap-1 bg-slate-950/60 backdrop-blur px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              {article.readTimeMinutes}m
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 sm:p-5">
            <h3
              onClick={() => onSelect(article)}
              className="text-base sm:text-lg font-bold font-editorial text-slate-100 group-hover:text-amber-400 cursor-pointer transition-colors leading-snug line-clamp-2 mb-2"
            >
              {article.headline}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed mb-3">
              {article.deck}
            </p>

            {/* Key Takeaway snippet preview */}
            {article.keyTakeaways && article.keyTakeaways.length > 0 && (
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-3">
                <div className="flex items-center gap-1 text-[10px] font-intel font-bold text-amber-400 uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" />
                  Key Takeaway
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 italic">
                  "{article.keyTakeaways[0]}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-intel">
          <div
            onClick={() => onSelectAuthor && onSelectAuthor(article.authorId)}
            className="flex items-center gap-2 cursor-pointer hover:text-amber-400 transition-colors truncate max-w-[170px]"
          >
            {author?.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : null}
            <span className="truncate">{author?.name || 'Staff Analyst'}</span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.views}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // Variant 3: Horizontal Stream Row
  if (variant === 'horizontal') {
    return (
      <article
        id={`row-article-${article.id}`}
        className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start gap-4 group"
      >
        <div
          className="relative w-full sm:w-48 h-32 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={() => onSelect(article)}
        >
          <img
            src={article.featuredImage}
            alt={article.headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {article.isBreaking && (
            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-600 text-white font-intel font-bold text-[9px]">
              BREAKING
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-intel font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              {article.category}
            </span>
            <span className="text-[11px] font-intel text-slate-400">
              {formattedDate} &bull; {article.readTimeMinutes}m brief
            </span>
          </div>

          <h3
            onClick={() => onSelect(article)}
            className="text-base font-bold font-editorial text-slate-100 group-hover:text-amber-400 cursor-pointer transition-colors leading-snug line-clamp-2 mb-1"
          >
            {article.headline}
          </h3>

          <p className="text-xs text-slate-300 line-clamp-2 mb-2">
            {article.deck}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-400 font-intel">
            <span
              onClick={() => onSelectAuthor && onSelectAuthor(article.authorId)}
              className="hover:text-amber-400 cursor-pointer"
            >
              By {author?.name || 'Staff Analyst'}
            </span>
            <button
              type="button"
              onClick={() => onSelect(article)}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 text-[11px]"
            >
              <span>Full Brief</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Variant 4: Compact list item
  return (
    <article
      id={`compact-article-${article.id}`}
      className="py-3 border-b border-slate-800/80 last:border-b-0 group"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-intel font-semibold text-amber-400">
          {article.category}
        </span>
        <span className="text-[10px] font-intel text-slate-400">
          {article.readTimeMinutes}m
        </span>
      </div>
      <h4
        onClick={() => onSelect(article)}
        className="text-sm font-bold font-editorial text-slate-200 group-hover:text-amber-400 cursor-pointer transition-colors line-clamp-2 leading-snug"
      >
        {article.headline}
      </h4>
    </article>
  );
};
