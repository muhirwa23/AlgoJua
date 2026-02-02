import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import { config } from '../lib/config.js';

export const securityMiddleware = (app) => {
  app.set('trust proxy', 1);
  
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https:"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }));

  app.use(hpp());
  app.disable('x-powered-by');

    const corsOptions = {
      origin: (origin, callback) => {
        if (!origin || process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }

        const isAllowed = config.allowedOrigins.includes(origin) || 
                         origin.endsWith('.vercel.app') || 
                         origin.includes('algojua.top') ||
                         origin.includes('localhost') ||
                         origin.includes('127.0.0.1');

        if (isAllowed) {
          callback(null, true);
        } else {
          // Instead of erroring, we can log and allow or just return false
          console.warn(`[CORS] Rejected origin: ${origin}`);
          callback(null, false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      maxAge: 86400,
      preflightContinue: false,
      optionsSuccessStatus: 204
    };

  app.use(cors(corsOptions));

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
    skip: (req) => req.path === '/api/health'
  });

  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' }
  });

  const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Upload limit reached, please try again later' }
  });

  app.use('/api/', generalLimiter);
  app.use('/api/auth/', strictLimiter);
  app.use('/api/media', uploadLimiter);
  app.use('/api/upload', uploadLimiter);
};
