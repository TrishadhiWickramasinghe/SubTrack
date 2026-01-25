/**
 * Currency Helper Utilities for SubTrack
 * Comprehensive currency conversion, formatting, and calculation functions
 */

import axios from 'axios';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV for fast storage
const currencyStorage = new MMKV();

// Currency configuration
export const CURRENCY_CONFIG = {
  // Major currencies with symbols and formatting
  USD: { symbol: '$', name: 'US Dollar', decimalDigits: 2, symbolPosition: 'before' },
  EUR: { symbol: '€', name: 'Euro', decimalDigits: 2, symbolPosition: 'before' },
  GBP: { symbol: '£', name: 'British Pound', decimalDigits: 2, symbolPosition: 'before' },
  JPY: { symbol: '¥', name: 'Japanese Yen', decimalDigits: 0, symbolPosition: 'before' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', decimalDigits: 2, symbolPosition: 'before' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', decimalDigits: 2, symbolPosition: 'before' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', decimalDigits: 2, symbolPosition: 'after' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', decimalDigits: 2, symbolPosition: 'before' },
  INR: { symbol: '₹', name: 'Indian Rupee', decimalDigits: 2, symbolPosition: 'before' },
  LKR: { symbol: 'Rs', name: 'Sri Lankan Rupee', decimalDigits: 2, symbolPosition: 'before' },
  PKR: { symbol: '₨', name: 'Pakistani Rupee', decimalDigits: 2, symbolPosition: 'before' },
  BDT: { symbol: '৳', name: 'Bangladeshi Taka', decimalDigits: 2, symbolPosition: 'before' },
  NPR: { symbol: 'Rs', name: 'Nepalese Rupee', decimalDigits: 2, symbolPosition: 'before' },
  MVR: { symbol: 'Rf', name: 'Maldivian Rufiyaa', decimalDigits: 2, symbolPosition: 'before' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', decimalDigits: 2, symbolPosition: 'before' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', decimalDigits: 2, symbolPosition: 'before' },
  THB: { symbol: '฿', name: 'Thai Baht', decimalDigits: 2, symbolPosition: 'before' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', decimalDigits: 0, symbolPosition: 'before' },
  KRW: { symbol: '₩', name: 'South Korean Won', decimalDigits: 0, symbolPosition: 'before' },
  RUB: { symbol: '₽', name: 'Russian Ruble', decimalDigits: 2, symbolPosition: 'after' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', decimalDigits: 2, symbolPosition: 'before' },
  ZAR: { symbol: 'R', name: 'South African Rand', decimalDigits: 2, symbolPosition: 'before' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', decimalDigits: 2, symbolPosition: 'before' },
  SAR: { symbol: '﷼', name: 'Saudi Riyal', decimalDigits: 2, symbolPosition: 'before' },
};

// Free exchange rate API endpoints
export const EXCHANGE_RATE_APIS = {
  EXCHANGERATE_API: 'https://api.exchangerate-api.com/v4/latest/',
  FRANKFURTER: 'https://api.frankfurter.app/latest',
  EXCHANGERATE_HOST: 'https://api.exchangerate.host/latest',
  CURRENCY_API: 'https://free.currconv.com/api/v7/convert', // Requires API key
};

// Storage keys
const STORAGE_KEYS = {
  EXCHANGE_RATES: 'currency_exchange_rates',
  LAST_UPDATED: 'currency_last_updated',
  DEFAULT_CURRENCY: 'default_currency',
  CURRENCY_HISTORY: 'currency_history',
};

/**
 * Currency Helper Class
 */
export class CurrencyHelper {
  constructor() {
    this.exchangeRates = {};
    this.baseCurrency = 'USD';
    this.lastUpdated = null;
    this.cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  /**
   * Initialize currency helper
   */
  async initialize(baseCurrency = 'USD') {
    try {
      this.baseCurrency = baseCurrency;
      
      // Load cached rates
      await this.loadCachedRates();
      
      // Check if rates need updating
      const shouldUpdate = !this.lastUpdated || 
                          (Date.now() - new Date(this.lastUpdated).getTime()) > this.cacheDuration;
      
      if (shouldUpdate) {
        await this.fetchLatestRates();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize currency helper:', error);
      return false;
    }
  }

  /**
   * Load cached exchange rates from storage
   */
  async loadCachedRates() {
    try {
      const cachedRates = currencyStorage.getString(STORAGE_KEYS.EXCHANGE_RATES);
      const lastUpdated = currencyStorage.getString(STORAGE_KEYS.LAST_UPDATED);
      
      if (cachedRates && lastUpdated) {
        this.exchangeRates = JSON.parse(cachedRates);
        this.lastUpdated = lastUpdated;
        console.log('Loaded cached exchange rates from', this.lastUpdated);
      }
    } catch (error) {
      console.error('Error loading cached rates:', error);
    }
  }

  /**
   * Fetch latest exchange rates from API
   */
  async fetchLatestRates(baseCurrency = null) {
    try {
      const base = baseCurrency || this.baseCurrency;
      
      // Try multiple API endpoints for redundancy
      let rates = null;
      
      // Try ExchangeRate-API first
      try {
        const response = await axios.get(`${EXCHANGE_RATE_APIS.EXCHANGERATE_API}${base}`);
        if (response.data && response.data.rates) {
          rates = response.data.rates;
          console.log('Fetched rates from ExchangeRate-API');
        }
      } catch (error) {
        console.warn('ExchangeRate-API failed, trying Frankfurter...');
      }
      
      // Try Frankfurter if first failed
      if (!rates) {
        try {
          const response = await axios.get(EXCHANGE_RATE_APIS.FRANKFURTER, {
            params: { base }
          });
          if (response.data && response.data.rates) {
            rates = response.data.rates;
            console.log('Fetched rates from Frankfurter');
          }
        } catch (error) {
          console.warn('Frankfurter failed, trying ExchangeRate.host...');
        }
      }
      
      // Try ExchangeRate.host if others failed
      if (!rates) {
        try {
          const response = await axios.get(EXCHANGE_RATE_APIS.EXCHANGERATE_HOST, {
            params: { base }
          });
          if (response.data && response.data.rates) {
            rates = response.data.rates;
            console.log('Fetched rates from ExchangeRate.host');
          }
        } catch (error) {
          console.error('All exchange rate APIs failed');
          throw new Error('Failed to fetch exchange rates');
        }
      }
      
      // Add base currency with rate 1
      rates[base] = 1;
      
      // Update instance and cache
      this.exchangeRates = rates;
      this.lastUpdated = new Date().toISOString();
      this.baseCurrency = base;
      
      // Save to cache
      await this.saveToCache();
      
      console.log('Exchange rates updated successfully');
      return rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw error;
    }
  }

  /**
   * Save rates to cache
   */
  async saveToCache() {
    try {
      currencyStorage.set(STORAGE_KEYS.EXCHANGE_RATES, JSON.stringify(this.exchangeRates));
      currencyStorage.set(STORAGE_KEYS.LAST_UPDATED, this.lastUpdated);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  /**
   * Convert amount from one currency to another
   */
  convert(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    
    // Get exchange rates
    const fromRate = this.exchangeRates[fromCurrency];
    const toRate = this.exchangeRates[toCurrency];
    
    if (!fromRate || !toRate) {
      console.warn(`Missing exchange rates for ${fromCurrency} or ${toCurrency}`);
      return amount; // Return original amount if rates not available
    }
    
    // Convert to base currency first, then to target currency
    const amountInBase = amount / fromRate;
    const convertedAmount = amountInBase * toRate;
    
    return convertedAmount;
  }

  /**
   * Convert and format amount
   */
  convertAndFormat(amount, fromCurrency, toCurrency, options = {}) {
    const convertedAmount = this.convert(amount, fromCurrency, toCurrency);
    return this.formatCurrency(convertedAmount, toCurrency, options);
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount, currency = 'USD', options = {}) {
    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
    const {
      showSymbol = true,
      decimalDigits = config.decimalDigits,
      useGrouping = true,
      locale = 'en-US',
      compact = false,
    } = options;
    
    let formattedAmount;
    
    if (compact && amount >= 1000) {
      // Compact formatting for large numbers
      const formatter = Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
      formattedAmount = formatter.format(amount);
    } else {
      // Regular formatting
      const formatter = Intl.NumberFormat(locale, {
        minimumFractionDigits: decimalDigits,
        maximumFractionDigits: decimalDigits,
        useGrouping: useGrouping,
      });
      formattedAmount = formatter.format(amount);
    }
    
    // Add currency symbol
    if (showSymbol && config.symbol) {
      if (config.symbolPosition === 'before') {
        return `${config.symbol}${formattedAmount}`;
      } else {
        return `${formattedAmount} ${config.symbol}`;
      }
    }
    
    return formattedAmount;
  }

  /**
   * Parse currency string to number
   */
  parseCurrency(currencyString, currency = 'USD') {
    if (!currencyString || typeof currencyString !== 'string') {
      return 0;
    }
    
    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
    const symbol = config.symbol;
    
    // Remove currency symbol and thousands separators
    let cleanString = currencyString.trim();
    
    // Remove symbol
    if (symbol) {
      cleanString = cleanString.replace(new RegExp(`\\${symbol}`, 'g'), '');
    }
    
    // Remove thousands separators (commas or spaces depending on locale)
    cleanString = cleanString.replace(/,/g, '');
    
    // Parse to number
    const amount = parseFloat(cleanString);
    
    return isNaN(amount) ? 0 : amount;
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies() {
    return Object.entries(CURRENCY_CONFIG).map(([code, config]) => ({
      code,
      symbol: config.symbol,
      name: config.name,
      decimalDigits: config.decimalDigits,
      symbolPosition: config.symbolPosition,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get currency info
   */
  getCurrencyInfo(currencyCode) {
    return CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  }

  /**
   * Calculate total amount for array of items with different currencies
   */
  calculateTotal(items, targetCurrency = 'USD') {
    return items.reduce((total, item) => {
      const amount = item.amount || 0;
      const currency = item.currency || 'USD';
      
      if (currency === targetCurrency) {
        return total + amount;
      }
      
      const convertedAmount = this.convert(amount, currency, targetCurrency);
      return total + convertedAmount;
    }, 0);
  }

  /**
   * Calculate monthly amount from different billing cycles
   */
  calculateMonthlyAmount(amount, billingCycle, customDays = 30) {
    switch (billingCycle) {
      case 'daily':
        return amount * 30.44; // Average days in month
      case 'weekly':
        return amount * 4.345; // Average weeks in month
      case 'biweekly':
        return amount * 2.1725; // Every 2 weeks
      case 'monthly':
        return amount;
      case 'bimonthly':
        return amount / 2;
      case 'quarterly':
        return amount / 3;
      case 'semiannually':
        return amount / 6;
      case 'annually':
        return amount / 12;
      case 'custom':
        return (amount / customDays) * 30.44;
      default:
        return amount;
    }
  }

  /**
   * Calculate yearly amount from different billing cycles
   */
  calculateYearlyAmount(amount, billingCycle, customDays = 30) {
    switch (billingCycle) {
      case 'daily':
        return amount * 365;
      case 'weekly':
        return amount * 52;
      case 'biweekly':
        return amount * 26;
      case 'monthly':
        return amount * 12;
      case 'bimonthly':
        return amount * 6;
      case 'quarterly':
        return amount * 4;
      case 'semiannually':
        return amount * 2;
      case 'annually':
        return amount;
      case 'custom':
        return (amount / customDays) * 365;
      default:
        return amount * 12;
    }
  }

  /**
   * Calculate savings percentage
   */
  calculateSavingsPercentage(originalAmount, newAmount) {
    if (originalAmount <= 0) return 0;
    
    const savings = originalAmount - newAmount;
    const percentage = (savings / originalAmount) * 100;
    
    return Math.round(percentage * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate tax amount
   */
  calculateTaxAmount(amount, taxRate) {
    return amount * (taxRate / 100);
  }

  /**
   * Calculate amount with tax
   */
  calculateAmountWithTax(amount, taxRate) {
    const taxAmount = this.calculateTaxAmount(amount, taxRate);
    return amount + taxAmount;
  }

  /**
   * Split amount among participants
   */
  splitAmount(amount, participants, options = {}) {
    const { currency = 'USD', roundTo = 2, equalSplit = true } = options;
    
    if (participants <= 0) return [];
    
    if (equalSplit) {
      const share = amount / participants;
      const roundedShare = this.round(share, roundTo);
      
      // Adjust last share to account for rounding
      const shares = new Array(participants).fill(roundedShare);
      const total = shares.reduce((sum, s) => sum + s, 0);
      const difference = amount - total;
      
      if (difference !== 0) {
        shares[shares.length - 1] = this.round(shares[shares.length - 1] + difference, roundTo);
      }
      
      return shares;
    } else {
      // For unequal splits, you would pass custom percentages or amounts
      // This is a placeholder for custom split logic
      return [];
    }
  }

  /**
   * Round number to specified decimal places
   */
  round(number, decimalPlaces = 2) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(number * factor) / factor;
  }

  /**
   * Format percentage
   */
  formatPercentage(value, decimalPlaces = 1) {
    return `${this.round(value, decimalPlaces)}%`;
  }

  /**
   * Check if rates are stale
   */
  areRatesStale() {
    if (!this.lastUpdated) return true;
    
    const now = Date.now();
    const lastUpdate = new Date(this.lastUpdated).getTime();
    const age = now - lastUpdate;
    
    return age > this.cacheDuration;
  }

  /**
   * Get exchange rate history (if available)
   */
  async getExchangeRateHistory(baseCurrency, targetCurrency, days = 30) {
    try {
      // This would typically call a historical rates API
      // For now, return mock data or implement with a real API
      console.log(`Getting ${days} days of history for ${baseCurrency} to ${targetCurrency}`);
      
      // Placeholder - implement with real API if needed
      return [];
    } catch (error) {
      console.error('Error getting exchange rate history:', error);
      return [];
    }
  }
}

/**
 * Convenience functions for common currency operations
 */

// Create singleton instance
const currencyHelper = new CurrencyHelper();

// Initialize helper (call this early in your app)
export const initCurrencyHelper = async (baseCurrency = 'USD') => {
  return await currencyHelper.initialize(baseCurrency);
};

// Export convenience functions
export const formatCurrency = (amount, currency = 'USD', options = {}) => {
  return currencyHelper.formatCurrency(amount, currency, options);
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  return currencyHelper.convert(amount, fromCurrency, toCurrency);
};

export const convertAndFormat = (amount, fromCurrency, toCurrency, options = {}) => {
  return currencyHelper.convertAndFormat(amount, fromCurrency, toCurrency, options);
};

export const getSupportedCurrencies = () => {
  return currencyHelper.getSupportedCurrencies();
};

export const calculateMonthlyAmount = (amount, billingCycle, customDays = 30) => {
  return currencyHelper.calculateMonthlyAmount(amount, billingCycle, customDays);
};

export const calculateYearlyAmount = (amount, billingCycle, customDays = 30) => {
  return currencyHelper.calculateYearlyAmount(amount, billingCycle, customDays);
};

export const calculateTotal = (items, targetCurrency = 'USD') => {
  return currencyHelper.calculateTotal(items, targetCurrency);
};

export const formatPercentage = (value, decimalPlaces = 1) => {
  return currencyHelper.formatPercentage(value, decimalPlaces);
};

export const roundCurrency = (amount, decimalPlaces = 2) => {
  return currencyHelper.round(amount, decimalPlaces);
};

// Export the helper instance for advanced usage
export default currencyHelper;