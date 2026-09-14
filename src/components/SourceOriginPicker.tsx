import React from 'react';
import {
  Brain,
  Globe,
  Radio,
  Share2,
  FileCheck,
  BookOpen,
  FlaskConical,
  Link as LinkIcon,
  CheckCircle2,
  ExternalLink,
  Building2,
  Newspaper,
} from 'lucide-react';
import type { ArticleType, SourceOriginType } from '../types';

interface SourceOriginPickerProps {
  articleType: ArticleType;
  onChangeArticleType: (type: ArticleType) => void;
  sourceType: SourceOriginType;
  onChangeSourceType: (source: SourceOriginType) => void;
  sourceName: string;
  onChangeSourceName: (name: string) => void;
  sourceUrl: string;
  onChangeSourceUrl: (url: string) => void;
}

const ARTICLE_TYPES: { id: ArticleType; label: string; icon: any; desc: string }[] = [
  { id: 'standard', label: 'Standard News', icon: Newspaper, desc: 'Everyday news dispatch or wire report' },
  { id: 'announcement', label: 'Official Announcement', icon: Building2, desc: 'Corporate disclosure, product launch, govt notification' },
  { id: 'investigation', label: 'Exclusive Investigation', icon: FlaskConical, desc: 'In-depth original investigative journalism' },
  { id: 'opinion', label: 'Analysis & Op-Ed', icon: Brain, desc: 'Expert column, perspective, or commentary' },
  { id: 'live_coverage', label: 'Live Desk / Flash', icon: Radio, desc: 'Developing real-time updates from the ground' },
  { id: 'research', label: 'Research / Whitepaper', icon: BookOpen, desc: 'Case study, academic paper, policy brief' },
];

const SOURCE_ORIGINS: {
  id: SourceOriginType;
  label: string;
  icon: any;
  hint: string;
  defaultName: string;
  presets: string[];
}[] = [
  {
    id: 'original',
    label: 'My Knowledge / Editorial',
    icon: Brain,
    hint: 'Your original reporting, personal knowledge, exclusive analysis, or desk reporting.',
    defaultName: 'Editorial Desk (Original Reporting)',
    presets: ['Editorial Desk', 'Independent Investigation', 'Original Analysis', 'Field Correspondent'],
  },
  {
    id: 'network',
    label: 'News Network / Wire',
    icon: Globe,
    hint: 'Syndicated or quoted from external news agency or media network.',
    defaultName: 'Reuters',
    presets: ['Reuters', 'Bloomberg', 'Press Trust of India (PTI)', 'ANI', 'Associated Press (AP)', 'Financial Times', 'BBC'],
  },
  {
    id: 'press_release',
    label: 'Official PR / Gazette',
    icon: FileCheck,
    hint: 'Official company announcement, Government Gazette, PIB, or PR disclosure.',
    defaultName: 'Official Press Release',
    presets: ['Company Press Release', 'Press Information Bureau (PIB)', 'Government Gazette', 'SEC Filing', 'Corporate Disclosure'],
  },
  {
    id: 'social',
    label: 'Social Media Wire',
    icon: Share2,
    hint: 'Breaking update sourced from X/Twitter, LinkedIn, Telegram, Reddit, YouTube, etc.',
    defaultName: 'X / Twitter',
    presets: ['X / Twitter', 'LinkedIn Post', 'Telegram Wire', 'YouTube Statement', 'Reddit Community'],
  },
  {
    id: 'live',
    label: 'Live Broadcast / Ground',
    icon: Radio,
    hint: 'Real-time on-the-scene update, live press conference, or unfolding event.',
    defaultName: 'Live Desk Dispatch',
    presets: ['Live Press Briefing', 'Ground Correspondent', 'Live Stream Coverage', 'Emergency Broadcast'],
  },
  {
    id: 'blog',
    label: 'Blog / Substack / Web',
    icon: Newspaper,
    hint: 'Independent blog post, Substack newsletter, Medium essay, or web publication.',
    defaultName: 'Substack Newsletter',
    presets: ['Substack', 'Medium Publication', 'Company Tech Blog', 'Independent Newsletter'],
  },
  {
    id: 'reference',
    label: 'Research / Whitepaper',
    icon: BookOpen,
    hint: 'Scientific paper, academic journal, think tank, or whitepaper reference.',
    defaultName: 'Research Paper / ArXiv',
    presets: ['ArXiv Preprint', 'Nature / Science Journal', 'Think Tank Report', 'Industry Whitepaper'],
  },
  {
    id: 'custom',
    label: 'Other / Custom Source',
    icon: LinkIcon,
    hint: 'Any other specialized publication, interview, podcast, or primary document.',
    defaultName: 'Primary Document',
    presets: ['Executive Interview', 'Podcast Episode', 'Court Filing', 'Public Records'],
  },
];

export const SourceOriginPicker: React.FC<SourceOriginPickerProps> = ({
  articleType,
  onChangeArticleType,
  sourceType,
  onChangeSourceType,
  sourceName,
  onChangeSourceName,
  sourceUrl,
  onChangeSourceUrl,
}) => {
  const currentOrigin = SOURCE_ORIGINS.find((s) => s.id === sourceType) || SOURCE_ORIGINS[0];

  const handleSelectOrigin = (originId: SourceOriginType) => {
    onChangeSourceType(originId);
    const target = SOURCE_ORIGINS.find((s) => s.id === originId);
    if (target && (!sourceName || SOURCE_ORIGINS.some((s) => s.defaultName === sourceName))) {
      onChangeSourceName(target.defaultName);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-intel font-bold uppercase tracking-wider text-slate-200">
            News Origin & Source Attribution
          </h4>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold text-[10px] border border-amber-500/20">
          Source Credibility
        </span>
      </div>

      {/* 1. ARTICLE FORMAT / TYPE */}
      <div>
        <label className="block text-xs font-intel font-semibold text-slate-300 mb-1.5">
          Post Format / Content Classification:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ARTICLE_TYPES.map((t) => {
            const Icon = t.icon;
            const isSelected = articleType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChangeArticleType(t.id)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold font-intel leading-tight">
                    {t.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 line-clamp-1">
                  {t.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SOURCE ORIGIN CHANNELS */}
      <div>
        <label className="block text-xs font-intel font-semibold text-slate-300 mb-1.5">
          Where is this news/announcement sourced from?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SOURCE_ORIGINS.map((origin) => {
            const Icon = origin.icon;
            const isSelected = sourceType === origin.id;
            return (
              <button
                key={origin.id}
                type="button"
                onClick={() => handleSelectOrigin(origin.id)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-red-500/15 border-red-500 text-white shadow-sm ring-1 ring-red-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-red-400' : 'text-slate-400'}`} />
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
                </div>
                <div className="text-[11px] font-bold font-intel leading-tight">
                  {origin.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Origin Explanation */}
        <div className="mt-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <span className="text-amber-400 font-bold">•</span>
          <span>{currentOrigin.hint}</span>
        </div>
      </div>

      {/* 3. SOURCE NAME & QUICK PRESETS */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6">
          <label className="block text-xs font-intel font-semibold text-slate-300 mb-1">
            Source Organization / Entity Name *
          </label>
          <input
            type="text"
            value={sourceName}
            onChange={(e) => onChangeSourceName(e.target.value)}
            placeholder="e.g. Reuters, PIB India, Editorial Desk, X (@username)"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-intel focus:outline-none focus:border-amber-400"
            required
          />

          {/* Quick Presets */}
          <div className="mt-1.5 flex flex-wrap gap-1">
            {currentOrigin.presets.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChangeSourceName(preset)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  sourceName === preset
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 4. OPTIONAL SOURCE URL / LINK */}
        <div className="sm:col-span-6">
          <label className="block text-xs font-intel font-semibold text-slate-300 mb-1">
            Source Link / Reference URL (Optional)
          </label>
          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-700 overflow-hidden text-xs">
            <span className="px-2.5 py-2 text-slate-500 bg-slate-900 border-r border-slate-800">
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => onChangeSourceUrl(e.target.value)}
              placeholder="https://... (Twitter post, news URL, PR link)"
              className="flex-1 px-2.5 py-2 bg-transparent text-slate-200 font-mono text-[11px] focus:outline-none"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            If provided, readers can click to verify the primary source or document.
          </p>
        </div>
      </div>
    </div>
  );
};
