import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Check,
  Copy,
  Trash2,
  RefreshCw,
  Eye,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { processAndOptimizeImage, formatBytes, type OptimizedImageResult } from '../utils/imageOptimizer';
import { resolveCuratedImageUrl } from '../services/aiNewsService';

interface ImageUploaderProps {
  imageUrl: string;
  onChangeImageUrl: (url: string) => void;
  imageCaption?: string;
  onChangeImageCaption?: (caption: string) => void;
  onInsertIntoBody?: (markdownSnippet: string) => void;
}

const CURATED_IMAGE_PRESETS = [
  { label: 'AI & Data Core', category: 'Technology', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Semiconductor Fab', category: 'Technology', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Space & Rocketry', category: 'Science', url: 'https://images.unsplash.com/photo-1517976487502-5f7140e4f3a9?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Diplomacy & Summit', category: 'World', url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Dalal Street / Markets', category: 'Markets', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Green Energy / Solar', category: 'Business', url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cyber Defense / Radar', category: 'Defense', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Indian Heritage & Tech', category: 'India', url: 'https://images.unsplash.com/photo-1599818818817-268e37841f3e?auto=format&fit=crop&w=1200&q=80' },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageUrl,
  onChangeImageUrl,
  imageCaption = '',
  onChangeImageCaption,
  onInsertIntoBody,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets' | 'ai'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMeta, setUploadMeta] = useState<OptimizedImageResult | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [insertSuccess, setInsertSuccess] = useState(false);
  const [topicPrompt, setTopicPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process File handler
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const result = await processAndOptimizeImage(file);
      setUploadMeta(result);
      onChangeImageUrl(result.dataUrl);

      // Auto-set suggested caption if empty
      if (!imageCaption && onChangeImageCaption) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        onChangeImageCaption(`Photo/Graphic: ${cleanName}`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(`Failed to process image: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  // Copy Image URL or Data Link
  const handleCopyUrl = async () => {
    if (!imageUrl) return;
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Insert into Markdown Content
  const handleInsertIntoMarkdown = () => {
    if (!imageUrl || !onInsertIntoBody) return;
    const caption = imageCaption.trim() || 'News Graphic / Illustration';
    const markdownTag = `\n\n![${caption}](${imageUrl})\n*${caption}*\n\n`;
    onInsertIntoBody(markdownTag);
    setInsertSuccess(true);
    setTimeout(() => setInsertSuccess(false), 2500);
  };

  // AI / Curated Topic Resolver
  const handleGenerateCuratedTopic = () => {
    if (!topicPrompt.trim()) return;
    const resolvedUrl = resolveCuratedImageUrl('Technology', topicPrompt.trim());
    onChangeImageUrl(resolvedUrl);
    if (!imageCaption && onChangeImageCaption) {
      onChangeImageCaption(`Editorial archive: ${topicPrompt.trim()}`);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-intel font-bold uppercase tracking-wider text-slate-200">
            News & Announcement Image Studio
          </h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Upload / URL / Presets
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-intel">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 px-2 rounded-md font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Image</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-1.5 px-2 rounded-md font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'url'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Web URL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 px-2 rounded-md font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'presets'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-1.5 px-2 rounded-md font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Topic Match</span>
        </button>
      </div>

      {/* TAB 1: UPLOAD CUSTOM IMAGE (Drag & Drop + Optimizer) */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
              isDragging
                ? 'border-amber-400 bg-amber-500/10'
                : 'border-slate-700 hover:border-amber-500/50 bg-slate-950/60 hover:bg-slate-950'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              {isProcessing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-200">
                {isProcessing ? 'Optimizing & Processing Image...' : 'Drop your news or announcement graphic here'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                or <span className="text-amber-400 underline font-semibold">browse local files</span> (PNG, JPG, WebP, SVG)
              </p>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              <span>✨ Auto-compresses for instant web delivery</span>
              <span>•</span>
              <span>Max 1600px HD</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXTERNAL WEB URL */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <label className="block text-[11px] font-intel text-slate-300">
            Paste Direct Image URL (Unsplash, Cloudinary, AWS S3, Imgur, CDN):
          </label>
          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-700 overflow-hidden">
            <span className="px-3 py-2 text-slate-500 bg-slate-900 border-r border-slate-800">
              <LinkIcon className="w-3.5 h-3.5" />
            </span>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => onChangeImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or https://yourcdn.com/announcement.jpg"
              className="flex-1 px-3 py-2 bg-transparent text-slate-200 text-xs font-mono focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* TAB 3: CURATED PRESETS */}
      {activeTab === 'presets' && (
        <div className="space-y-2">
          <div className="text-[11px] text-slate-400">Click any curated high-resolution editorial visual:</div>
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
            {CURATED_IMAGE_PRESETS.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChangeImageUrl(preset.url);
                  if (!imageCaption && onChangeImageCaption) {
                    onChangeImageCaption(`Editorial visual: ${preset.label}`);
                  }
                }}
                className={`group relative h-16 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                  imageUrl === preset.url
                    ? 'border-amber-400 ring-2 ring-amber-400/40'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
                title={preset.label}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1">
                  <span className="text-[9px] font-bold text-white line-clamp-1">
                    {preset.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AI TOPIC RESOLVER */}
      {activeTab === 'ai' && (
        <div className="space-y-2">
          <label className="block text-[11px] font-intel text-slate-300">
            Find relevant editorial photo by keyword:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={topicPrompt}
              onChange={(e) => setTopicPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleGenerateCuratedTopic())}
              placeholder="e.g. Space Rocket, Quantum Lab, Oil Refinery, Election..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleGenerateCuratedTopic}
              className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Match</span>
            </button>
          </div>
        </div>
      )}

      {/* LIVE IMAGE PREVIEW & ACTIONS CARD */}
      {imageUrl && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 aspect-video max-h-48 flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                // handle broken url
                (e.target as HTMLImageElement).src = CURATED_IMAGE_PRESETS[0].url;
              }}
            />
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onChangeImageUrl('')}
                className="p-1.5 rounded-md bg-slate-950/80 hover:bg-red-900 text-slate-400 hover:text-white backdrop-blur border border-slate-700 transition-colors"
                title="Clear image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Upload Metadata Badge if available */}
          {uploadMeta && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="truncate max-w-[150px]" title={uploadMeta.fileName}>
                📄 {uploadMeta.fileName}
              </span>
              <span>
                📐 {uploadMeta.width}×{uploadMeta.height} px
              </span>
              <span className="text-emerald-400 font-semibold">
                ⚡ {formatBytes(uploadMeta.optimizedSize)}{' '}
                {uploadMeta.originalSize > uploadMeta.optimizedSize && (
                  <span className="text-slate-400">
                    ({Math.round((1 - uploadMeta.optimizedSize / uploadMeta.originalSize) * 100)}% lighter)
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Action buttons: Copy URL & Insert into Body */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              title="Copy image URL or Data Link to clipboard"
            >
              {copySuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copy Image URL</span>
                </>
              )}
            </button>

            {onInsertIntoBody && (
              <button
                type="button"
                onClick={handleInsertIntoMarkdown}
                className="py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Insert this image directly into article body at the bottom"
              >
                {insertSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Inserted into Story!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Insert into Story Body</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Caption input */}
          {onChangeImageCaption && (
            <div className="pt-1">
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => onChangeImageCaption(e.target.value)}
                placeholder="Image caption / Photo credit (e.g. Official PR Handout / ISRO / Canva graphic)..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-intel focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
