# Database & Storage Setup Guide

## 🗄️ Database Architecture

This blog application uses **PostgreSQL with Neon** for content storage and is designed to integrate with **Cloudflare R2** for large file/image storage.

### Database Configuration

**Primary Database (Neon - 0.5GB)**
- Used for: Blog posts, metadata, content
- Connection string configured in `.env`

**Secondary Database (5GB)**
- Available for: Backups, analytics, or future expansion
- Connection string also in `.env`

## 📦 Current Setup

### Database Schema

The `posts` table structure:

```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Admin',
  author_bio TEXT NOT NULL DEFAULT 'Tech Writer & Content Creator',
  author_avatar TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  content_introduction TEXT,
  content_sections JSONB DEFAULT '[]'::jsonb,
  content_conclusion TEXT,
  tags TEXT[] DEFAULT '{}',
  read_time TEXT DEFAULT '5 min',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_date ON posts(date DESC);
CREATE INDEX idx_posts_tags ON posts USING gin(tags);
```

### Environment Variables

Located in `.env`:

```env
# Neon Database (Primary - 0.5GB)
VITE_DATABASE_URL=postgresql://neondb_owner:npg_Ha0FlrjhGsP1@ep-sparkling-pond-a96azzph-pooler.gwc.azure.neon.tech/neondb?sslmode=require

# Secondary Database (5GB - for backups/future use)
VITE_SECONDARY_DB_URL=postgresql://user_fdbd8012:dc71acbaf0af4f@db-portal-03.mydbportal.com:5432/muhirwa-aee1ae4c

# Cloudflare R2 (To be configured)
VITE_R2_ACCOUNT_ID=your_account_id
VITE_R2_ACCESS_KEY_ID=your_access_key
VITE_R2_SECRET_ACCESS_KEY=your_secret_key
VITE_R2_BUCKET_NAME=blog-images
VITE_R2_PUBLIC_URL=https://your-bucket.r2.cloudflarestorage.com
```

## 🚀 Admin Portal

Access the admin portal at `/admin` with:
- **Password**: `algojua2024`

### Features:
- ✅ Create, edit, delete posts
- ✅ Rich content editor with sections
- ✅ Category management
- ✅ Tag system
- ✅ Author information
- ✅ Direct database integration

## 🌐 API Layer

Located in `src/lib/`:

### `db.ts` - Database Client
- Direct PostgreSQL queries via Neon serverless
- Type-safe Post interface
- CRUD operations

### `api.ts` - Service Layer
- Error handling wrapper
- Async post operations
- Search functionality

## 📸 Cloudflare R2 Setup (Future Integration)

### Step 1: Create R2 Bucket
1. Go to Cloudflare Dashboard
2. Navigate to R2 Object Storage
3. Create a new bucket named `blog-images`

### Step 2: Generate API Tokens
1. In R2, go to "Manage R2 API Tokens"
2. Create a new API token with read/write permissions
3. Copy the Account ID, Access Key ID, and Secret Access Key

### Step 3: Update Environment Variables
Replace the placeholder values in `.env`:
```env
VITE_R2_ACCOUNT_ID=<your_account_id>
VITE_R2_ACCESS_KEY_ID=<your_access_key>
VITE_R2_SECRET_ACCESS_KEY=<your_secret_key>
VITE_R2_BUCKET_NAME=blog-images
VITE_R2_PUBLIC_URL=https://your-bucket.<account_id>.r2.cloudflarestorage.com
```

### Step 4: Install R2 Client (When Ready)
```bash
bun add @cloudflare/workers-types
```

### Why Cloudflare R2?
- **Cost-effective**: No egress fees
- **Fast**: Global CDN distribution
- **S3 Compatible**: Easy migration if needed
- **Perfect for**: Blog images, featured images, author avatars

## 🔄 Database Operations

### Creating a Post (Admin Portal)
1. Navigate to `/admin`
2. Login with password
3. Fill in post details
4. Add content sections
5. Save → automatically stored in Neon DB

### Fetching Posts (Frontend)
- **Homepage**: Displays latest 6 posts
- **Article Page**: Fetches by ID with related posts
- **Category Pages**: Filter by category (future)

## 🛠️ Technical Stack

- **Database Client**: `@neondatabase/serverless`
- **TypeScript**: Fully typed Post interface
- **React**: Client-side rendering with async data fetching
- **Vite**: Fast development and bundling

## 📊 Database Management

### Backup Strategy
Use the secondary 5GB database for:
```sql
-- Copy data from primary to secondary
INSERT INTO secondary.posts SELECT * FROM primary.posts;
```

### Monitoring
- Check post count: `SELECT COUNT(*) FROM posts;`
- Recent posts: `SELECT * FROM posts ORDER BY created_at DESC LIMIT 10;`
- Storage usage: Available in Neon dashboard

## 🔐 Security Notes

- ⚠️ Database credentials are in `.env` - never commit this file
- ✅ Add `.env` to `.gitignore` (already done)
- ✅ Use environment-specific credentials for production
- ✅ Admin portal password should be changed before deployment

## 🚀 Deployment Checklist

- [ ] Update database URLs for production
- [ ] Configure Cloudflare R2 for image storage  
- [ ] Change admin password in `src/pages/Admin.tsx`
- [ ] Set up database backups
- [ ] Configure CDN for static assets
- [ ] Enable SSL/TLS for database connections

## 📝 Future Enhancements

1. **Image Upload Integration**: Connect R2 for direct image uploads in admin
2. **Search Functionality**: Full-text search across posts
3. **Analytics**: Track post views and engagement
4. **Comments System**: Add reader comments with moderation
5. **Draft System**: Save posts as drafts before publishing
6. **Scheduled Publishing**: Set future publish dates
