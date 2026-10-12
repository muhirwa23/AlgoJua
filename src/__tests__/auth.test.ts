import { describe, it, expect } from "vitest";
import { generateToken, verifyToken } from "../../api/auth/login";

describe("Admin Authentication Security", () => {
  it("generates and verifies HMAC-SHA256 session tokens", () => {
    const token = generateToken();
    expect(typeof token).toBe("string");
    expect(verifyToken(token)).toBe(true);
  });

  it("rejects forged or corrupted session tokens", () => {
    const invalidToken = "invalid_token_header.fake_signature";
    expect(verifyToken(invalidToken)).toBe(false);
  });
});
