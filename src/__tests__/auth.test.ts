import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateToken, verifyToken } from "../../api/auth/login";

describe("Admin Authentication Security", () => {
  const original = { ...process.env };

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "test-password";
    process.env.ADMIN_SECRET = "test-secret-that-is-at-least-32-characters-long";
  });

  afterEach(() => {
    process.env = { ...original };
  });

  it("generates and verifies HMAC-SHA256 session tokens", async () => {
    const token = await generateToken();
    expect(typeof token).toBe("string");
    expect(await verifyToken(token)).toBe(true);
  });

  it("rejects forged or corrupted session tokens", async () => {
    const invalidToken = "invalid_token_header.fake_signature";
    expect(await verifyToken(invalidToken)).toBe(false);
  });

  it("rejects tokens signed with a different secret", async () => {
    const token = await generateToken();
    process.env.ADMIN_SECRET = "a-completely-different-secret-of-32-plus-chars";
    expect(await verifyToken(token)).toBe(false);
  });

  it("fails closed when credentials are not configured", async () => {
    const token = await generateToken();
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_SECRET;
    expect(await verifyToken(token)).toBe(false);
    await expect(generateToken()).rejects.toThrow();
  });

  it("fails closed when the secret is too short", async () => {
    process.env.ADMIN_SECRET = "short";
    await expect(generateToken()).rejects.toThrow();
  });
});
