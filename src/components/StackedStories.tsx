import React from 'react';
import type { Article } from '../types';

interface StackedStoriesProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const StackedStories: React.FC<StackedStoriesProps> = ({
  articles,
  onSelectArticle,
}) => {
  return (
    <div className="space-y-4">
      {articles.map((art) => (
        <div
          key={art.id}
          onClick={() => onSelectArticle(art)}
          className="flex items-start gap-3.5 sm:gap-4 p-2.5 sm:p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
        >
          {/* Thumbnail Image */}
          <div className="w-28 sm:w-32 h-20 sm:h-22 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
            <img
              src={art.featuredImage}
              alt={art.headline}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          {/* Story Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs">
              <span className="font-bold text-red-700 uppercase tracking-wider">
                {art.category}
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-500">
                {art.publishedAt ? `${new Date(art.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Recent'}
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold font-serif text-slate-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
              {art.headline}
            </h4>

            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {art.deck}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
