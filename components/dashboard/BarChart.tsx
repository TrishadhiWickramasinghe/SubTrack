import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import * as d3 from 'd3-scale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

// Components
import { Card, Text, Loading, Badge, Tooltip } from '@components/common';
import { useCurrency } from '@hooks/useCurrency';
import { colors } from '@config/colors';
import { formatCurrency } from '@utils/currencyHelpers';

interface BarChartProps {
  data: BarData[];
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  type?: 'vertical' | 'horizontal' | 'stacked';
  animated?: boolean;
  interactive?: boolean;
  showGrid?: boolean;
  showValues?: boolean;
  showTooltip?: boolean;
  borderRadius?: number;
  barWidth?: number;
  barSpacing?: number;
  color?: string;
  gradient?: boolean;
  onBarPress?: (bar: BarData, index: number) => void;
  style?: any;
  compact?: boolean;
  showLegend?: boolean;
  maxBars?: number;
}

interface BarData {
  label: string;
  value: number;
  color?: string;
  secondaryValue?: number;
  icon?: string;
  metadata?: Record<string, any>;
}

interface TooltipData {
  x: number;
  y: number;
  bar: BarData;
  index: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data = [],
  title = 'Monthly Spending',
  subtitle,
  xAxisLabel,
  yAxisLabel,
  type = 'vertical',
  animated = true,
  interactive = true,
  showGrid = true,
  showValues = true,
  showTooltip = true,
  borderRadius = 8,
  barWidth = 0.7,
  barSpacing = 0.2,
  color = colors.primary,
  gradient = false,
  onBarPress,
  style,
  compact = false,
  showLegend = true,
  maxBars = 12,
}) => {
  const { formatWithCurrency } = useCurrency();
  
  const [selectedBar, setSelectedBar] = useState<BarData | null>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const barAnimations = useRef<Animated.Value[]>([]);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const barRefs = useRef<(TouchableOpacity | null)[]>([]);
  
  const screenWidth = Dimensions.get('window').width - 32;
  const chartWidth = Math.max(screenWidth, data.length * 60);
  const chartHeight = compact ? 200 : 280;
  const barHeight = chartHeight - 60; // Account for labels
  
  // Initialize bar animations
  useEffect(() => {
    barAnimations.current = data.map(() => new Animated.Value(0));
  }, [data.length]);

  // Animate bars on load
  useEffect(() => {
    if (animated && data.length > 0) {
      setIsAnimating(true);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.stagger(
          100,
          barAnimations.current.map(anim =>
            Animated.timing(anim, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            })
          )
        ),
      ]).start(() => setIsAnimating(false));
    }
  }, [data, animated]);

  // Process data for display
  const chartData = useMemo(() => {
    const displayData = maxBars ? data.slice(0, maxBars) : data;
    
    // Calculate max value for scaling
    const maxValue = Math.max(...displayData.map(d => 
      d.secondaryValue ? Math.max(d.value, d.secondaryValue) : d.value
    ));
    
    // Add some padding to max value
    const paddedMax = maxValue * 1.1;
    
    // Scale for values
    const scale = d3.scaleLinear()
      .domain([0, paddedMax])
      .range([0, barHeight]);
    
    return {
      labels: displayData.map(d => d.label),
      datasets: [{
        data: displayData.map(d => d.value),
        colors: displayData.map((d, index) => {
          if (d.color) return () => d.color;
          const hue = (index * 30) % 360;
          return () => `hsl(${hue}, 70%, 60%)`;
        }),
      }],
      scale,
      maxValue: paddedMax,
    };
  }, [data, maxBars, barHeight]);

  // Handle bar press
  const handleBarPress = useCallback((bar: BarData, index: number, event: any) => {
    if (!interactive) return;
    
    setSelectedBar(bar);
    onBarPress?.(bar, index);
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Show tooltip
    if (showTooltip) {
      const barRef = barRefs.current[index];
      if (barRef) {
        barRef.measure((x, y, width, height, pageX, pageY) => {
          setTooltipData({
            x: pageX + width / 2,
            y: pageY - 10,
            bar,
            index,
          });
        });
      }
    }
  }, [interactive, onBarPress, showTooltip]);

  // Handle bar hover
  const handleBarHover = useCallback((index: number | null) => {
    if (!interactive) return;
    setHoveredBar(index);
  }, [interactive]);

  // Calculate bar dimensions
  const getBarDimensions = useCallback((index: number, value: number) => {
    const barCount = chartData.labels.length;
    const totalSpacing = (barCount - 1) * barSpacing;
    const availableWidth = chartWidth - totalSpacing;
    const width = (availableWidth / barCount) * barWidth;
    
    const x = index * (width + barSpacing);
    const height = chartData.scale(value);
    const y = barHeight - height;
    
    return { x, y, width, height };
  }, [chartData, chartWidth, barWidth, barSpacing, barHeight]);

  // Render custom bars with animations
  const renderCustomBars = useCallback(() => {
    return chartData.labels.map((label, index) => {
      const bar = data[index];
      const value = bar.value;
      const { x, y, width, height } = getBarDimensions(index, value);
      
      const isSelected = selectedBar?.label === label;
      const isHovered = hoveredBar === index;
      
      const barColor = bar.color || color;
      const barStyle = {
        backgroundColor: isSelected ? barColor : isHovered ? `${barColor}CC` : `${barColor}99`,
        borderColor: isSelected ? colors.background : 'transparent',
      };
      
      // Animated height
      const animatedHeight = barAnimations.current[index]?.interpolate({
        inputRange: [0, 1],
        outputRange: [0, height],
      }) || height;
      
      return (
        <TouchableOpacity
          key={`bar-${index}`}
          ref={ref => barRefs.current[index] = ref}
          style={[
            styles.barContainer,
            { left: x, width },
          ]}
          onPress={(e) => handleBarPress(bar, index, e)}
          onPressIn={() => handleBarHover(index)}
          onPressOut={() => handleBarHover(null)}
          activeOpacity={interactive ? 0.7 : 1}
        >
          <Animated.View
            style={[
              styles.bar,
              barStyle,
              {
                height: animatedHeight,
                transform: [{ translateY: barHeight }],
                borderRadius,
              },
            ]}
          >
            {/* Gradient overlay */}
            {gradient && (
              <View style={styles.barGradient} />
            )}
            
            {/* Value label */}
            {showValues && height > 30 && (
              <Text style={styles.barValue}>
                {formatCurrency(value)}
              </Text>
            )}
          </Animated.View>
          
          {/* X-axis label */}
          <Text 
            style={[
              styles.xLabel,
              (isSelected || isHovered) && styles.xLabelActive,
            ]}
            numberOfLines={2}
          >
            {label}
          </Text>
          
          {/* Secondary bar for stacked charts */}
          {bar.secondaryValue && type === 'stacked' && (
            <Animated.View
              style={[
                styles.secondaryBar,
                {
                  backgroundColor: `${barColor}55`,
                  height: chartData.scale(bar.secondaryValue),
                  width: width * 0.8,
                  borderRadius,
                },
              ]}
            />
          )}
        </TouchableOpacity>
      );
    });
  }, [
    chartData, data, selectedBar, hoveredBar, color, gradient, showValues,
    getBarDimensions, barHeight, borderRadius, interactive, handleBarPress,
    handleBarHover, formatCurrency, type
  ]);

  // Render Y-axis labels
  const renderYAxis = useCallback(() => {
    const tickCount = 5;
    const ticks = [];
    
    for (let i = 0; i <= tickCount; i++) {
      const value = (chartData.maxValue / tickCount) * i;
      const y = barHeight - chartData.scale(value);
      
      ticks.push(
        <View key={`tick-${i}`} style={[styles.yTick, { top: y }]}>
          <View style={styles.yTickLine} />
          <Text style={styles.yTickLabel}>
            {formatCurrency(value)}
          </Text>
        </View>
      );
    }
    
    return ticks;
  }, [chartData, barHeight, formatCurrency]);

  // Handle scroll
  const handleScroll = useCallback((event: any) => {
    setScrollOffset(event.nativeEvent.contentOffset.x);
  }, []);

  // Empty state
  if (data.length === 0) {
    return (
      <Card style={[styles.card, style]}>
        <View style={styles.emptyState}>
          <Icon name="chart-bar" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Data Available</Text>
          <Text style={styles.emptyDescription}>
            Add data to see the bar chart
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
      <Card style={[styles.card, compact && styles.compactCard]}>
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
                <View style={[styles.legendColor, { backgroundColor: color }]} />
                <Text style={styles.legendLabel}>Primary</Text>
              </View>
              {data.some(d => d.secondaryValue) && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: `${color}55` }]} />
                  <Text style={styles.legendLabel}>Secondary</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Chart Container */}
        <View style={styles.chartContainer}>
          {/* Y-axis */}
          <View style={styles.yAxis}>
            {yAxisLabel && (
              <Text style={styles.yAxisLabel}>{yAxisLabel}</Text>
            )}
            <View style={styles.yAxisContainer}>
              {renderYAxis()}
            </View>
          </View>

          {/* Scrollable Chart Area */}
          <View style={styles.chartArea}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ width: chartWidth }}
            >
              <View style={[styles.chart, { height: chartHeight }]}>
                {/* Grid lines */}
                {showGrid && (
                  <View style={styles.grid}>
                    {[...Array(5)].map((_, i) => {
                      const y = (barHeight / 5) * i;
                      return (
                        <View
                          key={`grid-${i}`}
                          style={[styles.gridLine, { top: y }]}
                        />
                      );
                    })}
                  </View>
                )}

                {/* Bars */}
                {renderCustomBars()}
              </View>
            </ScrollView>
            
            {/* X-axis label */}
            {xAxisLabel && (
              <Text style={styles.xAxisLabel}>{xAxisLabel}</Text>
            )}
            
            {/* Scroll indicator */}
            {chartWidth > screenWidth && (
              <View style={styles.scrollIndicator}>
                <View style={styles.scrollTrack}>
                  <Animated.View
                    style={[
                      styles.scrollThumb,
                      {
                        width: (screenWidth / chartWidth) * 100 + '%',
                        left: (scrollOffset / (chartWidth - screenWidth)) * 100 + '%',
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Selected Bar Details */}
        {selectedBar && (
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
                {selectedBar.icon && (
                  <Icon name={selectedBar.icon} size={20} color={colors.text} />
                )}
              </View>
              <View style={styles.detailsContent}>
                <Text style={styles.detailsTitle}>{selectedBar.label}</Text>
                <Text style={styles.detailsValue}>
                  {formatWithCurrency(selectedBar.value)}
                </Text>
              </View>
              <Badge
                text={`#${data.findIndex(d => d.label === selectedBar.label) + 1}`}
                variant="outline"
              />
            </View>
            
            {selectedBar.metadata && Object.keys(selectedBar.metadata).length > 0 && (
              <View style={styles.metadata}>
                {Object.entries(selectedBar.metadata).map(([key, value]) => (
                  <View key={key} style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>{key}:</Text>
                    <Text style={styles.metadataValue}>{value}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedBar(null)}
            >
              <Icon name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Tooltip */}
        {tooltipData && showTooltip && (
          <Tooltip
            x={tooltipData.x}
            y={tooltipData.y}
            title={tooltipData.bar.label}
            value={formatWithCurrency(tooltipData.bar.value)}
            color={tooltipData.bar.color || color}
            onClose={() => setTooltipData(null)}
          />
        )}

        {/* Stats Summary */}
        {data.length > 1 && (
          <View style={styles.statsSummary}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>
                {formatWithCurrency(data.reduce((sum, d) => sum + d.value, 0))}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={styles.statValue}>
                {formatWithCurrency(data.reduce((sum, d) => sum + d.value, 0) / data.length)}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Highest</Text>
              <Text style={styles.statValue}>
                {formatWithCurrency(Math.max(...data.map(d => d.value)))}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Growth</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {data.length > 1 ? 
                  `${(((data[data.length - 1].value - data[0].value) / data[0].value) * 100).toFixed(1)}%` 
                  : '-'
                }
              </Text>
            </View>
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
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 300,
  },
  yAxis: {
    width: 60,
    paddingRight: 8,
    alignItems: 'flex-end',
  },
  yAxisLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    transform: [{ rotate: '-90deg' }],
  },
  yAxisContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  yTick: {
    position: 'absolute',
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
  },
  yTickLine: {
    width: 8,
    height: 1,
    backgroundColor: colors.border,
    marginRight: 4,
  },
  yTickLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  chart: {
    position: 'relative',
  },
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 40, // Space for labels
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border + '40',
  },
  barContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderWidth: 2,
    overflow: 'hidden',
  },
  barGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  barValue: {
    position: 'absolute',
    top: -20,
    width: '100%',
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  xLabel: {
    position: 'absolute',
    bottom: -30,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    width: '100%',
  },
  xLabelActive: {
    color: colors.text,
    fontWeight: '600',
  },
  secondaryBar: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  xAxisLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  scrollIndicator: {
    marginTop: 12,
    paddingHorizontal: 20,
  },
  scrollTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    position: 'relative',
  },
  scrollThumb: {
    position: 'absolute',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  detailsPanel: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContent: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  detailsValue: {
    fontSize: 14,
    color: colors.textSecondary,
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
    backgroundColor: colors.background,
    borderRadius: 6,
  },
  metadataLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metadataValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  statsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[900],
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default BarChart;