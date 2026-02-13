import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth, subMonths } from 'date-fns';
import Category from '../models/Category';
import Payment from '../models/Payment';
import Subscription from '../models/Subscription';

export interface SpendingSummary {
  totalMonthly: number;
  totalYearly: number;
  averagePerSubscription: number;
  mostExpensiveSubscription: Subscription | null;
  cheapestSubscription: Subscription | null;
  activeSubscriptionsCount: number;
  pausedSubscriptionsCount: number;
  cancelledSubscriptionsCount: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalSpent: number;
  percentage: number;
  subscriptionCount: number;
}

export interface MonthlySpending {
  month: string;
  monthDate: Date;
  total: number;
  categories: Record<string, number>;
}

export interface SpendingInsight {
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  description: string;
  action?: string;
  value?: number;
}

class SpendingAnalytics {
  /**
   * Calculate total spending from subscriptions
   */
  calculateTotalSpending(subscriptions: Subscription[]): {
    monthly: number;
    yearly: number;
  } {
    const monthly = subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => {
        switch (sub.billingCycle) {
          case 'daily':
            return total + (sub.amount * 30);
          case 'weekly':
            return total + (sub.amount * 4.33);
          case 'monthly':
            return total + sub.amount;
          case 'yearly':
          case 'annually':
            return total + (sub.amount / 12);
          case 'quarterly':
            return total + (sub.amount / 3);
          default:
            return total + sub.amount;
        }
      }, 0);

    return {
      monthly: Number(monthly.toFixed(2)),
      yearly: Number((monthly * 12).toFixed(2)),
    };
  }

  /**
   * Get spending summary for dashboard
   */
  getSpendingSummary(subscriptions: Subscription[]): SpendingSummary {
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const pausedSubs = subscriptions.filter(s => s.status === 'paused');
    const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled');
    
    const { monthly, yearly } = this.calculateTotalSpending(subscriptions);
    
    const prices = activeSubs.map(s => s.price);
    const mostExpensive = activeSubs.length > 0 
      ? activeSubs.reduce((max, sub) => sub.price > max.price ? sub : max, activeSubs[0])
      : null;
    const cheapest = activeSubs.length > 0
      ? activeSubs.reduce((min, sub) => sub.price < min.price ? sub : min, activeSubs[0])
      : null;

    return {
      totalMonthly: monthly,
      totalYearly: yearly,
      averagePerSubscription: activeSubs.length > 0 ? Number((monthly / activeSubs.length).toFixed(2)) : 0,
      mostExpensiveSubscription: mostExpensive,
      cheapestSubscription: cheapest,
      activeSubscriptionsCount: activeSubs.length,
      pausedSubscriptionsCount: pausedSubs.length,
      cancelledSubscriptionsCount: cancelledSubs.length,
    };
  }

  /**
   * Analyze spending by category
   */
  getCategoryBreakdown(
    subscriptions: Subscription[], 
    categories: Category[]
  ): CategorySpending[] {
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const { monthly } = this.calculateTotalSpending(activeSubs);
    
    const categoryMap = new Map<string, { total: number; count: number }>();
    
    // Initialize all categories with zero
    categories.forEach(cat => {
      categoryMap.set(cat.id, { total: 0, count: 0 });
    });

    // Calculate spending per category
    activeSubs.forEach(sub => {
      const categoryTotal = this.calculateSubscriptionMonthlyCost(sub);
      const current = categoryMap.get(sub.category) || { total: 0, count: 0 };
      categoryMap.set(sub.category, {
        total: current.total + categoryTotal,
        count: current.count + 1,
      });
    });

    // Convert to array and calculate percentages
    const breakdown: CategorySpending[] = [];
    categoryMap.forEach((value, categoryId) => {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        breakdown.push({
          categoryId,
          categoryName: category.name,
          categoryColor: category.color,
          totalSpent: Number(value.total.toFixed(2)),
          percentage: monthly > 0 ? Number(((value.total / monthly) * 100).toFixed(1)) : 0,
          subscriptionCount: value.count,
        });
      }
    });

    // Sort by total spent (descending)
    return breakdown.sort((a, b) => b.totalSpent - a.totalSpent);
  }

  /**
   * Get monthly spending trend for last N months
   */
  getMonthlyTrend(
    subscriptions: Subscription[],
    payments: Payment[],
    months: number = 6
  ): MonthlySpending[] {
    const trend: MonthlySpending[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      // Calculate from actual payments if available
      const monthPayments = payments.filter(p => {
        const paymentDate = parseISO(p.date);
        return isWithinInterval(paymentDate, { start: monthStart, end: monthEnd });
      });

      const totalFromPayments = monthPayments.reduce((sum, p) => sum + p.amount, 0);

      // Fallback to subscription calculations if no payments
      const totalFromSubs = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
          const cost = this.calculateSubscriptionMonthlyCost(s);
          // Only include if subscription was active during this month
          const startDate = s.firstBillingDate ? parseISO(s.firstBillingDate) : parseISO(s.createdAt);
          if (startDate <= monthEnd) {
            return sum + cost;
          }
          return sum;
        }, 0);

      trend.push({
        month: format(monthDate, 'MMM yyyy'),
        monthDate,
        total: totalFromPayments > 0 ? totalFromPayments : totalFromSubs,
        categories: {}, // Will be populated by category breakdown
      });
    }

    return trend;
  }

  /**
   * Find unused or forgotten subscriptions
   */
  findUnusedSubscriptions(
    subscriptions: Subscription[],
    payments: Payment[],
    monthsThreshold: number = 3
  ): Subscription[] {
    const threeMonthsAgo = subMonths(new Date(), monthsThreshold);
    
    return subscriptions.filter(sub => {
      if (sub.status !== 'active') return false;
      
      // Check if there are recent payments
      const recentPayments = payments.filter(p => 
        p.subscriptionId === sub.id && 
        parseISO(p.date) >= threeMonthsAgo
      );
      
      return recentPayments.length === 0;
    });
  }

  /**
   * Detect duplicate subscriptions
   */
  findDuplicateSubscriptions(subscriptions: Subscription[]): Array<{
    name: string;
    duplicates: Subscription[];
    potentialSavings: number;
  }> {
    const nameMap = new Map<string, Subscription[]>();
    
    // Group by normalized name
    subscriptions.forEach(sub => {
      if (sub.status === 'cancelled') return;
      
      const normalizedName = sub.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const existing = nameMap.get(normalizedName) || [];
      nameMap.set(normalizedName, [...existing, sub]);
    });

    const duplicates: Array<{
      name: string;
      duplicates: Subscription[];
      potentialSavings: number;
    }> = [];

    nameMap.forEach((subs, name) => {
      if (subs.length > 1) {
        // Calculate potential savings (keep cheapest, cancel others)
        const sortedByPrice = [...subs].sort((a, b) => a.amount - b.amount);
        const cheapest = sortedByPrice[0];
        const others = sortedByPrice.slice(1);
        
        const potentialSavings = others.reduce((sum, sub) => {
          return sum + this.calculateSubscriptionMonthlyCost(sub);
        }, 0);

        duplicates.push({
          name: subs[0].name.split(' ')[0], // Use base name
          duplicates: subs,
          potentialSavings: Number(potentialSavings.toFixed(2)),
        });
      }
    });

    return duplicates;
  }

  /**
   * Generate smart insights based on spending patterns
   */
  generateInsights(
    subscriptions: Subscription[],
    payments: Payment[],
    categories: Category[]
  ): SpendingInsight[] {
    const insights: SpendingInsight[] = [];
    const summary = this.getSpendingSummary(subscriptions);
    const duplicates = this.findDuplicateSubscriptions(subscriptions);
    const unused = this.findUnusedSubscriptions(subscriptions, payments);
    const categoryBreakdown = this.getCategoryBreakdown(subscriptions, categories);

    // Insight 1: High spending
    if (summary.totalMonthly > 100) {
      insights.push({
        type: 'warning',
        title: 'Monthly spending is high',
        description: `You're spending $${summary.totalMonthly}/month on subscriptions.`,
        action: 'Review your subscriptions to find savings',
        value: summary.totalMonthly,
      });
    }

    // Insight 2: Duplicate subscriptions
    if (duplicates.length > 0) {
      const totalSavings = duplicates.reduce((sum, d) => sum + d.potentialSavings, 0);
      insights.push({
        type: 'tip',
        title: 'Duplicate subscriptions detected',
        description: `You could save $${totalSavings}/month by removing duplicates.`,
        action: 'Review duplicates',
        value: totalSavings,
      });
    }

    // Insight 3: Unused subscriptions
    if (unused.length > 0) {
      const unusedCost = unused.reduce((sum, sub) => 
        sum + this.calculateSubscriptionMonthlyCost(sub), 0
      );
      insights.push({
        type: 'warning',
        title: `${unused.length} unused subscription${unused.length > 1 ? 's' : ''}`,
        description: `You haven't used these in 3+ months. Save $${unusedCost.toFixed(2)}/month.`,
        action: 'Review unused',
        value: unusedCost,
      });
    }

    // Insight 4: Most expensive category
    if (categoryBreakdown.length > 0) {
      const topCategory = categoryBreakdown[0];
      if (topCategory.percentage > 50) {
        insights.push({
          type: 'info',
          title: `${topCategory.categoryName} dominates spending`,
          description: `${topCategory.percentage}% of your budget goes to ${topCategory.categoryName}.`,
          action: 'Set category budget',
          value: topCategory.percentage,
        });
      }
    }

    // Insight 5: Savings opportunity
    const potentialSavings = summary.totalMonthly * 0.2; // Suggest 20% savings
    insights.push({
      type: 'success',
      title: 'Potential savings identified',
      description: `You could save up to $${potentialSavings.toFixed(2)}/month by optimizing.`,
      action: 'View recommendations',
      value: potentialSavings,
    });

    // Insight 6: Good job
    if (summary.pausedSubscriptionsCount > 0) {
      const pausedSavings = subscriptions
        .filter(s => s.status === 'paused')
        .reduce((sum, s) => sum + this.calculateSubscriptionMonthlyCost(s), 0);
      
      insights.push({
        type: 'success',
        title: 'Great job pausing subscriptions',
        description: `You're saving $${pausedSavings.toFixed(2)}/month from paused services.`,
        value: pausedSavings,
      });
    }

    return insights;
  }

  /**
   * Calculate monthly cost of a subscription based on billing cycle
   */
  private calculateSubscriptionMonthlyCost(subscription: Subscription): number {
    switch (subscription.billingCycle) {
      case 'daily':
        return subscription.amount * 30;
      case 'weekly':
        return subscription.amount * 4.33;
      case 'monthly':
        return subscription.amount;
      case 'yearly':
      case 'annually':
        return subscription.amount / 12;
      case 'quarterly':
        return subscription.amount / 3;
      case 'semiannually':
        return subscription.amount / 6;
      default:
        return subscription.amount;
    }
  }
}

export default new SpendingAnalytics();