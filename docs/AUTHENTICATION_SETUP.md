# Authentication Implementation Guide

## Overview
This guide explains how to integrate the authentication screens with your Supabase backend.

## Files Created

### 1. **Auth Screens**
   - **`app/auth/_layout.tsx`** - Auth stack navigation layout
   - **`app/auth/welcome.tsx`** - Landing page with Sign Up and Sign In buttons
   - **`app/auth/login.tsx`** - Email/password login screen
   - **`app/auth/signup.tsx`** - Email/password registration screen

### 2. **Auth Logic**
   - **`hooks/useAuth.ts`** - Custom hook for authentication state management
   - **`context/AuthContext.tsx`** - Global auth context provider

### 3. **Updated Files**
   - **`app/_layout.tsx`** - Root layout with conditional auth/app navigation

## Current Flow

```
┌─────────────────────────────────────┐
│      App Root Layout                │
│   (Checks isAuthenticated)          │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
    FALSE             TRUE
       │                │
   ┌───▼────────┐  ┌─────▼──────┐
   │ Auth Stack │  │ Tabs Stack │
   ├────────────┤  │ (Main App) │
   │ Welcome    │  └────────────┘
   │ Login      │
   │ SignUp     │
   └────────────┘
```

## Integration Steps

### Step 1: Connect Supabase Auth Methods

Update `services/supabase/auth.ts` methods in the hooks:

**In `hooks/useAuth.ts`**, replace TODO sections:

```typescript
// For signUp:
const response = await authService.signUp(email, password, fullName);
if (response.error) {
  throw new Error(response.error.message);
}
const newUser = response.data.user;

// For signIn:
const response = await authService.signIn(email, password);
if (response.error) {
  throw new Error(response.error.message);
}
const user = response.data.user;

// For signOut:
await authService.signOut();
```

### Step 2: Update Root Layout Auth Check

In `app/_layout.tsx`, replace the TODO in `checkAuth()`:

```typescript
const checkAuth = async () => {
  try {
    const session = await authService.getSession();
    setIsAuthenticated(!!session);
  } catch (error) {
    setIsAuthenticated(false);
  } finally {
    setIsLoading(false);
  }
};
```

### Step 3: Add AuthProvider to Root

Wrap your app with AuthProvider (recommended in a provider component or root):

```typescript
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Your layout */}
    </AuthProvider>
  );
}
```

### Step 4: Listen to Auth State Changes

Add auth state listener in `hooks/useAuth.ts` `useEffect`:

```typescript
useEffect(() => {
  const { data } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        const user = session.user;
        setAuthState({
          user: {
            id: user.id,
            email: user.email || '',
            fullName: user.user_metadata?.full_name || '',
            createdAt: user.created_at,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState(initialState);
      }
    }
  );

  return () => data.subscription.unsubscribe();
}, []);
```

## Component Usage

### Using useAuth Hook (within AuthProvider)

```typescript
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <View>
      {isAuthenticated && <Text>Welcome, {user?.fullName}</Text>}
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}
```

### Using useAuthContext Hook

```typescript
import { useAuthContext } from '@/context/AuthContext';

export default function MyComponent() {
  const { user, signOut } = useAuthContext();

  return (
    <View>
      <Text>{user?.email}</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}
```

## Key Features Implemented

✅ Welcome screen with app introduction
✅ Email/password login
✅ Email/password signup with validation
✅ Password visibility toggle
✅ Form validation
✅ Terms of service agreement
✅ Loading states
✅ Error handling
✅ Responsive design with theme support
✅ Navigation flow management

## Next Steps

1. **Connect Supabase**: Update auth methods in `services/supabase/auth.ts`
2. **Test Auth Flow**: Verify login/signup works with your backend
3. **Add Email Verification**: Implement email confirmation flow
4. **Implement Password Reset**: Add forgot password functionality
5. **Add Social Auth**: Support Google, GitHub, etc. (optional)
6. **Setup Session Persistence**: Use secure storage for tokens
7. **Add 2FA**: Implement two-factor authentication (optional)

## File Locations

```
app/
├── auth/
│   ├── _layout.tsx          (Auth navigation)
│   ├── welcome.tsx          (Landing page)
│   ├── login.tsx            (Login form)
│   └── signup.tsx           (Signup form)
├── (tabs)/
│   └── ... (main app screens)
└── _layout.tsx              (Root with auth check)

context/
├── AuthContext.tsx          (Global auth context)
└── ...

hooks/
├── useAuth.ts               (Auth state management)
└── ...
```

## Testing

To test the auth flow:

1. Start the app - you should see the Welcome screen
2. Click "Get Started" → Sign Up screen
3. Fill in the form and submit
4. After signup, you should navigate to main app
5. Click back to welcome → "Sign In" → Login screen
6. Login with credentials
7. Should navigate to main app tabs

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank screen after login | Check auth state in root layout |
| Navigation loops | Verify `isAuthenticated` state logic |
| Form validation not working | Check regex patterns and validation |
| Can't go back | Check back button navigation in screens |

## Environment Setup

Make sure your `.env` file has:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## References

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [React Native Best Practices](https://reactnative.dev/docs/native-modules-intro)
