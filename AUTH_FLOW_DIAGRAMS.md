# Authentication Flow Diagrams

## 1. Navigation Flow

```
┌─────────────────────────────────────────────┐
│         App Initialization                  │
│     (Root Layout _layout.tsx)               │
└────────────────────┬────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Check Auth Session   │
         │  (isAuthenticated?)   │
         └───────────┬───────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
       FALSE                  TRUE
          │                     │
          ▼                     ▼
    ┌─────────────┐      ┌──────────────┐
    │ Auth Stack  │      │ Tabs Stack   │
    │  (screens)  │      │ (main app)   │
    └──────┬──────┘      └──────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
 WELCOME       WELCOME
   │
   ├─→ "Get Started" button
   │   │
   │   ▼
   │  SIGNUP FORM
   │   ├─ Full Name
   │   ├─ Email
   │   ├─ Password
   │   └─ Confirm Password
   │   │
   │   ├─ Validation ✓
   │   │   │
   │   │   ▼
   │   │ Supabase signUp()
   │   │   │
   │   │   ├─ Success → User logged in → Tabs Stack
   │   │   │
   │   │   └─ Error → Show alert
   │
   └─→ "Sign In" button
       │
       ▼
      LOGIN FORM
       ├─ Email
       └─ Password
       │
       ├─ Validation ✓
       │   │
       │   ▼
       │ Supabase signIn()
       │   │
       │   ├─ Success → User logged in → Tabs Stack
       │   │
       │   └─ Error → Show alert
```

## 2. Authentication State Management

```
┌──────────────────────────────────────┐
│      Initial State (App Start)       │
│  isAuthenticated: false              │
│  isLoading: true                     │
│  user: null                          │
└───────────────┬──────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │   Check Session in    │
    │   Supabase Database   │
    └───────┬───────────────┘
            │
    ┌───────┴────────┐
    │                │
   HAS SESSION    NO SESSION
    │                │
    ▼                ▼
┌──────────┐   ┌──────────────┐
│isAuth:✓  │   │isAuth:✗      │
│user:data │   │user:null     │
│loading:✗ │   │loading:✗     │
└──────────┘   └──────────────┘
    │                │
    │                ▼
    │        ┌─────────────┐
    │        │   Welcome   │
    │        │   Screen    │
    │        └─────────────┘
    │
    ▼
┌─────────────┐
│  Main App   │
│  (Tabs)     │
└─────────────┘
```

## 3. Sign Up Process

```
USER INTERACTION                STATE CHANGES           API CALLS
─────────────────              ──────────────          ─────────

Fill Form
  │
  ▼
Click "Create Account"
  │
  ├─ Validate Form              isLoading: true
  │  ├─ Check required fields
  │  ├─ Check email format
  │  ├─ Check password length
  │  └─ Check terms accepted
  │
  ├─ Validation PASS
  │   │
  │   ▼
  │ Show Loading              ActivityIndicator: on
  │   │
  │   ▼
  │ Send to Supabase ─────────────────────► authService.signUp(
  │   │                                        email,
  │   │                                        password,
  │   │                                        fullName
  │   │                                      )
  │   │
  │   ├─ User Created ◄─────────────────── { data: user }
  │   │   │
  │   │   ▼
  │   │ Update Auth State        isAuthenticated: true
  │   │                          user: { id, email, ... }
  │   │                          isLoading: false
  │   │
  │   ├─ Success Alert
  │   │
  │   ▼
  │ Navigate to Main App       router.replace('/(tabs)')
  │
  └─ Validation FAIL
     │
     ▼
   Show Error Alert
     │
     ▼
   Stay on Sign Up Page
```

## 4. Login Process

```
USER INTERACTION                STATE CHANGES           API CALLS
─────────────────              ──────────────          ─────────

Fill Form (Email + Password)
  │
  ▼
Click "Sign In"
  │
  ├─ Validate Form              isLoading: true
  │  ├─ Check email format
  │  └─ Check password exists
  │
  ├─ Validation PASS
  │   │
  │   ▼
  │ Show Loading              ActivityIndicator: on
  │   │
  │   ▼
  │ Send to Supabase ─────────────────────► authService.signIn(
  │   │                                        email,
  │   │                                        password
  │   │                                      )
  │   │
  │   ├─ Credentials Valid ◄─────────────── { data: user }
  │   │   │
  │   │   ▼
  │   │ Update Auth State        isAuthenticated: true
  │   │                          user: { id, email, ... }
  │   │                          isLoading: false
  │   │
  │   ├─ Success Alert
  │   │
  │   ▼
  │ Navigate to Main App       router.replace('/(tabs)')
  │
  └─ Validation FAIL or Creds Invalid
     │
     ▼
   Show Error Alert
     │
     ▼
   Stay on Login Page
```

## 5. Component Hierarchy

```
RootLayout (_layout.tsx)
│
├─ isAuthenticated: false
│  │
│  └─ Stack → auth (AuthLayout)
│     │
│     ├─ Welcome
│     │  ├─ Features List
│     │  ├─ Get Started Button → /auth/signup
│     │  └─ Sign In Button → /auth/login
│     │
│     ├─ SignUp
│     │  ├─ TextInput: fullName
│     │  ├─ TextInput: email
│     │  ├─ TextInput: password
│     │  ├─ TextInput: confirmPassword
│     │  ├─ Checkbox: terms
│     │  └─ Button: Create Account
│     │
│     └─ Login
│        ├─ TextInput: email
│        ├─ TextInput: password
│        ├─ Link: Forgot Password?
│        └─ Button: Sign In
│
└─ isAuthenticated: true
   │
   └─ Stack → (tabs) (TabLayout)
      │
      ├─ Home (Dashboard)
      ├─ Subscriptions
      ├─ Analytics
      ├─ Explore
      │
      └─ Modal
```

## 6. Context Flow

```
┌──────────────────────────┐
│   AuthProvider           │
│ (Wraps entire app)       │
└────────────┬─────────────┘
             │
             ├─► useAuth() ──► useAuthContext()
             │
             ├─► Provides:
             │   - user
             │   - isAuthenticated
             │   - isLoading
             │   - error
             │   - signUp()
             │   - signIn()
             │   - signOut()
             │   - clearError()
             │
             └─► Available in any child component
                 via useAuthContext() hook
```

## 7. Error Handling Flow

```
User Action
  │
  ▼
Input Validation
  │
  ├─ FAIL ──► Show Error Alert ──► User corrects input
  │
  └─ PASS
     │
     ▼
  Send to Supabase
     │
     ├─ Network Error
     │  │
     │  └─► Show Error Alert
     │
     ├─ Auth Error (wrong password)
     │  │
     │  └─► Show Error Alert
     │
     ├─ Server Error
     │  │
     │  └─► Show Error Alert
     │
     └─ Success
        │
        └─► Navigate to App
```

## 8. State Transitions

```
Initial State
│
├─ App boots
│  │
│  └─► Check Session
│      │
│      ├─ Found ──► isAuthenticated = true ──► Show Main App
│      │
│      └─ Not Found ──► isAuthenticated = false ──► Show Auth Screens
│
Welcome Screen
│
├─ User clicks "Get Started"
│  │
│  └─► Navigate to Sign Up
│
├─ User clicks "Sign In"
│  │
│  └─► Navigate to Login
│
Sign Up Screen
│
├─ Valid Form + Success
│  │
│  └─► isAuthenticated = true ──► Navigate to Main App
│
├─ Invalid Form
│  │
│  └─► Show Validation Error ──► Stay on Sign Up
│
└─ API Error
   │
   └─► Show Error Alert ──► Stay on Sign Up

Login Screen
│
├─ Valid Credentials
│  │
│  └─► isAuthenticated = true ──► Navigate to Main App
│
├─ Invalid Credentials
│  │
│  └─► Show Error Alert ──► Stay on Login
│
└─ API Error
   │
   └─► Show Error Alert ──► Stay on Login

Main App (Tabs)
│
└─ User clicks Sign Out (from any screen)
   │
   └─► isAuthenticated = false ──► Navigate to Welcome
```

## 9. Data Flow: Sign Up Example

```
┌─────────────────────────────────────────────────────────────────┐
│ SignUp Component                                                │
│ State: email, password, confirmPassword, fullName, agreedToTerms│
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │ validateForm()          │
        │ - Check required fields │
        │ - Check formats         │
        │ - Check password match  │
        │ - Check terms agreed    │
        └────────────┬────────────┘
                     │
                ┌────┴────┐
             PASS        FAIL
                │          │
                ▼          ▼
        ┌──────────────┐  Alert
        │ setLoading() │
        └────────┬─────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ useAuthContext.signUp(     │
    │   email,                   │
    │   password,                │
    │   fullName                 │
    │ )                          │
    └────────────┬───────────────┘
                 │
          ┌──────┴──────┐
          │             │
          ▼             ▼
    authService.    authService.
      signUp()        ERROR
        │               │
        ▼               ▼
    Supabase       Show Error
      Auth          Alert
        │
        ▼
    User Created
        │
        ▼
    Update User
    in AuthContext
        │
        ▼
    Navigate to
    Main App
```

## 10. Login Flow Timeline

```
T0: User enters email and password
│
T1: User taps "Sign In" button
│
T2: Form validation starts
├─ Check email format
├─ Check password exists
│
T3: If validation passes → API call to Supabase
│
T4-T6: Network request in progress (loading state active)
│
T7: Response received from Supabase
├─ Success: User data returned
├─ Failure: Error returned
│
T8: Update AuthContext state
├─ Success: isAuthenticated = true
├─ Failure: error = error message
│
T9: UI updates
├─ Success: Hide loader, show success message
├─ Failure: Hide loader, show error alert
│
T10: Navigation
├─ Success: router.replace('/(tabs)')
├─ Failure: User stays on login screen
```
