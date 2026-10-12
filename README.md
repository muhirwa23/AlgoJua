# AlgoJua - Tech Jobs, Tools, Trends & Career Insights Platform

AlgoJua is a production-ready technology and career content platform powered by React 18, TypeScript, Vite, Tailwind CSS, Contentful CMS, and Vercel.

---

## 🚀 Key Features

* **Tech Jobs & Careers Portal:** Curated job listings, detailed job role pages, recommended vacancies, and paid/featured job placements (`/jobs`).
* **Content Management System:** Integrated with Contentful CMS for articles, categories, dynamic pages, and media assets.
* **Google AdSense Monetization:** Fully compliant, consent-aware AdSense components (`AdUnit.tsx`) with publisher ID `ca-pub-2719075484276244` and `public/ads.txt`.
* **Affiliate & Partner Monetization:** Reusable affiliate cards (`AffiliateCard.tsx`) with outbound domain security, transparent disclosures, and click event tracking.
* **Granular Cookie Consent:** Privacy-first banner and custom preferences modal supporting Essential, Analytics, and Advertising categories.
* **Private Owner Analytics Dashboard:** Password-protected dashboard at `/admin/analytics` backed by Supabase Postgres and serverless API endpoints.

---

## 🛠️ Local Development & Setup

### Prerequisites
* Node.js 22.x
* npm or bun

### 1. Installation
```bash
git clone https://github.com/muhirwa23/AlgoJua.git
cd AlgoJua
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📊 Running Tests & Quality Checks

```bash
# Run ESLint check
npm run lint

# Run Vitest test suite
npm run test

# Run Production Build
npm run build
```

---

## 🔐 Owner Analytics Dashboard (`/admin/analytics`)

Access the private owner analytics dashboard by navigating to `/admin/analytics`.

* **Default Admin Password (Local Testing):** `algojua_owner_2025`
* **Features:** Total page views, unique sessions, engaged readers, newsletter conversions, affiliate clicks, job application clicks, time series charts, device breakdowns, and top page reports.

---

## 📁 Documentation

* [MONETIZATION.md](./docs/MONETIZATION.md) - Comprehensive monetization strategy, AdSense setup, affiliate rules, and Contentful CMS migration steps.
* [ANALYTICS.md](./docs/ANALYTICS.md) - Analytics architecture, event taxonomy, database schema, and privacy-first design principles.
* [ANALYTICS_SETUP.md](./docs/ANALYTICS_SETUP.md) - Step-by-step setup guide for Supabase Postgres, Vercel API environment variables, and authentication.
