import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Article } from '../types';

interface BreakingTickerProps {
  breakingArticles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  breakingArticles,
  onSelectArticle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (breakingArticles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingArticles.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [breakingArticles.length]);

  if (!breakingArticles || breakingArticles.length === 0) return null;

  const current = breakingArticles[currentIndex] || breakingArticles[0];
  if (!current) return null;

  return (
    <div
      id="breaking-ticker-bar"
      className="bg-slate-950 border-b border-red-950/80 px-3 sm:px-4 py-2 flex items-center gap-3 overflow-hidden text-xs w-full max-w-full"
    >
      {/* Ticker Tag */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="font-bold uppercase tracking-wider text-red-500 text-[11px] sm:text-xs">
          BREAKING
        </span>
      </div>

      {/* Breaking Headline Link */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <button
          id={`breaking-btn-${current.id}`}
          type="button"
          onClick={() => onSelectArticle(current)}
          className="text-left w-full truncate font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-2 group cursor-pointer"
        >
          <span className="text-amber-400 font-semibold text-xs flex-shrink-0">
            {current.category} ·
          </span>
          <span className="truncate group-hover:underline text-xs sm:text-sm">
            {current.headline}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white flex-shrink-0 hidden sm:inline" />
        </button>
      </div>

      {/* Indicator dots if multiple */}
      {breakingArticles.length > 1 && (
        <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
          {breakingArticles.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === currentIndex ? 'bg-red-500 w-3' : 'bg-slate-800 hover:bg-slate-600 w-1.5'
              }`}
              title={`Jump to item ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
