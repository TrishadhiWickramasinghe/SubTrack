// import { Platform } from 'react-native';
// Notifee and Firebase imports commented out - optional dependencies
/*
import notifee, {
  AndroidChannel,
  AndroidImportance,
  AndroidStyle,
  EventType,
  Notification,
  TimestampTrigger,
  TriggerType,
  RepeatFrequency,
  IntervalTrigger,
  AndroidCategory,
  AndroidVisibility,
  AndroidColor,
} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
*/

// Type stubs for commented dependencies - marked as any to avoid errors
type AndroidChannel = any;
type Notification = any;
type TimestampTrigger = any;
type IntervalTrigger = any;

// Enums for Android notification properties
enum AndroidImportance {
  HIGH = 'HIGH',
  DEFAULT = 'DEFAULT',
  LOW = 'LOW',
}

enum TriggerType {
  TIMESTAMP = 'TIMESTAMP',
  INTERVAL = 'INTERVAL',
}

enum RepeatFrequency {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

enum AndroidVisibility {
  PUBLIC = 'PUBLIC',
}

enum AndroidColor {
  PRIMARY = 'PRIMARY',
}

enum AndroidStyle {
  INBOX = 'INBOX',
}

enum AndroidCategory {
  REMINDER = 'REMINDER',
  ALARM = 'ALARM',
  SOCIAL = 'SOCIAL',
}

// Mock notifee object to prevent "Cannot find name" errors
const notifee = {
  getNotificationSettings: async () => ({ authorizationStatus: 1 }),
  createChannel: async (_channel: any) => {},
  displayNotification: async (_notification: any) => '',
  createTriggerNotification: async (_notification: any, _trigger: any) => '',
  cancelNotification: async (_id: string) => {},
  cancelAllNotifications: async () => {},
  getTriggerNotifications: async () => [],
  onForegroundEvent: (_callback: any) => {},
  onBackgroundEvent: (_callback: any) => {},
};

import Subscription from '@models/Subscription';

export type NotificationType = 
  | 'payment_due'
  | 'payment_overdue'
  | 'trial_ending'
  | 'budget_alert'
  | 'price_change'
  | 'unusual_activity'
  | 'weekly_summary'
  | 'monthly_report'
  | 'achievement'
  | 'reminder';

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  scheduledFor?: Date;
  priority?: 'high' | 'normal' | 'low';
  category?: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  destructive?: boolean;
  authenticationRequired?: boolean;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
  importance: AndroidImportance;
  sound?: string;
  vibration?: boolean;
  lights?: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badges: boolean;
  preview: boolean;
  group: boolean;
  channels: Record<string, boolean>;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
    days: number[]; // 0-6, 0 = Sunday
  };
}

class NotificationService {
  private static instance: NotificationService;
  private initialized = false;
  private preferences: NotificationPreferences = {
    enabled: true,
    sound: true,
    vibration: true,
    badges: true,
    preview: true,
    group: true,
    channels: {},
    quietHours: {
      enabled: false,
      start: '23:00',
      end: '07:00',
      days: [0, 1, 2, 3, 4, 5, 6],
    },
  };
  private token: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Request permissions
      await this.requestPermissions();

      // Create notification channels
      await this.createChannels();

      // Get FCM token
      await this.getFCMToken();

      // Set up event listeners
      this.setupEventListeners();

      // Load preferences
      await this.loadPreferences();

      this.initialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      throw error;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // const settings = await notifee.requestPermission();
      
      // if (settings.authorizationStatus >= 1) {
      //   // Also request FCM permission
      //   const authStatus = await messaging().requestPermission();
      //   const enabled =
      //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      //   
      //   return enabled;
      // }
      
      return false;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  /**
   * Check if we have permission
   */
  async hasPermission(): Promise<boolean> {
    try {
      const settings = await notifee.getNotificationSettings();
      return settings.authorizationStatus >= 1;
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  }

  /**
   * Create notification channels
   */
  private async createChannels(): Promise<void> {
    // Payment reminders channel
    await notifee.createChannel({
      id: 'payments',
      name: 'Payment Reminders',
      description: 'Notifications for upcoming and overdue payments',
      importance: AndroidImportance.HIGH,
      sound: 'payment_reminder',
      vibration: true,
      lights: true,
      badge: true,
    } as AndroidChannel);

    // Trial reminders channel
    await notifee.createChannel({
      id: 'trials',
      name: 'Trial Reminders',
      description: 'Notifications for free trials ending soon',
      importance: AndroidImportance.HIGH,
      sound: 'trial_reminder',
      vibration: true,
      lights: true,
      badge: true,
    } as AndroidChannel);

    // Budget alerts channel
    await notifee.createChannel({
      id: 'budget',
      name: 'Budget Alerts',
      description: 'Notifications for budget limits and overspending',
      importance: AndroidImportance.HIGH,
      sound: 'budget_alert',
      vibration: true,
      lights: true,
      badge: true,
    } as AndroidChannel);

    // Reports channel
    await notifee.createChannel({
      id: 'reports',
      name: 'Reports & Summaries',
      description: 'Weekly and monthly spending reports',
      importance: AndroidImportance.DEFAULT,
      sound: 'report',
      vibration: false,
      lights: false,
      badge: true,
    } as AndroidChannel);

    // Achievements channel
    await notifee.createChannel({
      id: 'achievements',
      name: 'Achievements',
      description: 'Achievement unlocks and milestones',
      importance: AndroidImportance.DEFAULT,
      sound: 'achievement',
      vibration: true,
      lights: true,
      badge: true,
    } as AndroidChannel);
  }

  /**
   * Get FCM token
   */
  private async getFCMToken(): Promise<string | null> {
    try {
      // const token = await messaging().getToken();
      return this.token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Foreground events
    // notifee.onForegroundEvent(({ type, detail }: any) => {
    //   switch (type) {
    //     case EventType.DISMISSED:
    //       this.handleNotificationDismissed(detail.notification);
    //       break;
    //     case EventType.PRESS:
    //       this.handleNotificationPress(detail.notification);
    //       break;
    //     case EventType.ACTION_PRESS:
    //       this.handleNotificationAction(detail.notification, detail.pressAction?.id);
    //       break;
    //   }
    // });

    // Background events
    // notifee.onBackgroundEvent(async ({ type, detail }: any) => {
    //   switch (type) {
    //     case EventType.PRESS:
    //       await this.handleBackgroundNotificationPress(detail.notification);
    //       break;
    //     case EventType.ACTION_PRESS:
    //       await this.handleBackgroundNotificationAction(
    //         detail.notification,
    //         detail.pressAction?.id
    //       );
    //       break;
    //   }
    // });

    // FCM message handling
    // messaging().onMessage(async (remoteMessage: any) => {
    //   await this.handleRemoteMessage(remoteMessage);
    // });

    // messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    //   await this.handleRemoteMessage(remoteMessage);
    // });

    // Token refresh
    // messaging().onTokenRefresh(async (token: string) => {
    //   this.token = token;
    //   await this.sendTokenToServer(token);
    // });
  }

  /**
   * Load user preferences
   */
  private async loadPreferences(): Promise<void> {
    try {
      // In a real app, load from AsyncStorage
      // this.preferences = await storage.get('notification_preferences');
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }

  /**
   * Send token to server
   */
  // Commented out: Only needed when Firebase messaging is enabled
  // private async sendTokenToServer(_token: string): Promise<void> {
  //   try {
  //     // In a real app, send to your backend
  //     // await api.post('/notifications/register', { token });
  //   } catch (error) {
  //     console.error('Failed to send token to server:', error);
  //   }
  // }

  /**
   * Check quiet hours
   */
  private isQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();

    // Check if today is in quiet hours days
    if (!this.preferences.quietHours.days.includes(currentDay)) {
      return false;
    }

    const [startHour, startMinute] = this.preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = this.preferences.quietHours.end.split(':').map(Number);

    const currentTime = currentHour * 60 + currentMinute;
    const startTime = startHour * 60 + startMinute;
    let endTime = endHour * 60 + endMinute;

    // Handle overnight quiet hours
    if (endTime < startTime) {
      endTime += 24 * 60;
    }

    return currentTime >= startTime && currentTime < endTime;
  }

  /**
   * Send a notification
   */
  async sendNotification(notification: NotificationData): Promise<string | null> {
    if (!this.preferences.enabled) return null;
    if (this.isQuietHours() && notification.priority !== 'high') return null;

    try {
      const channelId = this.getChannelForType(notification.type);
      
      // Check if channel is enabled
      if (this.preferences.channels[channelId] === false) {
        return null;
      }

      const notifeeNotification: Notification = {
        id: notification.id,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        android: {
          channelId,
          importance: this.getAndroidImportance(notification.priority),
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          actions: notification.actions?.map(action => ({
            title: action.title,
            pressAction: {
              id: action.id,
              destructive: action.destructive,
              authenticationRequired: action.authenticationRequired,
            },
          })),
          style: this.getAndroidStyle(notification),
          category: this.getAndroidCategory(notification.type),
          visibility: AndroidVisibility.PUBLIC,
          color: AndroidColor.PRIMARY,
          timestamp: Date.now(),
          showTimestamp: true,
          vibrate: this.preferences.vibration,
          sound: this.preferences.sound ? this.getSoundForType(notification.type) : undefined,
          badge: this.preferences.badges,
        },
        ios: {
          categoryId: notification.category,
          threadId: notification.type,
          sound: this.preferences.sound ? this.getSoundForType(notification.type) : undefined,
          badge: this.preferences.badges ? 1 : 0,
          critical: notification.priority === 'high',
        },
      };

      if (notification.scheduledFor) {
        return await this.scheduleNotification(notifeeNotification, notification.scheduledFor);
      } else {
        return await notifee.displayNotification(notifeeNotification);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }

  /**
   * Schedule a notification
   */
  private async scheduleNotification(
    notification: Notification,
    date: Date
  ): Promise<string> {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    return await notifee.createTriggerNotification(notification, trigger);
  }

  /**
   * Schedule a recurring notification
   */
  async scheduleRecurringNotification(
    notification: NotificationData,
    interval: {
      every: 'hour' | 'day' | 'week' | 'month' | 'year';
      count?: number;
    }
  ): Promise<string> {
    if (!this.preferences.enabled) return '';

    try {
      const channelId = this.getChannelForType(notification.type);
      
      let repeatFrequency: RepeatFrequency;
      let intervalValue: number;

      switch (interval.every) {
        case 'hour':
          repeatFrequency = RepeatFrequency.HOURLY;
          intervalValue = 60 * 60 * 1000;
          break;
        case 'day':
          repeatFrequency = RepeatFrequency.DAILY;
          intervalValue = 24 * 60 * 60 * 1000;
          break;
        case 'week':
          repeatFrequency = RepeatFrequency.WEEKLY;
          intervalValue = 7 * 24 * 60 * 60 * 1000;
          break;
        default:
          repeatFrequency = RepeatFrequency.DAILY;
          intervalValue = 24 * 60 * 60 * 1000;
      }

      const trigger: IntervalTrigger = {
        type: TriggerType.INTERVAL,
        interval: intervalValue,
        repeats: true,
        repeatFrequency,
      };

      const notifeeNotification: Notification = {
        id: notification.id,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          categoryId: notification.category,
        },
      };

      return await notifee.createTriggerNotification(notifeeNotification, trigger);
    } catch (error) {
      console.error('Failed to schedule recurring notification:', error);
      return '';
    }
  }

  /**
   * Send payment due notification
   */
  async sendPaymentDueNotification(
    subscription: Subscription,
    daysUntilDue: number
  ): Promise<void> {
    const notification: NotificationData = {
      id: `payment_${subscription.id}_${Date.now()}`,
      type: 'payment_due',
      title: daysUntilDue === 0 ? '💳 Payment Due Today' : `💳 Payment Due in ${daysUntilDue} Days`,
      body: `${subscription.name} - ${subscription.amount} ${subscription.currency}`,
      data: {
        subscriptionId: subscription.id,
        dueDate: subscription.nextBillingDate,
        amount: subscription.amount,
        currency: subscription.currency,
      },
      priority: daysUntilDue === 0 ? 'high' : 'normal',
      category: 'payment',
      actions: [
        {
          id: 'mark_paid',
          title: 'Mark as Paid',
        },
        {
          id: 'snooze',
          title: 'Remind Later',
          destructive: true,
        },
      ],
    };

    await this.sendNotification(notification);
  }

  /**
   * Send trial ending notification
   */
  async sendTrialEndingNotification(
    subscription: Subscription,
    daysUntilEnd: number
  ): Promise<void> {
    const notification: NotificationData = {
      id: `trial_${subscription.id}_${Date.now()}`,
      type: 'trial_ending',
      title: daysUntilEnd === 0 
        ? '⏰ Trial Ends Today' 
        : `⏰ Trial Ends in ${daysUntilEnd} Days`,
      body: `Cancel ${subscription.name} to avoid payment`,
      data: {
        subscriptionId: subscription.id,
        trialEndDate: subscription.trialEndDate,
      },
      priority: daysUntilEnd === 0 ? 'high' : 'normal',
      category: 'trial',
      actions: [
        {
          id: 'cancel',
          title: 'Cancel Subscription',
          destructive: true,
        },
        {
          id: 'keep',
          title: 'Keep It',
        },
        {
          id: 'snooze',
          title: 'Remind Later',
        },
      ],
    };

    await this.sendNotification(notification);
  }

  /**
   * Send budget alert notification
   */
  async sendBudgetAlertNotification(
    category: string,
    spent: number,
    budget: number,
    percentage: number
  ): Promise<void> {
    const notification: NotificationData = {
      id: `budget_${category}_${Date.now()}`,
      type: 'budget_alert',
      title: percentage >= 100 
        ? '⚠️ Budget Exceeded' 
        : `⚠️ Budget at ${percentage}%`,
      body: `${category}: ${spent} / ${budget}`,
      data: {
        category,
        spent,
        budget,
        percentage,
      },
      priority: percentage >= 100 ? 'high' : 'normal',
      category: 'budget',
      actions: [
        {
          id: 'view',
          title: 'View Details',
        },
        {
          id: 'adjust',
          title: 'Adjust Budget',
        },
      ],
    };

    await this.sendNotification(notification);
  }

  /**
   * Send weekly summary notification
   */
  async sendWeeklySummaryNotification(
    totalSpent: number,
    subscriptionsCount: number,
    upcomingPayments: number
  ): Promise<void> {
    const notification: NotificationData = {
      id: `weekly_${Date.now()}`,
      type: 'weekly_summary',
      title: '📊 Your Weekly Summary',
      body: `Spent: ${totalSpent} | Active: ${subscriptionsCount} | Upcoming: ${upcomingPayments}`,
      data: {
        totalSpent,
        subscriptionsCount,
        upcomingPayments,
        period: 'week',
      },
      priority: 'normal',
      category: 'report',
      actions: [
        {
          id: 'view_report',
          title: 'View Full Report',
        },
      ],
    };

    await this.sendNotification(notification);
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(
    achievementName: string,
    achievementIcon: string
  ): Promise<void> {
    const notification: NotificationData = {
      id: `achievement_${Date.now()}`,
      type: 'achievement',
      title: '🏆 Achievement Unlocked!',
      body: achievementName,
      data: {
        achievement: achievementName,
        icon: achievementIcon,
      },
      priority: 'normal',
      category: 'achievement',
      actions: [
        {
          id: 'share',
          title: 'Share',
        },
      ],
    };

    await this.sendNotification(notification);
  }

  /**
   * Cancel a notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notification[]> {
    try {
      return await notifee.getTriggerNotifications();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...preferences };
    
    // In a real app, save to storage
    // await storage.set('notification_preferences', this.preferences);
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Get FCM token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Handle notification press
   */
  // Commented out: Only needed when notifee event listeners are enabled
  // private handleNotificationPress(notification?: Notification): void {
  //   if (!notification) return;
  //   console.log('Notification pressed:', notification.id);
  //   // Navigate to relevant screen based on notification data
  // }

  /**
   * Handle notification dismiss
   */
  // Commented out: Only needed when notifee event listeners are enabled
  // private handleNotificationDismissed(notification?: Notification): void {
  //   if (!notification) return;
  //   console.log('Notification dismissed:', notification.id);
  // }

  /**
   * Handle notification action
   */
  // Commented out: Only needed when notifee event listeners are enabled
  // private handleNotificationAction(notification?: Notification, actionId?: string): void {
  //   if (!notification || !actionId) return;
  //   console.log('Notification action:', actionId, notification.id);
  //   // Perform action based on actionId
  // }

  /**
   * Handle background notification press
   */
  // Commented out: Only needed when notifee event listeners are enabled
  // private async handleBackgroundNotificationPress(notification?: Notification): Promise<void> {
  //   if (!notification) return;
  //   // Handle background notification press
  // }

  /**
   * Handle background notification action
   */
  // Commented out: Only needed when notifee event listeners are enabled
  // private async handleBackgroundNotificationAction(
  //   notification?: Notification,
  //   actionId?: string
  // ): Promise<void> {
  //   if (!notification || !actionId) return;
  //   // Handle background notification action
  // }

  /**
   * Handle remote FCM message
   */
  // Commented out: Only needed when Firebase messaging is enabled
  // private async handleRemoteMessage(remoteMessage: any): Promise<void> {
  //   console.log('Received remote message:', remoteMessage);
  //   if (remoteMessage.notification) {
  //     await this.sendNotification({
  //       id: remoteMessage.messageId || Date.now().toString(),
  //       type: remoteMessage.data?.type || 'reminder',
  //       title: remoteMessage.notification.title || '',
  //       body: remoteMessage.notification.body || '',
  //       data: remoteMessage.data,
  //     });
  //   }
  // }

  /**
   * Get channel ID for notification type
   */
  private getChannelForType(type: NotificationType): string {
    switch (type) {
      case 'payment_due':
      case 'payment_overdue':
        return 'payments';
      case 'trial_ending':
        return 'trials';
      case 'budget_alert':
        return 'budget';
      case 'weekly_summary':
      case 'monthly_report':
        return 'reports';
      case 'achievement':
        return 'achievements';
      default:
        return 'payments';
    }
  }

  /**
   * Get Android importance based on priority
   */
  private getAndroidImportance(priority?: 'high' | 'normal' | 'low'): AndroidImportance {
    switch (priority) {
      case 'high':
        return AndroidImportance.HIGH;
      case 'normal':
        return AndroidImportance.DEFAULT;
      case 'low':
        return AndroidImportance.LOW;
      default:
        return AndroidImportance.DEFAULT;
    }
  }

  /**
   * Get Android style for notification
   */
  private getAndroidStyle(notification: NotificationData): any {
    if (notification.type === 'weekly_summary') {
      return {
        type: AndroidStyle.INBOX,
        lines: notification.body.split('|'),
      };
    }
    return undefined;
  }

  /**
   * Get Android category for notification type
   */
  private getAndroidCategory(type: NotificationType): AndroidCategory {
    switch (type) {
      case 'payment_due':
      case 'payment_overdue':
        return AndroidCategory.REMINDER;
      case 'budget_alert':
        return AndroidCategory.ALARM;
      case 'achievement':
        return AndroidCategory.SOCIAL;
      default:
        return AndroidCategory.REMINDER;
    }
  }

  /**
   * Get sound file for notification type
   */
  private getSoundForType(type: NotificationType): string | undefined {
    switch (type) {
      case 'payment_due':
        return 'payment_reminder.mp3';
      case 'trial_ending':
        return 'trial_reminder.mp3';
      case 'budget_alert':
        return 'budget_alert.mp3';
      case 'achievement':
        return 'achievement.mp3';
      default:
        return 'default';
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
export default notificationService;