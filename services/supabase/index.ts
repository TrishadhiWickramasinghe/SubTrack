/**
 * Supabase Services Index
 * Central export point for all Supabase-related services
 */

export { authService } from './auth';
export { budgetsService } from './budgets';
export { categoriesService } from './categories';
export { getCurrentSession, getCurrentUser, signOut, supabase } from './client';
export { paymentsService } from './payments';
export { splitsService } from './splits';
export { storageService } from './storage';
export { subscriptionsService } from './subscriptions';
export { trialsService } from './trials';

// Re-export types
export type { Database } from './database.types';
