import dotenv from 'dotenv';
import crypto from 'crypto';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const generateSecureSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

const sanitizeEnvValue = (value) => {
  if (!value || typeof value !== 'string') return value;
  let sanitized = value.trim();
  if ((sanitized.startsWith('"') && sanitized.endsWith('"')) || 
      (sanitized.startsWith("'") && sanitized.endsWith("'"))) {
    sanitized = sanitized.slice(1, -1);
  }
  return sanitized;
};

const parseIntSafe = (value, defaultValue) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
};

const cachedJwtSecret = process.env.JWT_SECRET || generateSecureSecret();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseIntSafe(process.env.PORT, 3001),
  host: sanitizeEnvValue(process.env.HOST) || '0.0.0.0',
    baseUrl: sanitizeEnvValue(process.env.BASE_URL) || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null),
  databaseUrl: sanitizeEnvValue(process.env.DATABASE_URL),
  dbPoolMax: Math.min(parseIntSafe(process.env.DB_POOL_MAX, 20), 100),
  dbIdleTimeout: parseIntSafe(process.env.DB_IDLE_TIMEOUT, 30000),
  dbConnTimeout: parseIntSafe(process.env.DB_CONN_TIMEOUT, 5000),
  r2: {
    endpoint: sanitizeEnvValue(process.env.R2_ENDPOINT),
    accessKeyId: sanitizeEnvValue(process.env.R2_ACCESS_KEY_ID),
    secretAccessKey: sanitizeEnvValue(process.env.R2_SECRET_ACCESS_KEY),
    bucketName: sanitizeEnvValue(process.env.R2_BUCKET_NAME),
    publicUrl: sanitizeEnvValue(process.env.R2_PUBLIC_URL),
  },
  resendApiKey: sanitizeEnvValue(process.env.RESEND_API_KEY),
  jwtSecret: cachedJwtSecret,
  jwtExpiresIn: sanitizeEnvValue(process.env.JWT_EXPIRES_IN) || '8h',
    allowedOrigins: (() => {
      const origins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => sanitizeEnvValue(o)).filter(Boolean)
        : ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5173', 'http://127.0.0.1:5173'];
      
      const baseUrl = sanitizeEnvValue(process.env.BASE_URL);
      if (baseUrl && !origins.includes(baseUrl)) {
        origins.push(baseUrl);
      }
      
      if (process.env.VERCEL_URL) {
        const vercelUrl = `https://${process.env.VERCEL_URL}`;
        if (!origins.includes(vercelUrl)) origins.push(vercelUrl);
      }
      return origins;
    })(),
  requestTimeout: Math.min(parseIntSafe(process.env.REQUEST_TIMEOUT, 30000), 60000),
  adminPassword: sanitizeEnvValue(process.env.ADMIN_PASSWORD),
  bcryptRounds: parseIntSafe(process.env.BCRYPT_ROUNDS, 12),
};

export const validateConfig = () => {
  const required = ['DATABASE_URL'];
  const recommended = ['R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'RESEND_API_KEY'];
  
  const missing = required.filter(key => !process.env[key]);
  const missingRecommended = recommended.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const error = `FATAL: Missing required environment variables: ${missing.join(', ')}`;
    console.error(error);
    console.error('Please ensure these are set in your Vercel Project Settings > Environment Variables');
    if (config.isProduction && !process.env.VERCEL) {
      process.exit(1);
    }
  }

  if (missingRecommended.length > 0 && config.isProduction) {
    console.warn(`WARNING: Missing recommended environment variables: ${missingRecommended.join(', ')}`);
  }

  if (!config.baseUrl && config.isProduction) {
    console.error('FATAL: BASE_URL environment variable is required in production (or VERCEL_URL on Vercel)');
    if (!process.env.VERCEL) process.exit(1);
  }
  
  if (!process.env.JWT_SECRET) {
    if (config.isProduction) {
      console.error('FATAL: JWT_SECRET must be set in production');
      process.exit(1);
    } else {
      console.warn('WARNING: JWT_SECRET not set. Using auto-generated secret.');
    }
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('WARNING: JWT_SECRET should be at least 32 characters for security');
  }
};
