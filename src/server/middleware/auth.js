import jwt from 'jsonwebtoken';
import { config } from '../lib/config.js';

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
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

export const createToken = (ip) => {
  return jwt.sign(
    { ip, role: 'admin' }, 
    config.jwtSecret, 
    { expiresIn: '8h' }
  );
};
