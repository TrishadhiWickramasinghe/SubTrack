/**
 * Spacing system for consistent margins and paddings
 * Using 8px base unit (8-point grid system)
 */

export const spacing = {
  // Absolute spacing (in pixels)
  px: 1,
  0: 0,
  0.5: 2,    // 2px
  1: 4,      // 4px
  1.5: 6,    // 6px
  2: 8,      // 8px (base unit)
  2.5: 10,   // 10px
  3: 12,     // 12px
  3.5: 14,   // 14px
  4: 16,     // 16px
  5: 20,     // 20px
  6: 24,     // 24px
  7: 28,     // 28px
  8: 32,     // 32px
  9: 36,     // 36px
  10: 40,    // 40px
  11: 44,    // 44px
  12: 48,    // 48px
  14: 56,    // 56px
  16: 64,    // 64px
  20: 80,    // 80px
  24: 96,    // 96px
  28: 112,   // 112px
  32: 128,   // 128px
  36: 144,   // 144px
  40: 160,   // 160px
  44: 176,   // 176px
  48: 192,   // 192px
  52: 208,   // 208px
  56: 224,   // 224px
  60: 240,   // 240px
  64: 256,   // 256px
  72: 288,   // 288px
  80: 320,   // 320px
  96: 384,   // 384px
  
  // Semantic spacing
  screenPadding: 16,
  cardPadding: 16,
  sectionPadding: 24,
  buttonPadding: 12,
  inputPadding: 12,
  iconSize: 24,
  avatarSize: 40,
  tabBarHeight: 56,
  headerHeight: 56,
  bottomSheetPadding: 24,
};

// Margin utilities
export const margin = {
  auto: 'auto',
  ...spacing,
};

// Padding utilities
export const padding = {
  ...spacing,
};

// Gap utilities (for flex layouts)
export const gap = {
  ...spacing,
};

export default {
  spacing,
  margin,
  padding,
  gap,
};