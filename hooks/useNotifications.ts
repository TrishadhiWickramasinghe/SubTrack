import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { useNotifications as useNotificationContext } from '@context/NotificationContext';
import notificationService from '@services/notifications/notificationService';
// import { useSubscription } from './useSubscription';
// import { useTrials } from './useTrials';
// import { useBudget } from './useBudget';

// Mock hooks when modules unavailable
type Subscription = any;
type Trial = any;
type Budget = any;

const useSubscription = () => ({ subscriptions: [] as Subscription[] });
const useTrials = () => ({ trials: [] as Trial[] });
const useBudget = () => ({ budgets: [] as Budget[] });
// import scheduleNotificationService from '@services/notifications/scheduleNotification';
import { NOTIFICATION_TEMPLATES, NotificationType } from '@config/notifications';
import cancelNotificationService from '@services/notifications/cancelNotification';

// Mock scheduleNotificationService when module unavailable
const scheduleNotificationService = {
  getAllScheduled: async () => [],
  schedule: async (_options: any) => '',
  cancel: async (_id: string) => {},
  cancelPaymentReminders: async (_subscriptionId: string) => {},
  cancelTrialReminders: async (_trialId: string) => {},
};
// import { dateHelpers } from '@utils/dateHelpers';

// Mock dateHelpers when module unavailable
const dateHelpers = {
  subtractDays: (date: Date, days: number) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000),
  subtractHours: (date: Date, hours: number) => new Date(date.getTime() - hours * 60 * 60 * 1000),
  subtractMinutes: (date: Date, minutes: number) => new Date(date.getTime() - minutes * 60 * 1000),
  format: (date: Date) => date.toLocaleDateString(),
};

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
  scheduledFor?: Date;
  actions?: Array<{
    id: string;
    title: string;
    onPress: () => void;
  }>;
}

export interface NotificationGroup {
  date: string;
  notifications: NotificationItem[];
}

export interface UseNotificationsReturn {
  // State
  notifications: NotificationItem[];
  groupedNotifications: NotificationGroup[];
  unreadCount: number;
  scheduledCount: number;
  loading: boolean;
  refreshing: boolean;
  error: string | null;

  // Actions
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;

  // Scheduling
  scheduleReminder: (options: ScheduleReminderOptions) => Promise<string | null>;
  cancelReminder: (id: string) => Promise<void>;
  cancelAllReminders: () => Promise<void>;
  getScheduledReminders: () => Promise<NotificationItem[]>;

  // Testing
  sendTestNotification: () => Promise<void>;

  // Utilities
  getNotificationIcon: (type: NotificationType) => string;
  getNotificationColor: (type: NotificationType) => string;
  formatNotificationTime: (date: Date) => string;
  handleNotificationPress: (notification: NotificationItem) => void;
}

export interface ScheduleReminderOptions {
  type: NotificationType;
  title: string;
  body: string;
  scheduledFor: Date;
  data?: Record<string, any>;
  repeat?: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    count?: number;
    until?: Date;
  };
  actions?: Array<{
    id: string;
    title: string;
    onPress: () => void;
  }>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const context = useNotificationContext();
  const { subscriptions } = useSubscription();
  const { trials } = useTrials();
  const { budgets } = useBudget();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notifications on mount and when context changes
  useEffect(() => {
    loadNotifications();
  }, []);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      refreshNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // In a real app, load from storage/API
      // For now, generate mock data
      const mockNotifications = await generateMockNotifications();
      setNotifications(mockNotifications);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMockNotifications = async (): Promise<NotificationItem[]> => {
    const mock: NotificationItem[] = [];

    // Add payment due notifications
    subscriptions.slice(0, 3).forEach((sub: Subscription, index: number) => {
      mock.push({
        id: `payment_${sub.id}_1`,
        type: 'payment_due',
        title: NOTIFICATION_TEMPLATES.payment_due.title.replace('{days}', 'tomorrow'),
        body: NOTIFICATION_TEMPLATES.payment_due.body
          .replace('{subscriptionName}', sub.name)
          .replace('{amount}', sub.price.toString())
          .replace('{currency}', sub.currency),
        data: { subscriptionId: sub.id, ...sub },
        timestamp: dateHelpers.subtractDays(new Date(), index),
        read: index !== 0,
        actions: [
          {
            id: 'mark_paid',
            title: '✓ Mark as Paid',
            onPress: () => handleMarkAsPaid(sub.id),
          },
          {
            id: 'view',
            title: '👁️ View',
            onPress: () => handleViewSubscription(sub.id),
          },
        ],
      });
    });

    // Add trial ending notifications
    trials.slice(0, 2).forEach((trial: Trial, index: number) => {
      mock.push({
        id: `trial_${trial.id}_1`,
        type: 'trial_ending',
        title: NOTIFICATION_TEMPLATES.trial_ending.title.replace('{days}', '2 days'),
        body: NOTIFICATION_TEMPLATES.trial_ending.body
          .replace('{serviceName}', trial.serviceName)
          .replace('{amount}', trial.price.toString())
          .replace('{currency}', trial.currency),
        data: { trialId: trial.id, ...trial },
        timestamp: dateHelpers.subtractHours(new Date(), 12 * (index + 1)),
        read: false,
        actions: [
          {
            id: 'cancel',
            title: '❌ Cancel',
            onPress: () => handleCancelTrial(trial.id),
          },
          {
            id: 'keep',
            title: '✓ Keep',
            onPress: () => handleKeepTrial(trial.id),
          },
        ],
      });
    });

    // Add budget alerts
    budgets.slice(0, 2).forEach((budget: Budget, index: number) => {
      const spent = budget.limit * 0.85;
      mock.push({
        id: `budget_${budget.categoryId}_1`,
        type: 'budget_alert',
        title: NOTIFICATION_TEMPLATES.budget_alert.title.replace('{percentage}', '85'),
        body: NOTIFICATION_TEMPLATES.budget_alert.body
          .replace('{categoryName}', budget.categoryName)
          .replace('{spent}', spent.toFixed(2))
          .replace('{limit}', budget.limit.toString())
          .replace('{currency}', budget.currency),
        data: { categoryId: budget.categoryId, ...budget },
        timestamp: dateHelpers.subtractDays(new Date(), index),
        read: true,
        actions: [
          {
            id: 'view',
            title: '👁️ View',
            onPress: () => handleViewBudget(budget.categoryId),
          },
          {
            id: 'adjust',
            title: '📊 Adjust',
            onPress: () => handleAdjustBudget(budget.categoryId),
          },
        ],
      });
    });

    // Add achievement
    mock.push({
      id: 'achievement_1',
      type: 'achievement_unlocked',
      title: '🏆 Achievement Unlocked!',
      body: 'Budget Master - Stay under budget for 3 months in a row',
      data: { achievement: 'budget_master' },
      timestamp: dateHelpers.subtractHours(new Date(), 5),
      read: false,
      actions: [
        {
          id: 'share',
          title: '📤 Share',
          onPress: () => handleShareAchievement(),
        },
      ],
    });

    // Add insight
    mock.push({
      id: 'insight_1',
      type: 'insight',
      title: '💡 Money-Saving Tip',
      body: 'You have 2 unused subscriptions. Consider pausing them to save $45/month.',
      data: { tip: 'unused_subscriptions' },
      timestamp: dateHelpers.subtractHours(new Date(), 24),
      read: true,
      actions: [
        {
          id: 'view',
          title: '👁️ View',
          onPress: () => handleViewInsight(),
        },
      ],
    });

    // Sort by timestamp (newest first)
    return mock.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, NotificationItem[]> = {};
    const today = new Date().toDateString();
    const yesterday = dateHelpers.subtractDays(new Date(), 1).toDateString();

    notifications.forEach(notification => {
      const date = notification.timestamp.toDateString();
      let groupKey = date;

      if (date === today) {
        groupKey = 'Today';
      } else if (date === yesterday) {
        groupKey = 'Yesterday';
      } else {
        groupKey = notification.timestamp.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      notifications: items,
    }));
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const scheduledCount = useMemo(() => {
    return context.scheduledNotifications.length;
  }, [context.scheduledNotifications]);

  const markAsRead = async (id: string): Promise<void> => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    await context.markAsRead(id);
  };

  const markAllAsRead = async (): Promise<void> => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await context.markAllAsRead();
  };

  const deleteNotification = async (id: string): Promise<void> => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await cancelNotificationService.cancelNotification(id);
  };

  const deleteAllNotifications = async (): Promise<void> => {
    setNotifications([]);
    await cancelNotificationService.cancelAllNotifications();
  };

  const refreshNotifications = async (): Promise<void> => {
    setRefreshing(true);
    await loadNotifications();
    await context.refreshStats();
    setRefreshing(false);
  };

  const scheduleReminder = async (
    options: ScheduleReminderOptions
  ): Promise<string | null> => {
    try {
      const id = await scheduleNotificationService.schedule({
        id: `reminder_${Date.now()}`,
        title: options.title,
        body: options.body,
        type: options.type,
        scheduledFor: options.scheduledFor,
        data: options.data,
        repeat: options.repeat,
        actions: options.actions?.map(a => ({
          id: a.id,
          title: a.title,
        })),
      });

      if (id) {
        // Add to local state
        const newNotification: NotificationItem = {
          id,
          type: options.type,
          title: options.title,
          body: options.body,
          data: options.data,
          timestamp: new Date(),
          scheduledFor: options.scheduledFor,
          read: false,
          actions: options.actions,
        };
        setNotifications(prev => [newNotification, ...prev]);
      }

      return id;
    } catch (err) {
      console.error('Failed to schedule reminder:', err);
      return null;
    }
  };

  const cancelReminder = async (id: string): Promise<void> => {
    await cancelNotificationService.cancelNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const cancelAllReminders = async (): Promise<void> => {
    await cancelNotificationService.cancelAllNotifications();
    setNotifications(prev => prev.filter(n => !n.scheduledFor));
  };

  const getScheduledReminders = async (): Promise<NotificationItem[]> => {
    const scheduled = await scheduleNotificationService.getAllScheduled();
    return scheduled.map((s: any) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      body: s.body,
      data: s.data,
      timestamp: s.createdAt,
      scheduledFor: s.scheduledFor,
      read: true,
    }));
  };

  const sendTestNotification = async (): Promise<void> => {
    await notificationService.sendNotification({
      id: `test_${Date.now()}`,
      type: 'reminder',
      title: '🔔 Test Notification',
      body: 'This is a test notification from SubTrack',
      priority: 'high',
      actions: [
        { id: 'ok', title: '✓ OK' },
        { id: 'cancel', title: '✗ Cancel' },
      ],
    });

    // Add to local state
    const testNotification: NotificationItem = {
      id: `test_${Date.now()}`,
      type: 'reminder',
      title: '🔔 Test Notification',
      body: 'This is a test notification from SubTrack',
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [testNotification, ...prev]);
  };

  const getNotificationIcon = (type: NotificationType): string => {
    const icons: Record<NotificationType, string> = {
      payment_due: '💳',
      payment_overdue: '⚠️',
      payment_received: '✅',
      trial_ending: '⏰',
      trial_started: '🎉',
      trial_converted: '🔄',
      budget_alert: '📊',
      budget_exceeded: '⚠️',
      budget_reset: '🔄',
      price_change: '💰',
      price_increase: '📈',
      price_decrease: '📉',
      unusual_activity: '🔍',
      duplicate_detected: '🔄',
      unused_detected: '💤',
      weekly_summary: '📊',
      monthly_report: '📈',
      yearly_review: '📊',
      achievement_unlocked: '🏆',
      milestone_reached: '🎯',
      streak_continued: '🔥',
      reminder: '⏰',
      tip: '💡',
      insight: '🔍',
      system: '🔔',
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type: NotificationType): string => {
    const colors: Record<NotificationType, string> = {
      payment_due: '#FF6B6B',
      payment_overdue: '#FF4444',
      payment_received: '#4ECDC4',
      trial_ending: '#FFA500',
      trial_started: '#4ECDC4',
      trial_converted: '#4ECDC4',
      budget_alert: '#FFD700',
      budget_exceeded: '#FF4444',
      budget_reset: '#4ECDC4',
      price_change: '#4ECDC4',
      price_increase: '#FF6B6B',
      price_decrease: '#4ECDC4',
      unusual_activity: '#FF6B6B',
      duplicate_detected: '#4ECDC4',
      unused_detected: '#4ECDC4',
      weekly_summary: '#4ECDC4',
      monthly_report: '#4ECDC4',
      yearly_review: '#4ECDC4',
      achievement_unlocked: '#FFD700',
      milestone_reached: '#4ECDC4',
      streak_continued: '#FF6B6B',
      reminder: '#4ECDC4',
      tip: '#4ECDC4',
      insight: '#4ECDC4',
      system: '#4ECDC4',
    };
    return colors[type] || '#4ECDC4';
  };

  const formatNotificationTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleNotificationPress = (notification: NotificationItem): void => {
    markAsRead(notification.id);

    switch (notification.type) {
      case 'payment_due':
      case 'payment_overdue':
        if (notification.data?.subscriptionId) {
          handleViewSubscription(notification.data.subscriptionId);
        }
        break;
      case 'trial_ending':
        if (notification.data?.trialId) {
          handleViewTrial(notification.data.trialId);
        }
        break;
      case 'budget_alert':
      case 'budget_exceeded':
        if (notification.data?.categoryId) {
          handleViewBudget(notification.data.categoryId);
        }
        break;
      case 'weekly_summary':
      case 'monthly_report':
        handleViewReport();
        break;
      case 'achievement_unlocked':
        handleViewAchievements();
        break;
      case 'insight':
      case 'tip':
        handleViewInsight();
        break;
      default:
        // Navigate to notifications list
        break;
    }
  };

  // Action handlers
  const handleMarkAsPaid = (subscriptionId: string) => {
    Alert.alert(
      'Mark as Paid',
      'Record this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            // In real app, mark as paid
            await scheduleNotificationService.cancelPaymentReminders(subscriptionId);
            refreshNotifications();
          },
        },
      ]
    );
  };

  const handleViewSubscription = (subscriptionId: string) => {
    // Navigate to subscription details
    console.log('View subscription:', subscriptionId);
  };

  const handleCancelTrial = (trialId: string) => {
    Alert.alert(
      'Cancel Trial',
      'Are you sure you want to cancel this trial?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            // In real app, cancel trial
            await scheduleNotificationService.cancelTrialReminders(trialId);
            refreshNotifications();
          },
        },
      ]
    );
  };

  const handleKeepTrial = (trialId: string) => {
    // In real app, mark as keeping
    console.log('Keep trial:', trialId);
  };

  const handleViewTrial = (trialId: string) => {
    // Navigate to trial details
    console.log('View trial:', trialId);
  };

  const handleViewBudget = (categoryId: string) => {
    // Navigate to budget details
    console.log('View budget:', categoryId);
  };

  const handleAdjustBudget = (categoryId: string) => {
    // Navigate to budget adjustment
    console.log('Adjust budget:', categoryId);
  };

  const handleViewReport = () => {
    // Navigate to reports
    console.log('View report');
  };

  const handleViewAchievements = () => {
    // Navigate to achievements
    console.log('View achievements');
  };

  const handleViewInsight = () => {
    // Navigate to insights
    console.log('View insight');
  };

  const handleShareAchievement = () => {
    // Share achievement
    console.log('Share achievement');
  };

  return {
    // State
    notifications,
    groupedNotifications,
    unreadCount,
    scheduledCount,
    loading,
    refreshing,
    error,

    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications,

    // Scheduling
    scheduleReminder,
    cancelReminder,
    cancelAllReminders,
    getScheduledReminders,

    // Testing
    sendTestNotification,

    // Utilities
    getNotificationIcon,
    getNotificationColor,
    formatNotificationTime,
    handleNotificationPress,
  };
};

// Helper hooks
export const useUnreadCount = () => {
  const { unreadCount, markAllAsRead } = useNotifications();
  return { unreadCount, markAllAsRead };
};

export const useNotificationActions = () => {
  const { markAsRead, deleteNotification, handleNotificationPress } = useNotifications();
  return { markAsRead, deleteNotification, handleNotificationPress };
};

export default useNotifications;