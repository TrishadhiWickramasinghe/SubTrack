// TODO: Implement AppContext
// import { useApp } from '@context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Implement analytics service
// import { analyticsService } from '@services/analytics/analyticsService';
// TODO: Implement cloud sync service
// import { syncService } from '@services/backup/cloudSync';
// TODO: Implement storage services
// import cacheStorage from '@services/storage/cacheStorage';
// import settingsStorage from '@services/storage/settingsStorage';
// import subscriptionStorage from '@services/storage/subscriptionStorage';
// TODO: Install expo-document-picker
// import * as DocumentPicker from 'expo-document-picker';
// TODO: Update expo-file-system API usage
// import * as FileSystem from 'expo-file-system';
// TODO: Install expo-sharing
// import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Platform } from 'react-native';

// Stub implementations
const useApp = () => ({
  settings: {
    backup: {
      autoBackup: false,
      backupFrequency: 'daily' as const,
      lastCloudBackup: null,
      cloudBackup: false,
      includeCache: true,
    },
  },
  isConnected: true,
});

const subscriptionStorage = {
  getSubscriptions: async () => [],
  exportData: async () => ({}),
  importData: async (data: any) => {},
  clearAllData: async () => {},
};

const cacheStorage = {
  getCacheInfo: async () => ({ size: 0, totalEntries: 0, total: 0 }),
  exportCache: async () => ({}),
  importCache: async (data: any) => {},
  clearAll: async () => {},
};

const settingsStorage = {
  getSettings: async () => ({
    backup: {
      autoBackup: false,
      backupFrequency: 'daily' as const,
      lastCloudBackup: null,
      cloudBackup: false,
      includeCache: true,
    }
  }),
  exportSettings: async () => ({}),
  importSettings: async (data: string) => {},
  setLastBackupTimestamp: async () => {},
  clearAllSettings: async () => {},
};

const analyticsService = {
  trackEvent: async (event: string, props?: any) => {},
};

const syncService = {
  sync: async () => {},
  uploadBackup: async (data: any) => {},
  downloadBackup: async (id: string) => ({
    version: '1.0',
    timestamp: new Date().toISOString(),
    device: 'unknown',
    data: { subscriptions: [], settings: {}, cache: {} }
  }),
};

// Stub FileSystem implementation since expo-file-system is not properly set up
const FileSystem = {
  documentDirectory: '/documents/',
  getInfoAsync: async (path: string) => ({ exists: true, isDirectory: false, uri: path, size: 0, modificationTime: new Date() }),
  readDirectoryAsync: async (path: string) => [],
  makeDirectoryAsync: async (path: string, options?: any) => {},
  writeAsStringAsync: async (path: string, content: string, options?: any) => {},
  readAsStringAsync: async (path: string) => '',
  deleteAsync: async (path: string) => {},
  EncodingType: { UTF8: 'utf8' },
};

// Stub Sharing implementation
const Sharing = {
  isAvailableAsync: async () => false,
  shareAsync: async (uri: string, options?: any) => {},
};

// Stub DocumentPicker implementation  
const DocumentPicker = {
  getDocumentAsync: async (options?: any) => ({ type: 'cancel', cancelled: true }),
};

// Type definitions
export interface BackupMetadata {
  path: string;
  filename: string;
  size: number;
  timestamp: string;
  type: 'local' | 'cloud';
}

export interface StorageInfo {
  totalSize: number;
  subscriptionCount: number;
  cacheSize: number;
  backupCount: number;
}

export interface BackupStatus {
  local: 'idle' | 'enabled' | 'disabled';
  cloud: 'idle' | 'enabled' | 'disabled';
  lastSync: string | null;
}

export interface BackupFile {
  path: string;
  filename: string;
  size: number;
  timestamp: string;
}

export interface StorageProgress {
  backup: number;
  restore: number;
}

export interface UseStorageReturn {
  // State
  isLoading: boolean;
  backupProgress: number;
  restoreProgress: number;
  lastBackup: string | null;
  lastRestore: string | null;
  storageInfo: StorageInfo;
  error: string | null;
  backupStatus: BackupStatus;
  
  // Backup operations
  performBackup: (type?: 'manual' | 'auto', destination?: 'local' | 'cloud' | 'both') => Promise<void>;
  getAvailableBackups: () => Promise<BackupFile[]>;
  deleteBackup: (backupId: string) => Promise<boolean>;
  
  // Restore operations
  restoreFromBackup: (source?: 'local' | 'cloud', backupId?: string) => Promise<void>;
  
  // Import/Export operations
  exportData: (format?: 'json' | 'csv') => Promise<string>;
  importData: () => Promise<void>;
  
  // Storage management
  clearAllData: () => Promise<void>;
  clearCache: () => Promise<void>;
  calculateStorageUsage: () => Promise<StorageInfo | null>;
  loadStorageInfo: () => Promise<void>;
  
  // Error handling
  clearError: () => void;
}

export interface BackupData {
  version: string;
  timestamp: string;
  device: {
    platform: string;
    version: string | number;
  };
  data: {
    subscriptions: any;
    settings: any;
    cache: any;
  };
}

// Default values
const DEFAULT_STORAGE_INFO: StorageInfo = {
  totalSize: 0,
  subscriptionCount: 0,
  cacheSize: 0,
  backupCount: 0,
};

const DEFAULT_BACKUP_STATUS: BackupStatus = {
  local: 'idle',
  cloud: 'idle',
  lastSync: null,
};

/**
 * Custom hook for comprehensive storage management
 * Handles data persistence, backup, restore, import/export, and cache management
 */
export const useStorage = (): UseStorageReturn => {
  const { settings, isConnected } = useApp();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [backupProgress, setBackupProgress] = useState<number>(0);
  const [restoreProgress, setRestoreProgress] = useState<number>(0);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [lastRestore, setLastRestore] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>(DEFAULT_STORAGE_INFO);
  const [error, setError] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<BackupStatus>(DEFAULT_BACKUP_STATUS);
  
  const backupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  /**
   * Initialize storage monitoring
   */
  useEffect(() => {
    loadStorageInfo();
    checkBackupStatus();
    setupAppStateListener();
    
    // Set up periodic backup if enabled
    setupAutoBackup();
    
    return () => {
      cleanupAutoBackup();
    };
  }, [settings]);

  const setupAppStateListener = () => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  };

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground
      if (settings?.backup.autoBackup) {
        checkAndPerformAutoBackup();
      }
    }
    appStateRef.current = nextAppState;
  }, [settings]);

  const setupAutoBackup = useCallback(() => {
    if (settings?.backup.autoBackup && settings.backup.backupFrequency !== 'manual') {
      const interval = getBackupInterval(settings.backup.backupFrequency);
      backupIntervalRef.current = setInterval(() => {
        checkAndPerformAutoBackup();
      }, interval);
    }
  }, [settings]);

  const cleanupAutoBackup = useCallback(() => {
    if (backupIntervalRef.current) {
      clearInterval(backupIntervalRef.current);
      backupIntervalRef.current = null;
    }
  }, []);

  /**
   * Get backup interval based on frequency
   */
  const getBackupInterval = useCallback((frequency: string): number => {
    switch (frequency) {
      case 'hourly':
        return 3600000; // 1 hour
      case 'daily':
        return 86400000; // 24 hours
      case 'weekly':
        return 604800000; // 7 days
      default:
        return 86400000; // Default to daily
    }
  }, []);

  /**
   * Load storage information
   */
  const loadStorageInfo = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const [
        subscriptions,
        cacheStats,
        backupInfo,
      ] = await Promise.all([
        subscriptionStorage.getSubscriptions(),
        cacheStorage.getCacheInfo(),
        getBackupInfo(),
      ]);
      
      // Calculate total storage size (simplified)
      const subscriptionsSize = JSON.stringify(subscriptions).length;
      const cacheSize = (cacheStats.totalEntries || 0) * 1000; // Approximate
      
      setStorageInfo({
        totalSize: subscriptionsSize + cacheSize,
        subscriptionCount: subscriptions.length,
        cacheSize,
        backupCount: backupInfo.count,
      });
      
      setLastBackup(backupInfo.lastBackup);
      
    } catch (error) {
      console.error('Error loading storage info:', error);
      setError('Failed to load storage information');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check backup status
   */
  const checkBackupStatus = useCallback(async (): Promise<void> => {
    try {
      const settings = await settingsStorage.getSettings();
      const backupSettings = settings.backup;
      
      setBackupStatus({
        local: backupSettings.autoBackup ? 'enabled' : 'disabled',
        cloud: backupSettings.cloudBackup ? 'enabled' : 'disabled',
        lastSync: backupSettings.lastCloudBackup,
      });
      
    } catch (error) {
      console.error('Error checking backup status:', error);
    }
  }, []);

  /**
   * Check and perform auto backup
   */
  const checkAndPerformAutoBackup = useCallback(async (): Promise<void> => {
    try {
      const settings = await settingsStorage.getSettings();
      
      if (!settings.backup.autoBackup) return;
      
      const lastBackupTime = settings.backup.lastCloudBackup
        ? new Date(settings.backup.lastCloudBackup)
        : null;
      
      const now = new Date();
      const hoursSinceLastBackup = lastBackupTime
        ? (now.getTime() - lastBackupTime.getTime()) / (1000 * 60 * 60)
        : Infinity;
      
      const backupInterval = getBackupInterval(settings.backup.backupFrequency);
      const hoursNeeded = backupInterval / (1000 * 60 * 60);
      
      if (hoursSinceLastBackup >= hoursNeeded) {
        await performBackup('auto', settings.backup.cloudBackup ? 'cloud' : 'local');
      }
      
    } catch (error) {
      console.error('Error in auto backup check:', error);
    }
  }, [getBackupInterval]);

  /**
   * Get backup information
   */
  const getBackupInfo = useCallback(async (): Promise<{ count: number; lastBackup: string | null }> => {
    try {
      const backupDir = `${FileSystem.documentDirectory}backups/`;
      const dirInfo = await FileSystem.getInfoAsync(backupDir);
      
      if (!dirInfo.exists) {
        return { count: 0, lastBackup: null };
      }
      
      const backupFiles = await FileSystem.readDirectoryAsync(backupDir);
      
      if (backupFiles.length === 0) {
        return { count: 0, lastBackup: null };
      }
      
      // Get latest backup
      const latestBackup = backupFiles.sort().reverse()[0];
      const filepath = `${backupDir}${latestBackup}`;
      const fileInfo = await FileSystem.getInfoAsync(filepath);
      
      return {
        count: backupFiles.length,
        lastBackup: fileInfo.modificationTime?.toISOString() || null,
      };
      
    } catch (error) {
      console.error('Error getting backup info:', error);
      return { count: 0, lastBackup: null };
    }
  }, []);

  /**
   * BACKUP OPERATIONS
   */

  /**
   * Perform backup
   * @param type - 'manual' or 'auto'
   * @param destination - 'local', 'cloud', or 'both'
   */
  const performBackup = useCallback(async (
    type: 'manual' | 'auto' = 'manual', 
    destination: 'local' | 'cloud' | 'both' = 'both'
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setBackupProgress(0);
      
      // Track analytics event
      await analyticsService.trackEvent('backup_started', {
        type,
        destination,
      });
      
      // Step 1: Prepare backup data
      setBackupProgress(10);
      
      const backupData: BackupData = await prepareBackupData();
      
      // Step 2: Create backup file
      setBackupProgress(30);
      
      const backupFile: BackupFile = await createBackupFile(backupData);
      
      // Step 3: Save to local storage
      if (destination === 'local' || destination === 'both') {
        setBackupProgress(50);
        await saveLocalBackup(backupFile);
      }
      
      // Step 4: Sync to cloud
      if ((destination === 'cloud' || destination === 'both') && isConnected) {
        setBackupProgress(70);
        await syncToCloud(backupFile);
      }
      
      // Step 5: Update backup status
      setBackupProgress(90);
      await updateBackupStatus();
      
      // Step 6: Clean up old backups
      setBackupProgress(95);
      await cleanupOldBackups();
      
      // Complete
      setBackupProgress(100);
      
      // Track success
      await analyticsService.trackEvent('backup_completed', {
        type,
        destination,
        size: backupFile.size,
      });
      
      // Show success message
      Alert.alert(
        'Backup Successful',
        `Your data has been backed up ${destination === 'both' ? 'locally and to the cloud' : destination === 'cloud' ? 'to the cloud' : 'locally'}.`,
        [{ text: 'OK' }]
      );
      
      // Reload storage info
      await loadStorageInfo();
      
    } catch (error) {
      console.error('Error performing backup:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Backup failed: ${errorMessage}`);
      
      // Track failure
      await analyticsService.trackEvent('backup_failed', {
        type,
        destination,
        error: errorMessage,
      });
      
      Alert.alert(
        'Backup Failed',
        `Unable to complete backup: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setBackupProgress(0), 1000);
    }
  }, [isConnected, loadStorageInfo]);

  /**
   * Prepare backup data
   */
  const prepareBackupData = useCallback(async (): Promise<BackupData> => {
    const [
      subscriptionData,
      settingsData,
      cacheData,
    ] = await Promise.all([
      subscriptionStorage.exportData(),
      settingsStorage.exportSettings(),
      cacheStorage.exportCache(),
    ]);
    
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      device: {
        platform: Platform.OS,
        version: Platform.Version,
      },
      data: {
        subscriptions: subscriptionData,
        settings: typeof settingsData === 'string' ? JSON.parse(settingsData) : settingsData,
        cache: cacheData,
      },
    };
  }, []);

  /**
   * Create backup file
   */
  const createBackupFile = useCallback(async (backupData: BackupData): Promise<BackupFile> => {
    const backupDir = `${FileSystem.documentDirectory}backups/`;
    
    // Create backups directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(backupDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
    }
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `subtrack-backup-${timestamp}.json`;
    const filepath = `${backupDir}${filename}`;
    
    // Write backup file
    const jsonString = JSON.stringify(backupData, null, 2);
    await FileSystem.writeAsStringAsync(filepath, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(filepath);
    
    return {
      path: filepath,
      filename,
      size: fileInfo.size || 0,
      timestamp: backupData.timestamp,
    };
  }, []);

  /**
   * Save local backup
   */
  const saveLocalBackup = useCallback(async (backupFile: BackupFile): Promise<void> => {
    // File is already saved during creation
    // Update backup metadata
    const backupMetadata: BackupMetadata = {
      path: backupFile.path,
      filename: backupFile.filename,
      size: backupFile.size,
      timestamp: backupFile.timestamp,
      type: 'local',
    };
    
    await saveBackupMetadata(backupMetadata);
  }, []);

  /**
   * Sync to cloud
   */
  const syncToCloud = useCallback(async (backupFile: BackupFile): Promise<void> => {
    // Read file content
    const fileContent = await FileSystem.readAsStringAsync(backupFile.path);
    const backupData = JSON.parse(fileContent);
    
    // Sync to cloud service
    await syncService.uploadBackup(backupData);
    
    // Update cloud backup timestamp
    await settingsStorage.setLastBackupTimestamp();
    
    // Update backup metadata
    const backupMetadata: BackupMetadata = {
      path: backupFile.path,
      filename: backupFile.filename,
      size: backupFile.size,
      timestamp: backupFile.timestamp,
      type: 'cloud',
    };
    
    await saveBackupMetadata(backupMetadata);
  }, []);

  /**
   * Save backup metadata
   */
  const saveBackupMetadata = useCallback(async (metadata: BackupMetadata): Promise<void> => {
    try {
      const existingMetadata = await AsyncStorage.getItem('backup_metadata');
      const backups: BackupMetadata[] = existingMetadata ? JSON.parse(existingMetadata) : [];
      
      // Add new backup metadata
      backups.push(metadata);
      
      // Keep only last 10 backups
      if (backups.length > 10) {
        backups.shift();
      }
      
      await AsyncStorage.setItem('backup_metadata', JSON.stringify(backups));
      
    } catch (error) {
      console.error('Error saving backup metadata:', error);
    }
  }, []);

  /**
   * Update backup status
   */
  const updateBackupStatus = useCallback(async (): Promise<void> => {
    const now = new Date().toISOString();
    setLastBackup(now);
    
    setBackupStatus(prev => ({
      ...prev,
      lastSync: now,
    }));
  }, []);

  /**
   * Cleanup old backups
   */
  const cleanupOldBackups = useCallback(async (): Promise<void> => {
    try {
      const backupDir = `${FileSystem.documentDirectory}backups/`;
      const backupFiles = await FileSystem.readDirectoryAsync(backupDir);
      
      // Sort files by modification time
      const filesWithInfo = await Promise.all(
        backupFiles.map(async (filename) => {
          const filepath = `${backupDir}${filename}`;
          const fileInfo = await FileSystem.getInfoAsync(filepath);
          return {
            filename,
            path: filepath,
            modificationTime: fileInfo.modificationTime?.getTime() || 0,
          };
        })
      );
      
      // Sort by modification time (oldest first)
      filesWithInfo.sort((a, b) => a.modificationTime - b.modificationTime);
      
      // Keep only last 5 backup files
      const filesToDelete = filesWithInfo.slice(0, -5);
      
      for (const file of filesToDelete) {
        await FileSystem.deleteAsync(file.path);
      }
      
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }, []);

  /**
   * Get available backups
   */
  const getAvailableBackups = useCallback(async (): Promise<BackupFile[]> => {
    try {
      const backupDir = `${FileSystem.documentDirectory}backups/`;
      const dirInfo = await FileSystem.getInfoAsync(backupDir);
      
      if (!dirInfo.exists) {
        return [];
      }
      
      const backupFiles = await FileSystem.readDirectoryAsync(backupDir);
      
      const backups = await Promise.all(
        backupFiles.map(async (filename) => {
          const filepath = `${backupDir}${filename}`;
          const fileInfo = await FileSystem.getInfoAsync(filepath);
          
          return {
            id: filepath,
            filename,
            size: fileInfo.size || 0,
            timestamp: fileInfo.modificationTime?.toISOString() || new Date().toISOString(),
            path: filepath,
          };
        })
      );
      
      // Sort by modification time (newest first)
      return backups.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
    } catch (error) {
      console.error('Error getting available backups:', error);
      return [];
    }
  }, []);

  /**
   * Delete specific backup
   */
  const deleteBackup = useCallback(async (backupId: string): Promise<boolean> => {
    try {
      await FileSystem.deleteAsync(backupId);
      
      // Reload storage info
      await loadStorageInfo();
      
      return true;
    } catch (error) {
      console.error('Error deleting backup:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to delete backup: ${errorMessage}`);
      return false;
    }
  }, [loadStorageInfo]);

  /**
   * RESTORE OPERATIONS
   */

  /**
   * Restore from backup
   * @param source - 'local' or 'cloud'
   * @param backupId - Specific backup to restore (optional)
   */
  const restoreFromBackup = useCallback(async (
    source: 'local' | 'cloud' = 'local', 
    backupId?: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setRestoreProgress(0);
      
      // Track analytics event
      await analyticsService.trackEvent('restore_started', { source });
      
      // Step 1: Get backup data
      setRestoreProgress(20);
      const backupData = await getBackupData(source, backupId);
      
      // Step 2: Validate backup data
      setRestoreProgress(30);
      const isValid = validateBackupData(backupData);
      
      if (!isValid) {
        throw new Error('Invalid backup data');
      }
      
      // Step 3: Create restore point (backup current data first)
      setRestoreProgress(40);
      await createRestorePoint();
      
      // Step 4: Restore data
      setRestoreProgress(60);
      await restoreData(backupData);
      
      // Step 5: Clear cache
      setRestoreProgress(80);
      await cacheStorage.clearAll();
      
      // Step 6: Update status
      setRestoreProgress(90);
      await updateRestoreStatus(backupData.timestamp);
      
      // Complete
      setRestoreProgress(100);
      
      // Track success
      await analyticsService.trackEvent('restore_completed', { source });
      
      // Show success message
      Alert.alert(
        'Restore Successful',
        'Your data has been restored successfully.',
        [{ text: 'OK' }]
      );
      
      // Reload storage info
      await loadStorageInfo();
      
    } catch (error) {
      console.error('Error restoring from backup:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Restore failed: ${errorMessage}`);
      
      // Track failure
      await analyticsService.trackEvent('restore_failed', {
        source,
        error: errorMessage,
      });
      
      Alert.alert(
        'Restore Failed',
        `Unable to restore data: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setRestoreProgress(0), 1000);
    }
  }, [loadStorageInfo]);

  /**
   * Get backup data from source
   */
  const getBackupData = useCallback(async (source: 'local' | 'cloud', backupId?: string): Promise<BackupData> => {
    if (source === 'cloud') {
      // Get from cloud service
      return await syncService.downloadBackup(backupId);
    } else {
      // Get from local storage
      if (backupId) {
        // Specific backup file
        const fileContent = await FileSystem.readAsStringAsync(backupId);
        return JSON.parse(fileContent);
      } else {
        // Latest backup file
        const backupDir = `${FileSystem.documentDirectory}backups/`;
        const backupFiles = await FileSystem.readDirectoryAsync(backupDir);
        
        if (backupFiles.length === 0) {
          throw new Error('No local backups found');
        }
        
        // Get most recent backup
        const latestBackup = backupFiles.sort().reverse()[0];
        const filepath = `${backupDir}${latestBackup}`;
        const fileContent = await FileSystem.readAsStringAsync(filepath);
        
        return JSON.parse(fileContent);
      }
    }
  }, []);

  /**
   * Validate backup data
   */
  const validateBackupData = useCallback((backupData: any): boolean => {
    if (!backupData || typeof backupData !== 'object') return false;
    if (!backupData.version || !backupData.timestamp) return false;
    if (!backupData.data || !backupData.data.subscriptions) return false;
    
    return true;
  }, []);

  /**
   * Create restore point
   */
  const createRestorePoint = useCallback(async (): Promise<void> => {
    try {
      // Create a quick backup before restoring
      const backupData = await prepareBackupData();
      const restorePointFile = await createBackupFile({
        ...backupData,
        isRestorePoint: true,
      } as BackupData);
      
      // Save restore point metadata
      await AsyncStorage.setItem('last_restore_point', restorePointFile.path);
      
    } catch (error) {
      console.warn('Failed to create restore point:', error);
      // Continue with restore even if restore point fails
    }
  }, [prepareBackupData, createBackupFile]);

  /**
   * Restore data
   */
  const restoreData = useCallback(async (backupData: BackupData): Promise<void> => {
    // Restore subscriptions
    if (backupData.data.subscriptions) {
      await subscriptionStorage.importData(backupData.data.subscriptions);
    }
    
    // Restore settings (except security settings)
    if (backupData.data.settings) {
      await settingsStorage.importSettings(JSON.stringify(backupData.data.settings));
    }
    
    // Restore cache (optional)
    if (backupData.data.cache && settings?.backup.includeCache) {
      await cacheStorage.importCache(backupData.data.cache);
    }
  }, [settings]);

  /**
   * Update restore status
   */
  const updateRestoreStatus = useCallback(async (timestamp: string): Promise<void> => {
    setLastRestore(timestamp);
  }, []);

  /**
   * IMPORT/EXPORT OPERATIONS
   */

  /**
   * Export data to file
   */
  const exportData = useCallback(async (format: 'json' | 'csv' = 'json'): Promise<string> => {
    try {
      setIsLoading(true);
      
      // Prepare data
      const exportData = await prepareBackupData();
      
      // Create export file
      const exportDir = `${FileSystem.documentDirectory}exports/`;
      const dirInfo = await FileSystem.getInfoAsync(exportDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `subtrack-export-${timestamp}.${format}`;
      const filepath = `${exportDir}${filename}`;
      
      let fileContent: string;
      if (format === 'csv') {
        fileContent = convertToCSV(exportData);
      } else {
        fileContent = JSON.stringify(exportData, null, 2);
      }
      
      await FileSystem.writeAsStringAsync(filepath, fileContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filepath, {
          mimeType: format === 'csv' ? 'text/csv' : 'application/json',
          dialogTitle: 'Export SubTrack Data',
        });
      }
      
      // Track analytics
      await analyticsService.trackEvent('data_exported', { format });
      
      return filepath;
      
    } catch (error) {
      console.error('Error exporting data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Export failed: ${errorMessage}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [prepareBackupData]);

  /**
   * Convert to CSV
   */
  const convertToCSV = useCallback((data: BackupData): string => {
    const subscriptions = data.data.subscriptions.subscriptions;
    
    if (!subscriptions || subscriptions.length === 0) {
      return 'No data to export';
    }
    
    // Create headers
    const headers = [
      'Name',
      'Category',
      'Amount',
      'Currency',
      'Billing Cycle',
      'Next Payment',
      'Status',
      'Notes',
    ];
    
    // Create rows
    const rows = subscriptions.map((sub: any) => [
      `"${sub.name || ''}"`,
      `"${sub.categoryId || ''}"`,
      sub.amount || '0',
      sub.currency || 'USD',
      sub.billingCycle || 'monthly',
      sub.nextPaymentDate || '',
      sub.isActive ? 'Active' : 'Inactive',
      `"${sub.notes || ''}"`,
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row: string[]) => row.join(',')),
    ].join('\n');
    
    return csvContent;
  }, []);

  /**
   * Import data from file
   */
  const importData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Pick file
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/csv'],
        copyToCacheDirectory: true,
      });
      
      if (result.type === 'cancel') {
        return;
      }
      
      if (!result.assets || result.assets.length === 0) {
        throw new Error('No file selected');
      }
      
      const file = result.assets[0];
      
      // Read file
      const fileContent = await FileSystem.readAsStringAsync(file.uri);
      
      // Parse based on file type
      let importData: any;
      if (file.name?.endsWith('.csv')) {
        importData = parseCSV(fileContent);
      } else {
        importData = JSON.parse(fileContent);
      }
      
      // Validate data
      if (!validateImportData(importData)) {
        throw new Error('Invalid import file format');
      }
      
      // Confirm import
      Alert.alert(
        'Confirm Import',
        'This will replace your current data. Are you sure you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                // Create restore point
                await createRestorePoint();
                
                // Import data
                await restoreData(importData);
                
                // Track analytics
                await analyticsService.trackEvent('data_imported', {
                  source: 'file',
                  format: file.name?.endsWith('.csv') ? 'csv' : 'json',
                });
                
                Alert.alert(
                  'Import Successful',
                  'Your data has been imported successfully.',
                  [{ text: 'OK' }]
                );
                
                // Reload storage info
                await loadStorageInfo();
                
              } catch (error) {
                console.error('Error importing data:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                setError(`Import failed: ${errorMessage}`);
                Alert.alert(
                  'Import Failed',
                  `Unable to import data: ${errorMessage}`,
                  [{ text: 'OK' }]
                );
              }
            },
          },
        ]
      );
      
    } catch (error) {
      console.error('Error importing data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Import failed: ${errorMessage}`);
      Alert.alert(
        'Import Failed',
        `Unable to import data: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [createRestorePoint, restoreData, loadStorageInfo]);

  /**
   * Parse CSV data
   */
  const parseCSV = useCallback((csvContent: string): any => {
    // Simple CSV parser for subscription data
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const subscriptions = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const subscription: any = {};
      
      headers.forEach((header, index) => {
        subscription[header.toLowerCase().replace(' ', '_')] = values[index];
      });
      
      return subscription;
    }).filter((sub: any) => sub.name); // Filter out empty rows
    
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        subscriptions: {
          subscriptions,
          categories: [],
          paymentHistory: [],
        },
      },
    };
  }, []);

  /**
   * Validate import data
   */
  const validateImportData = useCallback((data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    
    // Check for expected structure
    if (data.subscriptions || (data.data && data.data.subscriptions)) {
      return true;
    }
    
    return false;
  }, []);

  /**
   * STORAGE MANAGEMENT
   */

  /**
   * Clear all data
   */
  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      Alert.alert(
        'Clear All Data',
        'This will permanently delete all your subscriptions, settings, and cached data. This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                
                // Clear all storage
                await Promise.all([
                  subscriptionStorage.clearAllData(),
                  settingsStorage.clearAllSettings(),
                  cacheStorage.clearAll(),
                  AsyncStorage.clear(),
                ]);
                
                // Track analytics
                await analyticsService.trackEvent('data_cleared');
                
                Alert.alert(
                  'Data Cleared',
                  'All data has been cleared successfully.',
                  [{ text: 'OK' }]
                );
                
                // Reload storage info
                await loadStorageInfo();
                
              } catch (error) {
                console.error('Error clearing data:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                setError(`Failed to clear data: ${errorMessage}`);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in clear data confirmation:', error);
    }
  }, [loadStorageInfo]);

  /**
   * Clear cache
   */
  const clearCache = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      await cacheStorage.clearAll();
      
      // Track analytics
      await analyticsService.trackEvent('cache_cleared');
      
      // Reload storage info
      await loadStorageInfo();
      
      Alert.alert(
        'Cache Cleared',
        'All cached data has been cleared successfully.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error clearing cache:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to clear cache: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [loadStorageInfo]);

  /**
   * Calculate storage usage
   */
  const calculateStorageUsage = useCallback(async (): Promise<StorageInfo | null> => {
    try {
      const [subscriptions, cacheInfo] = await Promise.all([
        subscriptionStorage.getSubscriptions(),
        cacheStorage.getCacheInfo(),
      ]);
      
      const subscriptionSize = JSON.stringify(subscriptions).length;
      const cacheSize = (cacheInfo.totalEntries || 0) * 1000; // Approximate
      
      return {
        subscriptionSize,
        cacheSize,
        totalSize: subscriptionSize + cacheSize,
        subscriptionCount: subscriptions.length,
        cacheEntries: cacheInfo.totalEntries || 0,
      } as StorageInfo;
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return null;
    }
  }, []);

  /**
   * Format file size
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  /**
   * ERROR HANDLING
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Export all methods and state
   */
  return {
    // State
    isLoading,
    backupProgress,
    restoreProgress,
    lastBackup,
    lastRestore,
    storageInfo,
    error,
    backupStatus,
    
    // Backup operations
    performBackup,
    getAvailableBackups,
    deleteBackup,
    
    // Restore operations
    restoreFromBackup,
    
    // Import/Export operations
    exportData,
    importData,
    
    // Storage management
    clearAllData,
    clearCache,
    calculateStorageUsage,
    loadStorageInfo,
    
    // Error handling
    clearError,
  };
};

/**
 * Helper hooks for specific storage operations
 */

export const useBackup = () => {
  const {
    performBackup,
    backupProgress,
    lastBackup,
    backupStatus,
    getAvailableBackups,
    deleteBackup,
  } = useStorage();
  
  return {
    performBackup,
    backupProgress,
    lastBackup,
    backupStatus,
    getAvailableBackups,
    deleteBackup,
  };
};

export const useDataImportExport = () => {
  const {
    exportData,
    importData,
    isLoading,
    error,
  } = useStorage();
  
  return {
    exportData,
    importData,
    isLoading,
    error,
  };
};

export const useStorageInfo = () => {
  const {
    storageInfo,
    calculateStorageUsage,
    loadStorageInfo,
  } = useStorage();
  
  return {
    storageInfo,
    calculateStorageUsage,
    loadStorageInfo,
  };
};

/**
 * Storage utilities
 */

export const storageUtils = {
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  getBackupDirectory: (): string => {
    return `${FileSystem.documentDirectory}backups/`;
  },
  
  getExportDirectory: (): string => {
    return `${FileSystem.documentDirectory}exports/`;
  },
  
  ensureDirectoryExists: async (directory: string): Promise<boolean> => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }
      return true;
    } catch (error) {
      console.error('Error ensuring directory exists:', error);
      return false;
    }
  },
  
  getFileInfo: async (filepath: string): Promise<FileSystem.FileInfo | null> => {
    try {
      return await FileSystem.getInfoAsync(filepath);
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  },
  
  deleteFile: async (filepath: string): Promise<boolean> => {
    try {
      await FileSystem.deleteAsync(filepath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },
};

export default useStorage;