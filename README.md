# iamquickagent.com — Rapid Digital News & Intelligence Agent

A modern, high-performance, mobile-responsive news publishing platform designed for rapid intelligence briefings, breaking dispatches, and structured executive summaries.

## Core Features

- **Public Reader Interface**:
  - **Breaking News Hero**: Features a mandatory **'Key Takeaway'** executive briefing block.
  - **Live Intelligence Stream**: Real-time ticker tape and chronological breaking feed.
  - **Category Grids**: AI & Technology, Global Intelligence, Markets & Economy, Defense & Cyber, Science & Space, Energy & Climate.
  - **Instant Search**: Fast search modal filtering by headline, takeaways, tags, or author.
  - **Built-in Audio Synthesizer**: Listens to rapid key takeaways via browser Web Speech.
  - **Author Profiles**: Dedicated beats, credentials, bio, and published dispatches.
  - **Reusable Banner Ad Placeholders**: Standard Leaderboard (728x90), MPU (300x250), native inline, and sticky bottom anchor slots.

- **AEO & GEO Optimization**:
  - Semantic HTML hierarchy (`<article>`, `<header>`, `<main>`, `<section>`, `<aside>`).
  - Answer Engine & Generative Engine Optimization tags (`speakable` specification for Google Assistant, Perplexity, SearchGPT).
  - Dynamic JSON-LD `NewsArticle` and `BreadcrumbList` schema markup injected directly into `<head>`.

- **Secure Backend CMS / Dashboard**:
  - Dedicated article editor with headline, auto-generated customizable slug, deck, author selector, category assigner, and dedicated 'Key Takeaway' summary inputs.
  - Live Google SERP and AEO preview.
  - Full article management (Publish, Draft, Edit, Delete, Toggle Breaking).
  - Author management directory.

- **Dual-Mode Persistence (Firebase Firestore + Offline-First Fallback)**:
  - Supports Google Cloud Firebase Firestore for persistent multi-device cloud storage.
  - Built with resilient local repository fallback so the application works out-of-the-box even before adding Firebase keys.

---

## How to Deploy to GitHub & Vercel

### Step 1: Push to GitHub Repository
If you haven't initialized Git yet:
```bash
git init
git add .
git commit -m "feat: initial commit of iamquickagent.com platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/iamquickagent.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** > **"Project"**.
3. Import your GitHub repository (`iamquickagent`).
4. Vercel will automatically detect **Vite**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. (Optional) Add your Firebase environment variables under **Environment Variables** in Vercel:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. Click **Deploy**. Your site will be live on Vercel with automatic SSL and global CDN!

### Step 3: SPA Routing on Vercel
The included `vercel.json` ensures that direct links (e.g. `/article/ai-quantum-shift-2026`) route correctly to the single-page application without 404 errors.

---

## Default Admin Credentials for CMS
- **Access Point**: Click **"Agent CMS"** in the top navigation or footer.
- **Passcode**: `quickagent2026` (or any custom passcode configured in CMS settings).
