import React, { useCallback, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    Layout,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Mock DateTimePicker - optional dependency
// import DateTimePicker from '@react-native-community/datetimepicker';
const DateTimePicker = (_props: any) => {
  return <View />;
};

import { NOTIFICATION_CHANNELS } from '@config/notifications';
import { useTheme } from '@context/ThemeContext';
import { useNotifications } from '@hooks/useNotifications';
import { permissionService } from '@utils/permissions';
import SettingItem from './SettingItem';

// Mock notification preferences when hook doesn't provide them
const mockPreferences = {
  enabled: true,
  sound: true,
  vibration: true,
  badges: true,
  preview: true,
  grouping: true,
  quietHours: {
    enabled: false,
    start: '23:00',
    end: '07:00',
    days: [0, 1, 2, 3, 4, 5, 6],
  },
  channels: {
    payments: true,
    trials: true,
    budget: true,
    reports: true,
    achievements: true,
    insights: true,
    system: true,
  },
  reminders: {
    payment: [7, 3, 1, 0],
    trial: [3, 1, 0],
    budget: [80, 90, 100],
  },
  summary: {
    weekly: true,
    monthly: true,
    yearly: true,
  },
  insights: {
    tips: true,
    duplicates: true,
    unused: true,
  },
};

interface NotificationSettingsProps {
  onClose?: () => void;
  testID?: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onClose,
  testID,
}) => {
  const { theme } = useTheme();
  const notificationContext = useNotifications();
  
  // Use mock preferences if hook doesn't provide them
  const preferences = (notificationContext as any).preferences || mockPreferences;
  const updatePreferences = (notificationContext as any).updatePreferences || (() => {});
  const toggleChannel = (notificationContext as any).toggleChannel || (() => {});
  const toggleQuietHours = (notificationContext as any).toggleQuietHours || (() => {});
  const setQuietHours = (notificationContext as any).setQuietHours || (() => {});
  const hasPermission = (notificationContext as any).hasPermission !== undefined ? (notificationContext as any).hasPermission : true;
  const requestPermission = (notificationContext as any).requestPermission || (async () => true);
  const sendTestNotification = (notificationContext as any).sendTestNotification || (async () => {});

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Handle permission
  const handlePermissionPress = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in settings to receive reminders.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => permissionService.openSettings(),
            },
          ]
        );
      }
    }
  }, [hasPermission, requestPermission]);

  // Handle test notification
  const handleTestNotification = useCallback(async () => {
    try {
      await sendTestNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  }, [sendTestNotification]);

  // Handle time change
  const handleTimeChange = useCallback((_event: any, selectedDate?: Date, type: 'start' | 'end' = 'start') => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
      setShowEndTimePicker(false);
    }

    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      if (type === 'start') {
        setQuietHours(timeString, preferences.quietHours.end, preferences.quietHours.days);
        if (Platform.OS === 'ios') setShowStartTimePicker(false);
      } else {
        setQuietHours(preferences.quietHours.start, timeString, preferences.quietHours.days);
        if (Platform.OS === 'ios') setShowEndTimePicker(false);
      }
    }
  }, [preferences.quietHours, setQuietHours]);

  // Handle day toggle
  const toggleDay = useCallback((day: number) => {
    const newDays = preferences.quietHours.days.includes(day)
      ? preferences.quietHours.days.filter((d: number) => d !== day)
      : [...preferences.quietHours.days, day].sort();
    
    setQuietHours(
      preferences.quietHours.start,
      preferences.quietHours.end,
      newDays
    );
  }, [preferences.quietHours, setQuietHours]);

  // Get day name
  const getDayName = (day: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
      testID={testID}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Notification Settings
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Permission Status */}
      <Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout}>
        <SettingItem
          label="Notifications"
          description={hasPermission ? 'Enabled' : 'Disabled'}
          type={hasPermission ? 'success' : 'warning'}
          icon={hasPermission ? 'bell-ring' : 'bell-off'}
          iconColor={hasPermission ? theme.colors.success : theme.colors.warning}
          onPress={handlePermissionPress}
          showDivider
        />
      </Animated.View>

      {/* Main Toggle */}
      <Animated.View entering={FadeIn.delay(100)} exiting={FadeOut} layout={Layout}>
        <SettingItem
          label="Enable Notifications"
          type="toggle"
          toggleValue={preferences.enabled}
          onToggle={(value) => updatePreferences({ enabled: value })}
          icon="bell"
          description="Master switch for all notifications"
          disabled={!hasPermission}
          showDivider
        />
      </Animated.View>

      {/* Sound & Vibration */}
      <Animated.View entering={FadeIn.delay(150)} exiting={FadeOut} layout={Layout}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Sound & Vibration
          </Text>
        </View>

        <SettingItem
          label="Sound"
          type="toggle"
          toggleValue={preferences.sound}
          onToggle={(value) => updatePreferences({ sound: value })}
          icon="volume-high"
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />

        <SettingItem
          label="Vibration"
          type="toggle"
          toggleValue={preferences.vibration}
          onToggle={(value) => updatePreferences({ vibration: value })}
          icon="vibrate"
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />

        <SettingItem
          label="Badges"
          type="toggle"
          toggleValue={preferences.badges}
          onToggle={(value) => updatePreferences({ badges: value })}
          icon="badge-account"
          description="Show notification count on app icon"
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />

        <SettingItem
          label="Preview"
          type="toggle"
          toggleValue={preferences.preview}
          onToggle={(value) => updatePreferences({ preview: value })}
          icon="eye"
          description="Show message preview in notifications"
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />
      </Animated.View>

      {/* Quiet Hours */}
      <Animated.View entering={FadeIn.delay(200)} exiting={FadeOut} layout={Layout}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Quiet Hours
          </Text>
        </View>

        <SettingItem
          label="Enable Quiet Hours"
          type="toggle"
          toggleValue={preferences.quietHours.enabled}
          onToggle={toggleQuietHours}
          icon="weather-night"
          description="Mute notifications during selected hours"
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />

        {preferences.quietHours.enabled && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            {/* Start Time */}
            <TouchableOpacity
              style={[styles.timeRow, { backgroundColor: theme.colors.surface }]}
              onPress={() => setShowStartTimePicker(true)}
              disabled={!preferences.quietHours.enabled}
            >
              <View style={styles.timeLeft}>
                <Icon name="weather-sunset-up" size={20} color={theme.colors.text} />
                <Text style={[styles.timeLabel, { color: theme.colors.text }]}>
                  Start Time
                </Text>
              </View>
              <Text style={[styles.timeValue, { color: theme.colors.primary }]}>
                {preferences.quietHours.start}
              </Text>
            </TouchableOpacity>

            {/* End Time */}
            <TouchableOpacity
              style={[styles.timeRow, { backgroundColor: theme.colors.surface }]}
              onPress={() => setShowEndTimePicker(true)}
              disabled={!preferences.quietHours.enabled}
            >
              <View style={styles.timeLeft}>
                <Icon name="weather-sunset-down" size={20} color={theme.colors.text} />
                <Text style={[styles.timeLabel, { color: theme.colors.text }]}>
                  End Time
                </Text>
              </View>
              <Text style={[styles.timeValue, { color: theme.colors.primary }]}>
                {preferences.quietHours.end}
              </Text>
            </TouchableOpacity>

            {/* Days */}
            <View style={[styles.daysContainer, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.daysLabel, { color: theme.colors.text }]}>
                Active Days
              </Text>
              <View style={styles.daysGrid}>
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      {
                        backgroundColor: preferences.quietHours.days.includes(day)
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        {
                          color: preferences.quietHours.days.includes(day)
                            ? '#fff'
                            : theme.colors.text,
                        },
                      ]}
                    >
                      {getDayName(day)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Pickers */}
            {showStartTimePicker && (
              <DateTimePicker
                value={new Date(`2024-01-01T${preferences.quietHours.start}:00`)}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e: any, d: any) => handleTimeChange(e, d, 'start')}
              />
            )}

            {showEndTimePicker && (
              <DateTimePicker
                value={new Date(`2024-01-01T${preferences.quietHours.end}:00`)}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e: any, d: any) => handleTimeChange(e, d, 'end')}
              />
            )}
          </Animated.View>
        )}
      </Animated.View>

      {/* Channel Settings */}
      <Animated.View entering={FadeIn.delay(250)} exiting={FadeOut} layout={Layout}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Notification Types
          </Text>
        </View>

        {Object.entries(NOTIFICATION_CHANNELS).map(([id, channel], index) => (
          <Animated.View
            key={id}
            entering={FadeIn.delay(300 + index * 50)}
            exiting={FadeOut}
            layout={Layout}
          >
            <SettingItem
              label={channel.name}
              description={channel.description}
              type="toggle"
              toggleValue={preferences.channels[id]}
              onToggle={(value) => toggleChannel(id, value)}
              icon={getChannelIcon(id)}
              disabled={!preferences.enabled || !hasPermission}
              showDivider={index < Object.keys(NOTIFICATION_CHANNELS).length - 1}
            />
          </Animated.View>
        ))}
      </Animated.View>

      {/* Reminder Settings */}
      <Animated.View entering={FadeIn.delay(350)} exiting={FadeOut} layout={Layout}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Reminder Times
          </Text>
        </View>

        <SettingItem
          label="Payment Reminders"
          description={`${preferences.reminders.payment.length} reminders before due date`}
          type="button"
          icon="credit-card"
          onPress={() => {}}
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />

        <SettingItem
          label="Trial Reminders"
          description={`${preferences.reminders.trial.length} reminders before trial ends`}
          type="button"
          icon="timer"
          onPress={() => {}}
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />

        <SettingItem
          label="Budget Alerts"
          description={`At ${preferences.reminders.budget.join('%, ')}% of budget`}
          type="button"
          icon="chart-line"
          onPress={() => {}}
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />
      </Animated.View>

      {/* Summary Settings */}
      <Animated.View entering={FadeIn.delay(400)} exiting={FadeOut} layout={Layout}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Reports & Summaries
          </Text>
        </View>

        <SettingItem
          label="Weekly Summary"
          type="toggle"
          toggleValue={preferences.summary.weekly}
          onToggle={(value) => updatePreferences({
            summary: { ...preferences.summary, weekly: value }
          })}
          icon="calendar-week"
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />

        <SettingItem
          label="Monthly Report"
          type="toggle"
          toggleValue={preferences.summary.monthly}
          onToggle={(value) => updatePreferences({
            summary: { ...preferences.summary, monthly: value }
          })}
          icon="calendar-month"
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />

        <SettingItem
          label="Yearly Review"
          type="toggle"
          toggleValue={preferences.summary.yearly}
          onToggle={(value) => updatePreferences({
            summary: { ...preferences.summary, yearly: value }
          })}
          icon="calendar"
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />
      </Animated.View>

      {/* Insights Settings */}
      <Animated.View entering={FadeIn.delay(450)} exiting={FadeOut} layout={Layout}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Smart Insights
          </Text>
        </View>

        <SettingItem
          label="Money-Saving Tips"
          type="toggle"
          toggleValue={preferences.insights.tips}
          onToggle={(value) => updatePreferences({
            insights: { ...preferences.insights, tips: value }
          })}
          icon="lightbulb"
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />

        <SettingItem
          label="Duplicate Detection"
          type="toggle"
          toggleValue={preferences.insights.duplicates}
          onToggle={(value) => updatePreferences({
            insights: { ...preferences.insights, duplicates: value }
          })}
          icon="content-duplicate"
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />

        <SettingItem
          label="Unused Subscription Alerts"
          type="toggle"
          toggleValue={preferences.insights.unused}
          onToggle={(value) => updatePreferences({
            insights: { ...preferences.insights, unused: value }
          })}
          icon="sleep"
          disabled={!preferences.enabled || !hasPermission}
          showDivider
        />
      </Animated.View>

      {/* Test & Debug */}
      <Animated.View entering={FadeIn.delay(500)} exiting={FadeOut} layout={Layout}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Test & Debug
          </Text>
        </View>

        <SettingItem
          label="Send Test Notification"
          type="button"
          icon="bell-ring"
          onPress={handleTestNotification}
          disabled={!hasPermission}
          rightIcon="send"
          showDivider={false}
        />
      </Animated.View>

      {/* Bottom Padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const getChannelIcon = (channelId: string): string => {
  const icons: Record<string, string> = {
    payments: 'credit-card',
    trials: 'timer',
    budget: 'chart-line',
    reports: 'file-chart',
    achievements: 'trophy',
    insights: 'lightbulb',
    system: 'cog',
  };
  return icons[channelId] || 'bell';
};

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  timeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeLabel: {
    fontSize: 16,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  daysContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  daysLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
});

export default NotificationSettings;