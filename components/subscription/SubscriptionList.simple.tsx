import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types
import Subscription from '@models/Subscription';

// Components
import EmptyState from '@components/common/EmptyState';
import SubscriptionCard from './SubscriptionCard';

// Hooks
import useTheme from '@hooks/useTheme';

// Config

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type SortOption = {
  id: string;
  label: string;
  icon: string;
  sortFn: (a: Subscription, b: Subscription) => number;
};

export type FilterOption = {
  id: string;
  label: string;
  icon: string;
  type: 'status' | 'category' | 'billingCycle' | 'price' | 'tag';
  value: any;
};

interface SubscriptionListProps {
  subscriptions: Subscription[];
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onSubscriptionPress?: (subscription: Subscription) => void;
  onSubscriptionEdit?: (subscription: Subscription) => void;
  onSubscriptionDelete?: (subscription: Subscription) => void;
  onSubscriptionDuplicate?: (subscription: Subscription) => void;
  onSubscriptionToggle?: (subscription: Subscription) => void;
  onAddSubscription?: () => void;
  onSelectSubscription?: (subscription: Subscription) => void;
  selectionMode?: boolean;
  selectedIds?: string[];
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  showStats?: boolean;
  showFloatingButton?: boolean;
  listType?: 'grid' | 'list';
  compactMode?: boolean;
  onListTypeChange?: (type: 'grid' | 'list') => void;
}

const SubscriptionList: React.FC<SubscriptionListProps> = memo(
  ({
    subscriptions,
    loading = false,
    refreshing = false,
    error = null,
    onRefresh,
    onLoadMore,
    onSubscriptionPress,
    onSubscriptionEdit,
    onSubscriptionDelete,
    onSubscriptionDuplicate,
    onSubscriptionToggle,
    onAddSubscription,
    onSelectSubscription,
    selectionMode = false,
    selectedIds = [],
    emptyStateTitle = 'No Subscriptions',
    emptyStateMessage = 'Add your first subscription to get started',
    showSearch = true,
    showFilters = true,
    showSort = true,
    showStats = true,
    showFloatingButton = true,
    listType = 'list',
    compactMode = false,
    onListTypeChange,
  }) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Refs
    const flatListRef = useRef<FlatList<Subscription>>(null);

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
    const [selectedSort, setSelectedSort] = useState<SortOption | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Calculate basic stats
    const stats = useMemo(() => ({
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      paused: subscriptions.filter(s => s.status === 'paused').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      totalSpent: subscriptions.reduce((sum, s) => sum + s.amount, 0),
    }), [subscriptions]);

    // Sort options
    const SORT_OPTIONS: SortOption[] = [
      {
        id: 'next_billing',
        label: 'Next Billing',
        icon: 'calendar-clock',
        sortFn: (a, b) =>
          new Date(a.billingDate).getTime() - new Date(b.billingDate).getTime(),
      },
      {
        id: 'name',
        label: 'Name',
        icon: 'sort-alphabetical-ascending',
        sortFn: (a, b) => a.name.localeCompare(b.name),
      },
      {
        id: 'amount',
        label: 'Amount',
        icon: 'sort-numeric-descending',
        sortFn: (a, b) => b.amount - a.amount,
      },
      {
        id: 'recent',
        label: 'Recently Added',
        icon: 'clock',
        sortFn: (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      },
    ];

    // Initialize selected sort
    if (!selectedSort && SORT_OPTIONS.length > 0) {
      setSelectedSort(SORT_OPTIONS[0]);
    }

    // Process subscriptions
    const processedSubscriptions = useMemo(() => {
      let result = [...subscriptions];

      // Apply search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          (sub) =>
            sub.name.toLowerCase().includes(query) ||
            sub.description?.toLowerCase().includes(query)
        );
      }

      // Apply filters
      if (selectedFilters.length > 0) {
        result = result.filter((sub) => {
          return selectedFilters.some((filter) => {
            switch (filter.type) {
              case 'status':
                return sub.status === filter.value;
              case 'category':
                return sub.category === filter.value;
              case 'price':
                if (filter.value.min && sub.amount < filter.value.min) return false;
                if (filter.value.max && sub.amount > filter.value.max) return false;
                return true;
              default:
                return true;
            }
          });
        });
      }

      // Apply sorting
      if (selectedSort) {
        result.sort(selectedSort.sortFn);
      }

      return result;
    }, [subscriptions, searchQuery, selectedFilters, selectedSort]);

    // Animation handlers
    const scrollToTop = useCallback(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, []);

    // Filter handlers
    const handleFilterToggle = useCallback((filter: FilterOption) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSelectedFilters((prev) => {
        const exists = prev.find((f) => f.id === filter.id);
        if (exists) {
          return prev.filter((f) => f.id !== filter.id);
        }
        return [...prev, filter];
      });
    }, []);

    const handleClearFilters = useCallback(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSelectedFilters([]);
      setSearchQuery('');
    }, []);

    // Render item for FlatList
    const renderItem = useCallback(
      ({ item }: { item: Subscription; index: number }) => {
        const isSelected = selectionMode && selectedIds.includes(item.id);

        return (
          <View
            style={[
              styles.itemContainer,
              listType === 'grid' && styles.gridItem,
              isSelected && styles.selectedItem,
            ] as any}>
            <SubscriptionCard
              subscription={item}
              onPress={() => {
                if (selectionMode && onSelectSubscription) {
                  onSelectSubscription(item);
                } else if (onSubscriptionPress) {
                  onSubscriptionPress(item);
                }
              }}
              onEdit={onSubscriptionEdit}
              onDelete={onSubscriptionDelete}
              onDuplicate={onSubscriptionDuplicate}
              onToggleStatus={onSubscriptionToggle}
              compactMode={compactMode || listType === 'grid'}
              showCategory={listType === 'list'}
              showNextBilling={listType === 'list'}
            />
            {isSelected && (
              <View style={styles.selectionOverlay}>
                <Icon name="check-circle" size={24} color={theme.theme.colors.primary} />
              </View>
            )}
          </View>
        );
      },
      [
        listType,
        selectionMode,
        selectedIds,
        onSelectSubscription,
        onSubscriptionPress,
        onSubscriptionEdit,
        onSubscriptionDelete,
        onSubscriptionDuplicate,
        onSubscriptionToggle,
        compactMode,
        theme.theme.colors.primary,
      ]
    );

    // Key extractor
    const keyExtractor = useCallback((item: Subscription) => item.id, []);

    if (loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={theme.theme.colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.container}>
          <EmptyState
            icon="alert-circle-outline"
            title="Error"
            message={error}
          />
        </View>
      );
    }

    if (processedSubscriptions.length === 0) {
      return (
        <View style={styles.container}>
          <EmptyState
            icon="inbox-outline"
            title={emptyStateTitle}
            message={emptyStateMessage}
          />
        </View>
      );
    }

    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {/* Stats */}
        {showStats && (
          <View style={[styles.statsContainer, { backgroundColor: theme.theme.colors.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.theme.colors.primary }]}>
                {stats.total}
              </Text>
              <Text style={[styles.statLabel, { color: theme.theme.colors.textSecondary }]}>
                Total
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.theme.colors.success }]}>
                {stats.active}
              </Text>
              <Text style={[styles.statLabel, { color: theme.theme.colors.textSecondary }]}>
                Active
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.theme.colors.warning }]}>
                {stats.paused}
              </Text>
              <Text style={[styles.statLabel, { color: theme.theme.colors.textSecondary }]}>
                Paused
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.theme.colors.error }]}>
                {stats.cancelled}
              </Text>
              <Text style={[styles.statLabel, { color: theme.theme.colors.textSecondary }]}>
                Cancelled
              </Text>
            </View>
          </View>
        )}

        {/* Search and filtering info */}
        {(searchQuery || selectedFilters.length > 0) && (
          <View style={[styles.filterInfo, { backgroundColor: theme.theme.colors.backgroundSecondary }]}>
            <Text style={[styles.filterInfoText, { color: theme.theme.colors.text }]}>
              {processedSubscriptions.length} results
            </Text>
            <TouchableOpacity onPress={handleClearFilters}>
              <Text style={[styles.clearFiltersText, { color: theme.theme.colors.primary }]}>
                Clear Filters
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* List */}
        <FlatList
          ref={flatListRef}
          data={processedSubscriptions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onRefresh={onRefresh}
          refreshing={refreshing}
          numColumns={listType === 'grid' ? 2 : 1}
          scrollEventThrottle={16}
          onEndReachedThreshold={0.1}
          onEndReached={onLoadMore}
          contentContainerStyle={styles.listContent}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
        />
      </View>
    );
  }
);

SubscriptionList.displayName = 'SubscriptionList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  itemContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  gridItem: {
    flex: 1,
    maxWidth: '50%',
  },
  selectedItem: {
    opacity: 0.8,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    marginHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  filterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  filterInfoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SubscriptionList;
