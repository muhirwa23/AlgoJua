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

const cachedJwtSecret = sanitizeEnvValue(process.env.JWT_SECRET) || 'a7b9c3d5e8f1g2h4i6j8k0l2m4n6o8p0q2r4s6t8u0v2w4x6y8z0a2b4c6d8e0f2g4h6i8j0k2l4m6n8o0p2q4r6s8t0u2v4w6x8y0z2a4b6c8d0e2f4g6h8i0j2k4l6m8n0';

export const config = {
  nodeEnv: process.env.NODE_ENV || 'production',
  isProduction: process.env.NODE_ENV === 'production' || true,
  port: parseIntSafe(process.env.PORT, 3001),
  host: sanitizeEnvValue(process.env.HOST) || '0.0.0.0',
  baseUrl: sanitizeEnvValue(process.env.BASE_URL) || 'https://www.algojua.top',
  databaseUrl: sanitizeEnvValue(process.env.DATABASE_URL) || 'postgresql://neondb_owner:npg_Ha0FlrjhGsP1@ep-sparkling-pond-a96azzph-pooler.gwc.azure.neon.tech/neondb?sslmode=require',
  dbPoolMax: Math.min(parseIntSafe(process.env.DB_POOL_MAX, 20), 100),
  dbIdleTimeout: parseIntSafe(process.env.DB_IDLE_TIMEOUT, 30000),
  dbConnTimeout: parseIntSafe(process.env.DB_CONN_TIMEOUT, 5000),
  r2: {
    endpoint: sanitizeEnvValue(process.env.R2_ENDPOINT) || 'https://533ff639afbd08fda6f465e095a0b439.r2.cloudflarestorage.com',
    accessKeyId: sanitizeEnvValue(process.env.R2_ACCESS_KEY_ID) || 'f8120a8e1f5d75fda5d73be74429bd9a',
    secretAccessKey: sanitizeEnvValue(process.env.R2_SECRET_ACCESS_KEY) || 'e4c20a2b01c6351c6f314fed162fcc584a17fc50376f04ef4788a13e82a8e78d',
    bucketName: sanitizeEnvValue(process.env.R2_BUCKET_NAME) || 'muhirwa',
    publicUrl: sanitizeEnvValue(process.env.R2_PUBLIC_URL) || 'https://533ff639afbd08fda6f465e095a0b439.r2.cloudflarestorage.com/muhirwa',
  },
  resendApiKey: sanitizeEnvValue(process.env.RESEND_API_KEY) || 're_6S3fNhZt_8Tt4itzHYtV77wPvMVRVp86o',
  jwtSecret: cachedJwtSecret,
  jwtExpiresIn: sanitizeEnvValue(process.env.JWT_EXPIRES_IN) || '8h',
  allowedOrigins: (() => {
    const origins = (process.env.ALLOWED_ORIGINS || 'https://www.algojua.top,https://algojua.top,https://algo-jua.vercel.app,http://localhost:8080,http://localhost:5173,http://127.0.0.1:5173')
      .split(',').map(o => sanitizeEnvValue(o)).filter(Boolean);
    
    const baseUrl = sanitizeEnvValue(process.env.BASE_URL) || 'https://www.algojua.top';
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
  adminPassword: sanitizeEnvValue(process.env.ADMIN_PASSWORD) || 'Neju098!?',
  bcryptRounds: parseIntSafe(process.env.BCRYPT_ROUNDS, 12),
};

export const validateConfig = () => {
  const recommended = ['DATABASE_URL', 'R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'RESEND_API_KEY', 'JWT_SECRET', 'ADMIN_PASSWORD'];
  
  const missingRecommended = recommended.filter(key => !process.env[key]);
  
  if (missingRecommended.length > 0 && config.isProduction) {
    console.warn(`NOTICE: Some environment variables are not set in Vercel. Using hardcoded production fallbacks for: ${missingRecommended.join(', ')}`);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('WARNING: JWT_SECRET should be at least 32 characters for security');
  }
};
