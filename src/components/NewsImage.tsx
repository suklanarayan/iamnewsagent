import React, { useState } from 'react';
import { Newspaper, Sparkles, Globe, TrendingUp, Cpu, Landmark, Film, Flame } from 'lucide-react';

interface NewsImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  category?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

// Category-based curated color meshes and icons for zero-broken-image resilience
const CATEGORY_STYLES: Record<
  string,
  {
    bg: string;
    accent: string;
    text: string;
    icon: React.ElementType;
    label: string;
  }
> = {
  india: {
    bg: 'from-orange-950 via-stone-900 to-amber-950',
    accent: 'text-amber-400',
    text: 'text-amber-100',
    icon: Globe,
    label: 'National Bureau',
  },
  world: {
    bg: 'from-sky-950 via-slate-900 to-blue-950',
    accent: 'text-sky-400',
    text: 'text-sky-100',
    icon: Globe,
    label: 'Global Dispatch',
  },
  business: {
    bg: 'from-emerald-950 via-slate-900 to-teal-950',
    accent: 'text-emerald-400',
    text: 'text-emerald-100',
    icon: TrendingUp,
    label: 'Financial Markets',
  },
  markets: {
    bg: 'from-emerald-950 via-slate-900 to-teal-950',
    accent: 'text-emerald-400',
    text: 'text-emerald-100',
    icon: TrendingUp,
    label: 'Market Intelligence',
  },
  technology: {
    bg: 'from-indigo-950 via-slate-900 to-violet-950',
    accent: 'text-indigo-400',
    text: 'text-indigo-100',
    icon: Cpu,
    label: 'Technology Wire',
  },
  science: {
    bg: 'from-cyan-950 via-slate-900 to-blue-950',
    accent: 'text-cyan-400',
    text: 'text-cyan-100',
    icon: Sparkles,
    label: 'Scientific Research',
  },
  entertainment: {
    bg: 'from-rose-950 via-stone-900 to-pink-950',
    accent: 'text-rose-400',
    text: 'text-rose-100',
    icon: Film,
    label: 'Culture & Arts',
  },
  explainers: {
    bg: 'from-purple-950 via-slate-900 to-stone-950',
    accent: 'text-amber-400',
    text: 'text-amber-100',
    icon: Landmark,
    label: 'In-Depth Explainer',
  },
  opinion: {
    bg: 'from-stone-900 via-neutral-900 to-stone-950',
    accent: 'text-stone-300',
    text: 'text-stone-100',
    icon: Newspaper,
    label: 'Editorial & Opinion',
  },
  trending: {
    bg: 'from-red-950 via-slate-900 to-rose-950',
    accent: 'text-red-400',
    text: 'text-red-100',
    icon: Flame,
    label: 'Live Trending',
  },
};

// Known broken or 404 Unsplash photo IDs mapped to reliable high-res alternatives
const KNOWN_REPLACEMENTS: Record<string, string> = {
  'photo-1517976487502-5f7140e4f3a9':
    'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=85',
  'photo-1601055903647-87332213e2d6':
    'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=1200&q=85',
};

export const NewsImage: React.FC<NewsImageProps> = ({
  src,
  alt,
  className = '',
  category = 'India',
  loading = 'lazy',
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Normalize image source
  let resolvedSrc = (src || '').trim();
  for (const [brokenId, cleanUrl] of Object.entries(KNOWN_REPLACEMENTS)) {
    if (resolvedSrc.includes(brokenId)) {
      resolvedSrc = cleanUrl;
      break;
    }
  }

  const catKey = (category || 'india').toLowerCase();
  const theme = CATEGORY_STYLES[catKey] || CATEGORY_STYLES.india;
  const IconComponent = theme.icon;

  if (!resolvedSrc || hasError) {
    return (
      <div
        className={`w-full h-full relative overflow-hidden bg-gradient-to-br ${theme.bg} flex flex-col justify-between p-4 sm:p-5 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        {/* Subtle geometric hairline pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Top Bureau Label */}
        <div className="relative z-10 flex items-center justify-between">
          <span className={`text-[10px] font-bold tracking-widest uppercase font-mono ${theme.accent}`}>
            {theme.label}
          </span>
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
        </div>

        {/* Center / Bottom Title Snippet */}
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-5 h-5 ${theme.accent}`} />
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
              iamnewsagent dispatch
            </span>
          </div>
          <p className={`text-xs sm:text-sm font-serif font-medium line-clamp-2 leading-snug ${theme.text}`}>
            {alt}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-slate-900 ${className}`}>
      {/* Skeleton loader backdrop while image streams in */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
          <Newspaper className="w-6 h-6 text-slate-600" />
        </div>
      )}

      <img
        src={resolvedSrc}
        alt={alt}
        loading={priority ? 'eager' : loading}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
