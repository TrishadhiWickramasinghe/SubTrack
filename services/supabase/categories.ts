/**
 * Categories Service
 * CRUD operations for expense categories
 */

import type { Category, SupabaseResponse } from '../../types/supabase';
import { supabase } from './client';

class CategoriesService {
  /**
   * Create a new category
   */
  async createCategory(
    userId: string,
    category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to create category',
        },
      };
    }
  }

  /**
   * Get all categories for a user
   */
  async getCategories(userId: string): Promise<SupabaseResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to fetch categories',
        },
      };
    }
  }

  /**
   * Get default categories
   */
  async getDefaultCategories(): Promise<SupabaseResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_default', true)
        .order('name', { ascending: true });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to fetch default categories',
        },
      };
    }
  }

  /**
   * Get category by ID
   */
  async getCategory(
    categoryId: string,
    userId: string
  ): Promise<SupabaseResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .eq('user_id', userId)
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to fetch category',
        },
      };
    }
  }

  /**
   * Update a category
   */
  async updateCategory(
    categoryId: string,
    userId: string,
    updates: Partial<Category>
  ): Promise<SupabaseResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', categoryId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to update category',
        },
      };
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(
    categoryId: string,
    userId: string
  ): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', userId);

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to delete category',
        },
      };
    }
  }

  /**
   * Seed default categories for a new user
   */
  async seedDefaultCategories(userId: string): Promise<SupabaseResponse<Category[]>> {
    const defaultCategories = [
      {
        name: 'Entertainment',
        icon: 'film',
        color: '#FF6B6B',
        is_default: false,
      },
      {
        name: 'Utilities',
        icon: 'zap',
        color: '#FFA500',
        is_default: false,
      },
      {
        name: 'Productivity',
        icon: 'briefcase',
        color: '#4ECDC4',
        is_default: false,
      },
      {
        name: 'Health',
        icon: 'heart',
        color: '#E74C3C',
        is_default: false,
      },
      {
        name: 'Education',
        icon: 'book',
        color: '#3498DB',
        is_default: false,
      },
      {
        name: 'Finance',
        icon: 'dollar-sign',
        color: '#27AE60',
        is_default: false,
      },
      {
        name: 'Gaming',
        icon: 'gamepad-2',
        color: '#9B59B6',
        is_default: false,
      },
      {
        name: 'Food & Dining',
        icon: 'utensils',
        color: '#E67E22',
        is_default: false,
      },
    ];

    try {
      const categoriesToInsert = defaultCategories.map(cat => ({
        ...cat,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('categories')
        .insert(categoriesToInsert)
        .select();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to seed categories',
        },
      };
    }
  }
}

export const categoriesService = new CategoriesService();
