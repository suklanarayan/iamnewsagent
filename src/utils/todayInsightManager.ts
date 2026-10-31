import type { Article } from '../types';
import { getFirestoreDb } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface TodayInsightSettings {
  articleId?: string; // Explicitly pinned article ID (if empty, auto-rotates)
  customBadge?: string; // e.g. "EXPLAINER BRIEF", "TODAY'S INSIGHT", "DAILY FOCUS"
  autoRotateNewest: boolean; // if true and articleId is not pinned, picks the latest explainer/story
  updatedAt?: string;
}

export const DEFAULT_TODAY_INSIGHT_SETTINGS: TodayInsightSettings = {
  articleId: '',
  customBadge: 'EXPLAINER BRIEF',
  autoRotateNewest: true,
};

const STORAGE_KEY = 'iamquickagent_today_insight_settings_v1';

/**
 * Retrieve Today's Insight settings from localStorage cache
 */
export function getTodayInsightSettings(): TodayInsightSettings {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            articleId: parsed.articleId || '',
            customBadge: parsed.customBadge || 'EXPLAINER BRIEF',
            autoRotateNewest: typeof parsed.autoRotateNewest === 'boolean' ? parsed.autoRotateNewest : true,
            updatedAt: parsed.updatedAt,
          };
        }
      }
    }
  } catch (e) {
    console.error('Failed reading today insight settings from localStorage:', e);
  }
  return DEFAULT_TODAY_INSIGHT_SETTINGS;
}

/**
 * Save Today's Insight settings to localStorage and Firestore
 */
export function saveTodayInsightSettings(settings: TodayInsightSettings): void {
  try {
    const payload = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('today-insight-updated', { detail: payload }));
    }

    // Background sync to Firestore
    syncTodayInsightToFirestore(payload);
  } catch (e) {
    console.error('Failed saving today insight settings:', e);
  }
}

/**
 * Quick helper to pin a specific article as Today's Insight
 */
export function setTodayInsightArticle(articleId: string, customBadge?: string): void {
  const current = getTodayInsightSettings();
  saveTodayInsightSettings({
    ...current,
    articleId,
    customBadge: customBadge || current.customBadge || 'EXPLAINER BRIEF',
    autoRotateNewest: false,
  });
}

/**
 * Reset Today's Insight to auto-rotate mode (newest explainer / news daily)
 */
export function resetTodayInsightToAutoRotate(): void {
  const current = getTodayInsightSettings();
  saveTodayInsightSettings({
    ...current,
    articleId: '',
    autoRotateNewest: true,
  });
}

/**
 * Persist settings into Firestore site_settings/today_insight
 */
export async function syncTodayInsightToFirestore(settings: TodayInsightSettings): Promise<void> {
  try {
    const db = getFirestoreDb();
    if (db) {
      const docRef = doc(db, 'site_settings', 'today_insight');
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Silent fallback for today_insight Firestore sync:', err);
  }
}

/**
 * Load settings from Firestore site_settings/today_insight on app boot
 */
export async function loadTodayInsightFromFirestore(): Promise<TodayInsightSettings> {
  try {
    const db = getFirestoreDb();
    if (db) {
      const docRef = doc(db, 'site_settings', 'today_insight');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const settings: TodayInsightSettings = {
          articleId: data.articleId || '',
          customBadge: data.customBadge || 'EXPLAINER BRIEF',
          autoRotateNewest: typeof data.autoRotateNewest === 'boolean' ? data.autoRotateNewest : true,
          updatedAt: data.updatedAt,
        };
        saveTodayInsightSettings(settings);
        return settings;
      }
    }
  } catch {
    // Ignore errors
  }
  return getTodayInsightSettings();
}

/**
 * Intelligently resolves the active Today's Insight article from available articles.
 * Never hardcodes any single story slug.
 *
 * Precedence:
 * 1. Pinned articleId from settings (if article still exists and is published)
 * 2. Any published article explicitly marked with isTodayInsight: true (sorted by publishedAt desc)
 * 3. If auto-rotate is active:
 *    - The newest published article marked with isExplainer: true or category === 'Explainers'
 *    - Or the newest published article with 2+ key takeaways (skipping the top 1 hero)
 *    - Or the second newest published article
 */
export function resolveTodayInsightArticle(
  articles: Article[],
  settings?: TodayInsightSettings,
  heroArticleId?: string
): Article | undefined {
  if (!articles || articles.length === 0) return undefined;

  const currentSettings = settings || getTodayInsightSettings();
  const publishedArticles = articles.filter((a) => (a.status || 'published') === 'published');
  if (publishedArticles.length === 0) return articles[0];

  // 1. Check if an article is explicitly pinned in settings
  if (currentSettings.articleId) {
    const pinned = publishedArticles.find((a) => a.id === currentSettings.articleId);
    if (pinned) return pinned;
  }

  // 2. Check for any article with isTodayInsight: true
  const insightFlagged = publishedArticles
    .filter((a) => a.isTodayInsight)
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
  if (insightFlagged.length > 0) {
    return insightFlagged[0];
  }

  // 3. Auto-rotate mode:
  // Find newest published explainer (excluding hero article so hero isn't duplicated)
  const explainers = publishedArticles
    .filter((a) => (a.isExplainer || a.category === 'Explainers') && a.id !== heroArticleId)
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
  if (explainers.length > 0) {
    return explainers[0];
  }

  // 4. Find newest published article with rich takeaways
  const richArticles = publishedArticles
    .filter((a) => a.id !== heroArticleId && (a.keyTakeaways?.length || 0) >= 2)
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
  if (richArticles.length > 0) {
    return richArticles[0];
  }

  // 5. Fallback to second article or first article
  const fallback = publishedArticles.find((a) => a.id !== heroArticleId) || publishedArticles[0];
  return fallback;
}
