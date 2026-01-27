/**
 * Working Utility Functions for SubTrack
 * Common operations with practical implementations
 */

import { MockBudget, MockSubscription } from './mockData';

/**
 * Calculate total monthly spending across all subscriptions
 */
export const calculateMonthlySpending = (subscriptions: MockSubscription[]): number => {
  return subscriptions.reduce((total, sub) => {
    if (sub.status === 'cancelled') return total;
    
    switch (sub.billingCycle) {
      case 'daily':
        return total + sub.amount * 30;
      case 'weekly':
        return total + sub.amount * 4.33;
      case 'monthly':
        return total + sub.amount;
      case 'quarterly':
        return total + sub.amount / 3;
      case 'annually':
        return total + sub.amount / 12;
      default:
        return total + sub.amount;
    }
  }, 0);
};

/**
 * Calculate total annual spending
 */
export const calculateAnnualSpending = (subscriptions: MockSubscription[]): number => {
  return subscriptions.reduce((total, sub) => {
    if (sub.status === 'cancelled') return total;
    
    switch (sub.billingCycle) {
      case 'daily':
        return total + sub.amount * 365;
      case 'weekly':
        return total + sub.amount * 52;
      case 'monthly':
        return total + sub.amount * 12;
      case 'quarterly':
        return total + sub.amount * 4;
      case 'annually':
        return total + sub.amount;
      default:
        return total + sub.amount * 12;
    }
  }, 0);
};

/**
 * Format currency with proper formatting
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });
  return formatter.format(amount);
};

/**
 * Format date to readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get days until next billing
 */
export const getDaysUntilBilling = (billingDate: string): number => {
  const today = new Date();
  const nextBilling = new Date(billingDate);
  const diff = nextBilling.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
};

/**
 * Get subscription status color
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return '#10B981'; // Green
    case 'trial':
      return '#F59E0B'; // Amber
    case 'cancelled':
      return '#EF4444'; // Red
    default:
      return '#6B7280'; // Gray
  }
};

/**
 * Group subscriptions by category
 */
export const groupByCategory = (subscriptions: MockSubscription[]): Record<string, MockSubscription[]> => {
  return subscriptions.reduce((acc, sub) => {
    if (!acc[sub.category]) {
      acc[sub.category] = [];
    }
    acc[sub.category].push(sub);
    return acc;
  }, {} as Record<string, MockSubscription[]>);
};

/**
 * Get spending by category
 */
export const getSpendingByCategory = (subscriptions: MockSubscription[]): Record<string, number> => {
  const grouped = groupByCategory(subscriptions);
  const spending: Record<string, number> = {};

  Object.entries(grouped).forEach(([category, subs]) => {
    spending[category] = calculateMonthlySpending(subs);
  });

  return spending;
};

/**
 * Calculate budget percentage used
 */
export const getBudgetPercentage = (budget: MockBudget): number => {
  if (budget.limit === 0) return 0;
  return Math.round((budget.spent / budget.limit) * 100);
};

/**
 * Get budget status (under/over)
 */
export const getBudgetStatus = (budget: MockBudget): 'under' | 'warning' | 'over' => {
  const percentage = getBudgetPercentage(budget);
  if (percentage >= 100) return 'over';
  if (percentage >= 80) return 'warning';
  return 'under';
};

/**
 * Sort subscriptions by next billing date
 */
export const sortByNextBilling = (subscriptions: MockSubscription[]): MockSubscription[] => {
  return [...subscriptions].sort((a, b) => {
    return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
  });
};

/**
 * Filter active subscriptions
 */
export const getActiveSubscriptions = (subscriptions: MockSubscription[]): MockSubscription[] => {
  return subscriptions.filter(sub => sub.status === 'active');
};

/**
 * Search subscriptions by name
 */
export const searchSubscriptions = (subscriptions: MockSubscription[], query: string): MockSubscription[] => {
  const lowerQuery = query.toLowerCase();
  return subscriptions.filter(sub => 
    sub.name.toLowerCase().includes(lowerQuery) ||
    sub.category.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Calculate potential savings by removing a subscription
 */
export const calculateSavings = (subscription: MockSubscription): number => {
  switch (subscription.billingCycle) {
    case 'daily':
      return subscription.amount * 30; // monthly saving
    case 'weekly':
      return subscription.amount * 4.33;
    case 'monthly':
      return subscription.amount;
    case 'quarterly':
      return subscription.amount / 3;
    case 'annually':
      return subscription.amount / 12;
    default:
      return subscription.amount;
  }
};

/**
 * Get subscription by ID
 */
export const getSubscriptionById = (subscriptions: MockSubscription[], id: string): MockSubscription | undefined => {
  return subscriptions.find(sub => sub.id === id);
};

/**
 * Count subscriptions by status
 */
export const countByStatus = (subscriptions: MockSubscription[]): Record<string, number> => {
  return subscriptions.reduce((acc, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Get most expensive subscriptions
 */
export const getTopExpensive = (subscriptions: MockSubscription[], limit: number = 5): MockSubscription[] => {
  return [...subscriptions]
    .sort((a, b) => calculateSavings(b) - calculateSavings(a))
    .slice(0, limit);
};
