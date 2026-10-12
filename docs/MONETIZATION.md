# AlgoJua Production Monetization Documentation

This document outlines the active monetization architecture, configuration procedures, business opportunities, Contentful CMS requirements, and future revenue roadmap for AlgoJua.

---

## 1. Active Monetization Foundations

### A. Display Advertising (Google AdSense)
* **Implementation Status:** Fully integrated, consent-aware, and responsive.
* **Publisher Client ID:** `ca-pub-2719075484276244` (Configurable via `VITE_ADSENSE_CLIENT_ID`).
* **Authorized Seller File:** Located at `public/ads.txt`:
  ```
  google.com, pub-2719075484276244, DIRECT, f0082186327838da
  ```
* **Consent Enforcement:** The AdSense script and unit initialization only execute when the visitor grants advertising consent via the Cookie Consent manager.
* **Component Usage:** Reusable `<AdUnit slotId={...} format="auto" | "horizontal" | "vertical" />` component handles React re-renders, SPA route transitions, ad blockers, and empty states cleanly.

### B. Affiliate Recommendations
* **Implementation Status:** Configured via `src/config/affiliates.ts` and rendered via `<AffiliateCard>`.
* **Security & Transparency:**
  * Uses `rel="noopener noreferrer sponsored"` on all outbound affiliate links.
  * Explicit affiliate disclosures on cards and privacy pages.
  * Outbound domain safety validation (`isAllowedAffiliateUrl()`) prevents open redirects.
  * Tracks `affiliate_link_click` events in AlgoJua Analytics.

### C. Sponsored Articles & Placements
* **Implementation Status:** Visual badges and indicators added to `<ArticleCard>` (`isSponsored?: boolean`).
* **Editorial Independence:** Clear "Sponsored Partner" badge keeps paid placements visually distinct from independent editorial articles.

### D. Paid & Featured Job Listings
* **Implementation Status:** Support added for `isFeatured` and `isSponsored` job badges in `<JobListing>`.
* **Employer CTA:** "Post a Job / Sponsor" calls to action placed on the Jobs portal (`/jobs`).

---

## 2. Contentful CMS Model Migration Steps for Monetization

To manage sponsored content and paid job listings dynamically through Contentful, add the following optional fields in your Contentful space:

### 1. `post` Content Type
* `isSponsored` (Boolean) - Toggles the "Sponsored Partner" badge on article cards.
* `sponsorName` (Short text) - Name of sponsoring organization.
* `sponsorUrl` (Short text) - Outbound sponsor link.

### 2. `job` Content Type
* `isFeatured` (Boolean) - Toggles the "Featured" badge on job cards.
* `isSponsored` (Boolean) - Toggles the "Sponsored" highlight on job listings.
* `applyUrl` (Short text) - Direct external application link.

---

## 3. Revenue Roadmap & Future Expansion

1. **Newsletter Sponsorships (`FollowIt` & Direct Sponsors)**
   - Monolithic header & footer banner sponsorship for AlgoJua weekly tech newsletter.
   - Dedicated sponsored email blasts for developer tools & job alerts.

2. **Downloadable Tech Career Assets**
   - Premium interview preparation guides, System Design cheat sheets, and downloadable resume/CV templates.
   - Monetized via Stripe or LemonSqueezy payment links.

3. **Direct Recruiter & Tech Enterprise Partnerships**
   - Tiered hiring packages for employers:
     - **Basic ($99):** 30-day listing.
     - **Featured ($249):** Top placement on `/jobs` + badge + social mention.
     - **Enterprise ($499):** Featured listing + newsletter drop + direct applicant routing.

4. **Additional Ad Networks**
   - Consider Carbon Ads or EthicalAds for privacy-first, developer-centric ads as site traffic grows beyond 50,000 monthly page views.

---

## 4. Troubleshooting & Verification

* **Verifying `ads.txt`:** Visit `https://www.algojua.top/ads.txt`. Ensure response contains `google.com, pub-2719075484276244, DIRECT, f0082186327838da`.
* **Verifying AdSense Setup:** Check AdSense site approval status in Google AdSense Console -> Sites -> Domain Verification.
* **Testing Ad Placements:** Pass slot ID environment variables (`VITE_ADSENSE_ARTICLE_SLOT_ID`, `VITE_ADSENSE_JOBS_SLOT_ID`) to activate live Google ad slots in production.
