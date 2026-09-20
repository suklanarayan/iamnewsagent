import type { CategoryItem } from '../types';
import { getFirestoreDb } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'India',
    name: 'India',
    subtext: 'Politics, States, Governance',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    order: 1,
    isEnabled: true,
  },
  {
    id: 'World',
    name: 'World',
    subtext: 'Global News, Geopolitics',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    order: 2,
    isEnabled: true,
  },
  {
    id: 'Business',
    name: 'Business',
    subtext: 'Markets, Economy, Industry',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    order: 3,
    isEnabled: true,
  },
  {
    id: 'Technology',
    name: 'Technology',
    subtext: 'AI, Gadgets, Innovation',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    order: 4,
    isEnabled: true,
  },
  {
    id: 'Sports',
    name: 'Sports',
    subtext: 'Cricket, Football, More',
    // Solid, verified high-resolution stadium / sports athletics image on Unsplash
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
    order: 5,
    isEnabled: true,
  },
  {
    id: 'Health',
    name: 'Health',
    subtext: 'Wellness, Research',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    order: 6,
    isEnabled: true,
  },
  {
    id: 'Lifestyle',
    name: 'Lifestyle',
    subtext: 'Travel, Food, Culture',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    order: 7,
    isEnabled: true,
  },
  {
    id: 'Entertainment',
    name: 'Entertainment',
    subtext: 'Movies, OTT, Celebrities',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    order: 8,
    isEnabled: true,
  },
];

const CATEGORIES_STORAGE_KEY = 'iamnewsagent_explore_categories';

export function getCategories(): CategoryItem[] {
  try {
    const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Fix any broken sports image from old cached localStorage
        const healed = parsed.map((item: CategoryItem) => {
          if (
            item.id === 'Sports' &&
            (!item.image || item.image.includes('photo-1531415074868-036b1c57e329'))
          ) {
            return {
              ...item,
              image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
            };
          }
          return item;
        });
        return healed;
      }
    }
  } catch (e) {
    console.error('Failed reading categories from storage:', e);
  }
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: CategoryItem[]): void {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('categories-updated', { detail: categories }));

    // Async sync to Firestore if available
    syncCategoriesToFirestore(categories);
  } catch (e) {
    console.error('Failed saving categories to storage:', e);
  }
}

export async function syncCategoriesToFirestore(categories: CategoryItem[]): Promise<void> {
  try {
    const db = getFirestoreDb();
    if (db) {
      const docRef = doc(db, 'site_settings', 'explore_categories');
      await setDoc(docRef, {
        categories,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch {
    // Graceful fallback to local persistence
  }
}

export async function loadCategoriesFromFirestore(): Promise<CategoryItem[]> {
  try {
    const db = getFirestoreDb();
    if (db) {
      const docRef = doc(db, 'site_settings', 'explore_categories');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          saveCategories(data.categories);
          return data.categories;
        }
      }
    }
  } catch {
    // silent fallback
  }
  return getCategories();
}

export function updateCategory(id: string, updates: Partial<CategoryItem>): CategoryItem[] {
  const current = getCategories();
  const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
  saveCategories(updated);
  return updated;
}

export function addCategory(newCategory: CategoryItem): CategoryItem[] {
  const current = getCategories();
  // Ensure unique ID
  let id = newCategory.id.trim() || newCategory.name.trim();
  id = id.replace(/\s+/g, '-');
  const exists = current.some((c) => c.id.toLowerCase() === id.toLowerCase());
  if (exists) {
    id = `${id}-${Date.now()}`;
  }
  const item: CategoryItem = {
    ...newCategory,
    id,
    order: current.length + 1,
    isEnabled: newCategory.isEnabled !== false,
  };
  const updated = [...current, item];
  saveCategories(updated);
  return updated;
}

export function deleteCategory(id: string): CategoryItem[] {
  const current = getCategories();
  const updated = current.filter((c) => c.id !== id);
  saveCategories(updated);
  return updated;
}

export function resetCategoriesToDefault(): CategoryItem[] {
  saveCategories(DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}
