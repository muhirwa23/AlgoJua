import express from 'express';
import crypto from 'crypto';
import { config } from '../lib/config.js';
import { createToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later', code: 'RATE_LIMITED' }
});

const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_TIME = 15 * 60 * 1000;

router.post('/login', authLimiter, async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };

  if (attempts.count >= MAX_LOGIN_ATTEMPTS && Date.now() - attempts.lastAttempt < LOGIN_LOCKOUT_TIME) {
    const remainingTime = Math.ceil((LOGIN_LOCKOUT_TIME - (Date.now() - attempts.lastAttempt)) / 60000);
    return res.status(429).json({
      error: `Too many failed attempts. Please try again in ${remainingTime} minutes.`,
      code: 'LOCKED_OUT'
    });
  }

  const { username, password } = req.body;

  // Validate inputs
  if (!username || typeof username !== 'string' || username.length > 50) {
    return res.status(400).json({ error: 'Username is required', code: 'MISSING_USERNAME' });
  }

  if (!password || typeof password !== 'string' || password.length > 100) {
    return res.status(400).json({ error: 'Password is required', code: 'MISSING_PASSWORD' });
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();
  const trimmedEnv = (config.adminPassword || '').trim();

  // Use timing-safe comparison for password
  const passwordHash = crypto.createHash('sha256').update(trimmedPassword).digest();
  const envHash = crypto.createHash('sha256').update(trimmedEnv).digest();

  try {
    const isValid = crypto.timingSafeEqual(passwordHash, envHash);

    if (!isValid) {
      loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: Date.now() });
      const remainingAttempts = MAX_LOGIN_ATTEMPTS - (attempts.count + 1);
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
        remainingAttempts: Math.max(0, remainingAttempts)
      });
    }

    // Success - clear login attempts and create token with identity
    loginAttempts.delete(ip);
    const token = createToken(trimmedUsername, ip);

    // Return token and user identity
    res.json({
      token,
      admin: {
        id: 'admin-1',
        username: trimmedUsername,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', code: 'SERVER_ERROR' });
  }
});

router.post('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    res.json({
      valid: true,
      admin: {
        id: decoded.id || 'admin-1',
        username: decoded.username || 'admin',
        role: decoded.role || 'admin'
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ valid: false, error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    res.status(401).json({ valid: false, error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
});

router.post('/logout', (req, res) => {
  // Stateless logout: Client just deletes the token
  // Could add token blacklisting here if needed
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
