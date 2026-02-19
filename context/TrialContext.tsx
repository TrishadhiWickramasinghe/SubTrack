/* eslint-disable @typescript-eslint/no-explicit-any */
import trialStorage from '@services/storage/trialStorage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useApp } from './AppContext';

// Create context
const TrialContext = createContext<any>(null);

// Type definitions
interface TrialState {
  trials: any[];
  activeTrials: any[];
  convertedTrials: any[];
  cancelledTrials: any[];
  expiredTrials: any[];
  expiringTrials: any[];
  selectedTrial: string | null;
  trialStats: any;
  trialAnalytics: any;
  notifications: any[];
  retentionOffers: any[];
  highConversionTrials: any[];
  highChurnRiskTrials: any[];
  
  // Filters and sorting
  filterStatus: 'all' | 'active' | 'converted' | 'cancelled' | 'expired';
  sortBy: 'createdAt' | 'endDate' | 'engagementScore' | 'conversionLikelihood' | 'churnRisk';
  filterEngaging: boolean;
  
  // UI state
  isLoading: boolean;
  isRefreshing: boolean;
  isEditing: boolean;
  error: string | null;
}

// Initial state
const initialState: TrialState = {
  trials: [],
  activeTrials: [],
  convertedTrials: [],
  cancelledTrials: [],
  expiredTrials: [],
  expiringTrials: [],
  selectedTrial: null,
  trialStats: {
    total: 0,
    active: 0,
    converted: 0,
    cancelled: 0,
    expired: 0,
    conversionRate: 0,
  },
  trialAnalytics: {
    totalTrialsCreated: 0,
    totalConverted: 0,
    totalCancelled: 0,
    conversionRate: 0,
    averageEngagementScore: 0,
    averageConversionLikelihood: 0,
  },
  notifications: [],
  retentionOffers: [],
  highConversionTrials: [],
  highChurnRiskTrials: [],
  
  filterStatus: 'all',
  sortBy: 'createdAt',
  filterEngaging: false,
  
  isLoading: false,
  isRefreshing: false,
  isEditing: false,
  error: null,
};

// Custom hook to use trial context
export const useTrial = () => {
  const context = useContext(TrialContext);
  if (!context) {
    throw new Error('useTrial must be used within a TrialProvider');
  }
  return context;
};

// Main provider component
export const TrialProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useApp();
  const [state, setState] = useState<TrialState>(initialState);

  /**
   * LOAD INITIAL DATA
   */
  useEffect(() => {
    if (settings?.app.onboardingComplete) {
      loadInitialData();
    }
  }, [settings]);

  const loadInitialData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const [
        trials,
        activeTrials,
        convertedTrials,
        cancelledTrials,
        expiredTrials,
        expiringTrials,
        stats,
        analytics,
        notifications,
        highConversionTrials,
        highChurnRiskTrials,
      ] = await Promise.all([
        Promise.resolve(trialStorage.getAllTrials()),
        Promise.resolve(trialStorage.getActiveTrials()),
        Promise.resolve(trialStorage.getConvertedTrials()),
        Promise.resolve(trialStorage.getCancelledTrials()),
        Promise.resolve(trialStorage.getExpiredTrials()),
        Promise.resolve(trialStorage.getTrialsExpiringSoon(3)),
        Promise.resolve(trialStorage.getTrialStats()),
        Promise.resolve(trialStorage.getAnalytics()),
        Promise.resolve(trialStorage.getNotifications()),
        Promise.resolve(trialStorage.getHighConversionLikelyhood(70)),
        Promise.resolve(trialStorage.getHighChurnRiskTrials(70)),
      ]);

      setState((prev) => ({
        ...prev,
        trials,
        activeTrials,
        convertedTrials,
        cancelledTrials,
        expiredTrials,
        expiringTrials,
        trialStats: stats,
        trialAnalytics: analytics,
        notifications,
        highConversionTrials,
        highChurnRiskTrials,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading initial trial data:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load trials',
      }));
    }
  }, [settings]);

  /**
   * TRIAL CRUD OPERATIONS
   */

  const addTrial = useCallback(async (trialData: any) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const newTrial = trialStorage.addTrial(trialData);

      // Refresh data
      await loadInitialData();

      return newTrial;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add trial';
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, [loadInitialData]);

  const updateTrial = useCallback(async (trialId: string, updates: any) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const updatedTrial = trialStorage.updateTrial(trialId, updates);

      // Refresh data
      await loadInitialData();

      return updatedTrial;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update trial';
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, [loadInitialData]);

  const deleteTrial = useCallback(async (trialId: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      trialStorage.deleteTrial(trialId);

      // Refresh data
      await loadInitialData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete trial';
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, [loadInitialData]);

  /**
   * TRIAL STATUS OPERATIONS
   */

  const convertTrialToPaid = useCallback(
    async (trialId: string, paymentMethod: string, convertedPrice: number, tier: string = 'standard') => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const converted = trialStorage.convertTrialToPaid(trialId, paymentMethod, convertedPrice, tier);

        // Refresh data
        await loadInitialData();

        return converted;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to convert trial';
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        throw error;
      }
    },
    [loadInitialData]
  );

  const cancelTrial = useCallback(
    async (trialId: string, reason: string = '', refundAmount: number | null = null) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const cancelled = trialStorage.cancelTrial(trialId, reason, refundAmount);

        // Refresh data
        await loadInitialData();

        return cancelled;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel trial';
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        throw error;
      }
    },
    [loadInitialData]
  );

  const expireTrial = useCallback(
    async (trialId: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const expired = trialStorage.expireTrial(trialId);

        // Refresh data
        await loadInitialData();

        return expired;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to expire trial';
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        throw error;
      }
    },
    [loadInitialData]
  );

  /**
   * TRIAL ENGAGEMENT TRACKING
   */

  const recordTrialLogin = useCallback(async (trialId: string) => {
    try {
      trialStorage.recordTrialLogin(trialId);
      // Refresh specific trial data
      await loadInitialData();
    } catch (error) {
      console.error('Error recording trial login:', error);
    }
  }, [loadInitialData]);

  const recordTrialAction = useCallback(async (trialId: string, actionType: string = 'general') => {
    try {
      trialStorage.recordTrialAction(trialId, actionType);
      // Refresh specific trial data
      await loadInitialData();
    } catch (error) {
      console.error('Error recording trial action:', error);
    }
  }, [loadInitialData]);

  /**
   * NOTIFICATIONS
   */

  const sendNotification = useCallback(async (trialId: string, notificationType: string, message: string) => {
    try {
      trialStorage.recordNotification(trialId, notificationType, message);
      await loadInitialData();
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [loadInitialData]);

  const getNotificationsForTrial = useCallback((trialId: string) => {
    return trialStorage.getNotificationsForTrial(trialId);
  }, []);

  const clearNotificationsForTrial = useCallback(async (trialId: string) => {
    try {
      trialStorage.clearNotificationsForTrial(trialId);
      await loadInitialData();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [loadInitialData]);

  /**
   * RETENTION OFFERS
   */

  const addRetentionOffer = useCallback(async (trialId: string, offer: any) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const newOffer = trialStorage.addRetentionOffer(trialId, offer);

      // Refresh data
      await loadInitialData();

      return newOffer;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add retention offer';
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, [loadInitialData]);

  const acceptRetentionOffer = useCallback(async (offerId: string) => {
    try {
      trialStorage.acceptRetentionOffer(offerId);
      await loadInitialData();
    } catch (error) {
      console.error('Error accepting retention offer:', error);
    }
  }, [loadInitialData]);

  /**
   * FILTERING AND SORTING
   */

  const setFilterStatus = useCallback((status: 'all' | 'active' | 'converted' | 'cancelled' | 'expired') => {
    setState((prev) => ({ ...prev, filterStatus: status }));
  }, []);

  const setSortBy = useCallback(
    (sortBy: 'createdAt' | 'endDate' | 'engagementScore' | 'conversionLikelihood' | 'churnRisk') => {
      setState((prev) => ({ ...prev, sortBy }));
    },
    []
  );

  const setFilterEngaging = useCallback((filterEngaging: boolean) => {
    setState((prev) => ({ ...prev, filterEngaging }));
  }, []);

  /**
   * GET TRIALS BY FILTERS
   */

  const getTrialsBySubscription = useCallback((subscriptionId: string) => {
    return trialStorage.getTrialsBySubscription(subscriptionId);
  }, []);

  const getTrialsByUser = useCallback((userId: string) => {
    return trialStorage.getTrialsByUser(userId);
  }, []);

  /**
   * ANALYTICS
   */

  const updateAnalyticsScores = useCallback(async () => {
    try {
      trialStorage.updateAnalyticsScores();
      await loadInitialData();
    } catch (error) {
      console.error('Error updating analytics scores:', error);
    }
  }, [loadInitialData]);

  /**
   * REFRESH
   */

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isRefreshing: true }));
    try {
      await loadInitialData();
    } finally {
      setState((prev) => ({ ...prev, isRefreshing: false }));
    }
  }, [loadInitialData]);

  /**
   * CLEAR ERROR
   */

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * MEMOIZED VALUE
   */

  const value = useMemo(
    () => ({
      // State
      trials: state.trials,
      activeTrials: state.activeTrials,
      convertedTrials: state.convertedTrials,
      cancelledTrials: state.cancelledTrials,
      expiredTrials: state.expiredTrials,
      expiringTrials: state.expiringTrials,
      selectedTrial: state.selectedTrial,
      trialStats: state.trialStats,
      trialAnalytics: state.trialAnalytics,
      notifications: state.notifications,
      retentionOffers: state.retentionOffers,
      highConversionTrials: state.highConversionTrials,
      highChurnRiskTrials: state.highChurnRiskTrials,

      // Filters
      filterStatus: state.filterStatus,
      sortBy: state.sortBy,
      filterEngaging: state.filterEngaging,

      // UI
      isLoading: state.isLoading,
      isRefreshing: state.isRefreshing,
      isEditing: state.isEditing,
      error: state.error,

      // Methods - CRUD
      addTrial,
      updateTrial,
      deleteTrial,

      // Methods - Status
      convertTrialToPaid,
      cancelTrial,
      expireTrial,

      // Methods - Engagement
      recordTrialLogin,
      recordTrialAction,

      // Methods - Notifications
      sendNotification,
      getNotificationsForTrial,
      clearNotificationsForTrial,

      // Methods - Retention
      addRetentionOffer,
      acceptRetentionOffer,

      // Methods - Filtering
      setFilterStatus,
      setSortBy,
      setFilterEngaging,

      // Methods - Queries
      getTrialsBySubscription,
      getTrialsByUser,

      // Methods - Analytics
      updateAnalyticsScores,

      // Methods - UI
      refresh,
      clearError,
    }),
    [
      state,
      addTrial,
      updateTrial,
      deleteTrial,
      convertTrialToPaid,
      cancelTrial,
      expireTrial,
      recordTrialLogin,
      recordTrialAction,
      sendNotification,
      getNotificationsForTrial,
      clearNotificationsForTrial,
      addRetentionOffer,
      acceptRetentionOffer,
      setFilterStatus,
      setSortBy,
      setFilterEngaging,
      getTrialsBySubscription,
      getTrialsByUser,
      updateAnalyticsScores,
      refresh,
      clearError,
    ]
  );

  return <TrialContext.Provider value={value}>{children}</TrialContext.Provider>;
};

export default TrialContext;
