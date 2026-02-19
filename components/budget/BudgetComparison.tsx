import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { ProgressBar } from '@/components/common';
import Card from '@/components/common/Card';
import { colors, spacing } from '@/config/theme';
import { useBudget } from '@/hooks/useBudget';

export type BudgetComparisonVariant = 'compact' | 'detailed' | 'minimal';
export type SortBy = 'name' | 'spent' | 'remaining' | 'progress';
export type FilterBy = 'all' | 'exceeded' | 'warning' | 'healthy';

export interface BudgetComparisonProps {
  budgetIds?: string[];
  variant?: BudgetComparisonVariant;
  sortBy?: SortBy;
  filterBy?: FilterBy;
  maxItems?: number;
  showStats?: boolean;
  showTrend?: boolean;
  highlightExceeded?: boolean;
  onBudgetPress?: (budgetId: string) => void;
  animated?: boolean;
}

interface BudgetItem {
  id: string;
  name: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'healthy' | 'warning' | 'exceeded';
  trend?: number;
}

interface ComparisonStats {
  totalBudgets: number;
  totalLimit: number;
  totalSpent: number;
  totalRemaining: number;
  averageProgress: number;
  exceededCount: number;
  warningCount: number;
  healthyCount: number;
  highestSpender: BudgetItem | null;
  mostRemaining: BudgetItem | null;
}

export const BudgetComparison: React.FC<BudgetComparisonProps> = ({
  budgetIds,
  variant = 'detailed',
  sortBy = 'spent',
  filterBy = 'all',
  maxItems = 10,
  showStats = true,
  showTrend = true,
  highlightExceeded = true,
  onBudgetPress,
}) => {
  const { getAllBudgets, getSpendingPercentage, getBudgetStatus } = useBudget();
  const [expandedBudgetId, setExpandedBudgetId] = useState<string | null>(null);

  // Animation value
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  // Get budgets to compare
  const budgetsToCompare = useMemo(() => {
    const allBudgets = getAllBudgets();
    let budgets = budgetIds 
      ? allBudgets.filter((b: any) => budgetIds.includes(b.id))
      : allBudgets;

    return budgets;
  }, [budgetIds, getAllBudgets]);

  // Build budget items with metrics
  const budgetItems = useMemo(() => {
    return budgetsToCompare.map((budget: { id: string; name?: string; limit: number; spent?: number; trend?: number }) => {
      const percentage = getSpendingPercentage(budget.id);
      const status = getBudgetStatus(budget.id);
      const remaining = budget.limit - (budget.spent || 0);

      let statusType: 'healthy' | 'warning' | 'exceeded' = 'healthy';
      if (status === 'exceeded') statusType = 'exceeded';
      else if (status === 'warning') statusType = 'warning';

      return {
        id: budget.id,
        name: budget.name || 'Budget',
        limit: budget.limit,
        spent: budget.spent || 0,
        remaining: Math.max(0, remaining),
        percentage,
        status: statusType,
        trend: budget.trend || 0,
      };
    });
  }, [budgetsToCompare, getSpendingPercentage, getBudgetStatus]);

  // Filter budgets
  const filteredBudgets = useMemo(() => {
    return budgetItems.filter((item: BudgetItem) => {
      if (filterBy === 'exceeded') return item.status === 'exceeded';
      if (filterBy === 'warning') return item.status === 'warning';
      if (filterBy === 'healthy') return item.status === 'healthy';
      return true;
    });
  }, [budgetItems, filterBy]);

  // Sort budgets
  const sortedBudgets = useMemo(() => {
    const sorted = [...filteredBudgets];
    
    switch (sortBy) {
      case 'spent':
        sorted.sort((a, b) => b.spent - a.spent);
        break;
      case 'remaining':
        sorted.sort((a, b) => b.remaining - a.remaining);
        break;
      case 'progress':
        sorted.sort((a, b) => b.percentage - a.percentage);
        break;
      case 'name':
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted.slice(0, maxItems);
  }, [filteredBudgets, sortBy, maxItems]);

  // Calculate comparison statistics
  const stats = useMemo((): ComparisonStats => {
    if (budgetItems.length === 0) {
      return {
        totalBudgets: 0,
        totalLimit: 0,
        totalSpent: 0,
        totalRemaining: 0,
        averageProgress: 0,
        exceededCount: 0,
        warningCount: 0,
        healthyCount: 0,
        highestSpender: null,
        mostRemaining: null,
      };
    }

const totalLimit = budgetItems.reduce((sum: number, b: BudgetItem) => sum + b.limit, 0);
    const totalSpent = budgetItems.reduce((sum: number, b: BudgetItem) => sum + b.spent, 0);
    const totalRemaining = budgetItems.reduce((sum: number, b: BudgetItem) => sum + b.remaining, 0);
    const averageProgress = budgetItems.length > 0
      ? budgetItems.reduce((sum: number, b: BudgetItem) => sum + b.percentage, 0) / budgetItems.length
      : 0;

    const exceededCount = budgetItems.filter((b: BudgetItem) => b.status === 'exceeded').length;
    const warningCount = budgetItems.filter((b: BudgetItem) => b.status === 'warning').length;
    const healthyCount = budgetItems.filter((b: BudgetItem) => b.status === 'healthy').length;

    const highestSpender = budgetItems.reduce((max: BudgetItem, b: BudgetItem) => 
      b.spent > max.spent ? b : max
    );

    const mostRemaining = budgetItems.reduce((max: BudgetItem, b: BudgetItem) =>
      b.remaining > max.remaining ? b : max
    );

    return {
      totalBudgets: budgetItems.length,
      totalLimit,
      totalSpent,
      totalRemaining,
      averageProgress,
      exceededCount,
      warningCount,
      healthyCount,
      highestSpender,
      mostRemaining,
    };
  }, [budgetItems]);

  const handleBudgetPress = useCallback((budgetId: string) => {
    Haptics.selectionAsync();
    setExpandedBudgetId(expandedBudgetId === budgetId ? null : budgetId);
    if (onBudgetPress) {
      onBudgetPress(budgetId);
    }
  }, [expandedBudgetId, onBudgetPress]);

  const getStatusColor = (status: 'healthy' | 'warning' | 'exceeded'): string => {
    if (status === 'exceeded') return colors.error[600];
    if (status === 'warning') return colors.warning[600];
    return colors.success[600];
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'exceeded'): string => {
    if (status === 'exceeded') return 'alert-circle';
    if (status === 'warning') return 'alert';
    return 'check-circle';
  };

  const getComparisonBadge = (item: BudgetItem): string => {
    if (item === stats.highestSpender) return 'Highest';
    if (item === stats.mostRemaining) return 'Most Remaining';
    return '';
  };

  const formatCurrency = (amount: number, symbol = '$') => {
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <View style={styles.minimalContainer}>
        <View style={styles.minimalHeader}>
          <Text style={styles.minimalTitle}>Budget Summary</Text>
          <View style={styles.minimalStats}>
            <Text style={styles.minimalStatText}>
              {stats.exceededCount > 0 && `${stats.exceededCount} exceeded`}
            </Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sortedBudgets.map(item => (
            <View key={item.id} style={styles.minimalBudgetItem}>
              <Text style={styles.minimalBudgetName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.minimalBudgetAmount, { color: getStatusColor(item.status) }]}>
                {Math.round(item.percentage)}%
              </Text>
              <View
                style={[
                  styles.minimalProgressBar,
                  {
                    backgroundColor: getStatusColor(item.status),
                    width: `${Math.min(item.percentage, 100)}%`,
                  },
                ]}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        {showStats && (
          <View style={styles.compactStats}>
            <View style={styles.compactStatItem}>
              <Text style={styles.compactStatLabel}>Total Spent</Text>
              <Text style={styles.compactStatValue}>
                {formatCurrency(stats.totalSpent)}
              </Text>
            </View>
            <View style={styles.compactStatDivider} />
            <View style={styles.compactStatItem}>
              <Text style={styles.compactStatLabel}>Avg Progress</Text>
              <Text style={styles.compactStatValue}>
                {Math.round(stats.averageProgress)}%
              </Text>
            </View>
            <View style={styles.compactStatDivider} />
            <View style={styles.compactStatItem}>
              <Text style={styles.compactStatLabel}>Exceeded</Text>
              <Text style={[styles.compactStatValue, { color: colors.error[600] }]}>
                {stats.exceededCount}
              </Text>
            </View>
          </View>
        )}

        <ScrollView>
          {sortedBudgets.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.compactBudgetRow,
                highlightExceeded && item.status === 'exceeded' && styles.compactBudgetRowExceeded,
              ]}
              onPress={() => handleBudgetPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.compactBudgetLeft}>
                <View style={styles.compactBudgetInfo}>
                  <Text style={styles.compactBudgetName}>{item.name}</Text>
                  <Text style={styles.compactBudgetLimit}>
                    {formatCurrency(item.spent)} / {formatCurrency(item.limit)}
                  </Text>
                </View>
                <ProgressBar
                  value={Math.min(item.percentage, 100)}
                  color={getStatusColor(item.status)}
                  height={4}
                  style={styles.compactBudgetProgress}
                />
              </View>
              <View style={styles.compactBudgetRight}>
                <Text style={[styles.compactBudgetPercent, { color: getStatusColor(item.status) }]}>
                  {item.percentage.toFixed(0)}%
                </Text>
                <MaterialCommunityIcons
                  name={getStatusIcon(item.status) as any}
                  size={16}
                  color={getStatusColor(item.status)}
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Detailed variant
  return (
    <Animated.View
      style={[
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Card variant="elevated" padding="lg">
        {/* Header */}
        <View style={styles.detailedHeader}>
          <View>
            <Text style={styles.detailedTitle}>Budget Comparison</Text>
            <Text style={styles.detailedSubtitle}>
              {sortedBudgets.length} of {budgetItems.length} budgets
            </Text>
          </View>
          <View style={styles.detailedHeaderBadges}>
            {stats.exceededCount > 0 && (
              <View style={styles.detailedBadge}>
                <MaterialCommunityIcons
                  name="alert-circle" as any
                  size={12}
                  color={colors.error[600]}
                />
                <Text style={styles.detailedBadgeText}>{stats.exceededCount} Exceeded</Text>
              </View>
            )}
            {stats.warningCount > 0 && (
              <View style={styles.detailedBadge}>
                <MaterialCommunityIcons
                  name="alert" as any
                  size={12}
                  color={colors.warning[600]}
                />
                <Text style={styles.detailedBadgeText}>{stats.warningCount} Warning</Text>
              </View>
            )}
          </View>
        </View>

        {/* Statistics Overview */}
        {showStats && (
          <View style={styles.detailedStatsGrid}>
            <View style={styles.detailedStatCard}>
              <Text style={styles.detailedStatLabel}>Total Limit</Text>
              <Text style={styles.detailedStatAmount}>
                {formatCurrency(stats.totalLimit)}
              </Text>
              <Text style={styles.detailedStatPercent}>
                across {stats.totalBudgets} budgets
              </Text>
            </View>

            <View style={styles.detailedStatCard}>
              <Text style={styles.detailedStatLabel}>Total Spent</Text>
              <Text style={[
                styles.detailedStatAmount,
                { color: stats.totalSpent > stats.totalLimit ? colors.error[600] : colors.neutral[900] }
              ]}>
                {formatCurrency(stats.totalSpent)}
              </Text>
              <Text style={styles.detailedStatPercent}>
                {((stats.totalSpent / stats.totalLimit) * 100).toFixed(1)}% of limit
              </Text>
            </View>

            <View style={styles.detailedStatCard}>
              <Text style={styles.detailedStatLabel}>Remaining</Text>
              <Text style={[
                styles.detailedStatAmount,
                { color: stats.totalRemaining > 0 ? colors.success[600] : colors.error[600] }
              ]}>
                {formatCurrency(stats.totalRemaining)}
              </Text>
              <Text style={styles.detailedStatPercent}>
                Average: {formatCurrency(stats.totalRemaining / Math.max(stats.totalBudgets, 1))}
              </Text>
            </View>

            <View style={styles.detailedStatCard}>
              <Text style={styles.detailedStatLabel}>Avg Progress</Text>
              <Text style={styles.detailedStatAmount}>
                {stats.averageProgress.toFixed(1)}%
              </Text>
              <Text style={styles.detailedStatPercent}>
                {stats.healthyCount} healthy budgets
              </Text>
            </View>
          </View>
        )}

        {/* Budget Comparison List */}
        <View style={styles.detailedListHeader}>
          <Text style={styles.detailedListTitle}>Budget Details</Text>
          <Text style={styles.detailedListCount}>{sortedBudgets.length} items</Text>
        </View>

        {sortedBudgets.length > 0 ? (
          <View style={styles.detailedList}>
            {sortedBudgets.map((item, index) => {
              const isExpanded = expandedBudgetId === item.id;
              const badge = getComparisonBadge(item);

              return (
                <View key={item.id}>
                  <TouchableOpacity
                    style={[
                      styles.detailedListItem,
                      index === sortedBudgets.length - 1 && styles.detailedListItemLast,
                      highlightExceeded && item.status === 'exceeded' && styles.detailedListItemExceeded,
                    ]}
                    onPress={() => handleBudgetPress(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.detailedListItemLeft}>
                      <View style={styles.detailedListItemHeader}>
                        <View style={styles.detailedListItemInfo}>
                          <Text style={styles.detailedListItemName}>{item.name}</Text>
                          {badge && (
                            <View style={styles.detailedComparisonBadge}>
                              <Text style={styles.detailedComparisonBadgeText}>
                                {badge}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.detailedListItemMetrics}>
                          <Text style={[styles.detailedListItemPercentage, { color: getStatusColor(item.status) }]}>
                            {item.percentage.toFixed(1)}%
                          </Text>
                          <MaterialCommunityIcons
                            name={getStatusIcon(item.status) as any}
                            size={18}
                            color={getStatusColor(item.status)}
                          />
                        </View>
                      </View>

                      <View style={styles.detailedListItemProgressContainer}>
                        <View style={styles.detailedListItemProgressBar}>
                          <Animated.View
                            style={[
                              styles.detailedListItemProgressFill,
                              {
                                width: `${Math.min(item.percentage, 100)}%`,
                                backgroundColor: getStatusColor(item.status),
                              },
                            ]}
                          />
                        </View>
                      </View>

                      <View style={styles.detailedListItemAmounts}>
                        <Text style={styles.detailedListItemAmount}>
                          Spent: <Text style={{ fontWeight: '700' }}>{formatCurrency(item.spent)}</Text>
                        </Text>
                        <Text style={styles.detailedListItemAmount}>
                          Limit: <Text style={{ fontWeight: '700' }}>{formatCurrency(item.limit)}</Text>
                        </Text>
                        <Text style={[styles.detailedListItemAmount, { color: getStatusColor(item.status) }]}>
                          Remaining: <Text style={{ fontWeight: '700' }}>{formatCurrency(item.remaining)}</Text>
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailedListItemChevron}>
                      <MaterialCommunityIcons
                        name={isExpanded ? 'chevron-up' : 'chevron-down' as any}
                        size={20}
                        color={colors.neutral[600]}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <View style={styles.detailedListItemExpanded}>
                      <View style={styles.detailedExpandedRow}>
                        <Text style={styles.detailedExpandedLabel}>Budget ID</Text>
                        <Text style={styles.detailedExpandedValue}>{item.id}</Text>
                      </View>
                      <View style={styles.detailedExpandedRow}>
                        <Text style={styles.detailedExpandedLabel}>Percentage</Text>
                        <Text
                          style={[
                            styles.detailedExpandedValue,
                            { color: getStatusColor(item.status) },
                          ]}
                        >
                          {item.percentage.toFixed(2)}%
                        </Text>
                      </View>
                      {showTrend && item.trend !== 0 && (
                        <View style={styles.detailedExpandedRow}>
                          <Text style={styles.detailedExpandedLabel}>Trend</Text>
                          <Text
                            style={[
                              styles.detailedExpandedValue,
                              { color: item.trend > 0 ? colors.error[600] : colors.success[600] },
                            ]}
                          >
                            {item.trend > 0 ? '+' : ''}{item.trend.toFixed(1)}%
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.detailedEmptyState}>
            <MaterialCommunityIcons
              name="folder-open" as any
              size={32}
              color={colors.neutral[400]}
            />
            <Text style={styles.detailedEmptyText}>No budgets to compare</Text>
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Minimal variant
  minimalContainer: {
    gap: spacing.md,
  },
  minimalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  minimalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  minimalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  minimalStatText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.error[600],
  },

  minimalBudgetItem: {
    width: 100,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  minimalBudgetName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  minimalBudgetAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  minimalProgressBar: {
    height: 3,
    borderRadius: 1.5,
  },

  // Compact variant
  compactContainer: {
    gap: spacing.md,
  },
  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
  },
  compactStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  compactStatLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.neutral[600],
    marginBottom: spacing.xs / 2,
  },
  compactStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  compactStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.neutral[200],
  },

  compactBudgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  compactBudgetRowExceeded: {
    backgroundColor: colors.error[50],
  },
  compactBudgetLeft: {
    flex: 1,
    gap: spacing.sm,
  },
  compactBudgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactBudgetName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  compactBudgetLimit: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  compactBudgetProgress: {
    marginVertical: spacing.xs,
  },
  compactBudgetRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  compactBudgetPercent: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Detailed variant
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  detailedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  detailedSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  detailedHeaderBadges: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  detailedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  detailedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral[700],
  },

  // Statistics Grid
  detailedStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  detailedStatCard: {
    flex: 1,
    minWidth: '47%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  detailedStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  detailedStatAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  detailedStatPercent: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.neutral[500],
  },

  // List Header
  detailedListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: 1,
    borderBottomColor: colors.neutral[200],
  },
  detailedListTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  detailedListCount: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[600],
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 3,
  },

  // List
  detailedList: {
    gap: 0,
    marginTop: spacing.md,
  },
  detailedListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  detailedListItemLast: {
    borderBottomWidth: 0,
  },
  detailedListItemExceeded: {
    backgroundColor: colors.error[50],
    borderLeftWidth: 3,
    borderLeftColor: colors.error[600],
    paddingLeft: spacing.md - 3,
  },
  detailedListItemLeft: {
    flex: 1,
    gap: spacing.sm,
  },
  detailedListItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailedListItemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailedListItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  detailedComparisonBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: colors.primary[100],
  },
  detailedComparisonBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary[600],
  },
  detailedListItemMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailedListItemPercentage: {
    fontSize: 13,
    fontWeight: '700',
  },

  detailedListItemProgressContainer: {
    marginVertical: spacing.sm,
  },
  detailedListItemProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral[200],
    overflow: 'hidden' as const,
  },
  detailedListItemProgressFill: {
    height: '100%',
    borderRadius: 3,
  },

  detailedListItemAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  detailedListItemAmount: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.neutral[600],
  },

  detailedListItemChevron: {
    marginLeft: spacing.md,
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Expanded Details
  detailedListItemExpanded: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[50],
    gap: spacing.sm,
  },
  detailedExpandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailedExpandedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  detailedExpandedValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[900],
  },

  // Empty State
  detailedEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  detailedEmptyText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.neutral[600],
  },
});

export default BudgetComparison;
