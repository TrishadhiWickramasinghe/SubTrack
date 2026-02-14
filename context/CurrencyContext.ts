import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { NetInfoState } from '@react-native-community/netinfo';

// Import services
import settingsStorage from '@services/storage/settingsStorage';
import cacheStorage from '@services/storage/cacheStorage';
import { exchangeRateApi } from '@services/api/exchangeRateApi';
import { analyticsService } from '@services/analytics/analyticsService';
import { useDebounce } from '@hooks/useDebounce';

// Type definitions
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalDigits: number;
  flag: string;
}

export interface ExchangeRates {
  [key: string]: number;
}

export interface CurrencySettings {
  primary: string;
  secondary: string;
  showSecondary: boolean;
  autoUpdateRates: boolean;
  updateFrequency: 'hourly' | 'daily' | 'weekly';
  lastUpdate: string | null;
  rates: ExchangeRates;
}

export interface FormatOptions {
  showSymbol?: boolean;
  showCode?: boolean;
  decimalPlaces?: number;
  compact?: boolean;
  locale?: string;
}

export interface FormatWithConversionOptions extends FormatOptions {
  targetCurrency?: string;
  showBoth?: boolean;
}

export interface CacheStatus {
  hasCachedRates: boolean;
  cacheAge: string | null;
  cacheSize: number;
}

export interface CurrencyState {
  // Currency settings
  primaryCurrency: string;
  secondaryCurrency: string;
  showSecondary: boolean;
  
  // Exchange rates
  exchangeRates: ExchangeRates;
  ratesLastUpdated: string | null;
  ratesSource: 'default' | 'cache' | 'settings' | 'api';
  
  // Loading states
  isLoadingRates: boolean;
  isUpdatingRates: boolean;
  
  // Network status
  isOnline: boolean;
  
  // Settings
  autoUpdateRates: boolean;
  updateFrequency: 'hourly' | 'daily' | 'weekly';
  currencyFormat: 'symbol' | 'code' | 'name';
  decimalPlaces: number;
  
  // Error handling
  error: string | null;
  
  // Cache info
  cacheStatus: CacheStatus;
}

export interface CurrencyContextType extends CurrencyState {
  // Currency information
  getCurrencyInfo: (currencyCode: string) => Currency;
  getAllCurrencies: () => Currency[];
  getRate: (currencyCode: string) => number;
  getRatesAge: () => string;
  
  // Conversion functions
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number;
  formatAmount: (amount: number, currencyCode: string, options?: FormatOptions) => string;
  formatAmountWithConversion: (amount: number, fromCurrency: string, options?: FormatWithConversionOptions) => string;
  convertSubscriptionAmounts: <T extends { amount: number; currency?: string }>(
    subscriptions: T[], 
    targetCurrency: string
  ) => Array<T & { convertedAmount: number; displayAmount: string }>;
  calculateTotalInCurrency: <T extends { amount: number; currency?: string }>(
    subscriptions: T[], 
    targetCurrency: string
  ) => number;
  
  // Settings management
  setPrimaryCurrency: (currencyCode: string) => Promise<void>;
  setSecondaryCurrency: (currencyCode: string) => Promise<void>;
  toggleSecondaryCurrency: (show?: boolean) => Promise<void>;
  setAutoUpdateRates: (enabled: boolean) => Promise<void>;
  setUpdateFrequency: (frequency: 'hourly' | 'daily' | 'weekly') => Promise<void>;
  setCurrencyFormat: (format: 'symbol' | 'code' | 'name') => Promise<void>;
  
  // Rate management
  updateExchangeRates: (baseCurrency?: string) => Promise<void>;
  
  // Cache management
  clearCurrencyCache: () => Promise<void>;
  
  // Error handling
  clearError: () => void;
}

// Supported currencies with metadata
const SUPPORTED_CURRENCIES: Currency[] = [
  // Major currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', decimalDigits: 2, flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', decimalDigits: 2, flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimalDigits: 2, flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalDigits: 0, flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalDigits: 2, flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalDigits: 2, flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalDigits: 2, flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalDigits: 2, flag: '🇨🇳' },
  
  // Asian currencies
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', decimalDigits: 2, flag: '🇱🇰' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalDigits: 2, flag: '🇮🇳' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimalDigits: 2, flag: '🇵🇰' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimalDigits: 2, flag: '🇧🇩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalDigits: 2, flag: '🇸🇬' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimalDigits: 2, flag: '🇲🇾' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', decimalDigits: 2, flag: '🇹🇭' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimalDigits: 2, flag: '🇵🇭' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', decimalDigits: 0, flag: '🇻🇳' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimalDigits: 0, flag: '🇮🇩' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimalDigits: 0, flag: '🇰🇷' },
  
  // Middle Eastern currencies
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalDigits: 2, flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimalDigits: 2, flag: '🇸🇦' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', decimalDigits: 2, flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', decimalDigits: 3, flag: '🇰🇼' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', decimalDigits: 3, flag: '🇧🇭' },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼', decimalDigits: 3, flag: '🇴🇲' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', decimalDigits: 2, flag: '🇮🇱' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimalDigits: 2, flag: '🇹🇷' },
  
  // European currencies (non-Euro)
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimalDigits: 2, flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimalDigits: 2, flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimalDigits: 2, flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', decimalDigits: 2, flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimalDigits: 2, flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimalDigits: 0, flag: '🇭🇺' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', decimalDigits: 2, flag: '🇷🇴' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', decimalDigits: 2, flag: '🇧🇬' },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', decimalDigits: 0, flag: '🇮🇸' },
  
  // African currencies
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimalDigits: 2, flag: '🇿🇦' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', decimalDigits: 2, flag: '🇪🇬' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimalDigits: 2, flag: '🇳🇬' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', decimalDigits: 2, flag: '🇰🇪' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', decimalDigits: 2, flag: '🇬🇭' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', decimalDigits: 2, flag: '🇲🇦' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', decimalDigits: 3, flag: '🇹🇳' },
  
  // South American currencies
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimalDigits: 2, flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimalDigits: 2, flag: '🇲🇽' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', decimalDigits: 2, flag: '🇦🇷' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', decimalDigits: 0, flag: '🇨🇱' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', decimalDigits: 0, flag: '🇨🇴' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', decimalDigits: 2, flag: '🇵🇪' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$', decimalDigits: 2, flag: '🇺🇾' },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs', decimalDigits: 2, flag: '🇻🇪' },
  
  // Oceanian currencies
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimalDigits: 2, flag: '🇳🇿' },
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', decimalDigits: 2, flag: '🇫🇯' },
  { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', decimalDigits: 2, flag: '🇵🇬' },
];

// Default exchange rates (fallback when offline)
const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150,
  AUD: 1.52,
  CAD: 1.35,
  CHF: 0.89,
  CNY: 7.23,
  LKR: 300,
  INR: 83,
  PKR: 278,
  BDT: 109,
  SGD: 1.34,
  MYR: 4.69,
  THB: 35.5,
  PHP: 56.5,
  VND: 25400,
  IDR: 15600,
  KRW: 1350,
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.38,
  ILS: 3.68,
  TRY: 31.5,
  SEK: 10.5,
  NOK: 10.8,
  DKK: 6.9,
  PLN: 4.0,
  CZK: 23.5,
  HUF: 365,
  RON: 4.6,
  BGN: 1.8,
  ISK: 138,
  ZAR: 18.7,
  EGP: 47.5,
  NGN: 1550,
  KES: 145,
  GHS: 14.5,
  MAD: 10.1,
  TND: 3.1,
  BRL: 5.05,
  MXN: 16.8,
  ARS: 870,
  CLP: 970,
  COP: 3900,
  PEN: 3.75,
  UYU: 38.5,
  VES: 36.3,
  NZD: 1.66,
  FJD: 2.23,
  PGK: 3.78,
};

// Initial state
const initialState: CurrencyState = {
  primaryCurrency: 'USD',
  secondaryCurrency: 'LKR',
  showSecondary: false,
  exchangeRates: DEFAULT_EXCHANGE_RATES,
  ratesLastUpdated: null,
  ratesSource: 'default',
  isLoadingRates: false,
  isUpdatingRates: false,
  isOnline: true,
  autoUpdateRates: true,
  updateFrequency: 'daily',
  currencyFormat: 'symbol',
  decimalPlaces: 2,
  error: null,
  cacheStatus: {
    hasCachedRates: false,
    cacheAge: null,
    cacheSize: 0,
  },
};

// Create context
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Custom hook to use currency context
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Helper hooks for common currency operations
export const useCurrencyConversion = () => {
  const { convertAmount, formatAmount } = useCurrency();
  return { convertAmount, formatAmount };
};

export const useCurrencySettings = () => {
  const { 
    primaryCurrency, 
    secondaryCurrency, 
    showSecondary,
    setPrimaryCurrency,
    setSecondaryCurrency,
    toggleSecondaryCurrency 
  } = useCurrency();
  
  return {
    primaryCurrency,
    secondaryCurrency,
    showSecondary,
    setPrimaryCurrency,
    setSecondaryCurrency,
    toggleSecondaryCurrency,
  };
};

export const useExchangeRates = () => {
  const { 
    exchangeRates, 
    ratesLastUpdated, 
    ratesSource,
    updateExchangeRates,
    getRatesAge 
  } = useCurrency();
  
  return {
    exchangeRates,
    ratesLastUpdated,
    ratesSource,
    updateExchangeRates,
    ratesAge: getRatesAge(),
  };
};

interface CurrencyProviderProps {
  children: ReactNode;
}

// Main provider component
export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }): React.ReactElement => {
  const [state, setState] = useState<CurrencyState>(initialState);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const debouncedPrimaryCurrency = useDebounce(state.primaryCurrency, 1000);

  /**
   * INITIALIZATION
   */
  useEffect(() => {
    initializeCurrency();
    
    // Set up app state listener
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Set up network listener
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);
    
    return () => {
      appStateSubscription.remove();
      unsubscribe();
    };
  }, []);

  // Auto-update rates when primary currency changes
  useEffect(() => {
    if (debouncedPrimaryCurrency && state.autoUpdateRates) {
      updateExchangeRates(debouncedPrimaryCurrency);
    }
  }, [debouncedPrimaryCurrency]);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    setAppState(nextAppState);
    
    if (nextAppState === 'active' && appState.match(/inactive|background/)) {
      // App came to foreground, update rates if needed
      if (state.autoUpdateRates) {
        checkAndUpdateRates();
      }
    }
  }, [appState, state.autoUpdateRates]);

  const handleNetworkChange = useCallback((networkState: NetInfoState) => {
    const isOnline = networkState.isConnected ?? false;
    
    setState(prev => ({ ...prev, isOnline }));
    
    // Update rates when connection is restored
    if (isOnline && !state.isOnline) {
      handleConnectionRestored();
    }
  }, [state.isOnline]);

  const initializeCurrency = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoadingRates: true }));
      
      // Load settings
      const settings = await settingsStorage.getSettings();
      const currencySettings = settings.currency;
      
      // Load cached rates
      const cachedRates = await cacheStorage.getCachedExchangeRates(currencySettings.primary);
      
      // Determine which rates to use
      let exchangeRates = DEFAULT_EXCHANGE_RATES;
      let ratesSource: CurrencyState['ratesSource'] = 'default';
      let ratesLastUpdated = currencySettings.lastUpdate;
      
      if (cachedRates) {
        exchangeRates = cachedRates;
        ratesSource = 'cache';
        
        // Update cache status
        const cacheAge = ratesLastUpdated 
          ? getTimeSince(ratesLastUpdated)
          : null;
        
        setState(prev => ({
          ...prev,
          cacheStatus: {
            hasCachedRates: true,
            cacheAge,
            cacheSize: JSON.stringify(cachedRates).length,
          },
        }));
      } else if (currencySettings.rates && Object.keys(currencySettings.rates).length > 0) {
        exchangeRates = currencySettings.rates;
        ratesSource = 'settings';
      }
      
      // Load user preferences
      const userPreferences = settings.preferences;
      
      setState(prev => ({
        ...prev,
        primaryCurrency: currencySettings.primary,
        secondaryCurrency: currencySettings.secondary,
        showSecondary: currencySettings.showSecondary,
        exchangeRates,
        ratesLastUpdated,
        ratesSource,
        autoUpdateRates: currencySettings.autoUpdateRates,
        updateFrequency: currencySettings.updateFrequency,
        currencyFormat: userPreferences.currencyFormat || 'symbol',
        decimalPlaces: userPreferences.showDecimals ? 2 : 0,
        isLoadingRates: false,
      }));
      
      // Update rates if needed
      if (shouldUpdateRates(currencySettings)) {
        updateExchangeRates(currencySettings.primary);
      }
      
      // Track initialization
      await analyticsService.trackEvent('currency_initialized', {
        primaryCurrency: currencySettings.primary,
        ratesSource,
      });
      
    } catch (error) {
      console.error('Error initializing currency:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to initialize currency settings',
        isLoadingRates: false,
      }));
      
      await analyticsService.trackEvent('currency_init_error', {
        error: (error as Error).message,
      });
    }
  }, []);

  const getTimeSince = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const shouldUpdateRates = useCallback((currencySettings: CurrencySettings): boolean => {
    if (!currencySettings.autoUpdateRates) return false;
    if (!state.isOnline) return false;
    
    const lastUpdate = currencySettings.lastUpdate;
    if (!lastUpdate) return true;
    
    const now = new Date();
    const lastUpdateDate = new Date(lastUpdate);
    const hoursSinceUpdate = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60);
    
    switch (currencySettings.updateFrequency) {
      case 'hourly':
        return hoursSinceUpdate >= 1;
      case 'daily':
        return hoursSinceUpdate >= 24;
      case 'weekly':
        return hoursSinceUpdate >= 168;
      default:
        return hoursSinceUpdate >= 24;
    }
  }, [state.isOnline]);

  const checkAndUpdateRates = useCallback(async () => {
    try {
      const settings = await settingsStorage.getSettings();
      if (shouldUpdateRates(settings.currency)) {
        await updateExchangeRates();
      }
    } catch (error) {
      console.error('Error checking rates update:', error);
    }
  }, [shouldUpdateRates]);

  const handleConnectionRestored = useCallback(async () => {
    if (state.autoUpdateRates) {
      await updateExchangeRates();
    }
  }, [state.autoUpdateRates]);

  /**
   * EXCHANGE RATE MANAGEMENT
   */
  const updateExchangeRates = useCallback(async (baseCurrency: string = state.primaryCurrency) => {
    if (!state.isOnline) {
      setState(prev => ({ 
        ...prev, 
        error: 'Cannot update rates while offline',
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isUpdatingRates: true, error: null }));
      
      let rates: ExchangeRates;
      let source: CurrencyState['ratesSource'] = 'api';
      
      // Try to fetch from API
      try {
        rates = await exchangeRateApi.getLatestRates(baseCurrency);
        
        // Save to cache
        await cacheStorage.cacheExchangeRates(baseCurrency, rates);
        
        // Update settings
        await settingsStorage.updateExchangeRates(rates);
        await settingsStorage.setLastExchangeRateUpdate();
        
        // Update cache status
        setState(prev => ({
          ...prev,
          cacheStatus: {
            hasCachedRates: true,
            cacheAge: 'Just now',
            cacheSize: JSON.stringify(rates).length,
          },
        }));
        
        // Track analytics
        await analyticsService.trackEvent('exchange_rates_updated', {
          source: 'api',
          baseCurrency,
          ratesCount: Object.keys(rates).length,
        });
        
      } catch (apiError) {
        console.warn('Failed to fetch exchange rates from API:', apiError);
        source = 'cache';
        
        // Fall back to cached rates
        rates = await cacheStorage.getCachedExchangeRates(baseCurrency) || 
                state.exchangeRates;
        
        await analyticsService.trackEvent('exchange_rates_fallback', {
          source: 'cache',
          baseCurrency,
          error: (apiError as Error).message,
        });
      }
      
      const now = new Date().toISOString();
      
      setState(prev => ({
        ...prev,
        exchangeRates: rates,
        ratesSource: source,
        ratesLastUpdated: now,
        isUpdatingRates: false,
      }));
      
    } catch (error) {
      console.error('Error updating exchange rates:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to update exchange rates',
        isUpdatingRates: false,
      }));
      
      await analyticsService.trackEvent('exchange_rates_error', {
        error: (error as Error).message,
        baseCurrency,
      });
    }
  }, [state.primaryCurrency, state.isOnline, state.exchangeRates]);

  /**
   * CURRENCY CONVERSION
   */
  const convertAmount = useCallback((amount: number, fromCurrency: string, toCurrency: string): number => {
    try {
      if (!amount || amount === 0) return 0;
      if (fromCurrency === toCurrency) return amount;
      
      const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(amountNum)) return 0;
      
      // Get rates
      const fromRate = state.exchangeRates[fromCurrency];
      const toRate = state.exchangeRates[toCurrency];
      
      if (!fromRate || !toRate) {
        console.warn(`Missing exchange rate for ${fromCurrency} or ${toCurrency}`);
        return amountNum;
      }
      
      // Convert to base currency (USD) first
      const amountInBase = amountNum / fromRate;
      
      // Then convert to target currency
      let convertedAmount = amountInBase * toRate;
      
      // Round to appropriate decimal places
      const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === toCurrency);
      const decimalDigits = currencyInfo?.decimalDigits || 2;
      const multiplier = Math.pow(10, decimalDigits);
      
      return Math.round(convertedAmount * multiplier) / multiplier;
      
    } catch (error) {
      console.error('Error converting amount:', error);
      return amount;
    }
  }, [state.exchangeRates]);

  const formatAmount = useCallback((amount: number, currencyCode: string, options: FormatOptions = {}): string => {
    try {
      const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
      if (!currencyInfo) {
        return `${amount} ${currencyCode}`;
      }
      
      const {
        showSymbol = state.currencyFormat === 'symbol',
        showCode = state.currencyFormat === 'code',
        decimalPlaces = state.decimalPlaces,
        compact = false,
        locale = 'en-US',
      } = options;
      
      let formattedAmount: string;
      const absAmount = Math.abs(amount);
      const sign = amount < 0 ? '-' : '';
      
      // Handle compact notation (1K, 1M, etc.)
      if (compact && absAmount >= 1000) {
        const suffixes = ['', 'K', 'M', 'B', 'T'];
        const tier = Math.floor(Math.log10(absAmount) / 3);
        
        if (tier > 0 && tier < suffixes.length) {
          const scaled = absAmount / Math.pow(1000, tier);
          formattedAmount = scaled.toFixed(1) + suffixes[tier];
        } else {
          formattedAmount = absAmount.toLocaleString(locale, {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          });
        }
      } else {
        formattedAmount = absAmount.toLocaleString(locale, {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        });
      }
      
      // Add sign back
      formattedAmount = sign + formattedAmount;
      
      // Build the formatted string
      let result = '';
      
      if (showSymbol) {
        result += currencyInfo.symbol;
      }
      
      result += formattedAmount;
      
      if (showCode && !showSymbol) {
        result += ` ${currencyInfo.code}`;
      }
      
      return result;
      
    } catch (error) {
      console.error('Error formatting amount:', error);
      return `${amount} ${currencyCode}`;
    }
  }, [state.currencyFormat, state.decimalPlaces]);

  const formatAmountWithConversion = useCallback((
    amount: number, 
    fromCurrency: string, 
    options: FormatWithConversionOptions = {}
  ): string => {
    const {
      targetCurrency = state.showSecondary ? state.secondaryCurrency : state.primaryCurrency,
      showBoth = state.showSecondary,
      ...formatOptions
    } = options;
    
    // Convert amount
    const convertedAmount = convertAmount(amount, fromCurrency, targetCurrency);
    
    // Format primary amount
    const primaryFormatted = formatAmount(amount, fromCurrency, formatOptions);
    
    if (!showBoth || fromCurrency === targetCurrency) {
      return primaryFormatted;
    }
    
    // Format secondary amount
    const secondaryFormatted = formatAmount(convertedAmount, targetCurrency, formatOptions);
    
    return `${primaryFormatted} (≈ ${secondaryFormatted})`;
  }, [state.primaryCurrency, state.secondaryCurrency, state.showSecondary, convertAmount, formatAmount]);

  const convertSubscriptionAmounts = useCallback(<T extends { amount: number; currency?: string }>(
    subscriptions: T[], 
    targetCurrency: string
  ): Array<T & { convertedAmount: number; displayAmount: string }> => {
    return subscriptions.map(subscription => ({
      ...subscription,
      convertedAmount: convertAmount(
        subscription.amount,
        subscription.currency || state.primaryCurrency,
        targetCurrency
      ),
      displayAmount: formatAmountWithConversion(
        subscription.amount,
        subscription.currency || state.primaryCurrency,
        { targetCurrency }
      ),
    }));
  }, [convertAmount, formatAmountWithConversion, state.primaryCurrency]);

  const calculateTotalInCurrency = useCallback(<T extends { amount: number; currency?: string }>(
    subscriptions: T[], 
    targetCurrency: string
  ): number => {
    return subscriptions.reduce((total, subscription) => {
      const amount = convertAmount(
        subscription.amount,
        subscription.currency || state.primaryCurrency,
        targetCurrency
      );
      return total + (amount || 0);
    }, 0);
  }, [convertAmount, state.primaryCurrency]);

  /**
   * CURRENCY SETTINGS MANAGEMENT
   */
  const setPrimaryCurrency = useCallback(async (currencyCode: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoadingRates: true }));
      
      // Validate currency code
      if (!SUPPORTED_CURRENCIES.some(c => c.code === currencyCode)) {
        throw new Error(`Unsupported currency: ${currencyCode}`);
      }
      
      // Update settings
      await settingsStorage.setPrimaryCurrency(currencyCode);
      
      setState(prev => ({
        ...prev,
        primaryCurrency: currencyCode,
        isLoadingRates: false,
      }));
      
      // Track analytics
      await analyticsService.trackEvent('primary_currency_changed', {
        newCurrency: currencyCode,
      });
      
    } catch (error) {
      console.error('Error setting primary currency:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to set primary currency',
        isLoadingRates: false,
      }));
    }
  }, []);

  const setSecondaryCurrency = useCallback(async (currencyCode: string): Promise<void> => {
    try {
      // Validate currency code
      if (!SUPPORTED_CURRENCIES.some(c => c.code === currencyCode)) {
        throw new Error(`Unsupported currency: ${currencyCode}`);
      }
      
      await settingsStorage.setSecondaryCurrency(currencyCode);
      
      setState(prev => ({
        ...prev,
        secondaryCurrency: currencyCode,
      }));
      
      // Track analytics
      await analyticsService.trackEvent('secondary_currency_changed', {
        newCurrency: currencyCode,
      });
      
    } catch (error) {
      console.error('Error setting secondary currency:', error);
      setState(prev => ({ ...prev, error: 'Failed to set secondary currency' }));
    }
  }, []);

  const toggleSecondaryCurrency = useCallback(async (show?: boolean): Promise<void> => {
    try {
      const newShowState = show !== undefined ? show : !state.showSecondary;
      await settingsStorage.toggleSecondaryCurrency(newShowState);
      
      setState(prev => ({
        ...prev,
        showSecondary: newShowState,
      }));
      
      // Track analytics
      await analyticsService.trackEvent('secondary_currency_toggled', {
        enabled: newShowState,
      });
      
    } catch (error) {
      console.error('Error toggling secondary currency:', error);
      setState(prev => ({ ...prev, error: 'Failed to toggle secondary currency' }));
    }
  }, [state.showSecondary]);

  const setAutoUpdateRates = useCallback(async (enabled: boolean): Promise<void> => {
    try {
      await settingsStorage.updateSetting('currency.autoUpdateRates', enabled);
      
      setState(prev => ({
        ...prev,
        autoUpdateRates: enabled,
      }));
      
      // If enabling, update rates immediately
      if (enabled && state.isOnline) {
        await updateExchangeRates();
      }
      
    } catch (error) {
      console.error('Error setting auto-update:', error);
      setState(prev => ({ ...prev, error: 'Failed to set auto-update' }));
    }
  }, [state.isOnline, updateExchangeRates]);

  const setUpdateFrequency = useCallback(async (frequency: 'hourly' | 'daily' | 'weekly'): Promise<void> => {
    try {
      await settingsStorage.updateSetting('currency.updateFrequency', frequency);
      
      setState(prev => ({
        ...prev,
        updateFrequency: frequency,
      }));
      
    } catch (error) {
      console.error('Error setting update frequency:', error);
      setState(prev => ({ ...prev, error: 'Failed to set update frequency' }));
    }
  }, []);

  const setCurrencyFormat = useCallback(async (format: 'symbol' | 'code' | 'name'): Promise<void> => {
    try {
      await settingsStorage.updateSetting('preferences.currencyFormat', format);
      
      setState(prev => ({
        ...prev,
        currencyFormat: format,
      }));
      
    } catch (error) {
      console.error('Error setting currency format:', error);
      setState(prev => ({ ...prev, error: 'Failed to set currency format' }));
    }
  }, []);

  /**
   * CACHE MANAGEMENT
   */
  const clearCurrencyCache = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoadingRates: true }));
      
      // Clear cached rates
      await cacheStorage.clearByPrefix('exchange_rates_');
      await cacheStorage.clearByPrefix('conversion_');
      
      // Reset to default rates
      setState(prev => ({
        ...prev,
        exchangeRates: DEFAULT_EXCHANGE_RATES,
        ratesSource: 'default',
        ratesLastUpdated: null,
        cacheStatus: {
          hasCachedRates: false,
          cacheAge: null,
          cacheSize: 0,
        },
        isLoadingRates: false,
      }));
      
      // Fetch fresh rates if online
      if (state.isOnline) {
        await updateExchangeRates();
      }
      
     