import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Components
import { Text } from '@components/common';
import { colors } from '@config/colors';

interface TrendIndicatorProps {
  value: number;
  label?: string;
  showValue?: boolean;
  showLabel?: boolean;
  showArrow?: boolean;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact' | 'detailed' | 'interactive';
  animation?: 'none' | 'pulse' | 'slide' | 'bounce';
  duration?: number;
  precision?: number;
  suffix?: string;
  prefix?: string;
  onPress?: () => void;
  showTooltip?: boolean;
  tooltipText?: string;
  comparisonValue?: number;
  showComparison?: boolean;
  thresholds?: {
    positive: number;
    negative: number;
    warning: number;
  };
  customColors?: {
    positive: string;
    negative: string;
    neutral: string;
    warning: string;
  };
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  label = 'Change',
  showValue = true,
  showLabel = true,
  showArrow = true,
  showIcon = false,
  size = 'medium',
  variant = 'default',
  animation = 'pulse',
  duration = 800,
  precision = 1,
  suffix = '%',
  prefix = '',
  onPress,
  showTooltip = false,
  tooltipText,
  comparisonValue,
  showComparison = false,
  thresholds = {
    positive: 5,
    negative: -5,
    warning: 10,
  },
  customColors,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Define colors
  const indicatorColors = customColors || {
    positive: colors.success[500],
    negative: colors.error[500],
    neutral: colors.neutral[600],
    warning: colors.warning[500],
  };

  // Calculate trend properties
  const trend = useMemo(() => {
    const absValue = Math.abs(value);
    const isPositive = value > 0;
    const isNegative = value < 0;
    const isNeutral = value === 0;
    const isSignificant = Math.abs(value) >= thresholds.positive;
    const isWarning = Math.abs(value) >= thresholds.warning;
    const isExtreme = Math.abs(value) >= thresholds.warning * 2;
    
    // Get icon based on value
    let icon = 'trending-neutral';
    if (isPositive && isSignificant) icon = 'trending-up';
    if (isNegative && isSignificant) icon = 'trending-down';
    if (isPositive && isWarning) icon = 'arrow-up-thick';
    if (isNegative && isWarning) icon = 'arrow-down-thick';
    if (isExtreme) icon = 'alert-circle';
    
    // Get color based on value
    let color = indicatorColors.neutral;
    if (isPositive && isSignificant) color = indicatorColors.positive;
    if (isNegative && isSignificant) color = indicatorColors.negative;
    if (isWarning) color = indicatorColors.warning;
    
    // Get label text
    let statusLabel = 'Stable';
    if (isPositive && isSignificant) statusLabel = 'Increasing';
    if (isNegative && isSignificant) statusLabel = 'Decreasing';
    if (isWarning) statusLabel = isPositive ? 'Rising Fast' : 'Falling Fast';
    if (isExtreme) statusLabel = isPositive ? 'Sharp Increase' : 'Sharp Decline';
    
    return {
      value,
      absValue,
      isPositive,
      isNegative,
      isNeutral,
      isSignificant,
      isWarning,
      isExtreme,
      icon,
      color,
      statusLabel,
      formattedValue: `${prefix}${value >= 0 ? '+' : ''}${value.toFixed(precision)}${suffix}`,
      direction: isPositive ? 'up' : isNegative ? 'down' : 'neutral',
    };
  }, [value, thresholds, indicatorColors, prefix, suffix, precision]);

  // Animation effects
  useEffect(() => {
    if (animation === 'none') return;

    setIsAnimating(true);
    
    switch (animation) {
      case 'pulse':
        if (trend.isSignificant) {
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: duration / 2,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: duration / 2,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]).start(() => {
            setIsAnimating(false);
            setPulseCount(prev => prev + 1);
          });
        }
        break;
        
      case 'slide':
        slideAnim.setValue(-20);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }).start(() => setIsAnimating(false));
        break;
        
      case 'bounce':
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: duration / 2,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => setIsAnimating(false));
        break;
    }
  }, [value, animation, duration, trend.isSignificant]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  // Rotate animation for arrow
  useEffect(() => {
    if (showArrow && trend.isSignificant) {
      Animated.timing(rotateAnim, {
        toValue: trend.isPositive ? 0.25 : -0.25,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }).start();
    }
  }, [trend.isSignificant, trend.isPositive, showArrow]);

  // Size definitions
  const sizeStyles = useMemo(() => {
    switch (size) {
      case 'small':
        return {
          container: 24,
          icon: 14,
          fontSize: 11,
          padding: 4,
          borderRadius: 6,
        };
      case 'medium':
        return {
          container: 32,
          icon: 18,
          fontSize: 14,
          padding: 8,
          borderRadius: 8,
        };
      case 'large':
        return {
          container: 40,
          icon: 22,
          fontSize: 16,
          padding: 12,
          borderRadius: 10,
        };
      default:
        return {
          container: 32,
          icon: 18,
          fontSize: 14,
          padding: 8,
          borderRadius: 8,
        };
    }
  }, [size]);

  // Variant styles
  const getVariantStyle = useMemo(() => {
    const baseStyle = {
      backgroundColor: trend.color + '20',
      borderColor: trend.color,
    };
    
    switch (variant) {
      case 'compact':
        return {
          ...baseStyle,
          paddingHorizontal: sizeStyles.padding / 2,
          paddingVertical: sizeStyles.padding / 4,
        } as const;
      case 'detailed':
        return {
          ...baseStyle,
          padding: sizeStyles.padding,
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          gap: 8,
        };
      case 'interactive':
        return {
          ...baseStyle,
          padding: sizeStyles.padding,
          borderWidth: 2,
        } as const;
      default:
        return {
          ...baseStyle,
          paddingHorizontal: sizeStyles.padding,
          paddingVertical: sizeStyles.padding / 2,
        } as const;
    }
  }, [variant, trend.color, sizeStyles.padding]);

  // Handle press
  const handlePress = () => {
    if (onPress) {
      onPress();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (variant === 'interactive' || showTooltip) {
      setShowDetails(!showDetails);
      
      if (showDetails) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  // Calculate bounce translation
  const bounceTranslation = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  // Calculate arrow rotation
  const arrowRotation = rotateAnim.interpolate({
    inputRange: [-0.25, 0, 0.25],
    outputRange: ['-45deg', '0deg', '45deg'],
  });

  // Render compact variant
  const renderCompact = () => (
    <Animated.View
      style={[
        styles.compactContainer,
        getVariantStyle,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
            { translateY: bounceTranslation },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      {showArrow && (
        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          <Icon
            name={trend.isPositive ? 'chevron-up' : trend.isNegative ? 'chevron-down' : 'minus'}
            size={sizeStyles.icon}
            color={trend.color}
          />
        </Animated.View>
      )}
      {showValue && (
        <Text
          style={[
            styles.valueText,
            { fontSize: sizeStyles.fontSize, color: trend.color },
          ]}
          numberOfLines={1}
        >
          {trend.formattedValue}
        </Text>
      )}
    </Animated.View>
  );

  // Render default variant
  const renderDefault = () => (
    <Animated.View
      style={[
        styles.defaultContainer,
        getVariantStyle,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
            { translateY: bounceTranslation },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.content}>
        {showIcon && (
          <Icon
            name={trend.icon}
            size={sizeStyles.icon}
            color={trend.color}
            style={styles.icon}
          />
        )}
        {showArrow && !showIcon && (
          <Animated.View style={[styles.arrow, { transform: [{ rotate: arrowRotation }] }]}>
            <Icon
              name={trend.isPositive ? 'chevron-up' : trend.isNegative ? 'chevron-down' : 'minus'}
              size={sizeStyles.icon}
              color={trend.color}
            />
          </Animated.View>
        )}
        <View style={styles.textContainer}>
          {showLabel && (
            <Text
              style={[
                styles.labelText,
                { fontSize: sizeStyles.fontSize - 2 },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          )}
          {showValue && (
            <Text
              style={[
                styles.valueText,
                { fontSize: sizeStyles.fontSize, color: trend.color },
              ]}
              numberOfLines={1}
            >
              {trend.formattedValue}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );

  // Render detailed variant
  const renderDetailed = () => (
    <Animated.View
      style={[
        styles.detailedContainer,
        getVariantStyle,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
            { translateY: bounceTranslation },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.detailedContent}>
        <View style={styles.detailedIcon}>
          <Icon
            name={trend.icon}
            size={sizeStyles.icon + 4}
            color={trend.color}
          />
        </View>
        
        <View style={styles.detailedText}>
          <Text style={styles.detailedLabel}>{label}</Text>
          <Text style={[styles.detailedValue, { color: trend.color }]}>
            {trend.formattedValue}
          </Text>
          <Text style={styles.detailedStatus}>{trend.statusLabel}</Text>
        </View>
        
        {showComparison && comparisonValue !== undefined && (
          <View style={styles.comparison}>
            <Text style={styles.comparisonLabel}>vs target</Text>
            <Text style={[
              styles.comparisonValue,
              { color: value >= comparisonValue ? colors.success[500] : colors.error[500] },
            ]}>
              {value >= comparisonValue ? '✓' : '✗'}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  // Render interactive variant
  const renderInteractive = () => (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.interactiveWrapper}
    >
      <Animated.View
        style={[
          styles.interactiveContainer,
          getVariantStyle,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.interactiveContent}>
          <View style={styles.interactiveMain}>
            {showIcon && (
              <Icon
                name={trend.icon}
                size={sizeStyles.icon}
                color={trend.color}
              />
            )}
            <View style={styles.interactiveText}>
              <Text style={styles.interactiveLabel}>{label}</Text>
              <Text style={[styles.interactiveValue, { color: trend.color }]}>
                {trend.formattedValue}
              </Text>
            </View>
          </View>
          
          <Icon
            name={showDetails ? 'chevron-up' : 'chevron-down'}
            size={sizeStyles.icon}
            color={trend.color}
          />
        </View>
        
        {showDetails && (
          <Animated.View
            style={[
              styles.detailsPanel,
              {
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                })}],
              },
            ]}
          >
            <Text style={styles.detailsTitle}>{trend.statusLabel}</Text>
            {tooltipText && (
              <Text style={styles.detailsText}>{tooltipText}</Text>
            )}
            
            {showComparison && comparisonValue !== undefined && (
              <View style={styles.comparisonDetails}>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Current:</Text>
                  <Text style={styles.comparisonValue}>{trend.formattedValue}</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Target:</Text>
                  <Text style={styles.comparisonValue}>
                    {prefix}{comparisonValue >= 0 ? '+' : ''}{comparisonValue.toFixed(precision)}{suffix}
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Difference:</Text>
                  <Text style={[
                    styles.comparisonValue,
                    { color: value >= comparisonValue ? colors.success[500] : colors.error[500] },
                  ]}>
                    {value >= comparisonValue ? '+' : ''}{(value - comparisonValue).toFixed(precision)}{suffix}
                  </Text>
                </View>
              </View>
            )}
            
            {trend.isWarning && (
              <View style={styles.warningNote}>
                <Icon name="alert" size={14} color={colors.warning[500]} />
                <Text style={styles.warningText}>
                  {trend.isPositive ? 'Rising faster than usual' : 'Falling faster than usual'}
                </Text>
              </View>
            )}
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );

  // Choose render method based on variant
  const renderContent = () => {
    switch (variant) {
      case 'compact':
        return renderCompact();
      case 'detailed':
        return renderDetailed();
      case 'interactive':
        return renderInteractive();
      default:
        return renderDefault();
    }
  };

  // Add press handler for non-interactive variants
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? {
    onPress: handlePress,
    activeOpacity: 0.7,
  } : {};

  if (variant === 'interactive') {
    return renderContent();
  }

  return (
    <Wrapper {...wrapperProps} style={styles.wrapper}>
      {renderContent()}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  defaultContainer: {
    borderRadius: 8,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  arrow: {
    marginRight: 4,
  },
  textContainer: {
    alignItems: 'center',
  },
  labelText: {
    color: colors.neutral[600],
    fontWeight: '500',
  },
  valueText: {
    fontWeight: '700',
  },
  detailedContainer: {
    borderRadius: 10,
    borderWidth: 1,
  },
  detailedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailedText: {
    flex: 1,
  },
  detailedLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    marginBottom: 2,
  },
  detailedValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  detailedStatus: {
    fontSize: 11,
    color: colors.neutral[600],
  },
  comparison: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 10,
    color: colors.neutral[600],
    marginBottom: 2,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  interactiveWrapper: {
    alignSelf: 'flex-start',
  },
  interactiveContainer: {
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 160,
  },
  interactiveContent: {
    padding: 12,
  },
  interactiveMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  interactiveText: {
    flex: 1,
  },
  interactiveLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    marginBottom: 2,
  },
  interactiveValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  detailsPanel: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 18,
    marginBottom: 12,
  },
  comparisonDetails: {
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  warningNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: colors.warning[500],
    fontWeight: '500',
  },
});

export default TrendIndicator;