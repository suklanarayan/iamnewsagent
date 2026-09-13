import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { LiveStory } from '../types';

interface StoryModalProps {
  stories: LiveStory[];
  currentStory: LiveStory;
  onClose: () => void;
  onSelectStory?: (story: LiveStory) => void;
  onSelectArticleSlug?: (slug: string) => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  stories,
  currentStory,
  onClose,
  onSelectStory,
  onSelectArticleSlug,
}) => {
  const currentIndex = stories.findIndex((s) => s.id === currentStory.id);
  const [progress, setProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-progress bar timer
  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1 && onSelectStory) {
            onSelectStory(stories[currentIndex + 1]);
          }
          return 100;
        }
        return prev + 2;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [currentStory.id, currentIndex, stories, onSelectStory]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1 && onSelectStory) {
      setProgress(0);
      onSelectStory(stories[currentIndex + 1]);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0 && onSelectStory) {
      setProgress(0);
      onSelectStory(stories[currentIndex - 1]);
    }
  };

  const toggleAudio = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `${currentStory.title}. ${currentStory.subtitle}. Key developments: ${currentStory.keyPoints.join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Story Card Container */}
      <div className="relative w-full max-w-sm sm:max-w-md h-[80vh] sm:h-[85vh] max-h-[750px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-slate-700">
        {/* Navigation arrows */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
            aria-label="Previous story"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
            aria-label="Next story"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentStory.image}
            alt={currentStory.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
        </div>

        {/* Top Story Header & Progress Indicators */}
        <div className="relative z-10 p-4 space-y-3">
          {/* Multi-story progress bar segment */}
          <div className="flex gap-1.5 w-full">
            {stories.map((s, idx) => (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all"
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Story author/topic info */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-red-500 overflow-hidden">
                <img src={currentStory.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-xs font-bold font-serif flex items-center gap-1.5">
                  <span>{currentStory.title}</span>
                  {currentStory.isLive && (
                    <span className="px-1.5 py-0.2 rounded bg-red-600 text-[8px] font-black">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-300">
                  {currentStory.subtitle} &bull; {currentStory.category}
                </div>
              </div>
            </div>

            {/* Audio narration toggle */}
            <button
              type="button"
              onClick={toggleAudio}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
              title="Listen to story summary"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bottom Story Intelligence Takeaways */}
        <div className="relative z-10 p-5 space-y-4 text-white">
          <div className="p-3.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Key Intelligence Takeaways</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {currentStory.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Read full article button if linked */}
          {currentStory.articleSlug && onSelectArticleSlug && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectArticleSlug(currentStory.articleSlug!);
              }}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg cursor-pointer"
            >
              <span>Read Full Verified Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
