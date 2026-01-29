import { useTheme } from '@hooks/useTheme';
import React, { forwardRef, ReactNode, useMemo } from 'react';
import {
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';

// Type definitions
export interface CardProps {
  // Content
  children: ReactNode;
  
  // Variants
  variant?: 'elevated' | 'outlined' | 'filled' | 'ghost';
  
  // Layout
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'round';
  
  // States
  disabled?: boolean;
  loading?: boolean;
  selected?: boolean;
  
  // Interactions
  onPress?: () => void;
  onLongPress?: () => void;
  pressable?: boolean;
  
  // Customization
  backgroundColor?: string;
  borderColor?: string;
  elevation?: number;
  
  // Style overrides
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'listitem' | 'none';
  
  // Testing
  testID?: string;
}

// Card component
export const Card = forwardRef<View, CardProps>(({
  // Props
  children,
  variant = 'elevated',
  padding = 'md',
  margin = 'none',
  borderRadius = 'md',
  disabled = false,
  loading = false,
  selected = false,
  onPress,
  onLongPress,
  pressable = false,
  backgroundColor,
  borderColor,
  elevation = 2,
  style,
  contentStyle,
  
  // Accessibility
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = pressable ? 'button' : 'none',
  
  // Testing
  testID,
  
  // Other props
  ...restProps
}, ref) => {
  const theme = useTheme();
  
  // Determine card styles based on variant and props
  const cardStyles = useMemo(() => {
    const styles: ViewStyle = {
      borderRadius: theme.getBorderRadius(borderRadius),
      overflow: 'hidden',
      opacity: disabled ? 0.5 : 1,
    };
    
    // Apply margin
    if (margin !== 'none') {
      styles.margin = theme.getSpacing(margin);
    }
    
    // Apply padding
    if (padding !== 'none') {
      styles.padding = theme.getSpacing(padding);
    }
    
    // Variant styles
    switch (variant) {
      case 'elevated':
        Object.assign(styles, theme.getShadow('md'));
        styles.backgroundColor = backgroundColor || theme.theme.colors.card;
        break;
      case 'outlined':
        styles.backgroundColor = backgroundColor || theme.theme.colors.card;
        styles.borderWidth = 1;
        styles.borderColor = borderColor || theme.theme.colors.border;
        break;
      case 'filled':
        styles.backgroundColor = backgroundColor || theme.theme.colors.backgroundSecondary;
        break;
      case 'ghost':
        styles.backgroundColor = 'transparent';
        break;
    }
    
    // Selected state
    if (selected) {
      styles.borderWidth = 2;
      styles.borderColor = theme.theme.colors.primary;
    }
    
    // Custom elevation (iOS shadow)
    if (variant === 'elevated' && elevation > 0) {
      const shadowIntensity = Math.min(elevation, 5) / 5;
      styles.shadowColor = '#000';
      styles.shadowOffset = { width: 0, height: shadowIntensity * 2 };
      styles.shadowOpacity = 0.1 + shadowIntensity * 0.2;
      styles.shadowRadius = shadowIntensity * 4;
      styles.elevation = elevation;
    }
    
    return styles;
  }, [variant, padding, margin, borderRadius, disabled, selected, backgroundColor, borderColor, elevation, theme]);
  
  // Render loading state
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingIndicator} />
    </View>
  );
  
  // Render content
  const renderContent = () => (
    <View style={[cardStyles, contentStyle]}>
      {loading ? renderLoading() : children}
    </View>
  );
  
  // If card is pressable, wrap with TouchableOpacity
  if (pressable && !disabled && !loading) {
    return (
      <TouchableOpacity
        ref={ref as React.Ref<TouchableOpacity>}
        style={[styles.container, style]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        disabled={disabled || loading}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        testID={testID}
        {...restProps}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }
  
  // If card is pressable with Pressable (better performance on iOS)
  if (pressable && !disabled && !loading) {
    return (
      <Pressable
        ref={ref as React.Ref<View>}
        style={({ pressed }) => [
          styles.container,
          style,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled || loading}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        testID={testID}
        {...restProps}
      >
        {renderContent()}
      </Pressable>
    );
  }
  
  // Regular card (non-pressable)
  return (
    <View
      ref={ref}
      style={[styles.container, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      testID={testID}
      {...restProps}
    >
      {renderContent()}
    </View>
  );
});

// Card Header component
export interface CardHeaderProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const CardHeader = forwardRef<View, CardHeaderProps>(({ children, style }, ref) => {
  const theme = useTheme();
  
  return (
    <View
      ref={ref}
      style={[
        styles.header,
        { paddingBottom: theme.getSpacing('md') },
        style,
      ]}
    >
      {children}
    </View>
  );
});

// Card Body component
export interface CardBodyProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const CardBody = forwardRef<View, CardBodyProps>(({ children, style }, ref) => {
  return (
    <View
      ref={ref}
      style={[styles.body, style]}
    >
      {children}
    </View>
  );
});

// Card Footer component
export interface CardFooterProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const CardFooter = forwardRef<View, CardFooterProps>(({ children, style }, ref) => {
  const theme = useTheme();
  
  return (
    <View
      ref={ref}
      style={[
        styles.footer,
        { paddingTop: theme.getSpacing('md') },
        style,
      ]}
    >
      {children}
    </View>
  );
});

// Card Title component
export interface CardTitleProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const CardTitle = forwardRef<View, CardTitleProps>(({ children, style }, ref) => {
  const theme = useTheme();
  
  return (
    <View
      ref={ref}
      style={[
        styles.title,
        { marginBottom: theme.getSpacing('xs') },
        style,
      ]}
    >
      {children}
    </View>
  );
});

// Card Subtitle component
export interface CardSubtitleProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const CardSubtitle = forwardRef<View, CardSubtitleProps>(({ children, style }, ref) => {
  const theme = useTheme();
  
  return (
    <View
      ref={ref}
      style={[
        styles.subtitle,
        { marginBottom: theme.getSpacing('sm') },
        style,
      ]}
    >
      {children}
    </View>
  );
});

// Card Divider component
export interface CardDividerProps {
  color?: string;
  thickness?: number;
  style?: ViewStyle;
}

export const CardDivider = forwardRef<View, CardDividerProps>(({
  color,
  thickness = 1,
  style,
}, ref) => {
  const theme = useTheme();
  
  return (
    <View
      ref={ref}
      style={[
        styles.divider,
        {
          height: thickness,
          backgroundColor: color || theme.theme.colors.borderLight,
          marginVertical: theme.getSpacing('md'),
        },
        style,
      ]}
    />
  );
});

// Card Image component
export interface CardImageProps {
  source: any;
  height?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  style?: ViewStyle;
}

export const CardImage = forwardRef<View, CardImageProps>(({
  source,
  height = 200,
  resizeMode = 'cover',
  style,
}, ref) => {
  return (
    <View
      ref={ref}
      style={[
        styles.imageContainer,
        { height },
        style,
      ]}
    >
      {/* In a real implementation, you would use Image component */}
      <View style={styles.imagePlaceholder}>
        {/* Image would go here */}
      </View>
    </View>
  );
});

// Card Actions component
export interface CardActionsProps {
  children: ReactNode;
  justify?: 'start' | 'center' | 'end' | 'space-between';
  style?: ViewStyle;
}

export const CardActions = forwardRef<View, CardActionsProps>(({
  children,
  justify = 'end',
  style,
}, ref) => {
  const justifyContent = {
    'start': 'flex-start',
    'center': 'center',
    'end': 'flex-end',
    'space-between': 'space-between',
  }[justify];
  
  return (
    <View
      ref={ref}
      style={[
        styles.actions,
        { justifyContent },
        style,
      ]}
    >
      {children}
    </View>
  );
});

// Card Stats component (for displaying stats in card)
export interface CardStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon?: ReactNode;
    color?: string;
  }>;
  columns?: number;
  style?: ViewStyle;
}

export const CardStats = forwardRef<View, CardStatsProps>(({
  stats,
  columns = 3,
  style,
}, ref) => {
  const theme = useTheme();
  
  return (
    <View
      ref={ref}
      style={[
        styles.statsContainer,
        style,
      ]}
    >
      {stats.map((stat, index) => (
        <View
          key={index}
          style={[
            styles.statItem,
            { width: `${100 / columns}%` },
          ]}
        >
          {stat.icon && (
            <View style={[styles.statIcon, { backgroundColor: stat.color || theme.theme.colors.primary }]}>
              {stat.icon}
            </View>
          )}
          <View style={styles.statContent}>
            <View style={styles.statValue}>
              {/* In a real implementation, you might use AnimatedNumber here */}
              {typeof stat.value === 'number' 
                ? stat.value.toLocaleString()
                : stat.value
              }
            </View>
            <View style={styles.statLabel}>
              {stat.label}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
});

// Styles
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  pressed: {
    opacity: 0.7,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#f3f3f3',
    borderTopColor: '#3498db',
    animationKeyframes: {
      '0%': { transform: [{ rotate: '0deg' }] },
      '100%': { transform: [{ rotate: '360deg' }] },
    },
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
  header: {
    width: '100%',
  },
  body: {
    width: '100%',
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  title: {
    width: '100%',
  },
  subtitle: {
    width: '100%',
  },
  divider: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  statItem: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
});

// Add subcomponents to Card
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Divider = CardDivider;
Card.Image = CardImage;
Card.Actions = CardActions;
Card.Stats = CardStats;

// Pre-configured card variants
Card.Elevated = forwardRef<View, Omit<CardProps, 'variant'>>((props, ref) => (
  <Card ref={ref} variant="elevated" {...props} />
));

Card.Outlined = forwardRef<View, Omit<CardProps, 'variant'>>((props, ref) => (
  <Card ref={ref} variant="outlined" {...props} />
));

Card.Filled = forwardRef<View, Omit<CardProps, 'variant'>>((props, ref) => (
  <Card ref={ref} variant="filled" {...props} />
));

Card.Ghost = forwardRef<View, Omit<CardProps, 'variant'>>((props, ref) => (
  <Card ref={ref} variant="ghost" {...props} />
));

// Display name for debugging
Card.displayName = 'Card';

export default Card;
