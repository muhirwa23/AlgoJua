import { describe, it, expect } from "vitest";
import { isAllowedAffiliateUrl, ALLOWED_AFFILIATE_DOMAINS } from "@/config/affiliates";

describe("Affiliate Security Module", () => {
  it("validates allowed destination domains", () => {
    expect(isAllowedAffiliateUrl("https://digitalocean.com/?ref=algojua")).toBe(true);
    expect(isAllowedAffiliateUrl("https://sub.digitalocean.com/page")).toBe(true);
    expect(isAllowedAffiliateUrl("https://github.com/features/actions")).toBe(true);
  });

  it("blocks unapproved or malicious destinations", () => {
    expect(isAllowedAffiliateUrl("https://malicious-phishing-site.com/login")).toBe(false);
    expect(isAllowedAffiliateUrl("https://unapproveddomain.org")).toBe(false);
    expect(isAllowedAffiliateUrl("invalid-url")).toBe(false);
  });
});
