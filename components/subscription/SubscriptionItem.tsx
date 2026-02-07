import { differenceInDays, format, isToday, isTomorrow } from 'date-fns';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Hooks
import { useCurrency } from '@hooks/useCurrency';
import { useTheme } from '@hooks/useTheme';

// Components
import Badge from '@components/common/Badge';
import Card from '@components/common/Card';

interface SubscriptionDetailsProps {
  subscription: any;
  payments?: any[];
  onEdit?: (subscription: any) => void;
  onDelete?: (subscription: any) => void;
  onToggleStatus?: (subscription: any) => void;
  onBack?: () => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  subscription,
  payments = [],
  onEdit,
  onDelete,
  onToggleStatus,
  onBack,
  showEditButton = true,
  showDeleteButton = true,
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors || {};
  const { formatAmount } = useCurrency();
  const insets = useSafeAreaInsets();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Calculate basic info
  const nextBillingDate = new Date(subscription.billingDate);
  const daysUntil = differenceInDays(nextBillingDate, new Date());
  const isDueSoon = daysUntil <= 3 && daysUntil >= 0;
  const isOverdue = daysUntil < 0;
  const isDueToday = isToday(nextBillingDate);
  const isDueTomorrow = isTomorrow(nextBillingDate);

  const formattedAmount = formatAmount(subscription.amount, subscription.currency);

  const isActive = subscription.status === 'active';
  const isPaused = subscription.status === 'paused';
  const isCancelled = subscription.status === 'cancelled';

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(subscription);
    }
    setShowConfirmDelete(false);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background || '#FFF', paddingTop: insets.top },
      ]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={{ fontSize: 24 }}>←</Text>
            </TouchableOpacity>
          )}
          <Text
            style={[styles.title, { color: colors.text || '#000' }]}
            numberOfLines={2}>
            {subscription.name}
          </Text>
        </View>

        {/* Status Badge */}
        <View style={styles.statusSection}>
          <Badge
            text={subscription.status?.toUpperCase() || 'ACTIVE'}
            color={subscription.status === 'active' ? 'success' : subscription.status === 'paused' ? 'warning' : 'error'}
          />
          {isDueSoon && !isDueToday && (
            <Badge text="DUE SOON" color="warning" />
          )}
          {isDueToday && (
            <Badge text="DUE TODAY" color="error" />
          )}
          {isDueTomorrow && (
            <Badge text="DUE TOMORROW" color="warning" />
          )}
          {isOverdue && (
            <Badge text="OVERDUE" color="error" />
          )}
        </View>

        {/* Amount Card */}
        <Card style={styles.amountCard}>
          <Text
            style={[styles.amountLabel, { color: colors.textSecondary || '#999' }]}>
            Amount
          </Text>
          <Text style={[styles.amount, { color: colors.text || '#000' }]}>
            {formattedAmount}
          </Text>
          <Text
            style={[
              styles.billingCycle,
              { color: colors.textSecondary || '#999' },
            ]}>
            {subscription.billingCycle || 'monthly'}
          </Text>
        </Card>

        {/* Next Billing Date */}
        <Card style={styles.dateCard}>
          <Text
            style={[styles.dateLabel, { color: colors.textSecondary || '#999' }]}>
            Next Billing
          </Text>
          <Text style={[styles.date, { color: colors.text || '#000' }]}>
            {format(nextBillingDate, 'MMM dd, yyyy')}
          </Text>
          <Text
            style={[
              styles.daysUntil,
              { color: isDueToday || isOverdue ? colors.error : colors.success },
            ]}>
            {isOverdue
              ? `${Math.abs(daysUntil)} days overdue`
              : `${daysUntil} days`}
          </Text>
        </Card>

        {/* Payment History */}
        {payments && payments.length > 0 && (
          <Card style={styles.paymentCard}>
            <Text
              style={[
                styles.paymentTitle,
                { color: colors.text || '#000' },
              ]}>
              Recent Payments
            </Text>
            <View style={styles.paymentList}>
              {payments.slice(0, 3).map((payment: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.paymentItem,
                    index < payments.length - 1 && styles.paymentItemBorder,
                  ]}>
                  <Text style={[styles.paymentDate, { color: colors.textSecondary }]}>
                    {format(new Date(payment.date), 'MMM dd, yyyy')}
                  </Text>
                  <Text
                    style={[
                      styles.paymentAmount,
                      { color: colors.text || '#000' },
                    ]}>
                    {formatAmount(payment.amount, subscription.currency)}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {showEditButton && onEdit && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary || '#007AFF' },
              ]}
              onPress={() => onEdit(subscription)}>
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          )}

          {onToggleStatus && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.secondary || '#5AC8FA' },
              ]}
              onPress={() => onToggleStatus(subscription)}>
              <Text style={styles.actionButtonText}>
                {isActive ? 'Pause' : 'Resume'}
              </Text>
            </TouchableOpacity>
          )}

          {showDeleteButton && onDelete && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.error || '#FF3B30' },
              ]}
              onPress={() => setShowConfirmDelete(true)}>
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation */}
      {showConfirmDelete && (
        <View style={styles.confirmation}>
          <View
            style={[
              styles.confirmationContent,
              { backgroundColor: colors.background || '#FFF' },
            ]}>
            <Text
              style={[
                styles.confirmationTitle,
                { color: colors.text || '#000' },
              ]}>
              Delete Subscription?
            </Text>
            <Text
              style={[
                styles.confirmationMessage,
                { color: colors.textSecondary || '#999' },
              ]}>
              This action cannot be undone.
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: colors.inputBackground || '#F5F5F5' },
                ]}
                onPress={() => setShowConfirmDelete(false)}>
                <Text style={[styles.confirmButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: colors.error || '#FF3B30' },
                ]}
                onPress={handleDeleteConfirm}>
                <Text style={styles.confirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const getStatusColor = (status: string, colors: any) => {
  switch (status) {
    case 'active':
      return colors.success || '#34C759';
    case 'paused':
      return colors.warning || '#FF9500';
    case 'cancelled':
      return colors.error || '#FF3B30';
    default:
      return colors.textSecondary || '#999';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    flex: 1,
  },
  statusSection: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  amountCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  billingCycle: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  dateCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  date: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  daysUntil: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  paymentCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  paymentList: {
    gap: 12,
  },
  paymentItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
  },
  paymentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 12,
  },
  paymentDate: {
    fontSize: 12,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  actions: {
    flexDirection: 'row' as const,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexWrap: 'wrap' as const,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  confirmation: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  confirmationContent: {
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  confirmationMessage: {
    fontSize: 14,
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
});

export default SubscriptionDetails;
