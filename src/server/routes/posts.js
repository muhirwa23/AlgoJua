import express from 'express';
import { nanoid } from 'nanoid';
import { query, connect } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';
import validator from 'validator';

const router = express.Router();

const sanitizeString = (str, maxLength = 500) => {
  if (!str || typeof str !== 'string') return '';
  return validator.trim(str.slice(0, maxLength));
};

const sanitizeHtml = (str, maxLength = 50000) => {
  if (!str || typeof str !== 'string') return '';
  return str.slice(0, maxLength);
};

const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = validator.trim(url);
  if (!validator.isURL(trimmed, { require_protocol: true, protocols: ['http', 'https'] })) {
    return '';
  }
  return trimmed;
};

const validateId = (id) => {
  if (!id || typeof id !== 'string' || id.length > 50) return false;
  return /^[a-zA-Z0-9_-]+$/.test(id);
};

const validateSlug = (slug) => {
  if (!slug || typeof slug !== 'string' || slug.length > 200) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

const validatePostInput = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 2) {
      errors.push('Title is required and must be at least 2 characters');
    }
    if (!data.slug || !validateSlug(data.slug)) {
      errors.push('Valid slug is required (lowercase letters, numbers, and hyphens only)');
    }
    if (!data.category || typeof data.category !== 'string') {
      errors.push('Category is required');
    }
  }
  
  if (data.title && data.title.length > 300) {
    errors.push('Title must be less than 300 characters');
  }
  if (data.subtitle && data.subtitle.length > 500) {
    errors.push('Subtitle must be less than 500 characters');
  }
  if (data.content_introduction && data.content_introduction.length > 10000) {
    errors.push('Introduction must be less than 10000 characters');
  }
  if (data.content_conclusion && data.content_conclusion.length > 10000) {
    errors.push('Conclusion must be less than 10000 characters');
  }
  if (data.tags && (!Array.isArray(data.tags) || data.tags.length > 30)) {
    errors.push('Tags must be an array with maximum 30 items');
  }
  if (data.content_sections && !Array.isArray(data.content_sections)) {
    errors.push('Content sections must be an array');
  }
  if (data.meta_keywords && (!Array.isArray(data.meta_keywords) || data.meta_keywords.length > 20)) {
    errors.push('Meta keywords must be an array with maximum 20 items');
  }
  
  return errors;
};

router.get('/', async (req, res) => {
  try {
    const { category, search, limit = '50', offset = '0' } = req.query;
    
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const offsetNum = Math.max(0, parseInt(offset, 10) || 0);
    
    let sql = 'SELECT * FROM posts WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (category && typeof category === 'string' && category.length <= 100) {
      sql += ` AND category = $${paramCount++}`;
      params.push(sanitizeString(category, 100));
    }
    
    if (search && typeof search === 'string' && search.length <= 200) {
      const searchTerm = sanitizeString(search, 200);
      sql += ` AND (title ILIKE $${paramCount} OR subtitle ILIKE $${paramCount})`;
      params.push(`%${searchTerm}%`);
      paramCount++;
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(limitNum, offsetNum);
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!slug || typeof slug !== 'string' || slug.length > 200) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }
    
    const result = await query('SELECT * FROM posts WHERE slug = $1', [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateId(id)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    
    const result = await query('SELECT * FROM posts WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const validationErrors = validatePostInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    
    const { 
      title, subtitle, slug, category, image_url, 
      author_name, author_bio, author_avatar,
      content_introduction, content_sections, content_conclusion,
      tags, read_time, meta_title, meta_description, meta_keywords, og_image
    } = req.body;
    
    const id = nanoid(21);
    
    const sanitizedTags = Array.isArray(tags) 
      ? tags.slice(0, 30).map(t => sanitizeString(t, 100)).filter(Boolean)
      : [];
    const sanitizedKeywords = Array.isArray(meta_keywords)
      ? meta_keywords.slice(0, 20).map(k => sanitizeString(k, 100)).filter(Boolean)
      : [];
    const sanitizedSections = Array.isArray(content_sections)
      ? content_sections.slice(0, 50).map(s => ({
          heading: sanitizeString(s.heading || '', 300),
          content: sanitizeHtml(s.content || '', 50000)
        }))
      : [];
    
    const result = await query(
      `INSERT INTO posts (
        id, title, subtitle, slug, category, image_url,
        author_name, author_bio, author_avatar,
        content_introduction, content_sections, content_conclusion,
        tags, read_time, date, meta_title, meta_description, meta_keywords, og_image
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15, $16, $17, $18)
      RETURNING *`,
      [
        id, 
        sanitizeString(title, 300), 
        sanitizeString(subtitle || '', 500), 
        sanitizeString(slug, 200).toLowerCase(), 
        sanitizeString(category, 100), 
        sanitizeUrl(image_url) || '',
        sanitizeString(author_name || 'Admin', 100), 
        sanitizeString(author_bio || '', 500), 
        sanitizeUrl(author_avatar) || '',
        sanitizeHtml(content_introduction || '', 10000), 
        JSON.stringify(sanitizedSections), 
        sanitizeHtml(content_conclusion || '', 10000),
        sanitizedTags, 
        sanitizeString(read_time || '5 min', 20), 
        sanitizeString(meta_title || title, 200), 
        sanitizeString(meta_description || subtitle || '', 500), 
        sanitizedKeywords, 
        sanitizeUrl(og_image || image_url) || ''
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A post with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateId(id)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    
    const validationErrors = validatePostInput(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    
    const { 
      title, subtitle, slug, category, image_url,
      author_name, author_bio, author_avatar,
      content_introduction, content_sections, content_conclusion,
      tags, read_time, meta_title, meta_description, meta_keywords, og_image
    } = req.body;
    
    const sanitizedTags = tags !== undefined && Array.isArray(tags)
      ? tags.slice(0, 30).map(t => sanitizeString(t, 100)).filter(Boolean)
      : undefined;
    const sanitizedKeywords = meta_keywords !== undefined && Array.isArray(meta_keywords)
      ? meta_keywords.slice(0, 20).map(k => sanitizeString(k, 100)).filter(Boolean)
      : undefined;
    const sanitizedSections = content_sections !== undefined && Array.isArray(content_sections)
      ? JSON.stringify(content_sections.slice(0, 50).map(s => ({
          heading: sanitizeString(s.heading || '', 300),
          content: sanitizeHtml(s.content || '', 50000)
        })))
      : undefined;
    
    const result = await query(
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
        title ? sanitizeString(title, 300) : null, 
        subtitle !== undefined ? sanitizeString(subtitle, 500) : null, 
        slug ? sanitizeString(slug, 200).toLowerCase() : null, 
        category ? sanitizeString(category, 100) : null, 
        image_url !== undefined ? (sanitizeUrl(image_url) || null) : null,
        author_name ? sanitizeString(author_name, 100) : null, 
        author_bio !== undefined ? sanitizeString(author_bio, 500) : null, 
        author_avatar !== undefined ? (sanitizeUrl(author_avatar) || null) : null,
        content_introduction !== undefined ? sanitizeHtml(content_introduction, 10000) : null, 
        sanitizedSections,
        content_conclusion !== undefined ? sanitizeHtml(content_conclusion, 10000) : null,
        sanitizedTags, 
        read_time ? sanitizeString(read_time, 20) : null,
        meta_title ? sanitizeString(meta_title, 200) : null, 
        meta_description !== undefined ? sanitizeString(meta_description, 500) : null,
        sanitizedKeywords, 
        og_image !== undefined ? (sanitizeUrl(og_image) || null) : null, 
        id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A post with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update post' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateId(id)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    
    const result = await query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
