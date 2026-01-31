import EmptyState from '@components/common/EmptyState';
import LoadingSkeleton from '@components/common/LoadingSkeleton';
import BudgetProgress from '@components/dashboard/BudgetProgress';
import CategoryBreakdown from '@components/dashboard/CategoryBreakdown';
import PieChart from '@components/dashboard/PieChart';
import QuickStats from '@components/dashboard/QuickStats';
import SpendingChart from '@components/dashboard/SpendingChart';
import StatCard from '@components/dashboard/StatCard';
import UpcomingPayments from '@components/dashboard/UpcomingPayments';
import { useTheme } from '@context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAnalytics } from '@hooks/useAnalytics';
import { useCurrency } from '@hooks/useCurrency';
import { useNotifications } from '@hooks/useNotifications';
import { useSubscriptions } from '@hooks/useSubscriptions';
import { useFocusEffect } from '@react-navigation/native';
import { calculateMonthlyTotal, formatCurrency } from '@utils/currencyHelpers';
import { getGreeting } from '@utils/dateHelpers';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Animated,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import styles from './DashboardScreen.styles';

export default function DashboardScreen() {
  const { theme, colors } = useTheme();
  const { formatAmount } = useCurrency();
  const { subscriptions, loading, refreshSubscriptions } = useSubscriptions();
  const { getMonthlyInsights, getCategorySpending } = useAnalytics();
  const { upcomingPayments } = useNotifications();
  
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [subscriptions])
  );

  const loadDashboardData = async () => {
    if (subscriptions.length > 0) {
      const monthlyInsights = getMonthlyInsights();
      const categorySpending = getCategorySpending();
      setInsights(monthlyInsights);
      setCategoryData(categorySpending);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshSubscriptions();
    await loadDashboardData();
    setRefreshing(false);
  };

  const monthlyTotal = calculateMonthlyTotal(subscriptions);
  const yearlyTotal = monthlyTotal * 12;
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const upcomingCount = upcomingPayments.slice(0, 7).length;

  const getSavingsText = () => {
    if (!insights) return '';
    const { potentialSavings } = insights;
    if (potentialSavings > 0) {
      return `Potential savings: ${formatCurrency(potentialSavings, 'USD')}`;
    }
    return 'Great job managing subscriptions!';
  };

  if (loading && !refreshing) {
    return <LoadingSkeleton type="dashboard" />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
              <Text style={[styles.title, { color: colors.text }]}>Your Dashboard</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Quick Stats Row */}
          <QuickStats
            monthlyTotal={monthlyTotal}
            activeCount={activeSubscriptions.length}
            upcomingCount={upcomingCount}
            currency="USD"
          />

          {/* Main Stats */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Monthly Total"
              value={formatAmount(monthlyTotal)}
              icon="cash-outline"
              color="#4CAF50"
              trend={insights?.monthlyTrend}
              subtitle="Spent this month"
            />
            <StatCard
              title="Yearly Total"
              value={formatAmount(yearlyTotal)}
              icon="calendar-outline"
              color="#2196F3"
              trend={insights?.yearlyTrend}
              subtitle="Projected annual cost"
            />
            <StatCard
              title="Active Subscriptions"
              value={activeSubscriptions.length.toString()}
              icon="list-outline"
              color="#9C27B0"
              subtitle={`${upcomingCount} upcoming payments`}
            />
            <StatCard
              title="Average Cost"
              value={formatAmount(activeSubscriptions.length > 0 ? monthlyTotal / activeSubscriptions.length : 0)}
              icon="pricetag-outline"
              color="#FF9800"
              subtitle="Per subscription"
            />
          </View>

          {/* Budget Progress */}
          <BudgetProgress
            currentSpending={monthlyTotal}
            monthlyBudget={insights?.budget || 500}
            currency="USD"
          />

          {/* Charts Section */}
          <View style={styles.chartsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending Overview</Text>
            
            <View style={styles.chartRow}>
              <SpendingChart
                data={insights?.monthlyData || []}
                currency="USD"
                height={200}
              />
            </View>
            
            <View style={styles.chartRow}>
              <PieChart
                data={categoryData}
                title="Category Breakdown"
                height={250}
              />
            </View>
          </View>

          {/* Upcoming Payments */}
          <UpcomingPayments
            payments={upcomingPayments.slice(0, 5)}
            currency="USD"
            onViewAll={() => {/* Navigate to payments screen */}}
          />

          {/* Category Breakdown */}
          <CategoryBreakdown
            data={categoryData.slice(0, 6)}
            currency="USD"
            onCategoryPress={(category) => {/* Navigate to category details */}}
          />

          {/* Insights & Recommendations */}
          {insights?.recommendations?.length > 0 && (
            <View style={[styles.insightsCard, { backgroundColor: colors.card }]}>
              <View style={styles.insightsHeader}>
                <Ionicons name="bulb-outline" size={20} color="#FFD700" />
                <Text style={[styles.insightsTitle, { color: colors.text }]}>
                  Smart Insights
                </Text>
              </View>
              {insights.recommendations.slice(0, 2).map((rec: any, index: number) => (
                <View key={index} style={styles.insightItem}>
                  <Ionicons
                    name={rec.type === 'savings' ? 'trending-down' : 'alert-circle'}
                    size={16}
                    color={rec.type === 'savings' ? '#4CAF50' : '#FF9800'}
                  />
                  <Text style={[styles.insightText, { color: colors.textSecondary }]}>
                    {rec.message}
                  </Text>
                </View>
              ))}
              <Text style={[styles.savingsText, { color: '#4CAF50' }]}>
                {getSavingsText()}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Empty State */}
        {subscriptions.length === 0 && !loading && (
          <EmptyState
            icon="add-circle-outline"
            title="No Subscriptions Yet"
            message="Add your first subscription to see your dashboard come alive!"
            buttonText="Add Subscription"
            onPress={() => {/* Navigate to add subscription */}}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}