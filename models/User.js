/**
 * User Model
 * For managing user profiles and preferences
 */

import { v4 as uuidv4 } from 'uuid';

// User roles
export const UserRole = {
  FREE: 'free',
  PREMIUM: 'premium',
  FAMILY_ADMIN: 'family_admin',
  FAMILY_MEMBER: 'family_member',
  ADMIN: 'admin',
};

// Theme preferences
export const ThemePreference = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
  SYSTEM: 'system',
};

// Notification preferences
export const NotificationPreference = {
  ALL: 'all',
  IMPORTANT: 'important',
  NONE: 'none',
};

// Currency display formats
export const CurrencyFormat = {
  SYMBOL: 'symbol', // $100
  CODE: 'code', // USD 100
  SYMBOL_WITH_SPACE: 'symbol_with_space', // $ 100
  CODE_WITH_SPACE: 'code_with_space', // USD 100
};

/**
 * User class representing the app user
 */
export default class User {
  constructor(data = {}) {
    // Core identification
    this.id = data.id || uuidv4();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // Authentication
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.isEmailVerified = data.isEmailVerified || false;
    this.isPhoneVerified = data.isPhoneVerified || false;
    this.authProvider = data.authProvider || 'local'; // local, google, apple, facebook
    this.authId = data.authId || ''; // Provider's user ID
    
    // Profile information
    this.name = data.name || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.avatar = data.avatar || null; // URL or local path
    this.bio = data.bio || '';
    this.dateOfBirth = data.dateOfBirth || null;
    this.gender = data.gender || '';
    
    // Preferences
    this.preferences = {
      // Theme
      theme: data.preferences?.theme || ThemePreference.AUTO,
      accentColor: data.preferences?.accentColor || '#6366F1',
      fontSize: data.preferences?.fontSize || 'medium', // small, medium, large
      reduceAnimations: data.preferences?.reduceAnimations || false,
      
      // Language and region
      language: data.preferences?.language || 'en',
      country: data.preferences?.country || 'US',
      timezone: data.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: data.preferences?.dateFormat || 'MM/DD/YYYY',
      timeFormat: data.preferences?.timeFormat || '12h', // 12h or 24h
      
      // Currency
      defaultCurrency: data.preferences?.defaultCurrency || 'USD',
      currencyFormat: data.preferences?.currencyFormat || CurrencyFormat.SYMBOL,
      showCurrencySymbol: data.preferences?.showCurrencySymbol !== undefined ? data.preferences.showCurrencySymbol : true,
      decimalPlaces: data.preferences?.decimalPlaces || 2,
      
      // Notifications
      notifications: data.preferences?.notifications || NotificationPreference.ALL,
      notificationSound: data.preferences?.notificationSound || 'default',
      notificationVibration: data.preferences?.notificationVibration !== undefined ? data.preferences.notificationVibration : true,
      quietHours: data.preferences?.quietHours || {
        enabled: false,
        start: '22:00', // 10 PM
        end: '08:00',   // 8 AM
      },
      
      // Security
      biometricAuth: data.preferences?.biometricAuth || false,
      pinAuth: data.preferences?.pinAuth || false,
      autoLock: data.preferences?.autoLock || 5, // Minutes, 0 = never
      hideAmounts: data.preferences?.hideAmounts || false,
      
      // Data management
      autoBackup: data.preferences?.autoBackup || false,
      backupFrequency: data.preferences?.backupFrequency || 'weekly', // daily, weekly, monthly
      backupToCloud: data.preferences?.backupToCloud || false,
      cloudProvider: data.preferences?.cloudProvider || 'google_drive', // google_drive, dropbox, icloud
      
      // Privacy
      analyticsEnabled: data.preferences?.analyticsEnabled !== undefined ? data.preferences.analyticsEnabled : true,
      crashReportsEnabled: data.preferences?.crashReportsEnabled !== undefined ? data.preferences.crashReportsEnabled : true,
      shareAnonymousData: data.preferences?.shareAnonymousData || false,
      
      // App behavior
      onboardingCompleted: data.preferences?.onboardingCompleted || false,
      showTutorials: data.preferences?.showTutorials !== undefined ? data.preferences.showTutorials : true,
      defaultView: data.preferences?.defaultView || 'dashboard', // dashboard, subscriptions, analytics
      quickAddEnabled: data.preferences?.quickAddEnabled !== undefined ? data.preferences.quickAddEnabled : true,
    };
    
    // Subscription plan
    this.role = data.role || UserRole.FREE;
    this.plan = data.plan || 'free'; // free, premium, family
    this.planStartDate = data.planStartDate || null;
    this.planEndDate = data.planEndDate || null;
    this.planAutoRenew = data.planAutoRenew || false;
    this.planPrice = data.planPrice || 0;
    
    // Family sharing
    this.familyId = data.familyId || null;
    this.familyRole = data.familyRole || null;
    this.familyMembers = data.familyMembers || []; // Array of user IDs
    this.sharedSubscriptions = data.sharedSubscriptions || []; // Array of subscription IDs
    
    // Statistics
    this.stats = {
      totalSubscriptions: data.stats?.totalSubscriptions || 0,
      activeSubscriptions: data.stats?.activeSubscriptions || 0,
      monthlySpending: data.stats?.monthlySpending || 0,
      yearlySpending: data.stats?.yearlySpending || 0,
      totalSavings: data.stats?.totalSavings || 0, // Amount saved through cancellations
      streakDays: data.stats?.streakDays || 0, // Days without adding new subscriptions
      lastActive: data.stats?.lastActive || new Date().toISOString(),
      appLaunches: data.stats?.appLaunches || 0,
      notificationCount: data.stats?.notificationCount || 0,
    };
    
    // Achievements and gamification
    this.achievements = data.achievements || [];
    this.badges = data.badges || [];
    this.points = data.points || 0;
    this.level = data.level || 1;
    this.experience = data.experience || 0;
    
    // Financial goals
    this.financialGoals = data.financialGoals || [];
    this.monthlyBudget = data.monthlyBudget || 0;
    this.yearlyBudget = data.yearlyBudget || 0;
    this.savingsGoal = data.savingsGoal || 0;
    
    // Device information
    this.devices = data.devices || [];
    this.lastDevice = data.lastDevice || null;
    this.lastLogin = data.lastLogin || new Date().toISOString();
    this.loginCount = data.loginCount || 0;
    
    // Security
    this.security = {
      lastPasswordChange: data.security?.lastPasswordChange || null,
      failedLoginAttempts: data.security?.failedLoginAttempts || 0,
      lastFailedLogin: data.security?.lastFailedLogin || null,
      ipAddresses: data.security?.ipAddresses || [],
      twoFactorEnabled: data.security?.twoFactorEnabled || false,
      recoveryEmail: data.security?.recoveryEmail || '',
      recoveryPhone: data.security?.recoveryPhone || '',
    };
    
    // Metadata
    this.version = data.version || 1;
    this.isDeleted = data.isDeleted || false;
    this.deletedAt = data.deletedAt || null;
    this.syncStatus = data.syncStatus || 'synced';
    this.metadata = data.metadata || {};
  }

  /**
   * Update user statistics
   */
  updateStats(updates = {}) {
    this.stats = { ...this.stats, ...updates };
    this.stats.lastActive = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Increment app launches
   */
  incrementAppLaunches() {
    this.stats.appLaunches += 1;
    this.stats.lastActive = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Update spending statistics
   */
  updateSpendingStats(monthlySpending, yearlySpending) {
    this.stats.monthlySpending = monthlySpending;
    this.stats.yearlySpending = yearlySpending;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Update subscription counts
   */
  updateSubscriptionCounts(total, active) {
    this.stats.totalSubscriptions = total;
    this.stats.activeSubscriptions = active;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Add savings amount
   */
  addSavings(amount) {
    this.stats.totalSavings += amount;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Update streak
   */
  updateStreak(days) {
    this.stats.streakDays = days;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Add achievement
   */
  addAchievement(achievement) {
    if (!this.achievements.find(a => a.id === achievement.id)) {
      this.achievements.push({
        ...achievement,
        earnedAt: new Date().toISOString(),
      });
      this.updatedAt = new Date().toISOString();
    }
    return this;
  }

  /**
   * Add badge
   */
  addBadge(badge) {
    if (!this.badges.find(b => b.id === badge.id)) {
      this.badges.push({
        ...badge,
        earnedAt: new Date().toISOString(),
      });
      this.updatedAt = new Date().toISOString();
    }
    return this;
  }

  /**
   * Add points
   */
  addPoints(points, reason = '') {
    this.points += points;
    this.experience += points;
    
    // Level up based on experience
    const newLevel = Math.floor(this.experience / 1000) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
    }
    
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Set preference
   */
  setPreference(key, value) {
    this.preferences[key] = value;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Get preference with fallback
   */
  getPreference(key, defaultValue = null) {
    return this.preferences[key] !== undefined ? this.preferences[key] : defaultValue;
  }

  /**
   * Check if user has premium features
   */
  hasPremium() {
    return this.role === UserRole.PREMIUM || 
           this.role === UserRole.FAMILY_ADMIN || 
           this.role === UserRole.ADMIN;
  }

  /**
   * Check if user is in a family
   */
  isInFamily() {
    return !!this.familyId;
  }

  /**
   * Check if user is family admin
   */
  isFamilyAdmin() {
    return this.familyRole === 'admin' || this.role === UserRole.FAMILY_ADMIN;
  }

  /**
   * Add family member
   */
  addFamilyMember(userId, role = 'member') {
    if (!this.familyMembers.includes(userId)) {
      this.familyMembers.push(userId);
      this.updatedAt = new Date().toISOString();
    }
    return this;
  }

  /**
   * Remove family member
   */
  removeFamilyMember(userId) {
    const index = this.familyMembers.indexOf(userId);
    if (index > -1) {
      this.familyMembers.splice(index, 1);
      this.updatedAt = new Date().toISOString();
    }
    return this;
  }

  /**
   * Share subscription with family
   */
  shareSubscription(subscriptionId) {
    if (!this.sharedSubscriptions.includes(subscriptionId)) {
      this.sharedSubscriptions.push(subscriptionId);
      this.updatedAt = new Date().toISOString();
    }
    return this;
  }

  /**
   * Unshare subscription
   */
  unshareSubscription(subscriptionId) {
    const index = this.sharedSubscriptions.indexOf(subscriptionId);
    if (index > -1) {
      this.sharedSubscriptions.splice(index, 1);
      this.updatedAt = new Date().toISOString();
    }
    return this;
  }

  /**
   * Add device information
   */
  addDevice(deviceInfo) {
    const existingDevice = this.devices.find(d => d.deviceId === deviceInfo.deviceId);
    
    if (existingDevice) {
      // Update existing device
      Object.assign(existingDevice, deviceInfo);
      existingDevice.lastSeen = new Date().toISOString();
    } else {
      // Add new device
      this.devices.push({
        ...deviceInfo,
        addedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      });
    }
    
    this.lastDevice = deviceInfo.deviceId;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Record login
   */
  recordLogin(deviceInfo = null) {
    this.lastLogin = new Date().toISOString();
    this.loginCount += 1;
    
    if (deviceInfo) {
      this.addDevice(deviceInfo);
    }
    
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Record failed login attempt
   */
  recordFailedLogin(ipAddress = '') {
    this.security.failedLoginAttempts += 1;
    this.security.lastFailedLogin = new Date().toISOString();
    
    if (ipAddress && !this.security.ipAddresses.includes(ipAddress)) {
      this.security.ipAddresses.push(ipAddress);
    }
    
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Reset failed login attempts
   */
  resetFailedLogins() {
    this.security.failedLoginAttempts = 0;
    this.security.lastFailedLogin = null;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Upgrade to premium
   */
  upgradeToPremium(planDetails = {}) {
    this.role = UserRole.PREMIUM;
    this.plan = 'premium';
    this.planStartDate = new Date().toISOString();
    this.planEndDate = planDetails.endDate || null;
    this.planAutoRenew = planDetails.autoRenew || true;
    this.planPrice = planDetails.price || 0;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Downgrade to free
   */
  downgradeToFree() {
    this.role = UserRole.FREE;
    this.plan = 'free';
    this.planEndDate = null;
    this.planAutoRenew = false;
    this.planPrice = 0;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Get user summary for display
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      role: this.role,
      plan: this.plan,
      stats: {
        activeSubscriptions: this.stats.activeSubscriptions,
        monthlySpending: this.stats.monthlySpending,
        totalSavings: this.stats.totalSavings,
        streakDays: this.stats.streakDays,
      },
      preferences: {
        theme: this.preferences.theme,
        defaultCurrency: this.preferences.defaultCurrency,
        language: this.preferences.language,
      },
      isPremium: this.hasPremium(),
      isInFamily: this.isInFamily(),
    };
  }

  /**
   * Validate user data
   */
  validate() {
    const errors = [];
    
    if (!this.email && !this.phone) {
      errors.push('Email or phone number is required');
    }
    
    if (this.email && !this.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }
    
    if (!this.name.trim()) {
      errors.push('Name is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      email: this.email,
      phone: this.phone,
      isEmailVerified: this.isEmailVerified,
      isPhoneVerified: this.isPhoneVerified,
      authProvider: this.authProvider,
      authId: this.authId,
      name: this.name,
      firstName: this.firstName,
      lastName: this.lastName,
      avatar: this.avatar,
      bio: this.bio,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      preferences: this.preferences,
      role: this.role,
      plan: this.plan,
      planStartDate: this.planStartDate,
      planEndDate: this.planEndDate,
      planAutoRenew: this.planAutoRenew,
      planPrice: this.planPrice,
      familyId: this.familyId,
      familyRole: this.familyRole,
      familyMembers: this.familyMembers,
      sharedSubscriptions: this.sharedSubscriptions,
      stats: this.stats,
      achievements: this.achievements,
      badges: this.badges,
      points: this.points,
      level: this.level,
      experience: this.experience,
      financialGoals: this.financialGoals,
      monthlyBudget: this.monthlyBudget,
      yearlyBudget: this.yearlyBudget,
      savingsGoal: this.savingsGoal,
      devices: this.devices,
      lastDevice: this.lastDevice,
      lastLogin: this.lastLogin,
      loginCount: this.loginCount,
      security: this.security,
      version: this.version,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
      syncStatus: this.syncStatus,
      metadata: this.metadata,
    };
  }

  /**
   * Create User instance from JSON data
   */
  static fromJSON(data) {
    return new User(data);
  }

  /**
   * Create guest user
   */
  static createGuest() {
    return new User({
      name: 'Guest',
      role: UserRole.FREE,
      preferences: {
        onboardingCompleted: false,
      },
    });
  }

  /**
   * Create demo user for onboarding
   */
  static createDemoUser() {
    return new User({
      name: 'Demo User',
      email: 'demo@subtrack.app',
      role: UserRole.PREMIUM,
      preferences: {
        onboardingCompleted: true,
        theme: ThemePreference.AUTO,
        defaultCurrency: 'USD',
        notifications: NotificationPreference.ALL,
      },
      stats: {
        totalSubscriptions: 8,
        activeSubscriptions: 6,
        monthlySpending: 89.95,
        yearlySpending: 1079.40,
        totalSavings: 240.00,
        streakDays: 14,
      },
    });
  }
}

// Export constants
export { CurrencyFormat, NotificationPreference, ThemePreference, UserRole };
