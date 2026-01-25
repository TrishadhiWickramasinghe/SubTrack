/**
 * Date Helper Utilities for SubTrack
 * Comprehensive date manipulation and formatting functions
 */

import {
    addDays,
    addMonths, addYears,
    compareAsc,
    differenceInDays, differenceInMonths, differenceInYears,
    eachDayOfInterval,
    endOfDay,
    endOfMonth,
    endOfWeek,
    endOfYear,
    format, formatDistance,
    fromUnixTime,
    getDaysInMonth,
    getUnixTime,
    isSameDay,
    isValid,
    isWeekend, isWithinInterval,
    max,
    min,
    parseISO,
    setDate, setHours, setMinutes,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
    subDays,
    subMonths, subYears
} from 'date-fns';

// Import locale if you need localization
// import { enUS, si, ta } from 'date-fns/locale';

/**
 * Date Formats for different use cases
 */
export const DateFormats = {
  // Display formats
  DISPLAY: {
    SHORT_DATE: 'MMM d', // Jan 25
    MEDIUM_DATE: 'MMM d, yyyy', // Jan 25, 2024
    LONG_DATE: 'EEEE, MMMM d, yyyy', // Thursday, January 25, 2024
    FULL_DATE: 'PPPP', // Thursday, January 25th, 2024
    
    TIME: 'h:mm a', // 2:30 PM
    TIME_24: 'HH:mm', // 14:30
    TIME_WITH_SECONDS: 'h:mm:ss a', // 2:30:45 PM
    
    DATETIME: 'MMM d, yyyy h:mm a', // Jan 25, 2024 2:30 PM
    DATETIME_FULL: 'PPpp', // Thursday, January 25th, 2024 at 2:30 PM
    
    // Relative formats
    RELATIVE: 'PPP', // January 25th, 2024
    RELATIVE_SHORT: 'PP', // Jan 25, 2024
  },
  
  // Storage formats (ISO standard)
  STORAGE: {
    DATE: 'yyyy-MM-dd', // 2024-01-25
    DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", // 2024-01-25T14:30:00.000Z
    DATETIME_LOCAL: "yyyy-MM-dd'T'HH:mm:ss", // 2024-01-25T14:30:00
    
    TIMESTAMP: 't', // Unix timestamp
  },
  
  // API formats
  API: {
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", // ISO 8601
    DATE_ONLY: 'yyyy-MM-dd',
  },
  
  // UI specific
  UI: {
    CARD_DATE: 'MMM d', // Jan 25
    CARD_DATETIME: 'MMM d, h:mm a', // Jan 25, 2:30 PM
    LIST_DATE: 'MMM d, yyyy', // Jan 25, 2024
    CALENDAR_DAY: 'd', // 25
    CALENDAR_MONTH: 'MMM', // Jan
    CALENDAR_YEAR: 'yyyy', // 2024
    
    PAYMENT_DATE: 'MMM d', // Jan 25
    DUE_DATE: 'MMM d', // Jan 25
    BILLING_DATE: 'MMM d, yyyy', // Jan 25, 2024
  },
};

/**
 * Date utility functions
 */
export class DateHelper {
  /**
   * Format date with given format string
   */
  static format(date, formatStr = DateFormats.DISPLAY.MEDIUM_DATE, options = {}) {
    if (!date) return '';
    
    try {
      const dateObj = this.parseDate(date);
      if (!isValid(dateObj)) return '';
      
      return format(dateObj, formatStr, options);
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  }

  /**
   * Parse date from various formats
   */
  static parseDate(dateInput) {
    if (!dateInput) return new Date();
    
    // If it's already a Date object
    if (dateInput instanceof Date) {
      return isValid(dateInput) ? dateInput : new Date();
    }
    
    // If it's a number (timestamp)
    if (typeof dateInput === 'number') {
      return fromUnixTime(dateInput);
    }
    
    // If it's a string
    if (typeof dateInput === 'string') {
      // Try parsing as ISO string
      const isoDate = parseISO(dateInput);
      if (isValid(isoDate)) return isoDate;
      
      // Try parsing as regular date string
      const regularDate = new Date(dateInput);
      if (isValid(regularDate)) return regularDate;
    }
    
    // Return current date as fallback
    return new Date();
  }

  /**
   * Get relative time (e.g., "2 days ago", "in 3 months")
   */
  static getRelativeTime(date, baseDate = new Date(), options = {}) {
    if (!date) return '';
    
    try {
      const dateObj = this.parseDate(date);
      const baseDateObj = this.parseDate(baseDate);
      
      if (!isValid(dateObj) || !isValid(baseDateObj)) return '';
      
      return formatDistance(dateObj, baseDateObj, { addSuffix: true, ...options });
    } catch (error) {
      console.error('Relative time error:', error);
      return '';
    }
  }

  /**
   * Get human-readable date (e.g., "Today", "Yesterday", "Tomorrow")
   */
  static getHumanDate(date, baseDate = new Date()) {
    if (!date) return '';
    
    const dateObj = this.parseDate(date);
    const baseDateObj = this.parseDate(baseDate);
    
    if (!isValid(dateObj) || !isValid(baseDateObj)) return '';
    
    if (isSameDay(dateObj, baseDateObj)) {
      return 'Today';
    }
    
    if (isSameDay(dateObj, subDays(baseDateObj, 1))) {
      return 'Yesterday';
    }
    
    if (isSameDay(dateObj, addDays(baseDateObj, 1))) {
      return 'Tomorrow';
    }
    
    if (isSameDay(dateObj, subDays(baseDateObj, 2))) {
      return 'Day before yesterday';
    }
    
    if (isSameDay(dateObj, addDays(baseDateObj, 2))) {
      return 'Day after tomorrow';
    }
    
    // For dates within a week
    const diffDays = differenceInDays(dateObj, baseDateObj);
    if (Math.abs(diffDays) < 7) {
      if (diffDays > 0) {
        return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else {
        return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
      }
    }
    
    // Fallback to formatted date
    return this.format(dateObj, DateFormats.DISPLAY.MEDIUM_DATE);
  }

  /**
   * Calculate days between two dates
   */
  static daysBetween(startDate, endDate) {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    
    if (!isValid(start) || !isValid(end)) return 0;
    
    return Math.abs(differenceInDays(end, start));
  }

  /**
   * Calculate months between two dates
   */
  static monthsBetween(startDate, endDate) {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    
    if (!isValid(start) || !isValid(end)) return 0;
    
    return Math.abs(differenceInMonths(end, start));
  }

  /**
   * Calculate years between two dates
   */
  static yearsBetween(startDate, endDate) {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    
    if (!isValid(start) || !isValid(end)) return 0;
    
    return Math.abs(differenceInYears(end, start));
  }

  /**
   * Add days to date
   */
  static addDays(date, days) {
    const dateObj = this.parseDate(date);
    return addDays(dateObj, days);
  }

  /**
   * Subtract days from date
   */
  static subtractDays(date, days) {
    const dateObj = this.parseDate(date);
    return subDays(dateObj, days);
  }

  /**
   * Add months to date
   */
  static addMonths(date, months) {
    const dateObj = this.parseDate(date);
    return addMonths(dateObj, months);
  }

  /**
   * Subtract months from date
   */
  static subtractMonths(date, months) {
    const dateObj = this.parseDate(date);
    return subMonths(dateObj, months);
  }

  /**
   * Add years to date
   */
  static addYears(date, years) {
    const dateObj = this.parseDate(date);
    return addYears(dateObj, years);
  }

  /**
   * Subtract years from date
   */
  static subtractYears(date, years) {
    const dateObj = this.parseDate(date);
    return subYears(dateObj, years);
  }

  /**
   * Get start of month
   */
  static startOfMonth(date) {
    const dateObj = this.parseDate(date);
    return startOfMonth(dateObj);
  }

  /**
   * Get end of month
   */
  static endOfMonth(date) {
    const dateObj = this.parseDate(date);
    return endOfMonth(dateObj);
  }

  /**
   * Get start of week
   */
  static startOfWeek(date, options = { weekStartsOn: 1 }) { // Monday
    const dateObj = this.parseDate(date);
    return startOfWeek(dateObj, options);
  }

  /**
   * Get end of week
   */
  static endOfWeek(date, options = { weekStartsOn: 1 }) { // Monday
    const dateObj = this.parseDate(date);
    return endOfWeek(dateObj, options);
  }

  /**
   * Get start of year
   */
  static startOfYear(date) {
    const dateObj = this.parseDate(date);
    return startOfYear(dateObj);
  }

  /**
   * Get end of year
   */
  static endOfYear(date) {
    const dateObj = this.parseDate(date);
    return endOfYear(dateObj);
  }

  /**
   * Get start of day
   */
  static startOfDay(date) {
    const dateObj = this.parseDate(date);
    return startOfDay(dateObj);
  }

  /**
   * Get end of day
   */
  static endOfDay(date) {
    const dateObj = this.parseDate(date);
    return endOfDay(dateObj);
  }

  /**
   * Get days in month
   */
  static daysInMonth(date) {
    const dateObj = this.parseDate(date);
    return getDaysInMonth(dateObj);
  }

  /**
   * Check if date is weekend
   */
  static isWeekend(date) {
    const dateObj = this.parseDate(date);
    return isWeekend(dateObj);
  }

  /**
   * Check if date is within interval
   */
  static isWithinInterval(date, start, end) {
    const dateObj = this.parseDate(date);
    const startObj = this.parseDate(start);
    const endObj = this.parseDate(end);
    
    return isWithinInterval(dateObj, { start: startObj, end: endObj });
  }

  /**
   * Get all dates between two dates
   */
  static getDatesBetween(startDate, endDate) {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    
    if (!isValid(start) || !isValid(end)) return [];
    
    return eachDayOfInterval({ start, end });
  }

  /**
   * Get next billing date based on cycle
   */
  static getNextBillingDate(currentDate, billingCycle, customDays = 30) {
    const date = this.parseDate(currentDate);
    
    switch (billingCycle) {
      case 'daily':
        return this.addDays(date, 1);
      case 'weekly':
        return this.addDays(date, 7);
      case 'biweekly':
        return this.addDays(date, 14);
      case 'monthly':
        return this.addMonths(date, 1);
      case 'bimonthly':
        return this.addMonths(date, 2);
      case 'quarterly':
        return this.addMonths(date, 3);
      case 'semiannually':
        return this.addMonths(date, 6);
      case 'annually':
        return this.addYears(date, 1);
      case 'custom':
        return this.addDays(date, customDays);
      default:
        return this.addMonths(date, 1);
    }
  }

  /**
   * Get payment reminder dates
   */
  static getReminderDates(dueDate, reminderDays = [1, 3, 7]) {
    const due = this.parseDate(dueDate);
    return reminderDays
      .map(days => this.subtractDays(due, days))
      .sort((a, b) => a - b);
  }

  /**
   * Calculate age from birth date
   */
  static calculateAge(birthDate) {
    const birth = this.parseDate(birthDate);
    const today = new Date();
    
    if (!isValid(birth)) return null;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Format time duration
   */
  static formatDuration(seconds, format = 'auto') {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours !== 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}` : ''}`;
    }
    
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  /**
   * Get fiscal year for date
   */
  static getFiscalYear(date, startMonth = 4) { // April = 4 (0-indexed)
    const dateObj = this.parseDate(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    
    return month >= startMonth ? year + 1 : year;
  }

  /**
   * Get quarter for date
   */
  static getQuarter(date) {
    const dateObj = this.parseDate(date);
    const month = dateObj.getMonth();
    
    return Math.floor(month / 3) + 1; // Q1 = Jan-Mar, Q2 = Apr-Jun, etc.
  }

  /**
   * Get week number in year
   */
  static getWeekNumber(date) {
    const dateObj = this.parseDate(date);
    const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
    const pastDaysOfYear = (dateObj - firstDayOfYear) / 86400000;
    
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Convert to Unix timestamp
   */
  static toUnixTimestamp(date) {
    const dateObj = this.parseDate(date);
    return getUnixTime(dateObj);
  }

  /**
   * Convert from Unix timestamp
   */
  static fromUnixTimestamp(timestamp) {
    return fromUnixTime(timestamp);
  }

  /**
   * Set time on date
   */
  static setTime(date, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
    const dateObj = this.parseDate(date);
    return setHours(setMinutes(setDate(dateObj, dateObj.getDate()), minutes), hours);
  }

  /**
   * Compare two dates
   */
  static compareDates(date1, date2) {
    const d1 = this.parseDate(date1);
    const d2 = this.parseDate(date2);
    
    return compareAsc(d1, d2);
  }

  /**
   * Get minimum date from array
   */
  static minDate(dates) {
    const validDates = dates
      .map(date => this.parseDate(date))
      .filter(date => isValid(date));
    
    return min(validDates);
  }

  /**
   * Get maximum date from array
   */
  static maxDate(dates) {
    const validDates = dates
      .map(date => this.parseDate(date))
      .filter(date => isValid(date));
    
    return max(validDates);
  }

  /**
   * Check if date is valid
   */
  static isValidDate(date) {
    if (!date) return false;
    
    const dateObj = this.parseDate(date);
    return isValid(dateObj);
  }

  /**
   * Get current date in various formats
   */
  static getCurrentDate(format = null) {
    const now = new Date();
    
    if (format) {
      return this.format(now, format);
    }
    
    return {
      date: now,
      iso: now.toISOString(),
      timestamp: getUnixTime(now),
      formatted: this.format(now, DateFormats.DISPLAY.MEDIUM_DATE),
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      dayOfWeek: now.getDay(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
    };
  }
}

/**
 * Subscription-specific date utilities
 */
export class SubscriptionDateHelper {
  /**
   * Calculate next billing date for subscription
   */
  static calculateNextBillingDate(subscription) {
    if (!subscription || !subscription.billingDate) return null;
    
    const lastBillingDate = DateHelper.parseDate(subscription.billingDate);
    const billingCycle = subscription.billingCycle || 'monthly';
    const customDays = subscription.customDays || 30;
    
    return DateHelper.getNextBillingDate(lastBillingDate, billingCycle, customDays);
  }

  /**
   * Calculate trial end date
   */
  static calculateTrialEndDate(startDate, trialDays = 30) {
    if (!startDate) return null;
    
    const start = DateHelper.parseDate(startDate);
    return DateHelper.addDays(start, trialDays);
  }

  /**
   * Get days until next payment
   */
  static getDaysUntilPayment(subscription) {
    if (!subscription || !subscription.nextBillingDate) return null;
    
    const nextDate = DateHelper.parseDate(subscription.nextBillingDate);
    const today = new Date();
    
    return DateHelper.daysBetween(today, nextDate);
  }

  /**
   * Check if subscription is due soon
   */
  static isDueSoon(subscription, daysThreshold = 3) {
    const daysUntil = this.getDaysUntilPayment(subscription);
    return daysUntil !== null && daysUntil <= daysThreshold && daysUntil >= 0;
  }

  /**
   * Check if subscription is overdue
   */
  static isOverdue(subscription) {
    const daysUntil = this.getDaysUntilPayment(subscription);
    return daysUntil !== null && daysUntil < 0;
  }

  /**
   * Get trial days remaining
   */
  static getTrialDaysRemaining(subscription) {
    if (!subscription || !subscription.trialEndDate) return 0;
    
    const trialEnd = DateHelper.parseDate(subscription.trialEndDate);
    const today = new Date();
    
    const daysRemaining = DateHelper.daysBetween(today, trialEnd);
    return Math.max(0, daysRemaining);
  }

  /**
   * Check if subscription is in trial period
   */
  static isInTrial(subscription) {
    const daysRemaining = this.getTrialDaysRemaining(subscription);
    return daysRemaining > 0;
  }

  /**
   * Get payment history summary by period
   */
  static getPaymentSummary(payments, period = 'monthly') {
    if (!payments || !Array.isArray(payments)) return [];
    
    const summary = {};
    
    payments.forEach(payment => {
      const date = DateHelper.parseDate(payment.date);
      let key;
      
      switch (period) {
        case 'daily':
          key = DateHelper.format(date, 'yyyy-MM-dd');
          break;
        case 'weekly':
          key = `${date.getFullYear()}-W${DateHelper.getWeekNumber(date)}`;
          break;
        case 'monthly':
          key = DateHelper.format(date, 'yyyy-MM');
          break;
        case 'yearly':
          key = date.getFullYear().toString();
          break;
        case 'quarterly':
          key = `${date.getFullYear()}-Q${DateHelper.getQuarter(date)}`;
          break;
        default:
          key = DateHelper.format(date, 'yyyy-MM');
      }
      
      if (!summary[key]) {
        summary[key] = {
          period: key,
          totalAmount: 0,
          paymentCount: 0,
          subscriptions: new Set(),
        };
      }
      
      summary[key].totalAmount += payment.totalAmount || payment.amount || 0;
      summary[key].paymentCount += 1;
      summary[key].subscriptions.add(payment.subscriptionName);
    });
    
    // Convert to array and format
    return Object.values(summary).map(item => ({
      ...item,
      subscriptions: Array.from(item.subscriptions),
      averageAmount: item.paymentCount > 0 ? item.totalAmount / item.paymentCount : 0,
    }));
  }

  /**
   * Get upcoming payments for next X days
   */
  static getUpcomingPayments(subscriptions, days = 30) {
    if (!subscriptions || !Array.isArray(subscriptions)) return [];
    
    const today = new Date();
    const endDate = DateHelper.addDays(today, days);
    
    return subscriptions
      .filter(sub => sub.nextBillingDate && sub.status === 'active')
      .map(sub => {
        const nextDate = DateHelper.parseDate(sub.nextBillingDate);
        const daysUntil = DateHelper.daysBetween(today, nextDate);
        
        return {
          ...sub,
          nextDate,
          daysUntil,
          isDueSoon: daysUntil <= 3 && daysUntil >= 0,
          isOverdue: daysUntil < 0,
        };
      })
      .filter(sub => sub.nextDate <= endDate)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }
}

// Export everything
export default {
  DateFormats,
  DateHelper,
  SubscriptionDateHelper,
  
  // Convenience functions
  formatDate: DateHelper.format.bind(DateHelper),
  parseDate: DateHelper.parseDate.bind(DateHelper),
  getRelativeTime: DateHelper.getRelativeTime.bind(DateHelper),
  daysBetween: DateHelper.daysBetween.bind(DateHelper),
  
  // Subscription helpers
  getNextBillingDate: SubscriptionDateHelper.calculateNextBillingDate.bind(SubscriptionDateHelper),
  getUpcomingPayments: SubscriptionDateHelper.getUpcomingPayments.bind(SubscriptionDateHelper),
  isDueSoon: SubscriptionDateHelper.isDueSoon.bind(SubscriptionDateHelper),
};