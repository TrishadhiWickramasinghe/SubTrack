import { colors, fonts } from '@/config/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

export type BadgeVariant = 'filled' | 'outlined' | 'dot' | 'text';
export type BadgeColor = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default'
  | 'custom';

export type BadgeSize = 'small' | 'medium' | 'large';
export type BadgeShape = 'square' | 'rounded' | 'pill' | 'circle';

interface BadgeProps {
  children?: React.ReactNode;
  text?: string;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  shape?: BadgeShape;
  icon?: string;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
  iconColor?: string;
  showDot?: boolean;
  dotPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  dotSize?: number;
  dotColor?: string;
  animated?: boolean;
  animationType?: 'scale' | 'bounce' | 'pulse';
  onPress?: () => void;
  onClose?: () => void;
  closable?: boolean;
  closeIcon?: string;
  closeIconColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  dotStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  text,
  count,
  maxCount = 99,
  showZero = false,
  variant = 'filled',
  color = 'primary',
  size = 'medium',
  shape = 'rounded',
  icon,
  iconPosition = 'left',
  iconSize,
  iconColor,
  showDot = false,
  dotPosition = 'top-right',
  dotSize = 8,
  dotColor,
  animated = false,
  animationType = 'scale',
  onPress,
  onClose,
  closable = false,
  closeIcon = 'close',
  closeIconColor,
  style,
  textStyle,
  dotStyle,
  containerStyle,
  testID = 'badge',
  accessibilityLabel,
  disabled = false,
  borderColor,
  backgroundColor,
  textColor,
}) => {
  // Get color configuration
  const getColorConfig = () => {
    const colorConfigs = {
      primary: {
        bg: colors.primary,
        text: colors.neutral[0],
        border: colors.primary,
        light: colors.primary[100],
      },
      secondary: {
        bg: colors.secondary,
        text: colors.neutral[0],
        border: colors.secondary,
        light: colors.secondary[100],
      },
      success: {
        bg: colors.success,
        text: colors.neutral[0],
        border: colors.success,
        light: colors.success[100],
      },
      error: {
        bg: colors.error,
        text: colors.neutral[0],
        border: colors.error,
        light: colors.error[100],
      },
      warning: {
        bg: colors.warning,
        text: colors.neutral[0],
        border: colors.warning,
        light: colors.warning[100],
      },
      info: {
        bg: colors.info,
        text: colors.neutral[0],
        border: colors.info,
        light: colors.info[100],
      },
      default: {
        bg: colors.neutral[100],
        text: colors.neutral[900],
        border: colors.neutral[200],
        light: colors.neutral[100],
      },
      custom: {
        bg: backgroundColor || colors.primary,
        text: textColor || colors.neutral[0],
        border: borderColor || backgroundColor || colors.primary,
        light: backgroundColor ? `${backgroundColor}40` : colors.primary[100],
      },
    };

    return colorConfigs[color] || colorConfigs.primary;
  };

  const colorConfig = getColorConfig();

  // Get size configuration
  const getSizeConfig = () => {
    const sizeConfigs = {
      small: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        fontSize: 10,
        iconSize: 12,
        dotSize: 6,
      },
      medium: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        fontSize: 12,
        iconSize: 14,
        dotSize: 8,
      },
      large: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        fontSize: 14,
        iconSize: 16,
        dotSize: 10,
      },
    };

    return sizeConfigs[size] || sizeConfigs.medium;
  };

  const sizeConfig = getSizeConfig();

  // Get shape configuration
  const getBorderRadius = () => {
    switch (shape) {
      case 'square':
        return 4;
      case 'pill':
        return 50;
      case 'circle':
        return 50;
      case 'rounded':
      default:
        return 6;
    }
  };

  const borderRadius = getBorderRadius();

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colorConfig.border,
        };
      case 'dot':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          paddingHorizontal: 0,
          paddingVertical: 0,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          paddingHorizontal: 0,
          paddingVertical: 0,
        };
      case 'filled':
      default:
        return {
          backgroundColor: colorConfig.bg,
          borderWidth: 0,
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Get text color
  const getTextColor = () => {
    if (textColor) return textColor;
    if (variant === 'outlined' || variant === 'text') {
      return colorConfig.text === colors.neutral[0] ? (typeof colorConfig.border === 'string' ? colorConfig.border : colors.neutral[900]) : colorConfig.text;
    }
    return typeof colorConfig.text === 'string' ? colorConfig.text : colors.neutral[900];
  };

  // Format count display
  const getDisplayCount = () => {
    if (count === undefined) return null;
    
    if (count === 0 && !showZero) return null;
    
    if (count > maxCount) {
      return `${maxCount}+`;
    }
    
    return count.toString();
  };

  const displayCount = getDisplayCount();

  // Render content
  const renderContent = () => {
    if (variant === 'dot') {
      return null;
    }

    if (children) {
      return children;
    }

    if (displayCount) {
      return (
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeConfig.fontSize,
              color: typeof getTextColor() === 'string' ? getTextColor() : colors.neutral[900],
              fontWeight: 'bold',
            } as any,
            textStyle,
          ]}>
          {displayCount}
        </Text>
      );
    }

    if (text) {
      return (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon as any}
              size={iconSize || sizeConfig.iconSize}
              color={iconColor || (typeof getTextColor() === 'string' ? getTextColor() : colors.neutral[900])}
              style={styles.leftIcon as any}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeConfig.fontSize,
                color: typeof getTextColor() === 'string' ? getTextColor() : colors.neutral[900],
                fontFamily: fonts.medium.fontFamily,
              } as any,
              textStyle,
            ]}>
            {text}
          </Text>
          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon as any}
              size={iconSize || sizeConfig.iconSize}
              color={iconColor || (typeof getTextColor() === 'string' ? getTextColor() : colors.neutral[900])}
              style={styles.rightIcon as any}
            />
          )}
        </>
      );
    }

    return null;
  };

  // Render dot
  const renderDot = () => {
    if (!showDot && variant !== 'dot') return null;

    const dotStyles: any[] = [
      styles.dot,
      {
        width: dotSize || sizeConfig.dotSize,
        height: dotSize || sizeConfig.dotSize,
        borderRadius: (dotSize || sizeConfig.dotSize) / 2,
        backgroundColor: dotColor || (typeof colorConfig.bg === 'string' ? colorConfig.bg : colors.primary[500]),
      } as any,
      getDotPositionStyle(),
      dotStyle,
    ];

    return <View style={dotStyles} />;
  };

  // Get dot position style
  const getDotPositionStyle = () => {
    switch (dotPosition) {
      case 'top-left':
        return { top: -2, left: -2 };
      case 'top-right':
        return { top: -2, right: -2 };
      case 'bottom-left':
        return { bottom: -2, left: -2 };
      case 'bottom-right':
        return { bottom: -2, right: -2 };
      default:
        return { top: -2, right: -2 };
    }
  };

  // Get container dimensions for circle shape with count
  const getContainerDimensions = () => {
    if (shape === 'circle' && displayCount) {
      const baseSize = sizeConfig.fontSize * 2;
      const minSize = 24;
      const calculatedSize = Math.max(minSize, baseSize);
      return {
        width: calculatedSize,
        height: calculatedSize,
        borderRadius: calculatedSize / 2,
      };
    }
    return {};
  };

  const containerDimensions = getContainerDimensions();

  // Animation
  const scaleAnim = new Animated.Value(1);
  const pulseAnim = new Animated.Value(1);

  if (animated) {
    switch (animationType) {
      case 'scale':
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 500,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 500,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ).start();
        break;
      case 'pulse':
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 0.7,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ).start();
        break;
    }
  }

  const BadgeContent = () => (
    <Animated.View
      style={[
        styles.container as any,
        { ...variantStyles } as any,
        {
          borderRadius,
          paddingVertical: variant === 'dot' || variant === 'text' ? 0 : sizeConfig.paddingVertical,
          paddingHorizontal: variant === 'dot' || variant === 'text' ? 0 : sizeConfig.paddingHorizontal,
          opacity: disabled ? 0.6 : 1,
          transform: [{ scale: scaleAnim }],
        } as any,
        containerDimensions,
        containerStyle,
      ] as any}
      testID={testID}>
      {renderContent()}
      {renderDot()}
      {closable && onClose && (
        <TouchableOpacity
          style={styles.closeButton as any}
          onPress={onClose}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
          <MaterialCommunityIcons
            name={closeIcon as any}
            size={sizeConfig.iconSize}
            color={closeIconColor || (typeof getTextColor() === 'string' ? getTextColor() : colors.neutral[900])}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button">
        <BadgeContent />
      </TouchableOpacity>
    );
  }

  return <BadgeContent />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    position: 'relative',
  },
  text: {
    fontFamily: fonts.medium.fontFamily,
    textAlign: 'center',
  } as any,
  leftIcon: {
    marginRight: 4,
  },
  rightIcon: {
    marginLeft: 4,
  },
  dot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.neutral[0],
  } as any,
  closeButton: {
    marginLeft: 4,
  },
});

export default Badge;