/**
 * Currencies Configuration for SubTrack
 * Comprehensive currency data with formatting and conversion support
 */

// Base currency codes and information
export const Currency = {
  USD: 'USD', // United States Dollar
  EUR: 'EUR', // Euro
  GBP: 'GBP', // British Pound Sterling
  JPY: 'JPY', // Japanese Yen
  AUD: 'AUD', // Australian Dollar
  CAD: 'CAD', // Canadian Dollar
  CHF: 'CHF', // Swiss Franc
  CNY: 'CNY', // Chinese Yuan
  INR: 'INR', // Indian Rupee
  LKR: 'LKR', // Sri Lankan Rupee
  PKR: 'PKR', // Pakistani Rupee
  BDT: 'BDT', // Bangladeshi Taka
  NPR: 'NPR', // Nepalese Rupee
  MVR: 'MVR', // Maldivian Rufiyaa
  SGD: 'SGD', // Singapore Dollar
  MYR: 'MYR', // Malaysian Ringgit
  THB: 'THB', // Thai Baht
  IDR: 'IDR', // Indonesian Rupiah
  KRW: 'KRW', // South Korean Won
  RUB: 'RUB', // Russian Ruble
  BRL: 'BRL', // Brazilian Real
  ZAR: 'ZAR', // South African Rand
  AED: 'AED', // UAE Dirham
  SAR: 'SAR', // Saudi Riyal
  QAR: 'QAR', // Qatari Riyal
  KWD: 'KWD', // Kuwaiti Dinar
  OMR: 'OMR', // Omani Rial
  BHD: 'BHD', // Bahraini Dinar
  TRY: 'TRY', // Turkish Lira
  PLN: 'PLN', // Polish Zloty
  CZK: 'CZK', // Czech Koruna
  HUF: 'HUF', // Hungarian Forint
  RON: 'RON', // Romanian Leu
  SEK: 'SEK', // Swedish Krona
  NOK: 'NOK', // Norwegian Krone
  DKK: 'DKK', // Danish Krone
  HKD: 'HKD', // Hong Kong Dollar
  TWD: 'TWD', // New Taiwan Dollar
  PHP: 'PHP', // Philippine Peso
  VND: 'VND', // Vietnamese Dong
  MXN: 'MXN', // Mexican Peso
  ARS: 'ARS', // Argentine Peso
  CLP: 'CLP', // Chilean Peso
  COP: 'COP', // Colombian Peso
  PEN: 'PEN', // Peruvian Sol
  UYU: 'UYU', // Uruguayan Peso
};

// Comprehensive currency data
export const CURRENCIES = [
  {
    code: Currency.USD,
    name: 'United States Dollar',
    symbol: '$',
    symbolNative: '$',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    locale: 'en-US',
    isMajor: true,
    isCrypto: false,
    region: 'Americas',
    subUnit: 'Cent',
    subUnitToUnit: 100,
    isoNumeric: 840,
    priority: 1,
    color: '#10B981', // Emerald
  },
  {
    code: Currency.LKR,
    name: 'Sri Lankan Rupee',
    symbol: 'Rs',
    symbolNative: 'රු',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    locale: 'si-LK',
    isMajor: false,
    isCrypto: false,
    region: 'Asia',
    subUnit: 'Cent',
    subUnitToUnit: 100,
    isoNumeric: 144,
    priority: 2,
    color: '#F59E0B', // Amber
  },
  {
    code: Currency.EUR,
    name: 'Euro',
    symbol: '€',
    symbolNative: '€',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    locale: 'de-DE',
    isMajor: true,
    isCrypto: false,
    region: 'Europe',
    subUnit: 'Cent',
    subUnitToUnit: 100,
    isoNumeric: 978,
    priority: 3,
    color: '#3B82F6', // Blue
  },
  {
    code: Currency.GBP,
    name: 'British Pound Sterling',
    symbol: '£',
    symbolNative: '£',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    locale: 'en-GB',
    isMajor: true,
    isCrypto: false,
    region: 'Europe',
    subUnit: 'Penny',
    subUnitToUnit: 100,
    isoNumeric: 826,
    priority: 4,
    color: '#EF4444', // Red
  },
  {
    code: Currency.JPY,
    name: 'Japanese Yen',
    symbol: '¥',
    symbolNative: '￥',
    decimalDigits: 0,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    locale: 'ja-JP',
    isMajor: true,
    isCrypto: false,
    region: 'Asia',
    subUnit: 'Sen',
    subUnitToUnit: 100,
    isoNumeric: 392,
    priority: 5,
    color: '#DC2626', // Red-600
  },
  {
    code: Currency.INR,
    name: 'Indian Rupee',
    symbol: '₹',
    symbolNative: '₹',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    locale: 'en-IN',
    isMajor: true,
    isCrypto: false,
    region: 'Asia',
    subUnit: 'Paisa',
    subUnitToUnit: 100,
    isoNumeric: 356,
    priority: 6,
    color: '#059669', // Green-600
  },
  {
    code: Currency.CAD,
    name: 'Canadian Dollar',
    symbol: 'C$',
    symbolNative: '$',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    locale: 'en-CA',
    isMajor: true,
    isCrypto: false,
    region: 'Americas',
    subUnit: 'Cent',
    subUnitToUnit: 100,
    isoNumeric: 124,
    priority: 7,
    color: '#DC2626', // Red-600
  },
  {
    code: Currency.AUD,
    name: 'Australian Dollar',
    symbol: 'A$',
    symbolNative: '$',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    locale: 'en-AU',
    isMajor: true,
    isCrypto: false,
    region: 'Oceania',
    subUnit: 'Cent',
    subUnitToUnit: 100,
    isoNumeric: 36,
    priority: 8,
    color: '#7C3AED', // Violet-600
  },
  {
    code: Currency.CHF,
    name: 'Swiss Franc',
    symbol: 'CHF',
    symbolNative: 'CHF',
    decimalDigits: 2,
    rounding: 0.05,
    symbolPosition: 'after',
    decimalSeparator: '.',
    thousandsSeparator: "'",
    locale: 'de-CH',
    isMajor: true,
    isCrypto: false,
    region: 'Europe',
    subUnit: 'Rappen',
    subUnitToUnit: 100,
    isoNumeric: 756,
    priority: 9,
    color: '#0EA5E9', // Sky-500
  },
  {
    code: Currency.CNY,
    name: 'Chinese Yuan',
    symbol: 'CN¥',
    symbolNative: '¥',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    locale: 'zh-CN',
    isMajor: true,
    isCrypto: false,
    region: 'Asia',
    subUnit: 'Fen',
    subUnitToUnit: 100,
    isoNumeric: 156,
    priority: 10,
    color: '#B91C1C', // Red-700
  },
  {
    code: Currency.PKR,
    name: 'Pakistani Rupee',
    symbol: 'PKRs',
    symbolNative: '₨',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    locale: 'ur-PK',
    isMajor: false,
    isCrypto: false,
    region: 'Asia',
    subUnit: 'Paisa',
    subUnitToUnit: 100,
    isoNumeric: 586,
    priority: 11,
    color: '#D97706', // Amber-600
  },
  {
    code: Currency.BDT,
    name: 'Bangladeshi Taka',
    symbol: '৳',
    symbolNative: '৳',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    locale: 'bn-BD',
    isMajor: false,
    isCrypto: false,
    region: 'Asia',
    subUnit: 'Paisa',
    subUnitToUnit: 100,
    isoNumeric: 50,
    priority: 12,
    color: '#059669', // Green-600
  },
  {
    code: Currency.NPR,
    name: 'Nepalese Rupee',
    symbol: 'NPRs',
    symbolNative: 'रू',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    locale: 'ne-NP',
    isMajor: false,
    isCrypto: false,
    region: 'Asia',
    subUnit: 'Paisa',
    subUnitToUnit: 100,
    isoNumeric: 524,
    priority: 13,
    color: '#EA580C', // Orange-600
  },
  {
    code: Currency.MVR,
    name: 'Maldivian Rufiyaa',
    symbol: 'Rf',
    symbolNative: '.ރ',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    locale: 'dv-MV',
    isMajor: false,
    isCrypto: false,
    region: 'Asia',
    subUnit: 'Laari',
    subUnitToUnit: 100,
    isoNumeric: 462,
    priority: 14,
    color: '#0891B2', // Cyan-600
  },
  {
    code: Currency.SGD,
    name: 'Singapore Dollar',
    symbol: 'S$',
    symbolNative: '$',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    locale: 'en-SG',
    isMajor: true,
    isCrypto: false,
    region: 'Asia',
    subUnit: 'Cent',
    subUnitToUnit: 100,
    isoNumeric: 702,
    priority: 15,
    color: '#7C3AED', // Violet-600
  },
  // Add more currencies as needed...
];

// Currency groups for organization
export const CurrencyGroups = {
  MAJOR: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'],
  ASIAN: ['INR', 'LKR', 'PKR', 'BDT', 'NPR', 'MVR', 'SGD', 'MYR', 'THB', 'IDR', 'KRW', 'PHP', 'VND'],
  EUROPEAN: ['EUR', 'GBP', 'CHF', 'PLN', 'CZK', 'HUF', 'RON', 'SEK', 'NOK', 'DKK'],
  MIDDLE_EASTERN: ['AED', 'SAR', 'QAR', 'KWD', 'OMR', 'BHD', 'TRY'],
  AMERICAN: ['USD', 'CAD', 'MXN', 'BRL', 'ARS', 'CLP', 'COP'],
  OCEANIAN: ['AUD', 'NZD'],
  CRYPTO: ['BTC', 'ETH', 'USDT', 'BNB', 'XRP'], // Cryptocurrencies
};

// Currency formatting templates
export const CurrencyFormats = {
  STANDARD: 'standard',        // $1,234.56
  ACCOUNTING: 'accounting',    // ($1,234.56) for negative
  COMPACT: 'compact',          // $1.2K, $1.2M
  DECIMAL: 'decimal',          // 1234.56
  PERCENT: 'percent',          // 12.34%
  CURRENCY: 'currency',        // $1,234.56 (locale specific)
};

// Helper functions
export const CurrencyHelpers = {
  /**
   * Get currency by code
   */
  getCurrencyByCode(currencyCode) {
    return CURRENCIES.find(currency => currency.code === currencyCode) || 
           CURRENCIES.find(currency => currency.code === Currency.USD);
  },

  /**
   * Get all currencies as options for dropdown
   */
  getCurrencyOptions(group = null) {
    let currencies = CURRENCIES;
    
    if (group && CurrencyGroups[group]) {
      currencies = CURRENCIES.filter(currency => 
        CurrencyGroups[group].includes(currency.code)
      );
    }
    
    return currencies
      .sort((a, b) => a.priority - b.priority)
      .map(currency => ({
        label: `${currency.name} (${currency.code})`,
        value: currency.code,
        symbol: currency.symbol,
        decimalDigits: currency.decimalDigits,
        symbolPosition: currency.symbolPosition,
        color: currency.color,
      }));
  },

  /**
   * Format amount with currency
   */
  formatAmount(amount, currencyCode, options = {}) {
    const currency = this.getCurrencyByCode(currencyCode);
    const {
      format = 'standard',
      locale = currency.locale || 'en-US',
      showSymbol = true,
      compact = false,
    } = options;
    
    const amountNumber = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(amountNumber)) {
      return showSymbol ? `${currency.symbol}0.00` : '0.00';
    }
    
    let formattedAmount;
    
    if (compact && Math.abs(amountNumber) >= 1000) {
      const formatter = Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
      formattedAmount = formatter.format(amountNumber);
    } else {
      const formatter = Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currency.decimalDigits,
        maximumFractionDigits: currency.decimalDigits,
      });
      formattedAmount = formatter.format(amountNumber);
    }
    
    if (!showSymbol) {
      // Remove currency symbol if not needed
      const symbolRegex = new RegExp(`[${currency.symbol}${currency.symbolNative}]`, 'g');
      formattedAmount = formattedAmount.replace(symbolRegex, '').trim();
    }
    
    return formattedAmount;
  },

  /**
   * Parse currency string to number
   */
  parseAmount(amountString, currencyCode) {
    if (!amountString || typeof amountString !== 'string') {
      return 0;
    }
    
    const currency = this.getCurrencyByCode(currencyCode);
    
    // Remove currency symbols
    let cleanString = amountString.trim();
    cleanString = cleanString.replace(new RegExp(`[${currency.symbol}${currency.symbolNative}]`, 'g'), '');
    
    // Remove thousands separators
    cleanString = cleanString.replace(new RegExp(`[${currency.thousandsSeparator}]`, 'g'), '');
    
    // Replace decimal separator with dot
    if (currency.decimalSeparator !== '.') {
      cleanString = cleanString.replace(currency.decimalSeparator, '.');
    }
    
    // Parse to number
    const amount = parseFloat(cleanString);
    
    return isNaN(amount) ? 0 : amount;
  },

  /**
   * Convert amount between currencies
   */
  convertAmount(amount, fromCurrency, toCurrency, exchangeRate) {
    if (fromCurrency === toCurrency) return amount;
    
    if (!exchangeRate || exchangeRate <= 0) {
      console.warn(`Invalid exchange rate for ${fromCurrency} to ${toCurrency}`);
      return amount;
    }
    
    return amount * exchangeRate;
  },

  /**
   * Get symbol for currency
   */
  getCurrencySymbol(currencyCode) {
    const currency = this.getCurrencyByCode(currencyCode);
    return currency.symbol;
  },

  /**
   * Get decimal places for currency
   */
  getDecimalDigits(currencyCode) {
    const currency = this.getCurrencyByCode(currencyCode);
    return currency.decimalDigits;
  },

  /**
   * Get locale for currency
   */
  getCurrencyLocale(currencyCode) {
    const currency = this.getCurrencyByCode(currencyCode);
    return currency.locale;
  },

  /**
   * Check if currency is major
   */
  isMajorCurrency(currencyCode) {
    const currency = this.getCurrencyByCode(currencyCode);
    return currency.isMajor;
  },

  /**
   * Get currency region
   */
  getCurrencyRegion(currencyCode) {
    const currency = this.getCurrencyByCode(currencyCode);
    return currency.region;
  },

  /**
   * Get currency color
   */
  getCurrencyColor(currencyCode) {
    const currency = this.getCurrencyByCode(currencyCode);
    return currency.color || '#6366F1';
  },

  /**
   * Sort currencies by priority
   */
  sortCurrenciesByPriority(currencies) {
    return currencies.sort((a, b) => {
      const currencyA = this.getCurrencyByCode(a);
      const currencyB = this.getCurrencyByCode(b);
      return (currencyA?.priority || 999) - (currencyB?.priority || 999);
    });
  },

  /**
   * Get popular currencies for region
   */
  getPopularCurrenciesForRegion(region) {
    return CURRENCIES
      .filter(currency => currency.region === region)
      .sort((a, b) => a.priority - b.priority)
      .map(currency => currency.code);
  },

  /**
   * Auto-detect currency from locale
   */
  detectCurrencyFromLocale(locale) {
    // Extract country code from locale
    const countryCode = locale.split('-')[1]?.toUpperCase();
    
    if (!countryCode) return Currency.USD;
    
    // Map country codes to currencies
    const countryToCurrency = {
      US: Currency.USD,
      LK: Currency.LKR,
      GB: Currency.GBP,
      DE: Currency.EUR,
      FR: Currency.EUR,
      IT: Currency.EUR,
      ES: Currency.EUR,
      JP: Currency.JPY,
      IN: Currency.INR,
      CA: Currency.CAD,
      AU: Currency.AUD,
      CH: Currency.CHF,
      CN: Currency.CNY,
      PK: Currency.PKR,
      BD: Currency.BDT,
      NP: Currency.NPR,
      MV: Currency.MVR,
      SG: Currency.SGD,
      // Add more mappings as needed
    };
    
    return countryToCurrency[countryCode] || Currency.USD;
  },
};

// Default currency settings
export const DEFAULT_CURRENCY = Currency.USD;
export const SUPPORTED_CURRENCIES = CURRENCIES.map(currency => currency.code);

// Exchange rate APIs (free)
export const EXCHANGE_RATE_APIS = {
  EXCHANGERATE_API: 'https://api.exchangerate-api.com/v4/latest/',
  FRANKFURTER: 'https://api.frankfurter.app/latest',
  EXCHANGERATE_HOST: 'https://api.exchangerate.host/latest',
  OPENEXCHANGERATES: 'https://openexchangerates.org/api/latest.json', // Requires API key
};

// Export default
export default {
  Currency,
  CURRENCIES,
  CurrencyGroups,
  CurrencyFormats,
  CurrencyHelpers,
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  EXCHANGE_RATE_APIS,
  
  // Convenience exports
  getCurrency: CurrencyHelpers.getCurrencyByCode,
  formatCurrency: CurrencyHelpers.formatAmount,
  parseCurrency: CurrencyHelpers.parseAmount,
  convertCurrency: CurrencyHelpers.convertAmount,
  getSymbol: CurrencyHelpers.getCurrencySymbol,
  getCurrencyOptions: CurrencyHelpers.getCurrencyOptions,
  detectCurrency: CurrencyHelpers.detectCurrencyFromLocale,
};