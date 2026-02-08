/**
 * Color palette for SubTrack app
 * Using a consistent color system with semantic naming
 */

// Neutral colors (grayscale)
export const neutral = {
  0: '#FFFFFF',
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
  950: '#030712',
};

// Primary colors (Brand - Indigo)
export const primary = {
  50: '#EEF2FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  300: '#A5B4FC',
  400: '#818CF8',
  500: '#6366F1',
  600: '#4F46E5',
  700: '#4338CA',
  800: '#3730A3',
  900: '#312E81',
  950: '#1E1B4B',
};

// Secondary colors (Emerald - Success)
export const secondary = {
  50: '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981',
  600: '#059669',
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
  950: '#022C22',
};

// Tertiary colors (Amber - Warning)
export const tertiary = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
  950: '#451A03',
};

// Error colors (Red)
export const error = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
  950: '#450A0A',
};

// Success colors (Green)
export const success = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
  950: '#052E16',
};

// Warning colors (Orange)
export const warning = {
  50: '#FFF7ED',
  100: '#FFEDD5',
  200: '#FED7AA',
  300: '#FDBA74',
  400: '#FB923C',
  500: '#F97316',
  600: '#EA580C',
  700: '#C2410C',
  800: '#9A3412',
  900: '#7C2D12',
  950: '#431407',
};

// Info colors (Blue)
export const info = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
  950: '#172554',
};

// Accent colors (Purple)
export const accent = {
  50: '#FAF5FF',
  100: '#F3E8FF',
  200: '#E9D5FF',
  300: '#D8B4FE',
  400: '#C084FC',
  500: '#A855F7',
  600: '#9333EA',
  700: '#7E22CE',
  800: '#6B21A8',
  900: '#581C87',
  950: '#3B0764',
};

// Highlight colors (Pink)
export const highlight = {
  50: '#FDF2F8',
  100: '#FCE7F3',
  200: '#FBCFE8',
  300: '#F9A8D4',
  400: '#F472B6',
  500: '#EC4899',
  600: '#DB2777',
  700: '#BE185D',
  800: '#9D174D',
  900: '#831843',
  950: '#500724',
};

// Chart colors for data visualization
export const chartColors = {
  // Sequential colors for charts
  sequential: [
    primary[500],
    secondary[500],
    tertiary[500],
    accent[500],
    highlight[500],
    primary[400],
    secondary[400],
    tertiary[400],
    accent[400],
    highlight[400],
  ],
  
  // Qualitative colors for categories
  qualitative: [
    primary[500],    // Entertainment
    secondary[500],  // Utilities
    tertiary[500],   // Productivity
    accent[500],     // Health
    highlight[500],  // Education
    info[500],       // Finance
    warning[500],    // Shopping
    error[500],      // Food
    success[500],    // Travel
    neutral[500],    // Other
  ],
  
  // Diverging colors for positive/negative
  diverging: {
    positive: success[500],
    neutral: neutral[500],
    negative: error[500],
  },
};

// Category-specific colors for subscriptions
export const categoryColors = {
  entertainment: primary[500],
  utilities: secondary[500],
  productivity: tertiary[500],
  health: accent[500],
  education: highlight[500],
  finance: info[500],
  shopping: warning[500],
  food: error[500],
  travel: success[500],
  other: neutral[500],
};

// Status colors for subscriptions
export const statusColors = {
  active: success[500],
  pending: warning[500],
  cancelled: error[500],
  expired: neutral[500],
  trial: info[500],
  upcoming: accent[500],
};

// Semantic color mapping
export const colors = {
  neutral,
  primary,
  secondary,
  tertiary,
  error,
  success,
  warning,
  info,
  accent,
  highlight,
  chart: chartColors,
  category: categoryColors,
  status: statusColors,
  
  // Semantic aliases
  brand: primary,
  danger: error,
  caution: warning,
  positive: success,
  
  // Gradient colors
  gradients: {
    primary: [primary[500], primary[700]],
    secondary: [secondary[500], secondary[700]],
    success: [success[500], success[700]],
    warning: [warning[500], warning[700]],
    error: [error[500], error[700]],
    premium: [accent[500], highlight[500]],
  },
};

export default colors;