import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import React, { memo, useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Components
import { Card, ProgressBar } from '@components/common';
import { colors } from '@config/colors';
import { spacing } from '@config/theme';

interface BudgetCardProps {
  title?: string;
  spent: number;
  budgeted: number;
  currency?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showTrend?: boolean;
  trend?: number; // -1 for down, 0 for neutral, 1 for up
  onPress?: () => void;
  onEditPress?: () => void;
  style?: any;
  testID?: string;
}

export const BudgetCard: React.FC<BudgetCardProps> = memo(({
  title = 'Monthly Budget',
  spent,
  budgeted,
  currency = '$',
  variant = 'default',
  showTrend = false,
  trend = 0,
  onPress,
  onEditPress,
  style,
  testID = 'budget-card',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Calculate progress percentage
  const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  const remaining = budgeted - spent;
  const isExceeded = spent > budgeted;
  const isWarning = percentage >= 80 && percentage < 100;

  // Determine status color
  const getStatusColor = () => {
    if (isExceeded) return colors.error[500];
    if (isWarning) return colors.warning[500];
    return colors.success[500];
  };

  // Determine status icon
  const getStatusIcon = () => {
    if (isExceeded) return 'alert-circle';
    if (isWarning) return 'alert';
    return 'check-circle';
  };

  // Get status message
  const getStatusMessage = () => {
    const percentText = Math.round(percentage).toString();
    if (isExceeded) {
      return `Over budget by ${currency}${(spent - budgeted).toFixed(2)}`;
    }
    if (isWarning) {
      return `${percentText}% of budget used`;
    }
    return `${Math.round(100 - percentage)}% remaining`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${currency}${amount.toFixed(2)}`;
  };

  // Dynamic style functions
  const getStatusBadgeStyle = (color: string) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: color + '10',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  });

  const getStatusIconStyle = (color: string) => ({
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: color + '15',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  });

  const getPercentageBadgeStyle = (color: string) => ({
    backgroundColor: color + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  });

  // Animate on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress?.();
  };

  const handleEditPress = () => {
    Haptics.selectionAsync();
    onEditPress?.();
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
          style,
        ]}
        testID={testID}
      >
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
          <Card variant="elevated" padding="md">
            <View style={styles.compactContainer}>
              <View style={styles.compactLeft}>
                <Text style={styles.compactTitle}>{title}</Text>
                <Text style={styles.compactValue}>
                  {formatCurrency(spent)} / {formatCurrency(budgeted)}
                </Text>
              </View>
              <View style={styles.compactRight}>
                <View style={getPercentageBadgeStyle(getStatusColor())}>
                  <Text style={styles.percentageText}>
                    {Math.round(Math.min(percentage, 999))}%
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={getStatusIcon()}
                  size={20}
                  color={getStatusColor()}
                  style={{ marginTop: 4 }}
                />
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
          style,
        ]}
        testID={testID}
      >
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
          <Card variant="elevated" padding="lg">
            {/* Header */}
            <View style={styles.detailedHeader}>
              <View>
                <Text style={styles.detailedTitle}>{title}</Text>
                <Text style={styles.detailedSubtitle}>{getStatusMessage()}</Text>
              </View>
              {onEditPress && (
                <TouchableOpacity
                  onPress={handleEditPress}
                  style={styles.editButton}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color={colors.primary[500]}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <ProgressBar
                progress={Math.min(percentage, 100)}
                color={getStatusColor()}
                height={8}
                rounded
                animated
              />
            </View>

            {/* Amount Details */}
            <View style={styles.amountGrid}>
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Spent</Text>
                <Text style={styles.amountValue}>{formatCurrency(spent)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Budget</Text>
                <Text style={styles.amountValue}>{formatCurrency(budgeted)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>
                  {isExceeded ? 'Over' : 'Remaining'}
                </Text>
                <Text
                  style={[
                    styles.amountValue,
                    {
                      color: isExceeded ? colors.error[500] : colors.success[500],
                    },
                  ]}
                >
                  {formatCurrency(Math.abs(remaining))}
                </Text>
              </View>
            </View>

            {/* Status Indicator */}
            <View style={styles.statusSection}>
              <View style={getStatusBadgeStyle(getStatusColor())}>
                <MaterialCommunityIcons
                  name={getStatusIcon()}
                  size={16}
                  color={getStatusColor()}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {percentage >= 100 ? 'Over Budget' : 'On Track'}
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Default variant
  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
      testID={testID}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Card variant="elevated" padding="lg">
          {/* Header */}
          <View style={styles.defaultHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.defaultTitle}>{title}</Text>
              <Text style={styles.defaultStatus}>{getStatusMessage()}</Text>
            </View>
            <View style={getStatusIconStyle(getStatusColor())}>
              <MaterialCommunityIcons
                name={getStatusIcon()}
                size={24}
                color={getStatusColor()}
              />
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Spent Amount */}
            <View style={styles.amountSection}>
              <Text style={styles.sectionLabel}>Amount Spent</Text>
              <Text style={styles.mainAmount}>{formatCurrency(spent)}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={Math.min(percentage, 100)}
                color={getStatusColor()}
                height={8}
                rounded
                animated
              />
              <Text style={styles.progressLabel}>
                {Math.round(percentage)}% of {formatCurrency(budgeted)} budget
              </Text>
            </View>

            {/* Breakdown */}
            <View style={styles.breakdown}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Budget</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(budgeted)}</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>
                  {isExceeded ? 'Over' : 'Remaining'}
                </Text>
                <Text
                  style={[
                    styles.breakdownValue,
                    {
                      color: isExceeded ? colors.error[500] : colors.neutral[700],
                    },
                  ]}
                >
                  {isExceeded ? '-' : ''}{formatCurrency(Math.abs(remaining))}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer - Trend */}
          {showTrend && trend !== 0 && (
            <View style={styles.trendSection}>
              <MaterialCommunityIcons
                name={trend > 0 ? 'trending-up' : 'trending-down'}
                size={16}
                color={trend > 0 ? colors.error[500] : colors.success[500]}
              />
              <Text style={styles.trendText}>
                {trend > 0 ? 'Spending increasing' : 'Spending decreasing'}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
});

BudgetCard.displayName = 'BudgetCard';

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactLeft: {
    flex: 1,
  },
  compactRight: {
    alignItems: 'flex-end',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  compactValue: {
    fontSize: 13,
    color: colors.neutral[600],
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[900],
  },

  // Default Styles
  defaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  defaultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  defaultStatus: {
    fontSize: 13,
    color: colors.neutral[600],
  },

  mainContent: {
    marginBottom: spacing.lg,
  },
  amountSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    fontWeight: '500',
    marginBottom: 4,
  },
  mainAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.neutral[900],
  },

  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    marginTop: 8,
  },

  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    fontWeight: '500',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
  },

  trendSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    marginTop: spacing.md,
  },
  trendText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.neutral[700],
  },

  // Detailed Styles
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  detailedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  detailedSubtitle: {
    fontSize: 13,
    color: colors.neutral[600],
    marginTop: 4,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
  },

  progressSection: {
    marginBottom: spacing.lg,
  },

  amountGrid: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  amountItem: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    fontWeight: '500',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.sm,
  },

  statusSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
