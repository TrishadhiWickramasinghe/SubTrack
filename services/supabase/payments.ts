/**
 * Payments Service
 * CRUD operations for subscription payments
 */

import type { PaginatedResponse, Payment, SupabaseResponse } from '../../types/supabase';
import { supabase } from './client';

class PaymentsService {
  /**
   * Create a new payment record
   */
  async createPayment(
    subscriptionId: string,
    payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<Payment>> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...payment,
          subscription_id: subscriptionId,
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
            error instanceof Error ? error.message : 'Failed to create payment',
        },
      };
    }
  }

  /**
   * Get all payments for a subscription
   */
  async getSubscriptionPayments(
    subscriptionId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<SupabaseResponse<PaginatedResponse<Payment>>> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Get total count
      const { count } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_id', subscriptionId);

      // Get paginated data
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('payment_date', { ascending: false })
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
            error instanceof Error ? error.message : 'Failed to fetch payments',
        },
      };
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(
    paymentId: string
  ): Promise<SupabaseResponse<Payment>> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
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
            error instanceof Error ? error.message : 'Failed to fetch payment',
        },
      };
    }
  }

  /**
   * Update a payment
   */
  async updatePayment(
    paymentId: string,
    updates: Partial<Payment>
  ): Promise<SupabaseResponse<Payment>> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
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
            error instanceof Error ? error.message : 'Failed to update payment',
        },
      };
    }
  }

  /**
   * Delete a payment
   */
  async deletePayment(
    paymentId: string
  ): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to delete payment',
        },
      };
    }
  }

  /**
   * Get payments for a specific month
   */
  async getMonthlyPayments(
    subscriptionId: string,
    month: string // YYYY-MM format
  ): Promise<SupabaseResponse<Payment[]>> {
    try {
      const startDate = `${month}-01`;
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      const endDateStr = endDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .gte('payment_date', startDate)
        .lt('payment_date', endDateStr)
        .order('payment_date', { ascending: false });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to fetch monthly payments',
        },
      };
    }
  }

  /**
   * Calculate total paid for a date range
   */
  async calculateTotalPaid(
    subscriptionId: string,
    startDate: string,
    endDate: string
  ): Promise<SupabaseResponse<number>> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('subscription_id', subscriptionId)
        .eq('status', 'completed')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate);

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      const total = (data || []).reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );

      return { data: total, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to calculate total paid',
        },
      };
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(
    subscriptionId: string
  ): Promise<
    SupabaseResponse<{
      totalPaid: number;
      lastPaymentDate: string | null;
      totalPayments: number;
    }>
  > {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .eq('subscription_id', subscriptionId)
        .eq('status', 'completed')
        .order('payment_date', { ascending: false });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      const totalPaid = (data || []).reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );

      return {
        data: {
          totalPaid,
          lastPaymentDate: data?.[0]?.payment_date || null,
          totalPayments: data?.length || 0,
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
              : 'Failed to get payment statistics',
        },
      };
    }
  }
}

export const paymentsService = new PaymentsService();
