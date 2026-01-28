# Supabase Integration Setup Guide

Complete step-by-step guide to integrate Supabase into SubTrack app.

## Quick Start (5 minutes)

### 1. Create Supabase Account

```bash
# Open browser and go to:
https://app.supabase.com

# Sign up with your email
```

### 2. Create Project

- Click "New Project"
- Fill in:
  - **Name**: SubTrack
  - **Password**: Create strong password (save it!)
  - **Region**: Pick closest to you
- Click "Create new project"
- Wait 5-10 minutes for initialization

### 3. Get Credentials

```
Dashboard → Settings → API

Copy these:
- Project URL → EXPO_PUBLIC_SUPABASE_URL
- anon public key → EXPO_PUBLIC_SUPABASE_ANON_KEY
```

### 4. Update .env File

```bash
# Edit .env file in project root:
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key...
```

### 5. Deploy Database Schema

```
Dashboard → SQL Editor

1. Click "New Query"
2. Copy entire content from: docs/SUPABASE_SCHEMA.sql
3. Paste into editor
4. Click "Run"
5. Wait for completion ✓
```

### 6. Create Storage Bucket

```
Dashboard → Storage

1. Click "New Bucket"
2. Name: receipts
3. Privacy: Private
4. Click "Create Bucket"
```

### 7. Install Dependencies

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

### 8. Run App

```bash
npm start
```

Done! ✓

---

## Detailed Setup

See [SUPABASE_MIGRATION_GUIDE.md](./SUPABASE_MIGRATION_GUIDE.md) for comprehensive setup instructions.

---

## File Structure

New files created:

```
.env                              # Environment variables
.env.example                      # Template for .env

types/
  supabase.ts                     # TypeScript interfaces

services/supabase/
  client.ts                       # Client initialization
  auth.ts                         # Authentication
  subscriptions.ts                # Subscription CRUD
  categories.ts                   # Categories CRUD
  budgets.ts                      # Budget management
  payments.ts                     # Payment tracking
  trials.ts                       # Trial management
  splits.ts                       # Cost splitting
  storage.ts                      # File uploads
  database.types.ts              # Database types
  index.ts                        # Exports

config/
  envConfig.ts                    # Environment helper

hooks/
  useSupabase.ts                  # Custom hooks

docs/
  SUPABASE_SCHEMA.sql            # Database schema
  SUPABASE_MIGRATION_GUIDE.md    # Full guide
```

---

## Common Tasks

### Sign Up User

```typescript
import { authService } from '@/services/supabase';

const { data, error } = await authService.signUp(
  'user@example.com',
  'password123',
  'John Doe'
);

if (error) {
  console.error(error.message);
} else {
  console.log('User created:', data);
}
```

### Create Subscription

```typescript
import { subscriptionsService } from '@/services/supabase';

const { data, error } = await subscriptionsService.createSubscription(
  userId,
  {
    name: 'Netflix',
    amount: 15.99,
    currency: 'USD',
    billing_cycle: 'monthly',
    status: 'active',
    payment_method: 'credit_card',
    next_billing_date: '2024-02-28',
    start_date: '2024-01-28',
    is_active: true,
  }
);
```

### Fetch Subscriptions

```typescript
import { useSubscriptions } from '@/hooks/useSupabase';

function MyComponent() {
  const { data, loading, error } = useSubscriptions();

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
```

### Upload Receipt

```typescript
import { storageService } from '@/services/supabase';

const { data, error } = await storageService.uploadReceipt(
  userId,
  subscriptionId,
  fileUri,
  'receipt.jpg'
);

if (!error) {
  console.log('Receipt URL:', data?.url);
}
```

---

## Testing

### Test Auth

```bash
# In your app or test file:
import { authService } from '@/services/supabase/auth';

// Test signup
await authService.signUp('test@example.com', 'test123', 'Test User');

// Test signin
await authService.signIn('test@example.com', 'test123');

// Test signout
await authService.signOut();
```

### Test Services

```bash
# Check each service works:
- subscriptionsService.getSubscriptions()
- categoriesService.getCategories()
- budgetsService.getOrCreateMonthlyBudget()
- paymentsService.getSubscriptionPayments()
```

---

## Troubleshooting

### Error: "Missing environment variables"

Check `.env` file has:

```env
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### Error: "RLS policy violation"

Common issue - check:
1. User is authenticated
2. RLS policies exist
3. User has permission for table

Run this in SQL Editor to check:

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'subscriptions';
```

### Error: "Bucket not found"

Create bucket manually:
1. Dashboard → Storage
2. New Bucket → "receipts" → Private

### Authentication fails

1. Check email/password correct
2. Verify user exists in Auth dashboard
3. Check email confirmation is enabled

### Real-time not updating

1. Go to table → Realtime tab → Toggle ON
2. Verify subscription channel name matches table name

---

## Next Steps

1. ✅ Follow Quick Start above
2. ✅ Test authentication in your app
3. ✅ Create first subscription
4. ✅ Migrate mock data (see guide)
5. ✅ Implement offline sync (optional)
6. ✅ Enable real-time updates (optional)

---

## Support

- [Supabase Docs](https://supabase.com/docs)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Discord Community](https://discord.supabase.com)

---

## Security Notes

⚠️ **IMPORTANT**

1. Never commit `.env` to git
2. Keep `EXPO_PUBLIC_SUPABASE_ANON_KEY` safe (it's public but limited by RLS)
3. Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code
4. Always validate input on server
5. Use RLS policies for row-level security

---

## Architecture

```
┌─────────────────────────────────────┐
│  React Native / Expo App            │
├─────────────────────────────────────┤
│  Context (SupabaseContext)          │
│  Hooks (useSubscriptions, etc)      │
├─────────────────────────────────────┤
│  Services Layer                     │
│  ├─ authService                     │
│  ├─ subscriptionsService            │
│  ├─ categoriesService               │
│  ├─ budgetsService                  │
│  ├─ paymentsService                 │
│  ├─ storageService                  │
│  └─ etc...                          │
├─────────────────────────────────────┤
│  Supabase Client (supabase.js)      │
├─────────────────────────────────────┤
│  Supabase Cloud                     │
│  ├─ PostgreSQL Database             │
│  ├─ Auth System                     │
│  ├─ Storage (S3-like)               │
│  └─ Real-time Subscriptions         │
└─────────────────────────────────────┘
```

---

Last Updated: January 28, 2026
