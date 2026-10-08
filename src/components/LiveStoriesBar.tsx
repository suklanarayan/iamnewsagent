import React, { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Radio, Sparkles, Clock } from 'lucide-react';
import type { LiveStory } from '../types';
import { NewsImage } from './NewsImage';

interface LiveStoriesBarProps {
  stories: LiveStory[];
  onSelectStory: (story: LiveStory) => void;
}

export const LiveStoriesBar: React.FC<LiveStoriesBarProps> = ({
  stories,
  onSelectStory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sort stories by their defined order/sequence
  const sortedStories = [...stories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full max-w-full overflow-hidden bg-slate-50 border-b border-slate-200 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header with Alignment & Controls */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-950 tracking-tight">
                Live Story Radar
              </h2>
            </div>
            <span className="hidden sm:inline-block text-slate-300">|</span>
            <span className="hidden sm:inline-block text-xs text-slate-600 font-medium">
              Chronological real-time event sequences &amp; visual updates
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Scroll Navigation Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={scrollLeft}
                className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Scroll previous"
                aria-label="Previous stories"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Scroll next"
                aria-label="Next stories"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onSelectStory(sortedStories[0])}
              className="ml-2 text-xs font-semibold text-slate-700 hover:text-red-700 flex items-center gap-1 transition-colors group cursor-pointer"
            >
              <span className="hidden sm:inline">Open Story Feed</span>
              <span className="sm:hidden">All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Stories Sequential Track with Strict Editorial Alignment */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto no-scrollbar py-3 px-0.5 scroll-smooth"
        >
          {sortedStories.map((story, index) => {
            const sequenceNumber = String(index + 1).padStart(2, '0');
            const keyHighlight = story.keyPoints?.[0];

            return (
              <article
                key={story.id}
                onClick={() => onSelectStory(story)}
                className="w-64 sm:w-72 shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                {/* 1. Header Media Thumbnail */}
                <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-900">
                  <NewsImage
                    src={story.image}
                    alt={story.title}
                    category={story.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Sequence Badge (e.g. #01, #02) */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-xs text-white text-[11px] font-mono font-bold tracking-wider border border-white/20 flex items-center gap-1">
                    <span className="text-red-400">#</span>
                    <span>{sequenceNumber}</span>
                  </div>

                  {/* Status Indicator (LIVE vs UPDATE) */}
                  <div className="absolute top-2.5 right-2.5">
                    {story.isLive ? (
                      <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-slate-200 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                        UPDATE
                      </span>
                    )}
                  </div>

                  {/* Category Pill at bottom left of image */}
                  <div className="absolute bottom-2 left-2.5">
                    <span className="px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                      {story.category || 'General'}
                    </span>
                  </div>
                </div>

                {/* 2. Structured Content Body */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="text-red-700 font-bold">{story.subtitle || 'Live Dispatch'}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Live stream</span>
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold font-serif text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                      {story.title}
                    </h3>

                    {keyHighlight && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {keyHighlight}
                      </p>
                    )}
                  </div>

                  {/* 3. Action Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {story.keyPoints?.length || 3} key updates
                    </span>
                    <span className="text-red-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View Story</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
