import { format } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    PanResponder,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop, Text as SVGText } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Badge, Card, Loading, Text, Tooltip } from '@components/common';
import { colors } from '@config/colors';
import { useCurrency } from '@hooks/useCurrency';

interface SpendingChartProps {
  period?: 'month' | 'quarter' | 'year' | 'all';
  type?: 'line' | 'area' | 'bar' | 'combined';
  showInsights?: boolean;
  showPredictions?: boolean;
  showAnomalies?: boolean;
  interactive?: boolean;
  compact?: boolean;
  onPeriodChange?: (period: string) => void;
  onDataPointPress?: (point: DataPoint) => void;
  onInsightPress?: (insight: Insight) => void;
}

interface DataPoint {
  date: Date;
  amount: number;
  categoryBreakdown: Record<string, number>;
  subscriptionCount: number;
  isPrediction?: boolean;
  isAnomaly?: boolean;
  anomalyReason?: string;
  metadata?: Record<string, any>;
}

interface Insight {
  id: string;
  type: 'savings' | 'warning' | 'info' | 'trend';
  title: string;
  description: string;
  value?: number;
  impact?: 'high' | 'medium' | 'low';
  action?: () => void;
}

interface Prediction {
  date: Date;
  amount: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
}

interface Anomaly {
  date: Date;
  amount: number;
  expectedAmount: number;
  deviation: number;
  reason: string;
  category?: string;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({
  period = 'year',
  type = 'combined',
  showInsights = true,
  showPredictions = true,
  showAnomalies = true,
  interactive = true,
  compact = false,
  onPeriodChange,
  onDataPointPress,
  onInsightPress,
}) => {
  const { formatAmount } = useCurrency();
  
  const [spendingData, setSpendingData] = useState<DataPoint[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [selectedChartType, setSelectedChartType] = useState(type);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; point: DataPoint } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'chart' | 'insights' | 'details'>('chart');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollOffset, setScrollOffset] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  const insightsAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => interactive,
      onMoveShouldSetPanResponder: () => interactive,
      onPanResponderGrant: () => {},
      onPanResponderMove: () => {},
      onPanResponderRelease: () => {},
    })
  ).current;

  const screenWidth = Dimensions.get('window').width - 32;
  const chartWidth = screenWidth * zoomLevel;
  const chartHeight = compact ? 220 : 320;
  const padding = { top: 20, right: 40, bottom: 60, left: 70 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Load data
  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual data from analytics service
      const data: DataPoint[] = [];
      const preds: Prediction[] = [];
      const anoms: Anomaly[] = [];
      const ins: Insight[] = [];
      
      setSpendingData(data);
      setPredictions(preds);
      setAnomalies(anoms);
      setInsights(ins);
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(chartAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Failed to load spending data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate moving average
  const calculateMovingAverage = useCallback((data: DataPoint[], window: number): { date: Date; value: number }[] => {
    if (data.length < window) return [];
    
    const result = [];
    for (let i = window - 1; i < data.length; i++) {
      const windowData = data.slice(i - window + 1, i + 1);
      const avg = windowData.reduce((sum, d) => sum + d.amount, 0) / window;
      result.push({ date: data[i].date, value: avg });
    }
    
    return result;
  }, []);

  // Calculate trend line
  const calculateTrendLine = useCallback((data: DataPoint[]): { slope: number; intercept: number; rSquared: number } => {
    if (data.length < 2) return { slope: 0, intercept: 0, rSquared: 0 };
    
    const n = data.length;
    const xValues = data.map((_, i) => i);
    const yValues = data.map(d => d.amount);
    
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssResidual = yValues.reduce((sum, y, i) => {
      const yPred = intercept + slope * i;
      return sum + Math.pow(y - yPred, 2);
    }, 0);
    
    const rSquared = 1 - (ssResidual / ssTotal);
    
    return { slope, intercept, rSquared };
  }, []);

  // Process chart data
  const chartData = useMemo(() => {
    if (spendingData.length === 0) return null;
    
    // Combine actual data with predictions
    const allData = [...spendingData];
    if (predictions.length > 0) {
      predictions.forEach(pred => {
        allData.push({
          date: pred.date,
          amount: pred.amount,
          categoryBreakdown: {},
          subscriptionCount: 0,
          isPrediction: true,
          metadata: {
            confidence: pred.confidence,
            lowerBound: pred.lowerBound,
            upperBound: pred.upperBound,
          },
        });
      });
    }
    
    // Sort by date
    allData.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate scales
    const dates = allData.map(d => d.date.getTime());
    const amounts = allData.map(d => d.amount);
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const maxAmount = Math.max(...amounts);
    
    // Simple linear scale function
    const xScale = (x: number) => {
      if (maxDate === minDate) return graphWidth / 2;
      return ((x - minDate) / (maxDate - minDate)) * graphWidth;
    };
    
    const yScale = (y: number) => {
      const maxVal = maxAmount * 1.1;
      if (maxVal === 0) return graphHeight / 2;
      return graphHeight - (y / maxVal) * graphHeight;
    };
    
    // Calculate moving average
    const movingAverage = calculateMovingAverage(spendingData, 3);
    
    // Calculate trend line
    const trendLine = calculateTrendLine(spendingData);
    
    return {
      allData,
      xScale,
      yScale,
      minDate,
      maxDate,
      maxAmount,
      movingAverage,
      trendLine,
    };
  }, [spendingData, predictions, graphWidth, graphHeight]);

  const findClosestPoint = useCallback((touchX: number, touchY: number): DataPoint | null => {
    if (!chartData) return null;
    
    let closest: DataPoint | null = null;
    let minDistance = Infinity;
    const snapDistance = 40;
    
    chartData.allData.forEach(point => {
      const x = chartData.xScale(point.date.getTime());
      const y = chartData.yScale(point.amount);
      
      const distance = Math.sqrt(Math.pow(touchX - x, 2) + Math.pow(touchY - y, 2));
      if (distance < minDistance && distance < snapDistance) {
        minDistance = distance;
        closest = point;
      }
    });
    
    return closest;
  }, [chartData]);

  // Generate line path
  const generateLinePath = useCallback((data: DataPoint[], isPrediction = false): string => {
    if (!chartData || data.length === 0) return '';
    
    let path = '';
    data.forEach((point, i) => {
      const x = chartData.xScale(point.date.getTime());
      const y = chartData.yScale(point.amount);
      
      if (i === 0) {
        path = `M ${x} ${y}`;
      } else {
        // Smooth curve for non-prediction lines
        if (!isPrediction && i < data.length - 1) {
          const prevX = chartData.xScale(data[i - 1].date.getTime());
          const prevY = chartData.yScale(data[i - 1].amount);
          const nextX = chartData.xScale(data[i + 1].date.getTime());
          const nextY = chartData.yScale(data[i + 1].amount);
          
          const cp1x = prevX + (x - prevX) * 0.5;
          const cp1y = prevY;
          const cp2x = x - (nextX - x) * 0.5;
          const cp2y = y;
          
          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
        } else {
          path += ` L ${x} ${y}`;
        }
      }
    });
    
    return path;
  }, [chartData]);

  // Generate area path
  const generateAreaPath = useCallback((data: DataPoint[]): string => {
    if (!chartData || data.length === 0) return '';
    
    const linePath = generateLinePath(data);
    if (!linePath) return '';
    
    const firstX = chartData.xScale(data[0].date.getTime());
    const lastX = chartData.xScale(data[data.length - 1].date.getTime());
    
    return `${linePath} L ${lastX} ${graphHeight} L ${firstX} ${graphHeight} Z`;
  }, [chartData, generateLinePath, graphHeight]);

  // Generate bar paths
  const generateBarPaths = useCallback((): { path: string; x: number; width: number; point: DataPoint }[] => {
    if (!chartData) return [];
    
    const barWidth = (graphWidth / chartData.allData.length) * 0.6;
    const barSpacing = (graphWidth / chartData.allData.length) * 0.4;
    
    return chartData.allData.map((point, i) => {
      const x = i * (barWidth + barSpacing) + barSpacing / 2;
      const width = barWidth;
      const height = graphHeight - chartData.yScale(point.amount);
      const y = chartData.yScale(point.amount);
      
      const path = `
        M ${x} ${graphHeight}
        L ${x} ${y}
        L ${x + width} ${y}
        L ${x + width} ${graphHeight}
        Z
      `;
      
      return { path, x, width, point };
    });
  }, [chartData, graphWidth, graphHeight]);

  // Render grid
  const renderGrid = useCallback(() => {
    if (!chartData) return null;
    
    const horizontalLines = 5;
    const verticalLines = Math.min(chartData.allData.length, 12);
    
    return (
      <G>
        {/* Horizontal grid lines */}
        {[...Array(horizontalLines)].map((_, i) => {
          const y = padding.top + (graphHeight / horizontalLines) * i;
          const value = (chartData.maxAmount / horizontalLines) * (horizontalLines - i);
          
          return (
            <G key={`hgrid-${i}`}>
              <SVGText
                x={padding.left - 10}
                y={y + 4}
                fontSize={10}
                fill={colors.neutral[600]}
                textAnchor="end"
                opacity={0.7}
              >
                {formatAmount(value)}
              </SVGText>
              <Path
                d={`M ${padding.left} ${y} L ${padding.left + graphWidth} ${y}`}
                stroke={colors.neutral[200]}
                strokeWidth={1}
                strokeDasharray="2,2"
                opacity={0.2}
              />
            </G>
          );
        })}
        
        {/* Vertical grid lines */}
        {[...Array(verticalLines)].map((_, i) => {
          const index = Math.floor((chartData.allData.length - 1) * (i / (verticalLines - 1)));
          const point = chartData.allData[index];
          const x = padding.left + chartData.xScale(point.date.getTime());
          
          return (
            <G key={`vgrid-${i}`}>
              <SVGText
                x={x}
                y={padding.top + graphHeight + 15}
                fontSize={10}
                fill={colors.neutral[600]}
                textAnchor="middle"
                opacity={0.7}
              >
                {format(point.date, 'MMM')}
              </SVGText>
              <Path
                d={`M ${x} ${padding.top} L ${x} ${padding.top + graphHeight}`}
                stroke={colors.neutral[200]}
                strokeWidth={1}
                strokeDasharray="2,2"
                opacity={0.1}
              />
            </G>
          );
        })}
      </G>
    );
  }, [chartData, padding, graphHeight, graphWidth]);

  // Render anomalies
  const renderAnomalies = useCallback(() => {
    if (anomalies.length === 0) return null;
    
    return (
      <G>
        {anomalies.map((anomaly, i) => {
          if (!chartData) return null;
          
          const x = padding.left + chartData.xScale(anomaly.date.getTime());
          const y = padding.top + chartData.yScale(anomaly.amount);
          
          return (
            <G key={`anomaly-${i}`}>
              <Circle
                cx={x}
                cy={y}
                r={8}
                fill={colors.error[500]}
                opacity={0.8}
              />
              <Circle
                cx={x}
                cy={y}
                r={6}
                fill={colors.neutral[0]}
              />
              <Icon name="alert" size={12} color={colors.error[500]} style={{
                position: 'absolute',
                left: x - 6,
                top: y - 6,
              }} />
            </G>
          );
        })}
      </G>
    );
  }, [anomalies, chartData, padding.left, padding.top]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (spendingData.length === 0) return null;
    
    const amounts = spendingData.map(d => d.amount);
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    const average = total / amounts.length;
    const max = Math.max(...amounts);
    const min = Math.min(...amounts);
    const latest = spendingData[spendingData.length - 1].amount;
    const first = spendingData[0].amount;
    const change = ((latest - first) / first) * 100;
    
    // Calculate volatility (standard deviation)
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / amounts.length;
    const volatility = Math.sqrt(variance);
    
    return {
      total,
      average,
      max,
      min,
      latest,
      change,
      volatility,
      dataPoints: spendingData.length,
    };
  }, [spendingData]);

  // Period options
  const periodOptions = useMemo(() => [
    { label: '1M', value: 'month', icon: 'calendar-month' },
    { label: '3M', value: 'quarter', icon: 'calendar-range' },
    { label: '1Y', value: 'year', icon: 'calendar' },
    { label: 'All', value: 'all', icon: 'calendar-star' },
  ], []);

  // Chart type options
  const chartTypeOptions = useMemo(() => [
    { label: 'Line', value: 'line', icon: 'chart-line' },
    { label: 'Area', value: 'area', icon: 'chart-areaspline' },
    { label: 'Bar', value: 'bar', icon: 'chart-bar' },
    { label: 'Combined', value: 'combined', icon: 'chart-multiple' },
  ], []);

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <Loading message="Analyzing spending patterns..." />
      </Card>
    );
  }

  if (spendingData.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.emptyState}>
          <Icon name="chart-timeline" size={48} color={colors.neutral[600]} />
          <Text style={styles.emptyTitle}>No Spending Data</Text>
          <Text style={styles.emptyDescription}>
            Add subscriptions to see your spending patterns and insights
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Card style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Spending Analysis</Text>
            <Text style={styles.subtitle}>
              {statistics ? `${formatAmount(statistics.total)} total • ${statistics.change.toFixed(1)}% change` : ''}
            </Text>
          </View>
        </View>

        {/* Chart Type Selector - TODO: Implement with actual SegmentedControl or equivalent */}
        {/* Currently supporting: line, area, bar, combined chart types */}

        {/* Stats Overview */}
        {!compact && statistics && (
          <View style={styles.statsOverview}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={styles.statValue}>
                {formatAmount(statistics.latest)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={styles.statValue}>
                {formatAmount(statistics.average)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Change</Text>
              <Text style={[
                styles.statValue,
                { color: statistics.change >= 0 ? colors.error[500] : colors.success[500] },
              ]}>
                {statistics.change >= 0 ? '+' : ''}{statistics.change.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Volatility</Text>
              <Text style={styles.statValue}>
                {formatAmount(statistics.volatility)}
              </Text>
            </View>
          </View>
        )}

        {/* Chart Container */}
        <Animated.View 
          style={[
            styles.chartContainer,
            { transform: [{ scale: chartAnim }] },
          ]}
          {...panResponder.panHandlers}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ width: chartWidth }}
          >
            <View style={[styles.chart, { height: chartHeight }]}>
              <Svg width={chartWidth} height={chartHeight}>
                <Defs>
                  <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={colors.primary[500]} stopOpacity="0.3" />
                    <Stop offset="100%" stopColor={colors.primary[500]} stopOpacity="0.1" />
                  </LinearGradient>
                  <LinearGradient id="predictionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={colors.info[500]} stopOpacity="0.2" />
                    <Stop offset="100%" stopColor={colors.info[500]} stopOpacity="0.05" />
                  </LinearGradient>
                </Defs>

                {/* Grid */}
                {renderGrid()}

                {/* Area (for area and combined charts) */}
                {(selectedChartType === 'area' || selectedChartType === 'combined') && chartData && (
                  <Path
                    d={generateAreaPath(spendingData)}
                    fill="url(#areaGradient)"
                    opacity={0.6}
                  />
                )}

                {/* Bars (for bar and combined charts) */}
                {(selectedChartType === 'bar' || selectedChartType === 'combined') && chartData && (
                  <G>
                    {generateBarPaths().map((bar, i) => (
                      <Path
                        key={`bar-${i}`}
                        d={bar.path}
                        fill={bar.point.isPrediction ? colors.info[500] : colors.primary[500]}
                        opacity={bar.point === selectedPoint ? 0.9 : bar.point === hoveredPoint ? 0.8 : 0.6}
                        onPress={() => {
                          setSelectedPoint(bar.point);
                          onDataPointPress?.(bar.point);
                        }}
                      />
                    ))}
                  </G>
                )}

                {/* Prediction area */}
                {predictions.length > 0 && chartData && (
                  <Path
                    d={generateAreaPath(predictions.map(p => ({
                      date: p.date,
                      amount: p.amount,
                      categoryBreakdown: {},
                      subscriptionCount: 0,
                      isPrediction: true,
                    })))}
                    fill="url(#predictionGradient)"
                    opacity={0.4}
                  />
                )}

                {/* Line (for line and combined charts) */}
                {(selectedChartType === 'line' || selectedChartType === 'combined') && chartData && (
                  <G>
                    {/* Main line */}
                    <Path
                      d={generateLinePath(spendingData)}
                      stroke={colors.primary[500]}
                      strokeWidth={3}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Prediction line */}
                    {predictions.length > 0 && (
                      <Path
                        d={generateLinePath(predictions.map(p => ({
                          date: p.date,
                          amount: p.amount,
                          categoryBreakdown: {},
                          subscriptionCount: 0,
                          isPrediction: true,
                        })), true)}
                        stroke={colors.info[500]}
                        strokeWidth={2}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="5,5"
                      />
                    )}
                    
                    {/* Moving average */}
                    {chartData.movingAverage.length > 0 && (
                      <Path
                        d={generateLinePath(chartData.movingAverage.map(ma => ({
                          date: ma.date,
                          amount: ma.value,
                          categoryBreakdown: {},
                          subscriptionCount: 0,
                        })))}
                        stroke={colors.warning[500]}
                        strokeWidth={2}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="3,3"
                        opacity={0.7}
                      />
                    )}
                  </G>
                )}

                {/* Points */}
                {chartData && (
                  <G>
                    {chartData.allData.map((point, i) => {
                      const x = padding.left + chartData.xScale(point.date.getTime());
                      const y = padding.top + chartData.yScale(point.amount);
                      const isSelected = selectedPoint?.date.getTime() === point.date.getTime();
                      const isHovered = hoveredPoint?.date.getTime() === point.date.getTime();
                      
                      return (
                        <Circle
                          key={`point-${i}`}
                          cx={x}
                          cy={y}
                          r={isSelected ? 8 : isHovered ? 6 : 4}
                          fill={point.isPrediction ? colors.info[500] : colors.primary[500]}
                          stroke={colors.neutral[0]}
                          strokeWidth={2}
                          opacity={isSelected ? 1 : isHovered ? 0.9 : 0.7}
                          onPress={() => {
                            setSelectedPoint(point);
                            onDataPointPress?.(point);
                          }}
                        />
                      );
                    })}
                  </G>
                )}

                {/* Anomalies */}
                {showAnomalies && renderAnomalies()}

                {/* Selected point indicator */}
                {selectedPoint && chartData && (
                  <G>
                    <Circle
                      cx={padding.left + chartData.xScale(selectedPoint.date.getTime())}
                      cy={padding.top + chartData.yScale(selectedPoint.amount)}
                      r={10}
                      fill={colors.primary[500]}
                      opacity={0.2}
                    />
                    <Circle
                      cx={padding.left + chartData.xScale(selectedPoint.date.getTime())}
                      cy={padding.top + chartData.yScale(selectedPoint.amount)}
                      r={6}
                      fill={colors.primary[500]}
                    />
                  </G>
                )}
              </Svg>
            </View>
          </ScrollView>
          
          {/* Y-axis label */}
          <Text style={[styles.yAxisLabel, { top: chartHeight / 2 }]}>Amount</Text>
          
          {/* Zoom controls */}
          {interactive && (
            <View style={styles.zoomControls}>
              <TouchableOpacity
                style={styles.zoomButton}
                onPress={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.5))}
                disabled={zoomLevel <= 0.5}
              >
                <Icon name="minus" size={16} color={colors.neutral[600]} />
              </TouchableOpacity>
              <Text style={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</Text>
              <TouchableOpacity
                style={styles.zoomButton}
                onPress={() => setZoomLevel(Math.min(3, zoomLevel + 0.5))}
                disabled={zoomLevel >= 3}
              >
                <Icon name="plus" size={16} color={colors.neutral[600]} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* View Mode Selector - TODO: Implement view mode switching */}
        {/* Chart mode is displayed by default */}

        {/* Insights Panel */}
        {viewMode === 'insights' && insights.length > 0 && (
          <Animated.View style={[styles.insightsPanel, { opacity: insightsAnim }]}>
            <Text style={styles.insightsTitle}>AI Insights</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.insightsContent}
            >
              {insights.map((insight, i) => (
                <TouchableOpacity
                  key={insight.id}
                  style={[
                    styles.insightCard,
                    { borderLeftColor: getInsightColor(insight.type) },
                  ]}
                  onPress={() => {
                    onInsightPress?.(insight);
                    insight.action?.();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.insightHeader}>
                    <Icon 
                      name={getInsightIcon(insight.type)} 
                      size={20} 
                      color={getInsightColor(insight.type)} 
                    />
                    <Text style={styles.insightType}>
                      {insight.type.toUpperCase()}
                    </Text>
                    {insight.impact && (
                      <Badge
                        text={insight.impact}
                        variant={insight.impact === 'high' ? 'danger' : 'warning'}
                        size="small"
                      />
                    )}
                  </View>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                  {insight.value && (
                    <Text style={styles.insightValue}>
                      Potential savings: {formatAmount(insight.value)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Details Panel */}
        {viewMode === 'details' && selectedPoint && (
          <View style={styles.detailsPanel}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>
                {format(selectedPoint.date, 'MMMM dd, yyyy')}
              </Text>
              <Badge
                text={selectedPoint.isPrediction ? 'Prediction' : 'Actual'}
                variant={selectedPoint.isPrediction ? 'info' : 'success'}
              />
            </View>
            
            <View style={styles.detailsContent}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Total Spending</Text>
                <Text style={styles.detailValue}>
                  {formatAmount(selectedPoint.amount)}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Active Subscriptions</Text>
                <Text style={styles.detailValue}>
                  {selectedPoint.subscriptionCount}
                </Text>
              </View>
              
              {selectedPoint.metadata?.confidence && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Confidence</Text>
                  <Text style={styles.detailValue}>
                    {(selectedPoint.metadata.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
              )}
              
              {Object.keys(selectedPoint.categoryBreakdown).length > 0 && (
                <View style={styles.categories}>
                  <Text style={styles.categoriesTitle}>Category Breakdown</Text>
                  {Object.entries(selectedPoint.categoryBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => (
                      <View key={category} style={styles.categoryItem}>
                        <Text style={styles.categoryName}>{category}</Text>
                        <Text style={styles.categoryAmount}>
                          {formatAmount(amount)}
                        </Text>
                        <View style={styles.categoryBarContainer}>
                          <View 
                            style={[
                              styles.categoryBar,
                              { 
                                width: `${(amount / selectedPoint.amount) * 100}%`,
                                backgroundColor: getCategoryColor(category),
                              },
                            ]} 
                          />
                        </View>
                      </View>
                    ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Tooltip */}
        {tooltipData && (
          <Tooltip
            x={tooltipData.x}
            y={tooltipData.y - 80}
            title={format(tooltipData.point.date, 'MMM dd, yyyy')}
            value={formatAmount(tooltipData.point.amount)}
            color={tooltipData.point.isPrediction ? colors.info[500] : colors.primary[500]}
            onClose={() => setTooltipData(null)}
          />
        )}
      </Card>
    </Animated.View>
  );
};

// Helper functions
const getInsightColor = (type: string): string => {
  switch (type) {
    case 'savings': return colors.success[500];
    case 'warning': return colors.warning[500];
    case 'info': return colors.info[500];
    case 'trend': return colors.primary[500];
    default: return colors.neutral[600];
  }
};

const getInsightIcon = (type: string): string => {
  switch (type) {
    case 'savings': return 'piggy-bank';
    case 'warning': return 'alert';
    case 'info': return 'information';
    case 'trend': return 'trending-up';
    default: return 'lightbulb';
  }
};

const getCategoryColor = (category: string): string => {
  const colorsMap: Record<string, string> = {
    entertainment: colors.primary[500],
    utilities: colors.info[500],
    productivity: colors.success[500],
    health: colors.error[500],
    education: colors.warning[500],
    other: colors.neutral[600],
  };
  return colorsMap[category] || colors.neutral[600];
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
  chartTypeSelector: {
    marginBottom: 16,
  },
  statsOverview: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
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
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.neutral[900],
  },
  chartContainer: {
    position: 'relative' as const,
    marginBottom: 20,
  },
  chart: {
    position: 'relative' as const,
  },
  yAxisLabel: {
    position: 'absolute' as const,
    left: 10,
    // top: chartHeight / 2, // Set dynamically at render time
    fontSize: 12,
    color: colors.neutral[600],
    transform: [{ rotate: '-90deg' }],
  },
  zoomControls: {
    position: 'absolute' as const,
    right: 10,
    top: 10,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.neutral[50],
    borderRadius: 20,
    padding: 6,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  zoomButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[0],
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  zoomLevel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.neutral[900],
    minWidth: 40,
    textAlign: 'center' as const,
  },
  viewModeSelector: {
    marginBottom: 16,
  },
  insightsPanel: {
    marginTop: 16,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.neutral[900],
    marginBottom: 12,
  },
  insightsContent: {
    gap: 12,
  },
  insightCard: {
    width: 280,
    padding: 16,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
    marginRight: 12,
  },
  insightHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  insightType: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.neutral[600],
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.neutral[900],
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: 12,
    lineHeight: 20,
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.success[500],
  },
  detailsPanel: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  detailsHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.neutral[900],
  },
  detailsContent: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  detailLabel: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.neutral[900],
  },
  categories: {
    marginTop: 8,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.neutral[900],
    marginBottom: 12,
  },
  categoryItem: {
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    color: colors.neutral[900],
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 12,
    color: colors.neutral[600],
    marginBottom: 4,
  },
  categoryBarContainer: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  categoryBar: {
    height: '100%',
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center' as const,
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

export default SpendingChart;