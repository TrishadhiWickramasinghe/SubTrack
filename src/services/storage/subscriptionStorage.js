import MMKVStorage from 'react-native-mmkv-storage';

const MMKV = new MMKVStorage.Loader().initialize();

// Storage keys
const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subscriptions',
  CATEGORIES: 'categories',
  PAYMENT_HISTORY: 'payment_history',
  SUBSCRIPTION_INDEX: 'subscription_index',
  LAST_SYNC: 'last_sync',
  SUBSCRIPTION_STATS: 'subscription_stats',
};

// Default categories for the app
const DEFAULT_CATEGORIES = [
  {
    id: '1',
    name: 'Entertainment',
    color: '#FF6B6B',
    icon: 'tv',
    monthlyBudget: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Productivity',
    color: '#4ECDC4',
    icon: 'briefcase',
    monthlyBudget: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Health & Fitness',
    color: '#95E1D3',
    icon: 'fitness-center',
    monthlyBudget: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Utilities',
    color: '#FCE38A',
    icon: 'settings',
    monthlyBudget: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Education',
    color: '#F38181',
    icon: 'school',
    monthlyBudget: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Shopping',
    color: '#A8E6CF',
    icon: 'shopping-cart',
    monthlyBudget: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Food & Dining',
    color: '#FFAAA5',
    icon: 'restaurant',
    monthlyBudget: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Transportation',
    color: '#FFD3B6',
    icon: 'directions-car',
    monthlyBudget: 0,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Subscription Storage Service
 * Handles all subscription-related storage operations
 */
class SubscriptionStorage {
  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize storage with default data if empty
   */
  async initializeStorage() {
    const hasCategories = await this.hasCategories();
    if (!hasCategories) {
      await this.saveCategories(DEFAULT_CATEGORIES);
    }
  }

  /**
   * SUBSCRIPTIONS
   */

  /**
   * Get all subscriptions
   * @returns {Promise<Array>}
   */
  async getSubscriptions() {
    try {
      const subscriptions = await MMKV.getArrayAsync(STORAGE_KEYS.SUBSCRIPTIONS);
      return subscriptions || [];
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  }

  /**
   * Get subscription by ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getSubscription(id) {
    try {
      const subscriptions = await this.getSubscriptions();
      return subscriptions.find(sub => sub.id === id) || null;
    } catch (error) {
      console.error(`Error getting subscription ${id}:`, error);
      return null;
    }
  }

  /**
   * Save subscription (create or update)
   * @param {Object} subscription
   * @returns {Promise<Object>}
   */
  async saveSubscription(subscription) {
    try {
      const subscriptions = await this.getSubscriptions();
      const index = subscriptions.findIndex(sub => sub.id === subscription.id);
      
      if (index >= 0) {
        // Update existing
        subscriptions[index] = {
          ...subscriptions[index],
          ...subscription,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Create new
        const newSubscription = {
          ...subscription,
          id: subscription.id || this.generateSubscriptionId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          paymentHistory: subscription.paymentHistory || [],
        };
        subscriptions.push(newSubscription);
      }

      await MMKV.setArrayAsync(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
      await this.updateSubscriptionStats();
      
      return subscription;
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  }

  /**
   * Delete subscription
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteSubscription(id) {
    try {
      let subscriptions = await this.getSubscriptions();
      subscriptions = subscriptions.filter(sub => sub.id !== id);
      await MMKV.setArrayAsync(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
      await this.updateSubscriptionStats();
      return true;
    } catch (error) {
      console.error(`Error deleting subscription ${id}:`, error);
      return false;
    }
  }

  /**
   * Toggle subscription active status
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async toggleSubscriptionStatus(id) {
    try {
      const subscription = await this.getSubscription(id);
      if (!subscription) return null;

      subscription.isActive = !subscription.isActive;
      subscription.updatedAt = new Date().toISOString();
      
      await this.saveSubscription(subscription);
      return subscription;
    } catch (error) {
      console.error(`Error toggling subscription ${id}:`, error);
      return null;
    }
  }

  /**
   * Add payment to subscription history
   * @param {string} subscriptionId
   * @param {Object} paymentData
   * @returns {Promise<Object|null>}
   */
  async addPayment(subscriptionId, paymentData) {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) return null;

      const payment = {
        id: this.generatePaymentId(),
        subscriptionId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        date: paymentData.date || new Date().toISOString(),
        status: 'paid',
        notes: paymentData.notes || '',
        receiptImage: paymentData.receiptImage,
        createdAt: new Date().toISOString(),
      };

      subscription.paymentHistory = subscription.paymentHistory || [];
      subscription.paymentHistory.push(payment);
      subscription.lastPaymentDate = payment.date;
      subscription.nextPaymentDate = this.calculateNextPaymentDate(
        subscription.billingCycle,
        payment.date,
      );

      await this.saveSubscription(subscription);
      return payment;
    } catch (error) {
      console.error(`Error adding payment for subscription ${subscriptionId}:`, error);
      return null;
    }
  }

  /**
   * Get upcoming payments (within next X days)
   * @param {number} days - Number of days to look ahead
   * @returns {Promise<Array>}
   */
  async getUpcomingPayments(days = 7) {
    try {
      const subscriptions = await this.getSubscriptions();
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);

      return subscriptions
        .filter(sub => sub.isActive && sub.nextPaymentDate)
        .filter(sub => {
          const paymentDate = new Date(sub.nextPaymentDate);
          return paymentDate >= now && paymentDate <= futureDate;
        })
        .sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate))
        .map(sub => ({
          ...sub,
          daysUntil: Math.ceil(
            (new Date(sub.nextPaymentDate) - now) / (1000 * 60 * 60 * 24),
          ),
        }));
    } catch (error) {
      console.error('Error getting upcoming payments:', error);
      return [];
    }
  }

  /**
   * Get subscriptions by category
   * @param {string} categoryId
   * @returns {Promise<Array>}
   */
  async getSubscriptionsByCategory(categoryId) {
    try {
      const subscriptions = await this.getSubscriptions();
      return subscriptions.filter(sub => sub.categoryId === categoryId);
    } catch (error) {
      console.error(`Error getting subscriptions for category ${categoryId}:`, error);
      return [];
    }
  }

  /**
   * Search subscriptions
   * @param {string} query
   * @returns {Promise<Array>}
   */
  async searchSubscriptions(query) {
    try {
      const subscriptions = await this.getSubscriptions();
      const lowerQuery = query.toLowerCase();
      
      return subscriptions.filter(sub =>
        sub.name.toLowerCase().includes(lowerQuery) ||
        sub.description?.toLowerCase().includes(lowerQuery) ||
        sub.notes?.toLowerCase().includes(lowerQuery),
      );
    } catch (error) {
      console.error('Error searching subscriptions:', error);
      return [];
    }
  }

  /**
   * Get subscription statistics
   * @returns {Promise<Object>}
   */
  async getSubscriptionStats() {
    try {
      const stats = await MMKV.getMapAsync(STORAGE_KEYS.SUBSCRIPTION_STATS);
      if (stats) return stats;

      // Generate stats if not exists
      return await this.updateSubscriptionStats();
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Update subscription statistics
   * @returns {Promise<Object>}
   */
  async updateSubscriptionStats() {
    try {
      const subscriptions = await this.getSubscriptions();
      const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
      const inactiveSubscriptions = subscriptions.filter(sub => !sub.isActive);

      // Calculate monthly and yearly totals
      let monthlyTotal = 0;
      let yearlyTotal = 0;

      activeSubscriptions.forEach(sub => {
        const amount = parseFloat(sub.amount) || 0;
        switch (sub.billingCycle) {
          case 'monthly':
            monthlyTotal += amount;
            yearlyTotal += amount * 12;
            break;
          case 'yearly':
            monthlyTotal += amount / 12;
            yearlyTotal += amount;
            break;
          case 'quarterly':
            monthlyTotal += amount / 3;
            yearlyTotal += amount * 4;
            break;
          case 'weekly':
            monthlyTotal += amount * 4.33;
            yearlyTotal += amount * 52;
            break;
          case 'daily':
            monthlyTotal += amount * 30;
            yearlyTotal += amount * 365;
            break;
        }
      });

      // Calculate by category
      const categoryStats = {};
      activeSubscriptions.forEach(sub => {
        if (!categoryStats[sub.categoryId]) {
          categoryStats[sub.categoryId] = {
            count: 0,
            total: 0,
            monthly: 0,
          };
        }
        categoryStats[sub.categoryId].count += 1;
        categoryStats[sub.categoryId].total += parseFloat(sub.amount) || 0;
        
        // Calculate monthly amount by billing cycle
        const amount = parseFloat(sub.amount) || 0;
        let monthlyAmount = amount;
        
        switch (sub.billingCycle) {
          case 'yearly':
            monthlyAmount = amount / 12;
            break;
          case 'quarterly':
            monthlyAmount = amount / 3;
            break;
          case 'weekly':
            monthlyAmount = amount * 4.33;
            break;
          case 'daily':
            monthlyAmount = amount * 30;
            break;
        }
        
        categoryStats[sub.categoryId].monthly += monthlyAmount;
      });

      const stats = {
        totalCount: subscriptions.length,
        activeCount: activeSubscriptions.length,
        inactiveCount: inactiveSubscriptions.length,
        monthlyTotal: parseFloat(monthlyTotal.toFixed(2)),
        yearlyTotal: parseFloat(yearlyTotal.toFixed(2)),
        categoryStats,
        lastUpdated: new Date().toISOString(),
      };

      await MMKV.setMapAsync(STORAGE_KEYS.SUBSCRIPTION_STATS, stats);
      return stats;
    } catch (error) {
      console.error('Error updating subscription stats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Get default stats object
   * @returns {Object}
   */
  getDefaultStats() {
    return {
      totalCount: 0,
      activeCount: 0,
      inactiveCount: 0,
      monthlyTotal: 0,
      yearlyTotal: 0,
      categoryStats: {},
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * CATEGORIES
   */

  /**
   * Get all categories
   * @returns {Promise<Array>}
   */
  async getCategories() {
    try {
      const categories = await MMKV.getArrayAsync(STORAGE_KEYS.CATEGORIES);
      return categories || DEFAULT_CATEGORIES;
    } catch (error) {
      console.error('Error getting categories:', error);
      return DEFAULT_CATEGORIES;
    }
  }

  /**
   * Check if categories exist
   * @returns {Promise<boolean>}
   */
  async hasCategories() {
    try {
      const categories = await MMKV.getArrayAsync(STORAGE_KEYS.CATEGORIES);
      return !!categories && categories.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save categories
   * @param {Array} categories
   * @returns {Promise<boolean>}
   */
  async saveCategories(categories) {
    try {
      await MMKV.setArrayAsync(STORAGE_KEYS.CATEGORIES, categories);
      return true;
    } catch (error) {
      console.error('Error saving categories:', error);
      return false;
    }
  }

  /**
   * Add or update category
   * @param {Object} category
   * @returns {Promise<Object>}
   */
  async saveCategory(category) {
    try {
      const categories = await this.getCategories();
      const index = categories.findIndex(cat => cat.id === category.id);
      
      if (index >= 0) {
        categories[index] = {
          ...categories[index],
          ...category,
          updatedAt: new Date().toISOString(),
        };
      } else {
        const newCategory = {
          ...category,
          id: category.id || this.generateCategoryId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        categories.push(newCategory);
      }

      await this.saveCategories(categories);
      return category;
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  }

  /**
   * Delete category (will reassign subscriptions to default category)
   * @param {string} categoryId
   * @param {string} reassignToId - ID of category to reassign subscriptions to
   * @returns {Promise<boolean>}
   */
  async deleteCategory(categoryId, reassignToId = '1') {
    try {
      const categories = await this.getCategories();
      
      // Don't allow deleting default categories
      const isDefault = DEFAULT_CATEGORIES.some(cat => cat.id === categoryId);
      if (isDefault) {
        throw new Error('Cannot delete default categories');
      }

      // Reassign subscriptions to another category
      const subscriptions = await this.getSubscriptions();
      const updatedSubscriptions = subscriptions.map(sub => {
        if (sub.categoryId === categoryId) {
          return { ...sub, categoryId: reassignToId };
        }
        return sub;
      });

      await MMKV.setArrayAsync(STORAGE_KEYS.SUBSCRIPTIONS, updatedSubscriptions);
      
      // Remove category
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      await this.saveCategories(updatedCategories);
      
      await this.updateSubscriptionStats();
      return true;
    } catch (error) {
      console.error(`Error deleting category ${categoryId}:`, error);
      return false;
    }
  }

  /**
   * PAYMENT HISTORY
   */

  /**
   * Get all payment history
   * @returns {Promise<Array>}
   */
  async getPaymentHistory() {
    try {
      const payments = await MMKV.getArrayAsync(STORAGE_KEYS.PAYMENT_HISTORY);
      return payments || [];
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  /**
   * Get payments by date range
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Array>}
   */
  async getPaymentsByDateRange(startDate, endDate) {
    try {
      const payments = await this.getPaymentHistory();
      return payments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting payments by date range:', error);
      return [];
    }
  }

  /**
   * Get payments by subscription
   * @param {string} subscriptionId
   * @returns {Promise<Array>}
   */
  async getPaymentsBySubscription(subscriptionId) {
    try {
      const payments = await this.getPaymentHistory();
      return payments.filter(payment => payment.subscriptionId === subscriptionId);
    } catch (error) {
      console.error(`Error getting payments for subscription ${subscriptionId}:`, error);
      return [];
    }
  }

  /**
   * UTILITY METHODS
   */

  /**
   * Generate unique subscription ID
   * @returns {string}
   */
  generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique payment ID
   * @returns {string}
   */
  generatePaymentId() {
    return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique category ID
   * @returns {string}
   */
  generateCategoryId() {
    return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate next payment date based on billing cycle
   * @param {string} billingCycle
   * @param {string} lastPaymentDate
   * @returns {string}
   */
  calculateNextPaymentDate(billingCycle, lastPaymentDate) {
    const date = new Date(lastPaymentDate);
    
    switch (billingCycle) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    
    return date.toISOString();
  }

  /**
   * Clear all subscription data (for testing/reset)
   * @returns {Promise<boolean>}
   */
  async clearAllData() {
    try {
      await MMKV.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
      await MMKV.removeItem(STORAGE_KEYS.PAYMENT_HISTORY);
      await MMKV.removeItem(STORAGE_KEYS.SUBSCRIPTION_STATS);
      // Don't clear categories - keep default categories
      return true;
    } catch (error) {
      console.error('Error clearing subscription data:', error);
      return false;
    }
  }

  /**
   * Export all subscription data
   * @returns {Promise<Object>}
   */
  async exportData() {
    try {
      const subscriptions = await this.getSubscriptions();
      const categories = await this.getCategories();
      const paymentHistory = await this.getPaymentHistory();
      const stats = await this.getSubscriptionStats();

      return {
        subscriptions,
        categories,
        paymentHistory,
        stats,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Import subscription data
   * @param {Object} data
   * @returns {Promise<boolean>}
   */
  async importData(data) {
    try {
      if (data.subscriptions) {
        await MMKV.setArrayAsync(STORAGE_KEYS.SUBSCRIPTIONS, data.subscriptions);
      }
      
      if (data.categories) {
        await MMKV.setArrayAsync(STORAGE_KEYS.CATEGORIES, data.categories);
      }
      
      if (data.paymentHistory) {
        await MMKV.setArrayAsync(STORAGE_KEYS.PAYMENT_HISTORY, data.paymentHistory);
      }
      
      await this.updateSubscriptionStats();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Create singleton instance
const subscriptionStorage = new SubscriptionStorage();
export default subscriptionStorage;