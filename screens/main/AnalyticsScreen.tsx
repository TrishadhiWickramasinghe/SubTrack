import CategoryAnalysis from '@components/analytics/CategoryAnalysis';
import InsightCard from '@components/analytics/InsightCard';
import RecommendationCard from '@components/analytics/RecommendationCard';
import SpendingTrends from '@components/analytics/SpendingTrends';
import Card from '@components/common/Card';
import LoadingSkeleton from '@components/common/LoadingSkeleton';
import TabBar from '@components/common/TabBar';
import BarChart from '@components/dashboard/BarChart';
import LineChart from '@components/dashboard/LineChart';
import MonthlyComparison from '@components/dashboard/MonthlyComparison';
import PieChart from '@components/dashboard/PieChart';
import StatCard from '@components/dashboard/StatCard';
import { useTheme } from '@context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAnalytics } from '@hooks/useAnalytics';
import { useCurrency } from '@hooks/useCurrency';
import { useSubscriptions } from '@hooks/useSubscriptions';
import { useFocusEffect } from '@react-navigation/native';
import { formatPercentage } from '@utils/currencyHelpers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Animated,
    Dimensions,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import styles from './AnalyticsScreen.styles';

const { width } = Dimensions.get('window');

const TIME_PERIODS = [
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'Last 3 Months' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
];

const CHART_TYPES = [
  { id: 'bar', label: 'Bar Chart', icon: 'bar-chart' },
  { id: 'line', label: 'Line Chart', icon: 'trending-up' },
  { id: 'pie', label: 'Pie Chart', icon: 'pie-chart' },
];

export default function AnalyticsScreen() {
  const { theme, colors } = useTheme();
  const { formatAmount } = useCurrency();
  const { subscriptions, loading, refreshSubscriptions } = useSubscriptions();
  const {
    getMonthlySpending,
    getCategorySpending,
    getSpendingTrends,
    getYearlyComparison,
    getInsights,
    getRecommendations,
    generateReport,
  } = useAnalytics();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const [insights, setInsights] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAnalyticsData();
    }, [selectedPeriod, subscriptions])
  );

  const loadAnalyticsData = async () => {
    if (subscriptions.length === 0) return;

    const months = selectedPeriod === 'month' ? 1 : selectedPeriod === 'quarter' ? 3 : 12;
    
    const monthlySpending = getMonthlySpending(months);
    const categorySpending = getCategorySpending();
    const spendingTrends = getSpendingTrends(months);
    const analyticsInsights = getInsights(selectedPeriod);
    
    setMonthlyData(monthlySpending);
    setCategoryData(categorySpending);
    setTrendData(spendingTrends);
    setInsights(analyticsInsights);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshSubscriptions();
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const getPeriodData = () => {
    switch (selectedPeriod) {
      case 'month':
        return monthlyData.slice(-1);
      case 'quarter':
        return monthlyData.slice(-3);
      case 'year':
        return monthlyData.slice(-12);
      default:
        return monthlyData;
    }
  };

  const totalSpending = useMemo(() => {
    return getPeriodData().reduce((total, month) => total + month.value, 0);
  }, [monthlyData, selectedPeriod]);

  const averageSpending = useMemo(() => {
    const data = getPeriodData();
    return data.length > 0 ? totalSpending / data.length : 0;
  }, [totalSpending, selectedPeriod]);

  const topCategory = useMemo(() => {
    if (categoryData.length === 0) return null;
    return categoryData.reduce((prev, current) => 
      prev.value > current.value ? prev : current
    );
  }, [categoryData]);

  const spendingChange = useMemo(() => {
    if (monthlyData.length < 2) return 0;
    const current = monthlyData[monthlyData.length - 1]?.value || 0;
    const previous = monthlyData[monthlyData.length - 2]?.value || 0;
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  }, [monthlyData]);

  const handleExportReport = async () => {
    const report = await generateReport(selectedPeriod);
    // Share or save the report
  };

  const renderChart = () => {
    const chartData = getPeriodData();
    
    switch (selectedChartType) {
      case 'bar':
        return (
          <BarChart
            data={chartData}
            title={`Spending (${selectedPeriod === 'month' ? 'Monthly' : selectedPeriod === 'quarter' ? 'Quarterly' : 'Yearly'})`}
            currency="USD"
            height={250}
            showValues
            animated
          />
        );
      case 'line':
        return (
          <LineChart
            data={trendData}
            title="Spending Trends"
            currency="USD"
            height={250}
            showGrid
            animated
          />
        );
      case 'pie':
        return (
          <PieChart
            data={categoryData.slice(0, 8)}
            title="Category Distribution"
            height={250}
            showLegend
            showPercentage
          />
        );
      default:
        return null;
    }
  };

  if (loading && !refreshing && subscriptions.length === 0) {
    return <LoadingSkeleton type="analytics" />;
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
              <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Deep insights into your spending
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.exportButton, { backgroundColor: colors.card }]}
              onPress={handleExportReport}>
              <Ionicons name="share-outline" size={20} color={colors.primary} />
              <Text style={[styles.exportText, { color: colors.primary }]}>Export</Text>
            </TouchableOpacity>
          </View>

          {/* Time Period Tabs */}
          <TabBar
            tabs={TIME_PERIODS}
            activeTab={selectedPeriod}
            onTabPress={setSelectedPeriod}
            style={styles.periodTabs}
            scrollable
          />

          {/* Summary Stats */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Spent"
              value={formatAmount(totalSpending)}
              icon="cash-outline"
              color="#4CAF50"
              subtitle={`Over ${getPeriodData().length} ${selectedPeriod === 'month' ? 'month' : selectedPeriod === 'quarter' ? 'months' : 'months'}`}
            />
            <StatCard
              title="Average/Month"
              value={formatAmount(averageSpending)}
              icon="calculator-outline"
              color="#2196F3"
              subtitle="Monthly average"
            />
            <StatCard
              title="Top Category"
              value={topCategory?.label || 'N/A'}
              icon="pricetag-outline"
              color="#9C27B0"
              subtitle={topCategory ? formatAmount(topCategory.value) : 'No data'}
            />
            <StatCard
              title="Change"
              value={`${spendingChange >= 0 ? '+' : ''}${formatPercentage(spendingChange)}`}
              icon={spendingChange >= 0 ? 'trending-up' : 'trending-down'}
              color={spendingChange >= 0 ? '#4CAF50' : '#F44336'}
              subtitle="vs last period"
              showTrend
            />
          </View>

          {/* Chart Section */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>
                Visualize Your Spending
              </Text>
              <View style={styles.chartTypeSelector}>
                {CHART_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.chartTypeButton,
                      selectedChartType === type.id && {
                        backgroundColor: colors.primary + '20',
                      },
                    ]}
                    onPress={() => setSelectedChartType(type.id)}>
                    <Ionicons
                      name={type.icon as any}
                      size={18}
                      color={selectedChartType === type.id ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.chartTypeText,
                        {
                          color: selectedChartType === type.id ? colors.primary : colors.textSecondary,
                        },
                      ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {renderChart()}
          </Card>

          {/* Category Analysis */}
          <CategoryAnalysis
            data={categoryData}
            currency="USD"
            expandedCategory={expandedCategory}
            onCategoryPress={setExpandedCategory}
            onCategoryLongPress={(category) => {
              // Navigate to category details
            }}
          />

          {/* Monthly Comparison */}
          <MonthlyComparison
            currentMonth={monthlyData[monthlyData.length - 1]?.value || 0}
            previousMonth={monthlyData[monthlyData.length - 2]?.value || 0}
            currency="USD"
          />

          {/* Spending Trends */}
          <SpendingTrends
            data={trendData}
            currency="USD"
            period={selectedPeriod}
          />

          {/* AI Insights */}
          {insights && (
            <View style={styles.insightsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Smart Insights
              </Text>
              
              <InsightCard
                insights={insights}
                period={selectedPeriod}
              />

              {/* Recommendations */}
              {insights.recommendations?.length > 0 && (
                <>
                  <Text style={[styles.recommendationsTitle, { color: colors.text }]}>
                    Recommendations
                  </Text>
                  {insights.recommendations.slice(0, 3).map((rec: any, index: number) => (
                    <RecommendationCard
                      key={index}
                      recommendation={rec}
                      onApply={() => {
                        // Apply recommendation
                      }}
                    />
                  ))}
                </>
              )}
            </View>
          )}

          {/* Empty State */}
          {subscriptions.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="analytics-outline" size={80} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Analytics Yet
              </Text>
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                Add subscriptions to unlock powerful insights
              </Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => {/* Navigate to add subscription */}}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add First Subscription</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}