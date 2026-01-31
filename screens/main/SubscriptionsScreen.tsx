import Chip from '@components/common/Chip';
import EmptyState from '@components/common/EmptyState';
import LoadingSkeleton from '@components/common/LoadingSkeleton';
import SearchBar from '@components/common/SearchBar';
import TabBar from '@components/common/TabBar';
import FilterModal from '@components/subscription/FilterModal';
import QuickAddButton from '@components/subscription/QuickAddButton';
import SubscriptionItem from '@components/subscription/SubscriptionItem';
import { useTheme } from '@context/ThemeContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCurrency } from '@hooks/useCurrency';
import { useSubscriptions } from '@hooks/useSubscriptions';
import { useFocusEffect } from '@react-navigation/native';
import { filterSubscriptions, sortSubscriptions } from '@utils/sorting';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import styles from './SubscriptionsScreen.styles';

export default function SubscriptionsScreen() {
  const { theme, colors } = useTheme();
  const { formatAmount } = useCurrency();
  const {
    subscriptions,
    loading,
    refreshSubscriptions,
    deleteSubscription,
    toggleSubscriptionStatus,
    duplicateSubscription,
  } = useSubscriptions();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [swipeableRow, setSwipeableRow] = useState<Swipeable | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshSubscriptions();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshSubscriptions();
    setRefreshing(false);
  };

  const filteredSubscriptions = useMemo(() => {
    let filtered = filterSubscriptions(subscriptions, {
      status: selectedStatus === 'all' ? null : selectedStatus,
      category: selectedCategory,
      searchQuery,
    });
    
    filtered = sortSubscriptions(filtered, sortBy, sortOrder);
    return filtered;
  }, [subscriptions, selectedStatus, selectedCategory, searchQuery, sortBy, sortOrder]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(subscriptions.map(sub => sub.category)));
    return uniqueCategories;
  }, [subscriptions]);

  const totalMonthlyCost = useMemo(() => {
    return filteredSubscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => total + sub.amount, 0);
  }, [filteredSubscriptions]);

  const handleDelete = (subscriptionId: string) => {
    Alert.alert(
      'Delete Subscription',
      'Are you sure you want to delete this subscription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSubscription(subscriptionId),
        },
      ]
    );
  };

  const handleDuplicate = (subscriptionId: string) => {
    duplicateSubscription(subscriptionId);
  };

  const renderRightActions = (subscriptionId: string) => {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: '#4CAF50' }]}
          onPress={() => {
            swipeableRow?.close();
            handleDuplicate(subscriptionId);
          }}>
          <MaterialIcons name="content-copy" size={20} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>Duplicate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: '#FF9800' }]}
          onPress={() => {
            swipeableRow?.close();
            // Navigate to edit
          }}>
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: '#F44336' }]}
          onPress={() => {
            swipeableRow?.close();
            handleDelete(subscriptionId);
          }}>
          <Ionicons name="trash" size={20} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSubscriptionItem = ({ item }: { item: any }) => {
    return (
      <Swipeable
        ref={(ref) => setSwipeableRow(ref)}
        renderRightActions={() => renderRightActions(item.id)}
        overshootRight={false}>
        <SubscriptionItem
          subscription={item}
          onPress={() => {/* Navigate to details */}}
          onLongPress={() => {/* Show quick actions */}}
          onToggleStatus={() => toggleSubscriptionStatus(item.id)}
        />
      </Swipeable>
    );
  };

  const statusTabs = [
    { id: 'all', label: 'All', count: subscriptions.length },
    { id: 'active', label: 'Active', count: subscriptions.filter(s => s.status === 'active').length },
    { id: 'paused', label: 'Paused', count: subscriptions.filter(s => s.status === 'paused').length },
    { id: 'cancelled', label: 'Cancelled', count: subscriptions.filter(s => s.status === 'cancelled').length },
  ];

  if (loading && !refreshing && subscriptions.length === 0) {
    return <LoadingSkeleton type="subscription-list" />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Subscriptions</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}>
              <Ionicons name="filter" size={22} color={colors.primary} />
              {(selectedStatus !== 'all' || selectedCategory || sortBy !== 'date') && (
                <View style={styles.filterBadge} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
              <Ionicons
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search subscriptions..."
          style={styles.searchBar}
        />

        {/* Status Tabs */}
        <TabBar
          tabs={statusTabs}
          activeTab={selectedStatus}
          onTabPress={setSelectedStatus}
          style={styles.tabBar}
        />

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
          </Text>
          <Text style={[styles.totalText, { color: colors.text }]}>
            Total: {formatAmount(totalMonthlyCost)}/month
          </Text>
        </View>

        {/* Active Filters */}
        <View style={styles.filtersContainer}>
          {selectedCategory && (
            <Chip
              label={selectedCategory}
              onClose={() => setSelectedCategory(null)}
              icon="pricetag-outline"
            />
          )}
          {selectedStatus !== 'all' && (
            <Chip
              label={selectedStatus}
              onClose={() => setSelectedStatus('all')}
              icon="checkmark-circle-outline"
            />
          )}
        </View>
      </View>

      {/* Subscription List */}
      <FlatList
        data={filteredSubscriptions}
        renderItem={renderSubscriptionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No Subscriptions"
            message={
              searchQuery || selectedStatus !== 'all' || selectedCategory
                ? 'No subscriptions match your filters'
                : 'Add your first subscription to get started'
            }
            buttonText={
              searchQuery || selectedStatus !== 'all' || selectedCategory
                ? 'Clear Filters'
                : 'Add Subscription'
            }
            onPress={() => {
              if (searchQuery || selectedStatus !== 'all' || selectedCategory) {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedCategory(null);
              } else {
                // Navigate to add subscription
              }
            }}
          />
        }
      />

      {/* Quick Add Button */}
      <QuickAddButton onPress={() => {/* Navigate to add subscription */}} />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={() => {
          setSelectedStatus('all');
          setSelectedCategory(null);
          setSearchQuery('');
          setSortBy('date');
          setShowFilterModal(false);
        }}
      />
    </SafeAreaView>
  );
}