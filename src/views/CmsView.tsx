import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Plus,
  Save,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  Eye,
  ArrowLeft,
  Sparkles,
  Link,
  Layers,
  Image,
  Database,
  Lock,
  Unlock,
  RefreshCw,
  Globe,
  Flame,
  FileText,
  UserPlus,
  Check,
  Download,
  Zap,
  Rss,
  Radio,
  Clock,
  Calendar,
  Megaphone,
} from 'lucide-react';
import type {
  Article,
  Author,
  Category,
  FirebaseConfig,
  LiveStory,
  ArticleType,
  SourceOriginType,
  PublicationStatus,
} from '../types';
import { slugify } from '../utils/seo';
import {
  createArticle,
  updateArticle,
  deleteArticle,
  createAuthor,
  getStorageStatus,
} from '../services/articleRepository';
import {
  getSavedFirebaseConfig,
  saveFirebaseConfigToStorage,
  resetFirebaseClient,
} from '../services/firebase';
import { AiWireTab } from '../components/AiWireTab';
import { LiveStoriesManagerTab } from '../components/LiveStoriesManagerTab';
import { SponsorAdManagerTab } from '../components/SponsorAdManagerTab';
import { ImageUploader } from '../components/ImageUploader';
import { SourceOriginPicker } from '../components/SourceOriginPicker';
import { PublicationStatusPicker } from '../components/PublicationStatusPicker';
import { getStatusMeta, PUBLICATION_STATUSES } from '../utils/statusUtils';
import {
  resolveCuratedImageUrl,
  rewriteNewsWithGemini,
  type RewrittenArticleResult,
} from '../services/aiNewsService';

interface CmsViewProps {
  articles: Article[];
  authors: Author[];
  liveStories?: LiveStory[];
  onRefreshArticles: () => Promise<void>;
  onRefreshLiveStories?: () => Promise<void>;
  onCloseCms: () => void;
  onPreviewArticle: (article: Article) => void;
}

const CATEGORIES: Category[] = [
  'India',
  'World',
  'Business',
  'Technology',
  'Markets',
  'Science',
  'Health',
  'Sports',
  'Lifestyle',
  'Entertainment',
  'Explainers',
  'Opinion',
];

const CURATED_IMAGES = [
  { label: 'Neural AI Network', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Satellite & Space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Semiconductors', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Refinery & Minerals', url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Clean Grid Energy', url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Quantum Server Core', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=85' },
];

export const CmsView: React.FC<CmsViewProps> = ({
  articles,
  authors,
  liveStories = [],
  onRefreshArticles,
  onRefreshLiveStories,
  onCloseCms,
  onPreviewArticle,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Active CMS Tab
  const [activeTab, setActiveTab] = useState<'manage' | 'editor' | 'wire' | 'stories' | 'authors' | 'deploy' | 'sponsor'>('manage');

  // Article Editor State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [headline, setHeadline] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [deck, setDeck] = useState('');
  const [category, setCategory] = useState<Category>('Technology');
  const [authorId, setAuthorId] = useState<string>(authors[0]?.id || '');
  const [featuredImage, setFeaturedImage] = useState(CURATED_IMAGES[0].url);
  const [imageCaption, setImageCaption] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [status, setStatus] = useState<PublicationStatus>('published');
  const [scheduledPublishAt, setScheduledPublishAt] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [retractionReason, setRetractionReason] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | PublicationStatus>('all');
  const [articleType, setArticleType] = useState<ArticleType>('standard');
  const [sourceType, setSourceType] = useState<SourceOriginType>('original');
  const [sourceName, setSourceName] = useState('Editorial Desk (Original Reporting)');
  const [sourceUrl, setSourceUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [readTimeMinutes, setReadTimeMinutes] = useState(4);
  const [content, setContent] = useState('');

  // Publication Date & Timestamp Management
  const [publishedAt, setPublishedAt] = useState<string>(() => new Date().toISOString());
  const [autoBumpDateOnSave, setAutoBumpDateOnSave] = useState<boolean>(false);

  // Format ISO string to datetime-local input value (YYYY-MM-DDTHH:mm)
  const toDateTimeLocal = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      const offset = date.getTimezoneOffset() * 60000;
      const local = new Date(date.getTime() - offset);
      return local.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  // Convert datetime-local value to ISO string
  const handleDateTimeLocalChange = (val: string) => {
    if (!val) return;
    try {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        setPublishedAt(date.toISOString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Quick 1-click update to current timestamp (2026)
  const handleSetDateToNow = () => {
    const now = new Date().toISOString();
    setPublishedAt(now);
    showToast('Publication timestamp set to current date and time (2026)!');
  };

  // Quick 1-click bump directly from Manage Articles table
  const handleQuickBumpDate = async (article: Article) => {
    const now = new Date().toISOString();
    await updateArticle(article.id, {
      publishedAt: now,
      updatedAt: now,
    });
    await onRefreshArticles();
    showToast(`Publication date for "${article.headline.slice(0, 28)}..." updated to Today (2026)!`);
  };

  // Dedicated 'Key Takeaway' Summary inputs (bulleted list)
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([
    'Core intelligence finding with quantitative metric or strategic impact.',
    'Primary operational milestone bypassing legacy verification constraints.',
    'Sovereign or enterprise counterparty risks and mitigation strategies.',
  ]);

  // Firebase Config Form state
  const [firebaseForm, setFirebaseForm] = useState<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });
  const [firebaseSavedNotice, setFirebaseSavedNotice] = useState(false);

  // New Author Modal State
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorRole, setNewAuthorRole] = useState('');
  const [newAuthorBio, setNewAuthorBio] = useState('');
  const [newAuthorLocation, setNewAuthorLocation] = useState('Washington, D.C.');

  // Notification / Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check saved Firebase configuration on mount
  useEffect(() => {
    const saved = getSavedFirebaseConfig();
    if (saved) {
      setFirebaseForm(saved);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim().toLowerCase() === 'quickagent2026' || passcode.trim().length >= 4) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid passcode. Use "quickagent2026" or any 4+ char key.');
    }
  };

  // Auto-slug generator
  const handleHeadlineChange = (val: string) => {
    setHeadline(val);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  // Takeaway helpers
  const handleTakeawayChange = (index: number, val: string) => {
    const updated = [...keyTakeaways];
    updated[index] = val;
    setKeyTakeaways(updated);
  };

  const handleAddTakeaway = () => {
    setKeyTakeaways([...keyTakeaways, '']);
  };

  const handleRemoveTakeaway = (index: number) => {
    if (keyTakeaways.length <= 1) return;
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index));
  };

  // Reset / Clear Editor
  const handleNewArticle = () => {
    setEditingArticleId(null);
    setHeadline('');
    setSlug('');
    setIsSlugManuallyEdited(false);
    setDeck('');
    setCategory('Technology');
    setAuthorId(authors[0]?.id || '');
    setFeaturedImage(CURATED_IMAGES[0].url);
    setImageCaption('');
    setIsBreaking(false);
    setStatus('published');
    setScheduledPublishAt('');
    setReviewNotes('');
    setRetractionReason('');
    setArticleType('standard');
    setSourceType('original');
    setSourceName('Editorial Desk (Original Reporting)');
    setSourceUrl('');
    setTagsInput('Artificial Intelligence, Intelligence Brief');
    setReadTimeMinutes(4);
    setKeyTakeaways([
      'Executive finding #1 detailing the core operational breakthrough.',
      'Cryptographic verification or sovereign policy milestone.',
      'Next-horizon impact and institutional oversight timetable.',
    ]);
    setContent(`Autonomous agents and verified machine intelligences are redefining strategic operations across global borders.\n\n## Structural Operational Overview\n\n1. Real-time verification without legacy clearance lag.\n2. Tamper-evident cryptographic state transitions.\n3. Continuous regulatory oversight.\n\n> "Speed of intelligence without mathematical certainty is merely accelerated error."\n\nFurther policy implementations are slated for review by international standards bodies.`);
    setPublishedAt(new Date().toISOString());
    setAutoBumpDateOnSave(false);
    setActiveTab('editor');
  };

  // Load AI rewritten story directly into Editor to polish
  const handleLoadRewrittenIntoEditor = (data: RewrittenArticleResult & { sourceTitle?: string; sourceUrl?: string }) => {
    setEditingArticleId(null);
    setHeadline(data.headline);
    setSlug(slugify(data.headline));
    setIsSlugManuallyEdited(false);
    setDeck(data.deck);
    setCategory((data.category as Category) || 'Technology');
    setFeaturedImage(resolveCuratedImageUrl(data.category, data.imageTopic));
    setImageCaption(data.imageCaption || `Wire reporting filed by editorial desk.`);
    setIsBreaking(false);
    setStatus('published');
    setArticleType('standard');
    setSourceType(data.sourceTitle ? 'network' : 'original');
    setSourceName(data.sourceTitle || 'News Wire Service');
    setSourceUrl(data.sourceUrl || '');
    setTagsInput((data.tags || []).join(', '));
    setReadTimeMinutes(data.readTimeMinutes || 4);
    setKeyTakeaways(data.keyTakeaways && data.keyTakeaways.length > 0 ? data.keyTakeaways : ['']);
    setContent(data.content);
    setPublishedAt(new Date().toISOString());
    setAutoBumpDateOnSave(false);
    setActiveTab('editor');
    showToast('AI draft loaded into editor! Review, tweak, and click Publish when ready.');
  };

  // 1-Click Publish from AI Wire
  const handlePublishRewrittenImmediately = async (
    data: RewrittenArticleResult,
    pubAuthorId: string
  ) => {
    const cleanSlug = slugify(data.headline);
    const now = new Date().toISOString();
    const coverImg = resolveCuratedImageUrl(data.category, data.imageTopic);

    await createArticle({
      headline: data.headline,
      slug: cleanSlug,
      deck: data.deck,
      category: (data.category as Category) || 'Technology',
      authorId: pubAuthorId || authors[0]?.id || 'author-1',
      featuredImage: coverImg,
      imageCaption: data.imageCaption || 'Intelligence dispatch wire archive.',
      isBreaking: false,
      status: 'published',
      tags: data.tags || ['Wire News'],
      readTimeMinutes: data.readTimeMinutes || 4,
      keyTakeaways: data.keyTakeaways || [],
      content: data.content,
      publishedAt: now,
      updatedAt: now,
    });

    await onRefreshArticles();
    setActiveTab('manage');
  };

  // AI Assist directly inside the Manual Editor
  const [isAiAssisting, setIsAiAssisting] = useState(false);
  const handleAiAssistInEditor = async () => {
    if (!content.trim() && !headline.trim()) {
      alert('Please enter at least a draft headline or story notes first.');
      return;
    }

    setIsAiAssisting(true);
    try {
      showToast('Analyzing draft & generating Key Takeaways with Gemini...');
      const result = await rewriteNewsWithGemini({
        headline,
        rawText: content,
        preferredCategory: category,
      });

      if (!headline.trim()) {
        setHeadline(result.headline);
        setSlug(slugify(result.headline));
      }
      if (!deck.trim()) {
        setDeck(result.deck);
      }
      if (result.keyTakeaways && result.keyTakeaways.length > 0) {
        setKeyTakeaways(result.keyTakeaways);
      }
      if (result.tags && result.tags.length > 0 && !tagsInput.trim()) {
        setTagsInput(result.tags.join(', '));
      }
      if (result.readTimeMinutes) {
        setReadTimeMinutes(result.readTimeMinutes);
      }
      showToast('Key Takeaways and metadata auto-generated with Gemini AI!');
    } catch (err) {
      console.error(err);
      showToast(`AI Assist error: ${(err as Error).message}`);
    } finally {
      setIsAiAssisting(false);
    }
  };

  // Populate editor with existing article
  const handleEditArticle = (art: Article) => {
    setEditingArticleId(art.id);
    setHeadline(art.headline);
    setSlug(art.slug);
    setIsSlugManuallyEdited(true);
    setDeck(art.deck);
    setCategory(art.category);
    setAuthorId(art.authorId);
    setFeaturedImage(art.featuredImage);
    setImageCaption(art.imageCaption || '');
    setIsBreaking(art.isBreaking);
    setStatus(art.status || 'published');
    setScheduledPublishAt(art.scheduledPublishAt || '');
    setReviewNotes(art.reviewNotes || '');
    setRetractionReason(art.retractionReason || '');
    setArticleType(art.articleType || 'standard');
    setSourceType(art.sourceType || 'original');
    setSourceName(art.sourceName || 'Editorial Desk');
    setSourceUrl(art.sourceUrl || '');
    setTagsInput(art.tags.join(', '));
    setReadTimeMinutes(art.readTimeMinutes || 3);
    setKeyTakeaways(art.keyTakeaways.length > 0 ? art.keyTakeaways : ['']);
    setContent(art.content);
    let artDate = art.publishedAt || new Date().toISOString();
    if (artDate.startsWith('2025-')) {
      artDate = artDate.replace('2025-', '2026-');
    }
    setPublishedAt(artDate);
    setAutoBumpDateOnSave(false);
    setActiveTab('editor');
  };

  // Save Article (Create or Update to Firestore + Local)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) {
      alert('Headline is required.');
      return;
    }

    const cleanSlug = slug.trim() ? slugify(slug) : slugify(headline);
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const validTakeaways = keyTakeaways.map((t) => t.trim()).filter(Boolean);

    if (validTakeaways.length === 0) {
      alert('At least one Key Takeaway summary point is required for AEO compliance.');
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const finalPublishedAt = autoBumpDateOnSave ? now : (publishedAt || now);

      if (editingArticleId) {
        await updateArticle(editingArticleId, {
          headline,
          slug: cleanSlug,
          deck,
          category,
          authorId,
          featuredImage,
          imageCaption,
          isBreaking,
          status,
          scheduledPublishAt: status === 'scheduled' && scheduledPublishAt ? scheduledPublishAt : undefined,
          reviewNotes: status === 'review' && reviewNotes.trim() ? reviewNotes.trim() : undefined,
          retractionReason: status === 'withdrawn' && retractionReason.trim() ? retractionReason.trim() : undefined,
          articleType,
          sourceType,
          sourceName,
          sourceUrl: sourceUrl.trim() || undefined,
          tags: parsedTags,
          readTimeMinutes: Number(readTimeMinutes) || 3,
          keyTakeaways: validTakeaways,
          content,
          publishedAt: finalPublishedAt,
          updatedAt: now,
        });
        showToast('Article updated with publication date and synced successfully.');
      } else {
        await createArticle({
          headline,
          slug: cleanSlug,
          deck,
          category,
          authorId,
          featuredImage,
          imageCaption,
          isBreaking,
          status,
          scheduledPublishAt: status === 'scheduled' && scheduledPublishAt ? scheduledPublishAt : undefined,
          reviewNotes: status === 'review' && reviewNotes.trim() ? reviewNotes.trim() : undefined,
          retractionReason: status === 'withdrawn' && retractionReason.trim() ? retractionReason.trim() : undefined,
          articleType,
          sourceType,
          sourceName,
          sourceUrl: sourceUrl.trim() || undefined,
          tags: parsedTags,
          readTimeMinutes: Number(readTimeMinutes) || 3,
          keyTakeaways: validTakeaways,
          content,
          publishedAt: finalPublishedAt,
          updatedAt: now,
        });
        showToast('New article published and saved permanently to Firestore.');
      }

      await onRefreshArticles();
      setActiveTab('manage');
    } catch (err) {
      console.error('Save failed:', err);
      showToast('Error saving article. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fast 1-Click Status Lifecycle Transition from Table
  const handleQuickStatusChange = async (articleId: string, newStatus: PublicationStatus) => {
    try {
      await updateArticle(articleId, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      await onRefreshArticles();
      showToast(`Status updated to "${getStatusMeta(newStatus).label}"`);
    } catch (err) {
      console.error('Quick status update failed:', err);
      showToast('Failed to update status');
    }
  };

  // Delete Article
  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    await deleteArticle(id);
    await onRefreshArticles();
    showToast('Article deleted successfully.');
  };

  // Create New Author
  const handleCreateAuthorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorName.trim() || !newAuthorRole.trim()) {
      alert('Name and role are required.');
      return;
    }
    const created = await createAuthor({
      name: newAuthorName,
      role: newAuthorRole,
      bio: newAuthorBio || 'Intelligence analyst for iamquickagent.com wire.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      location: newAuthorLocation,
      verified: true,
      joinedDate: new Date().toISOString().slice(0, 10),
    });
    await onRefreshArticles();
    setAuthorId(created.id);
    setShowAuthorModal(false);
    setNewAuthorName('');
    setNewAuthorRole('');
    showToast(`Author "${created.name}" created and assigned.`);
  };

  // Save Firebase configuration
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfigToStorage(firebaseForm);
    resetFirebaseClient();
    setFirebaseSavedNotice(true);
    setTimeout(() => setFirebaseSavedNotice(false), 4000);
    showToast('Firebase configuration updated.');
  };

  const storageInfo = getStorageStatus();

  // Authentication Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-editorial text-slate-100">
              iamquickagent CMS Terminal
            </h2>
            <p className="text-xs text-slate-400 font-intel">
              Authentication required to access publishing and Firestore controls.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-intel font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Editor Passcode
              </label>
              <input
                id="cms-passcode-input"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (Default: quickagent2026)"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-400 font-intel"
                autoFocus
              />
              <p className="text-[11px] text-slate-400 font-intel mt-1">
                Hint: Passcode is <code className="text-amber-400">quickagent2026</code>
              </p>
            </div>

            {authError && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-900 text-red-300 text-xs font-intel flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              id="cms-login-submit-btn"
              type="submit"
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-intel font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Authenticate & Enter CMS</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={onCloseCms}
              className="text-xs text-slate-400 hover:text-white font-intel"
            >
              &larr; Cancel and return to public wire
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* CMS Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black font-intel text-base shadow-lg shadow-amber-500/20">
            QA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-editorial text-slate-100">
                Agent CMS & Publishing Console
              </h1>
              <span className="text-[10px] font-intel bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                SECURE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-intel">
              Manage articles, authors, SEO schemas, and Firestore cloud synchronization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('stories')}
            className="px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 font-intel font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Manage homepage top circle live stories"
          >
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Live Stories ({liveStories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wire')}
            className="px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-intel font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Zap className="w-4 h-4 fill-current text-amber-400" />
            <span>AI News Rewriter</span>
          </button>

          <a
            href="/project-source.zip"
            download="iamnewsagent-source.zip"
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-intel font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            title="Download full project code as ZIP to push to your GitHub repo"
          >
            <Download className="w-4 h-4" />
            <span>Export Code (.ZIP)</span>
          </a>

          <button
            type="button"
            onClick={handleNewArticle}
            className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-intel font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Dispatch</span>
          </button>

          <button
            type="button"
            onClick={onCloseCms}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-intel text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit CMS</span>
          </button>
        </div>
      </div>

      {/* Storage & Sync Status Indicator */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-intel">
        <div className="flex items-center gap-2">
          <Database className={`w-4 h-4 ${storageInfo.isCloud ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-slate-300 font-semibold">{storageInfo.provider}:</span>
          <span className="text-slate-400">{storageInfo.details}</span>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('deploy')}
          className="text-amber-400 hover:underline flex items-center gap-1 flex-shrink-0"
        >
          <span>Configure Firebase / Vercel</span>
          &rarr;
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-intel flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CMS Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-intel overflow-x-auto no-scrollbar">
        <button
          id="cms-tab-manage"
          type="button"
          onClick={() => setActiveTab('manage')}
          className={`pb-3 px-3 font-semibold transition-colors whitespace-nowrap relative ${
            activeTab === 'manage'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dispatches ({articles.length})
        </button>
        <button
          id="cms-tab-editor"
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`pb-3 px-3 font-semibold transition-colors whitespace-nowrap relative flex items-center gap-1.5 ${
            activeTab === 'editor'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{editingArticleId ? 'Edit Dispatch' : 'Manual News Editor'}</span>
        </button>
        <button
          id="cms-tab-wire"
          type="button"
          onClick={() => setActiveTab('wire')}
          className={`pb-3 px-3 font-semibold transition-colors whitespace-nowrap relative flex items-center gap-1.5 ${
            activeTab === 'wire'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span>AI Wire & News Rewriter</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
            AUTO
          </span>
        </button>
        <button
          id="cms-tab-stories"
          type="button"
          onClick={() => setActiveTab('stories')}
          className={`pb-3 px-3 font-semibold transition-colors whitespace-nowrap relative flex items-center gap-1.5 ${
            activeTab === 'stories'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>Live Stories</span>
          <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
            {liveStories.length}
          </span>
        </button>
        <button
          id="cms-tab-authors"
          type="button"
          onClick={() => setActiveTab('authors')}
          className={`pb-3 px-3 font-semibold transition-colors whitespace-nowrap relative ${
            activeTab === 'authors'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Authors Directory ({authors.length})
        </button>
        <button
          id="cms-tab-deploy"
          type="button"
          onClick={() => setActiveTab('deploy')}
          className={`pb-3 px-3 font-semibold transition-colors whitespace-nowrap relative ${
            activeTab === 'deploy'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Vercel & Firebase Setup
        </button>
        <button
          id="cms-tab-sponsor"
          type="button"
          onClick={() => setActiveTab('sponsor')}
          className={`pb-3 px-3 font-semibold transition-colors whitespace-nowrap relative flex items-center gap-1.5 ${
            activeTab === 'sponsor'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Sponsor Ribbon & Ads</span>
        </button>
      </div>

      {/* TAB 1: ARTICLES MANAGEMENT TABLE */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-editorial text-slate-200">
                Editorial Wire & Article Archive
              </h3>
              <p className="text-xs text-slate-400 font-intel">
                Manage publication statuses, embargoes, editorial reviews, and public distribution.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('wire')}
                className="px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 font-intel font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>AI Wire & Rewriter</span>
              </button>
              <button
                type="button"
                onClick={handleNewArticle}
                className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-intel font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manual New Article</span>
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs font-intel">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>All Articles</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/40 text-current font-mono">
                {articles.length}
              </span>
            </button>

            {PUBLICATION_STATUSES.map((s) => {
              const count = articles.filter((a) => (a.status || 'published') === s.id).length;
              const isSelected = statusFilter === s.id;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? `${s.colorClass.badge} font-bold ring-1 ring-amber-500/50`
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{s.shortLabel}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-950/60 text-slate-300 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs font-intel border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3.5">Headline & Slug</th>
                  <th className="p-3.5">Category & Origin</th>
                  <th className="p-3.5">Lifecycle Status</th>
                  <th className="p-3.5">Key Takeaways</th>
                  <th className="p-3.5">Views</th>
                  <th className="p-3.5">Filed</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {(() => {
                  const filteredArticles = statusFilter === 'all'
                    ? articles
                    : articles.filter((a) => (a.status || 'published') === statusFilter);

                  if (filteredArticles.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          <p className="text-sm font-semibold text-slate-300 mb-1">
                            No articles found with status "{statusFilter}".
                          </p>
                          <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className="text-xs text-amber-400 hover:underline cursor-pointer"
                          >
                            View all articles ({articles.length})
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return filteredArticles.map((art) => {
                    const meta = getStatusMeta(art.status || 'published');
                    const Icon = meta.icon;

                    return (
                      <tr key={art.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 max-w-sm">
                          <div className="flex items-center gap-2">
                            {art.isBreaking && (
                              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold">
                                FLASH
                              </span>
                            )}
                            <span className="font-bold text-slate-100 font-editorial text-sm line-clamp-1">
                              {art.headline}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                            /article/{art.slug}
                          </div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 text-[11px] font-semibold">
                              {art.category}
                            </span>
                            {art.articleType === 'announcement' && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800 text-[9px] font-bold">
                                📢 Announcement
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-intel flex items-center gap-1">
                              <span className="text-slate-500">by:</span>
                              <span className="truncate max-w-[120px] text-slate-300" title={art.sourceName || 'Editorial Desk'}>
                                {art.sourceName || 'Editorial Desk'}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase flex items-center gap-1 ${meta.colorClass.badge}`}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{meta.shortLabel}</span>
                            </span>

                            {art.status === 'scheduled' && art.scheduledPublishAt && (
                              <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1" title={new Date(art.scheduledPublishAt).toLocaleString()}>
                                <Clock className="w-2.5 h-2.5" />
                                <span>{new Date(art.scheduledPublishAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </span>
                            )}

                            {art.status === 'review' && (
                              <span className="text-[10px] text-amber-400/90 italic">
                                Pending desk review
                              </span>
                            )}

                            {art.status === 'withdrawn' && (
                              <span className="text-[10px] text-red-400 font-medium">
                                Withdrawn Notice
                              </span>
                            )}

                            {/* Rapid 1-Click Status Lifecycle Transition Selector */}
                            <select
                              value={art.status || 'published'}
                              onChange={(e) => handleQuickStatusChange(art.id, e.target.value as PublicationStatus)}
                              className="text-[10px] bg-slate-950 border border-slate-800 hover:border-slate-700 rounded px-1.5 py-0.5 text-slate-300 font-intel focus:border-amber-400 cursor-pointer"
                              title="Quickly change article publication status"
                            >
                              {PUBLICATION_STATUSES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  &rarr; {s.shortLabel}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {art.keyTakeaways.length} points
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-slate-400">
                          {art.views.toLocaleString()}
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-slate-400 text-xs">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span>{new Date(art.publishedAt).toLocaleDateString()}</span>
                            {new Date(art.publishedAt).getFullYear() < 2026 ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                2025
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                2026
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleQuickBumpDate(art)}
                            className="text-[10px] text-amber-400 hover:text-amber-300 underline font-intel block mt-1 transition-colors text-left"
                            title="Quickly set this article's date to Today (2026)"
                          >
                            ⚡ Set to Today (2026)
                          </button>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            onClick={() => onPreviewArticle(art)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="View Live Reader"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditArticle(art)}
                            className="p-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
                            title="Edit in CMS"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteArticle(art.id, art.headline)}
                            className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RICH ARTICLE EDITOR */}
      {activeTab === 'editor' && (
        <form onSubmit={handleSaveArticle} className="space-y-6">
          {/* Quick Step Guide for Manual News Publishing */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-intel space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <FileText className="w-4 h-4" />
                <span>How to Add & Publish News Manually:</span>
              </div>
              <button
                type="button"
                onClick={handleAiAssistInEditor}
                disabled={isAiAssisting}
                className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Auto-generate Key Takeaways & polish headline from content"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiAssisting ? 'animate-spin' : ''}`} />
                <span>{isAiAssisting ? 'AI Analyzing...' : '⚡ AI Polish & Auto-Takeaways'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                <span><strong>Write Headline & Deck:</strong> Enter news title, pick Category & Cover Image on the right.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                <span><strong>Add Key Takeaways & Story:</strong> Provide 3 executive takeaway bullets & write in Markdown.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
                <span><strong>Publish to Cloud:</strong> Click the amber button below to go live immediately on iamquickagent.com.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Core Fields */}
            <div className="lg:col-span-8 space-y-5">
              {/* Headline */}
              <div>
                <label className="block text-xs font-intel font-bold text-slate-200 uppercase tracking-wider mb-1">
                  Article Headline *
                </label>
                <input
                  id="editor-headline-input"
                  type="text"
                  value={headline}
                  onChange={(e) => handleHeadlineChange(e.target.value)}
                  placeholder="Enter punchy, authoritative intelligence headline..."
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-editorial text-lg sm:text-xl focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Custom Slug */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-intel font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-amber-400" />
                    <span>Custom Canonical Slug *</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-intel">
                    Auto-generated from headline
                  </span>
                </div>
                <div className="flex items-center rounded-lg bg-slate-900 border border-slate-700 overflow-hidden text-xs font-mono">
                  <span className="px-3 py-2 text-slate-400 bg-slate-950 border-r border-slate-800 select-none">
                    iamquickagent.com/article/
                  </span>
                  <input
                    id="editor-slug-input"
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsSlugManuallyEdited(true);
                    }}
                    placeholder="custom-article-slug-format"
                    className="flex-1 px-3 py-2 bg-transparent text-slate-200 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Deck / Subheadline */}
              <div>
                <label className="block text-xs font-intel font-bold text-slate-200 uppercase tracking-wider mb-1">
                  Subheadline / Deck (Summary Lead)
                </label>
                <textarea
                  id="editor-deck-input"
                  rows={2}
                  value={deck}
                  onChange={(e) => setDeck(e.target.value)}
                  placeholder="A concise 1-2 sentence executive deck providing context for the headline..."
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* NEWS ORIGIN, FORMAT & SOURCE ATTRIBUTION */}
              <SourceOriginPicker
                articleType={articleType}
                onChangeArticleType={setArticleType}
                sourceType={sourceType}
                onChangeSourceType={setSourceType}
                sourceName={sourceName}
                onChangeSourceName={setSourceName}
                sourceUrl={sourceUrl}
                onChangeSourceUrl={setSourceUrl}
              />

              {/* MANDATORY DEDICATED 'KEY TAKEAWAY' SUMMARY INPUT BOX */}
              <div className="p-4 rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-slate-900 to-slate-900 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <label className="text-xs font-intel font-bold uppercase tracking-wider text-amber-400">
                      Mandatory 'Key Takeaway' Summary Block
                    </label>
                  </div>
                  <span className="text-[10px] font-intel text-slate-400">
                    AEO / Perplexity / Voice Search Anchor
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter 2 to 5 high-impact bulleted takeaways. These are rendered in high contrast at the top of the article and hero page, and ingested by search engines for fast answer synthesis.
                </p>

                <div className="space-y-2.5">
                  {keyTakeaways.map((takeaway, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-intel font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={takeaway}
                        onChange={(e) => handleTakeawayChange(idx, e.target.value)}
                        placeholder={`Takeaway bullet point #${idx + 1}...`}
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-400"
                        required
                      />
                      {keyTakeaways.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTakeaway(idx)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800"
                          title="Remove bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAddTakeaway}
                    className="inline-flex items-center gap-1 text-xs font-intel text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Takeaway Point</span>
                  </button>
                  <span className="text-[11px] font-intel text-slate-400">
                    {keyTakeaways.length} points active
                  </span>
                </div>
              </div>

              {/* Full Article Content */}
              <div>
                <label className="block text-xs font-intel font-bold text-slate-200 uppercase tracking-wider mb-1">
                  Full Dispatch Content (Markdown / Semantic Structure)
                </label>
                <textarea
                  id="editor-content-input"
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write full article body. Use ## for section headings, 1. for lists, > for quotes..."
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-sans text-sm leading-relaxed focus:outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>
            </div>

            {/* Right Column: Metadata & Settings */}
            <div className="lg:col-span-4 space-y-5">
              {/* Publication Status & Editorial Lifecycle Picker */}
              <PublicationStatusPicker
                status={status}
                onChangeStatus={setStatus}
                scheduledPublishAt={scheduledPublishAt}
                onChangeScheduledPublishAt={setScheduledPublishAt}
                reviewNotes={reviewNotes}
                onChangeReviewNotes={setReviewNotes}
                retractionReason={retractionReason}
                onChangeRetractionReason={setRetractionReason}
              />

              {/* Publication Date & Timestamp Settings Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-intel font-bold uppercase tracking-wider text-slate-200">
                      Publication Date & Timestamp
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {new Date(publishedAt).getFullYear()} Edition
                  </span>
                </div>

                {/* Current Display */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-intel flex items-center justify-between">
                    <span>Active Published Date:</span>
                    {new Date(publishedAt).getFullYear() < 2026 && (
                      <span className="text-amber-400 font-bold text-[10px] flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        <AlertCircle className="w-3 h-3" />
                        Prior Year (2025)
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-300">
                    {new Date(publishedAt).toLocaleString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </div>
                </div>

                {/* 1-Click Fast Timestamp Bump Button */}
                <button
                  type="button"
                  onClick={handleSetDateToNow}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-intel font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚡ Set Date to Current Time (Now - 2026)</span>
                </button>

                {/* Manual Date & Time Picker */}
                <div>
                  <label htmlFor="editor-published-at-picker" className="block text-xs font-intel text-slate-300 mb-1">
                    Custom Date & Time Picker:
                  </label>
                  <input
                    id="editor-published-at-picker"
                    type="datetime-local"
                    value={toDateTimeLocal(publishedAt)}
                    onChange={(e) => handleDateTimeLocalChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-400 font-intel mt-1">
                    Select any custom day, month, year (e.g. 2026), or specific hour.
                  </p>
                </div>

                {/* Auto-bump toggle when saving */}
                <label className="flex items-start gap-2 pt-1 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBumpDateOnSave}
                    onChange={(e) => setAutoBumpDateOnSave(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-0"
                  />
                  <span className="text-[11px] leading-snug">
                    Automatically bump publication date to <strong>Today (2026)</strong> when saving updates
                  </span>
                </label>
              </div>

              {/* Publishing Controls Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="text-xs font-intel font-bold uppercase tracking-wider text-slate-200 pb-2 border-b border-slate-800">
                  Broadcast & Category Settings
                </h4>

                {/* Breaking News Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-4 h-4 ${isBreaking ? 'text-red-500' : 'text-slate-400'}`} />
                    <span className="text-xs font-intel font-semibold text-slate-200">
                      Breaking Flash Hero
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isBreaking}
                    onChange={(e) => setIsBreaking(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-intel text-slate-300 mb-1">
                    Intelligence Category Assignment
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-intel"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Author Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-intel text-slate-300">
                      Author / Correspondent
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAuthorModal(true)}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-intel"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ New</span>
                    </button>
                  </div>
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-intel"
                  >
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Read time */}
                <div>
                  <label className="block text-xs font-intel text-slate-300 mb-1">
                    Estimated Reading Time (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={readTimeMinutes}
                    onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-intel"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-intel text-slate-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="AI, Defense, Semiconductors"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-intel"
                  />
                </div>

                {/* Action Save Button */}
                <button
                  id="editor-save-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-intel font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Saving to Firestore...'
                      : editingArticleId
                      ? 'Update & Sync Article'
                      : 'Publish Dispatch to Wire'}
                  </span>
                </button>
              </div>

              {/* Full Featured Image Studio (Upload / URL / Presets / AI) */}
              <ImageUploader
                imageUrl={featuredImage}
                onChangeImageUrl={setFeaturedImage}
                imageCaption={imageCaption}
                onChangeImageCaption={setImageCaption}
                onInsertIntoBody={(markdownTag) => {
                  setContent((prev) => prev + markdownTag);
                  showToast('Image inserted into story content!');
                }}
              />

              {/* LIVE GOOGLE SERP & AEO PREVIEW */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-intel font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google News & AEO SERP Preview</span>
                </h4>

                <div className="p-3 rounded-lg bg-white text-slate-900 text-xs space-y-1 font-sans">
                  <div className="text-[11px] text-slate-600 truncate">
                    https://iamquickagent.com &gt; article &gt; {slug || 'sample-slug'}
                  </div>
                  <div className="text-blue-800 font-medium text-sm hover:underline line-clamp-1">
                    {headline || 'Your Headline Will Appear Here | iamquickagent.com'}
                  </div>
                  <div className="text-slate-600 text-[11px] line-clamp-2">
                    {keyTakeaways[0] || deck || 'Key takeaways and executive briefing snippet parsed by Answer Engines...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB: AI WIRE & AUTO-NEWS FETCHER */}
      {activeTab === 'wire' && (
        <AiWireTab
          authors={authors}
          onLoadIntoEditor={handleLoadRewrittenIntoEditor}
          onPublishImmediately={handlePublishRewrittenImmediately}
          onShowToast={showToast}
        />
      )}

      {/* TAB: LIVE STORIES MANAGER */}
      {activeTab === 'stories' && (
        <LiveStoriesManagerTab
          stories={liveStories}
          articles={articles}
          onRefreshStories={onRefreshLiveStories || onRefreshArticles}
          onShowToast={showToast}
        />
      )}

      {/* TAB 3: AUTHORS DIRECTORY */}
      {activeTab === 'authors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-editorial text-slate-200">
              Verified Editorial Correspondents
            </h3>
            <button
              type="button"
              onClick={() => setShowAuthorModal(true)}
              className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-intel font-bold text-xs flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New Author</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {authors.map((auth) => (
              <div
                key={auth.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3"
              >
                <img
                  src={auth.avatar}
                  alt={auth.name}
                  className="w-12 h-12 rounded-full object-cover border border-amber-500/30 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-100 font-editorial">
                    {auth.name}
                  </div>
                  <div className="text-xs text-amber-400 font-intel truncate">
                    {auth.role}
                  </div>
                  <div className="text-[11px] text-slate-400 font-intel mt-0.5">
                    {auth.location} &bull; Joined {auth.joinedDate}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {auth.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VERCEL & FIREBASE DEPLOYMENT GUIDE */}
      {activeTab === 'deploy' && (
        <div className="space-y-6">
          {/* DIRECT ZIP DOWNLOAD & REPO PUSH GUIDE */}
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold font-editorial text-emerald-100">
                    Direct Source Code Export (.ZIP)
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl">
                  Download the complete, clean source code bundle (all React components, Firestore rules, assets, and configs) ready to push to your GitHub repo.
                </p>
              </div>

              <a
                href="/project-source.zip"
                download="iamnewsagent-source.zip"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25 flex-shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Source ZIP</span>
              </a>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Push To Your GitHub Repository: <span className="text-emerald-400 font-mono">basic</span>
                </span>
                <span className="text-[11px] text-slate-400 font-intel">Run in terminal inside unzipped folder</span>
              </div>
              <pre className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 text-xs font-mono overflow-x-auto leading-relaxed select-all">
{`git init
git add .
git commit -m "Initial commit of iamquickagent news platform"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/basic.git
git push -u origin main`}
              </pre>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold font-editorial text-slate-100">
                Deploying to GitHub & Vercel
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              This application is built with standard Vite and React, equipped with <code className="text-amber-400">vercel.json</code> for seamless SPA routing. Follow these simple steps to host permanently on Vercel with automated GitHub sync:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-intel">
                <div className="font-bold text-amber-400 uppercase">1. Push to GitHub 'basic' Repo</div>
                <p className="text-slate-300 leading-relaxed">
                  Extract the ZIP file above onto your computer, open your terminal in the extracted folder, and run the git commands above to push directly to your repository.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-intel">
                <div className="font-bold text-amber-400 uppercase">2. Connect to Vercel</div>
                <p className="text-slate-300">
                  1. Visit <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">vercel.com</a> and click <strong>Add New Project</strong>.<br />
                  2. Import your <strong>basic</strong> GitHub repository.<br />
                  3. Framework Preset: <strong>Vite</strong> (Build: <code className="text-amber-300">npm run build</code>, Output: <code className="text-amber-300">dist</code>).<br />
                  4. Click <strong>Deploy</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Firebase Connection Config Form */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold font-editorial text-slate-100">
                  Firebase Firestore Cloud Sync Configuration
                </h3>
              </div>
              <span className={`text-xs font-intel px-2.5 py-1 rounded border ${
                storageInfo.isCloud
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {storageInfo.provider}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              If you have a Firebase project, paste your Web App credentials below or configure them in Vercel environment variables (<code className="text-amber-300">VITE_FIREBASE_API_KEY</code>, etc.). Articles and dispatches will sync to Cloud Firestore automatically across all devices.
            </p>

            <form onSubmit={handleSaveFirebaseConfig} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-intel">
              <div>
                <label className="block text-slate-300 mb-1">API Key</label>
                <input
                  type="text"
                  value={firebaseForm.apiKey}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, apiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Project ID</label>
                <input
                  type="text"
                  value={firebaseForm.projectId}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, projectId: e.target.value })}
                  placeholder="iamquickagent-prod"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Auth Domain</label>
                <input
                  type="text"
                  value={firebaseForm.authDomain}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, authDomain: e.target.value })}
                  placeholder="iamquickagent-prod.firebaseapp.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Storage Bucket</label>
                <input
                  type="text"
                  value={firebaseForm.storageBucket}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, storageBucket: e.target.value })}
                  placeholder="iamquickagent-prod.appspot.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Messaging Sender ID</label>
                <input
                  type="text"
                  value={firebaseForm.messagingSenderId}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, messagingSenderId: e.target.value })}
                  placeholder="829480550842"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">App ID</label>
                <input
                  type="text"
                  value={firebaseForm.appId}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, appId: e.target.value })}
                  placeholder="1:829480550842:web:..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                />
              </div>

              <div className="md:col-span-2 pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-intel font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Firebase Configuration</span>
                </button>

                {firebaseSavedNotice && (
                  <span className="text-emerald-400 font-intel text-xs flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Saved! Firestore instance re-initialized.
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: SPONSOR RIBBON & AD SETTINGS */}
      {activeTab === 'sponsor' && <SponsorAdManagerTab />}

      {/* QUICK ADD AUTHOR MODAL */}
      {showAuthorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-bold font-editorial text-slate-100">
              Add New Intelligence Author
            </h3>
            <form onSubmit={handleCreateAuthorSubmit} className="space-y-3 text-xs font-intel">
              <div>
                <label className="block text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  placeholder="e.g. Commander Jack Ryan"
                  className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Role / Beat Title *</label>
                <input
                  type="text"
                  value={newAuthorRole}
                  onChange={(e) => setNewAuthorRole(e.target.value)}
                  placeholder="e.g. Senior Defense Analyst"
                  className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={newAuthorLocation}
                  onChange={(e) => setNewAuthorLocation(e.target.value)}
                  placeholder="e.g. Geneva / Brussels"
                  className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Brief Bio</label>
                <textarea
                  rows={2}
                  value={newAuthorBio}
                  onChange={(e) => setNewAuthorBio(e.target.value)}
                  placeholder="Background in aerospace and kinetic threats..."
                  className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAuthorModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Create Author
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
