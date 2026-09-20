import React from 'react';
import { ArrowUpRight, ArrowRight, Sparkles } from 'lucide-react';
import type { TrendingItem, Article } from '../types';

interface TrendingColumnProps {
  trending: TrendingItem[];
  sectionTitle?: string;
  isTrendingEnabled?: boolean;
  insightArticle?: Article;
  onSelectTrending: (item: TrendingItem) => void;
  onSelectArticle: (article: Article) => void;
}

export const TrendingColumn: React.FC<TrendingColumnProps> = ({
  trending,
  sectionTitle = 'Trending Now',
  isTrendingEnabled = true,
  insightArticle,
  onSelectTrending,
  onSelectArticle,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. TRENDING NOW SECTION */}
      {isTrendingEnabled && trending.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <h3 className="text-lg font-bold font-serif text-slate-950 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>{sectionTitle}</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {trending.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTrending(item)}
                className="w-full py-3 flex items-start gap-3 text-left group hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                  {item.rank || idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. TODAY'S INSIGHT CARD */}
      {insightArticle && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs group">
          <div className="p-4 sm:p-5 pb-3">
            <h3 className="text-lg font-bold font-serif text-slate-950">
              Today's Insight
            </h3>
          </div>

          {/* Featured photo */}
          <div
            className="relative h-44 overflow-hidden cursor-pointer"
            onClick={() => onSelectArticle(insightArticle)}
          >
            <img
              src={insightArticle.featuredImage}
              alt={insightArticle.headline}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider">
                EXPLAINER
              </span>
            </div>

            <h4
              onClick={() => onSelectArticle(insightArticle)}
              className="text-base font-bold font-serif text-slate-950 group-hover:text-red-700 transition-colors cursor-pointer leading-snug"
            >
              {insightArticle.headline}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {insightArticle.deck}
            </p>

            <button
              type="button"
              onClick={() => onSelectArticle(insightArticle)}
              className="pt-2 text-xs font-bold text-red-700 hover:text-red-800 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Read More</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
