import { analyticsService } from '@services/analytics/analyticsService';
import { notificationsService } from '@services/notifications/notificationService';
import cacheStorage from '@services/storage/cacheStorage';
import subscriptionStorage from '@services/storage/subscriptionStorage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useApp } from './AppContext';

// Create context
const SubscriptionContext = createContext();

// Initial state
const initialState = {
  // Subscription data
  subscriptions: [],
  categories: [],
  paymentHistory: [],
  upcomingPayments: [],
  
  // Statistics
  subscriptionStats: null,
  categoryStats: {},
  monthlySpending: 0,
  yearlySpending: 0,
  
  // Filtering and search
  filteredSubscriptions: [],
  searchQuery: '',
  selectedFilters: {
    category: null,
    status: 'active',
    billingCycle: null,
    priceRange: null,
  },
  sortBy: 'name',
  sortOrder: 'asc',
  
  // UI state
  isLoading: false,
  isRefreshing: false,
  selectedSubscription: null,
  isEditing: false,
  
  // Analytics
  spendingTrends: [],
  monthlyComparison: [],
  categoryBreakdown: [],
  
  // Insights
  insights: [],
  recommendations: [],
  
  // Budget
  budgetStatus: null,
  overspendingCategories: [],
};

// Custom hook to use subscription context
export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
};

// Main provider component
export const SubscriptionProvider = ({ children }) => {
  const { settings, currency, isConnected } = useApp();
  const [state, setState] = useState(initialState);

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
      
      // Calculate filtered subscriptions
      const filteredSubscriptions = filterAndSortSubscriptions(
        subscriptions,
        state.searchQuery,
        state.selectedFilters,
        state.sortBy,
        state.sortOrder
      );
      
      // Calculate analytics
      const spendingTrends = calculateSpendingTrends(subscriptions);
      const monthlyComparison = calculateMonthlyComparison(subscriptions);
      const categoryBreakdown = calculateCategoryBreakdown(stats.categoryStats, categories);
      
      // Generate insights
      const insights = generateInsights(subscriptions, stats);
      const recommendations = generateRecommendations(subscriptions, stats);
      
      // Calculate budget status
      const budgetStatus = calculateBudgetStatus(stats.monthlyTotal, settings?.budget);
      const overspendingCategories = findOverspendingCategories(
        stats.categoryStats,
        settings?.budget?.categoryLimits
      );
      
      setState(prev => ({
        ...prev,
        subscriptions,
        categories,
        subscriptionStats: stats,
        upcomingPayments,
        filteredSubscriptions,
        spendingTrends,
        monthlyComparison,
        categoryBreakdown,
        insights,
        recommendations,
        budgetStatus,
        overspendingCategories,
        isLoading: false,
      }));
      
      // Cache the data
      await cacheStorage.cacheSubscriptionStats(stats);
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [settings, state.searchQuery, state.selectedFilters, state.sortBy, state.sortOrder]);

  /**
   * SUBSCRIPTION CRUD OPERATIONS
   */

  const addSubscription = useCallback(async (subscriptionData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Generate subscription ID
      const subscription = {
        ...subscriptionData,
        id: subscriptionData.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        paymentHistory: [],
      };
      
      // Save to storage
      const savedSubscription = await subscriptionStorage.saveSubscription(subscription);
      
      // Refresh data
      await refreshData();
      
      // Schedule notification
      await notificationsService.scheduleReminder(savedSubscription);
      
      // Track analytics
      await analyticsService.trackEvent('subscription_added', {
        category: savedSubscription.categoryId,
        amount: savedSubscription.amount,
        billingCycle: savedSubscription.billingCycle,
      });
      
      return savedSubscription;
      
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const updateSubscription = useCallback(async (subscriptionId, updates) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Get existing subscription
      const existingSubscription = state.subscriptions.find(sub => sub.id === subscriptionId);
      if (!existingSubscription) {
        throw new Error('Subscription not found');
      }
      
      // Update subscription
      const updatedSubscription = {
        ...existingSubscription,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      // Save to storage
      await subscriptionStorage.saveSubscription(updatedSubscription);
      
      // Refresh data
      await refreshData();
      
      // Update notification
      await notificationsService.cancelReminder(subscriptionId);
      await notificationsService.scheduleReminder(updatedSubscription);
      
      // Track analytics
      await analyticsService.trackEvent('subscription_updated', {
        field: Object.keys(updates).join(','),
        subscriptionId,
      });
      
      return updatedSubscription;
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.subscriptions]);

  const deleteSubscription = useCallback(async (subscriptionId) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Delete from storage
      await subscriptionStorage.deleteSubscription(subscriptionId);
      
      // Refresh data
      await refreshData();
      
      // Cancel notification
      await notificationsService.cancelReminder(subscriptionId);
      
      // Track analytics
      await analyticsService.trackEvent('subscription_deleted', {
        subscriptionId,
      });
      
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const toggleSubscriptionStatus = useCallback(async (subscriptionId) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Toggle status in storage
      const subscription = await subscriptionStorage.toggleSubscriptionStatus(subscriptionId);
      
      if (subscription) {
        // Refresh data
        await refreshData();
        
        // Update notifications
        if (subscription.isActive) {
          await notificationsService.scheduleReminder(subscription);
        } else {
          await notificationsService.cancelReminder(subscriptionId);
        }
        
        // Track analytics
        await analyticsService.trackEvent('subscription_status_toggled', {
          subscriptionId,
          newStatus: subscription.isActive ? 'active' : 'inactive',
        });
        
        return subscription;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error toggling subscription status:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const duplicateSubscription = useCallback(async (subscriptionId) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const subscription = state.subscriptions.find(sub => sub.id === subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      // Create duplicate with new ID
      const duplicate = {
        ...subscription,
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${subscription.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentHistory: [],
      };
      
      // Remove ID from duplicate
      delete duplicate.id;
      
      // Add duplicate
      const savedDuplicate = await addSubscription(duplicate);
      
      // Track analytics
      await analyticsService.trackEvent('subscription_duplicated', {
        originalId: subscriptionId,
      });
      
      return savedDuplicate;
      
    } catch (error) {
      console.error('Error duplicating subscription:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.subscriptions, addSubscription]);

  /**
   * PAYMENT MANAGEMENT
   */

  const addPayment = useCallback(async (subscriptionId, paymentData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Add payment to storage
      const payment = await subscriptionStorage.addPayment(subscriptionId, paymentData);
      
      // Refresh data
      await refreshData();
      
      // Track analytics
      await analyticsService.trackEvent('payment_added', {
        subscriptionId,
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
  }, []);

  const getSubscriptionPayments = useCallback(async (subscriptionId) => {
    try {
      return await subscriptionStorage.getPaymentsBySubscription(subscriptionId);
    } catch (error) {
      console.error('Error getting subscription payments:', error);
      return [];
    }
  }, []);

  const getRecentPayments = useCallback(async (limit = 10) => {
    try {
      const allPayments = await subscriptionStorage.getPaymentHistory();
      return allPayments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent payments:', error);
      return [];
    }
  }, []);

  /**
   * CATEGORY MANAGEMENT
   */

  const addCategory = useCallback(async (categoryData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Add category to storage
      const category = await subscriptionStorage.saveCategory(categoryData);
      
      // Refresh data
      await refreshData();
      
      return category;
      
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const updateCategory = useCallback(async (categoryId, updates) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Update subscriptions with old category
      const subscriptionsToUpdate = state.subscriptions.filter(
        sub => sub.categoryId === categoryId
      );
      
      // Update category in storage
      const category = await subscriptionStorage.saveCategory({
        id: categoryId,
        ...updates,
      });
      
      // Refresh data
      await refreshData();
      
      return category;
      
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.subscriptions]);

  const deleteCategory = useCallback(async (categoryId, reassignToId = '1') => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Delete category from storage
      await subscriptionStorage.deleteCategory(categoryId, reassignToId);
      
      // Refresh data
      await refreshData();
      
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * FILTERING AND SEARCH
   */

  const setSearchQuery = useCallback((query) => {
    setState(prev => {
      const filteredSubscriptions = filterAndSortSubscriptions(
        prev.subscriptions,
        query,
        prev.selectedFilters,
        prev.sortBy,
        prev.sortOrder
      );
      
      return {
        ...prev,
        searchQuery: query,
        filteredSubscriptions,
      };
    });
  }, []);

  const setFilter = useCallback((filterType, value) => {
    setState(prev => {
      const newFilters = {
        ...prev.selectedFilters,
        [filterType]: value,
      };
      
      const filteredSubscriptions = filterAndSortSubscriptions(
        prev.subscriptions,
        prev.searchQuery,
        newFilters,
        prev.sortBy,
        prev.sortOrder
      );
      
      return {
        ...prev,
        selectedFilters: newFilters,
        filteredSubscriptions,
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => {
      const filteredSubscriptions = filterAndSortSubscriptions(
        prev.subscriptions,
        prev.searchQuery,
        initialState.selectedFilters,
        prev.sortBy,
        prev.sortOrder
      );
      
      return {
        ...prev,
        selectedFilters: initialState.selectedFilters,
        filteredSubscriptions,
      };
    });
  }, []);

  const setSort = useCallback((sortBy, sortOrder = 'asc') => {
    setState(prev => {
      const filteredSubscriptions = filterAndSortSubscriptions(
        prev.subscriptions,
        prev.searchQuery,
        prev.selectedFilters,
        sortBy,
        sortOrder
      );
      
      return {
        ...prev,
        sortBy,
        sortOrder,
        filteredSubscriptions,
      };
    });
  }, []);

  /**
   * DATA REFRESH
   */

  const refreshData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true }));
      
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
      
      // Calculate filtered subscriptions
      const filteredSubscriptions = filterAndSortSubscriptions(
        subscriptions,
        state.searchQuery,
        state.selectedFilters,
        state.sortBy,
        state.sortOrder
      );
      
      // Calculate analytics
      const spendingTrends = calculateSpendingTrends(subscriptions);
      const monthlyComparison = calculateMonthlyComparison(subscriptions);
      const categoryBreakdown = calculateCategoryBreakdown(stats.categoryStats, categories);
      
      // Generate insights
      const insights = generateInsights(subscriptions, stats);
      const recommendations = generateRecommendations(subscriptions, stats);
      
      // Calculate budget status
      const budgetStatus = calculateBudgetStatus(stats.monthlyTotal, settings?.budget);
      const overspendingCategories = findOverspendingCategories(
        stats.categoryStats,
        settings?.budget?.categoryLimits
      );
      
      setState(prev => ({
        ...prev,
        subscriptions,
        categories,
        subscriptionStats: stats,
        upcomingPayments,
        filteredSubscriptions,
        spendingTrends,
        monthlyComparison,
        categoryBreakdown,
        insights,
        recommendations,
        budgetStatus,
        overspendingCategories,
        isRefreshing: false,
      }));
      
      // Cache the data
      await cacheStorage.cacheSubscriptionStats(stats);
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [state.searchQuery, state.selectedFilters, state.sortBy, state.sortOrder, settings]);

  /**
   * SELECTION MANAGEMENT
   */

  const selectSubscription = useCallback((subscription) => {
    setState(prev => ({ ...prev, selectedSubscription: subscription }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedSubscription: null }));
  }, []);

  const setIsEditing = useCallback((isEditing) => {
    setState(prev => ({ ...prev, isEditing }));
  }, []);

  /**
   * ANALYTICS AND INSIGHTS
   */

  const getSpendingByCategory = useCallback(() => {
    return state.categoryBreakdown;
  }, [state.categoryBreakdown]);

  const getSpendingTrend = useCallback((period = 'monthly') => {
    if (period === 'monthly') {
      return state.spendingTrends;
    }
    // Could implement weekly, yearly trends
    return [];
  }, [state.spendingTrends]);

  const getMonthlyComparison = useCallback(() => {
    return state.monthlyComparison;
  }, [state.monthlyComparison]);

  const getInsights = useCallback(() => {
    return state.insights;
  }, [state.insights]);

  const getRecommendations = useCallback(() => {
    return state.recommendations;
  }, [state.recommendations]);

  const getBudgetStatus = useCallback(() => {
    return state.budgetStatus;
  }, [state.budgetStatus]);

  /**
   * EXPORT/IMPORT
   */

  const exportSubscriptions = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const data = await subscriptionStorage.exportData();
      
      // Track analytics
      await analyticsService.trackEvent('data_exported', {
        itemCount: data.subscriptions.length,
      });
      
      return data;
      
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const importSubscriptions = useCallback(async (importData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await subscriptionStorage.importData(importData);
      
      // Refresh data
      await refreshData();
      
      // Reschedule notifications
      await notificationsService.scheduleAllReminders(state.subscriptions);
      
      // Track analytics
      await analyticsService.trackEvent('data_imported', {
        itemCount: importData.subscriptions?.length || 0,
      });
      
    } catch (error) {
      console.error('Error importing subscriptions:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.subscriptions, refreshData]);

  /**
   * UTILITY FUNCTIONS
   */

  // Filter and sort subscriptions
  const filterAndSortSubscriptions = (subscriptions, searchQuery, filters, sortBy, sortOrder) => {
    let filtered = [...subscriptions];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(query) ||
        sub.description?.toLowerCase().includes(query) ||
        sub.notes?.toLowerCase().includes(query)
      );
    }
    
    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(sub => sub.categoryId === filters.category);
    }
    
    if (filters.status) {
      if (filters.status === 'active') {
        filtered = filtered.filter(sub => sub.isActive);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(sub => !sub.isActive);
      }
    }
    
    if (filters.billingCycle) {
      filtered = filtered.filter(sub => sub.billingCycle === filters.billingCycle);
    }
    
    if (filters.priceRange) {
      filtered = filtered.filter(sub => {
        const amount = parseFloat(sub.amount) || 0;
        return amount >= filters.priceRange.min && amount <= filters.priceRange.max;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'amount':
          aValue = parseFloat(a.amount) || 0;
          bValue = parseFloat(b.amount) || 0;
          break;
        case 'nextPayment':
          aValue = new Date(a.nextPaymentDate || 0);
          bValue = new Date(b.nextPaymentDate || 0);
          break;
        case 'category':
          aValue = a.categoryId;
          bValue = b.categoryId;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  // Calculate spending trends
  const calculateSpendingTrends = (subscriptions) => {
    // Implementation for calculating spending trends
    // This would typically analyze spending over time
    return [];
  };

  // Calculate monthly comparison
  const calculateMonthlyComparison = (subscriptions) => {
    // Implementation for monthly comparison
    return [];
  };

  // Calculate category breakdown
  const calculateCategoryBreakdown = (categoryStats, categories) => {
    return Object.entries(categoryStats || {}).map(([categoryId, stats]) => {
      const category = categories.find(cat => cat.id === categoryId);
      return {
        categoryId,
        categoryName: category?.name || 'Unknown',
        color: category?.color || '#4ECDC4',
        count: stats.count,
        total: stats.total,
        monthly: stats.monthly,
      };
    });
  };

  // Generate insights
  const generateInsights = (subscriptions, stats) => {
    const insights = [];
    
    // Example insights
    if (stats.monthlyTotal > 100) {
      insights.push({
        id: 'high_spending',
        type: 'warning',
        title: 'High Monthly Spending',
        message: `You're spending $${stats.monthlyTotal.toFixed(2)} per month on subscriptions.`,
        suggestion: 'Consider reviewing inactive subscriptions.',
      });
    }
    
    // Add more insights based on your business logic
    
    return insights;
  };

  // Generate recommendations
  const generateRecommendations = (subscriptions, stats) => {
    const recommendations = [];
    
    // Example recommendations
    const unusedSubscriptions = subscriptions.filter(sub => {
      // Logic to determine unused subscriptions
      return false; // Implement your logic
    });
    
    if (unusedSubscriptions.length > 0) {
      recommendations.push({
        id: 'cancel_unused',
        type: 'savings',
        title: 'Cancel Unused Subscriptions',
        message: `You have ${unusedSubscriptions.length} subscription(s) you may not be using.`,
        action: 'Review',
        savings: unusedSubscriptions.reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0),
      });
    }
    
    return recommendations;
  };

  // Calculate budget status
  const calculateBudgetStatus = (monthlyTotal, budgetSettings) => {
    if (!budgetSettings || budgetSettings.monthlyLimit <= 0) {
      return null;
    }
    
    const percentage = (monthlyTotal / budgetSettings.monthlyLimit) * 100;
    const status = percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good';
    
    return {
      monthlyTotal,
      budgetLimit: budgetSettings.monthlyLimit,
      percentage,
      status,
      remaining: budgetSettings.monthlyLimit - monthlyTotal,
    };
  };

  // Find overspending categories
  const findOverspendingCategories = (categoryStats, categoryLimits) => {
    if (!categoryLimits) return [];
    
    return Object.entries(categoryStats || {}).filter(([categoryId, stats]) => {
      const limit = categoryLimits[categoryId];
      return limit && stats.monthly > limit;
    }).map(([categoryId, stats]) => ({
      categoryId,
      monthlySpent: stats.monthly,
      budgetLimit: categoryLimits[categoryId],
      overspentBy: stats.monthly - categoryLimits[categoryId],
    }));
  };

  /**
   * PROVIDER VALUE
   */

  const value = useMemo(() => ({
    // State
    ...state,
    
    // Subscription CRUD
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    duplicateSubscription,
    
    // Payment management
    addPayment,
    getSubscriptionPayments,
    getRecentPayments,
    
    // Category management
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Filtering and search
    setSearchQuery,
    setFilter,
    clearFilters,
    setSort,
    
    // Data management
    refreshData,
    
    // Selection management
    selectSubscription,
    clearSelection,
    setIsEditing,
    
    // Analytics and insights
    getSpendingByCategory,
    getSpendingTrend,
    getMonthlyComparison,
    getInsights,
    getRecommendations,
    getBudgetStatus,
    
    // Export/import
    exportSubscriptions,
    importSubscriptions,
  }), [state, addSubscription, updateSubscription, deleteSubscription, 
       toggleSubscriptionStatus, duplicateSubscription, addPayment, 
       getSubscriptionPayments, getRecentPayments, addCategory, updateCategory, 
       deleteCategory, setSearchQuery, setFilter, clearFilters, setSort, 
       refreshData, selectSubscription, clearSelection, setIsEditing, 
       getSpendingByCategory, getSpendingTrend, getMonthlyComparison, 
       getInsights, getRecommendations, getBudgetStatus, exportSubscriptions, 
       importSubscriptions]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Higher-order component for subscription context
export const withSubscriptions = (Component) => {
  return function WrappedComponent(props) {
    return (
      <SubscriptionProvider>
        <Component {...props} />
      </SubscriptionProvider>
    );
  };
};

// Helper hooks for common subscription operations

export const useSubscriptionStats = () => {
  const { subscriptionStats } = useSubscriptions();
  return subscriptionStats;
};

export const useUpcomingPayments = () => {
  const { upcomingPayments } = useSubscriptions();
  return upcomingPayments;
};

export const useFilteredSubscriptions = () => {
  const { filteredSubscriptions } = useSubscriptions();
  return filteredSubscriptions;
};

export const useSubscriptionInsights = () => {
  const { insights, recommendations } = useSubscriptions();
  return { insights, recommendations };
};