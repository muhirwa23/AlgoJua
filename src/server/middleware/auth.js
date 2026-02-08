import jwt from 'jsonwebtoken';
import { config } from '../lib/config.js';

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    // Attach full admin identity to request
    req.admin = {
      id: decoded.id || 'admin-1',
      username: decoded.username || 'admin',
      role: decoded.role || 'admin',
      ip: decoded.ip
    };
    next();
  } catch (error) {
    console.error('Auth verification error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
    }
    return res.status(401).json({ error: 'Authentication failed', code: 'AUTH_FAILED' });
  }
};

export const createToken = (username, ip) => {
  const payload = {
    id: 'admin-1',
    username: username || 'admin',
    role: 'admin',
    ip: ip,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(
    payload,
    config.jwtSecret,
    { expiresIn: '8h' }
  );
};
