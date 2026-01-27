/**
 * Font configuration for SubTrack app
 * Using Inter as the primary font family
 */

import { Platform } from 'react-native';

// Font family configuration
export const fontFamilies = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  light: 'Inter-Light',
  thin: 'Inter-Thin',
  
  // Fallback fonts
  monospace: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  serif: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  sansSerif: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
};

// Font weights
export const fontWeights = {
  thin: '100',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
};

// Font sizes (in pixels)
export const fontSizes = {
  // Display sizes
  displayLarge: 57,
  displayMedium: 45,
  displaySmall: 36,
  
  // Headline sizes
  headlineLarge: 32,
  headlineMedium: 28,
  headlineSmall: 24,
  
  // Title sizes
  titleLarge: 22,
  titleMedium: 18,
  titleSmall: 16,
  
  // Label sizes
  labelLarge: 14,
  labelMedium: 12,
  labelSmall: 11,
  
  // Body sizes
  bodyLarge: 16,
  bodyMedium: 14,
  bodySmall: 12,
  
  // Caption sizes
  caption: 10,
  
  // Special sizes
  button: 16,
  input: 16,
  tabBar: 10,
};

// Line heights
export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
  
  // Component specific
  displayLarge: 64,
  displayMedium: 52,
  displaySmall: 44,
  headlineLarge: 40,
  headlineMedium: 36,
  headlineSmall: 32,
  titleLarge: 28,
  titleMedium: 24,
  titleSmall: 20,
  bodyLarge: 24,
  bodyMedium: 20,
  bodySmall: 16,
  labelLarge: 20,
  labelMedium: 16,
  labelSmall: 16,
};

// Letter spacing
export const letterSpacing = {
  tighter: -0.05,
  tight: -0.025,
  normal: 0,
  wide: 0.025,
  wider: 0.05,
  widest: 0.1,
  
  // Component specific
  displayLarge: -0.25,
  displayMedium: 0,
  displaySmall: 0,
  headlineLarge: 0,
  headlineMedium: 0,
  headlineSmall: 0,
  titleLarge: 0,
  titleMedium: 0.15,
  titleSmall: 0.1,
  bodyLarge: 0.5,
  bodyMedium: 0.25,
  bodySmall: 0.4,
  labelLarge: 0.1,
  labelMedium: 0.5,
  labelSmall: 0.5,
};

// Typography system (Material Design 3)
export const typography = {
  displayLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.displayLarge,
    lineHeight: lineHeights.displayLarge,
    letterSpacing: letterSpacing.displayLarge,
  },
  displayMedium: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.displayMedium,
    lineHeight: lineHeights.displayMedium,
    letterSpacing: letterSpacing.displayMedium,
  },
  displaySmall: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.displaySmall,
    lineHeight: lineHeights.displaySmall,
    letterSpacing: letterSpacing.displaySmall,
  },
  headlineLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.headlineLarge,
    lineHeight: lineHeights.headlineLarge,
    letterSpacing: letterSpacing.headlineLarge,
  },
  headlineMedium: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.headlineMedium,
    lineHeight: lineHeights.headlineMedium,
    letterSpacing: letterSpacing.headlineMedium,
  },
  headlineSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.headlineSmall,
    lineHeight: lineHeights.headlineSmall,
    letterSpacing: letterSpacing.headlineSmall,
  },
  titleLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.titleLarge,
    lineHeight: lineHeights.titleLarge,
    letterSpacing: letterSpacing.titleLarge,
  },
  titleMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.titleMedium,
    lineHeight: lineHeights.titleMedium,
    letterSpacing: letterSpacing.titleMedium,
  },
  titleSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.titleSmall,
    lineHeight: lineHeights.titleSmall,
    letterSpacing: letterSpacing.titleSmall,
  },
  labelLarge: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.labelLarge,
    lineHeight: lineHeights.labelLarge,
    letterSpacing: letterSpacing.labelLarge,
  },
  labelMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.labelMedium,
    lineHeight: lineHeights.labelMedium,
    letterSpacing: letterSpacing.labelMedium,
  },
  labelSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.labelSmall,
    lineHeight: lineHeights.labelSmall,
    letterSpacing: letterSpacing.labelSmall,
  },
  bodyLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.bodyLarge,
    lineHeight: lineHeights.bodyLarge,
    letterSpacing: letterSpacing.bodyLarge,
  },
  bodyMedium: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.bodyMedium,
    lineHeight: lineHeights.bodyMedium,
    letterSpacing: letterSpacing.bodyMedium,
  },
  bodySmall: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.bodySmall,
    lineHeight: lineHeights.bodySmall,
    letterSpacing: letterSpacing.bodySmall,
  },
  button: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.button,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide,
  },
  caption: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
};

// Font configuration for react-native-paper
export const fonts = {
  regular: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
  },
  medium: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.medium,
  },
  light: {
    fontFamily: fontFamilies.light,
    fontWeight: fontWeights.light,
  },
  thin: {
    fontFamily: fontFamilies.thin,
    fontWeight: fontWeights.thin,
  },
};

// Utility function to load fonts
export const loadFonts = async () => {
  if (Platform.OS === 'web') {
    // For web, we can use @font-face
    return;
  }

  // For React Native, you would use Font.loadAsync
  // This is just a placeholder - actual implementation depends on your setup
  try {
    // Example with expo-font:
    // await Font.loadAsync({
    //   'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    //   'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    //   'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    //   'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    //   'Inter-Light': require('../assets/fonts/Inter-Light.ttf'),
    //   'Inter-Thin': require('../assets/fonts/Inter-Thin.ttf'),
    // });
  } catch (error) {
    console.warn('Error loading fonts:', error);
  }
};

// Export everything
export default {
  families: fontFamilies,
  weights: fontWeights,
  sizes: fontSizes,
  lineHeights,
  letterSpacing,
  typography,
  fonts,
  loadFonts,
};