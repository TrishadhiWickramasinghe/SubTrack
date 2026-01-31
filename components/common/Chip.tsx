import { colors, fonts, spacing } from '@/config/theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
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

export type ChipVariant = 'filled' | 'outlined' | 'ghost';
export type ChipColor = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default'
  | 'custom';

export type ChipSize = 'small' | 'medium' | 'large';
export type ChipShape = 'rounded' | 'pill';

interface ChipProps {
  text: string;
  selected?: boolean;
  onPress?: (selected: boolean) => void;
  onClose?: () => void;
  icon?: string;
  iconPosition?: 'left' | 'right';
  iconColor?: string;
  iconSize?: number;
  avatar?: React.ReactNode;
  avatarPosition?: 'left' | 'right';
  closable?: boolean;
  closeIcon?: string;
  closeIconColor?: string;
  disabled?: boolean;
  variant?: ChipVariant;
  color?: ChipColor;
  size?: ChipSize;
  shape?: ChipShape;
  animated?: boolean;
  animationType?: 'scale' | 'fade' | 'none';
  showCheckmark?: boolean;
  checkmarkIcon?: string;
  checkmarkPosition?: 'left' | 'right';
  elevation?: number;
  onLongPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  selectedStyle?: ViewStyle;
  disabledStyle?: ViewStyle;
  iconStyle?: ViewStyle;
  avatarStyle?: ViewStyle;
  closeButtonStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'checkbox';
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
  selectedTextColor?: string;
  selectedBackgroundColor?: string;
  selectedBorderColor?: string;
}

const Chip: React.FC<ChipProps> = ({
  text,
  selected = false,
  onPress,
  onClose,
  icon,
  iconPosition = 'left',
  iconColor,
  iconSize,
  avatar,
  avatarPosition = 'left',
  closable = false,
  closeIcon = 'close',
  closeIconColor,
  disabled = false,
  variant = 'filled',
  color = 'default',
  size = 'medium',
  shape = 'rounded',
  animated = true,
  animationType = 'scale',
  showCheckmark = false,
  checkmarkIcon = 'check',
  checkmarkPosition = 'left',
  elevation = 0,
  onLongPress,
  style,
  textStyle,
  selectedStyle,
  disabledStyle,
  iconStyle,
  avatarStyle,
  closeButtonStyle,
  containerStyle,
  testID = 'chip',
  accessibilityLabel,
  accessibilityRole = 'button',
  borderColor,
  backgroundColor,
  textColor,
  selectedTextColor,
  selectedBackgroundColor,
  selectedBorderColor,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Get color configuration
  const getColorConfig = () => {
    const colorConfigs = {
      primary: {
        bg: colors.primary[600] as any,
        text: colors.neutral[0],
        border: colors.primary[600] as any,
        light: colors.primary[100],
      },
      secondary: {
        bg: colors.secondary[600] as any,
        text: colors.neutral[0],
        border: colors.secondary[600] as any,
        light: colors.secondary[100],
      },
      success: {
        bg: colors.success[500] as any,
        text: colors.neutral[0],
        border: colors.success[500] as any,
        light: colors.success[100],
      },
      error: {
        bg: colors.error[500] as any,
        text: colors.neutral[0],
        border: colors.error[500] as any,
        light: colors.error[100],
      },
      warning: {
        bg: colors.warning[500] as any,
        text: colors.neutral[0],
        border: colors.warning[500] as any,
        light: colors.warning[100],
      },
      info: {
        bg: colors.info[500] as any,
        text: colors.neutral[0],
        border: colors.info[500] as any,
        light: colors.info[100],
      },
      default: {
        bg: colors.neutral[100],
        text: colors.neutral[900],
        border: colors.neutral[200],
        light: colors.neutral[100],
      },
      custom: {
        bg: backgroundColor || colors.neutral[100],
        text: textColor || colors.neutral[900],
        border: borderColor || colors.neutral[200],
        light: backgroundColor ? `${backgroundColor}40` : colors.neutral[100],
      },
    };

    return colorConfigs[color] || colorConfigs.default;
  };

  const colorConfig = getColorConfig();

  // Get size configuration
  const getSizeConfig = () => {
    const sizeConfigs = {
      small: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        fontSize: 12,
        iconSize: 14,
        avatarSize: 16,
      },
      medium: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        fontSize: 14,
        iconSize: 16,
        avatarSize: 20,
      },
      large: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        iconSize: 18,
        avatarSize: 24,
      },
    };

    return sizeConfigs[size] || sizeConfigs.medium;
  };

  const sizeConfig = getSizeConfig();

  // Get shape configuration
  const getBorderRadius = () => {
    switch (shape) {
      case 'pill':
        return 50;
      case 'rounded':
      default:
        return 8;
    }
  };

  const borderRadius = getBorderRadius();

  // Get variant styles
  const getVariantStyles = () => {
    const selectedBg = selectedBackgroundColor || colorConfig.bg;
    const selectedText = selectedTextColor || colorConfig.text;
    const selectedBorder = selectedBorderColor || colorConfig.border;

    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: selected ? selectedBg + '20' : 'transparent',
          borderWidth: 1,
          borderColor: selected ? selectedBorder : colorConfig.border,
        };
      case 'ghost':
        return {
          backgroundColor: selected ? selectedBg + '10' : 'transparent',
          borderWidth: 0,
        };
      case 'filled':
      default:
        return {
          backgroundColor: selected ? selectedBg : colorConfig.light,
          borderWidth: 0,
        };
    }
  };

  const variantStyles = getVariantStyles() as any;

  // Get text color
  const getTextColor = () => {
    if (disabled) return colors.neutral[300];
    
    if (selectedTextColor && selected) return selectedTextColor;
    
    if (variant === 'filled' && selected) {
      return colorConfig.text;
    }
    
    if (variant === 'outlined' || variant === 'ghost') {
      if (selected) {
        return colorConfig.border;
      }
      return colorConfig.text;
    }
    
    return colorConfig.text;
  };

  // Get icon color
  const getIconColor = () => {
    if (iconColor) return iconColor;
    if (disabled) return colors.neutral[300];
    return getTextColor();
  };

  // Handle press animation
  const handlePressIn = () => {
    if (disabled || !animated) return;
    
    setIsPressed(true);
    
    if (animationType === 'scale') {
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (animationType === 'fade') {
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (disabled || !animated) return;
    
    setIsPressed(false);
    
    if (animationType === 'scale') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else if (animationType === 'fade') {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (disabled) return;
    
    const newSelected = !selected;
    onPress?.(newSelected);
  };

  const handleClose = () => {
    if (disabled) return;
    onClose?.();
  };

  // Render icon
  const renderIcon = () => {
    if (!icon) return null;

    return (
      <View style={[styles.iconContainer, iconStyle]}>
        <Icon
          name={icon as any}
          size={iconSize || sizeConfig.iconSize}
          color={getIconColor() as any}
        />
      </View>
    );
  };

  // Render avatar
  const renderAvatar = () => {
    if (!avatar) return null;

    return (
      <View style={[styles.avatarContainer, avatarStyle]}>
        {avatar}
      </View>
    );
  };

  // Render checkmark
  const renderCheckmark = () => {
    if (!showCheckmark || !selected) return null;

    return (
      <View style={[styles.checkmarkContainer, iconStyle]}>
        <Icon
          name={checkmarkIcon as any}
          size={iconSize || sizeConfig.iconSize}
          color={getIconColor() as any}
        />
      </View>
    );
  };

  // Render close button
  const renderCloseButton = () => {
    if (!closable) return null;

    return (
      <TouchableOpacity
        style={[styles.closeButton, closeButtonStyle]}
        onPress={handleClose}
        disabled={disabled}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
        <Icon
          name={closeIcon as any}
          size={iconSize || sizeConfig.iconSize}
          color={(closeIconColor || getIconColor()) as any}
        />
      </TouchableOpacity>
    );
  };

  // Determine content order
  const getContentOrder = () => {
    const leftContent = [];
    const rightContent = [];

    if (showCheckmark && selected && checkmarkPosition === 'left') {
      leftContent.push(renderCheckmark());
    }

    if (avatar && avatarPosition === 'left') {
      leftContent.push(renderAvatar());
    }

    if (icon && iconPosition === 'left') {
      leftContent.push(renderIcon());
    }

    if (showCheckmark && selected && checkmarkPosition === 'right') {
      rightContent.push(renderCheckmark());
    }

    if (avatar && avatarPosition === 'right') {
      rightContent.push(renderAvatar());
    }

    if (icon && iconPosition === 'right') {
      rightContent.push(renderIcon());
    }

    if (closable) {
      rightContent.push(renderCloseButton());
    }

    return { leftContent, rightContent };
  };

  const { leftContent, rightContent } = getContentOrder();

  // Animation transform
  const getTransform = () => {
    if (!animated) return [];

    if (animationType === 'scale') {
      return [{ scale: scaleAnim }];
    }

    return [];
  };

  const ChipContent = () => (
    <Animated.View
      style={[
        styles.container,
        variantStyles,
        {
          borderRadius,
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          opacity: animationType === 'fade' ? opacityAnim : 1,
          transform: getTransform(),
          elevation,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: elevation > 0 ? 1 : 0 },
          shadowOpacity: elevation > 0 ? 0.1 : 0,
          shadowRadius: elevation > 0 ? 2 : 0,
        },
        disabled && [styles.disabled, disabledStyle],
        selected && [styles.selected, selectedStyle],
        style,
      ]}
      testID={testID}>
      {leftContent.length > 0 && (
        <View style={styles.leftContent}>
          {leftContent}
        </View>
      )}

      <Text
        style={[
          styles.text,
          {
            fontSize: sizeConfig.fontSize,
            color: getTextColor() as any,
            fontFamily: fonts.medium.fontFamily,
            marginHorizontal: leftContent.length > 0 || rightContent.length > 0 ? spacing.xs : 0,
          },
          textStyle,
        ]}
        numberOfLines={1}>
        {text}
      </Text>

      {rightContent.length > 0 && (
        <View style={styles.rightContent}>
          {rightContent}
        </View>
      )}
    </Animated.View>
  );

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        onPress={onPress ? handlePress : undefined}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={animated ? 1 : 0.7}
        accessibilityLabel={accessibilityLabel || text}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ 
          disabled,
          selected: accessibilityRole === 'checkbox' ? selected : undefined,
        }}
        style={containerStyle}>
        <ChipContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      <ChipContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  selected: {
    // Selected styles are applied via variantStyles
  },
  text: {
    textAlign: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginHorizontal: 2,
  },
  avatarContainer: {
    marginHorizontal: 2,
  },
  checkmarkContainer: {
    marginHorizontal: 2,
  },
  closeButton: {
    marginLeft: 4,
  },
});

export default Chip;