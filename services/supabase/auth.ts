/**
 * Authentication Service
 * Handles user authentication, sign up, sign in, and session management
 */

import type { SupabaseResponse, User } from '../../types/supabase';
import { getCurrentUser, supabase, signOut as supabaseSignOut } from './client';

class AuthService {
  /**
   * Sign up with email and password
   */
  async signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<SupabaseResponse<User>> {
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      });

      if (signUpError) {
        return {
          data: null,
          error: { message: signUpError.message, code: signUpError.code },
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: { message: 'User creation failed' },
        };
      }

      // Create user profile
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName || '',
        preferences: {
          currency: 'USD',
          theme: 'auto',
          language: 'en',
          notifications_enabled: true,
          email_notifications: true,
        },
      });

      if (profileError) {
        return {
          data: null,
          error: { message: profileError.message },
        };
      }

      return {
        data: {
          id: data.user.id,
          email: data.user.email || '',
          full_name: fullName,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Sign up failed',
        },
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(
    email: string,
    password: string
  ): Promise<SupabaseResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: { message: 'Sign in failed' },
        };
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        return {
          data: null,
          error: { message: profileError.message },
        };
      }

      return {
        data: profile,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Sign in failed',
        },
      };
    }
  }

  /**
   * Sign in anonymously (no email/password required)
   */
  async signInAnonymously(): Promise<SupabaseResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: { message: 'Anonymous sign in failed' },
        };
      }

      // Create anonymous user profile
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email || `anonymous-${data.user.id}@subtrack.app`,
        full_name: 'Anonymous User',
        preferences: {
          currency: 'USD',
          theme: 'auto',
          language: 'en',
          notifications_enabled: false,
          email_notifications: false,
        },
      });

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = duplicate key, which is okay for anonymous users
        return {
          data: null,
          error: { message: profileError.message },
        };
      }

      return {
        data: {
          id: data.user.id,
          email: data.user.email || `anonymous-${data.user.id}@subtrack.app`,
          full_name: 'Anonymous User',
          created_at: data.user.created_at,
          updated_at: data.user.updated_at,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Anonymous sign in failed',
        },
      };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabaseSignOut();

      if (error) {
        return {
          data: null,
          error: { message: error.message },
        };
      }

      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Sign out failed',
        },
      };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<SupabaseResponse<User>> {
    try {
      const { user, error } = await getCurrentUser();

      if (error || !user) {
        return {
          data: null,
          error: error ? { message: error.message } : { message: 'No user' },
        };
      }

      // Fetch full user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return {
          data: null,
          error: { message: profileError.message },
        };
      }

      return {
        data: profile,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to get user',
        },
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<SupabaseResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message },
        };
      }

      return {
        data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to update profile',
        },
      };
    }
  }

  /**
   * Update email
   */
  async updateEmail(newEmail: string): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) {
        return {
          data: null,
          error: { message: error.message },
        };
      }

      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to update email',
        },
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          data: null,
          error: { message: error.message },
        };
      }

      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to update password',
        },
      };
    }
  }

  /**
   * Reset password (send recovery email)
   */
  async resetPassword(email: string): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return {
          data: null,
          error: { message: error.message },
        };
      }

      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to reset password',
        },
      };
    }
  }
}

export const authService = new AuthService();
