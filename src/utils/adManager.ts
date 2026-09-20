import type { BannerAd } from '../types';

export const DEFAULT_ADS: Record<string, BannerAd> = {
  leaderboard: {
    id: 'ad-def-leaderboard',
    format: 'leaderboard',
    label: 'SPONSORED BRIEFING',
    title: 'NEXUS QUANTUM CLOUD: Fault-Tolerant Enterprise Security',
    description: 'Post-quantum cryptographic migration audits for global banking and intelligence systems.',
    ctaText: 'Access Audit Suite',
    ctaUrl: 'https://iamnewsagent.com/sponsor/nexus-quantum',
    sponsor: 'Nexus Quantum Systems',
  },
  'sticky-bottom': {
    id: 'ad-def-sticky',
    format: 'sticky-bottom',
    label: 'INTELLIGENCE PARTNER',
    title: 'HYPERION ZERO-KNOWLEDGE LEDGER',
    description: 'Atomic cross-border clearing for sovereign treasury desks.',
    ctaText: 'Explore Rails',
    ctaUrl: 'https://github.com',
    sponsor: 'Hyperion Settlement Labs',
  },
  'native-inline': {
    id: 'ad-def-native',
    format: 'native-inline',
    label: 'EXECUTIVE INTELLIGENCE SPONSOR',
    title: 'The Sovereign AI Infrastructure Outlook (2026–2030)',
    description: 'Global compute allocations, power grid bottlenecks, and geopolitical silicon reserve strategies.',
    ctaText: 'Download Strategy Brief [PDF]',
    ctaUrl: 'https://iamnewsagent.com/sponsor/sovereign-ai-report',
    sponsor: 'Aethelgard Strategic Advisory',
  },
  mpu: {
    id: 'ad-def-mpu',
    format: 'mpu',
    label: 'SPONSORED DISPATCH',
    title: 'SENTINEL ORBITAL TERMINAL',
    description: 'Real-time multi-spectral satellite telemetry and maritime surveillance feeds.',
    ctaText: 'Request Trial Desk',
    ctaUrl: 'https://iamnewsagent.com/sponsor/global-sentinel',
    sponsor: 'Sentinel Orbital Intelligence',
  },
};

export const DEFAULT_STICKY_AD = DEFAULT_ADS['sticky-bottom'];

const STORAGE_KEY_PREFIX = 'iamnewsagent_ad_';
const STORAGE_KEY_ENABLED_PREFIX = 'iamnewsagent_ad_enabled_';

export function getBannerAd(format: 'leaderboard' | 'mpu' | 'native-inline' | 'sticky-bottom'): BannerAd {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${format}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_ADS[format], ...parsed, format };
    }
  } catch (e) {
    console.error(`Failed to parse ad config for ${format}:`, e);
  }
  return DEFAULT_ADS[format];
}

export function saveBannerAd(
  format: 'leaderboard' | 'mpu' | 'native-inline' | 'sticky-bottom',
  ad: Partial<BannerAd>
): BannerAd {
  const current = getBannerAd(format);
  const updated: BannerAd = {
    ...current,
    ...ad,
    format,
  };
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${format}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('ad-config-updated', { detail: { format, ad: updated } }));
  } catch (e) {
    console.error(`Failed to save ad config for ${format}:`, e);
  }
  return updated;
}

export function isBannerAdEnabled(format: 'leaderboard' | 'mpu' | 'native-inline' | 'sticky-bottom'): boolean {
  try {
    const val = localStorage.getItem(`${STORAGE_KEY_ENABLED_PREFIX}${format}`);
    if (val !== null) {
      return val === 'true';
    }
  } catch (e) {
    console.error(`Failed to read ad enabled state for ${format}:`, e);
  }
  return true; // Enabled by default
}

export function setBannerAdEnabled(
  format: 'leaderboard' | 'mpu' | 'native-inline' | 'sticky-bottom',
  enabled: boolean
): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_ENABLED_PREFIX}${format}`, String(enabled));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('ad-config-updated', { detail: { format, enabled } }));
  } catch (e) {
    console.error(`Failed to save ad enabled state for ${format}:`, e);
  }
}

export function resetBannerAd(format: 'leaderboard' | 'mpu' | 'native-inline' | 'sticky-bottom'): BannerAd {
  const def = DEFAULT_ADS[format];
  saveBannerAd(format, def);
  setBannerAdEnabled(format, true);
  return def;
}

// Backward-compatibility wrappers for sticky bottom banner
export function getStickyBannerAd(): BannerAd {
  return getBannerAd('sticky-bottom');
}

export function saveStickyBannerAd(ad: Partial<BannerAd>): BannerAd {
  return saveBannerAd('sticky-bottom', ad);
}

export function isStickyBannerEnabled(): boolean {
  return isBannerAdEnabled('sticky-bottom');
}

export function setStickyBannerEnabled(enabled: boolean): void {
  setBannerAdEnabled('sticky-bottom', enabled);
}
