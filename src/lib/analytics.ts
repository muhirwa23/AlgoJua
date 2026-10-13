import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getConsentState } from "./consent";

export type AnalyticsEventName =
  | "page_view"
  | "article_engagement_25"
  | "article_engagement_50"
  | "article_engagement_75"
  | "article_engagement_90"
  | "site_search"
  | "job_detail_view"
  | "job_apply_click"
  | "newsletter_signup_start"
  | "newsletter_signup_success"
  | "affiliate_link_click"
  | "outbound_link_click";

export const ALLOWED_EVENT_NAMES: AnalyticsEventName[] = [
  "page_view",
  "article_engagement_25",
  "article_engagement_50",
  "article_engagement_75",
  "article_engagement_90",
  "site_search",
  "job_detail_view",
  "job_apply_click",
  "newsletter_signup_start",
  "newsletter_signup_success",
  "affiliate_link_click",
  "outbound_link_click",
];

export interface AnalyticsEventPayload {
  event_name: AnalyticsEventName;
  page_path: string;
  referrer_domain?: string;
  session_id: string;
  device_category?: "mobile" | "tablet" | "desktop";
  content_type?: string;
  content_id?: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

// Local dev event store for fallback when server API is not available locally
const LOCAL_EVENT_STORAGE_KEY = "algojua_local_analytics_events";

export function sanitizePath(rawPath: string): string {
  try {
    const url = new URL(rawPath, typeof window !== "undefined" ? window.location.origin : "https://www.algojua.top");
    let pathname = url.pathname;
    // Strip trailing slash if present
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    // Remove query params that might contain tokens/secrets (e.g., ?token=xyz, ?email=abc)
    // Keep only non-sensitive query keys if needed (e.g., ?category=tech)
    const safeSearchParams = new URLSearchParams();
    const safeKeys = ["category", "q", "type", "sort"];
    url.searchParams.forEach((val, key) => {
      if (safeKeys.includes(key.toLowerCase())) {
        safeSearchParams.set(key, val.slice(0, 100));
      }
    });

    const searchStr = safeSearchParams.toString();
    return searchStr ? `${pathname}?${searchStr}` : pathname;
  } catch (err) {
    return "/";
  }
}

export function sanitizeReferrer(rawReferrer?: string): string {
  if (!rawReferrer) return "direct";
  try {
    const url = new URL(rawReferrer);
    if (typeof window !== "undefined" && url.hostname === window.location.hostname) {
      return "internal";
    }
    return url.hostname.replace(/^www\./, "");
  } catch (err) {
    return "direct";
  }
}

export function getDeviceCategory(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function getAnonymousSessionId(): string {
  if (typeof window === "undefined") return "server_session";
  try {
    let sid = sessionStorage.getItem("algojua_sid");
    if (!sid) {
      sid = `s_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
      sessionStorage.setItem("algojua_sid", sid);
    }
    return sid;
  } catch (err) {
    return "anon_session";
  }
}

export async function trackEvent(
  eventName: AnalyticsEventName,
  properties: Record<string, unknown> = {}
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const consent = getConsentState();
  if (!consent.analytics) {
    return false;
  }

  if (!ALLOWED_EVENT_NAMES.includes(eventName)) {
    console.warn("Analytics: Blocked unlisted event name:", eventName);
    return false;
  }

  const payload: AnalyticsEventPayload = {
    event_name: eventName,
    page_path: sanitizePath(window.location.pathname + window.location.search),
    referrer_domain: sanitizeReferrer(document.referrer),
    session_id: getAnonymousSessionId(),
    device_category: getDeviceCategory(),
    content_type: (properties.content_type as string) || undefined,
    content_id: (properties.content_id as string) || undefined,
    properties,
    timestamp: new Date().toISOString(),
  };

  try {
    // Send to Vercel API endpoint
    const response = await fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Fall back to storing locally in sessionStorage for dev or offline mode
      saveEventToLocalFallback(payload);
    }
    return true;
  } catch (err) {
    // Save to local fallback store if network/server API is unreachable
    saveEventToLocalFallback(payload);
    return false;
  }
}

function saveEventToLocalFallback(payload: AnalyticsEventPayload): void {
  try {
    const existingStr = localStorage.getItem(LOCAL_EVENT_STORAGE_KEY);
    const existing: AnalyticsEventPayload[] = existingStr ? JSON.parse(existingStr) : [];
    // Keep max 200 events locally
    const updated = [payload, ...existing].slice(0, 200);
    localStorage.setItem(LOCAL_EVENT_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    // Ignore storage errors
  }
}

export function getLocalFallbackEvents(): AnalyticsEventPayload[] {
  try {
    const existingStr = localStorage.getItem(LOCAL_EVENT_STORAGE_KEY);
    return existingStr ? JSON.parse(existingStr) : [];
  } catch (e) {
    return [];
  }
}

// React Router Page Tracking & Scroll Engagement Hook
export function usePageAnalytics() {
  const location = useLocation();
  const lastPathRef = useRef<string>("");
  const engagementMilestonesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const currentPath = sanitizePath(location.pathname + location.search);
    if (lastPathRef.current === currentPath) return;

    lastPathRef.current = currentPath;
    engagementMilestonesRef.current.clear();

    // Track Page View
    trackEvent("page_view", {
      title: document.title,
    });

    // Setup scroll depth listener for article engagement
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);

      const milestones: Array<25 | 50 | 75 | 90> = [25, 50, 75, 90];
      milestones.forEach((m) => {
        if (scrollPercent >= m && !engagementMilestonesRef.current.has(m)) {
          engagementMilestonesRef.current.add(m);
          trackEvent(`article_engagement_${m}` as AnalyticsEventName, {
            scroll_depth: m,
            page_path: currentPath,
          });
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname, location.search]);
}
