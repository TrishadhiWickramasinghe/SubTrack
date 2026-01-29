/**
 * Database Types
 * Auto-generated types for Supabase tables
 * You can also generate these using: npx supabase gen types typescript
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          preferences: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          is_default: boolean;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          is_default?: boolean;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          color?: string;
          is_default?: boolean;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          amount: number;
          currency: string;
          billing_cycle: string;
          category_id: string | null;
          status: string;
          payment_method: string | null;
          next_billing_date: string;
          start_date: string;
          end_date: string | null;
          renewal_date: string | null;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          amount: number;
          currency?: string;
          billing_cycle: string;
          category_id?: string | null;
          status?: string;
          payment_method?: string | null;
          next_billing_date: string;
          start_date: string;
          end_date?: string | null;
          renewal_date?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          amount?: number;
          currency?: string;
          billing_cycle?: string;
          category_id?: string | null;
          status?: string;
          payment_method?: string | null;
          next_billing_date?: string;
          start_date?: string;
          end_date?: string | null;
          renewal_date?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          subscription_id: string;
          amount: number;
          currency: string;
          payment_date: string;
          payment_method: string | null;
          status: string;
          reference_number: string | null;
          receipt_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          amount: number;
          currency?: string;
          payment_date: string;
          payment_method?: string | null;
          status?: string;
          reference_number?: string | null;
          receipt_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          amount?: number;
          currency?: string;
          payment_date?: string;
          payment_method?: string | null;
          status?: string;
          reference_number?: string | null;
          receipt_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      trials: {
        Row: {
          id: string;
          subscription_id: string;
          start_date: string;
          end_date: string;
          remaining_days: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          start_date: string;
          end_date: string;
          remaining_days?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          start_date?: string;
          end_date?: string;
          remaining_days?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          monthly_limit: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          monthly_limit: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          month?: string;
          monthly_limit?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      budget_categories: {
        Row: {
          id: string;
          budget_id: string;
          category_id: string;
          limit: number;
          spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          budget_id: string;
          category_id: string;
          limit: number;
          spent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          budget_id?: string;
          category_id?: string;
          limit?: number;
          spent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      splits: {
        Row: {
          id: string;
          subscription_id: string;
          split_date: string;
          status: string;
          total_amount: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          split_date: string;
          status?: string;
          total_amount: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          split_date?: string;
          status?: string;
          total_amount?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      split_members: {
        Row: {
          id: string;
          split_id: string;
          member_id: string;
          member_name: string;
          amount: number;
          paid: boolean;
          paid_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          split_id: string;
          member_id: string;
          member_name: string;
          amount: number;
          paid?: boolean;
          paid_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          split_id?: string;
          member_id?: string;
          member_name?: string;
          amount?: number;
          paid?: boolean;
          paid_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_type: string;
          earned_date: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_type: string;
          earned_date?: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_type?: string;
          earned_date?: string;
          description?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
