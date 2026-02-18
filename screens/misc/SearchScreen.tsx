import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    LinearTransition
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import EmptyState from '@components/common/EmptyState';
import SearchBar from '@components/common/SearchBar';
import { useTheme } from '@context/ThemeContext';
import { useCurrency } from '@hooks/useCurrency';
import { useSubscriptions } from '@hooks/useSubscriptions';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

interface SearchResult {
  id: string;
  type: 'subscription' | 'category';
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  metadata?: any;
}

interface SearchFilter {
  type: 'all' | 'subscriptions' | 'categories';
  status: 'all' | 'active' | 'paused' | 'cancelled';
  priceRange: 'all' | 'under10' | '10to50' | 'over50';
}

const SearchScreen: React.FC = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const { subscriptions } = useSubscriptions();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>({
    type: 'all',
    status: 'all',
    priceRange: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Netflix',
    'Spotify',
    'Cloud Storage',
    'Design Tools',
  ]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchSection: {
      marginBottom: 16,
    },
    filterSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    filterChips: {
      flexDirection: 'row',
      gap: 8,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    filterChipActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    filterChipText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text,
    },
    filterChipTextActive: {
      color: '#ffffff',
    },
    filterButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    resultSection: {
      marginVertical: 20,
    },
    resultSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.lightText,
      marginBottom: 12,
      paddingHorizontal: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultIcon: {
      width: 44,
      height: 44,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    resultIconText: {
      fontSize: 22,
    },
    resultContent: {
      flex: 1,
    },
    resultTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    resultSubtitle: {
      fontSize: 12,
      color: colors.lightText,
    },
    resultMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    resultBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: colors.accent + '20',
    },
    resultBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.accent,
    },
    recentSection: {
      marginVertical: 24,
    },
    recentTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    recentItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    recentItemText: {
      fontSize: 14,
      color: colors.text,
    },
    recentClearButton: {
      padding: 6,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 40,
    },
    statsCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.accent,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: colors.lightText,
    },
    filterModal: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 24,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.border,
    },
    filterModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterModalTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    filterGroup: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterGroupTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.lightText,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    filterOption: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    filterOptionActive: {
      backgroundColor: colors.accent + '20',
      borderColor: colors.accent,
    },
    filterOptionText: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '500',
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 30,
    },
  });

  // Calculate search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Filter subscriptions
    if (filters.type === 'all' || filters.type === 'subscriptions') {
      const filtered = subscriptions.filter((sub) => {
        const matchesQuery =
          sub.name.toLowerCase().includes(query) ||
          sub.category?.toLowerCase().includes(query);
        const matchesStatus =
          filters.status === 'all' || sub.status === filters.status;
        const matchesPrice =
          filters.priceRange === 'all' ||
          (filters.priceRange === 'under10' && sub.amount < 10) ||
          (filters.priceRange === '10to50' &&
            sub.amount >= 10 &&
            sub.amount <= 50) ||
          (filters.priceRange === 'over50' && sub.amount > 50);

        return matchesQuery && matchesStatus && matchesPrice;
      });

      results.push(
        ...filtered.map((sub) => ({
          id: sub.id,
          type: 'subscription' as const,
          title: sub.name,
          subtitle: `${sub.category} • Renews ${sub.billingCycle}`,
          icon: 'package-variant-closed',
          color: colors.accent,
          metadata: {
            amount: sub.amount,
            status: sub.status,
          },
        }))
      );
    }

    return results;
  }, [searchQuery, subscriptions, filters, colors.accent]);

  // Search statistics
  const searchStats = useMemo(() => ({
    totalMatches: searchResults.length,
    subscriptionMatches: searchResults.filter((r) => r.type === 'subscription')
      .length,
  }), [searchResults]);

  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleSearchSubmit = (text: string) => {
    if (text.trim() && !recentSearches.includes(text)) {
      setRecentSearches([text, ...recentSearches.slice(0, 3)]);
    }
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
  };

  const handleRemoveRecent = (item: string) => {
    setRecentSearches(recentSearches.filter((s) => s !== item));
  };

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'subscription') {
      router.push({
        pathname: '/(tabs)/subscriptions',
        params: { searchId: result.id },
      });
    }
  };

  const toggleFilter = (
    filterKey: keyof SearchFilter,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: prev[filterKey] === value ? (filterKey === 'type' ? 'all' : 'all') : value,
    }));
  };

  const ResultItem: React.FC<{ result: SearchResult; index: number }> = ({
    result,
    index,
  }) => (
    <AnimatedTouchable
      activeOpacity={0.7}
      onPress={() => handleResultPress(result)}
      entering={FadeInDown.delay(100 * index)}
      style={styles.resultItem}
    >
      <View
        style={[styles.resultIcon, { backgroundColor: colors.accent + '15' }]}
      >
        <Icon
          name={result.icon}
          size={22}
          color={result.color}
        />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{result.title}</Text>
        <View style={styles.resultMeta}>
          <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
        </View>
      </View>
      {result.metadata?.amount && (
        <View style={styles.resultBadge}>
          <Text style={styles.resultBadgeText}>
            {formatAmount(result.metadata.amount, result.metadata.currency || 'USD')}
          </Text>
        </View>
      )}
      <Icon name="chevron-right" size={20} color={colors.lightText} />
    </AnimatedTouchable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <AnimatedView entering={FadeIn} style={styles.header}>
        <View style={styles.searchSection}>
          <SearchBar
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChangeText={handleSearchQueryChange}
            onSubmitEditing={() => handleSearchSubmit(searchQuery)}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterSection}>
          <View style={styles.filterChips}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                toggleFilter('status', filters.status === 'active' ? 'all' : 'active')
              }
              style={[
                styles.filterChip,
                filters.status === 'active' && styles.filterChipActive,
              ]}
            >
              <Icon
                name="check-circle"
                size={14}
                color={
                  filters.status === 'active'
                    ? '#ffffff'
                    : colors.lightText
                }
              />
              <Text
                style={[
                  styles.filterChipText,
                  filters.status === 'active' && styles.filterChipTextActive,
                ]}
              >
                Active
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                toggleFilter('priceRange', filters.priceRange === 'under10' ? 'all' : 'under10')
              }
              style={[
                styles.filterChip,
                filters.priceRange === 'under10' && styles.filterChipActive,
              ]}
            >
              <Icon
                name="cash"
                size={14}
                color={
                  filters.priceRange === 'under10'
                    ? '#ffffff'
                    : colors.lightText
                }
              />
              <Text
                style={[
                  styles.filterChipText,
                  filters.priceRange === 'under10' &&
                  styles.filterChipTextActive,
                ]}
              >
                Under $10
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowFilters(!showFilters)}
            style={[styles.filterButton, showFilters && { backgroundColor: colors.accent + '15' }]}
          >
            <Icon
              name="tune-variant"
              size={20}
              color={showFilters ? colors.accent : colors.lightText}
            />
          </TouchableOpacity>
        </View>
      </AnimatedView>

      {/* Content */}
      <View style={styles.content}>
        {searchQuery.trim() ? (
          // Search Results
          <>
            {searchStats.totalMatches > 0 ? (
              <Animated.FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <ResultItem result={item} index={index} />
                )}
                scrollEventThrottle={16}
                itemLayoutAnimation={LinearTransition}
                ListHeaderComponent={
                  <AnimatedView entering={FadeIn} style={styles.resultSection}>
                    <Text style={styles.resultSectionTitle}>
                      Results ({searchStats.totalMatches})
                    </Text>
                  </AnimatedView>
                }
              />
            ) : (
              <AnimatedView
                entering={FadeIn}
                style={styles.emptyState}
              >
                <EmptyState
                  icon="magnify-close"
                  title="No Results Found"
                  message={`No subscriptions or categories match "${searchQuery}"`}
                />
              </AnimatedView>
            )}
          </>
        ) : (
          // Initial State with Recent Searches
          <FlatList
            data={[1]}
            keyExtractor={() => 'recent'}
            renderItem={() => (
              <>
                {/* Quick Stats */}
                <AnimatedView
                  entering={FadeInDown.delay(100)}
                  style={styles.recentSection}
                >
                  <Text style={styles.recentTitle}>Quick Stats</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <AnimatedView
                      entering={FadeInDown.delay(150)}
                      style={[styles.statsCard, { flex: 1 }]}
                    >
                      <Text style={styles.statNumber}>
                        {subscriptions.length}
                      </Text>
                      <Text style={styles.statLabel}>
                        Total Subscriptions
                      </Text>
                    </AnimatedView>
                    <AnimatedView
                      entering={FadeInDown.delay(200)}
                      style={[styles.statsCard, { flex: 1 }]}
                    >
                      <Text style={styles.statNumber}>
                        {subscriptions.filter(
                          (s) => s.status === 'active'
                        ).length}
                      </Text>
                      <Text style={styles.statLabel}>Active</Text>
                    </AnimatedView>
                  </View>
                </AnimatedView>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <AnimatedView
                    entering={FadeInDown.delay(250)}
                    style={styles.recentSection}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <Text style={styles.recentTitle}>Recent Searches</Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleClearRecent}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.accent,
                            fontWeight: '600',
                          }}
                        >
                          Clear All
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {recentSearches.map((search, index) => (
                      <AnimatedView
                        key={`recent-${index}`}
                        entering={FadeInDown.delay(300 + index * 50)}
                        style={styles.recentItem}
                      >
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setSearchQuery(search)}
                          style={{ flex: 1 }}
                        >
                          <Text style={styles.recentItemText}>
                            {search}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleRemoveRecent(search)}
                          style={styles.recentClearButton}
                        >
                          <Icon
                            name="close"
                            size={16}
                            color={colors.lightText}
                          />
                        </TouchableOpacity>
                      </AnimatedView>
                    ))}
                  </AnimatedView>
                )}
              </>
            )}
            scrollEventThrottle={16}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;
