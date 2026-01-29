/**
 * SUPABASE DATABASE SCHEMA
 * Complete SQL schema for SubTrack application
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Supabase project at https://app.supabase.com
 * 2. Go to SQL Editor
 * 3. Create a new query
 * 4. Copy and paste the entire content below
 * 5. Execute the query
 * 
 * This will:
 * - Create all necessary tables
 * - Enable Row Level Security (RLS)
 * - Create RLS policies for each table
 * - Create storage bucket for receipts
 * - Create indexes for performance
 */

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  preferences jsonb DEFAULT '{"currency": "USD", "theme": "auto", "language": "en", "notifications_enabled": true, "email_notifications": true}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policy: Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policy: New users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ========================================
-- CATEGORIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  is_default boolean DEFAULT false,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view own categories
CREATE POLICY "Users can view own categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert categories
CREATE POLICY "Users can create categories"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update own categories
CREATE POLICY "Users can update own categories"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete own categories
CREATE POLICY "Users can delete own categories"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- SUBSCRIPTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  amount numeric(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  billing_cycle text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  status text DEFAULT 'active',
  payment_method text,
  next_billing_date date NOT NULL,
  start_date date NOT NULL,
  end_date date,
  renewal_date date,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscriptions"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- PAYMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_date date NOT NULL,
  payment_method text,
  status text DEFAULT 'completed',
  reference_number text,
  receipt_url text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view payments of their subscriptions"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments for their subscriptions"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payments of their subscriptions"
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete payments of their subscriptions"
  ON public.payments
  FOR DELETE
  TO authenticated
  USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- TRIALS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  remaining_days integer,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view trials of their subscriptions"
  ON public.trials
  FOR SELECT
  TO authenticated
  USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create trials for their subscriptions"
  ON public.trials
  FOR INSERT
  TO authenticated
  WITH CHECK (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update trials of their subscriptions"
  ON public.trials
  FOR UPDATE
  TO authenticated
  USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete trials of their subscriptions"
  ON public.trials
  FOR DELETE
  TO authenticated
  USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- BUDGETS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month text NOT NULL,
  monthly_limit numeric(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, month)
);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own budgets"
  ON public.budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create budgets"
  ON public.budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON public.budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON public.budgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- BUDGET CATEGORIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  limit numeric(10, 2) NOT NULL,
  spent numeric(10, 2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(budget_id, category_id)
);

-- Enable RLS
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view budget categories of their budgets"
  ON public.budget_categories
  FOR SELECT
  TO authenticated
  USING (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create budget categories for their budgets"
  ON public.budget_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update budget categories of their budgets"
  ON public.budget_categories
  FOR UPDATE
  TO authenticated
  USING (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete budget categories of their budgets"
  ON public.budget_categories
  FOR DELETE
  TO authenticated
  USING (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- SPLITS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  split_date date NOT NULL,
  status text DEFAULT 'pending',
  total_amount numeric(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.splits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view splits of their subscriptions"
  ON public.splits
  FOR SELECT
  TO authenticated
  USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create splits for their subscriptions"
  ON public.splits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update splits of their subscriptions"
  ON public.splits
  FOR UPDATE
  TO authenticated
  USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete splits of their subscriptions"
  ON public.splits
  FOR DELETE
  TO authenticated
  USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- SPLIT MEMBERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.split_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  split_id uuid NOT NULL REFERENCES public.splits(id) ON DELETE CASCADE,
  member_id uuid NOT NULL,
  member_name text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  paid boolean DEFAULT false,
  paid_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.split_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view split members of their splits"
  ON public.split_members
  FOR SELECT
  TO authenticated
  USING (
    split_id IN (
      SELECT s.id FROM public.splits s
      INNER JOIN public.subscriptions sub ON s.subscription_id = sub.id
      WHERE sub.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create split members for their splits"
  ON public.split_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    split_id IN (
      SELECT s.id FROM public.splits s
      INNER JOIN public.subscriptions sub ON s.subscription_id = sub.id
      WHERE sub.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update split members of their splits"
  ON public.split_members
  FOR UPDATE
  TO authenticated
  USING (
    split_id IN (
      SELECT s.id FROM public.splits s
      INNER JOIN public.subscriptions sub ON s.subscription_id = sub.id
      WHERE sub.user_id = auth.uid()
    )
  )
  WITH CHECK (
    split_id IN (
      SELECT s.id FROM public.splits s
      INNER JOIN public.subscriptions sub ON s.subscription_id = sub.id
      WHERE sub.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete split members of their splits"
  ON public.split_members
  FOR DELETE
  TO authenticated
  USING (
    split_id IN (
      SELECT s.id FROM public.splits s
      INNER JOIN public.subscriptions sub ON s.subscription_id = sub.id
      WHERE sub.user_id = auth.uid()
    )
  );

-- ========================================
-- ACHIEVEMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  earned_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, achievement_type)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own achievements"
  ON public.achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create achievements"
  ON public.achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_category_id ON public.subscriptions(category_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON public.subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON public.budgets(month);
CREATE INDEX IF NOT EXISTS idx_trials_subscription_id ON public.trials(subscription_id);
CREATE INDEX IF NOT EXISTS idx_splits_subscription_id ON public.splits(subscription_id);
CREATE INDEX IF NOT EXISTS idx_split_members_split_id ON public.split_members(split_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);

-- ========================================
-- STORAGE BUCKET FOR RECEIPTS
-- ========================================
-- Note: Storage bucket creation via SQL is not supported.
-- Create the "receipts" bucket manually in Supabase Dashboard:
-- 1. Go to Storage section
-- 2. Create new bucket named "receipts"
-- 3. Set it to PRIVATE
-- 4. Add the RLS policies shown in the MIGRATION_GUIDE.md file

-- ========================================
-- SETUP COMPLETE
-- ========================================
-- All tables, RLS policies, and indexes have been created.
-- Next steps:
-- 1. Create the "receipts" storage bucket in Supabase Dashboard
-- 2. Configure storage policies for uploads
-- 3. Update your .env file with SUPABASE_URL and SUPABASE_ANON_KEY
-- 4. Test authentication flow
