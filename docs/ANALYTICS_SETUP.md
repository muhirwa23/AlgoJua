# AlgoJua Owner Analytics Setup Guide

This guide details how to set up Supabase Postgres, configure Vercel environment variables, and log in to your owner dashboard at `/admin/analytics`.

---

## 1. Supabase Database Setup

1. Create a free Supabase project at [https://supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Paste and run the SQL migration script from `supabase/migrations/20250320000000_analytics_schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(100) NOT NULL,
    page_path TEXT NOT NULL,
    referrer_domain VARCHAR(255) DEFAULT 'direct',
    session_id VARCHAR(100) NOT NULL,
    device_category VARCHAR(50) DEFAULT 'desktop',
    content_type VARCHAR(100),
    content_id VARCHAR(255),
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_page_path ON public.analytics_events (page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON public.analytics_events (session_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to analytics_events"
    ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Restrict read analytics_events to service role"
    ON public.analytics_events FOR SELECT TO service_role USING (true);
```

4. Go to **Project Settings -> API** in Supabase and copy:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (keep secret!)

---

## 2. Environment Variables Configuration

In Vercel (or your `.env.local` file), configure the following environment variables:

```env
# Contentful CMS
VITE_CONTENTFUL_SPACE_ID=your_contentful_space_id
VITE_CONTENTFUL_ACCESS_TOKEN=your_contentful_delivery_token
VITE_CONTENTFUL_PREVIEW_TOKEN=your_contentful_preview_token
VITE_CONTENTFUL_ENVIRONMENT=master

# AdSense Configuration
VITE_ADSENSE_CLIENT_ID=ca-pub-2719075484276244
VITE_ADSENSE_ARTICLE_SLOT_ID=your_article_slot_id
VITE_ADSENSE_JOBS_SLOT_ID=your_jobs_slot_id

# Supabase Analytics Database
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Dashboard Authentication
ADMIN_PASSWORD=your_secure_owner_password
ADMIN_SECRET=your_random_crypto_secret_key
```

---

## 3. Accessing the Owner Dashboard

1. Open your browser and navigate to `https://www.algojua.top/admin/analytics`.
2. Enter the value configured in `ADMIN_PASSWORD` (default for local testing: `algojua_owner_2025`).
3. View real-time page views, unique sessions, engagement metrics, newsletter signups, affiliate link clicks, and traffic acquisition charts.
