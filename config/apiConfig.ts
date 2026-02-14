import { Platform } from 'react-native';

// Environment variables (you'll need to set these in .env file)
const ENV = {
  development: {
    CURRENCY_API_KEY: process.env.DEV_CURRENCY_API_KEY || 'demo_key',
    EXCHANGE_RATE_API_KEY: process.env.DEV_EXCHANGE_RATE_API_KEY || 'demo_key',
    OCR_API_KEY: process.env.DEV_OCR_API_KEY || '',
    MARKETPLACE_API_KEY: process.env.DEV_MARKETPLACE_API_KEY || '',
    BACKUP_API_KEY: process.env.DEV_BACKUP_API_KEY || '',
  },
  staging: {
    CURRENCY_API_KEY: process.env.STAGING_CURRENCY_API_KEY || '',
    EXCHANGE_RATE_API_KEY: process.env.STAGING_EXCHANGE_RATE_API_KEY || '',
    OCR_API_KEY: process.env.STAGING_OCR_API_KEY || '',
    MARKETPLACE_API_KEY: process.env.STAGING_MARKETPLACE_API_KEY || '',
    BACKUP_API_KEY: process.env.STAGING_BACKUP_API_KEY || '',
  },
  production: {
    CURRENCY_API_KEY: process.env.PROD_CURRENCY_API_KEY || '',
    EXCHANGE_RATE_API_KEY: process.env.PROD_EXCHANGE_RATE_API_KEY || '',
    OCR_API_KEY: process.env.PROD_OCR_API_KEY || '',
    MARKETPLACE_API_KEY: process.env.PROD_MARKETPLACE_API_KEY || '',
    BACKUP_API_KEY: process.env.PROD_BACKUP_API_KEY || '',
  },
};

// Get current environment
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  if (__DEV__) {
    return 'development';
  }
  // You can use environment variables or build configurations to determine environment
  return 'production';
};

const currentEnv = getEnvironment();
const envConfig = ENV[currentEnv];

// API Endpoints
export const API_ENDPOINTS = {
  // Currency API (free tier)
  currencyApi: {
    baseUrl: 'https://api.currencyapi.com/v3',
    endpoints: {
      latest: '/latest',
      historical: '/historical',
      currencies: '/currencies',
      convert: '/convert',
    },
  },

  // Exchange Rate API (free tier)
  exchangeRateApi: {
    baseUrl: 'https://api.exchangerate-api.com/v4',
    endpoints: {
      latest: '/latest',
      historical: '/historical',
      timeseries: '/timeseries',
      fluctuation: '/fluctuation',
    },
  },

  // OCR API for receipt scanning
  ocrApi: {
    baseUrl: 'https://api.ocr.space/parse/image',
    endpoints: {
      scan: '',
      analyze: '/analyze',
    },
  },

  // Marketplace API (your custom backend)
  marketplaceApi: {
    baseUrl: currentEnv === 'production' 
      ? 'https://api.subtrack.app/v1' 
      : 'https://staging-api.subtrack.app/v1',
    endpoints: {
      services: '/services',
      categories: '/categories',
      trending: '/trending',
      search: '/search',
    },
  },

  // Backup API (Google Drive / Dropbox)
  backupApi: {
    baseUrl: 'https://www.googleapis.com/drive/v3',
    endpoints: {
      upload: '/files',
      download: '/files/{fileId}',
      list: '/files',
    },
  },
};

// API Keys
export const API_KEYS = {
  currencyApi: envConfig.CURRENCY_API_KEY,
  exchangeRateApi: envConfig.EXCHANGE_RATE_API_KEY,
  ocrApi: envConfig.OCR_API_KEY,
  marketplaceApi: envConfig.MARKETPLACE_API_KEY,
  backupApi: envConfig.BACKUP_API_KEY,
};

// Request timeouts (in milliseconds)
export const API_TIMEOUTS = {
  currencyApi: 10000,
  exchangeRateApi: 10000,
  ocrApi: 30000, // OCR can take longer
  marketplaceApi: 15000,
  backupApi: 20000,
};

// Retry configurations
export const API_RETRY = {
  maxAttempts: 3,
  backoffFactor: 1.5,
  initialDelay: 1000,
  statusCodesToRetry: [408, 429, 500, 502, 503, 504],
};

// Cache configurations
export const API_CACHE = {
  currencyApi: {
    enabled: true,
    duration: 3600000, // 1 hour
  },
  exchangeRateApi: {
    enabled: true,
    duration: 300000, // 5 minutes
  },
  marketplaceApi: {
    enabled: true,
    duration: 86400000, // 24 hours
  },
};

// Platform-specific headers
export const getPlatformHeaders = () => ({
  'X-Platform': Platform.OS,
  'X-Platform-Version': Platform.Version.toString(),
  'X-App-Version': '1.0.0', // You can get this from app.json
});

// Default headers for all requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  ...getPlatformHeaders(),
};

// API Configuration object
const apiConfig = {
  env: currentEnv,
  endpoints: API_ENDPOINTS,
  keys: API_KEYS,
  timeouts: API_TIMEOUTS,
  retry: API_RETRY,
  cache: API_CACHE,
  defaultHeaders: DEFAULT_HEADERS,

  // Helper method to build full URL
  buildUrl: (base: string, endpoint: string, params?: Record<string, string>): string => {
    let url = `${base}${endpoint}`;
    
    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      url += `?${queryParams}`;
    }
    
    return url;
  },

  // Helper method to get auth headers
  getAuthHeaders: (apiName: keyof typeof API_KEYS) => ({
    Authorization: `Bearer ${API_KEYS[apiName]}`,
    ...DEFAULT_HEADERS,
  }),

  // Helper method to handle API errors
  handleError: (error: any, apiName: string): never => {
    console.error(`[${apiName} API Error]:`, error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(`API Error ${error.response.status}: ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Network error: No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Request error: ${error.message}`);
    }
  },

  // Helper method to check if we should retry
  shouldRetry: (attempt: number, statusCode: number): boolean => {
    return (
      attempt < API_RETRY.maxAttempts &&
      API_RETRY.statusCodesToRetry.includes(statusCode)
    );
  },

  // Helper method to get retry delay
  getRetryDelay: (attempt: number): number => {
    return API_RETRY.initialDelay * Math.pow(API_RETRY.backoffFactor, attempt);
  },
};

export default apiConfig;