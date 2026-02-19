/**
 * Trial Model
 * For managing subscription trial periods
 */

import { v4 as uuidv4 } from 'uuid';

// Trial statuses
export const TrialStatus = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CONVERTED: 'converted',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
};

// Trial types
export const TrialType = {
  FREE: 'free', // Free trial period
  FREEMIUM: 'freemium', // Limited free version
  PAID_TRIAL: 'paid_trial', // Paid trial at discounted rate
  MONEY_BACK: 'money_back', // Full refund if cancelled
  CREDIT: 'credit', // Credit towards subscription
};

// Trial end behaviors
export const TrialEndBehavior = {
  AUTO_CONVERT: 'auto_convert', // Automatically convert to paid
  AUTO_CANCEL: 'auto_cancel', // Automatically cancel
  MANUAL: 'manual', // Require manual action
  REMINDER: 'reminder', // Send reminder, no auto action
};

// Trial notification types
export const TrialNotificationType = {
  START: 'start',
  HALFWAY: 'halfway',
  REMINDER: 'reminder',
  EXPIRING_SOON: 'expiring_soon',
  EXPIRED: 'expired',
  CONVERTED: 'converted',
};

/**
 * Trial class representing a subscription trial period
 */
export default class Trial {
  // Core identification
  id: string;
  createdAt: string;
  updatedAt: string;

  // Subscription reference
  subscriptionId: string;
  subscriptionName: string;
  userId: string;

  // Trial dates
  startDate: string;
  endDate: string;
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;

  // Trial details
  type: string;
  status: string;
  endBehavior: string;
  isAutoRenewEnabled: boolean;

  // Trial pricing
  trialPrice: number;
  fullPrice: number;
  currency: string;
  discountPercentage: number;
  trialTotalAmount: number;

  // Trial plan details
  planName: string;
  planFeatures: any[];
  limitations: any[]; // Features not available in trial
  accessLevel: string; // free, basic, standard, premium, etc.

  // Credit and promotional terms
  creditAmount: number;
  creditExpiresAt: string | null;
  promoCode: string;
  promoDescription: string;
  promoTerms: string;

  // Conversion details
  conversionDate: string | null;
  convertedToPrice: number | null;
  convertedToTier: string;
  conversionPaymentMethod: string | null;
  conversionNotes: string;

  // Cancellation details
  cancellationDate: string | null;
  cancellationReason: string;
  cancellationRefundAmount: number | null;
  cancellationRefundDate: string | null;
  cancellationNotes: string;

  // Trial restrictions
  maxDownloads: number | null;
  maxUsers: number | null;
  maxProjects: number | null;
  storageLimit: number | null; // In MB
  apiCallLimit: number | null;
  otherLimitations: any[];

  // Usage tracking
  featureUsage: any[];
  loginCount: number;
  lastLoginDate: string | null;
  actionCount: number;
  lastActionDate: string | null;
  engagementScore: number; // 0-100

  // Notifications
  notificationsSent: any[];
  startNotificationSent: boolean;
  reminderNotificationSent: boolean;
  expiryNotificationSent: boolean;
  conversionNotificationSent: boolean;
  cancelNotificationSent: boolean;

  // Engagement signals
  hasDownloadedResources: boolean;
  hasInvitedUsers: boolean;
  hasCompletedOnboarding: boolean;
  hasUsedPremiumFeatures: boolean;
  viewedUpgradeModal: boolean;
  viewedUpgradeModalCount: number;
  clickedUpgradeButton: boolean;

  // Connection to payment
  reservedPaymentMethod: string | null; // Payment method to use if auto-converting
  paymentMethodFilled: boolean;
  requiresPaymentMethodBeforeExpiry: boolean;
  paymentMethodAddedDate: string | null;

  // Analytics
  sourceChannel: string; // organic, paid_ad, referral, newsletter, etc.
  conversionLikelihood: number; // 0-100 based on usage
  churnRiskScore: number; // 0-100 (100 = high risk)
  notes: string;
  internNotes: string; // Internal notes not visible to user
  tags: string[];

  // Retention attempts
  retentionOffers: any[];
  discountOfferedBeforeExpiry: boolean;
  discountOfferedDate: string | null;
  discountAccepted: boolean;
  retentionAttemptCount: number;

  // Metadata
  version: number;
  isDeleted: boolean;
  deletedAt: string | null;
  syncStatus: string; // synced, pending, error
  source: string; // direct, import, api, etc.

  constructor(data: any = {}) {
    // Core identification
    this.id = data.id || uuidv4();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();

    // Subscription reference
    this.subscriptionId = data.subscriptionId || '';
    this.subscriptionName = data.subscriptionName || '';
    this.userId = data.userId || '';

    // Trial dates
    this.startDate = data.startDate || new Date().toISOString();
    this.endDate = data.endDate || this.calculateEndDate(data.totalDays || 30);
    this.totalDays = data.totalDays || 30;
    this.daysRemaining = this.calculateDaysRemaining();
    this.daysElapsed = this.calculateDaysElapsed();

    // Trial details
    this.type = data.type || TrialType.FREE;
    this.status = data.status || TrialStatus.ACTIVE;
    this.endBehavior = data.endBehavior || TrialEndBehavior.AUTO_CONVERT;
    this.isAutoRenewEnabled = data.isAutoRenewEnabled !== undefined ? data.isAutoRenewEnabled : true;

    // Trial pricing
    this.trialPrice = data.trialPrice || 0;
    this.fullPrice = data.fullPrice || 0;
    this.currency = data.currency || 'USD';
    this.discountPercentage = this.calculateDiscountPercentage();
    this.trialTotalAmount = data.trialTotalAmount || this.calculateTrialTotalAmount();

    // Trial plan details
    this.planName = data.planName || 'Trial Plan';
    this.planFeatures = data.planFeatures || [];
    this.limitations = data.limitations || [];
    this.accessLevel = data.accessLevel || 'basic';

    // Credit and promotional terms
    this.creditAmount = data.creditAmount || 0;
    this.creditExpiresAt = data.creditExpiresAt || null;
    this.promoCode = data.promoCode || '';
    this.promoDescription = data.promoDescription || '';
    this.promoTerms = data.promoTerms || '';

    // Conversion details
    this.conversionDate = data.conversionDate || null;
    this.convertedToPrice = data.convertedToPrice || null;
    this.convertedToTier = data.convertedToTier || '';
    this.conversionPaymentMethod = data.conversionPaymentMethod || null;
    this.conversionNotes = data.conversionNotes || '';

    // Cancellation details
    this.cancellationDate = data.cancellationDate || null;
    this.cancellationReason = data.cancellationReason || '';
    this.cancellationRefundAmount = data.cancellationRefundAmount || null;
    this.cancellationRefundDate = data.cancellationRefundDate || null;
    this.cancellationNotes = data.cancellationNotes || '';

    // Trial restrictions
    this.maxDownloads = data.maxDownloads || null;
    this.maxUsers = data.maxUsers || null;
    this.maxProjects = data.maxProjects || null;
    this.storageLimit = data.storageLimit || null;
    this.apiCallLimit = data.apiCallLimit || null;
    this.otherLimitations = data.otherLimitations || [];

    // Usage tracking
    this.featureUsage = data.featureUsage || [];
    this.loginCount = data.loginCount || 0;
    this.lastLoginDate = data.lastLoginDate || null;
    this.actionCount = data.actionCount || 0;
    this.lastActionDate = data.lastActionDate || null;
    this.engagementScore = data.engagementScore || this.calculateEngagementScore();

    // Notifications
    this.notificationsSent = data.notificationsSent || [];
    this.startNotificationSent = data.startNotificationSent || false;
    this.reminderNotificationSent = data.reminderNotificationSent || false;
    this.expiryNotificationSent = data.expiryNotificationSent || false;
    this.conversionNotificationSent = data.conversionNotificationSent || false;
    this.cancelNotificationSent = data.cancelNotificationSent || false;

    // Engagement signals
    this.hasDownloadedResources = data.hasDownloadedResources || false;
    this.hasInvitedUsers = data.hasInvitedUsers || false;
    this.hasCompletedOnboarding = data.hasCompletedOnboarding || false;
    this.hasUsedPremiumFeatures = data.hasUsedPremiumFeatures || false;
    this.viewedUpgradeModal = data.viewedUpgradeModal || false;
    this.viewedUpgradeModalCount = data.viewedUpgradeModalCount || 0;
    this.clickedUpgradeButton = data.clickedUpgradeButton || false;

    // Connection to payment
    this.reservedPaymentMethod = data.reservedPaymentMethod || null;
    this.paymentMethodFilled = data.paymentMethodFilled || false;
    this.requiresPaymentMethodBeforeExpiry = data.requiresPaymentMethodBeforeExpiry || true;
    this.paymentMethodAddedDate = data.paymentMethodAddedDate || null;

    // Analytics
    this.sourceChannel = data.sourceChannel || 'organic';
    this.conversionLikelihood = data.conversionLikelihood || this.calculateConversionLikelihood();
    this.churnRiskScore = data.churnRiskScore || this.calculateChurnRiskScore();
    this.notes = data.notes || '';
    this.internNotes = data.internNotes || '';
    this.tags = data.tags || [];

    // Retention attempts
    this.retentionOffers = data.retentionOffers || [];
    this.discountOfferedBeforeExpiry = data.discountOfferedBeforeExpiry || false;
    this.discountOfferedDate = data.discountOfferedDate || null;
    this.discountAccepted = data.discountAccepted || false;
    this.retentionAttemptCount = data.retentionAttemptCount || 0;

    // Metadata
    this.version = data.version || 1;
    this.isDeleted = data.isDeleted || false;
    this.deletedAt = data.deletedAt || null;
    this.syncStatus = data.syncStatus || 'synced';
    this.source = data.source || 'direct';
  }

  /**
   * Calculate end date based on trial days
   */
  private calculateEndDate(days: number): string {
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + days);
    return endDate.toISOString();
  }

  /**
   * Calculate days remaining
   */
  calculateDaysRemaining(): number {
    const today = new Date();
    const endDate = new Date(this.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Calculate days elapsed
   */
  calculateDaysElapsed(): number {
    const today = new Date();
    const startDate = new Date(this.startDate);
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Check if trial is active
   */
  isActive(): boolean {
    return this.status === TrialStatus.ACTIVE && this.daysRemaining > 0;
  }

  /**
   * Check if trial has expired
   */
  isExpired(): boolean {
    return this.daysRemaining <= 0 && this.status !== TrialStatus.CONVERTED;
  }

  /**
   * Check if trial is expiring soon (within days)
   */
  isExpiringSoon(days: number = 3): boolean {
    return this.isActive() && this.daysRemaining <= days;
  }

  /**
   * Calculate discount percentage
   */
  private calculateDiscountPercentage(): number {
    if (this.fullPrice === 0) return 0;
    return Math.round(((this.fullPrice - this.trialPrice) / this.fullPrice) * 100);
  }

  /**
   * Calculate trial total amount
   */
  private calculateTrialTotalAmount(): number {
    if (this.type === TrialType.FREE || this.type === TrialType.FREEMIUM) {
      return 0;
    }
    return this.trialPrice;
  }

  /**
   * Calculate engagement score based on usage
   */
  private calculateEngagementScore(): number {
    let score = 0;

    // Login frequency (max 25 points)
    if (this.loginCount >= 10) score += 25;
    else if (this.loginCount >= 5) score += 15;
    else if (this.loginCount >= 1) score += 5;

    // Action frequency (max 25 points)
    if (this.actionCount >= 50) score += 25;
    else if (this.actionCount >= 20) score += 15;
    else if (this.actionCount >= 5) score += 5;

    // Completion signals (max 50 points)
    if (this.hasCompletedOnboarding) score += 15;
    if (this.hasUsedPremiumFeatures) score += 20;
    if (this.hasInvitedUsers) score += 10;
    if (this.hasDownloadedResources) score += 5;

    return Math.min(100, score);
  }

  /**
   * Calculate conversion likelihood
   */
  private calculateConversionLikelihood(): number {
    let likelihood = 0;

    // High engagement = high conversion likelihood
    likelihood += (this.engagementScore / 100) * 40;

    // Payment method added = higher likelihood
    if (this.paymentMethodFilled) likelihood += 25;

    // Premium feature usage = higher likelihood
    if (this.hasUsedPremiumFeatures) likelihood += 20;

    // Days remaining (still in trial = higher likelihood)
    if (this.daysRemaining > 5) likelihood += 15;

    return Math.min(100, Math.round(likelihood));
  }

  /**
   * Calculate churn risk score
   */
  private calculateChurnRiskScore(): number {
    let risk = 0;

    // Low engagement = high risk
    risk += (100 - this.engagementScore) * 0.4;

    // No payment method = higher risk
    if (!this.paymentMethodFilled) risk += 30;

    // Few logins = higher risk
    if (this.loginCount < 2) risk += 25;

    // Trial expiring soon = higher risk
    if (this.daysRemaining <= 2 && this.status === TrialStatus.ACTIVE) risk += 20;

    return Math.min(100, Math.round(risk));
  }

  /**
   * Convert trial to paid subscription
   */
  convertToPaid(
    paymentMethod: string,
    convertedPrice: number,
    tier: string = 'standard'
  ): void {
    this.status = TrialStatus.CONVERTED;
    this.conversionDate = new Date().toISOString();
    this.convertedToPrice = convertedPrice;
    this.convertedToTier = tier;
    this.conversionPaymentMethod = paymentMethod;
    this.conversionNotificationSent = false;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Cancel trial
   */
  cancelTrial(reason: string = '', refundAmount: number | null = null): void {
    this.status = TrialStatus.CANCELLED;
    this.cancellationDate = new Date().toISOString();
    this.cancellationReason = reason;
    this.cancellationRefundAmount = refundAmount;
    this.cancelNotificationSent = false;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Expire trial
   */
  expireTrial(): void {
    if (this.status === TrialStatus.ACTIVE) {
      this.status = TrialStatus.EXPIRED;
      this.updatedAt = new Date().toISOString();

      // Auto cancel if configured
      if (this.endBehavior === TrialEndBehavior.AUTO_CANCEL) {
        this.cancelTrial('Trial period expired', 0);
      }
    }
  }

  /**
   * Record login
   */
  recordLogin(): void {
    this.loginCount++;
    this.lastLoginDate = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Record action/activity
   */
  recordAction(actionType: string = 'general'): void {
    this.actionCount++;
    this.lastActionDate = new Date().toISOString();

    // Track feature usage
    const existingUsage = this.featureUsage.find(u => u.feature === actionType);
    if (existingUsage) {
      existingUsage.count++;
      existingUsage.lastUsed = new Date().toISOString();
    } else {
      this.featureUsage.push({
        feature: actionType,
        count: 1,
        firstUsed: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      });
    }

    this.updatedAt = new Date().toISOString();
  }

  /**
   * Send notification
   */
  sendNotification(type: string, message: string): void {
    this.notificationsSent.push({
      type,
      message,
      sentAt: new Date().toISOString(),
    });

    // Update notification flags
    if (type === TrialNotificationType.START) {
      this.startNotificationSent = true;
    } else if (type === TrialNotificationType.REMINDER) {
      this.reminderNotificationSent = true;
    } else if (type === TrialNotificationType.EXPIRING_SOON) {
      this.expiryNotificationSent = true;
    } else if (type === TrialNotificationType.CONVERTED) {
      this.conversionNotificationSent = true;
    } else if (type === TrialNotificationType.EXPIRED) {
      this.expiryNotificationSent = true;
    }

    this.updatedAt = new Date().toISOString();
  }

  /**
   * Add retention offer
   */
  addRetentionOffer(offer: any): void {
    this.retentionOffers.push({
      ...offer,
      createdAt: new Date().toISOString(),
      accepted: false,
    });
    this.retentionAttemptCount++;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Mark upgrade modal as viewed
   */
  markUpgradeModalViewed(): void {
    this.viewedUpgradeModal = true;
    this.viewedUpgradeModalCount++;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Mark upgrade button as clicked
   */
  markUpgradeButtonClicked(): void {
    this.clickedUpgradeButton = true;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Update engagement score
   */
  updateEngagementScore(): void {
    this.engagementScore = this.calculateEngagementScore();
    this.conversionLikelihood = this.calculateConversionLikelihood();
    this.churnRiskScore = this.calculateChurnRiskScore();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Get trial progress as percentage
   */
  getProgressPercentage(): number {
    if (this.totalDays === 0) return 0;
    return Math.min(100, Math.round((this.daysElapsed / this.totalDays) * 100));
  }

  /**
   * Get human-readable trial status
   */
  getStatusLabel(): string {
    switch (this.status) {
      case TrialStatus.ACTIVE:
        return `Active (${this.daysRemaining} days left)`;
      case TrialStatus.EXPIRED:
        return 'Expired';
      case TrialStatus.CONVERTED:
        return 'Converted to Paid';
      case TrialStatus.CANCELLED:
        return 'Cancelled';
      case TrialStatus.PENDING:
        return 'Pending';
      default:
        return 'Unknown';
    }
  }

  /**
   * Soft delete trial
   */
  softDelete(): void {
    this.isDeleted = true;
    this.deletedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Restore soft-deleted trial
   */
  restore(): void {
    this.isDeleted = false;
    this.deletedAt = null;
    this.updatedAt = new Date().toISOString();
  }
}
