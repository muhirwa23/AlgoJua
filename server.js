import express from 'express';
import multer from 'multer';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import xss from 'xss';
import validator from 'validator';
import compression from 'compression';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import { Pool } from '@neondatabase/serverless';
import crypto from 'crypto';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

const app = express();

app.use(compression());

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.join(', ')}`));
    }
  }
});

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

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3000', 'https://algo-jua.netlify.app'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '30000');
app.use((req, res, next) => {
  req.setTimeout(REQUEST_TIMEOUT);
  res.setTimeout(REQUEST_TIMEOUT);
  next();
});

if (isProduction) {
  app.set('trust proxy', 1);
}

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return xss(validator.trim(str));
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip sanitization for sensitive fields like password
    if (key.toLowerCase().includes('password')) {
      sanitized[key] = value;
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
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
});

// Session store (in production, use Redis or database)
const sessions = new Map();

const cleanupSessions = () => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
};
setInterval(cleanupSessions, 60 * 60 * 1000);

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const resend = new Resend(process.env.RESEND_API_KEY);

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONN_TIMEOUT || '5000'),
};
const pool = new Pool(poolConfig);

const BASE_URL = process.env.BASE_URL;
if (!BASE_URL && isProduction) {
  console.error('FATAL: BASE_URL environment variable is required in production');
  process.exit(1);
}

const requiredEnvVars = ['DATABASE_URL', 'R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'ADMIN_PASSWORD', 'RESEND_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: ${envVar} environment variable is required`);
    if (isProduction) process.exit(1);
  }
}

const log = (level, message, meta = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
    env: NODE_ENV
  };
  if (isProduction) {
    console.log(JSON.stringify(logEntry));
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, Object.keys(meta).length ? meta : '');
  }
};

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const session = sessions.get(token);
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }
  
  next();
};

app.post('/api/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = req.file.originalname.split('.').pop() || 'png';
    const key = `images/${Date.now()}-${nanoid()}.${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const url = `${process.env.R2_PUBLIC_URL}/${key}`;
    res.json({ url, key });
  } catch (error) {
    console.error('Upload error:', error);
    if (error.message?.includes('Invalid file type')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Upload failed' });
  }
});

const subscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many subscription attempts, please try again later' }
});

app.post('/api/subscribe', subscribeLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    const normalizedEmail = validator.normalizeEmail(email);

    const confirmationToken = nanoid(32);
    const unsubscribeToken = nanoid(32);

    const client = await pool.connect();
    try {
      const result = await client.query(
`INSERT INTO subscribers (email, confirmation_token, unsubscribe_token, status)
           VALUES ($1, $2, $3, 'pending')
           ON CONFLICT (email) 
           DO UPDATE SET 
             confirmation_token = $2,
             unsubscribe_token = $3,
             status = CASE 
               WHEN subscribers.status = 'unsubscribed' THEN 'pending'
               ELSE subscribers.status
             END
           RETURNING *`,
          [normalizedEmail, confirmationToken, unsubscribeToken]
      );

      const subscriber = result.rows[0];
      const confirmUrl = `${BASE_URL}/confirm/${confirmationToken}`;

      await resend.emails.send({
        from: 'Algo Jua <[email protected]>',
        to: email,
        subject: 'Confirm your subscription to Algo Jua',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to Algo Jua!</h2>
            <p>Thank you for subscribing to our newsletter. You'll get the latest insights on AI, technology, and lifestyle.</p>
            <p>Please confirm your email address by clicking the button below:</p>
            <a href="${confirmUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Confirm Subscription</a>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 14px;">${confirmUrl}</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #999; font-size: 12px;">If you didn't subscribe to Algo Jua, you can safely ignore this email.</p>
          </div>
        `,
      });

      res.json({ 
        success: true, 
        message: 'Confirmation email sent. Please check your inbox.',
        status: subscriber.status 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to process subscription' });
  }
});

app.get('/api/confirm/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE subscribers 
         SET status = 'confirmed', confirmation_token = NULL
         WHERE confirmation_token = $1 AND status = 'pending'
         RETURNING *`,
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired confirmation token' });
      }

      const subscriber = result.rows[0];
      const unsubscribeUrl = `${BASE_URL}/unsubscribe/${subscriber.unsubscribe_token}`;

      await resend.emails.send({
        from: 'Algo Jua <[email protected]>',
        to: subscriber.email,
        subject: 'Welcome to Algo Jua Newsletter!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">You're all set! 🎉</h2>
            <p>Your subscription to Algo Jua has been confirmed.</p>
            <p>You'll now receive our weekly digest with the latest articles on:</p>
            <ul style="line-height: 1.8;">
              <li>Artificial Intelligence & Machine Learning</li>
              <li>Technology Trends & Innovations</li>
              <li>Lifestyle & Productivity Tips</li>
              <li>Exclusive AI Tools & Resources</li>
            </ul>
            <p style="margin-top: 30px;">We're excited to have you on board!</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #999; font-size: 12px;">Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a></p>
          </div>
        `,
      });

      res.json({ 
        success: true, 
        message: 'Email confirmed successfully!',
        email: subscriber.email 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm subscription' });
  }
});

app.get('/api/unsubscribe/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE subscribers 
         SET status = 'unsubscribed'
         WHERE unsubscribe_token = $1
         RETURNING *`,
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid unsubscribe token' });
      }

      res.json({ 
        success: true, 
        message: 'You have been unsubscribed successfully',
        email: result.rows[0].email 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// ============ ADMIN AUTH ENDPOINTS ============
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_TIME = 15 * 60 * 1000;

app.post('/api/auth/login', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    
    if (attempts.count >= MAX_LOGIN_ATTEMPTS && Date.now() - attempts.lastAttempt < LOGIN_LOCKOUT_TIME) {
      return res.status(429).json({ error: 'Too many failed attempts. Please try again later.' });
    }
    
    const { password } = req.body;
    
    if (!password || typeof password !== 'string' || password.length > 100) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    
    const trimmedInput = password.trim();
    const trimmedEnv = (process.env.ADMIN_PASSWORD || '').trim();

    // Log for debugging on Vercel (safe: only lengths and existence)
    console.log('Admin login attempt details:', {
      hasEnvPass: !!process.env.ADMIN_PASSWORD,
      inputLen: trimmedInput.length,
      envLen: trimmedEnv.length,
      match: trimmedInput === trimmedEnv
    });

    const passwordHash = crypto.createHash('sha256').update(trimmedInput).digest();
    const envHash = crypto.createHash('sha256').update(trimmedEnv).digest();
    const isValid = crypto.timingSafeEqual(passwordHash, envHash);
    
    if (!isValid) {
      loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: Date.now() });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    loginAttempts.delete(ip);
    
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, {
      createdAt: Date.now(),
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
      ip: ip
    });
    
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ valid: false });
  }
  
  const session = sessions.get(token);
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return res.status(401).json({ valid: false });
  }
  
  res.json({ valid: true });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true });
});

// ============ BLOG POSTS ENDPOINTS ============
app.get('/api/posts', async (req, res) => {
  try {
    const { category, search, limit, offset } = req.query;
    
    let query = 'SELECT * FROM posts WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (category) {
      query += ` AND category = $${paramCount++}`;
      params.push(category);
    }
    
    if (search) {
      query += ` AND (title ILIKE $${paramCount} OR subtitle ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (limit) {
      query += ` LIMIT $${paramCount++}`;
      params.push(parseInt(limit));
    }
    
    if (offset) {
      query += ` OFFSET $${paramCount++}`;
      params.push(parseInt(offset));
    }
    
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.get('/api/posts/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM posts WHERE slug = $1', [slug]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get post by slug error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM posts WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

app.post('/api/posts', requireAuth, async (req, res) => {
  try {
    const { 
      title, subtitle, slug, category, image_url, 
      author_name, author_bio, author_avatar,
      content_introduction, content_sections, content_conclusion,
      tags, read_time, meta_title, meta_description, meta_keywords, og_image
    } = req.body;
    
    const id = nanoid();
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO posts (
          id, title, subtitle, slug, category, image_url,
          author_name, author_bio, author_avatar,
          content_introduction, content_sections, content_conclusion,
          tags, read_time, date, meta_title, meta_description, meta_keywords, og_image
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15, $16, $17, $18)
        RETURNING *`,
        [
          id, title, subtitle, slug, category, image_url,
          author_name || 'Admin', author_bio || '', author_avatar || '',
          content_introduction || '', content_sections || '[]', content_conclusion || '',
          tags || [], read_time || '5 min', meta_title || title, meta_description || subtitle, meta_keywords || [], og_image || image_url
        ]
      );
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.put('/api/posts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, subtitle, slug, category, image_url,
      author_name, author_bio, author_avatar,
      content_introduction, content_sections, content_conclusion,
      tags, read_time, meta_title, meta_description, meta_keywords, og_image
    } = req.body;
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE posts 
         SET title = COALESCE($1, title), subtitle = COALESCE($2, subtitle), 
             slug = COALESCE($3, slug), category = COALESCE($4, category), 
             image_url = COALESCE($5, image_url), author_name = COALESCE($6, author_name),
             author_bio = COALESCE($7, author_bio), author_avatar = COALESCE($8, author_avatar),
             content_introduction = COALESCE($9, content_introduction), 
             content_sections = COALESCE($10, content_sections),
             content_conclusion = COALESCE($11, content_conclusion),
             tags = COALESCE($12, tags), read_time = COALESCE($13, read_time),
             meta_title = COALESCE($14, meta_title), meta_description = COALESCE($15, meta_description),
             meta_keywords = COALESCE($16, meta_keywords), og_image = COALESCE($17, og_image),
             updated_at = NOW(), date_modified = NOW()
         WHERE id = $18
         RETURNING *`,
        [
          title, subtitle, slug, category, image_url,
          author_name, author_bio, author_avatar,
          content_introduction, content_sections, content_conclusion,
          tags, read_time, meta_title, meta_description, meta_keywords, og_image, id
        ]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

app.delete('/api/posts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      res.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ============ JOBS ENDPOINTS ============
app.get('/api/jobs', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM jobs';
    const params = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM jobs WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

app.post('/api/jobs', requireAuth, async (req, res) => {
  try {
    const { 
      title, company, location, type, category, salary, image_url,
      tags, applicants, description, responsibilities, requirements, application_url 
    } = req.body;
    
    const id = nanoid();
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO jobs (
          id, title, company, location, type, category, salary, image_url,
          tags, applicants, description, responsibilities, requirements, 
          application_url, date_posted
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        RETURNING *`,
        [
          id, title, company, location, type || 'Full-time', category || 'Engineering',
          salary || '', image_url || '', tags || [], applicants || '0+',
          description, responsibilities || [], requirements || [], application_url
        ]
      );
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

app.put('/api/jobs/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, company, location, type, category, salary, image_url,
      tags, applicants, description, responsibilities, requirements, application_url 
    } = req.body;
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE jobs 
         SET title = COALESCE($1, title), company = COALESCE($2, company), 
             location = COALESCE($3, location), type = COALESCE($4, type),
             category = COALESCE($5, category), salary = COALESCE($6, salary),
             image_url = COALESCE($7, image_url), tags = COALESCE($8, tags),
             applicants = COALESCE($9, applicants), description = COALESCE($10, description),
             responsibilities = COALESCE($11, responsibilities), requirements = COALESCE($12, requirements),
             application_url = COALESCE($13, application_url), updated_at = NOW()
         WHERE id = $14
         RETURNING *`,
        [
          title, company, location, type, category, salary, image_url,
          tags, applicants, description, responsibilities, requirements, application_url, id
        ]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

app.delete('/api/jobs/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM jobs WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      res.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// ============ R2 DELETE ENDPOINT ============
app.delete('/api/r2/:key', requireAuth, async (req, res) => {
  try {
    const key = req.params.key.replace(/\|/g, '/'); // URL-safe encoding
    
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      })
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete R2 error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// ============ CATEGORIES ENDPOINTS ============
app.get('/api/categories', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM categories ORDER BY name ASC');
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/categories/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM categories WHERE slug = $1', [slug]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

app.post('/api/categories', requireAuth, async (req, res) => {
  try {
    const { name, slug, description, color, icon } = req.body;
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO categories (name, slug, description, color, icon)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, slug, description || null, color || '#3b82f6', icon || '']
      );
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, color, icon } = req.body;
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE categories 
         SET name = $1, slug = $2, description = $3, color = $4, icon = $5, updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [name, slug, description, color, icon, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ============ MEDIA ENDPOINTS ============
app.get('/api/media', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM media ORDER BY created_at DESC');
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

app.get('/api/media/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM media WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Media not found' });
      }
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

app.post('/api/media', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = req.file.originalname.split('.').pop() || 'png';
    const key = `images/${Date.now()}-${nanoid()}.${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const url = `${process.env.R2_PUBLIC_URL}/${key}`;
    const { alt_text, caption } = req.body;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO media (filename, url, r2_key, file_type, file_size, alt_text, caption)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [req.file.originalname, url, key, req.file.mimetype, req.file.size, alt_text || req.file.originalname, caption || '']
      );
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

app.put('/api/media/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, caption } = req.body;
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE media SET alt_text = $1, caption = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
        [alt_text, caption, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Media not found' });
      }
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({ error: 'Failed to update media' });
  }
});

app.delete('/api/media/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      const mediaResult = await client.query('SELECT * FROM media WHERE id = $1', [id]);
      if (mediaResult.rows.length === 0) {
        return res.status(404).json({ error: 'Media not found' });
      }
      
      const media = mediaResult.rows[0];
      
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Key: media.r2_key,
            })
          );
        } catch (r2Error) {
          console.error('Failed to delete from R2:', r2Error);
        }
      
      await client.query('DELETE FROM media WHERE id = $1', [id]);
      res.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// ============ HEALTH CHECK ============
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      res.json({ status: 'healthy', database: 'connected' });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  log('error', 'Server error', { 
    error: err.message, 
    path: req.path, 
    method: req.method,
    ip: req.ip 
  });
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed' });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// Export app for serverless deployment
export default app;

const PORT = parseInt(process.env.PORT || '3001');
const HOST = process.env.HOST || '0.0.0.0';

let server;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server = app.listen(PORT, HOST, () => {
    log('info', `API server running on ${HOST}:${PORT}`, { port: PORT, host: HOST, env: NODE_ENV });
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
}

const gracefulShutdown = async (signal) => {
  log('info', `${signal} received, starting graceful shutdown`);
  
  if (server) {
    server.close(async () => {
      log('info', 'HTTP server closed');
      
      try {
        await pool.end();
        log('info', 'Database pool closed');
      } catch (err) {
        log('error', 'Error closing database pool', { error: err.message });
      }
      
      process.exit(0);
    });
  } else {
    try {
      await pool.end();
      log('info', 'Database pool closed');
    } catch (err) {
      log('error', 'Error closing database pool', { error: err.message });
    }
    process.exit(0);
  }

  setTimeout(() => {
    log('error', 'Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  log('error', 'Uncaught exception', { error: err.message, stack: err.stack });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  log('error', 'Unhandled rejection', { reason: String(reason) });
});