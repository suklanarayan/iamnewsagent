import React from 'react';
import { ArrowRight, BookOpen, CheckCircle2, HelpCircle, Sparkles, Clock } from 'lucide-react';
import type { Article } from '../types';
import { NewsImage } from './NewsImage';

interface ExplainersRowProps {
  explainers: Article[];
  onSelectArticle: (article: Article) => void;
  onViewAllExplainers: () => void;
}

export const ExplainersRow: React.FC<ExplainersRowProps> = ({
  explainers,
  onSelectArticle,
  onViewAllExplainers,
}) => {
  if (!explainers || explainers.length === 0) return null;

  const leadExplainer = explainers[0];
  const gridExplainers = explainers.slice(1, 3);
  const quickListExplainers = explainers.slice(3, 6);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-100 text-amber-800">
              <BookOpen className="w-4 h-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-950">
              Explainers &amp; Deep Dives
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical context, essential backgrounders, and complex issues unpacked simply.
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAllExplainers}
          className="text-xs font-semibold text-slate-700 hover:text-red-700 flex items-center gap-1 transition-colors group cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

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
                {leadExplainer.headline}
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

            <div className="pt-2 text-xs font-bold text-red-700 group-hover:text-red-800 inline-flex items-center gap-1.5">
              <span>Read Full Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
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
                    {art.headline}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {art.deck}
                  </p>
                </div>

                <div className="pt-2 text-xs font-bold text-red-700 group-hover:text-red-800 inline-flex items-center gap-1">
                  <span>Explore analysis</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 3. ESSENTIAL BACKGROUNDERS & KEY QUESTIONS (FILLS VERTICAL DENSITY ON DESKTOP) */}
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
              <div
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="py-2.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3 group cursor-pointer"
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
