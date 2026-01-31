import { colors, spacing } from '@/config/theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@hooks/useTheme';
import { HeaderBackButton } from '@react-navigation/elements';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

// Import auth screens
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import LoginScreen from '@screens/auth/LoginScreen';
import OnboardingScreen from '@screens/auth/OnboardingScreen';
import PinSetupScreen from '@screens/auth/PinSetupScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import ResetPasswordScreen from '@screens/auth/ResetPasswordScreen';
import SetupScreen from '@screens/auth/SetupScreen';
import WelcomeScreen from '@screens/auth/WelcomeScreen';

// Import components
import { Text } from '@components/common/Text';

const Stack = createStackNavigator();

const AuthNavigator: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  // Common header back button
  const headerBackButton = (tintColor: string) => (
    <HeaderBackButton
      tintColor={tintColor}
      labelVisible={false}
      pressColor="transparent"
    />
  );

  // Theme toggle button for header
  const ThemeToggleButton = () => (
    <TouchableOpacity
      onPress={toggleTheme}
      style={styles.themeButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Icon
        name={isDark ? 'weather-sunny' : 'weather-night'}
        size={24}
        color={isDark ? colors.textDark : colors.text}
      />
    </TouchableOpacity>
  );

  // Common screen options
  const commonScreenOptions = {
    headerStyle: {
      backgroundColor: isDark ? colors.surfaceDark : colors.surface,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.borderDark : colors.border,
    },
    headerTintColor: isDark ? colors.textDark : colors.text,
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? colors.textDark : colors.text,
    },
    headerBackTitleVisible: false,
    cardStyle: {
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    gestureEnabled: true,
  };

  // Welcome screen header
  const welcomeHeader = () => (
    <View style={styles.welcomeHeader}>
      <Text style={[styles.welcomeTitle, { color: colors.primary }]}>
        SubTrack
      </Text>
      <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
        Manage your subscriptions
      </Text>
    </View>
  );

  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={commonScreenOptions}>
      {/* Welcome Screen */}
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          headerTitle: welcomeHeader,
          headerTitleAlign: 'center',
          headerRight: ThemeToggleButton,
          headerLeft: () => null, // Remove back button on welcome screen
        }}
      />

      {/* Onboarding Screen */}
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      {/* Setup Screen */}
      <Stack.Screen
        name="Setup"
        component={SetupScreen}
        options={{
          title: 'Setup Your Profile',
          headerLeft: ({ tintColor }) => headerBackButton(tintColor!),
          headerRight: ThemeToggleButton,
        }}
      />

      {/* Pin Setup Screen */}
      <Stack.Screen
        name="PinSetup"
        component={PinSetupScreen}
        options={{
          title: 'Set Up PIN',
          headerLeft: ({ tintColor }) => headerBackButton(tintColor!),
          headerRight: ThemeToggleButton,
          gestureEnabled: false,
        }}
      />

      {/* Login Screen */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Sign In',
          headerLeft: ({ tintColor }) => headerBackButton(tintColor!),
          headerRight: ThemeToggleButton,
        }}
      />

      {/* Register Screen */}
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Create Account',
          headerLeft: ({ tintColor }) => headerBackButton(tintColor!),
          headerRight: ThemeToggleButton,
        }}
      />

      {/* Forgot Password Screen */}
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Forgot Password',
          headerLeft: ({ tintColor }) => headerBackButton(tintColor!),
          headerRight: ThemeToggleButton,
        }}
      />

      {/* Reset Password Screen */}
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          title: 'Reset Password',
          headerLeft: ({ tintColor }) => headerBackButton(tintColor!),
          headerRight: ThemeToggleButton,
        }}
      />

      {/* Modal Screens for Auth */}
      <Stack.Group
        screenOptions={{
          presentation: 'modal',
          headerStyle: {
            backgroundColor: isDark ? colors.surfaceDark : colors.surface,
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          cardStyle: {
            backgroundColor: isDark ? colors.surfaceDark : colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          },
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}>
        {/* Terms Modal */}
        <Stack.Screen
          name="TermsModal"
          component={require('@screens/auth/TermsModal').default}
          options={{
            title: 'Terms & Conditions',
            headerLeft: ({ tintColor }) => headerBackButton(tintColor!),
          }}
        />

        {/* Privacy Modal */}
        <Stack.Screen
          name="PrivacyModal"
          component={require('@screens/auth/PrivacyModal').default}
          options={{
            title: 'Privacy Policy',
            headerLeft: ({ tintColor }) => headerBackButton(tintColor!),
          }}
        />

        {/* Help Modal */}
        <Stack.Screen
          name="HelpModal"
          component={require('@screens/auth/HelpModal').default}
          options={{
            title: 'Need Help?',
            headerLeft: ({ tintColor }) => headerBackButton(tintColor!),
          }}
        />
      </Stack.Group>

      {/* Transparent Modals */}
      <Stack.Group
        screenOptions={{
          presentation: 'transparentModal',
          headerShown: false,
          cardStyle: {
            backgroundColor: 'transparent',
          },
          cardOverlayEnabled: true,
        }}>
        {/* Loading Modal */}
        <Stack.Screen
          name="AuthLoadingModal"
          component={require('@screens/auth/AuthLoadingModal').default}
        />

        {/* Success Modal */}
        <Stack.Screen
          name="AuthSuccessModal"
          component={require('@screens/auth/AuthSuccessModal').default}
        />

        {/* Error Modal */}
        <Stack.Screen
          name="AuthErrorModal"
          component={require('@screens/auth/AuthErrorModal').default}
        />

        {/* Biometric Modal */}
        <Stack.Screen
          name="BiometricModal"
          component={require('@screens/auth/BiometricModal').default}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  themeButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  welcomeHeader: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default AuthNavigator;