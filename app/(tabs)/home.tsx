/**
 * Dashboard Screen - Home Tab
 * Shows subscription overview, spending, and quick actions
 */

import {
    Card,
    SectionHeader,
    StatBox,
    SubscriptionItem
} from '@/components/ui/SubTrackComponents';
import {
    MOCK_SUBSCRIPTIONS,
    MOCK_UPCOMING_PAYMENTS
} from '@/utils/mockData';
import {
    calculateMonthlySpending,
    formatCurrency,
    formatDate,
    getDaysUntilBilling,
    sortByNextBilling,
} from '@/utils/subscriptionHelpers';
import React, { useCallback, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface UpcomingPayment {
  name: string;
  date: string;
  amount: number;
}

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptions] = useState(MOCK_SUBSCRIPTIONS);

  const monthlySpending = calculateMonthlySpending(subscriptions);
  const upcomingPayments: UpcomingPayment[] = MOCK_UPCOMING_PAYMENTS;
  const upcomingSorted = [...upcomingPayments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const getNextUpcomingPayment = () => {
    return upcomingSorted[0];
  };

  const nextPayment = getNextUpcomingPayment();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome Back! 👋</Text>
        <Text style={styles.subGreeting}>Here's your subscription overview</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <StatBox
          label="Monthly Spend"
          value={formatCurrency(monthlySpending)}
          color="#6366F1"
          icon="💰"
        />
        <StatBox
          label="Active Subs"
          value={`${subscriptions.filter(s => s.status === 'active').length}`}
          suffix="active"
          color="#10B981"
          icon="✅"
        />
      </View>

      {/* Next Payment Alert */}
      {nextPayment && (
        <Card style={styles.nextPaymentCard}>
          <Text style={styles.nextPaymentLabel}>Next Payment Due</Text>
          <View style={styles.nextPaymentContent}>
            <View>
              <Text style={styles.nextPaymentName}>{nextPayment.name}</Text>
              <Text style={styles.nextPaymentDate}>
                {formatDate(nextPayment.date)}
              </Text>
            </View>
            <Text style={styles.nextPaymentAmount}>
              {formatCurrency(nextPayment.amount)}
            </Text>
          </View>
        </Card>
      )}

      {/* Upcoming Payments Section */}
      <SectionHeader
        title="Upcoming Payments"
        subtitle={`${upcomingSorted.length} payments in next 30 days`}
        actionText="View All"
      />
      {upcomingSorted.slice(0, 3).map((payment, index) => (
        <Card key={index} style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <View>
              <Text style={styles.paymentName}>{payment.name}</Text>
              <Text style={styles.paymentDate}>{formatDate(payment.date)}</Text>
            </View>
            <Text style={styles.paymentAmount}>
              {formatCurrency(payment.amount)}
            </Text>
          </View>
        </Card>
      ))}

      {/* Active Subscriptions Section */}
      <SectionHeader
        title="Active Subscriptions"
        subtitle={`${subscriptions.filter(s => s.status === 'active').length} services`}
        actionText="Manage"
      />
      {sortByNextBilling(subscriptions.filter(s => s.status === 'active'))
        .slice(0, 5)
        .map(subscription => (
          <SubscriptionItem
            key={subscription.id}
            name={subscription.name}
            amount={subscription.amount}
            currency={subscription.currency}
            icon={subscription.icon}
            color={subscription.color}
            nextBillingDate={formatDate(subscription.nextBillingDate)}
            daysUntil={getDaysUntilBilling(subscription.nextBillingDate)}
          />
        ))}

      {/* Quick Actions */}
      <SectionHeader title="Quick Actions" />
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionLabel}>Add New</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionLabel}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🎯</Text>
          <Text style={styles.actionLabel}>Budget</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={styles.actionLabel}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom spacing */}
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },

  subGreeting: {
    fontSize: 14,
    color: '#6B7280',
  },

  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },

  nextPaymentCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#EFF6FF',
    borderLeftColor: '#3B82F6',
    borderLeftWidth: 4,
  },

  nextPaymentLabel: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '600',
    marginBottom: 8,
  },

  nextPaymentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  nextPaymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },

  nextPaymentDate: {
    fontSize: 12,
    color: '#0369A1',
  },

  nextPaymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },

  paymentCard: {
    marginHorizontal: 16,
  },

  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  paymentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  paymentDate: {
    fontSize: 12,
    color: '#6B7280',
  },

  paymentAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },

  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    justifyContent: 'space-between',
  },

  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },

  spacer: {
    height: 40,
  },
});
