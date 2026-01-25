/**
 * Application Constants for SubTrack
 * All hardcoded values, strings, and magic numbers should be here
 */

import { Platform } from 'react-native';

// ==================== UI CONSTANTS ====================

// Animation constants
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 750,
  },
  
  EASING: {
    LINEAR: 'linear',
    EASE_IN: 'easeIn',
    EASE_OUT: 'easeOut',
    EASE_IN_OUT: 'easeInOut',
  },
  
  SCALE: {
    PRESS: 0.95,
    HOVER: 1.05,
  },
};

// Icon constants
export const ICONS = {
  // Navigation icons
  DASHBOARD: 'view-dashboard',
  SUBSCRIPTIONS: 'credit-card-multiple',
  ANALYTICS: 'chart-pie',
  BUDGET: 'wallet',
  TRIALS: 'timer-sand',
  SPLITTING: 'account-multiple',
  MARKETPLACE: 'store',
  SCANNER: 'camera',
  SETTINGS: 'cog',
  PROFILE: 'account-circle',
  
  // Subscription categories
  ENTERTAINMENT: 'film',
  UTILITIES: 'lightbulb',
  PRODUCTIVITY: 'briefcase',
  HEALTH: 'heart-pulse',
  EDUCATION: 'school',
  FINANCE: 'bank',
  SHOPPING: 'cart',
  FOOD: 'food',
  TRAVEL: 'airplane',
  OTHER: 'dots-horizontal-circle',
  
  // Status icons
  ACTIVE: 'check-circle',
  PENDING: 'clock',
  CANCELLED: 'close-circle',
  EXPIRED: 'alert-circle',
  TRIAL: 'timer',
  PAUSED: 'pause-circle',
  
  // Action icons
  ADD: 'plus',
  EDIT: 'pencil',
  DELETE: 'trash-can',
  SAVE: 'content-save',
  CANCEL: 'close',
  SHARE: 'share-variant',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
  REFRESH: 'refresh',
  SEARCH: 'magnify',
  FILTER: 'filter',
  SORT: 'sort',
  MENU: 'menu',
  BACK: 'arrow-left',
  FORWARD: 'arrow-right',
  UP: 'arrow-up',
  DOWN: 'arrow-down',
  INFO: 'information',
  WARNING: 'alert',
  ERROR: 'alert-circle',
  SUCCESS: 'check-circle',
  
  // Payment icons
  CASH: 'cash',
  CARD: 'credit-card',
  PAYPAL: 'paypal',
  BANK: 'bank',
  BITCOIN: 'bitcoin',
  
  // Chart icons
  PIE_CHART: 'chart-pie',
  BAR_CHART: 'chart-bar',
  LINE_CHART: 'chart-line',
  TREND_UP: 'trending-up',
  TREND_DOWN: 'trending-down',
  
  // Settings icons
  THEME: 'theme-light-dark',
  NOTIFICATIONS: 'bell',
  SECURITY: 'shield-lock',
  BACKUP: 'cloud-upload',
  LANGUAGE: 'translate',
  CURRENCY: 'currency-usd',
  HELP: 'help-circle',
  ABOUT: 'information',
  LOGOUT: 'logout',
};

// Color constants (from colors.js)
export const COLORS = {
  // Status colors
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  
  // Category colors
  ENTERTAINMENT: '#6366F1',
  UTILITIES: '#10B981',
  PRODUCTIVITY: '#F59E0B',
  HEALTH: '#A855F7',
  EDUCATION: '#EC4899',
  FINANCE: '#3B82F6',
  SHOPPING: '#F97316',
  FOOD: '#EF4444',
  TRAVEL: '#10B981',
  OTHER: '#6B7280',
  
  // Chart colors
  CHART: [
    '#6366F1', // Primary
    '#10B981', // Secondary
    '#F59E0B', // Tertiary
    '#A855F7', // Accent
    '#EC4899', // Highlight
    '#3B82F6', // Info
    '#F97316', // Warning
    '#EF4444', // Error
    '#6B7280', // Neutral
    '#059669', // Success dark
  ],
};

// ==================== BUSINESS LOGIC CONSTANTS ====================

// Subscription constants
export const SUBSCRIPTION = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_PRICE: 1000000, // $1,000,000
  MIN_PRICE: 0.01,
  
  // Trial periods (in days)
  TRIAL_PERIODS: {
    '7_DAYS': 7,
    '14_DAYS': 14,
    '30_DAYS': 30,
    '60_DAYS': 60,
    '90_DAYS': 90,
  },
  
  // Popular services for quick add
  POPULAR_SERVICES: [
    { name: 'Netflix', category: 'entertainment', icon: 'netflix', avgPrice: 15.99 },
    { name: 'Spotify', category: 'entertainment', icon: 'spotify', avgPrice: 9.99 },
    { name: 'YouTube Premium', category: 'entertainment', icon: 'youtube', avgPrice: 11.99 },
    { name: 'Amazon Prime', category: 'entertainment', icon: 'amazon', avgPrice: 12.99 },
    { name: 'Disney+', category: 'entertainment', icon: 'disney', avgPrice: 7.99 },
    { name: 'Microsoft 365', category: 'productivity', icon: 'microsoft', avgPrice: 6.99 },
    { name: 'Adobe Creative Cloud', category: 'productivity', icon: 'adobe', avgPrice: 52.99 },
    { name: 'Google One', category: 'productivity', icon: 'google', avgPrice: 1.99 },
    { name: 'Dropbox', category: 'productivity', icon: 'dropbox', avgPrice: 9.99 },
    { name: 'Gym Membership', category: 'health', icon: 'dumbbell', avgPrice: 29.99 },
  ],
};

// Budget constants
export const BUDGET = {
  DEFAULT_CATEGORY_LIMITS: {
    entertainment: 50,
    utilities: 100,
    productivity: 30,
    health: 40,
    education: 25,
    finance: 20,
    shopping: 60,
    food: 150,
    travel: 75,
    other: 50,
  },
  
  ALERT_MESSAGES: {
    THRESHOLD_50: 'You\'ve spent 50% of your budget',
    THRESHOLD_80: 'You\'ve spent 80% of your budget. Be careful!',
    THRESHOLD_90: 'You\'ve spent 90% of your budget. Almost there!',
    THRESHOLD_100: 'You\'ve reached your budget limit!',
    OVERSPENT: 'You\'ve overspent by $AMOUNT',
  },
};

// Notification constants
export const NOTIFICATIONS = {
  TYPES: {
    PAYMENT_REMINDER: 'PAYMENT_REMINDER',
    BUDGET_ALERT: 'BUDGET_ALERT',
    TRIAL_REMINDER: 'TRIAL_REMINDER',
    INSIGHT: 'INSIGHT',
    PRICE_DROP: 'PRICE_DROP',
    WEEKLY_SUMMARY: 'WEEKLY_SUMMARY',
  },
  
  // Notification IDs prefix
  PREFIX: {
    PAYMENT: 'payment_',
    TRIAL: 'trial_',
    BUDGET: 'budget_',
  },
  
  // Default messages
  MESSAGES: {
    PAYMENT_REMINDER: 'Payment for {subscription} is due tomorrow: {amount}',
    TRIAL_ENDING: 'Your trial for {subscription} ends in {days} days',
    BUDGET_WARNING: 'You\'ve spent {percentage}% of your {category} budget',
    WEEKLY_SUMMARY: 'You spent {amount} on subscriptions this week',
  },
};

// Currency constants
export const CURRENCY = {
  SYMBOLS: {
    USD: '$',
    LKR: 'Rs',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
    CNY: '¥',
    KRW: '₩',
    RUB: '₽',
  },
  
  FORMATS: {
    USD: {
      symbol: '$',
      decimal: '.',
      thousand: ',',
      precision: 2,
      format: '%s%v',
    },
    LKR: {
      symbol: 'Rs',
      decimal: '.',
      thousand: ',',
      precision: 2,
      format: '%v %s',
    },
    EUR: {
      symbol: '€',
      decimal: ',',
      thousand: '.',
      precision: 2,
      format: '%s%v',
    },
  },
};

// ==================== APP BEHAVIOR CONSTANTS ====================

// Storage keys (should match appConfig.js but accessible here)
export const STORAGE_KEYS = {
  // User preferences
  USER_PREFERENCES: '@subtrack_user_preferences',
  THEME_PREFERENCE: '@subtrack_theme',
  CURRENCY_PREFERENCE: '@subtrack_currency',
  LANGUAGE_PREFERENCE: '@subtrack_language',
  
  // App data
  SUBSCRIPTIONS: '@subtrack_subscriptions_v2',
  BUDGETS: '@subtrack_budgets_v2',
  TRIALS: '@subtrack_trials_v2',
  SPLITS: '@subtrack_splits_v2',
  RECEIPTS: '@subtrack_receipts_v2',
  
  // App state
  ONBOARDING_COMPLETED: '@subtrack_onboarding_completed',
  FIRST_LAUNCH_DATE: '@subtrack_first_launch',
  LAST_BACKUP_DATE: '@subtrack_last_backup',
  NOTIFICATION_PERMISSION: '@subtrack_notification_permission',
  
  // Cache
  CURRENCY_RATES_CACHE: '@subtrack_currency_rates_cache',
  MARKETPLACE_CACHE: '@subtrack_marketplace_cache',
  OCR_RESULTS_CACHE: '@subtrack_ocr_cache',
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: {
    SHORT: 'MMM d', // Jan 25
    MEDIUM: 'MMM d, yyyy', // Jan 25, 2024
    LONG: 'EEEE, MMMM d, yyyy', // Thursday, January 25, 2024
    TIME: 'h:mm a', // 2:30 PM
    DATETIME: 'MMM d, yyyy h:mm a', // Jan 25, 2024 2:30 PM
  },
  
  STORAGE: 'yyyy-MM-dd', // 2024-01-25
  API: 'yyyy-MM-ddTHH:mm:ss.SSSZ', // 2024-01-25T14:30:00.000Z
  
  // Relative time
  RELATIVE: {
    TODAY: 'Today',
    YESTERDAY: 'Yesterday',
    TOMORROW: 'Tomorrow',
  },
};

// Validation constants
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/,
  PRICE: /^\d+(\.\d{1,2})?$/,
  
  MESSAGES: {
    REQUIRED: 'This field is required',
    EMAIL: 'Please enter a valid email address',
    MIN_LENGTH: 'Must be at least {length} characters',
    MAX_LENGTH: 'Must be at most {length} characters',
    MIN_VALUE: 'Must be at least {value}',
    MAX_VALUE: 'Must be at most {value}',
    PATTERN: 'Invalid format',
  },
};

// Error messages
export const ERRORS = {
  NETWORK: {
    NO_INTERNET: 'No internet connection. Please check your connection and try again.',
    TIMEOUT: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    NOT_FOUND: 'The requested resource was not found.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
  },
  
  APP: {
    STORAGE_FULL: 'Storage is full. Please free up some space.',
    FILE_TOO_LARGE: 'File is too large. Maximum size is {size}MB.',
    CAMERA_PERMISSION: 'Camera permission is required to scan receipts.',
    NOTIFICATION_PERMISSION: 'Notification permission is required for payment reminders.',
    BIOMETRIC_NOT_SUPPORTED: 'Biometric authentication is not supported on this device.',
  },
  
  GENERAL: {
    UNEXPECTED: 'An unexpected error occurred. Please try again.',
    TRY_AGAIN: 'Something went wrong. Please try again.',
  },
};

// Success messages
export const SUCCESS = {
  SUBSCRIPTION_ADDED: 'Subscription added successfully!',
  SUBSCRIPTION_UPDATED: 'Subscription updated successfully!',
  SUBSCRIPTION_DELETED: 'Subscription deleted successfully!',
  BUDGET_SET: 'Budget set successfully!',
  BACKUP_CREATED: 'Backup created successfully!',
  RESTORE_COMPLETED: 'Restore completed successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  PAYMENT_RECORDED: 'Payment recorded successfully!',
};

// Platform constants
export const PLATFORM = {
  OS: Platform.OS,
  VERSION: Platform.Version,
  IS_IOS: Platform.OS === 'ios',
  IS_ANDROID: Platform.OS === 'android',
  IS_WEB: Platform.OS === 'web',
  
  // Platform-specific values
  KEYBOARD_AVOIDING: Platform.select({
    ios: 'padding',
    android: 'height',
    default: 'padding',
  }),
  
  STATUS_BAR_HEIGHT: Platform.select({
    ios: 44,
    android: 24,
    default: 0,
  }),
};

// ==================== EXPORT ALL CONSTANTS ====================

export default {
  // Grouped exports for easier imports
  ANIMATION,
  ICONS,
  COLORS,
  SUBSCRIPTION,
  BUDGET,
  NOTIFICATIONS,
  CURRENCY,
  STORAGE_KEYS,
  DATE_FORMATS,
  VALIDATION,
  ERRORS,
  SUCCESS,
  PLATFORM,
  
  // Helper functions
  formatCurrency: (amount, currency = 'USD') => {
    const format = CURRENCY.FORMATS[currency] || CURRENCY.FORMATS.USD;
    const symbol = CURRENCY.SYMBOLS[currency] || '$';
    const value = parseFloat(amount).toFixed(format.precision);
    const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, format.thousand);
    return format.format.replace('%s', symbol).replace('%v', formatted);
  },
  
  formatDate: (date, format = 'MEDIUM') => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (DATE_FORMATS.DISPLAY[format]) {
      // Implement your date formatting logic here
      // For now, return simple string
      return dateObj.toLocaleDateString();
    }
    
    return dateObj.toISOString().split('T')[0];
  },
  
  getCategoryColor: (category) => {
    return COLORS[category.toUpperCase()] || COLORS.OTHER;
  },
  
  getCategoryIcon: (category) => {
    return ICONS[category.toUpperCase()] || ICONS.OTHER;
  },
};