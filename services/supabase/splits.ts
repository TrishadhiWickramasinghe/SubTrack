/**
 * Splits Service
 * Manage subscription cost splits between members
 */

import type { Split, SplitMember, SupabaseResponse } from '../../types/supabase';
import { supabase } from './client';

class SplitsService {
  /**
   * Create a cost split
   */
  async createSplit(
    subscriptionId: string,
    split: Omit<Split, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<Split>> {
    try {
      const { data, error } = await supabase
        .from('splits')
        .insert({
          ...split,
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
            error instanceof Error ? error.message : 'Failed to create split',
        },
      };
    }
  }

  /**
   * Get split by ID with members
   */
  async getSplit(
    splitId: string
  ): Promise<
    SupabaseResponse<Split & { split_members: SplitMember[] }>
  > {
    try {
      const { data, error } = await supabase
        .from('splits')
        .select(
          `
          *,
          split_members (*)
        `
        )
        .eq('id', splitId)
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
            error instanceof Error ? error.message : 'Failed to fetch split',
        },
      };
    }
  }

  /**
   * Get all splits for a subscription
   */
  async getSubscriptionSplits(
    subscriptionId: string
  ): Promise<
    SupabaseResponse<Array<Split & { split_members: SplitMember[] }>>
  > {
    try {
      const { data, error } = await supabase
        .from('splits')
        .select(
          `
          *,
          split_members (*)
        `
        )
        .eq('subscription_id', subscriptionId)
        .order('split_date', { ascending: false });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to fetch splits',
        },
      };
    }
  }

  /**
   * Add member to split
   */
  async addSplitMember(
    splitId: string,
    member: Omit<SplitMember, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<SplitMember>> {
    try {
      const { data, error } = await supabase
        .from('split_members')
        .insert({
          ...member,
          split_id: splitId,
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
            error instanceof Error ? error.message : 'Failed to add split member',
        },
      };
    }
  }

  /**
   * Update split member payment status
   */
  async updateSplitMemberPayment(
    splitMemberId: string,
    paid: boolean,
    paidDate?: string
  ): Promise<SupabaseResponse<SplitMember>> {
    try {
      const { data, error } = await supabase
        .from('split_members')
        .update({
          paid,
          paid_date: paid ? paidDate || new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', splitMemberId)
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
              : 'Failed to update split member payment',
        },
      };
    }
  }

  /**
   * Settle a split (mark as settled)
   */
  async settleSplit(
    splitId: string
  ): Promise<SupabaseResponse<Split>> {
    try {
      const { data, error } = await supabase
        .from('splits')
        .update({
          status: 'settled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', splitId)
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
            error instanceof Error ? error.message : 'Failed to settle split',
        },
      };
    }
  }

  /**
   * Cancel a split
   */
  async cancelSplit(
    splitId: string
  ): Promise<SupabaseResponse<Split>> {
    try {
      const { data, error } = await supabase
        .from('splits')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', splitId)
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
            error instanceof Error ? error.message : 'Failed to cancel split',
        },
      };
    }
  }

  /**
   * Get split statistics
   */
  async getSplitStats(
    userId: string
  ): Promise<
    SupabaseResponse<{
      totalSplits: number;
      settledAmount: number;
      pendingAmount: number;
    }>
  > {
    try {
      const { data, error } = await supabase
        .from('splits')
        .select(
          `
          status,
          total_amount,
          split_members (paid)
        `
        )
        .eq('splits.user_id', userId);

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      let settledAmount = 0;
      let pendingAmount = 0;

      (data || []).forEach(split => {
        if (split.status === 'settled') {
          settledAmount += split.total_amount || 0;
        } else {
          pendingAmount += split.total_amount || 0;
        }
      });

      return {
        data: {
          totalSplits: data?.length || 0,
          settledAmount,
          pendingAmount,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to get split statistics',
        },
      };
    }
  }
}

export const splitsService = new SplitsService();
