import { CURRENCIES } from '@config/currencies';
import { Currency, CurrencyCode, CurrencyFormatOptions } from '@models/currency';
import calculations from './calculations';

export interface FormattedAmount {
  amount: number;
  currency: CurrencyCode;
  symbol: string;
  formatted: string;
  decimalPlaces: number;
}

export interface CurrencyComparison {
  baseAmount: number;
  baseCurrency: CurrencyCode;
  convertedAmounts: Array<{
    currency: CurrencyCode;
    amount: number;
    rate: number;
    formatted: string;
  }>;
}

class CurrencyHelpers {
  private readonly DEFAULT_OPTIONS: CurrencyFormatOptions = {
    showSymbol: true,
    showCode: false,
    decimalPlaces: 2,
    grouping: true,
    fallback: 'N/A',
  };

  /**
   * Format amount with currency symbol
   */
  formatAmount(
    amount: number,
    currency: CurrencyCode,
    options: Partial<CurrencyFormatOptions> = {}
  ): string {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const currencyInfo = this.getCurrencyInfo(currency);
    
    if (isNaN(amount) || amount === null || amount === undefined) {
      return opts.fallback || 'N/A';
    }

    // Handle negative amounts
    const isNegative = amount < 0;
    const absoluteAmount = Math.abs(amount);

    // Round to appropriate decimal places
    const roundedAmount = this.roundToDecimalPlaces(
      absoluteAmount,
      opts.decimalPlaces || currencyInfo.decimalPlaces
    );

    // Format number with grouping
    let formattedNumber = this.formatNumber(roundedAmount, {
      decimalPlaces: opts.decimalPlaces || currencyInfo.decimalPlaces,
      grouping: opts.grouping,
    });

    // Add negative sign if needed
    if (isNegative) {
      formattedNumber = `-${formattedNumber}`;
    }

    // Add currency symbol or code
    if (opts.showSymbol) {
      return `${currencyInfo.symbol}${formattedNumber}`;
    } else if (opts.showCode) {
      return `${formattedNumber} ${currency}`;
    }

    return formattedNumber;
  }

  /**
   * Parse formatted currency string back to number
   */
  parseAmount(formatted: string, currency: CurrencyCode): number | null {
    try {
      const currencyInfo = this.getCurrencyInfo(currency);
      
      // Remove currency symbol and spaces
      let cleaned = formatted
        .replace(currencyInfo.symbol, '')
        .replace(/\s/g, '')
        .replace(/,/g, '');

      // Handle negative numbers
      const isNegative = cleaned.startsWith('-');
      if (isNegative) {
        cleaned = cleaned.substring(1);
      }

      const amount = parseFloat(cleaned);
      
      if (isNaN(amount)) {
        return null;
      }

      return isNegative ? -amount : amount;
    } catch {
      return null;
    }
  }

  /**
   * Convert amount between currencies
   */
  convertAmount(
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
    rates: Record<string, number>
  ): number {
    if (from === to) return amount;

    const rate = this.getRate(from, to, rates);
    if (rate === null) {
      throw new Error(`No exchange rate found for ${from} to ${to}`);
    }

    const converted = amount * rate;
    const decimals = this.getCurrencyInfo(to).decimalPlaces;
    
    return this.roundToDecimalPlaces(converted, decimals);
  }

  /**
   * Convert amount with proper rounding
   */
  convertAmountSafe(
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
    rates: Record<string, number>
  ): number {
    try {
      return this.convertAmount(amount, from, to, rates);
    } catch {
      return amount; // Return original amount if conversion fails
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  getRate(
    from: CurrencyCode,
    to: CurrencyCode,
    rates: Record<string, number>
  ): number | null {
    if (from === to) return 1;

    // Direct rate
    if (rates[to]) {
      return rates[to];
    }

    // Try inverse rate
    if (rates[from]) {
      return 1 / rates[from];
    }

    // Try through base currency (assuming rates are against USD or EUR)
    const baseCurrency = 'USD';
    if (rates[baseCurrency] && rates[to]) {
      return (1 / rates[baseCurrency]) * rates[to];
    }

    return null;
  }

  /**
   * Get all conversion rates for an amount
   */
  getAllConversions(
    amount: number,
    from: CurrencyCode,
    rates: Record<string, number>
  ): Record<CurrencyCode, number> {
    const conversions: Partial<Record<CurrencyCode, number>> = {};

    Object.keys(rates).forEach((to) => {
      try {
        conversions[to as CurrencyCode] = this.convertAmount(
          amount,
          from,
          to as CurrencyCode,
          rates
        );
      } catch {
        // Skip if conversion fails
      }
    });

    return conversions as Record<CurrencyCode, number>;
  }

  /**
   * Compare amount across multiple currencies
   */
  compareCurrencies(
    amount: number,
    from: CurrencyCode,
    currencies: CurrencyCode[],
    rates: Record<string, number>
  ): CurrencyComparison {
    const convertedAmounts = currencies.map(to => {
      const rate = this.getRate(from, to, rates) || 1;
      const converted = this.convertAmount(amount, from, to, rates);
      
      return {
        currency: to,
        amount: converted,
        rate,
        formatted: this.formatAmount(converted, to),
      };
    });

    return {
      baseAmount: amount,
      baseCurrency: from,
      convertedAmounts,
    };
  }

  /**
   * Calculate total in base currency
   */
  calculateTotalInBase(
    amounts: Array<{
      amount: number;
      currency: CurrencyCode;
    }>,
    baseCurrency: CurrencyCode,
    rates: Record<string, number>
  ): number {
    let total = 0;

    for (const item of amounts) {
      try {
        const converted = this.convertAmount(
          item.amount,
          item.currency,
          baseCurrency,
          rates
        );
        total += converted;
      } catch {
        // Skip if conversion fails
      }
    }

    const decimals = this.getCurrencyInfo(baseCurrency).decimalPlaces;
    return this.roundToDecimalPlaces(total, decimals);
  }

  /**
   * Format number with grouping and decimal places
   */
  private formatNumber(
    amount: number,
    options: {
      decimalPlaces: number;
      grouping: boolean;
    }
  ): string {
    let formatted = amount.toFixed(options.decimalPlaces);

    if (options.grouping) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formatted = parts.join('.');
    }

    return formatted;
  }

  /**
   * Round to specific decimal places
   */
  roundToDecimalPlaces(amount: number, places: number): number {
    const factor = Math.pow(10, places);
    return Math.round(amount * factor) / factor;
  }

  /**
   * Get currency information
   */
  getCurrencyInfo(code: CurrencyCode): Currency {
    const currency = Array.isArray(CURRENCIES) 
      ? (CURRENCIES as any[]).find(c => c.code === code)
      : (CURRENCIES as Record<string, Currency>)[code];
    
    return currency || {
      code,
      name: code,
      symbol: code,
      flag: '🏳️',
      decimalPlaces: 2,
    };
  }

  /**
   * Get all supported currencies
   */
  getAllCurrencies(): Currency[] {
    return Array.isArray(CURRENCIES) ? (CURRENCIES as any[] as Currency[]) : Object.values(CURRENCIES as Record<string, Currency>);
  }

  /**
   * Get popular currencies for quick selection
   */
  getPopularCurrencies(): Currency[] {
    const popularCodes: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'JPY', 'LKR'];
    const allCurrencies = this.getAllCurrencies();
    return popularCodes
      .map(code => allCurrencies.find(c => c.code === code))
      .filter((currency): currency is Currency => currency !== undefined);
  }

  /**
   * Validate currency code
   */
  isValidCurrency(code: string): code is CurrencyCode {
    return code in CURRENCIES;
  }

  /**
   * Calculate exchange rate trend
   */
  calculateRateTrend(
    historicalRates: Array<{ date: string; rate: number }>
  ): {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    average: number;
    volatility: number;
  } {
    if (historicalRates.length < 2) {
      return {
        direction: 'stable',
        percentage: 0,
        average: historicalRates[0]?.rate || 0,
        volatility: 0,
      };
    }

    const rates = historicalRates.map(r => r.rate);
    const firstRate = rates[0];
    const lastRate = rates[rates.length - 1];
    const percentageChange = ((lastRate - firstRate) / firstRate) * 100;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (percentageChange > 1) direction = 'up';
    else if (percentageChange < -1) direction = 'down';

    const average = calculations.calculateMean(rates);
    const volatility = calculations.calculateStandardDeviation(rates);

    return {
      direction,
      percentage: Number(percentageChange.toFixed(2)),
      average,
      volatility,
    };
  }

  /**
   * Find best currency to convert to
   */
  findBestCurrency(
    amount: number,
    from: CurrencyCode,
    rates: Record<string, number>
  ): {
    currency: CurrencyCode;
    amount: number;
    rate: number;
  } | null {
    let bestCurrency: CurrencyCode | null = null;
    let bestAmount = amount;
    let bestRate = 1;

    Object.entries(rates).forEach(([to, rate]) => {
      if (to === from) return;

      const converted = amount * rate;
      if (converted > bestAmount) {
        bestAmount = converted;
        bestCurrency = to as CurrencyCode;
        bestRate = rate;
      }
    });

    if (bestCurrency) {
      return {
        currency: bestCurrency,
        amount: bestAmount,
        rate: bestRate,
      };
    }

    return null;
  }

  /**
   * Split amount by currency
   */
  splitByCurrency(
    total: number,
    splits: Array<{
      percentage: number;
      currency: CurrencyCode;
    }>,
    baseCurrency: CurrencyCode,
    rates: Record<string, number>
  ): Array<{
    currency: CurrencyCode;
    originalAmount: number;
    convertedAmount: number;
    percentage: number;
  }> {
    return splits.map(split => {
      const originalAmount = (total * split.percentage) / 100;
      const convertedAmount = this.convertAmount(
        originalAmount,
        baseCurrency,
        split.currency,
        rates
      );

      return {
        currency: split.currency,
        originalAmount,
        convertedAmount,
        percentage: split.percentage,
      };
    });
  }

  /**
   * Generate currency summary
   */
  generateSummary(
    amounts: Array<{
      amount: number;
      currency: CurrencyCode;
      category?: string;
    }>,
    baseCurrency: CurrencyCode,
    rates: Record<string, number>
  ): {
    total: number;
    byCurrency: Record<CurrencyCode, number>;
    byCategory: Record<string, number>;
    formatted: Record<string, string>;
  } {
    const byCurrency: Partial<Record<CurrencyCode, number>> = {};
    const byCategory: Record<string, number> = {};
    let total = 0;

    amounts.forEach(item => {
      // Track by currency
      byCurrency[item.currency] = (byCurrency[item.currency] || 0) + item.amount;

      // Convert to base for total
      const converted = this.convertAmount(
        item.amount,
        item.currency,
        baseCurrency,
        rates
      );
      total += converted;

      // Track by category
      if (item.category) {
        byCategory[item.category] = (byCategory[item.category] || 0) + converted;
      }
    });

    // Format all values
    const formatted: Record<string, string> = {};
    Object.entries(byCurrency).forEach(([currency, amount]) => {
      if (amount !== undefined) {
        formatted[currency] = this.formatAmount(amount, currency as CurrencyCode);
      }
    });
    formatted.total = this.formatAmount(total, baseCurrency);

    return {
      total,
      byCurrency: byCurrency as Record<CurrencyCode, number>,
      byCategory,
      formatted,
    };
  }

  /**
   * Detect currency format from string
   */
  detectCurrencyFromString(text: string): CurrencyCode | null {
    // Try to match common currency symbols
    const symbolMap: Record<string, CurrencyCode> = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₨': 'LKR',
      '₹': 'INR',
      '₩': 'KRW',
      '₽': 'RUB',
      '₱': 'PHP',
      '฿': 'THB',
    };

    for (const [symbol, currency] of Object.entries(symbolMap)) {
      if (text.includes(symbol)) {
        return currency;
      }
    }

    // Try to match currency codes
    const upperText = text.toUpperCase();
    for (const code of Object.keys(CURRENCIES)) {
      if (upperText.includes(code)) {
        return code as CurrencyCode;
      }
    }

    return null;
  }
}

export default new CurrencyHelpers();