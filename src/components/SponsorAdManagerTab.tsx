import React, { useState } from 'react';
import { Megaphone, ExternalLink, Save, RotateCcw, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import type { BannerAd } from '../types';
import {
  getStickyBannerAd,
  saveStickyBannerAd,
  isStickyBannerEnabled,
  setStickyBannerEnabled,
  DEFAULT_STICKY_AD,
} from '../utils/adManager';

interface SponsorAdManagerTabProps {
  onShowToast: (msg: string) => void;
}

export const SponsorAdManagerTab: React.FC<SponsorAdManagerTabProps> = ({ onShowToast }) => {
  const [adConfig, setAdConfig] = useState<BannerAd>(() => getStickyBannerAd());
  const [isEnabled, setIsEnabled] = useState<boolean>(() => isStickyBannerEnabled());
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStickyBannerAd(adConfig);
    setStickyBannerEnabled(isEnabled);
    setIsSaved(true);
    onShowToast('Sponsor Ribbon settings updated and live!');
    setTimeout(() => setIsSaved(false), 3000);
    // Dispatch storage event so live BannerAd updates in real-time
    window.dispatchEvent(new Event('storage'));
  };

  const handleReset = () => {
    if (confirm('Reset Sponsor Ribbon to editorial default?')) {
      setAdConfig(DEFAULT_STICKY_AD);
      setIsEnabled(true);
      saveStickyBannerAd(DEFAULT_STICKY_AD);
      setStickyBannerEnabled(true);
      onShowToast('Reset to default sponsor banner.');
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Megaphone className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold font-editorial text-slate-100">
              Sticky Bottom Sponsor Ribbon & Partner Ad
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-intel mt-1 max-w-2xl">
            Configure the persistent partner banner ribbon shown at the bottom of the public news reader.
            Set sponsor headline, brief description, CTA button label, and your custom destination link.
          </p>
        </div>

        {/* Live Enable/Disable Switch */}
        <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          <span className="text-xs font-intel font-semibold text-slate-300">
            {isEnabled ? 'Status: Active on Site' : 'Status: Hidden'}
          </span>
          <button
            type="button"
            onClick={() => {
              const nextState = !isEnabled;
              setIsEnabled(nextState);
              setStickyBannerEnabled(nextState);
              window.dispatchEvent(new Event('storage'));
              onShowToast(nextState ? 'Sponsor ribbon activated on public site' : 'Sponsor ribbon disabled');
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

      {/* LIVE PREVIEW OF THE BANNER */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-intel font-bold uppercase tracking-wider text-slate-400">
            Live Reader Preview ({isEnabled ? 'Visible to readers' : 'Currently Hidden'})
          </span>
          <span className="text-[11px] text-amber-400/90 font-intel font-mono">
            Format: sticky-bottom (viewport docked)
          </span>
        </div>

        {/* Visual Preview Box simulating reader bottom */}
        <div className="rounded-xl border border-slate-700/80 bg-white p-3 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="text-[10px] font-bold tracking-wider text-red-700 uppercase px-1.5 py-0.5 rounded bg-red-50 border border-red-200 shrink-0">
                {adConfig.label || 'AD'}
              </span>
              <div className="truncate">
                <span className="text-xs font-bold text-slate-900 mr-2">
                  {adConfig.title || 'Sponsor Title'}
                </span>
                <span className="text-xs text-slate-500 truncate">
                  {adConfig.description || 'Sponsor description brief appears here...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <a
                href={adConfig.ctaUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center gap-1 shadow-xs pointer-events-none"
              >
                <span>{adConfig.ctaText || 'Explore'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-not-allowed">
                &times;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIGURATION FORM */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-bold font-editorial text-slate-200">
          Edit Ribbon Properties & Destination Link
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-intel">
          {/* Sponsor Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Sponsor Headline / Brand <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={adConfig.title}
              onChange={(e) => setAdConfig({ ...adConfig, title: e.target.value })}
              placeholder="e.g. HYPERION ZERO-KNOWLEDGE LEDGER"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Sponsor Partner Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Partner Organization / Company Name
            </label>
            <input
              type="text"
              value={adConfig.sponsor}
              onChange={(e) => setAdConfig({ ...adConfig, sponsor: e.target.value })}
              placeholder="e.g. Hyperion Settlement Labs"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">
              Short Description / Brief
            </label>
            <input
              type="text"
              value={adConfig.description}
              onChange={(e) => setAdConfig({ ...adConfig, description: e.target.value })}
              placeholder="e.g. Atomic cross-border clearing for sovereign treasury desks."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Button Text */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              CTA Button Label
            </label>
            <input
              type="text"
              value={adConfig.ctaText}
              onChange={(e) => setAdConfig({ ...adConfig, ctaText: e.target.value })}
              placeholder="e.g. Explore Rails, Download Brief, Visit Portal"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Target Link / URL */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Destination Link / URL <span className="text-amber-400 font-mono">(Where readers go)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={adConfig.ctaUrl}
                onChange={(e) => setAdConfig({ ...adConfig, ctaUrl: e.target.value })}
                placeholder="https://your-sponsor-site.com or /article/your-slug"
                className="w-full px-3 py-2 pr-8 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:border-amber-400 focus:outline-none font-mono"
              />
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Enter any external web address (e.g. <code className="text-amber-300">https://company.com</code>) or internal site link (e.g. <code className="text-amber-300">/article/slug</code>).
            </p>
          </div>

          {/* Badge Label */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Pill Badge Label
            </label>
            <input
              type="text"
              value={adConfig.label}
              onChange={(e) => setAdConfig({ ...adConfig, label: e.target.value })}
              placeholder="AD, SPONSORED, PARTNER"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-intel flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="text-xs text-emerald-400 font-intel flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved & Live!</span>
              </span>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-intel font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Publish Banner</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
