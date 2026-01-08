import express from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { query } from '../lib/db.js';
import { s3Client } from '../lib/s3.js';
import { config } from '../lib/config.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

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

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM media ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM media WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = req.file.originalname.split('.').pop() || 'png';
    const key = `images/${Date.now()}-${nanoid()}.${ext}`;

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
      [req.file.originalname, url, key, req.file.mimetype, req.file.size, alt_text || req.file.originalname, caption || '']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Upload media error:', error);
    if (error.message?.includes('Invalid file type')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, caption } = req.body;
    const result = await query(
      `UPDATE media SET alt_text = $1, caption = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [alt_text, caption, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({ error: 'Failed to update media' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
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
      console.error('Failed to delete from R2:', r2Error);
    }
    
    await query('DELETE FROM media WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Standalone upload endpoint (for simple file uploads without full media record)
router.post('/simple', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = req.file.originalname.split('.').pop() || 'png';
    const key = `uploads/${Date.now()}-${nanoid()}.${ext}`;

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
    console.error('Simple upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
