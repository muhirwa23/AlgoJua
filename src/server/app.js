import express from 'express';
import compression from 'compression';
import xss from 'xss';
import validator from 'validator';
import { config, validateConfig } from './lib/config.js';
import { securityMiddleware } from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

// Import routes
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import jobRoutes from './routes/jobs.js';
import categoryRoutes from './routes/categories.js';
import newsletterRoutes from './routes/newsletter.js';
import mediaRoutes from './routes/media.js';

// Validate configuration
validateConfig();

const app = express();

// Security middleware
securityMiddleware(app);

// Basic optimizations
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(config.requestTimeout);
  res.setTimeout(config.requestTimeout);
  next();
});

// Input sanitization middleware
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return xss(validator.trim(str));
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.toLowerCase().includes('password') || key.toLowerCase() === 'email') {
      sanitized[key] = typeof value === 'string' ? validator.trim(value) : value;
      continue;
    }
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => typeof item === 'string' ? sanitizeString(item) : item);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    req.body = sanitizeObject(req.body);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/media', mediaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: config.nodeEnv
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
