// Mock notifee object - actual implementation commented out due to optional dependency
// import notifee from '@notifee/react-native';

interface TriggerNotification {
  notification: {
    id?: string;
    title?: string;
    body?: string;
    data?: Record<string, any>;
    android?: {
      channelId?: string;
    };
  };
  trigger: {
    timestamp?: number;
  };
}

const notifee = {
  cancelNotification: async (_id: string) => {},
  cancelTriggerNotifications: async (_notifications: any[]) => {},
  getTriggerNotifications: async (): Promise<TriggerNotification[]> => [],
  cancelAllNotifications: async () => {},
};

export interface CancelOptions {
  id?: string;
  type?: 'payment' | 'trial' | 'budget' | 'report' | 'achievement' | 'all';
  subscriptionId?: string;
  trialId?: string;
  category?: string;
  beforeDate?: Date;
  afterDate?: Date;
}

class CancelNotificationService {
  private static instance: CancelNotificationService;

  private constructor() {}

  static getInstance(): CancelNotificationService {
    if (!CancelNotificationService.instance) {
      CancelNotificationService.instance = new CancelNotificationService();
    }
    return CancelNotificationService.instance;
  }

  /**
   * Cancel a single notification by ID
   */
  async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      await notifee.cancelNotification(notificationId);
      return true;
    } catch (error) {
      console.error(`Failed to cancel notification ${notificationId}:`, error);
      return false;
    }
  }

  /**
   * Cancel multiple notifications by IDs
   */
  async cancelNotifications(notificationIds: string[]): Promise<{
    success: string[];
    failed: string[];
  }> {
    const results = {
      success: [] as string[],
      failed: [] as string[],
    };

    await Promise.all(
      notificationIds.map(async (id) => {
        const success = await this.cancelNotification(id);
        if (success) {
          results.success.push(id);
        } else {
          results.failed.push(id);
        }
      })
    );

    return results;
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<boolean> {
    try {
      await notifee.cancelAllNotifications();
      return true;
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
      return false;
    }
  }

  /**
   * Cancel all trigger (scheduled) notifications
   */
  async cancelAllTriggerNotifications(): Promise<boolean> {
    try {
      await notifee.cancelTriggerNotifications(await notifee.getTriggerNotifications());
      return true;
    } catch (error) {
      console.error('Failed to cancel all trigger notifications:', error);
      return false;
    }
  }

  /**
   * Cancel notifications by type
   */
  async cancelNotificationsByType(type: string): Promise<number> {
    try {
      const triggerNotifications = await notifee.getTriggerNotifications();
      const toCancel = triggerNotifications.filter(
        (tn: TriggerNotification) => tn.notification.data?.type === type
      );

      await notifee.cancelTriggerNotifications(toCancel);
      return toCancel.length;
    } catch (error) {
      console.error(`Failed to cancel notifications of type ${type}:`, error);
      return 0;
    }
  }

  /**
   * Cancel payment reminders for a subscription
   */
  async cancelPaymentReminders(
    subscriptionId: string,
    options?: {
      daysBefore?: number[];
      keepToday?: boolean;
    }
  ): Promise<number> {
    try {
      const triggerNotifications = await notifee.getTriggerNotifications();
      
      const toCancel = triggerNotifications.filter((tn: TriggerNotification) => {
        const data = tn.notification.data;
        if (!data || data.subscriptionId !== subscriptionId) return false;
        
        // Filter by notification type
        if (data.type !== 'payment_due' && data.type !== 'payment_overdue') {
          return false;
        }

        // Filter by days before if specified
        if (options?.daysBefore && data.daysBefore !== undefined) {
          if (!options.daysBefore.includes(data.daysBefore)) {
            return false;
          }
        }

        // Keep today's reminder if specified
        if (options?.keepToday && data.daysBefore === 0) {
          return false;
        }

        return true;
      });

      await notifee.cancelTriggerNotifications(toCancel);
      return toCancel.length;
    } catch (error) {
      console.error(`Failed to cancel payment reminders for subscription ${subscriptionId}:`, error);
      return 0;
    }
  }

  /**
   * Cancel trial reminders for a trial
   */
  async cancelTrialReminders(trialId: string): Promise<number> {
    try {
      const triggerNotifications = await notifee.getTriggerNotifications();
      
      const toCancel = triggerNotifications.filter(tn => {
        const data = tn.notification.data;
        return data?.trialId === trialId && data?.type === 'trial_ending';
      });

      await notifee.cancelTriggerNotifications(toCancel);
      return toCancel.length;
    } catch (error) {
      console.error(`Failed to cancel trial reminders for trial ${trialId}:`, error);
      return 0;
    }
  }

  /**
   * Cancel budget alerts for a category
   */
  async cancelBudgetAlerts(categoryId: string): Promise<number> {
    try {
      const triggerNotifications = await notifee.getTriggerNotifications();
      
      const toCancel = triggerNotifications.filter(tn => {
        const data = tn.notification.data;
        return data?.categoryId === categoryId && data?.type === 'budget_alert';
      });

      await notifee.cancelTriggerNotifications(toCancel);
      return toCancel.length;
    } catch (error) {
      console.error(`Failed to cancel budget alerts for category ${categoryId}:`, error);
      return 0;
    }
  }

  /**
   * Cancel all notifications for a subscription
   */
  async cancelAllForSubscription(subscriptionId: string): Promise<number> {
    try {
      const triggerNotifications = await notifee.getTriggerNotifications();
      
      const toCancel = triggerNotifications.filter(tn => {
        const data = tn.notification.data;
        return data?.subscriptionId === subscriptionId;
      });

      await notifee.cancelTriggerNotifications(toCancel);
      return toCancel.length;
    } catch (error) {
      console.error(`Failed to cancel all notifications for subscription ${subscriptionId}:`, error);
      return 0;
    }
  }

  /**
   * Cancel all notifications for a trial
   */
  async cancelAllForTrial(trialId: string): Promise<number> {
    try {
      const triggerNotifications = await notifee.getTriggerNotifications();
      
      const toCancel = triggerNotifications.filter(tn => {
        const data = tn.notification.data;
        return data?.trialId === trialId;
      });

      await notifee.cancelTriggerNotifications(toCancel);
      return toCancel.length;
    } catch (error) {
      console.error(`Failed to cancel all notifications for trial ${trialId}:`, error);
      return 0;
    }
  }

  /**
   * Cancel notifications by channel
   */
  async cancelByChannel(channelId: string): Promise<number> {
    try {
      const triggerNotifications = await notifee.getTriggerNotifications();
      
      const toCancel = triggerNotifications.filter(tn => {
        return tn.notification.android?.channelId === channelId;
      });

      await notifee.cancelTriggerNotifications(toCancel);
      return toCancel.length;
    } catch (error) {
      console.error(`Failed to cancel notifications for channel ${channelId}:`, error);
      return 0;
    }
  }

  /**
   * Cancel notifications before a certain date
   */
  async cancelBeforeDate(date: Date): Promise<number> {
    try {
      const triggerNotifications = await notifee.getTriggerNotifications();
      
      const toCancel = triggerNotifications.filter((tn: TriggerNotification) => {
        return tn.trigger.timestamp && tn.trigger.timestamp < date.getTime();
      });

      await notifee.cancelTriggerNotifications(toCancel);
      return toCancel.length;
    } catch (error) {
      console.error(`Failed to cancel notifications before ${date}:`, error);
      return 0;
    }
  }

  /**
   * Cancel notifications after a certain date
   */
  async cancelAfterDate(date: Date): Promise<number> {
    try {
      const triggerNotifications = await notifee.getTriggerNotifications();
      
      const toCancel = triggerNotifications.filter((tn: TriggerNotification) => {
        return tn.trigger.timestamp && tn.trigger.timestamp > date.getTime();
      });

      await notifee.cancelTriggerNotifications(toCancel);
      return toCancel.length;
    } catch (error) {
      console.error(`Failed to cancel notifications after ${date}:`, error);
      return 0;
    }
  }

  /**
   * Cancel duplicate notifications
   */
  async cancelDuplicates(): Promise<number> {
    try {
      const triggerNotifications = await notifee.getTriggerNotifications();
      const seen = new Set<string>();
      const duplicates: typeof triggerNotifications = [];

      // Find duplicates (same title, body, and scheduled time)
      for (const tn of triggerNotifications) {
        const key = `${tn.notification.title}_${tn.notification.body}_${tn.trigger.timestamp}`;
        if (seen.has(key)) {
          duplicates.push(tn);
        } else {
          seen.add(key);
        }
      }

      await notifee.cancelTriggerNotifications(duplicates);
      return duplicates.length;
    } catch (error) {
      console.error('Failed to cancel duplicate notifications:', error);
      return 0;
    }
  }

  /**
   * Cancel expired notifications
   */
  async cancelExpired(): Promise<number> {
    try {
      const now = Date.now();
      const triggerNotifications = await notifee.getTriggerNotifications();
      
      const expired = triggerNotifications.filter((tn: TriggerNotification) => {
        return tn.trigger.timestamp && tn.trigger.timestamp < now;
      });

      await notifee.cancelTriggerNotifications(expired);
      return expired.length;
    } catch (error) {
      console.error('Failed to cancel expired notifications:', error);
      return 0;
    }
  }

  /**
   * Cancel notifications with options
   */
  async cancelWithOptions(options: CancelOptions): Promise<{
    count: number;
    ids: string[];
  }> {
    try {
      let toCancel: any[] = [];
      const triggerNotifications = await notifee.getTriggerNotifications();

      if (options.id) {
        // Cancel by specific ID
        await this.cancelNotification(options.id);
        return { count: 1, ids: [options.id] };
      }

      if (options.type === 'all') {
        // Cancel all
        await this.cancelAllNotifications();
        return { count: triggerNotifications.length, ids: triggerNotifications.map((tn: TriggerNotification) => tn.notification.id || '') };
      }

      // Filter based on criteria
      toCancel = triggerNotifications.filter((tn: TriggerNotification) => {
        const data = tn.notification.data;
        let matches = true;

        if (options.type) {
          matches = matches && data?.type === options.type;
        }

        if (options.subscriptionId) {
          matches = matches && data?.subscriptionId === options.subscriptionId;
        }

        if (options.trialId) {
          matches = matches && data?.trialId === options.trialId;
        }

        if (options.category) {
          matches = matches && tn.notification.android?.channelId === options.category;
        }

        if (options.beforeDate) {
          matches = matches && !!(tn.trigger.timestamp && tn.trigger.timestamp < options.beforeDate.getTime());
        }

        if (options.afterDate) {
          matches = matches && !!(tn.trigger.timestamp && tn.trigger.timestamp > options.afterDate.getTime());
        }

        return matches;
      });

      await notifee.cancelTriggerNotifications(toCancel);
      
      return {
        count: toCancel.length,
        ids: toCancel.map(tn => tn.notification.id || ''),
      };
    } catch (error) {
      console.error('Failed to cancel notifications with options:', error);
      return { count: 0, ids: [] };
    }
  }

  /**
   * Cancel and reschedule notifications
   */
  async cancelAndReschedule<T>(
    notificationIds: string[],
    rescheduleFn: () => Promise<T[]>
  ): Promise<{
    cancelled: number;
    rescheduled: T[];
  }> {
    try {
      // Cancel existing
      const cancelResult = await this.cancelNotifications(notificationIds);
      
      // Reschedule
      const rescheduled = await rescheduleFn();

      return {
        cancelled: cancelResult.success.length,
        rescheduled,
      };
    } catch (error) {
      console.error('Failed to cancel and reschedule notifications:', error);
      return { cancelled: 0, rescheduled: [] };
    }
  }

  /**
   * Cancel all pending reminders for a user
   */
  async cancelAllUserReminders(userId: string): Promise<number> {
    try {
      const triggerNotifications = await notifee.getTriggerNotifications();
      
      const toCancel = triggerNotifications.filter((tn: TriggerNotification) => {
        const data = tn.notification.data;
        return data?.userId === userId;
      });

      await notifee.cancelTriggerNotifications(toCancel);
      return toCancel.length;
    } catch (error) {
      console.error(`Failed to cancel all reminders for user ${userId}:`, error);
      return 0;
    }
  }
}

export const cancelNotificationService = CancelNotificationService.getInstance();
export default cancelNotificationService;