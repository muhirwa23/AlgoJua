import express from 'express';
import crypto from 'crypto';
import { config } from '../lib/config.js';
import { createToken, revokeToken, requireAuth } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_TIME = 15 * 60 * 1000;

const cleanupLoginAttempts = () => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.lastAttempt > LOGIN_LOCKOUT_TIME) {
      loginAttempts.delete(ip);
    }
  }
};

setInterval(cleanupLoginAttempts, 60 * 1000);

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

router.post('/login', authLimiter, async (req, res) => {
  const ip = getClientIp(req);
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  
  if (attempts.count >= MAX_LOGIN_ATTEMPTS && Date.now() - attempts.lastAttempt < LOGIN_LOCKOUT_TIME) {
    const remainingTime = Math.ceil((LOGIN_LOCKOUT_TIME - (Date.now() - attempts.lastAttempt)) / 60000);
    return res.status(429).json({ 
      error: `Too many failed attempts. Please try again in ${remainingTime} minutes.` 
    });
  }
  
  const { password } = req.body;
  
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password.length < 1 || password.length > 128) {
    return res.status(400).json({ error: 'Invalid password format' });
  }
  
  if (!config.adminPassword) {
    return res.status(503).json({ error: 'Authentication not configured' });
  }
  
  const trimmedInput = password.trim();
  const trimmedEnv = config.adminPassword.trim();

  try {
    const passwordHash = crypto.createHash('sha256').update(trimmedInput).digest();
    const envHash = crypto.createHash('sha256').update(trimmedEnv).digest();
    
    const isValid = crypto.timingSafeEqual(passwordHash, envHash);
    
    if (!isValid) {
      loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: Date.now() });
      
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    loginAttempts.delete(ip);
    const token = createToken(ip);
    
    res.json({ 
      token,
      expiresIn: config.jwtExpiresIn
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }
  
  const token = authHeader.slice(7);
  
  if (!token || token.length > 2048) {
    return res.status(401).json({ valid: false });
  }
  
  try {
    jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256']
    });
    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

router.post('/logout', requireAuth, (req, res) => {
  if (req.token) {
    revokeToken(req.token);
  }
  res.json({ success: true });
});

export default router;
