/**
 * Supabase Integration Code Snippets
 * Copy-paste these into your existing files to connect authentication
 */

// ============================================================================
// SNIPPET 1: Update hooks/useAuth.ts - signUp Method
// ============================================================================
// Replace the entire signUp function with this:

/*
const signUp = useCallback(
  async (email: string, password: string, fullName: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await authService.signUp(email, password, fullName);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data) {
        throw new Error('Sign up failed - no data returned');
      }

      const newUser: User = {
        id: response.data.id,
        email: response.data.email || email,
        fullName: fullName,
        createdAt: response.data.created_at || new Date().toISOString(),
      };

      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  },
  []
);
*/

// ============================================================================
// SNIPPET 2: Update hooks/useAuth.ts - signIn Method
// ============================================================================
// Replace the entire signIn function with this:

/*
const signIn = useCallback(
  async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await authService.signIn(email, password);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data) {
        throw new Error('Sign in failed - no data returned');
      }

      const user: User = {
        id: response.data.id,
        email: response.data.email || email,
        fullName: response.data.user_metadata?.full_name || 'User',
        createdAt: response.data.created_at || new Date().toISOString(),
      };

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  },
  []
);
*/

// ============================================================================
// SNIPPET 3: Update hooks/useAuth.ts - useEffect (Auth Listener)
// ============================================================================
// Replace the useEffect in the signUp/signIn section with this:

/*
useEffect(() => {
  try {
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
            } as User,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      }
    );

    return () => data.subscription.unsubscribe();
  } catch (error) {
    console.error('Auth listener error:', error);
    setAuthState((prev) => ({
      ...prev,
      isLoading: false,
    }));
  }
}, []);
*/

// ============================================================================
// SNIPPET 4: Update app/_layout.tsx - checkAuth Function
// ============================================================================
// Replace the checkAuth function with this:

/*
const checkAuth = async () => {
  try {
    // Import at top: import { authService } from '@/services/supabase/auth';
    const session = await authService.getSession();
    setIsAuthenticated(!!session?.user);
  } catch (error) {
    console.error('Auth check error:', error);
    setIsAuthenticated(false);
  } finally {
    setIsLoading(false);
  }
};
*/

// ============================================================================
// SNIPPET 5: Update app/_layout.tsx - Add AuthProvider Wrapper
// ============================================================================
// Wrap your Stack component with AuthProvider:

/*
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ... existing code ...

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* ... existing stack screens ... */}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
*/

// ============================================================================
// SNIPPET 6: Add signOut Implementation to hooks/useAuth.ts
// ============================================================================
// Replace the signOut function with this:

/*
const signOut = useCallback(async () => {
  try {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    // Import at top: import { authService } from '@/services/supabase/auth';
    await authService.signOut();

    setAuthState(initialState);
    router.replace('/auth/welcome');

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
    setAuthState((prev) => ({
      ...prev,
      isLoading: false,
      error: errorMessage,
    }));
    return { success: false, error: errorMessage };
  }
}, [router]);
*/

// ============================================================================
// SNIPPET 7: Update Login Screen to Use Context (Optional)
// ============================================================================
// Add this to app/auth/login.tsx after imports:

/*
import { useAuthContext } from '@/context/AuthContext';

export default function LoginScreen() {
  // ... existing code ...
  const { signIn } = useAuthContext();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        Alert.alert('Success', 'Logged in successfully!');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component ...
}
*/

// ============================================================================
// SNIPPET 8: Update Sign Up Screen to Use Context (Optional)
// ============================================================================
// Add this to app/auth/signup.tsx after imports:

/*
import { useAuthContext } from '@/context/AuthContext';

export default function SignUpScreen() {
  // ... existing code ...
  const { signUp } = useAuthContext();

  const handleSignUp = async () => {
    // ... validation code ...

    setLoading(true);

    try {
      const result = await signUp(email, password, fullName);
      
      if (result.success) {
        Alert.alert('Success', 'Account created! Please verify your email.');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Sign Up Failed', result.error || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component ...
}
*/

// ============================================================================
// IMPORTS TO ADD
// ============================================================================

/*
Required imports in files:

In hooks/useAuth.ts:
import { supabase } from '@/services/supabase/client';
import { authService } from '@/services/supabase/auth';

In app/_layout.tsx:
import { authService } from '@/services/supabase/auth';

In app/auth/login.tsx (if using context):
import { useAuthContext } from '@/context/AuthContext';

In app/auth/signup.tsx (if using context):
import { useAuthContext } from '@/context/AuthContext';
*/

// ============================================================================
// ENVIRONMENT VARIABLES (.env)
// ============================================================================

/*
Make sure your .env file contains:

EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

And update services/supabase/client.ts to use these variables if not already done.
*/

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/*
After implementation, test these scenarios:

1. Sign Up Flow
   [ ] Navigate to Welcome → "Get Started"
   [ ] Fill in form with valid data
   [ ] Submit signup form
   [ ] Check Supabase Auth for new user
   [ ] User should be redirected to main app

2. Login Flow
   [ ] Navigate to Welcome → "Sign In"
   [ ] Enter correct credentials
   [ ] Should redirect to main app
   [ ] Enter wrong credentials
   [ ] Should show error message

3. Session Persistence
   [ ] Sign in
   [ ] Close and reopen app
   [ ] Should still be logged in
   [ ] User data should be available

4. Sign Out
   [ ] While logged in, trigger sign out
   [ ] Should redirect to Welcome screen
   [ ] Session should be cleared

5. Error Handling
   [ ] Test network errors
   [ ] Test invalid credentials
   [ ] Test email validation
   [ ] Test password validation
*/

// ============================================================================
// USEFUL DEBUGGING
// ============================================================================

/*
Add these console logs to debug:

In useAuth.ts:
console.log('Auth state updated:', authState);
console.log('Sign up attempt:', email, fullName);
console.log('Sign in attempt:', email);

In app/_layout.tsx:
console.log('Is authenticated:', isAuthenticated);
console.log('Is loading:', isLoading);
console.log('Auth check completed');

Check Supabase dashboard for:
- New users appearing in Authentication tab
- User metadata is saved correctly
- Email confirmed status
*/
