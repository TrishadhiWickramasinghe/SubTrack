import { useBudget as useBudgetContext } from '@context/BudgetContext';
import { useCallback, useMemo } from 'react';

/**
 * useBudget Hook
 * Custom hook for accessing budget context and utilities
 */
export const useBudget = () => {
  const budget = useBudgetContext();

  /**
   * Calculate remaining budget amount
   */
  const getRemainingBudget = useCallback(() => {
    return budget.remainingBudget || 0;
  }, [budget.remainingBudget]);

  /**
   * Get budget utilization percentage
   */
  const getBudgetUtilization = useCallback(() => {
    return budget.percentageUsed || 0;
  }, [budget.percentageUsed]);

  /**
   * Check if budget is exceeded
   */
  const isBudgetExceeded = useCallback(() => {
    return budget.percentageUsed >= 100;
  }, [budget.percentageUsed]);

  /**
   * Check if budget is warning threshold (80%)
   */
  const isBudgetWarning = useCallback(() => {
    return budget.percentageUsed >= 80 && budget.percentageUsed < 100;
  }, [budget.percentageUsed]);

  /**
   * Get category budget status
   */
  const getCategoryStatus = useCallback((category: string) => {
    return budget.categoryStats?.[category] || null;
  }, [budget.categoryStats]);

  /**
   * Check if specific category is over budget
   */
  const isCategoryOverBudget = useCallback((category: string) => {
    const categoryData = budget.categoryStats?.[category];
    return categoryData?.isOverBudget || false;
  }, [budget.categoryStats]);

  /**
   * Get spending for a category
   */
  const getCategorySpending = useCallback((category: string) => {
    return budget.spendingByCategory?.[category] || 0;
  }, [budget.spendingByCategory]);

  /**
   * Get all categories over budget
   */
  const getOverBudgetCategories = useCallback(() => {
    return budget.overBudgetCategories || [];
  }, [budget.overBudgetCategories]);

  /**
   * Get unread alerts count
   */
  const getUnreadAlertsCount = useCallback(() => {
    return budget.unreadAlerts || 0;
  }, [budget.unreadAlerts]);

  /**
   * Get alerts
   */
  const getAlerts = useCallback(() => {
    return budget.alerts || [];
  }, [budget.alerts]);

  /**
   * Get recommendations
   */
  const getRecommendations = useCallback(() => {
    return budget.recommendations || [];
  }, [budget.recommendations]);

  /**
   * Get budget trend
   */
  const getBudgetTrend = useCallback(() => {
    return budget.budgetTrends || [];
  }, [budget.budgetTrends]);

  /**
   * Calculate average spending
   */
  const getAverageMonthlySpending = useCallback(() => {
    const trends = budget.budgetTrends || [];
    if (trends.length === 0) return 0;
    
    const totalSpent = trends.reduce((sum: number, trend: any) => sum + (trend.spent || 0), 0);
    return totalSpent / trends.length;
  }, [budget.budgetTrends]);

  /**
   * Get highest spending category
   */
  const getHighestSpendingCategory = useCallback(() => {
    const spending = budget.spendingByCategory || {};
    let highest = { category: '', amount: 0 };

    Object.entries(spending).forEach(([category, amount]: [string, any]) => {
      if (amount > highest.amount) {
        highest = { category, amount };
      }
    });

    return highest;
  }, [budget.spendingByCategory]);

  /**
   * Get highest spending categories (top N)
   */
  const getTopSpendingCategories = useCallback((limit: number = 5) => {
    const spending = budget.spendingByCategory || {};
    
    return Object.entries(spending)
      .map(([category, amount]: [string, any]) => ({ category, amount }))
      .sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, limit);
  }, [budget.spendingByCategory]);

  /**
   * Get budget progress info
   */
  const getBudgetProgress = useCallback(() => {
    return {
      spent: budget.totalSpent || 0,
      budgeted: budget.totalBudgeted || 0,
      remaining: budget.remainingBudget || 0,
      percentage: budget.percentageUsed || 0,
      isExceeded: budget.percentageUsed >= 100,
      isWarning: budget.percentageUsed >= 80 && budget.percentageUsed < 100,
    };
  }, [budget.totalSpent, budget.totalBudgeted, budget.remainingBudget, budget.percentageUsed]);

  /**
   * Get category budget progress
   */
  const getCategoryProgress = useCallback((category: string) => {
    const stats = budget.categoryStats?.[category];
    if (!stats) return null;

    return {
      category,
      spent: stats.spent || 0,
      budgeted: stats.budgeted || 0,
      remaining: stats.remaining || 0,
      percentage: stats.percentage || 0,
      isOverBudget: stats.isOverBudget || false,
    };
  }, [budget.categoryStats]);

  /**
   * Get all expenses for a date range
   */
  const getExpensesForRange = useCallback(() => {
    const { dateRange, transactions } = budget;
    
    if (!dateRange || !transactions) return [];

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    return transactions.filter((transaction: any) => {
      const transactionDate = new Date(transaction.createdAt || transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });
  }, [budget.dateRange, budget.transactions]);

  /**
   * Get monthly budget summary
   */
  const getMonthlyBudgetSummary = useCallback(() => {
    return {
      ...budget.monthlyBudget,
      spent: budget.totalSpent || 0,
      budgeted: budget.totalBudgeted || 0,
      remaining: budget.remainingBudget || 0,
      percentage: budget.percentageUsed || 0,
    };
  }, [budget.monthlyBudget, budget.totalSpent, budget.totalBudgeted, budget.remainingBudget, budget.percentageUsed]);

  /**
   * Get budget status message
   */
  const getBudgetStatusMessage = useCallback((): string => {
    if (budget.percentageUsed >= 100) {
      return `Budget exceeded by ${(budget.percentageUsed - 100).toFixed(1)}%`;
    } else if (budget.percentageUsed >= 80) {
      return `Warning: ${budget.percentageUsed.toFixed(1)}% of budget used`;
    } else if (budget.percentageUsed >= 50) {
      return `${budget.percentageUsed.toFixed(1)}% of budget used`;
    } else {
      return `${(100 - budget.percentageUsed).toFixed(1)}% budget remaining`;
    }
  }, [budget.percentageUsed]);

  /**
   * Get budget status color
   */
  const getBudgetStatusColor = useCallback((): string => {
    if (budget.percentageUsed >= 100) return '#FF6B6B'; // Red - Exceeded
    if (budget.percentageUsed >= 80) return '#FFA500'; // Orange - Warning
    if (budget.percentageUsed >= 50) return '#FFD700'; // Yellow - Caution
    return '#4ECDC4'; // Teal - Safe
  }, [budget.percentageUsed]);

  /**
   * Format currency amount
   */
  const formatCurrency = useCallback((amount: number, symbol: string = '$'): string => {
    return `${symbol}${amount.toFixed(2)}`;
  }, []);

  /**
   * Check if has unread alerts
   */
  const hasUnreadAlerts = useCallback(() => {
    return budget.unreadAlerts > 0;
  }, [budget.unreadAlerts]);

  /**
   * Get alerts by type
   */
  const getAlertsByType = useCallback((type: string) => {
    return (budget.alerts || []).filter((alert: any) => alert.type === type);
  }, [budget.alerts]);

  /**
   * Get alerts by severity
   */
  const getAlertsBySeverity = useCallback((severity: string) => {
    return (budget.alerts || []).filter((alert: any) => alert.severity === severity);
  }, [budget.alerts]);

  /**
   * Get all critical alerts
   */
  const getCriticalAlerts = useCallback(() => {
    return (budget.alerts || []).filter((alert: any) => alert.severity === 'error');
  }, [budget.alerts]);

  /**
   * Get transaction statistics
   */
  const getTransactionStats = useCallback(() => {
    const transactions = budget.transactions || [];
    
    if (transactions.length === 0) {
      return {
        count: 0,
        total: 0,
        average: 0,
        highest: 0,
        lowest: 0,
      };
    }

    const amounts = transactions.map((t: any) => t.amount || 0);
    const total = amounts.reduce((sum: number, amount: number) => sum + amount, 0);

    return {
      count: transactions.length,
      total,
      average: total / transactions.length,
      highest: Math.max(...amounts),
      lowest: Math.min(...amounts),
    };
  }, [budget.transactions]);

  /**
   * Check if loading
   */
  const isLoading = useMemo(() => budget.isLoading || false, [budget.isLoading]);

  /**
   * Check if refreshing
   */
  const isRefreshing = useMemo(() => budget.isRefreshing || false, [budget.isRefreshing]);

  return {
    // State
    ...budget,
    
    // Utility methods
    getRemainingBudget,
    getBudgetUtilization,
    isBudgetExceeded,
    isBudgetWarning,
    getCategoryStatus,
    isCategoryOverBudget,
    getCategorySpending,
    getOverBudgetCategories,
    getUnreadAlertsCount,
    getAlerts,
    getRecommendations,
    getBudgetTrend,
    getAverageMonthlySpending,
    getHighestSpendingCategory,
    getTopSpendingCategories,
    getBudgetProgress,
    getCategoryProgress,
    getExpensesForRange,
    getMonthlyBudgetSummary,
    getBudgetStatusMessage,
    getBudgetStatusColor,
    formatCurrency,
    hasUnreadAlerts,
    getAlertsByType,
    getAlertsBySeverity,
    getCriticalAlerts,
    getTransactionStats,
    isLoading,
    isRefreshing,
  };
};

export default useBudget;
