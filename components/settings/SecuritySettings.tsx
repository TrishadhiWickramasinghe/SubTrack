import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    Layout,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@context/ThemeContext';
import settingsStorage from '@services/storage/settingsStorage';

export interface SecuritySettingsProps {
  visible: boolean;
  onClose: () => void;
  onChangePassword?: () => void;
  testID?: string;
}

interface SecurityPreferences {
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  appLockEnabled: boolean;
  autoLogoutEnabled: boolean;
  autoLogoutTimeout: number; // in minutes
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  visible,
  onClose,
  onChangePassword,
  testID,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<SecurityPreferences>({
    biometricEnabled: false,
    twoFactorEnabled: false,
    appLockEnabled: false,
    autoLogoutEnabled: true,
    autoLogoutTimeout: 15,
  });

  // Load security preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const settings = await settingsStorage.getSettings();
        if (settings?.security) {
          setPreferences(settings.security);
        }
      } catch (error) {
        console.error('Error loading security preferences:', error);
      }
    };

    if (visible) {
      loadPreferences();
    }
  }, [visible]);

  // Save preference
  const savePreference = useCallback(
    async (key: keyof SecurityPreferences, value: any) => {
      try {
        setLoading(true);
        const updatedPrefs = { ...preferences, [key]: value };
        await settingsStorage.updateSetting(`security.${key}`, value);
        setPreferences(updatedPrefs);
      } catch (error) {
        console.error('Error saving preference:', error);
        Alert.alert('Error', 'Failed to save preference. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [preferences]
  );

  // Handle biometric toggle
  const handleBiometricToggle = useCallback(
    async (value: boolean) => {
      if (value) {
        // In real app, check if device supports biometric authentication
        Alert.alert(
          'Enable Biometric Login',
          'Use fingerprint or face recognition to login faster',
          [
            {
              text: 'Enable',
              onPress: () => savePreference('biometricEnabled', true),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        await savePreference('biometricEnabled', false);
      }
    },
    [savePreference]
  );

  // Handle 2FA toggle
  const handleTwoFactorToggle = useCallback(
    async (value: boolean) => {
      if (value) {
        Alert.alert(
          'Enable Two-Factor Authentication',
          'You will be asked for a verification code when logging in from a new device',
          [
            {
              text: 'Enable',
              onPress: () => savePreference('twoFactorEnabled', true),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert(
          'Disable Two-Factor Authentication',
          'Are you sure? This will make your account less secure.',
          [
            {
              text: 'Disable',
              onPress: () => savePreference('twoFactorEnabled', false),
              style: 'destructive',
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    },
    [savePreference]
  );

  // Handle app lock toggle
  const handleAppLockToggle = useCallback(
    async (value: boolean) => {
      if (value) {
        Alert.alert(
          'Enable App Lock',
          'Protect the app with biometric or PIN authentication',
          [
            {
              text: 'Enable',
              onPress: () => savePreference('appLockEnabled', true),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        await savePreference('appLockEnabled', false);
      }
    },
    [savePreference]
  );

  // Handle auto-logout toggle
  const handleAutoLogoutToggle = useCallback(
    async (value: boolean) => {
      await savePreference('autoLogoutEnabled', value);
    },
    [savePreference]
  );

  // Handle auto-logout timeout change
  const handleAutoLogoutTimeout = useCallback(
    (timeout: number) => {
      savePreference('autoLogoutTimeout', timeout);
    },
    [savePreference]
  );

  // Handle change password
  const handleChangePasswordPress = useCallback(() => {
    onClose();
    if (onChangePassword) {
      onChangePassword();
    } else {
      Alert.alert('Change Password', 'Feature coming soon');
    }
  }, [onClose, onChangePassword]);

  // Handle view activity
  const handleViewActivity = useCallback(() => {
    Alert.alert(
      'Login Activity',
      'Your recent login attempts and active sessions',
      [{ text: 'Close', style: 'cancel' }]
    );
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        },
        content: {
          backgroundColor: colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 24,
          paddingHorizontal: 16,
          paddingBottom: Math.max(insets.bottom, 16),
          maxHeight: '90%',
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        },
        title: {
          fontSize: 20,
          fontWeight: '600',
          color: colors.text,
        },
        closeButton: {
          padding: 8,
        },
        section: {
          marginBottom: 24,
        },
        sectionTitle: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginBottom: 12,
        },
        settingItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 12,
          marginBottom: 8,
          borderRadius: 12,
          backgroundColor: colors.backgroundSecondary,
        },
        settingItemContent: {
          flex: 1,
          marginRight: 12,
        },
        settingIcon: {
          width: 40,
          height: 40,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        },
        settingLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 2,
        },
        settingDescription: {
          fontSize: 12,
          color: colors.textSecondary,
        },
        securityBadge: {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          backgroundColor: `${colors.primary}20`,
          marginTop: 4,
        },
        securityBadgeText: {
          fontSize: 10,
          fontWeight: '600',
          color: colors.primary,
        },
        toggle: {
          opacity: loading ? 0.6 : 1,
        },
        actionButton: {
          paddingVertical: 12,
          paddingHorizontal: 14,
          backgroundColor: `${colors.primary}15`,
          borderRadius: 8,
        },
        actionButtonText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.primary,
        },
        autoLogoutOptions: {
          marginTop: 12,
          marginBottom: 12,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: colors.backgroundSecondary,
        },
        autoLogoutOption: {
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        autoLogoutOptionLast: {
          borderBottomWidth: 0,
        },
        autoLogoutOptionText: {
          fontSize: 13,
          color: colors.text,
        },
        autoLogoutOptionActive: {
          color: colors.primary,
          fontWeight: '600',
        },
        infoBox: {
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginTop: 8,
          borderRadius: 8,
          backgroundColor: `${colors.info}15`,
          flexDirection: 'row',
          alignItems: 'flex-start',
        },
        infoBoxIcon: {
          marginRight: 10,
          marginTop: 2,
        },
        infoBoxText: {
          flex: 1,
          fontSize: 12,
          color: colors.text,
          lineHeight: 16,
        },
        footerButton: {
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 12,
          backgroundColor: colors.primary,
          alignItems: 'center',
          marginTop: 8,
          marginBottom: 8,
        },
        footerButtonText: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.textInverse,
        },
      }),
    [colors, insets]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
    >
      <Animated.View style={styles.container} entering={FadeIn} exiting={FadeOut}>
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
        />

        <Animated.ScrollView
          style={styles.content}
          scrollEnabled
          showsVerticalScrollIndicator={true}
          entering={FadeIn}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Security Settings</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={loading}
            >
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Authentication Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Authentication</Text>

            {/* Change Password */}
            <AnimatedTouchable
              style={styles.settingItem}
              onPress={handleChangePasswordPress}
              activeOpacity={0.7}
              disabled={loading}
            >
              <View
                style={[styles.settingIcon, { backgroundColor: `${colors.primary}20` }]}
              >
                <Icon name="lock-reset" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingLabel}>Change Password</Text>
                <Text style={styles.settingDescription}>Update your password</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </AnimatedTouchable>

            {/* Biometric Login */}
            <View style={styles.settingItem}>
              <View
                style={[styles.settingIcon, { backgroundColor: `${colors.success}20` }]}
              >
                <Icon name="fingerprint" size={20} color={colors.success} />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingLabel}>Biometric Login</Text>
                <Text style={styles.settingDescription}>
                  Use fingerprint or face recognition
                </Text>
              </View>
              <Switch
                style={styles.toggle}
                value={preferences.biometricEnabled}
                onValueChange={handleBiometricToggle}
                disabled={loading}
                trackColor={{ false: colors.border, true: `${colors.success}40` }}
                thumbColor={
                  preferences.biometricEnabled ? colors.success : colors.textSecondary
                }
              />
            </View>

            {/* Two-Factor Authentication */}
            <View style={styles.settingItem}>
              <View
                style={[styles.settingIcon, { backgroundColor: `${colors.warning}20` }]}
              >
                <Icon name="shield-check" size={20} color={colors.warning} />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                <Text style={styles.settingDescription}>
                  Add extra security to your account
                </Text>
              </View>
              <Switch
                style={styles.toggle}
                value={preferences.twoFactorEnabled}
                onValueChange={handleTwoFactorToggle}
                disabled={loading}
                trackColor={{ false: colors.border, true: `${colors.warning}40` }}
                thumbColor={
                  preferences.twoFactorEnabled ? colors.warning : colors.textSecondary
                }
              />
            </View>
          </View>

          {/* App Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Security</Text>

            {/* App Lock */}
            <View style={styles.settingItem}>
              <View
                style={[styles.settingIcon, { backgroundColor: `${colors.primary}20` }]}
              >
                <Icon name="lock" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingLabel}>App Lock</Text>
                <Text style={styles.settingDescription}>
                  Require authentication when opening the app
                </Text>
              </View>
              <Switch
                style={styles.toggle}
                value={preferences.appLockEnabled}
                onValueChange={handleAppLockToggle}
                disabled={loading}
                trackColor={{ false: colors.border, true: `${colors.primary}40` }}
                thumbColor={preferences.appLockEnabled ? colors.primary : colors.textSecondary}
              />
            </View>

            {/* Auto-Logout */}
            <Animated.View layout={Layout.springify()} style={styles.settingItem}>
              <View
                style={[styles.settingIcon, { backgroundColor: `${colors.error}20` }]}
              >
                <Icon name="clock-outline" size={20} color={colors.error} />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingLabel}>Auto-Logout</Text>
                <Text style={styles.settingDescription}>
                  {preferences.autoLogoutEnabled
                    ? `After ${preferences.autoLogoutTimeout} minutes of inactivity`
                    : 'Disabled'}
                </Text>
              </View>
              <Switch
                style={styles.toggle}
                value={preferences.autoLogoutEnabled}
                onValueChange={handleAutoLogoutToggle}
                disabled={loading}
                trackColor={{ false: colors.border, true: `${colors.error}40` }}
                thumbColor={preferences.autoLogoutEnabled ? colors.error : colors.textSecondary}
              />
            </Animated.View>

            {/* Auto-Logout Options */}
            {preferences.autoLogoutEnabled && (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={styles.autoLogoutOptions}
              >
                {[5, 10, 15, 30, 60].map((timeout, index) => (
                  <TouchableOpacity
                    key={timeout}
                    style={[
                      styles.autoLogoutOption,
                      index === 4 && styles.autoLogoutOptionLast,
                    ]}
                    onPress={() => handleAutoLogoutTimeout(timeout)}
                  >
                    <Text
                      style={[
                        styles.autoLogoutOptionText,
                        preferences.autoLogoutTimeout === timeout &&
                          styles.autoLogoutOptionActive,
                      ]}
                    >
                      {timeout} minutes
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </View>

          {/* Activity Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity</Text>

            {/* View Activity */}
            <AnimatedTouchable
              style={styles.settingItem}
              onPress={handleViewActivity}
              activeOpacity={0.7}
              disabled={loading}
            >
              <View
                style={[styles.settingIcon, { backgroundColor: `${colors.info}20` }]}
              >
                <Icon name="history" size={20} color={colors.info} />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingLabel}>Login Activity</Text>
                <Text style={styles.settingDescription}>View active sessions</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </AnimatedTouchable>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Icon
                name="information"
                size={16}
                color={colors.info}
                style={styles.infoBoxIcon}
              />
              <Text style={styles.infoBoxText}>
                Your security settings help protect your account and personal data. Keep your
                password strong and enable additional security options.
              </Text>
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.footerButton, loading && { opacity: 0.6 }]}
            onPress={onClose}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} size="small" />
            ) : (
              <Text style={styles.footerButtonText}>Done</Text>
            )}
          </TouchableOpacity>
        </Animated.ScrollView>
      </Animated.View>
    </Modal>
  );
};

export default SecuritySettings;
