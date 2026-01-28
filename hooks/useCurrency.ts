import { useMemo } from 'react';

// TODO: Implement CurrencyContext
// import { useCurrency as useCurrencyContext } from '@context/CurrencyContext';
// TODO: Implement Currency types  
// import { Currency } from '@types/currency';

type Currency = { code: string; name: string; symbol: string; decimalDigits: number; flag?: string };
const useCurrencyContext = () => ({ 
  getAllCurrencies: () => [],
  convertAmount: (from: number, fromCur: string, toCur: string) => from,
  formatAmount: (amount: number, currency?: string, options?: any) => amount.toString(),
  formatAmountWithConversion: (amount: number, fromCur?: string, options?: any) => amount.toString(),
  getCurrencyInfo: (code: string) => ({ code, name: code, symbol: code, decimalDigits: 2, flag: '🏳️' }),
  getRate: (code: string) => 1,
  getRatesAge: () => 'Never',
  primaryCurrency: 'USD',
  currencyFormat: 'symbol' as const,
  decimalPlaces: 2,
  ratesLastUpdated: null,
});

/**
 * Custom hook for currency operations with enhanced utilities
 * This hook provides currency conversion, formatting, and management utilities
 */
export const useCurrency = () => {
  const currencyContext = useCurrencyContext();
  
  if (!currencyContext) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  
  const {
    convertAmount,
    formatAmount,
    formatAmountWithConversion,
    getCurrencyInfo,
    getAllCurrencies,
    getRate,
    getRatesAge,
    ...contextProps
  } = currencyContext;
  
  /**
   * ENHANCED CONVERSION UTILITIES
   */
  
  // Convert and format with locale
  const convertAndFormat = (
    amount: number, 
    fromCurrency: string, 
    toCurrency: string,
    options?: any
  ): string => {
    const converted = convertAmount(amount, fromCurrency, toCurrency);
    return formatAmount(converted, toCurrency, options);
  };
  
  // Convert subscription amount with detailed info
  const convertSubscriptionAmount = (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): {
    original: number;
    converted: number;
    rate: number;
    display: string;
    detailed: string;
  } => {
    const converted = convertAmount(amount, fromCurrency, toCurrency);
    const rate = getRate(toCurrency) / getRate(fromCurrency);
    
    return {
      original: amount,
      converted,
      rate,
      display: formatAmountWithConversion(amount, fromCurrency, { targetCurrency: toCurrency }),
      detailed: `${formatAmount(amount, fromCurrency)} = ${formatAmount(converted, toCurrency)} (Rate: ${rate.toFixed(4)})`,
    };
  };
  
  // Bulk convert amounts
  const convertAmounts = (
    amounts: Array<{ amount: number; currency: string }>,
    toCurrency: string
  ): Array<{ original: number; converted: number; currency: string; display: string }> => {
    return amounts.map(item => {
      const converted = convertAmount(item.amount, item.currency, toCurrency);
      
      return {
        original: item.amount,
        converted,
        currency: item.currency,
        display: formatAmountWithConversion(item.amount, item.currency, { targetCurrency: toCurrency }),
      };
    });
  };
  
  // Calculate total in multiple currencies
  const calculateTotalInMultipleCurrencies = (
    amounts: Array<{ amount: number; currency: string }>,
    targetCurrencies: string[]
  ): Record<string, number> => {
    const totals: Record<string, number> = {};
    
    targetCurrencies.forEach(targetCurrency => {
      totals[targetCurrency] = amounts.reduce((sum, item) => {
        return sum + convertAmount(item.amount, item.currency, targetCurrency);
      }, 0);
    });
    
    return totals;
  };
  
  /**
   * ENHANCED FORMATTING UTILITIES
   */
  
  // Format with custom symbols
  const formatWithCustomSymbol = (
    amount: number,
    currencyCode: string,
    customSymbol?: string
  ): string => {
    const formatted = formatAmount(amount, currencyCode, { showSymbol: false });
    return `${customSymbol || getCurrencyInfo(currencyCode).symbol}${formatted}`;
  };
  
  // Format with flag
  const formatWithFlag = (
    amount: number,
    currencyCode: string,
    options?: any
  ): string => {
    const currencyInfo = getCurrencyInfo(currencyCode);
    const formatted = formatAmount(amount, currencyCode, { ...options, showSymbol: false });
    return `${currencyInfo.flag} ${formatted} ${currencyInfo.code}`;
  };
  
  // Format range
  const formatRange = (
    min: number,
    max: number,
    currencyCode: string,
    options?: any
  ): string => {
    const minFormatted = formatAmount(min, currencyCode, options);
    const maxFormatted = formatAmount(max, currencyCode, options);
    return `${minFormatted} - ${maxFormatted}`;
  };
  
  // Format percentage change
  const formatPercentageChange = (
    oldAmount: number,
    newAmount: number,
    currencyCode: string
  ): string => {
    const change = ((newAmount - oldAmount) / oldAmount) * 100;
    const changeFormatted = formatAmount(Math.abs(change), currencyCode, {
      decimalPlaces: 1,
      showSymbol: false,
    });
    
    const direction = change >= 0 ? 'increase' : 'decrease';
    const sign = change >= 0 ? '+' : '-';
    
    return `${sign}${changeFormatted}% ${direction}`;
  };
  
  /**
   * CURRENCY DISCOVERY & INFORMATION
   */
  
  // Search currencies by name or code
  const searchCurrencies = (query: string): Currency[] => {
    const lowerQuery = query.toLowerCase();
    return getAllCurrencies().filter((currency: Currency) =>
      currency.name.toLowerCase().includes(lowerQuery) ||
      currency.code.toLowerCase().includes(lowerQuery) ||
      currency.symbol.toLowerCase().includes(lowerQuery)
    );
  };
  
  // Get currencies by region
  const getCurrenciesByRegion = (region: string): Currency[] => {
    const regionMap: Record<string, string[]> = {
      'asia': ['LKR', 'INR', 'PKR', 'BDT', 'SGD', 'MYR', 'THB', 'PHP', 'JPY', 'CNY'],
      'europe': ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK'],
      'north-america': ['USD', 'CAD', 'MXN'],
      'south-america': ['BRL', 'ARS'],
      'middle-east': ['AED', 'SAR', 'QAR'],
      'africa': ['ZAR', 'EGP', 'NGN'],
      'oceania': ['AUD', 'NZD'],
    };
    
    const regionCodes = regionMap[region.toLowerCase()] || [];
    return getAllCurrencies().filter((currency: Currency) => regionCodes.includes(currency.code));
  };
  
  // Get popular currencies (based on usage)
  const getPopularCurrencies = (): Currency[] => {
    const popularCodes = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'LKR'];
    return getAllCurrencies().filter((currency: Currency) => popularCodes.includes(currency.code));
  };
  
  // Get currency by symbol
  const getCurrencyBySymbol = (symbol: string): Currency | undefined => {
    return getAllCurrencies().find((currency: Currency) => currency.symbol === symbol);
  };
  
  /**
   * EXCHANGE RATE UTILITIES
   */
  
  // Calculate reverse rate
  const getReverseRate = (fromCurrency: string, toCurrency: string): number => {
    const forwardRate = getRate(toCurrency) / getRate(fromCurrency);
    return forwardRate > 0 ? 1 / forwardRate : 0;
  };
  
  // Get cross rate (A to B via C)
  const getCrossRate = (fromCurrency: string, toCurrency: string, viaCurrency: string): number => {
    const rate1 = getRate(viaCurrency) / getRate(fromCurrency);
    const rate2 = getRate(toCurrency) / getRate(viaCurrency);
    return rate1 * rate2;
  };
  
  // Check if rate is stale
  const isRateStale = (hours: number = 24): boolean => {
    if (!contextProps.ratesLastUpdated) return true;
    
    const lastUpdate = new Date(contextProps.ratesLastUpdated);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceUpdate > hours;
  };
  
  // Get rate history (simulated - would come from API in real app)
  const getRateHistory = (
    fromCurrency: string,
    toCurrency: string,
    days: number = 30
  ): Array<{ date: string; rate: number }> => {
    const history = [];
    const baseRate = getRate(toCurrency) / getRate(fromCurrency);
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate small fluctuations
      const fluctuation = (Math.random() - 0.5) * 0.1; // ±5%
      const rate = baseRate * (1 + fluctuation);
      
      history.push({
        date: date.toISOString().split('T')[0],
        rate: parseFloat(rate.toFixed(6)),
      });
    }
    
    return history;
  };
  
  /**
   * CURRENCY VALIDATION
   */
  
  // Validate currency code
  const isValidCurrency = (currencyCode: string): boolean => {
    return getAllCurrencies().some((currency: Currency) => currency.code === currencyCode);
  };
  
  // Validate amount for currency
  const isValidAmount = (amount: number, currencyCode: string): boolean => {
    if (isNaN(amount)) return false;
    if (amount < 0) return false;
    
    const currencyInfo = getCurrencyInfo(currencyCode);
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    
    return decimalPlaces <= currencyInfo.decimalDigits;
  };
  
  // Format validation error
  const getCurrencyValidationError = (amount: number, currencyCode: string): string | null => {
    if (!isValidCurrency(currencyCode)) {
      return `Invalid currency code: ${currencyCode}`;
    }
    
    if (isNaN(amount)) {
      return 'Amount must be a valid number';
    }
    
    if (amount < 0) {
      return 'Amount cannot be negative';
    }
    
    const currencyInfo = getCurrencyInfo(currencyCode);
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    
    if (decimalPlaces > currencyInfo.decimalDigits) {
      return `Amount can have at most ${currencyInfo.decimalDigits} decimal places for ${currencyCode}`;
    }
    
    return null;
  };
  
  /**
   * BULK OPERATIONS FOR SUBSCRIPTIONS
   */
  
  // Convert all subscription amounts to target currency
  const convertAllSubscriptions = (
    subscriptions: Array<{ amount: number; currency?: string }>,
    targetCurrency: string
  ): Array<{ original: number; converted: number; display: string; currency: string }> => {
    return subscriptions.map(sub => {
      const fromCurrency = sub.currency || contextProps.primaryCurrency;
      const converted = convertAmount(sub.amount, fromCurrency, targetCurrency);
      
      return {
        original: sub.amount,
        converted,
        display: formatAmountWithConversion(sub.amount, fromCurrency, { targetCurrency }),
        currency: fromCurrency,
      };
    });
  };
  
  // Calculate subscription statistics in target currency
  const calculateSubscriptionStats = (
    subscriptions: Array<{ amount: number; currency?: string; isActive?: boolean }>,
    targetCurrency: string
  ): {
    total: number;
    average: number;
    min: number;
    max: number;
    activeTotal: number;
    inactiveTotal: number;
    activeCount: number;
    inactiveCount: number;
  } => {
    const convertedAmounts = convertAllSubscriptions(subscriptions, targetCurrency);
    
    const activeSubs = subscriptions.filter(sub => sub.isActive !== false);
    const inactiveSubs = subscriptions.filter(sub => sub.isActive === false);
    
    const activeAmounts = activeSubs.map((sub, index) => convertedAmounts[index].converted);
    const inactiveAmounts = inactiveSubs.map((sub, index) => convertedAmounts[index].converted);
    
    const allAmounts = convertedAmounts.map(item => item.converted);
    
    return {
      total: parseFloat(allAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(2)),
      average: parseFloat((allAmounts.reduce((sum, amount) => sum + amount, 0) / allAmounts.length || 0).toFixed(2)),
      min: parseFloat(Math.min(...allAmounts).toFixed(2)),
      max: parseFloat(Math.max(...allAmounts).toFixed(2)),
      activeTotal: parseFloat(activeAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(2)),
      inactiveTotal: parseFloat(inactiveAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(2)),
      activeCount: activeSubs.length,
      inactiveCount: inactiveSubs.length,
    };
  };
  
  // Group subscriptions by currency
  const groupSubscriptionsByCurrency = (
    subscriptions: Array<{ amount: number; currency?: string }>
  ): Record<string, Array<{ amount: number; converted?: number }>> => {
    const groups: Record<string, Array<{ amount: number; converted?: number }>> = {};
    
    subscriptions.forEach(sub => {
      const currency = sub.currency || contextProps.primaryCurrency;
      
      if (!groups[currency]) {
        groups[currency] = [];
      }
      
      groups[currency].push({
        amount: sub.amount,
        converted: convertAmount(sub.amount, currency, contextProps.primaryCurrency),
      });
    });
    
    return groups;
  };
  
  /**
   * UI/UX UTILITIES
   */
  
  // Get currency display configuration
  const getCurrencyDisplayConfig = (): {
    showSymbol: boolean;
    showCode: boolean;
    decimalPlaces: number;
    format: 'symbol' | 'code' | 'name';
  } => {
    return {
      showSymbol: (contextProps.currencyFormat as string) === 'symbol',
      showCode: (contextProps.currencyFormat as string) === 'code',
      decimalPlaces: contextProps.decimalPlaces,
      format: contextProps.currencyFormat,
    };
  };
  
  // Get currency color (for UI)
  const getCurrencyColor = (currencyCode: string): string => {
    const colors: Record<string, string> = {
      'USD': '#4ECDC4', // Teal
      'EUR': '#FF6B6B', // Coral
      'GBP': '#95E1D3', // Mint
      'JPY': '#FCE38A', // Yellow
      'AUD': '#F38181', // Pink
      'CAD': '#A8E6CF', // Green
      'LKR': '#FFAAA5', // Light Coral
      'INR': '#FFD3B6', // Peach
      'SGD': '#6C5CE7', // Purple
      'MYR': '#00CEC9', // Turquoise
    };
    
    return colors[currencyCode] || '#4ECDC4'; // Default teal
  };
  
  // Get currency icon (simulated - would be actual icons in real app)
  const getCurrencyIcon = (currencyCode: string): string => {
    const icons: Record<string, string> = {
      'USD': '💵',
      'EUR': '💶',
      'GBP': '💷',
      'JPY': '💴',
      'AUD': '🦘',
      'CAD': '🍁',
      'LKR': '🇱🇰',
      'INR': '🇮🇳',
      'SGD': '🦁',
      'MYR': '🇲🇾',
    };
    
    return icons[currencyCode] || getCurrencyInfo(currencyCode).flag;
  };
  
  /**
   * PERFORMANCE UTILITIES
   */
  
  // Memoized conversion for repeated use
  const memoizedConvert = useMemo(() => {
    const cache = new Map<string, number>();
    
    return (amount: number, fromCurrency: string, toCurrency: string): number => {
      const cacheKey = `${amount}_${fromCurrency}_${toCurrency}`;
      
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!;
      }
      
      const result = convertAmount(amount, fromCurrency, toCurrency);
      cache.set(cacheKey, result);
      
      // Limit cache size
      if (cache.size > 1000) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }
      
      return result;
    };
  }, [convertAmount]);
  
  // Batch convert multiple amounts
  const batchConvert = (
    conversions: Array<{ amount: number; fromCurrency: string; toCurrency: string }>
  ): number[] => {
    return conversions.map(conv => memoizedConvert(conv.amount, conv.fromCurrency, conv.toCurrency));
  };
  
  return {
    // Context props
    ...contextProps,
    
    // Basic conversion and formatting
    convertAmount,
    formatAmount,
    formatAmountWithConversion,
    getCurrencyInfo,
    getAllCurrencies,
    getRate,
    getRatesAge,
    
    // Enhanced conversion utilities
    convertAndFormat,
    convertSubscriptionAmount,
    convertAmounts,
    calculateTotalInMultipleCurrencies,
    memoizedConvert,
    batchConvert,
    
    // Enhanced formatting utilities
    formatWithCustomSymbol,
    formatWithFlag,
    formatRange,
    formatPercentageChange,
    
    // Currency discovery
    searchCurrencies,
    getCurrenciesByRegion,
    getPopularCurrencies,
    getCurrencyBySymbol,
    
    // Exchange rate utilities
    getReverseRate,
    getCrossRate,
    isRateStale,
    getRateHistory,
    
    // Currency validation
    isValidCurrency,
    isValidAmount,
    getCurrencyValidationError,
    
    // Bulk operations
    convertAllSubscriptions,
    calculateSubscriptionStats,
    groupSubscriptionsByCurrency,
    
    // UI/UX utilities
    getCurrencyDisplayConfig,
    getCurrencyColor,
    getCurrencyIcon,
  };
};

// Helper hooks for specific currency operations

export const useCurrencyConversion = () => {
  const { convertAmount, formatAmount, memoizedConvert, batchConvert } = useCurrency();
  return { convertAmount, formatAmount, memoizedConvert, batchConvert };
};

export const useCurrencyFormatting = () => {
  const { 
    formatAmount, 
    formatAmountWithConversion, 
    formatWithCustomSymbol,
    formatWithFlag,
    formatRange,
    formatPercentageChange 
  } = useCurrency();
  
  return { 
    formatAmount, 
    formatAmountWithConversion, 
    formatWithCustomSymbol,
    formatWithFlag,
    formatRange,
    formatPercentageChange 
  };
};

export const useCurrencyDiscovery = () => {
  const { 
    getAllCurrencies, 
    searchCurrencies, 
    getCurrenciesByRegion,
    getPopularCurrencies,
    getCurrencyBySymbol 
  } = useCurrency();
  
  return { 
    getAllCurrencies, 
    searchCurrencies, 
    getCurrenciesByRegion,
    getPopularCurrencies,
    getCurrencyBySymbol 
  };
};

export const useCurrencyValidation = () => {
  const { 
    isValidCurrency, 
    isValidAmount, 
    getCurrencyValidationError 
  } = useCurrency();
  
  return { 
    isValidCurrency, 
    isValidAmount, 
    getCurrencyValidationError 
  };
};

// Default export
export default useCurrency;