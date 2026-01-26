/**
 * Payment Model
 * For tracking individual subscription payments
 */

import { v4 as uuidv4 } from 'uuid';

// Payment statuses
export const PaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
  SCHEDULED: 'scheduled',
};

// Payment types
export const PaymentType = {
  SUBSCRIPTION: 'subscription',
  ONE_TIME: 'one_time',
  REFUND: 'refund',
  ADJUSTMENT: 'adjustment',
  OTHER: 'other',
};

// Payment confirmation methods
export const ConfirmationMethod = {
  MANUAL: 'manual',
  RECEIPT_SCAN: 'receipt_scan',
  BANK_SYNC: 'bank_sync',
  EMAIL_PARSER: 'email_parser',
  AUTO: 'auto',
};

/**
 * Payment class representing a subscription payment
 */
export default class Payment {
  constructor(data = {}) {
    // Core identification
    this.id = data.id || uuidv4();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // Subscription reference
    this.subscriptionId = data.subscriptionId || '';
    this.subscriptionName = data.subscriptionName || '';
    this.category = data.category || '';
    
    // Payment details
    this.amount = data.amount || 0;
    this.currency = data.currency || 'USD';
    this.tax = data.tax || 0;
    this.fees = data.fees || 0;
    this.totalAmount = this.calculateTotalAmount();
    this.originalAmount = data.originalAmount || this.amount; // For price changes
    
    // Date information
    this.date = data.date || new Date().toISOString();
    this.dueDate = data.dueDate || null;
    this.paidDate = data.paidDate || null;
    this.nextDueDate = data.nextDueDate || null;
    
    // Payment method
    this.paymentMethod = data.paymentMethod || 'credit_card';
    this.paymentAccount = data.paymentAccount || ''; // Last 4 digits or account name
    this.transactionId = data.transactionId || '';
    this.referenceNumber = data.referenceNumber || '';
    
    // Status and type
    this.status = data.status || PaymentStatus.COMPLETED;
    this.type = data.type || PaymentType.SUBSCRIPTION;
    this.isRecurring = data.isRecurring !== undefined ? data.isRecurring : true;
    this.isConfirmed = data.isConfirmed !== undefined ? data.isConfirmed : false;
    this.confirmationMethod = data.confirmationMethod || ConfirmationMethod.MANUAL;
    
    // Billing period
    this.billingPeriodStart = data.billingPeriodStart || null;
    this.billingPeriodEnd = data.billingPeriodEnd || null;
    this.billingCycle = data.billingCycle || 'monthly';
    
    // Receipt and documentation
    this.receiptImage = data.receiptImage || null; // URL or local path
    this.receiptText = data.receiptText || ''; // OCR extracted text
    this.receiptDate = data.receiptDate || null;
    this.notes = data.notes || '';
    this.tags = data.tags || [];
    
    // Verification
    this.isVerified = data.isVerified || false;
    this.verifiedBy = data.verifiedBy || null; // User ID or system
    this.verifiedAt = data.verifiedAt || null;
    this.verificationNotes = data.verificationNotes || '';
    
    // Reconciliation
    this.isReconciled = data.isReconciled || false;
    this.reconciledWith = data.reconciledWith || null; // Bank statement reference
    this.reconciledAt = data.reconciledAt || null;
    
    // Split payments
    this.isSplit = data.isSplit || false;
    this.splitId = data.splitId || null;
    this.splitDetails = data.splitDetails || null; // Reference to split model
    
    // Location information (for physical payments)
    this.location = data.location || null; // {latitude, longitude, address}
    this.merchantName = data.merchantName || '';
    this.merchantId = data.merchantId || '';
    
    // Currency conversion
    this.exchangeRate = data.exchangeRate || 1;
    this.originalCurrency = data.originalCurrency || this.currency;
    this.originalAmount = data.originalAmount || this.amount;
    
    // Notifications
    this.notificationSent = data.notificationSent || false;
    this.notificationDate = data.notificationDate || null;
    this.reminderSent = data.reminderSent || false;
    
    // Metadata
    this.version = data.version || 1;
    this.isDeleted = data.isDeleted || false;
    this.deletedAt = data.deletedAt || null;
    this.syncStatus = data.syncStatus || 'synced';
    this.source = data.source || 'manual'; // manual, import, scan, api
  }

  /**
   * Calculate total amount including tax and fees
   */
  calculateTotalAmount() {
    return this.amount + this.tax + this.fees;
  }

  /**
   * Check if payment is overdue
   */
  isOverdue() {
    if (this.status !== PaymentStatus.PENDING) return false;
    if (!this.dueDate) return false;
    
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    return today > dueDate;
  }

  /**
   * Check if payment is upcoming (within specified days)
   */
  isUpcoming(days = 7) {
    if (this.status !== PaymentStatus.PENDING) return false;
    if (!this.dueDate) return false;
    
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= days && diffDays >= 0;
  }

  /**
   * Calculate days until due date
   */
  getDaysUntilDue() {
    if (!this.dueDate) return null;
    
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Mark payment as completed
   */
  markAsCompleted(paidDate = null, transactionId = '') {
    this.status = PaymentStatus.COMPLETED;
    this.paidDate = paidDate || new Date().toISOString();
    this.isConfirmed = true;
    
    if (transactionId) {
      this.transactionId = transactionId;
    }
    
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Mark payment as failed
   */
  markAsFailed(reason = '') {
    this.status = PaymentStatus.FAILED;
    this.notes = reason ? `${this.notes}\nFailed: ${reason}`.trim() : this.notes;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Mark payment as refunded
   */
  markAsRefunded(refundAmount = null, refundDate = null) {
    this.status = PaymentStatus.REFUNDED;
    
    if (refundAmount !== null) {
      this.amount = -Math.abs(refundAmount); // Negative amount for refund
      this.totalAmount = this.calculateTotalAmount();
    }
    
    if (refundDate) {
      this.paidDate = refundDate;
    }
    
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Schedule payment for future
   */
  schedule(dueDate) {
    this.status = PaymentStatus.SCHEDULED;
    this.dueDate = dueDate;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Confirm payment with receipt
   */
  confirmWithReceipt(imagePath, text = '', method = ConfirmationMethod.RECEIPT_SCAN) {
    this.isConfirmed = true;
    this.confirmationMethod = method;
    this.receiptImage = imagePath;
    this.receiptText = text;
    this.receiptDate = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Verify payment
   */
  verify(verifiedBy, notes = '') {
    this.isVerified = true;
    this.verifiedBy = verifiedBy;
    this.verifiedAt = new Date().toISOString();
    this.verificationNotes = notes;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Reconcile with bank statement
   */
  reconcile(statementReference, reconciledAt = null) {
    this.isReconciled = true;
    this.reconciledWith = statementReference;
    this.reconciledAt = reconciledAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Add location information
   */
  addLocation(latitude, longitude, address = '') {
    this.location = {
      latitude,
      longitude,
      address,
      timestamp: new Date().toISOString(),
    };
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Convert to different currency
   */
  convertToCurrency(newCurrency, exchangeRate) {
    if (this.currency === newCurrency) return;
    
    this.originalCurrency = this.currency;
    this.originalAmount = this.amount;
    this.exchangeRate = exchangeRate;
    
    this.amount = this.amount * exchangeRate;
    this.tax = this.tax * exchangeRate;
    this.fees = this.fees * exchangeRate;
    this.totalAmount = this.calculateTotalAmount();
    this.currency = newCurrency;
    
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Get payment summary for display
   */
  getSummary() {
    return {
      id: this.id,
      subscriptionName: this.subscriptionName,
      amount: this.amount,
      totalAmount: this.totalAmount,
      currency: this.currency,
      date: this.date,
      status: this.status,
      paymentMethod: this.paymentMethod,
      isConfirmed: this.isConfirmed,
      hasReceipt: !!this.receiptImage,
    };
  }

  /**
   * Check if payment has receipt
   */
  hasReceipt() {
    return !!this.receiptImage;
  }

  /**
   * Check if payment needs confirmation
   */
  needsConfirmation() {
    return this.status === PaymentStatus.COMPLETED && !this.isConfirmed;
  }

  /**
   * Check if payment is tax deductible (for business expenses)
   */
  isTaxDeductible() {
    // This would depend on your tax rules and category
    const deductibleCategories = ['education', 'health', 'productivity'];
    return deductibleCategories.includes(this.category);
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      subscriptionId: this.subscriptionId,
      subscriptionName: this.subscriptionName,
      category: this.category,
      amount: this.amount,
      currency: this.currency,
      tax: this.tax,
      fees: this.fees,
      totalAmount: this.totalAmount,
      originalAmount: this.originalAmount,
      date: this.date,
      dueDate: this.dueDate,
      paidDate: this.paidDate,
      nextDueDate: this.nextDueDate,
      paymentMethod: this.paymentMethod,
      paymentAccount: this.paymentAccount,
      transactionId: this.transactionId,
      referenceNumber: this.referenceNumber,
      status: this.status,
      type: this.type,
      isRecurring: this.isRecurring,
      isConfirmed: this.isConfirmed,
      confirmationMethod: this.confirmationMethod,
      billingPeriodStart: this.billingPeriodStart,
      billingPeriodEnd: this.billingPeriodEnd,
      billingCycle: this.billingCycle,
      receiptImage: this.receiptImage,
      receiptText: this.receiptText,
      receiptDate: this.receiptDate,
      notes: this.notes,
      tags: this.tags,
      isVerified: this.isVerified,
      verifiedBy: this.verifiedBy,
      verifiedAt: this.verifiedAt,
      verificationNotes: this.verificationNotes,
      isReconciled: this.isReconciled,
      reconciledWith: this.reconciledWith,
      reconciledAt: this.reconciledAt,
      isSplit: this.isSplit,
      splitId: this.splitId,
      splitDetails: this.splitDetails,
      location: this.location,
      merchantName: this.merchantName,
      merchantId: this.merchantId,
      exchangeRate: this.exchangeRate,
      originalCurrency: this.originalCurrency,
      originalAmount: this.originalAmount,
      notificationSent: this.notificationSent,
      notificationDate: this.notificationDate,
      reminderSent: this.reminderSent,
      version: this.version,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
      syncStatus: this.syncStatus,
      source: this.source,
    };
  }

  /**
   * Create Payment instance from JSON data
   */
  static fromJSON(data) {
    return new Payment(data);
  }

  /**
   * Create a payment from subscription data
   */
  static fromSubscription(subscription, paymentDate = null) {
    return new Payment({
      subscriptionId: subscription.id,
      subscriptionName: subscription.name,
      category: subscription.category,
      amount: subscription.amount,
      currency: subscription.currency,
      tax: subscription.tax,
      fees: subscription.fees,
      paymentMethod: subscription.paymentMethod,
      paymentAccount: subscription.paymentAccount,
      billingCycle: subscription.billingCycle,
      date: paymentDate || new Date().toISOString(),
      dueDate: subscription.nextBillingDate,
      billingPeriodStart: subscription.lastPaymentDate || subscription.billingDate,
      billingPeriodEnd: subscription.nextBillingDate,
      isRecurring: subscription.autoRenew,
      type: PaymentType.SUBSCRIPTION,
      status: PaymentStatus.COMPLETED,
    });
  }

  /**
   * Validate payment data
   */
  validate() {
    const errors = [];
    
    if (!this.subscriptionId && !this.subscriptionName) {
      errors.push('Subscription reference is required');
    }
    
    if (this.amount <= 0 && this.type !== PaymentType.REFUND) {
      errors.push('Payment amount must be greater than 0');
    }
    
    if (!this.date) {
      errors.push('Payment date is required');
    }
    
    if (!Object.values(PaymentStatus).includes(this.status)) {
      errors.push('Invalid payment status');
    }
    
    if (!Object.values(PaymentType).includes(this.type)) {
      errors.push('Invalid payment type');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format amount with currency symbol
   */
  formatAmount(includeCurrency = true) {
    const amount = Math.abs(this.totalAmount).toFixed(2);
    const sign = this.amount < 0 ? '-' : '';
    
    if (!includeCurrency) {
      return `${sign}${amount}`;
    }
    
    // Simple currency formatting
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      LKR: 'Rs',
      JPY: '¥',
    };
    
    const symbol = currencySymbols[this.currency] || this.currency;
    return `${sign}${symbol}${amount}`;
  }
}

// Export constants for easy access
export {
    ConfirmationMethod, PaymentStatus,
    PaymentType
};
