import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import type { CategoryItem } from '../types';
import { getCategories, loadCategoriesFromFirestore } from '../utils/categoryManager';
import { NewsImage } from './NewsImage';

interface CategoryGridProps {
  onSelectCategory: (category: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>(() => getCategories());

  useEffect(() => {
    // Initial sync from local storage and firestore
    setCategories(getCategories());
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

  const visibleCategories = categories
    .filter((c) => c.isEnabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (visibleCategories.length === 0) return null;

  return (
    <section className="space-y-4" id="home-explore-by-category">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-950">
            Explore by Category
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated reporting across national, global and industry desks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className="text-xs font-semibold text-slate-700 hover:text-red-700 flex items-center gap-1 transition-colors group cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {visibleCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.name || cat.id)}
            className="flex flex-col text-left group cursor-pointer bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all"
          >
            {/* Thumbnail with NewsImage fallback */}
            <div className="h-20 sm:h-22 w-full overflow-hidden bg-slate-900 relative">
              <NewsImage
                src={cat.image}
                alt={cat.name}
                category={cat.name}
                className="group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Label */}
            <div className="p-2 sm:p-2.5 space-y-0.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors truncate">
                {cat.name}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight line-clamp-1">
                {cat.subtext}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
