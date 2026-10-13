import type { VercelRequest, VercelResponse } from "@vercel/node";

// No fallbacks: if these are not configured, login is disabled and every token is rejected.
// Read at call time so environment changes (and tests) are picked up.
const getAdminPassword = (): string => process.env.ADMIN_PASSWORD || "";
const getSecretKey = (): string => process.env.ADMIN_SECRET || "";
const MIN_SECRET_LENGTH = 32;

function authConfigured(): boolean {
  return getAdminPassword().length > 0 && getSecretKey().length >= MIN_SECRET_LENGTH;
}

function base64UrlEncode(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function hmacSha256(keyStr: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyStr);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const bytes = new Uint8Array(signature);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function generateToken(): Promise<string> {
  if (!authConfigured()) {
    throw new Error("Admin authentication is not configured");
  }
  const payload = { role: "owner", exp: Date.now() + 24 * 60 * 60 * 1000 };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSha256(getSecretKey(), encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifyToken(token: string): Promise<boolean> {
  if (!authConfigured()) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [encodedPayload, signature] = parts;
    const expectedSig = await hmacSha256(getSecretKey(), encodedPayload);
    if (!safeCompareStrings(signature, expectedSig)) return false;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    return payload.role === "owner" && payload.exp > Date.now();
  } catch (e) {
    return false;
  }
}

function safeCompareStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!authConfigured()) {
    console.error("Admin login disabled: set ADMIN_PASSWORD and ADMIN_SECRET (32+ chars) in the environment.");
    return res.status(503).json({ error: "Admin login is not configured" });
  }

  const { password } = req.body || {};
  if (!password || typeof password !== "string") {
    return res.status(400).json({ error: "Password is required" });
  }

  if (!safeCompareStrings(password, getAdminPassword())) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = await generateToken();
  return res.status(200).json({ success: true, token });
}
