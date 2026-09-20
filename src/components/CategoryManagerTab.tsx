import React, { useState, useEffect } from 'react';
import {
  Grid,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  RotateCcw,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Edit3,
  ExternalLink,
  Sparkles,
  Layers,
} from 'lucide-react';
import type { CategoryItem } from '../types';
import {
  getCategories,
  saveCategories,
  addCategory,
  deleteCategory,
  resetCategoriesToDefault,
  DEFAULT_CATEGORIES,
} from '../utils/categoryManager';

interface CategoryManagerTabProps {
  onShowToast: (msg: string) => void;
}

const PRESET_IMAGES = [
  { label: 'Stadium & Sports', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80' },
  { label: 'Cricket Action', url: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=600&q=80' },
  { label: 'Football Arena', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80' },
  { label: 'India Landmark', url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80' },
  { label: 'Global Satellite', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80' },
  { label: 'Business & Finance', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80' },
  { label: 'AI & Chips', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80' },
  { label: 'Health & Wellness', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80' },
  { label: 'Lifestyle & Travel', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Cinema & Arts', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80' },
];

export const CategoryManagerTab: React.FC<CategoryManagerTabProps> = ({ onShowToast }) => {
  const [categories, setCategories] = useState<CategoryItem[]>(() => getCategories());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);

  // New category modal/drawer state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubtext, setNewSubtext] = useState('');
  const [newImage, setNewImage] = useState(PRESET_IMAGES[0].url);

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const handleStartEdit = (item: CategoryItem) => {
    setEditingId(item.id);
    setEditingItem({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingItem(null);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    if (!editingItem.name.trim()) {
      onShowToast('Category name cannot be empty.');
      return;
    }

    const updated = categories.map((c) => (c.id === editingItem.id ? editingItem : c));
    setCategories(updated);
    saveCategories(updated);
    setEditingId(null);
    setEditingItem(null);
    onShowToast(`Category "${editingItem.name}" updated successfully!`);
  };

  const handleToggleEnabled = (id: string) => {
    const updated = categories.map((c) =>
      c.id === id ? { ...c, isEnabled: c.isEnabled === false ? true : false } : c
    );
    setCategories(updated);
    saveCategories(updated);
    const cat = updated.find((c) => c.id === id);
    onShowToast(`"${cat?.name}" is now ${cat?.isEnabled !== false ? 'visible' : 'hidden'} on the home page.`);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const list = [...categories];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    // Reassign order
    const ordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setCategories(ordered);
    saveCategories(ordered);
    onShowToast('Category order updated.');
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove category "${name}" from Explore by Category?`)) {
      const updated = deleteCategory(id);
      setCategories(updated);
      onShowToast(`Category "${name}" removed.`);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all categories to editorial defaults?')) {
      const defs = resetCategoriesToDefault();
      setCategories(defs);
      setEditingId(null);
      onShowToast('Categories reset to editorial defaults.');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCat: CategoryItem = {
      id: newName.trim().replace(/\s+/g, '-'),
      name: newName.trim(),
      subtext: newSubtext.trim() || 'News, Analysis & Updates',
      image: newImage.trim() || PRESET_IMAGES[0].url,
      order: categories.length + 1,
      isEnabled: true,
    };

    const updated = addCategory(newCat);
    setCategories(updated);
    setShowAddModal(false);
    setNewName('');
    setNewSubtext('');
    onShowToast(`Category "${newCat.name}" added successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Layers className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold font-editorial text-slate-100">
              Explore by Category Manager
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-intel mt-1 max-w-2xl">
            Customize the "Explore by Category" row on the front page. Edit thumbnail photos, category titles,
            subtitles, display order, or toggle visibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-intel font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-intel text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Reset to original 8 editorial categories"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* LIVE PREVIEW OF EXPLORE BY CATEGORY ON FRONT PAGE */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-intel font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Live Home Page Reader Preview
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {categories.filter((c) => c.isEnabled !== false).length} Active Categories
          </span>
        </div>

        {/* Reader Preview Mock */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
            <h4 className="text-base font-bold font-serif text-slate-900">
              Explore by Category
            </h4>
            <span className="text-xs font-semibold text-slate-600">View All &rarr;</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {categories
              .filter((c) => c.isEnabled !== false)
              .map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 text-left shadow-2xs"
                >
                  <div className="h-16 w-full overflow-hidden bg-slate-200">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {cat.name}
                    </div>
                    <div className="text-[9px] text-slate-500 truncate leading-tight">
                      {cat.subtext}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* CATEGORIES MANAGEMENT LIST / CARDS */}
      <div className="space-y-3">
        <h4 className="text-xs font-intel font-bold uppercase tracking-wider text-slate-300">
          Categories Configuration ({categories.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {categories.map((cat, index) => {
            const isEditing = editingId === cat.id;
            const isEnabled = cat.isEnabled !== false;

            if (isEditing && editingItem) {
              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-xl bg-slate-900 border-2 border-amber-500/80 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-amber-400 font-intel flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      Editing Category: {cat.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Position #{index + 1}</span>
                  </div>

                  <div className="space-y-2.5 text-xs font-intel">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Category Name *</label>
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Subtitle / Subtext *</label>
                      <input
                        type="text"
                        value={editingItem.subtext}
                        onChange={(e) => setEditingItem({ ...editingItem, subtext: e.target.value })}
                        placeholder="e.g. Cricket, Football, More"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Image URL *</label>
                      <input
                        type="text"
                        value={editingItem.image}
                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Quick Preset Selector */}
                    <div>
                      <span className="block text-[10px] text-slate-400 mb-1">Or pick high-res preset:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_IMAGES.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setEditingItem({ ...editingItem, image: p.url })}
                            className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                              editingItem.image === p.url
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex-shrink-0">
                        <img
                          src={editingItem.image}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Live thumbnail preview as readers will see it
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={cat.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center gap-3.5 ${
                  isEnabled
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950 border-slate-800/60 opacity-60'
                }`}
              >
                {/* Thumbnail */}
                <div className="w-20 h-16 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex-shrink-0 relative">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  {!isEnabled && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[9px] text-red-400 font-bold uppercase">
                      Hidden
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-slate-100 truncate">
                      {cat.name}
                    </h5>
                    {!isEnabled && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5 font-intel">
                    {cat.subtext}
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Position #{index + 1}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Reorder Buttons */}
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 transition-colors"
                    title="Move Left/Up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === categories.length - 1}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 transition-colors"
                    title="Move Right/Down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(cat.id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isEnabled
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'text-slate-500 bg-slate-800 border-slate-700 hover:text-slate-300'
                    }`}
                    title={isEnabled ? 'Hide from front page' : 'Show on front page'}
                  >
                    {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(cat)}
                    className="p-1.5 rounded-lg text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                    title="Edit category"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD NEW CATEGORY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold font-editorial text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Add New Front Page Category
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs font-intel">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Category Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Defense, Space, AI Strategy"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Subtitle / Subtext *</label>
                <input
                  type="text"
                  value={newSubtext}
                  onChange={(e) => setNewSubtext(e.target.value)}
                  placeholder="e.g. Missiles, Orbit, Deterrence"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Thumbnail Image URL *</label>
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              {/* Presets */}
              <div>
                <span className="block text-[10px] text-slate-400 mb-1">Quick Select Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_IMAGES.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setNewImage(p.url)}
                      className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                        newImage === p.url
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-16 h-12 rounded overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">
                  <img
                    src={newImage}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-200 truncate">{newName || 'Category Title'}</div>
                  <div className="text-[10px] text-slate-400 truncate">{newSubtext || 'Subtext here'}</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
