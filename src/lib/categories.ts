import { categoriesApi, Category, CreateCategoryInput } from './api';

export type { Category, CreateCategoryInput };

export const categoriesDb = {
  async getAll(): Promise<Category[]> {
    return categoriesApi.fetchAll();
  },

  async getBySlug(slug: string): Promise<Category | null> {
    return categoriesApi.fetchBySlug(slug);
  },

  async create(category: CreateCategoryInput): Promise<Category> {
    return categoriesApi.create(category);
  },

  async update(id: string, updates: Partial<CreateCategoryInput>): Promise<Category | null> {
    return categoriesApi.update(id, updates);
  },

  async delete(id: string): Promise<boolean> {
    try {
      await categoriesApi.delete(id);
      return true;
    } catch {
      return false;
    }
  },

  async getAllCategories(): Promise<Category[]> {
    return this.getAll();
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.getBySlug(slug);
  },

  async createCategory(category: CreateCategoryInput): Promise<Category> {
    return this.create(category);
  },

  async updateCategory(id: string, updates: Partial<CreateCategoryInput>): Promise<Category | null> {
    return this.update(id, updates);
  },

  async deleteCategory(id: string): Promise<boolean> {
    return this.delete(id);
  },
};
