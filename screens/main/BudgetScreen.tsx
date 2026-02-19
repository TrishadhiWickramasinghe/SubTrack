import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { colors, spacing } from '@/config/theme';
import { useBudget } from '@/hooks/useBudget';
import { useNavigation } from '@react-navigation/native';

// Components
import BudgetAlert from '@/components/budget/BudgetAlert';
import BudgetComparison from '@/components/budget/BudgetComparison';
import CategoryBudget from '@/components/budget/CategoryBudget';
import SpendingLimit from '@/components/budget/SpendingLimit';
import Card from '@/components/common/Card';

export type BudgetScreenView = 'overview' | 'comparison' | 'categories' | 'alerts';

interface BudgetStats {
  totalLimit: number;
  totalSpent: number;
  totalRemaining: number;
  exceededCount: number;
  warningCount: number;
  healthyCount: number;
  averageProgress: number;
}

export const BudgetScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    getAllBudgets,
    getSpendingPercentage,
    getBudgetStatus,
  } = useBudget();

  const [viewMode, setViewMode] = useState<BudgetScreenView>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedBudgetId, setExpandedBudgetId] = useState<string | null>(null);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [viewMode]);

  const budgets = useMemo(() => getAllBudgets(), [getAllBudgets]);

  // Calculate stats
  const stats = useMemo((): BudgetStats => {
    if (budgets.length === 0) {
      return {
        totalLimit: 0,
        totalSpent: 0,
        totalRemaining: 0,
        exceededCount: 0,
        warningCount: 0,
        healthyCount: 0,
        averageProgress: 0,
      };
    }

    let totalLimit = 0;
    let totalSpent = 0;
    let exceededCount = 0;
    let warningCount = 0;
    let healthyCount = 0;
    let progressSum = 0;

    budgets.forEach((budget: any) => {
      const percentage = getSpendingPercentage(budget.id);
      const status = getBudgetStatus(budget.id);

      totalLimit += budget.limit;
      totalSpent += budget.spent || 0;
      progressSum += percentage;

      if (status === 'exceeded') exceededCount++;
      else if (status === 'warning') warningCount++;
      else healthyCount++;
    });

    const totalRemaining = totalLimit - totalSpent;
    const averageProgress = budgets.length > 0 ? progressSum / budgets.length : 0;

    return {
      totalLimit,
      totalSpent,
      totalRemaining,
      exceededCount,
      warningCount,
      healthyCount,
      averageProgress,
    };
  }, [budgets, getSpendingPercentage, getBudgetStatus]);

  // Get exceeded budgets for alerts
  const exceededBudgets = useMemo(() => {
    return budgets.filter((b: any) => {
      const status = getBudgetStatus(b.id);
      return status === 'exceeded';
    });
  }, [budgets, getBudgetStatus]);

  // Get warning budgets
  const warningBudgets = useMemo(() => {
    return budgets.filter((b: any) => {
      const status = getBudgetStatus(b.id);
      return status === 'warning';
    });
  }, [budgets, getBudgetStatus]);

  const handleRefresh = useCallback(async () => {
    Haptics.selectionAsync();
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleAddBudget = useCallback(() => {
    Haptics.selectionAsync();
    navigation.navigate('AddBudget');
  }, [navigation]);

  const handleEditBudget = useCallback((budgetId: string) => {
    Haptics.selectionAsync();
    navigation.navigate('EditBudget', { budgetId });
  }, [navigation]);

  const handleBudgetPress = useCallback((budgetId: string) => {
    Haptics.selectionAsync();
    setExpandedBudgetId(expandedBudgetId === budgetId ? null : budgetId);
  }, [expandedBudgetId]);

  const formatCurrency = (amount: number, symbol = '$') => {
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Overview View
  const renderOverviewView = () => (
    <Animated.ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary[500]}
        />
      }
      showsVerticalScrollIndicator={false}
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] } as any}
    >
      {/* Header Stats */}
      <View style={styles.headerStatsContainer}>
        <Card variant="elevated" padding="lg">
          <View style={styles.headerStatsGrid}>
            <View style={styles.headerStatCard}>
              <Text style={styles.headerStatLabel}>Total Budget</Text>
              <Text style={styles.headerStatValue}>
                {formatCurrency(stats.totalLimit)}
              </Text>
              <Text style={styles.headerStatSubtext}>
                across {budgets.length} budgets
              </Text>
            </View>

            <View style={styles.headerStatDivider} />

            <View style={styles.headerStatCard}>
              <Text style={styles.headerStatLabel}>Total Spent</Text>
              <Text
                style={[
                  styles.headerStatValue,
                  {
                    color: stats.totalSpent > stats.totalLimit
                      ? colors.error[600]
                      : colors.neutral[900],
                  },
                ]}
              >
                {formatCurrency(stats.totalSpent)}
              </Text>
              <Text style={styles.headerStatSubtext}>
                {((stats.totalSpent / stats.totalLimit) * 100).toFixed(1)}% of total
              </Text>
            </View>

            <View style={styles.headerStatDivider} />

            <View style={styles.headerStatCard}>
              <Text style={styles.headerStatLabel}>Remaining</Text>
              <Text
                style={[
                  styles.headerStatValue,
                  {
                    color: stats.totalRemaining > 0
                      ? colors.success[600]
                      : colors.error[600],
                  },
                ]}
              >
                {formatCurrency(stats.totalRemaining)}
              </Text>
              <Text style={styles.headerStatSubtext}>
                Avg: {formatCurrency(stats.totalRemaining / Math.max(budgets.length, 1))}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Status Badges */}
      {(stats.exceededCount > 0 || stats.warningCount > 0) && (
        <View style={styles.statusBadgesContainer}>
          {stats.exceededCount > 0 && (
            <TouchableOpacity
              style={[styles.statusBadge, styles.statusBadgeExceeded]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="alert-circle" as any
                size={16}
                color={colors.error[600]}
              />
              <Text style={[styles.statusBadgeText, { color: colors.error[600] }]}>
                {stats.exceededCount} Exceeded
              </Text>
            </TouchableOpacity>
          )}
          {stats.warningCount > 0 && (
            <TouchableOpacity
              style={[styles.statusBadge, styles.statusBadgeWarning]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="alert" as any
                size={16}
                color={colors.warning[600]}
              />
              <Text style={[styles.statusBadgeText, { color: colors.warning[600] }]}>
                {stats.warningCount} Warning
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Alert Section */}
      {exceededBudgets.length > 0 && (
        <View style={styles.alertsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exceeded Budgets</Text>
            <Text style={styles.sectionCount}>{exceededBudgets.length}</Text>
          </View>
          {exceededBudgets.slice(0, 2).map((budget: any) => (
            <BudgetAlert
              key={budget.id}
              type="error"
              title={budget.name || 'Budget'}
              message={`Exceeded by ${formatCurrency((budget.spent || 0) - budget.limit)}`}
              severity="critical"
              dismissible
              actionLabel="Review"
              onAction={() => handleEditBudget(budget.id)}
            />
          ))}
        </View>
      )}

      {/* Budgets Overview */}
      <View style={styles.budgetsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Budgets</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddBudget}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="plus" as any
              size={20}
              color={colors.primary[600]}
            />
          </TouchableOpacity>
        </View>

        {budgets.length > 0 ? (
          budgets.map((budget: any) => (
            <View key={budget.id} style={styles.budgetItemWrapper}>
              <SpendingLimit
                budgetId={budget.id}
                variant="compact"
                showTrendArrow={true}
                showResetOption={true}
                onQuickAdjust={() => handleEditBudget(budget.id)}
              />
            </View>
          ))
        ) : (
          <Card variant="outlined" padding="lg">
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="folder-open" as any
                size={40}
                color={colors.neutral[400]}
              />
              <Text style={styles.emptyStateText}>No budgets created yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first budget to get started
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleAddBudget}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="plus" as any
                  size={18}
                  color={colors.primary[600]}
                />
                <Text style={styles.emptyStateButtonText}>Create Budget</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </View>

      <View style={{ height: spacing.lg }} />
    </Animated.ScrollView>
  );

  // Comparison View
  const renderComparisonView = () => (
    <Animated.ScrollView
      showsVerticalScrollIndicator={false}
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] } as any}
    >
      <View style={styles.viewContainer}>
        <BudgetComparison
          variant="detailed"
          sortBy="spent"
          filterBy="all"
          showStats={true}
          showTrend={true}
          highlightExceeded={true}
          onBudgetPress={handleBudgetPress}
        />
      </View>
      <View style={{ height: spacing.lg }} />
    </Animated.ScrollView>
  );

  // Categories View
  const renderCategoriesView = () => (
    <Animated.ScrollView
      showsVerticalScrollIndicator={false}
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] } as any}
    >
      <View style={styles.viewContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budget Categories</Text>
          <Text style={styles.sectionCount}>{budgets.length}</Text>
        </View>

        {budgets.length > 0 ? (
          budgets.map((budget: any) => (
            <CategoryBudget
              key={budget.id}
              name={budget.name || 'Budget'}
              spent={budget.spent || 0}
              budgeted={budget.limit}
              variant="detailed"
              onPress={() => handleEditBudget(budget.id)}
              onEditPress={() => handleEditBudget(budget.id)}
            />
          ))
        ) : (
          <Card variant="outlined" padding="lg">
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="tag-off" as any
                size={40}
                color={colors.neutral[400]}
              />
              <Text style={styles.emptyStateText}>No categories</Text>
            </View>
          </Card>
        )}
      </View>
      <View style={{ height: spacing.lg }} />
    </Animated.ScrollView>
  );

  // Alerts View
  const renderAlertsView = () => (
    <Animated.ScrollView
      showsVerticalScrollIndicator={false}
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] } as any}
    >
      <View style={styles.viewContainer}>
        {exceededBudgets.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exceeded Budgets</Text>
              <Text style={styles.sectionCount}>{exceededBudgets.length}</Text>
            </View>
            {exceededBudgets.map((budget: any) => (
              <BudgetAlert
                key={`exceeded-${budget.id}`}
                type="error"
                title={budget.name || 'Budget'}
                message={`Exceeded by ${formatCurrency((budget.spent || 0) - budget.limit)}`}
                severity="critical"
                dismissible
                actionLabel="Review"
                onAction={() => handleEditBudget(budget.id)}
              />
            ))}
          </>
        )}

        {warningBudgets.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
              <Text style={styles.sectionTitle}>Warning Budgets</Text>
              <Text style={styles.sectionCount}>{warningBudgets.length}</Text>
            </View>
            {warningBudgets.map((budget: any) => (
              <BudgetAlert
                key={`warning-${budget.id}`}
                type="warning"
                title={budget.name || 'Budget'}
                message="Approaching spending limit"
                severity="high"
                dismissible
                actionLabel="Adjust"
                onAction={() => handleEditBudget(budget.id)}
              />
            ))}
          </>
        )}

        {exceededBudgets.length === 0 && warningBudgets.length === 0 && (
          <Card variant="outlined" padding="lg">
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="check-circle" as any
                size={40}
                color={colors.success[600]}
              />
              <Text style={styles.emptyStateText}>All budgets are healthy</Text>
              <Text style={styles.emptyStateSubtext}>
                Keep up the good spending habits!
              </Text>
            </View>
          </Card>
        )}
      </View>
      <View style={{ height: spacing.lg }} />
    </Animated.ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.neutral[50]}
        translucent={false}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budgets</Text>
      </View>

      {/* View Mode Tabs */}
      <View style={styles.tabsContainer}>
        {(['overview', 'comparison', 'categories', 'alerts'] as const).map(
          mode => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.tab,
                viewMode === mode && styles.tabActive,
              ]}
              onPress={() => setViewMode(mode)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  viewMode === mode && styles.tabTextActive,
                ]}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
              {viewMode === mode && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Content */}
      {viewMode === 'overview' && renderOverviewView()}
      {viewMode === 'comparison' && renderComparisonView()}
      {viewMode === 'categories' && renderCategoriesView()}
      {viewMode === 'alerts' && renderAlertsView()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral[900],
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[600],
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  tabTextActive: {
    color: colors.primary[600],
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: colors.primary[600],
  },

  // Header Stats
  headerStatsContainer: {
    padding: spacing.lg,
  },
  headerStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerStatCard: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  headerStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  headerStatSubtext: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.neutral[500],
  },
  headerStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.sm,
  },

  // Status Badges
  statusBadgesContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  statusBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeExceeded: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[200],
  },
  statusBadgeWarning: {
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Sections
  alertsSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  budgetsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  viewContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[600],
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 3,
  },

  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },

  budgetItemWrapper: {
    marginBottom: spacing.md,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  emptyStateSubtext: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[600],
    textAlign: 'center',
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary[100],
    marginTop: spacing.md,
  },
  emptyStateButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary[600],
  },
});

export default BudgetScreen;
