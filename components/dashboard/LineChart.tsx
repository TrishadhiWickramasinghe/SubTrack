import * as d3 from 'd3-scale';
import { format as dateFormat } from 'date-fns';
import * as Haptics from 'expo-haptics';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Circle, G, Path, Line as SVGLine, Text as SVGText } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Components
import { Badge, Card, Text, Tooltip } from '@components/common';
import { colors } from '@config/colors';
import { useCurrency } from '@hooks/useCurrency';
import { formatCurrency } from '@utils/currencyHelpers';

interface LineChartProps {
  data: LineData[];
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xKey?: string;
  yKey?: string;
  type?: 'line' | 'area' | 'spline';
  animated?: boolean;
  interactive?: boolean;
  showGrid?: boolean;
  showPoints?: boolean;
  showTooltip?: boolean;
  gradient?: boolean;
  color?: string;
  strokeWidth?: number;
  onPointPress?: (point: LineData, index: number) => void;
  onLinePress?: () => void;
  style?: any;
  compact?: boolean;
  showLegend?: boolean;
  showTrendLine?: boolean;
  forecastPoints?: number;
  period?: 'day' | 'week' | 'month' | 'year';
}

interface LineData {
  x: string | number | Date;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
  forecast?: boolean;
}

interface PointInfo {
  x: number;
  y: number;
  data: LineData;
  index: number;
}

interface TrendLine {
  slope: number;
  intercept: number;
  rSquared: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data = [],
  title = 'Spending Trend',
  subtitle,
  xAxisLabel,
  yAxisLabel,
  xKey = 'x',
  yKey = 'y',
  type = 'line',
  animated = true,
  interactive = true,
  showGrid = true,
  showPoints = true,
  showTooltip = true,
  gradient = true,
  color = colors.primary,
  strokeWidth = 3,
  onPointPress,
  onLinePress,
  style,
  compact = false,
  showLegend = true,
  showTrendLine = false,
  forecastPoints = 0,
  period = 'month',
}) => {
  const { formatAmount } = useCurrency();
  
  const [selectedPoint, setSelectedPoint] = useState<PointInfo | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<PointInfo | null>(null);
  const [tooltipData, setTooltipData] = useState<PointInfo | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  const [scrollOffset, setScrollOffset] = useState(0);
  const [trendLine, setTrendLine] = useState<TrendLine | null>(null);
  
  const pathRef = useRef<Path>(null);
  const pointRefs = useRef<(Circle | null)[]>([]);
  const chartRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const lineAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => interactive,
      onMoveShouldSetPanResponder: () => interactive,
      onPanResponderGrant: (evt) => handleTouchStart(evt.nativeEvent),
      onPanResponderMove: (evt) => handleTouchMove(evt.nativeEvent),
      onPanResponderRelease: () => handleTouchEnd(),
    })
  ).current;

  const screenWidth = Dimensions.get('window').width - 32;
  const chartWidth = Math.max(screenWidth, data.length * 80);
  const chartHeight = compact ? 220 : 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Process data
  const chartData = useMemo(() => {
    if (data.length === 0) return null;
    
    // Convert x values to dates if they're strings
    const processedData = data.map(item => ({
      ...item,
      x: typeof item.x === 'string' ? new Date(item.x) : item.x,
      y: item.y,
    }));
    
    // Add forecast points if needed
    let forecastData: LineData[] = [];
    if (forecastPoints > 0 && processedData.length > 1) {
      const lastPoint = processedData[processedData.length - 1];
      const trend = calculateTrend(processedData);
      
      for (let i = 1; i <= forecastPoints; i++) {
        const forecastDate = new Date(lastPoint.x as Date);
        switch (period) {
          case 'day': forecastDate.setDate(forecastDate.getDate() + i); break;
          case 'week': forecastDate.setDate(forecastDate.getDate() + i * 7); break;
          case 'month': forecastDate.setMonth(forecastDate.getMonth() + i); break;
          case 'year': forecastDate.setFullYear(forecastDate.getFullYear() + i); break;
        }
        
        const forecastY = trend.intercept + trend.slope * (processedData.length + i);
        
        forecastData.push({
          x: forecastDate,
          y: Math.max(0, forecastY),
          label: 'Forecast',
          color: colors.neutral[500],
          forecast: true,
        });
      }
    }
    
    const allData = [...processedData, ...forecastData];
    
    // Calculate scales
    const xValues = allData.map(d => d.x instanceof Date ? d.x.getTime() : d.x as number);
    const yValues = allData.map(d => d.y);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    const xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, graphWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([yMin, yMax * 1.1]) // Add 10% padding
      .range([graphHeight, 0]);
    
    // Calculate trend line
    if (showTrendLine && processedData.length > 2) {
      setTrendLine(calculateTrend(processedData));
    } else {
      setTrendLine(null);
    }
    
    return {
      data: allData,
      processed: processedData,
      forecast: forecastData,
      xScale,
      yScale,
      xMin,
      xMax,
      yMin,
      yMax,
    };
  }, [data, forecastPoints, period, graphWidth, graphHeight, showTrendLine]);

  // Calculate trend line
  const calculateTrend = useCallback((data: LineData[]): TrendLine => {
    const n = data.length;
    const xValues = data.map((_, i) => i + 1);
    const yValues = data.map(d => d.y);
    
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
      const yPred = intercept + slope * (i + 1);
      return sum + Math.pow(y - yPred, 2);
    }, 0);
    
    const rSquared = 1 - (ssResidual / ssTotal);
    
    return { slope, intercept, rSquared };
  }, []);

  // Animate chart on load
  useEffect(() => {
    if (animated && chartData) {
      setIsAnimating(true);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(lineAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pointsAnim, {
          toValue: 1,
          duration: 800,
          delay: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start(() => setIsAnimating(false));
    }
  }, [chartData, animated]);

  // Handle touch interactions
  const handleTouchStart = useCallback((event: any) => {
    if (!interactive || !chartData) return;
    
    const { locationX, locationY } = event;
    const touchX = locationX - padding.left;
    const touchY = locationY - padding.top;
    
    if (touchX < 0 || touchX > graphWidth || touchY < 0 || touchY > graphHeight) return;
    
    // Find closest point
    const closest = findClosestPoint(touchX, touchY);
    if (closest) {
      setHoveredPoint(closest);
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [interactive, chartData, padding.left, padding.top, graphWidth, graphHeight]);

  const handleTouchMove = useCallback((event: any) => {
    if (!interactive || !chartData) return;
    
    const { locationX, locationY } = event;
    const touchX = locationX - padding.left;
    const touchY = locationY - padding.top;
    
    if (touchX < 0 || touchX > graphWidth || touchY < 0 || touchY > graphHeight) {
      setHoveredPoint(null);
      return;
    }
    
    const closest = findClosestPoint(touchX, touchY);
    setHoveredPoint(closest);
  }, [interactive, chartData, padding.left, padding.top, graphWidth, graphHeight]);

  const handleTouchEnd = useCallback(() => {
    if (hoveredPoint) {
      setSelectedPoint(hoveredPoint);
      onPointPress?.(hoveredPoint.data, hoveredPoint.index);
      
      // Show tooltip
      if (showTooltip) {
        setTooltipData(hoveredPoint);
      }
      
      // Animation feedback
      Animated.sequence([
        Animated.timing(pointsAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pointsAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    setHoveredPoint(null);
  }, [hoveredPoint, onPointPress, showTooltip]);

  // Find closest point to touch coordinates
  const findClosestPoint = useCallback((touchX: number, touchY: number): PointInfo | null => {
    if (!chartData) return null;
    
    let closest: PointInfo | null = null;
    let minDistance = Infinity;
    
    chartData.data.forEach((point, index) => {
      const x = chartData.xScale(point.x instanceof Date ? point.x.getTime() : point.x as number);
      const y = chartData.yScale(point.y);
      
      const distance = Math.sqrt(Math.pow(touchX - x, 2) + Math.pow(touchY - y, 2));
      const snapDistance = 30; // Pixels
      
      if (distance < minDistance && distance < snapDistance) {
        minDistance = distance;
        closest = { x, y, data: point, index };
      }
    });
    
    return closest;
  }, [chartData]);

  // Generate line path
  const generateLinePath = useCallback((): string => {
    if (!chartData) return '';
    
    const points = chartData.processed;
    if (points.length === 0) return '';
    
    let path = `M ${chartData.xScale(points[0].x instanceof Date ? points[0].x.getTime() : points[0].x as number)} ${chartData.yScale(points[0].y)}`;
    
    for (let i = 1; i < points.length; i++) {
      const x = chartData.xScale((points[i].x instanceof Date ? (points[i].x as Date).getTime() : points[i].x) as number);
      const y = chartData.yScale(points[i].y);
      
      if (type === 'spline' && i < points.length - 1) {
        // Bézier curve for smooth line
        const prevX = chartData.xScale((points[i - 1].x instanceof Date ? (points[i - 1].x as Date).getTime() : points[i - 1].x) as number);
        const prevY = chartData.yScale(points[i - 1].y);
        const nextX = chartData.xScale((points[i + 1].x instanceof Date ? (points[i + 1].x as Date).getTime() : points[i + 1].x) as number);
        const nextY = chartData.yScale(points[i + 1].y);
        
        const cp1x = prevX + (x - prevX) * 0.5;
        const cp1y = prevY;
        const cp2x = x - (nextX - x) * 0.5;
        const cp2y = y;
        
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    
    if (type === 'area' && points.length > 0) {
      const lastX = chartData.xScale((points[points.length - 1].x instanceof Date ? (points[points.length - 1].x as Date).getTime() : points[points.length - 1].x) as number);
      const firstX = chartData.xScale(points[0].x instanceof Date ? points[0].x.getTime() : points[0].x as number);
      
      path += ` L ${lastX} ${graphHeight}`;
      path += ` L ${firstX} ${graphHeight}`;
      path += ' Z';
    }
    
    return path;
  }, [chartData, type, graphHeight]);

  // Generate forecast line path
  const generateForecastPath = useCallback((): string => {
    if (!chartData || chartData.forecast.length === 0) return '';
    
    const lastRealPoint = chartData.processed[chartData.processed.length - 1];
    const firstForecast = chartData.forecast[0];
    
    const startX = chartData.xScale(lastRealPoint.x instanceof Date ? lastRealPoint.x.getTime() : lastRealPoint.x as number);
    const startY = chartData.yScale(lastRealPoint.y);
    const endX = chartData.xScale(firstForecast.x instanceof Date ? firstForecast.x.getTime() : firstForecast.x as number);
    const endY = chartData.yScale(firstForecast.y);
    
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }, [chartData]);

  // Render gradient
  const renderGradient = useCallback(() => {
    if (!gradient || !chartData || type !== 'area') return null;
    
    const path = generateLinePath();
    const pathArray = path.split(' ');
    const lastPoint = pathArray[pathArray.length - 2] + ' ' + pathArray[pathArray.length - 1];
    
    return (
      <Path
        d={path + ` L ${chartData.xScale(chartData.xMax)} ${graphHeight} L ${chartData.xScale(chartData.xMin)} ${graphHeight} Z`}
        fill={`url(#gradient)`}
        opacity={0.3}
      />
    );
  }, [gradient, chartData, type, generateLinePath, graphHeight]);

  // Render trend line
  const renderTrendLine = useCallback(() => {
    if (!trendLine || !chartData) return null;
    
    const startX = chartData.xScale(chartData.xMin);
    const endX = chartData.xScale(chartData.xMax);
    const startY = chartData.yScale(trendLine.intercept + trendLine.slope * 1);
    const endY = chartData.yScale(trendLine.intercept + trendLine.slope * chartData.processed.length);
    
    return (
      <>
        <SVGLine
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={colors.success}
          strokeWidth={2}
          strokeDasharray="5,5"
          opacity={0.7}
        />
        <SVGText
          x={endX - 50}
          y={endY - 10}
          fontSize={10}
          fill={colors.success}
        >
          R² = {trendLine.rSquared.toFixed(3)}
        </SVGText>
      </>
    );
  }, [trendLine, chartData, colors.success]);

  // Render points
  const renderPoints = useCallback(() => {
    if (!chartData || !showPoints) return null;
    
    return chartData.data.map((point, index) => {
      const x = chartData.xScale(point.x instanceof Date ? point.x.getTime() : point.x as number);
      const y = chartData.yScale(point.y);
      
      const isSelected = selectedPoint?.index === index;
      const isHovered = hoveredPoint?.index === index;
      const isForecast = point.forecast;
      
      const pointColor = point.color || color;
      const pointSize = isSelected ? 10 : isHovered ? 8 : 6;
      const pointOpacity = isSelected ? 1 : isHovered ? 0.9 : 0.7;
      
      return (
        <G key={`point-${index}`}>
          {/* Glow effect for selected/hovered points */}
          {(isSelected || isHovered) && (
            <Circle
              cx={x}
              cy={y}
              r={pointSize + 4}
              fill={pointColor}
              opacity={0.2}
            />
          )}
          
          {/* Point */}
          <Circle
            ref={(ref: Circle | null) => pointRefs.current[index] = ref}
            cx={x}
            cy={y}
            r={pointSize}
            fill={isForecast ? colors.neutral[500] : pointColor}
            stroke={colors.neutral[50]}
            strokeWidth={2}
            opacity={pointOpacity}
            onPress={() => {
              const pointInfo: PointInfo = { x, y, data: point, index };
              setSelectedPoint(pointInfo);
              onPointPress?.(point, index);
              
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
            }}
          />
          
          {/* Label for important points */}
          {(isSelected || index === 0 || index === chartData.data.length - 1) && (
            <SVGText
              x={x}
              y={y - 15}
              fontSize={10}
              fontWeight={isSelected ? 'bold' : 'normal'}
              fill={colors.neutral[900]}
              textAnchor="middle"
            >
              {formatCurrency(point.y)}
            </SVGText>
          )}
        </G>
      );
    });
  }, [chartData, showPoints, selectedPoint, hoveredPoint, color, onPointPress, formatCurrency]);

  // Format x-axis labels
  const formatXLabel = useCallback((value: string | number | Date): string => {
    if (value instanceof Date) {
      switch (period) {
        case 'day': return dateFormat(value, 'dd');
        case 'week': return dateFormat(value, 'ww');
        case 'month': return dateFormat(value, 'MMM');
        case 'year': return dateFormat(value, 'yyyy');
        default: return dateFormat(value, 'MMM dd');
      }
    }
    return String(value);
  }, [period]);

  // Empty state
  if (!chartData || data.length === 0) {
    return (
      <Card style={[styles.card, ...(Array.isArray(style) ? style : style ? [style] : [])] as any}>
        <View style={styles.emptyState}>
          <Icon name="chart-line" size={48} color={colors.neutral[500]} />
          <Text style={styles.emptyTitle}>No Data Available</Text>
          <Text style={styles.emptyDescription}>
            Add data to see the trend chart
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim },
        style,
      ]}
    >
      <Card style={[styles.card, compact && styles.compactCard].filter(Boolean) as any}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
          
          {showLegend && (
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { backgroundColor: typeof color === 'string' ? color : colors.primary[500] }]} />
                <Text style={styles.legendLabel}>Actual</Text>
              </View>
              {chartData.forecast.length > 0 && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendLine, { backgroundColor: colors.neutral[500], borderStyle: 'dashed' }]} />
                  <Text style={styles.legendLabel}>Forecast</Text>
                </View>
              )}
              {trendLine && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendLine, { backgroundColor: typeof colors.success === 'string' ? colors.success : colors.success[500], borderStyle: 'dotted' }]} />
                  <Text style={styles.legendLabel}>Trend</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Chart Container */}
        <View 
          style={styles.chartContainer}
          ref={chartRef}
          {...panResponder.panHandlers}
        >
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => setScrollOffset(e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={16}
            contentContainerStyle={{ width: chartWidth }}
          >
            <View style={[styles.chart, { height: chartHeight }]}>
              <Svg width={chartWidth} height={chartHeight}>
                {/* Gradient definition */}
                {gradient && (
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={typeof color === 'string' ? color : colors.primary[500]} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={typeof color === 'string' ? color : colors.primary[500]} stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                )}

                {/* Grid lines */}
                {showGrid && (
                  <G>
                    {/* Horizontal grid lines */}
                    {[...Array(5)].map((_, i) => {
                      const y = padding.top + (graphHeight / 5) * i;
                      const value = chartData.yMax - (chartData.yMax - chartData.yMin) * (i / 5);
                      
                      return (
                        <G key={`hgrid-${i}`}>
                          <SVGLine
                            x1={padding.left}
                            y1={y}
                            x2={padding.left + graphWidth}
                            y2={y}
                            stroke={colors.neutral['200']}
                            strokeWidth={1}
                            strokeDasharray="2,2"
                            opacity={0.3}
                          />
                          <SVGText
                            x={padding.left - 10}
                            y={y + 4}
                            fontSize={10}
                            fill={colors.neutral[500]}
                            textAnchor="end"
                          >
                            {formatCurrency(value)}
                          </SVGText>
                        </G>
                      );
                    })}
                    
                    {/* Vertical grid lines */}
                    {chartData.processed.map((point, i) => {
                      const x = padding.left + chartData.xScale(point.x instanceof Date ? point.x.getTime() : point.x as number);
                      
                      return (
                        <G key={`vgrid-${i}`}>
                          <SVGLine
                            x1={x}
                            y1={padding.top}
                            x2={x}
                            y2={padding.top + graphHeight}
                            stroke={colors.neutral[200]}
                            strokeWidth={1}
                            strokeDasharray="2,2"
                            opacity={0.2}
                          />
                        </G>
                      );
                    })}
                  </G>
                )}

                {/* Y-axis label */}
                {yAxisLabel && (
                  <SVGText
                    x={10}
                    y={chartHeight / 2}
                    fontSize={12}
                    fill={colors.neutral[500]}
                    textAnchor="middle"
                    transform={`rotate(-90, 10, ${chartHeight / 2})`}
                  >
                    {yAxisLabel}
                  </SVGText>
                )}

                {/* X-axis labels */}
                <G>
                  {chartData.processed.map((point, i) => {
                    const x = padding.left + chartData.xScale(point.x instanceof Date ? point.x.getTime() : point.x as number);
                    const isMajorTick = i % Math.ceil(chartData.processed.length / 6) === 0 || i === chartData.processed.length - 1;
                    
                    if (!isMajorTick && chartData.processed.length > 10) return null;
                    
                    return (
                      <G key={`xlabel-${i}`}>
                        <SVGText
                          x={x}
                          y={padding.top + graphHeight + 20}
                          fontSize={10}
                          fill={colors.neutral[500]}
                          textAnchor="middle"
                        >
                          {formatXLabel(point.x)}
                        </SVGText>
                        <SVGLine
                          x1={x}
                          y1={padding.top + graphHeight}
                          x2={x}
                          y2={padding.top + graphHeight + 5}
                          stroke={colors.neutral[500]}
                          strokeWidth={1}
                        />
                      </G>
                    );
                  })}
                </G>

                {/* Area gradient */}
                {renderGradient()}

                {/* Main line */}
                <Path
                  ref={pathRef}
                  d={generateLinePath()}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={lineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  })}
                />

                {/* Forecast line */}
                {chartData.forecast.length > 0 && (
                  <Path
                    d={generateForecastPath()}
                    stroke={colors.neutral[500]}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="5,5"
                    opacity={0.6}
                  />
                )}

                {/* Trend line */}
                {renderTrendLine()}

                {/* Points */}
                {renderPoints()}
              </Svg>
            </View>
          </ScrollView>
          
          {/* X-axis label */}
          {xAxisLabel && (
            <Text style={styles.xAxisLabel}>{xAxisLabel}</Text>
          )}
        </View>

        {/* Selected Point Details */}
        {selectedPoint && (
          <Animated.View
            style={[
              styles.detailsPanel,
              {
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })}],
              },
            ]}
          >
            <View style={styles.detailsHeader}>
              <View style={styles.detailsIcon}>
                <Icon name="chart-line" size={20} color={colors.neutral[900]} />
              </View>
              <View style={styles.detailsContent}>
                <Text style={styles.detailsTitle}>
                  {selectedPoint.data.label || formatXLabel(selectedPoint.data.x)}
                </Text>
                <Text style={styles.detailsValue}>
                  {formatAmount(selectedPoint.data.y)}
                </Text>
              </View>
              <Badge
                text={`#${selectedPoint.index + 1}`}
                variant="outline"
              />
            </View>
            
            {selectedPoint.data.metadata && Object.keys(selectedPoint.data.metadata).length > 0 && (
              <View style={styles.metadata}>
                {Object.entries(selectedPoint.data.metadata).map(([key, value]) => (
                  <View key={key} style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>{key}:</Text>
                    <Text style={styles.metadataValue}>{value}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSelectedPoint(null);
                setTooltipData(null);
              }}
            >
              <Icon name="close" size={20} color={colors.neutral[500]} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Tooltip */}
        {tooltipData && showTooltip && (
          <Tooltip
            x={tooltipData.x + padding.left}
            y={tooltipData.y + padding.top - 60}
            title={tooltipData.data.label || formatXLabel(tooltipData.data.x)}
            value={formatAmount(tooltipData.data.y)}
            color={tooltipData.data.color || (typeof color === 'string' ? color : colors.primary[500])}
            onClose={() => setTooltipData(null)}
          />
        )}

        {/* Stats */}
        {chartData.processed.length > 1 && (
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={styles.statValue}>
                {formatAmount(chartData.processed[chartData.processed.length - 1].y)}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Change</Text>
              <Text style={[
                styles.statValue,
                {
                  color: chartData.processed[chartData.processed.length - 1].y >= chartData.processed[0].y
                    ? colors.success[500]
                    : colors.error[500],
                },
              ]}>
                {(((chartData.processed[chartData.processed.length - 1].y - chartData.processed[0].y) / 
                  chartData.processed[0].y) * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={styles.statValue}>
                {formatAmount(chartData.processed.reduce((sum, d) => sum + d.y, 0) / chartData.processed.length)}
              </Text>
            </View>
            {trendLine && (
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Trend</Text>
                <Text style={[
                  styles.statValue,
                  { color: trendLine.slope >= 0 ? colors.error[500] : colors.success[500] },
                ]}>
                  {trendLine.slope >= 0 ? '↑' : '↓'} {Math.abs(trendLine.slope).toFixed(1)}
                </Text>
              </View>
            )}
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
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
  legend: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendLine: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
  legendLabel: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  chartContainer: {
    position: 'relative',
  },
  chart: {
    position: 'relative',
  },
  xAxisLabel: {
    fontSize: 12,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 8,
  },
  detailsPanel: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    position: 'relative',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContent: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  detailsValue: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.neutral[50],
    borderRadius: 6,
  },
  metadataLabel: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  metadataValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    gap: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 11,
    color: colors.neutral[500],
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
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

export default LineChart;