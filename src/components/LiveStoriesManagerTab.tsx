import React, { useState } from 'react';
import {
  Radio,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Image,
  Link as LinkIcon,
  X,
  RefreshCw,
  Flame,
} from 'lucide-react';
import type { LiveStory, Article } from '../types';
import {
  createLiveStory,
  updateLiveStory,
  deleteLiveStory,
  toggleLiveStoryStatus,
} from '../services/articleRepository';
import {
  generateLiveStoryPoints,
  resolveCuratedImageUrl,
} from '../services/aiNewsService';
import { ImageUploader } from './ImageUploader';

interface LiveStoriesManagerTabProps {
  stories: LiveStory[];
  articles: Article[];
  onRefreshStories: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

const PRESET_STORY_IMAGES = [
  { label: 'BRICS 2026 Summit (Vector Graphic)', url: '/brics-2026-summit.svg' },
  { label: 'Diplomacy & Summit', url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80' },
  { label: 'Space & Launch', url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=600&q=80' },
  { label: 'Mobile & Hardware', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80' },
  { label: 'Indian Festival & Culture', url: 'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=600&q=80' },
  { label: 'Cricket & Sports', url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Stock & Financial', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80' },
  { label: 'Electric & Green Energy', url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Cyber Defense', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80' },
  { label: 'Monsoon & Weather', url: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=600&q=80' },
];

const STORY_CATEGORIES = [
  'India',
  'World',
  'Technology',
  'Business',
  'Markets',
  'Science',
  'Sports',
  'Culture',
  'Defense',
];

export const LiveStoriesManagerTab: React.FC<LiveStoriesManagerTabProps> = ({
  stories,
  articles,
  onRefreshStories,
  onShowToast,
}) => {
  const [editingStory, setEditingStory] = useState<LiveStory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formImage, setFormImage] = useState(PRESET_STORY_IMAGES[0].url);
  const [formCategory, setFormCategory] = useState('India');
  const [formIsLive, setFormIsLive] = useState(true);
  const [formArticleSlug, setFormArticleSlug] = useState('');
  const [formKeyPoints, setFormKeyPoints] = useState<string[]>([
    'First breaking real-time update on this developing story.',
    'Official statement or key metric recorded by editorial desk.',
    'Next developments and timetable expected within 24 hours.',
  ]);

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Open modal for new story
  const handleOpenNewModal = () => {
    setEditingStory(null);
    setFormTitle('');
    setFormSubtitle('Live');
    setFormImage(PRESET_STORY_IMAGES[0].url);
    setFormCategory('India');
    setFormIsLive(true);
    setFormArticleSlug('');
    setFormKeyPoints([
      'First breaking real-time update on this developing story.',
      'Official statement or key metric recorded by editorial desk.',
      'Next developments and timetable expected within 24 hours.',
    ]);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (story: LiveStory) => {
    setEditingStory(story);
    setFormTitle(story.title);
    setFormSubtitle(story.subtitle);
    setFormImage(story.image);
    setFormCategory(story.category || 'India');
    setFormIsLive(story.isLive ?? false);
    setFormArticleSlug(story.articleSlug || '');
    setFormKeyPoints(story.keyPoints && story.keyPoints.length > 0 ? story.keyPoints : ['']);
    setIsModalOpen(true);
  };

  // Key points manipulation
  const handleAddPoint = () => {
    setFormKeyPoints([...formKeyPoints, '']);
  };

  const handleUpdatePoint = (index: number, val: string) => {
    const updated = [...formKeyPoints];
    updated[index] = val;
    setFormKeyPoints(updated);
  };

  const handleRemovePoint = (index: number) => {
    if (formKeyPoints.length <= 1) return;
    setFormKeyPoints(formKeyPoints.filter((_, i) => i !== index));
  };

  // AI Generation of Live Story Points
  const handleAiGeneratePoints = async () => {
    if (!formTitle.trim()) {
      alert('Please enter a Story Title first (e.g., "G20 Climate Summit" or "ISRO Gaganyaan Mission").');
      return;
    }

    setIsAiGenerating(true);
    try {
      onShowToast('Gemini is synthesizing real-time story bullet points...');
      const res = await generateLiveStoryPoints({
        title: formTitle,
        category: formCategory,
        context: formSubtitle,
      });

      if (res.subtitle && !formSubtitle) {
        setFormSubtitle(res.subtitle);
      }
      if (res.keyPoints && res.keyPoints.length > 0) {
        setFormKeyPoints(res.keyPoints);
      }
      if (res.imageTopic) {
        setFormImage(resolveCuratedImageUrl(formCategory, res.imageTopic));
      }
      onShowToast('Live story bullet updates generated successfully!');
    } catch (err) {
      console.error(err);
      onShowToast(`AI generation error: ${(err as Error).message}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Save story
  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const cleanPoints = formKeyPoints.map((p) => p.trim()).filter(Boolean);

      if (editingStory) {
        await updateLiveStory(editingStory.id, {
          title: formTitle.trim(),
          subtitle: formSubtitle.trim() || 'Live',
          image: formImage.trim() || PRESET_STORY_IMAGES[0].url,
          category: formCategory,
          isLive: formIsLive,
          articleSlug: formArticleSlug || undefined,
          keyPoints: cleanPoints.length > 0 ? cleanPoints : ['Live update filed.'],
        });
        onShowToast(`Live Story "${formTitle}" updated!`);
      } else {
        await createLiveStory({
          title: formTitle.trim(),
          subtitle: formSubtitle.trim() || 'Live',
          image: formImage.trim() || PRESET_STORY_IMAGES[0].url,
          category: formCategory,
          isLive: formIsLive,
          articleSlug: formArticleSlug || undefined,
          keyPoints: cleanPoints.length > 0 ? cleanPoints : ['Live update filed.'],
        });
        onShowToast(`Live Story "${formTitle}" published!`);
      }

      await onRefreshStories();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      onShowToast(`Failed to save story: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Live status
  const handleToggleLive = async (story: LiveStory) => {
    setTogglingId(story.id);
    try {
      const newStatus = await toggleLiveStoryStatus(story.id);
      await onRefreshStories();
      onShowToast(`Story "${story.title}" is now ${newStatus ? '🔴 LIVE' : '⚪ Standby'}`);
    } catch (err) {
      console.error(err);
      onShowToast('Failed to toggle live status');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete story
  const handleDeleteStory = async (story: LiveStory) => {
    if (!window.confirm(`Are you sure you want to delete "${story.title}"?`)) return;

    try {
      await deleteLiveStory(story.id);
      await onRefreshStories();
      onShowToast(`Deleted "${story.title}"`);
    } catch (err) {
      console.error(err);
      onShowToast('Failed to delete story');
    }
  };

  return (
    <div className="space-y-6 text-xs font-intel">
      {/* Top Banner Guide */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-base font-bold text-slate-100 font-editorial flex items-center gap-2">
                Live Stories Desk
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono font-bold text-[10px] border border-red-500/30">
                HOMEPAGE TOP BAR
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              These are the circular visual story circles displayed prominently at the very top of
              the <strong>iamquickagent.com</strong> homepage. Readers tap on them to launch an
              interactive, full-screen story reader with rapid-fire key bullet updates.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNewModal}
            className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Live Story</span>
          </button>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map((story) => (
          <div
            key={story.id}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-3 relative group"
          >
            {/* Header: Circle Preview + Titles */}
            <div className="flex items-start gap-3">
              {/* Circular Avatar */}
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-red-600 flex-shrink-0">
                <div className="p-0.5 bg-slate-950 rounded-full">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
                {story.isLive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 border border-slate-900 shadow-sm">
                    <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                    LIVE
                  </span>
                )}
              </div>

              {/* Title & Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">
                    {story.category || 'General'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleLive(story)}
                    disabled={togglingId === story.id}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                      story.isLive
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                    title="Click to toggle LIVE badge on homepage"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        story.isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    <span>{story.isLive ? 'LIVE' : 'Standby'}</span>
                  </button>
                </div>

                <h4 className="text-sm font-bold text-slate-100 truncate">{story.title}</h4>
                <p className="text-xs text-slate-400 truncate">{story.subtitle}</p>
              </div>
            </div>

            {/* Bullet Points Preview */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Story Updates ({story.keyPoints?.length || 0})
              </div>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {(story.keyPoints || []).slice(0, 2).map((pt, i) => (
                  <li key={i} className="line-clamp-1 flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
                {(story.keyPoints?.length || 0) > 2 && (
                  <li className="text-[10px] text-slate-500 italic">
                    +{story.keyPoints.length - 2} more bullet updates in full reader...
                  </li>
                )}
              </ul>
            </div>

            {/* Footer Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                {story.articleSlug ? (
                  <span className="text-amber-400/80 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    <span>Linked to Article</span>
                  </span>
                ) : (
                  <span>Standalone Story</span>
                )}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(story)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 font-semibold transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteStory(story)}
                  className="p-1 rounded bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 transition-colors"
                  title="Delete Story"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                <h3 className="text-lg font-bold font-editorial text-slate-100">
                  {editingStory ? 'Edit Live Story' : 'Create New Live Story'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="space-y-4">
              {/* Row 1: Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. ISRO Star Mission, G20 Summit, IPL Finals"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Subtitle / Status
                  </label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="e.g. Live, New Delhi, Finals"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Row 2: Category & Live toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                  >
                    {STORY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 mt-auto">
                  <div>
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span>Live Broadcast Badge</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Show blinking red LIVE badge on circle
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsLive}
                    onChange={(e) => setFormIsLive(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 bg-slate-900 border-slate-700"
                  />
                </div>
              </div>

              {/* Row 3: Story Cover Image Uploader (Local file, URL, Presets) */}
              <div>
                <ImageUploader
                  imageUrl={formImage}
                  onChangeImageUrl={(url) => setFormImage(url)}
                  onImageChange={(url) => setFormImage(url)}
                  label="Story Visual / Cover Photo"
                  suggestedTopic={formCategory}
                />
              </div>

              {/* Row 4: Optional linked article */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Link to Full Article (Optional)
                </label>
                <select
                  value={formArticleSlug}
                  onChange={(e) => setFormArticleSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                >
                  <option value="">-- Standalone (No Article Linked) --</option>
                  {articles.map((art) => (
                    <option key={art.id} value={art.slug}>
                      {art.headline} ({art.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 5: Bullet Updates with Gemini AI Assist */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Real-time Key Updates (Bullet Points)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      These bullet updates appear in the fullscreen story viewer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiGeneratePoints}
                    disabled={isAiGenerating}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                    <span>{isAiGenerating ? 'AI Synthesizing...' : '⚡ AI Generate Points'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formKeyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handleUpdatePoint(idx, e.target.value)}
                        placeholder={`Live story update bullet #${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                        required
                      />
                      {formKeyPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePoint(idx)}
                          className="p-1.5 rounded text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Update Point</span>
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 disabled:opacity-50 cursor-pointer"
                >
                  <Radio className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Story...' : editingStory ? 'Update Live Story' : 'Publish Live Story'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
