import { Currency, FormatOptions, useCurrency as useCurrencyContext } from '@context/CurrencyContext';
import { useCallback, useMemo } from 'react';

/**
 * Custom hook for currency operations with enhanced utilities
 * This hook provides currency conversion, formatting, and management utilities
 */
export const useCurrency = () => {
  const currencyContext = useCurrencyContext();
  
  const {
    convertAmount,
    formatAmount,
    formatAmountWithConversion,
    getCurrencyInfo,
    getAllCurrencies,
    getRate,
    getRatesAge,
    primaryCurrency,
    secondaryCurrency,
    showSecondary,
    currencyFormat,
    decimalPlaces,
    ratesLastUpdated,
    exchangeRates,
    isLoadingRates,
    isUpdatingRates,
    error,
    ...contextProps
  } = currencyContext;
  
  /**
   * ENHANCED CONVERSION UTILITIES
   */
  
  // Convert and format with locale
  const convertAndFormat = useCallback((
    amount: number, 
    fromCurrency: string, 
    toCurrency: string,
    options?: FormatOptions
  ): string => {
    const converted = convertAmount(amount, fromCurrency, toCurrency);
    return formatAmount(converted, toCurrency, options);
  }, [convertAmount, formatAmount]);
  
  // Convert subscription amount with detailed info
  const convertSubscriptionAmount = useCallback((
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
    const fromRate = getRate(fromCurrency);
    const toRate = getRate(toCurrency);
    const rate = toRate / fromRate;
    
    return {
      original: amount,
      converted,
      rate: parseFloat(rate.toFixed(6)),
      display: formatAmountWithConversion(amount, fromCurrency, { targetCurrency: toCurrency }),
      detailed: `${formatAmount(amount, fromCurrency)} = ${formatAmount(converted, toCurrency)} (Rate: ${rate.toFixed(4)})`,
    };
  }, [convertAmount, formatAmount, formatAmountWithConversion, getRate]);
  
  // Bulk convert amounts
  const convertAmounts = useCallback((
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
  }, [convertAmount, formatAmountWithConversion]);
  
  // Calculate total in multiple currencies
  const calculateTotalInMultipleCurrencies = useCallback((
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
  }, [convertAmount]);
  
  /**
   * ENHANCED FORMATTING UTILITIES
   */
  
  // Format with custom symbols
  const formatWithCustomSymbol = useCallback((
    amount: number,
    currencyCode: string,
    customSymbol?: string
  ): string => {
    const formatted = formatAmount(amount, currencyCode, { showSymbol: false });
    return `${customSymbol || getCurrencyInfo(currencyCode).symbol}${formatted}`;
  }, [formatAmount, getCurrencyInfo]);
  
  // Format with flag
  const formatWithFlag = useCallback((
    amount: number,
    currencyCode: string,
    options?: FormatOptions
  ): string => {
    const currencyInfo = getCurrencyInfo(currencyCode);
    const formatted = formatAmount(amount, currencyCode, { ...options, showSymbol: false });
    return `${currencyInfo.flag} ${formatted} ${currencyInfo.code}`;
  }, [formatAmount, getCurrencyInfo]);
  
  // Format range
  const formatRange = useCallback((
    min: number,
    max: number,
    currencyCode: string,
    options?: FormatOptions
  ): string => {
    const minFormatted = formatAmount(min, currencyCode, options);
    const maxFormatted = formatAmount(max, currencyCode, options);
    return `${minFormatted} - ${maxFormatted}`;
  }, [formatAmount]);
  
  // Format percentage change
  const formatPercentageChange = useCallback((
    oldAmount: number,
    newAmount: number,
    currencyCode: string
  ): string => {
    if (oldAmount === 0) return 'N/A';
    
    const change = ((newAmount - oldAmount) / Math.abs(oldAmount)) * 100;
    const changeFormatted = Math.abs(change).toFixed(1);
    
    const direction = change >= 0 ? 'increase' : 'decrease';
    const sign = change >= 0 ? '+' : '-';
    
    return `${sign}${changeFormatted}% ${direction}`;
  }, []);
  
  /**
   * CURRENCY DISCOVERY & INFORMATION
   */
  
  // Search currencies by name or code
  const searchCurrencies = useCallback((query: string): Currency[] => {
    if (!query.trim()) return getAllCurrencies();
    
    const lowerQuery = query.toLowerCase().trim();
    return getAllCurrencies().filter((currency: Currency) =>
      currency.name.toLowerCase().includes(lowerQuery) ||
      currency.code.toLowerCase().includes(lowerQuery) ||
      currency.symbol.toLowerCase().includes(lowerQuery)
    );
  }, [getAllCurrencies]);
  
  // Get currencies by region
  const getCurrenciesByRegion = useCallback((region: string): Currency[] => {
    const regionMap: Record<string, string[]> = {
      'asia': ['LKR', 'INR', 'PKR', 'BDT', 'SGD', 'MYR', 'THB', 'PHP', 'JPY', 'CNY', 'KRW', 'VND', 'IDR'],
      'europe': ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'ISK'],
      'north-america': ['USD', 'CAD', 'MXN'],
      'south-america': ['BRL', 'ARS', 'CLP', 'COP', 'PEN', 'UYU', 'VES'],
      'middle-east': ['AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'ILS', 'TRY'],
      'africa': ['ZAR', 'EGP', 'NGN', 'KES', 'GHS', 'MAD', 'TND'],
      'oceania': ['AUD', 'NZD', 'FJD', 'PGK'],
    };
    
    const regionCodes = regionMap[region.toLowerCase()] || [];
    return getAllCurrencies().filter((currency: Currency) => regionCodes.includes(currency.code));
  }, [getAllCurrencies]);
  
  // Get popular currencies (based on usage)
  const getPopularCurrencies = useCallback((): Currency[] => {
    const popularCodes = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'LKR'];
    return getAllCurrencies().filter((currency: Currency) => popularCodes.includes(currency.code));
  }, [getAllCurrencies]);
  
  // Get currency by symbol
  const getCurrencyBySymbol = useCallback((symbol: string): Currency | undefined => {
    return getAllCurrencies().find((currency: Currency) => currency.symbol === symbol);
  }, [getAllCurrencies]);
  
  // Get currency suggestions for search
  const getCurrencySuggestions = useCallback((query: string, limit: number = 5): Currency[] => {
    if (!query.trim()) return getPopularCurrencies().slice(0, limit);
    
    const results = searchCurrencies(query);
    return results.slice(0, limit);
  }, [searchCurrencies, getPopularCurrencies]);
  
  /**
   * EXCHANGE RATE UTILITIES
   */
  
  // Calculate reverse rate
  const getReverseRate = useCallback((fromCurrency: string, toCurrency: string): number => {
    const forwardRate = getRate(toCurrency) / getRate(fromCurrency);
    return forwardRate > 0 ? parseFloat((1 / forwardRate).toFixed(6)) : 0;
  }, [getRate]);
  
  // Get cross rate (A to B via C)
  const getCrossRate = useCallback((fromCurrency: string, toCurrency: string, viaCurrency: string): number => {
    const rate1 = getRate(viaCurrency) / getRate(fromCurrency);
    const rate2 = getRate(toCurrency) / getRate(viaCurrency);
    return parseFloat((rate1 * rate2).toFixed(6));
  }, [getRate]);
  
  // Check if rate is stale
  const isRateStale = useCallback((hours: number = 24): boolean => {
    if (!ratesLastUpdated) return true;
    
    const lastUpdate = new Date(ratesLastUpdated);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceUpdate > hours;
  }, [ratesLastUpdated]);
  
  // Get rate history (simulated - would come from API in real app)
  const getRateHistory = useCallback((
    fromCurrency: string,
    toCurrency: string,
    days: number = 30
  ): Array<{ date: string; rate: number }> => {
    const history = [];
    const baseRate = getRate(toCurrency) / getRate(fromCurrency);
    const volatility = 0.02; // 2% daily volatility
    
    let currentRate = baseRate;
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate random walk
      if (i < days) {
        const change = (Math.random() - 0.5) * 2 * volatility * currentRate;
        currentRate = Math.max(0.0001, currentRate + change);
      }
      
      history.push({
        date: date.toISOString().split('T')[0],
        rate: parseFloat(currentRate.toFixed(6)),
      });
    }
    
    return history;
  }, [getRate]);
  
  // Get rate trend
  const getRateTrend = useCallback((
    fromCurrency: string,
    toCurrency: string,
    days: number = 30
  ): {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    volatility: number;
  } => {
    const history = getRateHistory(fromCurrency, toCurrency, days);
    
    if (history.length < 2) {
      return { direction: 'stable', percentage: 0, volatility: 0 };
    }
    
    const firstRate = history[0].rate;
    const lastRate = history[history.length - 1].rate;
    const percentageChange = ((lastRate - firstRate) / firstRate) * 100;
    
    // Calculate volatility (standard deviation of daily returns)
    const returns = [];
    for (let i = 1; i < history.length; i++) {
      const dailyReturn = (history[i].rate - history[i-1].rate) / history[i-1].rate;
      returns.push(dailyReturn);
    }
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * 100; // Daily volatility percentage
    
    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (percentageChange > 1) direction = 'up';
    else if (percentageChange < -1) direction = 'down';
    
    return {
      direction,
      percentage: parseFloat(percentageChange.toFixed(2)),
      volatility: parseFloat(volatility.toFixed(2)),
    };
  }, [getRateHistory]);
  
  /**
   * CURRENCY VALIDATION
   */
  
  // Validate currency code
  const isValidCurrency = useCallback((currencyCode: string): boolean => {
    return getAllCurrencies().some((currency: Currency) => currency.code === currencyCode);
  }, [getAllCurrencies]);
  
  // Validate amount for currency
  const isValidAmount = useCallback((amount: number, currencyCode: string): boolean => {
    if (isNaN(amount)) return false;
    if (amount < 0) return false;
    if (amount > 999999999) return false; // Sanity check
    
    const currencyInfo = getCurrencyInfo(currencyCode);
    const amountStr = amount.toString();
    const decimalPlaces = amountStr.includes('.') ? amountStr.split('.')[1].length : 0;
    
    return decimalPlaces <= currencyInfo.decimalDigits;
  }, [getCurrencyInfo]);
  
  // Format validation error
  const getCurrencyValidationError = useCallback((amount: number, currencyCode: string): string | null => {
    if (!isValidCurrency(currencyCode)) {
      return `Invalid currency code: ${currencyCode}`;
    }
    
    if (isNaN(amount)) {
      return 'Amount must be a valid number';
    }
    
    if (amount < 0) {
      return 'Amount cannot be negative';
    }
    
    if (amount > 999999999) {
      return 'Amount exceeds maximum allowed value';
    }
    
    const currencyInfo = getCurrencyInfo(currencyCode);
    const amountStr = amount.toString();
    const decimalPlaces = amountStr.includes('.') ? amountStr.split('.')[1].length : 0;
    
    if (decimalPlaces > currencyInfo.decimalDigits) {
      return `Amount can have at most ${currencyInfo.decimalDigits} decimal places for ${currencyCode}`;
    }
    
    return null;
  }, [isValidCurrency, getCurrencyInfo]);
  
  /**
   * BULK OPERATIONS FOR SUBSCRIPTIONS
   */
  
  // Convert all subscription amounts to target currency
  const convertAllSubscriptions = useCallback((
    subscriptions: Array<{ amount: number; currency?: string }>,
    targetCurrency: string
  ): Array<{ original: number; converted: number; display: string; currency: string }> => {
    return subscriptions.map(sub => {
      const fromCurrency = sub.currency || primaryCurrency;
      const converted = convertAmount(sub.amount, fromCurrency, targetCurrency);
      
      return {
        original: sub.amount,
        converted,
        display: formatAmountWithConversion(sub.amount, fromCurrency, { targetCurrency }),
        currency: fromCurrency,
      };
    });
  }, [convertAmount, formatAmountWithConversion, primaryCurrency]);
  
  // Calculate subscription statistics in target currency
  const calculateSubscriptionStats = useCallback((
    subscriptions: Array<{ amount: number; currency?: string; isActive?: boolean }>,
    targetCurrency: string
  ): {
    total: number;
    average: number;
    min: number;
    max: number;
    median: number;
    activeTotal: number;
    inactiveTotal: number;
    activeCount: number;
    inactiveCount: number;
  } => {
    if (!subscriptions.length) {
      return {
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
        activeTotal: 0,
        inactiveTotal: 0,
        activeCount: 0,
        inactiveCount: 0,
      };
    }
    
    const convertedAmounts = subscriptions.map(sub => {
      const fromCurrency = sub.currency || primaryCurrency;
      return convertAmount(sub.amount, fromCurrency, targetCurrency);
    });
    
    const activeSubs = subscriptions.filter(sub => sub.isActive !== false);
    const inactiveSubs = subscriptions.filter(sub => sub.isActive === false);
    
    const activeAmounts = activeSubs.map((sub, index) => {
      const subIndex = subscriptions.findIndex(s => s === sub);
      return convertedAmounts[subIndex];
    });
    
    const inactiveAmounts = inactiveSubs.map((sub, index) => {
      const subIndex = subscriptions.findIndex(s => s === sub);
      return convertedAmounts[subIndex];
    });
    
    // Calculate median
    const sortedAmounts = [...convertedAmounts].sort((a, b) => a - b);
    const midIndex = Math.floor(sortedAmounts.length / 2);
    const median = sortedAmounts.length % 2 === 0
      ? (sortedAmounts[midIndex - 1] + sortedAmounts[midIndex]) / 2
      : sortedAmounts[midIndex];
    
    return {
      total: parseFloat(convertedAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(2)),
      average: parseFloat((convertedAmounts.reduce((sum, amount) => sum + amount, 0) / convertedAmounts.length).toFixed(2)),
      min: parseFloat(Math.min(...convertedAmounts).toFixed(2)),
      max: parseFloat(Math.max(...convertedAmounts).toFixed(2)),
      median: parseFloat(median.toFixed(2)),
      activeTotal: parseFloat(activeAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(2)),
      inactiveTotal: parseFloat(inactiveAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(2)),
      activeCount: activeSubs.length,
      inactiveCount: inactiveSubs.length,
    };
  }, [convertAmount, primaryCurrency]);
  
  // Group subscriptions by currency
  const groupSubscriptionsByCurrency = useCallback((
    subscriptions: Array<{ amount: number; currency?: string }>
  ): Record<string, { total: number; count: number; items: Array<{ amount: number; converted: number }> }> => {
    const groups: Record<string, { total: number; count: number; items: Array<{ amount: number; converted: number }> }> = {};
    
    subscriptions.forEach(sub => {
      const currency = sub.currency || primaryCurrency;
      
      if (!groups[currency]) {
        groups[currency] = {
          total: 0,
          count: 0,
          items: [],
        };
      }
      
      const converted = convertAmount(sub.amount, currency, primaryCurrency);
      
      groups[currency].total += sub.amount;
      groups[currency].count += 1;
      groups[currency].items.push({
        amount: sub.amount,
        converted: parseFloat(converted.toFixed(2)),
      });
    });
    
    // Sort groups by total
    return Object.fromEntries(
      Object.entries(groups).sort(([, a], [, b]) => b.total - a.total)
    );
  }, [convertAmount, primaryCurrency]);
  
  /**
   * UI/UX UTILITIES
   */
  
  // Get currency display configuration
  const getCurrencyDisplayConfig = useCallback((): {
    showSymbol: boolean;
    showCode: boolean;
    decimalPlaces: number;
    format: 'symbol' | 'code' | 'name';
  } => {
    return {
      showSymbol: currencyFormat === 'symbol',
      showCode: currencyFormat === 'code',
      decimalPlaces,
      format: currencyFormat,
    };
  }, [currencyFormat, decimalPlaces]);
  
  // Get currency color (for UI)
  const getCurrencyColor = useCallback((currencyCode: string): string => {
    const colors: Record<string, string> = {
      'USD': '#4ECDC4', // Teal
      'EUR': '#FF6B6B', // Coral
      'GBP': '#95E1D3', // Mint
      'JPY': '#FCE38A', // Yellow
      'AUD': '#F38181', // Pink
      'CAD': '#A8E6CF', // Green
      'CHF': '#6C5CE7', // Purple
      'CNY': '#FF8C42', // Orange
      'LKR': '#FFAAA5', // Light Coral
      'INR': '#FFD3B6', // Peach
      'PKR': '#B5EAD7', // Light Green
      'SGD': '#C7CEEA', // Lavender
      'MYR': '#FFC8A2', // Peach
      'THB': '#D4A5A5', // Dusty Rose
      'KRW': '#9B5DE5', // Purple
      'AED': '#F15BB5', // Pink
      'SAR': '#00BBF9', // Blue
      'ZAR': '#00F5D4', // Turquoise
    };
    
    return colors[currencyCode] || '#4ECDC4'; // Default teal
  }, []);
  
  // Get currency icon (simulated - would be actual icons in real app)
  const getCurrencyIcon = useCallback((currencyCode: string): string => {
    const icons: Record<string, string> = {
      'USD': '💵',
      'EUR': '💶',
      'GBP': '💷',
      'JPY': '💴',
      'AUD': '🦘',
      'CAD': '🍁',
      'CHF': '🏔️',
      'CNY': '🐉',
      'LKR': '🦁',
      'INR': '🐘',
      'PKR': '🏔️',
      'SGD': '🦁',
      'MYR': '🐅',
      'THB': '🐘',
      'KRW': '🏯',
      'VND': '🌾',
      'IDR': '🌋',
      'AED': '🕌',
      'SAR': '🏜️',
      'QAR': '🏝️',
      'ILS': '✡️',
      'TRY': '🕌',
      'ZAR': '🦏',
      'EGP': '🔺',
      'NGN': '🛢️',
      'BRL': '🌴',
      'MXN': '🌮',
      'ARS': '⚽',
      'NZD': '🥝',
    };
    
    return icons[currencyCode] || getCurrencyInfo(currencyCode).flag;
  }, [getCurrencyInfo]);
  
  // Get currency name with flag
  const getCurrencyNameWithFlag = useCallback((currencyCode: string): string => {
    const info = getCurrencyInfo(currencyCode);
    return `${info.flag} ${info.name} (${info.code})`;
  }, [getCurrencyInfo]);
  
  /**
   * PERFORMANCE UTILITIES
   */
  
  // Memoized conversion for repeated use
  const memoizedConvert = useMemo(() => {
    const cache = new Map<string, number>();
    const MAX_CACHE_SIZE = 500;
    
    return (amount: number, fromCurrency: string, toCurrency: string): number => {
      if (fromCurrency === toCurrency) return amount;
      
      const cacheKey = `${amount}_${fromCurrency}_${toCurrency}`;
      
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!;
      }
      
      const result = convertAmount(amount, fromCurrency, toCurrency);
      
      // Limit cache size
      if (cache.size >= MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }
      
      cache.set(cacheKey, result);
      
      return result;
    };
  }, [convertAmount]);
  
  // Batch convert multiple amounts
  const batchConvert = useCallback((
    conversions: Array<{ amount: number; fromCurrency: string; toCurrency: string }>
  ): number[] => {
    return conversions.map(conv => 
      memoizedConvert(conv.amount, conv.fromCurrency, conv.toCurrency)
    );
  }, [memoizedConvert]);
  
  // Clear conversion cache
  const clearConversionCache = useCallback((): void => {
    // This would require access to the cache, which is inside memoizedConvert
    // For now, we'll just log that it's not implemented
    console.warn('clearConversionCache is not implemented in this version');
  }, []);
  
  /**
   * STATE UTILITIES
   */
  
  // Get loading status with context
  const getLoadingStatus = useCallback((): {
    isLoading: boolean;
    isUpdating: boolean;
    hasError: boolean;
    errorMessage: string | null;
  } => {
    return {
      isLoading: isLoadingRates,
      isUpdating: isUpdatingRates,
      hasError: !!error,
      errorMessage: error,
    };
  }, [isLoadingRates, isUpdatingRates, error]);
  
  /**
   * COMPARISON UTILITIES
   */
  
  // Compare prices across currencies
  const comparePrices = useCallback((
    prices: Array<{ amount: number; currency: string; label?: string }>,
    baseCurrency: string = primaryCurrency
  ): Array<{ label: string; original: number; converted: number; formatted: string; currency: string }> => {
    return prices.map(price => {
      const converted = convertAmount(price.amount, price.currency, baseCurrency);
      
      return {
        label: price.label || price.currency,
        original: price.amount,
        converted: parseFloat(converted.toFixed(2)),
        formatted: formatAmountWithConversion(price.amount, price.currency, { targetCurrency: baseCurrency }),
        currency: price.currency,
      };
    }).sort((a, b) => a.converted - b.converted);
  }, [convertAmount, formatAmountWithConversion, primaryCurrency]);
  
  // Find best value
  const findBestValue = useCallback((
    prices: Array<{ amount: number; currency: string; label?: string }>,
    baseCurrency: string = primaryCurrency
  ): { best: any; worst: any; savings: number } => {
    const compared = comparePrices(prices, baseCurrency);
    
    if (compared.length === 0) {
      return { best: null, worst: null, savings: 0 };
    }
    
    const best = compared[0];
    const worst = compared[compared.length - 1];
    const savings = worst.converted - best.converted;
    
    return { best, worst, savings: parseFloat(savings.toFixed(2)) };
  }, [comparePrices, primaryCurrency]);
  
  return {
    // Context props
    primaryCurrency,
    secondaryCurrency,
    showSecondary,
    currencyFormat,
    decimalPlaces,
    ratesLastUpdated,
    exchangeRates,
    isLoadingRates,
    isUpdatingRates,
    error,
    
    // Basic conversion and formatting (from context)
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
    clearConversionCache,
    
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
    getCurrencySuggestions,
    getCurrencyNameWithFlag,
    
    // Exchange rate utilities
    getReverseRate,
    getCrossRate,
    isRateStale,
    getRateHistory,
    getRateTrend,
    
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
    
    // State utilities
    getLoadingStatus,
    
    // Comparison utilities
    comparePrices,
    findBestValue,
  };
};

// Helper hooks for specific currency operations

export const useCurrencyConversion = () => {
  const { 
    convertAmount, 
    formatAmount, 
    memoizedConvert, 
    batchConvert,
    convertAndFormat,
    convertSubscriptionAmount,
    convertAmounts,
    calculateTotalInMultipleCurrencies 
  } = useCurrency();
  
  return { 
    convertAmount, 
    formatAmount, 
    memoizedConvert, 
    batchConvert,
    convertAndFormat,
    convertSubscriptionAmount,
    convertAmounts,
    calculateTotalInMultipleCurrencies 
  };
};

export const useCurrencyFormatting = () => {
  const { 
    formatAmount, 
    formatAmountWithConversion, 
    formatWithCustomSymbol,
    formatWithFlag,
    formatRange,
    formatPercentageChange,
    getCurrencyDisplayConfig,
    getCurrencyColor,
    getCurrencyIcon,
    getCurrencyNameWithFlag,
  } = useCurrency();
  
  return { 
    formatAmount, 
    formatAmountWithConversion, 
    formatWithCustomSymbol,
    formatWithFlag,
    formatRange,
    formatPercentageChange,
    getCurrencyDisplayConfig,
    getCurrencyColor,
    getCurrencyIcon,
    getCurrencyNameWithFlag,
  };
};

export const useCurrencyDiscovery = () => {
  const { 
    getAllCurrencies, 
    searchCurrencies, 
    getCurrenciesByRegion,
    getPopularCurrencies,
    getCurrencyBySymbol,
    getCurrencySuggestions,
    getCurrencyInfo,
  } = useCurrency();
  
  return { 
    getAllCurrencies, 
    searchCurrencies, 
    getCurrenciesByRegion,
    getPopularCurrencies,
    getCurrencyBySymbol,
    getCurrencySuggestions,
    getCurrencyInfo,
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

export const useExchangeRateTools = () => {
  const {
    getRate,
    getReverseRate,
    getCrossRate,
    isRateStale,
    getRateHistory,
    getRateTrend,
    ratesLastUpdated,
    exchangeRates,
    getRatesAge,
  } = useCurrency();
  
  return {
    getRate,
    getReverseRate,
    getCrossRate,
    isRateStale,
    getRateHistory,
    getRateTrend,
    ratesLastUpdated,
    exchangeRates,
    ratesAge: getRatesAge(),
  };
};

export const useSubscriptionCurrency = () => {
  const {
    convertAllSubscriptions,
    calculateSubscriptionStats,
    groupSubscriptionsByCurrency,
    comparePrices,
    findBestValue,
    primaryCurrency,
  } = useCurrency();
  
  return {
    convertAllSubscriptions,
    calculateSubscriptionStats,
    groupSubscriptionsByCurrency,
    comparePrices,
    findBestValue,
    primaryCurrency,
  };
};

// Default export
export default useCurrency;