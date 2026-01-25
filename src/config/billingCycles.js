/**
 * Billing Cycles Configuration for SubTrack
 * Comprehensive billing cycle definitions and calculations
 */

// Billing cycle constants
export const BillingCycle = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  BIMONTHLY: 'bimonthly',
  QUARTERLY: 'quarterly',
  SEMIANNUALLY: 'semiannually',
  ANNUALLY: 'annually',
  CUSTOM: 'custom',
};

// Comprehensive billing cycle data
export const BILLING_CYCLES = [
  {
    id: BillingCycle.DAILY,
    name: 'Daily',
    description: 'Charged every day',
    days: 1,
    months: 0,
    years: 0,
    frequency: 'daily',
    displayName: 'Daily',
    shortName: 'Day',
    icon: 'calendar-today',
    color: '#10B981', // Emerald
    isCommon: false,
    order: 1,
    
    // Calculation multipliers
    toMonthly: 30.44, // Average days in month
    toYearly: 365,
    toWeekly: 7,
    
    // Human readable
    humanReadable: 'Every day',
    nextBillingText: 'Tomorrow',
  },
  {
    id: BillingCycle.WEEKLY,
    name: 'Weekly',
    description: 'Charged every week',
    days: 7,
    months: 0,
    years: 0,
    frequency: 'weekly',
    displayName: 'Weekly',
    shortName: 'Week',
    icon: 'calendar-week',
    color: '#3B82F6', // Blue
    isCommon: false,
    order: 2,
    
    toMonthly: 4.345, // Average weeks in month
    toYearly: 52,
    toDaily: 0.1429,
    
    humanReadable: 'Every week',
    nextBillingText: 'Next week',
  },
  {
    id: BillingCycle.BIWEEKLY,
    name: 'Bi-Weekly',
    description: 'Charged every two weeks',
    days: 14,
    months: 0,
    years: 0,
    frequency: 'biweekly',
    displayName: 'Bi-Weekly',
    shortName: '2 Weeks',
    icon: 'calendar-week-begin',
    color: '#8B5CF6', // Violet
    isCommon: false,
    order: 3,
    
    toMonthly: 2.1725, // Every 2 weeks to monthly
    toYearly: 26,
    toWeekly: 0.5,
    
    humanReadable: 'Every two weeks',
    nextBillingText: 'In two weeks',
  },
  {
    id: BillingCycle.MONTHLY,
    name: 'Monthly',
    description: 'Charged every month',
    days: 30, // Approximate
    months: 1,
    years: 0,
    frequency: 'monthly',
    displayName: 'Monthly',
    shortName: 'Month',
    icon: 'calendar-month',
    color: '#6366F1', // Indigo
    isCommon: true,
    order: 4,
    
    toMonthly: 1,
    toYearly: 12,
    toWeekly: 0.2301,
    toDaily: 0.0329,
    
    humanReadable: 'Every month',
    nextBillingText: 'Next month',
  },
  {
    id: BillingCycle.BIMONTHLY,
    name: 'Bi-Monthly',
    description: 'Charged every two months',
    days: 60, // Approximate
    months: 2,
    years: 0,
    frequency: 'bimonthly',
    displayName: 'Bi-Monthly',
    shortName: '2 Months',
    icon: 'calendar-month-outline',
    color: '#EC4899', // Pink
    isCommon: false,
    order: 5,
    
    toMonthly: 0.5,
    toYearly: 6,
    toWeekly: 0.115,
    
    humanReadable: 'Every two months',
    nextBillingText: 'In two months',
  },
  {
    id: BillingCycle.QUARTERLY,
    name: 'Quarterly',
    description: 'Charged every three months',
    days: 90, // Approximate
    months: 3,
    years: 0,
    frequency: 'quarterly',
    displayName: 'Quarterly',
    shortName: 'Quarter',
    icon: 'calendar-blank',
    color: '#F59E0B', // Amber
    isCommon: true,
    order: 6,
    
    toMonthly: 0.3333,
    toYearly: 4,
    toWeekly: 0.0767,
    
    humanReadable: 'Every three months',
    nextBillingText: 'Next quarter',
  },
  {
    id: BillingCycle.SEMIANNUALLY,
    name: 'Semi-Annually',
    description: 'Charged every six months',
    days: 180, // Approximate
    months: 6,
    years: 0,
    frequency: 'semiannually',
    displayName: 'Semi-Annually',
    shortName: '6 Months',
    icon: 'calendar-range',
    color: '#F97316', // Orange
    isCommon: true,
    order: 7,
    
    toMonthly: 0.1667,
    toYearly: 2,
    toWeekly: 0.0384,
    
    humanReadable: 'Every six months',
    nextBillingText: 'In six months',
  },
  {
    id: BillingCycle.ANNUALLY,
    name: 'Annually',
    description: 'Charged every year',
    days: 365,
    months: 12,
    years: 1,
    frequency: 'annually',
    displayName: 'Annually',
    shortName: 'Year',
    icon: 'calendar-star',
    color: '#EF4444', // Red
    isCommon: true,
    order: 8,
    
    toMonthly: 0.0833,
    toYearly: 1,
    toWeekly: 0.0192,
    toDaily: 0.00274,
    
    humanReadable: 'Every year',
    nextBillingText: 'Next year',
  },
  {
    id: BillingCycle.CUSTOM,
    name: 'Custom',
    description: 'Custom billing cycle',
    days: null, // User defined
    months: null,
    years: null,
    frequency: 'custom',
    displayName: 'Custom',
    shortName: 'Custom',
    icon: 'calendar-edit',
    color: '#6B7280', // Gray
    isCommon: false,
    order: 9,
    
    toMonthly: null, // Depends on custom days
    toYearly: null,
    
    humanReadable: 'Custom period',
    nextBillingText: 'On custom date',
  },
];

// Common billing cycles for quick selection
export const COMMON_BILLING_CYCLES = BILLING_CYCLES.filter(cycle => cycle.isCommon);

// Helper functions
export const BillingCycleHelpers = {
  /**
   * Get billing cycle by ID
   */
  getBillingCycleById(cycleId) {
    return BILLING_CYCLES.find(cycle => cycle.id === cycleId) || 
           BILLING_CYCLES.find(cycle => cycle.id === BillingCycle.MONTHLY);
  },

  /**
   * Get billing cycle by name
   */
  getBillingCycleByName(cycleName) {
    return BILLING_CYCLES.find(cycle => 
      cycle.name.toLowerCase() === cycleName.toLowerCase()
    ) || BILLING_CYCLES.find(cycle => cycle.id === BillingCycle.MONTHLY);
  },

  /**
   * Get all billing cycles as options for dropdown
   */
  getBillingCycleOptions(includeCustom = true) {
    let cycles = BILLING_CYCLES;
    
    if (!includeCustom) {
      cycles = cycles.filter(cycle => cycle.id !== BillingCycle.CUSTOM);
    }
    
    return cycles
      .sort((a, b) => a.order - b.order)
      .map(cycle => ({
        label: cycle.displayName,
        value: cycle.id,
        description: cycle.description,
        icon: cycle.icon,
        color: cycle.color,
        days: cycle.days,
      }));
  },

  /**
   * Get common billing cycles as options
   */
  getCommonBillingCycleOptions() {
    return COMMON_BILLING_CYCLES.map(cycle => ({
      label: cycle.displayName,
      value: cycle.id,
      description: cycle.description,
      icon: cycle.icon,
      color: cycle.color,
    }));
  },

  /**
   * Calculate next billing date
   */
  calculateNextBillingDate(currentDate, cycleId, customDays = 30) {
    if (!currentDate) return null;
    
    const date = new Date(currentDate);
    const cycle = this.getBillingCycleById(cycleId);
    
    if (!cycle) return null;
    
    const nextDate = new Date(date);
    
    switch (cycleId) {
      case BillingCycle.DAILY:
        nextDate.setDate(date.getDate() + 1);
        break;
      case BillingCycle.WEEKLY:
        nextDate.setDate(date.getDate() + 7);
        break;
      case BillingCycle.BIWEEKLY:
        nextDate.setDate(date.getDate() + 14);
        break;
      case BillingCycle.MONTHLY:
        nextDate.setMonth(date.getMonth() + 1);
        break;
      case BillingCycle.BIMONTHLY:
        nextDate.setMonth(date.getMonth() + 2);
        break;
      case BillingCycle.QUARTERLY:
        nextDate.setMonth(date.getMonth() + 3);
        break;
      case BillingCycle.SEMIANNUALLY:
        nextDate.setMonth(date.getMonth() + 6);
        break;
      case BillingCycle.ANNUALLY:
        nextDate.setFullYear(date.getFullYear() + 1);
        break;
      case BillingCycle.CUSTOM:
        nextDate.setDate(date.getDate() + customDays);
        break;
      default:
        nextDate.setMonth(date.getMonth() + 1);
    }
    
    return nextDate;
  },

  /**
   * Calculate previous billing date
   */
  calculatePreviousBillingDate(currentDate, cycleId, customDays = 30) {
    if (!currentDate) return null;
    
    const date = new Date(currentDate);
    const cycle = this.getBillingCycleById(cycleId);
    
    if (!cycle) return null;
    
    const previousDate = new Date(date);
    
    switch (cycleId) {
      case BillingCycle.DAILY:
        previousDate.setDate(date.getDate() - 1);
        break;
      case BillingCycle.WEEKLY:
        previousDate.setDate(date.getDate() - 7);
        break;
      case BillingCycle.BIWEEKLY:
        previousDate.setDate(date.getDate() - 14);
        break;
      case BillingCycle.MONTHLY:
        previousDate.setMonth(date.getMonth() - 1);
        break;
      case BillingCycle.BIMONTHLY:
        previousDate.setMonth(date.getMonth() - 2);
        break;
      case BillingCycle.QUARTERLY:
        previousDate.setMonth(date.getMonth() - 3);
        break;
      case BillingCycle.SEMIANNUALLY:
        previousDate.setMonth(date.getMonth() - 6);
        break;
      case BillingCycle.ANNUALLY:
        previousDate.setFullYear(date.getFullYear() - 1);
        break;
      case BillingCycle.CUSTOM:
        previousDate.setDate(date.getDate() - customDays);
        break;
      default:
        previousDate.setMonth(date.getMonth() - 1);
    }
    
    return previousDate;
  },

  /**
   * Calculate days until next billing
   */
  calculateDaysUntilNextBilling(currentDate, nextBillingDate) {
    if (!currentDate || !nextBillingDate) return null;
    
    const current = new Date(currentDate);
    const next = new Date(nextBillingDate);
    
    const diffTime = next.getTime() - current.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },

  /**
   * Convert amount between billing cycles
   */
  convertAmount(amount, fromCycleId, toCycleId, customDays = 30) {
    if (fromCycleId === toCycleId) return amount;
    
    const fromCycle = this.getBillingCycleById(fromCycleId);
    const toCycle = this.getBillingCycleById(toCycleId);
    
    if (!fromCycle || !toCycle) return amount;
    
    // First convert to daily rate, then to target cycle
    let dailyRate;
    
    // Calculate daily rate from source cycle
    switch (fromCycleId) {
      case BillingCycle.DAILY:
        dailyRate = amount;
        break;
      case BillingCycle.WEEKLY:
        dailyRate = amount / 7;
        break;
      case BillingCycle.BIWEEKLY:
        dailyRate = amount / 14;
        break;
      case BillingCycle.MONTHLY:
        dailyRate = amount / 30.44;
        break;
      case BillingCycle.BIMONTHLY:
        dailyRate = amount / 60.88;
        break;
      case BillingCycle.QUARTERLY:
        dailyRate = amount / 91.31;
        break;
      case BillingCycle.SEMIANNUALLY:
        dailyRate = amount / 182.62;
        break;
      case BillingCycle.ANNUALLY:
        dailyRate = amount / 365;
        break;
      case BillingCycle.CUSTOM:
        dailyRate = amount / customDays;
        break;
      default:
        dailyRate = amount / 30.44;
    }
    
    // Convert from daily rate to target cycle
    switch (toCycleId) {
      case BillingCycle.DAILY:
        return dailyRate;
      case BillingCycle.WEEKLY:
        return dailyRate * 7;
      case BillingCycle.BIWEEKLY:
        return dailyRate * 14;
      case BillingCycle.MONTHLY:
        return dailyRate * 30.44;
      case BillingCycle.BIMONTHLY:
        return dailyRate * 60.88;
      case BillingCycle.QUARTERLY:
        return dailyRate * 91.31;
      case BillingCycle.SEMIANNUALLY:
        return dailyRate * 182.62;
      case BillingCycle.ANNUALLY:
        return dailyRate * 365;
      case BillingCycle.CUSTOM:
        return dailyRate * customDays;
      default:
        return dailyRate * 30.44;
    }
  },

  /**
   * Calculate monthly amount from any cycle
   */
  calculateMonthlyAmount(amount, cycleId, customDays = 30) {
    return this.convertAmount(amount, cycleId, BillingCycle.MONTHLY, customDays);
  },

  /**
   * Calculate yearly amount from any cycle
   */
  calculateYearlyAmount(amount, cycleId, customDays = 30) {
    return this.convertAmount(amount, cycleId, BillingCycle.ANNUALLY, customDays);
  },

  /**
   * Calculate weekly amount from any cycle
   */
  calculateWeeklyAmount(amount, cycleId, customDays = 30) {
    return this.convertAmount(amount, cycleId, BillingCycle.WEEKLY, customDays);
  },

  /**
   * Get human-readable billing cycle description
   */
  getHumanReadable(cycleId, customDays = null) {
    const cycle = this.getBillingCycleById(cycleId);
    
    if (!cycle) return 'Monthly';
    
    if (cycleId === BillingCycle.CUSTOM && customDays) {
      if (customDays === 1) return 'Daily';
      if (customDays === 7) return 'Weekly';
      if (customDays === 14) return 'Bi-Weekly';
      if (customDays === 30) return 'Monthly';
      if (customDays === 60) return 'Bi-Monthly';
      if (customDays === 90) return 'Quarterly';
      if (customDays === 180) return 'Semi-Annually';
      if (customDays === 365) return 'Annually';
      return `Every ${customDays} days`;
    }
    
    return cycle.humanReadable;
  },

  /**
   * Get next billing text
   */
  getNextBillingText(cycleId, customDays = null) {
    const cycle = this.getBillingCycleById(cycleId);
    
    if (!cycle) return 'Next month';
    
    if (cycleId === BillingCycle.CUSTOM && customDays) {
      if (customDays === 1) return 'Tomorrow';
      if (customDays === 7) return 'Next week';
      if (customDays === 14) return 'In two weeks';
      if (customDays === 30) return 'Next month';
      if (customDays === 60) return 'In two months';
      if (customDays === 90) return 'Next quarter';
      if (customDays === 180) return 'In six months';
      if (customDays === 365) return 'Next year';
      return `In ${customDays} days`;
    }
    
    return cycle.nextBillingText;
  },

  /**
   * Get icon for billing cycle
   */
  getBillingCycleIcon(cycleId) {
    const cycle = this.getBillingCycleById(cycleId);
    return cycle?.icon || 'calendar-month';
  },

  /**
   * Get color for billing cycle
   */
  getBillingCycleColor(cycleId) {
    const cycle = this.getBillingCycleById(cycleId);
    return cycle?.color || '#6366F1';
  },

  /**
   * Get days for billing cycle
   */
  getBillingCycleDays(cycleId) {
    const cycle = this.getBillingCycleById(cycleId);
    return cycle?.days || 30;
  },

  /**
   * Check if cycle is custom
   */
  isCustomCycle(cycleId) {
    return cycleId === BillingCycle.CUSTOM;
  },

  /**
   * Auto-detect billing cycle from interval
   */
  detectBillingCycleFromInterval(days) {
    if (!days || days <= 0) return BillingCycle.MONTHLY;
    
    // Round to nearest standard cycle
    const standardCycles = [
      { days: 1, cycle: BillingCycle.DAILY },
      { days: 7, cycle: BillingCycle.WEEKLY },
      { days: 14, cycle: BillingCycle.BIWEEKLY },
      { days: 30, cycle: BillingCycle.MONTHLY },
      { days: 60, cycle: BillingCycle.BIMONTHLY },
      { days: 90, cycle: BillingCycle.QUARTERLY },
      { days: 180, cycle: BillingCycle.SEMIANNUALLY },
      { days: 365, cycle: BillingCycle.ANNUALLY },
    ];
    
    // Find closest standard cycle
    let closest = standardCycles[0];
    let minDiff = Math.abs(days - closest.days);
    
    for (const standard of standardCycles) {
      const diff = Math.abs(days - standard.days);
      if (diff < minDiff) {
        minDiff = diff;
        closest = standard;
      }
    }
    
    // If difference is significant, use custom
    if (minDiff > 5) {
      return BillingCycle.CUSTOM;
    }
    
    return closest.cycle;
  },

  /**
   * Get billing frequency text
   */
  getFrequencyText(cycleId, amount) {
    const cycle = this.getBillingCycleById(cycleId);
    
    if (!cycle) return 'per month';
    
    switch (cycleId) {
      case BillingCycle.DAILY:
        return 'per day';
      case BillingCycle.WEEKLY:
        return 'per week';
      case BillingCycle.BIWEEKLY:
        return 'every 2 weeks';
      case BillingCycle.MONTHLY:
        return 'per month';
      case BillingCycle.BIMONTHLY:
        return 'every 2 months';
      case BillingCycle.QUARTERLY:
        return 'per quarter';
      case BillingCycle.SEMIANNUALLY:
        return 'every 6 months';
      case BillingCycle.ANNUALLY:
        return 'per year';
      case BillingCycle.CUSTOM:
        return 'custom';
      default:
        return 'per month';
    }
  },
};

// Default billing cycle
export const DEFAULT_BILLING_CYCLE = BillingCycle.MONTHLY;

// Common billing cycle presets for custom
export const CUSTOM_CYCLE_PRESETS = [
  { days: 1, name: 'Daily' },
  { days: 7, name: 'Weekly' },
  { days: 14, name: 'Bi-Weekly' },
  { days: 30, name: 'Monthly' },
  { days: 60, name: 'Bi-Monthly' },
  { days: 90, name: 'Quarterly' },
  { days: 180, name: 'Semi-Annually' },
  { days: 365, name: 'Annually' },
];

// Export default
export default {
  BillingCycle,
  BILLING_CYCLES,
  COMMON_BILLING_CYCLES,
  BillingCycleHelpers,
  DEFAULT_BILLING_CYCLE,
  CUSTOM_CYCLE_PRESETS,
  
  // Convenience exports
  getCycle: BillingCycleHelpers.getBillingCycleById,
  getNextDate: BillingCycleHelpers.calculateNextBillingDate,
  getPreviousDate: BillingCycleHelpers.calculatePreviousBillingDate,
  calculateMonthly: BillingCycleHelpers.calculateMonthlyAmount,
  calculateYearly: BillingCycleHelpers.calculateYearlyAmount,
  convertAmount: BillingCycleHelpers.convertAmount,
  getHumanReadable: BillingCycleHelpers.getHumanReadable,
  getCycleOptions: BillingCycleHelpers.getBillingCycleOptions,
  getCommonOptions: BillingCycleHelpers.getCommonBillingCycleOptions,
  detectCycle: BillingCycleHelpers.detectBillingCycleFromInterval,
  isCustom: BillingCycleHelpers.isCustomCycle,
};