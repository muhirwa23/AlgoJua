import crypto from 'crypto';

// In-memory sessions (in production, consider Redis or database)
export const sessions = new Map();

export const cleanupSessions = () => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
};

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupSessions, 60 * 60 * 1000);
}

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const session = sessions.get(token);
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }
  
  next();
};

export const createSession = (ip) => {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    createdAt: Date.now(),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    ip: ip
  });
  return token;
};
