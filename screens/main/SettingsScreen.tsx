import Card from '@components/common/Card';
import Divider from '@components/common/Divider';
import { useTheme } from '@context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@hooks/useAuth';
import { useSubscriptions } from '@hooks/useSubscriptions';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

// Types
interface SettingItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  type: 'navigate' | 'toggle' | 'action' | 'info';
  value?: boolean | string;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  color?: string;
  badge?: string;
}

interface SettingSection {
  id: string;
  title: string;
  icon: string;
  items: SettingItem[];
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const SettingsScreen: React.FC = () => {
  const { theme, colors, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { subscriptions } = useSubscriptions();

  // State
  const [loading, setLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('English');

  // Calculate stats
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'active').length;
  const totalMonthlySpending = subscriptions
    .filter((s: any) => s.status === 'active')
    .reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

  // Navigation handlers
  const handleNavigateTo = useCallback((screen: string) => {
    // TODO: Implement navigation
    Alert.alert('Navigate', `Going to ${screen}`);
  }, []);

  // Account handlers
  const handleEditProfile = useCallback(() => {
    Alert.alert('Edit Profile', 'Feature coming soon');
  }, []);

  const handleChangePassword = useCallback(() => {
    Alert.alert('Change Password', 'Feature coming soon');
  }, []);

  // Theme handlers
  const handleThemeChange = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleCurrencyChange = useCallback(() => {
    Alert.alert(
      'Select Currency',
      'Choose your preferred currency',
      [
        { text: 'USD - US Dollar', onPress: () => setCurrency('USD') },
        { text: 'EUR - Euro', onPress: () => setCurrency('EUR') },
        { text: 'GBP - British Pound', onPress: () => setCurrency('GBP') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const handleLanguageChange = useCallback(() => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      [
        { text: 'English', onPress: () => setLanguage('English') },
        { text: 'Spanish', onPress: () => setLanguage('Spanish') },
        { text: 'French', onPress: () => setLanguage('French') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  // Security handlers
  const handleBiometricToggle = useCallback((value: boolean) => {
    setBiometricEnabled(value);
  }, []);

  const handlePrivacyPolicy = useCallback(() => {
    Linking.openURL('https://subtrack.com/privacy');
  }, []);

  const handleTermsOfService = useCallback(() => {
    Linking.openURL('https://subtrack.com/terms');
  }, []);

  // Support handlers
  const handleContactSupport = useCallback(() => {
    Linking.openURL('mailto:support@subtrack.com');
  }, []);

  const handleRateApp = useCallback(() => {
    const url = Platform.select({
      ios: 'https://apps.apple.com/app/subtrack',
      android: 'https://play.google.com/store/apps/details?id=com.subtrack',
    });
    if (url) Linking.openURL(url);
  }, []);

  const handleShareApp = useCallback(() => {
    Linking.openURL('https://subtrack.com/share');
  }, []);

  // Backup handlers
  const handleBackupNow = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Implement backup logic
      Alert.alert('Success', 'Data backup completed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to backup data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRestoreBackup = useCallback(() => {
    Alert.alert('Restore Backup', 'Select backup to restore', [
      { text: 'Latest Backup', onPress: () => Alert.alert('Restored', 'Backup restored successfully') },
      { text: 'Choose Date', onPress: () => {} },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  // Account handlers
  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await signOut();
            // Navigation will be handled by auth state change
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
            setLoading(false);
          }
        },
      },
    ]);
  }, [signOut]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirm Deletion',
              'Type "DELETE" to confirm',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async (text: any) => {
                    if (text === 'DELETE') {
                      setLoading(true);
                      try {
                        // TODO: Implement account deletion
                        Alert.alert('Account Deleted', 'Your account has been deleted');
                        await signOut();
                      } catch (error) {
                        Alert.alert('Error', 'Failed to delete account');
                        setLoading(false);
                      }
                    } else {
                      Alert.alert('Cancelled', 'Account deletion cancelled');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [signOut]);

  // Build settings sections
  const settingsSections: SettingSection[] = [
    {
      id: 'account',
      title: 'Account',
      icon: 'person-outline',
      items: [
        {
          id: 'profile',
          title: 'Profile',
          description: user?.email || 'user@example.com',
          icon: 'person',
          type: 'info',
          color: colors.primary,
        },
        {
          id: 'edit-profile',
          title: 'Edit Profile',
          description: 'Update your name and photo',
          icon: 'create-outline',
          type: 'action',
          onPress: handleEditProfile,
        },
        {
          id: 'change-password',
          title: 'Change Password',
          description: 'Update your password',
          icon: 'lock-closed-outline',
          type: 'action',
          onPress: handleChangePassword,
        },
      ],
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: 'color-palette-outline',
      items: [
        {
          id: 'theme',
          title: 'Theme',
          description: theme === 'dark' ? 'Dark Mode' : 'Light Mode',
          icon: theme === 'dark' ? 'moon' : 'sunny',
          type: 'toggle',
          value: theme === 'dark',
          onValueChange: handleThemeChange,
        },
        {
          id: 'currency',
          title: 'Currency',
          description: currency,
          icon: 'cash-outline',
          type: 'action',
          onPress: handleCurrencyChange,
          badge: currency,
        },
        {
          id: 'language',
          title: 'Language',
          description: language,
          icon: 'globe-outline',
          type: 'action',
          onPress: handleLanguageChange,
          badge: language,
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      items: [
        {
          id: 'notifications-enabled',
          title: 'Enable Notifications',
          description: 'Receive important updates',
          icon: 'notifications',
          type: 'toggle',
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        },
        {
          id: 'notification-settings',
          title: 'Notification Settings',
          description: 'Customize notification preferences',
          icon: 'settings-outline',
          type: 'action',
          onPress: () => handleNavigateTo('NotificationSettings'),
        },
      ],
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: 'shield-checkmark-outline',
      items: [
        {
          id: 'biometric',
          title: 'Biometric Login',
          description: 'Use fingerprint or face recognition',
          icon: 'finger-print',
          type: 'toggle',
          value: biometricEnabled,
          onValueChange: handleBiometricToggle,
        },
        {
          id: 'privacy-policy',
          title: 'Privacy Policy',
          icon: 'document-text-outline',
          type: 'action',
          onPress: handlePrivacyPolicy,
        },
        {
          id: 'terms-of-service',
          title: 'Terms of Service',
          icon: 'document-outline',
          type: 'action',
          onPress: handleTermsOfService,
        },
      ],
    },
    {
      id: 'data',
      title: 'Data & Backup',
      icon: 'cloud-outline',
      items: [
        {
          id: 'auto-backup',
          title: 'Auto Backup',
          description: 'Backup your data automatically',
          icon: 'cloud-upload-outline',
          type: 'toggle',
          value: autoBackupEnabled,
          onValueChange: setAutoBackupEnabled,
        },
        {
          id: 'backup-now',
          title: 'Backup Now',
          description: 'Create a manual backup',
          icon: 'cloud-done-outline',
          type: 'action',
          onPress: handleBackupNow,
        },
        {
          id: 'restore-backup',
          title: 'Restore Backup',
          description: 'Restore from previous backup',
          icon: 'cloud-download-outline',
          type: 'action',
          onPress: handleRestoreBackup,
        },
      ],
    },
    {
      id: 'support',
      title: 'Support & Help',
      icon: 'help-circle-outline',
      items: [
        {
          id: 'contact-support',
          title: 'Contact Support',
          description: 'Email us for help',
          icon: 'chatbubble-ellipses-outline',
          type: 'action',
          onPress: handleContactSupport,
        },
        {
          id: 'rate-app',
          title: 'Rate the App',
          description: 'Share your feedback',
          icon: 'star-outline',
          type: 'action',
          onPress: handleRateApp,
        },
        {
          id: 'share-app',
          title: 'Share App',
          description: 'Tell your friends',
          icon: 'share-social-outline',
          type: 'action',
          onPress: handleShareApp,
        },
        {
          id: 'about',
          title: 'About',
          description: 'v1.0.0 © 2026 SubTrack',
          icon: 'information-circle-outline',
          type: 'info',
        },
      ],
    },
  ];

  // Render setting item
  const renderSettingItem = (item: SettingItem, isLast: boolean) => (
    <AnimatedTouchable
      key={item.id}
      entering={FadeIn.delay(100)}
      onPress={item.onPress}
      disabled={item.type === 'info' || item.type === 'toggle'}
      style={[
        styles.settingItem,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: isLast ? 0 : 1,
        },
      ]}>
      <View
        style={[
          styles.settingIconContainer,
          {
            backgroundColor: (item.color || colors.primary) + '15',
          },
        ]}>
        <Ionicons
          name={item.icon as any}
          size={20}
          color={item.color || colors.primary}
        />
      </View>

      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        )}
      </View>

      {item.badge && (
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.primary + '20' },
          ]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {item.badge}
          </Text>
        </View>
      )}

      {item.type === 'toggle' && item.onValueChange && (
        <Switch
          value={item.value as boolean}
          onValueChange={item.onValueChange}
          trackColor={{ false: colors.border, true: colors.primary + '40' }}
          thumbColor={item.value ? colors.primary : colors.textSecondary}
        />
      )}

      {item.type === 'action' && (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      )}
    </AnimatedTouchable>
  );

  // Render section
  const renderSection = (section: SettingSection, index: number) => (
    <Animated.View
      key={section.id}
      entering={SlideInRight.delay(index * 50)}>
      <Card style={[styles.sectionCard, { marginTop: index === 0 ? 12 : 8 }] as any}>
        <View style={styles.sectionHeader}>
          <View
            style={[
              styles.sectionIconContainer,
              { backgroundColor: colors.primary + '15' },
            ]}>
            <Ionicons
              name={section.icon as any}
              size={20}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {section.title}
          </Text>
        </View>
        <Divider />
        <View>
          {section.items.map((item, itemIndex) =>
            renderSettingItem(item, itemIndex === section.items.length - 1)
          )}
        </View>
      </Card>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && (
        <ActivityIndicator
          style={styles.loadingOverlay}
          size="large"
          color={colors.primary}
        />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Card style={[styles.headerCard, { backgroundColor: colors.card }] as any}>
          <View style={styles.headerContent}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: colors.primary + '20' },
              ]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.email || 'User Profile'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                Subscriber account
              </Text>
            </View>
          </View>

          <Divider style={{ marginVertical: 12 }} />

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {totalSubscriptions}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {activeSubscriptions}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Active
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                ${totalMonthlySpending.toFixed(0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Monthly
              </Text>
            </View>
          </View>
        </Card>

        {/* Settings Sections */}
        {settingsSections.map((section, index) => renderSection(section, index))}

        {/* Danger Zone */}
        <Card
          style={[
            styles.dangerCard,
            { borderColor: '#FCA5A5', borderWidth: 1 } as any,
          ] as any}>
          <View
            style={[
              styles.dangerHeader,
              { backgroundColor: '#FEE2E2' },
            ]}>
            <Ionicons name="warning" size={24} color="#DC2626" />
            <Text style={styles.dangerTitle}>Danger Zone</Text>
          </View>

          <Text style={[styles.dangerDescription, { color: colors.textSecondary }]}>
            These actions cannot be undone. Proceed with caution.
          </Text>

          <View style={styles.dangerActions}>
            <TouchableOpacity
              style={[
                styles.dangerButton,
                { borderColor: '#FBBF24' },
              ]}
              onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#D97706" />
              <Text style={[styles.dangerButtonText, { color: '#D97706' }]}>
                Logout
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dangerButton,
                { borderColor: '#FCA5A5' },
              ]}
              onPress={handleDeleteAccount}>
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
              <Text style={[styles.dangerButtonText, { color: '#DC2626' }]}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            SubTrack © 2026
          </Text>
          <Text style={[styles.footerVersion, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerCard: {
    marginHorizontal: 4,
    marginTop: 12,
    marginBottom: 16,
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  sectionCard: {
    marginHorizontal: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 11,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  dangerCard: {
    marginHorizontal: 4,
    marginTop: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  dangerDescription: {
    fontSize: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  dangerActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 2,
  },
  footerVersion: {
    fontSize: 11,
  },
});

export default SettingsScreen;
