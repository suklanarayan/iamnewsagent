import React, { useEffect, useState } from 'react';
import {
  Clock,
  Eye,
  Calendar,
  User,
  Share2,
  Check,
  Twitter,
  Linkedin,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Volume2,
  VolumeX,
  Globe,
} from 'lucide-react';
import type { Article, Author } from '../types';
import { KeyTakeawaysBlock } from '../components/KeyTakeawaysBlock';
import { BannerAd } from '../components/BannerAd';
import { injectArticleSchema, removeArticleSchema } from '../utils/seo';

interface ArticleViewProps {
  article: Article;
  author: Author | null;
  relatedArticles: Article[];
  onBackToFeed: () => void;
  onSelectArticle: (article: Article) => void;
  onSelectAuthor: (authorId: string) => void;
  onSelectCategory: (category: string) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  author,
  relatedArticles,
  onBackToFeed,
  onSelectArticle,
  onSelectAuthor,
  onSelectCategory,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSpeakingFull, setIsSpeakingFull] = useState(false);

  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/article/${article.slug}`
    : `https://iamnewsagent.com/article/${article.slug}`;

  // Dynamically inject JSON-LD NewsArticle & Breadcrumbs schema markup into document.head
  useEffect(() => {
    injectArticleSchema(article, author, currentUrl);
    window.scrollTo(0, 0);

    return () => {
      removeArticleSchema();
    };
  }, [article, author, currentUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`"${article.headline}" via @iamnewsagent`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const toggleFullArticleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }
    if (isSpeakingFull) {
      window.speechSynthesis.cancel();
      setIsSpeakingFull(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = `${article.headline}. Published by ${author?.name || 'iamnewsagent'}. Key Takeaways: ${article.keyTakeaways.join('. ')}. ${article.content.replace(/[#*`]/g, '')}`;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeakingFull(false);
    utterance.onerror = () => setIsSpeakingFull(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeakingFull(true);
  };

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      {/* Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="border-b border-slate-200 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-slate-500">
          <ol className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
            <li>
              <button
                type="button"
                onClick={onBackToFeed}
                className="hover:text-red-700 transition-colors"
              >
                Home
              </button>
            </li>
            <li aria-hidden="true" className="text-slate-300">/</li>
            <li>
              <button
                type="button"
                onClick={() => onSelectCategory(article.category)}
                className="hover:text-red-700 transition-colors"
              >
                {article.category}
              </button>
            </li>
            <li aria-hidden="true" className="text-slate-300">/</li>
            <li className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
              {article.headline}
            </li>
          </ol>

          <button
            type="button"
            onClick={onBackToFeed}
            className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-red-700 ml-4 flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Wire</span>
          </button>
        </div>
      </nav>

      {/* Main Semantic Article Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Article Body (8 cols) */}
          <article className="lg:col-span-8 space-y-6">
            {/* Category Tag & Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => onSelectCategory(article.category)}
                className="px-2.5 py-1 rounded-md bg-red-700 text-white font-bold uppercase tracking-wider text-[10px]"
              >
                {article.category}
              </button>
              {article.articleType === 'announcement' && (
                <span className="px-2.5 py-1 rounded-md bg-blue-700 text-white font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 shadow-xs">
                  <span>📢</span>
                  <span>Official Announcement</span>
                </span>
              )}
              {article.articleType === 'investigation' && (
                <span className="px-2.5 py-1 rounded-md bg-amber-700 text-white font-bold uppercase tracking-wider text-[10px] shadow-xs">
                  Exclusive Investigation
                </span>
              )}
              {article.articleType === 'opinion' && (
                <span className="px-2.5 py-1 rounded-md bg-purple-700 text-white font-bold uppercase tracking-wider text-[10px] shadow-xs">
                  Analysis & Op-Ed
                </span>
              )}
              {article.articleType === 'live_coverage' && (
                <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>Live Wire Dispatch</span>
                </span>
              )}
              {article.articleType === 'research' && (
                <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white font-bold uppercase tracking-wider text-[10px] shadow-xs">
                  Research Digest
                </span>
              )}
              {article.isBreaking && (
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                  FLASH
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTimeMinutes} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {(article.views || 1).toLocaleString()} views
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-slate-950 leading-[1.15]">
              {article.headline}
            </h1>

            {/* Subheadline / Deck */}
            {article.deck && (
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-editorial italic">
                {article.deck}
              </p>
            )}

            {/* Author Byline & Publishing Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-200">
              {author ? (
                <button
                  type="button"
                  onClick={() => onSelectAuthor(author.id)}
                  className="flex items-center gap-3 text-left group"
                >
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                      <span>{author.name}</span>
                      {author.verified && (
                        <ShieldCheck className="w-4 h-4 text-red-600" title="Verified Correspondent" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {author.role} &bull; {formattedDate}
                    </div>
                  </div>
                </button>
              ) : (
                <div className="text-xs text-slate-500">
                  Published by <span className="font-bold text-slate-900">iamnewsagent Bureau</span> &bull; {formattedDate}
                </div>
              )}

              {/* Share and Audio Synthesizer */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFullArticleAudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  {isSpeakingFull ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-red-600" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-slate-700" />
                      <span>Listen to Report</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareTwitter}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                  title="Share to X / Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleShareLinkedIn}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                  title="Share to LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                  title="Copy Permalink"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SOURCE ATTRIBUTION & INTEGRITY BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-intel">
              <div className="flex flex-wrap items-center gap-2 text-slate-700">
                <span className="font-bold flex items-center gap-1.5 text-slate-900">
                  <Globe className="w-3.5 h-3.5 text-red-600" />
                  <span>Origin & Source:</span>
                </span>
                <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                  {article.sourceName || 'Editorial Desk (Original Reporting)'}
                </span>
                {article.sourceType && (
                  <span className="text-[11px] text-slate-500 font-medium capitalize">
                    &bull; {article.sourceType.replace('_', ' ')}
                  </span>
                )}
              </div>

              {article.sourceUrl && (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-red-700 hover:text-red-800 font-semibold text-xs transition-colors shadow-xs"
                >
                  <span>Primary Document / Wire</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* MANDATORY KEY TAKEAWAY SUMMARY BLOCK (FOR AEO / ANSWER ENGINES) */}
            <KeyTakeawaysBlock
              takeaways={article.keyTakeaways}
              headline={article.headline}
            />

            {/* Featured Image */}
            {article.featuredImage && (
              <figure className="space-y-2">
                <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-[500px] border border-slate-200">
                  <img
                    src={article.featuredImage}
                    alt={article.headline}
                    className="w-full h-full object-cover"
                  />
                </div>
                {article.imageCaption && (
                  <figcaption className="text-xs text-slate-500 font-editorial italic px-1">
                    {article.imageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Semantic Article Body Content */}
            <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans text-base space-y-4 pt-4">
              {article.content.split('\n\n').map((paragraph, idx) => {
                const trimmed = paragraph.trim();

                // Markdown Image Tag: ![caption](url)
                if (trimmed.startsWith('![') && trimmed.includes('](')) {
                  const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
                  if (imgMatch) {
                    const caption = imgMatch[1];
                    const src = imgMatch[2];
                    return (
                      <figure key={idx} className="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                        <img
                          src={src}
                          alt={caption || 'Article Visual'}
                          className="w-full h-auto object-cover max-h-[500px]"
                          loading="lazy"
                        />
                        {caption && (
                          <figcaption className="p-2.5 text-xs text-slate-500 font-editorial italic bg-slate-50 border-t border-slate-100 text-center">
                            {caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }
                }

                if (paragraph.startsWith('## ')) {
                  return (
                    <h2
                      key={idx}
                      className="text-xl sm:text-2xl font-bold font-serif text-slate-950 pt-4 pb-1 border-b border-slate-100"
                    >
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }

                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote
                      key={idx}
                      className="p-4 rounded-xl border-l-4 border-red-600 bg-red-50/40 text-slate-900 font-serif italic text-base my-4"
                    >
                      {paragraph.replace('> ', '')}
                    </blockquote>
                  );
                }

                // Render in-article display banner ad halfway through
                if (idx === 2) {
                  return (
                    <React.Fragment key={idx}>
                      <p className="text-slate-700 leading-relaxed">{paragraph}</p>
                      <BannerAd format="native-inline" />
                    </React.Fragment>
                  );
                }

                return (
                  <p key={idx} className="text-slate-700 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* EDITORIAL ATTRIBUTION & TRANSPARENCY DISCLOSURE */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2 text-xs text-slate-600 font-intel">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span>Reporting Provenance & Editorial Disclosure</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  iamnewsagent Verification Standard
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                This dispatch is categorized under <strong className="text-slate-900 capitalize">{article.articleType || 'Standard News'}</strong>.
                {article.sourceType === 'original' ? (
                  <> Sourced via <strong className="text-slate-900">Original Desk Reporting & First-Hand Intelligence</strong>.</>
                ) : (
                  <> Sourced from <strong className="text-slate-900">{article.sourceName || 'External Wire'}</strong> ({article.sourceType || 'news agency'}).</>
                )}
                {article.sourceUrl && (
                  <> Readers can inspect the primary reference directly via{' '}
                    <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline font-semibold inline-flex items-center gap-0.5">
                      <span>external publication</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>.
                  </>
                )}
              </p>
            </div>

            {/* Article Tags */}
            <div className="pt-6 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Filed Under Topics:
              </div>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* Right Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Author Profile Card */}
            {author && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-14 h-14 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 font-serif text-base">
                      {author.name}
                    </h3>
                    <p className="text-xs text-slate-600">{author.role}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{author.location}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {author.bio}
                </p>

                <button
                  type="button"
                  onClick={() => onSelectAuthor(author.id)}
                  className="w-full py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold transition-colors"
                >
                  View All Dispatches by {author.name.split(' ')[0]}
                </button>
              </div>
            )}

            {/* Reusable MPU Display Ad Placeholder */}
            <BannerAd format="mpu" />

            {/* Related Articles Box */}
            {relatedArticles.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                <h3 className="font-bold font-serif text-slate-950 text-base pb-2 border-b border-slate-100">
                  Related in {article.category}
                </h3>
                <div className="divide-y divide-slate-100">
                  {relatedArticles.slice(0, 3).map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectArticle(rel)}
                      className="py-3 flex items-start gap-3 group cursor-pointer"
                    >
                      <img
                        src={rel.featuredImage}
                        alt={rel.headline}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold font-serif text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2">
                          {rel.headline}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {rel.readTimeMinutes} min read
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};
