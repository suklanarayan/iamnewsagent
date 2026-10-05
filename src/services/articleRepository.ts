import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { getFirestoreDb, getSavedFirebaseConfig } from './firebase';
import { SEED_ARTICLES, SEED_AUTHORS, SEED_LIVE_STORIES } from '../data/seedData';
import type { Article, Author, LiveStory } from '../types';

const ARTICLES_STORAGE_KEY = 'iamquickagent_articles_v2';
const AUTHORS_STORAGE_KEY = 'iamquickagent_authors_v2';
const LIVE_STORIES_STORAGE_KEY = 'iamquickagent_live_stories_v2';

// In-memory fallback for environments without window.localStorage
let inMemoryArticles: Article[] = [...SEED_ARTICLES];
let inMemoryAuthors: Author[] = [...SEED_AUTHORS];
let inMemoryLiveStories: LiveStory[] = [...SEED_LIVE_STORIES];

// Initialize local storage cache if not present
function initializeLocalStorage(): { articles: Article[]; authors: Author[] } {
  let articles = SEED_ARTICLES;
  let authors = SEED_AUTHORS;

  try {
    if (typeof localStorage === 'undefined') {
      return { articles: inMemoryArticles, authors: inMemoryAuthors };
    }
    const cachedArticles = localStorage.getItem(ARTICLES_STORAGE_KEY);
    if (cachedArticles) {
      const parsed = JSON.parse(cachedArticles);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Heal any 2025 dates in cached articles to 2026
        articles = parsed.map((a: Article) => {
          let p = a.publishedAt;
          let u = a.updatedAt;
          if (p && p.startsWith('2025-')) {
            p = p.replace('2025-', '2026-');
          }
          if (u && u.startsWith('2025-')) {
            u = u.replace('2025-', '2026-');
          }
          if (a.headline && a.headline.toLowerCase().includes('japanese fighters')) {
            p = '2026-09-20T09:30:00.000Z';
            u = '2026-09-20T09:30:00.000Z';
          }
          return { ...a, publishedAt: p, updatedAt: u };
        });

        let merged = false;
        for (const seedArt of SEED_ARTICLES) {
          if (!articles.some((a) => a.id === seedArt.id || a.slug === seedArt.slug)) {
            articles = [seedArt, ...articles];
            merged = true;
          }
        }
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
      } else {
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(SEED_ARTICLES));
      }
    } else {
      localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(SEED_ARTICLES));
    }

    const cachedAuthors = localStorage.getItem(AUTHORS_STORAGE_KEY);
    if (cachedAuthors) {
      const parsed = JSON.parse(cachedAuthors);
      if (Array.isArray(parsed) && parsed.length > 0) {
        authors = parsed;
        let mergedAuthors = false;
        for (const seedAuth of SEED_AUTHORS) {
          if (!authors.some((a) => a.id === seedAuth.id)) {
            authors = [seedAuth, ...authors];
            mergedAuthors = true;
          }
        }
        if (mergedAuthors) {
          localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(authors));
        }
      } else {
        localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(SEED_AUTHORS));
      }
    } else {
      localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(SEED_AUTHORS));
    }
  } catch (e) {
    console.warn('LocalStorage initialization warning:', e);
  }

  return { articles, authors };
}

export function getLocalArticles(): Article[] {
  try {
    if (typeof localStorage === 'undefined') {
      return [...inMemoryArticles].sort(
        (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
      );
    }
    const raw = localStorage.getItem(ARTICLES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.sort(
          (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
        );
      }
    }
  } catch (e) {
    console.error('Failed reading local articles:', e);
  }
  return inMemoryArticles.length > 0 ? inMemoryArticles : SEED_ARTICLES;
}

export function setLocalArticles(articles: Article[]): void {
  try {
    const sorted = [...articles].sort(
      (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
    );
    inMemoryArticles = sorted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(sorted));
    }
  } catch (e) {
    console.error('Failed saving local articles:', e);
  }
}

export function getLocalAuthors(): Author[] {
  try {
    if (typeof localStorage === 'undefined') return inMemoryAuthors;
    const raw = localStorage.getItem(AUTHORS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading local authors:', e);
  }
  return inMemoryAuthors.length > 0 ? inMemoryAuthors : SEED_AUTHORS;
}

export function setLocalAuthors(authors: Author[]): void {
  try {
    inMemoryAuthors = authors;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(authors));
    }
  } catch (e) {
    console.error('Failed saving local authors:', e);
  }
}

// Ensure seeded on module load
initializeLocalStorage();

/**
 * Fetch all articles with optional filters
 */
export async function getArticles(filter?: {
  category?: string;
  tag?: string;
  search?: string;
  status?: string;
}): Promise<Article[]> {
  const db = getFirestoreDb();
  let list: Article[] = [];

  if (db) {
    try {
      const colRef = collection(db, 'articles');
      const q = query(colRef, orderBy('publishedAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      if (!snap.empty) {
        list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Article, 'id'>) }));

        // Heal any 2025 dates in Firestore to 2026
        for (const art of list) {
          let needsUpdate = false;
          let newPub = art.publishedAt;
          let newUpd = art.updatedAt;
          if (art.publishedAt && art.publishedAt.startsWith('2025-')) {
            newPub = art.publishedAt.replace('2025-', '2026-');
            needsUpdate = true;
          }
          if (art.updatedAt && art.updatedAt.startsWith('2025-')) {
            newUpd = art.updatedAt.replace('2025-', '2026-');
            needsUpdate = true;
          }
          if (art.headline && art.headline.toLowerCase().includes('japanese fighters') && (!art.publishedAt || art.publishedAt.includes('2025'))) {
            newPub = '2026-09-20T09:30:00.000Z';
            newUpd = '2026-09-20T09:30:00.000Z';
            needsUpdate = true;
          }
          if (needsUpdate) {
            art.publishedAt = newPub;
            art.updatedAt = newUpd;
            try {
              updateDoc(doc(db, 'articles', art.id), {
                publishedAt: newPub,
                updatedAt: newUpd,
              }).catch(() => {});
            } catch {
              // silent
            }
          }
        }

        // Ensure newest seed articles (e.g. newly published articles) exist in Firestore
        for (const seedArt of SEED_ARTICLES) {
          if (!list.some((a) => a.id === seedArt.id || a.slug === seedArt.slug)) {
            try {
              await setDoc(doc(db, 'articles', seedArt.id), seedArt);
              list.unshift(seedArt);
            } catch (err) {
              console.warn('Silent sync seed article:', err);
            }
          }
        }

        // CRITICAL FIX: Merge freshly created/updated articles from local storage!
        // When an article is created or published, Firestore query indexing latency
        // can cause getDocs to temporarily omit the newly created doc.
        // Merging local articles guarantees newly published news is NEVER lost or delayed on the front page.
        const localList = getLocalArticles();
        const firestoreIds = new Set(list.map((a) => a.id));
        for (const localArt of localList) {
          if (!firestoreIds.has(localArt.id)) {
            list.unshift(localArt);
            firestoreIds.add(localArt.id);
          } else {
            const fsIdx = list.findIndex((a) => a.id === localArt.id);
            if (fsIdx !== -1 && localArt.updatedAt && list[fsIdx].updatedAt) {
              if (new Date(localArt.updatedAt).getTime() > new Date(list[fsIdx].updatedAt).getTime()) {
                list[fsIdx] = localArt;
              }
            }
          }
        }

        // Strictly sort all articles by publication date descending (newest published first)
        list.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
        setLocalArticles(list); // Keep local backup synced
      } else {
        // If Firestore collection is empty, seed it with initial articles
        for (const art of SEED_ARTICLES) {
          await setDoc(doc(db, 'articles', art.id), art);
        }
        list = SEED_ARTICLES;
        setLocalArticles(list);
      }
    } catch (e) {
      console.warn('Firestore fetch failed, falling back to local storage:', e);
      list = getLocalArticles();
    }
  } else {
    list = getLocalArticles();
  }

  // Strictly sort all articles by publication date descending (newest published first)
  list.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());

  // Filter application
  return list.filter((item) => {
    if (filter?.status && filter.status !== 'all' && item.status !== filter.status) {
      return false;
    }
    if (filter?.category && filter.category !== 'all' && item.category !== filter.category) {
      return false;
    }
    if (filter?.tag && !item.tags.some((t) => t.toLowerCase() === filter.tag?.toLowerCase())) {
      return false;
    }
    if (filter?.search) {
      const s = filter.search.toLowerCase();
      const inHeadline = item.headline.toLowerCase().includes(s);
      const inDeck = item.deck.toLowerCase().includes(s);
      const inContent = item.content.toLowerCase().includes(s);
      const inTakeaways = item.keyTakeaways.some((k) => k.toLowerCase().includes(s));
      const inTags = item.tags.some((t) => t.toLowerCase().includes(s));
      if (!inHeadline && !inDeck && !inContent && !inTakeaways && !inTags) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Get article by slug
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const all = await getArticles();
  const found = all.find((a) => a.slug === slug);
  return found || null;
}

/**
 * Get breaking news
 */
export async function getBreakingNews(): Promise<Article[]> {
  const all = await getArticles({ status: 'published' });
  return all.filter((a) => a.isBreaking);
}

/**
 * Create article
 */
export async function createArticle(
  data: Omit<Article, 'id' | 'views'>
): Promise<Article> {
  const id = 'art-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();
  const newArticle: Article = {
    ...data,
    id,
    views: 1,
    publishedAt: data.publishedAt || now,
    updatedAt: data.updatedAt || now,
  };

  // 1. Save to LocalStorage immediately with sort
  const current = getLocalArticles();
  const updated = [newArticle, ...current.filter((a) => a.id !== newArticle.id)];
  updated.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
  setLocalArticles(updated);

  // 2. Persist to Firestore if available
  const db = getFirestoreDb();
  if (db) {
    try {
      await setDoc(doc(db, 'articles', id), newArticle);
    } catch (e) {
      console.error('Failed saving to Firestore:', e);
    }
  }

  // 3. Immediately broadcast update event so Front page and all components update in real-time
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('articles-updated', { detail: newArticle }));
    window.dispatchEvent(new CustomEvent('news-data-changed'));
  }

  return newArticle;
}

/**
 * Update article
 */
export async function updateArticle(
  id: string,
  updates: Partial<Article>
): Promise<Article | null> {
  const current = getLocalArticles();
  const idx = current.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const updatedArticle: Article = {
    ...current[idx],
    ...updates,
    publishedAt: updates.publishedAt || current[idx].publishedAt || now,
    updatedAt: updates.updatedAt || now,
  };

  current[idx] = updatedArticle;
  current.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
  setLocalArticles([...current]);

  // Firestore update
  const db = getFirestoreDb();
  if (db) {
    try {
      const docRef = doc(db, 'articles', id);
      await updateDoc(docRef, {
        ...updates,
        publishedAt: updatedArticle.publishedAt,
        updatedAt: updatedArticle.updatedAt,
      });
    } catch (e) {
      console.error('Failed updating Firestore doc:', e);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('articles-updated', { detail: updatedArticle }));
    window.dispatchEvent(new CustomEvent('news-data-changed'));
  }

  return updatedArticle;
}

/**
 * Delete article
 */
export async function deleteArticle(id: string): Promise<boolean> {
  const current = getLocalArticles();
  const filtered = current.filter((a) => a.id !== id);
  setLocalArticles(filtered);

  const db = getFirestoreDb();
  if (db) {
    try {
      await deleteDoc(doc(db, 'articles', id));
    } catch (e) {
      console.error('Failed deleting from Firestore:', e);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('articles-updated', { detail: { id, deleted: true } }));
    window.dispatchEvent(new CustomEvent('news-data-changed'));
  }

  return true;
}

/**
 * Increment view count
 */
export async function incrementArticleViews(id: string): Promise<void> {
  const current = getLocalArticles();
  const idx = current.findIndex((a) => a.id === id);
  if (idx !== -1) {
    current[idx].views = (current[idx].views || 0) + 1;
    setLocalArticles([...current]);

    const db = getFirestoreDb();
    if (db) {
      try {
        await updateDoc(doc(db, 'articles', id), {
          views: current[idx].views,
        });
      } catch (e) {
        // Silent view increment error
      }
    }
  }
}

/**
 * Get all authors
 */
export async function getAuthors(): Promise<Author[]> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'authors'));
      if (!snap.empty) {
        let authors = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Author, 'id'>) }));
        for (const seedAuth of SEED_AUTHORS) {
          if (!authors.some((a) => a.id === seedAuth.id)) {
            try {
              await setDoc(doc(db, 'authors', seedAuth.id), seedAuth);
              authors.unshift(seedAuth);
            } catch (err) {
              console.warn('Silent sync seed author:', err);
            }
          }
        }
        setLocalAuthors(authors);
        return authors;
      } else {
        for (const auth of SEED_AUTHORS) {
          await setDoc(doc(db, 'authors', auth.id), auth);
        }
      }
    } catch (e) {
      console.warn('Firestore authors fetch failed, using local storage:', e);
    }
  }
  return getLocalAuthors();
}

/**
 * Get author by id
 */
export async function getAuthorById(id: string): Promise<Author | null> {
  const authors = await getAuthors();
  return authors.find((a) => a.id === id) || null;
}

/**
 * Create author
 */
export async function createAuthor(data: Omit<Author, 'id'>): Promise<Author> {
  const id = 'author-' + data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const newAuthor: Author = { ...data, id };

  const current = getLocalAuthors();
  setLocalAuthors([...current, newAuthor]);

  const db = getFirestoreDb();
  if (db) {
    try {
      await setDoc(doc(db, 'authors', id), newAuthor);
    } catch (e) {
      console.error('Failed saving author to Firestore:', e);
    }
  }

  return newAuthor;
}

/**
 * Check connectivity status for UI indicator
 */
export function getStorageStatus(): {
  isCloud: boolean;
  provider: 'Firestore' | 'Local Persistent Storage';
  details: string;
} {
  const config = getSavedFirebaseConfig();
  if (config && config.projectId) {
    return {
      isCloud: true,
      provider: 'Firestore',
      details: `Connected to Firebase Project [${config.projectId}]`,
    };
  }
  return {
    isCloud: false,
    provider: 'Local Persistent Storage',
    details: 'Operating on Local IndexedDB/Storage. Add Firebase credentials to enable cross-device cloud sync.',
  };
}

/**
 * Local storage helpers for Live Stories
 */
const BROKEN_IMAGE_HEALING_MAP: Record<string, string> = {
  'photo-1601055903647-87332213e2d6': 'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=300&q=80',
  'photo-1517976487502-5f7140e4f3a9': 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=300&q=80',
  'photo-1531415074868-036b1c57e329': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=300&q=80',
};

/**
 * Sort helper to strictly order stories by 'order' ascending (0 = first)
 */
export function sortStoriesByOrder(stories: LiveStory[]): LiveStory[] {
  return [...stories].sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : 9999;
    const orderB = typeof b.order === 'number' ? b.order : 9999;
    if (orderA !== orderB) return orderA - orderB;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });
}

export function getLocalLiveStories(): LiveStory[] {
  try {
    if (typeof localStorage === 'undefined') {
      return sortStoriesByOrder(inMemoryLiveStories);
    }
    const raw = localStorage.getItem(LIVE_STORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let merged = false;
        // Fix any legacy 404 URLs in cached local storage
        for (const story of parsed as LiveStory[]) {
          if (story.id === 'story-brics-2026') {
            if (!story.image || story.image.includes('photo-1517976487502-5f7140e4f3a9')) {
              story.image = '/brics-2026-summit.svg';
              merged = true;
            }
          }
          for (const [badKey, goodUrl] of Object.entries(BROKEN_IMAGE_HEALING_MAP)) {
            if (story.image && story.image.includes(badKey)) {
              story.image = goodUrl;
              merged = true;
            }
          }
        }
        for (const seedStory of SEED_LIVE_STORIES) {
          if (!parsed.some((s: LiveStory) => s.id === seedStory.id)) {
            parsed.push(seedStory);
            merged = true;
          }
        }

        // Ensure every story has a sequential order
        const sorted = sortStoriesByOrder(parsed);
        sorted.forEach((story, idx) => {
          if (story.order !== idx) {
            story.order = idx;
            merged = true;
          }
        });

        if (merged) {
          localStorage.setItem(LIVE_STORIES_STORAGE_KEY, JSON.stringify(sorted));
        }
        return sorted;
      }
    }
  } catch (e) {
    console.error('Failed reading local live stories:', e);
  }

  // Fallback to seeds with explicit sequential order
  const seeded = SEED_LIVE_STORIES.map((s, idx) => ({
    ...s,
    order: typeof s.order === 'number' ? s.order : idx,
  }));
  setLocalLiveStories(seeded);
  return seeded;
}

export function setLocalLiveStories(stories: LiveStory[]): void {
  try {
    const sorted = sortStoriesByOrder(stories);
    inMemoryLiveStories = sorted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LIVE_STORIES_STORAGE_KEY, JSON.stringify(sorted));
    }
  } catch (e) {
    console.error('Failed saving local live stories:', e);
  }
}

/**
 * Get all live stories from Firestore or Local Cache, guaranteed sorted with 1st story at index 0
 */
export async function getLiveStories(): Promise<LiveStory[]> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'live_stories'));
      if (!snap.empty) {
        let stories = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<LiveStory, 'id'>),
        }));

        // Heal any legacy 404 image URLs in Firestore
        for (const story of stories) {
          if (story.id === 'story-brics-2026') {
            if (!story.image || story.image.includes('photo-1517976487502-5f7140e4f3a9')) {
              story.image = '/brics-2026-summit.svg';
              updateDoc(doc(db, 'live_stories', story.id), { image: '/brics-2026-summit.svg' }).catch(console.warn);
            }
          }
          for (const [badKey, goodUrl] of Object.entries(BROKEN_IMAGE_HEALING_MAP)) {
            if (story.image && story.image.includes(badKey)) {
              story.image = goodUrl;
              updateDoc(doc(db, 'live_stories', story.id), { image: goodUrl }).catch(console.warn);
            }
          }
        }

        // Merge any missing seed stories into Firestore
        for (const seedStory of SEED_LIVE_STORIES) {
          if (!stories.some((s) => s.id === seedStory.id)) {
            stories.push(seedStory);
            setDoc(doc(db, 'live_stories', seedStory.id), seedStory).catch(console.warn);
          }
        }

        // Merge any locally created live stories that haven't synced to Firestore yet
        const localStories = getLocalLiveStories();
        const firestoreIds = new Set(stories.map(s => s.id));
        for (const localStory of localStories) {
          if (!firestoreIds.has(localStory.id)) {
            stories.push(localStory);
            firestoreIds.add(localStory.id);
          }
        }

        // Strictly sort by 'order'
        const sorted = sortStoriesByOrder(stories);
        sorted.forEach((story, idx) => {
          story.order = idx;
        });

        setLocalLiveStories(sorted);
        return sorted;
      } else {
        // Seed Firestore with initial live stories with explicit order
        const seeded = SEED_LIVE_STORIES.map((s, idx) => ({ ...s, order: idx }));
        for (const story of seeded) {
          await setDoc(doc(db, 'live_stories', story.id), story);
        }
        setLocalLiveStories(seeded);
        return seeded;
      }
    } catch (e) {
      console.warn('Firestore live stories fetch failed, falling back to local storage:', e);
    }
  }
  return getLocalLiveStories();
}

/**
 * Create a new live story.
 * By default targetPosition is 0 (FIRST position so newly published stories appear first on the wire).
 */
export async function createLiveStory(
  data: Omit<LiveStory, 'id'>,
  targetPosition: number = 0
): Promise<LiveStory> {
  const id = 'story-' + Date.now();
  const now = new Date().toISOString();
  const current = getLocalLiveStories();

  const safeTargetPos = Math.max(0, Math.min(targetPosition, current.length));

  const newStory: LiveStory = {
    ...data,
    id,
    order: safeTargetPos,
    createdAt: now,
    updatedAt: now,
  };

  // Insert newStory at target position (default 0 = FIRST)
  const updatedStories = [...current];
  updatedStories.splice(safeTargetPos, 0, newStory);

  // Re-index all orders sequentially: 0, 1, 2, ...
  updatedStories.forEach((s, idx) => {
    s.order = idx;
  });

  setLocalLiveStories(updatedStories);

  // Sync to Firestore
  const db = getFirestoreDb();
  if (db) {
    try {
      await setDoc(doc(db, 'live_stories', id), newStory);
      // Update order on all stories in Firestore
      for (const story of updatedStories) {
        if (story.id !== id) {
          updateDoc(doc(db, 'live_stories', story.id), { order: story.order }).catch(console.warn);
        }
      }
    } catch (e) {
      console.error('Failed saving live story to Firestore:', e);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('live-stories-updated'));
    window.dispatchEvent(new CustomEvent('news-data-changed'));
  }

  return newStory;
}

/**
 * Update an existing live story with optional repositioning (move to first or any other position)
 */
export async function updateLiveStory(
  id: string,
  updates: Partial<LiveStory>,
  targetPosition?: number
): Promise<LiveStory | null> {
  const current = getLocalLiveStories();
  const currentIndex = current.findIndex((s) => s.id === id);
  if (currentIndex === -1) return null;

  const now = new Date().toISOString();
  const existingStory = current[currentIndex];
  const updatedStory: LiveStory = {
    ...existingStory,
    ...updates,
    id,
    updatedAt: now,
  };

  let updatedList = [...current];

  // If a targetPosition is specified, move the story to that position!
  if (typeof targetPosition === 'number' && targetPosition >= 0) {
    const safePos = Math.max(0, Math.min(targetPosition, updatedList.length - 1));
    updatedList.splice(currentIndex, 1);
    updatedList.splice(safePos, 0, updatedStory);
  } else {
    updatedList[currentIndex] = updatedStory;
  }

  // Re-index all stories: 0, 1, 2, ...
  updatedList.forEach((s, idx) => {
    s.order = idx;
  });

  setLocalLiveStories(updatedList);

  const db = getFirestoreDb();
  if (db) {
    try {
      await setDoc(doc(db, 'live_stories', id), updatedStory, { merge: true });
      // If position changed, update order for affected stories in Firestore
      for (const s of updatedList) {
        updateDoc(doc(db, 'live_stories', s.id), { order: s.order }).catch(console.warn);
      }
    } catch (e) {
      console.error('Failed updating live story in Firestore:', e);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('live-stories-updated'));
    window.dispatchEvent(new CustomEvent('news-data-changed'));
  }

  return updatedStory;
}

/**
 * Move a live story to 'first', 'up', 'down', or 'last' position
 */
export async function moveLiveStory(
  id: string,
  direction: 'first' | 'up' | 'down' | 'last'
): Promise<LiveStory[]> {
  const current = getLocalLiveStories();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) return current;

  let targetIndex = index;
  if (direction === 'first') {
    targetIndex = 0;
  } else if (direction === 'last') {
    targetIndex = current.length - 1;
  } else if (direction === 'up') {
    targetIndex = Math.max(0, index - 1);
  } else if (direction === 'down') {
    targetIndex = Math.min(current.length - 1, index + 1);
  }

  if (targetIndex === index) return current;

  const updated = [...current];
  const [removed] = updated.splice(index, 1);
  updated.splice(targetIndex, 0, removed);

  // Re-index
  updated.forEach((s, idx) => {
    s.order = idx;
  });

  setLocalLiveStories(updated);

  const db = getFirestoreDb();
  if (db) {
    try {
      for (const s of updated) {
        updateDoc(doc(db, 'live_stories', s.id), { order: s.order }).catch(console.warn);
      }
    } catch (e) {
      console.warn('Firestore sync order warning:', e);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('live-stories-updated'));
    window.dispatchEvent(new CustomEvent('news-data-changed'));
  }

  return updated;
}

/**
 * Reorder a story directly to a specified 0-based position
 */
export async function reorderLiveStoryToPosition(
  id: string,
  targetPosition: number
): Promise<LiveStory[]> {
  const current = getLocalLiveStories();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) return current;

  const safePos = Math.max(0, Math.min(targetPosition, current.length - 1));
  if (safePos === index) return current;

  const updated = [...current];
  const [removed] = updated.splice(index, 1);
  updated.splice(safePos, 0, removed);

  updated.forEach((s, idx) => {
    s.order = idx;
  });

  setLocalLiveStories(updated);

  const db = getFirestoreDb();
  if (db) {
    try {
      for (const s of updated) {
        updateDoc(doc(db, 'live_stories', s.id), { order: s.order }).catch(console.warn);
      }
    } catch (e) {
      console.warn('Firestore sync order warning:', e);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('live-stories-updated'));
    window.dispatchEvent(new CustomEvent('news-data-changed'));
  }

  return updated;
}

/**
 * Delete a live story
 */
export async function deleteLiveStory(id: string): Promise<boolean> {
  const current = getLocalLiveStories();
  const filtered = current.filter((s) => s.id !== id);

  // Re-index remaining stories
  filtered.forEach((s, idx) => {
    s.order = idx;
  });

  setLocalLiveStories(filtered);

  const db = getFirestoreDb();
  if (db) {
    try {
      await deleteDoc(doc(db, 'live_stories', id));
      for (const s of filtered) {
        updateDoc(doc(db, 'live_stories', s.id), { order: s.order }).catch(console.warn);
      }
    } catch (e) {
      console.error('Failed deleting live story from Firestore:', e);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('live-stories-updated'));
    window.dispatchEvent(new CustomEvent('news-data-changed'));
  }

  return true;
}

/**
 * Toggle the LIVE status of a story
 */
export async function toggleLiveStoryStatus(id: string): Promise<boolean> {
  const current = getLocalLiveStories();
  const story = current.find((s) => s.id === id);
  if (!story) return false;

  const newIsLive = !story.isLive;
  await updateLiveStory(id, { isLive: newIsLive });
  return newIsLive;
}
