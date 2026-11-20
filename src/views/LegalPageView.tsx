import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck, FileText, Scale, Cookie, BookOpen, Calendar, Mail } from 'lucide-react';
import type { LegalPageData } from '../data/legalPages';
import { LEGAL_PAGE_LIST } from '../data/legalPages';
import { injectLegalPageSchema, removeArticleSchema } from '../utils/seo';

interface LegalPageViewProps {
  page: LegalPageData;
  onBackToFeed: () => void;
  onNavigateLegal: (path: string) => void;
}

export const LegalPageView: React.FC<LegalPageViewProps> = ({
  page,
  onBackToFeed,
  onNavigateLegal,
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    injectLegalPageSchema(page);
    return () => {
      removeArticleSchema();
    };
  }, [page]);

  const Icon =
    page.slug === 'privacy-policy'
      ? ShieldCheck
      : page.slug === 'terms-of-service'
        ? Scale
        : page.slug === 'cookie-policy'
          ? Cookie
          : BookOpen;

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      {/* Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-slate-600">
          <ol className="flex items-center gap-1.5">
            <li>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  onBackToFeed();
                }}
                className="hover:text-red-700 transition-colors"
              >
                Home
              </a>
            </li>
            <li aria-hidden="true" className="text-slate-400">/</li>
            <li className="font-semibold text-slate-900">{page.title}</li>
          </ol>

          <button
            type="button"
            onClick={onBackToFeed}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-red-700 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Front Page</span>
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Main Legal Document */}
        <article className="lg:col-span-8 space-y-8">
          <header className="space-y-4 pb-6 border-b border-slate-200">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700">
              <Icon className="w-4 h-4" />
              <span>{page.eyebrow}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-950 leading-tight">
              {page.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Effective: {page.effectiveDate}</span>
              </span>
              <span>&bull;</span>
              <span>Last Updated: {page.lastUpdated}</span>
            </div>

            <p className="text-base text-slate-700 leading-relaxed pt-2">
              {page.intro}
            </p>
          </header>

          <div className="space-y-8">
            {page.sections.map((section) => (
              <section key={section.heading} className="space-y-3">
                <h2 className="text-xl font-serif font-bold text-slate-950">
                  {section.heading}
                </h2>
                {section.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {p}
                  </p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-slate-700 leading-relaxed">
                    {section.bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>

        {/* Compliance & Policy Directory Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-700" />
              <span>Policies &amp; Disclosures</span>
            </h2>
            <ul className="space-y-2 text-sm">
              {LEGAL_PAGE_LIST.map((item) => {
                const isActive = item.slug === page.slug;
                return (
                  <li key={item.slug}>
                    <a
                      href={item.path}
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                          e.preventDefault();
                          onNavigateLegal(item.path);
                        }
                      }}
                      className={`block px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-red-700 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-950'
                      }`}
                    >
                      {item.title}
                    </a>
                  </li>
                );
              })}
              <li>
                <a
                  href="/ai.txt"
                  target="_blank"
                  rel="noopener"
                  className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-200/70 hover:text-slate-950 transition-colors"
                >
                  AI Crawling Policy (ai.txt)
                </a>
              </li>
              <li>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener"
                  className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-200/70 hover:text-slate-950 transition-colors"
                >
                  LLM Citation Index (llms.txt)
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5 text-xs text-slate-600">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-700" />
              <span>Newsroom Compliance Desk</span>
            </h2>
            <p className="leading-relaxed">
              Published by iamquickagent.com Newsroom. For legal inquiries, corrections, or data requests, email{' '}
              <a
                href="mailto:SUKLA.NARAYAN007@gmail.com"
                className="text-red-700 font-semibold hover:underline"
              >
                SUKLA.NARAYAN007@gmail.com
              </a>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
