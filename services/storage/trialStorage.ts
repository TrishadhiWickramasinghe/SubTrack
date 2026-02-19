import { MMKV } from 'react-native-mmkv';

const MMKV_INSTANCE = new MMKV({
  id: 'subtrack_trial_storage',
});

// Storage keys
const STORAGE_KEYS = {
  TRIALS: 'trials',
  TRIAL_INDEX: 'trial_index',
  TRIAL_HISTORY: 'trial_history',
  TRIAL_NOTIFICATIONS: 'trial_notifications',
  TRIAL_ANALYTICS: 'trial_analytics',
  TRIAL_RETENTION_OFFERS: 'trial_retention_offers',
  ACTIVE_TRIALS: 'active_trials',
  EXPIRED_TRIALS: 'expired_trials',
  CONVERTED_TRIALS: 'converted_trials',
};

// Default trial structure
const DEFAULT_TRIAL = {
  id: '',
  subscriptionId: '',
  subscriptionName: '',
  userId: '',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  totalDays: 30,
  type: 'free',
  status: 'active',
  endBehavior: 'auto_convert',
  trialPrice: 0,
  fullPrice: 0,
  currency: 'USD',
  isAutoRenewEnabled: true,
  hasPaymentMethod: false,
  engagementScore: 0,
  conversionLikelihood: 0,
  churnRiskScore: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Trial Storage Service
 * Handles all trial-related storage operations
 */
class TrialStorage {
  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize storage with default data if empty
   */
  initializeStorage() {
    try {
      const hasTrials = this.hasTrials();
      if (!hasTrials) {
        this.saveTrials([]);
        this.saveAnalytics({
          totalTrialsCreated: 0,
          totalConverted: 0,
          totalCancelled: 0,
          conversionRate: 0,
          averageEngagementScore: 0,
          averageConversionLikelihood: 0,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error initializing trial storage:', error);
    }
  }

  /**
   * Check if trials exist
   */
  hasTrials(): boolean {
    try {
      return MMKV_INSTANCE.contains(STORAGE_KEYS.TRIALS);
    } catch (error) {
      console.error('Error checking trials:', error);
      return false;
    }
  }

  /**
   * Get all trials
   */
  getAllTrials() {
    try {
      const trials = MMKV_INSTANCE.getString(STORAGE_KEYS.TRIALS);
      return trials ? JSON.parse(trials) : [];
    } catch (error) {
      console.error('Error getting all trials:', error);
      return [];
    }
  }

  /**
   * Get trial by ID
   */
  getTrialById(trialId: string) {
    try {
      const trials = this.getAllTrials();
      return trials.find((t: any) => t.id === trialId) || null;
    } catch (error) {
      console.error('Error getting trial by ID:', error);
      return null;
    }
  }

  /**
   * Get trials for subscription
   */
  getTrialsBySubscription(subscriptionId: string) {
    try {
      const trials = this.getAllTrials();
      return trials.filter((t: any) => t.subscriptionId === subscriptionId);
    } catch (error) {
      console.error('Error getting trials by subscription:', error);
      return [];
    }
  }

  /**
   * Get trials for user
   */
  getTrialsByUser(userId: string) {
    try {
      const trials = this.getAllTrials();
      return trials.filter((t: any) => t.userId === userId);
    } catch (error) {
      console.error('Error getting trials by user:', error);
      return [];
    }
  }

  /**
   * Get active trials
   */
  getActiveTrials() {
    try {
      const trials = this.getAllTrials();
      const now = new Date().getTime();
      return trials.filter((t: any) => {
        const endDate = new Date(t.endDate).getTime();
        return t.status === 'active' && endDate > now;
      });
    } catch (error) {
      console.error('Error getting active trials:', error);
      return [];
    }
  }

  /**
   * Get expired trials
   */
  getExpiredTrials() {
    try {
      const trials = this.getAllTrials();
      return trials.filter((t: any) => t.status === 'expired');
    } catch (error) {
      console.error('Error getting expired trials:', error);
      return [];
    }
  }

  /**
   * Get converted trials
   */
  getConvertedTrials() {
    try {
      const trials = this.getAllTrials();
      return trials.filter((t: any) => t.status === 'converted');
    } catch (error) {
      console.error('Error getting converted trials:', error);
      return [];
    }
  }

  /**
   * Get cancelled trials
   */
  getCancelledTrials() {
    try {
      const trials = this.getAllTrials();
      return trials.filter((t: any) => t.status === 'cancelled');
    } catch (error) {
      console.error('Error getting cancelled trials:', error);
      return [];
    }
  }

  /**
   * Get trials by status
   */
  getTrialsByStatus(status: string) {
    try {
      const trials = this.getAllTrials();
      return trials.filter((t: any) => t.status === status);
    } catch (error) {
      console.error('Error getting trials by status:', error);
      return [];
    }
  }

  /**
   * Get trials expiring soon (within days)
   */
  getTrialsExpiringSoon(days: number = 3) {
    try {
      const trials = this.getAllTrials();
      const now = new Date().getTime();
      const futureDate = now + days * 24 * 60 * 60 * 1000;

      return trials.filter((t: any) => {
        const endDate = new Date(t.endDate).getTime();
        return t.status === 'active' && endDate <= futureDate && endDate > now;
      });
    } catch (error) {
      console.error('Error getting trials expiring soon:', error);
      return [];
    }
  }

  /**
   * Get high-conversion-likelihood trials
   */
  getHighConversionLikelyhood(threshold: number = 70) {
    try {
      const trials = this.getAllTrials();
      return trials.filter((t: any) => t.conversionLikelihood >= threshold && t.status === 'active');
    } catch (error) {
      console.error('Error getting high conversion likelihood trials:', error);
      return [];
    }
  }

  /**
   * Get high-churn-risk trials
   */
  getHighChurnRiskTrials(threshold: number = 70) {
    try {
      const trials = this.getAllTrials();
      return trials.filter((t: any) => t.churnRiskScore >= threshold && t.status === 'active');
    } catch (error) {
      console.error('Error getting high churn risk trials:', error);
      return [];
    }
  }

  /**
   * Save trials
   */
  saveTrials(trials: any[]) {
    try {
      MMKV_INSTANCE.set(STORAGE_KEYS.TRIALS, JSON.stringify(trials));
      this.updateTrialIndex();
      return true;
    } catch (error) {
      console.error('Error saving trials:', error);
      return false;
    }
  }

  /**
   * Add a new trial
   */
  addTrial(trial: any) {
    try {
      const trials = this.getAllTrials();
      const newTrial = {
        ...DEFAULT_TRIAL,
        ...trial,
        id: trial.id || `trial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      trials.push(newTrial);
      this.saveTrials(trials);
      this.recordTrialCreation();
      return newTrial;
    } catch (error) {
      console.error('Error adding trial:', error);
      return null;
    }
  }

  /**
   * Update a trial
   */
  updateTrial(trialId: string, updates: any) {
    try {
      const trials = this.getAllTrials();
      const index = trials.findIndex((t: any) => t.id === trialId);
      if (index >= 0) {
        trials[index] = {
          ...trials[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.saveTrials(trials);
        return trials[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating trial:', error);
      return null;
    }
  }

  /**
   * Delete a trial
   */
  deleteTrial(trialId: string) {
    try {
      const trials = this.getAllTrials();
      const filtered = trials.filter((t: any) => t.id !== trialId);
      this.saveTrials(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting trial:', error);
      return false;
    }
  }

  /**
   * Convert trial to paid
   */
  convertTrialToPaid(trialId: string, paymentMethod: string, convertedPrice: number, tier: string = 'standard') {
    try {
      const trial = this.getTrialById(trialId);
      if (trial) {
        const updated = this.updateTrial(trialId, {
          status: 'converted',
          conversionDate: new Date().toISOString(),
          convertedToPrice: convertedPrice,
          convertedToTier: tier,
          conversionPaymentMethod: paymentMethod,
        });
        this.recordTrialConversion();
        return updated;
      }
      return null;
    } catch (error) {
      console.error('Error converting trial:', error);
      return null;
    }
  }

  /**
   * Cancel trial
   */
  cancelTrial(trialId: string, reason: string = '', refundAmount: number | null = null) {
    try {
      const trial = this.getTrialById(trialId);
      if (trial) {
        const updated = this.updateTrial(trialId, {
          status: 'cancelled',
          cancellationDate: new Date().toISOString(),
          cancellationReason: reason,
          cancellationRefundAmount: refundAmount,
        });
        this.recordTrialCancellation();
        return updated;
      }
      return null;
    } catch (error) {
      console.error('Error cancelling trial:', error);
      return null;
    }
  }

  /**
   * Expire trial
   */
  expireTrial(trialId: string) {
    try {
      const trial = this.getTrialById(trialId);
      if (trial && trial.status === 'active') {
        return this.updateTrial(trialId, {
          status: 'expired',
          updatedAt: new Date().toISOString(),
        });
      }
      return null;
    } catch (error) {
      console.error('Error expiring trial:', error);
      return null;
    }
  }

  /**
   * Record login for trial
   */
  recordTrialLogin(trialId: string) {
    try {
      const trial = this.getTrialById(trialId);
      if (trial) {
        const loginCount = (trial.loginCount || 0) + 1;
        return this.updateTrial(trialId, {
          loginCount,
          lastLoginDate: new Date().toISOString(),
        });
      }
      return null;
    } catch (error) {
      console.error('Error recording trial login:', error);
      return null;
    }
  }

  /**
   * Record action for trial
   */
  recordTrialAction(trialId: string, actionType: string = 'general') {
    try {
      const trial = this.getTrialById(trialId);
      if (trial) {
        const actionCount = (trial.actionCount || 0) + 1;
        const featureUsage = trial.featureUsage || [];
        const existingUsage = featureUsage.find((u: any) => u.feature === actionType);

        if (existingUsage) {
          existingUsage.count++;
          existingUsage.lastUsed = new Date().toISOString();
        } else {
          featureUsage.push({
            feature: actionType,
            count: 1,
            firstUsed: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
          });
        }

        return this.updateTrial(trialId, {
          actionCount,
          lastActionDate: new Date().toISOString(),
          featureUsage,
        });
      }
      return null;
    } catch (error) {
      console.error('Error recording trial action:', error);
      return null;
    }
  }

  /**
   * Record notification for trial
   */
  recordNotification(trialId: string, notificationType: string, message: string) {
    try {
      const notifications = this.getNotifications();
      notifications.push({
        trialId,
        type: notificationType,
        message,
        sentAt: new Date().toISOString(),
      });
      MMKV_INSTANCE.set(STORAGE_KEYS.TRIAL_NOTIFICATIONS, JSON.stringify(notifications));
      return true;
    } catch (error) {
      console.error('Error recording notification:', error);
      return false;
    }
  }

  /**
   * Get notifications
   */
  getNotifications() {
    try {
      const notifications = MMKV_INSTANCE.getString(STORAGE_KEYS.TRIAL_NOTIFICATIONS);
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Get notifications for trial
   */
  getNotificationsForTrial(trialId: string) {
    try {
      const notifications = this.getNotifications();
      return notifications.filter((n: any) => n.trialId === trialId);
    } catch (error) {
      console.error('Error getting notifications for trial:', error);
      return [];
    }
  }

  /**
   * Clear notifications for trial
   */
  clearNotificationsForTrial(trialId: string) {
    try {
      const notifications = this.getNotifications();
      const filtered = notifications.filter((n: any) => n.trialId !== trialId);
      MMKV_INSTANCE.set(STORAGE_KEYS.TRIAL_NOTIFICATIONS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return false;
    }
  }

  /**
   * Update trial index for faster lookups
   */
  private updateTrialIndex() {
    try {
      const trials = this.getAllTrials();
      const index: any = {};

      trials.forEach((trial: any) => {
        if (!index[trial.subscriptionId]) {
          index[trial.subscriptionId] = [];
        }
        index[trial.subscriptionId].push(trial.id);

        if (!index[trial.userId]) {
          index[trial.userId] = [];
        }
        if (!index[trial.userId].includes(trial.id)) {
          index[trial.userId].push(trial.id);
        }
      });

      MMKV_INSTANCE.set(STORAGE_KEYS.TRIAL_INDEX, JSON.stringify(index));
    } catch (error) {
      console.error('Error updating trial index:', error);
    }
  }

  /**
   * Record trial creation for analytics
   */
  private recordTrialCreation() {
    try {
      const analytics = this.getAnalytics();
      analytics.totalTrialsCreated = (analytics.totalTrialsCreated || 0) + 1;
      analytics.lastUpdated = new Date().toISOString();
      this.saveAnalytics(analytics);
    } catch (error) {
      console.error('Error recording trial creation:', error);
    }
  }

  /**
   * Record trial conversion for analytics
   */
  private recordTrialConversion() {
    try {
      const analytics = this.getAnalytics();
      analytics.totalConverted = (analytics.totalConverted || 0) + 1;
      analytics.lastUpdated = new Date().toISOString();
      this.updateConversionRate(analytics);
      this.saveAnalytics(analytics);
    } catch (error) {
      console.error('Error recording trial conversion:', error);
    }
  }

  /**
   * Record trial cancellation for analytics
   */
  private recordTrialCancellation() {
    try {
      const analytics = this.getAnalytics();
      analytics.totalCancelled = (analytics.totalCancelled || 0) + 1;
      analytics.lastUpdated = new Date().toISOString();
      this.updateConversionRate(analytics);
      this.saveAnalytics(analytics);
    } catch (error) {
      console.error('Error recording trial cancellation:', error);
    }
  }

  /**
   * Update conversion rate
   */
  private updateConversionRate(analytics: any) {
    if (analytics.totalTrialsCreated > 0) {
      analytics.conversionRate = Math.round(
        (analytics.totalConverted / analytics.totalTrialsCreated) * 100
      );
    }
  }

  /**
   * Get analytics
   */
  getAnalytics() {
    try {
      const analytics = MMKV_INSTANCE.getString(STORAGE_KEYS.TRIAL_ANALYTICS);
      return analytics
        ? JSON.parse(analytics)
        : {
            totalTrialsCreated: 0,
            totalConverted: 0,
            totalCancelled: 0,
            conversionRate: 0,
            averageEngagementScore: 0,
            averageConversionLikelihood: 0,
            lastUpdated: new Date().toISOString(),
          };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {};
    }
  }

  /**
   * Save analytics
   */
  saveAnalytics(analytics: any) {
    try {
      MMKV_INSTANCE.set(STORAGE_KEYS.TRIAL_ANALYTICS, JSON.stringify(analytics));
      return true;
    } catch (error) {
      console.error('Error saving analytics:', error);
      return false;
    }
  }

  /**
   * Update analytics scores
   */
  updateAnalyticsScores() {
    try {
      const trials = this.getAllTrials();
      if (trials.length === 0) return;

      const analytics = this.getAnalytics();

      // Calculate average engagement score
      const totalEngagement = trials.reduce((sum: number, t: any) => sum + (t.engagementScore || 0), 0);
      analytics.averageEngagementScore = Math.round(totalEngagement / trials.length);

      // Calculate average conversion likelihood
      const totalLikelihood = trials.reduce((sum: number, t: any) => sum + (t.conversionLikelihood || 0), 0);
      analytics.averageConversionLikelihood = Math.round(totalLikelihood / trials.length);

      analytics.lastUpdated = new Date().toISOString();
      this.saveAnalytics(analytics);
    } catch (error) {
      console.error('Error updating analytics scores:', error);
    }
  }

  /**
   * Add retention offer
   */
  addRetentionOffer(trialId: string, offer: any) {
    try {
      const offers = this.getRetentionOffers();
      const newOffer = {
        ...offer,
        trialId,
        id: offer.id || `offer_${Date.now()}`,
        createdAt: new Date().toISOString(),
        accepted: false,
      };
      offers.push(newOffer);
      MMKV_INSTANCE.set(STORAGE_KEYS.TRIAL_RETENTION_OFFERS, JSON.stringify(offers));

      // Update trial with offer information
      const trial = this.getTrialById(trialId);
      if (trial) {
        const retentionOffers = trial.retentionOffers || [];
        retentionOffers.push(newOffer);
        this.updateTrial(trialId, {
          retentionOffers,
          retentionAttemptCount: (trial.retentionAttemptCount || 0) + 1,
        });
      }

      return newOffer;
    } catch (error) {
      console.error('Error adding retention offer:', error);
      return null;
    }
  }

  /**
   * Get retention offers
   */
  getRetentionOffers() {
    try {
      const offers = MMKV_INSTANCE.getString(STORAGE_KEYS.TRIAL_RETENTION_OFFERS);
      return offers ? JSON.parse(offers) : [];
    } catch (error) {
      console.error('Error getting retention offers:', error);
      return [];
    }
  }

  /**
   * Accept retention offer
   */
  acceptRetentionOffer(offerId: string) {
    try {
      const offers = this.getRetentionOffers();
      const offer = offers.find((o: any) => o.id === offerId);
      if (offer) {
        offer.accepted = true;
        offer.acceptedAt = new Date().toISOString();
        MMKV_INSTANCE.set(STORAGE_KEYS.TRIAL_RETENTION_OFFERS, JSON.stringify(offers));
        return offer;
      }
      return null;
    } catch (error) {
      console.error('Error accepting retention offer:', error);
      return null;
    }
  }

  /**
   * Get stats for trials
   */
  getTrialStats() {
    try {
      const allTrials = this.getAllTrials();
      const activeTrials = this.getActiveTrials();
      const convertedTrials = this.getConvertedTrials();
      const cancelledTrials = this.getCancelledTrials();
      const expiredTrials = this.getExpiredTrials();

      return {
        total: allTrials.length,
        active: activeTrials.length,
        converted: convertedTrials.length,
        cancelled: cancelledTrials.length,
        expired: expiredTrials.length,
        conversionRate: convertedTrials.length > 0 ? Math.round((convertedTrials.length / allTrials.length) * 100) : 0,
      };
    } catch (error) {
      console.error('Error getting trial stats:', error);
      return {
        total: 0,
        active: 0,
        converted: 0,
        cancelled: 0,
        expired: 0,
        conversionRate: 0,
      };
    }
  }

  /**
   * Clear all data (for testing/reset)
   */
  clearAllData() {
    try {
      MMKV_INSTANCE.delete(STORAGE_KEYS.TRIALS);
      MMKV_INSTANCE.delete(STORAGE_KEYS.TRIAL_INDEX);
      MMKV_INSTANCE.delete(STORAGE_KEYS.TRIAL_HISTORY);
      MMKV_INSTANCE.delete(STORAGE_KEYS.TRIAL_NOTIFICATIONS);
      MMKV_INSTANCE.delete(STORAGE_KEYS.TRIAL_ANALYTICS);
      MMKV_INSTANCE.delete(STORAGE_KEYS.TRIAL_RETENTION_OFFERS);
      MMKV_INSTANCE.delete(STORAGE_KEYS.ACTIVE_TRIALS);
      MMKV_INSTANCE.delete(STORAGE_KEYS.EXPIRED_TRIALS);
      MMKV_INSTANCE.delete(STORAGE_KEYS.CONVERTED_TRIALS);
      return true;
    } catch (error) {
      console.error('Error clearing trial data:', error);
      return false;
    }
  }
}

// Create singleton instance
const trialStorage = new TrialStorage();

export default trialStorage;
