import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit2,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUpRight,
  Search,
  CheckCircle2,
  FileText,
  HelpCircle,
  Hash,
} from 'lucide-react';
import type { Article, TrendingItem } from '../types';
import {
  getTrendingSettings,
  saveTrendingSettings,
  resetTrendingSettings,
  TrendingSettings,
} from '../utils/trendingManager';

interface TrendingManagerTabProps {
  articles?: Article[];
  onShowToast: (msg: string) => void;
}

const COMMON_CATEGORIES = [
  'World',
  'India',
  'Politics',
  'Business',
  'Technology',
  'Science',
  'Sports',
  'Entertainment',
  'Health',
  'Defense',
];

export const TrendingManagerTab: React.FC<TrendingManagerTabProps> = ({
  articles = [],
  onShowToast,
}) => {
  const [settings, setSettings] = useState<TrendingSettings>(() => getTrendingSettings());
  const [editingItemId, setEditingItemId] = useState<number | string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state for creating or editing an item
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('World');
  const [formSearchVolume, setFormSearchVolume] = useState('250K searches');
  const [formSlug, setFormSlug] = useState('');

  useEffect(() => {
    const handleUpdated = () => {
      setSettings(getTrendingSettings());
    };
    window.addEventListener('trending-updated', handleUpdated);
    window.addEventListener('storage', handleUpdated);
    return () => {
      window.removeEventListener('trending-updated', handleUpdated);
      window.removeEventListener('storage', handleUpdated);
    };
  }, []);

  const handleToggleActive = () => {
    const nextState = !settings.isEnabled;
    const updated = { ...settings, isEnabled: nextState };
    setSettings(updated);
    saveTrendingSettings(updated);
    onShowToast(
      nextState
        ? 'Trending Now card is now LIVE on the Home Page'
        : 'Trending Now card is now HIDDEN on the Home Page'
    );
  };

  const handleTitleChange = (newTitle: string) => {
    const updated = { ...settings, sectionTitle: newTitle };
    setSettings(updated);
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = () => {
    // Recalculate ranks 1..N
    const reRanked = settings.items.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
    const finalSettings = { ...settings, items: reRanked };
    setSettings(finalSettings);
    saveTrendingSettings(finalSettings);
    setHasUnsavedChanges(false);
    onShowToast('Trending Now settings successfully saved & published live!');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= settings.items.length) return;

    const newItems = [...settings.items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIdx, 0, moved);

    const reRanked = newItems.map((it, idx) => ({ ...it, rank: idx + 1 }));
    const updated = { ...settings, items: reRanked };
    setSettings(updated);
    saveTrendingSettings(updated);
    onShowToast(`Moved "${moved.title}" ${direction}`);
  };

  const handleDelete = (id: number | string, title: string) => {
    if (confirm(`Remove "${title}" from Trending Now?`)) {
      const remaining = settings.items.filter((it) => it.id !== id);
      const reRanked = remaining.map((it, idx) => ({ ...it, rank: idx + 1 }));
      const updated = { ...settings, items: reRanked };
      setSettings(updated);
      saveTrendingSettings(updated);
      onShowToast(`Removed "${title}"`);
    }
  };

  const handleReset = () => {
    if (confirm('Reset Trending Now back to default editorial topics?')) {
      const defaults = resetTrendingSettings();
      setSettings(defaults);
      setEditingItemId(null);
      setIsAddingNew(false);
      onShowToast('Reset Trending Now to defaults');
    }
  };

  const startEdit = (item: TrendingItem) => {
    setEditingItemId(item.id);
    setIsAddingNew(false);
    setFormTitle(item.title);
    setFormCategory(item.category || 'General');
    setFormSearchVolume(item.searchVolume || '');
    setFormSlug(item.slug || '');
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newItems = settings.items.map((it) => {
      if (it.id === editingItemId) {
        return {
          ...it,
          title: formTitle.trim(),
          category: formCategory.trim(),
          searchVolume: formSearchVolume.trim() || undefined,
          slug: formSlug.trim() || undefined,
        };
      }
      return it;
    });

    const updated = { ...settings, items: newItems };
    setSettings(updated);
    saveTrendingSettings(updated);
    setEditingItemId(null);
    onShowToast(`Updated "${formTitle}" in Trending Now`);
  };

  const startAddNew = () => {
    setIsAddingNew(true);
    setEditingItemId(null);
    setFormTitle('');
    setFormCategory('World');
    setFormSearchVolume('300K searches');
    setFormSlug('');
  };

  const submitAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newItem: TrendingItem = {
      id: Date.now(),
      rank: settings.items.length + 1,
      title: formTitle.trim(),
      category: formCategory.trim(),
      searchVolume: formSearchVolume.trim() || undefined,
      slug: formSlug.trim() || undefined,
    };

    const newItems = [...settings.items, newItem];
    const updated = { ...settings, items: newItems };
    setSettings(updated);
    saveTrendingSettings(updated);
    setIsAddingNew(false);
    onShowToast(`Added "${newItem.title}" to Trending Now`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold font-editorial text-slate-100">
              Trending Now Manager
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-intel mt-1 max-w-2xl">
            Edit, reorder, add, or remove trending news topics shown in the right-hand sidebar of the Home Page.
            Readers can click any trending topic to instantly open its matching story or explore matching wire coverage.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleActive}
            className={`px-3 py-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-2 text-xs font-intel font-bold ${
              settings.isEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {settings.isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{settings.isEnabled ? 'Active on Home Page' : 'Hidden on Site'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-intel border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset to default trending topics"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Grid: Preview on Left/Right, Editor Controls on Main */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / MAIN COLUMN (7 cols): TOPIC LIST & CONTROLS */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card Header & Title Configuration */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Section Header Title:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.sectionTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Trending Now"
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-medium focus:border-amber-400 focus:outline-none w-48"
                />
                {hasUnsavedChanges && (
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400">
                {settings.items.length} Trending Topics Configured
              </span>
              <button
                type="button"
                onClick={startAddNew}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Trending Topic</span>
              </button>
            </div>
          </div>

          {/* ADD NEW TOPIC FORM */}
          {isAddingNew && (
            <form
              onSubmit={submitAddNew}
              className="p-4 rounded-xl bg-slate-900/90 border border-red-500/50 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-red-400 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add New Trending Topic
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Topic Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Union Budget Infrastructure Allocations 2026"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-red-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Category Desk
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-red-400 focus:outline-none"
                  >
                    {COMMON_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Search Volume / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={formSearchVolume}
                    onChange={(e) => setFormSearchVolume(e.target.value)}
                    placeholder="e.g. 350K searches or Breaking"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-red-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Link to Published Article (Optional)
                </label>
                <select
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-red-400 focus:outline-none"
                >
                  <option value="">-- Open Search Query (Default) --</option>
                  {articles.map((art) => (
                    <option key={art.id} value={art.slug}>
                      {art.category}: {art.title}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  If selected, clicking this trending topic opens that story directly. If left blank, it initiates a live search for this topic.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Add Topic
                </button>
              </div>
            </form>
          )}

          {/* EDIT TOPIC FORM MODAL */}
          {editingItemId !== null && (
            <form
              onSubmit={saveEdit}
              className="p-4 rounded-xl bg-slate-900/95 border border-amber-500/60 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4" />
                  Edit Trending Topic
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingItemId(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Topic Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Category Desk
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  >
                    {COMMON_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Search Volume / Metric
                  </label>
                  <input
                    type="text"
                    value={formSearchVolume}
                    onChange={(e) => setFormSearchVolume(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Link to Published Article (Optional)
                </label>
                <select
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="">-- Open Search Query (Default) --</option>
                  {articles.map((art) => (
                    <option key={art.id} value={art.slug}>
                      {art.category}: {art.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItemId(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* LIST OF TOPICS */}
          <div className="space-y-2">
            {settings.items.map((item, index) => {
              const matchedArticle = articles.find((a) => a.slug === item.slug);

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  {/* Left: Rank & Title */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-slate-700 text-xs">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                          {item.category}
                        </span>
                        {item.searchVolume && (
                          <span className="text-[10px] text-red-400 font-mono">
                            {item.searchVolume}
                          </span>
                        )}
                      </div>
                      <h4 className="text-slate-100 font-semibold truncate text-sm">
                        {item.title}
                      </h4>
                      {matchedArticle ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <FileText className="w-3 h-3" />
                          Linked: {matchedArticle.title}
                        </span>
                      ) : item.slug ? (
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Slug: {item.slug}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Opens search on click
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Reordering & Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up in ranking"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === settings.items.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down in ranking"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 transition-colors"
                      title="Edit this topic"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors"
                      title="Remove from trending"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): LIVE PREVIEW (Simulating the exact reader card) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-intel font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              Live Reader Preview
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {settings.isEnabled ? '🟢 Live on Home' : '🔴 Hidden on Home'}
            </span>
          </div>

          {/* Card exactly as styled on public site */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm text-slate-900">
            <h3 className="text-lg font-bold font-serif text-slate-950 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>{settings.sectionTitle || 'Trending Now'}</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {settings.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="w-full py-3 flex items-start gap-3 text-left -mx-2 px-2 rounded-lg group hover:bg-slate-50 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">
                      {item.title}
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-red-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-intel">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Editorial Tip:</span>
            </div>
            <p>
              Reorder topics using the up and down arrow buttons. You can add breaking developments or link a trending bullet directly to any published article slug so readers can read the full investigation with one click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
