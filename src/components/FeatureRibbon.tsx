import React from 'react';
import {
  Layers,
  FileText,
  Zap,
  Users,
  UserCheck,
} from 'lucide-react';

export const FeatureRibbon: React.FC = () => {
  const features = [
    {
      icon: Layers,
      title: 'Multiple Sources',
      desc: 'Wide, unbiased coverage',
    },
    {
      icon: FileText,
      title: 'AI Summaries',
      desc: 'Get to the point',
    },
    {
      icon: Zap,
      title: 'Live Updates',
      desc: 'Real-time, as it happens',
    },
    {
      icon: Users,
      title: 'Different Perspectives',
      desc: 'See the full picture',
    },
    {
      icon: UserCheck,
      title: 'Personalised Feed',
      desc: 'News that matters to you',
    },
  ];

  return (
    <section className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 ${
                  idx !== 0 ? 'md:pl-4' : ''
                } ${idx >= 2 ? 'pt-2 md:pt-0' : ''}`}
              >
                <div className="p-2 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/60 flex-shrink-0">
                  <Icon className="w-4 h-4 text-slate-800" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight truncate">
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
