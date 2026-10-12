import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyToken } from "../auth/login";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Require Authorization Bearer Token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token || !(await verifyToken(token))) {
    return res.status(401).json({ error: "Unauthorized access to private analytics" });
  }

  const { timeframe = "7d", device = "all", category = "all" } = req.query || {};

  const daysMap: Record<string, number> = {
    "24h": 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };
  const days = daysMap[String(timeframe)] || 7;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // If Supabase credentials are not set, return empty state response structure with setup flag
    return res.status(200).json({
      configured: false,
      message: "Supabase database credentials not configured in environment.",
      timeframe,
      days,
      metrics: {
        totalPageViews: 0,
        uniqueSessions: 0,
        engagedSessions: 0,
        newsletterConversions: 0,
        affiliateClicks: 0,
        jobApplyClicks: 0,
      },
      timeSeries: [],
      topPages: [],
      acquisitionChannels: [],
      deviceBreakdown: [],
      categoryPerformance: [],
      engagementMilestones: [],
      lastEventAt: null,
    });
  }

  try {
    // Query events from Supabase REST API
    let url = `${supabaseUrl}/rest/v1/analytics_events?created_at=gte.${startDate}&order=created_at.desc&limit=2000`;
    if (device !== "all") {
      url += `&device_category=eq.${device}`;
    }

    const response = await fetch(url, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Failed to query Supabase analytics:", errText);
      return res.status(500).json({ error: "Failed to fetch database events" });
    }

    const events: Array<{
      id: string;
      event_name: string;
      page_path: string;
      referrer_domain: string;
      session_id: string;
      device_category: string;
      created_at: string;
      properties?: Record<string, unknown>;
    }> = await response.json();

    // Process aggregations
    const totalPageViews = events.filter((e) => e.event_name === "page_view").length;
    const uniqueSessions = new Set(events.map((e) => e.session_id)).size;
    const engagedSessions = new Set(
      events
        .filter((e) => e.event_name.startsWith("article_engagement_") || e.event_name === "newsletter_signup_success")
        .map((e) => e.session_id)
    ).size;

    const newsletterConversions = events.filter((e) => e.event_name === "newsletter_signup_success").length;
    const affiliateClicks = events.filter((e) => e.event_name === "affiliate_link_click").length;
    const jobApplyClicks = events.filter((e) => e.event_name === "job_apply_click").length;
    const lastEventAt = events.length > 0 ? events[0].created_at : null;

    // Time series grouping (by date)
    const timeSeriesMap: Record<string, { date: string; pageViews: number; sessions: Set<string> }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      timeSeriesMap[d] = { date: d, pageViews: 0, sessions: new Set() };
    }

    events.forEach((e) => {
      const d = e.created_at.split("T")[0];
      if (timeSeriesMap[d]) {
        if (e.event_name === "page_view") {
          timeSeriesMap[d].pageViews += 1;
        }
        timeSeriesMap[d].sessions.add(e.session_id);
      }
    });

    const timeSeries = Object.values(timeSeriesMap).map((item) => ({
      date: item.date,
      pageViews: item.pageViews,
      sessions: item.sessions.size,
    }));

    // Top Pages
    const pageMap: Record<string, number> = {};
    events
      .filter((e) => e.event_name === "page_view")
      .forEach((e) => {
        pageMap[e.page_path] = (pageMap[e.page_path] || 0) + 1;
      });

    const topPages = Object.entries(pageMap)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Referrers / Acquisition Channels
    const refMap: Record<string, number> = {};
    events.forEach((e) => {
      const ref = e.referrer_domain || "direct";
      refMap[ref] = (refMap[ref] || 0) + 1;
    });

    const acquisitionChannels = Object.entries(refMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Device breakdown
    const devMap: Record<string, number> = {};
    events.forEach((e) => {
      const dev = e.device_category || "desktop";
      devMap[dev] = (devMap[dev] || 0) + 1;
    });

    const deviceBreakdown = Object.entries(devMap).map(([device, count]) => ({ device, count }));

    // Engagement Milestones
    const engagementMilestones = [
      { milestone: "25%", count: events.filter((e) => e.event_name === "article_engagement_25").length },
      { milestone: "50%", count: events.filter((e) => e.event_name === "article_engagement_50").length },
      { milestone: "75%", count: events.filter((e) => e.event_name === "article_engagement_75").length },
      { milestone: "90%", count: events.filter((e) => e.event_name === "article_engagement_90").length },
    ];

    return res.status(200).json({
      configured: true,
      timeframe,
      days,
      metrics: {
        totalPageViews,
        uniqueSessions,
        engagedSessions,
        newsletterConversions,
        affiliateClicks,
        jobApplyClicks,
      },
      timeSeries,
      topPages,
      acquisitionChannels,
      deviceBreakdown,
      engagementMilestones,
      lastEventAt,
    });
  } catch (err) {
    console.error("Query API Exception:", err);
    return res.status(500).json({ error: "Failed to execute analytics query" });
  }
}
