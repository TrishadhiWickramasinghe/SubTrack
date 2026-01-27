/**
 * Validation Utilities for SubTrack
 * Comprehensive validation functions for forms and data
 */

/**
 * Validation Patterns and Rules
 */
export const ValidationPatterns = {
  // Email validation
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // URL validation
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  
  // Phone number (international format)
  PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/,
  
  // Credit card (basic pattern)
  CREDIT_CARD: /^[0-9]{13,19}$/,
  
  // Password (minimum 8 chars, at least one letter and one number)
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  
  // Date (YYYY-MM-DD)
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  
  // Time (HH:MM 24-hour format)
  TIME_24: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  
  // Positive number (including decimals)
  POSITIVE_NUMBER: /^\d+(\.\d{1,2})?$/,
  
  // Currency amount (positive with optional decimals)
  CURRENCY: /^\d+(\.\d{1,2})?$/,
  
  // ZIP code (US format)
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  
  // No special characters (for names)
  NO_SPECIAL_CHARS: /^[a-zA-Z\s]*$/,
  
  // Alphanumeric with spaces
  ALPHANUMERIC: /^[a-zA-Z0-9\s]*$/,
};

/**
 * Validation Error Messages
 */
export const ValidationMessages = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  URL: 'Please enter a valid URL',
  PHONE: 'Please enter a valid phone number',
  CREDIT_CARD: 'Please enter a valid credit card number',
  PASSWORD: 'Password must be at least 8 characters with at least one letter and one number',
  DATE: 'Please enter a valid date',
  TIME: 'Please enter a valid time',
  NUMBER: 'Please enter a valid number',
  POSITIVE_NUMBER: 'Please enter a positive number',
  CURRENCY: 'Please enter a valid amount',
  MIN_LENGTH: (min) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max) => `Must be at most ${max} characters`,
  MIN_VALUE: (min) => `Must be at least ${min}`,
  MAX_VALUE: (max) => `Must be at most ${max}`,
  PATTERN: 'Invalid format',
  MATCH: 'Values do not match',
  UNIQUE: 'This value already exists',
  FUTURE_DATE: 'Date must be in the future',
  PAST_DATE: 'Date must be in the past',
  VALID_CATEGORY: 'Please select a valid category',
  VALID_CURRENCY: 'Please select a valid currency',
};

/**
 * Validator class for comprehensive validation
 */
export class Validator {
  constructor(rules = {}) {
    this.rules = rules;
    this.errors = {};
    this.isValid = true;
  }

  /**
   * Validate a single field
   */
  validateField(name, value, context = {}) {
    const fieldRules = this.rules[name];
    
    if (!fieldRules) {
      return { isValid: true, errors: [] };
    }
    
    const errors = [];
    
    // Check each rule
    for (const rule of fieldRules) {
      const error = this.checkRule(rule, value, context);
      if (error) {
        errors.push(error);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate all fields
   */
  validateAll(data, context = {}) {
    this.errors = {};
    this.isValid = true;
    
    for (const [fieldName, rules] of Object.entries(this.rules)) {
      const value = data[fieldName];
      const result = this.validateField(fieldName, value, context);
      
      if (!result.isValid) {
        this.errors[fieldName] = result.errors;
        this.isValid = false;
      }
    }
    
    return {
      isValid: this.isValid,
      errors: this.errors,
    };
  }

  /**
   * Check a single rule
   */
  checkRule(rule, value, context = {}) {
    if (rule.condition && !rule.condition(value, context)) {
      return null; // Skip validation if condition not met
    }
    
    // Handle required validation
    if (rule.required) {
      if (value === null || value === undefined || value === '') {
        return rule.message || ValidationMessages.REQUIRED;
      }
    }
    
    // Skip further validation if value is empty (unless required)
    if (!rule.required && (value === null || value === undefined || value === '')) {
      return null;
    }
    
    // Check min length
    if (rule.minLength !== undefined && String(value).length < rule.minLength) {
      return rule.message || ValidationMessages.MIN_LENGTH(rule.minLength);
    }
    
    // Check max length
    if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
      return rule.message || ValidationMessages.MAX_LENGTH(rule.maxLength);
    }
    
    // Check min value
    if (rule.min !== undefined && Number(value) < rule.min) {
      return rule.message || ValidationMessages.MIN_VALUE(rule.min);
    }
    
    // Check max value
    if (rule.max !== undefined && Number(value) > rule.max) {
      return rule.message || ValidationMessages.MAX_VALUE(rule.max);
    }
    
    // Check pattern
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return rule.message || ValidationMessages.PATTERN;
    }
    
    // Check custom validation function
    if (rule.validate && typeof rule.validate === 'function') {
      const customResult = rule.validate(value, context);
      if (customResult !== true) {
        return rule.message || customResult || 'Invalid value';
      }
    }
    
    // Check match with another field
    if (rule.match) {
      const matchValue = context[rule.match];
      if (value !== matchValue) {
        return rule.message || ValidationMessages.MATCH;
      }
    }
    
    // Check unique
    if (rule.unique && context.uniqueCheck) {
      const isUnique = context.uniqueCheck(value, rule.field);
      if (!isUnique) {
        return rule.message || ValidationMessages.UNIQUE;
      }
    }
    
    return null;
  }

  /**
   * Get field errors
   */
  getFieldErrors(fieldName) {
    return this.errors[fieldName] || [];
  }

  /**
   * Check if field has errors
   */
  hasErrors(fieldName) {
    return this.errors[fieldName] && this.errors[fieldName].length > 0;
  }

  /**
   * Clear errors
   */
  clearErrors() {
    this.errors = {};
    this.isValid = true;
  }

  /**
   * Add error manually
   */
  addError(fieldName, error) {
    if (!this.errors[fieldName]) {
      this.errors[fieldName] = [];
    }
    
    this.errors[fieldName].push(error);
    this.isValid = false;
  }
}

/**
 * Common validation rules for SubTrack forms
 */
export const FormValidationRules = {
  // Subscription form rules
  SUBSCRIPTION: {
    name: [
      { required: true, message: 'Subscription name is required' },
      { minLength: 2, message: 'Name must be at least 2 characters' },
      { maxLength: 100, message: 'Name must be at most 100 characters' },
    ],
    
    amount: [
      { required: true, message: 'Amount is required' },
      { pattern: ValidationPatterns.CURRENCY, message: 'Enter a valid amount' },
      { min: 0.01, message: 'Amount must be greater than 0' },
      { max: 1000000, message: 'Amount is too large' },
    ],
    
    billingDate: [
      { required: true, message: 'Billing date is required' },
      { validate: (value) => Validators.isValidDate(value), message: 'Invalid date format' },
    ],
    
    category: [
      { required: true, message: 'Category is required' },
    ],
    
    billingCycle: [
      { required: true, message: 'Billing cycle is required' },
    ],
    
    currency: [
      { required: true, message: 'Currency is required' },
    ],
  },

  // User profile rules
  PROFILE: {
    name: [
      { required: true, message: 'Name is required' },
      { minLength: 2, message: 'Name must be at least 2 characters' },
      { maxLength: 100, message: 'Name must be at most 100 characters' },
    ],
    
    email: [
      { required: true, message: 'Email is required' },
      { pattern: ValidationPatterns.EMAIL, message: 'Invalid email format' },
    ],
    
    phone: [
      { pattern: ValidationPatterns.PHONE, message: 'Invalid phone number' },
    ],
  },

  // Budget form rules
  BUDGET: {
    name: [
      { required: true, message: 'Budget name is required' },
      { minLength: 2, message: 'Name must be at least 2 characters' },
      { maxLength: 50, message: 'Name must be at most 50 characters' },
    ],
    
    amount: [
      { required: true, message: 'Budget amount is required' },
      { pattern: ValidationPatterns.POSITIVE_NUMBER, message: 'Enter a valid amount' },
      { min: 1, message: 'Amount must be at least 1' },
    ],
    
    period: [
      { required: true, message: 'Budget period is required' },
    ],
  },

  // Login form rules
  LOGIN: {
    email: [
      { required: true, message: 'Email is required' },
      { pattern: ValidationPatterns.EMAIL, message: 'Invalid email format' },
    ],
    
    password: [
      { required: true, message: 'Password is required' },
      { minLength: 8, message: 'Password must be at least 8 characters' },
    ],
  },

  // Registration form rules
  REGISTRATION: {
    name: [
      { required: true, message: 'Name is required' },
      { minLength: 2, message: 'Name must be at least 2 characters' },
    ],
    
    email: [
      { required: true, message: 'Email is required' },
      { pattern: ValidationPatterns.EMAIL, message: 'Invalid email format' },
    ],
    
    password: [
      { required: true, message: 'Password is required' },
      { minLength: 8, message: 'Password must be at least 8 characters' },
      { pattern: ValidationPatterns.PASSWORD, message: ValidationMessages.PASSWORD },
    ],
    
    confirmPassword: [
      { required: true, message: 'Please confirm your password' },
      { match: 'password', message: 'Passwords do not match' },
    ],
  },
};

/**
 * Individual validation functions
 */
export const Validators = {
  /**
   * Check if value is required
   */
  required(value) {
    if (value === null || value === undefined || value === '') {
      return ValidationMessages.REQUIRED;
    }
    return true;
  },

  /**
   * Check email validity
   */
  email(value) {
    if (!value) return true; // Skip if empty (use required separately)
    
    if (!ValidationPatterns.EMAIL.test(value)) {
      return ValidationMessages.EMAIL;
    }
    return true;
  },

  /**
   * Check URL validity
   */
  url(value) {
    if (!value) return true;
    
    if (!ValidationPatterns.URL.test(value)) {
      return ValidationMessages.URL;
    }
    return true;
  },

  /**
   * Check phone number validity
   */
  phone(value) {
    if (!value) return true;
    
    if (!ValidationPatterns.PHONE.test(value)) {
      return ValidationMessages.PHONE;
    }
    return true;
  },

  /**
   * Check password strength
   */
  password(value) {
    if (!value) return true;
    
    if (!ValidationPatterns.PASSWORD.test(value)) {
      return ValidationMessages.PASSWORD;
    }
    return true;
  },

  /**
   * Check min length
   */
  minLength(value, min) {
    if (!value) return true;
    
    if (String(value).length < min) {
      return ValidationMessages.MIN_LENGTH(min);
    }
    return true;
  },

  /**
   * Check max length
   */
  maxLength(value, max) {
    if (!value) return true;
    
    if (String(value).length > max) {
      return ValidationMessages.MAX_LENGTH(max);
    }
    return true;
  },

  /**
   * Check min value
   */
  minValue(value, min) {
    if (value === null || value === undefined || value === '') return true;
    
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < min) {
      return ValidationMessages.MIN_VALUE(min);
    }
    return true;
  },

  /**
   * Check max value
   */
  maxValue(value, max) {
    if (value === null || value === undefined || value === '') return true;
    
    const numValue = Number(value);
    if (isNaN(numValue) || numValue > max) {
      return ValidationMessages.MAX_VALUE(max);
    }
    return true;
  },

  /**
   * Check pattern match
   */
  pattern(value, pattern) {
    if (!value) return true;
    
    if (!pattern.test(String(value))) {
      return ValidationMessages.PATTERN;
    }
    return true;
  },

  /**
   * Check if value matches another field
   */
  match(value, otherValue, fieldName = 'field') {
    if (value !== otherValue) {
      return `${fieldName} does not match`;
    }
    return true;
  },

  /**
   * Check date validity
   */
  isValidDate(value) {
    if (!value) return true;
    
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  /**
   * Check if date is in future
   */
  isFutureDate(value) {
    if (!value) return true;
    
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date <= today) {
      return ValidationMessages.FUTURE_DATE;
    }
    return true;
  },

  /**
   * Check if date is in past
   */
  isPastDate(value) {
    if (!value) return true;
    
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date >= today) {
      return ValidationMessages.PAST_DATE;
    }
    return true;
  },

  /**
   * Check currency amount
   */
  isCurrency(value) {
    if (!value) return true;
    
    if (!ValidationPatterns.CURRENCY.test(String(value))) {
      return ValidationMessages.CURRENCY;
    }
    
    const numValue = Number(value);
    if (numValue <= 0) {
      return 'Amount must be greater than 0';
    }
    
    return true;
  },

  /**
   * Check positive number
   */
  isPositiveNumber(value) {
    if (!value) return true;
    
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) {
      return ValidationMessages.POSITIVE_NUMBER;
    }
    return true;
  },

  /**
   * Check if value is unique in array
   */
  isUnique(value, array, field = 'id', currentId = null) {
    if (!value || !array) return true;
    
    const existing = array.find(item => 
      item[field] === value && (!currentId || item.id !== currentId)
    );
    
    if (existing) {
      return ValidationMessages.UNIQUE;
    }
    return true;
  },

  /**
   * Validate subscription data
   */
  validateSubscription(data, existingSubscriptions = []) {
    const validator = new Validator(FormValidationRules.SUBSCRIPTION);
    const context = {
      uniqueCheck: (value) => Validators.isUnique(
        value, 
        existingSubscriptions, 
        'name', 
        data.id
      ),
    };
    
    return validator.validateAll(data, context);
  },

  /**
   * Validate user profile
   */
  validateProfile(data) {
    const validator = new Validator(FormValidationRules.PROFILE);
    return validator.validateAll(data);
  },

  /**
   * Validate budget
   */
  validateBudget(data) {
    const validator = new Validator(FormValidationRules.BUDGET);
    return validator.validateAll(data);
  },

  /**
   * Validate login credentials
   */
  validateLogin(data) {
    const validator = new Validator(FormValidationRules.LOGIN);
    return validator.validateAll(data);
  },

  /**
   * Validate registration data
   */
  validateRegistration(data) {
    const validator = new Validator(FormValidationRules.REGISTRATION);
    return validator.validateAll(data);
  },

  /**
   * Sanitize input (basic XSS protection)
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Normalize input (trim whitespace, etc.)
   */
  normalizeInput(input) {
    if (typeof input === 'string') {
      return input.trim();
    }
    return input;
  },

  /**
   * Format validation errors for display
   */
  formatErrors(errors) {
    if (!errors || typeof errors !== 'object') {
      return [];
    }
    
    return Object.entries(errors).map(([field, fieldErrors]) => ({
      field,
      messages: Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors],
    }));
  },
};

// Export everything
export default {
  // Patterns and messages
  Patterns: ValidationPatterns,
  Messages: ValidationMessages,
  Rules: FormValidationRules,
  
  // Validator class
  Validator,
  
  // Individual validators
  ...Validators,
  
  // Convenience functions
  validateSubscription: Validators.validateSubscription,
  validateProfile: Validators.validateProfile,
  validateBudget: Validators.validateBudget,
  validateLogin: Validators.validateLogin,
  validateRegistration: Validators.validateRegistration,
  sanitize: Validators.sanitizeInput,
  normalize: Validators.normalizeInput,
  formatErrors: Validators.formatErrors,
};