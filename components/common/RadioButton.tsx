import { colors, fonts, spacing } from '@/config/theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
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

export type RadioButtonVariant = 'filled' | 'outlined' | 'dot' | 'icon';
export type RadioButtonSize = 'small' | 'medium' | 'large';
export type RadioButtonShape = 'circle' | 'rounded' | 'square';

interface RadioButtonProps {
  selected: boolean;
  onSelect: () => void;
  value?: string | number;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  variant?: RadioButtonVariant;
  size?: RadioButtonSize;
  shape?: RadioButtonShape;
  color?: string;
  selectedColor?: string;
  unselectedColor?: string;
  borderColor?: string;
  selectedBorderColor?: string;
  labelPosition?: 'right' | 'left' | 'top' | 'bottom';
  showIcon?: boolean;
  icon?: string;
  selectedIcon?: string;
  iconColor?: string;
  selectedIconColor?: string;
  iconSize?: number;
  showDot?: boolean;
  dotColor?: string;
  selectedDotColor?: string;
  dotSize?: number;
  animated?: boolean;
  animationType?: 'scale' | 'bounce' | 'fade' | 'pulse';
  animationDuration?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  radioStyle?: ViewStyle;
  selectedStyle?: ViewStyle;
  disabledStyle?: ViewStyle;
  errorStyle?: TextStyle;
  containerStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: 'radio' | 'button';
  accessibilityState?: { disabled?: boolean; selected?: boolean };
  hapticFeedback?: boolean;
  group?: boolean;
  groupSpacing?: number;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  selected,
  onSelect,
  value,
  label,
  description,
  disabled = false,
  required = false,
  error,
  variant = 'filled',
  size = 'medium',
  shape = 'circle',
  color = colors.primary,
  selectedColor,
  unselectedColor,
  borderColor,
  selectedBorderColor,
  labelPosition = 'right',
  showIcon = true,
  icon = 'circle',
  selectedIcon = 'check-circle',
  iconColor,
  selectedIconColor,
  iconSize,
  showDot = true,
  dotColor,
  selectedDotColor,
  dotSize,
  animated = true,
  animationType = 'scale',
  animationDuration = 300,
  onPress,
  onLongPress,
  style,
  labelStyle,
  descriptionStyle,
  radioStyle,
  selectedStyle,
  disabledStyle,
  errorStyle,
  containerStyle,
  testID = 'radio-button',
  accessibilityLabel,
  accessibilityRole = 'radio',
  accessibilityState,
  hapticFeedback = true,
  group = false,
  groupSpacing = spacing.md,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkmarkAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get size configuration
  const getSizeConfig = () => {
    const sizeConfigs = {
      small: {
        size: 20,
        iconSize: 12,
        dotSize: 6,
        fontSize: 14,
        spacing: 8,
      },
      medium: {
        size: 24,
        iconSize: 14,
        dotSize: 8,
        fontSize: 16,
        spacing: 12,
      },
      large: {
        size: 32,
        iconSize: 18,
        dotSize: 10,
        fontSize: 18,
        spacing: 16,
      },
    };

    return sizeConfigs[size] || sizeConfigs.medium;
  };

  const sizeConfig = getSizeConfig();

  // Get shape configuration
  const getBorderRadius = () => {
    switch (shape) {
      case 'rounded':
        return sizeConfig.size * 0.25;
      case 'square':
        return 4;
      case 'circle':
      default:
        return sizeConfig.size / 2;
    }
  };

  const borderRadius = getBorderRadius();

  // Get colors
  const getColors = () => {
    const unselectedBg = unselectedColor || colors.neutral[0];
    const selectedBg = selectedColor || color;
    const unselectedBorder = borderColor || colors.neutral[200];
    const selectedBorder = selectedBorderColor || color;
    const dot = dotColor || colors.neutral[0];
    const selectedDot = selectedDotColor || colors.neutral[0];
    const icon = iconColor || colors.neutral[900];
    const selectedIcon = selectedIconColor || colors.neutral[0];

    return {
      unselectedBg,
      selectedBg,
      unselectedBorder,
      selectedBorder,
      dot,
      selectedDot,
      icon,
      selectedIcon,
    };
  };

  const colorConfig = getColors();

  // Get radio button styles
  const getRadioStyle = () => {
    const baseStyle: ViewStyle = {
      width: sizeConfig.size,
      height: sizeConfig.size,
      borderRadius,
      justifyContent: 'center',
      alignItems: 'center',
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: selected ? colorConfig.selectedBorder : colorConfig.unselectedBorder,
        };
      case 'dot':
        return {
          ...baseStyle,
          backgroundColor: selected ? colorConfig.selectedBg : colorConfig.unselectedBg,
          borderWidth: 1,
          borderColor: selected ? colorConfig.selectedBorder : colorConfig.unselectedBorder,
        };
      case 'icon':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'filled':
      default:
        return {
          ...baseStyle,
          backgroundColor: selected ? colorConfig.selectedBg : colorConfig.unselectedBg,
          borderWidth: 1,
          borderColor: selected ? colorConfig.selectedBorder : colorConfig.unselectedBorder,
        };
    }
  };

  // Get dot size
  const getDotSize = () => {
    if (dotSize) return dotSize;
    return sizeConfig.dotSize;
  };

  // Get icon size
  const getIconSize = () => {
    if (iconSize) return iconSize;
    return sizeConfig.iconSize;
  };

  // Animation
  useEffect(() => {
    if (!animated) return;

    // Checkmark animation
    Animated.timing(checkmarkAnim, {
      toValue: selected ? 1 : 0,
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Pulse animation for selected state
    if (selected && animationType === 'pulse') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
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
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [selected, animated, animationType]);

  // Handle press
  const handlePressIn = () => {
    if (disabled) return;
    
    setIsPressed(true);
    
    if (animated && animationType === 'scale') {
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    setIsPressed(false);
    
    if (animated && animationType === 'scale') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (disabled) return;
    
    if (hapticFeedback) {
      // Add haptic feedback
    }
    
    onSelect();
    onPress?.();
  };

  const handleLongPress = () => {
    if (disabled) return;
    onLongPress?.();
  };

  // Render radio content
  const renderRadioContent = () => {
    const radioStyle = getRadioStyle();
    const dotSize = getDotSize();
    const iconSize = getIconSize();

    // Scale animation for selected state
    const checkmarkScale = checkmarkAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    // Opacity animation for selected state
    const checkmarkOpacity = checkmarkAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        style={[
          styles.radioContainer as any,
          radioStyle,
          {
            transform: [
              { scale: scaleAnim },
              { scale: animationType === 'pulse' ? pulseAnim : 1 },
            ],
          },
          selected && selectedStyle,
          disabled && [styles.disabled, disabledStyle],
          radioStyle,
        ] as any}>
        {/* Dot variant */}
        {variant === 'dot' && showDot && selected && (
          <Animated.View
            style={[
              styles.dot as any,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: colorConfig.selectedDot,
                transform: [{ scale: checkmarkScale }],
                opacity: checkmarkOpacity,
              },
            ] as any}
          />
        )}

        {/* Icon variant */}
        {variant === 'icon' && showIcon && (
          <Animated.View
            style={[
              styles.iconContainer as any,
              {
                transform: [{ scale: checkmarkScale }],
                opacity: checkmarkOpacity,
              },
            ] as any}>
            <Icon
              name={(selected ? selectedIcon : icon) as any}
              size={iconSize}
              color={selected ? colorConfig.selectedIcon : colorConfig.icon}
            />
          </Animated.View>
        )}

        {/* Filled/Outlined with check icon */}
        {(variant === 'filled' || variant === 'outlined') && showIcon && selected && (
          <Animated.View
            style={[
              styles.iconContainer as any,
              {
                transform: [{ scale: checkmarkScale }],
                opacity: checkmarkOpacity,
              },
            ] as any}>
            <Icon
              name={selectedIcon as any}
              size={iconSize}
              color={colorConfig.selectedIcon}
            />
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  // Render label
  const renderLabel = () => {
    if (!label && !description) return null;

    const labelColor = disabled ? colors.neutral[300] : error ? colors.error[500] : colors.neutral[900];
    const descriptionColor = disabled ? colors.neutral[300] : colors.neutral[500];

    return (
      <View style={styles.labelContainer as any}>
        {label && (
          <Text
            style={[
              styles.label as any,
              {
                fontSize: sizeConfig.fontSize,
                color: labelColor,
                fontFamily: fonts.medium.fontFamily,
              },
              labelStyle,
              error && [styles.errorText as any, errorStyle],
            ] as any}>
            {label}
            {required && <Text style={styles.required as any}> *</Text>}
          </Text>
        )}
        {description && (
          <Text
            style={[
              styles.description as any,
              {
                fontSize: sizeConfig.fontSize - 2,
                color: descriptionColor,
                marginTop: label ? 2 : 0,
              },
              descriptionStyle,
            ] as any}>
            {description}
          </Text>
        )}
        {error && !label && (
          <Text style={[styles.errorText as any, errorStyle] as any}>
            {error}
          </Text>
        )}
      </View>
    );
  };

  const radioContent = renderRadioContent();
  const labelContent = renderLabel();

  const RadioComponent = () => (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={animated ? 1 : 0.7}
      delayLongPress={500}
      style={[
        styles.container,
        group && { marginBottom: groupSpacing },
        containerStyle,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || label || 'Radio button'}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled,
        selected,
        ...accessibilityState,
      }}
      accessibilityValue={{ text: value?.toString() }}>
      {labelPosition === 'left' || labelPosition === 'top' ? labelContent : null}
      
      <View style={[
        styles.content,
        labelPosition === 'top' || labelPosition === 'bottom' 
          ? styles.column 
          : styles.row,
        style,
      ]}>
        {(labelPosition === 'left' || labelPosition === 'top') && radioContent}
        {labelPosition === 'right' || labelPosition === 'bottom' ? labelContent : null}
        {(labelPosition === 'right' || labelPosition === 'bottom') && radioContent}
      </View>
    </TouchableOpacity>
  );

  return <RadioComponent />;
};

// Radio Group Component
interface RadioGroupProps {
  children: React.ReactNode;
  selectedValue?: string | number;
  onValueChange: (value: string | number) => void;
  direction?: 'vertical' | 'horizontal';
  spacing?: number;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  testID?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  selectedValue,
  onValueChange,
  direction = 'vertical',
  spacing: groupSpacing = spacing.md,
  style,
  containerStyle,
  testID = 'radio-group',
}) => {
  const handleValueChange = (value: string | number) => {
    onValueChange(value);
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        selected: (child.props as any).value === selectedValue,
        onSelect: () => handleValueChange((child.props as any).value),
        group: true,
        groupSpacing: groupSpacing,
      });
    }
    return child;
  });

  return (
    <View
      style={[
        styles.groupContainer as any,
        direction === 'horizontal' ? styles.groupHorizontal : styles.groupVertical,
        { gap: groupSpacing },
        containerStyle,
      ]}
      testID={testID}>
      {childrenWithProps}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  content: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  radioContainer: {
    position: 'relative',
  },
  disabled: {
    opacity: 0.5,
  },
  dot: {
    position: 'absolute',
  },
  iconContainer: {
    position: 'absolute',
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.medium.fontFamily,
  },
  description: {
    fontFamily: fonts.regular.fontFamily,
  },
  required: {
    color: colors.error[500],
  },
  errorText: {
    color: colors.error[500],
    fontSize: 12,
    fontFamily: fonts.regular.fontFamily,
    marginTop: 2,
  },
  groupContainer: {
    flexDirection: 'column',
  },
  groupHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  groupVertical: {
    flexDirection: 'column',
  },
});

export { RadioGroup };
export default RadioButton;