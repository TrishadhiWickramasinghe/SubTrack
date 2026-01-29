# Supabase Integration - Complete Migration Guide

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Database Schema Setup](#database-schema-setup)
3. [Storage Configuration](#storage-configuration)
4. [Authentication Setup](#authentication-setup)
5. [Code Integration](#code-integration)
6. [Data Migration from Mock Data](#data-migration-from-mock-data)
7. [Real-time Subscriptions](#real-time-subscriptions)
8. [Error Handling & Best Practices](#error-handling--best-practices)
9. [Testing](#testing)
10. [Deployment Checklist](#deployment-checklist)

---

## Initial Setup

### Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: SubTrack (or your preference)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
4. Wait for project to initialize (5-10 minutes)

### Step 2: Get Your Credentials

1. After project creation, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Update your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

### Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage dotenv
```

---

## Database Schema Setup

### Step 1: Run the SQL Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `docs/SUPABASE_SCHEMA.sql`
4. Paste into the SQL editor
5. Click "Run" (or Cmd+Enter)

> **Note**: This creates all tables with RLS policies automatically

### Step 2: Verify Tables

1. Go to **Table Editor**
2. You should see these tables:
   - `users`
   - `categories`
   - `subscriptions`
   - `payments`
   - `trials`
   - `budgets`
   - `budget_categories`
   - `splits`
   - `split_members`
   - `achievements`

### Step 3: Enable Realtime (Optional)

1. Go to each table → **Realtime** tab
2. Enable it for tables you want live updates:
   - `subscriptions` ✓
   - `payments` ✓
   - `splits` ✓
   - `budgets` ✓

---

## Storage Configuration

### Step 1: Create Receipts Bucket

1. Go to **Storage** section
2. Click "New Bucket"
3. Name it: `receipts`
4. Set to **Private**
5. Click "Create Bucket"

### Step 2: Configure Storage RLS Policies

1. Select the `receipts` bucket
2. Go to **Policies** tab
3. Add these policies:

#### Policy 1: Users can upload receipts

```sql
CREATE POLICY "Users can upload receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Users can view their receipts

```sql
CREATE POLICY "Users can view their receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3: Users can delete their receipts

```sql
CREATE POLICY "Users can delete their receipts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Authentication Setup

### Step 1: Configure Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure "Email" is enabled
3. Go to **Settings** → **User Signups**
4. Choose signup requirements:
   - Email confirmation: Optional or Required (your choice)
   - Auto-confirm users: Yes (for development)

### Step 2: Anonymous Sign In

For anonymous users:
1. Go to **Settings** → **User Signups**
2. Enable "Allow anonymous sign-ins"

### Step 3: SMTP Configuration (Production)

For production, configure SMTP:
1. Go to **Authentication** → **Email Templates**
2. Set up custom SMTP in **Settings**

---

## Code Integration

### Step 1: Update Components

Replace mock data usage with Supabase services:

#### Before (Mock Data):
```typescript
import { MOCK_SUBSCRIPTIONS } from '@/utils/mockData';

const subscriptions = MOCK_SUBSCRIPTIONS;
```

#### After (Supabase):
```typescript
import { subscriptionsService } from '@/services/supabase';

const { data: response } = await subscriptionsService.getActiveSubscriptions(userId);
const subscriptions = response || [];
```

### Step 2: Set Up Context Provider

Create `context/SupabaseContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { authService } from '@/services/supabase/auth';
import type { User, SupabaseContextType } from '@/types/supabase';

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current user
    const initializeAuth = async () => {
      const { data: currentUser } = await authService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Fetch full user profile
        initializeAuth();
      } else {
        setUser(null);
      }
    });

    return () => {
      data?.subscription.unsubscribe();
    };
  }, []);

  const value: SupabaseContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp: authService.signUp.bind(authService),
    signIn: authService.signIn.bind(authService),
    signOut: authService.signOut.bind(authService),
    signInAnonymously: authService.signInAnonymously.bind(authService),
    updateUserProfile: (updates) =>
      user
        ? authService.updateUserProfile(user.id, updates)
        : Promise.reject(new Error('No user')),
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context;
}
```

### Step 3: Wrap App with Provider

In `app/_layout.tsx`:

```typescript
import { SupabaseProvider } from '@/context/SupabaseContext';

export default function RootLayout() {
  return (
    <SupabaseProvider>
      {/* Your other providers and layout */}
    </SupabaseProvider>
  );
}
```

---

## Data Migration from Mock Data

### Step 1: Create Migration Script

Create `scripts/migrateToSupabase.ts`:

```typescript
import { supabase } from '@/services/supabase';
import { categoriesService } from '@/services/supabase/categories';
import { subscriptionsService } from '@/services/supabase/subscriptions';
import { MOCK_SUBSCRIPTIONS, MOCK_CATEGORIES } from '@/utils/mockData';

export async function migrateData(userId: string) {
  try {
    console.log('Starting data migration...');

    // 1. Migrate categories
    console.log('Migrating categories...');
    for (const mockCategory of MOCK_CATEGORIES) {
      await categoriesService.createCategory(userId, {
        name: mockCategory.name,
        icon: mockCategory.icon,
        color: mockCategory.color,
        is_default: false,
      });
    }

    // 2. Migrate subscriptions
    console.log('Migrating subscriptions...');
    for (const mockSub of MOCK_SUBSCRIPTIONS) {
      // Find matching category
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', mockSub.category)
        .single();

      await subscriptionsService.createSubscription(userId, {
        name: mockSub.name,
        amount: mockSub.amount,
        currency: mockSub.currency,
        billing_cycle: mockSub.billingCycle,
        category_id: categories?.id,
        status: mockSub.status,
        payment_method: mockSub.paymentMethod,
        next_billing_date: mockSub.nextBillingDate,
        start_date: new Date().toISOString().split('T')[0],
        is_active: mockSub.status === 'active',
      });
    }

    console.log('Migration completed!');
    return { success: true };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error };
  }
}
```

### Step 2: Run Migration

```typescript
// In your auth/signup flow
const { user } = await authService.signUp(email, password);
if (user) {
  await migrateData(user.id);
}
```

---

## Real-time Subscriptions

### Example: Listen for Subscription Changes

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import type { Subscription } from '@/types/supabase';

export function useSubscriptionUpdates(userId: string) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchSubscriptions = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);

      setSubscriptions(data || []);
    };

    fetchSubscriptions();

    // Listen for real-time changes
    const subscription = supabase
      .channel(`subscriptions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSubscriptions((prev) => [...prev, payload.new as Subscription]);
          } else if (payload.eventType === 'UPDATE') {
            setSubscriptions((prev) =>
              prev.map((sub) =>
                sub.id === payload.new.id ? (payload.new as Subscription) : sub
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setSubscriptions((prev) =>
              prev.filter((sub) => sub.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return subscriptions;
}
```

---

## Error Handling & Best Practices

### Best Practice 1: Always Check for Errors

```typescript
const { data, error } = await subscriptionsService.getSubscriptions(userId);

if (error) {
  console.error('Failed to fetch subscriptions:', error.message);
  // Show user-friendly error message
  showErrorToast(error.message);
  return;
}

// Use data safely
const subscriptions = data?.data || [];
```

### Best Practice 2: Implement Retry Logic

```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Operation failed after retries');
}

// Usage
const subscriptions = await retryOperation(
  () => subscriptionsService.getSubscriptions(userId)
);
```

### Best Practice 3: Handle Offline Mode

```typescript
import NetInfo from '@react-native-community/netinfo';

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}

// In your components
if (!(await isOnline())) {
  // Use cached data from AsyncStorage
  const cached = await AsyncStorage.getItem('subscriptions_cache');
  return cached ? JSON.parse(cached) : [];
}
```

---

## Testing

### Test Authentication

```typescript
import { authService } from '@/services/supabase/auth';

export async function testAuth() {
  // Test signup
  const signupResult = await authService.signUp(
    'test@example.com',
    'TestPassword123!'
  );
  console.log('Signup result:', signupResult);

  // Test signin
  const signinResult = await authService.signIn(
    'test@example.com',
    'TestPassword123!'
  );
  console.log('Signin result:', signinResult);

  // Test current user
  const userResult = await authService.getCurrentUser();
  console.log('Current user:', userResult);
}
```

### Test Services

```typescript
import { subscriptionsService } from '@/services/supabase/subscriptions';

export async function testSubscriptions(userId: string) {
  // Create
  const created = await subscriptionsService.createSubscription(userId, {
    name: 'Test Subscription',
    amount: 9.99,
    currency: 'USD',
    billing_cycle: 'monthly',
    status: 'active',
    payment_method: 'credit_card',
    next_billing_date: '2024-02-28',
    start_date: '2024-01-28',
    is_active: true,
  });
  console.log('Created:', created);

  // Get all
  const all = await subscriptionsService.getSubscriptions(userId);
  console.log('All subscriptions:', all);

  // Get active
  const active = await subscriptionsService.getActiveSubscriptions(userId);
  console.log('Active subscriptions:', active);
}
```

---

## Deployment Checklist

- [ ] Supabase project created
- [ ] Environment variables configured in `.env`
- [ ] `.env.example` updated
- [ ] Database schema deployed
- [ ] RLS policies verified
- [ ] Storage bucket created with policies
- [ ] Authentication providers configured
- [ ] Realtime subscriptions enabled (if needed)
- [ ] Data migrated from mock
- [ ] Services integrated into components
- [ ] SupabaseContext set up
- [ ] Error handling implemented
- [ ] Offline mode tested
- [ ] Real-time updates tested
- [ ] User authentication tested (signup, signin, signout)
- [ ] Data CRUD operations tested
- [ ] Production environment variables set
- [ ] Backups configured in Supabase
- [ ] Monitoring/logging enabled

---

## Troubleshooting

### Issue: "Missing environment variables"

**Solution**: Ensure `.env` file exists and has correct values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Issue: RLS Policy Errors

**Solution**: Check that policies allow authenticated users. If custom policies, ensure they reference `auth.uid()`.

### Issue: Storage Upload Fails

**Solution**: 
1. Verify bucket exists and is private
2. Check storage policies are enabled
3. Ensure file size < 5MB

### Issue: Real-time Not Working

**Solution**:
1. Go to table settings → Realtime tab
2. Toggle realtime on
3. Check that you're subscribed to correct channel

### Issue: Slow Queries

**Solution**:
1. Check indexes are created (should be automatic with schema)
2. Avoid selecting all columns, be specific
3. Use pagination for large datasets

---

## Next Steps

1. Set up CI/CD pipeline
2. Configure custom authentication flows
3. Implement offline sync strategy
4. Set up backup schedule
5. Configure environment-specific configs
6. Add analytics/monitoring

For more help, see [Supabase Documentation](https://supabase.com/docs)
