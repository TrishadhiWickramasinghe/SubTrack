import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Platform,
    Text as RNText,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

// Components
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import Loading from '@components/common/Loading';
import { colors } from '@config/colors';
import { useCurrency } from '@hooks/useCurrency';
import { useSubscriptions } from '@hooks/useSubscriptions';

interface MonthlyOverviewProps {
  period?: '6m' | '12m' | 'ytd' | 'all';
  showChart?: boolean;
  showDetails?: boolean;
  compact?: boolean;
  onPeriodChange?: (period: string) => void;
  onMonthPress?: (month: Date, data: MonthData) => void;
  animation?: boolean;
}

interface MonthData {
  month: Date;
  total: number;
  count: number;
  average: number;
  highest: number;
  lowest: number;
  categories: Record<string, number>;
  trend: number;
  growth: number;
}

export const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({
  period = '6m',
  showChart = true,
  showDetails = true,
  compact = false,
  onPeriodChange,
  onMonthPress,
  animation = true,
}) => {
  const { subscriptions, monthlySpending, monthlyComparison } = useSubscriptions();
  const { formatAmount } = useCurrency();
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>(period);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [showAllMonths, setShowAllMonths] = useState<boolean>(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const screenWidth = Dimensions.get('window').width - 32;

  // Available periods
  const periods = useMemo(() => [
    { id: '6m', label: '6 Months', icon: 'calendar-month' },
    { id: '12m', label: '12 Months', icon: 'calendar-range' },
    { id: 'ytd', label: 'Year to Date', icon: 'calendar-today' },
    { id: 'all', label: 'All Time', icon: 'calendar' },
  ], []);

  // Load monthly data
  useEffect(() => {
    loadMonthlyData();
  }, [selectedPeriod, subscriptions]);

  const loadMonthlyData = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Create mock monthly data from subscriptions
      const data: MonthData[] = [];
      const now = new Date();
      const monthsToShow = selectedPeriod === '6m' ? 6 : selectedPeriod === '12m' ? 12 : 3;
      
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        data.push({
          month: monthDate,
          total: Math.random() * 100,
          count: Math.floor(Math.random() * 10) + 1,
          average: Math.random() * 50,
          highest: Math.random() * 80,
          lowest: Math.random() * 20,
          categories: {},
          trend: Math.random() - 0.5,
          growth: (Math.random() - 0.5) * 100,
        });
      }
      
      setMonthlyData(data);
      
      if (data.length > 0) {
        setSelectedMonth(data[data.length - 1]);
      }
      
      // Animate in
      if (animation) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error('Failed to load monthly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (periodId: string): void => {
    setSelectedPeriod(periodId);
    onPeriodChange?.(periodId);
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleMonthPress = (monthData: MonthData): void => {
    setSelectedMonth(monthData);
    onMonthPress?.(monthData.month, monthData);
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleChartTypeToggle = (): void => {
    setChartType(prev => prev === 'line' ? 'bar' : 'line');
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleShowAll = (): void => {
    setShowAllMonths(prev => !prev);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (monthlyData.length === 0) {
      return {
        totalSpent: 0,
        averageMonthly: 0,
        highestMonth: null as MonthData | null,
        lowestMonth: null as MonthData | null,
        totalGrowth: 0,
        monthlyChange: 0,
      };
    }

    const totalSpent = monthlyData.reduce((sum, month) => sum + month.total, 0);
    const averageMonthly = totalSpent / monthlyData.length;
    const highestMonth = [...monthlyData].sort((a, b) => b.total - a.total)[0];
    const lowestMonth = [...monthlyData].sort((a, b) => a.total - b.total)[0];
    
    // Calculate growth
    const firstMonth = monthlyData[0];
    const lastMonth = monthlyData[monthlyData.length - 1];
    const totalGrowth = firstMonth.total > 0 
      ? ((lastMonth.total - firstMonth.total) / firstMonth.total) * 100 
      : 0;
    
    // Monthly change
    const monthlyChange = monthlyData.length > 1 
      ? ((lastMonth.total - monthlyData[monthlyData.length - 2].total) / monthlyData[monthlyData.length - 2].total) * 100 
      : 0;

    return {
      totalSpent,
      averageMonthly,
      highestMonth,
      lowestMonth,
      totalGrowth,
      monthlyChange,
    };
  }, [monthlyData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const dataToShow = showAllMonths ? monthlyData : monthlyData.slice(-6);
    
    return {
      labels: dataToShow.map(month => 
        format(month.month, compact ? 'MMM' : 'MMM yy')
      ),
      datasets: [{
        data: dataToShow.map(month => month.total),
        color: (opacity = 1) => colors.primary[500],
        strokeWidth: 2,
      }],
    };
  }, [monthlyData, showAllMonths, compact]);

  // Chart configuration
  const chartConfig = useMemo(() => ({
    backgroundColor: colors.neutral[50],
    backgroundGradientFrom: colors.neutral[50],
    backgroundGradientTo: colors.neutral[50],
    decimalPlaces: 0,
    color: (opacity = 1) => colors.neutral[500],
    labelColor: (opacity = 1) => colors.neutral[500],
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary[500],
    },
    propsForBackgroundLines: {
      stroke: colors.neutral[200],
      strokeWidth: 1,
    },
  }), []);

  // Get top categories for selected month
  const topCategories = useMemo(() => {
    if (!selectedMonth) return [];
    
    return Object.entries(selectedMonth.categories || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / selectedMonth.total) * 100,
      }));
  }, [selectedMonth]);

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <Loading message="Loading monthly overview..." />
      </Card>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="chart-line" size={48} color={colors.neutral[500]} />
          <RNText style={styles.emptyTitle}>No Data Available</RNText>
          <RNText style={styles.emptyDescription}>
            Add subscriptions to see your monthly spending overview
          </RNText>
        </View>
      </Card>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={compact ? styles.compactCard : styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <RNText style={styles.title}>Monthly Overview</RNText>
            <RNText style={styles.subtitle}>
              {format(monthlyData[0]?.month || new Date(), 'MMM yyyy')} -{' '}
              {format(monthlyData[monthlyData.length - 1]?.month || new Date(), 'MMM yyyy')}
            </RNText>
          </View>
          
          <View style={styles.headerActions}>
            <Button
              title={chartType === 'line' ? 'Bar' : 'Line'}
              onPress={handleChartTypeToggle}
              variant="ghost"
              size="small"
              icon={chartType === 'line' ? 'chart-bar' : 'chart-line'}
            />
          </View>
        </View>

        {/* Period Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.periodSelector}
          contentContainerStyle={styles.periodSelectorContent}
        >
          {periods.map(period => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodButton,
                selectedPeriod === period.id && styles.periodButtonActive,
              ]}
              onPress={() => handlePeriodChange(period.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name={period.icon as any} 
                size={16} 
                color={selectedPeriod === period.id ? colors.primary[500] : colors.neutral[500]} 
              />
              <RNText style={[
                styles.periodButtonText,
                selectedPeriod === period.id && styles.periodButtonTextActive,
              ]}>
                {period.label}
              </RNText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chart */}
        {showChart && (
          <View style={styles.chartContainer}>
            <RNText style={{ fontSize: 14, color: colors.neutral[500], textAlign: 'center', padding: 32 }}>Chart visualization would go here</RNText>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <RNText style={styles.statLabel}>Total Spent</RNText>
            <RNText style={styles.statValue}>
              {formatAmount(stats.totalSpent)}
            </RNText>
          </View>
          
          <View style={styles.statItem}>
            <RNText style={styles.statLabel}>Monthly Avg</RNText>
            <RNText style={styles.statValue}>
              {formatAmount(stats.averageMonthly)}
            </RNText>
          </View>
          
          <View style={styles.statItem}>
            <RNText style={styles.statLabel}>Highest Month</RNText>
            <RNText style={styles.statValue}>
              {stats.highestMonth ? formatAmount(stats.highestMonth.total) : '-'}
            </RNText>
            <RNText style={styles.statSubtitle}>
              {stats.highestMonth ? format(stats.highestMonth.month, 'MMM yyyy') : ''}
            </RNText>
          </View>
        </View>

        {/* Month Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.monthSelector}
          contentContainerStyle={styles.monthSelectorContent}
        >
          {monthlyData.map((monthData, index) => (
            <TouchableOpacity
              key={format(monthData.month, 'yyyy-MM')}
              style={[
                styles.monthButton,
                selectedMonth?.month.getTime() === monthData.month.getTime() && styles.monthButtonActive,
              ]}
              onPress={() => handleMonthPress(monthData)}
              activeOpacity={0.7}
            >
              <RNText style={[
                styles.monthButtonText,
                selectedMonth?.month.getTime() === monthData.month.getTime() && styles.monthButtonTextActive,
              ]}>
                {format(monthData.month, 'MMM')}
              </RNText>
              <RNText style={styles.monthButtonYear}>
                {format(monthData.month, 'yy')}
              </RNText>
              <View style={styles.monthButtonAmount}>
                <RNText style={styles.monthButtonAmountText}>
                  {formatAmount(monthData.total)}
                </RNText>
              </View>
              {monthData.trend !== 0 && (
                <MaterialCommunityIcons 
                  name={monthData.trend > 0 ? 'trending-up' : 'trending-down'} 
                  size={12} 
                  color={monthData.trend > 0 ? colors.success[500] : colors.error[500]} 
                  style={styles.monthTrendIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected Month Details */}
        {showDetails && selectedMonth && (
          <View style={styles.monthDetails}>
            <View style={styles.monthDetailsHeader}>
              <RNText style={styles.monthDetailsTitle}>
                {format(selectedMonth.month, 'MMMM yyyy')}
              </RNText>
              <Badge
                text={`${selectedMonth.count} subscription${selectedMonth.count !== 1 ? 's' : ''}`}
                variant="outlined"
                size="small"
              />
            </View>
            
            <View style={styles.monthStats}>
              <View style={styles.monthStat}>
                <RNText style={styles.monthStatLabel}>Total</RNText>
                <RNText style={styles.monthStatValue}>
                  {formatAmount(selectedMonth.total)}
                </RNText>
              </View>
              
              <View style={styles.monthStat}>
                <RNText style={styles.monthStatLabel}>Average</RNText>
                <RNText style={styles.monthStatValue}>
                  {formatAmount(selectedMonth.average)}
                </RNText>
              </View>
              
              <View style={styles.monthStat}>
                <RNText style={styles.monthStatLabel}>Highest</RNText>
                <RNText style={styles.monthStatValue}>
                  {formatAmount(selectedMonth.highest)}
                </RNText>
              </View>
              
              <View style={styles.monthStat}>
                <RNText style={styles.monthStatLabel}>Growth</RNText>
                <RNText style={styles.monthStatValue}>
                  {selectedMonth.growth > 0 ? '+' : ''}{selectedMonth.growth.toFixed(1)}%
                </RNText>
              </View>
            </View>
            
            {/* Top Categories */}
            {topCategories.length > 0 && (
              <View style={styles.topCategories}>
                <RNText style={styles.topCategoriesTitle}>Top Categories</RNText>
                <View style={styles.categoriesList}>
                  {topCategories.map((cat) => (
                    <View key={cat.category} style={styles.categoryItem}>
                      <View style={styles.categoryHeader}>
                        <View style={styles.categoryIcon}>
                          <MaterialCommunityIcons 
                            name={getCategoryIcon(cat.category) as any} 
                            size={16} 
                            color={colors.neutral[900]} 
                          />
                        </View>
                        <RNText style={styles.categoryName}>
                          {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}
                        </RNText>
                        <RNText style={styles.categoryPercentage}>
                          {cat.percentage.toFixed(0)}%
                        </RNText>
                      </View>
                      <View style={styles.categoryBarContainer}>
                        <View 
                          style={[
                            styles.categoryBar,
                            { 
                              width: `${cat.percentage}%`,
                              backgroundColor: getCategoryColor(cat.category),
                            },
                          ]} 
                        />
                      </View>
                      <RNText style={styles.categoryAmount}>
                        {formatAmount(cat.amount)}
                      </RNText>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Show All Toggle */}
            {monthlyData.length > 6 && (
              <TouchableOpacity
                style={styles.showAllButton}
                onPress={toggleShowAll}
              >
                <MaterialCommunityIcons 
                  name={showAllMonths ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={colors.primary[500]} 
                />
                <RNText style={styles.showAllText}>
                  {showAllMonths ? 'Show Less' : `Show All ${monthlyData.length} Months`}
                </RNText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

// Helper functions
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    entertainment: 'filmstrip',
    utilities: 'home',
    productivity: 'briefcase',
    health: 'heart',
    education: 'school',
    other: 'folder',
  };
  return icons[category] || 'folder';
};

const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    entertainment: colors.primary[500],
    utilities: colors.info[500],
    productivity: colors.success[500],
    health: colors.error[500],
    education: colors.warning[500],
    other: colors.neutral[500],
  };
  return categoryColors[category] || colors.neutral[500];
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    padding: 16,
  },
  compactCard: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  periodSelector: {
    marginBottom: 16,
  },
  periodSelectorContent: {
    gap: 8,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.neutral[50],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  periodButtonActive: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  periodButtonText: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  periodButtonTextActive: {
    color: colors.primary[500],
    fontWeight: '500',
  },
  chartContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.neutral[50],
    padding: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.neutral[500],
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 11,
    color: colors.neutral[500],
  },
  monthSelector: {
    marginBottom: 16,
  },
  monthSelectorContent: {
    gap: 8,
  },
  monthButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    minWidth: 70,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  monthButtonActive: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[900],
  },
  monthButtonTextActive: {
    color: colors.primary[500],
  },
  monthButtonYear: {
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 2,
  },
  monthButtonAmount: {
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.neutral[100],
    borderRadius: 6,
  },
  monthButtonAmountText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  monthTrendIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  monthDetails: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: 16,
  },
  monthDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  monthStat: {
    flex: 1,
    alignItems: 'center',
  },
  monthStatLabel: {
    fontSize: 12,
    color: colors.neutral[500],
    marginBottom: 4,
  },
  monthStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  topCategories: {
    marginBottom: 16,
  },
  topCategoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 12,
  },
  categoriesList: {
    gap: 12,
  },
  categoryItem: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral[900],
  },
  categoryPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  categoryBarContainer: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    borderRadius: 3,
  },
  categoryAmount: {
    fontSize: 12,
    color: colors.neutral[500],
    textAlign: 'right',
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
  },
  showAllText: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});

export default MonthlyOverview;