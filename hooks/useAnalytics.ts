import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { useSubscriptions } from './useSubscriptions';
import { usePayments } from './usePayments';
import { useCategories } from './useCategories';
import { useCurrency } from '@context/CurrencyContext';
import spendingAnalytics, { 
  SpendingSummary, 
  CategorySpending, 
  SpendingInsight 
} from '@services/analytics/spendingAnalytics';
import trendAnalysis, { 
  TrendData, 
  SpendingPrediction,
  SeasonalPattern 
} from '@services/analytics/trendAnalysis';
import calculations from '@utils/calculations';

interface MonthlyTrend {
  month: string;
  total: number;
  categories: Record<string, number>;
}

interface ValueScore {
  subscriptionId: string;
  subscriptionName: string;
  score: number;
  costPerUse: number;
  valueTier: 'excellent' | 'good' | 'average' | 'poor';
  recommendations: string[];
}

interface UnusualCharge {
  payment: any;
  subscription: any;
  reason: string;
  deviation: number;
}

interface UseAnalyticsReturn {
  // Data
  summary: SpendingSummary;
  categoryBreakdown: CategorySpending[];
  insights: SpendingInsight[];
  monthlyTrend: MonthlyTrend[];
  trend: TrendData | null;
  prediction: SpendingPrediction | null;
  seasonalPatterns: SeasonalPattern[];
  valueScores: ValueScore[];
  unusualCharges: UnusualCharge[];
  
  // Status
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  
  // Actions
  refreshAnalytics: () => Promise<void>;
  getInsightsByType: (type: 'warning' | 'info' | 'success' | 'tip') => SpendingInsight[];
  getTopCategories: (limit?: number) => CategorySpending[];
  getWorstValueSubscriptions: (limit?: number) => ValueScore[];
  getBestValueSubscriptions: (limit?: number) => ValueScore[];
  exportAnalytics: () => Promise<any>;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const { subscriptions, loading: subsLoading } = useSubscriptions();
  const { payments, loading: paymentsLoading } = usePayments();
  const { categories } = useCategories();
  const { currency } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Computed analytics data
  const summary = useMemo<SpendingSummary>(() => {
    try {
      return spendingAnalytics.getSpendingSummary(subscriptions);
    } catch (err) {
      console.error('Error calculating summary:', err);
      return {
        totalMonthly: 0,
        totalYearly: 0,
        averagePerSubscription: 0,
        mostExpensiveSubscription: null,
        cheapestSubscription: null,
        activeSubscriptionsCount: 0,
        pausedSubscriptionsCount: 0,
        cancelledSubscriptionsCount: 0,
      };
    }
  }, [subscriptions, currency.code]);

  const categoryBreakdown = useMemo<CategorySpending[]>(() => {
    try {
      return spendingAnalytics.getCategoryBreakdown(subscriptions, categories);
    } catch (err) {
      console.error('Error calculating category breakdown:', err);
      return [];
    }
  }, [subscriptions, categories, currency.code]);

  const monthlyTrend = useMemo<MonthlyTrend[]>(() => {
    try {
      return spendingAnalytics.getMonthlyTrend(subscriptions, payments, 6);
    } catch (err) {
      console.error('Error calculating monthly trend:', err);
      return [];
    }
  }, [subscriptions, payments, currency.code]);

  const insights = useMemo<SpendingInsight[]>(() => {
    try {
      return spendingAnalytics.generateInsights(subscriptions, payments, categories);
    } catch (err) {
      console.error('Error generating insights:', err);
      return [];
    }
  }, [subscriptions, payments, categories, summary, categoryBreakdown]);

  const trend = useMemo<TrendData | null>(() => {
    try {
      return trendAnalysis.analyzeSpendingTrend(subscriptions, payments, 6);
    } catch (err) {
      console.error('Error analyzing trend:', err);
      return null;
    }
  }, [subscriptions, payments, monthlyTrend]);

  const prediction = useMemo<SpendingPrediction | null>(() => {
    try {
      if (!trend) return null;
      return trendAnalysis.predictSpending(subscriptions, payments, trend);
    } catch (err) {
      console.error('Error predicting spending:', err);
      return null;
    }
  }, [subscriptions, payments, trend]);

  const seasonalPatterns = useMemo<SeasonalPattern[]>(() => {
    try {
      return trendAnalysis.detectSeasonalPatterns(subscriptions, payments, 2);
    } catch (err) {
      console.error('Error detecting seasonal patterns:', err);
      return [];
    }
  }, [payments]);

  const valueScores = useMemo<ValueScore[]>(() => {
    try {
      // Mock usage data - in real app, this would come from usage tracking
      const usageData: Record<string, number> = {};
      subscriptions.forEach(sub => {
        usageData[sub.id] = Math.floor(Math.random() * 30); // Mock data
      });
      
      return trendAnalysis.calculateValueScores(subscriptions, payments, usageData);
    } catch (err) {
      console.error('Error calculating value scores:', err);
      return [];
    }
  }, [subscriptions, payments]);

  const unusualCharges = useMemo<UnusualCharge[]>(() => {
    try {
      return trendAnalysis.detectUnusualCharges(subscriptions, payments);
    } catch (err) {
      console.error('Error detecting unusual charges:', err);
      return [];
    }
  }, [subscriptions, payments]);

  // Refresh analytics data
  const refreshAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Force recompute all analytics by incrementing trigger
      setRefreshTrigger(prev => prev + 1);
      setLastUpdated(new Date());
      
      // In a real app, you might want to fetch fresh data from API here
      // await fetchFreshData();
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh analytics'));
      console.error('Error refreshing analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter insights by type
  const getInsightsByType = useCallback((type: 'warning' | 'info' | 'success' | 'tip') => {
    return insights.filter(insight => insight.type === type);
  }, [insights]);

  // Get top spending categories
  const getTopCategories = useCallback((limit: number = 5) => {
    return categoryBreakdown.slice(0, limit);
  }, [categoryBreakdown]);

  // Get worst value subscriptions
  const getWorstValueSubscriptions = useCallback((limit: number = 5) => {
    return [...valueScores]
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);
  }, [valueScores]);

  // Get best value subscriptions
  const getBestValueSubscriptions = useCallback((limit: number = 5) => {
    return [...valueScores]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }, [valueScores]);

  // Export analytics data
  const exportAnalytics = useCallback(async () => {
    return {
      summary,
      categoryBreakdown,
      monthlyTrend,
      insights,
      trend,
      prediction,
      seasonalPatterns,
      valueScores,
      unusualCharges,
      exportDate: new Date(),
      currency: currency.code,
    };
  }, [
    summary,
    categoryBreakdown,
    monthlyTrend,
    insights,
    trend,
    prediction,
    seasonalPatterns,
    valueScores,
    unusualCharges,
    currency,
  ]);

  // Auto-refresh on focus
  useFocusEffect(
    useCallback(() => {
      refreshAnalytics();
    }, [refreshAnalytics])
  );

  // Update loading state based on dependencies
  useEffect(() => {
    setLoading(subsLoading || paymentsLoading);
  }, [subsLoading, paymentsLoading]);

  // Log errors
  useEffect(() => {
    if (error) {
      console.error('Analytics hook error:', error);
    }
  }, [error]);

  return {
    // Data
    summary,
    categoryBreakdown,
    insights,
    monthlyTrend,
    trend,
    prediction,
    seasonalPatterns,
    valueScores,
    unusualCharges,
    
    // Status
    loading,
    error,
    lastUpdated,
    
    // Actions
    refreshAnalytics,
    getInsightsByType,
    getTopCategories,
    getWorstValueSubscriptions,
    getBestValueSubscriptions,
    exportAnalytics,
  };
};

export default useAnalytics;