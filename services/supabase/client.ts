/**
 * Supabase Client Configuration
 * Initializes Supabase client with proper configuration for React Native/Expo
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import type { Database } from './database.types';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file'
  );
}

/**
 * Supabase client instance
 * Configured for React Native with AsyncStorage for persistence
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-App-Platform': Platform.OS,
      'X-App-Version': process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    },
  },
  // Enable Realtime subscriptions
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Get the current user session
 */
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session || null, error };
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user || null, error };
};

/**
 * Sign out and clear session
 */
export const signOut = async () => {
  return supabase.auth.signOut();
};

export default supabase;
