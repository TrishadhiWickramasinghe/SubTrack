import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    StyleSheet,
    Text,
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
  showStats?: boolean;
  listType?: 'grid' | 'list';
  compactMode?: boolean;
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
    showStats = true,
    listType = 'list',
    compactMode = false,
  }) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Refs
    const flatListRef = useRef<FlatList<Subscription>>(null);

    // State
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate basic stats
    const stats = useMemo(() => ({
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      paused: subscriptions.filter(s => s.status === 'paused').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      totalSpent: subscriptions.reduce((sum, s) => sum + s.amount, 0),
    }), [subscriptions]);

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

      return result;
    }, [subscriptions, searchQuery]);

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
            ]}>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemContainer: {
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    marginHorizontal: 6,
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
});

export default SubscriptionList;
