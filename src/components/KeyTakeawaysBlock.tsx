import React, { useState } from 'react';
import { Sparkles, Volume2, VolumeX, Copy, Check, ShieldCheck } from 'lucide-react';

interface KeyTakeawaysBlockProps {
  takeaways: string[];
  headline?: string;
  isHero?: boolean;
}

export const KeyTakeawaysBlock: React.FC<KeyTakeawaysBlockProps> = ({
  takeaways,
  headline,
  isHero = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!takeaways || takeaways.length === 0) return null;

  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech audio reader is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `Key Takeaway Briefing for ${headline || 'this report'}. ${takeaways.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleCopy = () => {
    const text = takeaways.map((t, idx) => `${idx + 1}. ${t}`).join('\n');
    navigator.clipboard.writeText(`[iamnewsagent.com Executive Takeaways]\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="key-takeaways-block"
      data-aeo-summary="true"
      aria-label="Executive Key Takeaways"
      className="relative rounded-xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6 my-6 shadow-xs"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-amber-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-100 text-amber-800 border border-amber-300">
            <Sparkles className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              Key Takeaway Briefing
              <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-800 border border-amber-300/80 font-semibold">
                AEO / GEO Verified
              </span>
            </h3>
          </div>
        </div>

        {/* Audio & Copy Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="audio-brief-button"
            type="button"
            onClick={handleToggleAudio}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-white hover:bg-amber-100/60 text-amber-950 border border-amber-300 shadow-2xs'
            }`}
            title="Listen to Executive Audio Takeaways"
          >
            {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-800" />}
            <span>{isPlaying ? 'Pause Audio' : 'Audio Brief'}</span>
          </button>

          <button
            id="copy-brief-button"
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-amber-100/60 text-amber-950 border border-amber-300 transition-colors shadow-2xs cursor-pointer"
            title="Copy Key Takeaways to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-800" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Bulleted Takeaways */}
      <ul className="space-y-2.5 text-slate-800">
        {takeaways.map((point, idx) => (
          <li
            key={idx}
            className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed"
          >
            <span className="inline-flex items-center justify-center flex-shrink-0 w-5 h-5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300 text-[11px] font-bold mt-0.5">
              {idx + 1}
            </span>
            <span className="flex-1 font-medium text-slate-800">{point}</span>
          </li>
        ))}
      </ul>

      {/* Footer Trust Indicator */}
      <div className="mt-4 pt-3 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-amber-800/80">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
          <span>Curated by iamnewsagent verified editorial desk</span>
        </span>
        <span className="text-amber-800/70 hidden sm:inline">60-second read equivalent</span>
      </div>
    </section>
  );
};
