import { MMKV } from 'react-native-mmkv';

const MMKV_INSTANCE = new MMKV({
  id: 'subtrack_budget_storage',
});

// Storage keys
const STORAGE_KEYS = {
  BUDGETS: 'budgets',
  BUDGET_TRANSACTIONS: 'budget_transactions',
  BUDGET_CATEGORIES: 'budget_categories',
  BUDGET_ALERTS: 'budget_alerts',
  BUDGET_HISTORY: 'budget_history',
  MONTHLY_BUDGET: 'monthly_budget',
  CATEGORY_BUDGETS: 'category_budgets',
  BUDGET_INDEX: 'budget_index',
};

// Default budget structure
const DEFAULT_BUDGET = {
  id: '',
  name: 'Monthly Budget',
  totalAmount: 0,
  spent: 0,
  remaining: 0,
  period: 'monthly',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  categoryLimits: {},
  alerts: {
    enabled: true,
    threshold: 80,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Default category budgets
const DEFAULT_CATEGORY_BUDGETS = {
  Entertainment: 100,
  Productivity: 50,
  'Health & Fitness': 75,
  Utilities: 50,
  Education: 100,
  Shopping: 200,
  'Food & Dining': 150,
  Transportation: 100,
};

/**
 * Budget Storage Service
 * Handles all budget-related storage operations
 */
class BudgetStorage {
  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize storage with default data if empty
   */
  initializeStorage() {
    try {
      const hasBudgets = this.hasBudgets();
      if (!hasBudgets) {
        this.saveBudgets([]);
        this.saveCategoryBudgets(DEFAULT_CATEGORY_BUDGETS);
      }
    } catch (error) {
      console.error('Error initializing budget storage:', error);
    }
  }

  /**
   * Check if budgets exist
   */
  hasBudgets(): boolean {
    try {
      return MMKV_INSTANCE.contains(STORAGE_KEYS.BUDGETS);
    } catch (error) {
      console.error('Error checking budgets:', error);
      return false;
    }
  }

  /**
   * Get all budgets
   */
  getAllBudgets() {
    try {
      const budgets = MMKV_INSTANCE.getString(STORAGE_KEYS.BUDGETS);
      return budgets ? JSON.parse(budgets) : [];
    } catch (error) {
      console.error('Error getting budgets:', error);
      return [];
    }
  }

  /**
   * Get a specific budget by ID
   */
  getBudgetById(budgetId: string) {
    try {
      const budgets = this.getAllBudgets();
      return budgets.find((b: any) => b.id === budgetId);
    } catch (error) {
      console.error('Error getting budget by ID:', error);
      return null;
    }
  }

  /**
   * Save budgets
   */
  saveBudgets(budgets: any[]) {
    try {
      MMKV_INSTANCE.set(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      return true;
    } catch (error) {
      console.error('Error saving budgets:', error);
      return false;
    }
  }

  /**
   * Add a new budget
   */
  addBudget(budget: any) {
    try {
      const budgets = this.getAllBudgets();
      const newBudget = {
        ...DEFAULT_BUDGET,
        ...budget,
        id: budget.id || `budget_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      budgets.push(newBudget);
      this.saveBudgets(budgets);
      return newBudget;
    } catch (error) {
      console.error('Error adding budget:', error);
      return null;
    }
  }

  /**
   * Update a budget
   */
  updateBudget(budgetId: string, updates: any) {
    try {
      const budgets = this.getAllBudgets();
      const index = budgets.findIndex((b: any) => b.id === budgetId);
      if (index >= 0) {
        budgets[index] = {
          ...budgets[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.saveBudgets(budgets);
        return budgets[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating budget:', error);
      return null;
    }
  }

  /**
   * Delete a budget
   */
  deleteBudget(budgetId: string) {
    try {
      const budgets = this.getAllBudgets();
      const filtered = budgets.filter((b: any) => b.id !== budgetId);
      this.saveBudgets(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting budget:', error);
      return false;
    }
  }

  /**
   * Get monthly budget
   */
  getMonthlyBudget() {
    try {
      const budget = MMKV_INSTANCE.getString(STORAGE_KEYS.MONTHLY_BUDGET);
      return budget ? JSON.parse(budget) : DEFAULT_BUDGET;
    } catch (error) {
      console.error('Error getting monthly budget:', error);
      return DEFAULT_BUDGET;
    }
  }

  /**
   * Set monthly budget
   */
  setMonthlyBudget(budget: any) {
    try {
      MMKV_INSTANCE.set(STORAGE_KEYS.MONTHLY_BUDGET, JSON.stringify(budget));
      return true;
    } catch (error) {
      console.error('Error setting monthly budget:', error);
      return false;
    }
  }

  /**
   * Get category budgets
   */
  getCategoryBudgets() {
    try {
      const budgets = MMKV_INSTANCE.getString(STORAGE_KEYS.CATEGORY_BUDGETS);
      return budgets ? JSON.parse(budgets) : DEFAULT_CATEGORY_BUDGETS;
    } catch (error) {
      console.error('Error getting category budgets:', error);
      return DEFAULT_CATEGORY_BUDGETS;
    }
  }

  /**
   * Save category budgets
   */
  saveCategoryBudgets(budgets: any) {
    try {
      MMKV_INSTANCE.set(STORAGE_KEYS.CATEGORY_BUDGETS, JSON.stringify(budgets));
      return true;
    } catch (error) {
      console.error('Error saving category budgets:', error);
      return false;
    }
  }

  /**
   * Update a category budget
   */
  updateCategoryBudget(category: string, amount: number) {
    try {
      const budgets = this.getCategoryBudgets();
      budgets[category] = amount;
      this.saveCategoryBudgets(budgets);
      return true;
    } catch (error) {
      console.error('Error updating category budget:', error);
      return false;
    }
  }

  /**
   * Get budget transactions
   */
  getBudgetTransactions(budgetId?: string) {
    try {
      const transactions = MMKV_INSTANCE.getString(STORAGE_KEYS.BUDGET_TRANSACTIONS);
      if (!transactions) return [];
      
      const parsed = JSON.parse(transactions);
      if (budgetId) {
        return parsed.filter((t: any) => t.budgetId === budgetId);
      }
      return parsed;
    } catch (error) {
      console.error('Error getting budget transactions:', error);
      return [];
    }
  }

  /**
   * Add budget transaction
   */
  addBudgetTransaction(transaction: any) {
    try {
      const transactions = this.getBudgetTransactions();
      const newTransaction = {
        ...transaction,
        id: transaction.id || `transaction_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      transactions.push(newTransaction);
      MMKV_INSTANCE.set(STORAGE_KEYS.BUDGET_TRANSACTIONS, JSON.stringify(transactions));
      return newTransaction;
    } catch (error) {
      console.error('Error adding budget transaction:', error);
      return null;
    }
  }

  /**
   * Get budget alerts
   */
  getBudgetAlerts(budgetId?: string) {
    try {
      const alerts = MMKV_INSTANCE.getString(STORAGE_KEYS.BUDGET_ALERTS);
      if (!alerts) return [];
      
      const parsed = JSON.parse(alerts);
      if (budgetId) {
        return parsed.filter((a: any) => a.budgetId === budgetId);
      }
      return parsed;
    } catch (error) {
      console.error('Error getting budget alerts:', error);
      return [];
    }
  }

  /**
   * Add budget alert
   */
  addBudgetAlert(alert: any) {
    try {
      const alerts = this.getBudgetAlerts();
      const newAlert = {
        ...alert,
        id: alert.id || `alert_${Date.now()}`,
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      alerts.push(newAlert);
      MMKV_INSTANCE.set(STORAGE_KEYS.BUDGET_ALERTS, JSON.stringify(alerts));
      return newAlert;
    } catch (error) {
      console.error('Error adding budget alert:', error);
      return null;
    }
  }

  /**
   * Mark alert as read
   */
  markAlertAsRead(alertId: string) {
    try {
      const alerts = this.getBudgetAlerts();
      const alert = alerts.find((a: any) => a.id === alertId);
      if (alert) {
        alert.isRead = true;
        MMKV_INSTANCE.set(STORAGE_KEYS.BUDGET_ALERTS, JSON.stringify(alerts));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      return false;
    }
  }

  /**
   * Get budget history
   */
  getBudgetHistory(budgetId?: string) {
    try {
      const history = MMKV_INSTANCE.getString(STORAGE_KEYS.BUDGET_HISTORY);
      if (!history) return [];
      
      const parsed = JSON.parse(history);
      if (budgetId) {
        return parsed.filter((h: any) => h.budgetId === budgetId);
      }
      return parsed;
    } catch (error) {
      console.error('Error getting budget history:', error);
      return [];
    }
  }

  /**
   * Add budget history entry
   */
  addBudgetHistoryEntry(entry: any) {
    try {
      const history = this.getBudgetHistory();
      const newEntry = {
        ...entry,
        id: entry.id || `history_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      history.push(newEntry);
      MMKV_INSTANCE.set(STORAGE_KEYS.BUDGET_HISTORY, JSON.stringify(history));
      return newEntry;
    } catch (error) {
      console.error('Error adding budget history entry:', error);
      return null;
    }
  }

  /**
   * Clear all budget data
   */
  async clearAllBudgetData() {
    try {
      MMKV_INSTANCE.delete(STORAGE_KEYS.BUDGETS);
      MMKV_INSTANCE.delete(STORAGE_KEYS.BUDGET_TRANSACTIONS);
      MMKV_INSTANCE.delete(STORAGE_KEYS.BUDGET_CATEGORIES);
      MMKV_INSTANCE.delete(STORAGE_KEYS.BUDGET_ALERTS);
      MMKV_INSTANCE.delete(STORAGE_KEYS.BUDGET_HISTORY);
      MMKV_INSTANCE.delete(STORAGE_KEYS.MONTHLY_BUDGET);
      MMKV_INSTANCE.delete(STORAGE_KEYS.CATEGORY_BUDGETS);
      return true;
    } catch (error) {
      console.error('Error clearing budget data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const budgetStorage = new BudgetStorage();
export default BudgetStorage;
