/**
 * Subscriptions Service
 * CRUD operations for subscriptions
 */

import type {
    PaginatedResponse,
    Subscription,
    SubscriptionWithPayments,
    SupabaseResponse,
} from '../../types/supabase';
import { supabase } from './client';

class SubscriptionsService {
  /**
   * Create a new subscription
   */
  async createSubscription(
    userId: string,
    subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<Subscription>> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          ...subscription,
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
            error instanceof Error
              ? error.message
              : 'Failed to create subscription',
        },
      };
    }
  }

  /**
   * Get all subscriptions for a user
   */
  async getSubscriptions(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<SupabaseResponse<PaginatedResponse<Subscription>>> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Get total count
      const { count } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get paginated data
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return {
        data: {
          data: data || [],
          count: count || 0,
          page,
          pageSize,
          hasMore: (count || 0) > to + 1,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to fetch subscriptions',
        },
      };
    }
  }

  /**
   * Get active subscriptions only
   */
  async getActiveSubscriptions(
    userId: string
  ): Promise<SupabaseResponse<Subscription[]>> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('next_billing_date', { ascending: true });

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
              : 'Failed to fetch active subscriptions',
        },
      };
    }
  }

  /**
   * Get subscription by ID with related data
   */
  async getSubscriptionWithDetails(
    subscriptionId: string,
    userId: string
  ): Promise<SupabaseResponse<SubscriptionWithPayments>> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(
          `
          *,
          payments (*),
          trials (*),
          splits (*)
        `
        )
        .eq('id', subscriptionId)
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
            error instanceof Error
              ? error.message
              : 'Failed to fetch subscription details',
        },
      };
    }
  }

  /**
   * Update a subscription
   */
  async updateSubscription(
    subscriptionId: string,
    userId: string,
    updates: Partial<Subscription>
  ): Promise<SupabaseResponse<Subscription>> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
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
            error instanceof Error
              ? error.message
              : 'Failed to update subscription',
        },
      };
    }
  }

  /**
   * Delete a subscription
   */
  async deleteSubscription(
    subscriptionId: string,
    userId: string
  ): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionId)
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
            error instanceof Error
              ? error.message
              : 'Failed to delete subscription',
        },
      };
    }
  }

  /**
   * Get subscriptions by category
   */
  async getSubscriptionsByCategory(
    userId: string,
    categoryId: string
  ): Promise<SupabaseResponse<Subscription[]>> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
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
              : 'Failed to fetch subscriptions by category',
        },
      };
    }
  }

  /**
   * Get subscriptions due for renewal (next 7 days)
   */
  async getUpcomingSubscriptions(
    userId: string,
    daysAhead: number = 7
  ): Promise<SupabaseResponse<Subscription[]>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('next_billing_date', today)
        .lte('next_billing_date', futureDateStr)
        .order('next_billing_date', { ascending: true });

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
              : 'Failed to fetch upcoming subscriptions',
        },
      };
    }
  }

  /**
   * Get total monthly spending
   */
  async getTotalMonthlySpending(
    userId: string,
    month: string // YYYY-MM format
  ): Promise<SupabaseResponse<number>> {
    try {
      const startDate = `${month}-01`;
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      const endDateStr = endDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('subscriptions')
        .select('amount')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('start_date', startDate)
        .lte('start_date', endDateStr);

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      const total = (data || []).reduce((sum, sub) => sum + (sub.amount || 0), 0);
      return { data: total, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to calculate monthly spending',
        },
      };
    }
  }

  /**
   * Search subscriptions
   */
  async searchSubscriptions(
    userId: string,
    query: string
  ): Promise<SupabaseResponse<Subscription[]>> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
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
              : 'Failed to search subscriptions',
        },
      };
    }
  }
}

export const subscriptionsService = new SubscriptionsService();
