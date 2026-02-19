import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';

import Card from '@/components/common/Card';
import { colors, spacing } from '@/config/theme';
import { useBudget } from '@/hooks/useBudget';

export type SpendingLimitVariant = 'compact' | 'detailed' | 'minimal';
export type LimitStatus = 'healthy' | 'warning' | 'critical' | 'exceeded';

export interface SpendingLimitProps {
  budgetId: string;
  variant?: SpendingLimitVariant;
  showTrendArrow?: boolean;
  showResetOption?: boolean;
  onLimitExceeded?: (budgetId: string, exceedAmount: number) => void;
  onQuickAdjust?: (budgetId: string) => void;
  animated?: boolean;
}

export const SpendingLimit: React.FC<SpendingLimitProps> = ({
  budgetId,
  variant = 'detailed',
  showTrendArrow = true,
  showResetOption = true,
  onLimitExceeded,
  onQuickAdjust,
  animated = true,
}) => {
  const { getBudgetById, getSpendingPercentage, getBudgetStatus } = useBudget();

  // Format currency - simple implementation with default symbol
  const formatCurrency = useCallback((amount: number, symbol = '$') => {
    return `${symbol}${amount.toFixed(2)}`;
  }, []);

  const budget = useMemo(() => getBudgetById(budgetId), [budgetId, getBudgetById]);
  const spendingPercentage = useMemo(
    () => getSpendingPercentage(budgetId),
    [budgetId, getSpendingPercentage]
  );
  const status = useMemo(
    () => getBudgetStatus(budgetId),
    [budgetId, getBudgetStatus]
  );

  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  // Trigger animation when status changes to critical
  useEffect(() => {
    if (animated && status === 'exceeded') {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [status, animated, scaleAnim]);

  const handleLimitExceeded = useCallback(() => {
    if (onLimitExceeded && budget) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const exceedAmount = (budget.spent || 0) - budget.limit;
      onLimitExceeded(budgetId, exceedAmount);
    }
  }, [budgetId, budget, onLimitExceeded]);

  const handleQuickAdjust = useCallback(() => {
    if (onQuickAdjust) {
      Haptics.selectionAsync();
      onQuickAdjust(budgetId);
    }
  }, [budgetId, onQuickAdjust]);

  if (!budget) {
    return null;
  }

  const limitStatus = getLimitStatus(status);
  const statusColor = getStatusColor(limitStatus);
  const remaining = Math.max(0, budget.limit - (budget.spent || 0));
  const isExceeded = (budget.spent || 0) > budget.limit;

  // Compute dynamic styles
  const getStatusBadgeStyle = () => ({
    alignSelf: 'flex-start' as const,
    backgroundColor: statusColor + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
  });

  const getProgressBarStyle = () => ({
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[200],
    overflow: 'hidden' as const,
    marginVertical: spacing.md,
  });

  const getProgressFillStyle = (): ViewStyle => ({
    height: '100%',
    borderRadius: 4,
    backgroundColor: statusColor,
    width: `${Math.min(spendingPercentage, 100)}%`,
  });

  const getActionButtonStyle = () => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    backgroundColor: statusColor + '10',
    marginTop: spacing.md,
  });

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <View style={styles.minimalContainer}>
        <View style={styles.minimalRow}>
          <View style={styles.minimalLabel}>
            <MaterialCommunityIcons
              name={getStatusIcon(limitStatus) as any}
              size={16}
              color={statusColor}
            />
            <Text style={[styles.minimalText, { color: colors.neutral[600] }]}>
              Limit
            </Text>
          </View>
          <Text style={[styles.minimalAmount, { color: statusColor }]}>
            {formatCurrency(budget.limit)}
          </Text>
        </View>
        <View style={styles.minimalRow}>
          <Text style={[styles.minimalText, { color: colors.neutral[600] }]}>
            Remaining
          </Text>
          <Text style={[styles.minimalAmount, { color: statusColor }]}>
            {formatCurrency(remaining)}
          </Text>
        </View>
        {isExceeded && (
          <View style={[styles.minimalRow, { marginTop: spacing.xs }]}>
            <Text style={[styles.minimalText, { color: colors.error[600] }]}>
              Exceeded by
            </Text>
            <Text style={[styles.minimalAmount, { color: colors.error[600] }]}>
              {formatCurrency((budget.spent || 0) - budget.limit)}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <View style={styles.compactCard}>
        <View style={styles.compactHeader}>
          <View style={styles.compactTitle}>
            <MaterialCommunityIcons
              name="wallet"
              size={20}
              color={statusColor}
            />
            <Text style={styles.compactHeaderText}>Spending Limit</Text>
          </View>
          <View style={getStatusBadgeStyle()}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {spendingPercentage.toFixed(0)}%
            </Text>
          </View>
        </View>

        <View style={getProgressBarStyle()}>
          <Animated.View
            style={[
              getProgressFillStyle(),
              { transform: [{ scaleX: scaleAnim }] },
            ]}
          />
        </View>

        <View style={styles.compactFooter}>
          <View>
            <Text style={styles.compactLabel}>Spent</Text>
            <Text
              style={[
                styles.compactValue,
                { color: statusColor },
              ]}
            >
              {formatCurrency(budget.spent || 0)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.compactLabel}>Limit</Text>
            <Text style={[styles.compactValue, { color: colors.neutral[900] }]}>
              {formatCurrency(budget.limit)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.compactLabel}>Remaining</Text>
            <Text
              style={[
                styles.compactValue,
                { color: isExceeded ? colors.error[600] : colors.success[600] },
              ]}
            >
              {formatCurrency(remaining)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Detailed variant
  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Card variant="elevated" padding="lg">
        {/* Header */}
        <View style={styles.detailedHeader}>
          <View style={styles.detailedTitleContainer}>
            <Text style={styles.detailedTitle}>Spending Limit</Text>
            {showTrendArrow && (
              <Text style={[styles.detailedSubtitle, { color: colors.neutral[600] }]}>
                {budget.category || 'Budget'}
              </Text>
            )}
          </View>
          <View style={getStatusBadgeStyle()}>
            <Text
              style={[
                styles.statusBadgeText,
                { color: statusColor },
              ]}
            >
              {spendingPercentage.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={getProgressBarStyle()}>
          <Animated.View
            style={[
              getProgressFillStyle(),
              { transform: [{ scaleX: scaleAnim }] },
            ]}
          />
        </View>

        {/* Spending Details */}
        <View style={styles.detailedGrid}>
          <View style={styles.detailedGridItem}>
            <Text style={styles.detailedGridLabel}>Spent</Text>
            <Text style={[styles.detailedGridValue, { color: statusColor }]}>
              {formatCurrency(budget.spent || 0)}
            </Text>
            <Text style={styles.detailedGridPercent}>
              {spendingPercentage.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.detailedGridDivider} />

          <View style={styles.detailedGridItem}>
            <Text style={styles.detailedGridLabel}>Limit</Text>
            <Text style={[styles.detailedGridValue, { color: colors.neutral[900] }]}>
              {formatCurrency(budget.limit)}
            </Text>
            <Text style={styles.detailedGridPercent}>100%</Text>
          </View>

          <View style={styles.detailedGridDivider} />

          <View style={styles.detailedGridItem}>
            <Text style={styles.detailedGridLabel}>
              {isExceeded ? 'Exceeded' : 'Remaining'}
            </Text>
            <Text
              style={[
                styles.detailedGridValue,
                { color: isExceeded ? colors.error[600] : colors.success[600] },
              ]}
            >
              {formatCurrency(remaining)}
            </Text>
            <Text style={styles.detailedGridPercent}>
              {isExceeded
                ? '+' + ((remaining / budget.limit) * 100).toFixed(1) + '%'
                : ((remaining / budget.limit) * 100).toFixed(1) + '%'}
            </Text>
          </View>
        </View>

        {/* Status Message */}
        {isExceeded && (
          <View style={styles.statusMessage}>
            <MaterialCommunityIcons
              name="alert-circle" as any
              size={16}
              color={colors.error[600]}
            />
            <Text style={[styles.statusMessageText, { color: colors.error[600] }]}>
              You've exceeded your limit by{' '}
              {formatCurrency((budget.spent || 0) - budget.limit)}
            </Text>
          </View>
        )}

        {status === 'warning' && (
          <View style={styles.statusMessage}>
            <MaterialCommunityIcons
              name="alert" as any
              size={16}
              color={colors.warning[600]}
            />
            <Text style={[styles.statusMessageText, { color: colors.warning[600] }]}>
              You're approaching your spending limit
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.detailedActions}>
          {onQuickAdjust && showResetOption && (
            <TouchableOpacity
              onPress={handleQuickAdjust}
              style={getActionButtonStyle()}
              activeOpacity={0.7}
            >
              <View style={styles.actionContent}>
                <MaterialCommunityIcons
                  name="pencil" as any
                  size={16}
                  color={statusColor}
                />
                <Text
                  style={[
                    styles.actionText,
                    { color: statusColor },
                  ]}
                >
                  Adjust Limit
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right" as any
                size={18}
                color={statusColor}
              />
            </TouchableOpacity>
          )}

          {isExceeded && onLimitExceeded && (
            <TouchableOpacity
              onPress={handleLimitExceeded}
              style={[
                getActionButtonStyle(),
                { backgroundColor: colors.error[100], marginTop: spacing.md },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.actionContent}>
                <MaterialCommunityIcons
                  name="alert-circle" as any
                  size={16}
                  color={colors.error[600]}
                />
                <Text
                  style={[
                    styles.actionText,
                    { color: colors.error[600] },
                  ]}
                >
                  Take Action
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right" as any
                size={18}
                color={colors.error[600]}
              />
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </Animated.View>
  );
};

// Helper functions
function getLimitStatus(status: string): LimitStatus {
  if (status === 'exceeded') return 'exceeded';
  if (status === 'critical') return 'critical';
  if (status === 'warning') return 'warning';
  return 'healthy';
}

function getStatusColor(status: LimitStatus): string {
  switch (status) {
    case 'exceeded':
      return colors.error[600];
    case 'critical':
      return colors.error[500];
    case 'warning':
      return colors.warning[600];
    default:
      return colors.success[600];
  }
}

function getStatusIcon(status: LimitStatus): string {
  switch (status) {
    case 'exceeded':
    case 'critical':
      return 'alert-circle';
    case 'warning':
      return 'alert';
    default:
      return 'check-circle';
  }
}

const styles = StyleSheet.create({
  // Minimal variant
  minimalContainer: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  minimalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minimalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  minimalText: {
    fontSize: 12,
    fontWeight: '500',
  },
  minimalAmount: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Compact variant
  compactCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing.md,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  compactTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  compactHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  compactLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.neutral[600],
    marginBottom: spacing.xs / 2,
  },
  compactValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.neutral[200],
  },

  // Detailed variant
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  detailedTitleContainer: {
    flex: 1,
  },
  detailedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  detailedSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Grid
  detailedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  detailedGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailedGridLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  detailedGridValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  detailedGridPercent: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral[500],
  },
  detailedGridDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.neutral[200],
  },

  // Status message
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    marginVertical: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  statusMessageText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },

  // Actions
  detailedActions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default SpendingLimit;
