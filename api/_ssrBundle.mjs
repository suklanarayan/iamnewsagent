// Auto-generated self-contained Node ESM bundle for Vercel /api/ssr and /api/seo (prefixed with _ so Vercel does not deploy it as a standalone route)


// src/server/vercelEntry.ts
import fs2 from "fs";
import path2 from "path";

// src/data/legalPages.ts
var LEGAL_PAGES = {
  "privacy-policy": {
    slug: "privacy-policy",
    path: "/privacy-policy",
    title: "Privacy Policy",
    metaTitle: "Privacy Policy | iamquickagent.com",
    description: "Read the iamquickagent.com Privacy Policy detailing how we collect, protect, and manage reader data, analytics, cookies, and newsletter subscriptions.",
    eyebrow: "Legal & Compliance",
    lastUpdated: "2026-11-20",
    effectiveDate: "March 1, 2024",
    intro: 'iamquickagent.com ("we", "our", or "the Publication") is committed to protecting reader privacy and handling personal data transparently in accordance with global data protection standards including the Digital Personal Data Protection Act (India), GDPR, and CCPA.',
    sections: [
      {
        heading: "1. Information We Collect",
        paragraphs: [
          "You can browse breaking news, category feeds, and explainers on iamquickagent.com without creating an account. We collect minimal technical and voluntary data strictly necessary to deliver fast, reliable journalism."
        ],
        bullets: [
          "Voluntary Contact Data: Email address submitted if you opt in to the Morning Intelligence Brief newsletter or contact our newsroom editorial desk.",
          "Technical & Diagnostic Telemetry: Standard HTTP request metadata (device viewport, browser type, IP-derived region for local weather, and anonymized performance metrics) used to optimize page speed and prevent abuse.",
          "Local Browser Preferences: Non-sensitive client preferences stored in localStorage to cache recent headlines for instant offline-resilient page loads."
        ]
      },
      {
        heading: "2. How We Use Information",
        paragraphs: [
          "We use collected information exclusively to operate and improve our newsroom publication:"
        ],
        bullets: [
          "Deliver real-time breaking news dispatches, regional weather updates, and search functionality.",
          "Send opted-in morning briefing emails with one-click unsubscribe support.",
          "Monitor security, prevent automated scraping abuse, and measure aggregate editorial readership.",
          "Comply with applicable legal obligations and editorial accountability standards."
        ]
      },
      {
        heading: "3. Data Sharing & Third-Party Services",
        paragraphs: [
          "We do not sell personal reader data to third-party data brokers. Infrastructure partners\u2014such as cloud hosting, content delivery networks, and database providers\u2014process technical logs under strict confidentiality and security obligations."
        ]
      },
      {
        heading: "4. Reader Rights & Data Deletion",
        paragraphs: [
          "You have the right to request access to, correction of, or deletion of any personal information you have voluntarily provided (such as newsletter email subscriptions). You may also withdraw consent or opt out of non-essential cookies at any time."
        ]
      },
      {
        heading: "5. Contact the Privacy & Editorial Desk",
        paragraphs: [
          "For privacy inquiries, data deletion requests, or compliance notices, please contact our Editorial & Privacy Officer at SUKLA.NARAYAN007@gmail.com or review our Cookie Policy and Terms of Service."
        ]
      }
    ]
  },
  "terms-of-service": {
    slug: "terms-of-service",
    path: "/terms-of-service",
    title: "Terms of Service",
    metaTitle: "Terms of Service | iamquickagent.com",
    description: "Review the iamquickagent.com Terms of Service governing newsroom content usage, intellectual property, syndication feeds, AI citation rules, and disclaimers.",
    eyebrow: "Legal & Compliance",
    lastUpdated: "2026-11-20",
    effectiveDate: "March 1, 2024",
    intro: "By accessing or using https://www.iamquickagent.com, its RSS/XML syndication feeds, or its editorial dispatches, you agree to be bound by these Terms of Service and all applicable laws.",
    sections: [
      {
        heading: "1. Editorial Content & Intellectual Property",
        paragraphs: [
          "All original news dispatches, headlines, executive key takeaways, explainers, and multimedia layouts published on iamquickagent.com are protected by applicable copyright and intellectual property laws.",
          "Readers may share direct links to our canonical /news/ URLs and quote brief excerpts with clear attribution to iamquickagent.com. Automated bulk republication of full article bodies without written permission is prohibited."
        ]
      },
      {
        heading: "2. Permitted Automated Crawling & AI Citation",
        paragraphs: [
          "Search engines and AI answer engines are permitted to index, summarize, and cite iamquickagent.com articles in accordance with our /robots.txt, /ai.txt, and /llms.txt directives, provided accurate attribution and a canonical link back to https://www.iamquickagent.com are preserved."
        ]
      },
      {
        heading: "3. Accuracy, Corrections & Financial Disclaimer",
        paragraphs: [
          "While our newsroom verifies facts across primary sources and global news wires before publication, breaking news develops rapidly. Market, economic, and policy reporting on iamquickagent.com is provided strictly for informational and journalistic purposes and does not constitute financial, investment, medical, or legal advice."
        ]
      },
      {
        heading: "4. External Links & Third-Party Sources",
        paragraphs: [
          "Our dispatches may reference primary government releases, official filings, and third-party news wires. iamquickagent.com is not responsible for the availability or content of external websites."
        ]
      },
      {
        heading: "5. Modifications & Contact",
        paragraphs: [
          "We may update these Terms of Service periodically to reflect operational, legal, or regulatory developments. Continued use of the publication constitutes acceptance of the revised terms. Questions may be directed to SUKLA.NARAYAN007@gmail.com."
        ]
      }
    ]
  },
  "cookie-policy": {
    slug: "cookie-policy",
    path: "/cookie-policy",
    title: "Cookie Policy",
    metaTitle: "Cookie Policy | iamquickagent.com",
    description: "Learn how iamquickagent.com uses essential cookies, local browser storage, and analytics technologies to deliver fast breaking news and reader controls.",
    eyebrow: "Legal & Compliance",
    lastUpdated: "2026-11-20",
    effectiveDate: "March 1, 2024",
    intro: "This Cookie Policy explains how iamquickagent.com uses cookies, localStorage, and similar browser technologies when you read news dispatches on https://www.iamquickagent.com.",
    sections: [
      {
        heading: "1. What Are Cookies & Local Storage?",
        paragraphs: [
          "Cookies are small text files stored on your device by a web browser. Modern news web applications also use browser localStorage to cache lightweight editorial data so headlines render immediately without blocking mobile networks."
        ]
      },
      {
        heading: "2. Categories of Technologies We Use",
        paragraphs: [
          "We minimize cookie usage to protect reader privacy and maximize Core Web Vitals performance:"
        ],
        bullets: [
          "Strictly Necessary & Performance Storage: Used for fast client-side caching of recent news headlines, weather city preference, and editorial CMS authentication sessions.",
          "Preference Storage: Remembers dismissed announcements, selected audio reading controls, and news desk filters.",
          "Aggregate Analytics & Security: Helps diagnose latency, measure article readership counts, and protect our infrastructure from automated denial-of-service traffic."
        ]
      },
      {
        heading: "3. Managing Your Cookie Preferences",
        paragraphs: [
          "Most modern web browsers allow you to view, block, or delete cookies and local storage at any time via browser privacy settings. Disabling local storage will not prevent you from reading any news story on iamquickagent.com, though cached instant-load preferences may reset between visits."
        ]
      },
      {
        heading: "4. Updates & Contact",
        paragraphs: [
          "Any material changes to our cookie practices will be reflected on this page with an updated revision date. Contact SUKLA.NARAYAN007@gmail.com for additional details."
        ]
      }
    ]
  },
  "editorial-standards": {
    slug: "editorial-standards",
    path: "/editorial-standards",
    title: "Editorial Standards, Ethics & Corrections Policy",
    metaTitle: "Editorial Standards & Corrections Policy | iamquickagent.com",
    description: "Explore the iamquickagent.com newsroom ethics policy, fact-checking methodology, source attribution standards, corrections protocol, and masthead.",
    eyebrow: "Newsroom Trust & Accountability",
    lastUpdated: "2026-11-20",
    effectiveDate: "March 1, 2024",
    intro: "iamquickagent.com operates under strict journalistic principles centered on factual accuracy, transparent source attribution, rapid corrections, and non-partisan editorial independence.",
    sections: [
      {
        heading: "1. Fact-Checking & Verification Methodology",
        paragraphs: [
          "Every breaking dispatch and explainer undergoes source verification prior to publication. We prioritize primary official records, regulatory filings, verbatim transcripts, and corroborated wire reporting. Each article includes an explicit Origin & Source Provenance block."
        ]
      },
      {
        heading: "2. Newsroom Ethics & Independence",
        paragraphs: [
          "Our editorial coverage across India, World, Business, Markets, Technology, Science, and Politics is strictly separated from commercial sponsorships. Sponsored briefings are visibly labeled as advertisements or verified partners."
        ]
      },
      {
        heading: "3. Corrections & Clarifications Policy",
        paragraphs: [
          "When factual errors are identified, our newsroom promptly updates the affected dispatch, records a revised timestamp (dateModified), and displays transparent status or retraction notices when warranted. Readers may flag factual corrections directly to SUKLA.NARAYAN007@gmail.com."
        ]
      },
      {
        heading: "4. Masthead & Leadership",
        paragraphs: [
          "Founder & Editor-in-Chief: Narayan Shukla. Newsroom bureaus cover National Politics & Policy, Global Geopolitics, Technology & AI, Financial Markets, Science & Space, and Cultural Affairs."
        ]
      }
    ]
  }
};
var LEGAL_PAGE_LIST = Object.values(LEGAL_PAGES);
function getLegalPageByPath(pathname) {
  const clean = pathname.replace(/\/+$/, "").toLowerCase();
  if (clean === "/privacy-policy" || clean === "/privacy") return LEGAL_PAGES["privacy-policy"];
  if (clean === "/terms-of-service" || clean === "/terms") return LEGAL_PAGES["terms-of-service"];
  if (clean === "/cookie-policy" || clean === "/cookies") return LEGAL_PAGES["cookie-policy"];
  if (clean === "/editorial-standards" || clean === "/editorial") return LEGAL_PAGES["editorial-standards"];
  return null;
}

// src/server/ssrEngine.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// src/data/seedData.ts
var SEED_AUTHORS = [
  {
    id: "author-narayan-shukla",
    name: "Narayan Shukla",
    role: "Digital Marketing Consultant (11 Yrs Exp) & Geopolitical Analyst",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    bio: "Digital Marketing Consultant with 11+ years of experience analyzing search engine intelligence, global geopolitics, digital public infrastructure, and AI-driven market trends across India and international economies.",
    location: "India",
    verified: true,
    twitter: "@narayan_shukla",
    linkedin: "narayan-shukla",
    email: "SUKLA.NARAYAN007@gmail.com",
    joinedDate: "2026-09-14"
  },
  {
    id: "author-faye-dsouza",
    name: "Faye D'Souza",
    role: "Independent Journalist & Senior Editor",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    bio: "Renowned broadcast journalist advocating for unbiased news reporting, civic accountability, and consumer rights. Former executive editor of Mirror Now.",
    location: "Mumbai, India",
    verified: true,
    twitter: "@fayedSouza",
    linkedin: "fayedSouza",
    email: "contact@iamnewsagent.com",
    joinedDate: "2024-06-15"
  },
  {
    id: "author-raghav-bahl",
    name: "Raghav Bahl",
    role: "Founder & Economic Policy Commentator",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    bio: "Pioneering media entrepreneur, author, and investor analyzing India\u2019s digital economy, technological leapfrogging, and artificial intelligence integration.",
    location: "New Delhi, India",
    verified: true,
    twitter: "@raghav_bahl",
    linkedin: "raghav-bahl",
    email: "raghav@iamnewsagent.com",
    joinedDate: "2024-03-01"
  },
  {
    id: "author-swati-chaturvedi",
    name: "Swati Chaturvedi",
    role: "Investigative Author & Political Columnist",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    bio: "Award-winning investigative reporter, London Foreign Press Association awardee, specializing in Indian governance, diplomatic shifts, and demographic trends.",
    location: "New Delhi, India",
    verified: true,
    twitter: "@bainjal",
    linkedin: "swati-chaturvedi",
    email: "swati@iamnewsagent.com",
    joinedDate: "2024-05-12"
  },
  {
    id: "author-nandan-nilekani",
    name: "Nandan Nilekani",
    role: "Tech Pioneer & Public Infrastructure Visionary",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    bio: "Co-founder of Infosys, architect of Aadhaar and India Stack, championing open digital protocols for population-scale economic empowerment.",
    location: "Bengaluru, India",
    verified: true,
    twitter: "@NandanNilekani",
    linkedin: "nandannilekani",
    email: "nandan@iamnewsagent.com",
    joinedDate: "2024-01-20"
  }
];
var SEED_ARTICLES = [
  {
    id: "art-brics-2026-summit",
    slug: "from-voice-to-impact-18th-brics-summit-india-global-role",
    headline: "From Voice to Impact: What the 18th BRICS Summit Actually Signals About India's Global Role",
    deck: "Bharat Mandapam, New Delhi. September 12\u201313, 2026. Eleven nations, one declaration, and a Prime Minister openly asking to rewrite the rules of the table rather than just get a seat at it.",
    keyTakeaways: [
      "Unanimous New Delhi Declaration 2026: 11-member expanded bloc successfully adopted a consensus declaration despite sharp internal geopolitical divisions over West Asia and Ukraine.",
      "Modi\u2019s BRICS Reform Roadmap: Proposed 10 formal global governance proposals anchored on Representation, Responsiveness, and Rule-making.",
      "UNSC Restructuring: Permanent members China and Russia formally reiterated backing for India and Brazil\u2019s permanent seat aspirations, declaring UN Security Council reform can no longer be delayed.",
      "From Pyramid of Privilege to Platform of Partnership: India steered the bloc toward elevating the Global South from the back row to the front row of international decision-making.",
      "Economic & Tech Core: Concrete progress on BRICS Economic Partnership 2030, local currency trade settlements, ethical AI collaboration, and pragmatic energy transitions."
    ],
    content: `## The Setting

India just wrapped its fourth BRICS Chairship \u2014 2012, 2016, 2021, and now 2026 \u2014 hosting the 18th BRICS Summit at Bharat Mandapam under the theme "Building for Resilience, Innovation, Cooperation and Sustainability." This wasn't a small gathering. Across the year, India ran over 350 BRICS-related meetings and high-level engagements in more than 25 cities before the leaders even arrived in Delhi.

BRICS itself isn't the group most people still picture. What started as Brazil, Russia, India, China, and South Africa is now an 11-member bloc: Egypt, Ethiopia, Iran, Indonesia, and the UAE have all joined in the last two years. That expansion matters more than it sounds \u2014 it means BRICS today spans a genuinely cross-continental mix of Latin America, Africa, the Middle East, and Asia, all sitting at the same table as China and Russia.

The summit closed with the unanimous adoption of the **New Delhi Declaration 2026** \u2014 no small feat, given it happened amid sharp internal divisions over West Asia and Ukraine.

## What Modi Actually Asked For

The headline from India's presidency wasn't a photo-op line \u2014 it was a structural pitch. PM Modi proposed that BRICS members jointly draft ten proposals for global governance reform, aiming to develop them into a formal **BRICS Reform Roadmap** by the next summit, built around three pillars: **Representation, Responsiveness, and Rule-making.**

On representation, Modi's position was direct: UN Security Council reform "can no longer be delayed," and voting power and leadership positions in global financial institutions need to reflect current economic realities, not decades-old ones. His framing was blunt \u2014 "countries that drive global economic growth should also have an appropriate role in shaping global economic governance."

Notably, China and Russia \u2014 both permanent UNSC members \u2014 reiterated support for India's and Brazil's aspirations to a greater UN role, including on the Security Council itself. That's a meaningful signal inside a bloc that doesn't always agree on much.

The line that probably captures India's pitch best: Modi described the current global order as a "pyramid of privilege" that needs to become a "platform of partnership" \u2014 with the Global South moving from the back row of decision-making to the front row, even though it's already in the front row when it comes to absorbing global crises.

## The Global South and Asia Angle

This summit fell, deliberately, on the UN Day for South-South Cooperation \u2014 and India leaned into that. Modi framed India as ready to "take the lead" on shaping how the Global South organizes its collective voice, positioning BRICS as the primary vehicle for that ambition rather than any single country's project.

For Asia specifically, India's role is a balancing act worth noting: it sits in the same bloc as China, its most complicated regional relationship, while also anchoring the bloc's outreach to Africa (via Egypt, Ethiopia, South Africa), the Middle East (UAE, Saudi Arabia, Iran), and Southeast Asia (Indonesia). Analysts covering the summit have pointed out that BRICS's expansion gives Africa in particular a wider field of economic relationships with some of the world's largest emerging markets \u2014 and India's chairship this year was largely about proving the bloc could hold that diversity together without fracturing.

## The Growth and Cooperation Substance

Beyond the diplomacy, the declaration had real economic and technological content:

- **BRICS Economic Partnership 2030** \u2014 leaders welcomed continued progress on this framework, alongside practical work on cross-border payment interoperability and trade settlement in local currencies, reducing dependence on any single reserve currency for intra-BRICS trade.
- **AI and digital transformation** were explicitly named as future growth drivers, with leaders backing cooperation on safe, secure, and inclusive AI, alongside expanded connectivity and cybersecurity collaboration \u2014 a natural continuation of the AI-focused summit India hosted earlier in the year.
- **Climate pragmatism over climate purity** \u2014 the declaration acknowledged that fossil fuels will continue playing a transitional role for emerging and developing economies even as members scale up renewable and green-tech collaboration, a notably realist stance compared to some Western-bloc climate language.
- **Security cooperation** \u2014 leaders condemned terrorism "in all its forms," explicitly referencing the April 2025 Jammu and Kashmir attack, and called for accountability mechanisms and support for a UN-level comprehensive terrorism convention.
- On the bilateral side, India and Brazil signed a fresh telecom and ICT cooperation memorandum on the summit's sidelines \u2014 a small but concrete example of BRICS relationships translating into actual agreements, not just joint statements.

## Why This Matters Beyond the Headlines

Summits like this get covered as photo-ops and traffic advisories (and Delhi did shut down a lot of roads for it). But the substance underneath is a genuine repositioning question: can a deliberately heterogeneous bloc \u2014 authoritarian and democratic, oil economies and manufacturing economies, old rivals and new partners \u2014 actually function as a coherent voice for the Global South, or does it stay a talking shop?

India's bet, visible in everything from the Reform Roadmap proposal to the AI cooperation language, is that it can \u2014 and that Bharat's job, as the bloc's most experienced chair, is to keep proving it works in practice rather than just in declarations. Whether the "platform of partnership" framing becomes real institutional change or stays aspirational language is the thing worth watching between now and the next summit.

---

*Sources: PIB, Business Standard, Organiser, Asianet Newsable, Sarkaritel, ICTFrame, Countercurrents \u2014 reporting on the 18th BRICS Summit, September 12\u201313, 2026.*`,
    category: "World",
    tags: ["BRICS 2026", "India", "Global South", "Geopolitics", "PM Modi", "Foreign Policy", "UNSC", "Economy", "AI Governance"],
    authorId: "author-narayan-shukla",
    featuredImage: "/brics-2026-summit.svg",
    imageCaption: "18th BRICS Summit 2026 at Bharat Mandapam, New Delhi: India anchors the expanded 11-member bloc and champions Global South governance reform.",
    status: "published",
    articleType: "opinion",
    sourceType: "reference",
    sourceName: "Search Engine & AI Intelligence Reference (Curated by Narayan Shukla)",
    sourceUrl: "https://www.pib.gov.in",
    isBreaking: true,
    publishedAt: "2026-09-14T08:30:00.000Z",
    updatedAt: "2026-09-14T11:40:00.000Z",
    readTimeMinutes: 5,
    views: 2450,
    seoTitle: "18th BRICS Summit 2026: India's Global Role & New Delhi Declaration Analysis",
    seoDescription: "An in-depth analysis by Narayan Shukla on what the 18th BRICS Summit at Bharat Mandapam signals about India's leadership, Global South diplomacy, and UN governance reform.",
    citations: [
      {
        label: "Press Information Bureau (PIB) - Official 18th BRICS Summit Proceedings",
        url: "https://www.pib.gov.in",
        organization: "PIB Government of India"
      },
      {
        label: "Business Standard - New Delhi Declaration 2026 & Economic Partnership",
        url: "https://www.business-standard.com",
        organization: "Business Standard"
      },
      {
        label: "Organiser - India Chairship & Global South Plenary Insights",
        url: "https://organiser.org",
        organization: "Organiser"
      },
      {
        label: "Asianet Newsable - BRICS 2026 Leader Declaration & UNSC Reform",
        url: "https://newsable.asianetnews.com",
        organization: "Asianet Newsable"
      },
      {
        label: "Sarkaritel & ICTFrame - Bilateral ICT and Digital Infrastructure Agreements",
        url: "https://sarkaritel.com",
        organization: "Sarkaritel"
      }
    ],
    faq: [
      {
        question: "Where was the 18th BRICS Summit held and what was its theme?",
        answer: 'The 18th BRICS Summit was held at Bharat Mandapam in New Delhi on September 12\u201313, 2026, under the theme "Building for Resilience, Innovation, Cooperation and Sustainability."'
      },
      {
        question: "Who are the members of the expanded BRICS bloc in 2026?",
        answer: "The 11-member bloc comprises founding nations Brazil, Russia, India, China, and South Africa, alongside newer members Egypt, Ethiopia, Iran, Indonesia, and the United Arab Emirates (UAE)."
      },
      {
        question: "What are the three pillars of Prime Minister Modi\u2019s proposed BRICS Reform Roadmap?",
        answer: "PM Modi proposed ten joint reform measures anchored on Representation, Responsiveness, and Rule-making to modernize global financial institutions and restructure the UN Security Council."
      }
    ]
  },
  {
    id: "art-space-01",
    slug: "india-space-ambitions-reach-new-heights",
    headline: "India's Space Ambitions Reach New Heights with Successful Launch",
    deck: "ISRO's latest mission marks a major step towards next-generation satellite technology and a stronger space ecosystem.",
    keyTakeaways: [
      "Heavy-lift vehicle successfully deployed advanced multi-band satellite into precise geostationary transfer orbit.",
      "Indigenous cryogenic upper stage performed flawlessly, proving domestic aerospace manufacturing maturity.",
      "Opens commercial launch slots for private satellite constellations across Indo-Pacific nations.",
      "Paves the operational runway for the upcoming Chandrayaan-4 lunar sample return and Gaganyaan crewed flights."
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
    category: "India",
    tags: ["ISRO", "Space Tech", "Chandrayaan", "Technology", "Science"],
    authorId: "author-nandan-nilekani",
    featuredImage: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=85",
    imageCaption: "The heavy-lift launch vehicle lifts off majestically from the launch pad in Sriharikota.",
    status: "published",
    isBreaking: true,
    publishedAt: "2026-09-20T04:15:00.000Z",
    updatedAt: "2026-09-20T05:00:00.000Z",
    readTimeMinutes: 4,
    views: 42800,
    seoTitle: "India's Space Ambitions Reach New Heights with Successful Launch | Iamnewsagent",
    seoDescription: "ISRO's latest rocket launch marks a major milestone for indigenous space technology, commercial launches, and satellite infrastructure.",
    citations: [
      { label: "ISRO Official Launch Telemetry Report", url: "https://isro.gov.in", organization: "ISRO Press Desk" }
    ]
  },
  {
    id: "art-japan-02",
    slug: "india-and-japan-deepen-strategic-ties",
    headline: "India and Japan Deepen Strategic Ties with New Agreements",
    deck: "Both nations to collaborate on clean energy, semiconductor supply chains, and high-speed transit infrastructure.",
    keyTakeaways: [
      "Prime Minister Modi and Prime Minister Kishida sign $18 billion joint bilateral infrastructure pact.",
      "Joint hydrogen and solar corridors established across western maritime ports.",
      "Semiconductor research consortium to exchange materials engineering talent between Tokyo and Bengaluru."
    ],
    content: `High-level diplomatic delegations from New Delhi and Tokyo concluded wide-ranging bilateral summits today, resulting in comprehensive pacts designed to accelerate co-development across clean technology, advanced robotics, and semiconductor manufacturing.

The strategic partnership reflects growing convergence on Indo-Pacific maritime stability and supply chain diversification.`,
    category: "World",
    tags: ["Japan", "Diplomacy", "Foreign Policy", "Trade", "Indo-Pacific"],
    authorId: "author-swati-chaturvedi",
    featuredImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    imageCaption: "Delegation leaders exchanging signed bilateral cooperation accords in New Delhi.",
    status: "published",
    isBreaking: false,
    publishedAt: "2026-09-20T03:30:00.000Z",
    updatedAt: "2026-09-20T04:00:00.000Z",
    readTimeMinutes: 3,
    views: 18900
  },
  {
    id: "art-market-03",
    slug: "markets-rally-as-global-cues-turn-positive",
    headline: "Markets Rally as Global Cues Turn Positive",
    deck: "Sensex gains 800 points amid strong foreign inflows, cooling inflation indicators, and banking sector strength.",
    keyTakeaways: [
      "BSE Sensex crosses record resistance level with broad-based market breadth.",
      "FII inflows total \u20B93,400 crore in single trading session.",
      "Auto, IT, and metal indices lead sectoral gains with over 2% advances."
    ],
    content: `Indian benchmark equity indices opened on a bullish note this Tuesday, with benchmark indices rallying over 800 points on the back of encouraging global macroeconomic data and persistent domestic retail liquidity.

Analysts attribute the upbeat market momentum to steady corporate earnings in banking heavyweights and softening US Treasury yields.`,
    category: "Business",
    tags: ["Sensex", "Stock Market", "Economy", "Nifty", "Banking"],
    authorId: "author-raghav-bahl",
    featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    imageCaption: "The charging bull sculpture symbolizing renewed market buoyancy on Dalal Street.",
    status: "published",
    isBreaking: false,
    publishedAt: "2026-09-20T02:45:00.000Z",
    updatedAt: "2026-09-20T03:15:00.000Z",
    readTimeMinutes: 3,
    views: 24500
  },
  {
    id: "art-ai-04",
    slug: "ai-is-reshaping-how-we-work-are-we-ready",
    headline: "AI Is Reshaping How We Work. Are We Ready?",
    deck: "Experts weigh in on opportunities, risks, and the road ahead as enterprise autonomous workflows accelerate across industries.",
    keyTakeaways: [
      "Over 60% of knowledge workers report using generative AI tools weekly for code, synthesis, and customer workflows.",
      "New demand surges for AI ethics officers, prompt engineers, and algorithmic verification specialists.",
      "Call for continuous national upskilling programs to prevent structural workforce displacement."
    ],
    content: `Artificial intelligence is moving beyond experimental pilot projects into core enterprise operating architecture. From automated diagnostic support in hospitals to algorithmic financial reconciliations, generative models are fundamentally transforming how organizations produce and verify work.

Industry leaders emphasize that proactive workforce reskilling is essential to capture productivity dividends while preserving worker agency.`,
    category: "Technology",
    tags: ["Artificial Intelligence", "Future of Work", "Tech", "Automation", "Jobs"],
    authorId: "author-raghav-bahl",
    featuredImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    imageCaption: "Digital visualization of human-AI collaboration in high-performance enterprise teams.",
    status: "published",
    isBreaking: false,
    publishedAt: "2026-09-20T01:30:00.000Z",
    updatedAt: "2026-09-20T02:00:00.000Z",
    readTimeMinutes: 5,
    views: 38200
  },
  {
    id: "art-cinema-05",
    slug: "a-new-era-for-indian-cinema",
    headline: "A New Era for Indian Cinema",
    deck: "With powerful storytelling and global reach, Indian films are winning new audiences worldwide.",
    keyTakeaways: [
      "Pan-Indian productions command record box office shares in North America, Japan, and Western Europe.",
      "Regional cinema from Malayalam, Telugu, and Tamil industries receives critical international festival acclaim.",
      "Direct streaming distribution bridges linguistic divides across tier-2 and tier-3 domestic markets."
    ],
    content: `Indian cinema has entered an unprecedented creative and commercial renaissance. By fusing authentic grassroots narratives with world-class production craft, regional creators are transcending traditional borders and connecting with international audiences.`,
    category: "Entertainment",
    tags: ["Cinema", "Bollywood", "Movies", "Culture", "OTT"],
    authorId: "author-faye-dsouza",
    featuredImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    imageCaption: "Celebrated actors and directors gracing international cinema premiers.",
    status: "published",
    isBreaking: false,
    publishedAt: "2026-09-19T22:15:00.000Z",
    updatedAt: "2026-09-20T00:30:00.000Z",
    readTimeMinutes: 4,
    views: 19800
  },
  {
    id: "art-durga-06",
    slug: "durga-puja-2025-tradition-culture-modern-kolkata",
    headline: "Durga Puja 2025: Tradition, Culture and a Modern Kolkata",
    deck: "A deep dive into the festival that unites faith, art, and community across the City of Joy.",
    keyTakeaways: [
      "UNESCO Intangible Cultural Heritage recognition draws record international visitors to Kolkata.",
      "Pandals showcase stunning blend of centuries-old terracotta heritage and contemporary eco-architecture.",
      "Festival economy generates over \u20B940,000 crore in cultural commerce, supporting thousands of artisans."
    ],
    content: `Kolkata during Durga Puja is transformed into the world's largest open-air art installation. Beyond religious rituals, the five-day carnival represents an extraordinary democratization of artistic expression, where every neighborhood street becomes a canvas for public storytelling and shared celebration.`,
    category: "Explainers",
    tags: ["Durga Puja", "Kolkata", "Culture", "Heritage", "Festival"],
    authorId: "author-swati-chaturvedi",
    featuredImage: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=1200&q=85",
    imageCaption: "The iconic idol of Goddess Durga illuminated in a masterfully crafted Kolkata pandal.",
    status: "published",
    isBreaking: false,
    isExplainer: true,
    publishedAt: "2026-09-20T03:00:00.000Z",
    updatedAt: "2026-09-20T04:15:00.000Z",
    readTimeMinutes: 6,
    views: 45200
  },
  {
    id: "art-climate-07",
    slug: "climate-change-2025-where-do-we-stand",
    headline: "Climate Change 2025: Where Do We Stand?",
    deck: "Key facts, latest reports, and what it means for the future of our planet and energy transition.",
    keyTakeaways: [
      "Global renewable installations surpass 500 GW annual benchmark for the first time in history.",
      "Extreme weather forecasting precision improves by 40% using coupled AI climate models.",
      "Global south champions accelerated adaptation funding ahead of upcoming COP deliberations."
    ],
    content: `An in-depth explainer evaluating global carbon emissions, oceanic temperature anomalies, and the rapidly accelerating deployment of grid-scale clean energy technologies across major economies.`,
    category: "Explainers",
    tags: ["Climate Change", "Environment", "Renewables", "Science", "Explainers"],
    authorId: "author-nandan-nilekani",
    featuredImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    imageCaption: "Contrasting landscapes illustrating ecological balance and climate urgency.",
    status: "published",
    isBreaking: false,
    isExplainer: true,
    publishedAt: "2026-09-19T18:00:00.000Z",
    updatedAt: "2026-09-19T20:00:00.000Z",
    readTimeMinutes: 5,
    views: 29400
  },
  {
    id: "art-growth-08",
    slug: "india-growth-story-numbers-behind-momentum",
    headline: "India's Growth Story: Numbers Behind the Momentum",
    deck: "Jobs, infrastructure, innovation \u2014 how India is shaping its next decade as the world\u2019s fastest growing major economy.",
    keyTakeaways: [
      "National highway construction reaches 34 kilometers per day milestone.",
      "Unified Payments Interface (UPI) handles over 15 billion transactions monthly with 99.99% uptime.",
      "Manufacturing sector contribution rises to 18% of GDP led by electronics and defense exports."
    ],
    content: `A data-driven breakdown of India's demographic advantages, logistics corridors, and capital expenditure cycle driving long-term economic expansion.`,
    category: "Explainers",
    tags: ["Economy", "India", "GDP", "Infrastructure", "Development"],
    authorId: "author-raghav-bahl",
    featuredImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
    imageCaption: "Digital data points illuminating India\u2019s economic and industrial progress.",
    status: "published",
    isBreaking: false,
    isExplainer: true,
    publishedAt: "2026-09-19T16:30:00.000Z",
    updatedAt: "2026-09-19T19:00:00.000Z",
    readTimeMinutes: 5,
    views: 33100
  }
];

// src/server/ssrEngine.ts
var cachedFirebaseConfig = null;
function getServerFirebaseConfig() {
  if (cachedFirebaseConfig) return cachedFirebaseConfig;
  const candidatePaths = [
    path.resolve(process.cwd(), "firebase-applet-config.json"),
    path.resolve(process.cwd(), "..", "firebase-applet-config.json")
  ];
  try {
    if (typeof import.meta !== "undefined" && import.meta.url) {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      candidatePaths.push(
        path.resolve(currentDir, "..", "firebase-applet-config.json"),
        path.resolve(currentDir, "..", "..", "firebase-applet-config.json")
      );
    }
  } catch {
  }
  for (const cfgPath of candidatePaths) {
    try {
      if (fs.existsSync(cfgPath)) {
        const parsed = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
        if (parsed && parsed.projectId && parsed.apiKey) {
          cachedFirebaseConfig = parsed;
          return cachedFirebaseConfig;
        }
      }
    } catch {
    }
  }
  cachedFirebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    apiKey: process.env.FIREBASE_API_KEY || "",
    firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || "(default)"
  };
  return cachedFirebaseConfig;
}
var SITE_URL = "https://www.iamquickagent.com";
var SITE_NAME = "iamquickagent.com";
var DEFAULT_OG_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=85";
var cachedArticles = [...SEED_ARTICLES].sort(
  (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
);
var cachedAuthors = [...SEED_AUTHORS];
var articlesCacheTimestamp = 0;
var authorsCacheTimestamp = 0;
var isRefreshingArticles = false;
var isRefreshingAuthors = false;
var CACHE_TTL_MS = 30 * 1e3;
function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeXml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function safeJsonForScript(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
function decodeBasicEntities(str) {
  if (!str) return "";
  return String(str).replace(/&#(\d+);/g, (_, dec) => {
    const code = parseInt(dec, 10);
    return !isNaN(code) ? String.fromCharCode(code) : _;
  }).replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    const code = parseInt(hex, 16);
    return !isNaN(code) ? String.fromCharCode(code) : _;
  }).replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&nbsp;/gi, " ");
}
function getCategoryFallbackImage(category) {
  const cat = (category || "").toLowerCase();
  if (cat === "world") return "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&h=630&q=85";
  if (cat === "technology") return "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=630&q=85";
  if (cat === "business" || cat === "markets") return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&h=630&q=85";
  if (cat === "science") return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=630&q=85";
  if (cat === "sports") return "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&h=630&q=85";
  if (cat === "entertainment") return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&h=630&q=85";
  return DEFAULT_OG_IMAGE;
}
function toAbsoluteUrl(rawUrl, category) {
  if (!rawUrl || typeof rawUrl !== "string") return getCategoryFallbackImage(category);
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.startsWith("data:")) return getCategoryFallbackImage(category);
  let resolved = trimmed;
  if (resolved.startsWith("https://iamquickagent.com/")) {
    resolved = resolved.replace("https://iamquickagent.com/", `${SITE_URL}/`);
  } else if (resolved.startsWith("http://iamquickagent.com/")) {
    resolved = resolved.replace("http://iamquickagent.com/", `${SITE_URL}/`);
  } else if (resolved.startsWith("//")) {
    resolved = `https:${resolved}`;
  } else if (resolved.startsWith("/")) {
    resolved = `${SITE_URL}${resolved}`;
  } else if (!resolved.startsWith("https://") && !resolved.startsWith("http://")) {
    resolved = `${SITE_URL}/${resolved}`;
  }
  if (resolved.toLowerCase().endsWith(".svg")) {
    return getCategoryFallbackImage(category);
  }
  return resolved;
}
function toSitemapImageUrl(rawUrl, category) {
  return toAbsoluteUrl(rawUrl, category);
}
function toRenderableImgSrc(rawUrl, category) {
  if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.trim()) {
    return getCategoryFallbackImage(category);
  }
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith("data:image/")) return trimmed;
  if (trimmed.startsWith("/")) return `${SITE_URL}${trimmed}`;
  return toAbsoluteUrl(trimmed, category);
}
function safeIsoDate(input) {
  if (!input) return (/* @__PURE__ */ new Date()).toISOString();
  const d = new Date(input);
  return isNaN(d.getTime()) ? (/* @__PURE__ */ new Date()).toISOString() : d.toISOString();
}
function buildMetaDescription(rawCandidates, fallback) {
  for (const candidate of rawCandidates) {
    if (!candidate) continue;
    const cleaned = decodeBasicEntities(candidate).replace(/!\[.*?\]\(.*?\)/g, " ").replace(/[#*`_>[\]()]/g, " ").replace(/\s+/g, " ").trim();
    if (cleaned.length >= 30) {
      if (cleaned.length <= 160) return cleaned;
      const sliced = cleaned.slice(0, 157);
      const lastSpace = sliced.lastIndexOf(" ");
      return (lastSpace > 110 ? sliced.slice(0, lastSpace) : sliced).replace(/[.,;:\s]+$/, "") + "...";
    }
  }
  return fallback;
}
function buildArticleTitle(article) {
  const raw = decodeBasicEntities(article.seoTitle || article.headline || "Breaking News").trim();
  if (raw.toLowerCase().includes("iamquickagent.com")) return raw;
  return `${raw} | ${SITE_NAME}`;
}
function buildArticleDescription(article) {
  return buildMetaDescription(
    [article.seoDescription, article.deck, article.keyTakeaways?.[0], article.content],
    `Read the latest ${article.category || "breaking"} news coverage: ${article.headline} on ${SITE_NAME}.`
  );
}
function decodeFirestoreValue(val) {
  if (!val || typeof val !== "object") return null;
  if ("stringValue" in val) return val.stringValue;
  if ("booleanValue" in val) return Boolean(val.booleanValue);
  if ("integerValue" in val) return Number(val.integerValue);
  if ("doubleValue" in val) return Number(val.doubleValue);
  if ("timestampValue" in val) return val.timestampValue;
  if ("nullValue" in val) return null;
  if ("arrayValue" in val) {
    const values = val.arrayValue?.values;
    return Array.isArray(values) ? values.map(decodeFirestoreValue) : [];
  }
  if ("mapValue" in val) {
    const fields = val.mapValue?.fields || {};
    const out = {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = decodeFirestoreValue(v);
    }
    return out;
  }
  return null;
}
function decodeFirestoreDoc(doc) {
  const name = doc?.name || "";
  const id = name.split("/").pop() || "";
  const fields = doc?.fields || {};
  const result = { id };
  for (const [k, v] of Object.entries(fields)) {
    result[k] = decodeFirestoreValue(v);
  }
  return result;
}
async function fetchFirestoreCollectionRest(collectionName, options = {}) {
  const firebaseConfig = getServerFirebaseConfig();
  if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
    throw new Error("Firebase public configuration is unavailable on server.");
  }
  const projectId = firebaseConfig.projectId;
  const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
  const runQueryEndpoint = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/${encodeURIComponent(databaseId)}/documents:runQuery`;
  const structuredQuery = {
    from: [{ collectionId: collectionName }],
    limit: options.limit || 250
  };
  if (options.orderByField) {
    structuredQuery.orderBy = [
      { field: { fieldPath: options.orderByField }, direction: "DESCENDING" }
    ];
  }
  const res = await fetch(runQueryEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Goog-Api-Key": firebaseConfig.apiKey
    },
    body: JSON.stringify({ structuredQuery }),
    signal: AbortSignal.timeout(options.timeoutMs || 5e3)
  });
  if (!res.ok) {
    throw new Error(`Firestore REST runQuery ${collectionName} HTTP ${res.status}`);
  }
  const rows = await res.json();
  const items = [];
  if (Array.isArray(rows)) {
    for (const row of rows) {
      if (row && row.document) {
        items.push(decodeFirestoreDoc(row.document));
      }
    }
  }
  return items;
}
async function refreshFirestoreArticles() {
  if (isRefreshingArticles) return cachedArticles;
  isRefreshingArticles = true;
  try {
    const firestoreList = await fetchFirestoreCollectionRest("articles", {
      orderByField: "publishedAt",
      limit: 300,
      timeoutMs: 5500
    });
    if (firestoreList.length > 0) {
      const normalizedList = firestoreList.filter((a) => a && a.slug && a.headline).map((a) => ({
        ...a,
        headline: decodeBasicEntities(a.headline),
        deck: decodeBasicEntities(a.deck || ""),
        status: a.status || "published",
        tags: Array.isArray(a.tags) ? a.tags : [],
        keyTakeaways: Array.isArray(a.keyTakeaways) ? a.keyTakeaways : [],
        publishedAt: safeIsoDate(a.publishedAt),
        updatedAt: safeIsoDate(a.updatedAt || a.publishedAt)
      }));
      const firestoreSlugs = new Set(normalizedList.map((a) => a.slug));
      const firestoreIds = new Set(normalizedList.map((a) => a.id));
      const merged = [...normalizedList];
      for (const seed of SEED_ARTICLES) {
        if (!firestoreSlugs.has(seed.slug) && !firestoreIds.has(seed.id)) {
          merged.push(seed);
        }
      }
      merged.sort(
        (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
      );
      cachedArticles = merged;
      articlesCacheTimestamp = Date.now();
      return merged;
    }
  } catch (err) {
    console.warn("Server Firestore REST articles fetch fallback:", err?.message || err);
  } finally {
    isRefreshingArticles = false;
  }
  return cachedArticles;
}
async function refreshFirestoreAuthors() {
  if (isRefreshingAuthors) return cachedAuthors;
  isRefreshingAuthors = true;
  try {
    const firestoreAuthors = await fetchFirestoreCollectionRest("authors", {
      limit: 100,
      timeoutMs: 4e3
    });
    if (firestoreAuthors.length > 0) {
      const ids = new Set(firestoreAuthors.map((a) => a.id));
      const merged = [...firestoreAuthors];
      for (const seed of SEED_AUTHORS) {
        if (!ids.has(seed.id)) merged.push(seed);
      }
      cachedAuthors = merged;
      authorsCacheTimestamp = Date.now();
      return merged;
    }
  } catch (err) {
    console.warn("Server Firestore REST authors fetch fallback:", err?.message || err);
  } finally {
    isRefreshingAuthors = false;
  }
  return cachedAuthors;
}
async function getAllServerArticles(forceFresh = false) {
  const now = Date.now();
  if (!forceFresh && now - articlesCacheTimestamp < CACHE_TTL_MS && articlesCacheTimestamp > 0) {
    return cachedArticles;
  }
  if (forceFresh || articlesCacheTimestamp === 0) {
    await refreshFirestoreArticles();
  } else {
    await refreshFirestoreArticles();
  }
  return cachedArticles;
}
async function getAllServerAuthors() {
  const now = Date.now();
  if (now - authorsCacheTimestamp < CACHE_TTL_MS && authorsCacheTimestamp > 0) {
    return cachedAuthors;
  }
  await refreshFirestoreAuthors();
  return cachedAuthors;
}
async function getServerArticleBySlug(slug) {
  const articles = await getAllServerArticles();
  const direct = articles.find((a) => a.slug === slug || a.id === slug);
  if (direct) return direct;
  const fresh = await getAllServerArticles(true);
  return fresh.find((a) => a.slug === slug || a.id === slug);
}
async function getServerAuthorById(authorId) {
  const authors = await getAllServerAuthors();
  return authors.find((a) => a.id === authorId) || SEED_AUTHORS.find((a) => a.id === authorId);
}
function buildOrganizationSchema() {
  return {
    "@type": "NewsMediaOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ["iamquickagent", "iamnewsagent", "iamnewsagent.com"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: DEFAULT_OG_IMAGE,
      caption: "iamquickagent.com Logo",
      width: 1200,
      height: 630
    },
    image: DEFAULT_OG_IMAGE,
    sameAs: [
      "https://twitter.com/iamquickagent",
      "https://facebook.com/iamquickagent",
      "https://linkedin.com/company/iamquickagent",
      "https://youtube.com/@iamquickagent"
    ],
    description: "Real-time digital breaking news and multimedia publishing network delivering live coverage across India, World, Business, Markets, Technology, Politics, Sports, and in-depth explainers.",
    foundingDate: "2024-03-01",
    founder: {
      "@type": "Person",
      "@id": `${SITE_URL}/author/author-narayan-shukla#person`,
      name: "Narayan Shukla",
      jobTitle: "Editor-in-Chief & Founder",
      url: `${SITE_URL}/author/author-narayan-shukla`
    },
    publishingPrinciples: `${SITE_URL}/editorial-standards`,
    ethicsPolicy: `${SITE_URL}/editorial-standards`,
    correctionsPolicy: `${SITE_URL}/editorial-standards`,
    masthead: `${SITE_URL}/editorial-standards`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Newsroom Editorial Desk",
      email: "SUKLA.NARAYAN007@gmail.com",
      availableLanguage: ["English", "Hindi"]
    }
  };
}
function buildWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    alternateName: ["iamquickagent", "iamnewsagent"],
    description: "Live breaking news, real-time headlines, and in-depth reporting across India, World, Business, Tech, Markets, Sports, and Politics.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    inLanguage: "en-US"
  };
}
function applyHeadMeta(templateHtml, meta, jsonLdGraph, inlineScripts) {
  let html = templateHtml;
  const img = toAbsoluteUrl(meta.imageUrl);
  const imgAlt = meta.imageAlt || meta.title;
  html = html.replace(/<script[^>]*data-ssr-default="true"[^>]*>[\s\S]*?<\/script>/gi, "");
  const setMetaByName = (name, content) => {
    const escaped = escapeHtml(content);
    const re = new RegExp(`<meta\\s+[^>]*name=["']${name}["'][^>]*\\/?>`, "i");
    const tag = `<meta name="${name}" content="${escaped}" />`;
    if (re.test(html)) {
      html = html.replace(re, tag);
    } else {
      html = html.replace("</head>", `    ${tag}
  </head>`);
    }
  };
  const setMetaByProp = (prop, content) => {
    const escaped = escapeHtml(content);
    const re = new RegExp(`<meta\\s+[^>]*property=["']${prop}["'][^>]*\\/?>`, "i");
    const tag = `<meta property="${prop}" content="${escaped}" />`;
    if (re.test(html)) {
      html = html.replace(re, tag);
    } else {
      html = html.replace("</head>", `    ${tag}
  </head>`);
    }
  };
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  } else {
    html = html.replace("</head>", `    <title>${escapeHtml(meta.title)}</title>
  </head>`);
  }
  setMetaByName("description", meta.description);
  if (meta.keywords) {
    setMetaByName("keywords", meta.keywords);
    setMetaByName("news_keywords", meta.keywords);
  }
  if (meta.authorName) {
    setMetaByName("author", meta.authorName);
  }
  setMetaByProp("og:type", meta.ogType);
  setMetaByProp("og:site_name", SITE_NAME);
  setMetaByProp("og:title", meta.title);
  setMetaByProp("og:description", meta.description);
  setMetaByProp("og:url", meta.canonicalUrl);
  setMetaByProp("og:image", img);
  setMetaByProp("og:image:alt", imgAlt);
  if (meta.publishedTime) setMetaByProp("article:published_time", meta.publishedTime);
  if (meta.modifiedTime) setMetaByProp("article:modified_time", meta.modifiedTime);
  if (meta.section) setMetaByProp("article:section", meta.section);
  if (meta.authorName && meta.ogType === "article") setMetaByProp("article:author", meta.authorName);
  setMetaByName("twitter:card", "summary_large_image");
  setMetaByName("twitter:title", meta.title);
  setMetaByName("twitter:description", meta.description);
  setMetaByName("twitter:image", img);
  const canonicalTag = `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`;
  if (/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i.test(html)) {
    html = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i, canonicalTag);
  } else {
    html = html.replace("</head>", `    ${canonicalTag}
  </head>`);
  }
  const preloadTag = meta.preloadImage ? `    <link rel="preload" as="image" href="${escapeHtml(toAbsoluteUrl(meta.preloadImage))}" fetchpriority="high" />
` : "";
  const headInjection = `${preloadTag}    <script type="application/ld+json" id="iamquickagent-ssr-schema">${safeJsonForScript(
    jsonLdGraph
  )}</script>
${inlineScripts}`;
  html = html.replace("</head>", `${headInjection}
  </head>`);
  return html;
}
function renderSsrHeader() {
  return `
      <header class="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <a href="/" class="flex items-center gap-2">
            <span class="font-serif font-extrabold text-xl sm:text-2xl tracking-tight text-slate-950">Iam<span class="text-red-700">news</span>agent</span>
          </a>
          <nav aria-label="Primary Navigation" class="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-700">
            <a href="/" class="hover:text-red-700">All News</a>
            <a href="/?category=India" class="hover:text-red-700">India</a>
            <a href="/?category=World" class="hover:text-red-700">World</a>
            <a href="/?category=Business" class="hover:text-red-700">Business</a>
            <a href="/?category=Technology" class="hover:text-red-700">Technology</a>
            <a href="/?category=Markets" class="hover:text-red-700">Markets</a>
            <a href="/?category=Explainers" class="hover:text-red-700">Explainers</a>
          </nav>
        </div>
      </header>`;
}
function renderSsrFooter() {
  return `
      <footer class="border-t border-slate-200 bg-slate-900 text-slate-300 mt-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>&copy; 2026 iamquickagent.com. All rights reserved.</span>
          <nav aria-label="Compliance Links" class="flex flex-wrap items-center gap-4">
            <a href="/privacy-policy" class="hover:text-white">Privacy Policy</a>
            <a href="/terms-of-service" class="hover:text-white">Terms of Service</a>
            <a href="/cookie-policy" class="hover:text-white">Cookie Policy</a>
            <a href="/editorial-standards" class="hover:text-white">Editorial Standards</a>
            <a href="/ai.txt" class="hover:text-white">AI Policy (ai.txt)</a>
            <a href="/sitemap.xml" class="hover:text-white">Sitemap</a>
          </nav>
        </div>
      </footer>`;
}
function renderMarkdownToHtml(markdown) {
  if (!markdown) return "";
  const blocks = markdown.split("\n\n");
  return blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("![") && trimmed.includes("](")) {
      const m = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
      if (m) {
        return `<figure class="my-6">
            <div class="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
              <img src="${escapeHtml(toAbsoluteUrl(m[2]))}" alt="${escapeHtml(m[1])}" width="1200" height="675" style="aspect-ratio:16/9;width:100%;height:100%;object-fit:cover;" loading="lazy" decoding="async" />
            </div>
            ${m[1] ? `<figcaption class="text-xs text-slate-600 italic mt-1.5 px-1">${escapeHtml(m[1])}</figcaption>` : ""}
          </figure>`;
      }
    }
    if (trimmed.startsWith("## ")) {
      return `<h2 class="text-2xl sm:text-3xl font-serif font-bold text-slate-950 mt-8 mb-4 border-b border-slate-200 pb-2">${escapeHtml(trimmed.substring(3))}</h2>`;
    }
    if (trimmed.startsWith("### ")) {
      return `<h3 class="text-xl sm:text-2xl font-serif font-bold text-slate-950 mt-6 mb-3">${escapeHtml(trimmed.substring(4))}</h3>`;
    }
    if (trimmed.startsWith("> ")) {
      return `<blockquote class="p-4 my-6 rounded-r-xl border-l-4 border-red-600 bg-red-50/50 text-slate-900 italic font-serif text-lg leading-relaxed">${escapeHtml(trimmed.substring(2))}</blockquote>`;
    }
    if (trimmed.startsWith("1. ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items = trimmed.split("\n").filter(Boolean);
      return `<ul class="space-y-2 my-4 list-disc list-inside text-slate-800">${items.map((it) => `<li>${escapeHtml(it.replace(/^(?:\d+\.|-|\*)\s+/, ""))}</li>`).join("")}</ul>`;
    }
    return `<p class="text-slate-800 text-base sm:text-lg leading-relaxed font-sans">${escapeHtml(trimmed)}</p>`;
  }).join("\n");
}
function renderArticleSsrHtml(article, templateHtml, authors = SEED_AUTHORS, allArticles = []) {
  const canonicalUrl = `${SITE_URL}/news/${encodeURIComponent(article.slug)}`;
  const pageTitle = buildArticleTitle(article);
  const desc = buildArticleDescription(article);
  const featuredImg = toAbsoluteUrl(article.featuredImage, article.category);
  const renderImg = toRenderableImgSrc(article.featuredImage, article.category);
  const author = authors.find((a) => a.id === article.authorId) || SEED_AUTHORS.find((a) => a.id === article.authorId);
  const authorName = author ? author.name : "iamquickagent Newsroom Desk";
  const authorUrl = author ? `${SITE_URL}/author/${encodeURIComponent(author.id)}` : `${SITE_URL}/editorial-standards`;
  const publishedIso = safeIsoDate(article.publishedAt);
  const modifiedIso = safeIsoDate(article.updatedAt || article.publishedAt);
  const graphNodes = [
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    {
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: pageTitle,
      description: desc,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: featuredImg,
        width: 1200,
        height: 675
      },
      datePublished: publishedIso,
      dateModified: modifiedIso,
      inLanguage: "en-US"
    },
    {
      "@type": "Person",
      "@id": `${authorUrl}#person`,
      name: authorName,
      jobTitle: author ? author.role : "Staff Correspondent",
      url: authorUrl,
      ...author?.bio ? { description: author.bio } : {},
      ...author?.avatar ? { image: toAbsoluteUrl(author.avatar) } : {},
      ...author?.twitter ? { sameAs: [`https://twitter.com/${author.twitter.replace("@", "")}`] } : {},
      worksFor: { "@id": `${SITE_URL}/#organization` }
    },
    {
      "@type": "NewsArticle",
      "@id": `${canonicalUrl}#article`,
      mainEntityOfPage: { "@id": `${canonicalUrl}#webpage` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      headline: article.headline,
      alternativeHeadline: article.deck || article.keyTakeaways?.[0] || article.headline,
      description: desc,
      image: [
        {
          "@type": "ImageObject",
          url: featuredImg,
          width: 1200,
          height: 675
        }
      ],
      datePublished: publishedIso,
      dateModified: modifiedIso,
      articleSection: article.category,
      keywords: (article.tags || []).join(", ") || article.category,
      wordCount: article.content ? article.content.split(/\s+/).filter(Boolean).length : 450,
      author: { "@id": `${authorUrl}#person` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
      isAccessibleForFree: true,
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ['[data-aeo-summary="true"]', "h1", ".deck-summary"]
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: article.category,
          item: `${SITE_URL}/?category=${encodeURIComponent(article.category)}`
        },
        { "@type": "ListItem", position: 3, name: article.headline, item: canonicalUrl }
      ]
    }
  ];
  if (article.faq && article.faq.length > 0) {
    graphNodes.push({
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,
      mainEntity: article.faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer }
      }))
    });
  }
  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": graphNodes
  };
  const initialFeed = allArticles.filter((a) => (a.status || "published") === "published").slice(0, 16).map((a) => ({
    ...a,
    featuredImage: a.id === article.id ? a.featuredImage : (a.featuredImage || "").startsWith("data:") ? getCategoryFallbackImage(a.category) : a.featuredImage,
    content: a.id === article.id ? a.content : (a.content || "").slice(0, 300)
  }));
  const inlineScripts = `    <script>window.__INITIAL_ARTICLE__=${safeJsonForScript(
    article
  )};window.__INITIAL_ARTICLES__=${safeJsonForScript(initialFeed)};window.__INITIAL_AUTHORS__=${safeJsonForScript(
    authors.slice(0, 20)
  )};</script>`;
  let html = applyHeadMeta(
    templateHtml,
    {
      title: pageTitle,
      description: desc,
      canonicalUrl,
      ogType: "article",
      imageUrl: featuredImg,
      imageAlt: article.headline,
      keywords: (article.tags || []).join(", ") || article.category,
      authorName,
      publishedTime: publishedIso,
      modifiedTime: modifiedIso,
      section: article.category,
      preloadImage: featuredImg
    },
    jsonLdGraph,
    inlineScripts
  );
  const renderedBody = renderMarkdownToHtml(article.content || "");
  const takeawaysList = (article.keyTakeaways || []).map(
    (t) => `<li class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0"></span><span>${escapeHtml(
      t
    )}</span></li>`
  ).join("");
  const relatedLinks = allArticles.filter((a) => a.id !== article.id && (a.status || "published") === "published").slice(0, 6).map(
    (rel) => `<li><a href="/news/${encodeURIComponent(rel.slug)}" class="text-slate-900 hover:text-red-700 font-serif font-semibold">${escapeHtml(
      rel.headline
    )}</a> <span class="text-xs text-slate-500">(${escapeHtml(rel.category)})</span></li>`
  ).join("");
  const preRenderedHtml = `
    <div id="ssr-root-container" class="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      ${renderSsrHeader()}
      <main id="main-content" class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
        <article itemscope itemtype="https://schema.org/NewsArticle" class="space-y-6">
          <div class="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider flex-wrap">
            <a href="/?category=${encodeURIComponent(article.category)}" class="px-2.5 py-1 rounded bg-red-700 text-white font-bold">${escapeHtml(
    article.category
  )}</a>
            <span>&bull;</span>
            <time itemprop="datePublished" datetime="${publishedIso}">${new Date(publishedIso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })}</time>
            <span>&bull;</span>
            <span>${article.readTimeMinutes || 4} min read</span>
          </div>

          <h1 itemprop="headline" class="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-950 leading-[1.16]">
            ${escapeHtml(article.headline)}
          </h1>

          ${article.deck ? `<p itemprop="description" class="deck-summary text-lg sm:text-xl text-slate-700 font-serif leading-relaxed">${escapeHtml(
    article.deck
  )}</p>` : ""}

          <div class="flex items-center gap-3 py-3 border-y border-slate-200 text-xs text-slate-700">
            <a href="/author/${encodeURIComponent(article.authorId)}" class="font-bold text-slate-950 hover:text-red-700">${escapeHtml(
    authorName
  )}</a>
            <span>&bull;</span>
            <span>${escapeHtml(article.sourceName || "iamquickagent Editorial Bureau")}</span>
          </div>

          ${article.keyTakeaways && article.keyTakeaways.length > 0 ? `<section class="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-slate-900 space-y-2.5" data-aeo-summary="true">
                  <h2 class="text-xs font-bold text-amber-900 uppercase tracking-wider">Key Takeaway Summary</h2>
                  <ul class="space-y-2 text-sm text-slate-800 leading-relaxed">${takeawaysList}</ul>
                </section>` : ""}

          <figure class="space-y-2">
            <div class="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200" style="aspect-ratio:16/9;width:100%;">
              <img src="${escapeHtml(renderImg)}" alt="${escapeHtml(article.headline)}" width="1200" height="675" fetchpriority="high" loading="eager" style="aspect-ratio:16/9;width:100%;height:100%;object-fit:cover;" />
            </div>
            ${article.imageCaption ? `<figcaption class="text-xs text-slate-600 italic px-1">${escapeHtml(article.imageCaption)}</figcaption>` : ""}
          </figure>

          <div itemprop="articleBody" class="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans text-base sm:text-lg space-y-4 pt-2">
            ${renderedBody}
          </div>
        </article>

        ${relatedLinks ? `<section class="mt-10 pt-8 border-t border-slate-200 space-y-3" aria-label="More Latest News">
                <h2 class="text-xl font-serif font-bold text-slate-950">More Latest News</h2>
                <ul class="space-y-2 text-sm">${relatedLinks}</ul>
              </section>` : ""}
      </main>
      ${renderSsrFooter()}
    </div>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${preRenderedHtml}</div>`);
  return html;
}
function renderHomeSsrHtml(articles, templateHtml, activeCategory, authors = SEED_AUTHORS) {
  const published = articles.filter((a) => (a.status || "published") === "published");
  const cleanCategory = activeCategory && activeCategory !== "all" ? activeCategory.trim() : "";
  const filtered = cleanCategory ? published.filter((a) => (a.category || "").toLowerCase() === cleanCategory.toLowerCase()) : published;
  const displayList = filtered.length > 0 ? filtered : published;
  const hero = displayList[0];
  const canonicalUrl = cleanCategory ? `${SITE_URL}/?category=${encodeURIComponent(cleanCategory)}` : `${SITE_URL}/`;
  const pageTitle = cleanCategory ? `${cleanCategory} News, Breaking Headlines & Live Updates | ${SITE_NAME}` : `${SITE_NAME} - Latest Breaking News, Live Updates & Global Headlines`;
  const desc = cleanCategory ? `Latest ${cleanCategory} breaking news, real-time headlines, executive takeaways, and in-depth reporting from ${SITE_NAME}.` : "Live breaking news, real-time headlines, and in-depth reporting across India, World, Business, Tech, Markets, Sports, and Politics with executive takeaways.";
  const heroImage = hero ? toAbsoluteUrl(hero.featuredImage, hero.category) : DEFAULT_OG_IMAGE;
  const graphNodes = [
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    cleanCategory ? {
      "@type": "CollectionPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: pageTitle,
      description: desc,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@type": "Thing", name: cleanCategory },
      numberOfItems: displayList.length,
      inLanguage: "en-US"
    } : {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: `${SITE_URL}/`,
      name: pageTitle,
      description: desc,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-US"
    },
    {
      "@type": "ItemList",
      "@id": `${canonicalUrl}#top-stories`,
      name: cleanCategory ? `${cleanCategory} Top Stories` : "Top Breaking News Headlines",
      itemListElement: displayList.slice(0, 15).map((a, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE_URL}/news/${encodeURIComponent(a.slug)}`,
        name: a.headline
      }))
    }
  ];
  if (cleanCategory) {
    graphNodes.push({
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: cleanCategory, item: canonicalUrl }
      ]
    });
  }
  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": graphNodes
  };
  const compactArticles = published.slice(0, 30).map((a) => ({
    ...a,
    featuredImage: (a.featuredImage || "").startsWith("data:") ? getCategoryFallbackImage(a.category) : a.featuredImage,
    content: (a.content || "").slice(0, 350)
  }));
  const inlineScripts = `    <script>window.__INITIAL_ARTICLES__=${safeJsonForScript(
    compactArticles
  )};window.__INITIAL_AUTHORS__=${safeJsonForScript(authors.slice(0, 20))};</script>`;
  let html = applyHeadMeta(
    templateHtml,
    {
      title: pageTitle,
      description: desc,
      canonicalUrl,
      ogType: "website",
      imageUrl: heroImage,
      imageAlt: hero ? hero.headline : `${SITE_NAME} Breaking News`,
      preloadImage: heroImage
    },
    jsonLdGraph,
    inlineScripts
  );
  const topNews = displayList.slice(0, 20);
  const headlineList = topNews.map(
    (a) => `
      <li class="py-3 border-b border-slate-100 flex items-start gap-3">
        <span class="text-xs font-bold text-red-700 uppercase shrink-0 mt-0.5">${escapeHtml(a.category)}</span>
        <div class="min-w-0">
          <a href="/news/${encodeURIComponent(a.slug)}" class="text-slate-950 hover:text-red-700 font-serif font-bold text-base sm:text-lg leading-snug block">
            ${escapeHtml(a.headline)}
          </a>
          ${a.deck ? `<p class="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">${escapeHtml(a.deck)}</p>` : ""}
        </div>
      </li>`
  ).join("");
  const preRenderedHome = `
    <div id="ssr-home-container" class="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      ${renderSsrHeader()}
      <main id="main-content" class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        <div class="mb-6 pb-3 border-b border-slate-200 flex items-center justify-between gap-4">
          <h1 class="text-2xl sm:text-3xl font-serif font-bold text-slate-950">
            ${cleanCategory ? `${escapeHtml(cleanCategory)} News &amp; Headlines` : "Breaking News &amp; Live Wire Dispatches"}
          </h1>
          <span class="text-xs text-slate-600 font-mono shrink-0">Updated real-time</span>
        </div>

        ${hero ? `<section class="mb-8 rounded-2xl border border-slate-200 overflow-hidden bg-white" aria-label="Lead Story">
                <div class="aspect-video w-full bg-slate-900 overflow-hidden" style="aspect-ratio:16/9;">
                  <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(hero.headline)}" width="1200" height="675" fetchpriority="high" loading="eager" style="width:100%;height:100%;object-fit:cover;" />
                </div>
                <div class="p-5 sm:p-6 space-y-2">
                  <span class="text-xs font-bold text-red-700 uppercase">${escapeHtml(hero.category)}</span>
                  <h2 class="text-2xl sm:text-3xl font-serif font-bold text-slate-950">
                    <a href="/news/${encodeURIComponent(hero.slug)}" class="hover:text-red-700">${escapeHtml(hero.headline)}</a>
                  </h2>
                  ${hero.deck ? `<p class="text-sm sm:text-base text-slate-700">${escapeHtml(hero.deck)}</p>` : ""}
                </div>
              </section>` : ""}

        <section aria-label="Latest News Dispatches">
          <h2 class="text-xl font-serif font-bold text-slate-950 mb-3">Latest Dispatches</h2>
          <ul class="space-y-1">${headlineList}</ul>
        </section>
      </main>
      ${renderSsrFooter()}
    </div>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${preRenderedHome}</div>`);
  return html;
}
function renderAuthorSsrHtml(author, allArticles, templateHtml) {
  const canonicalUrl = `${SITE_URL}/author/${encodeURIComponent(author.id)}`;
  const pageTitle = `${author.name} - ${author.role} | ${SITE_NAME}`;
  const desc = buildMetaDescription(
    [`${author.name} (${author.role}) at ${SITE_NAME}. ${author.bio || ""}`],
    `Read verified news dispatches and analysis by ${author.name} on ${SITE_NAME}.`
  );
  const avatarUrl = toAbsoluteUrl(author.avatar);
  const authorArticles = allArticles.filter(
    (a) => a.authorId === author.id && (a.status || "published") === "published"
  );
  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      {
        "@type": "ProfilePage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: pageTitle,
        description: desc,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${canonicalUrl}#person` },
        inLanguage: "en-US"
      },
      {
        "@type": "Person",
        "@id": `${canonicalUrl}#person`,
        name: author.name,
        jobTitle: author.role,
        description: author.bio,
        image: avatarUrl,
        url: canonicalUrl,
        ...author.twitter ? { sameAs: [`https://twitter.com/${author.twitter.replace("@", "")}`] } : {},
        worksFor: { "@id": `${SITE_URL}/#organization` }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: author.name, item: canonicalUrl }
        ]
      }
    ]
  };
  const inlineScripts = `    <script>window.__INITIAL_ARTICLES__=${safeJsonForScript(
    allArticles.slice(0, 25).map((a) => ({
      ...a,
      featuredImage: (a.featuredImage || "").startsWith("data:") ? getCategoryFallbackImage(a.category) : a.featuredImage,
      content: (a.content || "").slice(0, 300)
    }))
  )};</script>`;
  let html = applyHeadMeta(
    templateHtml,
    {
      title: pageTitle,
      description: desc,
      canonicalUrl,
      ogType: "profile",
      imageUrl: avatarUrl,
      imageAlt: author.name,
      authorName: author.name
    },
    jsonLdGraph,
    inlineScripts
  );
  const listHtml = authorArticles.slice(0, 20).map(
    (a) => `<li class="py-2.5 border-b border-slate-100"><a href="/news/${encodeURIComponent(
      a.slug
    )}" class="font-serif font-bold text-slate-950 hover:text-red-700">${escapeHtml(
      a.headline
    )}</a> <span class="text-xs text-slate-500 ml-2">${escapeHtml(a.category)}</span></li>`
  ).join("");
  const preRendered = `
    <div class="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      ${renderSsrHeader()}
      <main id="main-content" class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <div class="flex items-center gap-4 pb-6 border-b border-slate-200">
          <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(author.name)}" width="96" height="96" class="w-24 h-24 rounded-2xl object-cover border border-slate-200" />
          <div>
            <h1 class="text-2xl sm:text-3xl font-serif font-bold text-slate-950">${escapeHtml(author.name)}</h1>
            <p class="text-sm font-semibold text-red-700">${escapeHtml(author.role)}</p>
            <p class="text-sm text-slate-700 mt-1">${escapeHtml(author.bio)}</p>
          </div>
        </div>
        <section>
          <h2 class="text-xl font-serif font-bold text-slate-950 mb-3">Published Reports (${authorArticles.length})</h2>
          <ul>${listHtml}</ul>
        </section>
      </main>
      ${renderSsrFooter()}
    </div>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${preRendered}</div>`);
  return html;
}
function renderLegalSsrHtml(page, templateHtml) {
  const canonicalUrl = `${SITE_URL}${page.path}`;
  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: page.metaTitle,
        description: page.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        dateModified: page.lastUpdated,
        inLanguage: "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: page.title, item: canonicalUrl }
        ]
      }
    ]
  };
  let html = applyHeadMeta(
    templateHtml,
    {
      title: page.metaTitle,
      description: page.description,
      canonicalUrl,
      ogType: "website",
      imageUrl: DEFAULT_OG_IMAGE,
      imageAlt: page.title
    },
    jsonLdGraph,
    ""
  );
  const sectionsHtml = page.sections.map(
    (sec) => `
      <section class="space-y-3">
        <h2 class="text-xl font-serif font-bold text-slate-950">${escapeHtml(sec.heading)}</h2>
        ${sec.paragraphs.map((p) => `<p class="text-slate-700 leading-relaxed">${escapeHtml(p)}</p>`).join("")}
        ${sec.bullets ? `<ul class="list-disc pl-5 space-y-1.5 text-slate-700">${sec.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>` : ""}
      </section>`
  ).join("");
  const preRendered = `
    <div class="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      ${renderSsrHeader()}
      <main id="main-content" class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <article class="space-y-6">
          <header class="space-y-3 pb-6 border-b border-slate-200">
            <span class="text-xs font-bold uppercase tracking-wider text-red-700">${escapeHtml(page.eyebrow)}</span>
            <h1 class="text-3xl sm:text-4xl font-serif font-bold text-slate-950">${escapeHtml(page.title)}</h1>
            <p class="text-xs text-slate-600">Effective: ${escapeHtml(page.effectiveDate)} &bull; Last Updated: ${escapeHtml(
    page.lastUpdated
  )}</p>
            <p class="text-base text-slate-700 leading-relaxed">${escapeHtml(page.intro)}</p>
          </header>
          <div class="space-y-8">${sectionsHtml}</div>
        </article>
      </main>
      ${renderSsrFooter()}
    </div>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${preRendered}</div>`);
  return html;
}
function generateSitemapXml(articles, authors = SEED_AUTHORS) {
  const categories = [
    "India",
    "World",
    "Business",
    "Technology",
    "Markets",
    "Science",
    "Health",
    "Sports",
    "Lifestyle",
    "Entertainment",
    "Explainers",
    "Opinion"
  ];
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;
  xml += `  <url>
`;
  xml += `    <loc>${SITE_URL}/</loc>
`;
  xml += `    <lastmod>${nowIso}</lastmod>
`;
  xml += `    <changefreq>always</changefreq>
`;
  xml += `    <priority>1.0</priority>
`;
  xml += `  </url>
`;
  for (const cat of categories) {
    xml += `  <url>
`;
    xml += `    <loc>${SITE_URL}/?category=${encodeURIComponent(cat)}</loc>
`;
    xml += `    <lastmod>${nowIso}</lastmod>
`;
    xml += `    <changefreq>hourly</changefreq>
`;
    xml += `    <priority>0.8</priority>
`;
    xml += `  </url>
`;
  }
  for (const legal of LEGAL_PAGE_LIST) {
    xml += `  <url>
`;
    xml += `    <loc>${SITE_URL}${legal.path}</loc>
`;
    xml += `    <lastmod>${legal.lastUpdated}T00:00:00.000Z</lastmod>
`;
    xml += `    <changefreq>monthly</changefreq>
`;
    xml += `    <priority>0.5</priority>
`;
    xml += `  </url>
`;
  }
  const seenAuthorIds = /* @__PURE__ */ new Set();
  for (const author of authors) {
    if (!author?.id || seenAuthorIds.has(author.id)) continue;
    seenAuthorIds.add(author.id);
    xml += `  <url>
`;
    xml += `    <loc>${SITE_URL}/author/${encodeURIComponent(author.id)}</loc>
`;
    xml += `    <changefreq>weekly</changefreq>
`;
    xml += `    <priority>0.6</priority>
`;
    xml += `  </url>
`;
  }
  const seenSlugs = /* @__PURE__ */ new Set();
  const publishedArticles = articles.filter((a) => (a.status || "published") === "published" && a.slug);
  for (const article of publishedArticles) {
    if (seenSlugs.has(article.slug)) continue;
    seenSlugs.add(article.slug);
    const lastMod = safeIsoDate(article.updatedAt || article.publishedAt);
    const imgLoc = toSitemapImageUrl(article.featuredImage, article.category);
    xml += `  <url>
`;
    xml += `    <loc>${SITE_URL}/news/${encodeURIComponent(article.slug)}</loc>
`;
    xml += `    <lastmod>${lastMod}</lastmod>
`;
    xml += `    <changefreq>daily</changefreq>
`;
    xml += `    <priority>${article.isBreaking ? "0.95" : "0.85"}</priority>
`;
    xml += `    <image:image>
`;
    xml += `      <image:loc>${escapeXml(imgLoc)}</image:loc>
`;
    xml += `      <image:title>${escapeXml(article.headline)}</image:title>
`;
    if (article.deck) {
      xml += `      <image:caption>${escapeXml(article.deck)}</image:caption>
`;
    }
    xml += `    </image:image>
`;
    xml += `  </url>
`;
  }
  xml += `</urlset>`;
  return xml;
}
function generateNewsSitemapXml(articles) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;
  const seenSlugs = /* @__PURE__ */ new Set();
  const published = articles.filter((a) => (a.status || "published") === "published" && a.slug).slice(0, 150);
  for (const article of published) {
    if (seenSlugs.has(article.slug)) continue;
    seenSlugs.add(article.slug);
    const pubDate = safeIsoDate(article.publishedAt);
    xml += `  <url>
`;
    xml += `    <loc>${SITE_URL}/news/${encodeURIComponent(article.slug)}</loc>
`;
    xml += `    <news:news>
`;
    xml += `      <news:publication>
`;
    xml += `        <news:name>${SITE_NAME}</news:name>
`;
    xml += `        <news:language>en</news:language>
`;
    xml += `      </news:publication>
`;
    xml += `      <news:publication_date>${pubDate}</news:publication_date>
`;
    xml += `      <news:title>${escapeXml(article.headline)}</news:title>
`;
    if (article.tags && article.tags.length > 0) {
      xml += `      <news:keywords>${escapeXml(article.tags.join(", "))}</news:keywords>
`;
    }
    xml += `    </news:news>
`;
    xml += `  </url>
`;
  }
  xml += `</urlset>`;
  return xml;
}
function generateRssXml(articles, authors = SEED_AUTHORS) {
  const now = (/* @__PURE__ */ new Date()).toUTCString();
  const published = articles.filter((a) => (a.status || "published") === "published" && a.slug).slice(0, 50);
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
`;
  rss += `  <channel>
`;
  rss += `    <title>${SITE_NAME} - Breaking News, Live Updates &amp; Global Headlines</title>
`;
  rss += `    <link>${SITE_URL}/</link>
`;
  rss += `    <description>Real-time digital breaking news and intelligence reporting across India, World, Business, Markets, Technology, Science, Politics, and Sports.</description>
`;
  rss += `    <language>en-US</language>
`;
  rss += `    <lastBuildDate>${now}</lastBuildDate>
`;
  rss += `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
`;
  for (const article of published) {
    const pubDate = new Date(safeIsoDate(article.publishedAt)).toUTCString();
    const articleUrl = `${SITE_URL}/news/${encodeURIComponent(article.slug)}`;
    const authorObj = authors.find((a) => a.id === article.authorId);
    const authorName = authorObj ? authorObj.name : "iamquickagent Newsroom Desk";
    const imgUrl = toSitemapImageUrl(article.featuredImage, article.category);
    rss += `    <item>
`;
    rss += `      <title>${escapeXml(article.headline)}</title>
`;
    rss += `      <link>${articleUrl}</link>
`;
    rss += `      <guid isPermaLink="true">${articleUrl}</guid>
`;
    rss += `      <pubDate>${pubDate}</pubDate>
`;
    rss += `      <dc:creator>${escapeXml(authorName)}</dc:creator>
`;
    rss += `      <category>${escapeXml(article.category)}</category>
`;
    rss += `      <description>${escapeXml(buildArticleDescription(article))}</description>
`;
    rss += `      <enclosure url="${escapeXml(imgUrl)}" type="image/jpeg" length="102400" />
`;
    rss += `    </item>
`;
  }
  rss += `  </channel>
`;
  rss += `</rss>`;
  return rss;
}
function generateLlmsTxt(articles, fullMode = false) {
  const published = articles.filter((a) => (a.status || "published") === "published" && a.slug).slice(0, fullMode ? 100 : 35);
  let doc = `# ${SITE_NAME}

`;
  doc += `> Real-time digital breaking news publication delivering verified India, World, Business, Markets, Technology, Science, Sports, and Explainer coverage with structured executive takeaways.

`;
  doc += `## Core Identity & Policies
`;
  doc += `- Canonical Website: ${SITE_URL}/
`;
  doc += `- AI Policy: ${SITE_URL}/ai.txt
`;
  doc += `- XML Sitemap: ${SITE_URL}/sitemap.xml
`;
  doc += `- Google News Sitemap: ${SITE_URL}/news-sitemap.xml
`;
  doc += `- RSS Feed: ${SITE_URL}/rss.xml
`;
  doc += `- Privacy Policy: ${SITE_URL}/privacy-policy
`;
  doc += `- Terms of Service: ${SITE_URL}/terms-of-service
`;
  doc += `- Cookie Policy: ${SITE_URL}/cookie-policy
`;
  doc += `- Editorial Standards: ${SITE_URL}/editorial-standards
`;
  doc += `- Publisher: iamquickagent.com Newsroom

`;
  doc += `## Latest Published News

`;
  for (const article of published) {
    doc += `### [${article.headline}](${SITE_URL}/news/${encodeURIComponent(article.slug)})
`;
    doc += `- Category: ${article.category}
`;
    doc += `- Published: ${safeIsoDate(article.publishedAt)}
`;
    doc += `- Summary: ${buildArticleDescription(article)}
`;
    if (article.keyTakeaways && article.keyTakeaways.length > 0) {
      doc += `- Key Takeaways:
`;
      for (const pt of article.keyTakeaways) {
        doc += `  * ${pt}
`;
      }
    }
    doc += `
`;
  }
  return doc;
}
function generateRobotsTxt() {
  return `# robots.txt for ${SITE_URL}
User-agent: *
Allow: /
Disallow: /cms
Disallow: /api/

# AI Search & Answer Engine Crawlers (permitted with attribution per /ai.txt)
User-agent: Google-Extended
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: GoogleOther-Image
Allow: /

User-agent: GoogleOther-Video
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

# Canonical Sitemaps & AI Directives
Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/news-sitemap.xml
`;
}
function generateAiTxt() {
  return `# ai.txt - AI Crawler, Citation & Content Usage Policy for iamquickagent.com
# Specification: https://site.spawning.ai/spawning-ai-txt

Site: ${SITE_URL}
Publisher: iamquickagent.com Newsroom
Contact: SUKLA.NARAYAN007@gmail.com
Last-Updated: 2026-11-20

# Directives for AI Search, Answer Engines, and Large Language Models
User-Agent: *
Allow: /
Allow: /news/
Allow: /author/
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /rss.xml
Disallow: /cms
Disallow: /api/

# Attribution & Citation Requirements
Attribution-Required: yes
Canonical-Domain: ${SITE_URL}
Citation-Format: "iamquickagent.com (<canonical-url>)"

# Structured Feeds & Machine-Readable Endpoints
Sitemap: ${SITE_URL}/sitemap.xml
News-Sitemap: ${SITE_URL}/news-sitemap.xml
LLMs-Index: ${SITE_URL}/llms.txt
RSS-Feed: ${SITE_URL}/rss.xml

# Legal & Compliance Policies
Privacy-Policy: ${SITE_URL}/privacy-policy
Terms-of-Service: ${SITE_URL}/terms-of-service
Cookie-Policy: ${SITE_URL}/cookie-policy
Editorial-Standards: ${SITE_URL}/editorial-standards
`;
}

// src/server/vercelEntry.ts
function getTemplateHtml() {
  try {
    if (`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>iamquickagent.com - Latest Breaking News, Live Updates &amp; Global Headlines</title>
    <meta name="description" content="Live breaking news, real-time headlines, and in-depth reporting across India, World, Business, Tech, Markets, Sports, and Politics with executive takeaways." />
    <meta name="keywords" content="breaking news, latest news, live updates, india news, world headlines, business news, stock markets, technology news, politics, sports, entertainment, explainers" />
    <meta name="news_keywords" content="Breaking News, Live Updates, India News, World Headlines, Politics, Business, Stock Markets, Technology, AI, Sports, Entertainment" />
    <meta name="author" content="iamquickagent.com Newsroom" />
    <meta name="generator" content="iamquickagent News Engine" />

    <!-- Canonical URL (dynamically updated per page by SSR & client router) -->
    <link rel="canonical" href="https://www.iamquickagent.com/" />

    <!-- OpenGraph Social Cards -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="iamquickagent.com" />
    <meta property="og:title" content="iamquickagent.com - Latest Breaking News, Live Updates &amp; Global Headlines" />
    <meta property="og:description" content="Live breaking news, real-time headlines, and in-depth reporting across India, World, Business, Tech, Markets, Sports, and Politics with executive takeaways." />
    <meta property="og:url" content="https://www.iamquickagent.com/" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=85" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="iamquickagent.com - Breaking News &amp; Live Headlines" />

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@iamquickagent" />
    <meta name="twitter:creator" content="@narayan_shukla" />
    <meta name="twitter:title" content="iamquickagent.com - Latest Breaking News, Live Updates &amp; Global Headlines" />
    <meta name="twitter:description" content="Live breaking news, real-time headlines, and in-depth reporting across India, World, Business, Tech, Markets, Sports, and Politics with executive takeaways." />
    <meta name="twitter:image" content="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=85" />

    <!-- Crawlers & Verification -->
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta name="google-site-verification" content="YFePTkFdMD9NtIIhg0fvDinPB8VPmTbH3Ahozp_tIqU" />

    <!-- Mobile Optimization & Web App Manifest -->
    <meta name="theme-color" content="#b91c1c" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="iamquickagent" />
    <meta name="format-detection" content="telephone=no" />
    <link rel="manifest" href="/manifest.webmanifest" />

    <!-- Feeds, Sitemaps & AI Directives -->
    <link rel="alternate" type="application/rss+xml" title="iamquickagent RSS Feed" href="/rss.xml" />
    <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
    <link rel="alternate" type="text/plain" title="AI Crawling Policy" href="/ai.txt" />
    <link rel="author" href="/llms.txt" />

    <!-- Default Structured Data (replaced per-route by SSR engine) -->
    <script type="application/ld+json" data-ssr-default="true">
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "NewsMediaOrganization",
            "@id": "https://www.iamquickagent.com/#organization",
            "name": "iamquickagent.com",
            "url": "https://www.iamquickagent.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=85",
              "width": 1200,
              "height": 630
            },
            "publishingPrinciples": "https://www.iamquickagent.com/editorial-standards"
          },
          {
            "@type": "WebSite",
            "@id": "https://www.iamquickagent.com/#website",
            "url": "https://www.iamquickagent.com/",
            "name": "iamquickagent.com",
            "publisher": { "@id": "https://www.iamquickagent.com/#organization" },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.iamquickagent.com/?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        ]
      }
    </script>

    <!-- CDN Preconnects & Non-Render-Blocking Fonts (eliminates 780ms mobile render block) -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://images.unsplash.com" />
    <link rel="dns-prefetch" href="https://images.unsplash.com" />
    <link
      rel="preload"
      as="style"
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
      media="print"
      onload="this.media='all'"
    />
    <noscript>
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
    </noscript>
    <script type="module" crossorigin src="/assets/index-AWV_xJom.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/ui-icons-Dc2WwlS3.js">
    <link rel="modulepreload" crossorigin href="/assets/react-vendor-CV7oWK-V.js">
    <link rel="modulepreload" crossorigin href="/assets/firebase-vendor-D_4nyJhl.js">
    <link rel="stylesheet" crossorigin href="/assets/index-BxIEm76e.css">
  </head>
  <body class="bg-white text-slate-900 antialiased selection:bg-red-500/20 selection:text-red-900">
    <div id="root"></div>
  </body>
</html>
`.includes('<div id="root">')) {
      return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>iamquickagent.com - Latest Breaking News, Live Updates &amp; Global Headlines</title>
    <meta name="description" content="Live breaking news, real-time headlines, and in-depth reporting across India, World, Business, Tech, Markets, Sports, and Politics with executive takeaways." />
    <meta name="keywords" content="breaking news, latest news, live updates, india news, world headlines, business news, stock markets, technology news, politics, sports, entertainment, explainers" />
    <meta name="news_keywords" content="Breaking News, Live Updates, India News, World Headlines, Politics, Business, Stock Markets, Technology, AI, Sports, Entertainment" />
    <meta name="author" content="iamquickagent.com Newsroom" />
    <meta name="generator" content="iamquickagent News Engine" />

    <!-- Canonical URL (dynamically updated per page by SSR & client router) -->
    <link rel="canonical" href="https://www.iamquickagent.com/" />

    <!-- OpenGraph Social Cards -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="iamquickagent.com" />
    <meta property="og:title" content="iamquickagent.com - Latest Breaking News, Live Updates &amp; Global Headlines" />
    <meta property="og:description" content="Live breaking news, real-time headlines, and in-depth reporting across India, World, Business, Tech, Markets, Sports, and Politics with executive takeaways." />
    <meta property="og:url" content="https://www.iamquickagent.com/" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=85" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="iamquickagent.com - Breaking News &amp; Live Headlines" />

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@iamquickagent" />
    <meta name="twitter:creator" content="@narayan_shukla" />
    <meta name="twitter:title" content="iamquickagent.com - Latest Breaking News, Live Updates &amp; Global Headlines" />
    <meta name="twitter:description" content="Live breaking news, real-time headlines, and in-depth reporting across India, World, Business, Tech, Markets, Sports, and Politics with executive takeaways." />
    <meta name="twitter:image" content="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=85" />

    <!-- Crawlers & Verification -->
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta name="google-site-verification" content="YFePTkFdMD9NtIIhg0fvDinPB8VPmTbH3Ahozp_tIqU" />

    <!-- Mobile Optimization & Web App Manifest -->
    <meta name="theme-color" content="#b91c1c" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="iamquickagent" />
    <meta name="format-detection" content="telephone=no" />
    <link rel="manifest" href="/manifest.webmanifest" />

    <!-- Feeds, Sitemaps & AI Directives -->
    <link rel="alternate" type="application/rss+xml" title="iamquickagent RSS Feed" href="/rss.xml" />
    <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
    <link rel="alternate" type="text/plain" title="AI Crawling Policy" href="/ai.txt" />
    <link rel="author" href="/llms.txt" />

    <!-- Default Structured Data (replaced per-route by SSR engine) -->
    <script type="application/ld+json" data-ssr-default="true">
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "NewsMediaOrganization",
            "@id": "https://www.iamquickagent.com/#organization",
            "name": "iamquickagent.com",
            "url": "https://www.iamquickagent.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=85",
              "width": 1200,
              "height": 630
            },
            "publishingPrinciples": "https://www.iamquickagent.com/editorial-standards"
          },
          {
            "@type": "WebSite",
            "@id": "https://www.iamquickagent.com/#website",
            "url": "https://www.iamquickagent.com/",
            "name": "iamquickagent.com",
            "publisher": { "@id": "https://www.iamquickagent.com/#organization" },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.iamquickagent.com/?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        ]
      }
    </script>

    <!-- CDN Preconnects & Non-Render-Blocking Fonts (eliminates 780ms mobile render block) -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://images.unsplash.com" />
    <link rel="dns-prefetch" href="https://images.unsplash.com" />
    <link
      rel="preload"
      as="style"
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
      media="print"
      onload="this.media='all'"
    />
    <noscript>
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
    </noscript>
    <script type="module" crossorigin src="/assets/index-AWV_xJom.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/ui-icons-Dc2WwlS3.js">
    <link rel="modulepreload" crossorigin href="/assets/react-vendor-CV7oWK-V.js">
    <link rel="modulepreload" crossorigin href="/assets/firebase-vendor-D_4nyJhl.js">
    <link rel="stylesheet" crossorigin href="/assets/index-BxIEm76e.css">
  </head>
  <body class="bg-white text-slate-900 antialiased selection:bg-red-500/20 selection:text-red-900">
    <div id="root"></div>
  </body>
</html>
`;
    }
  } catch {
  }
  const possiblePaths = [
    path2.join(process.cwd(), "dist", "index.html"),
    path2.join(process.cwd(), "index.html")
  ];
  for (const p of possiblePaths) {
    try {
      if (fs2.existsSync(p)) {
        return fs2.readFileSync(p, "utf-8");
      }
    } catch {
    }
  }
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>iamquickagent.com</title></head><body><div id="root"></div></body></html>`;
}
async function handleSsrRequest(req, res) {
  try {
    const rawUrl = req?.url || "/";
    const parsedUrl = new URL(rawUrl, SITE_URL);
    const routeParam = (typeof req?.query?.__route === "string" ? req.query.__route : parsedUrl.searchParams.get("__route")) || "";
    const pathname = routeParam || (parsedUrl.pathname === "/api/ssr" || parsedUrl.pathname === "/api/ssr/" ? "/" : parsedUrl.pathname);
    const legacyArticleMatch = pathname.match(/^\/article\/([a-zA-Z0-9-_]+)\/?$/);
    if (legacyArticleMatch) {
      const slug = legacyArticleMatch[1];
      res.setHeader("Location", `${SITE_URL}/news/${encodeURIComponent(slug)}`);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.status(301).end();
    }
    const templateHtml = getTemplateHtml();
    const legalPage = getLegalPageByPath(pathname);
    if (legalPage) {
      const ssrHtml = renderLegalSsrHtml(legalPage, templateHtml);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400");
      return res.status(200).send(ssrHtml);
    }
    const newsMatch = pathname.match(/^\/news\/([a-zA-Z0-9-_]+)\/?$/);
    if (newsMatch) {
      const slug = newsMatch[1];
      const [article, allArticles2, authors2] = await Promise.all([
        getServerArticleBySlug(slug),
        getAllServerArticles(),
        getAllServerAuthors()
      ]);
      if (article) {
        const ssrHtml = renderArticleSsrHtml(article, templateHtml, authors2, allArticles2);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=86400");
        return res.status(200).send(ssrHtml);
      }
    }
    const authorMatch = pathname.match(/^\/author\/([a-zA-Z0-9-_]+)\/?$/);
    if (authorMatch) {
      const authorId = authorMatch[1];
      const [author, allArticles2] = await Promise.all([
        getServerAuthorById(authorId),
        getAllServerArticles()
      ]);
      if (author) {
        const ssrHtml = renderAuthorSsrHtml(author, allArticles2, templateHtml);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=300, s-maxage=900, stale-while-revalidate=86400");
        return res.status(200).send(ssrHtml);
      }
    }
    const [allArticles, authors] = await Promise.all([
      getAllServerArticles(),
      getAllServerAuthors()
    ]);
    const categoryParam = parsedUrl.searchParams.get("category") || void 0;
    const homeHtml = renderHomeSsrHtml(allArticles, templateHtml, categoryParam, authors);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=180, stale-while-revalidate=86400");
    return res.status(200).send(homeHtml);
  } catch (err) {
    console.error("SSR Handler error:", err?.message || err);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(getTemplateHtml());
  }
}
function resolveFeedType(req) {
  const queryType = typeof req?.query?.type === "string" ? req.query.type.toLowerCase().trim() : "";
  if (queryType) return queryType;
  const rawUrl = typeof req?.url === "string" ? req.url : "";
  try {
    const parsed = new URL(rawUrl, SITE_URL);
    const urlType = (parsed.searchParams.get("type") || "").toLowerCase().trim();
    if (urlType) return urlType;
    const pathname = parsed.pathname.toLowerCase();
    if (pathname.includes("news-sitemap")) return "news-sitemap";
    if (pathname.includes("sitemap")) return "sitemap";
    if (pathname.includes("robots")) return "robots";
    if (pathname.includes("ai.txt") || pathname.endsWith("/ai")) return "ai";
    if (pathname.includes("rss") || pathname.includes("feed")) return "rss";
    if (pathname.includes("llms-full")) return "llms-full";
    if (pathname.includes("llms")) return "llms";
  } catch {
  }
  return "sitemap";
}
async function handleSeoRequest(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const feedType = resolveFeedType(req);
  try {
    switch (feedType) {
      case "robots": {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.status(200).send(generateRobotsTxt());
      }
      case "ai": {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.status(200).send(generateAiTxt());
      }
      case "news-sitemap": {
        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=300, s-maxage=900, stale-while-revalidate=86400");
        const articles = await getAllServerArticles(true);
        return res.status(200).send(generateNewsSitemapXml(articles));
      }
      case "rss": {
        res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=600, s-maxage=1800, stale-while-revalidate=86400");
        const [articles, authors] = await Promise.all([
          getAllServerArticles(),
          getAllServerAuthors()
        ]);
        return res.status(200).send(generateRssXml(articles, authors));
      }
      case "llms":
      case "llms-full": {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=600, s-maxage=1800, stale-while-revalidate=86400");
        const articles = await getAllServerArticles();
        return res.status(200).send(generateLlmsTxt(articles, feedType === "llms-full"));
      }
      case "sitemap":
      default: {
        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=300, s-maxage=900, stale-while-revalidate=86400");
        const [articles, authors] = await Promise.all([
          getAllServerArticles(true),
          getAllServerAuthors()
        ]);
        return res.status(200).send(generateSitemapXml(articles, authors));
      }
    }
  } catch (err) {
    console.error(`Error generating dynamic SEO endpoint (${feedType}):`, err?.message || err);
    if (feedType === "rss") {
      res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
      return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel></channel></rss>');
    }
    if (feedType === "robots" || feedType === "ai" || feedType === "llms" || feedType === "llms-full") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(500).send("# iamquickagent.com\n");
    }
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
}
export {
  handleSeoRequest,
  handleSsrRequest
};
