import React from 'react';
import {
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  FileText,
  Rss,
  CheckCircle,
} from 'lucide-react';

interface PublicFooterProps {
  onOpenCms?: () => void;
  onSelectCategory: (category: string) => void;
}

const FOOTER_CATEGORIES = [
  'India',
  'World',
  'Business',
  'Technology',
  'Markets',
  'Sports',
  'Science',
  'Health',
  'Entertainment',
  'Explainers',
  'Opinion',
];

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onOpenCms,
  onSelectCategory,
}) => {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-300 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Top Footer Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-8 border-b border-slate-800">
          {/* Logo & Subtitle */}
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
              Iam<span className="text-red-500">quick</span>agent
            </div>
            <div className="text-[10px] tracking-[0.25em] text-slate-400 uppercase font-semibold">
              Live Digital Newsroom • Instant Search
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="X (Twitter)"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>

          {/* Slogan */}
          <div className="lg:text-right space-y-1">
            <div className="text-xs sm:text-sm font-medium text-slate-200">
              Objective, real-time reporting <br className="hidden lg:inline" /> across national &amp; global wires.
            </div>
            <div className="w-10 h-0.5 bg-red-600 rounded-full lg:ml-auto" />
          </div>
        </div>

        {/* Crawlable Editorial Directory & Index for Google Search Console & Discoverability */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 pb-8 border-b border-slate-800 text-xs">
          {/* Column 1: News Desks */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px]">
              News Desks
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              {FOOTER_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <a
                    href={`/?category=${encodeURIComponent(cat)}`}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        e.preventDefault();
                        onSelectCategory(cat);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="hover:text-red-400 transition-colors"
                  >
                    {cat} News
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: In-Depth & Analysis */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px]">
              Special Coverage
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              {FOOTER_CATEGORIES.slice(6).map((cat) => (
                <li key={cat}>
                  <a
                    href={`/?category=${encodeURIComponent(cat)}`}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        e.preventDefault();
                        onSelectCategory(cat);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="hover:text-red-400 transition-colors"
                  >
                    {cat}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/cms"
                  onClick={(e) => {
                    if (onOpenCms) {
                      e.preventDefault();
                      onOpenCms();
                    }
                  }}
                  className="hover:text-red-400 transition-colors"
                >
                  Editorial CMS Desk
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Sitemaps & Search Console Indexes */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-red-400" />
              <span>Search Sitemaps</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span>XML Sitemap</span>
                </a>
              </li>
              <li>
                <a
                  href="/news-sitemap.xml"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span>Google News Sitemap</span>
                </a>
              </li>
              <li>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span>Robots.txt Directive</span>
                </a>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-1"
                >
                  <Rss className="w-3 h-3 text-amber-500" />
                  <span>RSS 2.0 News Wire</span>
                </a>
              </li>
              <li>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-cyan-400" />
                  <span>LLM Citation Digest</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Verification & Compliance */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px]">
              Standards &amp; Trust
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3 h-3 shrink-0" />
                <span>Google Verified Source</span>
              </li>
              <li>
                <span className="text-slate-400">Fast Indexing Protocol</span>
              </li>
              <li>
                <span className="text-slate-400">Schema.org NewsArticle</span>
              </li>
              <li>
                <span className="text-slate-400">AEO / GEO Knowledge Graph</span>
              </li>
              <li>
                <span className="text-slate-400">Fact-Check Verification</span>
              </li>
            </ul>
          </div>

          {/* Column 5: Editorial Contact & Mobile */}
          <div className="space-y-3 col-span-2 sm:col-span-1">
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px]">
              Publication
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Real-time multi-platform digital news coverage updated 24/7 across mobile, web, and syndication feeds.
            </p>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; 2026 iamquickagent.com. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Verified Sources</span>
            <span className="text-slate-700">|</span>
            <span>Real-time Dispatches</span>
            <span className="text-slate-700">|</span>
            <span>Global Coverage</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
