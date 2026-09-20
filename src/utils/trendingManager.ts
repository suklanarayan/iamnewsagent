import type { TrendingItem } from '../types';
import { SEED_TRENDING_NOW } from '../data/seedData';
import { getFirestoreDb } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface TrendingSettings {
  sectionTitle: string;
  isEnabled: boolean;
  items: TrendingItem[];
}

export const DEFAULT_TRENDING_SETTINGS: TrendingSettings = {
  sectionTitle: 'Trending Now',
  isEnabled: true,
  items: SEED_TRENDING_NOW,
};

const STORAGE_KEY = 'iamnewsagent_trending_settings';

export function getTrendingSettings(): TrendingSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return {
          sectionTitle: parsed.sectionTitle || 'Trending Now',
          isEnabled: typeof parsed.isEnabled === 'boolean' ? parsed.isEnabled : true,
          items: parsed.items,
        };
      }
    }
  } catch (e) {
    console.error('Failed reading trending settings from localStorage:', e);
  }
  return DEFAULT_TRENDING_SETTINGS;
}

export function saveTrendingSettings(settings: TrendingSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('trending-updated', { detail: settings }));

    // Async sync to Firestore site_settings
    syncTrendingToFirestore(settings);
  } catch (e) {
    console.error('Failed saving trending settings:', e);
  }
}

export function resetTrendingSettings(): TrendingSettings {
  saveTrendingSettings(DEFAULT_TRENDING_SETTINGS);
  return DEFAULT_TRENDING_SETTINGS;
}

export async function syncTrendingToFirestore(settings: TrendingSettings): Promise<void> {
  try {
    const db = getFirestoreDb();
    if (db) {
      const docRef = doc(db, 'site_settings', 'trending_now');
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch {
    // Silent fallback to local storage
  }
}

export async function loadTrendingFromFirestore(): Promise<TrendingSettings> {
  try {
    const db = getFirestoreDb();
    if (db) {
      const docRef = doc(db, 'site_settings', 'trending_now');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.items) && data.items.length > 0) {
          const settings: TrendingSettings = {
            sectionTitle: data.sectionTitle || 'Trending Now',
            isEnabled: typeof data.isEnabled === 'boolean' ? data.isEnabled : true,
            items: data.items,
          };
          saveTrendingSettings(settings);
          return settings;
        }
      }
    }
  } catch {
    // Ignore errors
  }
  return getTrendingSettings();
}
