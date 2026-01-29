/**
 * Budgets Service
 * CRUD operations for budgets and budget categories
 */

import type { Budget, BudgetCategory, SupabaseResponse } from '../../types/supabase';
import { supabase } from './client';

class BudgetsService {
  /**
   * Create or get monthly budget
   */
  async getOrCreateMonthlyBudget(
    userId: string,
    month: string, // YYYY-MM format
    limit: number
  ): Promise<SupabaseResponse<Budget>> {
    try {
      // Try to get existing budget
      const { data: existing, error: fetchError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .single();

      if (existing) {
        return { data: existing, error: null };
      }

      // Create new budget if not found
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: userId,
          month,
          monthly_limit: limit,
          currency: 'USD',
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
            error instanceof Error ? error.message : 'Failed to get/create budget',
        },
      };
    }
  }

  /**
   * Update monthly budget limit
   */
  async updateBudgetLimit(
    budgetId: string,
    userId: string,
    newLimit: number
  ): Promise<SupabaseResponse<Budget>> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({
          monthly_limit: newLimit,
          updated_at: new Date().toISOString(),
        })
        .eq('id', budgetId)
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
            error instanceof Error ? error.message : 'Failed to update budget',
        },
      };
    }
  }

  /**
   * Get budget category limit
   */
  async getBudgetCategory(
    budgetId: string,
    categoryId: string
  ): Promise<SupabaseResponse<BudgetCategory>> {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('budget_id', budgetId)
        .eq('category_id', categoryId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { data: null, error: { message: error.message } };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'Category budget not found' },
        };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to get budget category',
        },
      };
    }
  }

  /**
   * Set budget limit for a specific category
   */
  async setBudgetCategory(
    budgetId: string,
    categoryId: string,
    limit: number
  ): Promise<SupabaseResponse<BudgetCategory>> {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('budget_id', budgetId)
        .eq('category_id', categoryId)
        .single();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('budget_categories')
          .update({
            limit,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          return { data: null, error: { message: error.message } };
        }

        return { data, error: null };
      }

      // Create new
      const { data, error } = await supabase
        .from('budget_categories')
        .insert({
          budget_id: budgetId,
          category_id: categoryId,
          limit,
          spent: 0,
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
            error instanceof Error ? error.message : 'Failed to set budget category',
        },
      };
    }
  }

  /**
   * Get all category budgets for a month
   */
  async getBudgetCategories(
    budgetId: string
  ): Promise<SupabaseResponse<BudgetCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('budget_id', budgetId)
        .order('created_at', { ascending: true });

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
              : 'Failed to fetch budget categories',
        },
      };
    }
  }

  /**
   * Update category spending
   */
  async updateCategorySpending(
    categoryBudgetId: string,
    spent: number
  ): Promise<SupabaseResponse<BudgetCategory>> {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .update({
          spent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', categoryBudgetId)
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
            error instanceof Error
              ? error.message
              : 'Failed to update category spending',
        },
      };
    }
  }

  /**
   * Get budget summary for a month
   */
  async getBudgetSummary(
    userId: string,
    month: string
  ): Promise<
    SupabaseResponse<{
      budget: Budget | null;
      categories: BudgetCategory[];
      totalSpent: number;
    }>
  > {
    try {
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .single();

      if (budgetError && budgetError.code !== 'PGRST116') {
        return {
          data: null,
          error: { message: budgetError.message },
        };
      }

      if (!budget) {
        return {
          data: {
            budget: null,
            categories: [],
            totalSpent: 0,
          },
          error: null,
        };
      }

      const { data: categories, error: categoriesError } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('budget_id', budget.id);

      if (categoriesError) {
        return {
          data: null,
          error: { message: categoriesError.message },
        };
      }

      const totalSpent = (categories || []).reduce(
        (sum, cat) => sum + (cat.spent || 0),
        0
      );

      return {
        data: {
          budget,
          categories: categories || [],
          totalSpent,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to get budget summary',
        },
      };
    }
  }

  /**
   * Get last 12 months budgets
   */
  async getBudgetHistory(
    userId: string
  ): Promise<SupabaseResponse<Budget[]>> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('month', { ascending: false })
        .limit(12);

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to get budget history',
        },
      };
    }
  }
}

export const budgetsService = new BudgetsService();
