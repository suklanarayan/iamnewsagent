import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Layers, Compass } from 'lucide-react';
import type { CategoryItem } from '../types';
import { getCategories, loadCategoriesFromFirestore, DEFAULT_CATEGORIES } from '../utils/categoryManager';
import { NewsImage } from './NewsImage';

interface CategoryGridProps {
  onSelectCategory: (category: string) => void;
  activeCategory?: string;
}

// Full editorial category list with extended categories
const EXTENDED_CATEGORIES: CategoryItem[] = [
  ...DEFAULT_CATEGORIES,
  {
    id: 'Markets',
    name: 'Markets',
    subtext: 'BSE, NSE, Currencies & Commodities',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
    order: 9,
    isEnabled: true,
  },
  {
    id: 'Science',
    name: 'Science',
    subtext: 'Space, Physics, Climate Research',
    image: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=600&q=80',
    order: 10,
    isEnabled: true,
  },
  {
    id: 'Explainers',
    name: 'Explainers',
    subtext: 'Context, Deep Dives, Q&A',
    image: 'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=600&q=80',
    order: 11,
    isEnabled: true,
  },
  {
    id: 'Opinion',
    name: 'Opinion',
    subtext: 'Columns, Editorials, Guest Voices',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    order: 12,
    isEnabled: true,
  },
];

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  activeCategory = 'all',
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const loaded = getCategories();
    return loaded.length >= 8 ? loaded : EXTENDED_CATEGORIES;
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Initial sync from local storage and firestore
    const loaded = getCategories();
    if (loaded && loaded.length > 0) {
      setCategories(loaded);
    }
    loadCategoriesFromFirestore().then((remote) => {
      if (remote && remote.length > 0) {
        setCategories(remote);
      }
    });

    const handleUpdate = () => {
      setCategories(getCategories());
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('categories-updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('categories-updated', handleUpdate);
    };
  }, []);

  // Merge with extended categories so all desks are accessible
  const mergedCategories = React.useMemo(() => {
    const map = new Map<string, CategoryItem>();
    categories.forEach((c) => map.set(c.id, c));
    EXTENDED_CATEGORIES.forEach((c) => {
      if (!map.has(c.id)) map.set(c.id, c);
    });
    return Array.from(map.values())
      .filter((c) => c.isEnabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  const displayedCategories = isExpanded ? mergedCategories : mergedCategories.slice(0, 8);

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleCategoryClick = (catName: string) => {
    onSelectCategory(catName);
    // Smooth scroll to top stories
    const el = document.getElementById('top-stories-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="space-y-4" id="home-explore-by-category">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-red-100 text-red-700">
              <Compass className="w-4 h-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-950">
              Explore by Category
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated reporting across national, global, financial and industry desks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleExpand}
          className="text-xs font-semibold text-slate-700 hover:text-red-700 flex items-center gap-1.5 transition-colors group cursor-pointer px-2.5 py-1 rounded-md hover:bg-slate-100"
          title={isExpanded ? 'Collapse categories' : 'View all editorial categories'}
        >
          <span>{isExpanded ? 'Show Top Desks' : `View All (${mergedCategories.length})`}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          )}
        </button>
      </div>

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 transition-all">
        {displayedCategories.map((cat) => {
          const isSelected = activeCategory.toLowerCase() === (cat.name || cat.id).toLowerCase();

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.name || cat.id)}
              className={`flex flex-col text-left group cursor-pointer rounded-xl border overflow-hidden shadow-xs hover:shadow-md transition-all ${
                isSelected
                  ? 'border-red-600 ring-2 ring-red-500/30 bg-red-50/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Thumbnail with NewsImage fallback */}
              <div className="h-20 sm:h-22 w-full overflow-hidden bg-slate-900 relative">
                <NewsImage
                  src={cat.image}
                  alt={cat.name}
                  category={cat.name}
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider">
                    Active
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="p-2 sm:p-2.5 space-y-0.5 flex-1 flex flex-col justify-between">
                <div
                  className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                    isSelected ? 'text-red-700' : 'text-slate-900 group-hover:text-red-700'
                  }`}
                >
                  {cat.name}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight line-clamp-1">
                  {cat.subtext}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
