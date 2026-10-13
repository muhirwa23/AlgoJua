-- Migration: AlgoJua Analytics Events Schema
-- Author: AlgoJua Engineering

-- 1. Create analytics_events table
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

-- 2. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_page_path ON public.analytics_events (page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON public.analytics_events (session_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Allow anonymous users to INSERT events (public event collector)
CREATE POLICY "Allow public insert to analytics_events"
    ON public.analytics_events
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Restrict SELECT (Read) privileges STRICTLY to service role / admin authenticated users
CREATE POLICY "Restrict read analytics_events to service role"
    ON public.analytics_events
    FOR SELECT
    TO service_role
    USING (true);
