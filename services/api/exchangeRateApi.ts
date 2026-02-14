import { CurrencyCode } from '@models/currency';
import apiConfig from '@config/apiConfig';
import { cacheStorage } from '@services/storage/cacheStorage';

export interface ExchangeRateResponse {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  date: string;
  timestamp: number;
}

export interface TimeSeriesResponse {
  base: CurrencyCode;
  rates: Record<string, Record<CurrencyCode, number>>;
  start_date: string;
  end_date: string;
}

export interface RateAlert {
  id: string;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  targetRate: number;
  condition: 'above' | 'below';
  active: boolean;
  createdAt: number;
}

class ExchangeRateApi {
  private readonly API_KEY = apiConfig.exchangeRateApi.key;
  private readonly BASE_URL = apiConfig.exchangeRateApi.baseUrl;
  private readonly CACHE_DURATION = 300000; // 5 minutes
  private alerts: Map<string, RateAlert> = new Map();

  /**
   * Get latest exchange rates
   */
  async getLatestRates(
    base: CurrencyCode = 'USD',
    symbols?: CurrencyCode[]
  ): Promise<ExchangeRateResponse> {
    try {
      const cacheKey = `exchangerate_latest_${base}_${symbols?.join('_') || 'all'}`;
      const cached = await cacheStorage.get<ExchangeRateResponse>(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached;
      }

      let url = `${this.BASE_URL}/latest?access_key=${this.API_KEY}&base=${base}`;
      if (symbols?.length) {
        url += `&symbols=${symbols.join(',')}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const result: ExchangeRateResponse = {
        base: data.base,
        rates: data.rates,
        date: data.date,
        timestamp: Date.now(),
      };

      await cacheStorage.set(cacheKey, result, this.CACHE_DURATION);

      // Check alerts for new rates
      this.checkAlerts(result);

      return result;
    } catch (error) {
      console.error('Failed to fetch latest rates:', error);
      throw error;
    }
  }

  /**
   * Get historical rates for a specific date
   */
  async getHistoricalRates(
    date: Date,
    base: CurrencyCode = 'USD',
    symbols?: CurrencyCode[]
  ): Promise<ExchangeRateResponse> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const cacheKey = `exchangerate_historical_${dateStr}_${base}`;
      
      const cached = await cacheStorage.get<ExchangeRateResponse>(cacheKey);
      if (cached) {
        return cached;
      }

      let url = `${this.BASE_URL}/${dateStr}?access_key=${this.API_KEY}&base=${base}`;
      if (symbols?.length) {
        url += `&symbols=${symbols.join(',')}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const result: ExchangeRateResponse = {
        base: data.base,
        rates: data.rates,
        date: data.date,
        timestamp: Date.now(),
      };

      await cacheStorage.set(cacheKey, result, 7 * 24 * 3600000); // Cache for 7 days

      return result;
    } catch (error) {
      console.error('Failed to fetch historical rates:', error);
      throw error;
    }
  }

  /**
   * Get time series data for a date range
   */
  async getTimeSeries(
    startDate: Date,
    endDate: Date,
    base: CurrencyCode = 'USD',
    symbols?: CurrencyCode[]
  ): Promise<TimeSeriesResponse> {
    try {
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      const cacheKey = `exchangerate_timeseries_${startStr}_${endStr}_${base}`;

      const cached = await cacheStorage.get<TimeSeriesResponse>(cacheKey);
      if (cached) {
        return cached;
      }

      let url = `${this.BASE_URL}/timeseries?` +
        `access_key=${this.API_KEY}&` +
        `start_date=${startStr}&` +
        `end_date=${endStr}&` +
        `base=${base}`;
      
      if (symbols?.length) {
        url += `&symbols=${symbols.join(',')}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const result: TimeSeriesResponse = {
        base: data.base,
        rates: data.rates,
        start_date: data.start_date,
        end_date: data.end_date,
      };

      await cacheStorage.set(cacheKey, result, 24 * 3600000); // Cache for 1 day

      return result;
    } catch (error) {
      console.error('Failed to fetch time series:', error);
      throw error;
    }
  }

  /**
   * Convert amount using latest rates
   */
  async convert(
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode
  ): Promise<{
    result: number;
    rate: number;
    timestamp: number;
  }> {
    try {
      const rates = await this.getLatestRates(from, [to]);
      const rate = rates.rates[to];

      if (!rate) {
        throw new Error(`No rate found for ${from} to ${to}`);
      }

      return {
        result: amount * rate,
        rate,
        timestamp: rates.timestamp,
      };
    } catch (error) {
      console.error('Conversion failed:', error);
      throw error;
    }
  }

  /**
   * Create a rate alert
   */
  createAlert(
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode,
    targetRate: number,
    condition: 'above' | 'below'
  ): RateAlert {
    const alert: RateAlert = {
      id: `${fromCurrency}_${toCurrency}_${Date.now()}`,
      fromCurrency,
      toCurrency,
      targetRate,
      condition,
      active: true,
      createdAt: Date.now(),
    };

    this.alerts.set(alert.id, alert);
    this.saveAlerts();
    
    return alert;
  }

  /**
   * Delete a rate alert
   */
  deleteAlert(alertId: string): boolean {
    const deleted = this.alerts.delete(alertId);
    if (deleted) {
      this.saveAlerts();
    }
    return deleted;
  }

  /**
   * Get all active alerts
   */
  getAlerts(): RateAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.active);
  }

  /**
   * Check if any alerts should trigger
   */
  private async checkAlerts(rates: ExchangeRateResponse): Promise<void> {
    const activeAlerts = this.getAlerts();
    
    for (const alert of activeAlerts) {
      if (alert.fromCurrency !== rates.base) continue;

      const currentRate = rates.rates[alert.toCurrency];
      if (!currentRate) continue;

      let shouldTrigger = false;
      
      if (alert.condition === 'above' && currentRate > alert.targetRate) {
        shouldTrigger = true;
      } else if (alert.condition === 'below' && currentRate < alert.targetRate) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        this.triggerAlert(alert, currentRate);
      }
    }
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(alert: RateAlert, currentRate: number): Promise<void> {
    console.log('Alert triggered:', {
      ...alert,
      currentRate,
    });

    // In a real app, you would send a push notification here
    // await notificationService.sendRateAlert(alert, currentRate);

    // Deactivate one-time alerts
    alert.active = false;
    this.saveAlerts();
  }

  /**
   * Save alerts to storage
   */
  private async saveAlerts(): Promise<void> {
    try {
      const alertsArray = Array.from(this.alerts.values());
      await cacheStorage.set('rate_alerts', alertsArray);
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  }

  /**
   * Load alerts from storage
   */
  async loadAlerts(): Promise<void> {
    try {
      const saved = await cacheStorage.get<RateAlert[]>('rate_alerts');
      if (saved) {
        this.alerts.clear();
        saved.forEach(alert => {
          this.alerts.set(alert.id, alert);
        });
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(): Promise<CurrencyCode[]> {
    try {
      const cacheKey = 'supported_currencies';
      const cached = await cacheStorage.get<CurrencyCode[]>(cacheKey);

      if (cached) {
        return cached;
      }

      const response = await fetch(
        `${this.BASE_URL}/symbols?access_key=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const currencies = Object.keys(data.symbols) as CurrencyCode[];

      await cacheStorage.set(cacheKey, currencies, 7 * 24 * 3600000); // Cache for 7 days

      return currencies;
    } catch (error) {
      console.error('Failed to fetch supported currencies:', error);
      return ['USD', 'EUR', 'GBP', 'JPY', 'LKR']; // Fallback
    }
  }

  /**
   * Get rate fluctuation for a period
   */
  async getRateFluctuation(
    from: CurrencyCode,
    to: CurrencyCode,
    days: number = 30
  ): Promise<{
    startRate: number;
    endRate: number;
    change: number;
    percentageChange: number;
    high: number;
    low: number;
    average: number;
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const timeseries = await this.getTimeSeries(startDate, endDate, from, [to]);
      
      const rates = Object.values(timeseries.rates).map(day => day[to]);
      const startRate = rates[0];
      const endRate = rates[rates.length - 1];
      const change = endRate - startRate;
      const percentageChange = (change / startRate) * 100;
      const high = Math.max(...rates);
      const low = Math.min(...rates);
      const average = rates.reduce((a, b) => a + b, 0) / rates.length;

      return {
        startRate,
        endRate,
        change,
        percentageChange,
        high,
        low,
        average,
      };
    } catch (error) {
      console.error('Failed to get rate fluctuation:', error);
      throw error;
    }
  }
}

export default new ExchangeRateApi();