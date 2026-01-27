/**
 * Subscriptions Screen - Browse & Manage Subscriptions
 * Shows detailed list of all subscriptions with search and filters
 */

import {
    EmptyState,
    SectionHeader,
    SubscriptionItem
} from '@/components/ui/SubTrackComponents';
import { MOCK_SUBSCRIPTIONS } from '@/utils/mockData';
import {
    calculateMonthlySpending,
    formatDate,
    getDaysUntilBilling,
    groupByCategory,
    searchSubscriptions,
    sortByNextBilling,
} from '@/utils/subscriptionHelpers';
import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type FilterType = 'all' | 'active' | 'trial' | 'cancelled';
type SortType = 'nextBilling' | 'name' | 'amount';

export default function SubscriptionsScreen() {
  const [subscriptions] = useState(MOCK_SUBSCRIPTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('nextBilling');

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    let result = subscriptions;

    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter(sub => sub.status === activeFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      result = searchSubscriptions(result, searchQuery);
    }

    // Apply sorting
    switch (sortBy) {
      case 'nextBilling':
        result = sortByNextBilling(result);
        break;
      case 'amount':
        result = [...result].sort((a, b) => b.amount - a.amount);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [subscriptions, searchQuery, activeFilter, sortBy]);

  // Group by category if showing all
  const groupedByCategory = useMemo(() => {
    if (activeFilter === 'all' && searchQuery === '') {
      return groupByCategory(filteredSubscriptions);
    }
    return null;
  }, [filteredSubscriptions, activeFilter, searchQuery]);

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    trial: subscriptions.filter(s => s.status === 'trial').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    monthlySpending: calculateMonthlySpending(subscriptions),
  };

  const FilterButton = ({ label, value }: { label: string; value: FilterType }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === value && styles.filterButtonActive,
      ]}
      onPress={() => setActiveFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === value && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Subscriptions</Text>
        <Text style={styles.subtitle}>
          {stats.active} active • {filteredSubscriptions.length} total
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search subscriptions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Stats Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsBar}
        contentContainerStyle={styles.statsBarContent}
      >
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total/Mo</Text>
          <Text style={styles.statValue}>${stats.monthlySpending.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Active</Text>
          <Text style={styles.statValue}>{stats.active}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Trial</Text>
          <Text style={styles.statValue}>{stats.trial}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Cancelled</Text>
          <Text style={styles.statValue}>{stats.cancelled}</Text>
        </View>
      </ScrollView>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        <FilterButton label="All" value="all" />
        <FilterButton label="Active" value="active" />
        <FilterButton label="Trial" value="trial" />
        <FilterButton label="Cancelled" value="cancelled" />
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'nextBilling' && styles.sortButtonActive]}
          onPress={() => setSortBy('nextBilling')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'nextBilling' && styles.sortButtonTextActive,
            ]}
          >
            Next Billing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'amount' && styles.sortButtonActive]}
          onPress={() => setSortBy('amount')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'amount' && styles.sortButtonTextActive,
            ]}
          >
            Amount
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
          onPress={() => setSortBy('name')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'name' && styles.sortButtonTextActive,
            ]}
          >
            Name
          </Text>
        </TouchableOpacity>
      </View>

      {/* Subscriptions List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredSubscriptions.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No subscriptions found"
            subtitle={searchQuery ? 'Try adjusting your search' : 'Add your first subscription'}
          />
        ) : groupedByCategory && activeFilter === 'all' && searchQuery === '' ? (
          // Grouped view
          Object.entries(groupedByCategory).map(([category, items]) => (
            <View key={category}>
              <SectionHeader
                title={category}
                subtitle={`${items.length} service${items.length !== 1 ? 's' : ''}`}
              />
              {items.map(subscription => (
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
            </View>
          ))
        ) : (
          // Flat list view
          filteredSubscriptions.map(subscription => (
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
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
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
    paddingBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontSize: 14,
    color: '#1F2937',
  },

  searchIcon: {
    fontSize: 18,
    marginLeft: 8,
  },

  statsBar: {
    marginVertical: 12,
  },

  statsBarContent: {
    paddingHorizontal: 16,
  },

  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },

  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  divider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },

  filterBar: {
    marginVertical: 8,
  },

  filterBarContent: {
    paddingHorizontal: 16,
    gap: 8,
  },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  filterButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },

  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  filterButtonTextActive: {
    color: '#FFFFFF',
  },

  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    gap: 8,
  },

  sortLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },

  sortButtonActive: {
    backgroundColor: '#6366F1',
  },

  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  sortButtonTextActive: {
    color: '#FFFFFF',
  },

  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  bottomPadding: {
    height: 20,
  },
});
