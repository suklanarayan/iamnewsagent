import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Tv,
  Share2,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Flame,
  Radio,
  Hash,
  Eye,
  ArrowRight,
  Zap,
  Globe,
  Clock,
  CheckCircle,
  X,
  MessageCircle,
} from 'lucide-react';
import type { SocialTvTrendingItem, SocialPlatformType } from '../types';
import { fetchSocialTvTrending } from '../services/socialTrendingService';

interface SocialTvTrendingSectionProps {
  onSelectTag?: (tag: string) => void;
  onOpenAiRewriteModal?: (item: SocialTvTrendingItem) => void;
}

export const SocialTvTrendingSection: React.FC<SocialTvTrendingSectionProps> = ({
  onSelectTag,
  onOpenAiRewriteModal,
}) => {
  const [activePlatform, setActivePlatform] = useState<string>('all');
  const [items, setItems] = useState<SocialTvTrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [selectedBrief, setSelectedBrief] = useState<SocialTvTrendingItem | null>(null);

  // Load trending data
  const loadTrends = async (platform: string = 'all', refresh: boolean = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await fetchSocialTvTrending(platform, refresh);
      setItems(data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to load social & TV trends:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrends(activePlatform);
  }, [activePlatform]);

  // Extract unique active hashtags for the top trending ribbon
  const allHashtags = Array.from(
    new Set(
      items
        .map((i) => i.hashtag)
        .filter(Boolean)
    )
  ).slice(0, 8);

  const getPlatformIcon = (platform: SocialPlatformType) => {
    switch (platform) {
      case 'tv':
        return <Tv className="w-3.5 h-3.5 text-red-600" />;
      case 'x':
        return <span className="font-bold text-xs text-slate-900 select-none">𝕏</span>;
      case 'facebook':
        return <Share2 className="w-3.5 h-3.5 text-blue-600" />;
      case 'youtube':
        return <Tv className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Flame className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const getPlatformLabel = (platform: SocialPlatformType) => {
    switch (platform) {
      case 'tv':
        return 'TV Digital Broadcast';
      case 'x':
        return '𝕏 Viral Wire';
      case 'facebook':
        return 'Meta Discussion';
      case 'youtube':
        return 'Video Stream';
      default:
        return 'Viral Web';
    }
  };

  // Filter items by active tab
  const displayedItems = items.filter((i) => {
    if (activePlatform === 'all') return true;
    if (activePlatform === 'x') return i.platform === 'x';
    if (activePlatform === 'tv') return i.platform === 'tv';
    if (activePlatform === 'facebook') return i.platform === 'facebook';
    if (activePlatform === 'hashtags') return !!i.hashtag;
    return true;
  });

  const featuredItem = displayedItems[0];
  const gridItems = displayedItems.slice(1, 7);

  return (
    <section className="space-y-6 pt-2 pb-6 border-t border-b border-slate-200">
      {/* 1. SECTION HEADER: FUSION BRANDING & LIVE RADAR CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              Fusion of Modern News
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Real-Time Social Media & TV Pulse
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-950 tracking-tight">
            Top Trending Social Media & TV News
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Streaming top viral hashtags from 𝕏 (Twitter), viral Meta discussions, and real-time digital newsroom broadcasts from major networks.
          </p>
        </div>

        {/* Live sync status & refresh button */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="text-right text-[11px] text-slate-500 hidden sm:block">
            <span>Live Radar: </span>
            <span className="font-semibold text-slate-700">{lastUpdated}</span>
          </div>
          <button
            type="button"
            onClick={() => loadTrends(activePlatform, true)}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh live social & TV feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Pulse'}</span>
          </button>
        </div>
      </div>

      {/* 2. TRENDING HASHTAGS MARQUEE / RIBBON */}
      {allHashtags.length > 0 && (
        <div className="p-2.5 rounded-xl bg-slate-900 text-white flex flex-wrap items-center gap-2 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 px-2 py-0.5 uppercase tracking-wider flex-shrink-0">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>Viral #Tags Now:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {allHashtags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag && onSelectTag(tag)}
                className="px-2.5 py-1 rounded-md bg-slate-800/90 hover:bg-red-700 text-slate-200 hover:text-white text-xs font-mono font-medium transition-colors flex items-center gap-1 cursor-pointer"
                title={`Explore stories tagged ${tag}`}
              >
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. SEGMENTED PLATFORM FILTER TABS */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium overflow-x-auto">
        <button
          type="button"
          onClick={() => setActivePlatform('all')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activePlatform === 'all'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-red-600" />
          <span>All Viral & TV</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePlatform('x')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activePlatform === 'x'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="font-bold text-xs select-none">𝕏</span>
          <span>Trending on 𝕏 (Twitter)</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePlatform('tv')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activePlatform === 'tv'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tv className="w-3.5 h-3.5 text-red-600" />
          <span>TV Digital Broadcasts</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePlatform('facebook')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activePlatform === 'facebook'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Meta / Facebook Viral</span>
        </button>
      </div>

      {/* 4. CONTENT GRID */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-500 font-medium">
            Aggregating live social media radar & digital broadcast channels...
          </span>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <Tv className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-800">
            No live trending streams found for this platform.
          </p>
          <p className="text-xs text-slate-500">
            Click 'All Viral & TV' to view cross-platform intelligence dispatches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: FEATURED LEAD TRENDING CARD (5 COLS) */}
          {featuredItem && (
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between h-full">
              <div>
                {/* Visual Thumbnail */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900">
                  <img
                    src={featuredItem.imageUrl}
                    alt={featuredItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Broadcast / Velocity Indicator Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {featuredItem.isLiveBroadcast ? (
                      <span className="px-2.5 py-1 rounded bg-red-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>LIVE BROADCAST</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-slate-950/90 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md backdrop-blur-xs">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>TOP VIRAL DISPATCH</span>
                      </span>
                    )}
                  </div>

                  {/* Hashtag badge overlay on bottom of image */}
                  {featuredItem.hashtag && (
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-slate-950/80 text-amber-300 font-mono text-xs font-bold backdrop-blur-xs">
                      {featuredItem.hashtag}
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  {/* Clean unboxed metadata with separators */}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      {getPlatformIcon(featuredItem.platform)}
                      <span>{featuredItem.sourceName}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500">{featuredItem.approxTraffic}</span>
                  </div>

                  <h3
                    onClick={() => setSelectedBrief(featuredItem)}
                    className="text-xl sm:text-2xl font-bold font-serif text-slate-950 group-hover:text-red-700 transition-colors leading-snug cursor-pointer"
                  >
                    {featuredItem.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {featuredItem.summary}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 text-xs pt-3">
                <a
                  href={featuredItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-slate-700 hover:text-red-700 flex items-center gap-1 transition-colors"
                >
                  <span>Open Live Feed</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {onOpenAiRewriteModal && (
                  <button
                    type="button"
                    onClick={() => onOpenAiRewriteModal(featuredItem)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title="Synthesize and rewrite this trending news with Gemini AI"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>AI Rewrite</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* RIGHT: STREAMLINED GRID OF TRENDING DISPATCHES (7 COLS) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gridItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  {/* Platform & Traffic line */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      {getPlatformIcon(item.platform)}
                      <span className="truncate max-w-[130px]">{item.sourceName}</span>
                    </div>
                    {item.isLiveBroadcast ? (
                      <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        LIVE TV
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 truncate max-w-[110px]">
                        {item.approxTraffic}
                      </span>
                    )}
                  </div>

                  {/* Headline */}
                  <h4
                    onClick={() => setSelectedBrief(item)}
                    className="text-sm font-bold font-serif text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug cursor-pointer"
                  >
                    {item.title}
                  </h4>

                  {/* Hashtag & Summary */}
                  {item.hashtag && (
                    <span className="inline-block text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {item.hashtag}
                    </span>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Bottom actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <span>Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {onOpenAiRewriteModal && (
                    <button
                      type="button"
                      onClick={() => onOpenAiRewriteModal(item)}
                      className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                      title="Turn this trending news into an article"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      <span>Rewrite</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE TRENDING BRIEF MODAL */}
      {selectedBrief && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    {getPlatformIcon(selectedBrief.platform)}
                    <span>{getPlatformLabel(selectedBrief.platform)}</span>
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-medium">{selectedBrief.sourceName}</span>
                </div>
                {selectedBrief.hashtag && (
                  <span className="text-xs font-mono font-bold text-amber-700">
                    {selectedBrief.hashtag}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedBrief(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedBrief.imageUrl && (
                <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={selectedBrief.imageUrl}
                    alt={selectedBrief.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-xl font-bold font-serif text-slate-950 leading-snug">
                  {selectedBrief.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Estimated engagement: <strong className="text-slate-700">{selectedBrief.approxTraffic}</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs leading-relaxed text-slate-700">
                <p className="font-semibold text-slate-900">Intelligence Synthesis:</p>
                <p>{selectedBrief.summary}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <a
                href={selectedBrief.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>View Original Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {onOpenAiRewriteModal && (
                <button
                  type="button"
                  onClick={() => {
                    const brief = selectedBrief;
                    setSelectedBrief(null);
                    onOpenAiRewriteModal(brief);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>AI Rewrite into Full Article</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
