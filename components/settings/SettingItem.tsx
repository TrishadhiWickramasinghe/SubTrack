import { useTheme } from '@context/ThemeContext';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type SettingItemType = 
  | 'button'
  | 'toggle'
  | 'input'
  | 'select'
  | 'info'
  | 'danger'
  | 'warning'
  | 'success';

export interface SettingItemProps {
  // Core props
  label: string;
  type?: SettingItemType;
  value?: any;
  onValueChange?: (value: any) => void | Promise<void>;
  
  // Appearance
  icon?: string;
  iconColor?: string;
  description?: string;
  rightLabel?: string;
  rightIcon?: string;
  
  // State
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  
  // Input specific
  placeholder?: string;
  inputType?: 'text' | 'number' | 'email' | 'password';
  inputOptions?: any;
  
  // Toggle specific
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void | Promise<void>;
  
  // Button specific
  onPress?: () => void | Promise<void>;
  
  // Styling
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
  
  // Features
  showDivider?: boolean;
  dividerInset?: boolean;
  hapticFeedback?: boolean;
  testID?: string;
  
  // Children
  children?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const SettingItem: React.FC<SettingItemProps> = ({
  // Core props
  label,
  type = 'button',
  value,
  onValueChange,
  
  // Appearance
  icon,
  iconColor,
  description,
  rightLabel,
  rightIcon = 'chevron-right',
  
  // State
  disabled = false,
  loading = false,
  error,
  
  // Input specific
  placeholder,
  inputType = 'text',
  inputOptions,
  
  // Toggle specific
  toggleValue,
  onToggle,
  
  // Button specific
  onPress,
  
  // Styling
  style,
  labelStyle,
  valueStyle,
  
  // Features
  showDivider = true,
  dividerInset = false,
  testID,
  
  // Children
  children,
}) => {
  const { theme } = useTheme();
  const [internalValue, setInternalValue] = useState(value);
  const [isPressed, setIsPressed] = useState(false);

  // Determine item color based on type
  const getItemColor = useCallback(() => {
    switch (type) {
      case 'danger':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  }, [type, theme]);

  // Handle press with haptic feedback
  const handlePress = useCallback(async () => {
    if (disabled || loading) return;
    
    if (type === 'toggle' && onToggle) {
      await onToggle(!toggleValue);
    } else if (onPress) {
      await onPress();
    }
  }, [disabled, loading, type, onToggle, toggleValue, onPress]);

  // Handle input change
  const handleInputChange = useCallback((text: string) => {
    let processedValue: any = text;
    
    if (inputType === 'number') {
      processedValue = text === '' ? '' : parseFloat(text);
      if (isNaN(processedValue)) return;
    }
    
    setInternalValue(processedValue);
    onValueChange?.(processedValue);
  }, [inputType, onValueChange]);

  // Animated styles for press effect
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(isPressed ? 0.98 : 1, { duration: 100 }) }],
    backgroundColor: withTiming(
      disabled ? theme.colors.surface + '80' : theme.colors.surface,
      { duration: 200 }
    ),
  }));

  // Render left icon
  const renderLeftIcon = () => {
    if (!icon) return null;
    
    return (
      <View style={[styles.iconContainer, { backgroundColor: `${getItemColor()}20` }]}>
        <Icon name={icon} size={20} color={iconColor || getItemColor()} />
      </View>
    );
  };

  // Render right content
  const renderRightContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={theme.colors.primary} />;
    }

    if (type === 'toggle') {
      return (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          disabled={disabled}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={Platform.OS === 'ios' ? undefined : theme.colors.surface}
          ios_backgroundColor={theme.colors.border}
        />
      );
    }

    if (type === 'input') {
      return (
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: error ? theme.colors.error : theme.colors.border },
            valueStyle,
          ]}
          value={internalValue?.toString()}
          onChangeText={handleInputChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          editable={!disabled}
          secureTextEntry={inputType === 'password'}
          keyboardType={inputType === 'number' ? 'numeric' : 'default'}
          {...inputOptions}
        />
      );
    }

    if (rightLabel) {
      return (
        <Text style={[styles.rightLabel, { color: theme.colors.textSecondary }, valueStyle]}>
          {rightLabel}
        </Text>
      );
    }

    if (type === 'button' || type === 'select') {
      return (
        <View style={styles.chevronContainer}>
          {value && (
            <Text style={[styles.value, { color: theme.colors.textSecondary }, valueStyle]}>
              {value}
            </Text>
          )}
          <Icon name={rightIcon} size={20} color={theme.colors.textSecondary} />
        </View>
      );
    }

    return null;
  };

  const Container = type === 'button' || type === 'select' ? AnimatedTouchable : View;

  return (
    <View style={[styles.wrapper, style]}>
      <Container
        style={[
          styles.container,
          animatedStyles,
          disabled && styles.disabled,
        ]}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={handlePress}
        activeOpacity={1}
        disabled={disabled || type === 'input' || type === 'info'}
        testID={testID}
      >
        <View style={styles.content}>
          {/* Left section */}
          <View style={styles.leftSection}>
            {renderLeftIcon()}
            
            <View style={styles.textContainer}>
              <Text style={[styles.label, { color: theme.colors.text }, labelStyle]}>
                {label}
              </Text>
              {description && (
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                  {description}
                </Text>
              )}
              {error && (
                <Text style={[styles.error, { color: theme.colors.error }]}>
                  {error}
                </Text>
              )}
            </View>
          </View>

          {/* Right section */}
          <View style={styles.rightSection}>
            {renderRightContent()}
          </View>
        </View>

        {/* Custom children */}
        {children}
      </Container>

      {/* Divider */}
      {showDivider && (
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.colors.border },
            dividerInset && styles.dividerInset,
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  chevronContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 14,
    marginRight: 4,
  },
  input: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 100,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  dividerInset: {
    marginLeft: 68, // 16 (padding) + 36 (icon) + 12 (margin) + 4 (extra)
  },
});

export default SettingItem;