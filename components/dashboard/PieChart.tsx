import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    PanResponder,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
// import { PieChart as SVGPieChart } from 'react-native-svg-charts';
// import { Path, G, Text as SVGText } from 'react-native-svg';
// import * as d3 from 'd3-shape';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

// Components
import Badge from '@components/common/Badge';
import Card from '@components/common/Card';
import Loading from '@components/common/Loading';
import { ThemedText as Text } from '@components/themed-text';
import { colors } from '@config/colors';
import { useCurrency } from '@hooks/useCurrency';
import { formatCurrency } from '@utils/currencyHelpers';

// Define text colors based on your colors object structure
const textColor = colors.neutral?.[900] || '#000000';
const textSecondaryColor = colors.neutral?.[600] || '#666666';
const primaryColor = colors.primary?.[500] || '#0066CC';
const surfaceColor = colors.neutral?.[50] || '#FFFFFF';
const backgroundColor = colors.neutral?.[100] || '#F5F5F5';
const borderColor = colors.neutral?.[200] || '#E0E0E0';

interface PieChartProps {
  data: ChartData[];
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  showCenter?: boolean;
  animated?: boolean;
  interactive?: boolean;
  donut?: boolean;
  holeRadius?: number;
  radius?: number;
  onSegmentPress?: (segment: ChartData) => void;
  onCenterPress?: () => void;
  style?: any;
  compact?: boolean;
  showDetails?: boolean;
  showEmptyState?: boolean;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
  icon?: string;
  percentage?: number;
  category?: string;
}

interface SegmentInfo extends ChartData {
  startAngle: number;
  endAngle: number;
  centroid: [number, number];
}

interface LegendProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
    icon?: string;
    percentage?: number;
  }>;
  compact?: boolean;
  onItemPress?: (item: any) => void;
  selectedItem?: string;
}

const Legend: React.FC<LegendProps> = ({ data, compact, onItemPress, selectedItem }) => {
  return (
    <View style={styles.legendContainer}>
      {data.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.legendItem,
            selectedItem === item.label && styles.legendItemSelected,
          ]}
          onPress={() => onItemPress?.(item)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.legendColor,
              { backgroundColor: item.color },
            ]}
          />
          <View style={styles.legendLabel}>
            <Text style={styles.legendLabelText}>{item.label}</Text>
            <Text style={styles.legendValue}>
              {formatCurrency(item.value)} • {item.percentage?.toFixed(1)}%
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const PieChart: React.FC<PieChartProps> = ({
  data = [],
  title = 'Spending by Category',
  subtitle,
  showLegend = true,
  showLabels = true,
  showCenter = true,
  animated = true,
  interactive = true,
  donut = true,
  holeRadius = 0.6,
  radius = 0.9,
  onSegmentPress,
  onCenterPress,
  style,
  compact = false,
  showDetails = true,
  showEmptyState = true,
}) => {
  const { formatAmount } = useCurrency();
  
  const [selectedSegment, setSelectedSegment] = useState<ChartData | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<ChartData | null>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [explodedIndex, setExplodedIndex] = useState<number | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const explodeAnim = useRef(new Animated.Value(0)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => interactive,
      onMoveShouldSetPanResponder: () => interactive,
      onPanResponderGrant: (evt) => handleTouchStart(evt.nativeEvent),
      onPanResponderMove: (evt) => handleTouchMove(evt.nativeEvent),
      onPanResponderRelease: () => handleTouchEnd(),
    })
  ).current;

  const chartSize = compact ? 180 : 240;
  const chartPadding = 20;
  const chartRadius = (chartSize - chartPadding * 2) / 2;
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;

  // Calculate total and percentages
  useEffect(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    setTotalValue(total);
    
    // Sort data by value descending
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    
    // Animate chart appearance
    if (animated && data.length > 0) {
      setIsAnimating(true);
      
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => setIsAnimating(false));
    }
  }, [data]);

  // Generate pie data with angles
  const pieData = useMemo(() => {
    if (data.length === 0) return [];
    
    // Simple pie calculation without d3
    let currentAngle = -Math.PI / 2;
    const arcs: any[] = [];
    
    data.forEach((item) => {
      const sliceAngle = (item.value / totalValue) * 2 * Math.PI;
      arcs.push({
        data: item,
        startAngle: currentAngle,
        endAngle: currentAngle + sliceAngle,
      });
      currentAngle += sliceAngle;
    });
    
    return arcs.map((arc: any, index: number) => {
      const percentage = (arc.data.value / totalValue) * 100;
      const midAngle = (arc.startAngle + arc.endAngle) / 2;
      const radius = (chartRadius * (donut ? 0.6 : 0.5));
      const centroidX = Math.cos(midAngle) * radius;
      const centroidY = Math.sin(midAngle) * radius;
      
      return {
        ...arc.data,
        percentage,
        startAngle: arc.startAngle,
        endAngle: arc.endAngle,
        centroid: [centroidX, centroidY],
        padAngle: 0.02,
      };
    });
  }, [data, totalValue]);

  // Handle touch interactions
  const handleTouchStart = useCallback((event: { locationX: number; locationY: number }) => {
    if (!interactive || pieData.length === 0) return;
    
    const { locationX, locationY } = event;
    const touchX = locationX - centerX;
    const touchY = locationY - centerY;
    
    // Check if touch is within chart radius
    const distance = Math.sqrt(touchX * touchX + touchY * touchY);
    if (distance > chartRadius * radius) return;
    
    // Find segment based on angle
    const angle = Math.atan2(touchY, touchX);
    const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
    
    const segment = pieData.find(s => 
      normalizedAngle >= s.startAngle && normalizedAngle <= s.endAngle
    );
    
    if (segment) {
      setHoveredSegment(segment);
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [pieData, interactive, centerX, centerY, chartRadius, radius]);

  const handleTouchMove = useCallback((event: { locationX: number; locationY: number }) => {
    if (!interactive || pieData.length === 0) return;
    
    const { locationX, locationY } = event;
    const touchX = locationX - centerX;
    const touchY = locationY - centerY;
    
    const angle = Math.atan2(touchY, touchX);
    const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
    
    const segment = pieData.find((s: SegmentInfo) => 
      normalizedAngle >= s.startAngle && normalizedAngle <= s.endAngle
    );
    
    if (segment && segment !== hoveredSegment) {
      setHoveredSegment(segment);
    }
  }, [pieData, hoveredSegment, interactive, centerX, centerY]);

  const handleTouchEnd = useCallback(() => {
    if (hoveredSegment) {
      setSelectedSegment(hoveredSegment);
      onSegmentPress?.(hoveredSegment);
      
      // Explode animation for selected segment
      const segmentIndex = pieData.findIndex((s: SegmentInfo) => s.label === hoveredSegment.label);
      setExplodedIndex(segmentIndex);
      
      Animated.sequence([
        Animated.timing(explodeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(explodeAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => setExplodedIndex(null));
    }
    
    setHoveredSegment(null);
  }, [hoveredSegment, pieData, onSegmentPress]);

  const handleRotate = useCallback(() => {
    Animated.timing(rotateAnim, {
      toValue: rotation + 0.5,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => setRotation(prev => prev + 0.5));
  }, [rotation, rotateAnim]);

  const handleCenterPress = useCallback(() => {
    if (onCenterPress) {
      onCenterPress();
    } else {
      // Default center press action - reset selection
      setSelectedSegment(null);
      handleRotate();
    }
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [onCenterPress, handleRotate]);

  // Calculate arc paths using SVG arc commands
  const calculateArc = useCallback((startAngle: number, endAngle: number, radius: number): string => {
    const innerRadius = donut ? radius * holeRadius : 0;
    const outerRadius = radius;
    
    const x1 = Math.cos(startAngle) * outerRadius;
    const y1 = Math.sin(startAngle) * outerRadius;
    const x2 = Math.cos(endAngle) * outerRadius;
    const y2 = Math.sin(endAngle) * outerRadius;
    
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    
    if (donut) {
      const x3 = Math.cos(endAngle) * innerRadius;
      const y3 = Math.sin(endAngle) * innerRadius;
      const x4 = Math.cos(startAngle) * innerRadius;
      const y4 = Math.sin(startAngle) * innerRadius;
      
      return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    }
    
    return `M 0 0 L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }, [donut, holeRadius]);

  // Get segment color with hover/selection effects
  const getSegmentColor = useCallback((segment: ChartData, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return segment.color;
    if (isHovered) return `${segment.color}CC`; // Slightly transparent
    return `${segment.color}99`; // More transparent
  }, []);

  // Render custom labels
  const renderLabels = useCallback(() => {
    // Commented out - requires react-native-svg
    // if (!showLabels || pieData.length === 0) return null;
    return null;
  }, [pieData, selectedSegment, hoveredSegment, showLabels, compact, chartRadius, donut, centerX, centerY]);

  // Render center content
  const renderCenterContent = useCallback(() => {
    if (!showCenter || !donut) return null;
    
    const displaySegment = selectedSegment || hoveredSegment;
    const centerRadius = chartRadius * holeRadius * 0.8;
    
    return (
      <TouchableOpacity
        style={[
          styles.centerCircle,
          {
            width: centerRadius * 2,
            height: centerRadius * 2,
            borderRadius: centerRadius,
            backgroundColor: displaySegment?.color + '20' || surfaceColor,
          },
        ]}
        onPress={handleCenterPress}
        activeOpacity={0.7}
        disabled={!interactive}
      >
        {displaySegment ? (
          <View style={styles.centerContent}>
            {displaySegment.icon && (
              <Text style={{ fontSize: compact ? 20 : 24, color: displaySegment.color, marginBottom: 4 }}>
                📊
              </Text>
            )}
            <Text style={[styles.centerLabel, { color: displaySegment.color }]}>
              {displaySegment.label}
            </Text>
            <Text style={styles.centerValue}>
              {formatCurrency(displaySegment.value)}
            </Text>
            <Text style={styles.centerPercentage}>
              {displaySegment.percentage?.toFixed(1)}%
            </Text>
          </View>
        ) : (
          <View style={styles.centerContent}>
            <Text style={styles.centerTotalLabel}>Total</Text>
            <Text style={styles.centerTotalValue}>
              {formatAmount(totalValue, 'USD')}
            </Text>
            <Text style={styles.centerSegmentCount}>
              {data.length} {data.length === 1 ? 'category' : 'categories'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [
    showCenter, donut, selectedSegment, hoveredSegment, chartRadius, holeRadius, 
    interactive, compact, totalValue, data.length, handleCenterPress, formatAmount
  ]);

  // Empty state
  if (showEmptyState && data.length === 0) {
    return (
      <Card style={{ ...styles.card, ...(style as any) } as any}>
        <View style={styles.emptyState}>
          {/* <Icon name="chart-pie" size={48} color={textSecondaryColor} /> */}
          <Text style={styles.emptyTitle}>No Data Available</Text>
          <Text style={styles.emptyDescription}>
            Add subscriptions to see spending breakdown
          </Text>
        </View>
      </Card>
    );
  }

  // Loading state during animation
  if (isAnimating && data.length > 0) {
    return (
      <Card style={[styles.card, style as any] as any}>
        <View style={styles.loadingContainer}>
          <Loading message="Generating chart..." />
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
          transform: [
            { scale: scaleAnim },
            { rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            })},
          ],
        },
        style,
      ].filter(Boolean)}
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
          {interactive && (
            <TouchableOpacity
              style={styles.rotateButton}
              onPress={handleRotate}
              activeOpacity={0.7}
            >
              {/* <Icon name="rotate-right" size={20} color={primaryColor} /> */}
              <Text style={{ color: primaryColor }}>⟳</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Chart Container */}
        <View 
          style={[
            styles.chartContainer,
            { height: chartSize },
          ]}
          {...panResponder.panHandlers}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setChartDimensions({ width, height });
          }}
        >
          <View style={styles.svgContainer}>
            {/* Pie chart visualization requires react-native-svg - commented out */}
            {/* Placeholder for pie chart */}
            <View style={{ width: chartSize, height: chartSize, backgroundColor: backgroundColor, borderRadius: 12 }}>
              <Text style={{ padding: 16, textAlign: 'center', color: textSecondaryColor }}>
                Pie Chart Visualization
              </Text>
            </View>
            
            {/* Center Content */}
            {renderCenterContent()}
          </View>
        </View>

        {/* Details Panel */}
        {showDetails && selectedSegment && (
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
              <View style={[styles.categoryIcon, { backgroundColor: selectedSegment.color + '20' }]}>
                {selectedSegment.icon ? (
                  // <Icon name={selectedSegment.icon} size={20} color={selectedSegment.color} />
                  <Text style={[styles.categoryInitial, { color: selectedSegment.color }]}>
                    {selectedSegment.label.charAt(0)}
                  </Text>
                ) : (
                  <Text style={[styles.categoryInitial, { color: selectedSegment.color }]}>
                    {selectedSegment.label.charAt(0)}
                  </Text>
                )}
              </View>
              <View style={styles.detailsInfo}>
                <Text style={styles.detailsTitle}>{selectedSegment.label}</Text>
                <Text style={styles.detailsSubtitle}>
                  {selectedSegment.category || 'Category'}
                </Text>
              </View>
              <Badge
                text={`${selectedSegment.percentage?.toFixed(1)}%`}
                variant="filled"
                color={selectedSegment.color as any}
              />
            </View>
            
            <View style={styles.detailsStats}>
              <View style={styles.detailStat}>
                <Text style={styles.detailStatLabel}>Amount</Text>
                <Text style={[styles.detailStatValue, { color: selectedSegment.color }]}>
                  {formatAmount(selectedSegment.value, 'USD')}
                </Text>
              </View>
              <View style={styles.detailStat}>
                <Text style={styles.detailStatLabel}>Share</Text>
                <Text style={styles.detailStatValue}>
                  {selectedSegment.percentage?.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.detailStat}>
                <Text style={styles.detailStatLabel}>Rank</Text>
                <Text style={styles.detailStatValue}>
                  #{pieData.findIndex((s: SegmentInfo) => s.label === selectedSegment.label) + 1}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedSegment(null)}
            >
              {/* <Icon name="close" size={20} color={textSecondaryColor} /> */}
              <Text style={{ color: textSecondaryColor, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Legend - component not implemented */}
        {showLegend && (
          <View style={styles.legendPlaceholder}>
            <Text style={styles.legendTitle}>Categories</Text>
            {pieData.map((item: SegmentInfo) => (
              <View key={item.label} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <View style={styles.legendItemInfo}>
                  <Text style={styles.legendItemLabel}>{item.label}</Text>
                  <Text style={styles.legendItemValue}>{item.percentage?.toFixed(1)}%</Text>
                </View>
              </View>
            ))}
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
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: textColor,
  },
  subtitle: {
    fontSize: 14,
    color: textSecondaryColor,
    marginTop: 2,
  },
  rotateButton: {
    padding: 8,
    backgroundColor: surfaceColor,
    borderRadius: 20,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  svgContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    height: '100%',
    width: '100%',
  },
  centerCircle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: backgroundColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  centerLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 2,
  },
  centerValue: {
    fontSize: 14,
    fontWeight: '700',
    color: textColor,
  },
  centerPercentage: {
    fontSize: 11,
    color: textSecondaryColor,
    marginTop: 2,
  },
  centerTotalLabel: {
    fontSize: 14,
    color: textSecondaryColor,
    marginBottom: 4,
  },
  centerTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: textColor,
  },
  centerSegmentCount: {
    fontSize: 11,
    color: textSecondaryColor,
    marginTop: 4,
  },
  detailsPanel: {
    marginTop: 16,
    padding: 16,
    backgroundColor: surfaceColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderColor,
    position: 'relative',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInitial: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailsInfo: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: textColor,
    marginBottom: 2,
  },
  detailsSubtitle: {
    fontSize: 14,
    color: textSecondaryColor,
  },
  detailsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  detailStat: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: backgroundColor,
    borderRadius: 8,
  },
  detailStatLabel: {
    fontSize: 12,
    color: textSecondaryColor,
    marginBottom: 4,
  },
  detailStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: textColor,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  loadingContainer: {
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: textColor,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: textSecondaryColor,
    textAlign: 'center',
  },
  legendContainer: {
    gap: 8,
  },
  legendPlaceholder: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: borderColor,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: textColor,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendItemSelected: {
    opacity: 1,
  },
  legendLabel: {
    flex: 1,
  },
  legendLabelText: {
    fontSize: 14,
    fontWeight: '500',
    color: textColor,
  },
  legendValue: {
    fontSize: 12,
    color: textSecondaryColor,
    marginTop: 2,
  },
  legendItemInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: textColor,
  },
  legendItemValue: {
    fontSize: 12,
    color: textSecondaryColor,
  },
});

export default PieChart;