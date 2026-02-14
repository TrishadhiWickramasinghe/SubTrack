export type CurrencyCode = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'LKR' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'INR'
  | 'NZD' | 'KRW' | 'SGD' | 'MYR' | 'THB' | 'VND' | 'PHP' | 'IDR' | 'PKR' | 'BDT'
  | 'NPR' | 'AFN' | 'BHD' | 'ILS' | 'IQD' | 'IRR' | 'JOD' | 'KWD' | 'LBP' | 'OMR'
  | 'QAR' | 'SAR' | 'SYP' | 'TRY' | 'AED' | 'YER' | string;

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  decimalPlaces: number;
}

export interface ExchangeRate {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  timestamp: number;
}

export interface CurrencyFormatOptions {
  showSymbol: boolean;
  showCode: boolean;
  decimalPlaces: number;
  grouping: boolean;
  fallback?: string;
}

export interface CurrencyConversion {
  from: CurrencyCode;
  to: CurrencyCode;
  amount: number;
  result: number;
  rate: number;
  timestamp: number;
}

export interface CurrencyHistory {
  date: string;
  rates: Record<CurrencyCode, number>;
}