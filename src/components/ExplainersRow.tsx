import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Clock,
  LayoutGrid,
  Grid,
  List,
  Sparkles,
} from 'lucide-react';
import type { Article } from '../types';
import { NewsImage } from './NewsImage';

interface ExplainersRowProps {
  explainers: Article[];
  onSelectArticle: (article: Article) => void;
  onViewAllExplainers?: () => void;
}

export type ExplainerViewMode = 'spotlight' | 'grid' | 'list';

export const ExplainersRow: React.FC<ExplainersRowProps> = ({
  explainers,
  onSelectArticle,
  onViewAllExplainers,
}) => {
  const [viewMode, setViewMode] = useState<ExplainerViewMode>('spotlight');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!explainers || explainers.length === 0) return null;

  const leadExplainer = explainers[0];
  const gridExplainers = explainers.slice(1, 3);
  const quickListExplainers = explainers.slice(3, 6);
  const remainingExplainers = explainers.slice(6);

  // Items to display in Grid or List mode
  const displayedExplainers = isExpanded ? explainers : explainers.slice(0, 6);

  const toggleViewAll = () => {
    setIsExpanded((prev) => !prev);
    if (onViewAllExplainers) {
      onViewAllExplainers();
    }
  };

  return (
    <div className="space-y-5">
      {/* Section Header with View Mode Switcher and Working View All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-100 text-amber-800">
              <BookOpen className="w-4 h-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-950">
              Explainers &amp; Deep Dives
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical context, essential backgrounders, and complex issues unpacked simply.
          </p>
        </div>

        {/* View Switcher & View All Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Segmented View Switcher */}
          <div
            className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200"
            role="group"
            aria-label="Change explainers layout view"
          >
            <button
              type="button"
              onClick={() => setViewMode('spotlight')}
              title="Spotlight Layout"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'spotlight'
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Spotlight</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Cards Grid"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Detailed List"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* Working View All Toggle Button */}
          <button
            type="button"
            onClick={toggleViewAll}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${
              isExpanded
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 text-slate-700 hover:text-amber-800 hover:bg-slate-50'
            }`}
            title={isExpanded ? 'Collapse explainers' : 'View all published explainers'}
          >
            <span>
              {isExpanded ? 'Show Curated' : `View All (${explainers.length})`}
            </span>
            <ArrowRight
              className={`w-3.5 h-3.5 transition-transform ${
                isExpanded ? 'rotate-90 text-amber-700' : 'group-hover:translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: SPOTLIGHT EDITORIAL LAYOUT */}
      {viewMode === 'spotlight' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* 1. LEAD SPOTLIGHT EXPLAINER CARD */}
          {leadExplainer && (
            <article
              onClick={() => onSelectArticle(leadExplainer)}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row"
            >
              {/* Left Media Thumbnail */}
              <div className="md:w-5/12 h-52 md:h-auto overflow-hidden bg-slate-900 relative shrink-0">
                <NewsImage
                  src={leadExplainer.featuredImage}
                  alt={leadExplainer.headline}
                  category={leadExplainer.category || 'Explainers'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  Spotlight Explainer
                </div>
              </div>

              {/* Right Content */}
              <div className="p-4 sm:p-5 md:w-7/12 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold text-amber-800 uppercase tracking-wider">
                      {leadExplainer.category || 'Deep Dive'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{leadExplainer.readTimeMinutes || 6} min read</span>
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg md:text-xl font-bold font-serif text-slate-950 group-hover:text-red-700 transition-colors leading-snug">
                    <a
                      href={`/article/${leadExplainer.slug}`}
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                          e.preventDefault();
                          onSelectArticle(leadExplainer);
                        }
                      }}
                      className="hover:underline focus:outline-hidden"
                    >
                      {leadExplainer.headline}
                    </a>
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {leadExplainer.deck}
                  </p>

                  {/* Key Takeaways preview if available */}
                  {leadExplainer.keyTakeaways && leadExplainer.keyTakeaways.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        What You Need to Know:
                      </div>
                      {leadExplainer.keyTakeaways.slice(0, 2).map((point, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{point}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <a
                  href={`/article/${leadExplainer.slug}`}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                      e.preventDefault();
                      onSelectArticle(leadExplainer);
                    }
                  }}
                  className="pt-2 text-xs font-bold text-red-700 group-hover:text-red-800 inline-flex items-center gap-1.5 focus:outline-hidden"
                >
                  <span>Read Full Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </article>
          )}

          {/* 2. SECONDARY EXPLAINERS (2-COLUMN GRID) */}
          {gridExplainers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gridExplainers.map((art) => (
                <article
                  key={art.id}
                  onClick={() => onSelectArticle(art)}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="h-40 w-full overflow-hidden bg-slate-900 relative">
                    <NewsImage
                      src={art.featuredImage}
                      alt={art.headline}
                      category={art.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-bold uppercase tracking-wider">
                      Explainer
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-bold text-amber-800 uppercase tracking-wider">
                          {art.category}
                        </span>
                        <span>•</span>
                        <span>{art.readTimeMinutes || 5} min read</span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold font-serif text-slate-950 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                        <a
                          href={`/article/${art.slug}`}
                          onClick={(e) => {
                            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                              e.preventDefault();
                              onSelectArticle(art);
                            }
                          }}
                          className="hover:underline focus:outline-hidden"
                        >
                          {art.headline}
                        </a>
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {art.deck}
                      </p>
                    </div>

                    <a
                      href={`/article/${art.slug}`}
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                          e.preventDefault();
                          onSelectArticle(art);
                        }
                      }}
                      className="pt-2 text-xs font-bold text-red-700 group-hover:text-red-800 inline-flex items-center gap-1 focus:outline-hidden"
                    >
                      <span>Explore analysis</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* 3. ESSENTIAL BACKGROUNDERS & KEY QUESTIONS */}
          {quickListExplainers.length > 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Essential Backgrounders &amp; Thematic Briefs</span>
                </div>
                <span className="text-[11px] text-slate-500">Quick Reads</span>
              </div>

              <div className="divide-y divide-slate-200">
                {quickListExplainers.map((art, idx) => (
                  <a
                    key={art.id}
                    href={`/article/${art.slug}`}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        e.preventDefault();
                        onSelectArticle(art);
                      }
                    }}
                    className="py-2.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3 group cursor-pointer text-left focus:outline-hidden"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-xs font-mono font-bold text-amber-700 shrink-0 mt-0.5">
                        0{idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-1">
                          {art.headline}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {art.deck || art.keyTakeaways?.[0]}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-red-700 font-semibold shrink-0 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5 mt-0.5">
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 4. EXPANDED ALL REMAINING EXPLAINERS (WHEN VIEW ALL CLICKED) */}
          {isExpanded && remainingExplainers.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-4 animate-in fade-in duration-300">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>All Extended Explainer Archives ({remainingExplainers.length} more)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {remainingExplainers.map((art) => (
                  <article
                    key={art.id}
                    onClick={() => onSelectArticle(art)}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="h-36 w-full overflow-hidden bg-slate-900 relative">
                      <NewsImage
                        src={art.featuredImage}
                        alt={art.headline}
                        category={art.category}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-800 text-white text-[10px] font-bold uppercase tracking-wider">
                        {art.category}
                      </div>
                    </div>
                    <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] text-slate-500 mb-1">
                          {art.readTimeMinutes || 5} min read
                        </div>
                        <h5 className="text-sm font-bold font-serif text-slate-950 group-hover:text-red-700 line-clamp-2 leading-snug">
                          {art.headline}
                        </h5>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                          {art.deck}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-red-700 flex items-center justify-between">
                        <span>Read breakdown</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: CARDS GRID OF EXPLAINERS */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 animate-in fade-in duration-200">
          {displayedExplainers.map((art) => (
            <article
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                  <NewsImage
                    src={art.featuredImage}
                    alt={art.headline}
                    category={art.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider">
                    {art.category || 'Explainer'}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-slate-200 text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{art.readTimeMinutes || 5}m read</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="text-base font-bold font-serif text-slate-950 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                    {art.headline}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {art.deck}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-amber-800">In-Depth</span>
                <span className="text-red-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Read Breakdown</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* VIEW MODE 3: HORIZONTAL EDITORIAL LIST OF EXPLAINERS */}
      {viewMode === 'list' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {displayedExplainers.map((art) => (
            <article
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="bg-white rounded-xl border border-slate-200 p-3.5 hover:border-slate-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row items-start gap-4"
            >
              <div className="w-full sm:w-44 h-36 sm:h-28 rounded-lg overflow-hidden shrink-0 bg-slate-900 relative">
                <NewsImage
                  src={art.featuredImage}
                  alt={art.headline}
                  category={art.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-amber-700 text-white text-[9px] font-bold uppercase">
                  {art.category}
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-bold text-amber-800 uppercase tracking-wider">
                      {art.category}
                    </span>
                    <span>•</span>
                    <span>{art.readTimeMinutes || 5} min read</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold font-serif text-slate-950 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                    {art.headline}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {art.deck}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Editorial Analysis</span>
                  <span className="text-red-700 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
