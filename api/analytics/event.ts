import type { VercelRequest, VercelResponse } from "@vercel/node";

const ALLOWED_EVENT_NAMES = [
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enforce POST method
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Enforce body size check
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength > 52428) {
    return res.status(413).json({ error: "Payload Too Large" });
  }

  try {
    const { event_name, page_path, referrer_domain, session_id, device_category, content_type, content_id, properties } = req.body || {};

    if (!event_name || !ALLOWED_EVENT_NAMES.includes(event_name)) {
      return res.status(400).json({ error: "Invalid or unauthorized event_name" });
    }

    if (!page_path || typeof page_path !== "string") {
      return res.status(400).json({ error: "Missing page_path" });
    }

    if (!session_id || typeof session_id !== "string") {
      return res.status(400).json({ error: "Missing session_id" });
    }

    const sanitizedPath = page_path.slice(0, 500);
    const sanitizedSession = session_id.slice(0, 100);
    const sanitizedReferrer = (referrer_domain || "direct").slice(0, 255);
    const sanitizedDevice = ["mobile", "tablet", "desktop"].includes(device_category) ? device_category : "desktop";

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const response = await fetch(`${supabaseUrl}/rest/v1/analytics_events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          event_name,
          page_path: sanitizedPath,
          referrer_domain: sanitizedReferrer,
          session_id: sanitizedSession,
          device_category: sanitizedDevice,
          content_type: content_type ? String(content_type).slice(0, 100) : null,
          content_id: content_id ? String(content_id).slice(0, 255) : null,
          properties: properties && typeof properties === "object" ? properties : {},
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Supabase Analytics Insert Error:", errorText);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Analytics Event API Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
