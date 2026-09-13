import React, { useState } from 'react';
import { Check, Apple, Smartphone } from 'lucide-react';

export const NewsletterBox: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setIsSubscribed(true);
    }
  };

  return (
    <div className="bg-[#fcfaf7] rounded-xl border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-6">
      {/* Top Details */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold font-serif text-slate-950">
          Stay Informed, Always
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          Get the top stories, handpicked for you.
        </p>

        {isSubscribed ? (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Thank you for subscribing! Your morning intelligence brief will arrive daily.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="enter your email"
              className="flex-1 px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-red-600"
              required
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer flex-shrink-0 shadow-xs"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>

      {/* Download app section */}
      <div className="space-y-3 pt-3 border-t border-stone-200/60">
        <div className="text-xs font-bold text-slate-800">
          Download the <span className="font-serif">iamnewsagent</span> App
        </div>

        {/* Store Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* App store badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 text-white text-left cursor-pointer hover:bg-slate-800 transition-colors">
            <Apple className="w-4 h-4 text-white" />
            <div>
              <div className="text-[8px] uppercase tracking-wider text-slate-400 leading-none">Download on the</div>
              <div className="text-[11px] font-bold leading-none mt-0.5">App Store</div>
            </div>
          </div>

          {/* Google Play badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 text-white text-left cursor-pointer hover:bg-slate-800 transition-colors">
            <Smartphone className="w-4 h-4 text-white" />
            <div>
              <div className="text-[8px] uppercase tracking-wider text-slate-400 leading-none">Get it on</div>
              <div className="text-[11px] font-bold leading-none mt-0.5">Google Play</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cursive quote flourish */}
      <div className="pt-2">
        <div className="text-xl sm:text-2xl font-script text-slate-800 rotate-[-2deg] select-none">
          Good News Travels Further
        </div>
        <div className="w-16 h-0.5 bg-red-600 rounded-full mt-1" />
      </div>
    </div>
  );
};
