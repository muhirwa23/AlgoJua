import { categoriesDb, type Category, type CreateCategoryInput } from './categories';

export const categoriesApi = {
  async fetchAll(): Promise<Category[]> {
    try {
      return await categoriesDb.getAllCategories();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  },

  async fetchBySlug(slug: string): Promise<Category | null> {
    try {
      return await categoriesDb.getCategoryBySlug(slug);
    } catch (error) {
      console.error(`Error fetching category ${slug}:`, error);
      throw new Error('Failed to fetch category');
    }
  },

  async create(category: CreateCategoryInput): Promise<Category> {
    try {
      return await categoriesDb.createCategory(category);
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  },

  async update(id: string, category: Partial<CreateCategoryInput>): Promise<Category> {
    try {
      const updated = await categoriesDb.updateCategory(id, category);
      if (!updated) {
        throw new Error('Category not found');
      }
      return updated;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw new Error('Failed to update category');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const success = await categoriesDb.deleteCategory(id);
      if (!success) {
        throw new Error('Category not found');
      }
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw new Error('Failed to delete category');
    }
  }
};

export type { Category, CreateCategoryInput };
