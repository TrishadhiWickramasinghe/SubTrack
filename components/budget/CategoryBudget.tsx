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

interface CategoryBudgetProps {
  name: string;
  icon?: string;
  spent: number;
  budgeted: number;
  currency?: string;
  variant?: 'compact' | 'detailed';
  animated?: boolean;
  onPress?: () => void;
  onEditPress?: () => void;
  style?: any;
  testID?: string;
}

export const CategoryBudget: React.FC<CategoryBudgetProps> = memo(({
  name,
  icon = 'tag',
  spent,
  budgeted,
  currency = '$',
  variant = 'compact',
  animated = true,
  onPress,
  onEditPress,
  style,
  testID = 'category-budget',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  // Calculate progress percentage
  const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  const remaining = budgeted - spent;
  const isExceeded = spent > budgeted;
  const isWarning = percentage >= 75 && percentage < 100;
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
    return `${Math.round(100 - percentage)}% left`;
  };

  // Animate on mount
  useEffect(() => {
    if (animated) {
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
    } else {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [fadeAnim, slideAnim, animated]);

  const handlePress = () => {
    if (onPress) {
      Haptics.selectionAsync();
      onPress();
    }
  };

  const handleEditPress = () => {
    if (onEditPress) {
      Haptics.selectionAsync();
      onEditPress();
    }
  };

  // Dynamic style function
  const getStatusBadgeStyle = (color: string) => ({
    backgroundColor: color + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
  });

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
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          disabled={!onPress}
        >
          <Card variant="outlined">
            <View style={styles.compactContainer}>
              {/* Icon and Category Name */}
              <View style={styles.compactLeft}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name={icon as any}
                    size={18}
                    color={getStatusColor()}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.compactName}>{name}</Text>
                  <Text style={styles.compactAmount}>
                    {formatCurrency(spent)} / {formatCurrency(budgeted)}
                  </Text>
                </View>
              </View>

              {/* Percentage and Status */}
              <View style={styles.compactRight}>
                <View style={getStatusBadgeStyle(getStatusColor())}>
                  <Text style={[
                    styles.compactPercentage,
                    { color: getStatusColor() }
                  ]}>
                    {Math.round(cappedPercentage)}%
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={getStatusIcon()}
                  size={16}
                  color={getStatusColor()}
                  style={{ marginTop: 4 }}
                />
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.compactProgressBar}>
              <ProgressBar
                progress={cappedPercentage}
                color={getStatusColor()}
                height={4}
                rounded
                animated={animated}
              />
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Detailed variant
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
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        <Card variant="elevated" padding="lg">
          {/* Header */}
          <View style={styles.detailedHeader}>
            <View style={styles.detailedHeaderLeft}>
              <View style={styles.detailedIconContainer}>
                <MaterialCommunityIcons
                  name={icon as any}
                  size={20}
                  color={colors.primary[500]}
                />
              </View>
              <View>
                <Text style={styles.detailedName}>{name}</Text>
                <Text style={[
                  styles.detailedStatus,
                  { color: getStatusColor() }
                ]}>
                  {getStatusText()}
                </Text>
              </View>
            </View>

            {onEditPress && (
              <TouchableOpacity
                onPress={handleEditPress}
                style={styles.detailedEditButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={18}
                  color={colors.primary[500]}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Progress Section */}
          <View style={styles.detailedProgressSection}>
            <View style={styles.detailedProgressLabel}>
              <Text style={styles.detailedProgressText}>
                {Math.round(cappedPercentage)}% of budget
              </Text>
              <Text style={[
                styles.detailedProgressValue,
                { color: getStatusColor() }
              ]}>
                {getStatusText()}
              </Text>
            </View>
            <ProgressBar
              progress={cappedPercentage}
              color={getStatusColor()}
              height={6}
              rounded
              animated={animated}
            />
          </View>

          {/* Amount Grid */}
          <View style={styles.detailedGrid}>
            {/* Spent */}
            <View style={styles.detailedGridItem}>
              <Text style={styles.detailedGridLabel}>Spent</Text>
              <Text style={styles.detailedGridValue}>
                {formatCurrency(spent)}
              </Text>
            </View>

            {/* Budget */}
            <View style={styles.detailedGridItem}>
              <Text style={styles.detailedGridLabel}>Budget</Text>
              <Text style={styles.detailedGridValue}>
                {formatCurrency(budgeted)}
              </Text>
            </View>

            {/* Remaining/Over */}
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

          {/* Info Footer */}
          <View style={styles.detailedFooter}>
            <View style={styles.detailedFooterItem}>
              <MaterialCommunityIcons
                name="percent"
                size={14}
                color={colors.neutral[600]}
              />
              <Text style={styles.detailedFooterText}>
                {Math.round(cappedPercentage)}% utilization
              </Text>
            </View>
            {isExceeded && (
              <View style={styles.detailedFooterItem}>
                <MaterialCommunityIcons
                  name="alert-outline"
                  size={14}
                  color={colors.error[500]}
                />
                <Text style={[styles.detailedFooterText, { color: colors.error[500] }]}>
                  Over budget
                </Text>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
});

CategoryBudget.displayName = 'CategoryBudget';

const styles = StyleSheet.create({
  // Compact Styles
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  compactLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  compactAmount: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  compactRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  compactPercentage: {
    fontSize: 12,
    fontWeight: '700',
  },
  compactProgressBar: {
    marginTop: spacing.md,
    overflow: 'hidden',
  },

  // Detailed Styles
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  detailedHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailedName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  detailedStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailedEditButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailedProgressSection: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  detailedProgressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailedProgressText: {
    fontSize: 12,
    color: colors.neutral[600],
    fontWeight: '500',
  },
  detailedProgressValue: {
    fontSize: 12,
    fontWeight: '600',
  },

  detailedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.neutral[200],
  },
  detailedGridItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailedGridLabel: {
    fontSize: 11,
    color: colors.neutral[600],
    fontWeight: '500',
    marginBottom: 4,
  },
  detailedGridValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },

  detailedFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  detailedFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailedFooterText: {
    fontSize: 11,
    color: colors.neutral[600],
  },
});

export default CategoryBudget;
