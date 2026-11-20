export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalPageData {
  slug: 'privacy-policy' | 'terms-of-service' | 'cookie-policy' | 'editorial-standards';
  path: string;
  title: string;
  metaTitle: string;
  description: string;
  eyebrow: string;
  lastUpdated: string;
  effectiveDate: string;
  intro: string;
  sections: LegalSection[];
}

export const LEGAL_PAGES: Record<LegalPageData['slug'], LegalPageData> = {
  'privacy-policy': {
    slug: 'privacy-policy',
    path: '/privacy-policy',
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy | iamquickagent.com',
    description:
      'Read the iamquickagent.com Privacy Policy detailing how we collect, protect, and manage reader data, analytics, cookies, and newsletter subscriptions.',
    eyebrow: 'Legal & Compliance',
    lastUpdated: '2026-11-20',
    effectiveDate: 'March 1, 2024',
    intro:
      'iamquickagent.com ("we", "our", or "the Publication") is committed to protecting reader privacy and handling personal data transparently in accordance with global data protection standards including the Digital Personal Data Protection Act (India), GDPR, and CCPA.',
    sections: [
      {
        heading: '1. Information We Collect',
        paragraphs: [
          'You can browse breaking news, category feeds, and explainers on iamquickagent.com without creating an account. We collect minimal technical and voluntary data strictly necessary to deliver fast, reliable journalism.',
        ],
        bullets: [
          'Voluntary Contact Data: Email address submitted if you opt in to the Morning Intelligence Brief newsletter or contact our newsroom editorial desk.',
          'Technical & Diagnostic Telemetry: Standard HTTP request metadata (device viewport, browser type, IP-derived region for local weather, and anonymized performance metrics) used to optimize page speed and prevent abuse.',
          'Local Browser Preferences: Non-sensitive client preferences stored in localStorage to cache recent headlines for instant offline-resilient page loads.',
        ],
      },
      {
        heading: '2. How We Use Information',
        paragraphs: [
          'We use collected information exclusively to operate and improve our newsroom publication:',
        ],
        bullets: [
          'Deliver real-time breaking news dispatches, regional weather updates, and search functionality.',
          'Send opted-in morning briefing emails with one-click unsubscribe support.',
          'Monitor security, prevent automated scraping abuse, and measure aggregate editorial readership.',
          'Comply with applicable legal obligations and editorial accountability standards.',
        ],
      },
      {
        heading: '3. Data Sharing & Third-Party Services',
        paragraphs: [
          'We do not sell personal reader data to third-party data brokers. Infrastructure partners—such as cloud hosting, content delivery networks, and database providers—process technical logs under strict confidentiality and security obligations.',
        ],
      },
      {
        heading: '4. Reader Rights & Data Deletion',
        paragraphs: [
          'You have the right to request access to, correction of, or deletion of any personal information you have voluntarily provided (such as newsletter email subscriptions). You may also withdraw consent or opt out of non-essential cookies at any time.',
        ],
      },
      {
        heading: '5. Contact the Privacy & Editorial Desk',
        paragraphs: [
          'For privacy inquiries, data deletion requests, or compliance notices, please contact our Editorial & Privacy Officer at SUKLA.NARAYAN007@gmail.com or review our Cookie Policy and Terms of Service.',
        ],
      },
    ],
  },

  'terms-of-service': {
    slug: 'terms-of-service',
    path: '/terms-of-service',
    title: 'Terms of Service',
    metaTitle: 'Terms of Service | iamquickagent.com',
    description:
      'Review the iamquickagent.com Terms of Service governing newsroom content usage, intellectual property, syndication feeds, AI citation rules, and disclaimers.',
    eyebrow: 'Legal & Compliance',
    lastUpdated: '2026-11-20',
    effectiveDate: 'March 1, 2024',
    intro:
      'By accessing or using https://www.iamquickagent.com, its RSS/XML syndication feeds, or its editorial dispatches, you agree to be bound by these Terms of Service and all applicable laws.',
    sections: [
      {
        heading: '1. Editorial Content & Intellectual Property',
        paragraphs: [
          'All original news dispatches, headlines, executive key takeaways, explainers, and multimedia layouts published on iamquickagent.com are protected by applicable copyright and intellectual property laws.',
          'Readers may share direct links to our canonical /news/ URLs and quote brief excerpts with clear attribution to iamquickagent.com. Automated bulk republication of full article bodies without written permission is prohibited.',
        ],
      },
      {
        heading: '2. Permitted Automated Crawling & AI Citation',
        paragraphs: [
          'Search engines and AI answer engines are permitted to index, summarize, and cite iamquickagent.com articles in accordance with our /robots.txt, /ai.txt, and /llms.txt directives, provided accurate attribution and a canonical link back to https://www.iamquickagent.com are preserved.',
        ],
      },
      {
        heading: '3. Accuracy, Corrections & Financial Disclaimer',
        paragraphs: [
          'While our newsroom verifies facts across primary sources and global news wires before publication, breaking news develops rapidly. Market, economic, and policy reporting on iamquickagent.com is provided strictly for informational and journalistic purposes and does not constitute financial, investment, medical, or legal advice.',
        ],
      },
      {
        heading: '4. External Links & Third-Party Sources',
        paragraphs: [
          'Our dispatches may reference primary government releases, official filings, and third-party news wires. iamquickagent.com is not responsible for the availability or content of external websites.',
        ],
      },
      {
        heading: '5. Modifications & Contact',
        paragraphs: [
          'We may update these Terms of Service periodically to reflect operational, legal, or regulatory developments. Continued use of the publication constitutes acceptance of the revised terms. Questions may be directed to SUKLA.NARAYAN007@gmail.com.',
        ],
      },
    ],
  },

  'cookie-policy': {
    slug: 'cookie-policy',
    path: '/cookie-policy',
    title: 'Cookie Policy',
    metaTitle: 'Cookie Policy | iamquickagent.com',
    description:
      'Learn how iamquickagent.com uses essential cookies, local browser storage, and analytics technologies to deliver fast breaking news and reader controls.',
    eyebrow: 'Legal & Compliance',
    lastUpdated: '2026-11-20',
    effectiveDate: 'March 1, 2024',
    intro:
      'This Cookie Policy explains how iamquickagent.com uses cookies, localStorage, and similar browser technologies when you read news dispatches on https://www.iamquickagent.com.',
    sections: [
      {
        heading: '1. What Are Cookies & Local Storage?',
        paragraphs: [
          'Cookies are small text files stored on your device by a web browser. Modern news web applications also use browser localStorage to cache lightweight editorial data so headlines render immediately without blocking mobile networks.',
        ],
      },
      {
        heading: '2. Categories of Technologies We Use',
        paragraphs: [
          'We minimize cookie usage to protect reader privacy and maximize Core Web Vitals performance:',
        ],
        bullets: [
          'Strictly Necessary & Performance Storage: Used for fast client-side caching of recent news headlines, weather city preference, and editorial CMS authentication sessions.',
          'Preference Storage: Remembers dismissed announcements, selected audio reading controls, and news desk filters.',
          'Aggregate Analytics & Security: Helps diagnose latency, measure article readership counts, and protect our infrastructure from automated denial-of-service traffic.',
        ],
      },
      {
        heading: '3. Managing Your Cookie Preferences',
        paragraphs: [
          'Most modern web browsers allow you to view, block, or delete cookies and local storage at any time via browser privacy settings. Disabling local storage will not prevent you from reading any news story on iamquickagent.com, though cached instant-load preferences may reset between visits.',
        ],
      },
      {
        heading: '4. Updates & Contact',
        paragraphs: [
          'Any material changes to our cookie practices will be reflected on this page with an updated revision date. Contact SUKLA.NARAYAN007@gmail.com for additional details.',
        ],
      },
    ],
  },

  'editorial-standards': {
    slug: 'editorial-standards',
    path: '/editorial-standards',
    title: 'Editorial Standards, Ethics & Corrections Policy',
    metaTitle: 'Editorial Standards & Corrections Policy | iamquickagent.com',
    description:
      'Explore the iamquickagent.com newsroom ethics policy, fact-checking methodology, source attribution standards, corrections protocol, and masthead.',
    eyebrow: 'Newsroom Trust & Accountability',
    lastUpdated: '2026-11-20',
    effectiveDate: 'March 1, 2024',
    intro:
      'iamquickagent.com operates under strict journalistic principles centered on factual accuracy, transparent source attribution, rapid corrections, and non-partisan editorial independence.',
    sections: [
      {
        heading: '1. Fact-Checking & Verification Methodology',
        paragraphs: [
          'Every breaking dispatch and explainer undergoes source verification prior to publication. We prioritize primary official records, regulatory filings, verbatim transcripts, and corroborated wire reporting. Each article includes an explicit Origin & Source Provenance block.',
        ],
      },
      {
        heading: '2. Newsroom Ethics & Independence',
        paragraphs: [
          'Our editorial coverage across India, World, Business, Markets, Technology, Science, and Politics is strictly separated from commercial sponsorships. Sponsored briefings are visibly labeled as advertisements or verified partners.',
        ],
      },
      {
        heading: '3. Corrections & Clarifications Policy',
        paragraphs: [
          'When factual errors are identified, our newsroom promptly updates the affected dispatch, records a revised timestamp (dateModified), and displays transparent status or retraction notices when warranted. Readers may flag factual corrections directly to SUKLA.NARAYAN007@gmail.com.',
        ],
      },
      {
        heading: '4. Masthead & Leadership',
        paragraphs: [
          'Founder & Editor-in-Chief: Narayan Shukla. Newsroom bureaus cover National Politics & Policy, Global Geopolitics, Technology & AI, Financial Markets, Science & Space, and Cultural Affairs.',
        ],
      },
    ],
  },
};

export const LEGAL_PAGE_LIST: LegalPageData[] = Object.values(LEGAL_PAGES);

export function getLegalPageByPath(pathname: string): LegalPageData | null {
  const clean = pathname.replace(/\/+$/, '').toLowerCase();
  if (clean === '/privacy-policy' || clean === '/privacy') return LEGAL_PAGES['privacy-policy'];
  if (clean === '/terms-of-service' || clean === '/terms') return LEGAL_PAGES['terms-of-service'];
  if (clean === '/cookie-policy' || clean === '/cookies') return LEGAL_PAGES['cookie-policy'];
  if (clean === '/editorial-standards' || clean === '/editorial') return LEGAL_PAGES['editorial-standards'];
  return null;
}
