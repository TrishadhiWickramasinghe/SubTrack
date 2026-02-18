/**
 * Budget Model
 * For managing spending limits and budget tracking
 */

// @ts-ignore - UUID types not available
import { v4 as uuidv4 } from 'uuid';

// TypeScript declarations for uuid if needed
declare const __uuid_brand: unique symbol;

// Budget periods
export const BudgetPeriod = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom',
};

// Budget types
export const BudgetType = {
  OVERALL: 'overall', // Overall spending limit
  CATEGORY: 'category', // Category-specific budget
  SUBSCRIPTION: 'subscription', // Individual subscription budget
  CUSTOM: 'custom', // Custom grouping budget
};

// Alert types
export const AlertType = {
  INFO: 'info',
  WARNING: 'warning',
  DANGER: 'danger',
  SUCCESS: 'success',
};

// Alert thresholds (percentage of budget)
export const AlertThreshold = {
  INFO: 50,
  WARNING: 75,
  DANGER: 90,
  EXCEEDED: 100,
};

/**
 * Budget class for managing spending limits
 */
export default class Budget {
  // Core identification
  id: string;
  createdAt: string;
  updatedAt: string;
  
  // Basic information
  name: string;
  description: string;
  type: string;
  period: string;
  icon: string;
  color: string;
  
  // Target entity
  targetId: string | null;
  targetName: string;
  
  // Budget amounts
  amount: number;
  currency: string;
  adjustments: number;
  effectiveAmount: number;
  
  // Period details
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  rolloverEnabled: boolean;
  rolloverAmount: number;
  rolloverFrom: string | null;
  
  // Tracking
  currentSpending: number;
  projectedSpending: number;
  remainingAmount: number;
  percentageUsed: number;
  
  // Alerts and notifications
  alertsEnabled: boolean;
  alertThresholds: any[];
  alertHistory: any[];
  
  // Rules and restrictions
  allowOverspending: boolean;
  maxOverspending: number;
  autoPauseSubscriptions: boolean;
  pauseThreshold: number;
  
  // Historical data
  previousPeriods: any[];
  spendingTrend: number;
  averageSpending: number;
  
  // Goals and savings
  hasGoal: boolean;
  goalAmount: number;
  goalDescription: string;
  savingsFromBudget: number;
  
  // User preferences
  isActive: boolean;
  isDefault: boolean;
  priority: number;
  notes: string;
  tags: string[];
  
  // Metadata
  version: number;
  isDeleted: boolean;
  deletedAt: string | null;
  syncStatus: string;

  constructor(data: any = {}) {
    // Core identification
    this.id = data.id || uuidv4();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // Basic information
    this.name = data.name || '';
    this.description = data.description || '';
    this.type = data.type || BudgetType.OVERALL;
    this.period = data.period || BudgetPeriod.MONTHLY;
    this.icon = data.icon || 'cash';
    this.color = data.color || '#10B981';
    
    // Target entity (depends on type)
    this.targetId = data.targetId || null; // categoryId, subscriptionId, or null for overall
    this.targetName = data.targetName || '';
    
    // Budget amounts
    this.amount = data.amount || 0;
    this.currency = data.currency || 'USD';
    this.adjustments = data.adjustments || 0; // Manual adjustments
    this.effectiveAmount = this.calculateEffectiveAmount();
    
    // Period details
    this.startDate = data.startDate || this.getPeriodStartDate();
    this.endDate = data.endDate || this.getPeriodEndDate();
    this.isRecurring = data.isRecurring !== undefined ? data.isRecurring : true;
    this.rolloverEnabled = data.rolloverEnabled !== undefined ? data.rolloverEnabled : false;
    this.rolloverAmount = data.rolloverAmount || 0;
    this.rolloverFrom = data.rolloverFrom || null; // Previous budget ID
    
    // Tracking
    this.currentSpending = data.currentSpending || 0;
    this.projectedSpending = data.projectedSpending || 0;
    this.remainingAmount = this.calculateRemainingAmount();
    this.percentageUsed = this.calculatePercentageUsed();
    
    // Alerts and notifications
    this.alertsEnabled = data.alertsEnabled !== undefined ? data.alertsEnabled : true;
    this.alertThresholds = data.alertThresholds || [
      { percentage: 50, type: AlertType.INFO, triggered: false },
      { percentage: 75, type: AlertType.WARNING, triggered: false },
      { percentage: 90, type: AlertType.DANGER, triggered: false },
      { percentage: 100, type: AlertType.DANGER, triggered: false },
    ];
    this.alertHistory = data.alertHistory || [];
    
    // Rules and restrictions
    this.allowOverspending = data.allowOverspending || false;
    this.maxOverspending = data.maxOverspending || 0; // Maximum allowed overspending
    this.autoPauseSubscriptions = data.autoPauseSubscriptions || false;
    this.pauseThreshold = data.pauseThreshold || 100; // Percentage at which to pause
    
    // Historical data
    this.previousPeriods = data.previousPeriods || []; // Array of previous budget periods
    this.spendingTrend = data.spendingTrend || 0; // -1 (decreasing), 0 (stable), 1 (increasing)
    this.averageSpending = data.averageSpending || 0;
    
    // Goals and savings
    this.hasGoal = data.hasGoal || false;
    this.goalAmount = data.goalAmount || 0;
    this.goalDescription = data.goalDescription || '';
    this.savingsFromBudget = data.savingsFromBudget || 0; // Amount saved by staying under budget
    
    // User preferences
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isDefault = data.isDefault || false;
    this.priority = data.priority || 0; // Higher number = higher priority
    this.notes = data.notes || '';
    this.tags = data.tags || [];
    
    // Metadata
    this.version = data.version || 1;
    this.isDeleted = data.isDeleted || false;
    this.deletedAt = data.deletedAt || null;
    this.syncStatus = data.syncStatus || 'synced';
  }

  /**
   * Calculate effective amount (including rollover and adjustments)
   */
  calculateEffectiveAmount(): number {
    return this.amount + this.rolloverAmount + this.adjustments;
  }

  /**
   * Calculate remaining amount
   */
  calculateRemainingAmount(): number {
    return Math.max(0, this.effectiveAmount - this.currentSpending);
  }

  /**
   * Calculate percentage of budget used
   */
  calculatePercentageUsed(): number {
    if (this.effectiveAmount <= 0) return 0;
    return Math.min(100, (this.currentSpending / this.effectiveAmount) * 100);
  }

  /**
   * Get period start date based on period type
   */
  getPeriodStartDate(referenceDate: Date | string | null = null): string {
    const date = referenceDate ? new Date(referenceDate) : new Date();
    
    switch (this.period) {
      case BudgetPeriod.DAILY:
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      case BudgetPeriod.WEEKLY:
        // Start of week (Monday)
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
        return new Date(date.setDate(diff)).toISOString();
      case BudgetPeriod.MONTHLY:
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      case BudgetPeriod.QUARTERLY:
        const quarter = Math.floor(date.getMonth() / 3);
        return new Date(date.getFullYear(), quarter * 3, 1).toISOString();
      case BudgetPeriod.YEARLY:
        return new Date(date.getFullYear(), 0, 1).toISOString();
      default:
        return date.toISOString();
    }
  }

  /**
   * Get period end date based on period type
   */
  getPeriodEndDate(referenceDate: Date | string | null = null): string {
    const startDate = new Date(this.getPeriodStartDate(referenceDate));
    
    switch (this.period) {
      case BudgetPeriod.DAILY:
        startDate.setDate(startDate.getDate() + 1);
        break;
      case BudgetPeriod.WEEKLY:
        startDate.setDate(startDate.getDate() + 7);
        break;
      case BudgetPeriod.MONTHLY:
        startDate.setMonth(startDate.getMonth() + 1);
        break;
      case BudgetPeriod.QUARTERLY:
        startDate.setMonth(startDate.getMonth() + 3);
        break;
      case BudgetPeriod.YEARLY:
        startDate.setFullYear(startDate.getFullYear() + 1);
        break;
    }
    
    return startDate.toISOString();
  }

  /**
   * Update spending amount
   */
  updateSpending(amount: number, isProjection: boolean = false): void {
    if (isProjection) {
      this.projectedSpending = amount;
    } else {
      this.currentSpending = amount;
    }
    
    this.remainingAmount = this.calculateRemainingAmount();
    this.percentageUsed = this.calculatePercentageUsed();
    this.updatedAt = new Date().toISOString();
    
    // Check for alerts
    this.checkAlerts();
  }

  /**
   * Add spending to current amount
   */
  addSpending(amount: number): Budget {
    this.currentSpending += amount;
    this.remainingAmount = this.calculateRemainingAmount();
    this.percentageUsed = this.calculatePercentageUsed();
    this.updatedAt = new Date().toISOString();
    
    // Check for alerts
    this.checkAlerts();
    
    return this;
  }

  /**
   * Check and trigger alerts based on spending
   */
  checkAlerts(): any[] {
    if (!this.alertsEnabled) return [];
    
    const triggeredAlerts: any[] = [];
    
    this.alertThresholds.forEach(threshold => {
      if (this.percentageUsed >= threshold.percentage && !threshold.triggered) {
        threshold.triggered = true;
        threshold.triggeredAt = new Date().toISOString();
        
        const alert = {
          id: uuidv4(),
          budgetId: this.id,
          budgetName: this.name,
          type: threshold.type,
          threshold: threshold.percentage,
          currentPercentage: this.percentageUsed,
          currentSpending: this.currentSpending,
          remainingAmount: this.remainingAmount,
          triggeredAt: new Date().toISOString(),
          message: this.generateAlertMessage(threshold),
        };
        
        this.alertHistory.push(alert);
        triggeredAlerts.push(alert);
      }
    });
    
    return triggeredAlerts;
  }

  /**
   * Generate alert message based on threshold
   */
  generateAlertMessage(threshold: any): string {
    const percentage = Math.round(this.percentageUsed);
    
    switch (threshold.type) {
      case AlertType.INFO:
        return `You've used ${percentage}% of your "${this.name}" budget.`;
      case AlertType.WARNING:
        return `Warning: You've used ${percentage}% of your "${this.name}" budget.`;
      case AlertType.DANGER:
        if (this.percentageUsed >= 100) {
          return `ALERT: You've exceeded your "${this.name}" budget by ${Math.round(this.percentageUsed - 100)}%!`;
        }
        return `Danger: You've used ${percentage}% of your "${this.name}" budget.`;
      default:
        return `Budget alert: ${percentage}% of budget used.`;
    }
  }

  /**
   * Reset alerts for new period
   */
  resetAlerts(): void {
    this.alertThresholds.forEach(threshold => {
      threshold.triggered = false;
      delete threshold.triggeredAt;
    });
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Check if budget is exceeded
   */
  isExceeded(): boolean {
    return this.currentSpending > this.effectiveAmount;
  }

  /**
   * Check if budget is close to limit
   */
  isCloseToLimit(threshold: number = 90): boolean {
    return this.percentageUsed >= threshold;
  }

  /**
   * Calculate overshoot amount
   */
  getOvershootAmount(): number {
    return Math.max(0, this.currentSpending - this.effectiveAmount);
  }

  /**
   * Calculate daily average spending
   */
  getDailyAverage(): number {
    const start = new Date(this.startDate).getTime();
    const end = new Date(this.endDate).getTime();
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    return days > 0 ? this.currentSpending / days : 0;
  }

  /**
   * Calculate required daily spending to stay on track
   */
  getRequiredDailySpending(): number {
    const start = new Date(this.startDate).getTime();
    const end = new Date(this.endDate).getTime();
    const today = new Date().getTime();
    
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    const daysRemaining = totalDays - daysPassed;
    
    if (daysRemaining <= 0) return 0;
    
    return this.remainingAmount / daysRemaining;
  }

  /**
   * Add adjustment to budget
   */
  addAdjustment(amount: number, reason: string = ''): Budget {
    this.adjustments += amount;
    this.effectiveAmount = this.calculateEffectiveAmount();
    this.remainingAmount = this.calculateRemainingAmount();
    this.percentageUsed = this.calculatePercentageUsed();
    
    this.notes = `${this.notes}\nAdjustment: ${amount > 0 ? '+' : ''}${amount} (${reason})`.trim();
    this.updatedAt = new Date().toISOString();
    
    return this;
  }

  /**
   * Enable rollover from previous budget
   */
  enableRollover(previousBudget: Budget): Budget {
    if (!previousBudget || !previousBudget.isActive) return this;
    
    const previousRemaining = previousBudget.remainingAmount;
    if (previousRemaining > 0) {
      this.rolloverAmount = previousRemaining;
      this.rolloverFrom = previousBudget.id;
      this.effectiveAmount = this.calculateEffectiveAmount();
      this.remainingAmount = this.calculateRemainingAmount();
    }
    
    this.rolloverEnabled = true;
    this.updatedAt = new Date().toISOString();
    
    return this;
  }

  /**
   * Archive this period and create new period
   */
  archiveAndCreateNext(): Budget {
    // Archive current period
    this.isActive = false;
    this.updatedAt = new Date().toISOString();
    
    // Create next period
    const nextBudget = new Budget({
      ...this.toJSON(),
      id: uuidv4(),
      startDate: this.getPeriodStartDate(new Date(this.endDate)),
      endDate: this.getPeriodEndDate(new Date(this.endDate)),
      currentSpending: 0,
      projectedSpending: 0,
      alertHistory: [],
      previousPeriods: [...this.previousPeriods, this.getSummary()],
    });
    
    // Reset alerts for new period
    nextBudget.resetAlerts();
    
    // Apply rollover if enabled
    if (this.rolloverEnabled) {
      nextBudget.enableRollover(this);
    }
    
    return nextBudget;
  }

  /**
   * Get budget summary for display
   */
  getSummary(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      period: this.period,
      amount: this.amount,
      effectiveAmount: this.effectiveAmount,
      currentSpending: this.currentSpending,
      remainingAmount: this.remainingAmount,
      percentageUsed: this.percentageUsed,
      isExceeded: this.isExceeded(),
      isCloseToLimit: this.isCloseToLimit(),
      dailyAverage: this.getDailyAverage(),
      requiredDailySpending: this.getRequiredDailySpending(),
      startDate: this.startDate,
      endDate: this.endDate,
      isActive: this.isActive,
      alerts: this.alertThresholds.filter(t => t.triggered).map(t => ({
        type: t.type,
        percentage: t.percentage,
        triggeredAt: t.triggeredAt,
      })),
    };
  }

  /**
   * Validate budget data
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors = [];
    
    if (!this.name.trim()) {
      errors.push('Budget name is required');
    }
    
    if (this.amount <= 0) {
      errors.push('Budget amount must be greater than 0');
    }
    
    if (!Object.values(BudgetPeriod).includes(this.period)) {
      errors.push('Invalid budget period');
    }
    
    if (!Object.values(BudgetType).includes(this.type)) {
      errors.push('Invalid budget type');
    }
    
    if (this.maxOverspending < 0) {
      errors.push('Maximum overspending cannot be negative');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to plain object for storage
   */
  toJSON(): any {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      description: this.description,
      type: this.type,
      period: this.period,
      icon: this.icon,
      color: this.color,
      targetId: this.targetId,
      targetName: this.targetName,
      amount: this.amount,
      currency: this.currency,
      adjustments: this.adjustments,
      effectiveAmount: this.effectiveAmount,
      startDate: this.startDate,
      endDate: this.endDate,
      isRecurring: this.isRecurring,
      rolloverEnabled: this.rolloverEnabled,
      rolloverAmount: this.rolloverAmount,
      rolloverFrom: this.rolloverFrom,
      currentSpending: this.currentSpending,
      projectedSpending: this.projectedSpending,
      remainingAmount: this.remainingAmount,
      percentageUsed: this.percentageUsed,
      alertsEnabled: this.alertsEnabled,
      alertThresholds: this.alertThresholds,
      alertHistory: this.alertHistory,
      allowOverspending: this.allowOverspending,
      maxOverspending: this.maxOverspending,
      autoPauseSubscriptions: this.autoPauseSubscriptions,
      pauseThreshold: this.pauseThreshold,
      previousPeriods: this.previousPeriods,
      spendingTrend: this.spendingTrend,
      averageSpending: this.averageSpending,
      hasGoal: this.hasGoal,
      goalAmount: this.goalAmount,
      goalDescription: this.goalDescription,
      savingsFromBudget: this.savingsFromBudget,
      isActive: this.isActive,
      isDefault: this.isDefault,
      priority: this.priority,
      notes: this.notes,
      tags: this.tags,
      version: this.version,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
      syncStatus: this.syncStatus,
    };
  }

  /**
   * Create Budget instance from JSON data
   */
  static fromJSON(data: any): Budget {
    return new Budget(data);
  }

  /**
   * Create default overall budget
   */
  static createDefault(amount: number = 100, currency: string = 'USD'): Budget {
    return new Budget({
      name: 'Overall Monthly Budget',
      description: 'Total spending limit for all subscriptions',
      type: BudgetType.OVERALL,
      period: BudgetPeriod.MONTHLY,
      amount: amount,
      currency: currency,
      isDefault: true,
      icon: 'wallet',
      color: '#10B981',
    });
  }

  /**
   * Create category-specific budget
   */
  static createForCategory(category: any, amount: number, period: string = BudgetPeriod.MONTHLY): Budget {
    return new Budget({
      name: `${category.name} Budget`,
      description: `Budget for ${category.name} subscriptions`,
      type: BudgetType.CATEGORY,
      period: period,
      targetId: category.id,
      targetName: category.name,
      amount: amount,
      icon: category.icon,
      color: category.color,
    });
  }
}
