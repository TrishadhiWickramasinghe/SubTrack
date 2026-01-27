/**
 * SUBTRACK - Working UI & Functions Examples
 * 
 * This file demonstrates:
 * 1. How to use the utility functions
 * 2. How to use the UI components
 * 3. How to work with mock data
 * 4. Best practices for the project
 */

// ==================== IMPORTS ====================
import {
    MOCK_BUDGETS,
    MOCK_SUBSCRIPTIONS
} from '@/utils/mockData';

import {
    calculateAnnualSpending,
    calculateMonthlySpending,
    countByStatus,
    formatCurrency,
    formatDate,
    getActiveSubscriptions,
    getBudgetPercentage,
    getBudgetStatus,
    getDaysUntilBilling,
    getSpendingByCategory,
    getTopExpensive,
    groupByCategory,
    searchSubscriptions,
    sortByNextBilling,
} from '@/utils/subscriptionHelpers';

// ==================== EXAMPLES ====================

/**
 * EXAMPLE 1: Calculate Monthly & Annual Spending
 */
export const exampleCalculateSpending = () => {
  const monthly = calculateMonthlySpending(MOCK_SUBSCRIPTIONS);
  const annual = calculateAnnualSpending(MOCK_SUBSCRIPTIONS);

  console.log('Monthly Spending:', formatCurrency(monthly)); // $175.94
  console.log('Annual Spending:', formatCurrency(annual));   // $2,111.28

  return { monthly, annual };
};

/**
 * EXAMPLE 2: Get Spending Breakdown by Category
 */
export const exampleGetSpendingByCategory = () => {
  const spending = getSpendingByCategory(MOCK_SUBSCRIPTIONS);

  // Output:
  // {
  //   Entertainment: 25.98,
  //   Productivity: 99.97,
  //   Health: 49.99
  // }

  Object.entries(spending).forEach(([category, amount]) => {
    console.log(`${category}: ${formatCurrency(amount)}`);
  });

  return spending;
};

/**
 * EXAMPLE 3: Get Active Subscriptions Only
 */
export const exampleGetActiveSubscriptions = () => {
  const active = getActiveSubscriptions(MOCK_SUBSCRIPTIONS);
  console.log(`Active subscriptions: ${active.length}`); // 7

  return active;
};

/**
 * EXAMPLE 4: Sort Subscriptions by Next Billing Date
 */
export const exampleSortByNextBilling = () => {
  const sorted = sortByNextBilling(MOCK_SUBSCRIPTIONS);

  sorted.forEach(sub => {
    const daysUntil = getDaysUntilBilling(sub.nextBillingDate);
    console.log(`${sub.name}: ${formatDate(sub.nextBillingDate)} (${daysUntil} days)`);
  });

  return sorted;
};

/**
 * EXAMPLE 5: Search Subscriptions
 */
export const exampleSearchSubscriptions = () => {
  const query = 'netflix';
  const results = searchSubscriptions(MOCK_SUBSCRIPTIONS, query);

  console.log(`Found ${results.length} results for "${query}"`);
  results.forEach(sub => console.log(`- ${sub.name}`));

  return results;
};

/**
 * EXAMPLE 6: Group Subscriptions by Category
 */
export const exampleGroupByCategory = () => {
  const grouped = groupByCategory(MOCK_SUBSCRIPTIONS);

  // Output:
  // {
  //   Entertainment: [...],
  //   Productivity: [...],
  //   Health: [...]
  // }

  Object.entries(grouped).forEach(([category, subs]) => {
    console.log(`${category}: ${subs.length} subscriptions`);
  });

  return grouped;
};

/**
 * EXAMPLE 7: Count Subscriptions by Status
 */
export const exampleCountByStatus = () => {
  const counts = countByStatus(MOCK_SUBSCRIPTIONS);

  // Output: { active: 6, trial: 1, cancelled: 0 }
  console.log('Status breakdown:', counts);

  return counts;
};

/**
 * EXAMPLE 8: Get Most Expensive Subscriptions
 */
export const exampleGetTopExpensive = () => {
  const top5 = getTopExpensive(MOCK_SUBSCRIPTIONS, 5);

  console.log('Top 5 most expensive:');
  top5.forEach((sub, index) => {
    const savings = formatCurrency(sub.amount * 12); // Annual cost
    console.log(`${index + 1}. ${sub.name} - ${savings}/year`);
  });

  return top5;
};

/**
 * EXAMPLE 9: Budget Analysis
 */
export const exampleBudgetAnalysis = () => {
  const budgetAnalysis = MOCK_BUDGETS.map(budget => {
    const percentage = getBudgetPercentage(budget);
    const status = getBudgetStatus(budget);
    const remaining = budget.limit - budget.spent;

    return {
      category: budget.category,
      spent: budget.spent,
      limit: budget.limit,
      remaining,
      percentage,
      status,
      message:
        status === 'over'
          ? `Over budget by ${formatCurrency(budget.spent - budget.limit)}`
          : `${formatCurrency(remaining)} remaining`,
    };
  });

  budgetAnalysis.forEach(b => {
    console.log(`${b.category}: ${b.message}`);
  });

  return budgetAnalysis;
};

/**
 * EXAMPLE 10: Find Potential Savings
 */
export const exampleFindSavings = () => {
  const expensive = getTopExpensive(MOCK_SUBSCRIPTIONS, 1)[0];

  if (expensive) {
    const monthlySaving = expensive.amount;
    const annualSaving = monthlySaving * 12;

    console.log(`Potential savings by cancelling ${expensive.name}:`);
    console.log(`- Monthly: ${formatCurrency(monthlySaving)}`);
    console.log(`- Annual: ${formatCurrency(annualSaving)}`);

    return { monthlySaving, annualSaving };
  }
};

// ==================== UI COMPONENT USAGE ====================

/**
 * EXAMPLE 11: Using UI Components - SubscriptionItem
 */
export const exampleSubscriptionItemUsage = () => {
  // In a React component:
  // import { SubscriptionItem } from '@/components/ui/SubTrackComponents';
  // import { getDaysUntilBilling, formatDate } from '@/utils/subscriptionHelpers';
  //
  // const subscription = MOCK_SUBSCRIPTIONS[0];
  //
  // <SubscriptionItem
  //   name={subscription.name}
  //   amount={subscription.amount}
  //   currency={subscription.currency}
  //   icon={subscription.icon}
  //   color={subscription.color}
  //   nextBillingDate={formatDate(subscription.nextBillingDate)}
  //   daysUntil={getDaysUntilBilling(subscription.nextBillingDate)}
  //   onPress={() => handleSubscriptionPress(subscription.id)}
  // />
};

/**
 * EXAMPLE 12: Using UI Components - StatBox
 */
export const exampleStatBoxUsage = () => {
  // In a React component:
  // import { StatBox } from '@/components/ui/SubTrackComponents';
  //
  // <View style={{ flexDirection: 'row' }}>
  //   <StatBox
  //     label="Monthly Spend"
  //     value={formatCurrency(calculateMonthlySpending(subscriptions))}
  //     color="#6366F1"
  //     icon="💰"
  //   />
  //   <StatBox
  //     label="Active"
  //     value={`${activeSubscriptions.length}`}
  //     color="#10B981"
  //     icon="✅"
  //   />
  // </View>
};

/**
 * EXAMPLE 13: Using UI Components - BudgetItem
 */
export const exampleBudgetItemUsage = () => {
  // In a React component:
  // import { BudgetItem } from '@/components/ui/SubTrackComponents';
  // import { getBudgetPercentage, getBudgetStatus } from '@/utils/subscriptionHelpers';
  //
  // {budgets.map(budget => (
  //   <BudgetItem
  //     key={budget.id}
  //     category={budget.category}
  //     spent={budget.spent}
  //     limit={budget.limit}
  //     currency={budget.currency}
  //     percentage={getBudgetPercentage(budget)}
  //     status={getBudgetStatus(budget)}
  //   />
  // ))}
};

/**
 * EXAMPLE 14: Using UI Components - Button
 */
export const exampleButtonUsage = () => {
  // In a React component:
  // import { Button } from '@/components/ui/SubTrackComponents';
  //
  // <Button
  //   title="Add Subscription"
  //   onPress={() => handleAddPress()}
  //   variant="primary"
  // />
  //
  // <Button
  //   title="Cancel"
  //   onPress={() => handleCancelPress()}
  //   variant="secondary"
  // />
  //
  // <Button
  //   title="Delete"
  //   onPress={() => handleDeletePress()}
  //   variant="danger"
  // />
};

/**
 * EXAMPLE 15: Using UI Components - Card
 */
export const exampleCardUsage = () => {
  // In a React component:
  // import { Card } from '@/components/ui/SubTrackComponents';
  //
  // <Card onPress={() => handleCardPress()}>
  //   <Text style={{ fontSize: 16, fontWeight: '600' }}>
  //     My Card Content
  //   </Text>
  // </Card>
};

// ==================== REAL WORLD SCENARIOS ====================

/**
 * SCENARIO 1: Dashboard Data Preparation
 * Prepare all data needed for the dashboard screen
 */
export const prepareDashboardData = () => {
  const subscriptions = MOCK_SUBSCRIPTIONS;
  const monthlySpending = calculateMonthlySpending(subscriptions);
  const activeCount = getActiveSubscriptions(subscriptions).length;
  const upcomingPayments = sortByNextBilling(subscriptions).slice(0, 5);

  return {
    monthlySpending,
    activeCount,
    upcomingPayments,
    lastUpdated: new Date(),
  };
};

/**
 * SCENARIO 2: Search & Filter Implementation
 * Complete search with multiple filters
 */
export const implementSearch = (
  query: string,
  category?: string,
  status?: 'active' | 'trial' | 'cancelled'
) => {
  let results = MOCK_SUBSCRIPTIONS;

  // Apply search
  if (query) {
    results = searchSubscriptions(results, query);
  }

  // Apply category filter
  if (category) {
    results = results.filter(sub => sub.category === category);
  }

  // Apply status filter
  if (status) {
    results = results.filter(sub => sub.status === status);
  }

  // Sort by next billing
  results = sortByNextBilling(results);

  return results;
};

/**
 * SCENARIO 3: Analytics Dashboard
 * Prepare all analytics data
 */
export const prepareAnalyticsData = () => {
  const subscriptions = MOCK_SUBSCRIPTIONS;
  const budgets = MOCK_BUDGETS;

  const monthlySpending = calculateMonthlySpending(subscriptions);
  const annualSpending = calculateAnnualSpending(subscriptions);
  const spendingByCategory = getSpendingByCategory(subscriptions);
  const topExpensive = getTopExpensive(subscriptions, 5);

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const budgetPercentage = (totalSpent / totalBudget) * 100;

  return {
    monthlySpending,
    annualSpending,
    spendingByCategory,
    topExpensive,
    budgets: budgets.map(b => ({
      ...b,
      percentage: getBudgetPercentage(b),
      status: getBudgetStatus(b),
    })),
    totalBudget,
    totalSpent,
    budgetPercentage,
  };
};

/**
 * SCENARIO 4: Notification Data
 * Prepare data for upcoming payment notifications
 */
export const prepareNotificationData = () => {
  const subscriptions = getActiveSubscriptions(MOCK_SUBSCRIPTIONS);
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingInWeek = subscriptions.filter(sub => {
    const billingDate = new Date(sub.nextBillingDate);
    return billingDate >= today && billingDate <= nextWeek;
  });

  return {
    count: upcomingInWeek.length,
    payments: upcomingInWeek
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
      .map(sub => ({
        id: sub.id,
        name: sub.name,
        date: sub.nextBillingDate,
        amount: sub.amount,
        daysUntil: getDaysUntilBilling(sub.nextBillingDate),
      })),
  };
};

/**
 * SCENARIO 5: Export Data for Reports
 * Prepare data for exporting or reporting
 */
export const prepareExportData = () => {
  const subscriptions = MOCK_SUBSCRIPTIONS;
  const spending = getSpendingByCategory(subscriptions);
  const monthly = calculateMonthlySpending(subscriptions);
  const annual = calculateAnnualSpending(subscriptions);

  return {
    reportDate: new Date().toISOString(),
    summary: {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: getActiveSubscriptions(subscriptions).length,
      trialSubscriptions: subscriptions.filter(s => s.status === 'trial').length,
      monthlySpending: monthly,
      annualSpending: annual,
    },
    byCategory: spending,
    byStatus: countByStatus(subscriptions),
    subscriptionDetails: subscriptions.map(sub => ({
      name: sub.name,
      amount: sub.amount,
      currency: sub.currency,
      billingCycle: sub.billingCycle,
      category: sub.category,
      status: sub.status,
      nextBillingDate: sub.nextBillingDate,
    })),
  };
};

// ==================== TESTING EXAMPLES ====================

/**
 * Run all examples
 */
export const runAllExamples = () => {
  console.log('\n===== SUBTRACK EXAMPLES =====\n');

  console.log('1. Calculate Spending:');
  exampleCalculateSpending();

  console.log('\n2. Spending by Category:');
  exampleGetSpendingByCategory();

  console.log('\n3. Active Subscriptions:');
  exampleGetActiveSubscriptions();

  console.log('\n4. Sort by Billing Date:');
  exampleSortByNextBilling();

  console.log('\n5. Search Subscriptions:');
  exampleSearchSubscriptions();

  console.log('\n6. Group by Category:');
  exampleGroupByCategory();

  console.log('\n7. Count by Status:');
  exampleCountByStatus();

  console.log('\n8. Top Expensive:');
  exampleGetTopExpensive();

  console.log('\n9. Budget Analysis:');
  exampleBudgetAnalysis();

  console.log('\n10. Potential Savings:');
  exampleFindSavings();

  console.log('\n===== END EXAMPLES =====\n');
};
