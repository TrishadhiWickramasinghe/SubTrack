import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
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

export interface BackupSettingsProps {
  visible: boolean;
  onClose: () => void;
  onBackupNow?: () => Promise<void>;
  onRestore?: () => Promise<void>;
  testID?: string;
}

interface BackupPreferences {
  autoBackupEnabled: boolean;
  autoBackupFrequency: 'daily' | 'weekly' | 'monthly';
  cloudBackupEnabled: boolean;
  cloudService?: 'google' | 'icloud' | 'dropbox';
  lastBackupDate?: string;
  backupSize?: number;
}

interface BackupFile {
  id: string;
  date: string;
  size: number;
  type: 'local' | 'cloud';
  label: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const BackupSettings: React.FC<BackupSettingsProps> = ({
  visible,
  onClose,
  onBackupNow,
  onRestore,
  testID,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [preferences, setPreferences] = useState<BackupPreferences>({
    autoBackupEnabled: true,
    autoBackupFrequency: 'weekly',
    cloudBackupEnabled: false,
  });

  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([
    {
      id: '1',
      date: new Date(Date.now() - 86400000).toLocaleDateString(),
      size: 2.5,
      type: 'local',
      label: 'Local Backup - Yesterday',
    },
    {
      id: '2',
      date: new Date(Date.now() - 604800000).toLocaleDateString(),
      size: 2.4,
      type: 'local',
      label: 'Local Backup - 1 week ago',
    },
    {
      id: '3',
      date: new Date(Date.now() - 2592000000).toLocaleDateString(),
      size: 2.2,
      type: 'cloud',
      label: 'Cloud Backup - 1 month ago',
    },
  ]);

  // Load backup preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const settings = await settingsStorage.getSettings();
        if (settings?.backup) {
          setPreferences(settings.backup);
        }
      } catch (error) {
        console.error('Error loading backup preferences:', error);
      }
    };

    if (visible) {
      loadPreferences();
    }
  }, [visible]);

  // Save preference
  const savePreference = useCallback(
    async (key: keyof BackupPreferences, value: any) => {
      try {
        setLoading(true);
        const updatedPrefs = { ...preferences, [key]: value };
        await settingsStorage.updateSetting(`backup.${key}`, value);
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

  // Format file size
  const formatFileSize = (mb: number): string => {
    if (mb < 1) {
      return `${(mb * 1024).toFixed(0)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Handle backup now
  const handleBackupNow = useCallback(async () => {
    setBackingUp(true);
    try {
      if (onBackupNow) {
        await onBackupNow();
      }

      // Update last backup date
      const now = new Date().toISOString();
      await savePreference('lastBackupDate', now);

      // Add to backup history
      const newBackup: BackupFile = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        size: 2.5,
        type: 'local',
        label: 'Local Backup - Today',
      };
      setBackupFiles([newBackup, ...backupFiles.slice(0, 4)]);

      Alert.alert('Success', 'Data backup completed successfully', [
        { text: 'OK', onPress: () => {} },
      ]);
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert('Error', 'Failed to backup data. Please try again.');
    } finally {
      setBackingUp(false);
    }
  }, [onBackupNow, backupFiles, savePreference]);

  // Handle restore backup
  const handleRestoreBackup = useCallback(async () => {
    Alert.alert(
      'Restore Backup',
      'Choose a backup to restore. This will overwrite current data.',
      [
        {
          text: 'Latest Backup',
          onPress: async () => {
            setRestoring(true);
            try {
              if (onRestore) {
                await onRestore();
              }
              Alert.alert('Success', 'Backup restored successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to restore backup');
            } finally {
              setRestoring(false);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [onRestore]);

  // Handle restore from history
  const handleRestoreFromHistory = useCallback(
    async (backup: BackupFile) => {
      Alert.alert(
        'Restore Backup',
        `Restore backup from ${backup.date}? This will overwrite current data.`,
        [
          {
            text: 'Restore',
            onPress: async () => {
              setRestoring(true);
              try {
                if (onRestore) {
                  await onRestore();
                }
                Alert.alert('Success', 'Backup restored successfully');
              } catch (error) {
                Alert.alert('Error', 'Failed to restore backup');
              } finally {
                setRestoring(false);
              }
            },
            style: 'destructive',
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    },
    [onRestore]
  );

  // Handle auto-backup toggle
  const handleAutoBackupToggle = useCallback(
    async (value: boolean) => {
      await savePreference('autoBackupEnabled', value);
    },
    [savePreference]
  );

  // Handle cloud backup toggle
  const handleCloudBackupToggle = useCallback(
    async (value: boolean) => {
      if (value) {
        Alert.alert(
          'Enable Cloud Backup',
          'Your data will be automatically backed up to the cloud. Choose a service:',
          [
            {
              text: 'Google Drive',
              onPress: async () => {
                await savePreference('cloudService', 'google');
                await savePreference('cloudBackupEnabled', true);
              },
            },
            {
              text: 'iCloud',
              onPress: async () => {
                await savePreference('cloudService', 'icloud');
                await savePreference('cloudBackupEnabled', true);
              },
            },
            {
              text: 'Dropbox',
              onPress: async () => {
                await savePreference('cloudService', 'dropbox');
                await savePreference('cloudBackupEnabled', true);
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        await savePreference('cloudBackupEnabled', false);
        await savePreference('cloudService', undefined);
      }
    },
    [savePreference]
  );

  // Handle backup frequency change
  const handleFrequencyChange = useCallback(
    (frequency: BackupPreferences['autoBackupFrequency']) => {
      savePreference('autoBackupFrequency', frequency);
    },
    [savePreference]
  );

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
          maxHeight: '92%',
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
        statusBadge: {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          marginTop: 4,
        },
        statusBadgeText: {
          fontSize: 10,
          fontWeight: '600',
        },
        frequencyOptions: {
          marginTop: 12,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: colors.backgroundSecondary,
        },
        frequencyOption: {
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        frequencyOptionLast: {
          borderBottomWidth: 0,
        },
        frequencyOptionText: {
          fontSize: 13,
          color: colors.text,
        },
        frequencyOptionActive: {
          color: colors.primary,
          fontWeight: '600',
        },
        actionButton: {
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 8,
          backgroundColor: `${colors.primary}15`,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
        actionButtonText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.primary,
          marginLeft: 6,
        },
        backupHistoryContainer: {
          maxHeight: 300,
        },
        backupHistoryItem: {
          paddingVertical: 12,
          paddingHorizontal: 12,
          marginBottom: 8,
          borderRadius: 12,
          backgroundColor: colors.backgroundSecondary,
        },
        backupHistoryItemHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        },
        backupHistoryLabel: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.text,
          flex: 1,
        },
        backupHistoryType: {
          fontSize: 10,
          color: colors.textSecondary,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
          backgroundColor: `${colors.primary}15`,
        },
        backupHistoryTypeText: {
          fontSize: 10,
          fontWeight: '600',
          color: colors.primary,
        },
        backupHistorySize: {
          fontSize: 11,
          color: colors.textSecondary,
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
        scrollContainer: {
          maxHeight: '80%',
        },
        toggle: {
          opacity: loading ? 0.6 : 1,
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
          style={[styles.content, styles.scrollContainer]}
          scrollEnabled
          showsVerticalScrollIndicator={true}
          entering={FadeIn}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Backup & Restore</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={loading || backingUp || restoring}
            >
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Backup Status */}
          {preferences.lastBackupDate && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Last Backup</Text>
              <View
                style={[
                  styles.settingItem,
                  { backgroundColor: `${colors.success}10`, borderWidth: 1, borderColor: `${colors.success}30` },
                ]}
              >
                <Icon name="check-circle" size={20} color={colors.success} style={{ marginRight: 12 }} />
                <View style={styles.settingItemContent}>
                  <Text style={styles.settingLabel}>
                    {formatDate(preferences.lastBackupDate)}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {preferences.backupSize ? formatFileSize(preferences.backupSize) : 'Size unknown'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            {/* Backup Now */}
            <AnimatedTouchable
              style={styles.actionButton}
              onPress={handleBackupNow}
              activeOpacity={0.7}
              disabled={backingUp}
            >
              {backingUp ? (
                <>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={styles.actionButtonText}>Backing Up...</Text>
                </>
              ) : (
                <>
                  <Icon name="cloud-upload" size={16} color={colors.primary} />
                  <Text style={styles.actionButtonText}>Backup Now</Text>
                </>
              )}
            </AnimatedTouchable>

            {/* Restore Backup */}
            <AnimatedTouchable
              style={[styles.actionButton, { marginTop: 8 }]}
              onPress={handleRestoreBackup}
              activeOpacity={0.7}
              disabled={restoring}
            >
              {restoring ? (
                <>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={styles.actionButtonText}>Restoring...</Text>
                </>
              ) : (
                <>
                  <Icon name="cloud-download" size={16} color={colors.primary} />
                  <Text style={styles.actionButtonText}>Restore Backup</Text>
                </>
              )}
            </AnimatedTouchable>
          </View>

          {/* Automatic Backup Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Automatic Backup</Text>

            {/* Auto Backup Toggle */}
            <View style={styles.settingItem}>
              <View
                style={[styles.settingIcon, { backgroundColor: `${colors.primary}20` }]}
              >
                <Icon name="backup-restore" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingLabel}>Auto-Backup</Text>
                <Text style={styles.settingDescription}>Automatic scheduled backups</Text>
              </View>
              <Switch
                style={styles.toggle}
                value={preferences.autoBackupEnabled}
                onValueChange={handleAutoBackupToggle}
                disabled={loading}
                trackColor={{ false: colors.border, true: `${colors.primary}40` }}
                thumbColor={preferences.autoBackupEnabled ? colors.primary : colors.textSecondary}
              />
            </View>

            {/* Backup Frequency */}
            {preferences.autoBackupEnabled && (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                layout={Layout.springify()}
                style={styles.frequencyOptions}
              >
                {['daily', 'weekly', 'monthly'].map((freq, index) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyOption,
                      index === 2 && styles.frequencyOptionLast,
                    ]}
                    onPress={() =>
                      handleFrequencyChange(freq as BackupPreferences['autoBackupFrequency'])
                    }
                  >
                    <Text
                      style={[
                        styles.frequencyOptionText,
                        preferences.autoBackupFrequency === freq &&
                          styles.frequencyOptionActive,
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </View>

          {/* Cloud Backup Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cloud Backup</Text>

            <View style={styles.settingItem}>
              <View
                style={[styles.settingIcon, { backgroundColor: `${colors.info}20` }]}
              >
                <Icon name="cloud" size={20} color={colors.info} />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingLabel}>Cloud Backup</Text>
                <Text style={styles.settingDescription}>
                  {preferences.cloudBackupEnabled
                    ? `Enabled (${preferences.cloudService})`
                    : 'Disabled'}
                </Text>
              </View>
              <Switch
                style={styles.toggle}
                value={preferences.cloudBackupEnabled}
                onValueChange={handleCloudBackupToggle}
                disabled={loading}
                trackColor={{ false: colors.border, true: `${colors.info}40` }}
                thumbColor={preferences.cloudBackupEnabled ? colors.info : colors.textSecondary}
              />
            </View>
          </View>

          {/* Backup History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Backup History</Text>
            <View style={styles.backupHistoryContainer}>
              {backupFiles.map((backup) => (
                <AnimatedTouchable
                  key={backup.id}
                  style={styles.backupHistoryItem}
                  onPress={() => handleRestoreFromHistory(backup)}
                  activeOpacity={0.7}
                >
                  <View style={styles.backupHistoryItemHeader}>
                    <Text style={styles.backupHistoryLabel}>{backup.label}</Text>
                    <View style={styles.backupHistoryType}>
                      <Text style={styles.backupHistoryTypeText}>
                        {backup.type === 'local' ? '📱' : '☁️'} {backup.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.backupHistorySize}>{formatFileSize(backup.size)}</Text>
                </AnimatedTouchable>
              ))}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Icon
                name="information"
                size={16}
                color={colors.info}
                style={styles.infoBoxIcon}
              />
              <Text style={styles.infoBoxText}>
                Regular backups protect your data. Enable automatic backups and consider enabling
                cloud backup for extra security.
              </Text>
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.footerButton, (loading || backingUp || restoring) && { opacity: 0.6 }]}
            onPress={onClose}
            activeOpacity={0.8}
            disabled={loading || backingUp || restoring}
          >
            <Text style={styles.footerButtonText}>Done</Text>
          </TouchableOpacity>
        </Animated.ScrollView>
      </Animated.View>
    </Modal>
  );
};

export default BackupSettings;
