// Mock notifee types - actual implementation commented out due to optional dependency
// import { AndroidChannel, AndroidImportance, AndroidVisibility } from '@notifee/react-native';

// Type definitions for notifee
enum AndroidImportance {
  HIGH = 'HIGH',
  DEFAULT = 'DEFAULT',
  LOW = 'LOW',
  MIN = 'MIN',
}

enum AndroidVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  SECRET = 'SECRET',
}

// Notification Types
export type NotificationType = 
  | 'payment_due'
  | 'payment_overdue'
  | 'payment_received'
  | 'trial_ending'
  | 'trial_started'
  | 'trial_converted'
  | 'budget_alert'
  | 'budget_exceeded'
  | 'budget_reset'
  | 'price_change'
  | 'price_increase'
  | 'price_decrease'
  | 'unusual_activity'
  | 'duplicate_detected'
  | 'unused_detected'
  | 'weekly_summary'
  | 'monthly_report'
  | 'yearly_review'
  | 'achievement_unlocked'
  | 'milestone_reached'
  | 'streak_continued'
  | 'reminder'
  | 'tip'
  | 'insight'
  | 'system';

// Notification Priority Levels
export type NotificationPriority = 'high' | 'normal' | 'low' | 'min';

// Notification Channels
export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: AndroidImportance;
  sound?: string;
  vibration?: boolean;
  lights?: boolean;
  badge?: boolean;
  visibility?: AndroidVisibility;
  bypassDnd?: boolean;
  lockscreenVisibility?: AndroidVisibility;
}

// Notification Categories
export interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  channels: string[];
  defaultPriority: NotificationPriority;
  grouping?: boolean;
  summary?: boolean;
}

// Notification Templates
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  channelId: string;
  priority: NotificationPriority;
  actions?: NotificationAction[];
  data?: Record<string, any>;
  android?: {
    style?: 'default' | 'bigtext' | 'inbox' | 'messaging' | 'media';
    largeIcon?: string;
    color?: string;
    ongoing?: boolean;
    autoCancel?: boolean;
  };
  ios?: {
    categoryId?: string;
    threadId?: string;
    sound?: string;
    badge?: number;
  };
}

// Notification Actions
export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  destructive?: boolean;
  authenticationRequired?: boolean;
  foreground?: boolean;
}

// Default Reminder Times (hours before)
export const REMINDER_TIMES = {
  payment: [168, 72, 24, 1, 0], // 7 days, 3 days, 1 day, 1 hour, now
  trial: [72, 24, 1, 0], // 3 days, 1 day, 1 hour, now
  budget: [80, 90, 100], // percentages
  report: {
    weekly: { day: 1, hour: 9 }, // Monday 9 AM
    monthly: { day: 1, hour: 9 }, // 1st of month 9 AM
  },
};

// Default Quiet Hours
export const QUIET_HOURS = {
  enabled: false,
  start: '23:00',
  end: '07:00',
  days: [0, 1, 2, 3, 4, 5, 6], // All days
};

// Notification Channels Configuration
export const NOTIFICATION_CHANNELS: Record<string, NotificationChannel> = {
  payments: {
    id: 'payments',
    name: 'Payment Reminders',
    description: 'Notifications for upcoming and overdue payments',
    importance: AndroidImportance.HIGH,
    sound: 'payment_reminder',
    vibration: true,
    lights: true,
    badge: true,
    visibility: AndroidVisibility.PUBLIC,
    bypassDnd: false,
    lockscreenVisibility: AndroidVisibility.PUBLIC,
  },
  trials: {
    id: 'trials',
    name: 'Trial Reminders',
    description: 'Notifications for free trials ending soon',
    importance: AndroidImportance.HIGH,
    sound: 'trial_reminder',
    vibration: true,
    lights: true,
    badge: true,
    visibility: AndroidVisibility.PUBLIC,
    bypassDnd: false,
    lockscreenVisibility: AndroidVisibility.PUBLIC,
  },
  budget: {
    id: 'budget',
    name: 'Budget Alerts',
    description: 'Notifications for budget limits and overspending',
    importance: AndroidImportance.HIGH,
    sound: 'budget_alert',
    vibration: true,
    lights: true,
    badge: true,
    visibility: AndroidVisibility.PUBLIC,
    bypassDnd: false,
    lockscreenVisibility: AndroidVisibility.PUBLIC,
  },
  reports: {
    id: 'reports',
    name: 'Reports & Summaries',
    description: 'Weekly and monthly spending reports',
    importance: AndroidImportance.DEFAULT,
    sound: 'report',
    vibration: false,
    lights: false,
    badge: true,
    visibility: AndroidVisibility.PUBLIC,
    bypassDnd: false,
    lockscreenVisibility: AndroidVisibility.PUBLIC,
  },
  achievements: {
    id: 'achievements',
    name: 'Achievements',
    description: 'Achievement unlocks and milestones',
    importance: AndroidImportance.DEFAULT,
    sound: 'achievement',
    vibration: true,
    lights: true,
    badge: true,
    visibility: AndroidVisibility.PUBLIC,
    bypassDnd: false,
    lockscreenVisibility: AndroidVisibility.PUBLIC,
  },
  insights: {
    id: 'insights',
    name: 'Insights & Tips',
    description: 'Smart insights and money-saving tips',
    importance: AndroidImportance.LOW,
    sound: 'insight',
    vibration: false,
    lights: false,
    badge: true,
    visibility: AndroidVisibility.PUBLIC,
    bypassDnd: false,
    lockscreenVisibility: AndroidVisibility.PUBLIC,
  },
  system: {
    id: 'system',
    name: 'System Notifications',
    description: 'App updates and system alerts',
    importance: AndroidImportance.LOW,
    sound: 'system',
    vibration: false,
    lights: false,
    badge: true,
    visibility: AndroidVisibility.PUBLIC,
    bypassDnd: false,
    lockscreenVisibility: AndroidVisibility.PUBLIC,
  },
};

// Notification Categories
export const NOTIFICATION_CATEGORIES: Record<string, NotificationCategory> = {
  financial: {
    id: 'financial',
    name: 'Financial',
    description: 'Payment and budget related notifications',
    channels: ['payments', 'budget'],
    defaultPriority: 'high',
    grouping: true,
    summary: true,
  },
  trials: {
    id: 'trials',
    name: 'Trials',
    description: 'Free trial related notifications',
    channels: ['trials'],
    defaultPriority: 'high',
    grouping: true,
    summary: true,
  },
  reports: {
    id: 'reports',
    name: 'Reports',
    description: 'Spending reports and summaries',
    channels: ['reports'],
    defaultPriority: 'normal',
    grouping: true,
    summary: true,
  },
  gamification: {
    id: 'gamification',
    name: 'Gamification',
    description: 'Achievements and milestones',
    channels: ['achievements'],
    defaultPriority: 'normal',
    grouping: true,
    summary: true,
  },
  insights: {
    id: 'insights',
    name: 'Insights',
    description: 'Smart insights and recommendations',
    channels: ['insights'],
    defaultPriority: 'low',
    grouping: false,
    summary: false,
  },
  system: {
    id: 'system',
    name: 'System',
    description: 'App system notifications',
    channels: ['system'],
    defaultPriority: 'low',
    grouping: false,
    summary: false,
  },
};

// Notification Templates
export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  payment_due: {
    id: 'payment_due',
    type: 'payment_due',
    title: '💳 Payment Due {days}',
    body: '{subscriptionName} - {amount} {currency}',
    channelId: 'payments',
    priority: 'high',
    actions: [
      { id: 'mark_paid', title: '✓ Mark as Paid' },
      { id: 'snooze', title: '⏰ Remind Later' },
      { id: 'view', title: '👁️ View' },
    ],
    android: {
      style: 'bigtext',
      color: '#FF6B6B',
      autoCancel: true,
    },
  },
  payment_overdue: {
    id: 'payment_overdue',
    type: 'payment_overdue',
    title: '⚠️ Payment Overdue!',
    body: '{subscriptionName} - Please pay {amount} {currency} to avoid interruption',
    channelId: 'payments',
    priority: 'high',
    actions: [
      { id: 'mark_paid', title: '✓ Mark as Paid' },
      { id: 'view', title: '👁️ View Details' },
    ],
    android: {
      style: 'bigtext',
      color: '#FF4444',
      autoCancel: true,
    },
  },
  payment_received: {
    id: 'payment_received',
    type: 'payment_received',
    title: '✅ Payment Received',
    body: '{subscriptionName} - Payment of {amount} {currency} has been processed',
    channelId: 'payments',
    priority: 'normal',
    actions: [{ id: 'view', title: '👁️ View Receipt' }],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  trial_ending: {
    id: 'trial_ending',
    type: 'trial_ending',
    title: '⏰ Trial Ending {days}',
    body: '{serviceName} - Cancel to avoid payment of {amount} {currency}',
    channelId: 'trials',
    priority: 'high',
    actions: [
      { id: 'cancel', title: '❌ Cancel', destructive: true },
      { id: 'keep', title: '✓ Keep' },
      { id: 'snooze', title: '⏰ Later' },
    ],
    android: {
      style: 'bigtext',
      color: '#FFA500',
    },
  },
  trial_started: {
    id: 'trial_started',
    type: 'trial_started',
    title: '🎉 Trial Started',
    body: '{serviceName} - Your free trial has started. Ends on {endDate}',
    channelId: 'trials',
    priority: 'normal',
    actions: [{ id: 'view', title: '👁️ View Trial' }],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  trial_converted: {
    id: 'trial_converted',
    type: 'trial_converted',
    title: '🔄 Trial Converted',
    body: '{serviceName} - Your trial has converted to a paid subscription',
    channelId: 'trials',
    priority: 'normal',
    actions: [{ id: 'view', title: '👁️ View Subscription' }],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  budget_alert: {
    id: 'budget_alert',
    type: 'budget_alert',
    title: '⚠️ Budget Alert: {percentage}%',
    body: '{categoryName}: {spent} / {limit} {currency}',
    channelId: 'budget',
    priority: 'high',
    actions: [
      { id: 'view', title: '👁️ View' },
      { id: 'adjust', title: '📊 Adjust' },
    ],
    android: {
      style: 'inbox',
      color: '#FFD700',
    },
  },
  budget_exceeded: {
    id: 'budget_exceeded',
    type: 'budget_exceeded',
    title: '⚠️ Budget Exceeded!',
    body: '{categoryName}: {spent} / {limit} {currency} (Exceeded by {overage})',
    channelId: 'budget',
    priority: 'high',
    actions: [
      { id: 'view', title: '👁️ View' },
      { id: 'adjust', title: '📊 Adjust' },
    ],
    android: {
      style: 'inbox',
      color: '#FF4444',
    },
  },
  budget_reset: {
    id: 'budget_reset',
    type: 'budget_reset',
    title: '🔄 Budget Reset',
    body: 'Your {categoryName} budget has been reset for the new month',
    channelId: 'budget',
    priority: 'low',
    actions: [{ id: 'view', title: '👁️ View Budget' }],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  price_change: {
    id: 'price_change',
    type: 'price_change',
    title: '💰 Price Update',
    body: '{subscriptionName} price has changed',
    channelId: 'payments',
    priority: 'normal',
    actions: [{ id: 'view', title: '👁️ Details' }],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  price_increase: {
    id: 'price_increase',
    type: 'price_increase',
    title: '📈 Price Increase',
    body: '{subscriptionName} will cost {newAmount} {currency} from {date} ({change}% increase)',
    channelId: 'payments',
    priority: 'high',
    actions: [
      { id: 'view', title: '👁️ Details' },
      { id: 'alternatives', title: '🔄 Find Alternatives' },
    ],
    android: {
      style: 'bigtext',
      color: '#FF6B6B',
    },
  },
  price_decrease: {
    id: 'price_decrease',
    type: 'price_decrease',
    title: '📉 Price Decrease',
    body: 'Good news! {subscriptionName} now costs {newAmount} {currency} ({change}% decrease)',
    channelId: 'payments',
    priority: 'normal',
    actions: [{ id: 'view', title: '👁️ Details' }],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  unusual_activity: {
    id: 'unusual_activity',
    type: 'unusual_activity',
    title: '⚠️ Unusual Activity Detected',
    body: '{description}',
    channelId: 'payments',
    priority: 'high',
    actions: [
      { id: 'view', title: '👁️ Review' },
      { id: 'ignore', title: '✓ Ignore' },
    ],
    android: {
      style: 'bigtext',
      color: '#FF6B6B',
    },
  },
  duplicate_detected: {
    id: 'duplicate_detected',
    type: 'duplicate_detected',
    title: '🔄 Duplicate Subscriptions Found',
    body: 'You have {count} similar subscriptions that could be consolidated',
    channelId: 'insights',
    priority: 'normal',
    actions: [
      { id: 'view', title: '👁️ Review' },
      { id: 'ignore', title: '✓ Ignore' },
    ],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  unused_detected: {
    id: 'unused_detected',
    type: 'unused_detected',
    title: '💤 Unused Subscription Detected',
    body: 'You haven\'t used {subscriptionName} in {days} days',
    channelId: 'insights',
    priority: 'normal',
    actions: [
      { id: 'pause', title: '⏸️ Pause' },
      { id: 'cancel', title: '❌ Cancel' },
      { id: 'ignore', title: '✓ Keep' },
    ],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  weekly_summary: {
    id: 'weekly_summary',
    type: 'weekly_summary',
    title: '📊 Weekly Spending Summary',
    body: 'Spent: {total} | Active: {count} | Upcoming: {upcoming}',
    channelId: 'reports',
    priority: 'normal',
    actions: [{ id: 'view_report', title: '📈 View Full Report' }],
    android: {
      style: 'inbox',
      color: '#4ECDC4',
    },
  },
  monthly_report: {
    id: 'monthly_report',
    type: 'monthly_report',
    title: '📈 Monthly Financial Report',
    body: 'Your detailed spending analysis for {month} is ready',
    channelId: 'reports',
    priority: 'normal',
    actions: [{ id: 'view_report', title: '📑 View Report' }],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  yearly_review: {
    id: 'yearly_review',
    type: 'yearly_review',
    title: '📊 Year in Review',
    body: 'See how your spending changed over the past year',
    channelId: 'reports',
    priority: 'normal',
    actions: [{ id: 'view_report', title: '📈 View Review' }],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  achievement_unlocked: {
    id: 'achievement_unlocked',
    type: 'achievement_unlocked',
    title: '🏆 Achievement Unlocked!',
    body: '{achievementName} - {description}',
    channelId: 'achievements',
    priority: 'normal',
    actions: [
      { id: 'share', title: '📤 Share' },
      { id: 'view', title: '👁️ View' },
    ],
    android: {
      style: 'bigtext',
      color: '#FFD700',
    },
  },
  milestone_reached: {
    id: 'milestone_reached',
    type: 'milestone_reached',
    title: '🎯 Milestone Reached!',
    body: 'You\'ve reached {milestone} in {category}',
    channelId: 'achievements',
    priority: 'normal',
    actions: [{ id: 'view', title: '👁️ View' }],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  streak_continued: {
    id: 'streak_continued',
    type: 'streak_continued',
    title: '🔥 {days} Day Streak!',
    body: 'You\'ve been tracking for {days} days in a row',
    channelId: 'achievements',
    priority: 'low',
    actions: [{ id: 'share', title: '📤 Share' }],
    android: {
      style: 'bigtext',
      color: '#FF6B6B',
    },
  },
  reminder: {
    id: 'reminder',
    type: 'reminder',
    title: '⏰ Reminder',
    body: '{message}',
    channelId: 'system',
    priority: 'normal',
    actions: [{ id: 'view', title: '👁️ View' }],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  tip: {
    id: 'tip',
    type: 'tip',
    title: '💡 Money-Saving Tip',
    body: '{tip}',
    channelId: 'insights',
    priority: 'low',
    actions: [{ id: 'learn_more', title: '📚 Learn More' }],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  insight: {
    id: 'insight',
    type: 'insight',
    title: '🔍 Smart Insight',
    body: '{insight}',
    channelId: 'insights',
    priority: 'low',
    actions: [{ id: 'view', title: '👁️ View Details' }],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
  system: {
    id: 'system',
    type: 'system',
    title: '🔔 System Notification',
    body: '{message}',
    channelId: 'system',
    priority: 'low',
    actions: [],
    android: {
      style: 'bigtext',
      color: '#4ECDC4',
    },
  },
};

// Notification Settings Defaults
export const NOTIFICATION_SETTINGS_DEFAULTS = {
  enabled: true,
  sound: true,
  vibration: true,
  badges: true,
  preview: true,
  grouping: true,
  quietHours: QUIET_HOURS,
  channels: Object.keys(NOTIFICATION_CHANNELS).reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {} as Record<string, boolean>),
  reminders: {
    payment: REMINDER_TIMES.payment,
    trial: REMINDER_TIMES.trial,
    budget: REMINDER_TIMES.budget,
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

// Sound Files
export const NOTIFICATION_SOUNDS = {
  payment_reminder: 'payment_reminder.mp3',
  trial_reminder: 'trial_reminder.mp3',
  budget_alert: 'budget_alert.mp3',
  report: 'report.mp3',
  achievement: 'achievement.mp3',
  insight: 'insight.mp3',
  system: 'system.mp3',
  default: 'default',
};

// Export all configurations
export default {
  types: NOTIFICATION_TEMPLATES,
  channels: NOTIFICATION_CHANNELS,
  categories: NOTIFICATION_CATEGORIES,
  settings: NOTIFICATION_SETTINGS_DEFAULTS,
  sounds: NOTIFICATION_SOUNDS,
  reminderTimes: REMINDER_TIMES,
  quietHours: QUIET_HOURS,
};