import { useTheme } from '@hooks/useTheme';
import React, { forwardRef, useMemo } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from 'react-native';

// Type definitions
export interface ButtonProps extends TouchableOpacityProps {
  // Button variants
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  
  // Sizes
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  
  // Content
  title?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  
  // States
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  
  // Customization
  borderRadius?: number;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  
  // Accessibility
  accessibilityRole?: 'button' | 'link' | 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// Button component with forwardRef for touchable opacity
export const Button = forwardRef<TouchableOpacity, ButtonProps>(({
  // Props
  variant = 'primary',
  size = 'medium',
  title,
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  borderRadius,
  textStyle,
  containerStyle,
  style,
  children,
  
  // TouchableOpacity props
  onPress,
  onPressIn,
  onPressOut,
  onLongPress,
  activeOpacity = 0.7,
  delayPressIn,
  delayPressOut,
  delayLongPress,
  
  // Accessibility
  accessibilityRole = 'button',
  accessibilityLabel = title,
  accessibilityHint,
  accessibilityState,
  testID,
  
  // Other props
  ...restProps
}, ref) => {
  const theme = useTheme();
  
  // Determine button styles based on variant, size, and state
  const buttonStyles = useMemo(() => {
    const styles: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius || theme.getBorderRadius('md'),
      opacity: disabled ? 0.5 : 1,
      ...(fullWidth && { width: '100%' }),
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
      case 'xlarge':
        styles.height = 60;
        styles.paddingHorizontal = theme.getSpacing('2xl');
        break;
    }
    
    // Variant styles
    switch (variant) {
      case 'primary':
        styles.backgroundColor = theme.theme.colors.primary;
        break;
      case 'secondary':
        styles.backgroundColor = theme.theme.colors.secondary;
        break;
      case 'outline':
        styles.backgroundColor = 'transparent';
        styles.borderWidth = 1;
        styles.borderColor = theme.theme.colors.primary;
        break;
      case 'ghost':
        styles.backgroundColor = 'transparent';
        break;
      case 'danger':
        styles.backgroundColor = theme.theme.colors.error;
        break;
      case 'success':
        styles.backgroundColor = theme.theme.colors.success;
        break;
      case 'warning':
        styles.backgroundColor = theme.theme.colors.warning;
        break;
    }
    
    // Add shadow for elevated buttons (except ghost and outline)
    if (variant !== 'ghost' && variant !== 'outline') {
      Object.assign(styles, theme.getShadow('sm'));
    }
    
    return styles;
  }, [variant, size, disabled, fullWidth, borderRadius, theme]);
  
  // Determine text styles
  const textStyles = useMemo(() => {
    const styles: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };
    
    // Size-based text styles
    switch (size) {
      case 'small':
        styles.fontSize = theme.theme.typography.fontSize.sm;
        break;
      case 'medium':
        styles.fontSize = theme.theme.typography.fontSize.base;
        break;
      case 'large':
        styles.fontSize = theme.theme.typography.fontSize.lg;
        break;
      case 'xlarge':
        styles.fontSize = theme.theme.typography.fontSize.xl;
        break;
    }
    
    // Variant-based text colors
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
      case 'success':
      case 'warning':
        styles.color = theme.theme.colors.textInverse;
        break;
      case 'outline':
        styles.color = theme.theme.colors.primary;
        break;
      case 'ghost':
        styles.color = theme.theme.colors.primary;
        break;
    }
    
    return styles;
  }, [variant, size, theme]);
  
  // Determine icon color
  const iconColor = useMemo(() => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
      case 'success':
      case 'warning':
        return theme.theme.colors.textInverse;
      case 'outline':
      case 'ghost':
        return theme.theme.colors.primary;
      default:
        return theme.theme.colors.text;
    }
  }, [variant, theme]);
  
  // Render loading state
  const renderLoading = () => (
    <ActivityIndicator
      size={size === 'small' ? 'small' : 'small'}
      color={iconColor}
      style={styles.loading}
    />
  );
  
  // Render icon
  const renderIcon = () => {
    if (!icon || loading) return null;
    
    return (
      <View style={[
        styles.icon,
        iconPosition === 'left' ? styles.iconLeft : styles.iconRight
      ]}>
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement<any>, {
              color: icon.props.color || iconColor,
              size: icon.props.size || theme.getIconSize(size === 'small' ? 'small' : 'medium'),
            })
          : icon
        }
      </View>
    );
  };
  
  // Render content
  const renderContent = () => {
    if (loading) {
      return renderLoading();
    }
    
    return (
      <>
        {iconPosition === 'left' && renderIcon()}
        {title ? (
          <Text style={[textStyles, textStyle]}>
            {title}
          </Text>
        ) : null}
        {iconPosition === 'right' && renderIcon()}
        {children}
      </>
    );
  };
  
  // Handle press events
  const handlePress = (event: any) => {
    if (!disabled && !loading && onPress) {
      onPress(event);
    }
  };
  
  const handlePressIn = (event: any) => {
    if (!disabled && !loading && onPressIn) {
      onPressIn(event);
    }
  };
  
  const handlePressOut = (event: any) => {
    if (!disabled && !loading && onPressOut) {
      onPressOut(event);
    }
  };
  
  const handleLongPress = (event: any) => {
    if (!disabled && !loading && onLongPress) {
      onLongPress(event);
    }
  };
  
  return (
    <TouchableOpacity
      ref={ref}
      style={[buttonStyles, containerStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      activeOpacity={activeOpacity}
      delayPressIn={delayPressIn}
      delayPressOut={delayPressOut}
      delayLongPress={delayLongPress}
      disabled={disabled || loading}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
        ...accessibilityState,
      }}
      testID={testID}
      {...restProps}
    >
      {renderContent()}
    </TouchableOpacity>
  );
});

// Styles
const styles = StyleSheet.create({
  loading: {
    marginHorizontal: 8,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

// Pre-configured button variants
Button.Primary = forwardRef<TouchableOpacity, Omit<ButtonProps, 'variant'>>((props, ref) => (
  <Button ref={ref} variant="primary" {...props} />
));

Button.Secondary = forwardRef<TouchableOpacity, Omit<ButtonProps, 'variant'>>((props, ref) => (
  <Button ref={ref} variant="secondary" {...props} />
));

Button.Outline = forwardRef<TouchableOpacity, Omit<ButtonProps, 'variant'>>((props, ref) => (
  <Button ref={ref} variant="outline" {...props} />
));

Button.Ghost = forwardRef<TouchableOpacity, Omit<ButtonProps, 'variant'>>((props, ref) => (
  <Button ref={ref} variant="ghost" {...props} />
));

Button.Danger = forwardRef<TouchableOpacity, Omit<ButtonProps, 'variant'>>((props, ref) => (
  <Button ref={ref} variant="danger" {...props} />
));

Button.Success = forwardRef<TouchableOpacity, Omit<ButtonProps, 'variant'>>((props, ref) => (
  <Button ref={ref} variant="success" {...props} />
));

Button.Warning = forwardRef<TouchableOpacity, Omit<ButtonProps, 'variant'>>((props, ref) => (
  <Button ref={ref} variant="warning" {...props} />
));

// Pre-configured button sizes
Button.Small = forwardRef<TouchableOpacity, Omit<ButtonProps, 'size'>>((props, ref) => (
  <Button ref={ref} size="small" {...props} />
));

Button.Medium = forwardRef<TouchableOpacity, Omit<ButtonProps, 'size'>>((props, ref) => (
  <Button ref={ref} size="medium" {...props} />
));

Button.Large = forwardRef<TouchableOpacity, Omit<ButtonProps, 'size'>>((props, ref) => (
  <Button ref={ref} size="large" {...props} />
));

Button.XLarge = forwardRef<TouchableOpacity, Omit<ButtonProps, 'size'>>((props, ref) => (
  <Button ref={ref} size="xlarge" {...props} />
));

// Display name for debugging
Button.displayName = 'Button';

export default Button;
