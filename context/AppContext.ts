import NetInfo from '@react-native-community/netinfo';
import { analyticsService } from '@services/analytics/analyticsService';
import { syncService } from '@services/backup/cloudSync';
import { notificationsService } from '@services/notifications/notificationService';
import cacheStorage from '@services/storage/cacheStorage';
import settingsStorage from '@services/storage/settingsStorage';
import subscriptionStorage from '@services/storage/subscriptionStorage';
import * as SplashScreen from 'expo-splash-screen';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';

// Create context
const AppContext = createContext();

// Initial state
const initialState = {
  // App state
  isInitialized: false,
  isLoading: false,
  isError: false,
  errorMessage: '',
  appState: 'active', // 'active', 'background', 'inactive'
  
  // User state
  isAuthenticated: false,
  isOnboardingComplete: false,
  user: null,
  
  // App data
  subscriptions: [],
  categories: [],
  paymentHistory: [],
  upcomingPayments: [],
  subscriptionStats: null,
  
  // Settings
  settings: null,
  theme: 'light',
  currency: 'USD',
  language: 'en',
  
  // System state
  isConnected: true,
  connectionType: null,
  lastSync: null,
  lastBackup: null,
  
  // Feature flags
  features: {
    premium: false,
    familySharing: false,
    receiptScanner: false,
    aiInsights: false,
    billSplitting: false,
    marketplace: false,
  },
  
  // UI state
  selectedTab: 'dashboard',
  isSearchActive: false,
  searchQuery: '',
  selectedFilters: {},
  sortBy: 'name',
  sortOrder: 'asc',
  
  // App metrics
  appUsage: {
    sessions: 0,
    totalTime: 0,
    lastSessionStart: null,
    lastSessionEnd: null,
  },
  
  // Performance
  isPerformingHeavyTask: false,
  cacheStats: null,
};

// Custom hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Main provider component
export const AppProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  /**
   * APP INITIALIZATION
   */

  const initializeApp = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Keep splash screen visible while loading
      await SplashScreen.preventAutoHideAsync();
      
      // 1. Load settings
      const settings = await settingsStorage.getSettings();
      
      // 2. Check if onboarding is complete
      const isOnboardingComplete = settings.app.onboardingComplete;
      
      // 3. Load initial data if onboarding is complete
      let subscriptions = [];
      let categories = [];
      let subscriptionStats = null;
      let upcomingPayments = [];
      
      if (isOnboardingComplete) {
        subscriptions = await subscriptionStorage.getSubscriptions();
        categories = await subscriptionStorage.getCategories();
        subscriptionStats = await subscriptionStorage.getSubscriptionStats();
        upcomingPayments = await subscriptionStorage.getUpcomingPayments(7);
        
        // Initialize notifications
        await notificationsService.initialize();
        await notificationsService.scheduleAllReminders(subscriptions);
      }
      
      // 4. Load cache stats
      const cacheStats = await cacheStorage.getCacheInfo();
      
      // 5. Initialize analytics
      await analyticsService.initialize(settings.analytics);
      
      // 6. Check network connectivity
      const netInfo = await NetInfo.fetch();
      
      // Update state
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        isOnboardingComplete,
        settings,
        theme: settings.theme.mode,
        currency: settings.currency.primary,
        language: settings.preferences.language,
        subscriptions,
        categories,
        subscriptionStats,
        upcomingPayments,
        cacheStats,
        isConnected: netInfo.isConnected,
        connectionType: netInfo.type,
        user: settings.user || null,
        isAuthenticated: isOnboardingComplete,
      }));
      
      // Hide splash screen
      await SplashScreen.hideAsync();
      
    } catch (error) {
      console.error('Error initializing app:', error);
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        isError: true,
        errorMessage: error.message,
      }));
      await SplashScreen.hideAsync();
    }
  }, []);

  /**
   * APP STATE MANAGEMENT
   */

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = useCallback((nextAppState) => {
    if (state.appState.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground
      handleAppForeground();
    } else if (nextAppState === 'background') {
      // App went to background
      handleAppBackground();
    }
    
    setState(prev => ({ ...prev, appState: nextAppState }));
  }, [state.appState]);

  const handleAppForeground = useCallback(async () => {
    // Refresh data when app comes to foreground
    if (state.isOnboardingComplete) {
      await refreshData();
    }
    
    // Update session tracking
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      appUsage: {
        ...prev.appUsage,
        lastSessionStart: now,
        sessions: prev.appUsage.sessions + 1,
      },
    }));
  }, [state.isOnboardingComplete]);

  const handleAppBackground = useCallback(async () => {
    // Save session data
    const now = new Date().toISOString();
    const sessionStart = new Date(state.appUsage.lastSessionStart || now);
    const sessionEnd = new Date(now);
    const sessionDuration = (sessionEnd - sessionStart) / 1000; // in seconds
    
    setState(prev => ({
      ...prev,
      appUsage: {
        ...prev.appUsage,
        lastSessionEnd: now,
        totalTime: prev.appUsage.totalTime + sessionDuration,
      },
    }));
    
    // Auto-backup if enabled
    if (state.settings?.backup.autoBackup) {
      await syncService.backupToCloud();
    }
  }, [state.appUsage.lastSessionStart, state.settings]);

  /**
   * NETWORK MANAGEMENT
   */

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((networkState) => {
      setState(prev => ({
        ...prev,
        isConnected: networkState.isConnected,
        connectionType: networkState.type,
      }));
      
      // Sync data when connection is restored
      if (networkState.isConnected && state.isOnboardingComplete) {
        handleConnectionRestored();
      }
    });

    return () => unsubscribe();
  }, [state.isOnboardingComplete]);

  const handleConnectionRestored = useCallback(async () => {
    // Sync pending operations
    await syncService.syncPendingOperations();
    
    // Update exchange rates
    if (state.settings?.currency.autoUpdateRates) {
      await updateExchangeRates();
    }
  }, [state.settings]);

  /**
   * DATA MANAGEMENT
   */

  const refreshData = useCallback(async () => {
    if (!state.isOnboardingComplete) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const [
        subscriptions,
        categories,
        stats,
        upcomingPayments
      ] = await Promise.all([
        subscriptionStorage.getSubscriptions(),
        subscriptionStorage.getCategories(),
        subscriptionStorage.getSubscriptionStats(),
        subscriptionStorage.getUpcomingPayments(7),
      ]);
      
      setState(prev => ({
        ...prev,
        subscriptions,
        categories,
        subscriptionStats: stats,
        upcomingPayments,
        isLoading: false,
      }));
      
      // Cache the stats
      await cacheStorage.cacheSubscriptionStats(stats);
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        errorMessage: 'Failed to refresh data',
      }));
    }
  }, [state.isOnboardingComplete]);

  const updateExchangeRates = useCallback(async () => {
    try {
      // This would call your exchange rate API
      // For now, we'll just update the timestamp
      await settingsStorage.setLastExchangeRateUpdate();
      
      setState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          currency: {
            ...prev.settings.currency,
            lastUpdate: new Date().toISOString(),
          },
        },
      }));
    } catch (error) {
      console.error('Error updating exchange rates:', error);
    }
  }, []);

  /**
   * USER MANAGEMENT
   */

  const completeOnboarding = useCallback(async () => {
    try {
      await settingsStorage.markOnboardingComplete();
      await settingsStorage.markAsLaunched();
      
      setState(prev => ({
        ...prev,
        isOnboardingComplete: true,
        isAuthenticated: true,
      }));
      
      // Initialize notifications after onboarding
      await notificationsService.initialize();
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clear sensitive data
      await settingsStorage.updateSetting('security.pinHash', null);
      await settingsStorage.updateSetting('security.biometricEnabled', false);
      
      // Reset app state
      setState(prev => ({
        ...initialState,
        isInitialized: true,
        settings: prev.settings,
        theme: prev.theme,
      }));
      
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }, []);

  /**
   * SETTINGS MANAGEMENT
   */

  const updateSettings = useCallback(async (newSettings) => {
    try {
      await settingsStorage.saveSettings(newSettings);
      
      setState(prev => ({
        ...prev,
        settings: newSettings,
        theme: newSettings.theme.mode,
        currency: newSettings.currency.primary,
        language: newSettings.preferences.language,
      }));
      
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }, []);

  const updateSetting = useCallback(async (path, value) => {
    try {
      await settingsStorage.updateSetting(path, value);
      const updatedSettings = await settingsStorage.getSettings();
      
      setState(prev => ({
        ...prev,
        settings: updatedSettings,
        // Update derived state
        ...(path === 'theme.mode' && { theme: value }),
        ...(path === 'currency.primary' && { currency: value }),
        ...(path === 'preferences.language' && { language: value }),
      }));
      
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }, []);

  /**
   * SUBSCRIPTION MANAGEMENT
   */

  const addSubscription = useCallback(async (subscription) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const savedSubscription = await subscriptionStorage.saveSubscription(subscription);
      
      // Refresh data
      await refreshData();
      
      // Schedule notification
      await notificationsService.scheduleReminder(savedSubscription);
      
      // Track event
      await analyticsService.trackEvent('subscription_added', {
        category: savedSubscription.categoryId,
        amount: savedSubscription.amount,
      });
      
      return savedSubscription;
      
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [refreshData]);

  const updateSubscription = useCallback(async (id, updates) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const subscription = await subscriptionStorage.getSubscription(id);
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      const updatedSubscription = { ...subscription, ...updates };
      await subscriptionStorage.saveSubscription(updatedSubscription);
      
      // Refresh data
      await refreshData();
      
      // Update notification
      await notificationsService.cancelReminder(id);
      await notificationsService.scheduleReminder(updatedSubscription);
      
      return updatedSubscription;
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [refreshData]);

  const deleteSubscription = useCallback(async (id) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await subscriptionStorage.deleteSubscription(id);
      
      // Refresh data
      await refreshData();
      
      // Cancel notification
      await notificationsService.cancelReminder(id);
      
      // Track event
      await analyticsService.trackEvent('subscription_deleted');
      
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [refreshData]);

  const toggleSubscriptionStatus = useCallback(async (id) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const subscription = await subscriptionStorage.toggleSubscriptionStatus(id);
      
      if (subscription) {
        // Refresh data
        await refreshData();
        
        // Update notifications
        if (subscription.isActive) {
          await notificationsService.scheduleReminder(subscription);
        } else {
          await notificationsService.cancelReminder(id);
        }
      }
      
      return subscription;
      
    } catch (error) {
      console.error('Error toggling subscription status:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [refreshData]);

  const addPayment = useCallback(async (subscriptionId, paymentData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const payment = await subscriptionStorage.addPayment(subscriptionId, paymentData);
      
      // Refresh data
      await refreshData();
      
      // Track event
      await analyticsService.trackEvent('payment_added', {
        amount: payment.amount,
        currency: payment.currency,
      });
      
      return payment;
      
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [refreshData]);

  /**
   * SEARCH AND FILTER
   */

  const setSearchQuery = useCallback((query) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setSelectedFilters = useCallback((filters) => {
    setState(prev => ({ ...prev, selectedFilters: filters }));
  }, []);

  const setSortBy = useCallback((sortBy, sortOrder = 'asc') => {
    setState(prev => ({ ...prev, sortBy, sortOrder }));
  }, []);

  /**
   * UI STATE MANAGEMENT
   */

  const setSelectedTab = useCallback((tab) => {
    setState(prev => ({ ...prev, selectedTab: tab }));
  }, []);

  const setIsSearchActive = useCallback((isActive) => {
    setState(prev => ({ ...prev, isSearchActive: isActive }));
  }, []);

  const setError = useCallback((errorMessage) => {
    setState(prev => ({ ...prev, isError: true, errorMessage }));
    
    // Auto-clear error after 5 seconds
    setTimeout(() => {
      setState(prev => ({ ...prev, isError: false, errorMessage: '' }));
    }, 5000);
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, isError: false, errorMessage: '' }));
  }, []);

  const setIsPerformingHeavyTask = useCallback((isPerforming) => {
    setState(prev => ({ ...prev, isPerformingHeavyTask: isPerforming }));
  }, []);

  /**
   * EXPORT/IMPORT
   */

  const exportData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const data = await subscriptionStorage.exportData();
      const settings = await settingsStorage.exportSettings();
      
      return {
        ...data,
        settings: JSON.parse(settings),
        exportDate: new Date().toISOString(),
        appVersion: state.settings?.app.version || '1.0.0',
      };
      
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.settings]);

  const importData = useCallback(async (data) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Import subscription data
      if (data.subscriptions) {
        await subscriptionStorage.importData(data);
      }
      
      // Import settings (except security)
      if (data.settings) {
        await settingsStorage.importSettings(JSON.stringify(data.settings));
      }
      
      // Refresh all data
      await refreshData();
      
      // Reschedule all notifications
      const subscriptions = await subscriptionStorage.getSubscriptions();
      await notificationsService.scheduleAllReminders(subscriptions);
      
      // Track event
      await analyticsService.trackEvent('data_imported');
      
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [refreshData]);

  /**
   * CACHE MANAGEMENT
   */

  const clearCache = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await cacheStorage.clearAll();
      const cacheStats = await cacheStorage.getCacheInfo();
      
      setState(prev => ({
        ...prev,
        cacheStats,
        isLoading: false,
      }));
      
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }, []);

  /**
   * PROVIDER VALUE
   */

  const value = {
    // State
    ...state,
    
    // App lifecycle
    initializeApp,
    refreshData,
    
    // User management
    completeOnboarding,
    logout,
    
    // Settings management
    updateSettings,
    updateSetting,
    
    // Subscription management
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    addPayment,
    
    // Search and filter
    setSearchQuery,
    setSelectedFilters,
    setSortBy,
    
    // UI state
    setSelectedTab,
    setIsSearchActive,
    setError,
    clearError,
    setIsPerformingHeavyTask,
    
    // Data management
    exportData,
    importData,
    
    // Cache management
    clearCache,
  };

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Higher-order component for app context
export const withApp = (Component) => {
  return function WrappedComponent(props) {
    return (
      <AppProvider>
        <Component {...props} />
      </AppProvider>
    );
  };
};