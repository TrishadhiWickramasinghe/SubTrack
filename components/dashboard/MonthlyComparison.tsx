import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Components
import { Badge, Card, Divider, Loading, Text } from '@components/common';
import { colors } from '@config/colors';
import { useCurrency } from '@hooks/useCurrency';

interface MonthlyComparisonProps {
  months?: number;
  showYearOverYear?: boolean;
  showDetailed?: boolean;
  showTrends?: boolean;
  showForecast?: boolean;
  interactive?: boolean;
  compact?: boolean;
  onMonthSelect?: (month: MonthData) => void;
  onComparisonSelect?: (comparison: ComparisonData) => void;
}

interface MonthData {
  date: Date;
  label: string;
  amount: number;
  count: number;
  average: number;
  categories: Record<string, number>;
  previousAmount?: number;
  change?: number;
  changePercentage?: number;
  forecast?: boolean;
  confidence?: number;
  metadata?: Record<string, any>;
}

interface ComparisonData {
  period1: { start: Date; end: Date };
  period2: { start: Date; end: Date };
  period1Total: number;
  period2Total: number;
  difference: number;
  percentageChange: number;
  categories: Record<string, { period1: number; period2: number; change: number }>;
  insights: string[];
}

interface YearData {
  year: number;
  months: MonthData[];
  total: number;
  average: number;
  peak: MonthData;
  low: MonthData;
}

export const MonthlyComparison: React.FC<MonthlyComparisonProps> = ({
  months = 12,
  showYearOverYear = true,
  showDetailed = true,
  showTrends = true,
  showForecast = true,
  interactive = true,
  compact = false,
  onMonthSelect,
  onComparisonSelect,
}) => {
  const { formatAmount } = useCurrency();
  
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [yearOverYearData, setYearOverYearData] = useState<YearData[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '12m' | 'yoy' | 'custom'>('12m');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'grid'>('chart');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'grouped'>('bar');
  const [compareMode, setCompareMode] = useState<'sequential' | 'yearOverYear' | 'custom'>('sequential');
  const [selectedComparisonPeriod, setSelectedComparisonPeriod] = useState<'1m' | '3m' | '6m' | '12m'>('6m');
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [showForecastToggle, setShowForecastToggle] = useState(showForecast);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  const barAnimations = useRef<Animated.Value[]>([]);
  
  const screenWidth = Dimensions.get('window').width - 32;
  const chartWidth = screenWidth * 1.2;
  const chartHeight = compact ? 180 : 280;

  // Enable LayoutAnimation
  if (Platform.OS === 'android' && LayoutAnimation) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }

  // Load data
  useEffect(() => {
    loadData();
  }, [selectedPeriod, compareMode, months]);

  useEffect(() => {
    if (monthlyData.length > 0) {
      barAnimations.current = monthlyData.map(() => new Animated.Value(0));
      animateBars();
    }
  }, [monthlyData]);

  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Load monthly data
      const data = await Promise.resolve([]);
      setMonthlyData(data);
      
      // Load year over year data
      if (showYearOverYear) {
        const yoyData = await Promise.resolve([]);
        setYearOverYearData(yoyData);
      }
      
      // Load comparison data
      if (compareMode === 'custom') {
        const compData = await Promise.resolve([]);
        setComparisonData(compData);
        onComparisonSelect?.(compData);
      }
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start();
      
    } catch (error) {
      console.error('Failed to load monthly comparison data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const animateBars = (): void => {
    Animated.stagger(
      50,
      barAnimations.current.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        })
      )
    ).start();
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    if (monthlyData.length === 0) return null;
    
    const amounts = monthlyData.map(d => d.amount);
    const total = amounts.reduce((sum, amt) => sum + amt, 0);
    const average = total / amounts.length;
    const max = Math.max(...amounts);
    const min = Math.min(...amounts);
    const maxMonth = monthlyData[amounts.indexOf(max)];
    const minMonth = monthlyData[amounts.indexOf(min)];
    const latest = monthlyData[monthlyData.length - 1];
    const first = monthlyData[0];
    const change = ((latest.amount - first.amount) / first.amount) * 100;
    const volatility = calculateVolatility(amounts);
    const consistency = calculateConsistency(amounts);
    
    // Calculate trends
    const trend = calculateTrend(amounts);
    const forecast = calculateForecast(amounts);
    
    return {
      total,
      average,
      max,
      min,
      maxMonth,
      minMonth,
      latest,
      change,
      volatility,
      consistency,
      trend,
      forecast,
      dataPoints: monthlyData.length,
    };
  }, [monthlyData]);

  const calculateVolatility = (amounts: number[]): number => {
    if (amounts.length < 2) return 0;
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - avg, 2), 0) / amounts.length;
    return Math.sqrt(variance);
  };

  const calculateConsistency = (amounts: number[]): number => {
    if (amounts.length < 2) return 100;
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const deviations = amounts.map(amt => Math.abs(amt - avg) / avg);
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    return Math.max(0, 100 - avgDeviation * 100);
  };

  const calculateTrend = (amounts: number[]): { slope: number; direction: 'up' | 'down' | 'stable'; strength: 'strong' | 'moderate' | 'weak' } => {
    if (amounts.length < 2) return { slope: 0, direction: 'stable', strength: 'weak' };
    
    const x = amounts.map((_, i) => i);
    const n = amounts.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = amounts.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * amounts[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (slope > 1) direction = 'up';
    if (slope < -1) direction = 'down';
    
    let strength: 'strong' | 'moderate' | 'weak' = 'weak';
    if (Math.abs(slope) > 5) strength = 'strong';
    else if (Math.abs(slope) > 2) strength = 'moderate';
    
    return { slope, direction, strength };
  };

  const calculateForecast = (amounts: number[]): number => {
    if (amounts.length < 3) return amounts[amounts.length - 1] || 0;
    const trend = calculateTrend(amounts);
    const lastValue = amounts[amounts.length - 1];
    const forecast = lastValue + trend.slope;
    return Math.max(0, forecast);
  };

  const handleMonthPress = useCallback((month: MonthData) => {
    if (!interactive) return;
    
    setSelectedMonth(month);
    onMonthSelect?.(month);
    
    if (expandedMonth === month.label) {
      setExpandedMonth(null);
    } else {
      setExpandedMonth(month.label);
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [interactive, expandedMonth, onMonthSelect]);

  const handleCompareModeChange = useCallback((mode: 'sequential' | 'yearOverYear' | 'custom') => {
    setCompareMode(mode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePeriodChange = useCallback((period: '6m' | '12m' | 'yoy') => {
    setSelectedPeriod(period);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Chart data preparation
  const chartData = useMemo(() => {
    if (monthlyData.length === 0) return null;
    
    const displayData = selectedPeriod === 'yoy' 
      ? monthlyData.slice(-24) 
      : monthlyData.slice(-months);
    
    const barColors: string[] = displayData.map((month) => {
      if (month.forecast) return colors.info[500];
      if (month.change && month.change < 0) return colors.success[500];
      if (month.change && month.change > 0) return colors.error[500];
      return colors.primary[500];
    });
    
    return {
      labels: displayData.map(month => format(month.date, compact ? 'MMM' : 'MMM yy')),
      datasets: [
        {
          data: displayData.map(month => month.amount),
          colors: barColors.map(color => (opacity = 1) => color),
          strokeWidth: 2,
        },
      ],
      legend: ['Spending'],
    };
  }, [monthlyData, selectedPeriod, months, compact]);

  // Comparison data for grouped bars
  const groupedChartData = useMemo(() => {
    if (!comparisonData || viewMode !== 'chart' || chartType !== 'grouped') return null;
    
    const categories = Object.keys(comparisonData.categories).slice(0, 8);
    
    return {
      labels: categories.map(cat => cat.substring(0, 3)),
      datasets: [
        {
          data: categories.map(cat => comparisonData.categories[cat].period1),
          color: (opacity = 1) => colors.primary,
          label: 'Current Period',
        },
        {
          data: categories.map(cat => comparisonData.categories[cat].period2),
          color: (opacity = 1) => colors.info,
          label: 'Previous Period',
        },
      ],
    };
  }, [comparisonData, viewMode, chartType]);

  // Render monthly bar
  const renderMonthBar = useCallback((month: MonthData, index: number) => {
    const isSelected = selectedMonth?.label === month.label;
    const isExpanded = expandedMonth === month.label;
    const isForecast = month.forecast;
    const isPositive = month.change && month.change > 0;
    const isNegative = month.change && month.change < 0;
    
    const maxAmount = Math.max(...monthlyData.map(m => m.amount));
    const barHeight = (month.amount / maxAmount) * 100;
    const barColor = isForecast ? colors.info[500] : isPositive ? colors.error[500] : isNegative ? colors.success[500] : colors.primary[500];
    
    const animatedHeight = barAnimations.current[index]?.interpolate({
      inputRange: [0, 1],
      outputRange: [0, barHeight],
    }) || barHeight;
    
    return (
      <TouchableOpacity
        key={month.label}
        style={[
          styles.monthBarContainer,
          { width: `${100 / monthlyData.length}%` },
        ]}
        onPress={() => handleMonthPress(month)}
        activeOpacity={0.7}
      >
        <View style={styles.monthBarContent}>
          <Animated.View
            style={[
              styles.monthBar,
              {
                height: animatedHeight ? `${animatedHeight}%` : 0,
                backgroundColor: barColor,
              },
            ]}
          >
            {showDetailed && month.amount > maxAmount * 0.1 && (
              <Text style={styles.monthBarValue}>
                {formatAmount(month.amount)}
              </Text>
            )}
          </Animated.View>
        </View>
        
        <View style={styles.monthLabel}>
          <Text style={[
            styles.monthLabelText,
            isSelected && styles.monthLabelSelected,
            isForecast && styles.monthLabelForecast,
          ]}>
            {format(month.date, 'MMM')}
          </Text>
          {month.change && showTrends && (
            // <TrendIndicator
            //   value={month.changePercentage || 0}
            //   size="small"
            //   variant="compact"
            //   showLabel={false}
            //   showValue={false}
            // />
            null
          )}
        </View>
        
        {isExpanded && (
          <Animated.View style={styles.expandedMonthDetails}>
            <View style={styles.expandedRow}>
              <Text style={styles.expandedLabel}>Amount</Text>
              <Text style={styles.expandedValue}>
                {formatAmount(month.amount)}
              </Text>
            </View>
            <View style={styles.expandedRow}>
              <Text style={styles.expandedLabel}>Subscriptions</Text>
              <Text style={styles.expandedValue}>{month.count}</Text>
            </View>
            <View style={styles.expandedRow}>
              <Text style={styles.expandedLabel}>Average</Text>
              <Text style={styles.expandedValue}>
                {formatAmount(month.average)}
              </Text>
            </View>
            {month.change && (
              <View style={styles.expandedRow}>
                <Text style={styles.expandedLabel}>vs Previous</Text>
                <Text style={[
                  styles.expandedValue,
                  { color: month.change > 0 ? colors.error[500] : colors.success[500] },
                ]}>
                  {month.change > 0 ? '+' : ''}{month.changePercentage?.toFixed(1)}%
                </Text>
              </View>
            )}
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  }, [selectedMonth, expandedMonth, monthlyData, showDetailed, showTrends, handleMonthPress, formatAmount]);

  // Render table view
  const renderTableView = useCallback(() => {
    const displayData = monthlyData.slice(-12);
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>Month</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>Amount</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>Subs</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>Change</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>Trend</Text>
          </View>
          
          {displayData.map((month, i) => (
            <TouchableOpacity
              key={month.label}
              style={[
                styles.tableRow,
                i % 2 === 0 && styles.tableRowEven,
                selectedMonth?.label === month.label && styles.tableRowSelected,
              ]}
              onPress={() => handleMonthPress(month)}
              activeOpacity={0.7}
            >
              <Text style={styles.tableCell}>
                {format(month.date, 'MMM yyyy')}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellAmount]}>
                {formatAmount(month.amount)}
              </Text>
              <Text style={styles.tableCell}>{month.count}</Text>
              <Text style={[
                styles.tableCell,
                styles.tableCellChange,
                month.change && month.change > 0 ? styles.negative : styles.positive,
              ]}>
                {month.change ? `${month.change > 0 ? '+' : ''}${month.changePercentage?.toFixed(1)}%` : '-'}
              </Text>
              <View style={styles.tableCell}>
                {month.change && (
                  <Icon
                    name={month.change > 0 ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={month.change > 0 ? colors.error[500] : colors.success[500]}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }, [monthlyData, selectedMonth, handleMonthPress]);

  // Render grid view
  const renderGridView = useCallback(() => {
    const displayData = monthlyData.slice(-12);
    
    return (
      <View style={styles.grid}>
        {displayData.map(month => {
          const isSelected = selectedMonth?.label === month.label;
          const isPositive = month.change && month.change > 0;
          
          return (
            <TouchableOpacity
              key={month.label}
              style={[
                styles.gridItem,
                isSelected && styles.gridItemSelected,
              ]}
              onPress={() => handleMonthPress(month)}
              activeOpacity={0.7}
            >
              <Text style={styles.gridMonth}>
                {format(month.date, 'MMM yyyy')}
              </Text>
              <Text style={styles.gridAmount}>
                {formatAmount(month.amount)}
              </Text>
              <View style={styles.gridFooter}>
                <Badge
                  text={`${month.count} subs`}
                  variant="outline"
                  size="small"
                />
                {month.change && (
                  <View style={styles.gridChange}>
                    <Icon
                      name={month.change > 0 ? 'arrow-up' : 'arrow-down'}
                      size={12}
                      color={month.change > 0 ? colors.error[500] : colors.success[500]}
                    />
                    <Text style={[
                      styles.gridChangeText,
                      { color: month.change > 0 ? colors.error[500] : colors.success[500] },
                    ]}>
                      {Math.abs(month.changePercentage || 0).toFixed(0)}%
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }, [monthlyData, selectedMonth, handleMonthPress]);

  // Render year over year comparison
  const renderYearOverYear = useCallback(() => {
    if (yearOverYearData.length < 2) return null;
    
    return (
      <View style={styles.yoyContainer}>
        <Text style={styles.yoyTitle}>Year over Year Comparison</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {yearOverYearData.slice(-2).map((year, i) => (
            <Card key={year.year} style={styles.yoyCard}>
              <Text style={styles.yoyYear}>{year.year}</Text>
              <View style={styles.yoyStats}>
                <View style={styles.yoyStat}>
                  <Text style={styles.yoyStatLabel}>Total</Text>
                  <Text style={styles.yoyStatValue}>
                    {formatAmount(year.total)}
                  </Text>
                </View>
                <View style={styles.yoyStat}>
                  <Text style={styles.yoyStatLabel}>Monthly Avg</Text>
                  <Text style={styles.yoyStatValue}>
                    {formatAmount(year.average)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.yoyPeaks}>
                <View style={styles.yoyPeak}>
                  <Text style={styles.yoyPeakLabel}>Peak</Text>
                  <Text style={styles.yoyPeakMonth}>
                    {format(year.peak.date, 'MMM')}
                  </Text>
                  <Text style={styles.yoyPeakAmount}>
                    {formatAmount(year.peak.amount)}
                  </Text>
                </View>
                <View style={styles.yoyPeak}>
                  <Text style={styles.yoyPeakLabel}>Low</Text>
                  <Text style={styles.yoyPeakMonth}>
                    {format(year.low.date, 'MMM')}
                  </Text>
                  <Text style={styles.yoyPeakAmount}>
                    {formatAmount(year.low.amount)}
                  </Text>
                </View>
              </View>
              
              {i === 1 && yearOverYearData.length > 1 && (
                <View style={styles.yoyComparison}>
                  <Divider />
                  <View style={styles.yoyChange}>
                    <Text style={styles.yoyChangeLabel}>
                      vs {yearOverYearData[0].year}
                    </Text>
                    {/* <TrendIndicator
                      value={((year.total - yearOverYearData[0].total) / yearOverYearData[0].total) * 100}
                      size="medium"
                      showLabel={false}
                    /> */}
                  </View>
                </View>
              )}
            </Card>
          ))}
        </ScrollView>
      </View>
    );
  }, [yearOverYearData]);

  // Render comparison analysis
  const renderComparisonAnalysis = useCallback(() => {
    if (!comparisonData) return null;
    
    return (
      <View style={styles.comparisonContainer}>
        <Text style={styles.comparisonTitle}>Period Comparison</Text>
        
        <View style={styles.comparisonCards}>
          <Card style={styles.comparisonCard}>
            <Text style={styles.comparisonPeriod}>
              {format(comparisonData.period1.start, 'MMM d')} - {format(comparisonData.period1.end, 'MMM d')}
            </Text>
            <Text style={styles.comparisonAmount}>
              {formatAmount(comparisonData.period1Total)}
            </Text>
          </Card>
          
          <View style={styles.comparisonVs}>
            <Icon name="vs" size={24} color={colors.neutral[600]} />
          </View>
          
          <Card style={styles.comparisonCard}>
            <Text style={styles.comparisonPeriod}>
              {format(comparisonData.period2.start, 'MMM d')} - {format(comparisonData.period2.end, 'MMM d')}
            </Text>
            <Text style={styles.comparisonAmount}>
              {formatAmount(comparisonData.period2Total)}
            </Text>
          </Card>
        </View>
        
        <View style={styles.comparisonResult}>
          <Text style={styles.comparisonResultLabel}>Difference</Text>
          <Text style={[
            styles.comparisonResultValue,
            { color: comparisonData.difference > 0 ? colors.error[500] : colors.success[500] },
          ]}>
            {comparisonData.difference > 0 ? '+' : ''}
            {formatAmount(comparisonData.difference)}
          </Text>
          <Badge
            text={`${comparisonData.percentageChange > 0 ? '+' : ''}${comparisonData.percentageChange.toFixed(1)}%`}
            variant={comparisonData.percentageChange > 0 ? 'danger' : 'success'}
            size="medium"
          />
        </View>
        
        {comparisonData.insights.length > 0 && (
          <View style={styles.comparisonInsights}>
            <Text style={styles.comparisonInsightsTitle}>Key Insights</Text>
            {comparisonData.insights.map((insight, i) => (
              <View key={i} style={styles.comparisonInsight}>
                <Icon name="lightbulb" size={16} color={colors.warning[500]} />
                <Text style={styles.comparisonInsightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }, [comparisonData, formatAmount]);

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <Loading message="Analyzing monthly trends..." />
      </Card>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.emptyState}>
          <Icon name="calendar-compare" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Data Available</Text>
          <Text style={styles.emptyDescription}>
            Add subscription data to see monthly comparisons
          </Text>
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
      <Card style={[styles.card, ...(compact ? [styles.compactCard] : [])]]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Monthly Comparison</Text>
            <Text style={styles.subtitle}>
              {statistics ? `${statistics.change > 0 ? '+' : ''}${statistics.change.toFixed(1)}% vs last year` : ''}
            </Text>
          </View>
          
          {/* <SegmentedControl
            options={[
              { label: '6M', value: '6m' },
              { label: '12M', value: '12m' },
              { label: 'YoY', value: 'yoy' },
            ]}
            value={selectedPeriod}
            onChange={handlePeriodChange}
            size="small"
          /> */}
        </View>

        {/* Period Comparison Selector */}
        <View style={styles.compareSelector}>
          {/* <SegmentedControl
            options={[
              { label: 'Sequential', value: 'sequential', icon: 'arrow-right' },
              { label: 'YoY', value: 'yearOverYear', icon: 'calendar-sync' },
              { label: 'Custom', value: 'custom', icon: 'tune' },
            ]}
            value={compareMode}
            onChange={handleCompareModeChange}
            size="small"
            variant="outline"
          /> */}
          
          {compareMode === 'custom' && (
            <View style={styles.customCompareOptions}>
              {/* <SegmentedControl
                options={[
                  { label: '1M', value: '1m' },
                  { label: '3M', value: '3m' },
                  { label: '6M', value: '6m' },
                  { label: '12M', value: '12m' },
                ]}
                value={selectedComparisonPeriod}
                onChange={setSelectedComparisonPeriod}
                size="small"
              /> */}
            </View>
          )}
        </View>

        {/* Statistics Overview */}
        {!compact && statistics && (
          <View style={styles.statisticsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Spending</Text>
              <Text style={styles.statValue}>
                {formatAmount(statistics.total)}
              </Text>
              <Text style={styles.statPeriod}>
                {monthlyData.length} months
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Monthly Average</Text>
              <Text style={styles.statValue}>
                {formatAmount(statistics.average)}
              </Text>
              <View style={styles.statTrend}>
                {/* <TrendIndicator
                  value={statistics.trend.slope}
                  size="small"
                  showLabel={false}
                /> */}
                <Text style={styles.statTrendLabel}>
                  {statistics.trend.direction}
                </Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Consistency</Text>
              <Text style={styles.statValue}>
                {statistics.consistency.toFixed(0)}%
              </Text>
              <View style={styles.statBar}>
                <View 
                  style={[
                    styles.statBarFill,
                    { 
                      width: `${statistics.consistency}%`,
                      backgroundColor: statistics.consistency > 80 ? colors.success[500] : 
                                     statistics.consistency > 60 ? colors.warning[500] : colors.error[500],
                    },
                  ]} 
                />
              </View>
            </View>
            
            {showForecast && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Next Month</Text>
                <Text style={styles.statValue}>
                  {formatAmount(statistics.forecast)}
                </Text>
                <Badge
                  text="Forecast"
                  variant="info"
                  size="small"
                />
              </View>
            )}
          </View>
        )}

        {/* View Mode Selector */}
        <View style={styles.viewModeSelector}>
          {/* <SegmentedControl
            options={[
              { label: 'Chart', value: 'chart', icon: 'chart-bar' },
              { label: 'Table', value: 'table', icon: 'table' },
              { label: 'Grid', value: 'grid', icon: 'grid' },
            ]}
            value={viewMode}
            onChange={setViewMode}
            size="small"
            variant="ghost"
          /> */}
          
          {viewMode === 'chart' && (
            <>{/* <SegmentedControl
              options={[
                { label: 'Bar', value: 'bar', icon: 'chart-bar' },
                { label: 'Line', value: 'line', icon: 'chart-line' },
                ...(compareMode === 'custom' ? [{ label: 'Grouped', value: 'grouped', icon: 'chart-bar-stacked' }] : []),
              ]}
              value={chartType}
              onChange={setChartType}
              size="small"
              variant="ghost"
            /> */}
            </>
          )}
        </View>

        {/* Chart View */}
        {viewMode === 'chart' && (
          <View style={styles.chartContainer}>
            {chartType === 'grouped' && groupedChartData ? (
              <>
                {/* <BarChart
                data={groupedChartData}
                width={screenWidth}
                height={chartHeight}
                chartConfig={{
                  backgroundColor: colors.neutral[0],
                  backgroundGradientFrom: colors.neutral[0],
                  backgroundGradientTo: colors.neutral[0],
                  decimalPlaces: 0,
                  color: (opacity = 1) => colors.primary[500],
                  labelColor: (opacity = 1) => colors.neutral[600],
                  style: { borderRadius: 16 },
                  barPercentage: 0.8,
                }} */}
              </>
            ) : chartType === 'line' && chartData ? (
              <>
                {/* <LineChart
                style={styles.chart}
                showValuesOnTopOfBars
                fromZero
                withInnerLines={false}
              /> */}
            ) : chartType === 'line' ? (
              <>
                {/* <LineChart
                data={chartData!}
                width={chartWidth}
                height={chartHeight}
                chartConfig={{
                  backgroundColor: colors.neutral[0],
                  backgroundGradientFrom: colors.neutral[0],
                  backgroundGradientTo: colors.neutral[0],
                  decimalPlaces: 0,
                  color: (opacity = 1) => colors.primary[500],
                  labelColor: (opacity = 1) => colors.neutral[600],
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: colors.primary[500],
                  },
                }}
                style={styles.chart}
                bezier
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLabels={true}
                formatYLabel={(value: string) => formatAmount(parseFloat(value))}
              /> */}
              </>
            ) : (
              <>
                {/* <BarChart
                data={chartData!}
                width={chartWidth}
                height={chartHeight}
                chartConfig={{
                  backgroundColor: colors.neutral[0],
                  backgroundGradientFrom: colors.neutral[0],
                  backgroundGradientTo: colors.neutral[0],
                  decimalPlaces: 0,
                  color: (opacity = 1) => colors.primary[500],
                  labelColor: (opacity = 1) => colors.neutral[600],
                  style: { borderRadius: 16 },
                  barPercentage: 0.7,
                }}
                style={styles.chart}
                showValuesOnTopOfBars={!compact}
                fromZero
                withInnerLines={false}
              /> */}
              </>
            )}
            
            {monthlyData.length > 12 && (
              <View style={styles.scrollHint}>
                <Icon name="arrow-right" size={16} color={colors.neutral[600]} />
                <Text style={styles.scrollHintText}>Scroll for more months</Text>
              </View>
            )}
          </View>
        )}

        {/* Table View */}
        {viewMode === 'table' && renderTableView()}

        {/* Grid View */}
        {viewMode === 'grid' && renderGridView()}

        {/* Month Bars (Alternative Visualization) */}
        {viewMode === 'chart' && showDetailed && (
          <View style={styles.monthBarsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={[styles.monthBars, { width: monthlyData.length * 70 }]}>
                {monthlyData.slice(-12).map((month, index) => renderMonthBar(month, index))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Year over Year Comparison */}
        {showYearOverYear && viewMode !== 'table' && renderYearOverYear()}

        {/* Custom Comparison Analysis */}
        {compareMode === 'custom' && comparisonData && renderComparisonAnalysis()}

        {/* Key Insights */}
        {statistics && (
          <View style={styles.insights}>
            <Text style={styles.insightsTitle}>Key Insights</Text>
            <View style={styles.insightsList}>
              <View style={styles.insightItem}>
                <Icon name="trending-up" size={20} color={statistics.trend.direction === 'up' ? colors.error[500] : colors.success[500]} />
                <Text style={styles.insightText}>
                  Spending is {statistics.trend.direction === 'up' ? 'increasing' : 'decreasing'} 
                  ({statistics.trend.strength}) with {statistics.consistency.toFixed(0)}% consistency
                </Text>
              </View>
              
              <View style={styles.insightItem}>
                <Icon name="calendar" size={20} color={colors.primary[500]} />
                <Text style={styles.insightText}>
                  Peak spending in {format(statistics.maxMonth.date, 'MMMM')} ({formatAmount(statistics.maxMonth.amount)})
                </Text>
              </View>
              
              <View style={styles.insightItem}>
                <Icon name="cash" size={20} color={colors.success[500]} />
                <Text style={styles.insightText}>
                  Lowest spending in {format(statistics.minMonth.date, 'MMMM')} ({formatAmount(statistics.minMonth.amount)})
                </Text>
              </View>
              
              {statistics.change > 0 && (
                <View style={styles.insightItem}>
                  <Icon name="alert" size={20} color={colors.warning[500]} />
                  <Text style={styles.insightText}>
                    Year-over-year spending {statistics.change > 0 ? 'increased' : 'decreased'} by {Math.abs(statistics.change).toFixed(1)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Export Button */}
        {!compact && (
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Export comparison data
            }}
            activeOpacity={0.7}
          >
            <Icon name="export" size={20} color={colors.primary} />
            <Text style={styles.exportText}>Export Comparison Report</Text>
          </TouchableOpacity>
        )}
      </Card>
    </Animated.View>
  );
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
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    marginTop: 2,
  },
  compareSelector: {
    marginBottom: 16,
  },
  customCompareOptions: {
    marginTop: 12,
  },
  statisticsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.neutral[900],
    marginBottom: 4,
  },
  statPeriod: {
    fontSize: 11,
    color: colors.neutral[600],
  },
  statTrend: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginTop: 4,
  },
  statTrendLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    textTransform: 'capitalize' as const,
  },
  statBar: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    marginTop: 8,
    width: '100%',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  viewModeSelector: {
    marginBottom: 16,
    gap: 12,
  },
  chartContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  scrollHintText: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  monthBarsContainer: {
    marginTop: 16,
  },
  monthBars: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    height: 120,
  },
  monthBarContainer: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  monthBarContent: {
    width: '100%',
    height: 80,
    justifyContent: 'flex-end',
  },
  monthBar: {
    width: '100%',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  monthBarValue: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.neutral[0],
  },
  monthLabel: {
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  monthLabelText: {
    fontSize: 12,
    color: colors.neutral[900],
  },
  monthLabelSelected: {
    fontWeight: '700' as const,
    color: colors.primary[500],
  },
  monthLabelForecast: {
    color: colors.info[500],
  },
  expandedMonthDetails: {
    position: 'absolute',
    top: -140,
    left: '50%',
    transform: [{ translateX: -100 }],
    width: 200,
    padding: 12,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  expandedRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  expandedLabel: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  expandedValue: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.neutral[900],
  },
  table: {
    minWidth: '100%',
    marginVertical: 16,
  },
  tableHeader: {
    flexDirection: 'row' as const,
    backgroundColor: colors.neutral[50],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row' as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  tableRowEven: {
    backgroundColor: colors.neutral[50] + '40',
  },
  tableRowSelected: {
    backgroundColor: colors.primary[50],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: colors.neutral[900],
  },
  tableHeaderCell: {
    fontWeight: '600' as const,
    color: colors.neutral[600],
  },
  tableCellAmount: {
    fontWeight: '600' as const,
  },
  tableCellChange: {
    fontWeight: '600' as const,
  },
  positive: {
    color: colors.success[500],
  },
  negative: {
    color: colors.error[500],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 16,
  },
  gridItem: {
    width: '30%',
    padding: 12,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  gridItemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  gridMonth: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.neutral[900],
    marginBottom: 4,
  },
  gridAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.neutral[900],
    marginBottom: 8,
  },
  gridFooter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  gridChange: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 2,
  },
  gridChangeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  yoyContainer: {
    marginTop: 20,
  },
  yoyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.neutral[900],
    marginBottom: 12,
  },
  yoyCard: {
    width: 280,
    marginRight: 12,
    padding: 16,
  },
  yoyYear: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.neutral[900],
    marginBottom: 12,
  },
  yoyStats: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 16,
  },
  yoyStat: {
    flex: 1,
  },
  yoyStatLabel: {
    fontSize: 11,
    color: colors.neutral[600],
    marginBottom: 2,
  },
  yoyStatValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.neutral[900],
  },
  yoyPeaks: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  yoyPeak: {
    flex: 1,
  },
  yoyPeakLabel: {
    fontSize: 11,
    color: colors.neutral[600],
    marginBottom: 2,
  },
  yoyPeakMonth: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  yoyPeakAmount: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  yoyComparison: {
    marginTop: 16,
  },
  yoyChange: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginTop: 12,
  },
  yoyChangeLabel: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  comparisonContainer: {
    marginTop: 20,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.neutral[900],
    marginBottom: 12,
  },
  comparisonCards: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 16,
  },
  comparisonCard: {
    flex: 1,
    padding: 16,
  },
  comparisonPeriod: {
    fontSize: 12,
    color: colors.neutral[600],
    marginBottom: 4,
  },
  comparisonAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.neutral[900],
  },
  comparisonVs: {
    width: 40,
    alignItems: 'center' as const,
  },
  comparisonResult: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    marginBottom: 16,
  },
  comparisonResultLabel: {
    fontSize: 14,
    color: colors.neutral[900],
  },
  comparisonResultValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  comparisonInsights: {
    padding: 16,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
  },
  comparisonInsightsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.neutral[900],
    marginBottom: 12,
  },
  comparisonInsight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 8,
  },
  comparisonInsightText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral[900],
    lineHeight: 18,
  },
  insights: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.neutral[900],
    marginBottom: 12,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral[900],
    lineHeight: 18,
  },
  exportButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
  },
  exportText: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '500' as const,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.neutral[900],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center' as const,
  },
});

export default MonthlyComparison;