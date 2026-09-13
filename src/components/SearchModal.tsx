import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight, Clock, Sparkles, Tag } from 'lucide-react';
import type { Article } from '../types';

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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedTag(null);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags))).slice(0, 8);

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
      art.keyTakeaways.some((t) => t.toLowerCase().includes(q)) ||
      art.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news, topics, explainers, or key takeaways..."
            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-medium focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
          >
            Esc
          </button>
        </div>

        {/* Quick Tag Filter Pills */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
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
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-red-700 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 space-y-2">
          {filteredArticles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <p className="text-sm">No articles matched "{query}".</p>
              <p className="text-xs">Try searching for ISRO, markets, AI, or Durga Puja.</p>
            </div>
          ) : (
            filteredArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => {
                  onSelectArticle(art);
                  onClose();
                }}
                className="pt-2.5 pb-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group flex items-start gap-4"
              >
                <img
                  src={art.featuredImage}
                  alt={art.headline}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-slate-100"
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
                  </div>
                  <h4 className="text-sm font-bold font-serif text-slate-900 group-hover:text-red-700 transition-colors line-clamp-1">
                    {art.headline}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {art.deck}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-red-700 transition-all flex-shrink-0 self-center" />
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Showing {filteredArticles.length} verified news articles across all desks.
        </div>
      </div>
    </div>
  );
};
