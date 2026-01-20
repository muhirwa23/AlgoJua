import express from 'express';
import crypto from 'crypto';
import { config } from '../lib/config.js';
import { createToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

const router = express.Router();

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Neju098!?algo';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' }
});

const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_TIME = 15 * 60 * 1000;

let setupCompleted = true;

router.get('/setup/status', (req, res) => {
  res.json({ setupRequired: false });
});

router.post('/setup', (req, res) => {
  res.status(400).json({ error: 'Setup already completed. Use login instead.' });
});

router.post('/login', authLimiter, async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  
  if (attempts.count >= MAX_LOGIN_ATTEMPTS && Date.now() - attempts.lastAttempt < LOGIN_LOCKOUT_TIME) {
    return res.status(429).json({ error: 'Too many failed attempts. Please try again later.' });
  }
  
  const { username, password } = req.body;
  
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  if (password.length > 100 || username.length > 100) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  const usernameHash = crypto.createHash('sha256').update(trimmedUsername).digest();
  const passwordHash = crypto.createHash('sha256').update(trimmedPassword).digest();
  const expectedUsernameHash = crypto.createHash('sha256').update(ADMIN_USERNAME).digest();
  const expectedPasswordHash = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  
  try {
    const usernameValid = crypto.timingSafeEqual(usernameHash, expectedUsernameHash);
    const passwordValid = crypto.timingSafeEqual(passwordHash, expectedPasswordHash);
    
    if (!usernameValid || !passwordValid) {
      loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: Date.now() });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    loginAttempts.delete(ip);
    const token = createToken(ip);
    res.json({ 
      token,
      admin: {
        id: 1,
        username: ADMIN_USERNAME,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }
  
  try {
    jwt.verify(token, config.jwtSecret);
    res.json({ 
      valid: true,
      admin: {
        id: 1,
        username: ADMIN_USERNAME,
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

router.put('/password', (req, res) => {
  res.status(400).json({ error: 'Password change not supported with hardcoded credentials' });
});

export default router;
