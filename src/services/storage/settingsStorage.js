import MMKVStorage from 'react-native-mmkv-storage';

const MMKV = new MMKVStorage.Loader().initialize();

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: 'app_settings',
  USER_PREFERENCES: 'user_preferences',
  NOTIFICATION_SETTINGS: 'notification_settings',
  CURRENCY_SETTINGS: 'currency_settings',
  THEME_SETTINGS: 'theme_settings',
  BACKUP_SETTINGS: 'backup_settings',
  SECURITY_SETTINGS: 'security_settings',
  APP_FIRST_LAUNCH: 'app_first_launch',
  ONBOARDING_COMPLETE: 'onboarding_complete',
};

// Default settings
const DEFAULT_SETTINGS = {
  app: {
    version: '1.0.0',
    firstLaunch: true,
    onboardingComplete: false,
    lastBackup: null,
    lastSync: null,
    dataVersion: 1,
  },
  preferences: {
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    startOfWeek: 'monday',
    currencyFormat: 'symbol',
    showDecimals: true,
    hapticFeedback: true,
    sounds: true,
    animations: true,
    reduceMotion: false,
    highContrast: false,
  },
  notifications: {
    enabled: true,
    reminderDays: 1,
    paymentDayReminders: true,
    weeklySummary: true,
    priceChangeAlerts: true,
    trialEndReminders: true,
    budgetAlerts: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
    },
    sound: 'default',
    vibration: true,
    led: true,
  },
  currency: {
    primary: 'USD',
    secondary: 'LKR',
    showSecondary: false,
    autoUpdateRates: true,
    updateFrequency: 'daily',
    lastUpdate: null,
    rates: {},
  },
  theme: {
    mode: 'system', // 'light', 'dark', 'system'
    accentColor: '#4ECDC4',
    customTheme: null,
    fontSize: 'medium',
    fontFamily: 'system',
  },
  backup: {
    autoBackup: false,
    backupFrequency: 'weekly',
    cloudBackup: false,
    lastCloudBackup: null,
    includeImages: true,
    includeReceipts: true,
    backupLocation: 'local',
  },
  security: {
    pinEnabled: false,
    biometricEnabled: false,
    pinHash: null,
    lockTimeout: 5, // minutes
    privacyMode: false,
    hideAmounts: false,
    autoLock: true,
    secureStorage: true,
  },
  budget: {
    monthlyLimit: 0,
    categoryLimits: {},
    alertThreshold: 80, // percentage
    rolloverEnabled: false,
    notifications: true,
  },
  analytics: {
    shareAnonymousData: false,
    crashReports: true,
    usageAnalytics: true,
    personalizedInsights: true,
  },
};

/**
 * Settings Storage Service
 * Handles all app settings and user preferences
 */
class SettingsStorage {
  constructor() {
    this.initializeSettings();
  }

  /**
   * Initialize settings with defaults if not exist
   */
  async initializeSettings() {
    try {
      const settings = await this.getSettings();
      if (!settings) {
        await this.saveSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  }

  /**
   * Get all settings
   * @returns {Promise<Object>}
   */
  async getSettings() {
    try {
      const settings = await MMKV.getMapAsync(STORAGE_KEYS.SETTINGS);
      if (!settings) {
        return DEFAULT_SETTINGS;
      }
      
      // Merge with defaults to ensure all properties exist
      return this.deepMerge(DEFAULT_SETTINGS, settings);
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save all settings
   * @param {Object} settings
   * @returns {Promise<boolean>}
   */
  async saveSettings(settings) {
    try {
      await MMKV.setMapAsync(STORAGE_KEYS.SETTINGS, settings);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  /**
   * Get specific setting by path
   * @param {string} path - e.g., 'notifications.enabled'
   * @returns {Promise<any>}
   */
  async getSetting(path) {
    try {
      const settings = await this.getSettings();
      return this.getByPath(settings, path);
    } catch (error) {
      console.error(`Error getting setting ${path}:`, error);
      return null;
    }
  }

  /**
   * Update specific setting by path
   * @param {string} path - e.g., 'notifications.enabled'
   * @param {any} value
   * @returns {Promise<boolean>}
   */
  async updateSetting(path, value) {
    try {
      const settings = await this.getSettings();
      const updatedSettings = this.setByPath(settings, path, value);
      return await this.saveSettings(updatedSettings);
    } catch (error) {
      console.error(`Error updating setting ${path}:`, error);
      return false;
    }
  }

  /**
   * USER PREFERENCES
   */

  /**
   * Get user preferences
   * @returns {Promise<Object>}
   */
  async getUserPreferences() {
    return this.getSetting('preferences');
  }

  /**
   * Update user preferences
   * @param {Object} preferences
   * @returns {Promise<boolean>}
   */
  async updateUserPreferences(preferences) {
    return this.updateSetting('preferences', {
      ...(await this.getUserPreferences()),
      ...preferences,
    });
  }

  /**
   * Set app language
   * @param {string} language
   * @returns {Promise<boolean>}
   */
  async setLanguage(language) {
    return this.updateSetting('preferences.language', language);
  }

  /**
   * NOTIFICATION SETTINGS
   */

  /**
   * Get notification settings
   * @returns {Promise<Object>}
   */
  async getNotificationSettings() {
    return this.getSetting('notifications');
  }

  /**
   * Update notification settings
   * @param {Object} notificationSettings
   * @returns {Promise<boolean>}
   */
  async updateNotificationSettings(notificationSettings) {
    return this.updateSetting('notifications', {
      ...(await this.getNotificationSettings()),
      ...notificationSettings,
    });
  }

  /**
   * Toggle notifications
   * @param {boolean} enabled
   * @returns {Promise<boolean>}
   */
  async toggleNotifications(enabled) {
    return this.updateSetting('notifications.enabled', enabled);
  }

  /**
   * Set reminder days before payment
   * @param {number} days
   * @returns {Promise<boolean>}
   */
  async setReminderDays(days) {
    return this.updateSetting('notifications.reminderDays', days);
  }

  /**
   * CURRENCY SETTINGS
   */

  /**
   * Get currency settings
   * @returns {Promise<Object>}
   */
  async getCurrencySettings() {
    return this.getSetting('currency');
  }

  /**
   * Update currency settings
   * @param {Object} currencySettings
   * @returns {Promise<boolean>}
   */
  async updateCurrencySettings(currencySettings) {
    return this.updateSetting('currency', {
      ...(await this.getCurrencySettings()),
      ...currencySettings,
    });
  }

  /**
   * Set primary currency
   * @param {string} currencyCode
   * @returns {Promise<boolean>}
   */
  async setPrimaryCurrency(currencyCode) {
    return this.updateSetting('currency.primary', currencyCode);
  }

  /**
   * Set secondary currency
   * @param {string} currencyCode
   * @returns {Promise<boolean>}
   */
  async setSecondaryCurrency(currencyCode) {
    return this.updateSetting('currency.secondary', currencyCode);
  }

  /**
   * Toggle secondary currency display
   * @param {boolean} show
   * @returns {Promise<boolean>}
   */
  async toggleSecondaryCurrency(show) {
    return this.updateSetting('currency.showSecondary', show);
  }

  /**
   * Update exchange rates
   * @param {Object} rates
   * @returns {Promise<boolean>}
   */
  async updateExchangeRates(rates) {
    return this.updateSetting('currency.rates', rates);
  }

  /**
   * Set last update timestamp
   * @returns {Promise<boolean>}
   */
  async setLastExchangeRateUpdate() {
    return this.updateSetting('currency.lastUpdate', new Date().toISOString());
  }

  /**
   * THEME SETTINGS
   */

  /**
   * Get theme settings
   * @returns {Promise<Object>}
   */
  async getThemeSettings() {
    return this.getSetting('theme');
  }

  /**
   * Update theme settings
   * @param {Object} themeSettings
   * @returns {Promise<boolean>}
   */
  async updateThemeSettings(themeSettings) {
    return this.updateSetting('theme', {
      ...(await this.getThemeSettings()),
      ...themeSettings,
    });
  }

  /**
   * Set theme mode
   * @param {string} mode - 'light', 'dark', 'system'
   * @returns {Promise<boolean>}
   */
  async setThemeMode(mode) {
    return this.updateSetting('theme.mode', mode);
  }

  /**
   * Set accent color
   * @param {string} color
   * @returns {Promise<boolean>}
   */
  async setAccentColor(color) {
    return this.updateSetting('theme.accentColor', color);
  }

  /**
   * BACKUP SETTINGS
   */

  /**
   * Get backup settings
   * @returns {Promise<Object>}
   */
  async getBackupSettings() {
    return this.getSetting('backup');
  }

  /**
   * Update backup settings
   * @param {Object} backupSettings
   * @returns {Promise<boolean>}
   */
  async updateBackupSettings(backupSettings) {
    return this.updateSetting('backup', {
      ...(await this.getBackupSettings()),
      ...backupSettings,
    });
  }

  /**
   * Toggle auto backup
   * @param {boolean} enabled
   * @returns {Promise<boolean>}
   */
  async toggleAutoBackup(enabled) {
    return this.updateSetting('backup.autoBackup', enabled);
  }

  /**
   * Set last backup timestamp
   * @returns {Promise<boolean>}
   */
  async setLastBackupTimestamp() {
    return this.updateSetting('backup.lastCloudBackup', new Date().toISOString());
  }

  /**
   * SECURITY SETTINGS
   */

  /**
   * Get security settings
   * @returns {Promise<Object>}
   */
  async getSecuritySettings() {
    return this.getSetting('security');
  }

  /**
   * Update security settings
   * @param {Object} securitySettings
   * @returns {Promise<boolean>}
   */
  async updateSecuritySettings(securitySettings) {
    return this.updateSetting('security', {
      ...(await this.getSecuritySettings()),
      ...securitySettings,
    });
  }

  /**
   * Set PIN
   * @param {string} pin
   * @returns {Promise<boolean>}
   */
  async setPin(pin) {
    // In a real app, you should hash the PIN before storing
    const pinHash = this.hashPin(pin);
    return this.updateSetting('security.pinHash', pinHash);
  }

  /**
   * Verify PIN
   * @param {string} pin
   * @returns {Promise<boolean>}
   */
  async verifyPin(pin) {
    const securitySettings = await this.getSecuritySettings();
    const storedHash = securitySettings.pinHash;
    const inputHash = this.hashPin(pin);
    return storedHash === inputHash;
  }

  /**
   * Toggle biometric authentication
   * @param {boolean} enabled
   * @returns {Promise<boolean>}
   */
  async toggleBiometricAuth(enabled) {
    return this.updateSetting('security.biometricEnabled', enabled);
  }

  /**
   * Toggle privacy mode
   * @param {boolean} enabled
   * @returns {Promise<boolean>}
   */
  async togglePrivacyMode(enabled) {
    return this.updateSetting('security.privacyMode', enabled);
  }

  /**
   * APP STATE
   */

  /**
   * Check if app is first launch
   * @returns {Promise<boolean>}
   */
  async isFirstLaunch() {
    const settings = await this.getSettings();
    return settings.app.firstLaunch;
  }

  /**
   * Mark app as launched
   * @returns {Promise<boolean>}
   */
  async markAsLaunched() {
    return this.updateSetting('app.firstLaunch', false);
  }

  /**
   * Check if onboarding is complete
   * @returns {Promise<boolean>}
   */
  async isOnboardingComplete() {
    const settings = await this.getSettings();
    return settings.app.onboardingComplete;
  }

  /**
   * Mark onboarding as complete
   * @returns {Promise<boolean>}
   */
  async markOnboardingComplete() {
    return this.updateSetting('app.onboardingComplete', true);
  }

  /**
   * Get app version
   * @returns {Promise<string>}
   */
  async getAppVersion() {
    const settings = await this.getSettings();
    return settings.app.version;
  }

  /**
   * Set app version
   * @param {string} version
   * @returns {Promise<boolean>}
   */
  async setAppVersion(version) {
    return this.updateSetting('app.version', version);
  }

  /**
   * BUDGET SETTINGS
   */

  /**
   * Get budget settings
   * @returns {Promise<Object>}
   */
  async getBudgetSettings() {
    return this.getSetting('budget');
  }

  /**
   * Update budget settings
   * @param {Object} budgetSettings
   * @returns {Promise<boolean>}
   */
  async updateBudgetSettings(budgetSettings) {
    return this.updateSetting('budget', {
      ...(await this.getBudgetSettings()),
      ...budgetSettings,
    });
  }

  /**
   * Set monthly budget limit
   * @param {number} limit
   * @returns {Promise<boolean>}
   */
  async setMonthlyBudgetLimit(limit) {
    return this.updateSetting('budget.monthlyLimit', limit);
  }

  /**
   * Set category budget limit
   * @param {string} categoryId
   * @param {number} limit
   * @returns {Promise<boolean>}
   */
  async setCategoryBudgetLimit(categoryId, limit) {
    const budgetSettings = await this.getBudgetSettings();
    const categoryLimits = budgetSettings.categoryLimits || {};
    categoryLimits[categoryId] = limit;
    
    return this.updateSetting('budget.categoryLimits', categoryLimits);
  }

  /**
   * ANALYTICS SETTINGS
   */

  /**
   * Get analytics settings
   * @returns {Promise<Object>}
   */
  async getAnalyticsSettings() {
    return this.getSetting('analytics');
  }

  /**
   * Update analytics settings
   * @param {Object} analyticsSettings
   * @returns {Promise<boolean>}
   */
  async updateAnalyticsSettings(analyticsSettings) {
    return this.updateSetting('analytics', {
      ...(await this.getAnalyticsSettings()),
      ...analyticsSettings,
    });
  }

  /**
   * UTILITY METHODS
   */

  /**
   * Deep merge objects
   * @param {Object} target
   * @param {Object} source
   * @returns {Object}
   */
  deepMerge(target, source) {
    const output = { ...target };
    
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
   * @param {any} item
   * @returns {boolean}
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Get value by path
   * @param {Object} obj
   * @param {string} path
   * @returns {any}
   */
  getByPath(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  /**
   * Set value by path
   * @param {Object} obj
   * @param {string} path
   * @param {any} value
   * @returns {Object}
   */
  setByPath(obj, path, value) {
    const keys = path.split('.');
    const newObj = { ...obj };
    let current = newObj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return newObj;
  }

  /**
   * Simple PIN hash function (for demonstration)
   * In production, use proper hashing like bcrypt
   * @param {string} pin
   * @returns {string}
   */
  hashPin(pin) {
    // This is a simple hash for demonstration
    // In production, use: await bcrypt.hash(pin, 10);
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Reset all settings to defaults
   * @returns {Promise<boolean>}
   */
  async resetToDefaults() {
    try {
      await this.saveSettings(DEFAULT_SETTINGS);
      return true;
    } catch (error) {
      console.error('Error resetting settings:', error);
      return false;
    }
  }

  /**
   * Export settings as JSON
   * @returns {Promise<string>}
   */
  async exportSettings() {
    try {
      const settings = await this.getSettings();
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw error;
    }
  }

  /**
   * Import settings from JSON
   * @param {string} jsonString
   * @returns {Promise<boolean>}
   */
  async importSettings(jsonString) {
    try {
      const importedSettings = JSON.parse(jsonString);
      const currentSettings = await this.getSettings();
      
      // Merge imported settings with current (preserve sensitive data)
      const mergedSettings = this.deepMerge(currentSettings, importedSettings);
      
      // Don't overwrite security settings during import
      mergedSettings.security = currentSettings.security;
      
      await this.saveSettings(mergedSettings);
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  /**
   * Clear all settings (for testing/reset)
   * @returns {Promise<boolean>}
   */
  async clearAllSettings() {
    try {
      await MMKV.removeItem(STORAGE_KEYS.SETTINGS);
      await this.initializeSettings();
      return true;
    } catch (error) {
      console.error('Error clearing settings:', error);
      return false;
    }
  }
}

// Create singleton instance
const settingsStorage = new SettingsStorage();
export default settingsStorage;