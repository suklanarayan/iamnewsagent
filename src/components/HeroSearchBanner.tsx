import React, { useState, useRef, useEffect } from 'react';
import { Search, ArrowRight, Sparkles, Globe, Compass } from 'lucide-react';
import { CURATED_TRENDING_TERMS } from '../utils/searchIntelligence';

interface HeroSearchBannerProps {
  onSearchSubmit: (query: string) => void;
  onFilterClick: (filter: string) => void;
}

const TOPICS = [
  { label: 'All News', value: 'all' },
  { label: 'ISRO Launch', value: 'ISRO' },
  { label: 'Global Markets', value: 'Markets' },
  { label: 'Artificial Intelligence', value: 'Technology' },
  { label: 'Durga Puja 2026', value: 'Explainers' },
  { label: 'Indo-Pacific', value: 'World' },
];

export const HeroSearchBanner: React.FC<HeroSearchBannerProps> = ({
  onSearchSubmit,
  onFilterClick,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsFocused(false);
      onSearchSubmit(query.trim());
    }
  };

  // Matching prediction terms for autocomplete in Hero
  const matchingPredictions =
    query.trim().length > 1
      ? CURATED_TRENDING_TERMS.filter((t) =>
          t.toLowerCase().includes(query.trim().toLowerCase())
        ).slice(0, 5)
      : [];

  // Close suggestions if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="w-full bg-slate-950 text-white border-b border-slate-900 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Title / Editorial Kicker */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Rapid News Intelligence Desk
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold font-serif text-slate-100 tracking-tight">
              Search Verified Dispatches & In-Depth Analysis
            </h1>
          </div>

          {/* Right: Search Input Bar */}
          <div className="w-full md:max-w-md lg:max-w-lg relative" ref={containerRef}>
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={query}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsFocused(true);
                }}
                placeholder="Search topics, nations, tickers, leaders..."
                className="w-full pl-10 pr-12 py-2 sm:py-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-red-700 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Execute Search"
              >
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </form>

            {/* Instant Predictive Autocomplete Dropdown in Hero */}
            {isFocused && query.trim().length > 1 && matchingPredictions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-30 p-1.5 text-xs space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 border-b border-slate-100">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Search Suggestions</span>
                </div>
                {matchingPredictions.map((pred) => (
                  <button
                    key={pred}
                    type="button"
                    onClick={() => {
                      setQuery(pred);
                      setIsFocused(false);
                      onSearchSubmit(pred);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-800 hover:bg-red-50 hover:text-red-700 font-medium transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pred}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">↵</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Clean Editorial Topic Track (Zero pills, clean typography with subtle hover) */}
        <div className="pt-3 mt-3 border-t border-slate-900/80 flex items-center gap-3 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 whitespace-nowrap flex-shrink-0">
            Top Trends:
          </span>
          <div className="flex items-center gap-2 whitespace-nowrap">
            {TOPICS.map((topic, idx) => (
              <React.Fragment key={topic.value}>
                <button
                  type="button"
                  onClick={() => onFilterClick(topic.value)}
                  className="text-slate-300 hover:text-white hover:underline transition-colors cursor-pointer text-xs font-medium"
                >
                  {topic.label}
                </button>
                {idx < TOPICS.length - 1 && (
                  <span aria-hidden="true" className="text-slate-700">·</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
