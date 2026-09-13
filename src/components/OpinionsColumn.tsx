import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { OpinionPiece } from '../types';

interface OpinionsColumnProps {
  opinions: OpinionPiece[];
  onSelectOpinion: (opinion: OpinionPiece) => void;
  onViewAllOpinions: () => void;
}

export const OpinionsColumn: React.FC<OpinionsColumnProps> = ({
  opinions,
  onSelectOpinion,
  onViewAllOpinions,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-lg font-bold font-serif text-slate-950">
          Voices & Opinions
        </h3>
        <button
          type="button"
          onClick={onViewAllOpinions}
          className="text-xs font-semibold text-slate-700 hover:text-red-700 flex items-center gap-1 transition-colors group cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Opinion rows with author avatars */}
      <div className="divide-y divide-slate-100">
        {opinions.map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => onSelectOpinion(op)}
            className="w-full py-3.5 flex items-start gap-3 text-left group hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
          >
            <img
              src={op.authorAvatar}
              alt={op.authorName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
              loading="lazy"
            />
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
    </div>
  );
};
