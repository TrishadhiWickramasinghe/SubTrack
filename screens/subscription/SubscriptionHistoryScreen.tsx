import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { neutral, primary } from '@config/colors';
import { useSubscriptions } from '@hooks/useSubscriptions';
import { formatCurrency } from '@utils/currencyHelpers';

import Subscription from '@models/Subscription';

interface SubscriptionHistoryScreenRouteParams {
  subscriptionId: string;
}

const SubscriptionHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { subscriptionId } = route.params as SubscriptionHistoryScreenRouteParams;

  const { subscriptions } = useSubscriptions();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [subscriptionId]);

  const loadData = useCallback(async () => {
    const found = subscriptions.find(s => s.id === subscriptionId);
    if (found) {
      setSubscription(found);
    }
  }, [subscriptionId, subscriptions]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={primary[500]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subscription?.name || 'Payment History'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {subscription ? (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Service Name</Text>
              <Text style={styles.infoValue}>{subscription.name}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.infoValue}>{formatCurrency(subscription.amount, subscription.currency)}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Billing Cycle</Text>
              <Text style={styles.infoValue}>{subscription.billingCycle}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Start Date</Text>
              <Text style={styles.infoValue}>
                {new Date(subscription.firstBillingDate).toLocaleDateString()}
              </Text>
            </View>

            {subscription.lastPaymentDate && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Last Payment</Text>
                <Text style={styles.infoValue}>
                  {new Date(subscription.lastPaymentDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            {subscription.nextBillingDate && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Next Billing</Text>
                <Text style={styles.infoValue}>
                  {new Date(subscription.nextBillingDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            {subscription.cancellationDate && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Cancelled On</Text>
                <Text style={styles.infoValue}>
                  {new Date(subscription.cancellationDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment History</Text>
              <Text style={styles.sectionContent}>
                {'Detailed payment history for ' + subscription.name + ' will appear here as payments are recorded.'}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="inbox-multiple-outline" size={48} color={neutral[400]} />
            <Text style={styles.emptyStateTitle}>No Subscription Found</Text>
            <Text style={styles.emptyStateText}>The subscription could not be loaded.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neutral[0],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: neutral[200],
    backgroundColor: neutral[50],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: neutral[800],
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: neutral[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: primary[500],
  },
  infoLabel: {
    fontSize: 12,
    color: neutral[500],
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: neutral[800],
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: neutral[800],
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
    color: neutral[500],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: neutral[800],
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: neutral[500],
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SubscriptionHistoryScreen;