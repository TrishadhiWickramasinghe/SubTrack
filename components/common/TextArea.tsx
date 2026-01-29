import { colors } from '@config/theme';
import React, { forwardRef, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableWithoutFeedback,
    View
} from 'react-native';

interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  required?: boolean;
  characterCount?: boolean;
  maxLength?: number;
  containerStyle?: any;
  labelStyle?: any;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium' | 'large';
}

const TextArea = forwardRef<TextInput, TextAreaProps>((props, ref) => {
  const {
    label,
    error,
    success,
    helperText,
    required,
    characterCount,
    maxLength,
    containerStyle,
    labelStyle,
    leftIcon,
    rightIcon,
    onRightIconPress,
    variant = 'outlined',
    size = 'medium',
    value = '',
    onChangeText,
    onFocus,
    onBlur,
    style,
    multiline = true,
    numberOfLines = 4,
    placeholder,
    editable = true,
    ...rest
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const animation = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  const getBorderColor = () => {
    if (error) return colors.error;
    if (success) return colors.success;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  const getBackgroundColor = () => {
    if (variant === 'filled') {
      return colors.surfaceVariant;
    }
    if (!editable) {
      return colors.disabled;
    }
    return colors.surface;
  };

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 80;
      case 'large':
        return 120;
      default:
        return 100;
    }
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    onBlur?.(e);
  };

  const handleChangeText = (text: string) => {
    onChangeText?.(text);
  };

  const labelPosition = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [15, -10],
  });

  const labelSize = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  const labelColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textSecondary, isFocused ? colors.primary : colors.textSecondary],
  });

  const borderWidth = variant === 'outlined' ? 1 : 0;
  const borderRadius = variant === 'standard' ? 0 : 8;

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: getBorderColor(),
              backgroundColor: getBackgroundColor(),
              borderWidth,
              borderRadius,
              minHeight: getHeight(),
            },
            variant === 'standard' && styles.standardVariant,
            !editable && styles.disabled,
          ]}>
          {/* Left Icon */}
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <View style={styles.inputWrapper}>
            {/* Floating Label */}
            {label && (
              <Animated.Text
                style={[
                  styles.label,
                  {
                    transform: [{ translateY: labelPosition }],
                    fontSize: labelSize,
                    color: labelColor,
                  },
                  labelStyle,
                ]}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
              </Animated.Text>
            )}

            {/* Text Input */}
            <TextInput
              ref={(node) => {
                if (typeof ref === 'function') {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
                inputRef.current = node;
              }}
              style={[
                styles.textArea,
                {
                  color: editable ? colors.text : colors.textDisabled,
                  textAlignVertical: 'top',
                  paddingTop: label ? 24 : 12,
                  paddingBottom: characterCount ? 24 : 12,
                  paddingLeft: leftIcon ? 40 : 12,
                  paddingRight: rightIcon ? 40 : 12,
                  minHeight: getHeight() - 24,
                },
                style,
              ]}
              value={value}
              onChangeText={handleChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={!label || isFocused || value ? placeholder : undefined}
              placeholderTextColor={colors.textDisabled}
              multiline={multiline}
              numberOfLines={numberOfLines}
              maxLength={maxLength}
              editable={editable}
              selectionColor={colors.primary}
              {...rest}
            />

            {/* Character Count */}
            {characterCount && maxLength && (
              <Text style={styles.characterCount}>
                {value.length}/{maxLength}
              </Text>
            )}
          </View>

          {/* Right Icon */}
          {rightIcon && (
            <TouchableWithoutFeedback onPress={onRightIconPress}>
              <View style={styles.rightIcon}>{rightIcon}</View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Helper Text & Error Message */}
      <View style={styles.helperContainer}>
        {(helperText || error) && (
          <Text
            style={[
              styles.helperText,
              error && styles.errorText,
              success && styles.successText,
            ]}>
            {error || helperText}
          </Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  standardVariant: {
    borderBottomWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderRadius: 0,
  },
  disabled: {
    opacity: 0.6,
  },
  inputWrapper: {
    flex: 1,
  },
  label: {
    position: 'absolute',
    left: 12,
    backgroundColor: 'transparent',
    zIndex: 1,
    fontFamily: 'Inter-Medium',
  },
  required: {
    color: colors.error,
  },
  textArea: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    includeFontPadding: false,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    top: 16,
    zIndex: 2,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
    zIndex: 2,
  },
  helperContainer: {
    marginTop: 4,
    minHeight: 20,
  },
  helperText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
  },
  successText: {
    color: colors.success,
  },
  characterCount: {
    position: 'absolute',
    bottom: 4,
    right: 12,
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
});

TextArea.displayName = 'TextArea';

export default TextArea;