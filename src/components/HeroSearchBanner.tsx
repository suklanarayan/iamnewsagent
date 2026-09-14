import React, { useState, useRef, useEffect } from 'react';
import { Search, ArrowRight, Sparkles, Globe } from 'lucide-react';
import { CURATED_TRENDING_TERMS } from '../utils/searchIntelligence';

interface HeroSearchBannerProps {
  onSearchSubmit: (query: string) => void;
  onFilterClick: (filter: string) => void;
}

const QUICK_FILTERS = [
  'Latest News',
  'Explainers',
  'Trending',
  'India',
  'World',
  'Business',
  'Technology',
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
  const matchingPredictions = query.trim().length > 1
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
    <section className="relative w-full overflow-hidden bg-slate-950 text-white">
      {/* Background Image: Earth from space / orbital night atmosphere */}
      <div className="absolute inset-0 z-0 opacity-45 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=85"
          alt="Earth from Space"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/90" />
        <div className="absolute inset-0 bg-radial from-transparent to-slate-950/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 flex flex-col justify-between">
        {/* Top Split: Heading on Left, Motto on Right */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 sm:pb-12">
          {/* Left Title & Tagline */}
          <div className="max-w-2xl space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-serif leading-[1.1]">
              News <br />
              Without Borders
            </h1>
            <p className="text-base sm:text-lg font-medium text-slate-200 pt-1">
              Search. Explore. Understand.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              AI-powered news search for a clearer, deeper, and broader perspective.
            </p>
          </div>

          {/* Right Corner Brand Accent */}
          <div className="md:text-right flex flex-col md:items-end justify-start self-start">
            <div className="text-base sm:text-lg font-serif italic text-slate-200">
              A More<br className="hidden sm:inline" /> Informed Tomorrow
            </div>
            <div className="w-12 h-0.5 bg-red-600 mt-2 rounded-full" />
          </div>
        </div>

        {/* Center: Large Rounded Search Bar */}
        <div className="max-w-2xl mx-auto w-full space-y-4" ref={containerRef}>
          <div className="relative">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <div className="absolute left-4 sm:left-5 text-slate-500 pointer-events-none">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                value={query}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsFocused(true);
                }}
                placeholder="What do you want to know today? (e.g. ISRO, Markets, AI, Kolkata)"
                className="w-full pl-11 sm:pl-13 pr-14 py-3 sm:py-4 rounded-full bg-white text-slate-900 placeholder:text-slate-500 text-sm sm:text-base font-medium shadow-2xl focus:outline-none focus:ring-2 focus:ring-red-500 border-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 sm:right-2.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#b91c1c] hover:bg-[#991b1b] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                aria-label="Submit search"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </form>

            {/* Instant Predictive Autocomplete Dropdown in Hero */}
            {isFocused && query.trim().length > 1 && matchingPredictions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-30 p-2 text-xs space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Keyword Suggestions & Search Predictions</span>
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
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-800 hover:bg-red-50 hover:text-red-700 font-medium transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pred}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Press to search</span>
                  </button>
                ))}
                <div className="pt-1 border-t border-slate-100 px-3 py-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-indigo-700">
                    <Globe className="w-3 h-3" />
                    <span>Includes Wikipedia & Wire Database</span>
                  </span>
                  <span className="font-mono text-[10px]">Enter ↵</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Filter Pill Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            {QUICK_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFilterClick(f)}
                className="px-3 py-1 rounded-full bg-slate-900/80 hover:bg-white hover:text-slate-900 text-slate-300 border border-slate-700/80 transition-all cursor-pointer backdrop-blur-xs font-medium"
              >
                {f}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onFilterClick('all')}
              className="px-2 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-700/80 transition-colors"
            >
              &bull;&bull;&bull;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
