# AlgoJua Analytics Engine Architecture & Privacy Documentation

This document describes the privacy-first analytics system built for AlgoJua, including event taxonomy, data schemas, serverless ingestion, and authentication security.

---

## 1. Privacy-First Principles & Data Minimization

AlgoJua's custom analytics engine adheres to strict privacy and data minimization standards:

1. **No Raw IP Storage:** IP addresses are never written to database logs or transmitted to frontend analytical models.
2. **Path & URL Sanitization:** URL parameters that may contain personal tokens, emails, or password reset secrets are automatically stripped (`sanitizePath()`).
3. **No Persistent Cross-Site Identifiers:** Sessions use short-lived, browser-scoped session IDs (`sessionStorage`), preventing cross-site visitor tracking.
4. **Consent Enforcement:** Analytics tracking only fires when the visitor grants analytics consent via the Cookie Consent banner or preferences dialog (`getConsentState().analytics`).
5. **Data Retention & Aggregation:** Raw event logs are automatically scheduled for purge after 90 days. Long-term trends are stored in aggregated statistics.

---

## 2. Event Taxonomy

AlgoJua tracks a focused, allowlisted event taxonomy:

| Event Name | Description | Trigger |
| :--- | :--- | :--- |
| `page_view` | Virtual or direct page view | Route transition or page load |
| `article_engagement_25` | Reader reached 25% scroll depth | Active article page scrolling |
| `article_engagement_50` | Reader reached 50% scroll depth | Active article page scrolling |
| `article_engagement_75` | Reader reached 75% scroll depth | Active article page scrolling |
| `article_engagement_90` | Reader reached 90% scroll depth | Active article page scrolling |
| `site_search` | Visitor executed an article search | 3+ characters entered in search modal |
| `job_detail_view` | Visitor viewed a specific job vacancy | Navigation to `/jobs/:id` |
| `job_apply_click` | Candidate clicked "Apply Now" | Click on job application CTA |
| `newsletter_signup_start` | Visitor submitted email in newsletter form | Newsletter form submit button |
| `newsletter_signup_success` | Email subscription confirmed | Successful confirmation token callback |
| `affiliate_link_click` | Visitor clicked a verified affiliate card | Click on affiliate recommendation link |
| `outbound_link_click` | Outbound external link click | External destination click |

---

## 3. Database Schema (`analytics_events`)

```sql
CREATE TABLE public.analytics_events (
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
```

### Row-Level Security (RLS)
- **Insert Policy:** Public / Anonymous INSERT permitted (allows serverless ingestion).
- **Select Policy:** STRICTLY restricted to `service_role` (prevents public reading of analytics records).

---

## 4. Serverless API Security

1. **Ingestion Endpoint (`/api/analytics/event`)**:
   - Rejects non-POST requests.
   - Enforces a 50KB payload size limit.
   - Validates event names against `ALLOWED_EVENT_NAMES`.
   - Sanitizes paths, session IDs, and referrer domain strings.

2. **Query Endpoint (`/api/analytics/query`)**:
   - Requires HTTP `Authorization: Bearer <token>` header.
   - Token is cryptographically generated and HMAC-SHA256 signed on successful admin authentication (`/api/auth/login`).
   - Unauthenticated or invalid token requests receive HTTP 401 Unauthorized.
