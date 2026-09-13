import React, { useEffect, useState } from 'react';
import { AlertCircle, ChevronRight, Zap } from 'lucide-react';
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
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateUtc = () => {
      const now = new Date();
      setUtcTime(
        now.toUTCString().slice(17, 22) + ' UTC'
      );
    };
    updateUtc();
    const timer = setInterval(updateUtc, 1000);
    return () => clearInterval(timer);
  }, []);

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
      className="bg-slate-950 border-b border-red-950/80 px-3 sm:px-4 py-2 flex items-center gap-3 overflow-hidden text-xs"
    >
      {/* Ticker Tag */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
        <span className="font-intel font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1 text-[11px] sm:text-xs">
          <Zap className="w-3.5 h-3.5 fill-red-400 text-red-400" />
          <span className="hidden sm:inline">RAPID INTELLIGENCE FLASH</span>
          <span className="sm:hidden">BREAKING</span>
        </span>
        <span className="text-slate-400 font-intel text-[11px] hidden md:inline">
          [{utcTime}]
        </span>
      </div>

      {/* Breaking Headline Link */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <button
          id={`breaking-btn-${current.id}`}
          type="button"
          onClick={() => onSelectArticle(current)}
          className="text-left w-full truncate font-medium text-slate-200 hover:text-amber-400 transition-colors flex items-center gap-1.5 group"
        >
          <span className="text-amber-400/90 font-intel font-semibold text-[11px] flex-shrink-0">
            [{current.category}]:
          </span>
          <span className="truncate group-hover:underline">{current.headline}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 flex-shrink-0" />
        </button>
      </div>

      {/* Indicator dots if multiple */}
      {breakingArticles.length > 1 && (
        <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
          {breakingArticles.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === currentIndex ? 'bg-amber-400 w-3' : 'bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Jump to item ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
