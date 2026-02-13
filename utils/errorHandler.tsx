/**
 * Error Handler Utilities for SubTrack
 * Comprehensive error handling, logging, and reporting
 */

import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV for error storage
const errorStorage = new MMKV();

// Error severity levels
export const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

// Error categories
export const ErrorCategory = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  DATABASE: 'database',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  BUSINESS_LOGIC: 'business_logic',
  UI: 'ui',
  UNKNOWN: 'unknown',
};

// Error codes
export const ErrorCodes = {
  // Network errors (1000-1999)
  NETWORK_TIMEOUT: 1001,
  NETWORK_NO_CONNECTION: 1002,
  NETWORK_SERVER_ERROR: 1003,
  NETWORK_NOT_FOUND: 1004,
  NETWORK_UNAUTHORIZED: 1005,
  NETWORK_FORBIDDEN: 1006,
  NETWORK_BAD_REQUEST: 1007,
  
  // Validation errors (2000-2999)
  VALIDATION_REQUIRED: 2001,
  VALIDATION_INVALID_EMAIL: 2002,
  VALIDATION_INVALID_PHONE: 2003,
  VALIDATION_INVALID_DATE: 2004,
  VALIDATION_INVALID_AMOUNT: 2005,
  VALIDATION_UNIQUE_CONSTRAINT: 2006,
  
  // Database errors (3000-3999)
  DATABASE_READ_FAILED: 3001,
  DATABASE_WRITE_FAILED: 3002,
  DATABASE_DELETE_FAILED: 3003,
  DATABASE_NOT_FOUND: 3004,
  DATABASE_CONSTRAINT: 3005,
  
  // Authentication errors (4000-4999)
  AUTH_INVALID_CREDENTIALS: 4001,
  AUTH_TOKEN_EXPIRED: 4002,
  AUTH_TOKEN_INVALID: 4003,
  AUTH_USER_NOT_FOUND: 4004,
  AUTH_USER_DISABLED: 4005,
  
  // Business logic errors (5000-5999)
  BUSINESS_INSUFFICIENT_FUNDS: 5001,
  BUSINESS_LIMIT_EXCEEDED: 5002,
  BUSINESS_INVALID_STATE: 5003,
  BUSINESS_DUPLICATE_ENTRY: 5004,
  
  // UI errors (6000-6999)
  UI_RENDER_ERROR: 6001,
  UI_NAVIGATION_ERROR: 6002,
  UI_COMPONENT_ERROR: 6003,
  
  // Unknown errors (9000-9999)
  UNKNOWN_ERROR: 9001,
};

// Error messages mapping
export const ErrorMessages = {
  [ErrorCodes.NETWORK_TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCodes.NETWORK_NO_CONNECTION]: 'No internet connection. Please check your connection.',
  [ErrorCodes.NETWORK_SERVER_ERROR]: 'Server error. Please try again later.',
  [ErrorCodes.NETWORK_NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.NETWORK_UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [ErrorCodes.NETWORK_FORBIDDEN]: 'Access to this resource is forbidden.',
  [ErrorCodes.NETWORK_BAD_REQUEST]: 'Invalid request. Please check your input.',
  
  [ErrorCodes.VALIDATION_REQUIRED]: 'This field is required.',
  [ErrorCodes.VALIDATION_INVALID_EMAIL]: 'Please enter a valid email address.',
  [ErrorCodes.VALIDATION_INVALID_PHONE]: 'Please enter a valid phone number.',
  [ErrorCodes.VALIDATION_INVALID_DATE]: 'Please enter a valid date.',
  [ErrorCodes.VALIDATION_INVALID_AMOUNT]: 'Please enter a valid amount.',
  [ErrorCodes.VALIDATION_UNIQUE_CONSTRAINT]: 'This value already exists.',
  
  [ErrorCodes.DATABASE_READ_FAILED]: 'Failed to read data from storage.',
  [ErrorCodes.DATABASE_WRITE_FAILED]: 'Failed to save data to storage.',
  [ErrorCodes.DATABASE_DELETE_FAILED]: 'Failed to delete data from storage.',
  [ErrorCodes.DATABASE_NOT_FOUND]: 'The requested data was not found.',
  [ErrorCodes.DATABASE_CONSTRAINT]: 'Database constraint violation.',
  
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ErrorCodes.AUTH_TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCodes.AUTH_TOKEN_INVALID]: 'Invalid authentication token.',
  [ErrorCodes.AUTH_USER_NOT_FOUND]: 'User not found.',
  [ErrorCodes.AUTH_USER_DISABLED]: 'This account has been disabled.',
  
  [ErrorCodes.BUSINESS_INSUFFICIENT_FUNDS]: 'Insufficient funds.',
  [ErrorCodes.BUSINESS_LIMIT_EXCEEDED]: 'Limit exceeded.',
  [ErrorCodes.BUSINESS_INVALID_STATE]: 'Invalid operation for current state.',
  [ErrorCodes.BUSINESS_DUPLICATE_ENTRY]: 'Duplicate entry detected.',
  
  [ErrorCodes.UI_RENDER_ERROR]: 'Failed to render component.',
  [ErrorCodes.UI_NAVIGATION_ERROR]: 'Navigation error occurred.',
  [ErrorCodes.UI_COMPONENT_ERROR]: 'Component error occurred.',
  
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

/**
 * Custom Error class for SubTrack
 */
export class SubTrackError extends Error {
  constructor(
    message,
    code = ErrorCodes.UNKNOWN_ERROR,
    category = ErrorCategory.UNKNOWN,
    severity = ErrorSeverity.ERROR,
    details = null
  ) {
    super(message);
    this.name = 'SubTrackError';
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.stack = this.stack || new Error().stack;
    
    // Capture additional context
    this.context = {
      platform: Platform.OS,
      platformVersion: Platform.Version,
      timestamp: this.timestamp,
    };
  }

  /**
   * Convert to plain object for logging/storage
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
      context: this.context,
    };
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage() {
    return ErrorMessages[this.code] || this.message || ErrorMessages[ErrorCodes.UNKNOWN_ERROR];
  }

  /**
   * Check if error is critical
   */
  isCritical() {
    return this.severity === ErrorSeverity.CRITICAL;
  }

  /**
   * Check if error is recoverable
   */
  isRecoverable() {
    return this.severity !== ErrorSeverity.CRITICAL;
  }
}

/**
 * Error Handler class
 */
export class ErrorHandler {
  constructor(config = {}) {
    this.config = {
      enableLogging: true,
      enableStorage: true,
      maxStoredErrors: 100,
      enableReporting: false,
      reportEndpoint: null,
      reportToken: null,
      ...config,
    };
    
    this.storageKey = 'subtrack_errors';
    this.isInitialized = false;
  }

  /**
   * Initialize error handler
   */
  async initialize() {
    try {
      // Clear old errors if needed
      await this.cleanupOldErrors();
      this.isInitialized = true;
      console.log('Error handler initialized');
    } catch (error) {
      console.error('Failed to initialize error handler:', error);
    }
  }

  /**
   * Handle an error
   */
  async handleError(error, context = {}) {
    // Ensure we have a proper error object
    const trackedError = this.normalizeError(error, context);
    
    // Log error
    if (this.config.enableLogging) {
      this.logError(trackedError);
    }
    
    // Store error
    if (this.config.enableStorage) {
      await this.storeError(trackedError);
    }
    
    // Report error if enabled
    if (this.config.enableReporting && this.config.reportEndpoint) {
      await this.reportError(trackedError);
    }
    
    return trackedError;
  }

  /**
   * Normalize error to SubTrackError
   */
  normalizeError(error, context = {}) {
    if (error instanceof SubTrackError) {
      // Add context to existing SubTrackError
      error.context = { ...error.context, ...context };
      return error;
    }
    
    // Determine error code and category
    let code = ErrorCodes.UNKNOWN_ERROR;
    let category = ErrorCategory.UNKNOWN;
    let severity = ErrorSeverity.ERROR;
    
    // Map common error types
    if (error instanceof TypeError) {
      code = ErrorCodes.VALIDATION_INVALID_AMOUNT;
      category = ErrorCategory.VALIDATION;
    } else if (error instanceof RangeError) {
      code = ErrorCodes.VALIDATION_INVALID_AMOUNT;
      category = ErrorCategory.VALIDATION;
    } else if (error instanceof SyntaxError) {
      code = ErrorCodes.VALIDATION_INVALID_DATE;
      category = ErrorCategory.VALIDATION;
    } else if (error.message?.includes('network') || error.message?.includes('internet')) {
      code = ErrorCodes.NETWORK_NO_CONNECTION;
      category = ErrorCategory.NETWORK;
    } else if (error.message?.includes('timeout')) {
      code = ErrorCodes.NETWORK_TIMEOUT;
      category = ErrorCategory.NETWORK;
    } else if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
      code = ErrorCodes.NETWORK_UNAUTHORIZED;
      category = ErrorCategory.AUTHENTICATION;
    } else if (error.message?.includes('forbidden') || error.message?.includes('403')) {
      code = ErrorCodes.NETWORK_FORBIDDEN;
      category = ErrorCategory.AUTHORIZATION;
    } else if (error.message?.includes('not found') || error.message?.includes('404')) {
      code = ErrorCodes.NETWORK_NOT_FOUND;
      category = ErrorCategory.NETWORK;
    } else if (error.message?.includes('server error') || error.message?.includes('500')) {
      code = ErrorCodes.NETWORK_SERVER_ERROR;
      category = ErrorCategory.NETWORK;
    }
    
    // Create SubTrackError
    return new SubTrackError(
      error.message || 'An unknown error occurred',
      code,
      category,
      severity,
      {
        originalError: error.toString(),
        stack: error.stack,
        ...context,
      }
    );
  }

  /**
   * Log error to console
   */
  logError(error) {
    const { code, category, severity, message, timestamp } = error;
    
    const logEntry = `[${timestamp}] [${severity.toUpperCase()}] [${category}] [${code}] ${message}`;
    
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.ERROR:
        console.error(logEntry, error);
        break;
      case ErrorSeverity.WARNING:
        console.warn(logEntry, error);
        break;
      case ErrorSeverity.INFO:
        console.info(logEntry, error);
        break;
      default:
        console.log(logEntry, error);
    }
    
    // Log stack trace for debugging
    if (__DEV__ && error.stack) {
      console.debug('Stack trace:', error.stack);
    }
  }

  /**
   * Store error in persistent storage
   */
  async storeError(error) {
    try {
      const errors = await this.getStoredErrors();
      
      // Add new error
      errors.push(error.toJSON());
      
      // Keep only recent errors
      if (errors.length > this.config.maxStoredErrors) {
        errors.splice(0, errors.length - this.config.maxStoredErrors);
      }
      
      // Save to storage
      errorStorage.set(this.storageKey, JSON.stringify(errors));
      
      return true;
    } catch (storageError) {
      console.error('Failed to store error:', storageError);
      return false;
    }
  }

  /**
   * Get stored errors from storage
   */
  async getStoredErrors() {
    try {
      const errorsJson = errorStorage.getString(this.storageKey);
      
      if (!errorsJson) {
        return [];
      }
      
      const errors = JSON.parse(errorsJson);
      return Array.isArray(errors) ? errors : [];
    } catch (error) {
      console.error('Failed to get stored errors:', error);
      return [];
    }
  }

  /**
   * Clear stored errors
   */
  async clearStoredErrors() {
    try {
      errorStorage.delete(this.storageKey);
      return true;
    } catch (error) {
      console.error('Failed to clear stored errors:', error);
      return false;
    }
  }

  /**
   * Cleanup old errors
   */
  async cleanupOldErrors() {
    try {
      const errors = await this.getStoredErrors();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentErrors = errors.filter(error => {
        const errorDate = new Date(error.timestamp);
        return errorDate > oneWeekAgo;
      });
      
      if (recentErrors.length < errors.length) {
        errorStorage.set(this.storageKey, JSON.stringify(recentErrors));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to cleanup old errors:', error);
      return false;
    }
  }

  /**
   * Report error to external service
   */
  async reportError(error) {
    try {
      if (!this.config.reportEndpoint || !this.config.reportToken) {
        console.warn('Error reporting not configured');
        return false;
      }
      
      const errorData = error.toJSON();
      
      // Add app version and other metadata
      errorData.appVersion = '1.0.0'; // You should get this from your app config
      errorData.deviceInfo = {
        platform: Platform.OS,
        platformVersion: Platform.Version,
        model: Platform.constants?.model || 'unknown',
      };
      
      // Send to reporting endpoint
      const response = await fetch(this.config.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.reportToken}`,
        },
        body: JSON.stringify(errorData),
      });
      
      if (!response.ok) {
        console.error('Failed to report error:', response.status);
        return false;
      }
      
      return true;
    } catch (reportError) {
      console.error('Error reporting failed:', reportError);
      return false;
    }
  }

  /**
   * Get error statistics
   */
  async getErrorStats() {
    try {
      const errors = await this.getStoredErrors();
      
      const stats = {
        total: errors.length,
        bySeverity: {},
        byCategory: {},
        byDay: {},
        recent: errors.slice(-10), // Last 10 errors
      };
      
      // Count by severity and category
      errors.forEach(error => {
        // Count by severity
        stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
        
        // Count by category
        stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
        
        // Count by day
        const errorDate = new Date(error.timestamp);
        const dayKey = errorDate.toISOString().split('T')[0];
        stats.byDay[dayKey] = (stats.byDay[dayKey] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Failed to get error stats:', error);
      return null;
    }
  }

  /**
   * Create error boundary wrapper for React components
   */
  createErrorBoundary(Component, FallbackComponent = null) {
    return class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }

      componentDidCatch(error, errorInfo) {
        // Handle the error
        this.handleError(error, errorInfo);
      }

      handleError = async (error, errorInfo) => {
        const context = {
          component: Component.displayName || Component.name,
          errorInfo,
          props: this.props,
        };
        
        await ErrorHandler.instance.handleError(error, context);
      };

      render() {
        if (this.state.hasError) {
          if (FallbackComponent) {
            return <FallbackComponent error={this.state.error} />;
          }
          
          // Default fallback UI
          return (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorMessage}>
                {this.state.error?.message || 'An unexpected error occurred'}
              </Text>
              <Button
                title="Try Again"
                onPress={() => this.setState({ hasError: false, error: null })}
              />
            </View>
          );
        }

        return <Component {...this.props} />;
      }
    };
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Initialize error handler
export const initErrorHandler = async (config = {}) => {
  Object.assign(errorHandler.config, config);
  await errorHandler.initialize();
  return errorHandler;
};

// Global error handlers
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  if (typeof global !== 'undefined') {
    const originalHandler = global.ErrorUtils?.getGlobalHandler?.();
    
    if (originalHandler) {
      global.ErrorUtils.setGlobalHandler((error, isFatal) => {
        // Handle the error
        errorHandler.handleError(error, { isFatal, source: 'global' });
        
        // Call original handler
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }
  }

  // Handle uncaught exceptions
  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error) => {
      errorHandler.handleError(error, { source: 'uncaughtException' });
    });
  }

  // Handle unhandled promise rejections
  if (typeof process !== 'undefined') {
    process.on('unhandledRejection', (reason, promise) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      errorHandler.handleError(error, { source: 'unhandledRejection', promise });
    });
  }
};

// Convenience functions
export const handleError = (error, context = {}) => {
  return errorHandler.handleError(error, context);
};

export const getStoredErrors = () => {
  return errorHandler.getStoredErrors();
};

export const clearStoredErrors = () => {
  return errorHandler.clearStoredErrors();
};

export const getErrorStats = () => {
  return errorHandler.getErrorStats();
};

export const createError = (message, code, category, severity, details) => {
  return new SubTrackError(message, code, category, severity, details);
};

export const getErrorMessage = (code) => {
  return ErrorMessages[code] || ErrorMessages[ErrorCodes.UNKNOWN_ERROR];
};

// Default styles for error boundary
const styles = {
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#dc3545',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#6c757d',
  },
};

// Export everything
export default {
  // Error classes
  SubTrackError,
  ErrorHandler,
  
  // Constants
  ErrorSeverity,
  ErrorCategory,
  ErrorCodes,
  ErrorMessages,
  
  // Singleton instance
  instance: errorHandler,
  
  // Initialization
  init: initErrorHandler,
  setupGlobal: setupGlobalErrorHandling,
  
  // Convenience functions
  handle: handleError,
  getStored: getStoredErrors,
  clearStored: clearStoredErrors,
  getStats: getErrorStats,
  create: createError,
  getMessage: getErrorMessage,
  createBoundary: errorHandler.createErrorBoundary.bind(errorHandler),
};