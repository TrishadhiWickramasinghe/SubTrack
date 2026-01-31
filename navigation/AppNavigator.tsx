import { colors } from '@/config/theme';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { navigationRef } from './navigationRef';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Import screens
import OnboardingScreen from '@screens/auth/OnboardingScreen';
import PinSetupScreen from '@screens/auth/PinSetupScreen';
import SetupScreen from '@screens/auth/SetupScreen';
import WelcomeScreen from '@screens/auth/WelcomeScreen';

// Import contexts
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@hooks/useTheme';

// Create stack navigator
const Stack = createStackNavigator();

// Custom theme for navigation
const getNavigationTheme = (isDark: boolean) => ({
  dark: isDark,
  colors: {
    primary: colors.primary,
    background: isDark ? colors.backgroundDark : colors.background,
    card: isDark ? colors.surfaceDark : colors.surface,
    text: isDark ? colors.textDark : colors.text,
    border: isDark ? colors.borderDark : colors.border,
    notification: colors.primary,
  },
});

const AppNavigator: React.FC = () => {
  const { isDark } = useTheme();
  const { 
    user, 
    isLoading, 
    isFirstLaunch,
    hasCompletedOnboarding,
    hasSetupPin,
    hasCompletedSetup 
  } = useAuth();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Determine initial route based on auth state
  const getInitialRoute = () => {
    if (isLoading) {
      return 'Splash'; // You might want to add a splash screen
    }

    // First time launch flow
    if (isFirstLaunch && !hasCompletedOnboarding) {
      return 'Onboarding';
    }

    if (isFirstLaunch && hasCompletedOnboarding && !hasSetupPin) {
      return 'PinSetup';
    }

    if (isFirstLaunch && hasCompletedOnboarding && hasSetupPin && !hasCompletedSetup) {
      return 'Setup';
    }

    // Returning user flow
    if (!user) {
      return 'Auth';
    }

    // User is authenticated
    return 'Main';
  };

  // Screen options for stack navigator
  const screenOptions = {
    headerShown: false,
    cardStyle: {
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    gestureEnabled: true,
    animationEnabled: true,
  };

  // Handle navigation ready
  const handleNavigationReady = () => {
    setIsNavigationReady(true);
  };

  // Log navigation state changes (for debugging)
  useEffect(() => {
    if (isNavigationReady) {
      const unsubscribe = navigationRef.addListener('state', (e) => {
        // You can log navigation state changes here for debugging
        console.log('Navigation State Changed:', e.data.state);
      });

      return unsubscribe;
    }
  }, [isNavigationReady]);

  // Handle deep linking
  const linking = {
    prefixes: ['subtrack://', 'https://subtrack.app'],
    config: {
      screens: {
        // Auth flow
        Auth: {
          screens: {
            Welcome: 'welcome',
            Login: 'login',
            Register: 'register',
            ForgotPassword: 'forgot-password',
          },
        },
        // Main app
        Main: {
          screens: {
            // Tab navigator
            Dashboard: 'dashboard',
            Subscriptions: {
              path: 'subscriptions',
              screens: {
                SubscriptionList: 'list',
                AddSubscription: 'add',
                EditSubscription: 'edit/:subscriptionId',
                SubscriptionDetails: 'details/:subscriptionId',
              },
            },
            Analytics: {
              path: 'analytics',
              screens: {
                AnalyticsOverview: 'overview',
                MonthlyReport: 'monthly/:month?/:year?',
                YearlyReport: 'yearly/:year?',
              },
            },
            Budget: {
              path: 'budget',
              screens: {
                BudgetOverview: 'overview',
                CreateBudget: 'create',
                EditBudget: 'edit/:budgetId',
              },
            },
            Settings: {
              path: 'settings',
              screens: {
                SettingsMenu: 'menu',
                Profile: 'profile',
                Notifications: 'notifications',
                Security: 'security',
                Backup: 'backup',
              },
            },
          },
        },
        // Direct screens
        Onboarding: 'onboarding',
        PinSetup: 'pin-setup',
        Setup: 'setup',
        Scanner: 'scanner',
        Marketplace: 'marketplace',
        TrialManager: 'trials',
        Splitting: 'splitting',
      },
    },
    getInitialURL: async () => {
      // Handle initial URL (for deep linking)
      return null;
    },
    subscribe: (listener: (url: string) => void) => {
      // Subscribe to URL events
      const subscription = { remove: () => {} };
      return subscription;
    },
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={handleNavigationReady}
      theme={getNavigationTheme(isDark)}
      linking={linking}
      fallback={<></>} // You can add a loading component here
      documentTitle={{
        enabled: true,
        formatter: (options, route) =>
          options?.title ?? `${route?.name} - SubTrack`,
      }}>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={screenOptions}>
        {/* Onboarding Flow */}
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{
            gestureEnabled: false,
            animationTypeForReplace: 'push',
          }}
        />
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="PinSetup" 
          component={PinSetupScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Setup" 
          component={SetupScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* Auth Flow */}
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{
            gestureEnabled: false,
            animationTypeForReplace: user ? 'pop' : 'push',
          }}
        />

        {/* Main App */}
        <Stack.Screen 
          name="Main" 
          component={MainNavigator}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* Modal Screens */}
        <Stack.Group
          screenOptions={{
            presentation: 'modal',
            cardStyle: { backgroundColor: 'transparent' },
            gestureEnabled: true,
            gestureDirection: 'vertical',
            cardOverlayEnabled: true,
          }}>
          {/* You can add modal screens here */}
        </Stack.Group>

        {/* Full Screen Modal */}
        <Stack.Group
          screenOptions={{
            presentation: 'fullScreenModal',
            gestureEnabled: true,
            gestureDirection: 'vertical',
          }}>
          {/* You can add full screen modal screens here */}
        </Stack.Group>

        {/* Transparent Modal */}
        <Stack.Group
          screenOptions={{
            presentation: 'transparentModal',
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}>
          {/* You can add transparent modal screens here */}
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;