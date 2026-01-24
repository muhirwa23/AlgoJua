import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../lib/config.js';

const tokenBlacklist = new Set();

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.slice(7);
  
  if (!token || token.length > 2048) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Token has been revoked' });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'],
      maxAge: config.jwtExpiresIn
    });
    
    if (!decoded.role || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    req.admin = decoded;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

export const createToken = (identifier) => {
  const tokenId = crypto.randomBytes(16).toString('hex');
  return jwt.sign(
    { 
      id: tokenId,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    }, 
    config.jwtSecret, 
    { 
      expiresIn: config.jwtExpiresIn,
      algorithm: 'HS256'
    }
  );
};

export const revokeToken = (token) => {
  if (token) {
    tokenBlacklist.add(token);
    setTimeout(() => tokenBlacklist.delete(token), 8 * 60 * 60 * 1000);
  }
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  const token = authHeader.slice(7);
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256']
    });
    req.admin = decoded;
  } catch (error) {
  }
  
  next();
};
