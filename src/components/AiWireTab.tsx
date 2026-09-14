import React, { useState, useEffect } from 'react';
import {
  Rss,
  Zap,
  RefreshCw,
  Search,
  ExternalLink,
  Sparkles,
  Link,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Tag,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  X,
  Plus,
} from 'lucide-react';
import type { Author, Category } from '../types';
import {
  fetchLiveWireNews,
  fetchNewsFromUrl,
  rewriteNewsWithGemini,
  resolveCuratedImageUrl,
  type WireArticle,
  type RewrittenArticleResult,
} from '../services/aiNewsService';

interface AiWireTabProps {
  authors: Author[];
  onLoadIntoEditor: (data: RewrittenArticleResult & { sourceTitle?: string; sourceUrl?: string }) => void;
  onPublishImmediately: (data: RewrittenArticleResult, authorId: string) => Promise<void>;
  onShowToast: (msg: string) => void;
}

const WIRE_TOPICS = [
  { id: 'ALL', label: 'Top Global & National' },
  { id: 'INDIA', label: 'India' },
  { id: 'WORLD', label: 'World' },
  { id: 'BUSINESS', label: 'Business & Markets' },
  { id: 'TECHNOLOGY', label: 'Technology & AI' },
  { id: 'SCIENCE', label: 'Science & Space' },
  { id: 'SPORTS', label: 'Sports' },
  { id: 'ENTERTAINMENT', label: 'Entertainment' },
];

export const AiWireTab: React.FC<AiWireTabProps> = ({
  authors,
  onLoadIntoEditor,
  onPublishImmediately,
  onShowToast,
}) => {
  // Wire state
  const [currentTopic, setCurrentTopic] = useState('ALL');
  const [wireArticles, setWireArticles] = useState<WireArticle[]>([]);
  const [isLoadingWire, setIsLoadingWire] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Custom Input state (URL or Text)
  const [inputMode, setInputMode] = useState<'wire' | 'url' | 'text'>('wire');
  const [customUrl, setCustomUrl] = useState('');
  const [isUrlFetching, setIsUrlFetching] = useState(false);
  const [pastedHeadline, setPastedHeadline] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [pastedSource, setPastedSource] = useState('Press Wire');

  // Rewriting state
  const [isRewriting, setIsRewriting] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [rewriteModalOpen, setRewriteModalOpen] = useState(false);
  const [rewrittenData, setRewrittenData] = useState<(RewrittenArticleResult & { sourceTitle?: string; sourceUrl?: string }) | null>(null);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>(authors[0]?.id || '');
  const [isPublishing, setIsPublishing] = useState(false);

  // Load wire news on mount or topic change
  useEffect(() => {
    loadWireNews(currentTopic);
  }, [currentTopic]);

  const loadWireNews = async (topic: string) => {
    setIsLoadingWire(true);
    try {
      const items = await fetchLiveWireNews(topic);
      setWireArticles(items);
    } catch (err) {
      console.error('Failed to load wire news:', err);
      onShowToast('Could not reach external RSS wires. You can still paste URLs or text directly.');
    } finally {
      setIsLoadingWire(false);
    }
  };

  // Trigger AI Rewrite from a Wire Article
  const handleRewriteWireItem = async (item: WireArticle) => {
    setActiveStoryId(item.id);
    setIsRewriting(true);
    try {
      const result = await rewriteNewsWithGemini({
        headline: item.title,
        rawText: item.snippet,
        sourceName: item.source,
        preferredCategory: item.category,
      });

      setRewrittenData({
        ...result,
        sourceTitle: item.title,
        sourceUrl: item.link,
      });
      setRewriteModalOpen(true);
      onShowToast('Gemini AI successfully rewrote and structured the article!');
    } catch (err) {
      console.error(err);
      onShowToast(`Rewrite failed: ${(err as Error).message}`);
    } finally {
      setIsRewriting(false);
      setActiveStoryId(null);
    }
  };

  // Trigger AI Rewrite from Custom URL
  const handleFetchAndRewriteUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    setIsUrlFetching(true);
    setIsRewriting(true);
    try {
      onShowToast('Fetching article from URL...');
      const extracted = await fetchNewsFromUrl(customUrl.trim());

      onShowToast('Rewriting with Gemini AI...');
      const result = await rewriteNewsWithGemini({
        headline: extracted.title,
        rawText: extracted.text,
        sourceName: 'Web Source',
      });

      setRewrittenData({
        ...result,
        sourceTitle: extracted.title,
        sourceUrl: customUrl,
      });
      setRewriteModalOpen(true);
      onShowToast('Article fetched and rewritten successfully!');
    } catch (err) {
      console.error(err);
      onShowToast(`Failed to parse URL: ${(err as Error).message}`);
    } finally {
      setIsUrlFetching(false);
      setIsRewriting(false);
    }
  };

  // Trigger AI Rewrite from Raw Text
  const handleRewritePastedText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim() && !pastedHeadline.trim()) {
      alert('Please enter a headline or article text to rewrite.');
      return;
    }

    setIsRewriting(true);
    try {
      const result = await rewriteNewsWithGemini({
        headline: pastedHeadline,
        rawText: pastedText,
        sourceName: pastedSource,
      });

      setRewrittenData({
        ...result,
        sourceTitle: pastedHeadline || 'Pasted Draft',
      });
      setRewriteModalOpen(true);
      onShowToast('Gemini AI converted your raw notes into a full news report!');
    } catch (err) {
      console.error(err);
      onShowToast(`Rewrite failed: ${(err as Error).message}`);
    } finally {
      setIsRewriting(false);
    }
  };

  // Handle immediate 1-click publishing
  const handleConfirmPublish = async () => {
    if (!rewrittenData) return;
    setIsPublishing(true);
    try {
      await onPublishImmediately(rewrittenData, selectedAuthorId);
      setRewriteModalOpen(false);
      onShowToast(`"${rewrittenData.headline}" is now live on iamquickagent.com!`);
    } catch (err) {
      console.error(err);
      onShowToast('Error publishing article.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Filtered wire list
  const filteredWire = wireArticles.filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.source.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Guide */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-editorial text-slate-100">
              AI News Wire & Automated Rewriter
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-intel max-w-2xl leading-relaxed">
            Monitor live top source wires (Reuters, BBC, The Hindu, AP, TechCrunch) or paste any news article link.
            With 1 click, Gemini AI transforms it into a completely original, objective report with executive Key Takeaways, AEO tags, and curated visuals.
          </p>
        </div>

        {/* Input Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-intel flex-shrink-0">
          <button
            type="button"
            onClick={() => setInputMode('wire')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              inputMode === 'wire' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Rss className="w-3.5 h-3.5" />
            <span>Live RSS Wire</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              inputMode === 'url' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Fetch from URL</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              inputMode === 'text' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Raw Text</span>
          </button>
        </div>
      </div>

      {/* MODE 1: LIVE WIRE RSS FEEDS */}
      {inputMode === 'wire' && (
        <div className="space-y-4">
          {/* Topic Selector & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-intel no-scrollbar">
              {WIRE_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setCurrentTopic(topic.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    currentTopic === topic.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {topic.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter wire dispatches..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-intel focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="button"
                onClick={() => loadWireNews(currentTopic)}
                disabled={isLoadingWire}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-intel flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Refresh feed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWire ? 'animate-spin text-amber-400' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Wire Articles Grid */}
          {isLoadingWire ? (
            <div className="p-12 text-center space-y-3 bg-slate-900 border border-slate-800 rounded-2xl">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm font-intel text-slate-300">Fetching live dispatches from global & Indian wire feeds...</p>
            </div>
          ) : filteredWire.length === 0 ? (
            <div className="p-10 text-center space-y-2 bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-sm font-intel text-slate-300">No wire stories found for this category right now.</p>
              <button
                type="button"
                onClick={() => setInputMode('url')}
                className="text-xs text-amber-400 hover:underline font-intel"
              >
                Try pasting an article URL directly &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWire.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-intel">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold border border-slate-700">
                        {item.source}
                      </span>
                      <span className="text-slate-400">{item.pubDate?.slice(0, 16)}</span>
                    </div>

                    <h3 className="font-editorial text-base font-bold text-slate-100 group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    {item.snippet && (
                      <p className="text-xs text-slate-400 font-intel line-clamp-2 leading-relaxed">
                        {item.snippet}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-xs font-intel">
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Original</span>
                      </a>
                    ) : <span />}

                    <button
                      type="button"
                      onClick={() => handleRewriteWireItem(item)}
                      disabled={isRewriting}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                    >
                      {activeStoryId === item.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Rewriting...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>AI Rewrite</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: FETCH FROM ANY ARTICLE URL */}
      {inputMode === 'url' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 max-w-3xl">
          <div className="space-y-1">
            <h3 className="text-base font-bold font-editorial text-slate-100 flex items-center gap-2">
              <Link className="w-4 h-4 text-amber-400" />
              <span>Rewrite from Any News Article URL</span>
            </h3>
            <p className="text-xs text-slate-400 font-intel">
              Paste the web link of any breaking news story (from Reuters, Bloomberg, The Hindu, BBC, TechCrunch, NDTV, etc.).
              The engine extracts the facts and rewrites it into an original iamnewsagent dispatch.
            </p>
          </div>

          <form onSubmit={handleFetchAndRewriteUrl} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/news/article-slug..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-intel focus:outline-none focus:border-amber-400"
                required
              />
              <button
                type="submit"
                disabled={isUrlFetching || isRewriting}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-intel font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isUrlFetching || isRewriting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Parsing & Rewriting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Fetch & AI Rewrite</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODE 3: PASTE RAW TEXT / PRESS RELEASE */}
      {inputMode === 'text' && (
        <form onSubmit={handleRewritePastedText} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 max-w-3xl">
          <div className="space-y-1">
            <h3 className="text-base font-bold font-editorial text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Paste Raw Notes, Press Release, or Wire Text</span>
            </h3>
            <p className="text-xs text-slate-400 font-intel">
              Have rough notes, speech transcripts, or a company press release? Paste it here and Gemini will construct a professional news dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-intel font-bold text-slate-300 uppercase mb-1">
                Headline / Topic Hint (Optional)
              </label>
              <input
                type="text"
                value={pastedHeadline}
                onChange={(e) => setPastedHeadline(e.target.value)}
                placeholder="e.g. India launches new green hydrogen corridor..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-intel focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-intel font-bold text-slate-300 uppercase mb-1">
                Source Attribution Hint
              </label>
              <input
                type="text"
                value={pastedSource}
                onChange={(e) => setPastedSource(e.target.value)}
                placeholder="e.g. Ministry of Commerce / Press Wire"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-intel focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-intel font-bold text-slate-300 uppercase mb-1">
              Raw Text / Story Body *
            </label>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste the raw statement, quotes, figures, or body text here..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-intel focus:outline-none focus:border-amber-400 leading-relaxed font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isRewriting}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-intel font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isRewriting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Rewriting with Gemini AI...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Rewrite with Gemini AI</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* REWRITE PREVIEW & PUBLISH MODAL */}
      {rewriteModalOpen && rewrittenData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-6 my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold font-editorial text-slate-100">
                    AI Rewritten Dispatch Review
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-intel uppercase">
                    Original & Clean
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-intel">
                  Rewritten by Gemini 3.8 Flash based on: <span className="text-slate-300 italic">{rewrittenData.sourceTitle || 'Wire dispatch'}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRewriteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Review Preview */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Category & Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-intel">
                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {rewrittenData.category}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {rewrittenData.readTimeMinutes} min read
                </span>
                <div className="flex items-center gap-1">
                  {rewrittenData.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Headline:
                </span>
                <h2 className="text-xl font-bold font-editorial text-slate-100 leading-tight">
                  {rewrittenData.headline}
                </h2>
              </div>

              {/* Deck */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Deck (Executive Summary):
                </span>
                <p className="text-sm font-intel text-slate-300 italic bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {rewrittenData.deck}
                </p>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Key Intelligence Takeaways (AEO Compliance)</span>
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 font-intel">
                  {rewrittenData.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">&bull;</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Article Content Snippet */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Full Semantic Markdown Content:
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {rewrittenData.content}
                </div>
              </div>

              {/* Author Assignment for Publishing */}
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-intel">
                  <label className="text-slate-300 font-bold">Publish Under Author:</label>
                  <select
                    value={selectedAuthorId}
                    onChange={(e) => setSelectedAuthorId(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-intel focus:outline-none focus:border-amber-400"
                  >
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name} ({author.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRewriteModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-intel"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    onLoadIntoEditor(rewrittenData);
                    setRewriteModalOpen(false);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-intel font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open in Editor to Polish</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPublish}
                  disabled={isPublishing}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-intel font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Publishing to Cloud...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>1-Click Publish to Live Site</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
