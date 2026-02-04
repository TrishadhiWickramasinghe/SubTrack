import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Divider from '../../components/common/Divider';
import { useTheme } from '../../context/ThemeContext';
import { useSubscriptions } from '../../hooks/useSubscriptions';

interface SettingItemType {
  title: string;
  icon: string;
  type: 'navigate' | 'switch' | 'action' | 'info';
  onPress?: () => void;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  rightText?: string;
}

interface SettingSection {
  title: string;
  icon: string;
  items: SettingItemType[];
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { theme, colors } = useTheme();
  const { subscriptions } = useSubscriptions();

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [appVersion] = useState('1.0.0');

  const navigateTo = (route: string) => {
    (navigation as any).navigate(route);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => {} },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This will permanently delete all your data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {} },
    ]);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@subtrack.com');
  };

  const handleRateApp = () => {
    const url = Platform.select({
      ios: 'https://apps.apple.com/app/subtrack',
      android: 'market://details?id=com.subtrack.app',
    });
    if (url) Linking.openURL(url);
  };

  const totalSubscriptions = subscriptions.length;
  const totalMonthlySpending = subscriptions
    .filter((sub: any) => sub.status === 'active')
    .reduce((total: number, sub: any) => total + sub.amount, 0);

  const sections: SettingSection[] = [
    {
      title: 'Account',
      icon: 'person-outline',
      items: [
        { title: 'Profile', icon: 'person', type: 'navigate', onPress: () => navigateTo('Profile') },
        { title: 'Edit Profile', icon: 'create-outline', type: 'navigate', onPress: () => navigateTo('EditProfile') },
        { title: 'Preferences', icon: 'settings-outline', type: 'navigate', onPress: () => navigateTo('Preferences') },
      ],
    },
    {
      title: 'Appearance',
      icon: 'color-palette-outline',
      items: [
        { title: 'Theme', icon: 'moon-outline', type: 'navigate', onPress: () => navigateTo('ThemeSettings'), rightText: theme === 'dark' ? 'Dark' : 'Light' },
        { title: 'Currency', icon: 'cash-outline', type: 'navigate', onPress: () => navigateTo('CurrencySettings'), rightText: 'USD' },
      ],
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline',
      items: [
        { title: 'Notification Settings', icon: 'notifications', type: 'navigate', onPress: () => navigateTo('NotificationSettings') },
      ],
    },
    {
      title: 'Security',
      icon: 'shield-checkmark-outline',
      items: [
        { title: 'Security Settings', icon: 'lock-closed', type: 'navigate', onPress: () => navigateTo('Security') },
        { title: 'Biometric Login', icon: 'finger-print', type: 'switch', value: biometricEnabled, onValueChange: setBiometricEnabled },
      ],
    },
    {
      title: 'Data',
      icon: 'cloud-outline',
      items: [
        { title: 'Backup & Sync', icon: 'cloud-upload-outline', type: 'navigate', onPress: () => navigateTo('Backup') },
      ],
    },
    {
      title: 'Support',
      icon: 'help-circle-outline',
      items: [
        { title: 'Contact Us', icon: 'chatbubble-ellipses-outline', type: 'action', onPress: handleContactSupport },
        { title: 'Rate the App', icon: 'star-outline', type: 'action', onPress: handleRateApp },
        { title: 'About', icon: 'information', type: 'navigate', onPress: () => navigateTo('About') },
      ],
    },
  ];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    userDetails: { flex: 1 },
    userName: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
    userEmail: { fontSize: 12, marginBottom: 6 },
    userStats: { flexDirection: 'row', gap: 8 },
    statBadge: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.background, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 3 },
    statText: { fontSize: 11, fontWeight: '600' },
    quickActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
    quickAction: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: colors.card },
    quickActionIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    quickActionText: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
    quickActionValue: { fontSize: 10 },
    sectionsContainer: { paddingHorizontal: 16, paddingVertical: 8 },
    sectionCard: { marginBottom: 12 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold' },
    settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
    settingIcon: { width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    settingContent: { flex: 1 },
    settingTitle: { fontSize: 13, fontWeight: '600' },
    settingValue: { fontSize: 11, marginRight: 8 },
    dangerZone: { marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FEE2E2', padding: 12 },
    dangerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    dangerTitle: { fontSize: 14, fontWeight: 'bold', color: '#EF4444' },
    dangerDescription: { fontSize: 11, marginBottom: 12 },
    dangerActions: { gap: 8 },
    appInfo: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
    appName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    appVersion: { fontSize: 11, marginBottom: 4 },
    appCopyright: { fontSize: 9 },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>U</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>User Profile</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>user@example.com</Text>
              <View style={styles.userStats}>
                <View style={styles.statBadge}>
                  <Ionicons name="list" size={10} color={colors.primary} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>{totalSubscriptions}</Text>
                </View>
                <View style={styles.statBadge}>
                  <Ionicons name="cash" size={10} color={colors.primary} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>{totalMonthlySpending.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigateTo('CurrencySettings')}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="cash-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Currency</Text>
            <Text style={[styles.quickActionValue, { color: colors.textSecondary }]}>USD</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={() => navigateTo('ThemeSettings')}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="moon-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Theme</Text>
            <Text style={[styles.quickActionValue, { color: colors.textSecondary }]}>{theme === 'dark' ? 'Dark' : 'Light'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={() => navigateTo('Backup')}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="cloud-download-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Backup</Text>
            <Text style={[styles.quickActionValue, { color: colors.textSecondary }]}>Auto</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        <View style={styles.sectionsContainer}>
          {sections.map((section, sectionIndex) => (
            <Card key={sectionIndex} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name={section.icon as any} size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              </View>
              <Divider />
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[styles.settingItem, { borderBottomColor: colors.border, borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0 }]}
                  onPress={item.onPress}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name={item.icon as any} size={16} color={colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
                  </View>
                  {item.rightText && (
                    <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{item.rightText}</Text>
                  )}
                  {item.type === 'switch' ? (
                    <View style={{ width: 48, height: 24, borderRadius: 12, backgroundColor: item.value ? colors.primary : colors.border }} />
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </Card>
          ))}
        </View>

        {/* Danger Zone */}
        <Card style={styles.dangerZone}>
          <View style={styles.dangerHeader}>
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text style={styles.dangerTitle}>Danger Zone</Text>
          </View>
          <Text style={[styles.dangerDescription, { color: colors.textSecondary }]}>These actions are irreversible.</Text>
          <View style={styles.dangerActions}>
            <Button title="Logout" onPress={handleLogout} />
            <Button title="Delete Account" onPress={handleDeleteAccount} />
          </View>
        </Card>

        {/* Footer */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: colors.textSecondary }]}>SubTrack</Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>Version {appVersion}</Text>
          <Text style={[styles.appCopyright, { color: colors.textSecondary }]}>© 2024 SubTrack</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
