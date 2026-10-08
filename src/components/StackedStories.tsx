import React from 'react';
import type { Article } from '../types';
import { NewsImage } from './NewsImage';

interface StackedStoriesProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const StackedStories: React.FC<StackedStoriesProps> = ({
  articles,
  onSelectArticle,
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {articles.map((art) => (
        <div
          key={art.id}
          onClick={() => onSelectArticle(art)}
          className="flex items-start gap-3 sm:gap-4 p-2 sm:p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
        >
          {/* Thumbnail Image */}
          <div className="w-24 sm:w-28 md:w-32 h-20 sm:h-22 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
            <NewsImage
              src={art.featuredImage}
              alt={art.headline}
              category={art.category}
              className="group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Story Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-red-700 uppercase tracking-wider">
                {art.category}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>
                {art.publishedAt
                  ? new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Recent'}
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
