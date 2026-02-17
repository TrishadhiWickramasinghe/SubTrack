// Mock notifee - actual implementation commented out due to optional dependency
// import notifee, { EventType, Event } from '@notifee/react-native';
import { navigationRef } from '@navigation/navigationRef';
import { Alert } from 'react-native';
// import { subscriptionService } from '@services/storage/subscriptionStorage';
// import { trialService } from '@services/storage/trialStorage';
// import { budgetService } from '@services/storage/budgetStorage';
// import { scheduleNotificationService } from './scheduleNotification';

// Type definitions for notifee
enum EventType {
  PRESS = 'press',
  ACTION_PRESS = 'action_press',
  DISMISSED = 'dismissed',
  DELIVERED = 'delivered',
  TRIGGER_NOTIFICATION_CREATED = 'trigger_notification_created',
}

interface Event {
  type: EventType;
  detail: {
    notification?: {
      id?: string;
      data?: Record<string, any>;
    };
    pressAction?: {
      id?: string;
    };
  };
}

// Mock notifee object
const notifee = {
  onForegroundEvent: (_callback: any) => {},
  onBackgroundEvent: (_callback: any) => {},
  getTriggerNotifications: async (): Promise<any[]> => [],
  cancelNotification: async (_id: string) => {},
};

// Mock analytics service
const analyticsService = {
  trackEvent: async (_event: string, _data?: any) => {},
};

// Mock storage services
const subscriptionService = {
  getSubscription: async (_id: string) => ({ name: '' } as any),
  markAsPaid: async (_id: string) => {},
  updateStatus: async (_id: string, _status: string) => {},
};

const trialService = {
  cancelTrial: async (_id: string) => {},
};

const scheduleNotificationService = {
  schedule: async (_data: any) => {},
  cancelPaymentReminders: async (_id: string) => {},
  cancelAllForSubscription: async (_id: string) => {},
  cancelTrialReminders: async (_id: string) => {},
};

export interface HandledEvent {
  type: EventType;
  notificationId?: string;
  actionId?: string;
  timestamp: number;
  handled: boolean;
}

class NotificationHandlers {
  private static instance: NotificationHandlers;
  private handlers: Map<EventType, Array<(event: Event) => Promise<void>>> = new Map();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): NotificationHandlers {
    if (!NotificationHandlers.instance) {
      NotificationHandlers.instance = new NotificationHandlers();
    }
    return NotificationHandlers.instance;
  }

  /**
   * Initialize notification handlers
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Register default handlers
    this.registerDefaultHandlers();

    // Set up notifee event listeners
    notifee.onForegroundEvent(this.handleForegroundEvent.bind(this));
    notifee.onBackgroundEvent(this.handleBackgroundEvent.bind(this));

    this.isInitialized = true;
    console.log('Notification handlers initialized');
  }

  /**
   * Register default handlers
   */
  private registerDefaultHandlers(): void {
    // Payment handlers
    this.registerHandler(EventType.PRESS, this.handleNotificationPress);
    this.registerHandler(EventType.ACTION_PRESS, this.handleActionPress);
    this.registerHandler(EventType.DISMISSED, this.handleNotificationDismissed);
    this.registerHandler(EventType.DELIVERED, this.handleNotificationDelivered);
    this.registerHandler(EventType.TRIGGER_NOTIFICATION_CREATED, this.handleTriggerCreated);
  }

  /**
   * Register a handler for an event type
   */
  registerHandler(
    eventType: EventType,
    handler: (event: Event) => Promise<void>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
  }

  /**
   * Handle foreground events
   */
  private async handleForegroundEvent(event: Event): Promise<void> {
    console.log('Foreground event:', event.type, event.detail);

    const handlers = this.handlers.get(event.type) || [];
    
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in foreground handler for event ${event.type}:`, error);
      }
    }

    // Track event
    await analyticsService.trackEvent('notification_foreground_event', {
      type: event.type,
      notificationId: event.detail.notification?.id,
      actionId: event.detail.pressAction?.id,
    });
  }

  /**
   * Handle background events
   */
  private async handleBackgroundEvent(event: Event): Promise<void> {
    console.log('Background event:', event.type, event.detail);

    const handlers = this.handlers.get(event.type) || [];
    
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in background handler for event ${event.type}:`, error);
      }
    }

    // Track event (async, don't await)
    analyticsService.trackEvent('notification_background_event', {
      type: event.type,
      notificationId: event.detail.notification?.id,
      actionId: event.detail.pressAction?.id,
    });
  }

  /**
   * Handle notification press
   */
  private handleNotificationPress = async (event: Event): Promise<void> => {
    const { notification } = event.detail;
    if (!notification) return;

    const data = notification.data;
    if (!data) return;

    console.log('Notification pressed:', notification.id, data);

    // Navigate based on notification type
    switch (data.type) {
      case 'payment_due':
      case 'payment_overdue':
        await this.handlePaymentNotificationPress(data);
        break;

      case 'trial_ending':
        await this.handleTrialNotificationPress(data);
        break;

      case 'budget_alert':
        await this.handleBudgetNotificationPress(data);
        break;

      case 'weekly_summary':
      case 'monthly_report':
        await this.handleReportNotificationPress(data);
        break;

      case 'achievement':
        await this.handleAchievementNotificationPress(data);
        break;

      case 'unusual_activity':
        await this.handleUnusualActivityPress(data);
        break;

      default:
        await this.handleDefaultPress(data);
    }

    // Track interaction
    await analyticsService.trackEvent('notification_pressed', {
      type: data.type,
      notificationId: notification.id,
    });
  };

  /**
   * Handle action press
   */
  private handleActionPress = async (event: Event): Promise<void> => {
    const { notification, pressAction } = event.detail;
    if (!notification || !pressAction) return;

    const data = notification.data;
    const actionId = pressAction.id;

    console.log('Action pressed:', actionId, notification.id, data);

    // Handle different actions
    switch (actionId) {
      case 'mark_paid':
        await this.handleMarkAsPaid(data);
        break;

      case 'cancel':
        await this.handleCancelSubscription(data);
        break;

      case 'keep':
        await this.handleKeepSubscription(data);
        break;

      case 'snooze':
      case 'snooze_1h':
        if (notification.id) {
          await this.handleSnoozeNotification(notification.id, data, 1);
        }
        break;

      case 'view':
      case 'view_details':
      case 'view_report':
        await this.handleViewDetails(data);
        break;

      case 'adjust':
        await this.handleAdjustBudget(data);
        break;

      case 'share':
        await this.handleShare(data);
        break;

      case 'ignore':
        await this.handleIgnore(data);
        break;

      default:
        console.log('Unhandled action:', actionId);
    }

    // Track action
    await analyticsService.trackEvent('notification_action', {
      actionId,
      type: data?.type,
      notificationId: notification.id,
    });
  };

  /**
   * Handle notification dismissed
   */
  private handleNotificationDismissed = async (event: Event): Promise<void> => {
    const { notification } = event.detail;
    if (!notification) return;

    console.log('Notification dismissed:', notification.id);

    await analyticsService.trackEvent('notification_dismissed', {
      notificationId: notification.id,
      type: notification.data?.type,
    });
  };

  /**
   * Handle notification delivered
   */
  private handleNotificationDelivered = async (event: Event): Promise<void> => {
    const { notification } = event.detail;
    if (!notification) return;

    console.log('Notification delivered:', notification.id);

    await analyticsService.trackEvent('notification_delivered', {
      notificationId: notification.id,
      type: notification.data?.type,
    });
  };

  /**
   * Handle trigger created
   */
  private handleTriggerCreated = async (event: Event): Promise<void> => {
    const { notification } = event.detail;
    if (!notification) return;

    console.log('Trigger notification created:', notification.id);
  };

  /**
   * Handle payment notification press
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handlePaymentNotificationPress(data: any): Promise<void> {
    if (data.subscriptionId) {
      (navigationRef.current?.navigate as any)('SubscriptionDetails', {
        subscriptionId: data.subscriptionId,
      });
    }
  }

  /**
   * Handle trial notification press
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleTrialNotificationPress(data: any): Promise<void> {
    if (data.trialId) {
      (navigationRef.current?.navigate as any)('TrialDetails', {
        trialId: data.trialId,
      });
    }
  }

  /**
   * Handle budget notification press
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleBudgetNotificationPress(data: any): Promise<void> {
    if (data.categoryId) {
      (navigationRef.current?.navigate as any)('Budget', {
        categoryId: data.categoryId,
      });
    } else {
      (navigationRef.current?.navigate as any)('Budget');
    }
  }

  /**
   * Handle report notification press
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleReportNotificationPress(data: any): Promise<void> {
    if (data.type === 'weekly_summary') {
      (navigationRef.current?.navigate as any)('Reports', { period: 'week' });
    } else if (data.type === 'monthly_report') {
      (navigationRef.current?.navigate as any)('Reports', { period: 'month' });
    }
  }

  /**
   * Handle achievement notification press
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleAchievementNotificationPress(_data: any): Promise<void> {
    (navigationRef.current?.navigate as any)('Profile', { screen: 'Achievements' });
  }

  /**
   * Handle unusual activity press
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleUnusualActivityPress(_data: any): Promise<void> {
    (navigationRef.current?.navigate as any)('Analytics', { tab: 'unusual' });
  }

  /**
   * Handle default press
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleDefaultPress(_data: any): Promise<void> {
    (navigationRef.current?.navigate as any)('Home');
  }

  /**
   * Handle mark as paid action
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleMarkAsPaid(data: any): Promise<void> {
    if (!data.subscriptionId) return;

    try {
      // Get subscription
      const subscription = await subscriptionService.getSubscription(data.subscriptionId);
      if (!subscription) return;

      // Mark as paid
      await subscriptionService.markAsPaid(data.subscriptionId);

      // Cancel all pending reminders
      await scheduleNotificationService.cancelPaymentReminders(data.subscriptionId);

      // Show confirmation
      Alert.alert(
        '✓ Payment Recorded',
        `Payment for ${subscription.name} has been recorded.`,
        [{ text: 'OK' }]
      );

      // Navigate to subscription
      (navigationRef.current?.navigate as any)('SubscriptionDetails', {
        subscriptionId: data.subscriptionId,
      });
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      Alert.alert('Error', 'Failed to record payment. Please try again.');
    }
  }

  /**
   * Handle cancel subscription action
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleCancelSubscription(data: any): Promise<void> {
    const subscriptionId = data.subscriptionId;
    const trialId = data.trialId;

    if (!subscriptionId && !trialId) return;

    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel this subscription?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              if (subscriptionId) {
                await subscriptionService.updateStatus(subscriptionId, 'cancelled');
                await scheduleNotificationService.cancelAllForSubscription(subscriptionId);
              } else if (trialId) {
                await trialService.cancelTrial(trialId);
                await scheduleNotificationService.cancelTrialReminders(trialId);
              }

              Alert.alert('Cancelled', 'Subscription has been cancelled successfully.');
              
              // Navigate to subscriptions list
              (navigationRef.current?.navigate as any)('Subscriptions');
            } catch (error) {
              console.error('Failed to cancel:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            }
          },
        },
      ]
    );
  }

  /**
   * Handle keep subscription action
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleKeepSubscription(_data: any): Promise<void> {
    Alert.alert(
      'Great Choice!',
      'You\'ve decided to keep this subscription.',
      [{ text: 'OK' }]
    );
  }

  /**
   * Handle snooze notification
   */
  private async handleSnoozeNotification(
    notificationId: string,
    data: any,
    hours: number = 1
  ): Promise<void> {
    try {
      // Cancel current notification
      await notifee.cancelNotification(notificationId);

      // Schedule new one for later
      const newDate = new Date();
      newDate.setHours(newDate.getHours() + hours);

      await scheduleNotificationService.schedule({
        id: `${notificationId}_snoozed`,
        title: data.title,
        body: data.body,
        type: data.type,
        scheduledFor: newDate,
        data: { ...data, snoozed: true, originalId: notificationId },
        priority: 'normal',
      });

      Alert.alert('Snoozed', `You'll be reminded again in ${hours} hour${hours > 1 ? 's' : ''}.`);
    } catch (error) {
      console.error('Failed to snooze notification:', error);
    }
  }

  /**
   * Handle view details action
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleViewDetails(data: any): Promise<void> {
    if (data.subscriptionId) {
      (navigationRef.current?.navigate as any)('SubscriptionDetails', {
        subscriptionId: data.subscriptionId,
      });
    } else if (data.trialId) {
      (navigationRef.current?.navigate as any)('TrialDetails', {
        trialId: data.trialId,
      });
    } else if (data.categoryId) {
      (navigationRef.current?.navigate as any)('Budget', {
        categoryId: data.categoryId,
      });
    } else if (data.type?.includes('report')) {
      (navigationRef.current?.navigate as any)('Reports');
    }
  }

  /**
   * Handle adjust budget action
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleAdjustBudget(data: any): Promise<void> {
    (navigationRef.current?.navigate as any)('Budget', {
      categoryId: data.categoryId,
      adjust: true,
    });
  }

  /**
   * Handle share action
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleShare(_data: any): Promise<void> {
    // In a real app, implement sharing logic
    Alert.alert('Share', 'Sharing feature coming soon!');
  }

  /**
   * Handle ignore action
   */
  private async handleIgnore(data: any): Promise<void> {
    // Just dismiss - already handled by notifee
    console.log('Ignored:', data);
  }

  /**
   * Get all registered handlers
   */
  getHandlers(): Map<EventType, Array<(event: Event) => Promise<void>>> {
    return new Map(this.handlers);
  }

  /**
   * Clear all handlers
   */
  clearHandlers(): void {
    this.handlers.clear();
    this.registerDefaultHandlers();
  }

  /**
   * Simulate a notification press (for testing)
   */
  async simulatePress(notificationId: string): Promise<void> {
    const triggerNotifications = await notifee.getTriggerNotifications();
    const notification = triggerNotifications.find(
      (tn: any) => tn.notification.id === notificationId
    )?.notification;

    if (notification) {
      await this.handleNotificationPress({
        type: EventType.PRESS,
        detail: { notification },
      } as Event);
    }
  }

  /**
   * Simulate an action press (for testing)
   */
  async simulateAction(notificationId: string, actionId: string): Promise<void> {
    const triggerNotifications = await notifee.getTriggerNotifications();
    const notification = triggerNotifications.find(
      (tn: any) => tn.notification.id === notificationId
    )?.notification;

    if (notification) {
      await this.handleActionPress({
        type: EventType.ACTION_PRESS,
        detail: { notification, pressAction: { id: actionId } },
      } as Event);
    }
  }
}

export const notificationHandlers = NotificationHandlers.getInstance();
export default notificationHandlers;