import React from 'react';
import {
  Clock,
  Calendar,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Lock,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import type { PublicationStatus } from '../types';
import { PUBLICATION_STATUSES, getStatusMeta } from '../utils/statusUtils';

interface PublicationStatusPickerProps {
  status: PublicationStatus;
  onChangeStatus: (status: PublicationStatus) => void;
  scheduledPublishAt?: string;
  onChangeScheduledPublishAt?: (iso: string) => void;
  reviewNotes?: string;
  onChangeReviewNotes?: (notes: string) => void;
  retractionReason?: string;
  onChangeRetractionReason?: (reason: string) => void;
}

export const PublicationStatusPicker: React.FC<PublicationStatusPickerProps> = ({
  status,
  onChangeStatus,
  scheduledPublishAt = '',
  onChangeScheduledPublishAt,
  reviewNotes = '',
  onChangeReviewNotes,
  retractionReason = '',
  onChangeRetractionReason,
}) => {
  const currentMeta = getStatusMeta(status);

  // Helper to format ISO to datetime-local input string
  const formatForDateTimeInput = (iso?: string) => {
    if (!iso) {
      // Default to 4 hours from now
      const d = new Date(Date.now() + 4 * 60 * 60 * 1000);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    try {
      const d = new Date(iso);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const handleSetPresetEmbargo = (hoursFromNow: number) => {
    const target = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    if (onChangeScheduledPublishAt) {
      onChangeScheduledPublishAt(target.toISOString());
    }
  };

  const handleSetTomorrowMorning = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    if (onChangeScheduledPublishAt) {
      onChangeScheduledPublishAt(tomorrow.toISOString());
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <currentMeta.icon className={`w-4 h-4 ${currentMeta.colorClass.text}`} />
          <h4 className="text-xs font-intel font-bold uppercase tracking-wider text-slate-200">
            Publication Status & Wire Lifecycle
          </h4>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${currentMeta.colorClass.badge}`}
        >
          {currentMeta.shortLabel}
        </span>
      </div>

      {/* Primary Selector Dropdown */}
      <div>
        <label className="block text-xs font-intel font-semibold text-slate-300 mb-1.5">
          Editorial Release Lifecycle State:
        </label>
        <div className="relative">
          <select
            value={status}
            onChange={(e) => onChangeStatus(e.target.value as PublicationStatus)}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-intel focus:outline-none focus:border-amber-400 font-medium"
          >
            {PUBLICATION_STATUSES.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100 py-1">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Context Explanation */}
        <div className="mt-2 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
          <currentMeta.icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${currentMeta.colorClass.text}`} />
          <span>{currentMeta.description}</span>
        </div>
      </div>

      {/* QUICK STATUS PILLS SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {PUBLICATION_STATUSES.map((s) => {
          const Icon = s.icon;
          const isSelected = status === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChangeStatus(s.id)}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? `${s.colorClass.bg} ${s.colorClass.border} text-white shadow-sm ring-1 ${s.colorClass.border}`
                  : 'bg-slate-950/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? s.colorClass.text : 'text-slate-500'}`} />
                {isSelected && <CheckCircle2 className={`w-3 h-3 ${s.colorClass.text}`} />}
              </div>
              <div className="text-[11px] font-bold leading-tight line-clamp-1">
                {s.shortLabel}
              </div>
            </button>
          );
        })}
      </div>

      {/* CONTEXTUAL MODULE: 1. SCHEDULED / EMBARGO SETTINGS */}
      {status === 'scheduled' && (
        <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/60 space-y-3">
          <div className="flex items-center justify-between text-xs text-blue-300 font-intel font-bold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Embargo Expiration & Release Schedule</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/50 text-blue-200 border border-blue-700">
              Hold Under Embargo
            </span>
          </div>

          <div>
            <label className="block text-[11px] text-blue-200/90 font-medium mb-1">
              Select Release Date & Time (Local):
            </label>
            <input
              type="datetime-local"
              value={formatForDateTimeInput(scheduledPublishAt)}
              onChange={(e) => {
                if (!e.target.value) return;
                const d = new Date(e.target.value);
                if (onChangeScheduledPublishAt && !isNaN(d.getTime())) {
                  onChangeScheduledPublishAt(d.toISOString());
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-blue-800 text-blue-100 text-xs font-mono focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-blue-300 font-intel">Quick Presets:</span>
            <button
              type="button"
              onClick={() => handleSetPresetEmbargo(1)}
              className="text-[10px] px-2 py-0.5 rounded bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-800 transition-colors"
            >
              +1 Hour
            </button>
            <button
              type="button"
              onClick={() => handleSetPresetEmbargo(4)}
              className="text-[10px] px-2 py-0.5 rounded bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-800 transition-colors"
            >
              +4 Hours (Market Open)
            </button>
            <button
              type="button"
              onClick={handleSetTomorrowMorning}
              className="text-[10px] px-2 py-0.5 rounded bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-800 transition-colors"
            >
              Tomorrow 9:00 AM
            </button>
            <button
              type="button"
              onClick={() => handleSetPresetEmbargo(48)}
              className="text-[10px] px-2 py-0.5 rounded bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-800 transition-colors"
            >
              +2 Days
            </button>
          </div>

          {scheduledPublishAt && (
            <div className="p-2 rounded bg-slate-950/80 border border-blue-900/50 text-[11px] text-blue-200 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>
                Embargo scheduled for:{' '}
                <strong>{new Date(scheduledPublishAt).toLocaleString()}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* CONTEXTUAL MODULE: 2. EDITORIAL REVIEW NOTES */}
      {status === 'review' && (
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-300 font-intel font-bold">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Editorial Desk Review / Fact-Check Notes</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-200">
              Pending Clearance
            </span>
          </div>
          <textarea
            rows={2}
            value={reviewNotes}
            onChange={(e) => onChangeReviewNotes && onChangeReviewNotes(e.target.value)}
            placeholder="e.g. Fact-checking verification with foreign ministry ongoing. Pending review of trade balance dataset."
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-amber-800 text-amber-100 text-xs focus:outline-none focus:border-amber-400"
          />
        </div>
      )}

      {/* CONTEXTUAL MODULE: 3. RETRACTION / CORRECTION NOTICE */}
      {status === 'withdrawn' && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-red-300 font-intel font-bold">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Official Retraction / Correction Statement</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/50 text-red-200">
              Public Notice
            </span>
          </div>
          <textarea
            rows={2}
            value={retractionReason}
            onChange={(e) => onChangeRetractionReason && onChangeRetractionReason(e.target.value)}
            placeholder="State the journalistic reason for retraction or correction (will be displayed to readers with an official integrity disclaimer)."
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-red-800 text-red-100 text-xs focus:outline-none focus:border-red-400"
          />
        </div>
      )}

      {/* CONTEXTUAL MODULE: 4. UNLISTED PREVIEW WIRE NOTICE */}
      {status === 'unlisted' && (
        <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-900/50 text-xs text-purple-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>
            This dispatch will have a permanent direct link for PR / source review, but is hidden from the public homepage, RSS wires, and search feeds.
          </span>
        </div>
      )}
    </div>
  );
};
