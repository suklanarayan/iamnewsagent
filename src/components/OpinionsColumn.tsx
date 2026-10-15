import React, { useState } from 'react';
import { ArrowRight, User, LayoutList, LayoutGrid, Quote } from 'lucide-react';
import type { OpinionPiece } from '../types';

interface OpinionsColumnProps {
  opinions: OpinionPiece[];
  onSelectOpinion: (opinion: OpinionPiece) => void;
  onViewAllOpinions?: () => void;
}

export type OpinionViewMode = 'list' | 'cards';

export const OpinionsColumn: React.FC<OpinionsColumnProps> = ({
  opinions,
  onSelectOpinion,
  onViewAllOpinions,
}) => {
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<OpinionViewMode>('list');
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedOpinions = isExpanded ? opinions : opinions.slice(0, 3);

  const handleToggleViewAll = () => {
    setIsExpanded((prev) => !prev);
    if (onViewAllOpinions) {
      onViewAllOpinions();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header with View Switcher & Working View All */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold font-serif text-slate-950">
            Voices &amp; Opinions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Columns, guest essays, and analytical viewpoints.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Compact List View"
              className={`p-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5 text-red-600" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Editorial Cards View"
              className={`p-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-red-600" />
            </button>
          </div>

          {/* View All Toggle */}
          <button
            type="button"
            onClick={handleToggleViewAll}
            className={`text-xs font-semibold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${
              isExpanded
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-white border-slate-200 text-slate-700 hover:text-red-700 hover:bg-slate-50'
            }`}
            title={isExpanded ? 'Show top columns' : 'View all opinion pieces'}
          >
            <span>{isExpanded ? 'Top 3' : `View All (${opinions.length})`}</span>
            <ArrowRight
              className={`w-3 h-3 transition-transform ${
                isExpanded ? 'rotate-90 text-red-600' : 'group-hover:translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: COMPACT LIST OF OPINION PIECES */}
      {viewMode === 'list' && (
        <div className="divide-y divide-slate-100 animate-in fade-in duration-200">
          {displayedOpinions.map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => onSelectOpinion(op)}
              className="w-full py-3 flex items-start gap-3 text-left group hover:bg-slate-50 -mx-1 px-1 rounded-lg transition-colors cursor-pointer"
            >
              {failedAvatars[op.id] || !op.authorAvatar ? (
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
                  {op.authorName.charAt(0)}
                </div>
              ) : (
                <img
                  src={op.authorAvatar}
                  alt={op.authorName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedAvatars((prev) => ({ ...prev, [op.id]: true }))
                  }
                />
              )}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {op.authorName}
                </div>
                <div className="text-xs font-medium text-slate-600 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                  {op.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* VIEW MODE 2: FEATURED OPINION CARDS */}
      {viewMode === 'cards' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {displayedOpinions.map((op) => (
            <article
              key={op.id}
              onClick={() => onSelectOpinion(op)}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all cursor-pointer group space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {failedAvatars[op.id] || !op.authorAvatar ? (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {op.authorName.charAt(0)}
                    </div>
                  ) : (
                    <img
                      src={op.authorAvatar}
                      alt={op.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-900">{op.authorName}</div>
                    <div className="text-[10px] text-slate-500">Columnist</div>
                  </div>
                </div>
                <Quote className="w-4 h-4 text-red-600/40" />
              </div>

              <h4 className="text-xs sm:text-sm font-serif font-bold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2">
                &ldquo;{op.title}&rdquo;
              </h4>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 font-medium">
                <span>Guest Essay</span>
                <span className="text-red-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Read Piece</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
