import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "algojua_owner_2025";
const SECRET_KEY = process.env.ADMIN_SECRET || "algojua_secret_key_987654321";

export function generateToken(): string {
  const payload = { role: "owner", exp: Date.now() + 24 * 60 * 60 * 1000 };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [encodedPayload, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", SECRET_KEY).update(encodedPayload).digest("base64url");
    if (signature !== expectedSig) return false;

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"));
    return payload.role === "owner" && payload.exp > Date.now();
  } catch (e) {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { password } = req.body || {};
  if (!password || typeof password !== "string") {
    return res.status(400).json({ error: "Password is required" });
  }

  // Constant-time password comparison
  const inputBuffer = Buffer.from(password);
  const targetBuffer = Buffer.from(ADMIN_PASSWORD);

  if (inputBuffer.length !== targetBuffer.length || !crypto.timingSafeEqual(inputBuffer, targetBuffer)) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = generateToken();
  return res.status(200).json({ success: true, token });
}
