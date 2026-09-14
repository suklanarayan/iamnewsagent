export type Category = 
  | 'India'
  | 'World'
  | 'Business'
  | 'Technology'
  | 'Markets'
  | 'Science'
  | 'Health'
  | 'Sports'
  | 'Lifestyle'
  | 'Entertainment'
  | 'Explainers'
  | 'Opinion';

export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  location: string;
  verified: boolean;
  twitter?: string;
  linkedin?: string;
  email?: string;
  joinedDate: string;
}

export type ArticleType = 
  | 'standard' 
  | 'announcement' 
  | 'opinion' 
  | 'investigation' 
  | 'live_coverage' 
  | 'explainer' 
  | 'research';

export type SourceOriginType = 
  | 'original'       // My Knowledge / Editorial Desk / Original Reporting
  | 'network'        // News Network / Wire Service (Reuters, ANI, PTI, Bloomberg, etc.)
  | 'live'           // Live Desk / Real-Time Field Update
  | 'social'         // Social Media (X/Twitter, LinkedIn, Telegram, YouTube, etc.)
  | 'press_release'  // Official Announcement / Corporate PR / Govt Gazette
  | 'blog'           // Blog / Substack / Independent Newsletter
  | 'reference'      // Research Paper / Whitepaper / Case Study
  | 'custom';        // Custom Reference / Other

export interface Citation {
  label: string;
  url: string;
  organization: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Article {
  id: string;
  slug: string;
  headline: string;
  deck: string; // Subheadline
  keyTakeaways: string[]; // Mandatory bulleted Key Takeaway summary block
  content: string; // Full semantic article content
  category: Category;
  tags: string[];
  authorId: string;
  featuredImage: string;
  imageCaption?: string;
  status: 'published' | 'draft' | 'scheduled';
  articleType?: ArticleType;
  sourceType?: SourceOriginType;
  sourceName?: string;
  sourceUrl?: string;
  isBreaking: boolean;
  isExplainer?: boolean;
  publishedAt: string; // ISO 8601
  updatedAt: string;   // ISO 8601
  readTimeMinutes: number;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  citations?: Citation[];
  faq?: FaqItem[];
}

export interface LiveStory {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  isLive?: boolean;
  category: string;
  articleSlug?: string;
  keyPoints: string[];
}

export interface TrendingItem {
  id: number;
  rank: number;
  title: string;
  category: string;
  searchVolume?: string;
  slug?: string;
}

export interface OpinionPiece {
  id: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  slug?: string;
}

export interface BannerAd {
  id: string;
  format: 'leaderboard' | 'mpu' | 'native-inline' | 'sticky-bottom';
  label: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  sponsor: string;
  sponsorLogo?: string;
  image?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
