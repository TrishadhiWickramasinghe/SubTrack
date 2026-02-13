/**
 * Core calculation utilities for SubTrack
 * Complete with all mathematical operations needed for the app
 */

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PercentageDistribution {
  value: number;
  percentage: number;
  label: string;
}

export interface Statistics {
  mean: number;
  median: number;
  mode: number[];
  range: number;
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
  sum: number;
  count: number;
}

class Calculations {
  /**
   * Basic Arithmetic Operations
   */
  
  add(...numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0);
  }

  subtract(a: number, b: number): number {
    return a - b;
  }

  multiply(...numbers: number[]): number {
    return numbers.reduce((product, num) => product * num, 1);
  }

  divide(a: number, b: number): number {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }

  percentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Number(((value / total) * 100).toFixed(2));
  }

  /**
   * Financial Calculations
   */

  calculateMonthlyCost(
    price: number,
    interval: number = 1,
    unit: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): number {
    const monthlyMultipliers = {
      daily: 30,
      weekly: 30 / 7,
      monthly: 1,
      yearly: 1 / 12,
    };

    return Number((price * interval * monthlyMultipliers[unit]).toFixed(2));
  }

  calculateYearlyCost(
    price: number,
    interval: number = 1,
    unit: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): number {
    const monthly = this.calculateMonthlyCost(price, interval, unit);
    return Number((monthly * 12).toFixed(2));
  }

  calculateSavings(originalPrice: number, discountedPrice: number): number {
    return Number((originalPrice - discountedPrice).toFixed(2));
  }

  calculateSavingsPercentage(originalPrice: number, discountedPrice: number): number {
    if (originalPrice === 0) return 0;
    return Number((((originalPrice - discountedPrice) / originalPrice) * 100).toFixed(2));
  }

  calculateProRatedAmount(
    monthlyPrice: number,
    daysUsed: number,
    totalDaysInMonth: number = 30
  ): number {
    return Number(((monthlyPrice / totalDaysInMonth) * daysUsed).toFixed(2));
  }

  calculateTax(amount: number, taxRate: number): number {
    return Number((amount * (taxRate / 100)).toFixed(2));
  }

  calculateTotalWithTax(amount: number, taxRate: number): number {
    return Number((amount * (1 + taxRate / 100)).toFixed(2));
  }

  calculateDiscount(amount: number, discountRate: number): number {
    return Number((amount * (discountRate / 100)).toFixed(2));
  }

  calculateTotalWithDiscount(amount: number, discountRate: number): number {
    return Number((amount * (1 - discountRate / 100)).toFixed(2));
  }

  calculateCompoundInterest(
    principal: number,
    rate: number,
    time: number,
    compoundPerYear: number = 12
  ): number {
    return Number((principal * Math.pow(1 + rate / (compoundPerYear * 100), compoundPerYear * time)).toFixed(2));
  }

  calculateSimpleInterest(principal: number, rate: number, time: number): number {
    return Number((principal * (1 + (rate / 100) * time)).toFixed(2));
  }

  /**
   * Budget Calculations
   */

  calculateBudgetUsage(spent: number, budget: number): number {
    if (budget === 0) return 0;
    return Number(((spent / budget) * 100).toFixed(2));
  }

  calculateRemainingBudget(budget: number, spent: number): number {
    return Number((budget - spent).toFixed(2));
  }

  calculateDailyBudget(budget: number, daysInMonth: number = 30): number {
    return Number((budget / daysInMonth).toFixed(2));
  }

  calculateWeeklyBudget(budget: number): number {
    return Number((budget / 4.33).toFixed(2)); // 4.33 weeks per month average
  }

  calculateBudgetPerCategory(
    categories: Array<{ spent: number; budget: number }>
  ): PercentageDistribution[] {
    const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
    
    return categories.map(cat => ({
      value: cat.spent,
      percentage: totalBudget > 0 ? (cat.budget / totalBudget) * 100 : 0,
      label: `$${cat.spent} / $${cat.budget}`,
    }));
  }

  /**
   * Split Calculations
   */

  calculateEqualSplit(amount: number, peopleCount: number): number {
    if (peopleCount === 0) return 0;
    return Number((amount / peopleCount).toFixed(2));
  }

  calculatePercentageSplit(amount: number, percentages: number[]): number[] {
    const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
    if (totalPercentage !== 100) {
      throw new Error('Percentages must sum to 100');
    }
    
    return percentages.map(p => Number((amount * (p / 100)).toFixed(2)));
  }

  calculateCustomSplit(amount: number, shares: number[]): number[] {
    const totalShares = shares.reduce((sum, s) => sum + s, 0);
    return shares.map(s => Number((amount * (s / totalShares)).toFixed(2)));
  }

  calculateOutstandingBalance(payments: Array<{ amount: number; status: 'paid' | 'pending' }>): number {
    return payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  calculateSettlementAmount(
    totalAmount: number,
    paidBy: Array<{ personId: string; amount: number }>,
    owedBy: Array<{ personId: string; amount: number }>
  ): Array<{ from: string; to: string; amount: number }> {
    const settlements: Array<{ from: string; to: string; amount: number }> = [];
    
    // Simple algorithm for debt simplification
    const balance: Record<string, number> = {};
    
    paidBy.forEach(p => {
      balance[p.personId] = (balance[p.personId] || 0) - p.amount;
    });
    
    owedBy.forEach(o => {
      balance[o.personId] = (balance[o.personId] || 0) + o.amount;
    });

    const debtors = Object.entries(balance)
      .filter(([_, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);
    
    const creditors = Object.entries(balance)
      .filter(([_, amount]) => amount < 0)
      .sort((a, b) => a[1] - b[1]);

    while (debtors.length > 0 && creditors.length > 0) {
      const [debtorId, debtorAmount] = debtors[0];
      const [creditorId, creditorAmount] = creditors[0];
      
      const settlementAmount = Math.min(debtorAmount, -creditorAmount);
      
      settlements.push({
        from: debtorId,
        to: creditorId,
        amount: Number(settlementAmount.toFixed(2)),
      });

      debtors[0][1] -= settlementAmount;
      creditors[0][1] += settlementAmount;

      if (Math.abs(debtors[0][1]) < 0.01) debtors.shift();
      if (Math.abs(creditors[0][1]) < 0.01) creditors.shift();
    }

    return settlements;
  }

  /**
   * Statistical Calculations
   */

  calculateMean(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  calculateMedian(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  calculateMode(numbers: number[]): number[] {
    if (numbers.length === 0) return [];
    
    const frequency: Record<number, number> = {};
    numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
    });

    const maxFrequency = Math.max(...Object.values(frequency));
    
    return Object.entries(frequency)
      .filter(([_, freq]) => freq === maxFrequency)
      .map(([num]) => Number(num));
  }

  calculateRange(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);
    return max - min;
  }

  calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = this.calculateMean(numbers);
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  calculateStandardDeviation(numbers: number[]): number {
    return Math.sqrt(this.calculateVariance(numbers));
  }

  calculateStatistics(numbers: number[]): Statistics {
    return {
      mean: this.calculateMean(numbers),
      median: this.calculateMedian(numbers),
      mode: this.calculateMode(numbers),
      range: this.calculateRange(numbers),
      variance: this.calculateVariance(numbers),
      standardDeviation: this.calculateStandardDeviation(numbers),
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      sum: numbers.reduce((sum, num) => sum + num, 0),
      count: numbers.length,
    };
  }

  calculatePercentile(numbers: number[], percentile: number): number {
    if (numbers.length === 0) return 0;
    if (percentile < 0 || percentile > 100) {
      throw new Error('Percentile must be between 0 and 100');
    }

    const sorted = [...numbers].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (upper >= sorted.length) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) {
      throw new Error('Arrays must have same non-zero length');
    }

    const meanX = this.calculateMean(x);
    const meanY = this.calculateMean(y);

    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;

    for (let i = 0; i < x.length; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      
      numerator += diffX * diffY;
      denominatorX += diffX * diffX;
      denominatorY += diffY * diffY;
    }

    if (denominatorX === 0 || denominatorY === 0) return 0;
    
    return numerator / Math.sqrt(denominatorX * denominatorY);
  }

  /**
   * Date and Time Calculations
   */

  calculateDaysBetween(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateMonthsBetween(start: Date, end: Date): number {
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    return years * 12 + months;
  }

  calculateYearsBetween(start: Date, end: Date): number {
    return this.calculateMonthsBetween(start, end) / 12;
  }

  calculateNextBillingDate(
    startDate: Date,
    interval: number,
    unit: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): Date {
    const nextDate = new Date(startDate);
    
    switch (unit) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + interval * 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
    }
    
    return nextDate;
  }

  calculateRemainingDays(targetDate: Date): number {
    const today = new Date();
    return this.calculateDaysBetween(today, targetDate);
  }

  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Percentage and Ratio Calculations
   */

  calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return Number((((newValue - oldValue) / oldValue) * 100).toFixed(2));
  }

  calculateRatio(a: number, b: number): number {
    if (b === 0) return Infinity;
    return a / b;
  }

  calculateDistribution(values: number[]): PercentageDistribution[] {
    const total = values.reduce((sum, val) => sum + val, 0);
    
    return values.map((value, index) => ({
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      label: `${((value / total) * 100).toFixed(1)}%`,
    }));
  }

  calculateWeightedAverage(values: number[], weights: number[]): number {
    if (values.length !== weights.length) {
      throw new Error('Values and weights must have same length');
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = values.reduce((sum, val, i) => sum + val * weights[i], 0);
    return weightedSum / totalWeight;
  }

  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  calculateCompoundAnnualGrowthRate(
    startValue: number,
    endValue: number,
    years: number
  ): number {
    if (startValue === 0 || years === 0) return 0;
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  }

  /**
   * Currency and Exchange Calculations
   */

  convertCurrency(amount: number, rate: number): number {
    return Number((amount * rate).toFixed(2));
  }

  calculateAverageExchangeRate(rates: number[]): number {
    return this.calculateMean(rates);
  }

  calculateExchangeRateVolatility(rates: number[]): number {
    return this.calculateStandardDeviation(rates);
  }

  /**
   * Subscription-specific Calculations
   */

  calculateTotalSubscriptionsCost(subscriptions: Array<{ price: number }>): number {
    return subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  }

  calculateAverageSubscriptionCost(subscriptions: Array<{ price: number }>): number {
    if (subscriptions.length === 0) return 0;
    return this.calculateTotalSubscriptionsCost(subscriptions) / subscriptions.length;
  }

  calculateSubscriptionValueScore(
    price: number,
    usageFrequency: number,
    userRating?: number
  ): number {
    let score = 50; // Base score
    
    // Price factor (lower is better)
    if (price < 10) score += 20;
    else if (price < 20) score += 10;
    else if (price > 50) score -= 20;
    
    // Usage factor (higher is better)
    if (usageFrequency > 20) score += 20;
    else if (usageFrequency > 10) score += 10;
    else if (usageFrequency < 5) score -= 10;
    
    // User rating factor (if available)
    if (userRating) {
      score += (userRating - 3) * 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  calculateCostPerUse(price: number, usageCount: number): number {
    if (usageCount === 0) return Infinity;
    return price / usageCount;
  }

  calculatePaybackPeriod(initialCost: number, monthlySavings: number): number {
    if (monthlySavings <= 0) return Infinity;
    return initialCost / monthlySavings;
  }

  calculateROI(initialInvestment: number, returns: number): number {
    if (initialInvestment === 0) return 0;
    return ((returns - initialInvestment) / initialInvestment) * 100;
  }

  /**
   * Utility Calculations
   */

  roundToNearest(value: number, nearest: number): number {
    return Math.round(value / nearest) * nearest;
  }

  floorToNearest(value: number, nearest: number): number {
    return Math.floor(value / nearest) * nearest;
  }

  ceilToNearest(value: number, nearest: number): number {
    return Math.ceil(value / nearest) * nearest;
  }

  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  linearInterpolation(start: number, end: number, t: number): number {
    return start + (end - start) * this.clamp(t, 0, 1);
  }

  /**
   * Validation Calculations
   */

  isValidPercentage(value: number): boolean {
    return value >= 0 && value <= 100;
  }

  isValidPrice(value: number): boolean {
    return value >= 0 && value <= 1000000; // Max price 1M
  }

  isValidDateRange(range: DateRange): boolean {
    return range.end > range.start;
  }

  isWithinBudget(spent: number, budget: number, tolerance: number = 0): boolean {
    return spent <= budget + tolerance;
  }

  calculateBudgetStatus(spent: number, budget: number): 'under' | 'exact' | 'over' {
    if (spent < budget) return 'under';
    if (spent > budget) return 'over';
    return 'exact';
  }

  /**
   * Trend Calculations
   */

  calculateMovingAverage(numbers: number[], window: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < numbers.length; i++) {
      const start = Math.max(0, i - window + 1);
      const windowValues = numbers.slice(start, i + 1);
      const average = this.calculateMean(windowValues);
      result.push(average);
    }
    
    return result;
  }

  calculateExponentialMovingAverage(numbers: number[], alpha: number): number[] {
    const result: number[] = [];
    let ema = numbers[0];
    
    for (let i = 0; i < numbers.length; i++) {
      if (i === 0) {
        ema = numbers[i];
      } else {
        ema = alpha * numbers[i] + (1 - alpha) * ema;
      }
      result.push(ema);
    }
    
    return result;
  }

  calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(Math.max(0, change));
      losses.push(Math.max(0, -change));
    }

    for (let i = period; i < prices.length; i++) {
      const avgGain = this.calculateMean(gains.slice(i - period, i));
      const avgLoss = this.calculateMean(losses.slice(i - period, i));
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }

    return rsi;
  }

  /**
   * Chart Data Calculations
   */

  calculateChartDimensions(
    data: number[],
    height: number,
    padding: { top: number; bottom: number }
  ): { min: number; max: number; scale: number } {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const availableHeight = height - padding.top - padding.bottom;
    
    return {
      min,
      max,
      scale: range === 0 ? 1 : availableHeight / range,
    };
  }

  calculatePieChartSegments(values: number[]): Array<{
    value: number;
    percentage: number;
    startAngle: number;
    endAngle: number;
  }> {
    const total = values.reduce((sum, val) => sum + val, 0);
    let currentAngle = 0;
    
    return values.map(value => {
      const percentage = total > 0 ? (value / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const segment = {
        value,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
      };
      currentAngle += angle;
      return segment;
    });
  }

  calculateBarChartDimensions(
    data: number[],
    maxHeight: number,
    minBarHeight: number = 0
  ): number[] {
    const maxValue = Math.max(...data);
    if (maxValue === 0) return data.map(() => minBarHeight);
    
    return data.map(value => 
      Math.max(minBarHeight, (value / maxValue) * maxHeight)
    );
  }
}

export default new Calculations();