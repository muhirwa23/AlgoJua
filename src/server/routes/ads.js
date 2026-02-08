import { Router } from 'express';
import { query } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Default ad zones configuration
const DEFAULT_ZONES = [
    { zone_id: 'home_hero', name: 'Homepage - Hero Banner', description: 'Banner ad below the hero section on homepage' },
    { zone_id: 'home_feed', name: 'Homepage - In-Feed', description: 'Ad between article cards on homepage' },
    { zone_id: 'article_intro', name: 'Article - After Introduction', description: 'In-article ad after the introduction paragraph' },
    { zone_id: 'article_middle', name: 'Article - Middle Content', description: 'In-article ad in the middle of content' },
    { zone_id: 'article_bottom', name: 'Article - Bottom', description: 'Display ad before newsletter section' },
    { zone_id: 'jobs_top', name: 'Jobs - Top Banner', description: 'Banner ad at top of job listings' },
    { zone_id: 'jobs_bottom', name: 'Jobs - Bottom', description: 'Display ad after job listings' },
    { zone_id: 'sidebar', name: 'Sidebar Ad', description: 'Sidebar ad for desktop views' },
];

// Initialize ad_placements table if it doesn't exist
async function initAdPlacements() {
    try {
        // Create table if not exists
        await query(`
            CREATE TABLE IF NOT EXISTS ad_placements (
                id SERIAL PRIMARY KEY,
                zone_id VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                code TEXT DEFAULT '',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert default zones if they don't exist
        for (const zone of DEFAULT_ZONES) {
            await query(`
                INSERT INTO ad_placements (zone_id, name, description)
                VALUES ($1, $2, $3)
                ON CONFLICT (zone_id) DO NOTHING
            `, [zone.zone_id, zone.name, zone.description]);
        }

        console.log('[Ads API] Ad placements table initialized');
    } catch (error) {
        console.error('[Ads API] Failed to initialize ad_placements table:', error);
    }
}

// Initialize on module load
initAdPlacements();

/**
 * GET /api/ads
 * Public endpoint - Returns all active ads with non-empty code for frontend rendering
 */
router.get('/', async (req, res) => {
    try {
        const result = await query(`
            SELECT zone_id, name, code, is_active 
            FROM ad_placements 
            WHERE is_active = true AND code IS NOT NULL AND TRIM(code) != ''
        `);

        // Transform to a map for easy frontend lookup
        const adsMap = {};
        result.rows.forEach(row => {
            adsMap[row.zone_id] = {
                name: row.name,
                code: row.code,
                isActive: row.is_active
            };
        });

        // Log the number of active ads
        console.log(`[Ads API] Serving ${Object.keys(adsMap).length} active ads`);

        res.json(adsMap);
    } catch (error) {
        console.error('[Ads API] Error fetching ads:', error);
        res.status(500).json({ error: 'Failed to fetch ad placements' });
    }
});

/**
 * GET /api/ads/all
 * Admin endpoint - Returns all ad placements including inactive ones
 */
router.get('/all', requireAuth, async (req, res) => {
    try {
        const result = await query(`
            SELECT id, zone_id, name, description, code, is_active, updated_at 
            FROM ad_placements 
            ORDER BY id ASC
        `);

        console.log(`[Ads API] Admin fetched ${result.rows.length} ad placements`);

        res.json(result.rows);
    } catch (error) {
        console.error('[Ads API] Error fetching all ads:', error);
        res.status(500).json({ error: 'Failed to fetch ad placements' });
    }
});

/**
 * PUT /api/ads/:zoneId
 * Admin endpoint - Update ad code for a specific zone
 * 
 * Body: { code: string, is_active: boolean }
 * 
 * Note: Ad code is stored exactly as provided to support AdSense and other ad networks.
 * The frontend is responsible for safe rendering.
 */
router.put('/:zoneId', requireAuth, async (req, res) => {
    const { zoneId } = req.params;
    const { code, is_active } = req.body;

    // Validate zoneId
    if (!zoneId || typeof zoneId !== 'string') {
        return res.status(400).json({ error: 'Invalid zone ID' });
    }

    // Validate code - must be string (can be empty)
    if (code !== undefined && typeof code !== 'string') {
        return res.status(400).json({ error: 'Code must be a string' });
    }

    // Validate is_active - must be boolean if provided
    if (is_active !== undefined && typeof is_active !== 'boolean') {
        return res.status(400).json({ error: 'is_active must be a boolean' });
    }

    try {
        // Store the code exactly as provided (do NOT sanitize - needed for AdSense)
        const finalCode = code ?? '';
        const finalActive = is_active !== undefined ? is_active : true;

        const result = await query(`
            UPDATE ad_placements 
            SET code = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP
            WHERE zone_id = $3
            RETURNING *
        `, [finalCode, finalActive, zoneId]);

        if (result.rows.length === 0) {
            console.log(`[Ads API] Zone not found: ${zoneId}`);
            return res.status(404).json({ error: 'Ad zone not found' });
        }

        const updated = result.rows[0];
        console.log(`[Ads API] Updated zone '${zoneId}': active=${updated.is_active}, code_length=${updated.code?.length || 0}`);

        res.json({
            success: true,
            message: 'Ad placement updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('[Ads API] Error updating ad:', error);
        res.status(500).json({ error: 'Failed to update ad placement' });
    }
});

/**
 * POST /api/ads/:zoneId/test
 * Admin endpoint - Validate ad code without saving
 */
router.post('/:zoneId/test', requireAuth, async (req, res) => {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
        return res.json({ valid: true, warnings: ['No code provided'] });
    }

    const warnings = [];

    // Basic validation checks
    if (code.includes('<script') && !code.includes('</script>')) {
        warnings.push('Unclosed <script> tag detected');
    }

    if (code.includes('adsbygoogle') && !code.includes('data-ad-client')) {
        warnings.push('AdSense code may be missing data-ad-client attribute');
    }

    if (code.includes('document.write')) {
        warnings.push('document.write may not work in SPA (single-page app) context');
    }

    res.json({
        valid: warnings.length === 0,
        warnings,
        codeLength: code.length
    });
});

export default router;
