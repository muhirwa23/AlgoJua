import { Pool } from '@neondatabase/serverless';
import { articles } from '../src/data/articles.ts';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.VITE_DATABASE_URL,
});

async function populateDatabase() {
  console.log('🚀 Starting database population...');
  console.log(`📦 Found ${articles.length} articles to import`);

  const client = await pool.connect();
  let successCount = 0;
  let errorCount = 0;

  try {
    for (const article of articles) {
      try {
        await client.query(
          `INSERT INTO posts (
            id, title, subtitle, category, image_url, 
            author_name, author_bio, author_avatar,
            content_introduction, content_sections, content_conclusion,
            tags, read_time, date, created_at, updated_at,
            meta_title, meta_description, meta_keywords, og_image, slug
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            subtitle = EXCLUDED.subtitle,
            category = EXCLUDED.category,
            image_url = EXCLUDED.image_url,
            updated_at = CURRENT_TIMESTAMP`,
          [
            article.id,
            article.title,
            article.subtitle || null,
            article.category,
            article.image_url,
            article.author_name,
            article.author_bio,
            article.author_avatar,
            article.content_introduction || null,
            JSON.stringify(article.content_sections),
            article.content_conclusion || null,
            article.tags,
            article.read_time,
            article.date,
            article.created_at,
            article.updated_at,
            article.meta_title || null,
            article.meta_description || null,
            article.meta_keywords || null,
            article.og_image || null,
            article.slug || null
          ]
        );
        successCount++;
        console.log(`✅ Imported: ${article.title}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to import "${article.title}":`, error.message);
      }
    }

    console.log(`\n✨ Database population complete!`);
    console.log(`   ✅ Success: ${successCount} articles`);
    console.log(`   ❌ Errors: ${errorCount} articles`);

    const result = await client.query('SELECT COUNT(*) as count FROM posts');
    console.log(`   📊 Total posts in database: ${result.rows[0].count}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

populateDatabase().catch(console.error);
