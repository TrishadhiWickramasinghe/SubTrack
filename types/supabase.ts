/**
 * Supabase Types & Interfaces
 * Centralized type definitions for all Supabase tables and operations
 */

// ========== USER TYPES ==========
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
}

// ========== SUBSCRIPTION TYPES ==========
export type BillingCycle = 
  | 'daily' 
  | 'weekly' 
  | 'biweekly' 
  | 'monthly' 
  | 'bimonthly' 
  | 'quarterly' 
  | 'semiannually' 
  | 'annually' 
  | 'custom';

export type SubscriptionStatus = 
  | 'active' 
  | 'pending' 
  | 'cancelled' 
  | 'expired' 
  | 'trial' 
  | 'paused';

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'paypal' 
  | 'bank_transfer' 
  | 'apple_pay' 
  | 'google_pay' 
  | 'cash' 
  | 'other';

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  category_id: string;
  status: SubscriptionStatus;
  payment_method: PaymentMethod;
  next_billing_date: string;
  start_date: string;
  end_date?: string;
  renewal_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ========== CATEGORY TYPES ==========
export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ========== BUDGET TYPES ==========
export interface Budget {
  id: string;
  user_id: string;
  month: string; // YYYY-MM format
  monthly_limit: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: string;
  budget_id: string;
  category_id: string;
  limit: number;
  spent: number;
  created_at: string;
  updated_at: string;
}

// ========== TRIAL TYPES ==========
export type TrialStatus = 'active' | 'expired' | 'cancelled' | 'converted';

export interface Trial {
  id: string;
  subscription_id: string;
  start_date: string;
  end_date: string;
  remaining_days: number;
  status: TrialStatus;
  created_at: string;
  updated_at: string;
}

// ========== SPLIT TYPES ==========
export type SplitStatus = 'pending' | 'settled' | 'cancelled';

export interface Split {
  id: string;
  subscription_id: string;
  split_date: string;
  status: SplitStatus;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface SplitMember {
  id: string;
  split_id: string;
  member_id: string; // user_id of the member
  member_name: string;
  amount: number;
  paid: boolean;
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

// ========== PAYMENT TYPES ==========
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  reference_number?: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ========== ACHIEVEMENT TYPES ==========
export type AchievementType = 
  | 'first_subscription' 
  | 'saved_milestone' 
  | 'budget_master' 
  | 'consistency' 
  | 'trial_explorer' 
  | 'sharing_pro';

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: AchievementType;
  earned_date: string;
  description?: string;
  created_at: string;
}

// ========== API RESPONSE TYPES ==========
export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

export interface SupabaseError {
  message: string;
  status?: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ========== CONTEXT TYPES ==========
export interface SupabaseContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<User>;
  updateUserProfile: (updates: Partial<User>) => Promise<User>;
}

// ========== DATABASE VIEWS ==========
export interface SubscriptionWithCategory extends Subscription {
  categories?: Category;
}

export interface SubscriptionWithPayments extends Subscription {
  payments?: Payment[];
  trials?: Trial[];
  splits?: Split[];
}
