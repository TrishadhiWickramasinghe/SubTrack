/**
 * Analytics Screen - Budget, Spending Analysis & Insights
 * Shows spending patterns, budgets, and recommendations
 */

import {
    BudgetItem,
    Card,
    EmptyState,
    SectionHeader,
    StatBox,
} from '@/components/ui/SubTrackComponents';
import { MOCK_BUDGETS, MOCK_SUBSCRIPTIONS } from '@/utils/mockData';
import {
    calculateAnnualSpending,
    calculateMonthlySpending,
    calculateSavings,
    formatCurrency,
    getActiveSubscriptions,
    getBudgetPercentage,
    getBudgetStatus,
    getSpendingByCategory,
    getTopExpensive,
} from '@/utils/subscriptionHelpers';
import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ChartTab = 'byCategory' | 'byBilling' | 'trends';

export default function AnalyticsScreen() {
  const [subscriptions] = useState(MOCK_SUBSCRIPTIONS);
  const [budgets] = useState(MOCK_BUDGETS);
  const [activeTab, setActiveTab] = useState<ChartTab>('byCategory');

  const monthlySpending = calculateMonthlySpending(subscriptions);
  const annualSpending = calculateAnnualSpending(subscriptions);
  const spendingByCategory = getSpendingByCategory(subscriptions);
  const activeSubscriptions = getActiveSubscriptions(subscriptions);
  const topExpensive = getTopExpensive(subscriptions, 5);

  // Calculate insights
  const insights = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const budgetPercentage = (totalSpent / totalBudget) * 100;

    return {
      totalBudget,
      totalSpent,
      budgetPercentage,
      budgetsOverLimit: budgets.filter(b => getBudgetStatus(b) === 'over').length,
      potentialSavings: topExpensive[0]
        ? calculateSavings(topExpensive[0])
        : 0,
    };
  }, [budgets, topExpensive]);

  const CategoryChart = () => {
    const categories = Object.entries(spendingByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const maxSpending = Math.max(...categories.map(([, amount]) => amount));

    return (
      <View>
        {categories.map(([category, amount]) => {
          const percentage = (amount / maxSpending) * 100;
          return (
            <View key={category} style={styles.chartItem}>
              <View style={styles.chartLabelContainer}>
                <Text style={styles.chartLabel}>{category}</Text>
                <Text style={styles.chartValue}>
                  {formatCurrency(amount)}
                </Text>
              </View>
              <View style={styles.barChart}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${percentage}%`,
                      backgroundColor: getCategoryColor(category),
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const BillingCycleChart = () => {
    const cycles = ['monthly', 'annually', 'quarterly', 'weekly', 'daily'];
    const cycleSpending = cycles.map(cycle => ({
      cycle: cycle.charAt(0).toUpperCase() + cycle.slice(1),
      amount: subscriptions
        .filter(s => s.billingCycle === cycle && s.status !== 'cancelled')
        .reduce((sum, s) => sum + calculateSavings(s), 0),
    }));

    const maxAmount = Math.max(...cycleSpending.map(c => c.amount));

    return (
      <View>
        {cycleSpending
          .filter(c => c.amount > 0)
          .map((cycle, index) => (
            <View key={index} style={styles.chartItem}>
              <View style={styles.chartLabelContainer}>
                <Text style={styles.chartLabel}>{cycle.cycle}</Text>
                <Text style={styles.chartValue}>
                  {formatCurrency(cycle.amount)}
                </Text>
              </View>
              <View style={styles.barChart}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${(cycle.amount / maxAmount) * 100}%`,
                      backgroundColor: '#6366F1',
                    },
                  ]}
                />
              </View>
            </View>
          ))}
      </View>
    );
  };

  const InsightsTab = () => (
    <View>
      <Card style={styles.insightCard}>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>Total Monthly Budget</Text>
          <Text style={styles.insightValue}>
            {formatCurrency(insights.totalBudget)}
          </Text>
        </View>
        <View style={styles.insightProgress}>
          <View
            style={[
              styles.insightBar,
              {
                width: `${Math.min(insights.budgetPercentage, 100)}%`,
                backgroundColor:
                  insights.budgetPercentage > 100
                    ? '#EF4444'
                    : insights.budgetPercentage > 80
                      ? '#F59E0B'
                      : '#10B981',
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.insightPercentage,
            {
              color:
                insights.budgetPercentage > 100
                  ? '#EF4444'
                  : insights.budgetPercentage > 80
                    ? '#F59E0B'
                    : '#10B981',
            },
          ]}
        >
          {insights.budgetPercentage.toFixed(0)}% used
        </Text>
      </Card>

      {insights.budgetsOverLimit > 0 && (
        <Card style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningTitle}>Budget Alert</Text>
          <Text style={styles.warningText}>
            {insights.budgetsOverLimit} budget{insights.budgetsOverLimit > 1 ? 's' : ''}{' '}
            exceeded
          </Text>
        </Card>
      )}

      <Card style={styles.savingsCard}>
        <Text style={styles.savingsIcon}>💡</Text>
        <Text style={styles.savingsTitle}>Savings Opportunity</Text>
        <Text style={styles.savingsAmount}>
          {formatCurrency(insights.potentialSavings)}/month
        </Text>
        <Text style={styles.savingsText}>
          Cancel your most expensive subscription
        </Text>
      </Card>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Analytics & Budgets</Text>
        <Text style={styles.subtitle}>Track spending and budgets</Text>
      </View>

      {/* Key Stats */}
      <View style={styles.statsContainer}>
        <StatBox
          label="Monthly"
          value={formatCurrency(monthlySpending)}
          color="#6366F1"
          icon="📅"
        />
        <StatBox
          label="Annual"
          value={formatCurrency(annualSpending)}
          color="#F59E0B"
          icon="📊"
        />
      </View>

      {/* Spending Analysis Tabs */}
      <SectionHeader title="Spending Breakdown" />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'byCategory' && styles.tabActive]}
          onPress={() => setActiveTab('byCategory')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'byCategory' && styles.tabTextActive,
            ]}
          >
            By Category
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'byBilling' && styles.tabActive]}
          onPress={() => setActiveTab('byBilling')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'byBilling' && styles.tabTextActive,
            ]}
          >
            By Billing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trends' && styles.tabActive]}
          onPress={() => setActiveTab('trends')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'trends' && styles.tabTextActive,
            ]}
          >
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.chartCard}>
        {activeTab === 'byCategory' && <CategoryChart />}
        {activeTab === 'byBilling' && <BillingCycleChart />}
        {activeTab === 'trends' && <InsightsTab />}
      </Card>

      {/* Budgets Section */}
      <SectionHeader title="Category Budgets" subtitle="Spending limits per category" />
      {budgets.length > 0 ? (
        budgets.map(budget => (
          <BudgetItem
            key={budget.id}
            category={budget.category}
            spent={budget.spent}
            limit={budget.limit}
            currency={budget.currency}
            percentage={getBudgetPercentage(budget)}
            status={getBudgetStatus(budget)}
          />
        ))
      ) : (
        <EmptyState icon="📊" title="No budgets set" subtitle="Create budgets to track spending" />
      )}

      {/* Top Expensive Subscriptions */}
      <SectionHeader
        title="Most Expensive"
        subtitle={`${topExpensive.length} subscriptions`}
      />
      {topExpensive.map(sub => (
        <Card key={sub.id} style={styles.expensiveItem}>
          <View style={styles.expensiveRow}>
            <View>
              <Text style={styles.expensiveName}>{sub.name}</Text>
              <Text style={styles.expensiveCategory}>{sub.category}</Text>
            </View>
            <View style={styles.expensiveRight}>
              <Text style={styles.expensiveAmount}>
                {formatCurrency(calculateSavings(sub))}/month
              </Text>
            </View>
          </View>
        </Card>
      ))}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Entertainment: '#6366F1',
    Productivity: '#F59E0B',
    Health: '#A855F7',
    Utilities: '#10B981',
    Education: '#EC4899',
    Finance: '#3B82F6',
    Shopping: '#F97316',
    Food: '#EF4444',
  };
  return colors[category] || '#6B7280';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },

  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },

  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },

  tabActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },

  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  tabTextActive: {
    color: '#FFFFFF',
  },

  chartCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
  },

  chartItem: {
    marginBottom: 16,
  },

  chartLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  chartLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },

  chartValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  barChart: {
    height: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },

  bar: {
    height: '100%',
    borderRadius: 4,
  },

  insightCard: {
    marginHorizontal: 0,
    marginBottom: 12,
  },

  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  insightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  insightValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
  },

  insightProgress: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },

  insightBar: {
    height: '100%',
    borderRadius: 4,
  },

  insightPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },

  warningCard: {
    backgroundColor: '#FEF3C7',
    borderLeftColor: '#F59E0B',
    borderLeftWidth: 4,
    marginBottom: 12,
  },

  warningIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },

  warningText: {
    fontSize: 13,
    color: '#B45309',
  },

  savingsCard: {
    backgroundColor: '#F0FDF4',
    borderLeftColor: '#10B981',
    borderLeftWidth: 4,
    marginBottom: 12,
  },

  savingsIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  savingsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 4,
  },

  savingsAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },

  savingsText: {
    fontSize: 12,
    color: '#22C55E',
  },

  expensiveItem: {
    marginHorizontal: 16,
  },

  expensiveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  expensiveName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  expensiveCategory: {
    fontSize: 12,
    color: '#6B7280',
  },

  expensiveRight: {
    alignItems: 'flex-end',
  },

  expensiveAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },

  bottomPadding: {
    height: 40,
  },
});
