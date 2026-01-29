// src/types/currency.ts

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
  primaryCurrency: string;
  secondaryCurrency: string;
  showSecondary: boolean;
  exchangeRates: ExchangeRates;
  ratesLastUpdated: string | null;
  ratesSource: 'default' | 'cache' | 'settings' | 'api';
  isLoadingRates: boolean;
  isUpdatingRates: boolean;
  isOnline: boolean;
  autoUpdateRates: boolean;
  updateFrequency: 'hourly' | 'daily' | 'weekly';
  currencyFormat: 'symbol' | 'code' | 'name';
  decimalPlaces: number;
  error: string | null;
  cacheStatus: CacheStatus;
}

export interface CurrencyContextType extends CurrencyState {
  getCurrencyInfo: (currencyCode: string) => Currency;
  getAllCurrencies: () => Currency[];
  getRate: (currencyCode: string) => number;
  getRatesAge: () => string;
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
  setPrimaryCurrency: (currencyCode: string) => Promise<void>;
  setSecondaryCurrency: (currencyCode: string) => Promise<void>;
  toggleSecondaryCurrency: (show?: boolean) => Promise<void>;
  setAutoUpdateRates: (enabled: boolean) => Promise<void>;
  setUpdateFrequency: (frequency: 'hourly' | 'daily' | 'weekly') => Promise<void>;
  setCurrencyFormat: (format: 'symbol' | 'code' | 'name') => Promise<void>;
  updateExchangeRates: (baseCurrency?: string) => Promise<void>;
  clearCurrencyCache: () => Promise<void>;
  clearError: () => void;
}