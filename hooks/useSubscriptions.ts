// TODO: Implement AppContext  
// import { useApp } from '@context/AppContext';
// TODO: Implement CurrencyContext
// import { useCurrency } from '@context/CurrencyContext';
// TODO: Implement analytics service
// import { analyticsService } from '@services/analytics/analyticsService';
// TODO: Implement notifications service
// import { notificationsService } from '@services/notifications/notificationService';
// TODO: Implement subscription storage
// import subscriptionStorage from '@services/storage/subscriptionStorage';
// TODO: Implement model types
// import { Category, Payment, Subscription } from '@types/models';

type Subscription = any;
type Category = any;
type Payment = any;

const useApp = () => ({ 
  settings: { 
    app: { onboardingComplete: false }, 
    budget: { categoryLimits: {} },
    currency: { primary: 'USD' },
  }, 
  isConnected: true 
});
const useCurrency = () => ({ 
  convertAmount: (amount: number, fromCur?: string, toCur?: string) => amount, 
  formatAmountWithConversion: (a: number, from?: string, opts?: any) => '' 
});
const analyticsService = { trackEvent: async (event: string, props?: any) => {} };
const notificationsService = { 
  sendNotification: async (config: any) => {},
  scheduleReminder: async (sub: any) => {},
  cancelReminder: async (id: string) => {},
  scheduleAllReminders: async (subs: any[]) => {},
};
const subscriptionStorage = { 
  getSubscriptions: async () => [],
  getCategories: async () => [],
  getSubscriptionStats: async () => ({ 
    monthlyTotal: 0,
    yearlyTotal: 0,
    totalCount: 0,
    activeCount: 0,
    inactiveCount: 0,
    categoryStats: {},
    lastUpdated: new Date().toISOString(),
  }),
  getUpcomingPayments: async (days: number) => [],
  saveSubscription: async (sub: any) => sub,
  deleteSubscription: async (id: string) => {},
  toggleSubscriptionStatus: async (id: string) => ({} as any),
  addPayment: async (id: string, payment: any) => payment,
  getPaymentsBySubscription: async (id: string) => [],
  getPaymentHistory: async () => [],
  saveCategory: async (cat: any) => cat,
  deleteCategory: async (id: string, reassignId?: string) => {},
  exportData: async () => ({ subscriptions: [], settings: {} }),
  importData: async (data: any) => {},
};
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Type definitions
export interface SubscriptionStats {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  monthlyTotal: number;
  yearlyTotal: number;
  categoryStats: Record<string, { count: number; total: number; monthly: number }>;
  lastUpdated: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  color: string;
  count: number;
  total: number;
  monthly: number;
  percentage: number;
}

export interface SpendingTrend {
  month: string;
  amount: number;
  change: number;
}

export interface Insight {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  suggestion?: string;
  action?: string;
}

export interface Recommendation {
  id: string;
  type: 'savings' | 'optimization' | 'reminder';
  title: string;
  message: string;
  action: string;
  savings?: number;
}

export interface BudgetStatus {
  monthlyTotal: number;
  budgetLimit: number;
  percentage: number;
  status: 'good' | 'warning' | 'exceeded';
  remaining: number;
}

export interface UseSubscriptionsReturn {
  // State
  subscriptions: Subscription[];
  categories: Category[];
  paymentHistory: Payment[];
  upcomingPayments: Subscription[];
  subscriptionStats: SubscriptionStats | null;
  categoryStats: Record<string, any>;
  monthlySpending: number;
  yearlySpending: number;
  
  // Filtering and search
  filteredSubscriptions: Subscription[];
  searchQuery: string;
  selectedFilters: {
    category: string | null;
    status: 'active' | 'inactive' | 'all';
    billingCycle: string | null;
    priceRange: { min: number; max: number } | null;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // UI state
  isLoading: boolean;
  isRefreshing: boolean;
  selectedSubscription: Subscription | null;
  isEditing: boolean;
  
  // Analytics
  spendingTrends: SpendingTrend[];
  monthlyComparison: any[];
  categoryBreakdown: CategoryBreakdown[];
  
  // Insights
  insights: Insight[];
  recommendations: Recommendation[];
  
  // Budget
  budgetStatus: BudgetStatus | null;
  overspendingCategories: Array<{
    categoryId: string;
    monthlySpent: number;
    budgetLimit: number;
    overspentBy: number;
  }>;
  
  // Subscription CRUD
  addSubscription: (subscriptionData: Partial<Subscription>) => Promise<Subscription>;
  updateSubscription: (subscriptionId: string, updates: Partial<Subscription>) => Promise<Subscription>;
  deleteSubscription: (subscriptionId: string) => Promise<void>;
  toggleSubscriptionStatus: (subscriptionId: string) => Promise<Subscription | null>;
  duplicateSubscription: (subscriptionId: string) => Promise<Subscription>;
  
  // Payment management
  addPayment: (subscriptionId: string, paymentData: Partial<Payment>) => Promise<Payment>;
  getSubscriptionPayments: (subscriptionId: string) => Promise<Payment[]>;
  getRecentPayments: (limit?: number) => Promise<Payment[]>;
  
  // Category management
  addCategory: (categoryData: Partial<Category>) => Promise<Category>;
  updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<Category>;
  deleteCategory: (categoryId: string, reassignToId?: string) => Promise<void>;
  
  // Filtering and search
  setSearchQuery: (query: string) => void;
  setFilter: (filterType: keyof UseSubscriptionsReturn['selectedFilters'], value: any) => void;
  clearFilters: () => void;
  setSort: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  
  // Data management
  refreshData: () => Promise<void>;
  
  // Selection management
  selectSubscription: (subscription: Subscription | null) => void;
  clearSelection: () => void;
  setIsEditing: (isEditing: boolean) => void;
  
  // Analytics and insights
  getSpendingByCategory: () => CategoryBreakdown[];
  getSpendingTrend: (period?: 'weekly' | 'monthly' | 'yearly') => SpendingTrend[];
  getMonthlyComparison: () => any[];
  getInsights: () => Insight[];
  getRecommendations: () => Recommendation[];
  getBudgetStatus: () => BudgetStatus | null;
  
  // Export/Import
  exportSubscriptions: () => Promise<any>;
  importSubscriptions: (importData: any) => Promise<void>;
}

/**
 * Custom hook for subscription management
 * Handles all subscription-related operations including CRUD, filtering, and analytics
 */
export const useSubscriptions = (): UseSubscriptionsReturn => {
  const { settings, isConnected } = useApp();
  const { convertAmount, formatAmountWithConversion } = useCurrency();
  
  // State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<Subscription[]>([]);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<Record<string, any>>({});
  const [monthlySpending, setMonthlySpending] = useState<number>(0);
  const [yearlySpending, setYearlySpending] = useState<number>(0);
  
  // Filtering and search
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<UseSubscriptionsReturn['selectedFilters']>({
    category: null,
    status: 'active',
    billingCycle: null,
    priceRange: null,
  });
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Analytics
  const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);
  const [monthlyComparison, setMonthlyComparison] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  
  // Insights
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  // Budget
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [overspendingCategories, setOverspendingCategories] = useState<Array<{
    categoryId: string;
    monthlySpent: number;
    budgetLimit: number;
    overspentBy: number;
  }>>([]);

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
      setIsLoading(true);
      
      const [
        subscriptionsData,
        categoriesData,
        stats,
        upcomingPaymentsData
      ] = await Promise.all([
        subscriptionStorage.getSubscriptions(),
        subscriptionStorage.getCategories(),
        subscriptionStorage.getSubscriptionStats(),
        subscriptionStorage.getUpcomingPayments(7),
      ]);
      
      setSubscriptions(subscriptionsData);
      setCategories(categoriesData);
      setSubscriptionStats(stats);
      setUpcomingPayments(upcomingPaymentsData);
      
      // Calculate analytics
      const spendingTrendsData = calculateSpendingTrends(subscriptionsData);
      const monthlyComparisonData = calculateMonthlyComparison(subscriptionsData);
      const categoryBreakdownData = calculateCategoryBreakdown(stats.categoryStats, categoriesData);
      
      setSpendingTrends(spendingTrendsData);
      setMonthlyComparison(monthlyComparisonData);
      setCategoryBreakdown(categoryBreakdownData);
      
      // Generate insights
      const insightsData = generateInsights(subscriptionsData, stats);
      const recommendationsData = generateRecommendations(subscriptionsData, stats);
      
      setInsights(insightsData);
      setRecommendations(recommendationsData);
      
      // Calculate budget status
      const budgetStatusData = calculateBudgetStatus(stats.monthlyTotal, settings?.budget);
      const overspendingCategoriesData = findOverspendingCategories(
        stats.categoryStats,
        settings?.budget?.categoryLimits
      );
      
      setBudgetStatus(budgetStatusData);
      setOverspendingCategories(overspendingCategoriesData);
      
      // Calculate filtered subscriptions
      updateFilteredSubscriptions(
        subscriptionsData,
        searchQuery,
        selectedFilters,
        sortBy,
        sortOrder
      );
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  }, [settings, searchQuery, selectedFilters, sortBy, sortOrder]);

  /**
   * UPDATE FILTERED SUBSCRIPTIONS
   */
  const updateFilteredSubscriptions = useCallback((
    subscriptionsList: Subscription[],
    query: string,
    filters: UseSubscriptionsReturn['selectedFilters'],
    sortField: string,
    sortDirection: 'asc' | 'desc'
  ) => {
    let filtered = [...subscriptionsList];
    
    // Apply search
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(lowerQuery) ||
        sub.description?.toLowerCase().includes(lowerQuery) ||
        sub.notes?.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(sub => sub.categoryId === filters.category);
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(sub => 
        filters.status === 'active' ? sub.isActive : !sub.isActive
      );
    }
    
    if (filters.billingCycle) {
      filtered = filtered.filter(sub => sub.billingCycle === filters.billingCycle);
    }
    
    if (filters.priceRange) {
      filtered = filtered.filter(sub => {
        const amount = parseFloat(sub.amount.toString()) || 0;
        return amount >= filters.priceRange!.min && amount <= filters.priceRange!.max;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'amount':
          aValue = parseFloat(a.amount.toString()) || 0;
          bValue = parseFloat(b.amount.toString()) || 0;
          break;
        case 'nextPayment':
          aValue = new Date(a.nextPaymentDate || 0);
          bValue = new Date(b.nextPaymentDate || 0);
          break;
        case 'category':
          aValue = a.categoryId;
          bValue = b.categoryId;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredSubscriptions(filtered);
  }, []);

  /**
   * SUBSCRIPTION CRUD OPERATIONS
   */
  
  const addSubscription = useCallback(async (subscriptionData: Partial<Subscription>): Promise<Subscription> => {
    try {
      setIsLoading(true);
      
      // Generate subscription ID
      const subscription: Subscription = {
        ...subscriptionData,
        id: subscriptionData.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: subscriptionData.isActive ?? true,
        paymentHistory: subscriptionData.paymentHistory || [],
        amount: subscriptionData.amount || 0,
        currency: subscriptionData.currency || 'USD',
        billingCycle: subscriptionData.billingCycle || 'monthly',
        categoryId: subscriptionData.categoryId || '1',
      } as Subscription;
      
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
      setIsLoading(false);
    }
  }, []);

  const updateSubscription = useCallback(async (
    subscriptionId: string, 
    updates: Partial<Subscription>
  ): Promise<Subscription> => {
    try {
      setIsLoading(true);
      
      // Get existing subscription
      const existingSubscription = subscriptions.find(sub => sub.id === subscriptionId);
      if (!existingSubscription) {
        throw new Error('Subscription not found');
      }
      
      // Update subscription
      const updatedSubscription: Subscription = {
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
      setIsLoading(false);
    }
  }, [subscriptions]);

  const deleteSubscription = useCallback(async (subscriptionId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
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
      setIsLoading(false);
    }
  }, []);

  const toggleSubscriptionStatus = useCallback(async (subscriptionId: string): Promise<Subscription | null> => {
    try {
      setIsLoading(true);
      
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
      setIsLoading(false);
    }
  }, []);

  const duplicateSubscription = useCallback(async (subscriptionId: string): Promise<Subscription> => {
    try {
      setIsLoading(true);
      
      const subscription = subscriptions.find(sub => sub.id === subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      // Create duplicate with new ID
      const duplicate: Partial<Subscription> = {
        ...subscription,
        id: undefined,
        name: `${subscription.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentHistory: [],
      };
      
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
      setIsLoading(false);
    }
  }, [subscriptions, addSubscription]);

  /**
   * PAYMENT MANAGEMENT
   */
  
  const addPayment = useCallback(async (
    subscriptionId: string, 
    paymentData: Partial<Payment>
  ): Promise<Payment> => {
    try {
      setIsLoading(true);
      
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
      setIsLoading(false);
    }
  }, []);

  const getSubscriptionPayments = useCallback(async (subscriptionId: string): Promise<Payment[]> => {
    try {
      return await subscriptionStorage.getPaymentsBySubscription(subscriptionId);
    } catch (error) {
      console.error('Error getting subscription payments:', error);
      return [];
    }
  }, []);

  const getRecentPayments = useCallback(async (limit: number = 10): Promise<Payment[]> => {
    try {
      const allPayments = await subscriptionStorage.getPaymentHistory();
      return allPayments
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent payments:', error);
      return [];
    }
  }, []);

  /**
   * CATEGORY MANAGEMENT
   */
  
  const addCategory = useCallback(async (categoryData: Partial<Category>): Promise<Category> => {
    try {
      setIsLoading(true);
      
      // Add category to storage
      const category = await subscriptionStorage.saveCategory(categoryData);
      
      // Refresh data
      await refreshData();
      
      return category;
      
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (
    categoryId: string, 
    updates: Partial<Category>
  ): Promise<Category> => {
    try {
      setIsLoading(true);
      
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
      setIsLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (
    categoryId: string, 
    reassignToId: string = '1'
  ): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Delete category from storage
      await subscriptionStorage.deleteCategory(categoryId, reassignToId);
      
      // Refresh data
      await refreshData();
      
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * FILTERING AND SEARCH
   */
  
  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    updateFilteredSubscriptions(subscriptions, query, selectedFilters, sortBy, sortOrder);
  }, [subscriptions, selectedFilters, sortBy, sortOrder, updateFilteredSubscriptions]);

  const handleSetFilter = useCallback((filterType: keyof UseSubscriptionsReturn['selectedFilters'], value: any) => {
    const newFilters = {
      ...selectedFilters,
      [filterType]: value,
    };
    
    setSelectedFilters(newFilters);
    updateFilteredSubscriptions(subscriptions, searchQuery, newFilters, sortBy, sortOrder);
  }, [subscriptions, searchQuery, selectedFilters, sortBy, sortOrder, updateFilteredSubscriptions]);

  const handleClearFilters = useCallback(() => {
    const defaultFilters = {
      category: null,
      status: 'active',
      billingCycle: null,
      priceRange: null,
    };
    
    setSelectedFilters({ category: null, status: 'all' as const, billingCycle: null, priceRange: null });
    updateFilteredSubscriptions(subscriptions, searchQuery, { category: null, status: 'all' as const, billingCycle: null, priceRange: null }, sortBy, sortOrder);
  }, [subscriptions, searchQuery, sortBy, sortOrder, updateFilteredSubscriptions]);

  const handleSetSort = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc' = 'asc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    updateFilteredSubscriptions(subscriptions, searchQuery, selectedFilters, newSortBy, newSortOrder);
  }, [subscriptions, searchQuery, selectedFilters, updateFilteredSubscriptions]);

  /**
   * DATA REFRESH
   */
  
  const refreshData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      const [
        subscriptionsData,
        categoriesData,
        stats,
        upcomingPaymentsData
      ] = await Promise.all([
        subscriptionStorage.getSubscriptions(),
        subscriptionStorage.getCategories(),
        subscriptionStorage.getSubscriptionStats(),
        subscriptionStorage.getUpcomingPayments(7),
      ]);
      
      setSubscriptions(subscriptionsData);
      setCategories(categoriesData);
      setSubscriptionStats(stats);
      setUpcomingPayments(upcomingPaymentsData);
      
      // Calculate analytics
      const spendingTrendsData = calculateSpendingTrends(subscriptionsData);
      const monthlyComparisonData = calculateMonthlyComparison(subscriptionsData);
      const categoryBreakdownData = calculateCategoryBreakdown(stats.categoryStats, categoriesData);
      
      setSpendingTrends(spendingTrendsData);
      setMonthlyComparison(monthlyComparisonData);
      setCategoryBreakdown(categoryBreakdownData);
      
      // Generate insights
      const insightsData = generateInsights(subscriptionsData, stats);
      const recommendationsData = generateRecommendations(subscriptionsData, stats);
      
      setInsights(insightsData);
      setRecommendations(recommendationsData);
      
      // Calculate budget status
      const budgetStatusData = calculateBudgetStatus(stats.monthlyTotal, settings?.budget);
      const overspendingCategoriesData = findOverspendingCategories(
        stats.categoryStats,
        settings?.budget?.categoryLimits
      );
      
      setBudgetStatus(budgetStatusData);
      setOverspendingCategories(overspendingCategoriesData);
      
      // Update filtered subscriptions
      updateFilteredSubscriptions(
        subscriptionsData,
        searchQuery,
        selectedFilters,
        sortBy,
        sortOrder
      );
      
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [settings, searchQuery, selectedFilters, sortBy, sortOrder, updateFilteredSubscriptions]);

  /**
   * SELECTION MANAGEMENT
   */
  
  const handleSelectSubscription = useCallback((subscription: Subscription | null) => {
    setSelectedSubscription(subscription);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedSubscription(null);
  }, []);

  const handleSetIsEditing = useCallback((editing: boolean) => {
    setIsEditing(editing);
  }, []);

  /**
   * ANALYTICS AND INSIGHTS
   */
  
  const getSpendingByCategory = useCallback((): CategoryBreakdown[] => {
    return categoryBreakdown;
  }, [categoryBreakdown]);

  const getSpendingTrend = useCallback((period: 'weekly' | 'monthly' | 'yearly' = 'monthly'): SpendingTrend[] => {
    if (period === 'monthly') {
      return spendingTrends;
    }
    // Could implement weekly, yearly trends
    return [];
  }, [spendingTrends]);

  const getMonthlyComparison = useCallback((): any[] => {
    return monthlyComparison;
  }, [monthlyComparison]);

  const getInsights = useCallback((): Insight[] => {
    return insights;
  }, [insights]);

  const getRecommendations = useCallback((): Recommendation[] => {
    return recommendations;
  }, [recommendations]);

  const getBudgetStatus = useCallback((): BudgetStatus | null => {
    return budgetStatus;
  }, [budgetStatus]);

  /**
   * EXPORT/IMPORT
   */
  
  const exportSubscriptions = useCallback(async (): Promise<any> => {
    try {
      setIsLoading(true);
      
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
      setIsLoading(false);
    }
  }, []);

  const importSubscriptions = useCallback(async (importData: any): Promise<void> => {
    try {
      setIsLoading(true);
      
      await subscriptionStorage.importData(importData);
      
      // Refresh data
      await refreshData();
      
      // Reschedule notifications
      await notificationsService.scheduleAllReminders(subscriptions);
      
      // Track analytics
      await analyticsService.trackEvent('data_imported', {
        itemCount: importData.subscriptions?.length || 0,
      });
      
    } catch (error) {
      console.error('Error importing subscriptions:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [subscriptions, refreshData]);

  /**
   * UTILITY FUNCTIONS
   */
  
  // Calculate spending trends
  const calculateSpendingTrends = (subscriptionsList: Subscription[]): SpendingTrend[] => {
    // Implementation for calculating spending trends
    // This would typically analyze spending over time
    const trends: SpendingTrend[] = [];
    
    // Group by month and calculate totals
    const monthlyTotals: Record<string, number> = {};
    
    subscriptionsList.forEach(sub => {
      if (sub.isActive) {
        const date = new Date(sub.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        const amount = convertAmount(
          parseFloat(sub.amount.toString()),
          sub.currency || 'USD',
          settings?.currency.primary || 'USD'
        );
        
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + amount;
      }
    });
    
    // Convert to array and sort by month
    Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, amount], index, array) => {
        const change = index > 0 
          ? ((amount - array[index - 1][1]) / array[index - 1][1]) * 100
          : 0;
        
        trends.push({
          month,
          amount: parseFloat(amount.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
        });
      });
    
    return trends.slice(-6); // Last 6 months
  };

  // Calculate monthly comparison
  const calculateMonthlyComparison = (subscriptionsList: Subscription[]): any[] => {
    const comparison = [];
    
    // Get current month and previous month totals
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let currentMonthTotal = 0;
    let previousMonthTotal = 0;
    
    subscriptionsList.forEach(sub => {
      if (sub.isActive) {
        const amount = convertAmount(
          parseFloat(sub.amount.toString()),
          sub.currency || 'USD',
          settings?.currency.primary || 'USD'
        );
        
        // Calculate monthly amount based on billing cycle
        let monthlyAmount = amount;
        switch (sub.billingCycle) {
          case 'yearly':
            monthlyAmount = amount / 12;
            break;
          case 'quarterly':
            monthlyAmount = amount / 3;
            break;
          case 'weekly':
            monthlyAmount = amount * 4.33;
            break;
          case 'daily':
            monthlyAmount = amount * 30;
            break;
        }
        
        // For simplicity, assume all subscriptions contribute to current month
        currentMonthTotal += monthlyAmount;
        previousMonthTotal += monthlyAmount * 0.95; // Assume 5% less for previous month
      }
    });
    
    comparison.push({
      month: 'Current',
      amount: parseFloat(currentMonthTotal.toFixed(2)),
    });
    
    comparison.push({
      month: 'Previous',
      amount: parseFloat(previousMonthTotal.toFixed(2)),
    });
    
    return comparison;
  };

  // Calculate category breakdown
  const calculateCategoryBreakdown = (
    categoryStatsData: Record<string, { count: number; total: number; monthly: number }>,
    categoriesList: Category[]
  ): CategoryBreakdown[] => {
    const totalMonthly = Object.values(categoryStatsData).reduce((sum, stats) => sum + stats.monthly, 0);
    
    return Object.entries(categoryStatsData).map(([categoryId, stats]) => {
      const category = categoriesList.find(cat => cat.id === categoryId);
      
      return {
        categoryId,
        categoryName: category?.name || 'Unknown',
        color: category?.color || '#4ECDC4',
        count: stats.count,
        total: stats.total,
        monthly: stats.monthly,
        percentage: totalMonthly > 0 ? (stats.monthly / totalMonthly) * 100 : 0,
      };
    });
  };

  // Generate insights
  const generateInsights = (subscriptionsList: Subscription[], stats: SubscriptionStats): Insight[] => {
    const insightsList: Insight[] = [];
    
    // Example insights
    if (stats.monthlyTotal > 100) {
      insightsList.push({
        id: 'high_spending',
        type: 'warning',
        title: 'High Monthly Spending',
        message: `You're spending $${stats.monthlyTotal.toFixed(2)} per month on subscriptions.`,
        suggestion: 'Consider reviewing inactive subscriptions.',
      });
    }
    
    // Check for unused subscriptions (simplified logic)
    const unusedCount = subscriptionsList.filter(sub => {
      // In real app, you would check usage data
      return sub.isActive && Math.random() > 0.7; // Random for demo
    }).length;
    
    if (unusedCount > 0) {
      insightsList.push({
        id: 'unused_subscriptions',
        type: 'info',
        title: 'Potential Savings',
        message: `You have ${unusedCount} subscription(s) that may not be used regularly.`,
        suggestion: 'Review your usage and consider cancelling unused services.',
      });
    }
    
    // Add more insights based on your business logic
    
    return insightsList;
  };

  // Generate recommendations
  const generateRecommendations = (subscriptionsList: Subscription[], stats: SubscriptionStats): Recommendation[] => {
    const recommendationsList: Recommendation[] = [];
    
    // Example: Recommend cheaper alternatives
    const expensiveSubscriptions = subscriptionsList.filter(sub => {
      const amount = parseFloat(sub.amount.toString());
      return sub.isActive && amount > 20;
    });
    
    if (expensiveSubscriptions.length > 0) {
      recommendationsList.push({
        id: 'cheaper_alternatives',
        type: 'savings',
        title: 'Consider Cheaper Alternatives',
        message: `You have ${expensiveSubscriptions.length} expensive subscription(s).`,
        action: 'Explore Alternatives',
        savings: expensiveSubscriptions.reduce((sum, sub) => sum + parseFloat(sub.amount.toString()) * 0.3, 0), // Assume 30% savings
      });
    }
    
    // Example: Bundle recommendations
    const streamingServices = subscriptionsList.filter(sub => 
      sub.categoryId === '1' && sub.isActive // Entertainment category
    );
    
    if (streamingServices.length >= 2) {
      recommendationsList.push({
        id: 'bundle_services',
        type: 'optimization',
        title: 'Bundle Streaming Services',
        message: 'You have multiple streaming subscriptions. Consider bundling for savings.',
        action: 'View Bundles',
        savings: 10, // Example savings
      });
    }
    
    return recommendationsList;
  };

  // Calculate budget status
  const calculateBudgetStatus = (
    monthlyTotal: number, 
    budgetSettings: any
  ): BudgetStatus | null => {
    if (!budgetSettings || budgetSettings.monthlyLimit <= 0) {
      return null;
    }
    
    const percentage = (monthlyTotal / budgetSettings.monthlyLimit) * 100;
    const status = percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good';
    
    return {
      monthlyTotal,
      budgetLimit: budgetSettings.monthlyLimit,
      percentage: parseFloat(percentage.toFixed(2)),
      status,
      remaining: budgetSettings.monthlyLimit - monthlyTotal,
    };
  };

  // Find overspending categories
  const findOverspendingCategories = (
    categoryStatsData: Record<string, { count: number; total: number; monthly: number }>,
    categoryLimits: Record<string, number> | undefined
  ): Array<{ categoryId: string; monthlySpent: number; budgetLimit: number; overspentBy: number }> => {
    if (!categoryLimits) return [];
    
    return Object.entries(categoryStatsData)
      .filter(([categoryId, stats]) => {
        const limit = categoryLimits[categoryId];
        return limit && stats.monthly > limit;
      })
      .map(([categoryId, stats]) => ({
        categoryId,
        monthlySpent: stats.monthly,
        budgetLimit: categoryLimits[categoryId],
        overspentBy: stats.monthly - categoryLimits[categoryId],
      }));
  };

  /**
   * EXPORT HOOK RETURN VALUE
   */
  return {
    // State
    subscriptions,
    categories,
    paymentHistory,
    upcomingPayments,
    subscriptionStats,
    categoryStats,
    monthlySpending,
    yearlySpending,
    
    // Filtering and search
    filteredSubscriptions,
    searchQuery,
    selectedFilters,
    sortBy,
    sortOrder,
    
    // UI state
    isLoading,
    isRefreshing,
    selectedSubscription,
    isEditing,
    
    // Analytics
    spendingTrends,
    monthlyComparison,
    categoryBreakdown,
    
    // Insights
    insights,
    recommendations,
    
    // Budget
    budgetStatus,
    overspendingCategories,
    
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
    setSearchQuery: handleSetSearchQuery,
    setFilter: handleSetFilter,
    clearFilters: handleClearFilters,
    setSort: handleSetSort,
    
    // Data management
    refreshData,
    
    // Selection management
    selectSubscription: handleSelectSubscription,
    clearSelection: handleClearSelection,
    setIsEditing: handleSetIsEditing,
    
    // Analytics and insights
    getSpendingByCategory,
    getSpendingTrend,
    getMonthlyComparison,
    getInsights,
    getRecommendations,
    getBudgetStatus,
    
    // Export/Import
    exportSubscriptions,
    importSubscriptions,
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

// Default export
export default useSubscriptions;