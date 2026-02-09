import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import React, { memo } from 'react';
import {
    Animated,
    Easing,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Components
import Badge from '@components/common/Badge';
import { colors } from '@config/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: string;
  variant?: 'default' | 'highlight' | 'muted' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  trend?: number; // -1 for down, 0 for neutral, 1 for up
  change?: string;
  suffix?: string;
  prefix?: string;
  isLoading?: boolean;
  animation?: 'counter' | 'pulse' | 'none';
  onPress?: () => void;
  style?: any;
  showTrend?: boolean;
  compact?: boolean;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = memo(({
  title,
  value,
  icon = 'chart-line',
  color = colors.primary[500],
  variant = 'default',
  size = 'medium',
  trend = 0,
  change,
  suffix = '',
  prefix = '',
  isLoading = false,
  animation = 'none',
  onPress,
  style,
  showTrend = true,
  compact = false,
  badge,
}) => {
  const [animatedValue] = React.useState(new Animated.Value(0));
  const [displayValue, setDisplayValue] = React.useState('0');
  const [pulseAnim] = React.useState(new Animated.Value(1));

  // Ensure color is always a string
  const ensureStringColor = (col: any): string => {
    if (typeof col === 'string') return col;
    if (typeof col === 'object' && col[500]) return col[500];
    return colors.primary[500];
  };
  
  const colorString = ensureStringColor(color);

  // Define variant styles
  const variantStyles = {
    default: {
      backgroundColor: colors.neutral[50],
      textColor: colors.neutral[900],
      iconColor: colorString,
    },
    highlight: {
      backgroundColor: colorString + '20',
      textColor: colorString,
      iconColor: colorString,
    },
    muted: {
      backgroundColor: colors.neutral[50],
      textColor: colors.neutral[500],
      iconColor: colors.neutral[500],
    },
    warning: {
      backgroundColor: colors.warning[500] + '20',
      textColor: colors.warning[500],
      iconColor: colors.warning[500],
    },
    danger: {
      backgroundColor: colors.error[500] + '20',
      textColor: colors.error[500],
      iconColor: colors.error[500],
    },
  };

  const currentVariant = variantStyles[variant];

  // Size definitions
  const sizeStyles = {
    small: {
      padding: 12,
      iconSize: 20,
      titleSize: 12,
      valueSize: 18,
      changeSize: 11,
    },
    medium: {
      padding: 16,
      iconSize: 24,
      titleSize: 14,
      valueSize: 24,
      changeSize: 12,
    },
    large: {
      padding: 24,
      iconSize: 32,
      titleSize: 16,
      valueSize: 32,
      changeSize: 14,
    },
  };

  const currentSize = sizeStyles[size];

  // Counter animation
  React.useEffect(() => {
    if (animation === 'counter' && typeof value === 'number') {
      const duration = 1500;
      const steps = 60;
      const stepValue = value / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        setDisplayValue((currentStep * stepValue).toFixed(0));
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setDisplayValue(value.toString());
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value.toString());
    }
  }, [value, animation]);

  // Pulse animation
  React.useEffect(() => {
    if (animation === 'pulse') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animation, pulseAnim]);

  // Haptic feedback on press
  const handlePress = (): void => {
    if (onPress) {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }
  };

  // Format value with prefix/suffix
  const formattedValue = `${prefix}${displayValue}${suffix}`;

  // Get trend icon and color
  const getTrendInfo = () => {
    if (trend > 0) {
      return {
        icon: 'trending-up',
        color: colors.success[500],
        label: 'Increase',
      };
    } else if (trend < 0) {
      return {
        icon: 'trending-down',
        color: colors.error[500],
        label: 'Decrease',
      };
    } else {
      return {
        icon: 'trending-neutral',
        color: colors.neutral[500],
        label: 'No change',
      };
    }
  };

  const trendInfo = getTrendInfo();

  // Render loading skeleton
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { padding: currentSize.padding }, style]}>
        <View style={styles.loadingIcon} />
        <View style={styles.loadingTextContainer}>
          <View style={[styles.loadingTitle, { width: 80 }]} />
          <View style={[styles.loadingValue, { width: 120 }]} />
        </View>
      </View>
    );
  }

  const CardContent = (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: currentVariant.backgroundColor,
          padding: currentSize.padding,
          transform: [{ scale: pulseAnim }],
        },
        compact && styles.compactContainer,
        style,
      ]}
    >
      {/* Icon and Badge */}
      <View style={styles.headerRow}>
        <View style={[styles.iconContainer, { backgroundColor: currentVariant.iconColor + '20' }]}>
          <MaterialCommunityIcons
            name={icon as any}
            size={currentSize.iconSize}
            color={currentVariant.iconColor}
          />
        </View>
        
        {badge && (
          <Badge
            text={badge}
            variant="outlined"
            size="small"
            style={styles.badge}
          />
        )}
        
        {showTrend && trend !== 0 && (
          <MaterialCommunityIcons
            name={trendInfo.icon as any}
            size={16}
            color={trendInfo.color}
            style={styles.trendIcon}
          />
        )}
      </View>

      {/* Value */}
      <Text
        style={[
          styles.value,
          {
            color: currentVariant.textColor,
            fontSize: currentSize.valueSize,
            marginTop: compact ? 8 : 16,
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formattedValue}
      </Text>

      {/* Title and Change */}
      <View style={styles.footerRow}>
        <Text
          style={[
            styles.title,
            {
              color: currentVariant.textColor,
              fontSize: currentSize.titleSize,
              opacity: 0.8,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        
        {change && (
          <Text
            style={[
              styles.change,
              {
                color: trendInfo.color,
                fontSize: currentSize.changeSize,
              },
            ]}
          >
            {trend > 0 ? '+' : ''}{change}
          </Text>
        )}
      </View>

      {/* Additional Info for Large Cards */}
      {size === 'large' && trend !== 0 && (
        <View style={styles.trendInfo}>
          <MaterialCommunityIcons name={trendInfo.icon as any} size={16} color={trendInfo.color} />
          <Text style={[styles.trendLabel, { color: trendInfo.color }]}>
            {trendInfo.label}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={styles.touchable}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 120,
  },
  compactContainer: {
    minWidth: 100,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    marginLeft: 'auto',
  },
  trendIcon: {
    marginLeft: 8,
  },
  value: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  title: {
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  change: {
    fontWeight: '600',
  },
  trendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  trendLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  loadingContainer: {
    overflow: 'hidden',
  },
  loadingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.neutral[200],
  },
  loadingTextContainer: {
    marginTop: 16,
    gap: 8,
  },
  loadingTitle: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.neutral[200],
  },
  loadingValue: {
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.neutral[200],
  },
});

// Export with display name for React DevTools
StatCard.displayName = 'StatCard';

export default StatCard;