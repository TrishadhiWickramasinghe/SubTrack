/**
 * Subscription Model
 * Main entity for tracking subscription services
 */

import { v4 as uuidv4 } from 'uuid';

// Billing cycles
export const BillingCycle = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  BIMONTHLY: 'bimonthly',
  QUARTERLY: 'quarterly',
  SEMI_ANNUALLY: 'semiannually',
  ANNUALLY: 'annually',
  CUSTOM: 'custom',
};

// Subscription status
export const SubscriptionStatus = {
  ACTIVE: 'active',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  TRIAL: 'trial',
  PAUSED: 'paused',
};

// Payment methods
export const PaymentMethod = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  CASH: 'cash',
  OTHER: 'other',
};

// Subscription category
export const Category = {
  ENTERTAINMENT: 'entertainment',
  UTILITIES: 'utilities',
  PRODUCTIVITY: 'productivity',
  HEALTH: 'health',
  EDUCATION: 'education',
  FINANCE: 'finance',
  SHOPPING: 'shopping',
  FOOD: 'food',
  TRAVEL: 'travel',
  OTHER: 'other',
};

/**
 * Subscription class representing a tracked subscription service
 */
export default class Subscription {
  constructor(data = {}) {
    // Core identification
    this.id = data.id || uuidv4();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // Basic information
    this.name = data.name || '';
    this.description = data.description || '';
    this.category = data.category || Category.OTHER;
    this.icon = data.icon || 'credit-card';
    this.color = data.color || '#6366F1';
    this.serviceUrl = data.serviceUrl || '';
    
    // Financial details
    this.amount = data.amount || 0;
    this.currency = data.currency || 'USD';
    this.tax = data.tax || 0;
    this.fees = data.fees || 0;
    this.totalAmount = this.calculateTotalAmount();
    
    // Billing details
    this.billingCycle = data.billingCycle || BillingCycle.MONTHLY;
    this.customDays = data.customDays || 30; // For custom billing cycle
    this.billingDate = data.billingDate || new Date().toISOString();
    this.nextBillingDate = data.nextBillingDate || this.calculateNextBillingDate();
    this.lastPaymentDate = data.lastPaymentDate || null;
    this.firstBillingDate = data.firstBillingDate || new Date().toISOString();
    
    // Payment details
    this.paymentMethod = data.paymentMethod || PaymentMethod.CREDIT_CARD;
    this.paymentAccount = data.paymentAccount || ''; // Last 4 digits of card or account name
    this.autoRenew = data.autoRenew !== undefined ? data.autoRenew : true;
    this.receipts = data.receipts || []; // Array of receipt image paths or URLs
    
    // Status and tracking
    this.status = data.status || SubscriptionStatus.ACTIVE;
    this.isShared = data.isShared || false;
    this.sharedWith = data.sharedWith || []; // Array of user IDs or emails
    this.notes = data.notes || '';
    this.tags = data.tags || [];
    
    // Trial information
    this.hasTrial = data.hasTrial || false;
    this.trialStartDate = data.trialStartDate || null;
    this.trialEndDate = data.trialEndDate || null;
    this.trialConverted = data.trialConverted || false;
    
    // Usage tracking
    this.usageCount = data.usageCount || 0;
    this.lastUsed = data.lastUsed || null;
    this.rating = data.rating || 0; // User rating 1-5
    this.valueScore = data.valueScore || 0; // Calculated value score 0-100
    
    // Reminders and notifications
    this.notificationEnabled = data.notificationEnabled !== undefined ? data.notificationEnabled : true;
    this.notificationDays = data.notificationDays || [1]; // Days before payment to notify
    this.notificationTime = data.notificationTime || '09:00'; // Default 9 AM
    
    // Historical data
    this.paymentHistory = data.paymentHistory || []; // Array of Payment objects
    this.priceHistory = data.priceHistory || []; // Array of {date, amount} objects
    this.cancellationDate = data.cancellationDate || null;
    this.cancellationReason = data.cancellationReason || '';
    
    // Budget and analysis
    this.budgetCategory = data.budgetCategory || '';
    this.isEssential = data.isEssential || false;
    this.canNegotiate = data.canNegotiate || false;
    this.negotiationNotes = data.negotiationNotes || '';
    
    // Metadata
    this.version = data.version || 1;
    this.isDeleted = data.isDeleted || false;
    this.deletedAt = data.deletedAt || null;
    this.syncStatus = data.syncStatus || 'synced'; // 'synced', 'pending', 'error'
  }

  /**
   * Calculate total amount including tax and fees
   */
  calculateTotalAmount() {
    return this.amount + this.tax + this.fees;
  }

  /**
   * Calculate next billing date based on billing cycle
   */
  calculateNextBillingDate() {
    if (!this.billingDate) return null;
    
    const currentDate = new Date(this.billingDate);
    let nextDate = new Date(currentDate);
    
    switch (this.billingCycle) {
      case BillingCycle.DAILY:
        nextDate.setDate(currentDate.getDate() + 1);
        break;
      case BillingCycle.WEEKLY:
        nextDate.setDate(currentDate.getDate() + 7);
        break;
      case BillingCycle.BIWEEKLY:
        nextDate.setDate(currentDate.getDate() + 14);
        break;
      case BillingCycle.MONTHLY:
        nextDate.setMonth(currentDate.getMonth() + 1);
        break;
      case BillingCycle.BIMONTHLY:
        nextDate.setMonth(currentDate.getMonth() + 2);
        break;
      case BillingCycle.QUARTERLY:
        nextDate.setMonth(currentDate.getMonth() + 3);
        break;
      case BillingCycle.SEMI_ANNUALLY:
        nextDate.setMonth(currentDate.getMonth() + 6);
        break;
      case BillingCycle.ANNUALLY:
        nextDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      case BillingCycle.CUSTOM:
        nextDate.setDate(currentDate.getDate() + (this.customDays || 30));
        break;
      default:
        nextDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return nextDate.toISOString();
  }

  /**
   * Calculate days until next payment
   */
  getDaysUntilNextPayment() {
    if (!this.nextBillingDate) return null;
    
    const today = new Date();
    const nextDate = new Date(this.nextBillingDate);
    const diffTime = nextDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if subscription is due soon (within specified days)
   */
  isDueSoon(days = 3) {
    const daysUntil = this.getDaysUntilNextPayment();
    return daysUntil !== null && daysUntil <= days && daysUntil >= 0;
  }

  /**
   * Check if subscription is overdue
   */
  isOverdue() {
    const daysUntil = this.getDaysUntilNextPayment();
    return daysUntil !== null && daysUntil < 0;
  }

  /**
   * Check if subscription is in trial period
   */
  isInTrial() {
    if (!this.hasTrial || !this.trialEndDate) return false;
    
    const today = new Date();
    const trialEnd = new Date(this.trialEndDate);
    return today <= trialEnd;
  }

  /**
   * Calculate days remaining in trial
   */
  getTrialDaysRemaining() {
    if (!this.hasTrial || !this.trialEndDate) return 0;
    
    const today = new Date();
    const trialEnd = new Date(this.trialEndDate);
    const diffTime = trialEnd.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  }

  /**
   * Calculate value score based on usage and cost
   */
  calculateValueScore() {
    if (this.amount <= 0) return 100;
    
    // Simple calculation: higher usage = better value
    const usageScore = Math.min(this.usageCount * 10, 50); // Max 50 points for usage
    const costScore = Math.max(0, 50 - (this.amount / 10)); // Lower cost = higher score
    
    return Math.round(usageScore + costScore);
  }

  /**
   * Record a payment
   */
  recordPayment(paymentData) {
    const payment = new Payment({
      ...paymentData,
      subscriptionId: this.id,
      subscriptionName: this.name,
    });
    
    this.paymentHistory.push(payment);
    this.lastPaymentDate = payment.date;
    this.nextBillingDate = this.calculateNextBillingDate();
    this.updatedAt = new Date().toISOString();
    
    return payment;
  }

  /**
   * Update price and track history
   */
  updatePrice(newAmount) {
    if (newAmount !== this.amount) {
      this.priceHistory.push({
        date: new Date().toISOString(),
        oldAmount: this.amount,
        newAmount: newAmount,
      });
      
      this.amount = newAmount;
      this.totalAmount = this.calculateTotalAmount();
      this.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Cancel subscription
   */
  cancel(reason = '') {
    this.status = SubscriptionStatus.CANCELLED;
    this.cancellationDate = new Date().toISOString();
    this.cancellationReason = reason;
    this.autoRenew = false;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Pause subscription
   */
  pause() {
    this.status = SubscriptionStatus.PAUSED;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Resume subscription
   */
  resume() {
    this.status = SubscriptionStatus.ACTIVE;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Mark as used (increment usage count)
   */
  markAsUsed() {
    this.usageCount += 1;
    this.lastUsed = new Date().toISOString();
    this.valueScore = this.calculateValueScore();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      description: this.description,
      category: this.category,
      icon: this.icon,
      color: this.color,
      serviceUrl: this.serviceUrl,
      amount: this.amount,
      currency: this.currency,
      tax: this.tax,
      fees: this.fees,
      totalAmount: this.totalAmount,
      billingCycle: this.billingCycle,
      customDays: this.customDays,
      billingDate: this.billingDate,
      nextBillingDate: this.nextBillingDate,
      lastPaymentDate: this.lastPaymentDate,
      firstBillingDate: this.firstBillingDate,
      paymentMethod: this.paymentMethod,
      paymentAccount: this.paymentAccount,
      autoRenew: this.autoRenew,
      receipts: this.receipts,
      status: this.status,
      isShared: this.isShared,
      sharedWith: this.sharedWith,
      notes: this.notes,
      tags: this.tags,
      hasTrial: this.hasTrial,
      trialStartDate: this.trialStartDate,
      trialEndDate: this.trialEndDate,
      trialConverted: this.trialConverted,
      usageCount: this.usageCount,
      lastUsed: this.lastUsed,
      rating: this.rating,
      valueScore: this.valueScore,
      notificationEnabled: this.notificationEnabled,
      notificationDays: this.notificationDays,
      notificationTime: this.notificationTime,
      paymentHistory: this.paymentHistory.map(p => p.toJSON()),
      priceHistory: this.priceHistory,
      cancellationDate: this.cancellationDate,
      cancellationReason: this.cancellationReason,
      budgetCategory: this.budgetCategory,
      isEssential: this.isEssential,
      canNegotiate: this.canNegotiate,
      negotiationNotes: this.negotiationNotes,
      version: this.version,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
      syncStatus: this.syncStatus,
    };
  }

  /**
   * Create Subscription instance from JSON data
   */
  static fromJSON(data) {
    const subscription = new Subscription(data);
    
    // Convert payment history to Payment instances
    if (data.paymentHistory && Array.isArray(data.paymentHistory)) {
      subscription.paymentHistory = data.paymentHistory.map(p => Payment.fromJSON(p));
    }
    
    return subscription;
  }

  /**
   * Create a duplicate subscription (useful for copying)
   */
  duplicate(newName = '') {
    const duplicateData = this.toJSON();
    duplicateData.id = uuidv4();
    duplicateData.createdAt = new Date().toISOString();
    duplicateData.updatedAt = new Date().toISOString();
    duplicateData.name = newName || `${this.name} (Copy)`;
    duplicateData.paymentHistory = [];
    duplicateData.priceHistory = [];
    
    return Subscription.fromJSON(duplicateData);
  }

  /**
   * Validate subscription data
   */
  validate() {
    const errors = [];
    
    if (!this.name.trim()) {
      errors.push('Name is required');
    }
    
    if (this.amount < 0) {
      errors.push('Amount cannot be negative');
    }
    
    if (!this.billingDate) {
      errors.push('Billing date is required');
    }
    
    if (!Object.values(BillingCycle).includes(this.billingCycle)) {
      errors.push('Invalid billing cycle');
    }
    
    if (!Object.values(Category).includes(this.category)) {
      errors.push('Invalid category');
    }
    
    if (!Object.values(SubscriptionStatus).includes(this.status)) {
      errors.push('Invalid status');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export constants for easy access
export {
    BillingCycle, Category, PaymentMethod, SubscriptionStatus
};
