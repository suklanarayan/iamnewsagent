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
import { SEED_ARTICLES, SEED_AUTHORS } from '../data/seedData';
import type { Article, Author } from '../types';

const ARTICLES_STORAGE_KEY = 'iamquickagent_articles_v2';
const AUTHORS_STORAGE_KEY = 'iamquickagent_authors_v2';

// Initialize local storage cache if not present
function initializeLocalStorage(): { articles: Article[]; authors: Author[] } {
  let articles = SEED_ARTICLES;
  let authors = SEED_AUTHORS;

  try {
    const cachedArticles = localStorage.getItem(ARTICLES_STORAGE_KEY);
    if (cachedArticles) {
      const parsed = JSON.parse(cachedArticles);
      if (Array.isArray(parsed) && parsed.length > 0) {
        articles = parsed;
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
    const raw = localStorage.getItem(ARTICLES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading local articles:', e);
  }
  return SEED_ARTICLES;
}

export function setLocalArticles(articles: Article[]): void {
  try {
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
  } catch (e) {
    console.error('Failed saving local articles:', e);
  }
}

export function getLocalAuthors(): Author[] {
  try {
    const raw = localStorage.getItem(AUTHORS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading local authors:', e);
  }
  return SEED_AUTHORS;
}

export function setLocalAuthors(authors: Author[]): void {
  try {
    localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(authors));
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
  const newArticle: Article = {
    ...data,
    id,
    views: 1,
  };

  // 1. Save to LocalStorage immediately
  const current = getLocalArticles();
  const updated = [newArticle, ...current];
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

  const updatedArticle: Article = {
    ...current[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  current[idx] = updatedArticle;
  setLocalArticles([...current]);

  // Firestore update
  const db = getFirestoreDb();
  if (db) {
    try {
      const docRef = doc(db, 'articles', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Failed updating Firestore doc:', e);
    }
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
        const authors = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Author, 'id'>) }));
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
