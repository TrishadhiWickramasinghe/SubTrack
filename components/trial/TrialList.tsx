import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    UIManager,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types
import Trial from '@models/Trial';

// Components
import EmptyState from '@components/common/EmptyState';
import TrialCard from './TrialCard';

// Hooks
import useTheme from '@hooks/useTheme';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type TrialSortOption = {
  id: string;
  label: string;
  icon: string;
  sortFn: (a: Trial, b: Trial) => number;
};

export type TrialFilterOption = {
  id: string;
  label: string;
  icon: string;
  type: 'status' | 'engagement' | 'conversion' | 'churnRisk';
  value: any;
};

interface TrialListProps {
  trials: Trial[];
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onTrialPress?: (trial: Trial) => void;
  onTrialEdit?: (trial: Trial) => void;
  onTrialDelete?: (trial: Trial) => void;
  onTrialConvert?: (trial: Trial) => void;
  onTrialExtend?: (trial: Trial) => void;
  onTrialCancel?: (trial: Trial) => void;
  onTrialApplyPromo?: (trial: Trial) => void;
  onAddTrial?: () => void;
  onSelectTrial?: (trial: Trial) => void;
  selectionMode?: boolean;
  selectedIds?: string[];
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  showStats?: boolean;
  showEngagementMetrics?: boolean;
  compactMode?: boolean;
  filterStatus?: 'all' | 'active' | 'converted' | 'expired' | 'cancelled';
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const TrialList: React.FC<TrialListProps> = memo(
  ({
    trials,
    loading = false,
    refreshing = false,
    error = null,
    onRefresh,
    onLoadMore,
    onTrialPress,
    onTrialEdit,
    onTrialDelete,
    onTrialConvert,
    onTrialExtend,
    onTrialCancel,
    onTrialApplyPromo,
    onAddTrial,
    onSelectTrial,
    selectionMode = false,
    selectedIds = [],
    emptyStateTitle = 'No Trials',
    emptyStateMessage = 'Add your first trial subscription to get started',
    showStats = true,
    showEngagementMetrics = true,
    compactMode = false,
    filterStatus = 'all',
    searchQuery = '',
    onSearchChange,
  }) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Refs
    const flatListRef = useRef<FlatList<Trial>>(null);

    // State
    const [internalSearchQuery, setInternalSearchQuery] = useState(searchQuery);

    // Calculate stats
    const stats = useMemo(() => {
      const now = new Date();
      return {
        total: trials.length,
        active: trials.filter((t) => t.status === 'active').length,
        converted: trials.filter((t) => t.status === 'converted').length,
        expired: trials.filter((t) => {
          const endDate = new Date(t.endDate);
          return endDate < now && t.status === 'active';
        }).length,
        cancelled: trials.filter((t) => t.status === 'cancelled').length,
        expiringIn3Days: trials.filter((t) => {
          const endDate = new Date(t.endDate);
          const daysUntil = Math.ceil(
            (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysUntil <= 3 && daysUntil > 0 && t.status === 'active';
        }).length,
      };
    }, [trials]);

    // Calculate analytics
    const analytics = useMemo(() => {
      if (trials.length === 0)
        return {
          avgEngagement: 0,
          avgConversion: 0,
          avgChurnRisk: 0,
          totalEngagement: 0,
        };

      const totalEngagement = trials.reduce((sum, t) => sum + t.engagementScore, 0);
      const totalConversion = trials.reduce(
        (sum, t) => sum + t.conversionLikelihood,
        0
      );
      const totalChurnRisk = trials.reduce((sum, t) => sum + t.churnRiskScore, 0);

      return {
        avgEngagement: Math.round(totalEngagement / trials.length),
        avgConversion: Math.round(totalConversion / trials.length),
        avgChurnRisk: Math.round(totalChurnRisk / trials.length),
        totalEngagement,
      };
    }, [trials]);

    // Process trials based on filters and search
    const processedTrials = useMemo(() => {
      let result = [...trials];

      // Apply status filter
      if (filterStatus !== 'all') {
        result = result.filter((trial) => trial.status === filterStatus);
      }

      // Apply search
      const query = internalSearchQuery.trim().toLowerCase();
      if (query) {
        result = result.filter(
          (trial) =>
            trial.subscriptionName.toLowerCase().includes(query) ||
            trial.planName?.toLowerCase().includes(query) ||
            trial.promoDescription?.toLowerCase().includes(query)
        );
      }

      // Sort by date (newest first)
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return result;
    }, [trials, filterStatus, internalSearchQuery]);

    // Handle search change
    const handleSearchChange = useCallback(
      (text: string) => {
        setInternalSearchQuery(text);
        if (onSearchChange) {
          onSearchChange(text);
        }
      },
      [onSearchChange]
    );

    // Render item for FlatList
    const renderItem = useCallback(
      ({ item }: { item: Trial; index: number }) => {
        const isSelected = selectionMode && selectedIds.includes(item.id);

        return (
          <View
            style={[
              styles.itemContainer,
              isSelected && styles.selectedItem,
            ]}
          >
            <TrialCard
              trial={item}
              onPress={() => {
                if (selectionMode && onSelectTrial) {
                  onSelectTrial(item);
                } else if (onTrialPress) {
                  onTrialPress(item);
                }
              }}
              onEdit={onTrialEdit}
              onDelete={onTrialDelete}
              onConvert={onTrialConvert}
              onExtend={onTrialExtend}
              onCancel={onTrialCancel}
              onApplyPromo={onTrialApplyPromo}
              showEngagementScore={showEngagementMetrics}
              showConversionLikelihood={showEngagementMetrics}
              showChurnRisk={showEngagementMetrics}
              compactMode={compactMode}
            />
            {isSelected && (
              <View style={styles.selectionOverlay}>
                <Icon
                  name="check-circle"
                  size={24}
                  color={theme.theme.colors.primary}
                />
              </View>
            )}
          </View>
        );
      },
      [
        selectionMode,
        selectedIds,
        onSelectTrial,
        onTrialPress,
        onTrialEdit,
        onTrialDelete,
        onTrialConvert,
        onTrialExtend,
        onTrialCancel,
        onTrialApplyPromo,
        showEngagementMetrics,
        compactMode,
        theme.theme.colors.primary,
      ]
    );

    // Key extractor
    const keyExtractor = useCallback((item: Trial) => item.id, []);

    if (loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator
            size="large"
            color={theme.theme.colors.primary}
          />
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

    if (processedTrials.length === 0) {
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
        {/* Stats Container */}
        {showStats && (
          <View style={[styles.statsContainer, { backgroundColor: theme.theme.colors.card }]}>
            {/* Status Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    { color: theme.theme.colors.primary },
                  ]}
                >
                  {stats.total}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.theme.colors.textSecondary },
                  ]}
                >
                  Total
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: '#4CAF50' }]}
                >
                  {stats.active}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.theme.colors.textSecondary },
                  ]}
                >
                  Active
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: '#2196F3' }]}
                >
                  {stats.converted}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.theme.colors.textSecondary },
                  ]}
                >
                  Converted
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: '#FF9800' }]}
                >
                  {stats.expiringIn3Days}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.theme.colors.textSecondary },
                  ]}
                >
                  Expiring
                </Text>
              </View>
            </View>

            {/* Metrics Stats (if engagement metrics enabled) */}
            {showEngagementMetrics && (
              <View style={[styles.statsRow, { borderTopWidth: 1, borderTopColor: 'rgba(0, 0, 0, 0.1)', marginTop: 12, paddingTop: 12 }]}>
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: theme.theme.colors.primary },
                    ]}
                  >
                    {analytics.avgEngagement}%
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.theme.colors.textSecondary },
                    ]}
                  >
                    Avg Engagement
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text
                    style={[styles.statValue, { color: '#4CAF50' }]}
                  >
                    {analytics.avgConversion}%
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.theme.colors.textSecondary },
                    ]}
                  >
                    Avg Conversion
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text
                    style={[styles.statValue, { color: '#F44336' }]}
                  >
                    {analytics.avgChurnRisk}%
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.theme.colors.textSecondary },
                    ]}
                  >
                    Avg Churn Risk
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text
                    style={[styles.statValue, { color: '#FF9800' }]}
                  >
                    {stats.cancelled}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.theme.colors.textSecondary },
                    ]}
                  >
                    Cancelled
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* List */}
        <FlatList
          ref={flatListRef}
          data={processedTrials}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onRefresh={onRefresh}
          refreshing={refreshing}
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

TrialList.displayName = 'TrialList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  itemContainer: {
    marginBottom: 0,
  },
  selectedItem: {
    opacity: 0.8,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  statsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    marginHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    fontSize: 11,
    fontWeight: '500',
  },
});

export default TrialList;
