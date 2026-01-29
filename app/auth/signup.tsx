/**
 * Sign Up Screen
 * Allows users to create a new account with email and password
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to the Terms of Service');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // TODO: Integrate with actual auth service
      // const response = await authService.signUp(email, password, fullName);
      // For now, simulate signup
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert('Success', 'Account created! Please verify your email.');
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Sign Up Failed', 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.backButton, { color: theme.tint }]}>← Back</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>
              Join SubTrack and start tracking
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: theme.tabIconDefault,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="John Doe"
                  placeholderTextColor={theme.tabIconDefault}
                  editable={!loading}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: theme.tabIconDefault,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.tabIconDefault}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: theme.tabIconDefault,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.tabIconDefault}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Text style={{ fontSize: 20 }}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.passwordHint, { color: theme.tabIconDefault }]}>
                At least 8 characters
              </Text>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: theme.tabIconDefault,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.tabIconDefault}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <Text style={{ fontSize: 20 }}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms Agreement */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  {
                    borderColor: theme.tint,
                    backgroundColor: agreedToTerms
                      ? theme.tint
                      : 'transparent',
                  },
                ]}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                disabled={loading}
              >
                {agreedToTerms && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
              <View style={styles.termsText}>
                <Text style={[styles.agreeText, { color: theme.tabIconDefault }]}>
                  I agree to the{' '}
                  <Text style={[styles.termsLink, { color: theme.tint }]}>
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text style={[styles.termsLink, { color: theme.tint }]}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, { backgroundColor: theme.tint }]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: theme.tabIconDefault }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={[styles.loginLink, { color: theme.tint }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  formSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  passwordHint: {
    fontSize: 12,
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  termsText: {
    flex: 1,
  },
  agreeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  signUpButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    fontWeight: '400',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
