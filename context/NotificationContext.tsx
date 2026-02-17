import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';

// Mock notifee - optional dependency
// import notifee, { Notification } from '@notifee/react-native';
type Notification = any;

import notificationService from '@services/notifications/notificationService';
import { PermissionCheck, permissionService } from '@utils/permissions';
// import scheduleNotificationService, { ScheduledNotification } from '@services/notifications/scheduleNotification';
import { NOTIFICATION_CHANNELS, NOTIFICATION_SETTINGS_DEFAULTS } from '@config/notifications';
import { useSubscriptions } from '@hooks/useSubscriptions';
import cancelNotificationService from '@services/notifications/cancelNotification';
import notificationHandlers from '@services/notifications/notificationHandlers';

// Mock types and services when modules unavailable
type ScheduledNotification = any;
const scheduleNotificationService = {
  getAllScheduled: async () => [],
  scheduleAllPaymentReminders: async (_subscription: any, _reminders: any[]) => {},
  scheduleTrialReminder: async (_trial: any, _days: number) => {},
  scheduleWeeklySummary: async (_userId: string, _data: any) => {},
  scheduleMonthlyReport: async (_userId: string, _data: any) => {},
};
// import { useTrials } from '@hooks/useTrials';
// import { useBudget } from '@hooks/useBudget';

// Mock hooks when modules unavailable
type Trial = any;
type Budget = any;
const useTrials = () => ({ trials: [] as Trial[] });
const useBudget = () => ({ budgets: [] as Budget[] });

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badges: boolean;
  preview: boolean;
  grouping: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    days: number[];
  };
  channels: Record<string, boolean>;
  reminders: {
    payment: number[];
    trial: number[];
    budget: number[];
  };
  summary: {
    weekly: boolean;
    monthly: boolean;
    yearly: boolean;
  };
  insights: {
    tips: boolean;
    duplicates: boolean;
    unused: boolean;
  };
}

export interface NotificationStats {
  total: number;
  today: number;
  thisWeek: number;
  unread: number;
  byType: Record<string, number>;
  byChannel: Record<string, number>;
}

export interface NotificationContextType {
  // State
  hasPermission: boolean;
  permissionStatus: PermissionCheck | null;
  preferences: NotificationPreferences;
  stats: NotificationStats;
  scheduledNotifications: ScheduledNotification[];
  recentNotifications: Notification[];
  loading: boolean;
  error: string | null;

  // Permission methods
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<boolean>;
  openSettings: () => Promise<void>;

  // Preference methods
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  toggleChannel: (channelId: string, enabled: boolean) => Promise<void>;
  toggleQuietHours: (enabled: boolean) => Promise<void>;
  setQuietHours: (start: string, end: string, days: number[]) => Promise<void>;
  resetPreferences: () => Promise<void>;

  // Notification methods
  sendTestNotification: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  cancelNotification: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;

  // Schedule methods
  schedulePaymentReminders: (subscriptionId: string) => Promise<void>;
  scheduleTrialReminders: (trialId: string) => Promise<void>;
  scheduleBudgetAlerts: (categoryId: string) => Promise<void>;
  scheduleWeeklySummary: () => Promise<void>;
  scheduleMonthlyReport: () => Promise<void>;

  // Utility methods
  refreshStats: () => Promise<void>;
  getChannelStatus: (channelId: string) => boolean;
  isQuietHours: () => boolean;
  getNextScheduled: () => ScheduledNotification | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // State
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionCheck | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(NOTIFICATION_SETTINGS_DEFAULTS);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    unread: 0,
    byType: {},
    byChannel: {},
  });
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [recentNotifications, _setRecentNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  // Hooks
  const { subscriptions } = useSubscriptions();
  const { trials } = useTrials();
  const { budgets } = useBudget();

  // Initialize
  useEffect(() => {
    initialize();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Auto-schedule notifications when data changes
  useEffect(() => {
    if (hasPermission && preferences.enabled) {
      scheduleAllNotifications();
    }
  }, [subscriptions, trials, budgets, hasPermission, preferences.enabled]);

  // Refresh stats periodically
  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  const initialize = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check permission
      await checkPermission();

      // Initialize notification handlers
      await notificationHandlers.initialize();

      // Load preferences
      await loadPreferences();

      // Refresh stats
      await refreshStats();

      // Load scheduled notifications
      await loadScheduledNotifications();
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to initialize notification context:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      // In a real app, load from AsyncStorage
      // const saved = await storage.get('notification_preferences');
      // if (saved) setPreferences(saved);
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  };

  const savePreferences = async (newPrefs: NotificationPreferences) => {
    try {
      // In a real app, save to AsyncStorage
      // await storage.set('notification_preferences', newPrefs);
      setPreferences(newPrefs);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  const loadScheduledNotifications = async () => {
    try {
      const scheduled = await scheduleNotificationService.getAllScheduled();
      setScheduledNotifications(scheduled);
    } catch (err) {
      console.error('Failed to load scheduled notifications:', err);
    }
  };

  const refreshStats = async () => {
    try {
      const scheduled = await scheduleNotificationService.getAllScheduled();
      
      const now = new Date();
      const today = now.setHours(0, 0, 0, 0);
      const weekAgo = now.setDate(now.getDate() - 7);

      const byType: Record<string, number> = {};
      const byChannel: Record<string, number> = {};

      scheduled.forEach((n: any) => {
        // Count by type
        byType[n.type] = (byType[n.type] || 0) + 1;

        // Count by channel
        const channel = NOTIFICATION_CHANNELS[n.type]?.id || 'other';
        byChannel[channel] = (byChannel[channel] || 0) + 1;
      });

      setStats({
        total: scheduled.length,
        today: scheduled.filter((n: any) => n.scheduledFor.getTime() >= today).length,
        thisWeek: scheduled.filter((n: any) => n.scheduledFor.getTime() >= weekAgo).length,
        unread: 0, // Would come from storage in real app
        byType,
        byChannel,
      });
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground
      await refreshStats();
      await loadScheduledNotifications();
    }
    setAppState(nextAppState);
  };

  const checkPermission = async (): Promise<boolean> => {
    const status = await permissionService.checkPermission('notifications');
    setPermissionStatus(status);
    setHasPermission(status.granted);
    return status.granted;
  };

  const requestPermission = async (): Promise<boolean> => {
    const result = await permissionService.requestPermission('notifications');
    await checkPermission();
    return result.granted;
  };

  const openSettings = async (): Promise<void> => {
    await permissionService.openSettings();
  };

  const updatePreferences = async (prefs: Partial<NotificationPreferences>): Promise<void> => {
    const newPrefs = { ...preferences, ...prefs };
    await savePreferences(newPrefs);
    
    // Reschedule notifications if needed
    if (hasPermission && newPrefs.enabled) {
      await cancelNotificationService.cancelAllNotifications();
      await scheduleAllNotifications();
    }
  };

  const toggleChannel = async (channelId: string, enabled: boolean): Promise<void> => {
    const newChannels = { ...preferences.channels, [channelId]: enabled };
    await updatePreferences({ channels: newChannels });
  };

  const toggleQuietHours = async (enabled: boolean): Promise<void> => {
    await updatePreferences({
      quietHours: { ...preferences.quietHours, enabled },
    });
  };

  const setQuietHours = async (start: string, end: string, days: number[]): Promise<void> => {
    await updatePreferences({
      quietHours: { ...preferences.quietHours, start, end, days },
    });
  };

  const resetPreferences = async (): Promise<void> => {
    await savePreferences(NOTIFICATION_SETTINGS_DEFAULTS);
  };

  const sendTestNotification = async (): Promise<void> => {
    if (!hasPermission) {
      throw new Error('Notification permission not granted');
    }

    await notificationService.sendNotification({
      id: `test_${Date.now()}`,
      type: 'reminder' as any, // Use reminder type instead of system
      title: '🔔 Test Notification',
      body: 'This is a test notification from SubTrack',
      priority: 'high',
      actions: [
        { id: 'ok', title: '✓ OK' },
        { id: 'cancel', title: '✗ Cancel' },
      ],
    });
  };

  const cancelAllNotifications = async (): Promise<void> => {
    await cancelNotificationService.cancelAllNotifications();
    await loadScheduledNotifications();
    await refreshStats();
  };

  const cancelNotification = async (id: string): Promise<void> => {
    await cancelNotificationService.cancelNotification(id);
    await loadScheduledNotifications();
    await refreshStats();
  };

  const markAsRead = async (id: string): Promise<void> => {
    // In a real app, mark as read in storage
    console.log('Mark as read:', id);
  };

  const markAllAsRead = async (): Promise<void> => {
    // In a real app, mark all as read in storage
    console.log('Mark all as read');
  };

  const scheduleAllNotifications = async () => {
    try {
      // Schedule payment reminders
      for (const sub of subscriptions) {
        await schedulePaymentReminders(sub.id);
      }

      // Schedule trial reminders
      for (const trial of trials) {
        await scheduleTrialReminders(trial.id);
      }

      // Schedule budget alerts
      for (const budget of budgets) {
        await scheduleBudgetAlerts(budget.categoryId);
      }

      // Schedule summaries
      if (preferences.summary.weekly) {
        await scheduleWeeklySummary();
      }
      if (preferences.summary.monthly) {
        await scheduleMonthlyReport();
      }
    } catch (err) {
      console.error('Failed to schedule notifications:', err);
    }
  };

  const schedulePaymentReminders = async (subscriptionId: string): Promise<void> => {
    if (!preferences.channels.payments) return;

    const subscription = subscriptions.find(s => s.id === subscriptionId);
    if (!subscription) return;

    await scheduleNotificationService.scheduleAllPaymentReminders(
      subscription,
      preferences.reminders.payment
    );
    await loadScheduledNotifications();
  };

  const scheduleTrialReminders = async (trialId: string): Promise<void> => {
    if (!preferences.channels.trials) return;

    const trial = trials.find((t: any) => t.id === trialId);
    if (!trial) return;

    for (const days of preferences.reminders.trial) {
      await scheduleNotificationService.scheduleTrialReminder(trial, days);
    }
    await loadScheduledNotifications();
  };

  const scheduleBudgetAlerts = async (categoryId: string): Promise<void> => {
    if (!preferences.channels.budget) return;

    const budget = budgets.find((b: any) => b.categoryId === categoryId);
    if (!budget) return;

    // This would be called when spending updates
    // await scheduleNotificationService.scheduleBudgetAlert(budget, spent);
  };

  const scheduleWeeklySummary = async (): Promise<void> => {
    if (!preferences.summary.weekly) return;

    const total = subscriptions.reduce((sum, s) => sum + s.price, 0);
    
    await scheduleNotificationService.scheduleWeeklySummary(
      'user_id', // In real app, get from auth
      {
        totalSpent: total,
        subscriptionsCount: subscriptions.length,
        upcomingPayments: subscriptions.filter(s => s.status === 'active').length,
        currency: 'USD',
      }
    );
    await loadScheduledNotifications();
  };

  const scheduleMonthlyReport = async (): Promise<void> => {
    if (!preferences.summary.monthly) return;

    await scheduleNotificationService.scheduleMonthlyReport(
      'user_id', // In real app, get from auth
      {}
    );
    await loadScheduledNotifications();
  };

  const getChannelStatus = (channelId: string): boolean => {
    return preferences.channels[channelId] ?? true;
  };

  const isQuietHours = (): boolean => {
    if (!preferences.quietHours.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();

    if (!preferences.quietHours.days.includes(currentDay)) {
      return false;
    }

    const [startHour, startMinute] = preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = preferences.quietHours.end.split(':').map(Number);

    const currentTime = currentHour * 60 + currentMinute;
    const startTime = startHour * 60 + startMinute;
    let endTime = endHour * 60 + endMinute;

    if (endTime < startTime) {
      endTime += 24 * 60;
    }

    return currentTime >= startTime && currentTime < endTime;
  };

  const getNextScheduled = (): ScheduledNotification | null => {
    const now = new Date();
    const upcoming = scheduledNotifications
      .filter(n => n.scheduledFor > now)
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());

    return upcoming[0] || null;
  };

  const value = useMemo(
    () => ({
      // State
      hasPermission,
      permissionStatus,
      preferences,
      stats,
      scheduledNotifications,
      recentNotifications,
      loading,
      error,

      // Permission methods
      requestPermission,
      checkPermission,
      openSettings,

      // Preference methods
      updatePreferences,
      toggleChannel,
      toggleQuietHours,
      setQuietHours,
      resetPreferences,

      // Notification methods
      sendTestNotification,
      cancelAllNotifications,
      cancelNotification,
      markAsRead,
      markAllAsRead,

      // Schedule methods
      schedulePaymentReminders,
      scheduleTrialReminders,
      scheduleBudgetAlerts,
      scheduleWeeklySummary,
      scheduleMonthlyReport,

      // Utility methods
      refreshStats,
      getChannelStatus,
      isQuietHours,
      getNextScheduled,
    }),
    [
      hasPermission,
      permissionStatus,
      preferences,
      stats,
      scheduledNotifications,
      recentNotifications,
      loading,
      error,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Helper hooks
export const useNotificationPermission = () => {
  const { hasPermission, requestPermission, checkPermission, openSettings } = useNotifications();
  return { hasPermission, requestPermission, checkPermission, openSettings };
};

export const useNotificationPreferences = () => {
  const { preferences, updatePreferences, toggleChannel, toggleQuietHours, setQuietHours } = useNotifications();
  return { preferences, updatePreferences, toggleChannel, toggleQuietHours, setQuietHours };
};

export const useNotificationStats = () => {
  const { stats, refreshStats } = useNotifications();
  return { stats, refreshStats };
};

export const useScheduledNotifications = () => {
  const { scheduledNotifications, getNextScheduled } = useNotifications();
  return { scheduledNotifications, nextScheduled: getNextScheduled() };
};

export default NotificationContext;