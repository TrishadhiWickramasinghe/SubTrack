/**
 * Welcome Screen - First screen shown to unauthenticated users
 * Displays sign up and login buttons
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo/Branding Section */}
        <View style={styles.brandingSection}>
          <View style={styles.logoContainer}>
            <Text style={[styles.appName, { color: theme.tint }]}>SubTrack</Text>
            <Text style={[styles.tagline, { color: theme.text }]}>
              Track Your Subscriptions Effortlessly
            </Text>
          </View>

          {/* Hero Image Placeholder */}
          <View
            style={[styles.heroPlaceholder, { backgroundColor: theme.tint + '15' }]}
          >
            <Text style={styles.heroEmoji}>📱</Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={[styles.featuresTitle, { color: theme.text }]}>
            Why Choose SubTrack?
          </Text>

          <FeatureItem
            icon="📊"
            title="Track All Subscriptions"
            description="Keep track of all your subscriptions in one place"
            textColor={theme.text}
          />
          <FeatureItem
            icon="💰"
            title="Control Your Spending"
            description="Understand your monthly subscription costs"
            textColor={theme.text}
          />
          <FeatureItem
            icon="⏰"
            title="Never Miss Payments"
            description="Get notified before billing dates"
            textColor={theme.text}
          />
          <FeatureItem
            icon="📈"
            title="Analytics & Insights"
            description="See detailed analytics about your spending"
            textColor={theme.text}
          />
        </View>
      </ScrollView>

      {/* Action Buttons Section */}
      <View style={[styles.buttonSection, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
          onPress={() => router.push('/auth/signup')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: theme.tint }]}
          onPress={() => router.push('/auth/login')}
          activeOpacity={0.7}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.tint }]}>
            Sign In
          </Text>
        </TouchableOpacity>

        <Text style={[styles.termsText, { color: theme.tabIconDefault }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  textColor: string;
}

function FeatureItem({ icon, title, description, textColor }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: textColor + '99' }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  heroPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroEmoji: {
    fontSize: 80,
  },
  featuresSection: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 12,
    minWidth: 36,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 20,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
