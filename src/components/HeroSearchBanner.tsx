import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  TrendingUp,
  Clock,
  X,
  Mic,
  MicOff,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Compass,
} from 'lucide-react';
import type { Article } from '../types';
import {
  CURATED_TRENDING_TERMS,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
} from '../utils/searchIntelligence';
import { NewsImage } from './NewsImage';

interface HeroSearchBannerProps {
  onSearchSubmit: (query: string) => void;
  onFilterClick: (filter: string) => void;
  articles?: Article[];
  onSelectArticle?: (article: Article) => void;
}

const NEWS_CATEGORIES = [
  { label: 'All News', value: 'all' },
  { label: 'India', value: 'India' },
  { label: 'World', value: 'World' },
  { label: 'Business', value: 'Business' },
  { label: 'Technology', value: 'Technology' },
  { label: 'Markets', value: 'Markets' },
  { label: 'Sports', value: 'Sports' },
  { label: 'Explainers', value: 'Explainers' },
  { label: 'Entertainment', value: 'Entertainment' },
];

export const HeroSearchBanner: React.FC<HeroSearchBannerProps> = ({
  onSearchSubmit,
  onFilterClick,
  articles = [],
  onSelectArticle,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches().slice(0, 4));
  }, []);

  // Voice Search using Web Speech API if supported
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Voice recognition not supported in this browser.');
      setTimeout(() => setSpeechError(null), 3000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setSpeechError(null);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        saveRecentSearch(transcript);
        setRecentSearches(getRecentSearches().slice(0, 4));
        onSearchSubmit(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechError('Could not capture audio. Please type your query.');
        setTimeout(() => setSpeechError(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechError('Voice search initialization failed.');
      setTimeout(() => setSpeechError(null), 3000);
    }
  };

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

  // Filter matching predictions
  const matchingPredictions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CURATED_TRENDING_TERMS.slice(0, 6);
    return CURATED_TRENDING_TERMS.filter((t) => t.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  // Matching live articles
  const matchingArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || articles.length === 0) return [];
    return articles
      .filter(
        (a) =>
          a.headline.toLowerCase().includes(q) ||
          a.deck?.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 3);
  }, [query, articles]);

  const allSelectableItems = useMemo(() => {
    const items: Array<{ type: 'prediction' | 'recent' | 'article'; value: string; article?: Article }> = [];
    if (query.trim().length === 0 && recentSearches.length > 0) {
      recentSearches.forEach((rs) => items.push({ type: 'recent', value: rs }));
    }
    matchingPredictions.forEach((p) => items.push({ type: 'prediction', value: p }));
    matchingArticles.forEach((a) => items.push({ type: 'article', value: a.headline, article: a }));
    return items;
  }, [query, recentSearches, matchingPredictions, matchingArticles]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalQuery = query.trim();
    if (finalQuery) {
      saveRecentSearch(finalQuery);
      setRecentSearches(getRecentSearches().slice(0, 4));
      setIsFocused(false);
      onSearchSubmit(finalQuery);
    }
  };

  const handleSelectPrediction = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    setRecentSearches(getRecentSearches().slice(0, 4));
    setIsFocused(false);
    onSearchSubmit(term);
  };

  const handleSelectArticleItem = (article: Article) => {
    setIsFocused(false);
    if (onSelectArticle) {
      onSelectArticle(article);
    } else {
      onSearchSubmit(article.headline);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allSelectableItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allSelectableItems.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < allSelectableItems.length) {
        e.preventDefault();
        const selected = allSelectableItems[selectedIndex];
        if (selected.type === 'article' && selected.article) {
          handleSelectArticleItem(selected.article);
        } else {
          handleSelectPrediction(selected.value);
        }
      } else {
        handleSubmit(e);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const handleFeelingLucky = () => {
    if (articles.length > 0) {
      const topArticle = articles[0];
      if (onSelectArticle) {
        onSelectArticle(topArticle);
      } else {
        onSearchSubmit(topArticle.headline);
      }
    } else {
      onSearchSubmit('Top Stories');
    }
  };

  // Highlight matching letters in query
  const renderHighlighted = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <strong key={i} className="font-bold text-slate-900">
              {part}
            </strong>
          ) : (
            <span key={i} className="text-slate-600">
              {part}
            </span>
          )
        )}
      </span>
    );
  };

  return (
    <section className="w-full bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 text-white border-b border-slate-800/80 pt-6 sm:pt-10 pb-6 sm:pb-8 relative overflow-hidden">
      {/* Background ambient editorial grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 30%, rgba(220, 38, 38, 0.25) 0%, transparent 60%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Newsroom Kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/50 text-red-300 text-xs font-semibold tracking-wider uppercase mb-3 sm:mb-4">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Live Digital Newsroom • Instant Search</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-serif text-white tracking-tight mb-2 sm:mb-3">
          Search Breaking News, Top Stories &amp; Live Topics
        </h1>
        <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto mb-6 sm:mb-8 font-normal">
          Explore real-time coverage, market movements, global politics, and in-depth explainers with verified sources.
        </p>

        {/* GOOGLE SEARCH CONTAINER */}
        <div className="max-w-2xl mx-auto relative text-left" ref={containerRef}>
          <form
            onSubmit={handleSubmit}
            className={`relative flex items-center bg-white rounded-full border transition-all duration-200 shadow-xl ${
              isFocused
                ? 'border-red-600 ring-4 ring-red-500/20 shadow-2xl'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Left Google Search Icon */}
            <div className="pl-4 sm:pl-5 pr-2 text-slate-400 shrink-0 pointer-events-none">
              <Search className="w-5 h-5 text-red-600" />
            </div>

            {/* Input field */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsFocused(true);
                setSelectedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search breaking news, topics, headlines, leaders..."
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 font-medium bg-transparent focus:outline-none"
              autoComplete="off"
              spellCheck="false"
            />

            {/* Right Buttons: Clear, Voice Search, Submit */}
            <div className="flex items-center gap-1 sm:gap-1.5 pr-2 sm:pr-2.5 shrink-0">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'
                }`}
                title={isListening ? 'Listening...' : 'Search by voice'}
                aria-label="Search by voice"
              >
                {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {/* Search Submit Button */}
              <button
                type="submit"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:shadow-lg"
                title="Search"
                aria-label="Submit search"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Voice Error Notification */}
          {speechError && (
            <div className="mt-2 text-center text-xs text-amber-300 bg-amber-950/80 border border-amber-800/60 rounded-lg py-1 px-2.5">
              {speechError}
            </div>
          )}

          {/* GOOGLE AUTOCOMPLETE DROPDOWN */}
          {isFocused && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-40 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
              {/* 1. Recent Searches (If query is empty) */}
              {!query.trim() && recentSearches.length > 0 && (
                <div className="border-b border-slate-100 p-2">
                  <div className="flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        clearRecentSearches();
                        setRecentSearches([]);
                      }}
                      className="text-[10px] text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((term, i) => (
                    <div
                      key={`recent-${i}`}
                      onClick={() => handleSelectPrediction(term)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-700 cursor-pointer transition-colors ${
                        selectedIndex === i ? 'bg-red-50 text-red-700' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{term}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Recent</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Direct Matching News Articles Preview (If matches exist) */}
              {matchingArticles.length > 0 && (
                <div className="border-b border-slate-100 p-2 bg-slate-50/70">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Top Matching News</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchingArticles.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => handleSelectArticleItem(art)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                          <NewsImage
                            src={art.featuredImage}
                            alt={art.headline}
                            category={art.category}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="font-bold text-red-700 uppercase">{art.category}</span>
                            <span>•</span>
                            <span>{art.readTimeMinutes || 4} min read</span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-700 truncate">
                            {art.headline}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-red-700 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Predictive Autocomplete & Trending Searches */}
              <div className="p-2">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-red-600" />
                  <span>{query.trim() ? 'Search Suggestions' : 'Trending News Topics'}</span>
                </div>
                {matchingPredictions.map((pred, i) => {
                  const globalIdx = (recentSearches.length > 0 && !query.trim() ? recentSearches.length : 0) + i;
                  return (
                    <div
                      key={`pred-${pred}`}
                      onClick={() => handleSelectPrediction(pred)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-700 cursor-pointer transition-colors ${
                        selectedIndex === globalIdx ? 'bg-red-50 text-red-700' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <div>{renderHighlighted(pred, query)}</div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Trending</span>
                    </div>
                  );
                })}
              </div>

              {/* Dropdown Footer: Quick Helper */}
              <div className="bg-slate-100/80 px-4 py-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Press Enter to search all coverage</span>
                <span className="font-mono text-[10px]">ESC to close</span>
              </div>
            </div>
          )}

          {/* GOOGLE ACTION BUTTONS (News Search / Feeling Lucky) */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs sm:text-sm font-semibold border border-slate-700 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-red-500" />
              <span>Search News</span>
            </button>
            <button
              type="button"
              onClick={handleFeelingLucky}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs sm:text-sm font-semibold border border-slate-700 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Breaking Story</span>
            </button>
          </div>
        </div>

        {/* CATEGORY QUICK FILTER CHIPS */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 shrink-0 hidden sm:inline mr-1">
            Browse News:
          </span>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {NEWS_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => onFilterClick(cat.value)}
                className="px-3 py-1 rounded-full bg-slate-800/90 hover:bg-red-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 hover:border-red-600 transition-all cursor-pointer"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
