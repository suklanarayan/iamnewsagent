import React from 'react';
import {
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface PublicFooterProps {
  onOpenCms?: () => void;
  onSelectCategory: (category: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onOpenCms,
  onSelectCategory,
}) => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 text-slate-700 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-8">
        {/* Top Footer Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-8 border-b border-slate-200">
          {/* Logo & Subtitle */}
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 font-serif">
              Iam<span className="text-red-700">news</span>agent
            </div>
            <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold">
              News For A More Informed You
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-slate-700">
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="hover:text-red-700 transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => onSelectCategory('Explainers')}
              className="hover:text-red-700 transition-colors cursor-pointer"
            >
              Editorial Policy
            </button>
            <button
              type="button"
              onClick={onOpenCms}
              className="hover:text-red-700 transition-colors cursor-pointer"
            >
              Careers
            </button>
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="hover:text-red-700 transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="hover:text-red-700 transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="hover:text-red-700 transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-colors"
              aria-label="X"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>

          {/* Right Slogan & Accent */}
          <div className="lg:text-right space-y-1">
            <div className="text-xs sm:text-sm font-medium text-slate-800">
              A fairer, smarter <br className="hidden lg:inline" /> news ecosystem for all.
            </div>
            <div className="w-10 h-0.5 bg-red-600 rounded-full lg:ml-auto" />
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2025 iamnewsagent.com. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Real People</span>
            <span className="text-slate-300">|</span>
            <span>Real Perspectives</span>
            <span className="text-slate-300">|</span>
            <span>A Better Tomorrow</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
