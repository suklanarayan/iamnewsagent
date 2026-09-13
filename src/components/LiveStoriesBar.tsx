import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Radio } from 'lucide-react';
import type { LiveStory } from '../types';

interface LiveStoriesBarProps {
  stories: LiveStory[];
  onSelectStory: (story: LiveStory) => void;
}

export const LiveStoriesBar: React.FC<LiveStoriesBarProps> = ({
  stories,
  onSelectStory,
}) => {
  return (
    <section className="w-full bg-white border-b border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5 font-bold text-slate-900 font-serif text-base sm:text-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              Live Stories
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500 font-normal">
              Real-time updates. Disappears in 24 hours.
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectStory(stories[0])}
            className="text-xs font-semibold text-slate-700 hover:text-red-700 flex items-center gap-1 transition-colors group cursor-pointer"
          >
            <span>View All Stories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Stories Horizontal Scrolling Container */}
        <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2 px-1">
          {stories.map((story) => (
            <button
              key={story.id}
              type="button"
              onClick={() => onSelectStory(story)}
              className="flex flex-col items-center text-center space-y-1.5 flex-shrink-0 group cursor-pointer focus:outline-none"
            >
              {/* Avatar circle with multi-stop border gradient */}
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-red-600 group-hover:scale-105 transition-transform shadow-xs">
                <div className="p-0.5 bg-white rounded-full">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* LIVE badge indicator */}
                {story.isLive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-sm border border-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="w-20 sm:w-22 text-center">
                <div className="text-xs font-bold text-slate-900 truncate leading-tight group-hover:text-red-700 transition-colors">
                  {story.title}
                </div>
                <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                  {story.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
