import type { BannerAd } from '../types';

export const DEFAULT_STICKY_AD: BannerAd = {
  id: 'ad-def-sticky',
  format: 'sticky-bottom',
  label: 'INTELLIGENCE PARTNER',
  title: 'HYPERION ZERO-KNOWLEDGE LEDGER',
  description: 'Atomic cross-border clearing for sovereign treasury desks.',
  ctaText: 'Explore Rails',
  ctaUrl: 'https://github.com',
  sponsor: 'Hyperion Settlement Labs',
};

const STORAGE_KEY_STICKY = 'iamnewsagent_ad_sticky_bottom';
const STORAGE_KEY_ENABLED = 'iamnewsagent_ad_sticky_enabled';

export function getStickyBannerAd(): BannerAd {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_STICKY);
    if (saved) {
      return { ...DEFAULT_STICKY_AD, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to parse sticky banner ad from storage:', e);
  }
  return DEFAULT_STICKY_AD;
}

export function saveStickyBannerAd(ad: Partial<BannerAd>): BannerAd {
  const current = getStickyBannerAd();
  const updated: BannerAd = {
    ...current,
    ...ad,
    format: 'sticky-bottom',
  };
  try {
    localStorage.setItem(STORAGE_KEY_STICKY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save sticky banner ad:', e);
  }
  return updated;
}

export function isStickyBannerEnabled(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY_ENABLED);
    if (val !== null) {
      return val === 'true';
    }
  } catch (e) {
    console.error('Failed to read sticky banner enabled state:', e);
  }
  return true; // Enabled by default
}

export function setStickyBannerEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_ENABLED, String(enabled));
  } catch (e) {
    console.error('Failed to save sticky banner enabled state:', e);
  }
}
