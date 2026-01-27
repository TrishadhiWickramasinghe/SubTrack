/**
 * Reusable UI Components for SubTrack
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';

// ============ Card Component ============
interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component style={[styles.card, style]} onPress={onPress} activeOpacity={0.7}>
      {children}
    </Component>
  );
};

// ============ Subscription Item Component ============
interface SubscriptionItemProps {
  name: string;
  amount: number;
  currency: string;
  icon: string;
  color: string;
  nextBillingDate: string;
  daysUntil: number;
  onPress?: () => void;
}

export const SubscriptionItem: React.FC<SubscriptionItemProps> = ({
  name,
  amount,
  currency,
  icon,
  color,
  nextBillingDate,
  daysUntil,
  onPress,
}) => {
  return (
    <Card style={styles.subscriptionCard} onPress={onPress}>
      <View style={styles.subscriptionHeader}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: color + '20' },
          ]}
        >
          <Text style={[styles.iconText, { color }]}>📱</Text>
        </View>
        
        <View style={styles.subscriptionInfo}>
          <Text style={styles.subscriptionName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.billingDate}>
            Next: {nextBillingDate} ({daysUntil} days)
          </Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {currency === 'USD' ? '$' : '₹'}
            {amount.toFixed(2)}
          </Text>
          <Text style={styles.frequency}>/mo</Text>
        </View>
      </View>
    </Card>
  );
};

// ============ Stat Box Component ============
interface StatBoxProps {
  label: string;
  value: string;
  suffix?: string;
  color?: string;
  icon?: string;
}

export const StatBox: React.FC<StatBoxProps> = ({
  label,
  value,
  suffix,
  color = '#6366F1',
  icon = '📊',
}) => {
  return (
    <Card style={[styles.statBox, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueContainer}>
        <Text style={styles.statValue}>{value}</Text>
        {suffix && <Text style={styles.statSuffix}>{suffix}</Text>}
      </View>
    </Card>
  );
};

// ============ Budget Item Component ============
interface BudgetItemProps {
  category: string;
  spent: number;
  limit: number;
  currency: string;
  percentage: number;
  status: 'under' | 'warning' | 'over';
}

export const BudgetItem: React.FC<BudgetItemProps> = ({
  category,
  spent,
  limit,
  currency,
  percentage,
  status,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'under':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'over':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <Card style={styles.budgetItem}>
      <View style={styles.budgetHeader}>
        <Text style={styles.budgetCategory}>{category}</Text>
        <Text style={styles.budgetAmount}>
          {currency === 'USD' ? '$' : '₹'}
          {spent.toFixed(2)} / ${limit.toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: getStatusColor(),
            },
          ]}
        />
      </View>
      
      <Text style={[styles.budgetPercentage, { color: getStatusColor() }]}>
        {percentage}% used
      </Text>
    </Card>
  );
};

// ============ Button Component ============
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'danger':
        return styles.buttonDanger;
      default:
        return styles.buttonPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

// ============ Badge Component ============
interface BadgeProps {
  label: string;
  color?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, color = '#6366F1' }) => {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

// ============ Section Header Component ============
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onActionPress,
}) => {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {actionText && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============ Empty State Component ============
interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  action,
}) => {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          style={styles.emptyButton}
        />
      )}
    </View>
  );
};

// ============ Styles ============
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  subscriptionCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  iconText: {
    fontSize: 28,
  },

  subscriptionInfo: {
    flex: 1,
  },

  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  billingDate: {
    fontSize: 12,
    color: '#6B7280',
  },

  amountContainer: {
    alignItems: 'flex-end',
  },

  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  frequency: {
    fontSize: 12,
    color: '#6B7280',
  },

  statBox: {
    flex: 1,
    marginRight: 8,
    padding: 16,
  },

  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },

  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },

  statSuffix: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },

  budgetItem: {
    marginBottom: 16,
  },

  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  budgetCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  budgetAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },

  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressBar: {
    height: '100%',
    borderRadius: 4,
  },

  budgetPercentage: {
    fontSize: 12,
    fontWeight: '500',
  },

  buttonPrimary: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonSecondary: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonDanger: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 0,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: 250,
  },

  emptyButton: {
    minWidth: 150,
  },
});
