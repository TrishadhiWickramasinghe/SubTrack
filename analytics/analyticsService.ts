import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, format, startOfMonth, subMonths, subYears } from 'date-fns';

// Types
export interface SpendingData {
  date: Date;
  amount: number;
  category: string;
  subscriptionId?: string;
  subscriptionName?: string;
}

export interface MonthlySpending {
  month: Date;
  total: number;
  categories: Record<string, number>;
  subscriptions: Record<string, number>;
  count: number;
  average: number;
  trend: number;
  forecast?: boolean;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  trend: number;
  previousAmount: number;
  subscriptionCount: number;
}

export interface SubscriptionAnalytics {
  id: string;
  name: string;
  totalSpent: number;
  monthlyAverage: number;
  lastPayment: Date;
  nextPayment: Date;
  paymentHistory: PaymentRecord[];
  costPerUse?: number;
  usageCount?: number;
  valueScore?: number;
}

export interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
}

export interface Insight {
  id: string;
  type: 'savings' | 'warning' | 'info' | 'trend' | 'opportunity';
  title: string;
  description: string;
  value?: number;
  impact?: 'high' | 'medium' | 'low';
  action?: string;
  category?: string;
  subscriptionId?: string;
}

export interface Forecast {
  period: string;
  predictedAmount: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
  factors: Array<{
    name: string;
    impact: number;
  }>;
}

export interface Anomaly {
  id: string;
  date: Date;
  amount: number;
  expectedAmount: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  category?: string;
  subscriptionId?: string;
  detectedAt: Date;
}

export interface BudgetData {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'under' | 'warning' | 'over' | 'danger';
  rollover?: number;
  trend?: number;
}

export interface BudgetSummary {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  status: 'under' | 'warning' | 'over' | 'danger';
  daysRemaining: number;
  dailyBudget: number;
  dailyAverage: number;
  projectedTotal: number;
  projectedStatus: 'under' | 'warning' | 'over' | 'danger';
}

export interface ComparisonData {
  period1: {
    start: Date;
    end: Date;
    total: number;
    average: number;
  };
  period2: {
    start: Date;
    end: Date;
    total: number;
    average: number;
  };
  difference: number;
  percentageChange: number;
  categories: Record<string, {
    period1: number;
    period2: number;
    change: number;
    percentageChange: number;
  }>;
  insights: string[];
}

export interface YearlyData {
  year: number;
  total: number;
  average: number;
  peak: {
    month: string;
    amount: number;
  };
  low: {
    month: string;
    amount: number;
  };
  months: Array<{
    month: string;
    amount: number;
  }>;
}

export interface ReportOptions {
  format: 'pdf' | 'csv' | 'excel';
  period: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  startDate?: Date;
  endDate?: Date;
  includeCharts?: boolean;
  includeCategories?: boolean;
  includePredictions?: boolean;
  includeRecommendations?: boolean;
}

export interface Report {
  id: string;
  title: string;
  generatedAt: Date;
  period: string;
  data: any;
  url?: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private storageKey = 'subtrack_analytics';
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private subscribers: Set<(data: any) => void> = new Set();

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // ================ INITIALIZATION & DATA MANAGEMENT ================

  /**
   * Initialize analytics service
   */
  public async initialize(): Promise<void> {
    try {
      await this.migrateData();
      await this.cacheData();
      this.startBackgroundAnalysis();
    } catch (error) {
      console.error('Failed to initialize analytics service:', error);
    }
  }

  /**
   * Migrate data from old versions
   */
  private async migrateData(): Promise<void> {
    // Implement data migration logic
  }

  /**
   * Cache data for faster access
   */
  private async cacheData(): Promise<void> {
    const analytics = await this.getAnalyticsData();
    this.cache.set('analytics', {
      data: analytics,
      timestamp: Date.now(),
    });
  }

  /**
   * Start background analysis jobs
   */
  private startBackgroundAnalysis(): void {
    setInterval(() => {
      this.runAnalysisJobs();
    }, 30 * 60 * 1000); // Every 30 minutes
  }

  /**
   * Run analysis jobs in background
   */
  private async runAnalysisJobs(): Promise<void> {
    try {
      await Promise.all([
        this.detectAnomalies(),
        this.generatePredictions(),
        this.findSavingsOpportunities(),
      ]);
    } catch (error) {
      console.error('Failed to run analysis jobs:', error);
    }
  }

  /**
   * Get analytics data from storage
   */
  private async getAnalyticsData(): Promise<any> {
    const data = await AsyncStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Save analytics data to storage
   */
  private async saveAnalyticsData(data: any): Promise<void> {
    await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
    this.notifySubscribers(data);
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  // ================ SUBSCRIPTION MANAGEMENT ================

  /**
   * Subscribe to analytics updates
   */
  public subscribe(callback: (data: any) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify subscribers of updates
   */
  private notifySubscribers(data: any): void {
    this.subscribers.forEach(callback => callback(data));
  }

  // ================ CORE ANALYTICS ================

  /**
   * Get spending data for a specific period
   */
  public async getSpendingData(
    period: 'month' | 'quarter' | 'year' | 'all' = 'year',
    category?: string
  ): Promise<SpendingData[]> {
    try {
      const cacheKey = `spending_${period}_${category || 'all'}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const subscriptions = await this.getSubscriptions();
      const spendingData: SpendingData[] = [];

      subscriptions.forEach((sub: any) => {
        if (!sub.isActive) return;

        // Generate payment history
        const payments = this.getPaymentHistory(sub.id);
        payments.then((paymentList: PaymentRecord[]) => {
          paymentList.forEach((payment: PaymentRecord) => {
            spendingData.push({
              date: payment.date,
              amount: payment.amount,
              category: sub.category,
              subscriptionId: sub.id,
              subscriptionName: sub.name,
            });
          });
        });
      });

      // Filter by period
      const filtered = this.filterByPeriod(spendingData, period);

      // Filter by category if specified
      const result = category
        ? filtered.filter(d => d.category === category)
        : filtered;

      // Cache result
      this.setCache(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Failed to get spending data:', error);
      return [];
    }
  }

  /**
   * Get monthly spending data
   */
  public async getMonthlyData(
    months: number = 12,
    includeForecast: boolean = true
  ): Promise<MonthlySpending[]> {
    try {
      const cacheKey = `monthly_${months}_${includeForecast}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const spendingData = await this.getSpendingData('all');
      const monthlyData: Record<string, MonthlySpending> = {};

      // Group by month
      spendingData.forEach(data => {
        const monthKey = format(data.date, 'yyyy-MM');
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: new Date(data.date),
            total: 0,
            categories: {},
            subscriptions: {},
            count: 0,
            average: 0,
            trend: 0,
          };
        }

        monthlyData[monthKey].total += data.amount;
        monthlyData[monthKey].count++;
        monthlyData[monthKey].categories[data.category] = 
          (monthlyData[monthKey].categories[data.category] || 0) + data.amount;
        
        if (data.subscriptionId) {
          monthlyData[monthKey].subscriptions[data.subscriptionId] = 
            (monthlyData[monthKey].subscriptions[data.subscriptionId] || 0) + data.amount;
        }
      });

      // Calculate averages and trends
      const result = Object.values(monthlyData)
        .sort((a, b) => a.month.getTime() - b.month.getTime())
        .map((month, index, array) => {
          month.average = month.count > 0 ? month.total / month.count : 0;
          month.trend = index > 0 
            ? ((month.total - array[index - 1].total) / array[index - 1].total) * 100 
            : 0;
          return month;
        });

      // Take last N months
      const sliced = result.slice(-months);

      // Add forecast if requested
      if (includeForecast && result.length >= 6) {
        const forecast = await this.generateMonthForecast(result);
        sliced.push(...forecast);
      }

      this.setCache(cacheKey, sliced);
      return sliced;
    } catch (error) {
      console.error('Failed to get monthly data:', error);
      return [];
    }
  }

  /**
   * Get category breakdown
   */
  public async getCategoryBreakdown(
    period: 'month' | 'quarter' | 'year' | 'all' = 'month'
  ): Promise<CategorySpending[]> {
    try {
      const cacheKey = `category_breakdown_${period}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const spendingData = await this.getSpendingData(period);
      const total = spendingData.reduce((sum, d) => sum + d.amount, 0);
      const categoryMap: Record<string, CategorySpending> = {};

      // Calculate previous period spending for trends
      const previousPeriod = this.getPreviousPeriod(period) as 'month' | 'quarter' | 'year' | 'all';
      const previousSpending = await this.getSpendingData(previousPeriod);

      spendingData.forEach(data => {
        if (!categoryMap[data.category]) {
          categoryMap[data.category] = {
            category: data.category,
            amount: 0,
            percentage: 0,
            trend: 0,
            previousAmount: 0,
            subscriptionCount: 0,
          };
        }

        categoryMap[data.category].amount += data.amount;
        categoryMap[data.category].subscriptionCount++;
      });

      // Calculate previous period amounts
      previousSpending.forEach(data => {
        if (categoryMap[data.category]) {
          categoryMap[data.category].previousAmount += data.amount;
        }
      });

      // Calculate percentages and trends
      const result = Object.values(categoryMap)
        .map(cat => {
          cat.percentage = (cat.amount / total) * 100;
          cat.trend = cat.previousAmount > 0
            ? ((cat.amount - cat.previousAmount) / cat.previousAmount) * 100
            : 0;
          return cat;
        })
        .sort((a, b) => b.amount - a.amount);

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get category breakdown:', error);
      return [];
    }
  }

  /**
   * Get subscription analytics
   */
  public async getSubscriptionAnalytics(
    subscriptionId: string
  ): Promise<SubscriptionAnalytics | null> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) return null;

      const paymentHistory = await this.getPaymentHistory(subscriptionId);
      const totalSpent = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
      
      // Calculate monthly average
      const monthsActive = this.calculateMonthsActive(subscription);
      const monthlyAverage = monthsActive > 0 ? totalSpent / monthsActive : subscription.amount;

      // Calculate value score
      const valueScore = await this.calculateValueScore(subscription, paymentHistory);

      return {
        id: subscription.id,
        name: subscription.name,
        totalSpent,
        monthlyAverage,
        lastPayment: paymentHistory[paymentHistory.length - 1]?.date || new Date(),
        nextPayment: new Date(subscription.billingDate),
        paymentHistory,
        valueScore,
      };
    } catch (error) {
      console.error('Failed to get subscription analytics:', error);
      return null;
    }
  }

  // ================ AI INSIGHTS & RECOMMENDATIONS ================

  /**
   * Get AI-powered insights
   */
  public async getInsights(): Promise<Insight[]> {
    try {
      const cached = this.getFromCache('insights');
      if (cached) return cached;

      const insights: Insight[] = [];

      // Run all insight generators
      const [
        savingsInsights,
        trendInsights,
        anomalyInsights,
        opportunityInsights,
        budgetInsights,
      ] = await Promise.all([
        this.findSavingsOpportunities(),
        this.analyzeTrends(),
        this.detectAnomalies(),
        this.findOptimizationOpportunities(),
        this.analyzeBudgetInsights(),
      ]);

      insights.push(...savingsInsights);
      insights.push(...trendInsights);
      insights.push(...anomalyInsights);
      insights.push(...opportunityInsights);
      insights.push(...budgetInsights);

      // Sort by impact
      const sorted = insights.sort((a, b) => {
        const impactWeight = { high: 3, medium: 2, low: 1 };
        return (impactWeight[b.impact || 'medium'] || 0) - (impactWeight[a.impact || 'medium'] || 0);
      });

      this.setCache('insights', sorted);
      return sorted;
    } catch (error) {
      console.error('Failed to get insights:', error);
      return [];
    }
  }

  /**
   * Find savings opportunities
   */
  private async findSavingsOpportunities(): Promise<Insight[]> {
    const insights: Insight[] = [];
    const subscriptions = await this.getSubscriptions();
    const monthlySpending = await this.getMonthlyData(6);

    // Find duplicate subscriptions
    const duplicates = this.findDuplicateSubscriptions(subscriptions);
    duplicates.forEach(dup => {
      insights.push({
        id: `savings_dup_${dup.name}`,
        type: 'savings',
        title: 'Duplicate Subscription Detected',
        description: `You have multiple ${dup.name} subscriptions. Consider consolidating to save money.`,
        value: dup.potentialSavings,
        impact: dup.count > 2 ? 'high' : 'medium',
        action: 'consolidate',
        category: dup.category,
      });
    });

    // Find unused subscriptions (no payments in last 30 days)
    subscriptions.forEach(sub => {
      const lastPayment = sub.lastPaidDate ? new Date(sub.lastPaidDate) : null;
      if (lastPayment) {
        const daysSinceLastPayment = differenceInDays(new Date(), lastPayment);
        if (daysSinceLastPayment > 30) {
          insights.push({
            id: `savings_unused_${sub.id}`,
            type: 'warning',
            title: 'Unused Subscription',
            description: `You haven't used ${sub.name} in ${daysSinceLastPayment} days. Consider pausing or canceling.`,
            value: sub.amount * 12, // Yearly savings
            impact: 'medium',
            action: 'review',
            subscriptionId: sub.id,
          });
        }
      }
    });

    // Find cheaper alternatives
    const alternatives = await this.findCheaperAlternatives(subscriptions);
    alternatives.forEach((alt: any) => {
      insights.push({
        id: `savings_alt_${alt.subscriptionId}`,
        type: 'savings',
        title: 'Cheaper Alternative Available',
        description: `Switch ${alt.name} to ${alt.alternative} and save ${this.formatCurrency(alt.savings)}/month`,
        value: alt.savings * 12,
        impact: 'medium',
        action: 'compare',
        subscriptionId: alt.subscriptionId,
      });
    });

    return insights;
  }

  /**
   * Analyze spending trends
   */
  private async analyzeTrends(): Promise<Insight[]> {
    const insights: Insight[] = [];
    const monthlyData = await this.getMonthlyData(12);

    if (monthlyData.length < 3) return insights;

    // Check overall spending trend
    const firstMonth = monthlyData[0];
    const lastMonth = monthlyData[monthlyData.length - 1];
    const yearlyChange = ((lastMonth.total - firstMonth.total) / firstMonth.total) * 100;

    if (Math.abs(yearlyChange) > 20) {
      insights.push({
        id: 'trend_overall',
        type: 'trend',
        title: yearlyChange > 0 ? 'Spending Increasing Rapidly' : 'Spending Decreasing',
        description: `Your spending has ${yearlyChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(yearlyChange).toFixed(0)}% compared to last year`,
        value: Math.abs(lastMonth.total - firstMonth.total),
        impact: yearlyChange > 20 ? 'high' : 'medium',
      });
    }

    // Check seasonal patterns
    const seasonal = this.detectSeasonalPatterns(monthlyData);
    if (seasonal) {
      insights.push({
        id: 'trend_seasonal',
        type: 'info',
        title: 'Seasonal Spending Pattern',
        description: `Your spending peaks in ${seasonal.month}. Plan ahead for these months.`,
        impact: 'medium',
      });
    }

    return insights;
  }

  /**
   * Detect anomalies in spending
   */
  private async detectAnomalies(): Promise<Insight[]> {
    const insights: Insight[] = [];
    const spendingData = await this.getSpendingData('month');

    if (spendingData.length < 10) return insights;

    // Calculate mean and standard deviation
    const amounts = spendingData.map(d => d.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + stdDev * 2;

    // Find anomalies
    const anomalies = spendingData.filter(d => d.amount > threshold);
    
    anomalies.forEach((anomaly, index) => {
      insights.push({
        id: `anomaly_${index}`,
        type: 'warning',
        title: 'Unusual Spending Detected',
        description: `${this.formatCurrency(anomaly.amount)} spent on ${anomaly.category} is higher than normal`,
        value: anomaly.amount - mean,
        impact: anomaly.amount > mean + stdDev * 3 ? 'high' : 'medium',
        category: anomaly.category,
      });
    });

    return insights;
  }

  /**
   * Find optimization opportunities
   */
  private async findOptimizationOpportunities(): Promise<Insight[]> {
    const insights: Insight[] = [];
    const subscriptions = await this.getSubscriptions();

    // Find subscriptions that could be switched to annual billing
    subscriptions.forEach((sub: any) => {
      if (sub.billingCycle === 'monthly') {
        const annualCost = sub.amount * 12;
        const typicalAnnualDiscount = annualCost * 0.15; // 15% discount estimate
        const potentialSavings = typicalAnnualDiscount;

        if (potentialSavings > 10) { // Only if savings > $10
          insights.push({
            id: `optimize_annual_${sub.id}`,
            type: 'savings',
            title: 'Switch to Annual Billing',
            description: `Save an estimated ${this.formatCurrency(potentialSavings)}/year by switching ${sub.name} to annual billing`,
            value: potentialSavings,
            impact: 'medium',
            action: 'switch_plan',
            subscriptionId: sub.id,
          });
        }
      }
    });

    // Find subscriptions with price increases
    const priceIncreases = await this.detectPriceIncreases(subscriptions);
    priceIncreases.forEach((inc: any) => {
      insights.push({
        id: `optimize_price_${inc.subscriptionId}`,
        type: 'warning',
        title: 'Price Increase Detected',
        description: `${inc.name} price increased by ${inc.increasePercentage}% (${this.formatCurrency(inc.increaseAmount)}/month)`,
        value: inc.increaseAmount * 12,
        impact: inc.increasePercentage > 20 ? 'high' : 'medium',
        action: 'review_price',
        subscriptionId: inc.subscriptionId,
      });
    });

    return insights;
  }

  /**
   * Analyze budget insights
   */
  private async analyzeBudgetInsights(): Promise<Insight[]> {
    const insights: Insight[] = [];
    const budgetData = await this.getBudgetData('monthly');

    budgetData.forEach((category: BudgetData) => {
      if (category.status === 'over') {
        insights.push({
          id: `budget_over_${category.category}`,
          type: 'warning',
          title: 'Budget Exceeded',
          description: `${category.category} budget exceeded by ${this.formatCurrency(category.spent - category.budgeted)}`,
          value: category.spent - category.budgeted,
          impact: category.percentage > 120 ? 'high' : 'medium',
          action: 'adjust_budget',
          category: category.category,
        });
      } else if (category.status === 'warning') {
        insights.push({
          id: `budget_warning_${category.category}`,
          type: 'info',
          title: 'Approaching Budget Limit',
          description: `${category.category} is at ${category.percentage.toFixed(0)}% of budget`,
          impact: 'low',
          action: 'review_spending',
          category: category.category,
        });
      }
    });

    return insights;
  }

  // ================ PREDICTIONS & FORECASTING ================

  /**
   * Generate predictions for future spending
   */
  public async generatePredictions(
    months: number = 3
  ): Promise<Forecast[]> {
    try {
      const cacheKey = `predictions_${months}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const monthlyData = await this.getMonthlyData(12, false);
      if (monthlyData.length < 6) return [];

      const predictions: Forecast[] = [];

      // Use linear regression for baseline prediction
      const amounts = monthlyData.map(m => m.total);
      const indices = amounts.map((_, i) => i);
      
      const slope = this.calculateLinearRegression(amounts, indices);
      const intercept = this.calculateIntercept(amounts, indices);
      
      // Calculate confidence intervals
      const residuals = amounts.map((y, i) => y - (slope * i + intercept));
      const stdDev = this.calculateStandardDeviation(residuals);

      for (let i = 1; i <= months; i++) {
        const index = amounts.length + i - 1;
        const predictedAmount = Math.max(0, slope * index + intercept);
        const confidence = this.calculateConfidence(i, months);
        
        predictions.push({
          period: `Month ${i}`,
          predictedAmount,
          confidence,
          lowerBound: Math.max(0, predictedAmount - stdDev * 2),
          upperBound: predictedAmount + stdDev * 2,
          factors: await this.getPredictionFactors(i),
        });
      }

      this.setCache(cacheKey, predictions);
      return predictions;
    } catch (error) {
      console.error('Failed to generate predictions:', error);
      return [];
    }
  }

  /**
   * Generate month forecast
   */
  private async generateMonthForecast(
    historicalData: MonthlySpending[]
  ): Promise<MonthlySpending[]> {
    const forecast: MonthlySpending[] = [];
    
    if (historicalData.length < 3) return forecast;

    const lastMonth = historicalData[historicalData.length - 1];
    const previousMonth = historicalData[historicalData.length - 2];
    
    // Calculate average growth rate
    const growthRates = [];
    for (let i = 1; i < historicalData.length; i++) {
      growthRates.push(
        (historicalData[i].total - historicalData[i - 1].total) / historicalData[i - 1].total
      );
    }
    
    const avgGrowthRate = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    const volatility = this.calculateStandardDeviation(growthRates);
    
    // Generate next month forecast
    const nextMonth = new Date(lastMonth.month);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const predictedAmount = lastMonth.total * (1 + avgGrowthRate);
    const confidence = Math.max(0, 1 - volatility * 2);
    
    // Create forecast object
    const forecastMonth: MonthlySpending = {
      month: nextMonth,
      total: Math.max(0, predictedAmount),
      categories: {},
      subscriptions: {},
      count: lastMonth.count,
      average: lastMonth.average * (1 + avgGrowthRate),
      trend: (predictedAmount - lastMonth.total) / lastMonth.total * 100,
    };
    
    // Distribute predicted amount across categories based on last month's proportions
    Object.entries(lastMonth.categories).forEach(([category, amount]) => {
      const proportion = amount / lastMonth.total;
      forecastMonth.categories[category] = predictedAmount * proportion;
    });
    
    forecastMonth.forecast = true;
    forecast.push(forecastMonth);
    
    return forecast;
  }

  // ================ BUDGET ANALYSIS ================

  /**
   * Get budget data
   */
  public async getBudgetData(
    period: 'monthly' | 'yearly' | 'custom' = 'monthly'
  ): Promise<BudgetData[]> {
    try {
      const cacheKey = `budget_${period}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const budgets = await this.getUserBudgets();
      const spending = await this.getCategoryBreakdown(period as any);
      const previousPeriod = await this.getCategoryBreakdown(
        period === 'monthly' ? 'month' : 'year' as any
      );

      const result: BudgetData[] = budgets.map(budget => {
        const categorySpending = spending.find(s => s.category === budget.category);
        const spent = categorySpending?.amount || 0;
        const previousSpent = previousPeriod.find(s => s.category === budget.category)?.amount || 0;
        const percentage = (spent / budget.amount) * 100;
        
        let status: 'under' | 'warning' | 'over' | 'danger' = 'under';
        if (percentage >= 100) status = 'danger';
        else if (percentage >= 90) status = 'over';
        else if (percentage >= 75) status = 'warning';

        return {
          category: budget.category,
          budgeted: budget.amount,
          spent,
          remaining: budget.amount - spent,
          percentage,
          status,
          rollover: budget.rollover || 0,
          trend: previousSpent > 0 
            ? ((spent - previousSpent) / previousSpent) * 100 
            : 0,
        };
      });

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get budget data:', error);
      return [];
    }
  }

  /**
   * Get budget summary
   */
  public async getBudgetSummary(
    period: 'monthly' | 'yearly' | 'custom' = 'monthly'
  ): Promise<BudgetSummary | null> {
    try {
      const budgetData = await this.getBudgetData(period);
      
      if (budgetData.length === 0) return null;

      const totalBudgeted = budgetData.reduce((sum, b) => sum + b.budgeted, 0);
      const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0);
      const totalRemaining = totalBudgeted - totalSpent;
      const overallPercentage = (totalSpent / totalBudgeted) * 100;

      let status: 'under' | 'warning' | 'over' | 'danger' = 'under';
      if (overallPercentage >= 100) status = 'danger';
      else if (overallPercentage >= 90) status = 'over';
      else if (overallPercentage >= 75) status = 'warning';

      // Calculate daily budget
      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const dayOfMonth = today.getDate();
      const daysRemaining = daysInMonth - dayOfMonth;
      
      const dailyBudget = totalBudgeted / daysInMonth;
      const dailyAverage = totalSpent / dayOfMonth;
      const projectedTotal = dailyAverage * daysInMonth;

      let projectedStatus: 'under' | 'warning' | 'over' | 'danger' = 'under';
      const projectedPercentage = (projectedTotal / totalBudgeted) * 100;
      if (projectedPercentage >= 100) projectedStatus = 'danger';
      else if (projectedPercentage >= 90) projectedStatus = 'over';
      else if (projectedPercentage >= 75) projectedStatus = 'warning';

      return {
        totalBudgeted,
        totalSpent,
        totalRemaining,
        overallPercentage,
        status,
        daysRemaining,
        dailyBudget,
        dailyAverage,
        projectedTotal,
        projectedStatus,
      };
    } catch (error) {
      console.error('Failed to get budget summary:', error);
      return null;
    }
  }

  /**
   * Get budget insights
   */
  public async getBudgetInsights(): Promise<string[]> {
    const insights: string[] = [];
    const budgetData = await this.getBudgetData('monthly');
    const summary = await this.getBudgetSummary('monthly');

    if (!summary) return insights;

    // Overall budget insights
    if (summary.status === 'danger') {
      insights.push(`You've exceeded your monthly budget by ${this.formatCurrency(Math.abs(summary.totalRemaining))}`);
    } else if (summary.status === 'over') {
      insights.push(`You're very close to exceeding your monthly budget (${summary.overallPercentage.toFixed(0)}% used)`);
    } else if (summary.status === 'warning') {
      insights.push(`You've used ${summary.overallPercentage.toFixed(0)}% of your monthly budget`);
    }

    // Spending rate insights
    if (summary.dailyAverage > summary.dailyBudget) {
      insights.push(`You're spending ${this.formatCurrency(summary.dailyAverage - summary.dailyBudget)} more per day than budgeted`);
    }

    // Category insights
    const overBudgetCategories = budgetData.filter(b => b.status === 'over' || b.status === 'danger');
    if (overBudgetCategories.length > 0) {
      insights.push(`${overBudgetCategories.length} categor${overBudgetCategories.length > 1 ? 'ies are' : 'y is'} over budget`);
    }

    const underBudgetCategories = budgetData.filter(b => b.status === 'under' && b.percentage < 50);
    if (underBudgetCategories.length > 0) {
      insights.push(`${underBudgetCategories.length} categor${underBudgetCategories.length > 1 ? 'ies have' : 'y has'} more than 50% budget remaining`);
    }

    return insights;
  }

  // ================ COMPARISON & TRENDS ================

  /**
   * Get comparison data between two periods
   */
  public async getComparisonData(
    periodComparison: '1m' | '3m' | '6m' | '12m'
  ): Promise<ComparisonData> {
    try {
      const cacheKey = `comparison_${periodComparison}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const now = new Date();
      let period2Start: Date, period2End: Date, period1Start: Date, period1End: Date;

      switch (periodComparison) {
        case '1m':
          period2End = now;
          period2Start = startOfMonth(now);
          period1End = new Date(period2Start);
          period1Start = startOfMonth(subMonths(now, 1));
          break;
        case '3m':
          period2End = now;
          period2Start = subMonths(now, 3);
          period1End = new Date(period2Start);
          period1Start = subMonths(now, 6);
          break;
        case '6m':
          period2End = now;
          period2Start = subMonths(now, 6);
          period1End = new Date(period2Start);
          period1Start = subMonths(now, 12);
          break;
        case '12m':
          period2End = now;
          period2Start = subMonths(now, 12);
          period1End = new Date(period2Start);
          period1Start = subMonths(now, 24);
          break;
      }

      const period1Data = await this.getSpendingData('all');
      const period2Data = await this.getSpendingData('all');

      const period1Filtered = period1Data.filter(d => 
        d.date >= period1Start && d.date <= period1End
      );
      const period2Filtered = period2Data.filter(d => 
        d.date >= period2Start && d.date <= period2End
      );

      const period1Total = period1Filtered.reduce((sum, d) => sum + d.amount, 0);
      const period2Total = period2Filtered.reduce((sum, d) => sum + d.amount, 0);

      const period1Average = period1Total / 3; // Average per month
      const period2Average = period2Total / 3;

      // Calculate category breakdowns
      const categories: Record<string, { period1: number; period2: number; change: number; percentageChange: number }> = {};

      period1Filtered.forEach(d => {
        if (!categories[d.category]) {
          categories[d.category] = { period1: 0, period2: 0, change: 0, percentageChange: 0 };
        }
        categories[d.category].period1 += d.amount;
      });

      period2Filtered.forEach(d => {
        if (!categories[d.category]) {
          categories[d.category] = { period1: 0, period2: 0, change: 0, percentageChange: 0 };
        }
        categories[d.category].period2 += d.amount;
      });

      // Calculate changes
      Object.keys(categories).forEach(category => {
        const cat = categories[category];
        cat.change = cat.period2 - cat.period1;
        cat.percentageChange = cat.period1 > 0 
          ? (cat.change / cat.period1) * 100 
          : 0;
      });

      // Generate insights
      const insights: string[] = [];
      const difference = period2Total - period1Total;
      const percentageChange = period1Total > 0 ? (difference / period1Total) * 100 : 0;

      if (Math.abs(percentageChange) > 20) {
        insights.push(`Overall spending ${percentageChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentageChange).toFixed(0)}%`);
      }

      const biggestIncrease = Object.entries(categories)
        .filter(([_, c]) => c.percentageChange > 0)
        .sort((a, b) => b[1].percentageChange - a[1].percentageChange)[0];

      if (biggestIncrease) {
        insights.push(`${biggestIncrease[0]} spending increased by ${biggestIncrease[1].percentageChange.toFixed(0)}%`);
      }

      const biggestDecrease = Object.entries(categories)
        .filter(([_, c]) => c.percentageChange < 0)
        .sort((a, b) => a[1].percentageChange - b[1].percentageChange)[0];

      if (biggestDecrease) {
        insights.push(`${biggestDecrease[0]} spending decreased by ${Math.abs(biggestDecrease[1].percentageChange).toFixed(0)}%`);
      }

      const result: ComparisonData = {
        period1: { start: period1Start, end: period1End, total: period1Total, average: period1Average },
        period2: { start: period2Start, end: period2End, total: period2Total, average: period2Average },
        difference,
        percentageChange,
        categories,
        insights,
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get comparison data:', error);
      throw error;
    }
  }

  /**
   * Get year over year data
   */
  public async getYearOverYearData(): Promise<YearlyData[]> {
    try {
      const cacheKey = 'yoy_data';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const spendingData = await this.getSpendingData('all');
      const yearlyData: Record<number, YearlyData> = {};

      spendingData.forEach(d => {
        const year = d.date.getFullYear();
        const month = format(d.date, 'MMMM');
        
        if (!yearlyData[year]) {
          yearlyData[year] = {
            year,
            total: 0,
            average: 0,
            peak: { month: '', amount: 0 },
            low: { month: '', amount: Infinity },
            months: [],
          };
        }

        yearlyData[year].total += d.amount;
        
        const monthData = yearlyData[year].months.find(m => m.month === month);
        if (monthData) {
          monthData.amount += d.amount;
        } else {
          yearlyData[year].months.push({ month, amount: d.amount });
        }

        // Update peak and low
        if (d.amount > yearlyData[year].peak.amount) {
          yearlyData[year].peak = { month, amount: d.amount };
        }
        if (d.amount < yearlyData[year].low.amount) {
          yearlyData[year].low = { month, amount: d.amount };
        }
      });

      // Calculate averages and sort months
      Object.values(yearlyData).forEach(year => {
        year.average = year.total / 12;
        year.months.sort((a, b) => {
          const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
          return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
        });
      });

      const result = Object.values(yearlyData).sort((a, b) => b.year - a.year);
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get year over year data:', error);
      return [];
    }
  }

  // ================ UTILITY FUNCTIONS ================

  /**
   * Get data from cache
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Filter data by period
   */
  private filterByPeriod(data: SpendingData[], period: string): SpendingData[] {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'quarter':
        startDate = subMonths(now, 3);
        break;
      case 'year':
        startDate = subYears(now, 1);
        break;
      case 'all':
      default:
        return data;
    }

    return data.filter(d => d.date >= startDate);
  }

  /**
   * Get previous period string
   */
  private getPreviousPeriod(period: string): string {
    switch (period) {
      case 'month': return 'month';
      case 'quarter': return 'quarter';
      case 'year': return 'year';
      default: return 'month';
    }
  }

  /**
   * Calculate linear regression slope
   */
  private calculateLinearRegression(y: number[], x: number[]): number {
    const n = y.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  /**
   * Calculate intercept
   */
  private calculateIntercept(y: number[], x: number[]): number {
    const n = y.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const slope = this.calculateLinearRegression(y, x);
    
    return (sumY - slope * sumX) / n;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(index: number, total: number): number {
    // Confidence decreases as we predict further into the future
    return Math.max(0, 1 - (index / total) * 0.5);
  }

  /**
   * Get prediction factors
   */
  private async getPredictionFactors(month: number): Promise<Array<{ name: string; impact: number }>> {
    const factors = [
      { name: 'Seasonal Trend', impact: Math.random() * 0.2 - 0.1 },
      { name: 'Historical Pattern', impact: Math.random() * 0.3 - 0.15 },
      { name: 'Recent Growth', impact: Math.random() * 0.25 - 0.125 },
    ];
    
    return factors;
  }

  /**
   * Find duplicate subscriptions
   */
  private findDuplicateSubscriptions(subscriptions: any[]): Array<{ name: string; count: number; category: string; potentialSavings: number }> {
    const nameCount: Record<string, { count: number; category: string; amounts: number[] }> = {};
    
    subscriptions.forEach(sub => {
      if (!nameCount[sub.name]) {
        nameCount[sub.name] = { count: 0, category: sub.category, amounts: [] };
      }
      nameCount[sub.name].count++;
      nameCount[sub.name].amounts.push(sub.amount);
    });
    
    return Object.entries(nameCount)
      .filter(([_, data]) => data.count > 1)
      .map(([name, data]) => ({
        name,
        count: data.count,
        category: data.category,
        potentialSavings: Math.min(...data.amounts) * (data.count - 1),
      }));
  }

  /**
   * Detect price increases
   */
  private async detectPriceIncreases(subscriptions: any[]): Promise<any[]> {
    // This would compare current prices with historical prices
    return [];
  }

  /**
   * Find cheaper alternatives
   */
  private async findCheaperAlternatives(subscriptions: any[]): Promise<any[]> {
    // This would integrate with a service alternatives API
    return [];
  }

  /**
   * Detect seasonal patterns
   */
  private detectSeasonalPatterns(monthlyData: MonthlySpending[]): { month: string; average: number } | null {
    if (monthlyData.length < 12) return null;
    
    const monthTotals: Record<string, number[]> = {};
    
    monthlyData.forEach(data => {
      const month = format(data.month, 'MMMM');
      if (!monthTotals[month]) {
        monthTotals[month] = [];
      }
      monthTotals[month].push(data.total);
    });
    
    let peakMonth = '';
    let peakAverage = 0;
    
    Object.entries(monthTotals).forEach(([month, totals]) => {
      const average = totals.reduce((a, b) => a + b, 0) / totals.length;
      if (average > peakAverage) {
        peakAverage = average;
        peakMonth = month;
      }
    });
    
    return { month: peakMonth, average: peakAverage };
  }

  /**
   * Calculate months active for a subscription
   */
  private calculateMonthsActive(subscription: any): number {
    const start = subscription.createdAt ? new Date(subscription.createdAt) : new Date();
    const now = new Date();
    
    let months = (now.getFullYear() - start.getFullYear()) * 12;
    months += now.getMonth() - start.getMonth();
    
    return Math.max(1, months);
  }

  /**
   * Calculate value score for a subscription
   */
  private async calculateValueScore(subscription: any, paymentHistory: any[]): Promise<number> {
    // Value score based on:
    // - Cost relative to average
    // - Usage frequency
    // - Payment history
    // - User reviews (if available)
    
    let score = 50; // Base score
    
    // Adjust for cost
    const averageCost = 10; // This would come from marketplace data
    if (subscription.amount < averageCost) {
      score += 10;
    } else if (subscription.amount > averageCost * 1.5) {
      score -= 10;
    }
    
    // Adjust for payment history (consistent payments are good)
    if (paymentHistory.length > 0) {
      const failedPayments = paymentHistory.filter(p => p.status === 'failed').length;
      score -= failedPayments * 5;
    }
    
    // Adjust for usage (if available)
    if (subscription.usageCount) {
      const usageScore = Math.min(subscription.usageCount * 2, 20);
      score += usageScore;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // ================ DEPENDENCY INJECTION ================

  /**
   * Get subscriptions (to be implemented by calling service)
   */
  private async getSubscriptions(): Promise<any[]> {
    // This would be implemented by the subscription service
    return [];
  }

  /**
   * Get a single subscription
   */
  private async getSubscription(id: string): Promise<any> {
    // This would be implemented by the subscription service
    return null;
  }

  /**
   * Get payment history for a subscription
   */
  private async getPaymentHistory(subscriptionId: string): Promise<PaymentRecord[]> {
    // This would be implemented by the subscription service
    return [];
  }

  /**
   * Get user budgets
   */
  private async getUserBudgets(): Promise<any[]> {
    // This would be implemented by the budget service
    return [];
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();
export default analyticsService;