import React from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Eye,
  Award,
} from 'lucide-react';
import type { Article, Author } from '../types';
import { ArticleCard } from '../components/ArticleCard';

interface AuthorViewProps {
  author: Author;
  articles: Article[];
  onBackToFeed: () => void;
  onSelectArticle: (article: Article) => void;
}

export const AuthorView: React.FC<AuthorViewProps> = ({
  author,
  articles,
  onBackToFeed,
  onSelectArticle,
}) => {
  const authorArticles = articles.filter((a) => a.authorId === author.id);
  const totalViews = authorArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const uniqueCategories = Array.from(new Set(authorArticles.map((a) => a.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBackToFeed}
        className="inline-flex items-center gap-1.5 text-xs font-intel text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Global Wire</span>
      </button>

      {/* Author Profile Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-[#0c0e14] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl"
            />
            {author.verified && (
              <span className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-lg" title="Verified Correspondent">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </span>
            )}
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-slate-100">
                {author.name}
              </h1>
              <span className="text-xs font-intel font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Staff Intelligence Correspondent
              </span>
            </div>

            <p className="text-sm font-intel text-slate-300 font-medium">
              {author.role}
            </p>

            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed pt-1">
              {author.bio}
            </p>

            {/* Meta & Links */}
            <div className="flex flex-wrap items-center gap-4 pt-3 text-xs font-intel text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {author.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined {author.joinedDate}
              </span>

              {/* Social links */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                {author.twitter && (
                  <a
                    href={`https://twitter.com/${author.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-sky-400 transition-colors"
                    title={author.twitter}
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {author.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${author.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {author.email && (
                  <a
                    href={`mailto:${author.email}`}
                    className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-intel text-slate-400">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Dispatches Filed</span>
            </div>
            <div className="text-xl font-bold font-intel text-slate-100 mt-1">
              {authorArticles.length}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-intel text-slate-400">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Cumulative Readership</span>
            </div>
            <div className="text-xl font-bold font-intel text-slate-100 mt-1">
              {totalViews.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs font-intel text-slate-400">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Beats Covered</span>
            </div>
            <div className="text-xs font-intel text-slate-300 mt-1 truncate">
              {uniqueCategories.join(', ') || 'General Wire'}
            </div>
          </div>
        </div>
      </div>

      {/* Author's Articles List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xl font-bold font-editorial text-slate-100">
            Published Intelligence by {author.name}
          </h2>
          <span className="text-xs font-intel text-slate-400">
            {authorArticles.length} verified reports
          </span>
        </div>

        {authorArticles.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
            No published dispatches under this author yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorArticles.map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                author={author}
                variant="grid"
                onSelect={onSelectArticle}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
