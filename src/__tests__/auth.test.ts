import { describe, it, expect } from "vitest";
import { generateToken, verifyToken } from "../../api/auth/login";

describe("Admin Authentication Security", () => {
  it("generates and verifies HMAC-SHA256 session tokens", async () => {
    const token = await generateToken();
    expect(typeof token).toBe("string");
    expect(await verifyToken(token)).toBe(true);
  });

  it("rejects forged or corrupted session tokens", async () => {
    const invalidToken = "invalid_token_header.fake_signature";
    expect(await verifyToken(invalidToken)).toBe(false);
  });
});
