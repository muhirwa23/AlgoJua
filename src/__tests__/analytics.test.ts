import { describe, it, expect } from "vitest";
import { sanitizePath, sanitizeReferrer, ALLOWED_EVENT_NAMES } from "@/lib/analytics";

describe("Analytics Module", () => {
  describe("sanitizePath", () => {
    it("strips trailing slash and unsanctioned query parameters", () => {
      const raw = "/article/123/?token=secret123&category=engineering";
      const sanitized = sanitizePath(raw);
      expect(sanitized).toBe("/article/123?category=engineering");
    });

    it("returns root path for invalid URL inputs", () => {
      const sanitized = sanitizePath("http://");
      expect(sanitized).toBe("/");
    });
  });

  describe("sanitizeReferrer", () => {
    it("returns direct when no referrer provided", () => {
      expect(sanitizeReferrer(undefined)).toBe("direct");
      expect(sanitizeReferrer("")).toBe("direct");
    });

    it("extracts clean external domain name", () => {
      expect(sanitizeReferrer("https://www.google.com/search?q=algojua")).toBe("google.com");
      expect(sanitizeReferrer("https://github.com/muhirwa23/AlgoJua")).toBe("github.com");
    });
  });

  describe("Event Taxonomy", () => {
    it("includes required core events", () => {
      expect(ALLOWED_EVENT_NAMES).toContain("page_view");
      expect(ALLOWED_EVENT_NAMES).toContain("article_engagement_50");
      expect(ALLOWED_EVENT_NAMES).toContain("newsletter_signup_success");
      expect(ALLOWED_EVENT_NAMES).toContain("affiliate_link_click");
      expect(ALLOWED_EVENT_NAMES).toContain("job_apply_click");
    });
  });
});
