import express from 'express';
import { nanoid } from 'nanoid';
import { query, connect } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search, limit, offset } = req.query;
    
    let sql = 'SELECT * FROM posts WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (category) {
      sql += ` AND category = $${paramCount++}`;
      params.push(category);
    }
    
    if (search) {
      sql += ` AND (title ILIKE $${paramCount} OR subtitle ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    sql += ' ORDER BY created_at DESC';
    
    if (limit) {
      sql += ` LIMIT $${paramCount++}`;
      params.push(parseInt(limit));
    }
    
    if (offset) {
      sql += ` OFFSET $${paramCount++}`;
      params.push(parseInt(offset));
    }
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await query('SELECT * FROM posts WHERE slug = $1', [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get post by slug error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM posts WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { 
      title, subtitle, slug, category, image_url, 
      author_name, author_bio, author_avatar,
      content_introduction, content_sections, content_conclusion,
      tags, read_time, meta_title, meta_description, meta_keywords, og_image
    } = req.body;
    
    const id = nanoid();
    
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
        id, title, subtitle, slug, category, image_url,
        author_name || 'Admin', author_bio || '', author_avatar || '',
        content_introduction || '', JSON.stringify(content_sections || []), content_conclusion || '',
        tags || [], read_time || '5 min', meta_title || title, meta_description || subtitle, meta_keywords || [], og_image || image_url
      ]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, subtitle, slug, category, image_url,
      author_name, author_bio, author_avatar,
      content_introduction, content_sections, content_conclusion,
      tags, read_time, meta_title, meta_description, meta_keywords, og_image
    } = req.body;
    
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
        title, subtitle, slug, category, image_url,
        author_name, author_bio, author_avatar,
        content_introduction, JSON.stringify(content_sections), content_conclusion,
        tags, read_time, meta_title, meta_description, meta_keywords, og_image, id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
