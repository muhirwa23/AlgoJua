import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyToken } from "./login";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ authenticated: false, error: "Unauthorized" });
  }

  return res.status(200).json({ authenticated: true });
}
