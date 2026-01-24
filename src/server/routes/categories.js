import express from 'express';
import { query } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';
import validator from 'validator';

const router = express.Router();

const sanitizeString = (str, maxLength = 200) => {
  if (!str || typeof str !== 'string') return '';
  return validator.escape(validator.trim(str.slice(0, maxLength)));
};

const validateSlug = (slug) => {
  if (!slug || typeof slug !== 'string' || slug.length > 100) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

const validateColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

const validateId = (id) => {
  if (!id || typeof id !== 'string') return false;
  const num = parseInt(id, 10);
  return !isNaN(num) && num > 0 && String(num) === id;
};

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name ASC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!slug || typeof slug !== 'string' || slug.length > 100) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }
    
    const result = await query('SELECT * FROM categories WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, slug, description, color, icon } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name is required and must be at least 2 characters' });
    }
    if (!slug || !validateSlug(slug)) {
      return res.status(400).json({ error: 'Valid slug is required (lowercase letters, numbers, and hyphens)' });
    }
    if (color && !validateColor(color)) {
      return res.status(400).json({ error: 'Invalid color format. Use hex format like #3b82f6' });
    }
    
    const result = await query(
      `INSERT INTO categories (name, slug, description, color, icon)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        sanitizeString(name, 100), 
        sanitizeString(slug, 100).toLowerCase(), 
        sanitizeString(description || '', 500), 
        color || '#3b82f6', 
        sanitizeString(icon || '', 50)
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A category with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateId(id)) {
      return res.status(400).json({ error: 'Invalid category ID format' });
    }
    
    const { name, slug, description, color, icon } = req.body;
    
    if (name && (typeof name !== 'string' || name.trim().length < 2)) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    if (slug && !validateSlug(slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }
    if (color && !validateColor(color)) {
      return res.status(400).json({ error: 'Invalid color format' });
    }
    
    const result = await query(
      `UPDATE categories 
       SET name = COALESCE($1, name), slug = COALESCE($2, slug), 
           description = COALESCE($3, description), color = COALESCE($4, color), 
           icon = COALESCE($5, icon), updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        name ? sanitizeString(name, 100) : null, 
        slug ? sanitizeString(slug, 100).toLowerCase() : null, 
        description !== undefined ? sanitizeString(description, 500) : null, 
        color || null, 
        icon !== undefined ? sanitizeString(icon, 50) : null, 
        id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A category with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateId(id)) {
      return res.status(400).json({ error: 'Invalid category ID format' });
    }
    
    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
