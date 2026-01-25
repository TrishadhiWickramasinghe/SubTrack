/**
 * Format Helper Utilities for SubTrack
 * Comprehensive text, number, and data formatting functions
 */

import currencyHelper from './currencyHelpers';
import dateHelpers from './dateHelpers';

/**
 * Text formatting utilities
 */
export class TextFormatter {
  /**
   * Capitalize first letter of each word
   */
  static capitalizeWords(str) {
    if (!str || typeof str !== 'string') return '';
    
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Truncate text with ellipsis
   */
  static truncate(text, maxLength = 50, ellipsis = '...') {
    if (!text || typeof text !== 'string') return '';
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - ellipsis.length) + ellipsis;
  }

  /**
   * Remove extra whitespace
   */
  static normalizeWhitespace(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Generate initials from name
   */
  static getInitials(name, maxInitials = 2) {
    if (!name || typeof name !== 'string') return '';
    
    const words = name.trim().split(/\s+/);
    let initials = '';
    
    for (let i = 0; i < Math.min(words.length, maxInitials); i++) {
      if (words[i].length > 0) {
        initials += words[i][0].toUpperCase();
      }
    }
    
    return initials;
  }

  /**
   * Slugify string for URLs or IDs
   */
  static slugify(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/--+/g, '-')     // Replace multiple hyphens with single
      .trim();
  }

  /**
   * Mask sensitive information (like credit cards)
   */
  static maskSensitive(text, visibleChars = 4, maskChar = '*') {
    if (!text || typeof text !== 'string') return '';
    
    if (text.length <= visibleChars * 2) {
      return maskChar.repeat(text.length);
    }
    
    const firstVisible = text.substring(0, visibleChars);
    const lastVisible = text.substring(text.length - visibleChars);
    const maskedMiddle = maskChar.repeat(text.length - (visibleChars * 2));
    
    return firstVisible + maskedMiddle + lastVisible;
  }

  /**
   * Format phone number
   */
  static formatPhoneNumber(phoneNumber, format = 'us') {
    if (!phoneNumber) return '';
    
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    switch (format) {
      case 'us':
        if (cleaned.length === 10) {
          return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
        } else if (cleaned.length === 11 && cleaned[0] === '1') {
          return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
        }
        break;
      
      case 'international':
        return `+${cleaned}`;
      
      default:
        return phoneNumber;
    }
    
    return phoneNumber;
  }

  /**
   * Extract emoji from text
   */
  static extractEmoji(text) {
    if (!text) return '';
    
    const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\p{Emoji_Modifier_Base}\p{Emoji_Modifier}]/gu;
    const matches = text.match(emojiRegex);
    
    return matches ? matches[0] : '';
  }

  /**
   * Generate a random color hex code
   */
  static generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    
    return color;
  }

  /**
   * Generate avatar color based on string
   */
  static generateAvatarColor(str) {
    if (!str) return '#6366F1';
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#6366F1', '#10B981', '#F59E0B', '#A855F7', '#EC4899',
      '#3B82F6', '#F97316', '#EF4444', '#8B5CF6', '#06B6D4',
      '#14B8A6', '#84CC16', '#EAB308', '#F43F5E', '#8B5CF6',
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }
}

/**
 * Number formatting utilities
 */
export class NumberFormatter {
  /**
   * Format number with commas
   */
  static formatWithCommas(number, decimalPlaces = 2) {
    if (number === null || number === undefined || isNaN(number)) return '0';
    
    const fixedNumber = parseFloat(number).toFixed(decimalPlaces);
    const parts = fixedNumber.split('.');
    
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return parts.join('.');
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Format percentage
   */
  static formatPercent(number, decimals = 1) {
    if (number === null || number === undefined || isNaN(number)) return '0%';
    
    return parseFloat(number).toFixed(decimals) + '%';
  }

  /**
   * Format large numbers with K, M, B suffixes
   */
  static formatCompact(number, decimals = 1) {
    if (number === null || number === undefined || isNaN(number)) return '0';
    
    const absNumber = Math.abs(number);
    
    if (absNumber >= 1.0e9) {
      return (number / 1.0e9).toFixed(decimals) + 'B';
    }
    
    if (absNumber >= 1.0e6) {
      return (number / 1.0e6).toFixed(decimals) + 'M';
    }
    
    if (absNumber >= 1.0e3) {
      return (number / 1.0e3).toFixed(decimals) + 'K';
    }
    
    return number.toFixed(decimals);
  }

  /**
   * Format rating (e.g., 4.5/5)
   */
  static formatRating(rating, maxRating = 5, showMax = true) {
    if (rating === null || rating === undefined || isNaN(rating)) {
      return showMax ? `0/${maxRating}` : '0';
    }
    
    const rounded = Math.round(rating * 10) / 10;
    
    if (showMax) {
      return `${rounded}/${maxRating}`;
    }
    
    return rounded.toString();
  }

  /**
   * Calculate percentage
   */
  static calculatePercentage(part, total, decimals = 1) {
    if (total === 0) return 0;
    
    const percentage = (part / total) * 100;
    return parseFloat(percentage.toFixed(decimals));
  }

  /**
   * Calculate growth percentage
   */
  static calculateGrowth(current, previous, decimals = 1) {
    if (previous === 0) return 100;
    
    const growth = ((current - previous) / previous) * 100;
    return parseFloat(growth.toFixed(decimals));
  }

  /**
   * Round to nearest multiple
   */
  static roundToNearest(number, multiple) {
    return Math.round(number / multiple) * multiple;
  }

  /**
   * Clamp number between min and max
   */
  static clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
  }
}

/**
 * Data formatting utilities
 */
export class DataFormatter {
  /**
   * Format array to comma-separated string
   */
  static arrayToCommaString(array, maxItems = 5) {
    if (!Array.isArray(array) || array.length === 0) return '';
    
    if (array.length <= maxItems) {
      return array.join(', ');
    }
    
    const firstItems = array.slice(0, maxItems);
    return `${firstItems.join(', ')} +${array.length - maxItems} more`;
  }

  /**
   * Format object to query string
   */
  static objectToQueryString(obj, encode = true) {
    if (!obj || typeof obj !== 'object') return '';
    
    return Object.keys(obj)
      .map(key => {
        const value = obj[key];
        if (value === null || value === undefined) return '';
        
        const encodedKey = encode ? encodeURIComponent(key) : key;
        const encodedValue = encode ? encodeURIComponent(value) : value;
        
        return `${encodedKey}=${encodedValue}`;
      })
      .filter(param => param !== '')
      .join('&');
  }

  /**
   * Parse query string to object
   */
  static queryStringToObject(queryString) {
    if (!queryString || typeof queryString !== 'string') return {};
    
    return queryString
      .replace(/^\?/, '')
      .split('&')
      .reduce((acc, pair) => {
        const [key, value] = pair.split('=');
        if (key && value !== undefined) {
          acc[decodeURIComponent(key)] = decodeURIComponent(value);
        }
        return acc;
      }, {});
  }

  /**
   * Format JSON with indentation
   */
  static formatJson(data, indent = 2) {
    try {
      return JSON.stringify(data, null, indent);
    } catch (error) {
      console.error('Error formatting JSON:', error);
      return '';
    }
  }

  /**
   * Safe parse JSON
   */
  static safeParseJson(jsonString, fallback = {}) {
    try {
      if (typeof jsonString === 'string') {
        return JSON.parse(jsonString);
      }
      return jsonString || fallback;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return fallback;
    }
  }

  /**
   * Deep clone object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item));
    }
    
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    
    return cloned;
  }

  /**
   * Merge objects deeply
   */
  static deepMerge(target, source) {
    const output = this.deepClone(target);
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    
    return output;
  }

  /**
   * Check if value is an object
   */
  static isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Remove empty values from object
   */
  static removeEmptyValues(obj) {
    if (!this.isObject(obj)) return obj;
    
    const cleaned = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      
      if (value !== null && value !== undefined && value !== '') {
        if (this.isObject(value)) {
          const cleanedChild = this.removeEmptyValues(value);
          if (Object.keys(cleanedChild).length > 0) {
            cleaned[key] = cleanedChild;
          }
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            cleaned[key] = value;
          }
        } else {
          cleaned[key] = value;
        }
      }
    });
    
    return cleaned;
  }

  /**
   * Sort array of objects by key
   */
  static sortByKey(array, key, order = 'asc') {
    if (!Array.isArray(array)) return [];
    
    return [...array].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return order === 'asc' ? comparison : -comparison;
      }
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Group array by key
   */
  static groupBy(array, key) {
    if (!Array.isArray(array)) return {};
    
    return array.reduce((groups, item) => {
      const groupKey = item[key];
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(item);
      return groups;
    }, {});
  }

  /**
   * Filter array by multiple criteria
   */
  static filterByMultiple(array, filters) {
    if (!Array.isArray(array)) return [];
    
    return array.filter(item => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key];
        const itemValue = item[key];
        
        if (filterValue === null || filterValue === undefined) {
          return true;
        }
        
        if (typeof filterValue === 'function') {
          return filterValue(itemValue);
        }
        
        if (Array.isArray(filterValue)) {
          return filterValue.includes(itemValue);
        }
        
        return itemValue === filterValue;
      });
    });
  }

  /**
   * Calculate statistics from array
   */
  static calculateStats(array, valueKey) {
    if (!Array.isArray(array) || array.length === 0) {
      return {
        count: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
      };
    }
    
    const values = valueKey ? array.map(item => item[valueKey]) : array;
    const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    
    if (numericValues.length === 0) {
      return {
        count: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
      };
    }
    
    const sorted = [...numericValues].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const average = sum / sorted.length;
    
    let median;
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      median = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      median = sorted[mid];
    }
    
    return {
      count: sorted.length,
      sum,
      average: parseFloat(average.toFixed(2)),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: parseFloat(median.toFixed(2)),
    };
  }
}

/**
 * Subscription-specific formatting
 */
export class SubscriptionFormatter {
  /**
   * Format subscription status
   */
  static formatStatus(status) {
    const statusMap = {
      active: { text: 'Active', color: '#10B981', icon: 'check-circle' },
      pending: { text: 'Pending', color: '#F59E0B', icon: 'clock' },
      cancelled: { text: 'Cancelled', color: '#EF4444', icon: 'close-circle' },
      expired: { text: 'Expired', color: '#6B7280', icon: 'alert-circle' },
      trial: { text: 'Trial', color: '#3B82F6', icon: 'timer' },
      paused: { text: 'Paused', color: '#F97316', icon: 'pause-circle' },
    };
    
    return statusMap[status] || statusMap.active;
  }

  /**
   * Format billing cycle
   */
  static formatBillingCycle(cycle, customDays = null) {
    const cycleMap = {
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Bi-Weekly',
      monthly: 'Monthly',
      bimonthly: 'Bi-Monthly',
      quarterly: 'Quarterly',
      semiannually: 'Semi-Annually',
      annually: 'Annually',
      custom: customDays ? `Every ${customDays} days` : 'Custom',
    };
    
    return cycleMap[cycle] || 'Monthly';
  }

  /**
   * Format payment method
   */
  static formatPaymentMethod(method) {
    const methodMap = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      paypal: 'PayPal',
      bank_transfer: 'Bank Transfer',
      apple_pay: 'Apple Pay',
      google_pay: 'Google Pay',
      cash: 'Cash',
      other: 'Other',
    };
    
    return methodMap[method] || 'Credit Card';
  }

  /**
   * Format category
   */
  static formatCategory(category) {
    const categoryMap = {
      entertainment: 'Entertainment',
      utilities: 'Utilities',
      productivity: 'Productivity',
      health: 'Health & Fitness',
      education: 'Education',
      finance: 'Finance',
      shopping: 'Shopping',
      food: 'Food & Dining',
      travel: 'Travel',
      other: 'Other',
    };
    
    return categoryMap[category] || 'Other';
  }

  /**
   * Format subscription for display
   */
  static formatSubscriptionDisplay(subscription, options = {}) {
    const {
      showAmount = true,
      showNextDate = true,
      showStatus = true,
      truncateName = true,
    } = options;
    
    const display = {
      id: subscription.id,
      name: truncateName ? TextFormatter.truncate(subscription.name, 30) : subscription.name,
      icon: subscription.icon || 'credit-card',
      color: subscription.color || '#6366F1',
      category: this.formatCategory(subscription.category),
    };
    
    if (showAmount) {
      display.amount = currencyHelper.formatCurrency(
        subscription.totalAmount || subscription.amount,
        subscription.currency
      );
      display.billingCycle = this.formatBillingCycle(subscription.billingCycle, subscription.customDays);
    }
    
    if (showNextDate && subscription.nextBillingDate) {
      display.nextDate = dateHelpers.formatDate(subscription.nextBillingDate, 'MMM d');
      display.daysUntil = dateHelpers.daysBetween(new Date(), subscription.nextBillingDate);
    }
    
    if (showStatus) {
      const statusInfo = this.formatStatus(subscription.status);
      display.status = statusInfo.text;
      display.statusColor = statusInfo.color;
    }
    
    return display;
  }

  /**
   * Format subscription list for chart
   */
  static formatForChart(subscriptions, groupBy = 'category') {
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return [];
    }
    
    const grouped = DataFormatter.groupBy(subscriptions, groupBy);
    
    return Object.entries(grouped).map(([key, items]) => {
      const total = currencyHelper.calculateTotal(items, 'USD');
      const count = items.length;
      
      return {
        key,
        value: total,
        count,
        label: this.formatCategory(key),
        color: TextFormatter.generateAvatarColor(key),
      };
    }).sort((a, b) => b.value - a.value);
  }
}

// Export all formatters
export default {
  // Text formatting
  capitalize: TextFormatter.capitalizeWords,
  truncate: TextFormatter.truncate,
  getInitials: TextFormatter.getInitials,
  maskSensitive: TextFormatter.maskSensitive,
  formatPhone: TextFormatter.formatPhoneNumber,
  generateColor: TextFormatter.generateRandomColor,
  generateAvatarColor: TextFormatter.generateAvatarColor,
  
  // Number formatting
  formatNumber: NumberFormatter.formatWithCommas,
  formatFileSize: NumberFormatter.formatFileSize,
  formatPercent: NumberFormatter.formatPercent,
  formatCompact: NumberFormatter.formatCompact,
  formatRating: NumberFormatter.formatRating,
  calculatePercentage: NumberFormatter.calculatePercentage,
  calculateGrowth: NumberFormatter.calculateGrowth,
  clamp: NumberFormatter.clamp,
  
  // Data formatting
  arrayToString: DataFormatter.arrayToCommaString,
  objectToQuery: DataFormatter.objectToQueryString,
  queryToObject: DataFormatter.queryStringToObject,
  formatJson: DataFormatter.formatJson,
  safeParseJson: DataFormatter.safeParseJson,
  deepClone: DataFormatter.deepClone,
  deepMerge: DataFormatter.deepMerge,
  removeEmpty: DataFormatter.removeEmptyValues,
  sortBy: DataFormatter.sortByKey,
  groupBy: DataFormatter.groupBy,
  filterBy: DataFormatter.filterByMultiple,
  calculateStats: DataFormatter.calculateStats,
  
  // Subscription formatting
  formatStatus: SubscriptionFormatter.formatStatus,
  formatBillingCycle: SubscriptionFormatter.formatBillingCycle,
  formatPaymentMethod: SubscriptionFormatter.formatPaymentMethod,
  formatCategory: SubscriptionFormatter.formatCategory,
  formatSubscription: SubscriptionFormatter.formatSubscriptionDisplay,
  formatForChart: SubscriptionFormatter.formatForChart,
  
  // Classes for advanced usage
  TextFormatter,
  NumberFormatter,
  DataFormatter,
  SubscriptionFormatter,
};