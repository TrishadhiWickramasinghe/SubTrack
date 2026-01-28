# Authentication Quick Reference

## 🚀 Quick Start

### Using Auth in Your Components

```typescript
import { useAuthContext } from '@/context/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuthContext();

  return (
    <View>
      {isAuthenticated && <Text>Welcome, {user?.fullName}!</Text>}
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}
```

## 📍 Screen Locations

| Screen | Path | Purpose |
|--------|------|---------|
| Welcome | `app/auth/welcome.tsx` | Landing page with Sign Up/Sign In |
| Login | `app/auth/login.tsx` | Email/password login |
| Sign Up | `app/auth/signup.tsx` | Create new account |

## 🔧 Key Files to Modify

### 1. Enable Real Authentication

**File: `hooks/useAuth.ts`** (Lines with TODO comments)

Replace signUp method:
```typescript
const signUp = useCallback(
  async (email: string, password: string, fullName: string) => {
    const response = await authService.signUp(email, password, fullName);
    if (response.error) throw new Error(response.error.message);
    // ... rest of implementation
  }
);
```

### 2. Check Session on App Launch

**File: `app/_layout.tsx`** (lines 18-20)

```typescript
const checkAuth = async () => {
  const session = await authService.getSession();
  setIsAuthenticated(!!session);
};
```

### 3. Listen to Auth Changes

**File: `hooks/useAuth.ts`** (useEffect hook)

```typescript
useEffect(() => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      // User logged in
    } else {
      // User logged out
    }
  });
  return () => data.subscription.unsubscribe();
}, []);
```

## 🎨 UI Components Used

- `TextInput` - Form inputs
- `TouchableOpacity` - Buttons
- `ScrollView` - Scrollable content
- `SafeAreaView` - Safe layout
- `ActivityIndicator` - Loading spinner
- `Alert` - Error/success messages

## ✅ Validation Rules

| Field | Rules |
|-------|-------|
| Email | Valid email format (regex) |
| Password | Min 8 characters |
| Confirm Password | Must match password |
| Full Name | Required, non-empty |
| Terms | Must be checked |

## 🎯 Navigation Flow

```
Welcome
├─→ Sign Up → Validate → Create User → App
├─→ Sign In → Validate → Auth User → App
└─→ Sign In Button → Login Screen
```

## 🔐 Auth Methods

```typescript
// Sign up
const { success, error } = await signUp(email, password, fullName);

// Sign in
const { success, error } = await signIn(email, password);

// Sign out
const { success, error } = await signOut();

// Clear errors
clearError();
```

## 🎭 Theme Colors

Uses your app's theme:
- `theme.tint` - Primary color (buttons)
- `theme.text` - Text color
- `theme.background` - Background
- `theme.tabIconDefault` - Secondary text

## 📱 Responsive Breakpoints

All screens use:
- Horizontal padding: 20px
- Vertical padding: varies per screen
- Button radius: 8-12px
- Input radius: 8px

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Blank screen | Check `isLoading` state in root layout |
| Can't login | Verify Supabase service methods are implemented |
| Form not submitting | Check validation rules above |
| Back button not working | Verify router.back() is called |
| Theme colors wrong | Check theme constants are imported |

## 🧪 Testing Checklist

- [ ] Welcome screen displays correctly
- [ ] Sign Up form validates inputs
- [ ] Login form validates inputs
- [ ] Password visibility toggle works
- [ ] Navigation between screens works
- [ ] Terms checkbox toggle works
- [ ] Loading states show during submission
- [ ] Error messages display on validation failure
- [ ] Success → navigates to main app

## 📚 Related Documentation

- **Full Setup Guide**: `docs/AUTHENTICATION_SETUP.md`
- **Summary**: `AUTH_IMPLEMENTATION_SUMMARY.md`
- **Supabase Docs**: https://supabase.com/docs/guides/auth

## 🚦 Current Status

- ✅ UI Screens: Complete
- ✅ Form Validation: Complete
- ✅ Navigation: Complete
- ✅ State Management: Complete
- ⏳ Supabase Integration: Pending
- ⏳ Email Verification: Pending
- ⏳ Password Reset: Pending
