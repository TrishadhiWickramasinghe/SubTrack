/**
 * MMKV Storage Service for SubTrack
 * Fast, encrypted key-value storage for React Native
 */

import { MMKV } from 'react-native-mmkv';
import crypto from 'react-native-quick-crypto';

// Encryption key (in production, use secure key storage)
const ENCRYPTION_KEY = 'subtrack-secure-key-2024';
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

/**
 * Enhanced MMKV Storage with encryption support
 */
class MMKVStorage {
  constructor() {
    // Initialize MMKV instances for different data types
    this.instances = {
      // Main instance for user data (encrypted)
      user: new MMKV({
        id: 'subtrack_user_storage',
        encryptionKey: ENCRYPTION_KEY,
      }),
      
      // Fast cache instance (no encryption for speed)
      cache: new MMKV({
        id: 'subtrack_cache_storage',
        encryptionKey: null,
      }),
      
      // Settings instance
      settings: new MMKV({
        id: 'subtrack_settings_storage',
        encryptionKey: ENCRYPTION_KEY,
      }),
      
      // Analytics instance
      analytics: new MMKV({
        id: 'subtrack_analytics_storage',
        encryptionKey: null,
      }),
    };
    
    this.migrationComplete = false;
    this.initialize();
  }

  /**
   * Initialize storage
   */
  async initialize() {
    try {
      // Perform migration from AsyncStorage if needed
      await this.migrateFromAsyncStorage();
      
      // Clear expired cache entries
      await this.clearExpiredCache();
      
      // Initialize default settings
      await this.initializeDefaultSettings();
      
      this.migrationComplete = true;
      console.log('MMKV Storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MMKV storage:', error);
    }
  }

  /**
   * Migrate data from AsyncStorage to MMKV
   */
  async migrateFromAsyncStorage() {
    try {
      // Check if migration has already been done
      const migrationDone = this.get('cache', 'migration_complete');
      if (migrationDone) {
        console.log('Migration already completed');
        return;
      }

      console.log('Starting migration from AsyncStorage...');
      
      // You would implement actual AsyncStorage migration here
      // For now, we'll just mark migration as complete
      this.set('cache', 'migration_complete', true);
      this.set('cache', 'migration_date', new Date().toISOString());
      
      console.log('Migration completed');
    } catch (error) {
      console.error('Migration failed:', error);
      // Don't throw - continue without migration
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache() {
    try {
      const cacheKeys = this.instances.cache.getAllKeys();
      const now = Date.now();
      
      for (const key of cacheKeys) {
        if (key.startsWith('cache_')) {
          const cacheEntry = this.get('cache', key);
          if (cacheEntry && cacheEntry.expiresAt && cacheEntry.expiresAt < now) {
            this.instances.cache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  /**
   * Initialize default settings
   */
  async initializeDefaultSettings() {
    try {
      // Check if default settings are already set
      const settingsInitialized = this.get('settings', 'settings_initialized');
      if (settingsInitialized) return;
      
      const defaultSettings = {
        theme: 'auto',
        currency: 'USD',
        language: 'en',
        notifications: true,
        biometric_auth: false,
        auto_backup: false,
        first_launch: true,
      };
      
      // Set default settings
      Object.entries(defaultSettings).forEach(([key, value]) => {
        if (!this.instances.settings.contains(key)) {
          this.set('settings', key, value);
        }
      });
      
      this.set('settings', 'settings_initialized', true);
      this.set('settings', 'initialized_at', new Date().toISOString());
    } catch (error) {
      console.error('Error initializing default settings:', error);
    }
  }

  /**
   * Set value in storage
   */
  set(instanceName, key, value) {
    try {
      const instance = this.instances[instanceName];
      if (!instance) {
        throw new Error(`Invalid instance name: ${instanceName}`);
      }
      
      if (value === undefined || value === null) {
        instance.delete(key);
        return true;
      }
      
      // Handle different data types
      if (typeof value === 'string') {
        instance.set(key, value);
      } else if (typeof value === 'number') {
        instance.set(key, value);
      } else if (typeof value === 'boolean') {
        instance.set(key, value);
      } else {
        // For objects and arrays, stringify
        instance.set(key, JSON.stringify(value));
      }
      
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in ${instanceName}:`, error);
      return false;
    }
  }

  /**
   * Get value from storage
   */
  get(instanceName, key, defaultValue = null) {
    try {
      const instance = this.instances[instanceName];
      if (!instance) {
        throw new Error(`Invalid instance name: ${instanceName}`);
      }
      
      if (!instance.contains(key)) {
        return defaultValue;
      }
      
      const type = instance.getType(key);
      
      switch (type) {
        case 'string':
          const stringValue = instance.getString(key);
          try {
            // Try to parse JSON
            return JSON.parse(stringValue);
          } catch {
            return stringValue;
          }
        case 'number':
          return instance.getNumber(key);
        case 'boolean':
          return instance.getBoolean(key);
        default:
          return defaultValue;
      }
    } catch (error) {
      console.error(`Error getting ${key} from ${instanceName}:`, error);
      return defaultValue;
    }
  }

  /**
   * Delete value from storage
   */
  delete(instanceName, key) {
    try {
      const instance = this.instances[instanceName];
      if (!instance) {
        throw new Error(`Invalid instance name: ${instanceName}`);
      }
      
      instance.delete(key);
      return true;
    } catch (error) {
      console.error(`Error deleting ${key} from ${instanceName}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  has(instanceName, key) {
    try {
      const instance = this.instances[instanceName];
      if (!instance) {
        throw new Error(`Invalid instance name: ${instanceName}`);
      }
      
      return instance.contains(key);
    } catch (error) {
      console.error(`Error checking ${key} in ${instanceName}:`, error);
      return false;
    }
  }

  /**
   * Get all keys from instance
   */
  getAllKeys(instanceName) {
    try {
      const instance = this.instances[instanceName];
      if (!instance) {
        throw new Error(`Invalid instance name: ${instanceName}`);
      }
      
      return instance.getAllKeys();
    } catch (error) {
      console.error(`Error getting keys from ${instanceName}:`, error);
      return [];
    }
  }

  /**
   * Clear all data from instance
   */
  clear(instanceName) {
    try {
      const instance = this.instances[instanceName];
      if (!instance) {
        throw new Error(`Invalid instance name: ${instanceName}`);
      }
      
      instance.clearAll();
      return true;
    } catch (error) {
      console.error(`Error clearing ${instanceName}:`, error);
      return false;
    }
  }

  /**
   * Clear all storage instances
   */
  clearAll() {
    try {
      Object.values(this.instances).forEach(instance => {
        instance.clearAll();
      });
      return true;
    } catch (error) {
      console.error('Error clearing all storage:', error);
      return false;
    }
  }

  /**
   * Set with encryption
   */
  setEncrypted(key, value, instanceName = 'user') {
    try {
      if (!value || typeof value !== 'object') {
        return this.set(instanceName, key, value);
      }
      
      // Convert to string for encryption
      const dataString = JSON.stringify(value);
      
      // Generate random IV
      const iv = crypto.randomBytes(16);
      
      // Create cipher
      const cipher = crypto.createCipheriv(
        ENCRYPTION_ALGORITHM,
        Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)),
        iv
      );
      
      // Encrypt data
      let encrypted = cipher.update(dataString, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get auth tag
      const authTag = cipher.getAuthTag();
      
      // Store encrypted data with IV and auth tag
      const encryptedData = {
        iv: iv.toString('hex'),
        data: encrypted,
        authTag: authTag.toString('hex'),
        timestamp: Date.now(),
      };
      
      return this.set(instanceName, key, encryptedData);
    } catch (error) {
      console.error(`Error encrypting ${key}:`, error);
      // Fallback to regular storage
      return this.set(instanceName, key, value);
    }
  }

  /**
   * Get encrypted data
   */
  getEncrypted(key, defaultValue = null, instanceName = 'user') {
    try {
      const encryptedData = this.get(instanceName, key);
      
      if (!encryptedData || !encryptedData.iv || !encryptedData.data) {
        return encryptedData || defaultValue;
      }
      
      // Create decipher
      const decipher = crypto.createDecipheriv(
        ENCRYPTION_ALGORITHM,
        Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)),
        Buffer.from(encryptedData.iv, 'hex')
      );
      
      // Set auth tag
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      // Decrypt data
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Parse JSON
      return JSON.parse(decrypted);
    } catch (error) {
      console.error(`Error decrypting ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Cache management
   */
  setCache(key, value, ttl = 3600000) { // Default 1 hour
    const cacheEntry = {
      data: value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
    };
    
    return this.set('cache', `cache_${key}`, cacheEntry);
  }

  getCache(key, defaultValue = null) {
    const cacheEntry = this.get('cache', `cache_${key}`);
    
    if (!cacheEntry) {
      return defaultValue;
    }
    
    // Check if cache has expired
    if (cacheEntry.expiresAt && cacheEntry.expiresAt < Date.now()) {
      this.delete('cache', `cache_${key}`);
      return defaultValue;
    }
    
    return cacheEntry.data;
  }

  clearExpiredCacheEntries() {
    return this.clearExpiredCache();
  }

  /**
   * Backup data to string
   */
  backup() {
    try {
      const backupData = {};
      
      // Backup each instance
      Object.entries(this.instances).forEach(([instanceName, instance]) => {
        const keys = instance.getAllKeys();
        const data = {};
        
        keys.forEach(key => {
          const type = instance.getType(key);
          
          switch (type) {
            case 'string':
              data[key] = instance.getString(key);
              break;
            case 'number':
              data[key] = instance.getNumber(key);
              break;
            case 'boolean':
              data[key] = instance.getBoolean(key);
              break;
          }
        });
        
        backupData[instanceName] = data;
      });
      
      return {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: backupData,
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }

  /**
   * Restore from backup
   */
  restore(backupData) {
    try {
      if (!backupData || !backupData.data) {
        throw new Error('Invalid backup data');
      }
      
      // Clear existing data
      this.clearAll();
      
      // Restore data
      Object.entries(backupData.data).forEach(([instanceName, data]) => {
        const instance = this.instances[instanceName];
        if (instance) {
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'string') {
              instance.set(key, value);
            } else if (typeof value === 'number') {
              instance.set(key, value);
            } else if (typeof value === 'boolean') {
              instance.set(key, value);
            }
          });
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  getStats() {
    try {
      const stats = {};
      
      Object.entries(this.instances).forEach(([instanceName, instance]) => {
        const keys = instance.getAllKeys();
        let totalSize = 0;
        
        // Estimate size (this is approximate)
        keys.forEach(key => {
          const type = instance.getType(key);
          let value;
          
          switch (type) {
            case 'string':
              value = instance.getString(key);
              totalSize += value.length;
              break;
            case 'number':
              totalSize += 8; // Approximate size for number
              break;
            case 'boolean':
              totalSize += 1; // Approximate size for boolean
              break;
          }
        });
        
        stats[instanceName] = {
          keyCount: keys.length,
          estimatedSize: totalSize,
          keys: keys.slice(0, 10), // First 10 keys
        };
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return null;
    }
  }
}

// Create singleton instance
const mmkvStorage = new MMKVStorage();

// Export the singleton instance
export default mmkvStorage;

// Convenience functions
export const storage = {
  // User data
  setUserData: (key, value) => mmkvStorage.set('user', key, value),
  getUserData: (key, defaultValue = null) => mmkvStorage.get('user', key, defaultValue),
  deleteUserData: (key) => mmkvStorage.delete('user', key),
  hasUserData: (key) => mmkvStorage.has('user', key),
  
  // Settings
  setSetting: (key, value) => mmkvStorage.set('settings', key, value),
  getSetting: (key, defaultValue = null) => mmkvStorage.get('settings', key, defaultValue),
  
  // Cache
  setCache: (key, value, ttl) => mmkvStorage.setCache(key, value, ttl),
  getCache: (key, defaultValue = null) => mmkvStorage.getCache(key, defaultValue),
  clearCache: () => mmkvStorage.clear('cache'),
  
  // Secure storage
  setSecure: (key, value) => mmkvStorage.setEncrypted(key, value),
  getSecure: (key, defaultValue = null) => mmkvStorage.getEncrypted(key, defaultValue),
  
  // Backup/Restore
  backup: () => mmkvStorage.backup(),
  restore: (backupData) => mmkvStorage.restore(backupData),
  
  // Stats
  getStats: () => mmkvStorage.getStats(),
  
  // Clear all
  clearAll: () => mmkvStorage.clearAll(),
};