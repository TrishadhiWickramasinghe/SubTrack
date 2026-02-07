import { differenceInDays } from 'date-fns';
import React, { memo, useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types
import Subscription from '@models/Subscription';

// Hooks
import { useCurrency } from '@hooks/useCurrency';
import { useTheme } from '@hooks/useTheme';

// Components
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';
import Card from '@components/common/Card';

interface SubscriptionDetailsProps {
  subscription: Subscription;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  onBack?: () => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = memo(
  ({
    subscription,
    onEdit,
    onDelete,
    onBack,
    showEditButton = true,
    showDeleteButton = true,
  }) => {
    const { theme, isDark } = useTheme();
    const colors = theme?.colors || {};
    const { convertAmount, formatAmount: formatAmountUtil } = useCurrency();
    const primaryCurrency = 'USD';
    const insets = useSafeAreaInsets();

    // State
    const [isProcessing, setIsProcessing] = useState(false);

    // Memoized calculations
    const calculations = useMemo((): any => {
      try {
        const today = new Date();
        const nextDate = new Date(subscription.nextBillingDate || today);
        const daysUntil = differenceInDays(nextDate, today);

        return {
          nextBillingDate: nextDate,
          daysUntilBilling: daysUntil,
          isDueSoon: daysUntil <= 3 && daysUntil >= 0,
          isOverdue: daysUntil < 0,
          formattedAmount: formatAmountUtil(subscription.amount, subscription.currency || primaryCurrency),
          categoryColor: '#6366F1',
          isActive: subscription.status === 'active',
          billingCycleDisplay: subscription.billingCycle,
        };
      } catch (error) {
        return {
          nextBillingDate: new Date(),
          daysUntilBilling: 0,
          isDueSoon: false,
          isOverdue: false,
          formattedAmount: '0',
          categoryColor: '#6366F1',
          isActive: false,
          billingCycleDisplay: 'monthly',
        };
      }
    }, [subscription, primaryCurrency, formatAmountUtil]);

    const {
      nextBillingDate,
      daysUntilBilling,
      isDueSoon,
      isOverdue,
      formattedAmount,
      categoryColor,
      isActive,
      billingCycleDisplay,
    } = calculations;

    // Handlers
    const handleEdit = useCallback(() => {
      if (onEdit) onEdit(subscription);
    }, [onEdit, subscription]);

    const handleDelete = useCallback(async () => {
      Alert.alert(
        'Delete Subscription',
        `Are you sure you want to delete "${subscription.name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setIsProcessing(true);
              try {
                if (onDelete) {
                  onDelete(subscription);
                }
              } catch (error) {
                console.error('Error deleting subscription:', error);
                Alert.alert('Error', 'Failed to delete subscription. Please try again.');
              } finally {
                setIsProcessing(false);
              }
            },
          },
        ]
      );
    }, [onDelete, subscription]);

    const handleOpenWebsite = useCallback(() => {
      if (subscription.serviceUrl) {
        Linking.openURL(subscription.serviceUrl).catch(err =>
          console.error('Failed to open URL:', err)
        );
      }
    }, [subscription.serviceUrl]);

    const getStatusColor = (status: string) => {
      const statusColors: any = {
        active: colors.success || '#34C759',
        paused: colors.warning || '#FF9500',
        cancelled: colors.error || '#FF3B30',
      };
      return statusColors[status] || colors.textSecondary;
    };

    // Render content
    return (
      <View style={[styles.container, { backgroundColor: colors.background || '#FFF' }]}>
        {/* Header with back button */}
        <View style={[styles.header, { paddingTop: insets.top, backgroundColor: categoryColor }]}>
          {onBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          <View style={styles.headerTitle}>
            <Text style={styles.title}>{subscription.name}</Text>
            <Text style={[styles.amount, { color: colors.textSecondary }]}>
              {formattedAmount} / {billingCycleDisplay}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}>
          
          {/* Status info card */}
          <Card style={{ ...styles.card, backgroundColor: colors.card || '#FFF' }}>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Status</Text>
              <Badge
                text={subscription.status.toUpperCase()}
                color={getStatusColor(subscription.status) as any}
                size="small"
              />
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {subscription.category || 'General'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Billing Cycle</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {billingCycleDisplay}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Next Billing</Text>
              <Text style={[styles.value, { color: isOverdue ? colors.error : isDueSoon ? colors.warning : colors.text }]}>
                {isOverdue
                  ? `${Math.abs(daysUntilBilling)} days ago`
                  : `In ${daysUntilBilling} days`}
              </Text>
            </View>
          </Card>

          {/* Description card */}
          {subscription.description && (
            <Card style={{ ...styles.card, backgroundColor: colors.card || '#FFF' }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {subscription.description}
              </Text>
            </Card>
          )}

          {/* Notes card */}
          {subscription.notes && (
            <Card style={{ ...styles.card, backgroundColor: colors.card || '#FFF' }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {subscription.notes}
              </Text>
            </Card>
          )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {showEditButton && onEdit && (
              <Button
                onPress={handleEdit}
                style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.actionButtonText}>Edit</Text>
              </Button>
            )}

            {subscription.serviceUrl && (
              <Button
                onPress={handleOpenWebsite}
                style={[styles.actionButton, { backgroundColor: colors.secondary }]}>
                <Text style={styles.actionButtonText}>Visit Website</Text>
              </Button>
            )}

            {showDeleteButton && onDelete && (
              <Button
                onPress={handleDelete}
                disabled={isProcessing}
                style={[styles.actionButton, { backgroundColor: colors.error || '#FF3B30' }]}>
                <Text style={styles.actionButtonText}>Delete</Text>
              </Button>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFF',
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  amount: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

SubscriptionDetails.displayName = 'SubscriptionDetails';

export default SubscriptionDetails;