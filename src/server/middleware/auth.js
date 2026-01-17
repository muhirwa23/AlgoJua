import jwt from 'jsonwebtoken';
import { config } from '../lib/config.js';

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ error: 'Invalid token structure' });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('Auth verification error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const createToken = (adminData) => {
  const payload = typeof adminData === 'object' 
    ? { id: adminData.id, username: adminData.username, role: adminData.role }
    : { ip: adminData, role: 'ADMIN' };
    
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '8h' });
};
