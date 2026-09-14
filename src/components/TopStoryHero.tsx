import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, ArrowRight } from 'lucide-react';
import type { Article } from '../types';

interface TopStoryHeroProps {
  article: Article;
  onSelectArticle: (article: Article) => void;
}

export const TopStoryHero: React.FC<TopStoryHeroProps> = ({
  article,
  onSelectArticle,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const summaryText = `${article.headline}. ${article.deck}. Key Takeaways: ${article.keyTakeaways.join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(summaryText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <article
      onClick={() => onSelectArticle(article)}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Large Hero Image */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-900">
          <img
            src={article.featuredImage}
            alt={article.headline}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {article.isBreaking && (
            <span className="absolute top-4 left-4 px-2.5 py-1 rounded bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md">
              BREAKING
            </span>
          )}
        </div>

        {/* Story Metadata & Headline */}
        <div className="p-4 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider">
              {article.category}
            </span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-500 font-medium">2h ago</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-slate-950 group-hover:text-red-700 transition-colors leading-[1.15]">
            {article.headline}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {article.deck}
          </p>

          {/* MANDATORY KEY TAKEAWAY SUMMARY BLOCK */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-slate-900 space-y-2.5 cursor-default"
              data-aeo-summary="true"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Key Takeaway Summary</span>
                </div>

                <button
                  type="button"
                  onClick={toggleAudio}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200/80 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  title="Audio synthesis brief"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3 h-3 text-red-600" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 text-amber-700" />
                      <span>Listen (30s)</span>
                    </>
                  )}
                </button>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-700">
                {article.keyTakeaways.slice(0, 3).map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Read full article prompt */}
      <div className="px-4 sm:px-6 pb-5 pt-1">
        <span className="text-xs font-bold text-red-700 group-hover:text-red-800 inline-flex items-center gap-1">
          <span>Read Full Intelligence Dispatch</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </article>
  );
};
