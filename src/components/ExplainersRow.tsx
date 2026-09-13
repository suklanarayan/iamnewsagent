import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Article } from '../types';

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
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-950">
          Explainers
        </h3>
        <button
          type="button"
          onClick={onViewAllExplainers}
          className="text-xs font-semibold text-slate-700 hover:text-red-700 flex items-center gap-1 transition-colors group cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 2 Wide Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {explainers.slice(0, 2).map((art) => (
          <article
            key={art.id}
            onClick={() => onSelectArticle(art)}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col"
          >
            {/* Image */}
            <div className="h-44 sm:h-52 w-full overflow-hidden bg-slate-900 relative">
              <img
                src={art.featuredImage}
                alt={art.headline}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="inline-block px-2 py-0.5 rounded bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider">
                  EXPLAINER
                </span>

                <h4 className="text-base sm:text-lg font-bold font-serif text-slate-950 group-hover:text-red-700 transition-colors leading-snug">
                  {art.headline}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {art.deck}
                </p>
              </div>

              <div className="pt-3 text-xs font-bold text-red-700 group-hover:text-red-800 inline-flex items-center gap-1">
                <span>Read Full Explainer</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
