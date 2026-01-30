import express from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { query } from '../lib/db.js';
import { s3Client } from '../lib/s3.js';
import { config } from '../lib/config.js';
import { requireAuth } from '../middleware/auth.js';
import validator from 'validator';

const router = express.Router();

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const validateId = (id) => {
  if (!id || typeof id !== 'string') return false;
  const num = parseInt(id, 10);
  return !isNaN(num) && num > 0 && String(num) === id;
};

const sanitizeString = (str, maxLength = 500) => {
  if (!str || typeof str !== 'string') return '';
  return validator.escape(validator.trim(str.slice(0, maxLength)));
};

const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return 'file';
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.join(', ')}`));
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, Math.min(100, parseInt(page, 10) || 1));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;
    
    const result = await query(
      'SELECT * FROM media ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limitNum, offset]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateId(id)) {
      return res.status(400).json({ error: 'Invalid media ID format' });
    }
    
    const result = await query('SELECT * FROM media WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const sanitizedFilename = sanitizeFilename(req.file.originalname);
    const ext = sanitizedFilename.split('.').pop()?.toLowerCase() || 'png';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({ error: 'Invalid file extension' });
    }
    
    const key = `images/${Date.now()}-${nanoid(16)}.${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: config.r2.bucketName,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const url = `${config.r2.publicUrl}/${key}`;
    const { alt_text, caption } = req.body;

    const result = await query(
      `INSERT INTO media (filename, url, r2_key, file_type, file_size, alt_text, caption)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        sanitizedFilename, 
        url, 
        key, 
        req.file.mimetype, 
        req.file.size, 
        sanitizeString(alt_text || sanitizedFilename, 200), 
        sanitizeString(caption || '', 500)
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.message?.includes('Invalid file type')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateId(id)) {
      return res.status(400).json({ error: 'Invalid media ID format' });
    }
    
    const { alt_text, caption } = req.body;
    const result = await query(
      `UPDATE media SET alt_text = $1, caption = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [
        sanitizeString(alt_text || '', 200), 
        sanitizeString(caption || '', 500), 
        id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update media' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateId(id)) {
      return res.status(400).json({ error: 'Invalid media ID format' });
    }
    
    const mediaResult = await query('SELECT * FROM media WHERE id = $1', [id]);
    
    if (mediaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    const media = mediaResult.rows[0];
    
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: config.r2.bucketName,
          Key: media.r2_key,
        })
      );
    } catch (r2Error) {
    }
    
    await query('DELETE FROM media WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

router.post('/simple', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const sanitizedFilename = sanitizeFilename(req.file.originalname);
    const ext = sanitizedFilename.split('.').pop()?.toLowerCase() || 'png';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({ error: 'Invalid file extension' });
    }
    
    const key = `uploads/${Date.now()}-${nanoid(16)}.${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: config.r2.bucketName,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const url = `${config.r2.publicUrl}/${key}`;
    res.json({ url, key });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
