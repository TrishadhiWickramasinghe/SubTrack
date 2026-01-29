import React, { forwardRef, useState, useImperativeHandle, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '@hooks/useTheme';

// Type definitions
export interface InputProps extends Omit<TextInputProps, 'style'> {
  // Input variants
  variant?: 'outlined' | 'filled' | 'underlined' | 'ghost';
  
  // Sizes
  size?: 'small' | 'medium' | 'large';
  
  // States
  disabled?: boolean;
  loading?: boolean;
  readonly?: boolean;
  error?: string | boolean;
  success?: string | boolean;
  warning?: string | boolean;
  
  // Label & placeholder
  label?: string;
  placeholder?: string;
  floatingLabel?: boolean;
  
  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearButton?: boolean;
  
  // Validation
  required?: boolean;
  validateOnBlur?: boolean;
  validationRules?: Array<{
    rule: (value: string) => boolean;
    message: string;
  }>;
  
  // Customization
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  focusedBorderColor?: string;
  errorBorderColor?: string;
  
  // Style overrides
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperTextStyle?: TextStyle;
  
  // Callbacks
  onValidation?: (isValid: boolean, errors: string[]) => void;
  onClear?: () => void;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Testing
  testID?: string;
}

export interface InputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  validate: () => boolean;
  getValue: () => string;
  setValue: (value: string) => void;
}

// Input component with forwardRef
export const Input = forwardRef<InputRef, InputProps>(({
  // Props
  variant = 'outlined',
  size = 'medium',
  disabled = false,
  loading = false,
  readonly = false,
  error = false,
  success = false,
  warning = false,
  label,
  placeholder,
  floatingLabel = false,
  leftIcon,
  rightIcon,
  clearButton = false,
  required = false,
  validateOnBlur = false,
  validationRules = [],
  borderRadius,
  backgroundColor,
  borderColor,
  focusedBorderColor,
  errorBorderColor,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperTextStyle,
  onValidation,
  onClear,
  
  // TextInput props
  value,
  defaultValue,
  onChangeText,
  onFocus,
  onBlur,
  onSubmitEditing,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  autoComplete,
  textContentType,
  returnKeyType,
  maxLength,
  multiline,
  numberOfLines,
  placeholderTextColor,
  selectionColor,
  
  // Accessibility
  accessibilityLabel = label,
  accessibilityHint,
  
  // Testing
  testID,
  
  // Other props
  ...restProps
}, ref) => {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || defaultValue || '');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Animation values
  const labelAnimation = useRef(new Animated.Value(value || defaultValue ? 1 : 0)).current;
  const errorAnimation = useRef(new Animated.Value(0)).current;
  
  // Update internal value when prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);
  
  // Animate label on focus/value change
  useEffect(() => {
    const shouldFloat = isFocused || internalValue || floatingLabel;
    
    Animated.timing(labelAnimation, {
      toValue: shouldFloat ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isFocused, internalValue, floatingLabel, labelAnimation]);
  
  // Animate error message
  useEffect(() => {
    const hasError = Boolean(error) || validationErrors.length > 0;
    
    Animated.timing(errorAnimation, {
      toValue: hasError ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [error, validationErrors, errorAnimation]);
  
  // Validate input
  const validateInput = (inputValue: string = internalValue): boolean => {
    const errors: string[] = [];
    
    // Required validation
    if (required && !inputValue.trim()) {
      errors.push('This field is required');
    }
    
    // Custom validation rules
    validationRules.forEach((rule) => {
      if (!rule.rule(inputValue)) {
        errors.push(rule.message);
      }
    });
    
    setValidationErrors(errors);
    
    if (onValidation) {
      onValidation(errors.length === 0, errors);
    }
    
    return errors.length === 0;
  };
  
  // Handle focus
  const handleFocus = (event: any) => {
    setIsFocused(true);
    setHasInteracted(true);
    
    if (onFocus) {
      onFocus(event);
    }
  };
  
  // Handle blur
  const handleBlur = (event: any) => {
    setIsFocused(false);
    
    if (validateOnBlur && hasInteracted) {
      validateInput();
    }
    
    if (onBlur) {
      onBlur(event);
    }
  };
  
  // Handle text change
  const handleChangeText = (text: string) => {
    setInternalValue(text);
    
    if (onChangeText) {
      onChangeText(text);
    }
    
    // Validate on change if has interacted
    if (hasInteracted) {
      validateInput(text);
    }
  };
  
  // Handle clear
  const handleClear = () => {
    setInternalValue('');
    
    if (onChangeText) {
      onChangeText('');
    }
    
    if (onClear) {
      onClear();
    }
    
    // Focus input after clear
    inputRef.current?.focus();
  };
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => handleClear(),
    validate: () => validateInput(),
    getValue: () => internalValue,
    setValue: (val: string) => {
      setInternalValue(val);
      if (onChangeText) {
        onChangeText(val);
      }
    },
  }));
  
  // Determine input styles based on variant, size, and state
  const getInputStyles = () => {
    const styles: ViewStyle & { input?: TextStyle } = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: borderRadius || theme.getBorderRadius('md'),
      opacity: disabled || readonly ? 0.6 : 1,
    };
    
    // Size styles
    switch (size) {
      case 'small':
        styles.height = 36;
        styles.paddingHorizontal = theme.getSpacing('md');
        break;
      case 'medium':
        styles.height = 44;
        styles.paddingHorizontal = theme.getSpacing('lg');
        break;
      case 'large':
        styles.height = 52;
        styles.paddingHorizontal = theme.getSpacing('xl');
        break;
    }
    
    // Variant styles
    switch (variant) {
      case 'outlined':
        styles.backgroundColor = backgroundColor || theme.theme.colors.inputBackground;
        styles.borderWidth = 1;
        styles.borderColor = getBorderColor();
        break;
      case 'filled':
        styles.backgroundColor = backgroundColor || theme.theme.colors.backgroundSecondary;
        styles.borderWidth = 1;
        styles.borderBottomWidth = 2;
        styles.borderColor = 'transparent';
        styles.borderBottomColor = getBorderColor();
        break;
      case 'underlined':
        styles.backgroundColor = 'transparent';
        styles.borderBottomWidth = 2;
        styles.borderColor = 'transparent';
        styles.borderBottomColor = getBorderColor();
        styles.borderRadius = 0;
        break;
      case 'ghost':
        styles.backgroundColor = 'transparent';
        break;
    }
    
    // Focus styles
    if (isFocused) {
      if (variant === 'outlined' || variant === 'filled') {
        styles.borderColor = getFocusedBorderColor();
      }
      if (variant === 'underlined') {
        styles.borderBottomColor = getFocusedBorderColor();
      }
    }
    
    return styles;
  };
  
  // Determine border color based on state
  const getBorderColor = (): string => {
    if (error || validationErrors.length > 0) {
      return errorBorderColor || theme.theme.colors.error;
    }
    
    if (success) {
      return theme.theme.colors.success;
    }
    
    if (warning) {
      return theme.theme.colors.warning;
    }
    
    return borderColor || theme.theme.colors.border;
  };
  
  // Determine focused border