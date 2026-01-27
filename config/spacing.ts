/**
 * Spacing system for SubTrack
 * Based on 8-point grid system for consistent spacing
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;
const isLargeScreen = SCREEN_WIDTH > 414;

// Base spacing unit (8px)
const BASE_UNIT = 8;

// Scale factor for responsive spacing
const SCALE_FACTOR = SCREEN_WIDTH / 375; // Based on iPhone 6/7/8 width

/**
 * Generate responsive spacing values
 * @param {number} multiplier - Multiplier for base unit
 * @returns {number} - Responsive spacing value
 */
const scale = (multiplier) => {
  const value = BASE_UNIT * multiplier;
  return Math.round(value * SCALE_FACTOR);
};

// Absolute spacing values (in pixels)
export const spacing = {
  // Base units
  px: 1,
  0: 0,
  0.5: scale(0.5), // 4px
  1: scale(1),     // 8px
  1.5: scale(1.5), // 12px
  2: scale(2),     // 16px
  2.5: scale(2.5), // 20px
  3: scale(3),     // 24px
  3.5: scale(3.5), // 28px
  4: scale(4),     // 32px
  5: scale(5),     // 40px
  6: scale(6),     // 48px
  7: scale(7),     // 56px
  8: scale(8),     // 64px
  9: scale(9),     // 72px
  10: scale(10),   // 80px
  12: scale(12),   // 96px
  14: scale(14),   // 112px
  16: scale(16),   // 128px
  20: scale(20),   // 160px
  24: scale(24),   // 192px
  28: scale(28),   // 224px
  32: scale(32),   // 256px
  36: scale(36),   // 288px
  40: scale(40),   // 320px
  44: scale(44),   // 352px
  48: scale(48),   // 384px
  52: scale(52),   // 416px
  56: scale(56),   // 448px
  60: scale(60),   // 480px
  64: scale(64),   // 512px
  72: scale(72),   // 576px
  80: scale(80),   // 640px
  96: scale(96),   // 768px
  
  // Special values
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
};

// Semantic spacing for consistent UI
export const semanticSpacing = {
  // Screen layouts
  screenPadding: {
    horizontal: spacing[4],
    vertical: spacing[4],
  },
  screenPaddingSmall: {
    horizontal: spacing[2],
    vertical: spacing[2],
  },
  screenPaddingLarge: {
    horizontal: spacing[6],
    vertical: spacing[6],
  },
  
  // Cards
  cardPadding: spacing[4],
  cardPaddingSmall: spacing[3],
  cardPaddingLarge: spacing[6],
  cardMargin: spacing[3],
  cardBorderRadius: spacing[2],
  cardElevation: 2,
  
  // Buttons
  buttonPadding: {
    vertical: spacing[2],
    horizontal: spacing[4],
  },
  buttonPaddingSmall: {
    vertical: spacing[1.5],
    horizontal: spacing[3],
  },
  buttonPaddingLarge: {
    vertical: spacing[3],
    horizontal: spacing[6],
  },
  buttonBorderRadius: spacing[1],
  
  // Inputs
  inputPadding: {
    vertical: spacing[2],
    horizontal: spacing[3],
  },
  inputBorderRadius: spacing[1],
  inputHeight: 48,
  inputHeightSmall: 40,
  inputHeightLarge: 56,
  
  // Lists
  listItemPadding: {
    vertical: spacing[3],
    horizontal: spacing[4],
  },
  listItemSpacing: spacing[2],
  listSectionPadding: spacing[4],
  
  // Navigation
  headerHeight: 56,
  tabBarHeight: 56,
  drawerWidth: SCREEN_WIDTH * 0.8,
  
  // Modal & Sheets
  modalPadding: spacing[6],
  bottomSheetPadding: spacing[4],
  bottomSheetHandleHeight: 4,
  
  // Icons
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
  },
  
  // Avatars
  avatarSize: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
    xxl: 96,
  },
  
  // Badges
  badgePadding: {
    vertical: spacing[0.5],
    horizontal: spacing[1.5],
  },
  badgeBorderRadius: 12,
  
  // Dividers
  dividerHeight: 1,
  dividerMargin: spacing[3],
  
  // Loading states
  skeletonHeight: {
    small: 20,
    medium: 40,
    large: 60,
    xlarge: 80,
  },
  
  // Charts
  chartPadding: spacing[3],
  chartMargin: spacing[4],
};

// Layout-specific spacing
export const layout = {
  // Grid system
  gridGap: spacing[3],
  gridGapSmall: spacing[2],
  gridGapLarge: spacing[4],
  
  // Flex layouts
  flexGap: {
    xs: spacing[1],
    sm: spacing[2],
    md: spacing[3],
    lg: spacing[4],
    xl: spacing[6],
  },
  
  // Container widths
  containerWidth: {
    sm: 540,
    md: 720,
    lg: 960,
    xl: 1140,
    full: '100%',
  },
  
  // Max widths
  maxWidth: {
    xs: 320,
    sm: 384,
    md: 448,
    lg: 512,
    xl: 576,
  },
};

// Platform-specific adjustments
export const platform = {
  ios: {
    headerHeight: 44,
    statusBarHeight: 20,
    bottomTabHeight: 49,
    keyboardVerticalOffset: 0,
  },
  android: {
    headerHeight: 56,
    statusBarHeight: 24,
    bottomTabHeight: 56,
    keyboardVerticalOffset: -500,
  },
  web: {
    headerHeight: 64,
    statusBarHeight: 0,
    bottomTabHeight: 64,
  },
};

// Responsive breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Animation timing
export const timing = {
  fastest: 100,
  faster: 150,
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700,
  slowest: 1000,
};

// Export everything
export default {
  spacing,
  semantic: semanticSpacing,
  layout,
  platform,
  breakpoints,
  timing,
  
  // Helper functions
  scale,
  isSmallScreen,
  isLargeScreen,
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  
  // Quick access functions
  s: (multiplier) => scale(multiplier),
  p: (multiplier) => ({ padding: scale(multiplier) }),
  m: (multiplier) => ({ margin: scale(multiplier) }),
  px: (multiplier) => ({ paddingHorizontal: scale(multiplier) }),
  py: (multiplier) => ({ paddingVertical: scale(multiplier) }),
  mx: (multiplier) => ({ marginHorizontal: scale(multiplier) }),
  my: (multiplier) => ({ marginVertical: scale(multiplier) }),
};