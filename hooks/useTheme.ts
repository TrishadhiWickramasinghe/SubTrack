// TODO: Implement ThemeContext
// import { useTheme as useRNTheme } from '@context/ThemeContext';
// TODO: Implement theme types
// import { Theme, ThemeColors } from '@types/theme';

const useRNTheme = () => ({ 
  theme: { 
    colors: {
      primary: '#007AFF',
      primaryDark: '#0051D5',
      secondary: '#5856D6',
      accent: '#FF3B30',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      text: '#000',
      textSecondary: '#666',
      textTertiary: '#999',
      textInverse: '#FFF',
      background: '#FFF',
      backgroundSecondary: '#F5F5F5',
      backgroundTertiary: '#E5E5E5',
      card: '#FFF',
      border: '#CCC',
      disabled: '#CCC',
      inputBackground: '#F5F5F5',
    },
    typography: {
      fontFamily: { regular: 'System', bold: 'System' },
      fontSize: { sm: 12, base: 14, lg: 16, xl: 18, '2xl': 24, '3xl': 30, '4xl': 36 },
      lineHeight: { tight: 1.2, normal: 1.5 },
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    borderRadius: { sm: 4, md: 8, lg: 12, xl: 16 },
    shadows: { sm: {}, md: {}, lg: {} },
    animation: {
      duration: { fast: 100, normal: 200, slow: 300 },
      easing: { default: 'ease', linear: 'linear' },
    },
  },
  makeStyles: (creator: any) => creator(),
  isDark: false 
});
type Theme = any;
type ThemeColors = any;

/**
 * Custom hook for theme management with enhanced features
 * This hook provides theme utilities, color manipulation, and responsive design helpers
 */
export const useTheme = () => {
  const themeContext = useRNTheme();
  
  if (!themeContext) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  const { theme, makeStyles, ...contextProps } = themeContext;
  
  /**
   * COLOR UTILITIES
   */
  
  // Get color with opacity
  const getColorWithOpacity = (color: string, opacity: number): string => {
    // Convert hex color to rgba
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  };
  
  // Get gradient colors
  const getGradientColors = (type: string = 'primary'): string[] => {
    switch (type) {
      case 'primary':
        return [theme.colors.primary, theme.colors.primaryDark];
      case 'secondary':
        return [theme.colors.secondary, theme.colors.accent];
      case 'success':
        return [theme.colors.success, '#20c997'];
      case 'warning':
        return [theme.colors.warning, '#ffca2c'];
      case 'error':
        return [theme.colors.error, '#dc3545'];
      case 'dark':
        return [theme.colors.backgroundSecondary, theme.colors.backgroundTertiary];
      case 'light':
        return [theme.colors.background, theme.colors.backgroundSecondary];
      default:
        return [theme.colors.primary, theme.colors.primaryDark];
    }
  };
  
  // Get text color based on background
  const getTextColorForBackground = (backgroundColor: string): string => {
    // Simple brightness calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? theme.colors.text : theme.colors.textInverse;
  };
  
  // Get status color
  const getStatusColor = (status: string, variant: string = 'default'): string => {
    const baseColor = (theme.colors as any)[status] || theme.colors.primary;
    
    if (variant === 'light') {
      return getColorWithOpacity(baseColor, 0.1);
    } else if (variant === 'text') {
      return baseColor;
    }
    
    return baseColor;
  };
  
  /**
   * TYPOGRAPHY UTILITIES
   */
  
  // Get font size with scaling
  const getScaledFontSize = (sizeKey: string, scale: number = 1): number => {
    const baseSize = (theme.typography.fontSize as any)[sizeKey] || theme.typography.fontSize.base;
    return baseSize * scale;
  };
  
  // Get line height for font size
  const getLineHeightForFontSize = (fontSize: number): number => {
    if (fontSize <= 14) return fontSize * 1.5;
    if (fontSize <= 18) return fontSize * 1.4;
    return fontSize * 1.3;
  };
  
  // Get text style
  interface TextStyleOptions {
    color?: string;
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    fontStyle?: 'normal' | 'italic';
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
    letterSpacing?: number;
    lineHeight?: number;
  }
  
  const getTextStyle = (variant: string = 'body', options: TextStyleOptions = {}): any => {
    const defaultStyles: Record<string, any> = {
      h1: {
        fontSize: theme.typography.fontSize['4xl'],
        fontWeight: 'bold',
        lineHeight: theme.typography.lineHeight.tight,
      },
      h2: {
        fontSize: theme.typography.fontSize['3xl'],
        fontWeight: 'bold',
        lineHeight: theme.typography.lineHeight.tight,
      },
      h3: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: 'bold',
        lineHeight: theme.typography.lineHeight.tight,
      },
      h4: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: 'bold',
        lineHeight: theme.typography.lineHeight.normal,
      },
      title: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: 'bold',
        lineHeight: theme.typography.lineHeight.normal,
      },
      subtitle: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: '600',
        lineHeight: theme.typography.lineHeight.normal,
        color: theme.colors.textSecondary,
      },
      body: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: 'normal',
        lineHeight: theme.typography.lineHeight.normal,
      },
      caption: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: 'normal',
        lineHeight: theme.typography.lineHeight.normal,
        color: theme.colors.textSecondary,
      },
      label: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: '600',
        lineHeight: theme.typography.lineHeight.normal,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
    };
    
    const style = defaultStyles[variant] || defaultStyles.body;
    
    return {
      ...style,
      color: options.color || style.color || theme.colors.text,
      textAlign: options.textAlign,
      fontFamily: theme.typography.fontFamily[options.fontWeight as keyof typeof theme.typography.fontFamily] || 'System',
      ...options,
    };
  };
  
  /**
   * SPACING UTILITIES
   */
  
  // Get spacing value
  const getSpacing = (sizeKey: string): number => {
    return (theme.spacing as any)[sizeKey] || theme.spacing.md;
  };
  
  // Get responsive spacing
  const getResponsiveSpacing = (baseSize: string, multiplier: number = 1): number => {
    const baseSpacing = getSpacing(baseSize);
    return baseSpacing * multiplier;
  };
  
  // Get margin/padding shorthand
  interface SpacingShorthand {
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  }
  
  const getSpacingShorthand = (
    top: string | number,
    right?: string | number,
    bottom?: string | number,
    left?: string | number
  ): SpacingShorthand => {
    const t = typeof top === 'string' ? getSpacing(top) : top;
    const r = typeof right === 'string' ? getSpacing(right) : right ?? t;
    const b = typeof bottom === 'string' ? getSpacing(bottom) : bottom ?? t;
    const l = typeof left === 'string' ? getSpacing(left) : left ?? (typeof right === 'string' ? getSpacing(right) : r);
    
    return {
      marginTop: t as number,
      marginRight: r as number,
      marginBottom: b as number,
      marginLeft: l as number,
    };
  };
  
  /**
   * LAYOUT UTILITIES
   */
  
  // Get border radius
  const getBorderRadius = (sizeKey: string): number => {
    return (theme.borderRadius as any)[sizeKey] || theme.borderRadius.md;
  };
  
  // Get shadow style
  const getShadow = (sizeKey: string = 'md'): any => {
    return (theme.shadows as any)[sizeKey] || theme.shadows.md;
  };
  
  // Get card style
  interface CardStyleOptions {
    elevated?: boolean;
    bordered?: boolean;
    padding?: string | number;
    margin?: string | number;
    borderRadius?: string | number;
    backgroundColor?: string;
  }
  
  const getCardStyle = (options: CardStyleOptions = {}): any => {
    const {
      elevated = true,
      bordered = true,
      padding = 'md',
      margin = 'md',
      borderRadius = 'md',
      backgroundColor,
    } = options;
    
    const paddingValue = typeof padding === 'string' ? getSpacing(padding) : padding;
    const marginValue = typeof margin === 'string' ? getSpacing(margin) : margin;
    const borderRadiusValue = typeof borderRadius === 'string' ? getBorderRadius(borderRadius) : borderRadius;
    
    return {
      backgroundColor: backgroundColor || theme.colors.card,
      borderRadius: borderRadiusValue,
      padding: paddingValue,
      margin: marginValue,
      ...(elevated && getShadow()),
      ...(bordered && {
        borderWidth: 1,
        borderColor: theme.colors.border,
      }),
    };
  };
  
  // Get container style
  interface ContainerStyleOptions {
    maxWidth?: string | number;
    center?: boolean;
    padding?: string | number;
  }
  
  const getContainerStyle = (options: ContainerStyleOptions = {}): any => {
    const {
      maxWidth = '100%',
      center = false,
      padding = 'md',
    } = options;
    
    const paddingValue = typeof padding === 'string' ? getSpacing(padding) : padding;
    
    return {
      width: '100%',
      maxWidth,
      ...(center && { alignSelf: 'center' }),
      paddingHorizontal: paddingValue,
    };
  };
  
  /**
   * ANIMATION UTILITIES
   */
  
  // Get animation config
  interface AnimationConfigOptions {
    duration?: 'fast' | 'normal' | 'slow' | number;
    easing?: 'default' | 'linear' | 'easeIn' | 'easeOut';
    useNativeDriver?: boolean;
    delay?: number;
  }
  
  const getAnimationConfig = (type: string = 'default', options: AnimationConfigOptions = {}): any => {
    const baseConfig = {
      duration: typeof options.duration === 'string' 
        ? theme.animation.duration[options.duration] 
        : options.duration || theme.animation.duration.normal,
      easing: theme.animation.easing[(options.easing as keyof typeof theme.animation.easing) || 'default'] || 'ease',
      useNativeDriver: options.useNativeDriver !== undefined ? options.useNativeDriver : true,
    };
    
    return {
      ...baseConfig,
      ...options,
    };
  };
  
  /**
   * THEME AWARE STYLES
   */
  
  // Create themed style sheet
  const createThemedStyles = <T extends Record<string, any>>(
    stylesCreator: (theme: Theme) => T
  ): T => {
    return makeStyles(stylesCreator);
  };
  
  // Get theme-aware color
  const themedColor = (lightColor: string, darkColor: string): string => {
    return contextProps.isDark ? darkColor : lightColor;
  };
  
  // Get adaptive color
  const adaptiveColor = (colorKey: keyof ThemeColors): string => {
    const color = (theme.colors as any)[colorKey];
    
    // If color is a function, call it with theme mode
    if (typeof color === 'function') {
      return color(contextProps.isDark);
    }
    
    return color || '#000';
  };
  
  /**
   * RESPONSIVE DESIGN
   */
  
  // Get responsive value
  interface ResponsiveValues<T> {
    base: T;
    small?: T;
    medium?: T;
    large?: T;
  }
  
  const responsiveValue = <T>(values: ResponsiveValues<T>): T => {
    // This is a simplified version
    // In a real app, you would use Dimensions or react-native-responsive
    const { base } = values;
    
    // For now, return base value
    // You would implement screen size detection here
    return base;
  };
  
  // Get responsive font size
  const responsiveFontSize = (
    baseSize: number, 
    scaleFactors: { small?: number; medium?: number; large?: number } = {}
  ): number => {
    const { small = 0.9, medium = 1, large = 1.1 } = scaleFactors;
    
    // For now, return base size
    // You would implement screen size detection here
    return baseSize * medium;
  };
  
  /**
   * ICON AND IMAGE THEMING
   */
  
  // Get icon color
  const getIconColor = (type: string = 'default'): string => {
    switch (type) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      case 'muted':
        return theme.colors.textTertiary;
      case 'inverse':
        return theme.colors.textInverse;
      default:
        return theme.colors.text;
    }
  };
  
  // Get icon size
  const getIconSize = (size: string = 'medium'): number => {
    const sizes: Record<string, number> = {
      xsmall: 16,
      small: 20,
      medium: 24,
      large: 28,
      xlarge: 32,
      xxlarge: 40,
    };
    
    return sizes[size] || sizes.medium;
  };
  
  /**
   * FORM ELEMENT STYLES
   */
  
  // Get input style
  interface InputStyleOptions {
    hasError?: boolean;
    isFocused?: boolean;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
  }
  
  const getInputStyle = (options: InputStyleOptions = {}): any => {
    const {
      hasError = false,
      isFocused = false,
      disabled = false,
      size = 'medium',
    } = options;
    
    const sizes: Record<string, any> = {
      small: {
        height: 36,
        fontSize: theme.typography.fontSize.sm,
        paddingHorizontal: getSpacing('sm'),
      },
      medium: {
        height: 44,
        fontSize: theme.typography.fontSize.base,
        paddingHorizontal: getSpacing('md'),
      },
      large: {
        height: 52,
        fontSize: theme.typography.fontSize.lg,
        paddingHorizontal: getSpacing('lg'),
      },
    };
    
    return {
      backgroundColor: disabled ? theme.colors.disabled : theme.colors.inputBackground,
      borderWidth: 1,
      borderColor: hasError 
        ? theme.colors.error 
        : isFocused 
          ? theme.colors.primary 
          : theme.colors.border,
      borderRadius: getBorderRadius('md'),
      color: theme.colors.text,
      ...sizes[size],
    };
  };
  
  // Get button style
  interface ButtonStyleOptions {
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    fullWidth?: boolean;
  }
  
  const getButtonStyle = (variant: string = 'primary', options: ButtonStyleOptions = {}): any => {
    const {
      size = 'medium',
      disabled = false,
      fullWidth = false,
    } = options;
    
    const baseStyle = {
      borderRadius: getBorderRadius('md'),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...(fullWidth && { width: '100%' }),
    };
    
    const sizes: Record<string, any> = {
      small: {
        height: 36,
        paddingHorizontal: getSpacing('md'),
      },
      medium: {
        height: 44,
        paddingHorizontal: getSpacing('lg'),
      },
      large: {
        height: 52,
        paddingHorizontal: getSpacing('xl'),
      },
    };
    
    const variants: Record<string, any> = {
      primary: {
        backgroundColor: disabled ? theme.colors.disabled : theme.colors.primary,
      },
      secondary: {
        backgroundColor: disabled ? theme.colors.disabled : theme.colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? theme.colors.disabled : theme.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: disabled ? theme.colors.disabled : theme.colors.error,
      },
      success: {
        backgroundColor: disabled ? theme.colors.disabled : theme.colors.success,
      },
    };
    
    return {
      ...baseStyle,
      ...sizes[size],
      ...variants[variant],
    };
  };
  
  // Get button text style
  const getButtonTextStyle = (variant: string = 'primary', options: ButtonStyleOptions = {}): any => {
    const { size = 'medium', disabled = false } = options;
    
    const sizes: Record<string, any> = {
      small: {
        fontSize: theme.typography.fontSize.sm,
      },
      medium: {
        fontSize: theme.typography.fontSize.base,
      },
      large: {
        fontSize: theme.typography.fontSize.lg,
      },
    };
    
    const getTextColor = (): string => {
      if (disabled) return theme.colors.textTertiary;
      
      switch (variant) {
        case 'primary':
        case 'secondary':
        case 'danger':
        case 'success':
          return theme.colors.textInverse;
        case 'outline':
          return theme.colors.primary;
        case 'ghost':
          return theme.colors.primary;
        default:
          return theme.colors.text;
      }
    };
    
    return {
      color: getTextColor(),
      fontWeight: '600',
      ...sizes[size],
    };
  };
  
  /**
   * ACCESSIBILITY
   */
  
  // Get accessibility label
  const getAccessibilityLabel = (elementType: string, props: any): string => {
    // Implement based on your app's accessibility requirements
    return props.accessibilityLabel || '';
  };
  
  // Get accessibility traits
  const getAccessibilityTraits = (elementType: string): string[] => {
    const traits: Record<string, string[]> = {
      button: ['button'],
      link: ['link'],
      header: ['header'],
      image: ['image'],
      text: ['text'],
      input: ['adjustable'],
    };
    
    return traits[elementType] || [];
  };
  
  /**
   * THEME SWITCHING ANIMATIONS
   */
  
  // Get theme transition style (for use with Animated)
  const getThemeTransitionStyle = (animatedValue: any): any => {
    return {
      opacity: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
      }),
      transform: [
        {
          scale: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1],
          }),
        },
      ],
    };
  };
  
  return {
    // Theme context props
    ...contextProps,
    theme,
    
    // Color utilities
    getColorWithOpacity,
    getGradientColors,
    getTextColorForBackground,
    getStatusColor,
    getIconColor,
    adaptiveColor,
    themedColor,
    
    // Typography utilities
    getScaledFontSize,
    getLineHeightForFontSize,
    getTextStyle,
    responsiveFontSize,
    
    // Spacing utilities
    getSpacing,
    getResponsiveSpacing,
    getSpacingShorthand,
    
    // Layout utilities
    getBorderRadius,
    getShadow,
    getCardStyle,
    getContainerStyle,
    getIconSize,
    
    // Form element styles
    getInputStyle,
    getButtonStyle,
    getButtonTextStyle,
    
    // Animation utilities
    getAnimationConfig,
    getThemeTransitionStyle,
    
    // Responsive design
    responsiveValue,
    
    // Style creation
    createThemedStyles,
    makeStyles,
    
    // Accessibility
    getAccessibilityLabel,
    getAccessibilityTraits,
  };
};

// Helper hooks for specific theme operations

export const useThemeColors = () => {
  const { theme, getColorWithOpacity, getGradientColors } = useTheme();
  return { colors: theme.colors, getColorWithOpacity, getGradientColors };
};

export const useThemeTypography = () => {
  const { theme, getTextStyle, getScaledFontSize } = useTheme();
  return { typography: theme.typography, getTextStyle, getScaledFontSize };
};

export const useThemeSpacing = () => {
  const { theme, getSpacing, getResponsiveSpacing } = useTheme();
  return { spacing: theme.spacing, getSpacing, getResponsiveSpacing };
};

export const useThemeForms = () => {
  const { getInputStyle, getButtonStyle, getButtonTextStyle } = useTheme();
  return { getInputStyle, getButtonStyle, getButtonTextStyle };
};

// Pre-built style generators

export const createCardStyles = () => {
  const { theme, getCardStyle, getShadow } = useTheme();
  
  return {
    card: getCardStyle(),
    elevatedCard: getCardStyle({ elevated: true }),
    flatCard: getCardStyle({ elevated: false, bordered: true }),
    shadow: getShadow(),
  };
};

export const createTextStyles = () => {
  const { getTextStyle } = useTheme();
  
  return {
    h1: getTextStyle('h1'),
    h2: getTextStyle('h2'),
    h3: getTextStyle('h3'),
    h4: getTextStyle('h4'),
    title: getTextStyle('title'),
    subtitle: getTextStyle('subtitle'),
    body: getTextStyle('body'),
    caption: getTextStyle('caption'),
    label: getTextStyle('label'),
  };
};

export const createButtonStyles = () => {
  const { getButtonStyle, getButtonTextStyle } = useTheme();
  
  return {
    primary: {
      button: getButtonStyle('primary'),
      text: getButtonTextStyle('primary'),
    },
    secondary: {
      button: getButtonStyle('secondary'),
      text: getButtonTextStyle('secondary'),
    },
    outline: {
      button: getButtonStyle('outline'),
      text: getButtonTextStyle('outline'),
    },
    danger: {
      button: getButtonStyle('danger'),
      text: getButtonTextStyle('danger'),
    },
    success: {
      button: getButtonStyle('success'),
      text: getButtonTextStyle('success'),
    },
    ghost: {
      button: getButtonStyle('ghost'),
      text: getButtonTextStyle('ghost'),
    },
  };
};

// Default export
export default useTheme;