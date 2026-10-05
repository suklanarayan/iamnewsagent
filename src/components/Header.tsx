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
      {/* 1. TOP UTILITY & BRANDING BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-100 text-xs text-slate-600">
        {/* Left: Date & Live Weather */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700 whitespace-nowrap">
            {currentDate}
          </span>
          <span className="text-slate-300">|</span>
          <LiveWeatherDropdown />
        </div>

        {/* Center: Brand Logo */}
        <div className="text-center cursor-pointer select-none" onClick={onNavigateHome}>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 font-serif">
            Iam<span className="text-red-700">news</span>agent
          </div>
          <div className="text-[9px] sm:text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold mt-0.5">
            News For A More Informed You
          </div>
        </div>

        {/* Right: Slogan & Action Buttons */}
        <div className="flex items-center gap-3">
          <span className="hidden lg:inline text-xs text-slate-500 italic">
            Real News. Broader Perspectives.
          </span>

          {/* Sign In / CMS Access */}
          <button
            type="button"
            onClick={onOpenCms}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-950 text-xs font-medium transition-colors cursor-pointer bg-white"
            title="Editorial & CMS Terminal"
          >
            <User className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Sign In</span>
          </button>

          {/* Subscribe CTA - Opens Public Reader Subscription */}
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

      {/* 2. CATEGORY NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-11">
          {/* Hamburger menu trigger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 -ml-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Categories List */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-3 overflow-x-auto no-scrollbar py-1 text-xs font-medium text-slate-700">
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

            <div className="flex items-center text-slate-400 hover:text-slate-700 cursor-pointer pl-1">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </nav>

          {/* Right Search Button */}
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

      {/* 3. MOBILE MENU COLLAPSIBLE DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.value);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left px-2.5 py-1.5 rounded-md ${
                  activeCategory === cat.value
                    ? 'bg-red-50 text-red-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onOpenCms();
                setIsMobileMenuOpen(false);
              }}
              className="text-xs text-red-700 font-semibold flex items-center gap-1"
            >
              <span>Publishing CMS & Terminal</span>
              &rarr;
            </button>
            <span className="text-[11px] text-slate-400">
              {isCloudStorage ? '● Firestore Connected' : '○ Local Mirror'}
            </span>
          </div>
        </div>
      )}

      {/* 4. PUBLIC READER SUBSCRIPTION MODAL */}
      {isSubscribeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 my-8">
            <div className="flex items-start justify-between gap-4 pb-2 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-red-600" />
                  <span>Reader Intelligence Digest</span>
                </div>
                <h3 className="text-xl font-bold font-serif text-slate-950">
                  Subscribe to iamnewsagent
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSubscribeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSubscribedSuccess ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-950 font-serif">
                  Subscription Confirmed!
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Thank you for subscribing to <strong>iamnewsagent</strong>. We have sent a confirmation email to <strong>{subscriberEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubscribeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Return to News Feed
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!subscriberEmail.trim() || !subscriberEmail.includes('@')) {
                    alert('Please enter a valid email address.');
                    return;
                  }
                  setIsSubscribedSuccess(true);
                }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-600 leading-relaxed">
                  Receive verified breaking dispatches, daily morning intelligence briefs, and deep-dive explainers directly in your inbox.
                </p>

                <div className="space-y-2 py-1">
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>Daily Executive Takeaways & Intelligence debrief</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>Zero spam, 100% verified non-partisan reporting</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>Unsubscribe anytime with 1 click</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Your Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={subscriberEmail}
                      onChange={(e) => setSubscriberEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  Join 85,000+ Readers (Free)
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
