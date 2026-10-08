import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Search,
  User,
  ChevronDown,
  Mail,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Newspaper,
} from 'lucide-react';
import { LiveWeatherDropdown } from './LiveWeatherDropdown';
import type { Category } from '../types';

interface HeaderProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenSearch: () => void;
  onOpenCms: () => void;
  onNavigateHome: () => void;
  isCloudStorage?: boolean;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'Home', value: 'all' },
  { label: 'India', value: 'India' },
  { label: 'World', value: 'World' },
  { label: 'Business', value: 'Business' },
  { label: 'Technology', value: 'Technology' },
  { label: 'Markets', value: 'Markets' },
  { label: 'Science', value: 'Science' },
  { label: 'Health', value: 'Health' },
  { label: 'Sports', value: 'Sports' },
  { label: 'Lifestyle', value: 'Lifestyle' },
  { label: 'Entertainment', value: 'Entertainment' },
  { label: 'Explainers', value: 'Explainers' },
  { label: 'Opinion', value: 'Opinion' },
];

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenCms,
  onNavigateHome,
  isCloudStorage = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [isSubscribedSuccess, setIsSubscribedSuccess] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());
  });

  // Keep date accurate if left open across midnight
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(
        new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date())
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* =========================================================================
          1. MOBILE TOP APP BAR (md:hidden) - Follows Strict Top Bar Contract
          ========================================================================= */}
      <div className="md:hidden flex items-center justify-between px-3 h-14 border-b border-slate-100 bg-white">
        {/* Left: Navigation Drawer & Search Toggles */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-red-700" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-red-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Search articles"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Brand Wordmark */}
        <div
          className="text-center cursor-pointer select-none px-2"
          onClick={onNavigateHome}
        >
          <div className="text-xl font-bold tracking-tight text-slate-950 font-serif leading-none">
            Iam<span className="text-red-700">news</span>agent
          </div>
          <div className="text-[8px] tracking-[0.2em] text-slate-400 uppercase font-semibold mt-0.5">
            Rapid Digital Wire
          </div>
        </div>

        {/* Right: Subscribe Button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setIsSubscribedSuccess(false);
              setIsSubscribeModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer min-h-[36px]"
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* MOBILE HORIZONTAL CATEGORY SCROLLER (md:hidden) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-2 border-b border-slate-100 bg-slate-50/70">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onSelectCategory(cat.value)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors min-h-[32px] cursor-pointer ${
                isActive
                  ? 'bg-red-700 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/80 font-medium'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          2. DESKTOP MASTHEAD (hidden md:block)
          ========================================================================= */}
      <div className="hidden md:block border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-slate-600">
          {/* Left: Date & Live Weather */}
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-700 whitespace-nowrap">
              {currentDate}
            </span>
            <span className="text-slate-300">|</span>
            <LiveWeatherDropdown />
          </div>

          {/* Center: Brand Logo */}
          <div
            className="text-center cursor-pointer select-none"
            onClick={onNavigateHome}
          >
            <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-950 font-serif">
              Iam<span className="text-red-700">news</span>agent
            </div>
            <div className="text-[9px] lg:text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold mt-0.5">
              News For A More Informed You
            </div>
          </div>

          {/* Right: Slogan & Action Buttons */}
          <div className="flex items-center gap-3">
            <span className="hidden xl:inline text-xs text-slate-500 italic">
              Real News. Broader Perspectives.
            </span>

            {/* Editorial Sign In / CMS */}
            <button
              type="button"
              onClick={onOpenCms}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-950 text-xs font-medium transition-colors cursor-pointer bg-white"
              title="Editorial Desk & CMS Terminal"
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>Editorial Desk</span>
            </button>

            {/* Subscribe CTA */}
            <button
              type="button"
              onClick={() => {
                setIsSubscribedSuccess(false);
                setIsSubscribeModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-md bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP CATEGORY NAVIGATION RIBBON (hidden md:block) */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-11">
          <nav className="flex items-center gap-1 lg:gap-3 overflow-x-auto no-scrollbar py-1 text-xs font-medium text-slate-700">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => onSelectCategory(cat.value)}
                  className={`px-2 py-1 transition-colors whitespace-nowrap relative cursor-pointer ${
                    isActive
                      ? 'text-red-700 font-bold'
                      : 'hover:text-slate-950'
                  }`}
                >
                  {cat.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="p-2 text-slate-600 hover:text-red-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Search news (Cmd+K or /)"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. MOBILE MENU COLLAPSIBLE DRAWER (md:hidden)
          ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          {/* Mobile Utility strip */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-600">
            <span className="font-medium text-slate-800">{currentDate}</span>
            <LiveWeatherDropdown />
          </div>

          {/* All Categories Grid */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Browse Sections
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.value);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-lg min-h-[40px] flex items-center justify-between transition-colors ${
                    activeCategory === cat.value
                      ? 'bg-red-50 text-red-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.label}</span>
                  {activeCategory === cat.value && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Editorial & CMS access */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onOpenCms();
                setIsMobileMenuOpen(false);
              }}
              className="text-xs text-red-700 font-semibold flex items-center gap-1.5 min-h-[40px] py-1"
            >
              <User className="w-4 h-4" />
              <span>Editorial Desk & CMS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400">
              {isCloudStorage ? '● Firestore Connected' : '○ Local Mirror'}
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. PUBLIC READER SUBSCRIPTION MODAL
          ========================================================================= */}
      {isSubscribeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 my-8">
            <div className="flex items-start justify-between gap-4 pb-2 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Morning Intelligence Brief</span>
                </div>
                <h3 className="text-xl font-bold font-serif text-slate-950">
                  Stay Ahead With Daily News
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSubscribeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSubscribedSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-serif">
                  You're On The Subscriber Wire!
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Thank you for subscribing. We have registered <strong>{subscriberEmail}</strong> for curated morning intelligence briefs.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubscribeModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold mt-2 cursor-pointer"
                >
                  Return to News Feed
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (subscriberEmail.trim() && subscriberEmail.includes('@')) {
                    setIsSubscribedSuccess(true);
                  }
                }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-600 leading-relaxed">
                  Join 45,000+ informed readers. Receive breaking news alerts, top morning headlines, market updates, and in-depth explainers delivered directly to your inbox every morning.
                </p>

                <div className="space-y-2">
                  <label htmlFor="reader-email" className="block text-xs font-semibold text-slate-700">
                    Your Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reader-email"
                      type="email"
                      required
                      value={subscriberEmail}
                      onChange={(e) => setSubscriberEmail(e.target.value)}
                      placeholder="name@company.com or personal email"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>No spam. One-click unsubscribe at any time.</span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSubscribeModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-bold transition-all shadow-md shadow-red-700/20 cursor-pointer"
                  >
                    Confirm Subscription
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
