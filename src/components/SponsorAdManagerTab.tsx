import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  ExternalLink,
  Save,
  RotateCcw,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Layout,
  FileText,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import type { BannerAd } from '../types';
import {
  getBannerAd,
  saveBannerAd,
  isBannerAdEnabled,
  setBannerAdEnabled,
  resetBannerAd,
  DEFAULT_ADS,
} from '../utils/adManager';

interface SponsorAdManagerTabProps {
  onShowToast: (msg: string) => void;
}

type AdFormatKey = 'leaderboard' | 'sticky-bottom' | 'native-inline' | 'mpu';

interface FormatMeta {
  key: AdFormatKey;
  name: string;
  badge: string;
  location: string;
  description: string;
}

const FORMAT_TABS: FormatMeta[] = [
  {
    key: 'leaderboard',
    name: 'Home Sponsored Briefing (Leaderboard)',
    badge: 'Front Page Hero',
    location: 'Displayed directly above "Explore by Category" on Home Page',
    description: 'The horizontal sponsor briefing banner with prominent headline, sponsor credit, deck, and CTA button.',
  },
  {
    key: 'sticky-bottom',
    name: 'Sticky Bottom Sponsor Ribbon',
    badge: 'Site-wide Footer',
    location: 'Docked fixed to bottom of the viewport on all public reader pages',
    description: 'Compact floating partner notification ribbon with dismiss button.',
  },
  {
    key: 'native-inline',
    name: 'In-Article Executive Sponsor',
    badge: 'Inside Stories',
    location: 'Embedded mid-way through article body content',
    description: 'Editorial-style native briefing card for corporate intelligence reports.',
  },
  {
    key: 'mpu',
    name: 'Sidebar MPU Partner Dispatch',
    badge: 'Desktop Sidebar',
    location: 'Rendered in right-hand sidebar on article reader pages',
    description: 'Square 300x250 media block with optional banner image, headline, and CTA.',
  },
];

export const SponsorAdManagerTab: React.FC<SponsorAdManagerTabProps> = ({ onShowToast }) => {
  const [selectedFormat, setSelectedFormat] = useState<AdFormatKey>('leaderboard');
  const [adConfig, setAdConfig] = useState<BannerAd>(() => getBannerAd('leaderboard'));
  const [isEnabled, setIsEnabled] = useState<boolean>(() => isBannerAdEnabled('leaderboard'));
  const [isSaved, setIsSaved] = useState(false);

  // When tab changes, load that format's data
  useEffect(() => {
    setAdConfig(getBannerAd(selectedFormat));
    setIsEnabled(isBannerAdEnabled(selectedFormat));
    setIsSaved(false);
  }, [selectedFormat]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveBannerAd(selectedFormat, adConfig);
    setBannerAdEnabled(selectedFormat, isEnabled);
    setIsSaved(true);
    onShowToast(`"${adConfig.label || 'Sponsor Ad'}" updated and live!`);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm(`Reset ${selectedFormat} ad to editorial defaults?`)) {
      const def = resetBannerAd(selectedFormat);
      setAdConfig(def);
      setIsEnabled(true);
      onShowToast(`Reset ${selectedFormat} to default sponsor banner.`);
    }
  };

  const currentMeta = FORMAT_TABS.find((f) => f.key === selectedFormat) || FORMAT_TABS[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Megaphone className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold font-editorial text-slate-100">
              Sponsor Briefings & Ad Placements Manager
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-intel mt-1 max-w-2xl">
            Manage corporate sponsorships, partner briefings, and banner advertisements across the front page,
            article bodies, and sidebar desks.
          </p>
        </div>

        {/* Live Enable/Disable Switch for current placement */}
        <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          <span className="text-xs font-intel font-semibold text-slate-300">
            {isEnabled ? 'Active on Live Site' : 'Currently Hidden'}
          </span>
          <button
            type="button"
            onClick={() => {
              const nextState = !isEnabled;
              setIsEnabled(nextState);
              setBannerAdEnabled(selectedFormat, nextState);
              onShowToast(
                nextState
                  ? `${currentMeta.name} activated on public site`
                  : `${currentMeta.name} disabled`
              );
            }}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-intel font-bold ${
              isEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{isEnabled ? 'Enabled' : 'Disabled'}</span>
          </button>
        </div>
      </div>

      {/* PLACEMENT TABS SELECTOR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {FORMAT_TABS.map((tab) => {
          const isSelected = selectedFormat === tab.key;
          const formatActive = isBannerAdEnabled(tab.key);

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedFormat(tab.key)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-slate-950 border-slate-800/80 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                  <span
                    className={`text-[10px] font-medium flex items-center gap-1 ${
                      formatActive ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        formatActive ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                    />
                    {formatActive ? 'Live' : 'Off'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                  {tab.name}
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 line-clamp-1">
                {tab.location}
              </span>
            </button>
          );
        })}
      </div>

      {/* LIVE PREVIEW CARD */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-intel font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Live Preview on Reader: {currentMeta.name}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {isEnabled ? '🟢 Active & Visible' : '🔴 Hidden on Public Site'}
          </span>
        </div>

        {/* Live Preview Container (Simulating Public White Background) */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-900">
          {/* FORMAT 1: LEADERBOARD PREVIEW */}
          {selectedFormat === 'leaderboard' && (
            <aside className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-xs">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-wider text-red-700 uppercase px-1.5 py-0.5 rounded bg-red-50 border border-red-200">
                    {adConfig.label || 'SPONSORED BRIEFING'}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate font-medium">
                    {adConfig.sponsor || 'Sponsor Name'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {adConfig.title || 'Sponsor Briefing Headline'}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                  {adConfig.description || 'Description deck appears here...'}
                </p>
              </div>

              <div className="flex-shrink-0 w-full sm:w-auto">
                <span className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs shadow-xs">
                  <span>{adConfig.ctaText || 'Access Audit Suite'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </aside>
          )}

          {/* FORMAT 2: STICKY BOTTOM PREVIEW */}
          {selectedFormat === 'sticky-bottom' && (
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-[10px] font-bold tracking-wider text-red-700 uppercase px-1.5 py-0.5 rounded bg-red-50 border border-red-200 shrink-0">
                  {adConfig.label || 'AD'}
                </span>
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-900 mr-2">
                    {adConfig.title || 'Sponsor Title'}
                  </span>
                  <span className="text-xs text-slate-500 truncate">
                    {adConfig.description || 'Description text...'}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-red-700 text-white font-semibold text-xs flex items-center gap-1 shrink-0">
                <span>{adConfig.ctaText || 'Explore'}</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          )}

          {/* FORMAT 3: NATIVE INLINE PREVIEW */}
          {selectedFormat === 'native-inline' && (
            <aside className="p-4 rounded-xl border border-red-200 bg-red-50/40 text-left">
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-red-200/60">
                <span className="text-[10px] font-bold tracking-wider text-red-700 uppercase">
                  {adConfig.label || 'EXECUTIVE SPONSOR'} &bull; {adConfig.sponsor}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Verified Partner</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 font-serif mb-1">
                {adConfig.title}
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                {adConfig.description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
                <span>{adConfig.ctaText}</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </aside>
          )}

          {/* FORMAT 4: MPU PREVIEW */}
          {selectedFormat === 'mpu' && (
            <aside className="max-w-[300px] mx-auto rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between text-left shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-wider text-red-700 uppercase px-1.5 py-0.5 rounded bg-red-50 border border-red-200">
                    {adConfig.label}
                  </span>
                  <span className="text-[10px] text-slate-400">Ad</span>
                </div>
                <div className="h-24 w-full rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 overflow-hidden">
                  {adConfig.image ? (
                    <img src={adConfig.image} alt="Ad banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <ShieldCheck className="w-6 h-6 text-red-600 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-600 font-medium">{adConfig.sponsor}</span>
                    </div>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{adConfig.title}</h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{adConfig.description}</p>
              </div>
              <span className="mt-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 font-semibold text-xs text-center">
                {adConfig.ctaText}
              </span>
            </aside>
          )}
        </div>
      </div>

      {/* EDITING FORM */}
      <form onSubmit={handleSave} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 text-xs font-intel">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-200">
              Configure {currentMeta.name}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {currentMeta.location}
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset to Editorial Default</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Badge Label */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Badge Label / Tag *
            </label>
            <input
              type="text"
              value={adConfig.label || ''}
              onChange={(e) => setAdConfig({ ...adConfig, label: e.target.value })}
              placeholder="e.g. SPONSORED BRIEFING"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
              required
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Red pill tag text (e.g. SPONSORED BRIEFING, INTELLIGENCE PARTNER)
            </span>
          </div>

          {/* Sponsor Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Sponsor / Partner Name *
            </label>
            <input
              type="text"
              value={adConfig.sponsor || ''}
              onChange={(e) => setAdConfig({ ...adConfig, sponsor: e.target.value })}
              placeholder="e.g. Nexus Quantum Systems"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
              required
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              The corporate brand sponsoring this dispatch
            </span>
          </div>

          {/* Main Title / Headline */}
          <div className="md:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">
              Headline Title *
            </label>
            <input
              type="text"
              value={adConfig.title || ''}
              onChange={(e) => setAdConfig({ ...adConfig, title: e.target.value })}
              placeholder="e.g. NEXUS QUANTUM CLOUD: Fault-Tolerant Enterprise Security"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">
              Description Deck / Summary *
            </label>
            <textarea
              rows={2}
              value={adConfig.description || ''}
              onChange={(e) => setAdConfig({ ...adConfig, description: e.target.value })}
              placeholder="e.g. Post-quantum cryptographic migration audits for global banking and intelligence systems."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          {/* CTA Button Text */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              CTA Button Label *
            </label>
            <input
              type="text"
              value={adConfig.ctaText || ''}
              onChange={(e) => setAdConfig({ ...adConfig, ctaText: e.target.value })}
              placeholder="e.g. Access Audit Suite"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          {/* CTA URL */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Target Destination URL *
            </label>
            <input
              type="text"
              value={adConfig.ctaUrl || ''}
              onChange={(e) => setAdConfig({ ...adConfig, ctaUrl: e.target.value })}
              placeholder="https://sponsor-website.com/briefing"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          {/* Optional Image URL for MPU */}
          {selectedFormat === 'mpu' && (
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Banner Graphic / Photo URL (Optional for MPU)
              </label>
              <input
                type="text"
                value={adConfig.image || ''}
                onChange={(e) => setAdConfig({ ...adConfig, image: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="text-emerald-400 flex items-center gap-1 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                Live on site!
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Publish Ad Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
