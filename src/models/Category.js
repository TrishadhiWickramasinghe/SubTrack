/**
 * Category Model
 * For organizing subscriptions into categories
 */

import { v4 as uuidv4 } from 'uuid';

// Default categories with icons and colors
export const DEFAULT_CATEGORIES = [
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'film',
    color: '#6366F1',
    description: 'Streaming services, gaming, movies, music',
    isDefault: true,
    order: 1,
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: 'lightbulb',
    color: '#10B981',
    description: 'Electricity, water, internet, mobile plans',
    isDefault: true,
    order: 2,
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: 'briefcase',
    color: '#F59E0B',
    description: 'Software, cloud storage, office tools',
    isDefault: true,
    order: 3,
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: 'heart-pulse',
    color: '#A855F7',
    description: 'Gym memberships, health apps, fitness trackers',
    isDefault: true,
    order: 4,
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'school',
    color: '#EC4899',
    description: 'Online courses, learning platforms, e-books',
    isDefault: true,
    order: 5,
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: 'bank',
    color: '#3B82F6',
    description: 'Banking fees, investment apps, insurance',
    isDefault: true,
    order: 6,
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'cart',
    color: '#F97316',
    description: 'Amazon Prime, delivery services, memberships',
    isDefault: true,
    order: 7,
  },
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'food',
    color: '#EF4444',
    description: 'Meal kits, food delivery, coffee subscriptions',
    isDefault: true,
    order: 8,
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: 'airplane',
    color: '#10B981',
    description: 'Travel memberships, ride-sharing, accommodation',
    isDefault: true,
    order: 9,
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'dots-horizontal-circle',
    color: '#6B7280',
    description: 'Miscellaneous subscriptions',
    isDefault: true,
    order: 10,
  },
];

/**
 * Category class for subscription categorization
 */
export default class Category {
  constructor(data = {}) {
    // Core properties
    this.id = data.id || uuidv4();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // Basic information
    this.name = data.name || '';
    this.description = data.description || '';
    this.icon = data.icon || 'help-circle';
    this.color = data.color || '#6B7280';
    this.thumbnail = data.thumbnail || null; // URL or local path to category image
    
    // Organization
    this.parentId = data.parentId || null; // For nested categories
    this.children = data.children || []; // Array of child category IDs
    this.order = data.order || 0;
    this.isDefault = data.isDefault || false;
    this.isSystem = data.isSystem || false; // System categories can't be deleted
    
    // Budget tracking
    this.hasBudget = data.hasBudget || false;
    this.monthlyBudget = data.monthlyBudget || 0;
    this.yearlyBudget = data.yearlyBudget || 0;
    this.budgetAlertThreshold = data.budgetAlertThreshold || 80; // Percentage
    
    // Statistics (calculated)
    this.subscriptionCount = data.subscriptionCount || 0;
    this.totalMonthlyAmount = data.totalMonthlyAmount || 0;
    this.totalYearlyAmount = data.totalYearlyAmount || 0;
    this.averageSubscriptionCost = data.averageSubscriptionCost || 0;
    
    // Usage tracking
    this.lastUsed = data.lastUsed || null;
    this.usageFrequency = data.usageFrequency || 0; // Times viewed/used
    
    // Customization
    this.isHidden = data.isHidden || false;
    this.isArchived = data.isArchived || false;
    this.customFields = data.customFields || {}; // Additional custom properties
    
    // Metadata
    this.version = data.version || 1;
    this.isDeleted = data.isDeleted || false;
    this.deletedAt = data.deletedAt || null;
  }

  /**
   * Update statistics based on subscriptions
   */
  updateStatistics(subscriptions = []) {
    const categorySubscriptions = subscriptions.filter(
      sub => sub.category === this.id || sub.category === this.name
    );
    
    this.subscriptionCount = categorySubscriptions.length;
    
    // Calculate total amounts
    this.totalMonthlyAmount = categorySubscriptions.reduce((total, sub) => {
      if (sub.billingCycle === 'monthly') {
        return total + sub.totalAmount;
      } else if (sub.billingCycle === 'yearly') {
        return total + (sub.totalAmount / 12);
      } else if (sub.billingCycle === 'weekly') {
        return total + (sub.totalAmount * 4.33); // Average weeks in month
      } else if (sub.billingCycle === 'daily') {
        return total + (sub.totalAmount * 30); // Average days in month
      } else {
        return total + sub.totalAmount;
      }
    }, 0);
    
    this.totalYearlyAmount = this.totalMonthlyAmount * 12;
    
    // Calculate average cost
    this.averageSubscriptionCost = this.subscriptionCount > 0 
      ? this.totalMonthlyAmount / this.subscriptionCount 
      : 0;
    
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Check if category is over budget
   */
  isOverBudget(currentSpending = 0) {
    if (!this.hasBudget || this.monthlyBudget <= 0) return false;
    
    const percentage = (currentSpending / this.monthlyBudget) * 100;
    return percentage >= this.budgetAlertThreshold;
  }

  /**
   * Calculate budget percentage used
   */
  getBudgetPercentage(currentSpending = 0) {
    if (!this.hasBudget || this.monthlyBudget <= 0) return 0;
    
    const percentage = (currentSpending / this.monthlyBudget) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  }

  /**
   * Calculate remaining budget
   */
  getRemainingBudget(currentSpending = 0) {
    if (!this.hasBudget) return 0;
    
    return Math.max(0, this.monthlyBudget - currentSpending);
  }

  /**
   * Mark as used (increment usage frequency)
   */
  markAsUsed() {
    this.usageFrequency += 1;
    this.lastUsed = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Add child category
   */
  addChild(categoryId) {
    if (!this.children.includes(categoryId)) {
      this.children.push(categoryId);
      this.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Remove child category
   */
  removeChild(categoryId) {
    const index = this.children.indexOf(categoryId);
    if (index > -1) {
      this.children.splice(index, 1);
      this.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Check if category has children
   */
  hasChildren() {
    return this.children.length > 0;
  }

  /**
   * Archive category (soft delete)
   */
  archive() {
    this.isArchived = true;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Restore from archive
   */
  restore() {
    this.isArchived = false;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Hide category from main views
   */
  hide() {
    this.isHidden = true;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Show category in main views
   */
  show() {
    this.isHidden = false;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      description: this.description,
      icon: this.icon,
      color: this.color,
      thumbnail: this.thumbnail,
      parentId: this.parentId,
      children: this.children,
      order: this.order,
      isDefault: this.isDefault,
      isSystem: this.isSystem,
      hasBudget: this.hasBudget,
      monthlyBudget: this.monthlyBudget,
      yearlyBudget: this.yearlyBudget,
      budgetAlertThreshold: this.budgetAlertThreshold,
      subscriptionCount: this.subscriptionCount,
      totalMonthlyAmount: this.totalMonthlyAmount,
      totalYearlyAmount: this.totalYearlyAmount,
      averageSubscriptionCost: this.averageSubscriptionCost,
      lastUsed: this.lastUsed,
      usageFrequency: this.usageFrequency,
      isHidden: this.isHidden,
      isArchived: this.isArchived,
      customFields: this.customFields,
      version: this.version,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
    };
  }

  /**
   * Create Category instance from JSON data
   */
  static fromJSON(data) {
    return new Category(data);
  }

  /**
   * Create a new custom category
   */
  static createCustom(name, color = null, icon = null) {
    return new Category({
      name,
      color: color || this.getRandomColor(),
      icon: icon || 'tag',
      isDefault: false,
    });
  }

  /**
   * Get random color for new category
   */
  static getRandomColor() {
    const colors = [
      '#6366F1', '#10B981', '#F59E0B', '#A855F7', '#EC4899',
      '#3B82F6', '#F97316', '#EF4444', '#8B5CF6', '#06B6D4',
      '#14B8A6', '#84CC16', '#EAB308', '#F43F5E', '#8B5CF6',
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Get default categories
   */
  static getDefaultCategories() {
    return DEFAULT_CATEGORIES.map(cat => new Category(cat));
  }

  /**
   * Validate category data
   */
  validate() {
    const errors = [];
    
    if (!this.name.trim()) {
      errors.push('Category name is required');
    }
    
    if (!this.icon) {
      errors.push('Icon is required');
    }
    
    if (!this.color) {
      errors.push('Color is required');
    }
    
    if (this.monthlyBudget < 0) {
      errors.push('Monthly budget cannot be negative');
    }
    
    if (this.budgetAlertThreshold < 0 || this.budgetAlertThreshold > 100) {
      errors.push('Budget alert threshold must be between 0 and 100');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get category summary for display
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      color: this.color,
      subscriptionCount: this.subscriptionCount,
      totalMonthlyAmount: this.totalMonthlyAmount,
      hasBudget: this.hasBudget,
      monthlyBudget: this.monthlyBudget,
      isOverBudget: this.isOverBudget(this.totalMonthlyAmount),
      budgetPercentage: this.getBudgetPercentage(this.totalMonthlyAmount),
    };
  }
}

// Export default categories for easy access
export { DEFAULT_CATEGORIES };
