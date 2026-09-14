import React, { useState, useEffect } from 'react';
import { ExternalLink, X, ShieldCheck } from 'lucide-react';
import type { BannerAd as BannerAdType } from '../types';
import { getStickyBannerAd, isStickyBannerEnabled } from '../utils/adManager';

interface BannerAdProps {
  ad?: BannerAdType;
  format?: 'leaderboard' | 'mpu' | 'native-inline' | 'sticky-bottom';
  className?: string;
}

const DEFAULT_ADS: Record<string, BannerAdType> = {
  leaderboard: {
    id: 'ad-def-leaderboard',
    format: 'leaderboard',
    label: 'SPONSORED BRIEFING',
    title: 'NEXUS QUANTUM CLOUD: Fault-Tolerant Enterprise Security',
    description: 'Post-quantum cryptographic migration audits for global banking and intelligence systems.',
    ctaText: 'Access Audit Suite',
    ctaUrl: '#sponsor-link',
    sponsor: 'Nexus Quantum Systems',
  },
  mpu: {
    id: 'ad-def-mpu',
    format: 'mpu',
    label: 'SPONSORED DISPATCH',
    title: 'SENTINEL ORBITAL TERMINAL',
    description: 'Real-time multi-spectral satellite telemetry and maritime surveillance feeds.',
    ctaText: 'Request Trial Desk',
    ctaUrl: '#sponsor-link',
    sponsor: 'Sentinel Orbital Intelligence',
  },
  'native-inline': {
    id: 'ad-def-native',
    format: 'native-inline',
    label: 'EXECUTIVE INTELLIGENCE SPONSOR',
    title: 'The Sovereign AI Infrastructure Outlook (2026–2030)',
    description: 'Global compute allocations, power grid bottlenecks, and geopolitical silicon reserve strategies.',
    ctaText: 'Download Strategy Brief [PDF]',
    ctaUrl: '#sponsor-link',
    sponsor: 'Aethelgard Strategic Advisory',
  },
  'sticky-bottom': {
    id: 'ad-def-sticky',
    format: 'sticky-bottom',
    label: 'INTELLIGENCE PARTNER',
    title: 'HYPERION ZERO-KNOWLEDGE LEDGER',
    description: 'Atomic cross-border clearing for sovereign treasury desks.',
    ctaText: 'Explore Rails',
    ctaUrl: '#sponsor-link',
    sponsor: 'Hyperion Settlement Labs',
  },
};

export const BannerAd: React.FC<BannerAdProps> = ({
  ad,
  format = 'leaderboard',
  className = '',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [activeStickyAd, setActiveStickyAd] = useState<BannerAdType>(() => getStickyBannerAd());
  const [stickyEnabled, setStickyEnabled] = useState<boolean>(() => isStickyBannerEnabled());

  // Listen to storage events or state changes for ad updates
  useEffect(() => {
    if (format === 'sticky-bottom') {
      setActiveStickyAd(getStickyBannerAd());
      setStickyEnabled(isStickyBannerEnabled());

      const handleStorage = () => {
        setActiveStickyAd(getStickyBannerAd());
        setStickyEnabled(isStickyBannerEnabled());
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
  }, [format]);

  if (isDismissed) return null;
  if (format === 'sticky-bottom' && !stickyEnabled && !ad) return null;

  const activeAd = ad || (format === 'sticky-bottom' ? activeStickyAd : DEFAULT_ADS[format]);
  if (!activeAd) return null;

  const isExternalLink = Boolean(
    activeAd.ctaUrl && (activeAd.ctaUrl.startsWith('http://') || activeAd.ctaUrl.startsWith('https://') || activeAd.ctaUrl.startsWith('//'))
  );

  // Format 1: Leaderboard (728x90 on desktop, responsive)
  if (format === 'leaderboard') {
    return (
      <aside
        id={`ad-leaderboard-${activeAd.id}`}
        aria-label="Sponsored Advertisement"
        className={`w-full my-6 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-xs ${className}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider text-red-700 uppercase px-1.5 py-0.5 rounded bg-red-50 border border-red-200">
              {activeAd.label}
            </span>
            <span className="text-[11px] text-slate-500 truncate">
              {activeAd.sponsor}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 truncate">
            {activeAd.title}
          </h4>
          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
            {activeAd.description}
          </p>
        </div>

        <div className="flex-shrink-0 w-full sm:w-auto">
          <a
            href={activeAd.ctaUrl || '#'}
            target={isExternalLink ? '_blank' : undefined}
            rel={isExternalLink ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <span>{activeAd.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>
    );
  }

  // Format 2: MPU / Medium Rectangle (300x250)
  if (format === 'mpu') {
    return (
      <aside
        id={`ad-mpu-${activeAd.id}`}
        aria-label="Sponsored Advertisement"
        className={`w-full max-w-[320px] mx-auto rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between text-left shadow-xs ${className}`}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-red-700 uppercase px-1.5 py-0.5 rounded bg-red-50 border border-red-200">
              {activeAd.label}
            </span>
            <span className="text-[10px] text-slate-400">Ad</span>
          </div>

          <div className="h-28 w-full rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 relative overflow-hidden">
            {activeAd.image ? (
              <img
                src={activeAd.image}
                alt={activeAd.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-2">
                <ShieldCheck className="w-7 h-7 text-red-600 mb-1" />
                <span className="text-[11px] text-slate-700 font-medium">
                  {activeAd.sponsor}
                </span>
              </div>
            )}
          </div>

          <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
            {activeAd.title}
          </h4>
          <p className="text-xs text-slate-600 mt-1.5 line-clamp-3">
            {activeAd.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <a
            href={activeAd.ctaUrl || '#'}
            target={isExternalLink ? '_blank' : undefined}
            rel={isExternalLink ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs transition-colors"
          >
            <span>{activeAd.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>
    );
  }

  // Format 3: Native Inline (blends seamlessly in article text)
  if (format === 'native-inline') {
    return (
      <aside
        id={`ad-native-${activeAd.id}`}
        aria-label="Sponsored In-Article Content"
        className={`my-8 p-4 sm:p-5 rounded-xl border border-red-200 bg-red-50/40 text-left relative ${className}`}
      >
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-red-200/60">
          <span className="text-[10px] font-bold tracking-wider text-red-700 uppercase">
            {activeAd.label} &bull; {activeAd.sponsor}
          </span>
          <span className="text-[10px] text-slate-400">Verified Partner</span>
        </div>
        <h4 className="text-base font-bold text-slate-900 font-serif mb-1">
          {activeAd.title}
        </h4>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
          {activeAd.description}
        </p>
        <a
          href={activeAd.ctaUrl || '#'}
          target={isExternalLink ? '_blank' : undefined}
          rel={isExternalLink ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:underline"
        >
          <span>{activeAd.ctaText}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </aside>
    );
  }

  // Format 4: Sticky Bottom Anchor
  return (
    <div
      id={`ad-sticky-${activeAd.id}`}
      aria-label="Floating Sponsored Anchor"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg transition-transform"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] font-bold tracking-wider text-red-700 uppercase px-1.5 py-0.5 rounded bg-red-50 border border-red-200 flex-shrink-0">
            Ad
          </span>
          <div className="truncate">
            <span className="text-xs font-bold text-slate-900 mr-2">{activeAd.title}</span>
            <span className="text-xs text-slate-500 hidden md:inline truncate">{activeAd.description}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={activeAd.ctaUrl || '#'}
            target={isExternalLink ? '_blank' : undefined}
            rel={isExternalLink ? 'noopener noreferrer' : undefined}
            className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-xs"
          >
            <span>{activeAd.ctaText}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            id="dismiss-sticky-ad-btn"
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Dismiss Ad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
