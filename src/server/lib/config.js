import dotenv from 'dotenv';
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '3001'),
  host: process.env.HOST || '0.0.0.0',
  baseUrl: process.env.BASE_URL,
  databaseUrl: process.env.DATABASE_URL,
  dbPoolMax: parseInt(process.env.DB_POOL_MAX || '20'),
  dbIdleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  dbConnTimeout: parseInt(process.env.DB_CONN_TIMEOUT || '5000'),
  r2: {
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    publicUrl: process.env.R2_PUBLIC_URL,
  },
    resendApiKey: process.env.RESEND_API_KEY,
    adminPassword: process.env.ADMIN_PASSWORD,
    jwtSecret: process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'your-fallback-secret-key-change-this',
    allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3000', 'https://algo-jua.netlify.app'],
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
};

export const validateConfig = () => {
  const required = ['DATABASE_URL', 'R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'ADMIN_PASSWORD', 'RESEND_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const error = `FATAL: Missing environment variables: ${missing.join(', ')}`;
    console.error(error);
    if (config.isProduction) process.exit(1);
  }

  if (!config.baseUrl && config.isProduction) {
    console.error('FATAL: BASE_URL environment variable is required in production');
    process.exit(1);
  }
};
