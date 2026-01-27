/**
 * App Configuration for SubTrack
 * Centralized configuration for all app settings
 */

import { Platform } from 'react-native';

interface FeatureFlags {
  CORE: Record<string, boolean>;
  PREMIUM: Record<string, boolean>;
  DEV: Record<string, boolean>;
}

interface AppConfig {
  ENV: {
    IS_DEVELOPMENT: boolean;
    IS_PRODUCTION: boolean;
    IS_TEST: boolean;
  };
  APP: {
    NAME: string;
    VERSION: string;
    BUILD_NUMBER: string;
    BUNDLE_ID: string | null;
    STORE_URL: Record<string, string>;
    WEBSITE: string;
    SUPPORT_EMAIL: string;
    PRIVACY_POLICY: string;
    TERMS_OF_SERVICE: string;
  };
  FEATURES: FeatureFlags;
  API: {
    BASE_URL: string;
    ENDPOINTS: Record<string, string>;
    TIMEOUT: number;
    RETRY_ATTEMPTS: number;
    CACHE_TTL: number;
  };
  NOTIFICATIONS: Record<string, any>;
  CURRENCY: Record<string, any>;
  SUBSCRIPTION: Record<string, any>;
  BUDGET: Record<string, any>;
  TRIAL: Record<string, any>;
  STORAGE: Record<string, any>;
  SECURITY: Record<string, any>;
  ANALYTICS: Record<string, any>;
  PERFORMANCE: Record<string, any>;
  LOCALIZATION: Record<string, any>;
}

// Environment configuration
export const ENV = {
  IS_DEVELOPMENT: __DEV__,
  IS_PRODUCTION: !__DEV__,
  IS_TEST: process.env.NODE_ENV === 'test',
};

// App metadata
export const APP = {
  NAME: 'SubTrack',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  BUNDLE_ID: Platform.select({
    ios: 'com.subtrack.app',
    android: 'com.subtrack.app',
    default: 'com.subtrack.app',
  }),
  STORE_URL: {
    ios: 'https://apps.apple.com/app/idYOUR_APP_ID',
    android: 'https://play.google.com/store/apps/details?id=com.subtrack.app',
  },
  WEBSITE: 'https://subtrack.app',
  SUPPORT_EMAIL: 'support@subtrack.app',
  PRIVACY_POLICY: 'https://subtrack.app/privacy',
  TERMS_OF_SERVICE: 'https://subtrack.app/terms',
};

// Feature flags - Enable/disable features
export const FEATURES: FeatureFlags = {
  // Core features (always enabled)
  CORE: {
    SUBSCRIPTION_MANAGEMENT: true,
    DASHBOARD: true,
    NOTIFICATIONS: true,
    MULTI_CURRENCY: true,
    DARK_MODE: true,
  },
  
  // Premium features
  PREMIUM: {
    AI_INSIGHTS: true,
    FREE_TRIAL_MANAGER: true,
    BILL_SPLITTING: true,
    SUBSCRIPTION_COMPARISON: true,
    RECEIPT_SCANNER: true,
    SPENDING_LIMITS: true,
    SUBSCRIPTION_MARKETPLACE: true,
    PAYMENT_HISTORY: true,
    WIDGET_SUPPORT: true,
    BIOMETRIC_SECURITY: true,
    BACKUP_SYNC: true,
    GAMIFICATION: true,
    VOICE_COMMANDS: false, // Optional
    OFFLINE_MODE: true,
    SMART_CATEGORIES: true,
    CALENDAR_INTEGRATION: true,
    CUSTOM_REPORTS: true,
    SUBSCRIPTION_SCORE: true,
    FAMILY_PLANS: true,
    PRICE_DROP_ALERTS: true,
    SOCIAL_FEATURES: false, // Optional
    EXPENSE_EXPORT: true,
    PREDICTIVE_ANALYTICS: true,
    QR_CODE_SHARING: true,
    SUBSCRIPTION_PAUSE: true,
  },
  
  // Development features
  DEV: {
    DEBUG_MODE: __DEV__,
    SHOW_DEV_TOOLS: __DEV__,
    ENABLE_LOGGING: __DEV__,
    ENABLE_PERFORMANCE_MONITORING: __DEV__,
  },
};

// API Configuration
export const API = {
  BASE_URL: __DEV__ 
    ? 'https://dev-api.subtrack.app/v1' 
    : 'https://api.subtrack.app/v1',
  
  ENDPOINTS: {
    // Currency
    CURRENCY_RATES: 'https://api.exchangerate-api.com/v4/latest',
    CURRENCY_LIST: 'https://api.exchangerate-api.com/v4/codes',
    
    // Subscription Marketplace
    MARKETPLACE: '/marketplace',
    POPULAR_SERVICES: '/marketplace/popular',
    TRENDING_SERVICES: '/marketplace/trending',
    SERVICE_DETAILS: '/marketplace/service',
    
    // OCR & Receipt Scanning
    OCR_SERVICE: 'https://api.ocr.space/parse/image',
    
    // AI Insights
    AI_INSIGHTS: '/ai/insights',
    AI_RECOMMENDATIONS: '/ai/recommendations',
    
    // Backup & Sync
    BACKUP: '/backup',
    RESTORE: '/restore',
    SYNC: '/sync',
  },
  
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
};

// Notification Configuration
export const NOTIFICATIONS = {
  CHANNELS: {
    DEFAULT: {
      id: 'default',
      name: 'Default',
      importance: 4, // High importance
    },
    PAYMENT_REMINDERS: {
      id: 'payment-reminders',
      name: 'Payment Reminders',
      importance: 5, // Urgent
      sound: 'payment_reminder.wav',
    },
    BUDGET_ALERTS: {
      id: 'budget-alerts',
      name: 'Budget Alerts',
      importance: 4,
    },
    TRIAL_REMINDERS: {
      id: 'trial-reminders',
      name: 'Trial Reminders',
      importance: 5,
      sound: 'trial_reminder.wav',
    },
    INSIGHTS: {
      id: 'insights',
      name: 'Insights & Tips',
      importance: 3,
    },
  },
  
  REMINDER_TIMES: [1, 3, 7], // Days before payment
  DEFAULT_REMINDER_TIME: 1, // 1 day before
  
  QUIET_HOURS: {
    START: 22, // 10 PM
    END: 8,    // 8 AM
    ENABLED: true,
  },
};

// Currency Configuration
export const CURRENCY = {
  DEFAULT: 'USD',
  SUPPORTED: [
    'USD', // US Dollar
    'LKR', // Sri Lankan Rupee
    'EUR', // Euro
    'GBP', // British Pound
    'JPY', // Japanese Yen
    'AUD', // Australian Dollar
    'CAD', // Canadian Dollar
    'CHF', // Swiss Franc
    'CNY', // Chinese Yuan
    'INR', // Indian Rupee
    'SGD', // Singapore Dollar
    'MYR', // Malaysian Ringgit
    'THB', // Thai Baht
    'IDR', // Indonesian Rupiah
    'PKR', // Pakistani Rupee
    'BDT', // Bangladeshi Taka
    'NPR', // Nepalese Rupee
    'MVR', // Maldivian Rufiyaa
  ],
  
  UPDATE_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  FALLBACK_RATES: {
    USD: 1,
    LKR: 322.5,
    EUR: 0.92,
    GBP: 0.79,
  },
};

// Subscription Configuration
export const SUBSCRIPTION = {
  BILLING_CYCLES: [
    { id: 'daily', name: 'Daily', days: 1 },
    { id: 'weekly', name: 'Weekly', days: 7 },
    { id: 'biweekly', name: 'Bi-Weekly', days: 14 },
    { id: 'monthly', name: 'Monthly', days: 30 },
    { id: 'bimonthly', name: 'Bi-Monthly', days: 60 },
    { id: 'quarterly', name: 'Quarterly', days: 90 },
    { id: 'semiannually', name: 'Semi-Annually', days: 180 },
    { id: 'annually', name: 'Annually', days: 365 },
    { id: 'custom', name: 'Custom', days: null },
  ],
  
  STATUS: {
    ACTIVE: 'active',
    PENDING: 'pending',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    TRIAL: 'trial',
    PAUSED: 'paused',
  },
  
  DEFAULT_CATEGORY: 'other',
  MAX_SUBSCRIPTIONS: 100, // Limit for free tier
  MAX_NOTES_LENGTH: 500,
};

// Budget Configuration
export const BUDGET = {
  DEFAULT_MONTHLY_BUDGET: 100, // Default $100/month
  ALERT_THRESHOLDS: [0.5, 0.8, 0.9, 1], // 50%, 80%, 90%, 100%
  CATEGORY_LIMITS_ENABLED: true,
  BUDGET_ROLLOVER: false,
};

// Trial Configuration
export const TRIAL = {
  REMINDER_DAYS: [1, 3], // Days before trial ends
  AUTO_CANCEL_REMINDER: true,
  MAX_TRIALS: 20,
  DEFAULT_TRIAL_PERIOD: 30, // 30 days
};

// Storage Configuration
export const STORAGE = {
  VERSION: '1.0',
  BACKUP_INTERVAL: 7 * 24 * 60 * 60 * 1000, // 7 days
  MAX_BACKUP_SIZE: 10 * 1024 * 1024, // 10MB
  ENCRYPTION_ENABLED: true,
  
  KEYS: {
    SUBSCRIPTIONS: '@subtrack_subscriptions',
    SETTINGS: '@subtrack_settings',
    BUDGETS: '@subtrack_budgets',
    TRIALS: '@subtrack_trials',
    SPLITS: '@subtrack_splits',
    RECEIPTS: '@subtrack_receipts',
    USER: '@subtrack_user',
    BACKUP: '@subtrack_backup',
    CACHE: '@subtrack_cache',
  },
};

// Security Configuration
export const SECURITY = {
  PIN_LENGTH: 6,
  MAX_PIN_ATTEMPTS: 5,
  LOCK_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  BIOMETRIC_TIMEOUT: 30 * 1000, // 30 seconds
  
  ENCRYPTION: {
    ALGORITHM: 'AES-256-GCM',
    ITERATIONS: 10000,
    KEY_LENGTH: 256,
  },
};

// Analytics Configuration
export const ANALYTICS = {
  ENABLED: !__DEV__,
  SAMPLE_RATE: 1.0, // 100%
  
  EVENTS: {
    APP_LAUNCH: 'app_launch',
    SUBSCRIPTION_ADDED: 'subscription_added',
    SUBSCRIPTION_DELETED: 'subscription_deleted',
    PAYMENT_MADE: 'payment_made',
    NOTIFICATION_SENT: 'notification_sent',
    CURRENCY_CHANGED: 'currency_changed',
    THEME_CHANGED: 'theme_changed',
    BUDGET_SET: 'budget_set',
    TRIAL_ADDED: 'trial_added',
    RECEIPT_SCANNED: 'receipt_scanned',
    REPORT_GENERATED: 'report_generated',
    BACKUP_CREATED: 'backup_created',
    RESTORE_COMPLETED: 'restore_completed',
  },
};

// Performance Configuration
export const PERFORMANCE = {
  IMAGE_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_CACHED_IMAGES: 100,
  LAZY_LOAD_THRESHOLD: 10,
  VIRTUAL_LIST_WINDOW_SIZE: 21,
  
  DEBOUNCE: {
    SEARCH: 300,
    FORM_VALIDATION: 500,
    API_CALLS: 1000,
  },
};

// Localization Configuration
export const LOCALIZATION = {
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  ],
  
  DATE_FORMATS: {
    en: 'MM/dd/yyyy',
    si: 'yyyy/MM/dd',
    ta: 'dd/MM/yyyy',
  },
  
  CURRENCY_FORMATS: {
    en: '$0,0.00',
    si: '0,0.00 Rs',
    ta: '₹0,0.00',
  },
};

// Helper function to check if feature is enabled
export const isFeatureEnabled = (featurePath: string): boolean => {
  const parts = featurePath.split('.');
  let current: any = FEATURES;
  
  for (const part of parts) {
    if (current[part] === undefined) {
      return false;
    }
    current = current[part];
  }
  
  return current === true;
};

// Platform helpers
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

// Export everything
const appConfig: AppConfig = {
  ENV,
  APP,
  FEATURES,
  API,
  NOTIFICATIONS,
  CURRENCY,
  SUBSCRIPTION,
  BUDGET,
  TRIAL,
  STORAGE,
  SECURITY,
  ANALYTICS,
  PERFORMANCE,
  LOCALIZATION,
};

export default appConfig;
