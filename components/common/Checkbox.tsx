import { colors, fonts, spacing } from '@/config/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Platform,
    StyleSheet,
    Text,
    TextStyle,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';

interface CheckboxProps {
  checked: boolean;
  onValueChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  size?: 'small' | 'medium' | 'large';
  shape?: 'square' | 'circle' | 'rounded';
  color?: string;
  borderColor?: string;
  checkedColor?: string;
  uncheckedColor?: string;
  labelPosition?: 'left' | 'right';
  showIcon?: boolean;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  indeterminate?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  containerStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  animation?: 'scale' | 'bounce' | 'fade' | 'none';
  animationDuration?: number;
  hapticFeedback?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onValueChange,
  label,
  description,
  disabled = false,
  required = false,
  error,
  size = 'medium',
  shape = 'rounded',
  color = colors.primary,
  borderColor,
  checkedColor,
  uncheckedColor,
  labelPosition = 'right',
  showIcon = true,
  icon = 'check',
  iconSize,
  iconColor,
  indeterminate = false,
  onPress,
  style,
  labelStyle,
  descriptionStyle,
  containerStyle,
  testID = 'checkbox',
  accessibilityLabel,
  animation = 'scale',
  animationDuration = 200,
  hapticFeedback = true,
}) => {
  const [isChecked, setIsChecked] = useState(checked || indeterminate);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkmarkAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const borderWidthAnim = useRef(new Animated.Value(checked ? 0 : 1)).current;

  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { size: 20, iconSize: iconSize || 12 };
      case 'large':
        return { size: 32, iconSize: iconSize || 20 };
      default:
        return { size: 24, iconSize: iconSize || 16 };
    }
  };

  const getBorderRadius = () => {
    switch (shape) {
      case 'circle':
        return 50;
      case 'square':
        return 4;
      default:
        return 6;
    }
  };

  const { size: checkboxSize, iconSize: checkboxIconSize } = getDimensions();
  const borderRadius = getBorderRadius();

  const getBorderColor = () => {
    if (error) return colors.error;
    if (disabled) return colors.neutral[300];
    if (borderColor) return borderColor;
    if (isChecked) return checkedColor || color;
    return uncheckedColor || colors.neutral[200];
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.neutral[100];
    if (isChecked) return checkedColor || color;
    return uncheckedColor || colors.neutral[0];
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;
    if (disabled) return colors.neutral[300];
    return colors.neutral[0];
  };

  const getLabelColor = () => {
    if (disabled) return colors.neutral[300];
    if (error) return colors.error;
    return colors.neutral[900];
  };

  const getDescriptionColor = () => {
    if (disabled) return colors.neutral[300];
    if (error) return colors.error;
    return colors.neutral[500];
  };

  const handlePress = () => {
    if (disabled) return;

    const newValue = !isChecked;
    setIsChecked(newValue);

    if (hapticFeedback && Platform.OS === 'ios') {
      // Add haptic feedback here
    }

    // Animation
    if (animation !== 'none') {
      switch (animation) {
        case 'scale':
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 0.9,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 50,
              useNativeDriver: true,
            }),
          ]).start();
          break;
        case 'bounce':
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: 100,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 100,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
          break;
      }
    }

    // Checkmark animation
    Animated.timing(checkmarkAnim, {
      toValue: newValue ? 1 : 0,
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Border width animation
    Animated.timing(borderWidthAnim, {
      toValue: newValue ? 0 : 1,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();

    onValueChange(newValue);
    onPress?.();
  };

  useEffect(() => {
    if (checked !== isChecked && !indeterminate) {
      setIsChecked(checked);
      
      Animated.timing(checkmarkAnim, {
        toValue: checked ? 1 : 0,
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      Animated.timing(borderWidthAnim, {
        toValue: checked ? 0 : 1,
        duration: animationDuration,
        useNativeDriver: false,
      }).start();
    }
  }, [checked]);

  useEffect(() => {
    if (indeterminate) {
      setIsChecked(true);
    }
  }, [indeterminate]);

  const checkmarkScale = checkmarkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const checkmarkOpacity = checkmarkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const CheckboxComponent = () => (
    <TouchableWithoutFeedback
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ disabled, checked: isChecked }}
      accessibilityLabel={accessibilityLabel || label || 'Checkbox'}
      testID={testID}>
      <View style={styles.checkboxWrapper}>
        <Animated.View
          style={[
            styles.checkboxContainer,
            {
              width: checkboxSize,
              height: checkboxSize,
              borderRadius,
              borderWidth: borderWidthAnim,
              borderColor: getBorderColor(),
              backgroundColor: getBackgroundColor(),
              transform: [{ scale: scaleAnim }],
            },
            style,
          ]}>
          {(isChecked || indeterminate) && showIcon && (
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  opacity: checkmarkOpacity,
                  transform: [{ scale: checkmarkScale }],
                },
              ]}>
              <MaterialCommunityIcons
                name={indeterminate ? 'minus' : (icon as any)}
                size={checkboxIconSize}
                color={getIconColor()}
              />
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );

  const LabelComponent = () => (
    <View style={styles.labelContainer}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: getLabelColor(),
              fontSize: size === 'small' ? 14 : size === 'large' ? 16 : 15,
            },
            labelStyle,
          ]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      {description && (
        <Text
          style={[
            styles.description,
            {
              color: getDescriptionColor(),
              fontSize: size === 'small' ? 12 : size === 'large' ? 14 : 13,
            },
            descriptionStyle,
          ]}>
          {description}
        </Text>
      )}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );

  if (!label && !description) {
    return <CheckboxComponent />;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {labelPosition === 'left' && <LabelComponent />}
      
      <View style={[
        styles.row,
        labelPosition === 'left' && { justifyContent: 'space-between' },
      ]}>
        {labelPosition === 'left' ? (
          <CheckboxComponent />
        ) : (
          <>
            <CheckboxComponent />
            <LabelComponent />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxWrapper: {
    marginRight: spacing.sm,
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.regular.fontFamily,
    lineHeight: 20,
  },
  required: {
    color: colors.error[500],
  },
  description: {
    fontFamily: fonts.regular.fontFamily,
    marginTop: 2,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 12,
    fontFamily: fonts.regular.fontFamily,
    color: colors.error[500],
    marginTop: 2,
  },
}) as any;

export default Checkbox;