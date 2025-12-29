import { postsApi, jobsApi, Post, CreatePostInput, Job, CreateJobInput, ContentSection } from './api';

export type { Post, CreatePostInput, Job, CreateJobInput, ContentSection };

export const db = {
  async getAllPosts(): Promise<Post[]> {
    return postsApi.fetchAll();
  },

  async getPostById(id: string): Promise<Post | null> {
    return postsApi.fetchById(id);
  },

  async getPostBySlug(slug: string): Promise<Post | null> {
    return postsApi.fetchBySlug(slug);
  },

  async getPostsByCategory(category: string): Promise<Post[]> {
    return postsApi.fetchByCategory(category);
  },

  async createPost(post: CreatePostInput): Promise<Post> {
    return postsApi.create(post);
  },

  async updatePost(id: string, post: Partial<CreatePostInput>): Promise<Post | null> {
    try {
      return await postsApi.update(id, post);
    } catch {
      return null;
    }
  },

  async deletePost(id: string): Promise<boolean> {
    try {
      await postsApi.delete(id);
      return true;
    } catch {
      return false;
    }
  },

  async searchPosts(query: string): Promise<Post[]> {
    return postsApi.search(query);
  },

  getStats() {
    return {
      cacheSize: 0,
      isPrimaryHealthy: true,
      currentDatabase: 'server'
    };
  },

  async getAllJobs(): Promise<Job[]> {
    return jobsApi.fetchAll();
  },

  async getJobById(id: string): Promise<Job | null> {
    return jobsApi.fetchById(id);
  },

  async getJobsByCategory(category: string): Promise<Job[]> {
    return jobsApi.fetchByCategory(category);
  },

  async createJob(job: CreateJobInput): Promise<Job> {
    return jobsApi.create(job);
  },

  async updateJob(id: string, job: Partial<CreateJobInput>): Promise<Job | null> {
    try {
      return await jobsApi.update(id, job);
    } catch {
      return null;
    }
  },

  async deleteJob(id: string): Promise<boolean> {
    try {
      await jobsApi.delete(id);
      return true;
    } catch {
      return false;
    }
  },
};

export const subscriberOperations = {
  async addSubscriber(email: string, confirmationToken: string, unsubscribeToken: string) {
    throw new Error('Subscriber operations must be done through the server API');
  },

  async confirmSubscriber(token: string) {
    throw new Error('Subscriber operations must be done through the server API');
  },

  async unsubscribe(token: string) {
    throw new Error('Subscriber operations must be done through the server API');
  },

  async getSubscriberByEmail(email: string) {
    throw new Error('Subscriber operations must be done through the server API');
  },

  async getAllConfirmedSubscribers() {
    throw new Error('Subscriber operations must be done through the server API');
  },
};
