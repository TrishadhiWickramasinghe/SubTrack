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
import { ProgressBar } from '@components/common';
import { colors } from '@config/colors';
import { spacing } from '@config/theme';

interface BudgetProgressProps {
  spent: number;
  budgeted: number;
  currency?: string;
  label?: string;
  variant?: 'minimal' | 'compact' | 'detailed';
  showLabel?: boolean;
  showPercentage?: boolean;
  showAmounts?: boolean;
  animated?: boolean;
  height?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: any;
  testID?: string;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = memo(({
  spent,
  budgeted,
  currency = '$',
  label,
  variant = 'compact',
  showLabel = true,
  showPercentage = true,
  showAmounts = true,
  animated = true,
  height = 8,
  onPress,
  onLongPress,
  style,
  testID = 'budget-progress',
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Calculate progress percentage
  const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  const remaining = budgeted - spent;
  const isExceeded = spent > budgeted;
  const isWarning = percentage >= 80 && percentage < 100;
  const cappedPercentage = Math.min(percentage, 100);

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

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${currency}${Math.abs(amount).toFixed(2)}`;
  };

  // Get status text
  const getStatusText = () => {
    if (isExceeded) {
      return `Over by ${formatCurrency(spent - budgeted)}`;
    }
    if (isWarning) {
      return `${Math.round(percentage)}% used`;
    }
    return `${Math.round(100 - percentage)}% remaining`;
  };

  // Animate on mount and value change
  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: cappedPercentage,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(cappedPercentage);
    }
  }, [spent, budgeted, cappedPercentage, animated, progressAnim]);

  const handlePress = () => {
    if (onPress) {
      Haptics.selectionAsync();
      onPress();
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onLongPress();
    }
  };

  // Dynamic style functions
  const getStatusIconContainerStyle = (color: string) => ({
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color + '15',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  });

  // Minimal variant - just progress bar and percentage
  if (variant === 'minimal') {
    return (
      <Animated.View
        style={[
          { opacity: fadeAnim },
          style,
        ]}
        testID={testID}
      >
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
          disabled={!onPress && !onLongPress}
        >
          <View style={styles.minimalContainer}>
            <ProgressBar
              progress={cappedPercentage}
              color={getStatusColor()}
              height={height}
              rounded
              animated={animated}
            />
            {showPercentage && (
              <Text style={styles.percentageText}>
                {Math.round(cappedPercentage)}%
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Compact variant - progress bar with amounts and status
  if (variant === 'compact') {
    return (
      <Animated.View
        style={[
          { opacity: fadeAnim },
          style,
        ]}
        testID={testID}
      >
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
          disabled={!onPress && !onLongPress}
        >
          <View style={styles.compactContainer}>
            {showLabel && label && (
              <View style={styles.compactHeader}>
                <Text style={styles.compactLabel}>{label}</Text>
                {showPercentage && (
                  <Text style={[
                    styles.compactPercentage,
                    { color: getStatusColor() }
                  ]}>
                    {Math.round(cappedPercentage)}%
                  </Text>
                )}
              </View>
            )}

            <ProgressBar
              progress={cappedPercentage}
              color={getStatusColor()}
              height={height}
              rounded
              animated={animated}
            />

            {showAmounts && (
              <View style={styles.compactFooter}>
                <Text style={styles.compactAmount}>
                  {formatCurrency(spent)} / {formatCurrency(budgeted)}
                </Text>
                <Text style={[
                  styles.compactStatus,
                  { color: getStatusColor() }
                ]}>
                  {getStatusText()}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Detailed variant - full breakdown with all information
  return (
    <Animated.View
      style={[
        { opacity: fadeAnim },
        style,
      ]}
      testID={testID}
    >
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        disabled={!onPress && !onLongPress}
      >
        <View style={styles.detailedContainer}>
          {/* Header */}
          <View style={styles.detailedHeader}>
            <View style={{ flex: 1 }}>
              {showLabel && label && (
                <Text style={styles.detailedLabel}>{label}</Text>
              )}
              <Text style={[
                styles.detailedStatus,
                { color: getStatusColor() }
              ]}>
                {getStatusText()}
              </Text>
            </View>
            <View style={getStatusIconContainerStyle(getStatusColor())}>
              <MaterialCommunityIcons
                name={getStatusIcon()}
                size={20}
                color={getStatusColor()}
              />
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.detailedProgressSection}>
            <ProgressBar
              progress={cappedPercentage}
              color={getStatusColor()}
              height={height + 2}
              rounded
              animated={animated}
            />
            {showPercentage && (
              <Text style={styles.detailedPercentageLabel}>
                {Math.round(cappedPercentage)}% of budget used
              </Text>
            )}
          </View>

          {/* Amount Grid */}
          <View style={styles.detailedGrid}>
            <View style={styles.detailedGridItem}>
              <Text style={styles.detailedGridLabel}>Spent</Text>
              <Text style={styles.detailedGridValue}>
                {formatCurrency(spent)}
              </Text>
            </View>
            <View style={styles.detailedGridDivider} />
            <View style={styles.detailedGridItem}>
              <Text style={styles.detailedGridLabel}>Budget</Text>
              <Text style={styles.detailedGridValue}>
                {formatCurrency(budgeted)}
              </Text>
            </View>
            <View style={styles.detailedGridDivider} />
            <View style={styles.detailedGridItem}>
              <Text style={styles.detailedGridLabel}>
                {isExceeded ? 'Over' : 'Left'}
              </Text>
              <Text
                style={[
                  styles.detailedGridValue,
                  {
                    color: isExceeded ? colors.error[500] : colors.success[500],
                  },
                ]}
              >
                {isExceeded ? '-' : ''}{formatCurrency(Math.abs(remaining))}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

BudgetProgress.displayName = 'BudgetProgress';

const styles = StyleSheet.create({
  // Minimal Styles
  minimalContainer: {
    gap: spacing.xs,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[700],
    textAlign: 'right',
  },

  // Compact Styles
  compactContainer: {
    gap: spacing.sm,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  compactPercentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactAmount: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.neutral[700],
  },
  compactStatus: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Detailed Styles
  detailedContainer: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  detailedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  detailedStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailedProgressSection: {
    gap: spacing.xs,
  },
  detailedPercentageLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    fontWeight: '500',
  },

  detailedGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailedGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailedGridLabel: {
    fontSize: 11,
    color: colors.neutral[600],
    fontWeight: '500',
    marginBottom: 4,
  },
  detailedGridValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  detailedGridDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.neutral[200],
  },
});

export default BudgetProgress;
