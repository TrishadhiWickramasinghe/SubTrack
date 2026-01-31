import { colors, fonts, spacing } from '@/config/theme';
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

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
  labelPosition?: 'left' | 'right';
  description?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  trackColor?: {
    false?: string;
    true?: string;
  };
  thumbColor?: {
    false?: string;
    true?: string;
  };
  icon?: {
    false?: string;
    true?: string;
  };
  iconColor?: {
    false?: string;
    true?: string;
  };
  showIcon?: boolean;
  showLoader?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  hapticFeedback?: boolean;
  animation?: 'spring' | 'timing';
  duration?: number;
  onPress?: () => void;
}

const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  label,
  labelPosition = 'right',
  description,
  size = 'medium',
  color = colors.primary,
  trackColor,
  thumbColor,
  icon,
  iconColor,
  showIcon = false,
  showLoader = false,
  loading = false,
  style,
  labelStyle,
  descriptionStyle,
  testID = 'switch',
  accessibilityLabel,
  hapticFeedback = true,
  animation = 'spring',
  duration = 200,
  onPress,
}) => {
  const [isOn, setIsOn] = useState(value);
  const thumbPosition = useRef(new Animated.Value(value ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 20, thumbSize: 16 };
      case 'large':
        return { width: 60, height: 30, thumbSize: 26 };
      default:
        return { width: 50, height: 24, thumbSize: 20 };
    }
  };

  const getLabelSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'large': return 16;
      default: return 14;
    }
  };

  const { width, height, thumbSize } = getDimensions();
  const trackWidth = width;
  const trackHeight = height;
  const thumbRadius = thumbSize / 2;
  const thumbRange = trackWidth - thumbSize;

  const getTrackColor = () => {
    if (disabled) return colors.disabled;
    if (trackColor) {
      return isOn ? trackColor.true || color : trackColor.false || colors.border;
    }
    return isOn ? color + '40' : colors.border;
  };

  const getThumbColor = () => {
    if (disabled) return colors.surface;
    if (thumbColor) {
      return isOn ? thumbColor.true || color : thumbColor.false || colors.surface;
    }
    return isOn ? color : colors.surface;
  };

  const getIconName = () => {
    if (icon) {
      return isOn ? icon.true : icon.false;
    }
    return isOn ? 'check' : 'close';
  };

  const getIconColor = () => {
    if (disabled) return colors.textDisabled;
    if (iconColor) {
      return isOn ? iconColor.true || colors.surface : iconColor.false || colors.text;
    }
    return isOn ? colors.surface : colors.text;
  };

  const toggleSwitch = () => {
    if (disabled || loading) return;

    const newValue = !isOn;
    setIsOn(newValue);
    
    if (hapticFeedback && Platform.OS === 'ios') {
      // Add haptic feedback here
    }

    // Scale animation
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

    // Thumb position animation
    if (animation === 'spring') {
      Animated.spring(thumbPosition, {
        toValue: newValue ? 1 : 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(thumbPosition, {
        toValue: newValue ? 1 : 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }

    onValueChange(newValue);
    onPress?.();
  };

  useEffect(() => {
    if (value !== isOn) {
      setIsOn(value);
      
      if (animation === 'spring') {
        Animated.spring(thumbPosition, {
          toValue: value ? 1 : 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(thumbPosition, {
          toValue: value ? 1 : 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    }
  }, [value]);

  const thumbTranslateX = thumbPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [2, thumbRange - 2],
  });

  const trackOpacity = thumbPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const renderIcon = () => {
    if (loading && showLoader) {
      return (
        <Animated.View style={styles.spinner}>
          <MaterialCommunityIcons
            name="loading"
            size={thumbSize * 0.6}
            color={getIconColor()}
            style={{ transform: [{ rotate: '0deg' }] }}
          />
        </Animated.View>
      );
    }

    if (showIcon) {
      return (
        <MaterialCommunityIcons
          name={getIconName()}
          size={thumbSize * 0.6}
          color={getIconColor()}
        />
      );
    }

    return null;
  };

  const SwitchComponent = () => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableWithoutFeedback
        onPress={toggleSwitch}
        disabled={disabled || loading}
        accessibilityRole="switch"
        accessibilityState={{ disabled, checked: isOn }}
        accessibilityLabel={accessibilityLabel || label || 'Toggle switch'}
        testID={testID}>
        <View
          style={[
            styles.track,
            {
              width: trackWidth,
              height: trackHeight,
              backgroundColor: getTrackColor(),
              opacity: disabled ? 0.6 : 1,
            },
          ]}>
          <Animated.View
            style={[
              styles.thumb,
              {
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbRadius,
                backgroundColor: getThumbColor(),
                transform: [{ translateX: thumbTranslateX }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isOn ? 0.2 : 0.1,
                shadowRadius: 3,
                elevation: isOn ? 3 : 1,
              },
            ]}>
            {renderIcon()}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );

  if (!label && !description) {
    return <SwitchComponent />;
  }

  return (
    <View style={[styles.container, style]}>
      {labelPosition === 'left' && label && (
        <View style={styles.labelContainer}>
          <Text
            style={[
              styles.label,
              {
                fontSize: getLabelSize(),
                color: disabled ? colors.textDisabled : colors.text,
                marginRight: spacing.md,
              },
              labelStyle,
            ]}>
            {label}
          </Text>
          {description && (
            <Text
              style={[
                styles.description,
                {
                  fontSize: getLabelSize() - 2,
                  color: disabled ? colors.textDisabled : colors.textSecondary,
                },
                descriptionStyle,
              ]}>
              {description}
            </Text>
          )}
        </View>
      )}

      <View style={styles.switchContainer}>
        {labelPosition === 'right' ? (
          <>
            <SwitchComponent />
            {label && (
              <View style={styles.labelContainer}>
                <Text
                  style={[
                    styles.label,
                    {
                      fontSize: getLabelSize(),
                      color: disabled ? colors.textDisabled : colors.text,
                      marginLeft: spacing.md,
                    },
                    labelStyle,
                  ]}>
                  {label}
                </Text>
                {description && (
                  <Text
                    style={[
                      styles.description,
                      {
                        fontSize: getLabelSize() - 2,
                        color: disabled ? colors.textDisabled : colors.textSecondary,
                      },
                      descriptionStyle,
                    ]}>
                    {description}
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          <SwitchComponent />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  thumb: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    transform: [{ rotate: '0deg' }],
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.medium,
  },
  description: {
    fontFamily: fonts.regular,
    marginTop: 2,
  },
});

export default Switch;