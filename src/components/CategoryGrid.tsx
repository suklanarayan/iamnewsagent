import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  subtext: string;
  image: string;
}

interface CategoryGridProps {
  onSelectCategory: (category: string) => void;
}

const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 'India',
    name: 'India',
    subtext: 'Politics, States, Governance',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'World',
    name: 'World',
    subtext: 'Global News, Geopolitics',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Business',
    name: 'Business',
    subtext: 'Markets, Economy, Industry',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Technology',
    name: 'Technology',
    subtext: 'AI, Gadgets, Innovation',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Sports',
    name: 'Sports',
    subtext: 'Cricket, Football, More',
    image: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Health',
    name: 'Health',
    subtext: 'Wellness, Research',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Lifestyle',
    name: 'Lifestyle',
    subtext: 'Travel, Food, Culture',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Entertainment',
    name: 'Entertainment',
    subtext: 'Movies, OTT, Celebrities',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80',
  },
];

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
}) => {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-950">
          Explore by Category
        </h3>
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className="text-xs font-semibold text-slate-700 hover:text-red-700 flex items-center gap-1 transition-colors group cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid of 8 Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {CATEGORIES_DATA.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className="flex flex-col text-left group cursor-pointer bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all"
          >
            {/* Thumbnail */}
            <div className="h-20 sm:h-22 w-full overflow-hidden bg-slate-100">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* Label */}
            <div className="p-2 sm:p-2.5 space-y-0.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors">
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
