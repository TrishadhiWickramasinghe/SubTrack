/**
 * General Helper Utilities for SubTrack
 * Miscellaneous utility functions for common operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Clipboard, Dimensions, Linking, PixelRatio, Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV for fast storage
const mmkvStorage = new MMKV();

// Screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Device and Platform Helpers
 */
export class DeviceHelpers {
  /**
   * Check if device is a tablet
   */
  static isTablet() {
    const pixelDensity = PixelRatio.get();
    const adjustedWidth = SCREEN_WIDTH * pixelDensity;
    const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
    
    if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
      return true;
    } else {
      return pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920);
    }
  }

  /**
   * Check if device has notch
   */
  static hasNotch() {
    if (Platform.OS === 'ios') {
      // iPhone models with notch
      const notchModels = [
        'iPhone10,3', 'iPhone10,6', // iPhone X
        'iPhone11,2', 'iPhone11,4', 'iPhone11,6', 'iPhone11,8', // iPhone XS, XS Max, XR
        'iPhone12,1', 'iPhone12,3', 'iPhone12,5', 'iPhone12,8', // iPhone 11 series
        'iPhone13,1', 'iPhone13,2', 'iPhone13,3', 'iPhone13,4', // iPhone 12 series
        'iPhone14,2', 'iPhone14,3', 'iPhone14,4', 'iPhone14,5', // iPhone 13 series
        'iPhone14,7', 'iPhone14,8', 'iPhone15,2', 'iPhone15,3', // iPhone 14, 15 series
      ];
      
      // This is a simplified check - in production, use react-native-device-info
      return notchModels.includes(Platform.constants.model || '');
    }
    
    if (Platform.OS === 'android') {
      // Android notch detection is more complex
      // For now, return false or implement with react-native-device-info
      return false;
    }
    
    return false;
  }

  /**
   * Get device orientation
   */
  static getOrientation() {
    return SCREEN_WIDTH < SCREEN_HEIGHT ? 'portrait' : 'landscape';
  }

  /**
   * Check if device is in landscape mode
   */
  static isLandscape() {
    return this.getOrientation() === 'landscape';
  }

  /**
   * Check if device is in portrait mode
   */
  static isPortrait() {
    return this.getOrientation() === 'portrait';
  }

  /**
   * Get device info summary
   */
  static getDeviceInfo() {
    return {
      platform: Platform.OS,
      platformVersion: Platform.Version,
      screenWidth: SCREEN_WIDTH,
      screenHeight: SCREEN_HEIGHT,
      pixelRatio: PixelRatio.get(),
      fontScale: PixelRatio.getFontScale(),
      isTablet: this.isTablet(),
      hasNotch: this.hasNotch(),
      orientation: this.getOrientation(),
      isIOS: Platform.OS === 'ios',
      isAndroid: Platform.OS === 'android',
      isWeb: Platform.OS === 'web',
    };
  }

  /**
   * Convert pixels to device-independent pixels (dp)
   */
  static pxToDp(px) {
    return px / PixelRatio.get();
  }

  /**
   * Convert dp to pixels
   */
  static dpToPx(dp) {
    return dp * PixelRatio.get();
  }

  /**
   * Get responsive font size
   */
  static getResponsiveFontSize(baseSize) {
    const scale = SCREEN_WIDTH / 375; // Based on iPhone 6/7/8 width
    
    const newSize = baseSize * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }

  /**
   * Get responsive padding/margin
   */
  static getResponsiveSpacing(baseSpacing) {
    const scale = Math.min(SCREEN_WIDTH / 375, 1.5); // Cap scaling at 1.5x
    return Math.round(baseSpacing * scale);
  }
}

/**
 * Storage Helpers
 */
export class StorageHelpers {
  /**
   * Set value in AsyncStorage
   */
  static async setAsync(key, value) {
    try {
      if (value === null || value === undefined) {
        await AsyncStorage.removeItem(key);
      } else {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await AsyncStorage.setItem(key, stringValue);
      }
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in AsyncStorage:`, error);
      return false;
    }
  }

  /**
   * Get value from AsyncStorage
   */
  static async getAsync(key, defaultValue = null) {
    try {
      const value = await AsyncStorage.getItem(key);
      
      if (value === null) {
        return defaultValue;
      }
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`Error getting ${key} from AsyncStorage:`, error);
      return defaultValue;
    }
  }

  /**
   * Remove value from AsyncStorage
   */
  static async removeAsync(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from AsyncStorage:`, error);
      return false;
    }
  }

  /**
   * Clear all AsyncStorage
   */
  static async clearAsync() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      return false;
    }
  }

  /**
   * Get all keys from AsyncStorage
   */
  static async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting keys from AsyncStorage:', error);
      return [];
    }
  }

  /**
   * Set value in MMKV (fast storage)
   */
  static setMMKV(key, value) {
    try {
      if (value === null || value === undefined) {
        mmkvStorage.delete(key);
      } else if (typeof value === 'string') {
        mmkvStorage.set(key, value);
      } else if (typeof value === 'number') {
        mmkvStorage.set(key, value);
      } else if (typeof value === 'boolean') {
        mmkvStorage.set(key, value);
      } else {
        mmkvStorage.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in MMKV:`, error);
      return false;
    }
  }

  /**
   * Get value from MMKV
   */
  static getMMKV(key, defaultValue = null) {
    try {
      if (!mmkvStorage.contains(key)) {
        return defaultValue;
      }
      
      const type = mmkvStorage.getType(key);
      
      switch (type) {
        case 'string':
          const stringValue = mmkvStorage.getString(key);
          try {
            return JSON.parse(stringValue);
          } catch {
            return stringValue;
          }
        case 'number':
          return mmkvStorage.getNumber(key);
        case 'boolean':
          return mmkvStorage.getBoolean(key);
        default:
          return defaultValue;
      }
    } catch (error) {
      console.error(`Error getting ${key} from MMKV:`, error);
      return defaultValue;
    }
  }

  /**
   * Remove value from MMKV
   */
  static removeMMKV(key) {
    try {
      mmkvStorage.delete(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from MMKV:`, error);
      return false;
    }
  }

  /**
   * Clear all MMKV
   */
  static clearMMKV() {
    try {
      mmkvStorage.clearAll();
      return true;
    } catch (error) {
      console.error('Error clearing MMKV:', error);
      return false;
    }
  }
}

/**
 * Network Helpers
 */
export class NetworkHelpers {
  /**
   * Check if URL is valid
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Open URL in browser
   */
  static async openUrl(url) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        console.warn(`Cannot open URL: ${url}`);
        return false;
      }
    } catch (error) {
      console.error(`Error opening URL ${url}:`, error);
      return false;
    }
  }

  /**
   * Send email
   */
  static async sendEmail(to, subject = '', body = '') {
    const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return this.openUrl(url);
  }

  /**
   * Make phone call
   */
  static async makePhoneCall(phoneNumber) {
    const url = `tel:${phoneNumber}`;
    return this.openUrl(url);
  }

  /**
   * Send SMS
   */
  static async sendSMS(phoneNumber, message = '') {
    const url = `sms:${phoneNumber}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
    return this.openUrl(url);
  }

  /**
   * Share content
   */
  static async shareContent(content, options = {}) {
    if (Platform.OS === 'web') {
      // Web sharing API
      if (navigator.share) {
        try {
          await navigator.share({
            title: options.title,
            text: content,
            url: options.url,
          });
          return true;
        } catch (error) {
          console.error('Error sharing:', error);
          return false;
        }
      } else {
        // Fallback: copy to clipboard
        return this.copyToClipboard(content);
      }
    } else {
      // React Native - you would use react-native-share here
      console.log('Share functionality requires react-native-share package');
      return false;
    }
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text) {
    try {
      await Clipboard.setString(text);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  /**
   * Get text from clipboard
   */
  static async getFromClipboard() {
    try {
      return await Clipboard.getString();
    } catch (error) {
      console.error('Error getting from clipboard:', error);
      return '';
    }
  }

  /**
   * Generate unique ID
   */
  static generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Generate random string
   */
  static generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Create a debounced function
   */
  static debounce(func, wait, immediate = false) {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func(...args);
    };
  }

  /**
   * Create a throttled function
   */
  static throttle(func, limit) {
    let inThrottle;
    
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Deep compare two objects
   */
  static deepCompare(obj1, obj2) {
    if (obj1 === obj2) return true;
    
    if (typeof obj1 !== 'object' || obj1 === null || 
        typeof obj2 !== 'object' || obj2 === null) {
      return false;
    }
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key) || !this.deepCompare(obj1[key], obj2[key])) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Sleep/wait for specified milliseconds
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   */
  static async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }
}

/**
 * UI Helpers
 */
export class UIHelpers {
  /**
   * Show alert dialog
   */
  static showAlert(title, message, buttons = [{ text: 'OK' }]) {
    Alert.alert(title, message, buttons);
  }

  /**
   * Show confirmation dialog
   */
  static showConfirm(title, message, onConfirm, onCancel = null) {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        { text: 'Confirm', style: 'destructive', onPress: onConfirm },
      ]
    );
  }

  /**
   * Format number with ordinal suffix
   */
  static formatOrdinal(number) {
    if (number % 100 >= 11 && number % 100 <= 13) {
      return `${number}th`;
    }
    
    switch (number % 10) {
      case 1: return `${number}st`;
      case 2: return `${number}nd`;
      case 3: return `${number}rd`;
      default: return `${number}th`;
    }
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Get color brightness
   */
  static getColorBrightness(hexColor) {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness (perceived luminance)
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  /**
   * Get contrasting text color (black or white)
   */
  static getContrastColor(hexColor) {
    const brightness = this.getColorBrightness(hexColor);
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }

  /**
   * Lighten or darken a color
   */
  static adjustColor(hexColor, amount) {
    // Remove # if present
    let hex = hexColor.replace('#', '');
    
    // If 3-digit hex, convert to 6-digit
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // Convert to RGB
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    
    // Adjust brightness
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Convert back to hex
    const newHex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return `#${newHex}`;
  }

  /**
   * Generate gradient colors
   */
  static generateGradient(startColor, endColor, steps = 5) {
    const colors = [];
    
    // Parse start color
    const startHex = startColor.replace('#', '');
    const startR = parseInt(startHex.substr(0, 2), 16);
    const startG = parseInt(startHex.substr(2, 2), 16);
    const startB = parseInt(startHex.substr(4, 2), 16);
    
    // Parse end color
    const endHex = endColor.replace('#', '');
    const endR = parseInt(endHex.substr(0, 2), 16);
    const endG = parseInt(endHex.substr(2, 2), 16);
    const endB = parseInt(endHex.substr(4, 2), 16);
    
    // Generate intermediate colors
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      
      const r = Math.round(startR + (endR - startR) * ratio);
      const g = Math.round(startG + (endG - startG) * ratio);
      const b = Math.round(startB + (endB - startB) * ratio);
      
      const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      colors.push(`#${hex}`);
    }
    
    return colors;
  }

  /**
   * Calculate reading time
   */
  static calculateReadingTime(text, wordsPerMinute = 200) {
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  }

  /**
   * Format time duration
   */
  static formatDuration(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours}h ${remainingMinutes}m`;
  }
}

/**
 * Date Helpers (complement to dateHelpers.js)
 */
export class DateHelpers {
  /**
   * Get age from birth date
   */
  static getAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get time ago string
   */
  static getTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const seconds = Math.floor((now - past) / 1000);
    
    if (seconds < 60) {
      return `${seconds} seconds ago`;
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    }
    
    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }

  /**
   * Check if date is today
   */
  static isToday(date) {
    const today = new Date();
    const checkDate = new Date(date);
    
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Check if date is yesterday
   */
  static isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const checkDate = new Date(date);
    
    return (
      checkDate.getDate() === yesterday.getDate() &&
      checkDate.getMonth() === yesterday.getMonth() &&
      checkDate.getFullYear() === yesterday.getFullYear()
    );
  }

  /**
   * Check if date is tomorrow
   */
  static isTomorrow(date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkDate = new Date(date);
    
    return (
      checkDate.getDate() === tomorrow.getDate() &&
      checkDate.getMonth() === tomorrow.getMonth() &&
      checkDate.getFullYear() === tomorrow.getFullYear()
    );
  }
}

// Export all helper classes
export default {
  // Device helpers
  isTablet: DeviceHelpers.isTablet,
  hasNotch: DeviceHelpers.hasNotch,
  getOrientation: DeviceHelpers.getOrientation,
  isLandscape: DeviceHelpers.isLandscape,
  isPortrait: DeviceHelpers.isPortrait,
  getDeviceInfo: DeviceHelpers.getDeviceInfo,
  pxToDp: DeviceHelpers.pxToDp,
  dpToPx: DeviceHelpers.dpToPx,
  getResponsiveFontSize: DeviceHelpers.getResponsiveFontSize,
  getResponsiveSpacing: DeviceHelpers.getResponsiveSpacing,
  
  // Storage helpers
  setAsync: StorageHelpers.setAsync,
  getAsync: StorageHelpers.getAsync,
  removeAsync: StorageHelpers.removeAsync,
  clearAsync: StorageHelpers.clearAsync,
  getAllKeys: StorageHelpers.getAllKeys,
  setMMKV: StorageHelpers.setMMKV,
  getMMKV: StorageHelpers.getMMKV,
  removeMMKV: StorageHelpers.removeMMKV,
  clearMMKV: StorageHelpers.clearMMKV,
  
  // Network helpers
  isValidUrl: NetworkHelpers.isValidUrl,
  openUrl: NetworkHelpers.openUrl,
  sendEmail: NetworkHelpers.sendEmail,
  makePhoneCall: NetworkHelpers.makePhoneCall,
  sendSMS: NetworkHelpers.sendSMS,
  shareContent: NetworkHelpers.shareContent,
  copyToClipboard: NetworkHelpers.copyToClipboard,
  getFromClipboard: NetworkHelpers.getFromClipboard,
  generateId: NetworkHelpers.generateId,
  generateRandomString: NetworkHelpers.generateRandomString,
  debounce: NetworkHelpers.debounce,
  throttle: NetworkHelpers.throttle,
  deepCompare: NetworkHelpers.deepCompare,
  sleep: NetworkHelpers.sleep,
  retryWithBackoff: NetworkHelpers.retryWithBackoff,
  
  // UI helpers
  showAlert: UIHelpers.showAlert,
  showConfirm: UIHelpers.showConfirm,
  formatOrdinal: UIHelpers.formatOrdinal,
  formatFileSize: UIHelpers.formatFileSize,
  getColorBrightness: UIHelpers.getColorBrightness,
  getContrastColor: UIHelpers.getContrastColor,
  adjustColor: UIHelpers.adjustColor,
  generateGradient: UIHelpers.generateGradient,
  calculateReadingTime: UIHelpers.calculateReadingTime,
  formatDuration: UIHelpers.formatDuration,
  
  // Date helpers
  getAge: DateHelpers.getAge,
  getTimeAgo: DateHelpers.getTimeAgo,
  isToday: DateHelpers.isToday,
  isYesterday: DateHelpers.isYesterday,
  isTomorrow: DateHelpers.isTomorrow,
  
  // Classes for advanced usage
  Device: DeviceHelpers,
  Storage: StorageHelpers,
  Network: NetworkHelpers,
  UI: UIHelpers,
  Date: DateHelpers,
};