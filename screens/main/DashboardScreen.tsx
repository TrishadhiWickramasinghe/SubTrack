import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import Animated, {
  FadeInDown,
  FadeInUp
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useCurrency } from '@context/CurrencyContext';
import { useTheme } from '@context/ThemeContext';
import { useAnalytics } from '@hooks/useAnalytics';
import { useNotifications } from '@hooks/useNotifications';
import { useSubscriptions } from '@hooks/useSubscriptions';
import { MainStackParamList } from '@navigation/types';

// Components
import InsightCard from '@components/analytics/InsightCard';
import EmptyState from '@components/common/EmptyState';
import LoadingSkeleton from '@components/common/LoadingSkeleton';
import CategoryBreakdown from '@components/dashboard/CategoryBreakdown';
import QuickStats from '@components/dashboard/QuickStats';
import StatCard from '@components/dashboard/StatCard';
import UpcomingPayments from '@components/dashboard/UpcomingPayments';

const { width } = Dimensions.get('window');

type DashboardScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Dashboard'>;

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { currency, formatAmount } = useCurrency();
  const { subscriptions, loading: subsLoading, refreshSubscriptions } = useSubscriptions();
  const { 
    summary, 
    categoryBreakdown, 
    insights, 
    monthlyTrend,
    loading: analyticsLoading,
    refreshAnalytics,
    valueScores,
    unusualCharges,
  } = useAnalytics();
  const { hasPermission, requestPermission } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedChart, setSelectedChart] = useState<'pie' | 'bar'>('pie');
  const [showAllInsights, setShowAllInsights] = useState(false);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshSubscriptions(),
      refreshAnalytics(),
    ]);
    setRefreshing(false);
  }, [refreshSubscriptions, refreshAnalytics]);

  // Check notification permission on mount
  useEffect(() => {
    const checkNotificationPermission = async () => {
      const permitted = await hasPermission();
      if (!permitted) {
        // Optionally show a prompt to enable notifications
      }
    };
    checkNotificationPermission();
  }, [hasPermission]);

  // Memoized data for charts
  const pieData = useMemo(() => {
    if (!categoryBreakdown.length) return [];
    
    return categoryBreakdown.map(cat => ({
      value: cat.totalSpent,
      label: cat.categoryName,
      color: cat.categoryColor,
      text: `${cat.percentage}%`,
      focused: true,
    }));
  }, [categoryBreakdown]);

  const barData = useMemo(() => {
    if (!monthlyTrend.length) return [];
    
    return monthlyTrend.map(item => ({
      value: item.total,
      label: item.month.split(' ')[0], // Just show month name
      frontColor: theme.colors.primary,
      topLabelComponent: () => (
        <Text style={[styles.barLabel, { color: theme.colors.text }]}>
          {formatAmount(item.total)}
        </Text>
      ),
    }));
  }, [monthlyTrend, theme, formatAmount]);

  // Check if we have any subscriptions
  const hasSubscriptions = subscriptions.length > 0;
  const isLoading = subsLoading || analyticsLoading;

  // Render loading state
  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <LoadingSkeleton width={200} height={32} style={styles.headerSkeleton} />
            <LoadingSkeleton width={100} height={40} style={styles.currencySkeleton} />
          </View>
          
          <View style={styles.statsRow}>
            <LoadingSkeleton width={width / 2 - 24} height={100} style={styles.statSkeleton} />
            <LoadingSkeleton width={width / 2 - 24} height={100} style={styles.statSkeleton} />
          </View>
          
          <LoadingSkeleton width={width - 32} height={200} style={styles.chartSkeleton} />
          <LoadingSkeleton width={width - 32} height={150} style={styles.listSkeleton} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.duration(500)}
          style={styles.header}
        >
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              SubTrack Dashboard
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.currencyButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('Settings', { screen: 'Currency' })}
          >
            <Text style={[styles.currencyText, { color: theme.colors.primary }]}>
              {currency.code}
            </Text>
            <Icon name="chevron-down" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {!hasSubscriptions ? (
          <Animated.View entering={FadeInUp.duration(500)}>
            <EmptyState
              icon="wallet-membership"
              title="No Subscriptions Yet"
              message="Start tracking your subscriptions to see insights and analytics here."
              actionLabel="Add Subscription"
              onAction={() => navigation.navigate('AddSubscription')}
            />
          </Animated.View>
        ) : (
          <>
            {/* Stats Cards */}
            <Animated.View 
              entering={FadeInUp.duration(500).delay(100)}
              style={styles.statsRow}
            >
              <StatCard
                label="Monthly Total"
                value={summary.totalMonthly}
                format={formatAmount}
                icon="calendar-month"
                color={theme.colors.primary}
                trend={monthlyTrend.length > 1 ? {
                  value: ((monthlyTrend[monthlyTrend.length - 1].total - monthlyTrend[0].total) / monthlyTrend[0].total) * 100,
                  direction: monthlyTrend[monthlyTrend.length - 1].total > monthlyTrend[0].total ? 'up' : 'down',
                } : undefined}
              />
              
              <StatCard
                label="Yearly Total"
                value={summary.totalYearly}
                format={formatAmount}
                icon="calendar"
                color={theme.colors.secondary}
              />
            </Animated.View>

            {/* Quick Stats */}
            <Animated.View entering={FadeInUp.duration(500).delay(150)}>
              <QuickStats
                activeCount={summary.activeSubscriptionsCount}
                pausedCount={summary.pausedSubscriptionsCount}
                averageCost={summary.averagePerSubscription}
                formatAmount={formatAmount}
              />
            </Animated.View>

            {/* Chart Toggle */}
            <Animated.View 
              entering={FadeInUp.duration(500).delay(200)}
              style={styles.chartToggle}
            >
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedChart === 'pie' && styles.toggleButtonActive,
                  { backgroundColor: selectedChart === 'pie' ? theme.colors.primary : theme.colors.surface },
                ]}
                onPress={() => setSelectedChart('pie')}
              >
                <Icon 
                  name="chart-pie" 
                  size={20} 
                  color={selectedChart === 'pie' ? '#fff' : theme.colors.text} 
                />
                <Text style={[
                  styles.toggleText,
                  { color: selectedChart === 'pie' ? '#fff' : theme.colors.text }
                ]}>
                  Categories
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedChart === 'bar' && styles.toggleButtonActive,
                  { backgroundColor: selectedChart === 'bar' ? theme.colors.primary : theme.colors.surface },
                ]}
                onPress={() => setSelectedChart('bar')}
              >
                <Icon 
                  name="chart-bar" 
                  size={20} 
                  color={selectedChart === 'bar' ? '#fff' : theme.colors.text} 
                />
                <Text style={[
                  styles.toggleText,
                  { color: selectedChart === 'bar' ? '#fff' : theme.colors.text }
                ]}>
                  Trends
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Chart */}
            <Animated.View 
              entering={FadeInUp.duration(500).delay(250)}
              style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}
            >
              {selectedChart === 'pie' ? (
                pieData.length > 0 ? (
                  <View>
                    <PieChart
                      data={pieData}
                      donut
                      showGradient
                      sectionAutoFocus
                      radius={120}
                      innerRadius={60}
                      innerCircleColor={theme.colors.surface}
                      centerLabelComponent={() => (
                        <View style={styles.centerLabel}>
                          <Text style={[styles.centerLabelValue, { color: theme.colors.text }]}>
                            {formatAmount(summary.totalMonthly)}
                          </Text>
                          <Text style={[styles.centerLabelLabel, { color: theme.colors.textSecondary }]}>
                            Monthly
                          </Text>
                        </View>
                      )}
                    />
                    
                    <View style={styles.legendContainer}>
                      {categoryBreakdown.slice(0, 5).map((cat, index) => (
                        <View key={cat.categoryId} style={styles.legendItem}>
                          <View style={[styles.legendColor, { backgroundColor: cat.categoryColor }]} />
                          <Text style={[styles.legendText, { color: theme.colors.text }]}>
                            {cat.categoryName}: {cat.percentage}%
                          </Text>
                        </View>
                      ))}
                      {categoryBreakdown.length > 5 && (
                        <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
                          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                            +{categoryBreakdown.length - 5} more
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ) : (
                  <EmptyState
                    icon="chart-pie"
                    title="No Data"
                    message="Add subscriptions to see category breakdown"
                    compact
                  />
                )
              ) : (
                barData.length > 0 ? (
                  <BarChart
                    data={barData}
                    width={width - 64}
                    height={200}
                    barWidth={30}
                    spacing={10}
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisThickness={1}
                    yAxisThickness={1}
                    xAxisColor={theme.colors.border}
                    yAxisColor={theme.colors.border}
                    yAxisTextStyle={{ color: theme.colors.textSecondary }}
                    xAxisLabelTextStyle={{ color: theme.colors.textSecondary }}
                    noOfSections={4}
                    maxValue={Math.max(...barData.map(d => d.value)) * 1.2}
                  />
                ) : (
                  <EmptyState
                    icon="chart-bar"
                    title="No Trend Data"
                    message="Not enough data to show trends"
                    compact
                  />
                )
              )}
            </Animated.View>

            {/* Upcoming Payments */}
            <Animated.View entering={FadeInUp.duration(500).delay(300)}>
              <UpcomingPayments
                subscriptions={subscriptions}
                onViewAll={() => navigation.navigate('Subscriptions')}
                formatAmount={formatAmount}
              />
            </Animated.View>

            {/* Insights Section */}
            {insights.length > 0 && (
              <Animated.View 
                entering={FadeInUp.duration(500).delay(350)}
                style={styles.insightsSection}
              >
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Insights
                  </Text>
                  {insights.length > 3 && (
                    <TouchableOpacity onPress={() => setShowAllInsights(!showAllInsights)}>
                      <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                        {showAllInsights ? 'Show Less' : 'See All'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {(showAllInsights ? insights : insights.slice(0, 3)).map((insight, index) => (
                  <InsightCard
                    key={`insight-${index}`}
                    insight={insight}
                    onAction={insight.action ? () => {
                      if (insight.action === 'Review duplicates') {
                        navigation.navigate('Analytics', { tab: 'duplicates' });
                      } else if (insight.action === 'Review unused') {
                        navigation.navigate('Analytics', { tab: 'unused' });
                      } else if (insight.action === 'Set category budget') {
                        navigation.navigate('Budget');
                      }
                    } : undefined}
                  />
                ))}
              </Animated.View>
            )}

            {/* Unusual Charges Alert */}
            {unusualCharges.length > 0 && (
              <Animated.View 
                entering={FadeInUp.duration(500).delay(400)}
                style={[styles.alertCard, { backgroundColor: theme.colors.warning + '20' }]}
              >
                <View style={styles.alertHeader}>
                  <Icon name="alert-circle" size={24} color={theme.colors.warning} />
                  <Text style={[styles.alertTitle, { color: theme.colors.text }]}>
                    Unusual Charges Detected
                  </Text>
                </View>
                <Text style={[styles.alertMessage, { color: theme.colors.textSecondary }]}>
                  We found {unusualCharges.length} unusual charge{unusualCharges.length > 1 ? 's' : ''} in your recent payments.
                </Text>
                <TouchableOpacity
                  style={[styles.alertButton, { backgroundColor: theme.colors.warning }]}
                  onPress={() => navigation.navigate('Analytics', { tab: 'unusual' })}
                >
                  <Text style={styles.alertButtonText}>Review Now</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Category Breakdown Details */}
            <Animated.View entering={FadeInUp.duration(500).delay(450)}>
              <CategoryBreakdown
                categories={categoryBreakdown}
                formatAmount={formatAmount}
                onCategoryPress={(categoryId) => 
                  navigation.navigate('Analytics', { categoryId })
                }
              />
            </Animated.View>
          </>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Button */}
      {hasSubscriptions && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('AddSubscription')}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  chartToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  toggleButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerLabelValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  centerLabelLabel: {
    fontSize: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
  barLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  insightsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  alertCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 14,
    marginBottom: 12,
  },
  alertButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomPadding: {
    height: 80,
  },
  // Skeleton styles
  headerSkeleton: {
    marginBottom: 8,
  },
  currencySkeleton: {
    borderRadius: 20,
  },
  statSkeleton: {
    borderRadius: 16,
  },
  chartSkeleton: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  listSkeleton: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
});

export default DashboardScreen;