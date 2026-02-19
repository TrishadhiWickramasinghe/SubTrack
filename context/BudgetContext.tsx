/* eslint-disable @typescript-eslint/no-explicit-any */
import { budgetStorage } from '@services/storage/budgetStorage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useApp } from './AppContext';

// Create context
const BudgetContext = createContext<any>(null);

// Type definitions
interface BudgetState {
  budgets: any[];
  monthlyBudget: any;
  categoryBudgets: Record<string, number>;
  transactions: any[];
  filteredTransactions: any[];
  budgetAlerts: any[];
  unreadAlerts: number;
  budgetHistory: any[];
  totalSpent: number;
  totalBudgeted: number;
  percentageUsed: number;
  remainingBudget: number;
  categoryStats: Record<string, any>;
  selectedBudget: string | null;
  selectedCategory: string | null;
  dateRange: {
    start: string;
    end: string;
  };
  isLoading: boolean;
  isRefreshing: boolean;
  isEditing: boolean;
  budgetTrends: any[];
  spendingByCategory: Record<string, number>;
  overBudgetCategories: string[];
  alerts: any[];
  recommendations: any[];
}

// Initial state
const initialState: BudgetState = {
  // Budget data
  budgets: [],
  monthlyBudget: null,
  categoryBudgets: {},
  
  // Transaction data
  transactions: [],
  filteredTransactions: [],
  
  // Alerts
  budgetAlerts: [],
  unreadAlerts: 0,
  
  // History
  budgetHistory: [],
  
  // Statistics
  totalSpent: 0,
  totalBudgeted: 0,
  percentageUsed: 0,
  remainingBudget: 0,
  categoryStats: {},
  
  // Filtering
  selectedBudget: null,
  selectedCategory: null,
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  },
  
  // UI state
  isLoading: false,
  isRefreshing: false,
  isEditing: false,
  
  // Budget analysis
  budgetTrends: [],
  spendingByCategory: {},
  overBudgetCategories: [],
  alerts: [],
  recommendations: [],
};
// Custom hook to use budget context
export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

// Main provider component
export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useApp();
  const [state, setState] = useState<any>(initialState as BudgetState);

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
      setState((prev: BudgetState) => ({ ...prev, isLoading: true }));

      const [
        budgets,
        monthlyBudget,
        categoryBudgets,
        transactions,
        budgetAlerts,
        budgetHistory,
      ] = await Promise.all([
        budgetStorage.getAllBudgets(),
        budgetStorage.getMonthlyBudget(),
        budgetStorage.getCategoryBudgets(),
        budgetStorage.getBudgetTransactions(),
        budgetStorage.getBudgetAlerts(),
        budgetStorage.getBudgetHistory(),
      ]);

      // Calculate statistics
      const stats = calculateBudgetStats(budgets, transactions, categoryBudgets);
      const categoryStats = calculateCategoryStats(transactions, categoryBudgets);
      const spendingByCategory = calculateSpendingByCategory(transactions);
      const overBudgetCategories = findOverBudgetCategories(
        spendingByCategory,
        categoryBudgets
      );

      // Generate insights
      const budgetTrends = calculateBudgetTrends(budgetHistory);
      const alerts = generateBudgetAlerts(stats, overBudgetCategories);
      const recommendations = generateBudgetRecommendations(stats, spendingByCategory);

      // Count unread alerts
      const unreadAlerts = budgetAlerts.filter((a: any) => !a.isRead).length;

      setState((prev: any) => ({
        ...prev,
        budgets,
        monthlyBudget,
        categoryBudgets,
        transactions,
        budgetAlerts,
        budgetHistory,
        ...stats,
        categoryStats,
        spendingByCategory,
        overBudgetCategories,
        budgetTrends,
        alerts,
        recommendations,
        unreadAlerts,
        isLoading: false,
      }));

      // Cache the data - TODO: implement cache storage
      // await cacheStorage.set('cache', 'budget_stats', stats);

    } catch (error) {
      console.error('Error loading initial budget data:', error);
      setState((prev: BudgetState) => ({ ...prev, isLoading: false }));
    }
  }, [settings]);

  /**
   * BUDGET CRUD OPERATIONS
   */

  const addBudget = useCallback(async (budgetData: any) => {
    try {
      setState((prev: BudgetState) => ({ ...prev, isLoading: true }));

      const newBudget = await budgetStorage.addBudget(budgetData);

      // Refresh data
      await loadInitialData();

      // Track analytics - TODO: implement analytics service
      // await analyticsService.trackEvent('budget_created', {
      //   totalAmount: newBudget.totalAmount,
      //   period: newBudget.period,
      //   categoryCount: Object.keys(newBudget.categoryLimits || {}).length,
      // });

      return newBudget;
    } catch (error) {
      console.error('Error adding budget:', error);
      throw error;
    } finally {
      setState((prev: BudgetState) => ({ ...prev, isLoading: false }));
    }
  }, []);
  const updateBudget = useCallback(async (budgetId: string, updates: any) => {
    try {
      setState((prev: BudgetState) => ({ ...prev, isLoading: true }));

      const updatedBudget = await budgetStorage.updateBudget(budgetId, updates);

      // Refresh data
      await loadInitialData();

      // Track analytics - TODO: implement analytics service
      // await analyticsService.trackEvent('budget_updated', {
      //   budgetId,
      //   fieldsUpdated: Object.keys(updates).join(','),
      // });

      return updatedBudget;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    } finally {
      setState((prev: BudgetState) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const deleteBudget = useCallback(async (budgetId: string) => {
    try {
      setState((prev: BudgetState) => ({ ...prev, isLoading: true }));

      await budgetStorage.deleteBudget(budgetId);

      // Refresh data
      await loadInitialData();

      // Track analytics - TODO: implement analytics service
      // await analyticsService.trackEvent('budget_deleted', {
      //   budgetId,
      // });
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    } finally {
      setState((prev: BudgetState) => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * CATEGORY BUDGET OPERATIONS
   */

  const updateCategoryBudget = useCallback(async (category: string, amount: number) => {
    try {
      setState((prev: BudgetState) => ({ ...prev, isLoading: true }));

      const result = await budgetStorage.updateCategoryBudget(category, amount);

      // Refresh data
      await loadInitialData();

      // Track analytics - TODO: implement analytics service
      // await analyticsService.trackEvent('category_budget_updated', {
      //   category,
      //   newAmount: amount,
      // });

      return result;
    } catch (error) {
      console.error('Error updating category budget:', error);
      throw error;
    } finally {
      setState((prev: BudgetState) => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * TRANSACTION OPERATIONS
   */

  const addTransaction = useCallback(async (transaction: any) => {
    try {
      setState((prev: BudgetState) => ({ ...prev, isLoading: true }));

      const newTransaction = await budgetStorage.addBudgetTransaction(transaction);

      // Refresh data
      await loadInitialData();

      // Check if budget alert should be triggered
      const stats = calculateBudgetStats(
        state.budgets,
        [...state.transactions, newTransaction],
        state.categoryBudgets
      );

      if (stats.percentageUsed >= settings?.budget?.alertThreshold) {
        await createBudgetAlert({
          type: 'budget_threshold',
          budgetId: transaction.budgetId,
          message: `You've reached ${stats.percentageUsed.toFixed(0)}% of your budget`,
          severity: 'warning',
        });
      }

      // Track analytics - TODO: implement analytics service
      // await analyticsService.trackEvent('transaction_added', {
      //   amount: transaction.amount,
      //   category: transaction.category,
      //   budgetId: transaction.budgetId,
      // });

      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    } finally {
      setState((prev: BudgetState) => ({ ...prev, isLoading: false }));
    }
  }, [state.budgets, state.transactions, state.categoryBudgets, settings]);

  /**
   * ALERT OPERATIONS
   */

  const createBudgetAlert = useCallback(async (alert: any) => {
    try {
      const newAlert = await budgetStorage.addBudgetAlert(alert);

      setState((prev: BudgetState) => ({
        ...prev,
        budgetAlerts: [...prev.budgetAlerts, newAlert],
        unreadAlerts: prev.unreadAlerts + 1,
      }));

      // Send notification if enabled
      if (settings?.notifications?.budgetAlerts) {
        // TODO: Get category and budget info for the notification
        // await notificationService.sendBudgetAlertNotification(
        //   alert.category || 'Budget',
        //   alert.amount || 0,
        //   alert.budget || 0,
        //   alert.percentage || 0
        // );
      }

      return newAlert;
    } catch (error) {
      console.error('Error creating budget alert:', error);
      throw error;
    }
  }, [settings]);

  const markAlertAsRead = useCallback(async (alertId: string) => {
    try {
      await budgetStorage.markAlertAsRead(alertId);

      setState((prev: any) => ({
        ...prev,
        budgetAlerts: prev.budgetAlerts.map((a: any) =>
          a.id === alertId ? { ...a, isRead: true } : a
        ),
        unreadAlerts: Math.max(0, prev.unreadAlerts - 1),
      }));
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  }, []);

  /**
   * FILTERING AND SEARCH
   */

  const setSelectedBudget = useCallback((budgetId: string | null) => {
    setState((prev: BudgetState) => ({ ...prev, selectedBudget: budgetId }));
  }, []);

  const setSelectedCategory = useCallback((category: string | null) => {
    setState((prev: BudgetState) => ({ ...prev, selectedCategory: category }));
  }, []);

  const setDateRange = useCallback((start: string, end: string) => {
    setState((prev: BudgetState) => ({
      ...prev,
      dateRange: { start, end },
    }));
    loadInitialData();
  }, []);

  /**
   * REFRESH DATA
   */

  const refreshData = useCallback(async () => {
    try {
      setState((prev: BudgetState) => ({ ...prev, isRefreshing: true }));
      await loadInitialData();
    } catch (error) {
      console.error('Error refreshing budget data:', error);
    } finally {
      setState((prev: BudgetState) => ({ ...prev, isRefreshing: false }));
    }
  }, []);

  /**
   * CLEAR ALL DATA
   */

  const clearAllBudgetData = useCallback(async () => {
    try {
      setState((prev: BudgetState) => ({ ...prev, isLoading: true }));
      await budgetStorage.clearAllBudgetData();
      
      setState(initialState);

      // Track analytics - TODO: implement analytics service
      // await analyticsService.trackEvent('budget_data_cleared');
    } catch (error) {
      console.error('Error clearing budget data:', error);
      throw error;
    } finally {
      setState((prev: BudgetState) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Memoize context value
  const value = useMemo(
    () => ({
      // State
      ...state,

      // Budget operations
      addBudget,
      updateBudget,
      deleteBudget,

      // Category operations
      updateCategoryBudget,

      // Transaction operations
      addTransaction,

      // Alert operations
      createBudgetAlert,
      markAlertAsRead,

      // Filtering
      setSelectedBudget,
      setSelectedCategory,
      setDateRange,

      // Data management
      refreshData,
      clearAllBudgetData,
    }),
    [
      state,
      addBudget,
      updateBudget,
      deleteBudget,
      updateCategoryBudget,
      addTransaction,
      createBudgetAlert,
      markAlertAsRead,
      setSelectedBudget,
      setSelectedCategory,
      setDateRange,
      refreshData,
      clearAllBudgetData,
    ]
  );

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

/**
 * HELPER FUNCTIONS
 */

/**
/**
 * Calculate budget statistics
 */
function calculateBudgetStats(_budgets: any[], transactions: any[], categoryBudgets: Record<string, number>) {
  const totalBudgeted = Object.values(categoryBudgets).reduce((sum: number, val: any) => sum + val, 0);
  const totalSpent = transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  const remainingBudget = totalBudgeted - totalSpent;
  const percentageUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return {
    totalSpent,
    totalBudgeted,
    percentageUsed: Math.min(percentageUsed, 100),
    remainingBudget,
  };
}

/**
 * Calculate statistics by category
 */
function calculateCategoryStats(transactions: any[], categoryBudgets: Record<string, number>): Record<string, any> {
  const stats: Record<string, any> = {};

  Object.keys(categoryBudgets).forEach(category => {
    const spent = transactions
      .filter((t: any) => t.category === category)
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const budgeted = categoryBudgets[category] || 0;
    const remaining = budgeted - spent;
    const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;

    stats[category] = {
      spent,
      budgeted,
      remaining,
      percentage: Math.min(percentage, 100),
      isOverBudget: spent > budgeted,
    };
  });

  return stats;
}

/**
 * Calculate spending by category
 */
function calculateSpendingByCategory(transactions: any[]): Record<string, number> {
  const spending: Record<string, number> = {};

  transactions.forEach((transaction: any) => {
    const category = transaction.category || 'Other';
    spending[category] = (spending[category] || 0) + (transaction.amount || 0);
  });

  return spending;
}

/**
 * Find categories that are over budget
 */
function findOverBudgetCategories(spendingByCategory: Record<string, number>, categoryBudgets: Record<string, number>): string[] {
  return Object.keys(spendingByCategory).filter(
    category => (spendingByCategory[category] || 0) > (categoryBudgets[category] || 0)
  );
}

/**
 * Calculate budget trends
 */
function calculateBudgetTrends(budgetHistory: any[]): any[] {
  const groupedByMonth: Record<string, any> = {};

  budgetHistory.forEach((entry: any) => {
    const date = new Date(entry.timestamp);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!groupedByMonth[month]) {
      groupedByMonth[month] = {
        month,
        spent: 0,
        budgeted: 0,
        entries: [],
      };
    }

    groupedByMonth[month].spent += entry.spent || 0;
    groupedByMonth[month].budgeted += entry.budgeted || 0;
    groupedByMonth[month].entries.push(entry);
  });

  return Object.values(groupedByMonth).sort((a: any, b: any) => a.month.localeCompare(b.month));
}

/**
 * Generate budget alerts
 */
function generateBudgetAlerts(stats: any, overBudgetCategories: string[]): any[] {
  const alerts: any[] = [];

  // Check overall budget
  if (stats.percentageUsed > 80) {
    alerts.push({
      type: 'budget_threshold',
      severity: 'warning',
      message: `Overall budget is ${stats.percentageUsed.toFixed(0)}% spent`,
      createdAt: new Date().toISOString(),
    });
  }

  if (stats.percentageUsed >= 100) {
    alerts.push({
      type: 'budget_exceeded',
      severity: 'error',
      message: 'You have exceeded your overall budget',
      createdAt: new Date().toISOString(),
    });
  }

  // Check category overspending
  overBudgetCategories.forEach(category => {
    alerts.push({
      type: 'category_exceeded',
      severity: 'warning',
      message: `${category} budget has been exceeded`,
      category,
      createdAt: new Date().toISOString(),
    });
  });

  return alerts;
}

/**
 * Generate budget recommendations
 */
function generateBudgetRecommendations(stats: any, spendingByCategory: Record<string, number>): any[] {
  const recommendations: any[] = [];

  // Check if budget is nearly full
  if (stats.percentageUsed > 75 && stats.percentageUsed < 100) {
    recommendations.push({
      type: 'caution',
      message: 'You are approaching your budget limit. Consider reducing spending.',
      priority: 'high',
    });
  }

  // Find highest spending categories
  const topCategories = Object.entries(spendingByCategory)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 3);

  if (topCategories.length > 0) {
    recommendations.push({
      type: 'analysis',
      message: `Your top spending categories are: ${topCategories.map((c: any) => c[0]).join(', ')}`,
      priority: 'medium',
    });
  }

  return recommendations;
}
export default BudgetContext;
