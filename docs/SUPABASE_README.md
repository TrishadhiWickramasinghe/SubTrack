# SubTrack Supabase Integration

Complete Supabase backend integration for the SubTrack React Native app.

## What's Included

### 📦 Services Layer
- **Auth Service** - Sign up, sign in, password reset, user management
- **Subscriptions Service** - Full CRUD for subscriptions with filtering
- **Categories Service** - Category management with defaults
- **Budgets Service** - Monthly budgets with category limits
- **Payments Service** - Payment tracking and history
- **Trials Service** - Trial period management
- **Splits Service** - Cost splitting between members
- **Storage Service** - Receipt uploads to cloud storage

### 🔐 Security
- Row-Level Security (RLS) on all tables
- User data isolation - users can only access their own data
- Secure authentication with JWT
- Storage policies for file uploads

### 📊 Database Schema
- Users table with preferences
- Subscriptions with related data
- Categories with icons and colors
- Budgets with category limits
- Payments with receipt tracking
- Trials for subscription trials
- Splits for cost sharing
- Achievements system

### 🎯 Custom Hooks
- `useSubscriptions()` - Fetch user subscriptions
- `useActiveSubscriptions()` - Get only active subscriptions
- `useCategories()` - Fetch categories
- `useMonthlyBudget()` - Get/create monthly budget
- `useUpcomingSubscriptions()` - Get upcoming renewals
- `useSubscriptionStats()` - Get aggregate statistics

### 🔄 Real-time Updates (Optional)
- Live subscription updates
- Real-time payment notifications
- Budget alerts when limits exceeded

## Quick Start

### 1. Environment Setup

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Create Database

See [SUPABASE_SCHEMA.sql](./docs/SUPABASE_SCHEMA.sql) - Copy and run in Supabase SQL Editor

### 3. Create Storage Bucket

- Dashboard → Storage → New Bucket
- Name: `receipts`
- Privacy: Private

### 4. Use in Your App

```typescript
import { useSubscriptions } from '@/hooks/useSupabase';

function SubscriptionsScreen() {
  const { data: subscriptions, loading, error } = useSubscriptions();

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <FlatList
      data={subscriptions}
      renderItem={({ item }) => (
        <SubscriptionCard subscription={item} />
      )}
    />
  );
}
```

## File Structure

```
.env                          # Environment variables (local, not committed)
.env.example                  # Template for .env

services/supabase/
  ├── client.ts              # Supabase client initialization
  ├── auth.ts                # Authentication service
  ├── subscriptions.ts       # Subscription CRUD operations
  ├── categories.ts          # Category management
  ├── budgets.ts             # Budget management
  ├── payments.ts            # Payment tracking
  ├── trials.ts              # Trial management
  ├── splits.ts              # Cost split management
  ├── storage.ts             # File storage operations
  ├── database.types.ts      # Database type definitions
  └── index.ts               # Service exports

types/
  └── supabase.ts           # TypeScript interfaces

config/
  └── envConfig.ts          # Environment configuration helper

hooks/
  └── useSupabase.ts        # Custom React hooks

context/
  └── SupabaseContext.tsx   # (Create) Auth context provider

docs/
  ├── SUPABASE_SCHEMA.sql       # Database schema
  ├── SUPABASE_SETUP.md         # Setup instructions
  └── SUPABASE_MIGRATION_GUIDE.md # Migration guide
```

## Core Concepts

### 1. Authentication

```typescript
// Sign up
const { data, error } = await authService.signUp(
  'user@example.com',
  'password',
  'John Doe'
);

// Sign in
const { data, error } = await authService.signIn(
  'user@example.com',
  'password'
);

// Sign in anonymously (no credentials)
const { data, error } = await authService.signInAnonymously();

// Get current user
const { data: user, error } = await authService.getCurrentUser();

// Sign out
const { error } = await authService.signOut();
```

### 2. Subscriptions

```typescript
// Create
await subscriptionsService.createSubscription(userId, {
  name: 'Netflix',
  amount: 15.99,
  currency: 'USD',
  billing_cycle: 'monthly',
  status: 'active',
  payment_method: 'credit_card',
  next_billing_date: '2024-02-28',
  start_date: '2024-01-28',
  is_active: true,
});

// Get all
const { data: response } = await subscriptionsService.getSubscriptions(userId);

// Get active only
const { data } = await subscriptionsService.getActiveSubscriptions(userId);

// Get upcoming (next 7 days)
const { data } = await subscriptionsService.getUpcomingSubscriptions(userId, 7);

// Get by category
const { data } = await subscriptionsService.getSubscriptionsByCategory(
  userId,
  categoryId
);

// Search
const { data } = await subscriptionsService.searchSubscriptions(
  userId,
  'netflix'
);

// Update
await subscriptionsService.updateSubscription(subId, userId, {
  amount: 16.99,
});

// Delete
await subscriptionsService.deleteSubscription(subId, userId);
```

### 3. Categories

```typescript
// Create custom category
await categoriesService.createCategory(userId, {
  name: 'Gaming',
  icon: 'gamepad',
  color: '#FF6B6B',
  is_default: false,
});

// Get all user categories
const { data } = await categoriesService.getCategories(userId);

// Get default categories
const { data } = await categoriesService.getDefaultCategories();

// Seed default categories for new user
await categoriesService.seedDefaultCategories(userId);
```

### 4. Budgets

```typescript
// Get or create monthly budget
const { data } = await budgetsService.getOrCreateMonthlyBudget(
  userId,
  '2024-02',
  5000 // Monthly limit
);

// Set limit for category
await budgetsService.setBudgetCategory(budgetId, categoryId, 1000);

// Get budget summary
const { data } = await budgetsService.getBudgetSummary(userId, '2024-02');

// Get budget history (last 12 months)
const { data } = await budgetsService.getBudgetHistory(userId);
```

### 5. Storage (Receipts)

```typescript
// Upload receipt
const { data, error } = await storageService.uploadReceipt(
  userId,
  subscriptionId,
  fileUri,
  'receipt.jpg'
);

// Get signed URL for viewing
const { data: url } = await storageService.getSignedUrl(filePath);

// List receipts for subscription
const { data } = await storageService.listReceipts(userId, subId);

// Delete receipt
await storageService.deleteReceipt(filePath);
```

## Error Handling

All services return a `SupabaseResponse<T>` with data and error:

```typescript
const { data, error } = await subscriptionsService.getSubscriptions(userId);

if (error) {
  console.error('Error:', error.message);
  showErrorToast(error.message);
  return;
}

// Use data safely
const subscriptions = data?.data || [];
```

## RLS Security

All tables have Row Level Security enabled:

- **Users can only view their own data**
- **Users cannot access other users' subscriptions, budgets, etc.**
- **Storage files isolated by user**

Example RLS policy:

```sql
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

## Real-time Subscriptions (Optional)

To enable live updates:

1. Go to each table → Realtime tab → Toggle ON
2. Subscribe in your component:

```typescript
useEffect(() => {
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
        // Handle INSERT, UPDATE, DELETE
        console.log('Change received!', payload)
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [userId]);
```

## Offline Mode

Supabase.js handles session persistence automatically via AsyncStorage. For data caching:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache data locally
await AsyncStorage.setItem('subscriptions', JSON.stringify(subscriptions));

// Retrieve cached data
const cached = await AsyncStorage.getItem('subscriptions');
const subscriptions = cached ? JSON.parse(cached) : [];
```

## Best Practices

1. **Always check for errors** - Use the `error` field from responses
2. **Use hooks for fetching** - Cleaner component code with `useSubscriptions()`
3. **Implement loading states** - Users need feedback during async operations
4. **Cache strategically** - Store frequently accessed data locally
5. **Validate on client** - Prevent unnecessary API calls
6. **Use TypeScript** - Full type safety with provided interfaces
7. **Error boundaries** - Wrap components with error handlers
8. **Testing** - Test each service individually

## Troubleshooting

### Issue: "RLS policy violation"

- User not authenticated
- RLS policy doesn't allow the operation
- Check Supabase dashboard for policies

### Issue: "Network error"

- Check internet connection
- Verify Supabase URL is correct
- Check CORS settings if web

### Issue: "File upload fails"

- Check bucket exists and is private
- Verify storage policies enabled
- File size < 5MB

### Issue: "Real-time not updating"

- Enable realtime on table
- Verify channel subscription
- Check browser console for errors

## Learn More

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

Need help? Check:
1. [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Quick start
2. [SUPABASE_MIGRATION_GUIDE.md](./SUPABASE_MIGRATION_GUIDE.md) - Detailed setup
3. [Supabase Docs](https://supabase.com/docs)
4. Supabase Discord community

---

**Last Updated**: January 28, 2026  
**Status**: ✅ Complete and Ready to Use
