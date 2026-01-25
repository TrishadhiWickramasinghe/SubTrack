import MMKVStorage from 'react-native-mmkv-storage';

const MMKV = new MMKVStorage.Loader().initialize();

// Storage keys
const STORAGE_KEYS = {
  CACHE_PREFIX: 'cache_',
  CACHE_METADATA: 'cache_metadata',
  CACHE_EXPIRY_TIMES: 'cache_expiry_times',
};

// Default cache configuration
const DEFAULT_CACHE_CONFIG = {
  defaultTTL: 3600000, // 1 hour in milliseconds
  maxSize: 50, // Maximum number of cache entries
  enabled: true,
  autoCleanup: true,
  cleanupInterval: 86400000, // 24 hours
};

/**
 * Cache Storage Service
 * Handles caching of API responses, images, and other data
 */
class CacheStorage {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.initializeCache();
  }

  /**
   * Initialize cache storage
   */
  async initializeCache() {
    try {
      // Initialize metadata if not exists
      const metadata = await this.getCacheMetadata();
      if (!metadata) {
        await this.setCacheMetadata({
          totalEntries: 0,
          lastCleanup: new Date().toISOString(),
          totalHits: 0,
          totalMisses: 0,
          totalSize: 0,
        });
      }

      // Initialize expiry times if not exists
      const expiryTimes = await this.getExpiryTimes();
      if (!expiryTimes) {
        await MMKV.setMapAsync(STORAGE_KEYS.CACHE_EXPIRY_TIMES, {});
      }

      // Auto cleanup on initialization
      if (this.config.autoCleanup) {
        await this.cleanupExpiredEntries();
      }
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }

  /**
   * Generate cache key
   * @param {string} key
   * @returns {string}
   */
  generateCacheKey(key) {
    return `${STORAGE_KEYS.CACHE_PREFIX}${key}`;
  }

  /**
   * Get cache metadata
   * @returns {Promise<Object>}
   */
  async getCacheMetadata() {
    try {
      return await MMKV.getMapAsync(STORAGE_KEYS.CACHE_METADATA);
    } catch (error) {
      console.error('Error getting cache metadata:', error);
      return null;
    }
  }

  /**
   * Set cache metadata
   * @param {Object} metadata
   * @returns {Promise<boolean>}
   */
  async setCacheMetadata(metadata) {
    try {
      await MMKV.setMapAsync(STORAGE_KEYS.CACHE_METADATA, metadata);
      return true;
    } catch (error) {
      console.error('Error setting cache metadata:', error);
      return false;
    }
  }

  /**
   * Update cache metadata
   * @param {Object} updates
   * @returns {Promise<boolean>}
   */
  async updateCacheMetadata(updates) {
    try {
      const metadata = await this.getCacheMetadata();
      const updatedMetadata = { ...metadata, ...updates };
      return await this.setCacheMetadata(updatedMetadata);
    } catch (error) {
      console.error('Error updating cache metadata:', error);
      return false;
    }
  }

  /**
   * Get expiry times
   * @returns {Promise<Object>}
   */
  async getExpiryTimes() {
    try {
      return await MMKV.getMapAsync(STORAGE_KEYS.CACHE_EXPIRY_TIMES);
    } catch (error) {
      console.error('Error getting expiry times:', error);
      return {};
    }
  }

  /**
   * Set expiry time for a key
   * @param {string} key
   * @param {number} expiryTime
   * @returns {Promise<boolean>}
   */
  async setExpiryTime(key, expiryTime) {
    try {
      const expiryTimes = await this.getExpiryTimes();
      expiryTimes[key] = expiryTime;
      await MMKV.setMapAsync(STORAGE_KEYS.CACHE_EXPIRY_TIMES, expiryTimes);
      return true;
    } catch (error) {
      console.error('Error setting expiry time:', error);
      return false;
    }
  }

  /**
   * Remove expiry time for a key
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async removeExpiryTime(key) {
    try {
      const expiryTimes = await this.getExpiryTimes();
      delete expiryTimes[key];
      await MMKV.setMapAsync(STORAGE_KEYS.CACHE_EXPIRY_TIMES, expiryTimes);
      return true;
    } catch (error) {
      console.error('Error removing expiry time:', error);
      return false;
    }
  }

  /**
   * CORE CACHE OPERATIONS
   */

  /**
   * Set cache entry
   * @param {string} key
   * @param {any} value
   * @param {Object} options
   * @returns {Promise<boolean>}
   */
  async set(key, value, options = {}) {
    if (!this.config.enabled) return false;

    try {
      const cacheKey = this.generateCacheKey(key);
      const ttl = options.ttl || this.config.defaultTTL;
      const expiryTime = Date.now() + ttl;

      // Store the value
      await MMKV.setStringAsync(cacheKey, JSON.stringify(value));
      
      // Store expiry time
      await this.setExpiryTime(key, expiryTime);

      // Update metadata
      await this.updateCacheMetadata({
        totalEntries: (await this.getTotalEntries()) + 1,
        lastUpdated: new Date().toISOString(),
      });

      // Check cache size and cleanup if needed
      await this.enforceMaxSize();

      return true;
    } catch (error) {
      console.error(`Error setting cache for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get cache entry
   * @param {string} key
   * @returns {Promise<any>}
   */
  async get(key) {
    if (!this.config.enabled) return null;

    try {
      const cacheKey = this.generateCacheKey(key);
      const cachedValue = await MMKV.getStringAsync(cacheKey);

      if (!cachedValue) {
        await this.updateCacheMetadata({
          totalMisses: (await this.getTotalMisses()) + 1,
        });
        return null;
      }

      // Check if expired
      if (await this.isExpired(key)) {
        await this.remove(key);
        await this.updateCacheMetadata({
          totalMisses: (await this.getTotalMisses()) + 1,
        });
        return null;
      }

      await this.updateCacheMetadata({
        totalHits: (await this.getTotalHits()) + 1,
      });

      return JSON.parse(cachedValue);
    } catch (error) {
      console.error(`Error getting cache for key ${key}:`, error);
      await this.updateCacheMetadata({
        totalMisses: (await this.getTotalMisses()) + 1,
      });
      return null;
    }
  }

  /**
   * Remove cache entry
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async remove(key) {
    try {
      const cacheKey = this.generateCacheKey(key);
      await MMKV.removeItem(cacheKey);
      await this.removeExpiryTime(key);

      // Update metadata
      const totalEntries = await this.getTotalEntries();
      if (totalEntries > 0) {
        await this.updateCacheMetadata({
          totalEntries: totalEntries - 1,
        });
      }

      return true;
    } catch (error) {
      console.error(`Error removing cache for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if cache entry exists and is valid
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    if (!this.config.enabled) return false;

    try {
      const cacheKey = this.generateCacheKey(key);
      const exists = await MMKV.hasKey(cacheKey);
      
      if (!exists) return false;
      return !(await this.isExpired(key));
    } catch (error) {
      console.error(`Error checking cache for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   * @returns {Promise<boolean>}
   */
  async clearAll() {
    try {
      const allKeys = await MMKV.indexer.strings.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.CACHE_PREFIX));
      
      for (const key of cacheKeys) {
        await MMKV.removeItem(key);
      }

      // Clear expiry times
      await MMKV.setMapAsync(STORAGE_KEYS.CACHE_EXPIRY_TIMES, {});

      // Reset metadata
      await this.setCacheMetadata({
        totalEntries: 0,
        lastCleanup: new Date().toISOString(),
        totalHits: 0,
        totalMisses: 0,
        totalSize: 0,
      });

      return true;
    } catch (error) {
      console.error('Error clearing all cache:', error);
      return false;
    }
  }

  /**
   * Clear cache by prefix
   * @param {string} prefix
   * @returns {Promise<boolean>}
   */
  async clearByPrefix(prefix) {
    try {
      const allKeys = await MMKV.indexer.strings.getAllKeys();
      const cacheKeys = allKeys.filter(key => 
        key.startsWith(STORAGE_KEYS.CACHE_PREFIX) && 
        key.includes(prefix)
      );
      
      for (const key of cacheKeys) {
        await MMKV.removeItem(key);
        
        // Remove from expiry times
        const originalKey = key.replace(STORAGE_KEYS.CACHE_PREFIX, '');
        await this.removeExpiryTime(originalKey);
      }

      // Update metadata
      await this.updateCacheMetadata({
        totalEntries: await this.getTotalEntries(),
      });

      return true;
    } catch (error) {
      console.error(`Error clearing cache with prefix ${prefix}:`, error);
      return false;
    }
  }

  /**
   * CACHE MANAGEMENT
   */

  /**
   * Check if cache entry is expired
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async isExpired(key) {
    try {
      const expiryTimes = await this.getExpiryTimes();
      const expiryTime = expiryTimes[key];
      
      if (!expiryTime) return true;
      return Date.now() > expiryTime;
    } catch (error) {
      console.error(`Error checking expiry for key ${key}:`, error);
      return true;
    }
  }

  /**
   * Get total number of cache entries
   * @returns {Promise<number>}
   */
  async getTotalEntries() {
    try {
      const metadata = await this.getCacheMetadata();
      return metadata?.totalEntries || 0;
    } catch (error) {
      console.error('Error getting total entries:', error);
      return 0;
    }
  }

  /**
   * Get total cache hits
   * @returns {Promise<number>}
   */
  async getTotalHits() {
    try {
      const metadata = await this.getCacheMetadata();
      return metadata?.totalHits || 0;
    } catch (error) {
      console.error('Error getting total hits:', error);
      return 0;
    }
  }

  /**
   * Get total cache misses
   * @returns {Promise<number>}
   */
  async getTotalMisses() {
    try {
      const metadata = await this.getCacheMetadata();
      return metadata?.totalMisses || 0;
    } catch (error) {
      console.error('Error getting total misses:', error);
      return 0;
    }
  }

  /**
   * Get cache hit rate
   * @returns {Promise<number>}
   */
  async getHitRate() {
    try {
      const hits = await this.getTotalHits();
      const misses = await this.getTotalMisses();
      const total = hits + misses;
      
      return total > 0 ? (hits / total) * 100 : 0;
    } catch (error) {
      console.error('Error getting hit rate:', error);
      return 0;
    }
  }

  /**
   * Get all cache keys
   * @returns {Promise<Array<string>>}
   */
  async getAllKeys() {
    try {
      const allKeys = await MMKV.indexer.strings.getAllKeys();
      return allKeys
        .filter(key => key.startsWith(STORAGE_KEYS.CACHE_PREFIX))
        .map(key => key.replace(STORAGE_KEYS.CACHE_PREFIX, ''));
    } catch (error) {
      console.error('Error getting all cache keys:', error);
      return [];
    }
  }

  /**
   * Get cache info
   * @returns {Promise<Object>}
   */
  async getCacheInfo() {
    try {
      const metadata = await this.getCacheMetadata();
      const totalEntries = await this.getTotalEntries();
      const hitRate = await this.getHitRate();
      const allKeys = await this.getAllKeys();

      return {
        totalEntries,
        hitRate: hitRate.toFixed(2),
        totalHits: metadata?.totalHits || 0,
        totalMisses: metadata?.totalMisses || 0,
        lastCleanup: metadata?.lastCleanup,
        lastUpdated: metadata?.lastUpdated,
        enabled: this.config.enabled,
        maxSize: this.config.maxSize,
        cacheKeys: allKeys,
      };
    } catch (error) {
      console.error('Error getting cache info:', error);
      return {};
    }
  }

  /**
   * Enforce maximum cache size
   * @returns {Promise<boolean>}
   */
  async enforceMaxSize() {
    try {
      const totalEntries = await this.getTotalEntries();
      
      if (totalEntries <= this.config.maxSize) {
        return true;
      }

      // Get all cache entries with their expiry times
      const expiryTimes = await this.getExpiryTimes();
      const entries = Object.entries(expiryTimes);
      
      // Sort by expiry time (oldest first)
      entries.sort((a, b) => a[1] - b[1]);
      
      // Remove oldest entries until we're under the limit
      const entriesToRemove = entries.slice(0, totalEntries - this.config.maxSize);
      
      for (const [key] of entriesToRemove) {
        await this.remove(key);
      }

      return true;
    } catch (error) {
      console.error('Error enforcing max cache size:', error);
      return false;
    }
  }

  /**
   * Cleanup expired cache entries
   * @returns {Promise<number>} - Number of entries cleaned up
   */
  async cleanupExpiredEntries() {
    try {
      const expiryTimes = await this.getExpiryTimes();
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, expiryTime] of Object.entries(expiryTimes)) {
        if (expiryTime < now) {
          await this.remove(key);
          cleanedCount++;
        }
      }

      // Update metadata
      if (cleanedCount > 0) {
        await this.updateCacheMetadata({
          lastCleanup: new Date().toISOString(),
        });
      }

      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired cache entries:', error);
      return 0;
    }
  }

  /**
   * CACHE STRATEGIES
   */

  /**
   * Get or fetch data with caching
   * @param {string} key
   * @param {Function} fetchFunction
   * @param {Object} options
   * @returns {Promise<any>}
   */
  async getOrFetch(key, fetchFunction, options = {}) {
    // Check cache first
    const cachedData = await this.get(key);
    if (cachedData !== null) {
      return cachedData;
    }

    // Fetch fresh data
    try {
      const freshData = await fetchFunction();
      
      // Cache the fresh data
      if (freshData !== null && freshData !== undefined) {
        await this.set(key, freshData, options);
      }
      
      return freshData;
    } catch (error) {
      console.error(`Error fetching data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Cache API response
   * @param {string} url
   * @param {Object} response
   * @param {Object} options
   * @returns {Promise<boolean>}
   */
  async cacheApiResponse(url, response, options = {}) {
    const cacheKey = `api_${this.hashString(url)}`;
    return await this.set(cacheKey, response, options);
  }

  /**
   * Get cached API response
   * @param {string} url
   * @returns {Promise<any>}
   */
  async getCachedApiResponse(url) {
    const cacheKey = `api_${this.hashString(url)}`;
    return await this.get(cacheKey);
  }

  /**
   * Cache image
   * @param {string} imageUrl
   * @param {string} base64Data
   * @param {Object} options
   * @returns {Promise<boolean>}
   */
  async cacheImage(imageUrl, base64Data, options = {}) {
    const cacheKey = `image_${this.hashString(imageUrl)}`;
    return await this.set(cacheKey, base64Data, options);
  }

  /**
   * Get cached image
   * @param {string} imageUrl
   * @returns {Promise<string|null>}
   */
  async getCachedImage(imageUrl) {
    const cacheKey = `image_${this.hashString(imageUrl)}`;
    return await this.get(cacheKey);
  }

  /**
   * Cache exchange rates
   * @param {string} baseCurrency
   * @param {Object} rates
   * @returns {Promise<boolean>}
   */
  async cacheExchangeRates(baseCurrency, rates) {
    const cacheKey = `exchange_rates_${baseCurrency}`;
    const cacheOptions = {
      ttl: 3600000, // 1 hour
    };
    return await this.set(cacheKey, rates, cacheOptions);
  }

  /**
   * Get cached exchange rates
   * @param {string} baseCurrency
   * @returns {Promise<Object|null>}
   */
  async getCachedExchangeRates(baseCurrency) {
    const cacheKey = `exchange_rates_${baseCurrency}`;
    return await this.get(cacheKey);
  }

  /**
   * Cache currency conversion
   * @param {number} amount
   * @param {string} fromCurrency
   * @param {string} toCurrency
   * @param {number} convertedAmount
   * @returns {Promise<boolean>}
   */
  async cacheCurrencyConversion(amount, fromCurrency, toCurrency, convertedAmount) {
    const cacheKey = `conversion_${amount}_${fromCurrency}_${toCurrency}`;
    const cacheOptions = {
      ttl: 86400000, // 24 hours
    };
    return await this.set(cacheKey, convertedAmount, cacheOptions);
  }

  /**
   * Get cached currency conversion
   * @param {number} amount
   * @param {string} fromCurrency
   * @param {string} toCurrency
   * @returns {Promise<number|null>}
   */
  async getCachedCurrencyConversion(amount, fromCurrency, toCurrency) {
    const cacheKey = `conversion_${amount}_${fromCurrency}_${toCurrency}`;
    return await this.get(cacheKey);
  }

  /**
   * Cache subscription stats
   * @param {Object} stats
   * @returns {Promise<boolean>}
   */
  async cacheSubscriptionStats(stats) {
    const cacheKey = 'subscription_stats';
    const cacheOptions = {
      ttl: 300000, // 5 minutes
    };
    return await this.set(cacheKey, stats, cacheOptions);
  }

  /**
   * Get cached subscription stats
   * @returns {Promise<Object|null>}
   */
  async getCachedSubscriptionStats() {
    const cacheKey = 'subscription_stats';
    return await this.get(cacheKey);
  }

  /**
   * UTILITY METHODS
   */

  /**
   * Hash a string (simple implementation)
   * @param {string} str
   * @returns {string}
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Enable/disable cache
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.config.enabled = enabled;
  }

  /**
   * Set cache TTL
   * @param {number} ttl - Time to live in milliseconds
   */
  setTTL(ttl) {
    this.config.defaultTTL = ttl;
  }

  /**
   * Set maximum cache size
   * @param {number} maxSize
   */
  setMaxSize(maxSize) {
    this.config.maxSize = maxSize;
    this.enforceMaxSize();
  }

  /**
   * Export cache data
   * @returns {Promise<Object>}
   */
  async exportCache() {
    try {
      const allKeys = await this.getAllKeys();
      const cacheData = {};

      for (const key of allKeys) {
        const value = await this.get(key);
        if (value !== null) {
          cacheData[key] = value;
        }
      }

      return {
        data: cacheData,
        metadata: await this.getCacheMetadata(),
        expiryTimes: await this.getExpiryTimes(),
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exporting cache:', error);
      throw error;
    }
  }

  /**
   * Import cache data
   * @param {Object} cacheData
   * @returns {Promise<boolean>}
   */
  async importCache(cacheData) {
    try {
      if (cacheData.data) {
        for (const [key, value] of Object.entries(cacheData.data)) {
          await this.set(key, value);
        }
      }

      if (cacheData.expiryTimes) {
        await MMKV.setMapAsync(STORAGE_KEYS.CACHE_EXPIRY_TIMES, cacheData.expiryTimes);
      }

      return true;
    } catch (error) {
      console.error('Error importing cache:', error);
      return false;
    }
  }
}

// Create singleton instance with default configuration
const cacheStorage = new CacheStorage();
export default cacheStorage;