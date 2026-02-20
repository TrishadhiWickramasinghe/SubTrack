import { useTrial } from '@context/TrialContext';
import { useCallback, useMemo } from 'react';

/**
 * useTrials Hook
 * Custom hook for accessing trial context and utilities
 */
export const useTrials = () => {
  const trialContext = useTrial();

  /**
   * Get all trials
   */
  const getAllTrials = useCallback(() => {
    return trialContext.trials || [];
  }, [trialContext.trials]);

  /**
   * Get active trials
   */
  const getActiveTrials = useCallback(() => {
    return trialContext.activeTrials || [];
  }, [trialContext.activeTrials]);

  /**
   * Get converted trials
   */
  const getConvertedTrials = useCallback(() => {
    return trialContext.convertedTrials || [];
  }, [trialContext.convertedTrials]);

  /**
   * Get cancelled trials
   */
  const getCancelledTrials = useCallback(() => {
    return trialContext.cancelledTrials || [];
  }, [trialContext.cancelledTrials]);

  /**
   * Get expired trials
   */
  const getExpiredTrials = useCallback(() => {
    return trialContext.expiredTrials || [];
  }, [trialContext.expiredTrials]);

  /**
   * Get trials expiring soon (within 3 days by default)
   */
  const getExpiringTrials = useCallback(() => {
    return trialContext.expiringTrials || [];
  }, [trialContext.expiringTrials]);

  /**
   * Get trials with high conversion likelihood
   */
  const getHighConversionTrials = useCallback(() => {
    return trialContext.highConversionTrials || [];
  }, [trialContext.highConversionTrials]);

  /**
   * Get trials with high churn risk
   */
  const getHighChurnRiskTrials = useCallback(() => {
    return trialContext.highChurnRiskTrials || [];
  }, [trialContext.highChurnRiskTrials]);

  /**
   * Get trial by ID
   */
  const getTrialById = useCallback(
    (trialId: string) => {
      return trialContext.trials?.find((trial: any) => trial.id === trialId) || null;
    },
    [trialContext.trials]
  );

  /**
   * Get trial by subscription ID
   */
  const getTrialBySubscriptionId = useCallback(
    (subscriptionId: string) => {
      return trialContext.trials?.find((trial: any) => trial.subscriptionId === subscriptionId) || null;
    },
    [trialContext.trials]
  );

  /**
   * Get total number of trials
   */
  const getTotalTrialsCount = useCallback(() => {
    return trialContext.trials?.length || 0;
  }, [trialContext.trials]);

  /**
   * Get active trials count
   */
  const getActiveTrialsCount = useCallback(() => {
    return trialContext.activeTrials?.length || 0;
  }, [trialContext.activeTrials]);

  /**
   * Get converted trials count
   */
  const getConvertedTrialsCount = useCallback(() => {
    return trialContext.convertedTrials?.length || 0;
  }, [trialContext.convertedTrials]);

  /**
   * Get trial stats
   */
  const getTrialStats = useCallback(() => {
    return trialContext.trialStats || {};
  }, [trialContext.trialStats]);

  /**
   * Get trial analytics
   */
  const getTrialAnalytics = useCallback(() => {
    return trialContext.trialAnalytics || {};
  }, [trialContext.trialAnalytics]);

  /**
   * Get conversion rate
   */
  const getConversionRate = useCallback(() => {
    return trialContext.trialAnalytics?.conversionRate || 0;
  }, [trialContext.trialAnalytics]);

  /**
   * Get average engagement score
   */
  const getAverageEngagementScore = useCallback(() => {
    return trialContext.trialAnalytics?.averageEngagementScore || 0;
  }, [trialContext.trialAnalytics]);

  /**
   * Get notifications
   */
  const getNotifications = useCallback(() => {
    return trialContext.notifications || [];
  }, [trialContext.notifications]);

  /**
   * Get retention offers
   */
  const getRetentionOffers = useCallback(() => {
    return trialContext.retentionOffers || [];
  }, [trialContext.retentionOffers]);

  /**
   * Check if any trial is loading
   */
  const isLoading = useMemo(() => {
    return trialContext.isLoading;
  }, [trialContext.isLoading]);

  /**
   * Check if trial data is refreshing
   */
  const isRefreshing = useMemo(() => {
    return trialContext.isRefreshing;
  }, [trialContext.isRefreshing]);

  /**
   * Check if editing mode is active
   */
  const isEditing = useMemo(() => {
    return trialContext.isEditing;
  }, [trialContext.isEditing]);

  /**
   * Get any error message
   */
  const getError = useCallback(() => {
    return trialContext.error;
  }, [trialContext.error]);

  /**
   * Check if there's an active error
   */
  const hasError = useMemo(() => {
    return !!trialContext.error;
  }, [trialContext.error]);

  /**
   * Get selected trial
   */
  const getSelectedTrial = useCallback(() => {
    if (!trialContext.selectedTrial) return null;
    return trialContext.trials?.find((trial: any) => trial.id === trialContext.selectedTrial) || null;
  }, [trialContext.selectedTrial, trialContext.trials]);

  /**
   * Select a trial by ID
   */
  const selectTrial = useCallback(
    (trialId: string | null) => {
      trialContext.selectTrial(trialId);
    },
    [trialContext]
  );

  /**
   * Create a new trial
   */
  const createTrial = useCallback(
    async (trialData: any) => {
      try {
        await trialContext.createTrial(trialData);
        return true;
      } catch (error) {
        console.error('Error creating trial:', error);
        throw error;
      }
    },
    [trialContext]
  );

  /**
   * Update trial
   */
  const updateTrial = useCallback(
    async (trialId: string, updates: any) => {
      try {
        await trialContext.updateTrial(trialId, updates);
        return true;
      } catch (error) {
        console.error('Error updating trial:', error);
        throw error;
      }
    },
    [trialContext]
  );

  /**
   * Delete trial
   */
  const deleteTrial = useCallback(
    async (trialId: string) => {
      try {
        await trialContext.deleteTrial(trialId);
        return true;
      } catch (error) {
        console.error('Error deleting trial:', error);
        throw error;
      }
    },
    [trialContext]
  );

  /**
   * Convert trial to paid subscription
   */
  const convertTrial = useCallback(
    async (trialId: string, paymentMethod: string) => {
      try {
        await trialContext.convertTrial(trialId, paymentMethod);
        return true;
      } catch (error) {
        console.error('Error converting trial:', error);
        throw error;
      }
    },
    [trialContext]
  );

  /**
   * Cancel trial
   */
  const cancelTrial = useCallback(
    async (trialId: string, reason?: string) => {
      try {
        await trialContext.cancelTrial(trialId, reason);
        return true;
      } catch (error) {
        console.error('Error cancelling trial:', error);
        throw error;
      }
    },
    [trialContext]
  );

  /**
   * Extend trial period
   */
  const extendTrial = useCallback(
    async (trialId: string, additionalDays: number) => {
      try {
        await trialContext.extendTrial(trialId, additionalDays);
        return true;
      } catch (error) {
        console.error('Error extending trial:', error);
        throw error;
      }
    },
    [trialContext]
  );

  /**
   * Apply promo code to trial
   */
  const applyPromoCode = useCallback(
    async (trialId: string, promoCode: string) => {
      try {
        await trialContext.applyPromoCode(trialId, promoCode);
        return true;
      } catch (error) {
        console.error('Error applying promo code:', error);
        throw error;
      }
    },
    [trialContext]
  );

  /**
   * Get trial days remaining
   */
  const getDaysRemaining = useCallback(
    (trial: any) => {
      return trial?.daysRemaining || 0;
    },
    []
  );

  /**
   * Check if trial is about to expire (within 3 days)
   */
  const isTrialExpiringSoon = useCallback(
    (trial: any) => {
      return trial?.daysRemaining <= 3;
    },
    []
  );

  /**
   * Get trial engagement status
   */
  const getEngagementStatus = useCallback(
    (trial: any) => {
      const score = trial?.engagementScore || 0;
      if (score >= 80) return 'high';
      if (score >= 50) return 'medium';
      return 'low';
    },
    []
  );

  /**
   * Get trial conversion likelihood
   */
  const getConversionLikelihood = useCallback(
    (trial: any) => {
      const likelihood = trial?.conversionLikelihood || 0;
      if (likelihood >= 70) return 'high';
      if (likelihood >= 40) return 'medium';
      return 'low';
    },
    []
  );

  /**
   * Get trial churn risk
   */
  const getChurnRisk = useCallback(
    (trial: any) => {
      const risk = trial?.churnRiskScore || 0;
      if (risk >= 70) return 'high';
      if (risk >= 40) return 'medium';
      return 'low';
    },
    []
  );

  /**
   * Refresh trial data
   */
  const refreshTrials = useCallback(async () => {
    try {
      await trialContext.refreshTrials();
      return true;
    } catch (error) {
      console.error('Error refreshing trials:', error);
      throw error;
    }
  }, [trialContext]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    trialContext.clearError();
  }, [trialContext]);

  /**
   * Set filter status
   */
  const setFilterStatus = useCallback(
    (status: 'all' | 'active' | 'converted' | 'cancelled' | 'expired') => {
      trialContext.setFilterStatus(status);
    },
    [trialContext]
  );

  /**
   * Set sort method
   */
  const setSortBy = useCallback(
    (sortBy: 'createdAt' | 'endDate' | 'engagementScore' | 'conversionLikelihood' | 'churnRisk') => {
      trialContext.setSortBy(sortBy);
    },
    [trialContext]
  );

  /**
   * Get sorted and filtered trials
   */
  const getSortedFilteredTrials = useCallback(() => {
    let trials = [...(trialContext.trials || [])];

    // Filter by status
    if (trialContext.filterStatus !== 'all') {
      trials = trials.filter((trial: any) => trial.status === trialContext.filterStatus);
    }

    // Filter by engaging status if enabled
    if (trialContext.filterEngaging) {
      trials = trials.filter((trial: any) => trial.engagementScore >= 50);
    }

    // Sort
    trials.sort((a: any, b: any) => {
      switch (trialContext.sortBy) {
        case 'endDate':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'engagementScore':
          return b.engagementScore - a.engagementScore;
        case 'conversionLikelihood':
          return b.conversionLikelihood - a.conversionLikelihood;
        case 'churnRisk':
          return b.churnRiskScore - a.churnRiskScore;
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return trials;
  }, [trialContext.trials, trialContext.filterStatus, trialContext.filterEngaging, trialContext.sortBy]);

  return {
    // State getters
    getAllTrials,
    getActiveTrials,
    getConvertedTrials,
    getCancelledTrials,
    getExpiredTrials,
    getExpiringTrials,
    getHighConversionTrials,
    getHighChurnRiskTrials,
    getTrialById,
    getTrialBySubscriptionId,
    getSelectedTrial,

    // Count getters
    getTotalTrialsCount,
    getActiveTrialsCount,
    getConvertedTrialsCount,

    // Stats and analytics
    getTrialStats,
    getTrialAnalytics,
    getConversionRate,
    getAverageEngagementScore,

    // Notifications and offers
    getNotifications,
    getRetentionOffers,

    // Loading and error states
    isLoading,
    isRefreshing,
    isEditing,
    getError,
    hasError,

    // Actions
    selectTrial,
    createTrial,
    updateTrial,
    deleteTrial,
    convertTrial,
    cancelTrial,
    extendTrial,
    applyPromoCode,
    refreshTrials,
    clearError,

    // Filtering and sorting
    setFilterStatus,
    setSortBy,
    getSortedFilteredTrials,

    // Utilities
    getDaysRemaining,
    isTrialExpiringSoon,
    getEngagementStatus,
    getConversionLikelihood,
    getChurnRisk,
  };
};
