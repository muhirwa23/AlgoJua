const API_URL = import.meta.env.VITE_API_URL || '';
if (!API_URL && !import.meta.env.PROD) {
  console.warn('VITE_API_URL not set, using relative URLs');
}

export interface ContentSection {
  heading: string;
  content: string;
}

export interface Post {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  image_url: string | null;
  author_name: string;
  author_bio: string;
  author_avatar: string;
  content_introduction: string;
  content_sections: ContentSection[];
  content_conclusion: string;
  tags: string[];
  read_time: string;
  date: string;
  created_at: string;
  updated_at: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  og_image: string | null;
}

export interface CreatePostInput {
  title: string;
  subtitle?: string;
  slug: string;
  category: string;
  image_url?: string | null;
  author_name?: string;
  author_bio?: string;
  author_avatar?: string;
  content_introduction?: string;
  content_sections?: ContentSection[];
  content_conclusion?: string;
  tags?: string[];
  read_time?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_image?: string | null;
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
  tags: string[];
  applicants: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  application_url: string;
  date_posted: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobInput {
  title: string;
  company: string;
  location: string;
  type?: string;
  category?: string;
  salary?: string;
  image_url?: string;
  tags?: string[];
  applicants?: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  application_url: string;
}

function getAuthToken(): string | null {
  return localStorage.getItem('admin_token');
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL || ''}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed: ${response.statusText}`);
  }
  
  return response.json();
}

export interface AdminUser {
  id: number;
  username: string;
  role: string;
}

export const authApi = {
  async checkSetupStatus(): Promise<{ setupRequired: boolean }> {
    return { setupRequired: false };
  },

  async setup(username: string, password: string, confirmPassword: string): Promise<{ token: string; admin: AdminUser }> {
    return this.login(username, password);
  },

  async login(username: string, password: string): Promise<{ token: string; admin: AdminUser }> {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    localStorage.setItem('admin_token', result.token);
    return {
      token: result.token,
      admin: { id: 1, username: username || 'admin', role: 'admin' }
    };
  },

  async verify(): Promise<{ valid: boolean; admin?: AdminUser }> {
    try {
      const result = await apiRequest('/api/auth/verify', { method: 'POST' });
      return { 
        valid: result.valid, 
        admin: result.valid ? { id: 1, username: 'admin', role: 'admin' } : undefined 
      };
    } catch {
      return { valid: false };
    }
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
    }
    localStorage.removeItem('admin_token');
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    return { message: 'Password change not supported in this configuration' };
  },
};

export const postsApi = {
  async fetchAll(filters?: { category?: string; search?: string }): Promise<Post[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      
      const queryString = params.toString();
      return await apiRequest(`/api/posts${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  async fetchById(id: string): Promise<Post | null> {
    try {
      return await apiRequest(`/api/posts/${id}`);
    } catch (error) {
      console.error(`Error fetching post ${id}:`, error);
      return null;
    }
  },

  async fetchBySlug(slug: string): Promise<Post | null> {
    try {
      return await apiRequest(`/api/posts/slug/${slug}`);
    } catch (error) {
      console.error(`Error fetching post by slug ${slug}:`, error);
      return null;
    }
  },

  async fetchByCategory(category: string): Promise<Post[]> {
    return this.fetchAll({ category });
  },

  async create(post: CreatePostInput): Promise<Post> {
    return await apiRequest('/api/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  },

  async update(id: string, post: Partial<CreatePostInput>): Promise<Post> {
    return await apiRequest(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    });
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/api/posts/${id}`, { method: 'DELETE' });
  },

  async search(query: string): Promise<Post[]> {
    return this.fetchAll({ search: query });
  },
};

export const jobsApi = {
  async fetchAll(status?: string): Promise<Job[]> {
    try {
      const params = status ? `?status=${status}` : '';
      return await apiRequest(`/api/jobs${params}`);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },

  async fetchById(id: string): Promise<Job | null> {
    try {
      return await apiRequest(`/api/jobs/${id}`);
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      return null;
    }
  },

  async fetchByCategory(category: string): Promise<Job[]> {
    return this.fetchAll();
  },

  async create(job: CreateJobInput): Promise<Job> {
    return await apiRequest('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  },

  async update(id: string, job: Partial<CreateJobInput>): Promise<Job> {
    return await apiRequest(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(job),
    });
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/api/jobs/${id}`, { method: 'DELETE' });
  },
};

export const uploadApi = {
  async upload(file: File): Promise<{ url: string; key: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL || ''}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },

  async delete(key: string): Promise<void> {
    const safeKey = key.replace(/\//g, '|');
    await apiRequest(`/api/r2/${safeKey}`, { method: 'DELETE' });
  },
};

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

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
}

export const categoriesApi = {
  async fetchAll(): Promise<Category[]> {
    try {
      return await apiRequest('/api/categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  async fetchBySlug(slug: string): Promise<Category | null> {
    try {
      return await apiRequest(`/api/categories/${slug}`);
    } catch (error) {
      console.error(`Error fetching category ${slug}:`, error);
      return null;
    }
  },

  async create(category: CreateCategoryInput): Promise<Category> {
    return await apiRequest('/api/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  async update(id: string, category: Partial<CreateCategoryInput>): Promise<Category> {
    return await apiRequest(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/api/categories/${id}`, { method: 'DELETE' });
  },
};

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

export const mediaApi = {
  async fetchAll(): Promise<MediaItem[]> {
    try {
      return await apiRequest('/api/media');
    } catch (error) {
      console.error('Error fetching media:', error);
      return [];
    }
  },

  async fetchById(id: string): Promise<MediaItem | null> {
    try {
      return await apiRequest(`/api/media/${id}`);
    } catch (error) {
      console.error(`Error fetching media ${id}:`, error);
      return null;
    }
  },

  async upload(file: File, metadata?: { alt_text?: string; caption?: string }): Promise<MediaItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.alt_text) formData.append('alt_text', metadata.alt_text);
    if (metadata?.caption) formData.append('caption', metadata.caption);

    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL || ''}/api/media`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  async update(id: string, updates: { alt_text?: string; caption?: string }): Promise<MediaItem> {
    return await apiRequest(`/api/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/api/media/${id}`, { method: 'DELETE' });
  },
};

export const healthApi = {
  async check(): Promise<{ status: string; database: string }> {
    try {
      return await apiRequest('/api/health');
    } catch (error) {
      return { status: 'unhealthy', database: 'disconnected' };
    }
  },
};

export interface Subscriber {
  id: number;
  email: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  created_at: string;
}

export interface SubscriberStats {
  confirmed: string;
  pending: string;
  unsubscribed: string;
  total: string;
}

export const newsletterApi = {
  async subscribe(email: string): Promise<{ success: boolean; message: string }> {
    return await apiRequest('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async getSubscribers(): Promise<Subscriber[]> {
    return await apiRequest('/api/newsletter/subscribers');
  },

  async getStats(): Promise<SubscriberStats> {
    return await apiRequest('/api/newsletter/stats');
  },

  async notifySubscribers(postId: string): Promise<{ success: boolean; sent: number; failed: number }> {
    return await apiRequest('/api/newsletter/notify', {
      method: 'POST',
      body: JSON.stringify({ postId }),
    });
  },
};

export type { Post as PostType, CreatePostInput as CreatePostInputType, Job as JobType, CreateJobInput as CreateJobInputType };
