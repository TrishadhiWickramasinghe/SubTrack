/**
 * Trials Service
 * Manage subscription trials
 */

import type { SupabaseResponse, Trial } from '../../types/supabase';
import { supabase } from './client';

class TrialsService {
  /**
   * Create a trial for a subscription
   */
  async createTrial(
    subscriptionId: string,
    trial: Omit<Trial, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<Trial>> {
    try {
      const { data, error } = await supabase
        .from('trials')
        .insert({
          ...trial,
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
            error instanceof Error ? error.message : 'Failed to create trial',
        },
      };
    }
  }

  /**
   * Get trial for a subscription
   */
  async getSubscriptionTrial(
    subscriptionId: string
  ): Promise<SupabaseResponse<Trial>> {
    try {
      const { data, error } = await supabase
        .from('trials')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        return { data: null, error: { message: error.message } };
      }

      if (!data) {
        return { data: null, error: { message: 'No active trial found' } };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to fetch trial',
        },
      };
    }
  }

  /**
   * Get all active trials for a user
   */
  async getActivTrials(
    userId: string
  ): Promise<SupabaseResponse<Trial[]>> {
    try {
      const { data, error } = await supabase
        .from('trials')
        .select(
          `
          *,
          subscriptions!inner(user_id)
        `
        )
        .eq('subscriptions.user_id', userId)
        .eq('status', 'active')
        .order('end_date', { ascending: true });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to fetch trials',
        },
      };
    }
  }

  /**
   * Update trial status
   */
  async updateTrialStatus(
    trialId: string,
    status: 'active' | 'expired' | 'cancelled' | 'converted'
  ): Promise<SupabaseResponse<Trial>> {
    try {
      const { data, error } = await supabase
        .from('trials')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', trialId)
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
            error instanceof Error ? error.message : 'Failed to update trial',
        },
      };
    }
  }
}

export const trialsService = new TrialsService();
