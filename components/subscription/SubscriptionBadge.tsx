import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Types
interface SubscriptionBadgeProps {
  type: 'status' | 'category' | 'priority' | 'notification' | 'trial' | 'split' | 'payment' | 'custom';
  value: string | number;
  size?: 'xs' | 'small' | 'medium' | 'large';
  color?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  showIcon?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  onPress?: () => void;
  animated?: boolean;
  pulse?: boolean;
  gradient?: boolean;
  outline?: boolean;
  rounded?: boolean;
  maxWidth?: number;
  disabled?: boolean;
  textColor?: string;
  shadow?: boolean;
  count?: number;
  showCount?: boolean;
  countPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  countColor?: string;
  countTextColor?: string;
  customStyle?: any;
  showTooltip?: boolean;
  tooltipText?: string;
  accessibilityLabel?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = memo(
  ({
    type,
    value,
    size = 'medium',
    color,
    icon,
    iconPosition = 'left',
    showIcon = false,
    showClose = false,
    onClose,
    onPress,
    animated = false,
    pulse = false,
    gradient = false,
    outline = false,
    rounded = false,
    maxWidth = 200,
    disabled = false,
    textColor,
    shadow = true,
    count = 0,
    showCount = false,
    countPosition = 'top-right',
    countColor,
    countTextColor = '#fff',
    customStyle,
    showTooltip = false,
    tooltipText,
    accessibilityLabel,
  }) => {
    // State
    const [isPressed, setIsPressed] = useState(false);
    const [showTooltipState, setShowTooltipState] = useState(false);

    // Animation values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;
    const countScaleAnim = useRef(new Animated.Value(0)).current;

    // Type-based defaults
    const typeDefaults = useMemo(() => {
      const defaults = {
        status: {
          active: { color: '#34C759', icon: 'check-circle', text: 'Active' },
          paused: { color: '#FF9500', icon: 'pause-circle', text: 'Paused' },
          cancelled: { color: '#FF3B30', icon: 'cancel', text: 'Cancelled' },
          pending: { color: '#FFCC00', icon: 'clock', text: 'Pending' },
          expired: { color: '#8E8E93', icon: 'alert-circle', text: 'Expired' },
        },
        category: {
          entertainment: { color: '#FF2D55', icon: 'movie', text: 'Entertainment' },
          productivity: { color: '#007AFF', icon: 'briefcase', text: 'Productivity' },
          utilities: { color: '#5856D6', icon: 'tools', text: 'Utilities' },
          fitness: { color: '#34C759', icon: 'dumbbell', text: 'Fitness' },
          food: { color: '#FF9500', icon: 'food', text: 'Food' },
          shopping: { color: '#AF52DE', icon: 'shopping', text: 'Shopping' },
          travel: { color: '#5AC8FA', icon: 'airplane', text: 'Travel' },
          finance: { color: '#FFCC00', icon: 'currency-usd', text: 'Finance' },
        },
        priority: {
          high: { color: '#FF3B30', icon: 'alert', text: 'High' },
          medium: { color: '#FF9500', icon: 'alert-circle', text: 'Medium' },
          low: { color: '#34C759', icon: 'check-circle', text: 'Low' },
          none: { color: '#8E8E93', icon: 'circle', text: 'None' },
        },
        notification: {
          enabled: { color: '#34C759', icon: 'bell', text: 'Reminders On' },
          disabled: { color: '#8E8E93', icon: 'bell-off', text: 'Reminders Off' },
          muted: { color: '#FF9500', icon: 'volume-off', text: 'Muted' },
        },
        trial: {
          active: { color: '#5AC8FA', icon: 'clock', text: 'Trial Active' },
          ending: { color: '#FF9500', icon: 'clock-alert', text: 'Trial Ending' },
          ended: { color: '#FF3B30', icon: 'clock-remove', text: 'Trial Ended' },
        },
        split: {
          shared: { color: '#5856D6', icon: 'account-group', text: 'Shared' },
          personal: { color: '#34C759', icon: 'account', text: 'Personal' },
          owed: { color: '#FF9500', icon: 'currency-usd', text: 'Owed' },
          paid: { color: '#007AFF', icon: 'check', text: 'Paid' },
        },
        payment: {
          paid: { color: '#34C759', icon: 'check-circle', text: 'Paid' },
          pending: { color: '#FFCC00', icon: 'clock', text: 'Pending' },
          overdue: { color: '#FF3B30', icon: 'alert-circle', text: 'Overdue' },
          failed: { color: '#FF2D55', icon: 'close-circle', text: 'Failed' },
        },
        custom: {
          default: { color: '#007AFF', icon: 'tag', text: 'Custom' },
        },
      };

      const typeConfig = defaults[type] as any;
      if (!typeConfig) return { color: '#007AFF', icon: 'tag', text: value.toString() };

      const config = typeConfig[value.toString().toLowerCase()] || 
                    Object.values(typeConfig)[0] || 
                    { color: '#007AFF', icon: 'tag', text: value.toString() };

      return {
        color: color || config.color,
        icon: icon || config.icon,
        text: config.text || value.toString(),
      };
    }, [type, value, color, icon]);

    // Size values
    const SIZE_VALUES = useMemo(() => {
      switch (size) {
        case 'xs':
          return { height: 20, fontSize: 10, iconSize: 10, padding: 4, radius: 10 };
        case 'small':
          return { height: 24, fontSize: 11, iconSize: 12, padding: 6, radius: 12 };
        case 'large':
          return { height: 32, fontSize: 14, iconSize: 16, padding: 10, radius: 16 };
        default: // medium
          return { height: 28, fontSize: 12, iconSize: 14, padding: 8, radius: 14 };
      }
    }, [size]);

    // Determine text color
    const calculatedTextColor = useMemo(() => {
      if (textColor) return textColor;
      if (outline) return typeDefaults.color;
      
      // Calculate contrast for better readability
      const hexColor = typeDefaults.color.replace('#', '');
      const r = parseInt(hexColor.substr(0, 2), 16);
      const g = parseInt(hexColor.substr(2, 2), 16);
      const b = parseInt(hexColor.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? '#000000' : '#FFFFFF';
    }, [textColor, outline, typeDefaults.color]);

    // Handle press
    const handlePress = useCallback(() => {
      if (disabled) return;

      if (onPress) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Scale animation
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 200,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();

        onPress();
      }
    }, [disabled, onPress, scaleAnim]);

    // Handle close
    const handleClose = useCallback(() => {
      if (disabled || !onClose) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Fade out animation
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    }, [disabled, onClose, opacityAnim]);

    // Pulse animation
    const startPulseAnimation = useCallback(() => {
      if (!pulse || disabled) return;

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, [pulse, disabled, pulseAnim]);

    // Bounce animation
    const startBounceAnimation = useCallback(() => {
      if (!animated || disabled) return;

      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          tension: 200,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }, [animated, disabled, bounceAnim]);

    // Count animation
    const animateCount = useCallback(() => {
      if (!showCount || count <= 0) return;

      Animated.sequence([
        Animated.timing(countScaleAnim, {
          toValue: 1.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(countScaleAnim, {
          toValue: 1,
          tension: 200,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }, [showCount, count, countScaleAnim]);

    // Start animations
    React.useEffect(() => {
      if (pulse) {
        startPulseAnimation();
      }
      if (animated) {
        startBounceAnimation();
      }
      if (showCount && count > 0) {
        animateCount();
      }
    }, [pulse, animated, showCount, count, startPulseAnimation, startBounceAnimation, animateCount]);

    // Pulse opacity
    const pulseOpacity = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    // Bounce transform
    const bounceTransform = {
      transform: [
        { translateY: bounceAnim },
      ],
    };

    // Count scale
    const countScale = {
      transform: [
        { scale: countScaleAnim },
      ],
    };

    // Render count badge
    const renderCountBadge = useCallback(() => {
      if (!showCount || count <= 0) return null;

      const countSize = SIZE_VALUES.height * 0.6;
      const positionStyle = {
        top: countPosition.includes('top') ? -countSize / 2 : 'auto',
        bottom: countPosition.includes('bottom') ? -countSize / 2 : 'auto',
        right: countPosition.includes('right') ? -countSize / 2 : 'auto',
        left: countPosition.includes('left') ? -countSize / 2 : 'auto',
      };

      return (
        <Animated.View
          style={[
            styles.countBadge,
            {
              width: countSize,
              height: countSize,
              borderRadius: countSize / 2,
              backgroundColor: countColor || '#FF3B30',
              ...positionStyle,
            } as any,
            countScale,
          ]}>
          <Text style={[styles.countText, { color: countTextColor, fontSize: SIZE_VALUES.fontSize * 0.8 }]}>
            {count > 99 ? '99+' : count}
          </Text>
        </Animated.View>
      );
    }, [showCount, count, SIZE_VALUES, countPosition, countColor, countTextColor, countScale]);

    // Render tooltip
    const renderTooltip = useCallback(() => {
      if (!showTooltipState || !tooltipText) return null;

      return (
        <View style={styles.tooltipContainer}>
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>{tooltipText}</Text>
          </View>
        </View>
      );
    }, [showTooltipState, tooltipText]);

    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.wrapper,
            { opacity: opacityAnim },
            bounceTransform,
          ]}>
          {/* Pulse effect */}
          {pulse && (
            <Animated.View
              style={[
                styles.pulseEffect,
                {
                  backgroundColor: typeDefaults.color,
                  opacity: pulseOpacity,
                  borderRadius: rounded ? 100 : SIZE_VALUES.radius,
                },
              ]}
            />
          )}

          <TouchableOpacity
            style={[
              styles.badge,
              {
                height: SIZE_VALUES.height,
                paddingHorizontal: SIZE_VALUES.padding,
                borderRadius: rounded ? 100 : SIZE_VALUES.radius,
                backgroundColor: outline ? 'transparent' : (gradient ? undefined : typeDefaults.color),
                borderWidth: outline ? 1 : 0,
                borderColor: typeDefaults.color,
                maxWidth,
                ...customStyle,
              },
              shadow && styles.shadow,
              isPressed && styles.pressed,
              disabled && styles.disabled,
            ]}
            onPress={handlePress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => showTooltip ? setShowTooltipState(false) : setIsPressed(false)}
            onLongPress={() => setShowTooltipState(true)}
            disabled={disabled || (!onPress && !showClose)}
            activeOpacity={0.7}
            accessibilityLabel={accessibilityLabel || typeDefaults.text}>
            {gradient && !outline && (
              <LinearGradient
                colors={[typeDefaults.color, `${typeDefaults.color}CC`]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}

            <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
              {/* Left icon */}
              {showIcon && iconPosition === 'left' && typeDefaults.icon && (
                <Icon
                  name={typeDefaults.icon}
                  size={SIZE_VALUES.iconSize}
                  color={calculatedTextColor}
                  style={styles.iconLeft}
                />
              )}

              {/* Text */}
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: SIZE_VALUES.fontSize,
                    color: calculatedTextColor,
                    fontWeight: size === 'xs' ? '500' : '600',
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {typeDefaults.text}
              </Text>

              {/* Right icon */}
              {showIcon && iconPosition === 'right' && typeDefaults.icon && (
                <Icon
                  name={typeDefaults.icon}
                  size={SIZE_VALUES.iconSize}
                  color={calculatedTextColor}
                  style={styles.iconRight}
                />
              )}

              {/* Close button */}
              {showClose && onClose && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                  <Icon
                    name="close"
                    size={SIZE_VALUES.iconSize}
                    color={calculatedTextColor}
                  />
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Count badge */}
            {renderCountBadge()}
          </TouchableOpacity>
        </Animated.View>

        {/* Tooltip */}
        {renderTooltip()}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  wrapper: {
    position: 'relative',
  },
  pulseEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    zIndex: -1,
  },
  badge: {
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  iconLeft: {
    marginRight: 4,
  },
  iconRight: {
    marginLeft: 4,
  },
  closeButton: {
    marginLeft: 4,
    padding: 2,
  },
  countBadge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  countText: {
    fontWeight: '700',
    includeFontPadding: false,
  },
  tooltipContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    alignItems: 'center',
    marginTop: 4,
    zIndex: 1000,
  },
  tooltip: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 200,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});

SubscriptionBadge.displayName = 'SubscriptionBadge';

export default SubscriptionBadge;
