import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';
import { fonts, typography } from './fonts';

/**
 * Light theme configuration
 */
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary colors
    primary: colors.primary[600],
    primaryContainer: colors.primary[50],
    onPrimary: colors.neutral[0],
    onPrimaryContainer: colors.primary[900],
    
    // Secondary colors
    secondary: colors.secondary[600],
    secondaryContainer: colors.secondary[50],
    onSecondary: colors.neutral[0],
    onSecondaryContainer: colors.secondary[900],
    
    // Tertiary colors
    tertiary: colors.tertiary[500],
    tertiaryContainer: colors.tertiary[50],
    onTertiary: colors.neutral[0],
    onTertiaryContainer: colors.tertiary[900],
    
    // Surface colors
    surface: colors.neutral[0],
    surfaceVariant: colors.neutral[100],
    onSurface: colors.neutral[900],
    onSurfaceVariant: colors.neutral[700],
    
    // Background
    background: colors.neutral[50],
    onBackground: colors.neutral[900],
    
    // Error
    error: colors.error[500],
    errorContainer: colors.error[50],
    onError: colors.neutral[0],
    onErrorContainer: colors.error[900],
    
    // Success
    success: colors.success[500],
    successContainer: colors.success[50],
    onSuccess: colors.neutral[0],
    onSuccessContainer: colors.success[900],
    
    // Warning
    warning: colors.warning[500],
    warningContainer: colors.warning[50],
    onWarning: colors.neutral[0],
    onWarningContainer: colors.warning[900],
    
    // Info
    info: colors.info[500],
    infoContainer: colors.info[50],
    onInfo: colors.neutral[0],
    onInfoContainer: colors.info[900],
    
    // Outline
    outline: colors.neutral[300],
    outlineVariant: colors.neutral[400],
    
    // Shadow
    shadow: colors.neutral[900],
    scrim: colors.neutral[900],
    
    // Inverse
    inverseSurface: colors.neutral[800],
    inverseOnSurface: colors.neutral[50],
    inversePrimary: colors.primary[200],
    
    // Custom colors for SubTrack
    card: colors.neutral[0],
    cardBorder: colors.neutral[200],
    accent: colors.accent[500],
    muted: colors.neutral[100],
    highlight: colors.highlight[500],
    
    // Status colors
    active: colors.success[500],
    pending: colors.warning[500],
    expired: colors.error[500],
    trial: colors.info[500],
    
    // Chart colors
    chart1: colors.primary[500],
    chart2: colors.secondary[500],
    chart3: colors.tertiary[500],
    chart4: colors.accent[500],
    chart5: colors.highlight[500],
  },
  fonts: {
    ...MD3LightTheme.fonts,
    ...fonts,
  },
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};

/**
 * Dark theme configuration
 */
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary colors
    primary: colors.primary[300],
    primaryContainer: colors.primary[800],
    onPrimary: colors.neutral[900],
    onPrimaryContainer: colors.primary[100],
    
    // Secondary colors
    secondary: colors.secondary[300],
    secondaryContainer: colors.secondary[800],
    onSecondary: colors.neutral[900],
    onSecondaryContainer: colors.secondary[100],
    
    // Tertiary colors
    tertiary: colors.tertiary[300],
    tertiaryContainer: colors.tertiary[800],
    onTertiary: colors.neutral[900],
    onTertiaryContainer: colors.tertiary[100],
    
    // Surface colors
    surface: colors.neutral[900],
    surfaceVariant: colors.neutral[800],
    onSurface: colors.neutral[100],
    onSurfaceVariant: colors.neutral[300],
    
    // Background
    background: colors.neutral[950],
    onBackground: colors.neutral[100],
    
    // Error
    error: colors.error[400],
    errorContainer: colors.error[800],
    onError: colors.neutral[900],
    onErrorContainer: colors.error[100],
    
    // Success
    success: colors.success[400],
    successContainer: colors.success[800],
    onSuccess: colors.neutral[900],
    onSuccessContainer: colors.success[100],
    
    // Warning
    warning: colors.warning[400],
    warningContainer: colors.warning[800],
    onWarning: colors.neutral[900],
    onWarningContainer: colors.warning[100],
    
    // Info
    info: colors.info[400],
    infoContainer: colors.info[800],
    onInfo: colors.neutral[900],
    onInfoContainer: colors.info[100],
    
    // Outline
    outline: colors.neutral[700],
    outlineVariant: colors.neutral[600],
    
    // Shadow
    shadow: colors.neutral[0],
    scrim: colors.neutral[0],
    
    // Inverse
    inverseSurface: colors.neutral[100],
    inverseOnSurface: colors.neutral[900],
    inversePrimary: colors.primary[700],
    
    // Custom colors for SubTrack
    card: colors.neutral[800],
    cardBorder: colors.neutral[700],
    accent: colors.accent[400],
    muted: colors.neutral[800],
    highlight: colors.highlight[400],
    
    // Status colors
    active: colors.success[400],
    pending: colors.warning[400],
    expired: colors.error[400],
    trial: colors.info[400],
    
    // Chart colors
    chart1: colors.primary[400],
    chart2: colors.secondary[400],
    chart3: colors.tertiary[400],
    chart4: colors.accent[400],
    chart5: colors.highlight[400],
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    ...fonts,
  },
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};

/**
 * Typography system
 */
export const typographyStyles = {
  displayLarge: {
    ...typography.displayLarge,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    ...typography.displayMedium,
    fontSize: 45,
    lineHeight: 52,
  },
  displaySmall: {
    ...typography.displaySmall,
    fontSize: 36,
    lineHeight: 44,
  },
  headlineLarge: {
    ...typography.headlineLarge,
    fontSize: 32,
    lineHeight: 40,
  },
  headlineMedium: {
    ...typography.headlineMedium,
    fontSize: 28,
    lineHeight: 36,
  },
  headlineSmall: {
    ...typography.headlineSmall,
    fontSize: 24,
    lineHeight: 32,
  },
  titleLarge: {
    ...typography.titleLarge,
    fontSize: 22,
    lineHeight: 28,
  },
  titleMedium: {
    ...typography.titleMedium,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
  },
  titleSmall: {
    ...typography.titleSmall,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  labelLarge: {
    ...typography.labelLarge,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  labelMedium: {
    ...typography.labelMedium,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  labelSmall: {
    ...typography.labelSmall,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  bodyLarge: {
    ...typography.bodyLarge,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    ...typography.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    ...typography.bodySmall,
    fontSize: 12,
    lineHeight: 16,
  },
};

/**
 * Spacing system (8px grid)
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

/**
 * Border radius
 */
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

/**
 * Shadows
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
};

/**
 * Animation durations
 */
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 750,
};

/**
 * Z-index layers
 */
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Re-export colors and fonts for convenience
export { colors } from './colors';
export { fonts } from './fonts';

export default {
  light: lightTheme,
  dark: darkTheme,
  typography: typographyStyles,
  spacing,
  borderRadius,
  shadows,
  animation,
  zIndex,
};