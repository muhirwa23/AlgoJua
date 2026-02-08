
import { query } from '../src/server/lib/db.js';

// Default zones from server/routes/ads.js
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

async function checkAds() {
    try {
        console.log('Checking ad_placements table...');

        // Create table if not exists
        console.log('Ensuring table exists...');
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
        console.log('Table schema verified.');

        const result = await query('SELECT * FROM ad_placements');
        console.log(`Found ${result.rows.length} ad placements.`);

        if (result.rows.length === 0) {
            console.log('Table is empty. Inserting defaults...');
            for (const zone of DEFAULT_ZONES) {
                await query(`
                    INSERT INTO ad_placements (zone_id, name, description)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (zone_id) DO NOTHING
                `, [zone.zone_id, zone.name, zone.description]);
                console.log(`Inserted: ${zone.zone_id}`);
            }
            console.log('Defaults inserted.');
        } else {
            console.log('Existing zones found:');
            result.rows.forEach(row => {
                console.log(`- ${row.zone_id}: ${row.name} (Active: ${row.is_active})`);
            });

            // Should we update default zones if missing?
            // Let's check for missing default zones
            for (const zone of DEFAULT_ZONES) {
                const existing = result.rows.find(r => r.zone_id === zone.zone_id);
                if (!existing) {
                    console.log(`Missing default zone: ${zone.zone_id}. Inserting...`);
                    await query(`
                        INSERT INTO ad_placements (zone_id, name, description)
                        VALUES ($1, $2, $3)
                    `, [zone.zone_id, zone.name, zone.description]);
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkAds();
