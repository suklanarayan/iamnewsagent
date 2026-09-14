import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  ChevronRight,
  Sparkles,
  Tag,
  BookOpen,
  ExternalLink,
  History,
  TrendingUp,
  Globe,
  Database,
  Layers,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react';
import type { Article } from '../types';
import {
  buildSearchDictionary,
  getSearchPredictions,
  getInlineCompletion,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  CURATED_TRENDING_TERMS,
} from '../utils/searchIntelligence';
import {
  queryWikipediaKnowledge,
  type WikipediaSearchResult,
} from '../services/wikipediaService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  initialQuery?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'wiki'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [wikiResult, setWikiResult] = useState<WikipediaSearchResult | null>(null);
  const [isWikiLoading, setIsWikiLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Build dictionary of all searchable terms from articles & editorial index
  const dictionary = useMemo(() => buildSearchDictionary(articles), [articles]);

  // Load recent searches on open
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery('');
      setSelectedTag(null);
      setWikiResult(null);
      setActiveTab('all');
    }
  }, [isOpen, initialQuery]);

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced Wikipedia query
  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 2) {
      setWikiResult(null);
      setIsWikiLoading(false);
      return;
    }

    setIsWikiLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await queryWikipediaKnowledge(q);
        setWikiResult(res);
      } catch (err) {
        console.error('Wiki search error:', err);
      } finally {
        setIsWikiLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  // Search Predictions and Ghost Completion
  const predictions = getSearchPredictions(query, dictionary, 6);
  const inlineCompletion = getInlineCompletion(query, dictionary);
  const ghostSuffix = inlineCompletion && query.trim()
    ? inlineCompletion.slice(query.trim().length)
    : '';

  // All unique tags for quick filtering
  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags))).slice(0, 10);

  // Filter internal articles
  const filteredArticles = articles.filter((art) => {
    if (selectedTag && !art.tags.includes(selectedTag)) {
      return false;
    }
    if (!query.trim()) return true;

    const q = query.toLowerCase();
    return (
      art.headline.toLowerCase().includes(q) ||
      art.deck.toLowerCase().includes(q) ||
      art.category.toLowerCase().includes(q) ||
      art.content.toLowerCase().includes(q) ||
      art.keyTakeaways.some((t) => t.toLowerCase().includes(q)) ||
      art.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleSelectPrediction = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    setRecentSearches(getRecentSearches());
    inputRef.current?.focus();
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && inlineCompletion) {
      e.preventDefault();
      setQuery(inlineCompletion);
    } else if (e.key === 'Enter') {
      if (query.trim()) {
        saveRecentSearch(query.trim());
        setRecentSearches(getRecentSearches());
      }
      if (filteredArticles.length > 0) {
        onSelectArticle(filteredArticles[0]);
        onClose();
      }
    }
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-8 sm:pt-16 px-3 sm:px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95">
        {/* TOP SEARCH INPUT BAR WITH GHOST INLINE COMPLETION */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/80">
          <div className="relative flex items-center gap-3">
            <Search className="w-5 h-5 text-red-600 shrink-0" />

            <div className="relative flex-1">
              {/* Ghost text overlay for Tab autocomplete */}
              {ghostSuffix && (
                <div className="absolute inset-0 flex items-center pointer-events-none text-sm sm:text-base font-medium">
                  <span className="opacity-0">{query}</span>
                  <span className="text-slate-400/80 bg-slate-200/50 px-1 rounded ml-0.5">
                    {ghostSuffix}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-2 font-mono hidden sm:inline">
                    (Press Tab ⇥)
                  </span>
                </div>
              )}

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDownInput}
                placeholder="Search wire dispatches, topics, people, or ask Wikipedia..."
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-medium focus:outline-none pr-8"
              />
            </div>

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold tracking-wider transition-colors cursor-pointer"
            >
              Esc
            </button>
          </div>

          {/* REAL-TIME PREDICTIONS & KEYWORD SUGGESTIONS BAR */}
          {query.trim().length > 0 && predictions.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Predictions:
              </span>
              {predictions.map((p) => (
                <button
                  key={p.term}
                  type="button"
                  onClick={() => handleSelectPrediction(p.term)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 text-slate-700 hover:text-red-700 text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Search className="w-2.5 h-2.5 text-slate-400" />
                  <span>{p.term}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SCOPE TABS & SOURCE SELECTOR */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-red-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Knowledge</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('news')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-white text-red-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>News Database ({filteredArticles.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wiki')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'wiki'
                  ? 'bg-white text-red-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Wikipedia Dossier</span>
              {isWikiLoading && <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />}
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            Hybrid Search (Wire + Wiki)
          </span>
        </div>

        {/* QUICK TOPIC TAG PILLS (when in All or News tabs) */}
        {activeTab !== 'wiki' && (
          <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                selectedTag === null
                  ? 'bg-red-700 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Topics
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-red-700 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* RESULTS SCROLLABLE CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* STATE A: EMPTY QUERY - Show Trending Topics & Recent Searches */}
          {!query.trim() && (
            <div className="space-y-5 py-2">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-[11px] text-slate-400 hover:text-red-700 transition-colors"
                    >
                      Clear History
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSelectPrediction(s)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <History className="w-3 h-3 text-slate-400" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Topics Index */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                  Trending Search Predictions & Desks
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {CURATED_TRENDING_TERMS.slice(0, 8).map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSelectPrediction(term)}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-red-200 bg-slate-50/70 hover:bg-red-50/40 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span className="font-semibold text-slate-800 group-hover:text-red-700">
                        {term}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-red-700 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE B: ACTIVE QUERY RESULTS */}
          {query.trim() && (
            <>
              {/* 1. WIKIPEDIA KNOWLEDGE CARD (Shown if activeTab is 'all' or 'wiki', or when local articles are 0!) */}
              {(activeTab === 'all' || activeTab === 'wiki' || filteredArticles.length === 0) && (
                <div>
                  {isWikiLoading ? (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 animate-pulse flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-200" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 rounded w-3/4" />
                      </div>
                    </div>
                  ) : wikiResult?.summary ? (
                    <div className="p-4 rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 shadow-xs relative overflow-hidden">
                      {/* Top Label */}
                      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-indigo-100 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="p-1 rounded bg-indigo-600 text-white">
                            <BookOpen className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-bold text-indigo-950 uppercase tracking-wider text-[11px]">
                            Wikipedia Global Knowledge Dossier
                          </span>
                          {filteredArticles.length === 0 && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                              Instant Encyclopedic Answer
                            </span>
                          )}
                        </div>

                        <a
                          href={wikiResult.summary.pageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                        >
                          <span>Full Article on Wikipedia</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Content Split */}
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        {wikiResult.summary.thumbnail && (
                          <img
                            src={wikiResult.summary.thumbnail}
                            alt={wikiResult.summary.title}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100 shadow-xs"
                          />
                        )}

                        <div className="flex-1 space-y-1.5 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold font-serif text-slate-950 leading-tight">
                            {wikiResult.summary.title}
                          </h3>
                          {wikiResult.summary.description && (
                            <p className="text-xs font-semibold text-indigo-900/80 italic">
                              {wikiResult.summary.description}
                            </p>
                          )}
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed line-clamp-3 sm:line-clamp-4">
                            {wikiResult.summary.extract}
                          </p>

                          <div className="pt-1 flex items-center gap-3">
                            <a
                              href={wikiResult.summary.pageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs transition-colors shadow-xs"
                            >
                              <span>Read on Wikipedia</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleSelectPrediction(wikiResult.summary!.title)}
                              className="text-xs text-slate-600 hover:text-red-700 font-medium cursor-pointer"
                            >
                              Filter Wire by "{wikiResult.summary.title}"
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Related Wikipedia Suggestions if any */}
                      {wikiResult.suggestions.length > 1 && (
                        <div className="mt-3 pt-2.5 border-t border-indigo-100 flex items-center gap-1.5 flex-wrap text-xs">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            Related Wiki Topics:
                          </span>
                          {wikiResult.suggestions.slice(1, 4).map((s) => (
                            <button
                              key={s.title}
                              type="button"
                              onClick={() => handleSelectPrediction(s.title)}
                              className="px-2 py-0.5 rounded bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-[11px] font-medium transition-colors"
                            >
                              {s.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* 2. IN-DATABASE NEWS ARTICLES LIST (Shown if activeTab is 'all' or 'news') */}
              {activeTab !== 'wiki' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-red-600" />
                      Editorial Database Matches ({filteredArticles.length})
                    </span>
                    {filteredArticles.length > 0 && (
                      <span className="text-[11px] text-slate-400">
                        Press Enter ↵ to open top match
                      </span>
                    )}
                  </div>

                  {filteredArticles.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 space-y-2 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                      <p className="text-sm font-semibold text-slate-700">
                        No articles found in local editorial database for "{query}".
                      </p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        {wikiResult?.summary
                          ? 'However, we located verified encyclopedic information from Wikipedia above.'
                          : 'Try searching for topics like ISRO, markets, semiconductors, Kolkata, or AI.'}
                      </p>
                      {/* Direct Wikipedia Web Search Button */}
                      <div className="pt-2">
                        <a
                          href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                        >
                          <span>Search Wikipedia directly for "{query}"</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {filteredArticles.map((art) => (
                        <div
                          key={art.id}
                          onClick={() => {
                            saveRecentSearch(query.trim() || art.headline);
                            onSelectArticle(art);
                            onClose();
                          }}
                          className="py-3 px-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group flex items-start gap-3 sm:gap-4"
                        >
                          <img
                            src={art.featuredImage}
                            alt={art.headline}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 bg-slate-100 shadow-2xs"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-red-700 uppercase tracking-wider text-[10px]">
                                {art.category}
                              </span>
                              <span className="text-slate-300">&bull;</span>
                              <span className="text-slate-500 text-[11px]">
                                {art.readTimeMinutes} min read
                              </span>
                              {art.isBreaking && (
                                <span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-bold uppercase text-[9px]">
                                  Breaking
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm sm:text-base font-bold font-serif text-slate-900 group-hover:text-red-700 transition-colors line-clamp-1">
                              {art.headline}
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {art.deck}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-red-700 transition-all shrink-0 self-center" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Intelligent Search Engine
            </span>
            <span>&bull;</span>
            <span>{articles.length} Wire Dispatches in DB</span>
            <span>&bull;</span>
            <span>Live Wikipedia Grounding</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <span>Tab: Complete</span>
            <span>&bull;</span>
            <span>Esc: Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
