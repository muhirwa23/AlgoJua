import express from 'express';
import { nanoid } from 'nanoid';
import { query } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let sql = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];
    
    if (category) {
      sql += ' AND category = $1';
      params.push(category);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM jobs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { 
      title, company, location, type, category, salary, image_url,
      tags, applicants, description, responsibilities, requirements, application_url 
    } = req.body;
    
    const id = nanoid();
    
    const result = await query(
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
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, company, location, type, category, salary, image_url,
      tags, applicants, description, responsibilities, requirements, application_url 
    } = req.body;
    
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
        title, company, location, type, category, salary, image_url,
        tags, applicants, description, responsibilities, requirements, application_url, id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM jobs WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

export default router;
