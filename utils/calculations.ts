/**
 * Calculation Utilities for SubTrack
 * Mathematical and financial calculations for subscriptions and budgets
 */

import currencyHelper from './currencyHelpers';
import dateHelpers from './dateHelpers';

/**
 * Financial calculations
 */
export class FinancialCalculations {
  /**
   * Calculate monthly recurring revenue (MRR)
   */
  static calculateMRR(subscriptions) {
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return 0;
    }
    
    return subscriptions.reduce((total, sub) => {
      if (sub.status !== 'active' && sub.status !== 'trial') {
        return total;
      }
      
      const monthlyAmount = currencyHelper.calculateMonthlyAmount(
        sub.totalAmount || sub.amount || 0,
        sub.billingCycle,
        sub.customDays
      );
      
      return total + monthlyAmount;
    }, 0);
  }

  /**
   * Calculate annual recurring revenue (ARR)
   */
  static calculateARR(subscriptions) {
    const mrr = this.calculateMRR(subscriptions);
    return mrr * 12;
  }

  /**
   * Calculate average revenue per user (ARPU)
   */
  static calculateARPU(subscriptions, activeUserCount = 1) {
    if (activeUserCount <= 0) return 0;
    
    const mrr = this.calculateMRR(subscriptions);
    return mrr / activeUserCount;
  }

  /**
   * Calculate customer lifetime value (LTV)
   */
  static calculateLTV(subscriptions, churnRate = 0.05, margin = 0.2) {
    const arpu = this.calculateARPU(subscriptions);
    
    if (churnRate <= 0) return 0;
    
    const ltv = (arpu * margin) / churnRate;
    return ltv;
  }

  /**
   * Calculate net promoter score (NPS) from ratings
   */
  static calculateNPS(ratings) {
    if (!Array.isArray(ratings) || ratings.length === 0) {
      return 0;
    }
    
    const promoters = ratings.filter(r => r >= 9).length;
    const detractors = ratings.filter(r => r <= 6).length;
    const total = ratings.length;
    
    if (total === 0) return 0;
    
    const nps = ((promoters - detractors) / total) * 100;
    return Math.round(nps);
  }

  /**
   * Calculate compound annual growth rate (CAGR)
   */
  static calculateCAGR(startValue, endValue, years) {
    if (startValue <= 0 || years <= 0) return 0;
    
    const cagr = Math.pow((endValue / startValue), (1 / years)) - 1;
    return cagr * 100; // Return as percentage
  }

  /**
   * Calculate return on investment (ROI)
   */
  static calculateROI(gain, cost) {
    if (cost === 0) return 0;
    
    const roi = ((gain - cost) / cost) * 100;
    return roi;
  }

  /**
   * Calculate net present value (NPV)
   */
  static calculateNPV(cashFlows, discountRate = 0.1) {
    if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
      return 0;
    }
    
    let npv = 0;
    
    cashFlows.forEach((cashFlow, index) => {
      const period = index + 1;
      const discountedValue = cashFlow / Math.pow(1 + discountRate, period);
      npv += discountedValue;
    });
    
    return npv;
  }

  /**
   * Calculate internal rate of return (IRR) approximation
   */
  static calculateIRR(cashFlows, guess = 0.1) {
    if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
      return 0;
    }
    
    // Simple IRR approximation using Newton-Raphson method
    const tolerance = 0.00001;
    const maxIterations = 100;
    
    let rate = guess;
    
    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dNpv = 0;
      
      cashFlows.forEach((cashFlow, index) => {
        const period = index + 1;
        const denominator = Math.pow(1 + rate, period);
        
        npv += cashFlow / denominator;
        dNpv -= (period * cashFlow) / Math.pow(1 + rate, period + 1);
      });
      
      const newRate = rate - npv / dNpv;
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate * 100; // Return as percentage
      }
      
      rate = newRate;
    }
    
    return rate * 100; // Return as percentage
  }
}

/**
 * Subscription calculations
 */
export class SubscriptionCalculations {
  /**
   * Calculate total spending by period
   */
  static calculateSpendingByPeriod(subscriptions, period = 'monthly', targetCurrency = 'USD') {
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return 0;
    }
    
    return subscriptions.reduce((total, sub) => {
      if (sub.status !== 'active' && sub.status !== 'trial') {
        return total;
      }
      
      let amount = sub.totalAmount || sub.amount || 0;
      
      // Convert currency if needed
      if (sub.currency !== targetCurrency) {
        amount = currencyHelper.convert(amount, sub.currency, targetCurrency);
      }
      
      switch (period) {
        case 'daily':
          return total + this.calculateDailyAmount(amount, sub.billingCycle, sub.customDays);
        case 'weekly':
          return total + this.calculateWeeklyAmount(amount, sub.billingCycle, sub.customDays);
        case 'monthly':
          return total + this.calculateMonthlyAmount(amount, sub.billingCycle, sub.customDays);
        case 'yearly':
          return total + this.calculateYearlyAmount(amount, sub.billingCycle, sub.customDays);
        default:
          return total + this.calculateMonthlyAmount(amount, sub.billingCycle, sub.customDays);
      }
    }, 0);
  }

  /**
   * Calculate daily amount
   */
  static calculateDailyAmount(amount, billingCycle, customDays = 30) {
    switch (billingCycle) {
      case 'daily':
        return amount;
      case 'weekly':
        return amount / 7;
      case 'biweekly':
        return amount / 14;
      case 'monthly':
        return amount / 30.44; // Average days in month
      case 'bimonthly':
        return amount / 60.88;
      case 'quarterly':
        return amount / 91.31;
      case 'semiannually':
        return amount / 182.62;
      case 'annually':
        return amount / 365;
      case 'custom':
        return amount / customDays;
      default:
        return amount / 30.44;
    }
  }

  /**
   * Calculate weekly amount
   */
  static calculateWeeklyAmount(amount, billingCycle, customDays = 30) {
    switch (billingCycle) {
      case 'daily':
        return amount * 7;
      case 'weekly':
        return amount;
      case 'biweekly':
        return amount / 2;
      case 'monthly':
        return amount * (12 / 52); // Approximate weeks per month
      case 'bimonthly':
        return amount * (6 / 52);
      case 'quarterly':
        return amount * (4 / 52);
      case 'semiannually':
        return amount * (2 / 52);
      case 'annually':
        return amount / 52;
      case 'custom':
        return (amount / customDays) * 7;
      default:
        return amount * (12 / 52);
    }
  }

  /**
   * Calculate monthly amount
   */
  static calculateMonthlyAmount(amount, billingCycle, customDays = 30) {
    return currencyHelper.calculateMonthlyAmount(amount, billingCycle, customDays);
  }

  /**
   * Calculate yearly amount
   */
  static calculateYearlyAmount(amount, billingCycle, customDays = 30) {
    return currencyHelper.calculateYearlyAmount(amount, billingCycle, customDays);
  }

  /**
   * Calculate savings from cancellations
   */
  static calculateSavingsFromCancellations(cancelledSubscriptions, period = 'yearly') {
    if (!Array.isArray(cancelledSubscriptions) || cancelledSubscriptions.length === 0) {
      return 0;
    }
    
    return cancelledSubscriptions.reduce((total, sub) => {
      const amount = sub.totalAmount || sub.amount || 0;
      
      switch (period) {
        case 'daily':
          return total + this.calculateDailyAmount(amount, sub.billingCycle, sub.customDays);
        case 'weekly':
          return total + this.calculateWeeklyAmount(amount, sub.billingCycle, sub.customDays);
        case 'monthly':
          return total + this.calculateMonthlyAmount(amount, sub.billingCycle, sub.customDays);
        case 'yearly':
          return total + this.calculateYearlyAmount(amount, sub.billingCycle, sub.customDays);
        default:
          return total + this.calculateYearlyAmount(amount, sub.billingCycle, sub.customDays);
      }
    }, 0);
  }

  /**
   * Calculate potential savings (unused subscriptions)
   */
  static calculatePotentialSavings(subscriptions, daysThreshold = 30) {
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return 0;
    }
    
    const now = new Date();
    
    return subscriptions.reduce((total, sub) => {
      if (sub.status !== 'active' && sub.status !== 'trial') {
        return total;
      }
      
      // Check if subscription hasn't been used recently
      if (sub.lastUsed) {
        const lastUsed = new Date(sub.lastUsed);
        const daysSinceUse = dateHelpers.daysBetween(lastUsed, now);
        
        if (daysSinceUse > daysThreshold) {
          const monthlyAmount = this.calculateMonthlyAmount(
            sub.totalAmount || sub.amount || 0,
            sub.billingCycle,
            sub.customDays
          );
          
          return total + monthlyAmount;
        }
      }
      
      return total;
    }, 0);
  }

  /**
   * Calculate subscription score (0-100)
   */
  static calculateSubscriptionScore(subscription) {
    let score = 50; // Base score
    
    // Usage factor (0-25 points)
    if (subscription.usageCount > 0) {
      const usageScore = Math.min(subscription.usageCount * 2, 25);
      score += usageScore;
    }
    
    // Recency factor (0-15 points)
    if (subscription.lastUsed) {
      const daysSinceUse = dateHelpers.daysBetween(subscription.lastUsed, new Date());
      const recencyScore = Math.max(0, 15 - (daysSinceUse / 7));
      score += recencyScore;
    }
    
    // Cost efficiency factor (0-25 points)
    if (subscription.totalAmount > 0) {
      const efficiencyScore = Math.max(0, 25 - (subscription.totalAmount / 10));
      score += efficiencyScore;
    }
    
    // Rating factor (0-10 points)
    if (subscription.rating > 0) {
      const ratingScore = subscription.rating * 2;
      score += ratingScore;
    }
    
    // Adjust for status
    if (subscription.status === 'cancelled' || subscription.status === 'expired') {
      score *= 0.5;
    } else if (subscription.status === 'trial') {
      score *= 0.8;
    }
    
    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Calculate renewal probability (0-1)
   */
  static calculateRenewalProbability(subscription, paymentHistory = []) {
    let probability = 0.7; // Base probability
    
    // Payment history factor
    const successfulPayments = paymentHistory.filter(p => 
      p.status === 'completed' || p.status === 'paid'
    ).length;
    const totalPayments = paymentHistory.length;
    
    if (totalPayments > 0) {
      const paymentSuccessRate = successfulPayments / totalPayments;
      probability *= paymentSuccessRate;
    }
    
    // Usage factor
    if (subscription.usageCount > 0) {
      const usageFactor = Math.min(subscription.usageCount / 10, 1);
      probability *= (0.5 + (usageFactor * 0.5));
    }
    
    // Time factor (longer subscriptions more likely to renew)
    if (subscription.createdAt) {
      const subscriptionAge = dateHelpers.daysBetween(subscription.createdAt, new Date());
      const timeFactor = Math.min(subscriptionAge / 365, 1);
      probability *= (0.6 + (timeFactor * 0.4));
    }
    
    // Status factor
    if (subscription.status === 'active') {
      probability *= 1.2;
    } else if (subscription.status === 'cancelled') {
      probability *= 0.2;
    } else if (subscription.status === 'trial') {
      probability *= 0.8;
    }
    
    return Math.min(Math.max(probability, 0), 1);
  }

  /**
   * Calculate churn rate
   */
  static calculateChurnRate(subscriptions, periodDays = 30) {
    const activeSubscriptions = subscriptions.filter(s => 
      s.status === 'active' || s.status === 'trial'
    );
    
    const cancelledSubscriptions = subscriptions.filter(s => 
      s.status === 'cancelled' && 
      s.cancellationDate &&
      dateHelpers.daysBetween(s.cancellationDate, new Date()) <= periodDays
    );
    
    const totalActive = activeSubscriptions.length + cancelledSubscriptions.length;
    
    if (totalActive === 0) return 0;
    
    const churnRate = cancelledSubscriptions.length / totalActive;
    return churnRate * 100; // Return as percentage
  }
}

/**
 * Budget calculations
 */
export class BudgetCalculations {
  /**
   * Calculate budget utilization percentage
   */
  static calculateBudgetUtilization(currentSpending, budgetAmount) {
    if (budgetAmount <= 0) return 0;
    
    const utilization = (currentSpending / budgetAmount) * 100;
    return Math.min(utilization, 100); // Cap at 100%
  }

  /**
   * Calculate remaining budget
   */
  static calculateRemainingBudget(currentSpending, budgetAmount) {
    return Math.max(0, budgetAmount - currentSpending);
  }

  /**
   * Calculate daily budget allowance
   */
  static calculateDailyAllowance(budgetAmount, periodStart, periodEnd) {
    const daysInPeriod = dateHelpers.daysBetween(periodStart, periodEnd);
    
    if (daysInPeriod <= 0) return 0;
    
    return budgetAmount / daysInPeriod;
  }

  /**
   * Calculate projected spending
   */
  static calculateProjectedSpending(currentSpending, daysElapsed, totalDays) {
    if (daysElapsed <= 0) return 0;
    
    const dailyAverage = currentSpending / daysElapsed;
    return dailyAverage * totalDays;
  }

  /**
   * Calculate required daily spending to stay on budget
   */
  static calculateRequiredDailySpending(currentSpending, remainingBudget, daysRemaining) {
    if (daysRemaining <= 0) return 0;
    
    return remainingBudget / daysRemaining;
  }

  /**
   * Calculate overshoot amount
   */
  static calculateOvershootAmount(currentSpending, budgetAmount) {
    return Math.max(0, currentSpending - budgetAmount);
  }

  /**
   * Calculate savings from staying under budget
   */
  static calculateBudgetSavings(budgetAmount, actualSpending) {
    return Math.max(0, budgetAmount - actualSpending);
  }
}

/**
 * Statistical calculations
 */
export class StatisticalCalculations {
  /**
   * Calculate mean (average)
   */
  static calculateMean(values) {
    if (!Array.isArray(values) || values.length === 0) {
      return 0;
    }
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  /**
   * Calculate median
   */
  static calculateMedian(values) {
    if (!Array.isArray(values) || values.length === 0) {
      return 0;
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  }

  /**
   * Calculate mode
   */
  static calculateMode(values) {
    if (!Array.isArray(values) || values.length === 0) {
      return 0;
    }
    
    const frequency = {};
    let maxFreq = 0;
    let mode = values[0];
    
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
      
      if (frequency[value] > maxFreq) {
        maxFreq = frequency[value];
        mode = value;
      }
    });
    
    return mode;
  }

  /**
   * Calculate standard deviation
   */
  static calculateStandardDeviation(values) {
    if (!Array.isArray(values) || values.length < 2) {
      return 0;
    }
    
    const mean = this.calculateMean(values);
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const variance = this.calculateMean(squaredDifferences);
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate variance
   */
  static calculateVariance(values) {
    if (!Array.isArray(values) || values.length < 2) {
      return 0;
    }
    
    const mean = this.calculateMean(values);
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    
    return this.calculateMean(squaredDifferences);
  }

  /**
   * Calculate correlation coefficient
   */
  static calculateCorrelation(xValues, yValues) {
    if (!Array.isArray(xValues) || !Array.isArray(yValues) || 
        xValues.length !== yValues.length || xValues.length < 2) {
      return 0;
    }
    
    const n = xValues.length;
    const sumX = xValues.reduce((acc, val) => acc + val, 0);
    const sumY = yValues.reduce((acc, val) => acc + val, 0);
    const sumXY = xValues.reduce((acc, val, idx) => acc + val * yValues[idx], 0);
    const sumX2 = xValues.reduce((acc, val) => acc + Math.pow(val, 2), 0);
    const sumY2 = yValues.reduce((acc, val) => acc + Math.pow(val, 2), 0);
    
    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(
      (n * sumX2 - Math.pow(sumX, 2)) * (n * sumY2 - Math.pow(sumY, 2))
    );
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
  }

  /**
   * Calculate linear regression
   */
  static calculateLinearRegression(xValues, yValues) {
    if (!Array.isArray(xValues) || !Array.isArray(yValues) || 
        xValues.length !== yValues.length || xValues.length < 2) {
      return { slope: 0, intercept: 0, rSquared: 0 };
    }
    
    const n = xValues.length;
    const sumX = xValues.reduce((acc, val) => acc + val, 0);
    const sumY = yValues.reduce((acc, val) => acc + val, 0);
    const sumXY = xValues.reduce((acc, val, idx) => acc + val * yValues[idx], 0);
    const sumX2 = xValues.reduce((acc, val) => acc + Math.pow(val, 2), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - Math.pow(sumX, 2));
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const ssTotal = yValues.reduce((acc, val) => acc + Math.pow(val - yMean, 2), 0);
    const ssResidual = yValues.reduce((acc, val, idx) => {
      const predicted = slope * xValues[idx] + intercept;
      return acc + Math.pow(val - predicted, 2);
    }, 0);
    
    const rSquared = ssTotal === 0 ? 0 : 1 - (ssResidual / ssTotal);
    
    return { slope, intercept, rSquared };
  }

  /**
   * Calculate moving average
   */
  static calculateMovingAverage(values, windowSize) {
    if (!Array.isArray(values) || values.length === 0 || windowSize <= 0) {
      return [];
    }
    
    const result = [];
    
    for (let i = 0; i <= values.length - windowSize; i++) {
      const window = values.slice(i, i + windowSize);
      const average = this.calculateMean(window);
      result.push(average);
    }
    
    return result;
  }

  /**
   * Calculate exponential smoothing
   */
  static calculateExponentialSmoothing(values, alpha = 0.3) {
    if (!Array.isArray(values) || values.length === 0) {
      return [];
    }
    
    const smoothed = [values[0]];
    
    for (let i = 1; i < values.length; i++) {
      const smoothedValue = alpha * values[i] + (1 - alpha) * smoothed[i - 1];
      smoothed.push(smoothedValue);
    }
    
    return smoothed;
  }
}

/**
 * Time-based calculations
 */
export class TimeCalculations {
  /**
   * Calculate time-weighted return
   */
  static calculateTimeWeightedReturn(values, timePeriods) {
    if (!Array.isArray(values) || values.length < 2 || 
        !Array.isArray(timePeriods) || timePeriods.length !== values.length - 1) {
      return 0;
    }
    
    let product = 1;
    
    for (let i = 0; i < values.length - 1; i++) {
      const returnRate = (values[i + 1] - values[i]) / values[i];
      product *= (1 + returnRate);
    }
    
    return (product - 1) * 100; // Return as percentage
  }

  /**
   * Calculate compound growth
   */
  static calculateCompoundGrowth(initialValue, finalValue, periods) {
    if (initialValue <= 0 || periods <= 0) return 0;
    
    const growthRate = Math.pow(finalValue / initialValue, 1 / periods) - 1;
    return growthRate * 100; // Return as percentage
  }

  /**
   * Calculate future value
   */
  static calculateFutureValue(presentValue, rate, periods) {
    return presentValue * Math.pow(1 + rate, periods);
  }

  /**
   * Calculate present value
   */
  static calculatePresentValue(futureValue, rate, periods) {
    return futureValue / Math.pow(1 + rate, periods);
  }

  /**
   * Calculate annuity payment
   */
  static calculateAnnuityPayment(presentValue, rate, periods) {
    if (rate === 0) return presentValue / periods;
    
    const annuityFactor = (rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1);
    return presentValue * annuityFactor;
  }

  /**
   * Calculate time to double (Rule of 72)
   */
  static calculateTimeToDouble(rate) {
    if (rate <= 0) return Infinity;
    
    return 72 / rate;
  }
}

// Export all calculation classes
export default {
  // Financial calculations
  calculateMRR: FinancialCalculations.calculateMRR,
  calculateARR: FinancialCalculations.calculateARR,
  calculateARPU: FinancialCalculations.calculateARPU,
  calculateLTV: FinancialCalculations.calculateLTV,
  calculateNPS: FinancialCalculations.calculateNPS,
  calculateCAGR: FinancialCalculations.calculateCAGR,
  calculateROI: FinancialCalculations.calculateROI,
  calculateNPV: FinancialCalculations.calculateNPV,
  calculateIRR: FinancialCalculations.calculateIRR,
  
  // Subscription calculations
  calculateSpendingByPeriod: SubscriptionCalculations.calculateSpendingByPeriod,
  calculateDailyAmount: SubscriptionCalculations.calculateDailyAmount,
  calculateWeeklyAmount: SubscriptionCalculations.calculateWeeklyAmount,
  calculateMonthlyAmount: SubscriptionCalculations.calculateMonthlyAmount,
  calculateYearlyAmount: SubscriptionCalculations.calculateYearlyAmount,
  calculateSavingsFromCancellations: SubscriptionCalculations.calculateSavingsFromCancellations,
  calculatePotentialSavings: SubscriptionCalculations.calculatePotentialSavings,
  calculateSubscriptionScore: SubscriptionCalculations.calculateSubscriptionScore,
  calculateRenewalProbability: SubscriptionCalculations.calculateRenewalProbability,
  calculateChurnRate: SubscriptionCalculations.calculateChurnRate,
  
  // Budget calculations
  calculateBudgetUtilization: BudgetCalculations.calculateBudgetUtilization,
  calculateRemainingBudget: BudgetCalculations.calculateRemainingBudget,
  calculateDailyAllowance: BudgetCalculations.calculateDailyAllowance,
  calculateProjectedSpending: BudgetCalculations.calculateProjectedSpending,
  calculateRequiredDailySpending: BudgetCalculations.calculateRequiredDailySpending,
  calculateOvershootAmount: BudgetCalculations.calculateOvershootAmount,
  calculateBudgetSavings: BudgetCalculations.calculateBudgetSavings,
  
  // Statistical calculations
  calculateMean: StatisticalCalculations.calculateMean,
  calculateMedian: StatisticalCalculations.calculateMedian,
  calculateMode: StatisticalCalculations.calculateMode,
  calculateStandardDeviation: StatisticalCalculations.calculateStandardDeviation,
  calculateVariance: StatisticalCalculations.calculateVariance,
  calculateCorrelation: StatisticalCalculations.calculateCorrelation,
  calculateLinearRegression: StatisticalCalculations.calculateLinearRegression,
  calculateMovingAverage: StatisticalCalculations.calculateMovingAverage,
  calculateExponentialSmoothing: StatisticalCalculations.calculateExponentialSmoothing,
  
  // Time calculations
  calculateTimeWeightedReturn: TimeCalculations.calculateTimeWeightedReturn,
  calculateCompoundGrowth: TimeCalculations.calculateCompoundGrowth,
  calculateFutureValue: TimeCalculations.calculateFutureValue,
  calculatePresentValue: TimeCalculations.calculatePresentValue,
  calculateAnnuityPayment: TimeCalculations.calculateAnnuityPayment,
  calculateTimeToDouble: TimeCalculations.calculateTimeToDouble,
  
  // Classes for advanced usage
  Financial: FinancialCalculations,
  Subscription: SubscriptionCalculations,
  Budget: BudgetCalculations,
  Statistics: StatisticalCalculations,
  Time: TimeCalculations,
};