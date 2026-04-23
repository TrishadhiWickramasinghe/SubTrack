/**
 * useAuth Hook
 * Custom hook for managing authentication state and operations
 */

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/supabase/auth';

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const router = useRouter();

  /**
   * Initialize auth state by checking existing session
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing Supabase session
        const response = await authService.getCurrentUser();
        if (response.data) {
          setAuthState({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Auth initialization failed',
        }));
      }
    };

    initializeAuth();
  }, []);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Call Supabase signUp
        const response = await authService.signUp(email, password, fullName);
        if (response.error) {
          throw new Error(response.error.message);
        }

        if (!response.data) {
          throw new Error('Sign up failed - no user data returned');
        }

        const newUser: User = {
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.full_name || fullName,
          createdAt: response.data.created_at,
        };

        setAuthState({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Call Supabase signIn
        const response = await authService.signIn(email, password);
        if (response.error) {
          throw new Error(response.error.message);
        }

        if (!response.data) {
          throw new Error('Sign in failed - no user data returned');
        }

        const user: User = {
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.full_name || '',
          createdAt: response.data.created_at,
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      // Call Supabase signOut
      const response = await authService.signOut();
      if (response.error) {
        throw new Error(response.error.message);
      }

      setAuthState(initialState);
      router.replace('/auth/welcome');

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [router]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    clearError,
  };
};
