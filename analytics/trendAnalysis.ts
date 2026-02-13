import { Subscription, Payment } from '@models';
import { 
  subMonths, 
  differenceInMonths, 
  format, 
  parseISO,
  startOfMonth,
  endOfMonth 
} from 'date-fns';

export interface TrendData {
  direction: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
  absoluteChange: number;
  forecast: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface SeasonalPattern {
  month: number;
  averageSpending: number;
  isPeak: boolean;
  isLow: boolean;
}

export interface SpendingPrediction {
  nextMonth: number;
  nextQuarter: number;
  nextYear: number;
  recommendations: string[];
}

class TrendAnalysis {
  /**
   * Analyze spending trend over time
   */
  analyzeSpendingTrend(
    subscriptions: Subscription[],
    payments: Payment[],
    months: number = 6
  ): TrendData {
    const monthlyTotals = this.getMonthlyTotals(subscriptions, payments, months);
    
    if (monthlyTotals.length < 2) {
      return {
        direction: 'stable',
        percentage: 0,
        absoluteChange: 0,
        forecast: monthlyTotals[0]?.total || 0,
        confidence: 'low',
      };
    }

    // Calculate linear regression
    const indices = monthlyTotals.map((_, i) => i);
    const totals = monthlyTotals.map(m => m.total);
    
    const slope = this.calculateSlope(indices, totals);
    const average = totals.reduce((a, b) => a + b, 0) / totals.length;
    const percentageChange = average > 0 ? (slope * months / average) * 100 : 0;
    
    // Determine direction
    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(percentageChange) < 5) {
      direction = 'stable';
    } else if (percentageChange > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    // Calculate forecast (next month)
    const lastIndex = monthlyTotals.length;
    const forecast = average + (slope * (lastIndex + 1));

    // Determine confidence based on data consistency
    const variance = this.calculateVariance(totals);
    const confidence = variance < average * 0.1 ? 'high' : variance < average * 0.2 ? 'medium' : 'low';

    return {
      direction,
      percentage: Math.abs(Number(percentageChange.toFixed(1))),
      absoluteChange: Number((monthlyTotals[monthlyTotals.length - 1].total - monthlyTotals[0].total).toFixed(2)),
      forecast: Number(forecast.toFixed(2)),
      confidence,
    };
  }

  /**
   * Detect seasonal patterns in spending
   */
  detectSeasonalPatterns(
    subscriptions: Subscription[],
    payments: Payment[],
    years: number = 2
  ): SeasonalPattern[] {
    const monthlyAverages: Record<number, number[]> = {};
    
    // Initialize arrays for each month
    for (let i = 0; i < 12; i++) {
      monthlyAverages[i] = [];
    }

    // Group payments by month
    payments.forEach(payment => {
      const date = parseISO(payment.date);
      const month = date.getMonth();
      monthlyAverages[month].push(payment.amount);
    });

    // Calculate average for each month
    const patterns: SeasonalPattern[] = [];
    let maxAverage = 0;
    let minAverage = Infinity;

    for (let month = 0; month < 12; month++) {
      const amounts = monthlyAverages[month];
      const average = amounts.length > 0 
        ? amounts.reduce((a, b) => a + b, 0) / amounts.length 
        : 0;
      
      patterns.push({
        month,
        averageSpending: Number(average.toFixed(2)),
        isPeak: false,
        isLow: false,
      });

      if (average > maxAverage) maxAverage = average;
      if (average < minAverage && average > 0) minAverage = average;
    }

    // Mark peaks and lows
    return patterns.map(pattern => ({
      ...pattern,
      isPeak: pattern.averageSpending === maxAverage,
      isLow: pattern.averageSpending === minAverage,
    }));
  }

  /**
   * Predict future spending
   */
  predictSpending(
    subscriptions: Subscription[],
    payments: Payment[],
    trend: TrendData
  ): SpendingPrediction {
    const currentTotal = this.calculateCurrentMonthlyTotal(subscriptions);
    
    // Simple prediction based on trend
    const monthlyGrowth = trend.percentage / 100;
    
    const nextMonth = currentTotal * (1 + monthlyGrowth);
    const nextQuarter = this.calculateQuarterlyPrediction(subscriptions, payments, currentTotal);
    const nextYear = currentTotal * 12 * (1 + monthlyGrowth * 12);

    // Generate recommendations
    const recommendations: string[] = [];

    if (trend.direction === 'increasing' && trend.percentage > 10) {
      recommendations.push('Your spending is growing fast. Consider reviewing new subscriptions.');
    }

    if (nextMonth > currentTotal * 1.2) {
      recommendations.push('Set a budget alert for next month - spending might spike.');
    }

    if (this.hasSeasonalSpike(payments)) {
      recommendations.push('Prepare for seasonal spending increase next quarter.');
    }

    // Add saving recommendations
    if (currentTotal > 100) {
      const potentialSavings = currentTotal * 0.15;
      recommendations.push(`Try to save $${potentialSavings.toFixed(2)}/month by optimizing subscriptions.`);
    }

    return {
      nextMonth: Number(nextMonth.toFixed(2)),
      nextQuarter: Number(nextQuarter.toFixed(2)),
      nextYear: Number(nextYear.toFixed(2)),
      recommendations,
    };
  }

  /**
   * Identify unusual charges
   */
  detectUnusualCharges(
    subscriptions: Subscription[],
    payments: Payment[],
    threshold: number = 2.5 // Standard deviations
  ): Array<{
    payment: Payment;
    subscription: Subscription | undefined;
    reason: string;
    deviation: number;
  }> {
    const unusualCharges: Array<{
      payment: Payment;
      subscription: Subscription | undefined;
      reason: string;
      deviation: number;
    }> = [];

    // Group payments by subscription
    const paymentsBySubscription = new Map<string, Payment[]>();
    payments.forEach(payment => {
      const existing = paymentsBySubscription.get(payment.subscriptionId) || [];
      paymentsBySubscription.set(payment.subscriptionId, [...existing, payment]);
    });

    // Analyze each subscription's payments
    paymentsBySubscription.forEach((subPayments, subId) => {
      if (subPayments.length < 3) return; // Need at least 3 payments for analysis

      const amounts = subPayments.map(p => p.amount);
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = this.calculateStandardDeviation(amounts, mean);
      const subscription = subscriptions.find(s => s.id === subId);

      subPayments.forEach(payment => {
        const deviation = Math.abs(payment.amount - mean) / stdDev;
        
        if (deviation > threshold) {
          unusualCharges.push({
            payment,
            subscription,
            reason: payment.amount > mean 
              ? 'Amount higher than usual' 
              : 'Amount lower than usual',
            deviation: Number(deviation.toFixed(2)),
          });
        }
      });
    });

    // Also check for unexpected new subscriptions
    const lastMonth = subMonths(new Date(), 1);
    const recentSubscriptions = subscriptions.filter(s => 
      parseISO(s.startDate) >= lastMonth && s.status === 'active'
    );

    recentSubscriptions.forEach(sub => {
      unusualCharges.push({
        payment: {
          id: 'new',
          subscriptionId: sub.id,
          amount: sub.price,
          date: sub.startDate,
          status: 'pending',
        },
        subscription: sub,
        reason: 'New subscription added recently',
        deviation: 0,
      });
    });

    return unusualCharges;
  }

  /**
   * Calculate value score for each subscription
   */
  calculateValueScores(
    subscriptions: Subscription[],
    payments: Payment[],
    usageData?: Record<string, number>
  ): Array<{
    subscription: Subscription;
    score: number; // 0-100
    costPerUse: number;
    valueTier: 'excellent' | 'good' | 'average' | 'poor';
    recommendations: string[];
  }> {
    const scores: Array<{
      subscription: Subscription;
      score: number;
      costPerUse: number;
      valueTier: 'excellent' | 'good' | 'average' | 'poor';
      recommendations: string[];
    }> = [];

    subscriptions.forEach(sub => {
      if (sub.status !== 'active') return;

      const monthlyCost = this.calculateMonthlyCost(sub);
      const usage = usageData?.[sub.id] || 0;
      
      // Calculate cost per use
      const costPerUse = usage > 0 ? monthlyCost / usage : monthlyCost;

      // Calculate score based on multiple factors
      let score = 70; // Base score

      // Factor 1: Cost relative to average
      const allCosts = subscriptions.map(s => s.price);
      const avgCost = allCosts.reduce((a, b) => a + b, 0) / allCosts.length;
      if (sub.price < avgCost * 0.7) score += 15;
      else if (sub.price > avgCost * 1.3) score -= 15;

      // Factor 2: Usage frequency (if available)
      if (usageData) {
        if (usage > 20) score += 10;
        else if (usage < 5) score -= 20;
      }

      // Factor 3: Billing cycle (monthly is better than yearly for flexibility)
      if (sub.billingCycle.unit === 'monthly') score += 5;
      else if (sub.billingCycle.unit === 'yearly') score -= 5;

      // Factor 4: Cancellation ease (could be from metadata)
      // This would come from your subscription data model

      // Normalize score to 0-100
      score = Math.max(0, Math.min(100, score));

      // Determine tier
      let valueTier: 'excellent' | 'good' | 'average' | 'poor';
      if (score >= 80) valueTier = 'excellent';
      else if (score >= 60) valueTier = 'good';
      else if (score >= 40) valueTier = 'average';
      else valueTier = 'poor';

      // Generate recommendations
      const recommendations: string[] = [];
      if (score < 40) {
        recommendations.push('Consider cancelling - poor value for money');
      } else if (score < 60) {
        recommendations.push('Look for better alternatives');
      }
      
      if (usageData && usage < 3) {
        recommendations.push('Usage is very low - pause if possible');
      }

      if (costPerUse > monthlyCost * 0.5) {
        recommendations.push('Cost per use is high - try to use more');
      }

      scores.push({
        subscription: sub,
        score: Math.round(score),
        costPerUse: Number(costPerUse.toFixed(2)),
        valueTier,
        recommendations,
      });
    });

    // Sort by score (descending)
    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Get monthly totals for trend analysis
   */
  private getMonthlyTotals(
    subscriptions: Subscription[],
    payments: Payment[],
    months: number
  ): Array<{ month: string; total: number }> {
    const totals: Array<{ month: string; total: number }> = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthPayments = payments.filter(p => {
        const paymentDate = parseISO(p.date);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });

      const total = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      
      totals.push({
        month: format(monthDate, 'MMM yyyy'),
        total: Number(total.toFixed(2)),
      });
    }

    return totals;
  }

  /**
   * Calculate slope for linear regression
   */
  private calculateSlope(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[], mean: number): number {
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate quarterly prediction
   */
  private calculateQuarterlyPrediction(
    subscriptions: Subscription[],
    payments: Payment[],
    currentMonthly: number
  ): number {
    // Check for seasonal patterns in next 3 months
    const patterns = this.detectSeasonalPatterns(subscriptions, payments);
    const nextMonth = new Date().getMonth();
    
    let total = 0;
    for (let i = 0; i < 3; i++) {
      const monthIndex = (nextMonth + i) % 12;
      const pattern = patterns.find(p => p.month === monthIndex);
      
      if (pattern && pattern.averageSpending > 0) {
        total += pattern.averageSpending;
      } else {
        total += currentMonthly;
      }
    }

    return total;
  }

  /**
   * Check if there's a seasonal spike
   */
  private hasSeasonalSpike(payments: Payment[]): boolean {
    const patterns = this.detectSeasonalPatterns([], payments);
    const currentMonth = new Date().getMonth();
    const nextMonth = (currentMonth + 1) % 12;
    
    const currentPattern = patterns.find(p => p.month === currentMonth);
    const nextPattern = patterns.find(p => p.month === nextMonth);

    if (currentPattern && nextPattern) {
      return nextPattern.averageSpending > currentPattern.averageSpending * 1.3;
    }
    
    return false;
  }

  /**
   * Calculate monthly cost of a subscription
   */
  private calculateMonthlyCost(subscription: Subscription): number {
    switch (subscription.billingCycle.unit) {
      case 'daily':
        return subscription.price * subscription.billingCycle.interval * 30;
      case 'weekly':
        return subscription.price * (30 / 7) * subscription.billingCycle.interval;
      case 'monthly':
        return subscription.price * subscription.billingCycle.interval;
      case 'yearly':
        return subscription.price / 12 * subscription.billingCycle.interval;
      default:
        return subscription.price;
    }
  }

  /**
   * Calculate current monthly total
   */
  private calculateCurrentMonthlyTotal(subscriptions: Subscription[]): number {
    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((total, s) => total + this.calculateMonthlyCost(s), 0);
  }
}

export default new TrendAnalysis();