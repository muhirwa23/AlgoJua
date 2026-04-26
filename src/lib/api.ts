import { client } from './contentful';

export interface Post {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  image_url: string | null;
  author_name: string;
  content_introduction: string;
  content_sections: string;
  content_conclusion: string;
  tags: string;
  read_time: string;
  date: string;
  created_at: string;
  updated_at: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salary: string;
  image_url: string;
  description: string;
  date_posted: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  // Using any here assuming content is Contentful Rich Text Document
  // In a strict setup, you would import { Document } from '@contentful/rich-text-types'
  content: any;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  r2_key: string;
  file_type: string;
  file_size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  created_at: string;
  updated_at: string;
}

type ContentfulQuery = Record<string, string | number>;

interface QueryOptions {
  contentType: string;
  order?: string;
  limit?: number;
  filters?: ContentfulQuery;
}

// Helper to map Contentful Entry to Post
const mapEntryToPost = (entry: any): Post => {
  const fields = entry.fields;
  const sys = entry.sys;
  
  return {
    id: sys.id,
    title: fields.title || '',
    subtitle: fields.subtitle || '',
    slug: fields.slug || '',
    category: fields.category || 'General',
    image_url: fields.featuredImage?.fields?.file?.url ? `https:${fields.featuredImage.fields.file.url}` : null,
    author_name: fields.authorName || 'Algo Jua',
    content_introduction: fields.introduction || '',
    content_sections: fields.sections || '',
    content_conclusion: fields.conclusion || '',
    tags: fields.tags || '',
    read_time: fields.readTime || '5 min read',
    date: fields.date || sys.createdAt,
    created_at: sys.createdAt,
    updated_at: sys.updatedAt,
    meta_title: fields.metaTitle || fields.title || '',
    meta_description: fields.metaDescription || fields.subtitle || '',
    meta_keywords: fields.metaKeywords || '',
  };
};

// Helper to map Contentful Entry to Job
const mapEntryToJob = (entry: any): Job => {
  const fields = entry.fields;
  const sys = entry.sys;

  return {
    id: sys.id,
    title: fields.title || '',
    company: fields.company || '',
    location: fields.location || '',
    type: fields.type || 'Full-time',
    category: fields.category || 'Tech',
    salary: fields.salary || 'Competitive',
    image_url: fields.image?.fields?.file?.url ? `https:${fields.image.fields.file.url}` : '',
    description: fields.description || '',
    date_posted: fields.datePosted || sys.createdAt,
    created_at: sys.createdAt,
    updated_at: sys.updatedAt,
  };
};

// Helper to map Contentful Entry to Category
const mapEntryToCategory = (entry: any): Category => {
  const fields = entry.fields;
  const sys = entry.sys;
  
  return {
    id: sys.id,
    name: fields.name || '',
    slug: fields.slug || '',
    description: fields.description || '',
    color: fields.color || '#000',
    icon: fields.icon || '',
    created_at: sys.createdAt,
    updated_at: sys.updatedAt,
  };
};

// Helper to map Contentful Entry to Page
const mapEntryToPage = (entry: any): Page => {
  const fields = entry.fields;
  const sys = entry.sys;
  
  return {
    id: sys.id,
    title: fields.title || '',
    slug: fields.slug || '',
    content: fields.content || null,
    created_at: sys.createdAt,
    updated_at: sys.updatedAt,
  };
};

const LEGACY_SCHOOL_FILTER_KEYS = [
  'school',
  'schoolId',
  'school_id',
  'schoolSlug',
  'adminSchoolId',
];

const removeLegacySchoolFilters = (filters?: ContentfulQuery): ContentfulQuery => {
  if (!filters) {
    return {};
  }

  return Object.entries(filters).reduce((acc, [key, value]) => {
    if (LEGACY_SCHOOL_FILTER_KEYS.includes(key)) {
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {} as ContentfulQuery);
};

const buildContentModelQuery = ({ contentType, order, limit, filters }: QueryOptions): ContentfulQuery => {
  const query: ContentfulQuery = {
    content_type: contentType,
  };

  if (order) {
    query.order = order;
  }

  if (typeof limit === 'number') {
    query.limit = limit;
  }

  return {
    ...query,
    ...removeLegacySchoolFilters(filters),
  };
};

export const postsApi = {
  async fetchAll(filters?: { category?: string; search?: string }): Promise<Post[]> {
    try {
      const queryFilters: ContentfulQuery = {};

      if (filters?.category) {
        queryFilters['fields.category'] = filters.category;
      }

      if (filters?.search) {
        queryFilters.query = filters.search;
      }
      
      const response = await client.getEntries(
        buildContentModelQuery({
          contentType: 'post',
          order: '-sys.createdAt',
          filters: queryFilters,
        }),
      );
      return response.items.map(mapEntryToPost);
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  async fetchById(id: string): Promise<Post | null> {
    try {
      const entry = await client.getEntry(id);
      return mapEntryToPost(entry);
    } catch (error) {
      console.error(`Error fetching post ${id}:`, error);
      return null;
    }
  },

  async fetchBySlug(slug: string): Promise<Post | null> {
    try {
      const response = await client.getEntries(
        buildContentModelQuery({
          contentType: 'post',
          limit: 1,
          filters: {
            'fields.slug': slug,
          },
        }),
      );
      return response.items.length > 0 ? mapEntryToPost(response.items[0]) : null;
    } catch (error) {
      console.error(`Error fetching post by slug ${slug}:`, error);
      return null;
    }
  },

  async fetchByCategory(category: string): Promise<Post[]> {
    return this.fetchAll({ category });
  },

  async search(query: string): Promise<Post[]> {
    return this.fetchAll({ search: query });
  },
};

export const jobsApi = {
  async fetchAll(): Promise<Job[]> {
    try {
      const response = await client.getEntries(
        buildContentModelQuery({
          contentType: 'job',
          order: '-sys.createdAt',
        }),
      );
      return response.items.map(mapEntryToJob);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },

  async fetchById(id: string): Promise<Job | null> {
    try {
      const entry = await client.getEntry(id);
      return mapEntryToJob(entry);
    } catch (error) {
      return null;
    }
  },
};

export const categoriesApi = {
  async fetchAll(): Promise<Category[]> {
    try {
      const response = await client.getEntries(
        buildContentModelQuery({
          contentType: 'category',
        }),
      );
      return response.items.map(mapEntryToCategory);
    } catch (error) {
      return [];
    }
  },

  async fetchBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await client.getEntries(
        buildContentModelQuery({
          contentType: 'category',
          limit: 1,
          filters: {
            'fields.slug': slug,
          },
        }),
      );
      return response.items.length > 0 ? mapEntryToCategory(response.items[0]) : null;
    } catch (error) {
      return null;
    }
  },
};

export const pagesApi = {
  async fetchBySlug(slug: string): Promise<Page | null> {
    try {
      const response = await client.getEntries(
        buildContentModelQuery({
          contentType: 'page',
          limit: 1,
          filters: {
            'fields.slug': slug,
          },
        }),
      );
      return response.items.length > 0 ? mapEntryToPage(response.items[0]) : null;
    } catch (error) {
      console.error(`Error fetching page ${slug}:`, error);
      return null;
    }
  },
};

export const mediaApi = {
  async fetchAll(): Promise<MediaItem[]> {
    try {
      const response = await client.getAssets();
      return response.items.map((asset: any) => ({
        id: asset.sys.id,
        filename: asset.fields.file.fileName,
        url: `https:${asset.fields.file.url}`,
        r2_key: asset.sys.id,
        file_type: asset.fields.file.contentType,
        file_size: asset.fields.file.details.size,
        width: asset.fields.file.details.image?.width,
        height: asset.fields.file.details.image?.height,
        alt_text: asset.fields.title,
        created_at: asset.sys.createdAt,
        updated_at: asset.sys.updatedAt,
      }));
    } catch (error) {
      return [];
    }
  },
};

export type { Post as PostType, Job as JobType };
