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
  ShieldCheck,
} from 'lucide-react';

interface PublicFooterProps {
  onOpenCms?: () => void;
  onSelectCategory: (category: string) => void;
  onNavigateLegal?: (path: string) => void;
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
  onNavigateLegal,
}) => {
  const handleLegalClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (onNavigateLegal && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      onNavigateLegal(path);
    }
  };

  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-200 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Top Footer Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-8 border-b border-slate-800">
          {/* Logo & Subtitle */}
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
              Iam<span className="text-red-400">quick</span>agent
            </div>
            <div className="text-[11px] tracking-[0.2em] text-slate-300 uppercase font-semibold">
              Live Digital Newsroom &bull; Real-Time Headlines
            </div>
          </div>

          {/* Social Icons (44px accessible touch targets) */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://twitter.com/iamquickagent"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
              aria-label="X (Twitter)"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com/iamquickagent"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com/@iamquickagent"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com/company/iamquickagent"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
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
            <div className="w-10 h-0.5 bg-red-500 rounded-full lg:ml-auto" />
          </div>
        </div>

        {/* Crawlable Editorial Directory, Sitemaps & Legal Compliance Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 pb-8 border-b border-slate-800 text-xs">
          {/* Column 1: News Desks */}
          <div className="space-y-3">
            <h2 className="font-bold uppercase tracking-wider text-white text-xs">
              News Desks
            </h2>
            <ul className="space-y-2 text-slate-300">
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
                    className="inline-block py-0.5 hover:text-red-300 transition-colors"
                  >
                    {cat} News
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Special Coverage */}
          <div className="space-y-3">
            <h2 className="font-bold uppercase tracking-wider text-white text-xs">
              Special Coverage
            </h2>
            <ul className="space-y-2 text-slate-300">
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
                    className="inline-block py-0.5 hover:text-red-300 transition-colors"
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
                  className="inline-block py-0.5 hover:text-red-300 transition-colors"
                >
                  Editorial CMS Desk
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Sitemaps & AI Directives */}
          <div className="space-y-3">
            <h2 className="font-bold uppercase tracking-wider text-white text-xs flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-red-400" />
              <span>Feeds &amp; Sitemaps</span>
            </h2>
            <ul className="space-y-2 text-slate-300">
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-red-300 transition-colors inline-flex items-center gap-1.5 py-0.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>XML Sitemap</span>
                </a>
              </li>
              <li>
                <a
                  href="/news-sitemap.xml"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-red-300 transition-colors inline-flex items-center gap-1.5 py-0.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Google News Sitemap</span>
                </a>
              </li>
              <li>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-red-300 transition-colors inline-flex items-center gap-1.5 py-0.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Robots.txt</span>
                </a>
              </li>
              <li>
                <a
                  href="/ai.txt"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-red-300 transition-colors inline-flex items-center gap-1.5 py-0.5"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Policy (ai.txt)</span>
                </a>
              </li>
              <li>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-red-300 transition-colors inline-flex items-center gap-1.5 py-0.5"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>LLM Citation Digest</span>
                </a>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-red-300 transition-colors inline-flex items-center gap-1.5 py-0.5"
                >
                  <Rss className="w-3.5 h-3.5 text-amber-400" />
                  <span>RSS 2.0 News Wire</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Compliance */}
          <div className="space-y-3">
            <h2 className="font-bold uppercase tracking-wider text-white text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Legal &amp; Trust</span>
            </h2>
            <ul className="space-y-2 text-slate-300">
              <li>
                <a
                  href="/privacy-policy"
                  onClick={(e) => handleLegalClick(e, '/privacy-policy')}
                  className="inline-block py-0.5 hover:text-red-300 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms-of-service"
                  onClick={(e) => handleLegalClick(e, '/terms-of-service')}
                  className="inline-block py-0.5 hover:text-red-300 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/cookie-policy"
                  onClick={(e) => handleLegalClick(e, '/cookie-policy')}
                  className="inline-block py-0.5 hover:text-red-300 transition-colors"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="/editorial-standards"
                  onClick={(e) => handleLegalClick(e, '/editorial-standards')}
                  className="inline-block py-0.5 hover:text-red-300 transition-colors"
                >
                  Editorial Standards
                </a>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-400 pt-1">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Verified Newsroom</span>
              </li>
            </ul>
          </div>

          {/* Column 5: Publication */}
          <div className="space-y-3 col-span-2 sm:col-span-1">
            <h2 className="font-bold uppercase tracking-wider text-white text-xs">
              Publication
            </h2>
            <p className="text-slate-300 leading-relaxed text-xs">
              Real-time multi-platform digital news coverage updated 24/7 across mobile, web, and syndication feeds.
            </p>
            <a
              href="mailto:SUKLA.NARAYAN007@gmail.com"
              className="inline-block text-red-300 hover:underline font-medium"
            >
              Contact Newsroom Desk
            </a>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div>
            &copy; 2026 iamquickagent.com. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
            <a
              href="/privacy-policy"
              onClick={(e) => handleLegalClick(e, '/privacy-policy')}
              className="hover:text-white transition-colors"
            >
              Privacy
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="/terms-of-service"
              onClick={(e) => handleLegalClick(e, '/terms-of-service')}
              className="hover:text-white transition-colors"
            >
              Terms
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="/cookie-policy"
              onClick={(e) => handleLegalClick(e, '/cookie-policy')}
              className="hover:text-white transition-colors"
            >
              Cookies
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="/ai.txt"
              target="_blank"
              rel="noopener"
              className="hover:text-white transition-colors"
            >
              ai.txt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
