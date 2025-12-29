import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.VITE_DATABASE_URL);

async function addSEOFields() {
  try {
    console.log('Adding SEO fields to posts table...');
    
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_keywords TEXT[]`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS og_image TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug TEXT`;
    
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)`;
    
    console.log('✓ SEO fields added successfully');
    
    console.log('\nUpdating existing posts with default slug values...');
    const posts = await sql`SELECT id, title FROM posts WHERE slug IS NULL`;
    
    for (const post of posts) {
      const slug = post.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      await sql`UPDATE posts SET slug = ${slug + '-' + post.id.slice(0, 6)} WHERE id = ${post.id}`;
    }
    
    console.log(`✓ Updated ${posts.length} posts with slugs`);
    
    console.log('\nCreating categories table...');
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        color TEXT DEFAULT '#3b82f6',
        icon TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)`;
    
    console.log('✓ Categories table created');
    
    console.log('\nInserting default categories...');
    const defaultCategories = [
      { name: 'Tools', slug: 'tools', description: 'Developer tools and software', color: '#3b82f6', icon: '🛠️' },
      { name: 'Jobs', slug: 'jobs', description: 'Career opportunities and hiring', color: '#10b981', icon: '💼' },
      { name: 'Trends', slug: 'trends', description: 'Industry trends and insights', color: '#f59e0b', icon: '📈' },
      { name: 'Career', slug: 'career', description: 'Career development and growth', color: '#8b5cf6', icon: '🎯' },
      { name: 'News', slug: 'news', description: 'Latest tech news', color: '#ef4444', icon: '📰' }
    ];
    
    for (const cat of defaultCategories) {
      await sql`
        INSERT INTO categories (name, slug, description, color, icon)
        VALUES (${cat.name}, ${cat.slug}, ${cat.description}, ${cat.color}, ${cat.icon})
        ON CONFLICT (name) DO NOTHING
      `;
    }
    
    console.log('✓ Default categories inserted');
    
    console.log('\nCreating media library table...');
    await sql`
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        filename TEXT NOT NULL,
        url TEXT NOT NULL,
        r2_key TEXT NOT NULL UNIQUE,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        width INTEGER,
        height INTEGER,
        alt_text TEXT,
        caption TEXT,
        uploaded_by TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_media_file_type ON media(file_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC)`;
    
    console.log('✓ Media library table created');
    
    console.log('\n✅ All database migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addSEOFields();