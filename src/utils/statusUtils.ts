import {
  Globe,
  FileEdit,
  CheckSquare,
  Clock,
  EyeOff,
  Archive,
  AlertOctagon,
} from 'lucide-react';
import type { Article, PublicationStatus } from '../types';

export interface StatusMeta {
  id: PublicationStatus;
  label: string;
  shortLabel: string;
  description: string;
  icon: any;
  colorClass: {
    badge: string;
    text: string;
    border: string;
    bg: string;
    pill: string;
  };
}

export const PUBLICATION_STATUSES: StatusMeta[] = [
  {
    id: 'published',
    label: 'Published (Live on Wire)',
    shortLabel: 'Live',
    description: 'Story is active and publicly indexed across all news feeds, search engines, and RSS readers.',
    icon: Globe,
    colorClass: {
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
      text: 'text-emerald-400',
      border: 'border-emerald-500',
      bg: 'bg-emerald-500/10',
      pill: 'bg-emerald-500 text-slate-950',
    },
  },
  {
    id: 'draft',
    label: 'Draft (Saved in DB)',
    shortLabel: 'Draft',
    description: 'Work-in-progress draft saved in database. Only visible to editorial staff inside the CMS.',
    icon: FileEdit,
    colorClass: {
      badge: 'bg-slate-800/90 text-slate-300 border-slate-700',
      text: 'text-slate-400',
      border: 'border-slate-500',
      bg: 'bg-slate-800/40',
      pill: 'bg-slate-700 text-white',
    },
  },
  {
    id: 'review',
    label: 'In Review (Fact-Check & Desk Approval)',
    shortLabel: 'In Review',
    description: 'Story filed by correspondent or reporter, awaiting copy-editing and editorial clearance.',
    icon: CheckSquare,
    colorClass: {
      badge: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
      text: 'text-amber-400',
      border: 'border-amber-500',
      bg: 'bg-amber-500/10',
      pill: 'bg-amber-500 text-slate-950',
    },
  },
  {
    id: 'scheduled',
    label: 'Scheduled (Embargoed Release)',
    shortLabel: 'Embargoed',
    description: 'Held under news embargo until a specified future date and time.',
    icon: Clock,
    colorClass: {
      badge: 'bg-blue-950/80 text-blue-300 border-blue-800/80',
      text: 'text-blue-400',
      border: 'border-blue-500',
      bg: 'bg-blue-500/10',
      pill: 'bg-blue-500 text-white',
    },
  },
  {
    id: 'unlisted',
    label: 'Unlisted (Private Preview Wire)',
    shortLabel: 'Unlisted',
    description: 'Accessible via direct URL link for sources or peer reviews, but omitted from homepage and category feeds.',
    icon: EyeOff,
    colorClass: {
      badge: 'bg-purple-950/80 text-purple-300 border-purple-800/80',
      text: 'text-purple-400',
      border: 'border-purple-500',
      bg: 'bg-purple-500/10',
      pill: 'bg-purple-600 text-white',
    },
  },
  {
    id: 'archived',
    label: 'Archived (Retired from Active Wire)',
    shortLabel: 'Archived',
    description: 'Retired from active feeds, preserved for permanent historical archive and direct citation links.',
    icon: Archive,
    colorClass: {
      badge: 'bg-zinc-900 text-zinc-400 border-zinc-700',
      text: 'text-zinc-400',
      border: 'border-zinc-500',
      bg: 'bg-zinc-800/30',
      pill: 'bg-zinc-700 text-white',
    },
  },
  {
    id: 'withdrawn',
    label: 'Retracted / Withdrawn (Correction Notice)',
    shortLabel: 'Retracted',
    description: 'Pulled from news circulation with an official journalistic retraction or correction explanation.',
    icon: AlertOctagon,
    colorClass: {
      badge: 'bg-red-950/90 text-red-300 border-red-800',
      text: 'text-red-400',
      border: 'border-red-500',
      bg: 'bg-red-500/10',
      pill: 'bg-red-600 text-white',
    },
  },
];

/**
 * Determine if an article is ready for public consumption in reader feeds
 */
export function isArticlePubliclyVisible(article: Article): boolean {
  if (article.status === 'published') return true;
  if (article.status === 'scheduled' && article.scheduledPublishAt) {
    const embargoTime = new Date(article.scheduledPublishAt).getTime();
    return !isNaN(embargoTime) && embargoTime <= Date.now();
  }
  return false;
}

export function getStatusMeta(status: PublicationStatus = 'published'): StatusMeta {
  return PUBLICATION_STATUSES.find((s) => s.id === status) || PUBLICATION_STATUSES[0];
}
