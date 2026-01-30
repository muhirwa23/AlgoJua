import express from 'express';
import { nanoid } from 'nanoid';
import { query } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';
import validator from 'validator';

const router = express.Router();

const sanitizeString = (str, maxLength = 500) => {
  if (!str || typeof str !== 'string') return '';
  return validator.escape(validator.trim(str.slice(0, maxLength)));
};

const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = validator.trim(url);
  if (!validator.isURL(trimmed, { require_protocol: true, protocols: ['http', 'https'] })) {
    return '';
  }
  return trimmed;
};

const validateJobInput = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 2) {
      errors.push('Title is required and must be at least 2 characters');
    }
    if (!data.company || typeof data.company !== 'string' || data.company.trim().length < 2) {
      errors.push('Company is required and must be at least 2 characters');
    }
    if (!data.location || typeof data.location !== 'string') {
      errors.push('Location is required');
    }
    if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) {
      errors.push('Description is required and must be at least 10 characters');
    }
    if (!data.application_url || !validator.isURL(data.application_url, { require_protocol: true })) {
      errors.push('Valid application URL with protocol (http/https) is required');
    }
  }
  
  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  if (data.company && data.company.length > 200) {
    errors.push('Company must be less than 200 characters');
  }
  if (data.description && data.description.length > 10000) {
    errors.push('Description must be less than 10000 characters');
  }
  if (data.tags && (!Array.isArray(data.tags) || data.tags.length > 20)) {
    errors.push('Tags must be an array with maximum 20 items');
  }
  if (data.responsibilities && (!Array.isArray(data.responsibilities) || data.responsibilities.length > 50)) {
    errors.push('Responsibilities must be an array with maximum 50 items');
  }
  if (data.requirements && (!Array.isArray(data.requirements) || data.requirements.length > 50)) {
    errors.push('Requirements must be an array with maximum 50 items');
  }
  
  return errors;
};

const validateId = (id) => {
  if (!id || typeof id !== 'string' || id.length > 50) {
    return false;
  }
  return /^[a-zA-Z0-9_-]+$/.test(id);
};

router.get('/', async (req, res) => {
  try {
    const { category, page = '1', limit = '50' } = req.query;
    
    const pageNum = Math.max(1, Math.min(100, parseInt(page, 10) || 1));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;
    
    let sql = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (category && typeof category === 'string' && category.length <= 100) {
      sql += ` AND category = $${paramIndex}`;
      params.push(sanitizeString(category, 100));
      paramIndex++;
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateId(id)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    
    const result = await query('SELECT * FROM jobs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const validationErrors = validateJobInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    
    const { 
      title, company, location, type, category, salary, image_url,
      tags, applicants, description, responsibilities, requirements, application_url 
    } = req.body;
    
    const id = nanoid(21);
    
    const sanitizedTags = Array.isArray(tags) 
      ? tags.slice(0, 20).map(t => sanitizeString(t, 50)).filter(Boolean)
      : [];
    const sanitizedResponsibilities = Array.isArray(responsibilities)
      ? responsibilities.slice(0, 50).map(r => sanitizeString(r, 500)).filter(Boolean)
      : [];
    const sanitizedRequirements = Array.isArray(requirements)
      ? requirements.slice(0, 50).map(r => sanitizeString(r, 500)).filter(Boolean)
      : [];
    
    const result = await query(
      `INSERT INTO jobs (
        id, title, company, location, type, category, salary, image_url,
        tags, applicants, description, responsibilities, requirements, 
        application_url, date_posted
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING *`,
      [
        id, 
        sanitizeString(title, 200), 
        sanitizeString(company, 200), 
        sanitizeString(location, 200), 
        sanitizeString(type || 'Full-time', 50), 
        sanitizeString(category || 'Engineering', 100),
        sanitizeString(salary || '', 100), 
        sanitizeUrl(image_url) || '', 
        sanitizedTags, 
        sanitizeString(applicants || '0+', 20),
        sanitizeString(description, 10000), 
        sanitizedResponsibilities, 
        sanitizedRequirements, 
        sanitizeUrl(application_url)
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateId(id)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    
    const validationErrors = validateJobInput(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    
    const { 
      title, company, location, type, category, salary, image_url,
      tags, applicants, description, responsibilities, requirements, application_url 
    } = req.body;
    
    const sanitizedTags = tags !== undefined && Array.isArray(tags)
      ? tags.slice(0, 20).map(t => sanitizeString(t, 50)).filter(Boolean)
      : undefined;
    const sanitizedResponsibilities = responsibilities !== undefined && Array.isArray(responsibilities)
      ? responsibilities.slice(0, 50).map(r => sanitizeString(r, 500)).filter(Boolean)
      : undefined;
    const sanitizedRequirements = requirements !== undefined && Array.isArray(requirements)
      ? requirements.slice(0, 50).map(r => sanitizeString(r, 500)).filter(Boolean)
      : undefined;
    
    const result = await query(
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
        title ? sanitizeString(title, 200) : null, 
        company ? sanitizeString(company, 200) : null, 
        location ? sanitizeString(location, 200) : null, 
        type ? sanitizeString(type, 50) : null, 
        category ? sanitizeString(category, 100) : null, 
        salary ? sanitizeString(salary, 100) : null,
        image_url ? sanitizeUrl(image_url) : null,
        sanitizedTags, 
        applicants ? sanitizeString(applicants, 20) : null, 
        description ? sanitizeString(description, 10000) : null,
        sanitizedResponsibilities, 
        sanitizedRequirements, 
        application_url ? sanitizeUrl(application_url) : null, 
        id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateId(id)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    
    const result = await query('DELETE FROM jobs WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

export default router;
