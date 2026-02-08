/**
 * DEPRECATED: This form component is no longer used.
 * Form implementations have been moved to individual screens:
 * - Profile editing is now handled by unified ProfileScreen components
 * 
 * These use native React Native components and hooks instead of react-hook-form.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface ProfileFormData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  currency: string;
  language: string;
  country: string;
  timezone: string;
  dateFormat: string;
  currencyFormat: string;
  notifications: {
    paymentReminders: boolean;
    weeklySummary: boolean;
    spendingAlerts: boolean;
    priceChanges: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  security: {
    biometricAuth: boolean;
    pinAuth: boolean;
    autoLock: number;
    privacyMode: boolean;
  };
  backup: {
    autoBackup: boolean;
    cloudSync: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    lastBackup?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    accentColor: string;
    compactView: boolean;
    showAmounts: boolean;
    defaultView: 'dashboard' | 'subscriptions' | 'analytics';
  };
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export const ProfileForm: React.FC<any> = () => (
  <View style={styles.container}>
    <Text>This component is deprecated. Use dedicated profile management screens instead.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default ProfileForm;
