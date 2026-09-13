import type { Article, Author, BannerAd, LiveStory, TrendingItem, OpinionPiece } from '../types';

export const SEED_AUTHORS: Author[] = [
  {
    id: 'author-faye-dsouza',
    name: "Faye D'Souza",
    role: 'Independent Journalist & Senior Editor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Renowned broadcast journalist advocating for unbiased news reporting, civic accountability, and consumer rights. Former executive editor of Mirror Now.',
    location: 'Mumbai, India',
    verified: true,
    twitter: '@fayedSouza',
    linkedin: 'fayedSouza',
    email: 'contact@iamnewsagent.com',
    joinedDate: '2024-06-15',
  },
  {
    id: 'author-raghav-bahl',
    name: 'Raghav Bahl',
    role: 'Founder & Economic Policy Commentator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Pioneering media entrepreneur, author, and investor analyzing India’s digital economy, technological leapfrogging, and artificial intelligence integration.',
    location: 'New Delhi, India',
    verified: true,
    twitter: '@raghav_bahl',
    linkedin: 'raghav-bahl',
    email: 'raghav@iamnewsagent.com',
    joinedDate: '2024-03-01',
  },
  {
    id: 'author-swati-chaturvedi',
    name: 'Swati Chaturvedi',
    role: 'Investigative Author & Political Columnist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Award-winning investigative reporter, London Foreign Press Association awardee, specializing in Indian governance, diplomatic shifts, and demographic trends.',
    location: 'New Delhi, India',
    verified: true,
    twitter: '@bainjal',
    linkedin: 'swati-chaturvedi',
    email: 'swati@iamnewsagent.com',
    joinedDate: '2024-05-12',
  },
  {
    id: 'author-nandan-nilekani',
    name: 'Nandan Nilekani',
    role: 'Tech Pioneer & Public Infrastructure Visionary',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Co-founder of Infosys, architect of Aadhaar and India Stack, championing open digital protocols for population-scale economic empowerment.',
    location: 'Bengaluru, India',
    verified: true,
    twitter: '@NandanNilekani',
    linkedin: 'nandannilekani',
    email: 'nandan@iamnewsagent.com',
    joinedDate: '2024-01-20',
  }
];

export const SEED_LIVE_STORIES: LiveStory[] = [
  {
    id: 'story-g20',
    title: 'G20 Summit',
    subtitle: 'New Delhi',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=300&q=80',
    isLive: true,
    category: 'India',
    articleSlug: 'india-space-ambitions-reach-new-heights',
    keyPoints: [
      'Leaders convene in New Delhi for the High-Level Trade & Climate plenary.',
      'Bilateral pact on critical mineral supply chains agreed upon by 14 member nations.',
      'Special session on ethical artificial intelligence governance underway.'
    ]
  },
  {
    id: 'story-durga-puja',
    title: 'Durga Puja',
    subtitle: 'Kolkata',
    image: 'https://images.unsplash.com/photo-1601055903647-87332213e2d6?auto=format&fit=crop&w=300&q=80',
    isLive: false,
    category: 'Culture',
    articleSlug: 'durga-puja-2025-tradition-culture-modern-kolkata',
    keyPoints: [
      'Over 3,000 public pandals unveil UNESCO-celebrated community art themes.',
      'Kolkata Metro announces round-the-clock festival trains to accommodate 10 million devotees.',
      'Artisans of Kumartuli complete eco-friendly clay idols with natural river silt.'
    ]
  },
  {
    id: 'story-iphone-17',
    title: 'iPhone 17',
    subtitle: 'Launch',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=300&q=80',
    isLive: false,
    category: 'Technology',
    articleSlug: 'ai-is-reshaping-how-we-work-are-we-ready',
    keyPoints: [
      'Next-generation 2nm silicon architecture with on-device generative intelligence neural core.',
      'Anti-reflective ultra-thin ceramic display with 120Hz across all models.',
      'Manufactured across newly expanded electronics facilities in Tamil Nadu and Karnataka.'
    ]
  },
  {
    id: 'story-isro',
    title: 'ISRO Mission',
    subtitle: 'Live',
    image: 'https://images.unsplash.com/photo-1517976487502-5f7140e4f3a9?auto=format&fit=crop&w=300&q=80',
    isLive: true,
    category: 'Science',
    articleSlug: 'india-space-ambitions-reach-new-heights',
    keyPoints: [
      'Heavy lift launch vehicle lifts off cleanly from Sriharikota launch pad.',
      'Cryogenic upper stage ignition confirmed nominal across all telemetry streams.',
      'Primary communications payload deployed into targeted geostationary transfer orbit.'
    ]
  },
  {
    id: 'story-monsoon',
    title: 'Monsoon Update',
    subtitle: 'India',
    image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=300&q=80',
    isLive: false,
    category: 'Weather',
    articleSlug: 'climate-change-2025-where-do-we-stand',
    keyPoints: [
      'Kharif crop reservoir levels reach 84% capacity across western and central basins.',
      'IMD issues green advisory as seasonal rainfall touches 103% of Long Period Average.',
      'River management alerts remain active for coastal Odisha and Andhra Pradesh.'
    ]
  },
  {
    id: 'story-asia-cup',
    title: 'Asia Cup',
    subtitle: 'Cricket',
    image: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=300&q=80',
    isLive: false,
    category: 'Sports',
    articleSlug: 'india-space-ambitions-reach-new-heights',
    keyPoints: [
      'High-voltage clash set for the super-four stage under lights.',
      'Top-order batsmen show peak form in net sessions with aggressive strike rates.',
      'Record viewership expected across digital streaming platforms.'
    ]
  },
  {
    id: 'story-market-watch',
    title: 'Market Watch',
    subtitle: 'Sensex',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=300&q=80',
    isLive: false,
    category: 'Markets',
    articleSlug: 'markets-rally-as-global-cues-turn-positive',
    keyPoints: [
      'Sensex surges over 800 points led by heavyweights in IT, banking, and capital goods.',
      'Foreign institutional investors record net purchases of ₹3,400 crore.',
      'Rupee strengthens against the US dollar amid easing global crude prices.'
    ]
  },
  {
    id: 'story-ai-today',
    title: 'AI Today',
    subtitle: 'Tech',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=300&q=80',
    isLive: false,
    category: 'Technology',
    articleSlug: 'ai-is-reshaping-how-we-work-are-we-ready',
    keyPoints: [
      'Multimodal models surpass human benchmarks in cross-lingual code translation.',
      'Enterprise adoption of autonomous agentic workflows grows by 140% year-on-year.',
      'Indian IT majors report 35% higher productivity in automated testing cycles.'
    ]
  },
  {
    id: 'story-fashion-week',
    title: 'Fashion Week',
    subtitle: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=300&q=80',
    isLive: false,
    category: 'Lifestyle',
    articleSlug: 'a-new-era-for-indian-cinema',
    keyPoints: [
      'Heritage handloom textiles from Varanasi and Kanchipuram take center stage.',
      'Circular fashion and low-water indigo dyeing processes headline the couture gala.',
      'Global buyers praise sustainable luxury craftsmanship from Indian design houses.'
    ]
  },
  {
    id: 'story-global-conflicts',
    title: 'Global Conflicts',
    subtitle: 'World',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=300&q=80',
    isLive: false,
    category: 'World',
    articleSlug: 'india-and-japan-deepen-strategic-ties',
    keyPoints: [
      'Diplomatic envoys table revised ceasefire framework in Geneva talks.',
      'Humanitarian maritime corridors maintained under neutral international flags.',
      'Global energy logistics adapt to alternative deep-water transit routes.'
    ]
  },
  {
    id: 'story-health-tips',
    title: 'Health Tips',
    subtitle: 'Wellness',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80',
    isLive: false,
    category: 'Health',
    articleSlug: 'climate-change-2025-where-do-we-stand',
    keyPoints: [
      'Circadian rhythm alignment shown to improve metabolic health and immune response.',
      'Preventive cardiology experts urge annual coronary calcium scoring above age 35.',
      'Traditional mindfulness practices validated by neuro-imaging research.'
    ]
  }
];

export const SEED_TRENDING_NOW: TrendingItem[] = [
  { id: 1, rank: 1, title: 'Chandrayaan-4 mission updates', category: 'Science', searchVolume: '320K searches', slug: 'india-space-ambitions-reach-new-heights' },
  { id: 2, rank: 2, title: 'India vs Bangladesh live score', category: 'Sports', searchVolume: '280K searches', slug: 'india-space-ambitions-reach-new-heights' },
  { id: 3, rank: 3, title: 'iPhone 17 launch highlights', category: 'Technology', searchVolume: '240K searches', slug: 'ai-is-reshaping-how-we-work-are-we-ready' },
  { id: 4, rank: 4, title: 'GST reform latest news', category: 'Business', searchVolume: '190K searches', slug: 'markets-rally-as-global-cues-turn-positive' },
  { id: 5, rank: 5, title: 'West Bengal Durga Puja preparations', category: 'Culture', searchVolume: '150K searches', slug: 'durga-puja-2025-tradition-culture-modern-kolkata' }
];

export const SEED_OPINIONS: OpinionPiece[] = [
  {
    id: 'op-1',
    authorName: 'Swati Chaturvedi',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: "Why India's Demographic Dividend Still Holds Promise",
    slug: 'india-growth-story-numbers-behind-momentum'
  },
  {
    id: 'op-2',
    authorName: 'Raghav Bahl',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: "AI Will Change Jobs. Here's How We Prepare.",
    slug: 'ai-is-reshaping-how-we-work-are-we-ready'
  },
  {
    id: 'op-3',
    authorName: "Faye D'Souza",
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    title: 'Independent Media Matters More Than Ever',
    slug: 'durga-puja-2025-tradition-culture-modern-kolkata'
  },
  {
    id: 'op-4',
    authorName: 'Nandan Nilekani',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    title: 'Digital Public Infrastructure Is India’s Superpower',
    slug: 'india-growth-story-numbers-behind-momentum'
  }
];

export const SEED_ARTICLES: Article[] = [
  {
    id: 'art-space-01',
    slug: 'india-space-ambitions-reach-new-heights',
    headline: "India's Space Ambitions Reach New Heights with Successful Launch",
    deck: "ISRO's latest mission marks a major step towards next-generation satellite technology and a stronger space ecosystem.",
    keyTakeaways: [
      'Heavy-lift vehicle successfully deployed advanced multi-band satellite into precise geostationary transfer orbit.',
      'Indigenous cryogenic upper stage performed flawlessly, proving domestic aerospace manufacturing maturity.',
      'Opens commercial launch slots for private satellite constellations across Indo-Pacific nations.',
      'Paves the operational runway for the upcoming Chandrayaan-4 lunar sample return and Gaganyaan crewed flights.'
    ],
    content: `In a landmark morning for the nation's aerospace trajectory, the Indian Space Research Organisation (ISRO) successfully executed the launch of its next-generation orbital launch vehicle from the Satish Dhawan Space Centre in Sriharikota.

The 44-meter tall rocket lifted off cleanly at 06:12 hours, lighting up the morning skies over the Bay of Bengal before achieving flawless payload separation 19 minutes into flight.

## Strategic Capabilities of the New Satellite Payload

The primary payload, designated GSAT-N3, is an advanced high-throughput communications satellite equipped with Ka-band spot beams designed to provide high-speed broadband connectivity across remote Himalayan regions, Andaman & Nicobar islands, and key maritime corridors.

1. **Indigenous Cryogenic Propulsion**: The CE-20 cryogenic engine demonstrated enhanced thrust margin, validating new alloys formulated at the Vikram Sarabhai Space Centre.
2. **Private Industrial Participation**: Over 65% of structural and electrical sub-assemblies were manufactured by Indian private aerospace consortia.
3. **Green Propulsion Thrusters**: The satellite incorporates non-toxic chemical monopropellant thrusters for orbit-raising maneuvers, reducing environmental hazards.

"This is not just another milestone; it is the cornerstone of India's self-reliant space architecture," stated the mission director during the post-launch press address. "Our scientific teams have demonstrated that cost-effective engineering and uncompromising reliability can walk hand in hand."

## Expanding Commercial Horizons

With global demand for small satellite constellations soaring, NewSpace India Limited (NSIL) announced that today's success unlocks commercial contracts exceeding $420 million with international satellite operators. Future launches scheduled for the upcoming quarter will carry secondary payloads from domestic space startups.`,
    category: 'India',
    tags: ['ISRO', 'Space Tech', 'Chandrayaan', 'Technology', 'Science'],
    authorId: 'author-nandan-nilekani',
    featuredImage: 'https://images.unsplash.com/photo-1517976487502-5f7140e4f3a9?auto=format&fit=crop&w=1200&q=85',
    imageCaption: 'The heavy-lift launch vehicle lifts off majestically from the launch pad in Sriharikota.',
    status: 'published',
    isBreaking: true,
    publishedAt: '2025-09-09T04:15:00.000Z',
    updatedAt: '2025-09-09T05:00:00.000Z',
    readTimeMinutes: 4,
    views: 42800,
    seoTitle: "India's Space Ambitions Reach New Heights with Successful Launch | Iamnewsagent",
    seoDescription: "ISRO's latest rocket launch marks a major milestone for indigenous space technology, commercial launches, and satellite infrastructure.",
    citations: [
      { label: 'ISRO Official Launch Telemetry Report', url: 'https://isro.gov.in', organization: 'ISRO Press Desk' }
    ]
  },
  {
    id: 'art-japan-02',
    slug: 'india-and-japan-deepen-strategic-ties',
    headline: 'India and Japan Deepen Strategic Ties with New Agreements',
    deck: 'Both nations to collaborate on clean energy, semiconductor supply chains, and high-speed transit infrastructure.',
    keyTakeaways: [
      'Prime Minister Modi and Prime Minister Kishida sign $18 billion joint bilateral infrastructure pact.',
      'Joint hydrogen and solar corridors established across western maritime ports.',
      'Semiconductor research consortium to exchange materials engineering talent between Tokyo and Bengaluru.'
    ],
    content: `High-level diplomatic delegations from New Delhi and Tokyo concluded wide-ranging bilateral summits today, resulting in comprehensive pacts designed to accelerate co-development across clean technology, advanced robotics, and semiconductor manufacturing.

The strategic partnership reflects growing convergence on Indo-Pacific maritime stability and supply chain diversification.`,
    category: 'World',
    tags: ['Japan', 'Diplomacy', 'Foreign Policy', 'Trade', 'Indo-Pacific'],
    authorId: 'author-swati-chaturvedi',
    featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Delegation leaders exchanging signed bilateral cooperation accords in New Delhi.',
    status: 'published',
    isBreaking: false,
    publishedAt: '2025-09-09T03:30:00.000Z',
    updatedAt: '2025-09-09T04:00:00.000Z',
    readTimeMinutes: 3,
    views: 18900,
  },
  {
    id: 'art-market-03',
    slug: 'markets-rally-as-global-cues-turn-positive',
    headline: 'Markets Rally as Global Cues Turn Positive',
    deck: 'Sensex gains 800 points amid strong foreign inflows, cooling inflation indicators, and banking sector strength.',
    keyTakeaways: [
      'BSE Sensex crosses record resistance level with broad-based market breadth.',
      'FII inflows total ₹3,400 crore in single trading session.',
      'Auto, IT, and metal indices lead sectoral gains with over 2% advances.'
    ],
    content: `Indian benchmark equity indices opened on a bullish note this Tuesday, with benchmark indices rallying over 800 points on the back of encouraging global macroeconomic data and persistent domestic retail liquidity.

Analysts attribute the upbeat market momentum to steady corporate earnings in banking heavyweights and softening US Treasury yields.`,
    category: 'Business',
    tags: ['Sensex', 'Stock Market', 'Economy', 'Nifty', 'Banking'],
    authorId: 'author-raghav-bahl',
    featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'The charging bull sculpture symbolizing renewed market buoyancy on Dalal Street.',
    status: 'published',
    isBreaking: false,
    publishedAt: '2025-09-09T02:45:00.000Z',
    updatedAt: '2025-09-09T03:15:00.000Z',
    readTimeMinutes: 3,
    views: 24500,
  },
  {
    id: 'art-ai-04',
    slug: 'ai-is-reshaping-how-we-work-are-we-ready',
    headline: 'AI Is Reshaping How We Work. Are We Ready?',
    deck: 'Experts weigh in on opportunities, risks, and the road ahead as enterprise autonomous workflows accelerate across industries.',
    keyTakeaways: [
      'Over 60% of knowledge workers report using generative AI tools weekly for code, synthesis, and customer workflows.',
      'New demand surges for AI ethics officers, prompt engineers, and algorithmic verification specialists.',
      'Call for continuous national upskilling programs to prevent structural workforce displacement.'
    ],
    content: `Artificial intelligence is moving beyond experimental pilot projects into core enterprise operating architecture. From automated diagnostic support in hospitals to algorithmic financial reconciliations, generative models are fundamentally transforming how organizations produce and verify work.

Industry leaders emphasize that proactive workforce reskilling is essential to capture productivity dividends while preserving worker agency.`,
    category: 'Technology',
    tags: ['Artificial Intelligence', 'Future of Work', 'Tech', 'Automation', 'Jobs'],
    authorId: 'author-raghav-bahl',
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Digital visualization of human-AI collaboration in high-performance enterprise teams.',
    status: 'published',
    isBreaking: false,
    publishedAt: '2025-09-09T01:30:00.000Z',
    updatedAt: '2025-09-09T02:00:00.000Z',
    readTimeMinutes: 5,
    views: 38200,
  },
  {
    id: 'art-cinema-05',
    slug: 'a-new-era-for-indian-cinema',
    headline: 'A New Era for Indian Cinema',
    deck: 'With powerful storytelling and global reach, Indian films are winning new audiences worldwide.',
    keyTakeaways: [
      'Pan-Indian productions command record box office shares in North America, Japan, and Western Europe.',
      'Regional cinema from Malayalam, Telugu, and Tamil industries receives critical international festival acclaim.',
      'Direct streaming distribution bridges linguistic divides across tier-2 and tier-3 domestic markets.'
    ],
    content: `Indian cinema has entered an unprecedented creative and commercial renaissance. By fusing authentic grassroots narratives with world-class production craft, regional creators are transcending traditional borders and connecting with international audiences.`,
    category: 'Entertainment',
    tags: ['Cinema', 'Bollywood', 'Movies', 'Culture', 'OTT'],
    authorId: 'author-faye-dsouza',
    featuredImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Celebrated actors and directors gracing international cinema premiers.',
    status: 'published',
    isBreaking: false,
    publishedAt: '2025-09-08T22:15:00.000Z',
    updatedAt: '2025-09-09T00:30:00.000Z',
    readTimeMinutes: 4,
    views: 19800,
  },
  {
    id: 'art-durga-06',
    slug: 'durga-puja-2025-tradition-culture-modern-kolkata',
    headline: 'Durga Puja 2025: Tradition, Culture and a Modern Kolkata',
    deck: 'A deep dive into the festival that unites faith, art, and community across the City of Joy.',
    keyTakeaways: [
      'UNESCO Intangible Cultural Heritage recognition draws record international visitors to Kolkata.',
      'Pandals showcase stunning blend of centuries-old terracotta heritage and contemporary eco-architecture.',
      'Festival economy generates over ₹40,000 crore in cultural commerce, supporting thousands of artisans.'
    ],
    content: `Kolkata during Durga Puja is transformed into the world's largest open-air art installation. Beyond religious rituals, the five-day carnival represents an extraordinary democratization of artistic expression, where every neighborhood street becomes a canvas for public storytelling and shared celebration.`,
    category: 'Explainers',
    tags: ['Durga Puja', 'Kolkata', 'Culture', 'Heritage', 'Festival'],
    authorId: 'author-swati-chaturvedi',
    featuredImage: 'https://images.unsplash.com/photo-1601055903647-87332213e2d6?auto=format&fit=crop&w=1200&q=85',
    imageCaption: 'The iconic idol of Goddess Durga illuminated in a masterfully crafted Kolkata pandal.',
    status: 'published',
    isBreaking: false,
    isExplainer: true,
    publishedAt: '2025-09-09T03:00:00.000Z',
    updatedAt: '2025-09-09T04:15:00.000Z',
    readTimeMinutes: 6,
    views: 45200,
  },
  {
    id: 'art-climate-07',
    slug: 'climate-change-2025-where-do-we-stand',
    headline: 'Climate Change 2025: Where Do We Stand?',
    deck: 'Key facts, latest reports, and what it means for the future of our planet and energy transition.',
    keyTakeaways: [
      'Global renewable installations surpass 500 GW annual benchmark for the first time in history.',
      'Extreme weather forecasting precision improves by 40% using coupled AI climate models.',
      'Global south champions accelerated adaptation funding ahead of upcoming COP deliberations.'
    ],
    content: `An in-depth explainer evaluating global carbon emissions, oceanic temperature anomalies, and the rapidly accelerating deployment of grid-scale clean energy technologies across major economies.`,
    category: 'Explainers',
    tags: ['Climate Change', 'Environment', 'Renewables', 'Science', 'Explainers'],
    authorId: 'author-nandan-nilekani',
    featuredImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Contrasting landscapes illustrating ecological balance and climate urgency.',
    status: 'published',
    isBreaking: false,
    isExplainer: true,
    publishedAt: '2025-09-08T18:00:00.000Z',
    updatedAt: '2025-09-08T20:00:00.000Z',
    readTimeMinutes: 5,
    views: 29400,
  },
  {
    id: 'art-growth-08',
    slug: 'india-growth-story-numbers-behind-momentum',
    headline: "India's Growth Story: Numbers Behind the Momentum",
    deck: 'Jobs, infrastructure, innovation — how India is shaping its next decade as the world’s fastest growing major economy.',
    keyTakeaways: [
      'National highway construction reaches 34 kilometers per day milestone.',
      'Unified Payments Interface (UPI) handles over 15 billion transactions monthly with 99.99% uptime.',
      'Manufacturing sector contribution rises to 18% of GDP led by electronics and defense exports.'
    ],
    content: `A data-driven breakdown of India's demographic advantages, logistics corridors, and capital expenditure cycle driving long-term economic expansion.`,
    category: 'Explainers',
    tags: ['Economy', 'India', 'GDP', 'Infrastructure', 'Development'],
    authorId: 'author-raghav-bahl',
    featuredImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Digital data points illuminating India’s economic and industrial progress.',
    status: 'published',
    isBreaking: false,
    isExplainer: true,
    publishedAt: '2025-09-08T16:30:00.000Z',
    updatedAt: '2025-09-08T19:00:00.000Z',
    readTimeMinutes: 5,
    views: 33100,
  }
];

export const SEED_ADS: BannerAd[] = [
  {
    id: 'ad-leaderboard-01',
    format: 'leaderboard',
    label: 'SPONSORED BRIEFING',
    title: 'NEXUS QUANTUM CLOUD: Fault-Tolerant Cryptographic Audits',
    description: 'Benchmark your enterprise cybersecurity resilience before the 2026 post-quantum compliance mandate.',
    ctaText: 'Access Audit Suite',
    ctaUrl: 'https://iamnewsagent.com/sponsor/nexus-quantum',
    sponsor: 'Nexus Quantum Systems',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ad-mpu-01',
    format: 'mpu',
    label: 'INTELLIGENCE PARTNER',
    title: 'GLOBAL SENTINEL TERMINAL',
    description: 'Instant multi-spectrum satellite feeds & supply chain risk alerts on your desktop.',
    ctaText: 'Request Trial Desk',
    ctaUrl: 'https://iamnewsagent.com/sponsor/global-sentinel',
    sponsor: 'Sentinel Orbital Intelligence',
  },
  {
    id: 'ad-native-01',
    format: 'native-inline',
    label: 'EXECUTIVE INTELLIGENCE SPONSOR',
    title: 'The Sovereign AI Infrastructure Outlook (2025–2030)',
    description: 'Global compute allocations, power grid bottlenecks, and geopolitical silicon reserve strategies.',
    ctaText: 'Download Strategy Brief [PDF]',
    ctaUrl: 'https://iamnewsagent.com/sponsor/sovereign-ai-report',
    sponsor: 'Aethelgard Strategic Advisory'
  }
];
