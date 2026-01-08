import express from 'express';
import crypto from 'crypto';
import { config } from '../lib/config.js';
import { sessions, createSession } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' }
});

const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_TIME = 15 * 60 * 1000;

router.post('/login', authLimiter, async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  
  if (attempts.count >= MAX_LOGIN_ATTEMPTS && Date.now() - attempts.lastAttempt < LOGIN_LOCKOUT_TIME) {
    return res.status(429).json({ error: 'Too many failed attempts. Please try again later.' });
  }
  
  const { password } = req.body;
  
  if (!password || typeof password !== 'string' || password.length > 100) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  const trimmedInput = password.trim();
  const trimmedEnv = (config.adminPassword || '').trim();

  const passwordHash = crypto.createHash('sha256').update(trimmedInput).digest();
  const envHash = crypto.createHash('sha256').update(trimmedEnv).digest();
  
  try {
    const isValid = crypto.timingSafeEqual(passwordHash, envHash);
    
    if (!isValid) {
      loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: Date.now() });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    loginAttempts.delete(ip);
    const token = createSession(ip);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ valid: false });
  }
  
  const session = sessions.get(token);
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return res.status(401).json({ valid: false });
  }
  
  res.json({ valid: true });
});

router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true });
});

export default router;
