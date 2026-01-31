import { colors, fonts, spacing } from '@config/theme';
import { StyleSheet } from 'react-native';
import { combineStyles } from './globalStyles';

const textStyles = StyleSheet.create({
  // ===== BASE TEXT STYLES =====
  base: {
    fontFamily: fonts.regular,
    color: colors.text,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  // ===== TYPOGRAPHY SCALE =====
  scale: {
    // Display sizes
    display: {
      xxl: {
        fontSize: 64,
        fontFamily: fonts.bold,
        lineHeight: 72,
        letterSpacing: -0.5,
      },
      xl: {
        fontSize: 48,
        fontFamily: fonts.bold,
        lineHeight: 56,
        letterSpacing: -0.25,
      },
      lg: {
        fontSize: 40,
        fontFamily: fonts.bold,
        lineHeight: 48,
      },
      md: {
        fontSize: 32,
        fontFamily: fonts.bold,
        lineHeight: 40,
      },
      sm: {
        fontSize: 24,
        fontFamily: fonts.bold,
        lineHeight: 32,
      },
      xs: {
        fontSize: 20,
        fontFamily: fonts.bold,
        lineHeight: 28,
      },
    },

    // Heading sizes
    heading: {
      h1: {
        fontSize: 32,
        fontFamily: fonts.bold,
        lineHeight: 40,
        marginBottom: spacing.sm,
      },
      h2: {
        fontSize: 28,
        fontFamily: fonts.bold,
        lineHeight: 36,
        marginBottom: spacing.sm,
      },
      h3: {
        fontSize: 24,
        fontFamily: fonts.semiBold,
        lineHeight: 32,
        marginBottom: spacing.xs,
      },
      h4: {
        fontSize: 20,
        fontFamily: fonts.semiBold,
        lineHeight: 28,
        marginBottom: spacing.xs,
      },
      h5: {
        fontSize: 18,
        fontFamily: fonts.semiBold,
        lineHeight: 24,
        marginBottom: spacing.xs,
      },
      h6: {
        fontSize: 16,
        fontFamily: fonts.semiBold,
        lineHeight: 22,
        marginBottom: spacing.xs,
      },
    },

    // Body sizes
    body: {
      xl: {
        fontSize: 20,
        fontFamily: fonts.regular,
        lineHeight: 30,
      },
      lg: {
        fontSize: 18,
        fontFamily: fonts.regular,
        lineHeight: 28,
      },
      md: {
        fontSize: 16,
        fontFamily: fonts.regular,
        lineHeight: 24,
      },
      sm: {
        fontSize: 14,
        fontFamily: fonts.regular,
        lineHeight: 20,
      },
      xs: {
        fontSize: 12,
        fontFamily: fonts.regular,
        lineHeight: 18,
      },
      xxs: {
        fontSize: 10,
        fontFamily: fonts.regular,
        lineHeight: 14,
      },
    },

    // Label sizes
    label: {
      xl: {
        fontSize: 16,
        fontFamily: fonts.medium,
        lineHeight: 20,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      lg: {
        fontSize: 14,
        fontFamily: fonts.medium,
        lineHeight: 18,
        textTransform: 'uppercase',
        letterSpacing: 0.25,
      },
      md: {
        fontSize: 12,
        fontFamily: fonts.medium,
        lineHeight: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      sm: {
        fontSize: 10,
        fontFamily: fonts.medium,
        lineHeight: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
    },

    // Caption sizes
    caption: {
      lg: {
        fontSize: 14,
        fontFamily: fonts.regular,
        lineHeight: 18,
        color: colors.textSecondary,
      },
      md: {
        fontSize: 12,
        fontFamily: fonts.regular,
        lineHeight: 16,
        color: colors.textSecondary,
      },
      sm: {
        fontSize: 10,
        fontFamily: fonts.regular,
        lineHeight: 14,
        color: colors.textSecondary,
      },
    },
  },

  // ===== FONT WEIGHTS =====
  weight: {
    thin: {
      fontFamily: fonts.light,
    },
    light: {
      fontFamily: fonts.light,
    },
    regular: {
      fontFamily: fonts.regular,
    },
    medium: {
      fontFamily: fonts.medium,
    },
    semiBold: {
      fontFamily: fonts.semiBold,
    },
    bold: {
      fontFamily: fonts.bold,
    },
    extraBold: {
      fontFamily: fonts.bold,
    },
    black: {
      fontFamily: fonts.bold,
    },
  },

  // ===== TEXT COLORS =====
  color: {
    // Primary colors
    primary: {
      color: colors.primary,
    },
    primaryLight: {
      color: colors.primaryLight,
    },
    primaryDark: {
      color: colors.primaryDark,
    },

    // Secondary colors
    secondary: {
      color: colors.secondary,
    },
    secondaryLight: {
      color: colors.secondaryLight,
    },
    secondaryDark: {
      color: colors.secondaryDark,
    },

    // Success colors
    success: {
      color: colors.success,
    },
    successLight: {
      color: colors.successLight,
    },
    successDark: {
      color: colors.success,
    },

    // Error colors
    error: {
      color: colors.error,
    },
    errorLight: {
      color: colors.errorLight,
    },
    errorDark: {
      color: colors.error,
    },

    // Warning colors
    warning: {
      color: colors.warning,
    },
    warningLight: {
      color: colors.warningLight,
    },
    warningDark: {
      color: colors.warning,
    },

    // Info colors
    info: {
      color: colors.info,
    },
    infoLight: {
      color: colors.infoLight,
    },
    infoDark: {
      color: colors.info,
    },

    // Text colors
    text: {
      color: colors.text,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    textDisabled: {
      color: colors.textDisabled,
    },
    textInverse: {
      color: colors.surface,
    },

    // Surface colors
    surface: {
      color: colors.surface,
    },
    surfaceVariant: {
      color: colors.surfaceVariant,
    },
    background: {
      color: colors.background,
    },

    // Border colors
    border: {
      color: colors.border,
    },
    borderDark: {
      color: colors.borderDark,
    },

    // Muted colors
    muted: {
      color: colors.textDisabled,
    },

    // White and black
    white: {
      color: colors.surface,
    },
    black: {
      color: colors.text,
    },

    // Transparent
    transparent: {
      color: 'transparent',
    },
  },

  // ===== TEXT ALIGNMENT =====
  align: {
    left: {
      textAlign: 'left',
    },
    center: {
      textAlign: 'center',
    },
    right: {
      textAlign: 'right',
    },
    justify: {
      textAlign: 'justify',
    },
    auto: {
      textAlign: 'auto',
    },
  },

  // ===== TEXT TRANSFORMS =====
  transform: {
    uppercase: {
      textTransform: 'uppercase',
    },
    lowercase: {
      textTransform: 'lowercase',
    },
    capitalize: {
      textTransform: 'capitalize',
    },
    none: {
      textTransform: 'none',
    },
  },

  // ===== TEXT DECORATION =====
  decoration: {
    underline: {
      textDecorationLine: 'underline',
    },
    lineThrough: {
      textDecorationLine: 'line-through',
    },
    underlineLineThrough: {
      textDecorationLine: 'underline line-through',
    },
    none: {
      textDecorationLine: 'none',
    },
  },

  // ===== LINE HEIGHTS =====
  lineHeight: {
    none: {
      lineHeight: 1,
    },
    tight: {
      lineHeight: 1.25,
    },
    snug: {
      lineHeight: 1.375,
    },
    normal: {
      lineHeight: 1.5,
    },
    relaxed: {
      lineHeight: 1.625,
    },
    loose: {
      lineHeight: 2,
    },
  },

  // ===== LETTER SPACING =====
  letterSpacing: {
    tighter: {
      letterSpacing: -0.05,
    },
    tight: {
      letterSpacing: -0.025,
    },
    normal: {
      letterSpacing: 0,
    },
    wide: {
      letterSpacing: 0.025,
    },
    wider: {
      letterSpacing: 0.05,
    },
    widest: {
      letterSpacing: 0.1,
    },
  },

  // ===== TEXT STYLES FOR SPECIFIC USE CASES =====
  useCases: {
    // Price/Amount display
    price: {
      large: {
        fontSize: 32,
        fontFamily: fonts.bold,
        color: colors.text,
      },
      medium: {
        fontSize: 24,
        fontFamily: fonts.bold,
        color: colors.text,
      },
      small: {
        fontSize: 18,
        fontFamily: fonts.semiBold,
        color: colors.text,
      },
      xsmall: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: colors.text,
      },
      currency: {
        fontSize: 12,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
    },

    // Date/Time display
    dateTime: {
      large: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: colors.text,
      },
      medium: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: colors.text,
      },
      small: {
        fontSize: 12,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      xsmall: {
        fontSize: 10,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
    },

    // Category/Status badges
    badge: {
      primary: {
        fontSize: 10,
        fontFamily: fonts.medium,
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      success: {
        fontSize: 10,
        fontFamily: fonts.medium,
        color: colors.success,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      error: {
        fontSize: 10,
        fontFamily: fonts.medium,
        color: colors.error,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      warning: {
        fontSize: 10,
        fontFamily: fonts.medium,
        color: colors.warning,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      info: {
        fontSize: 10,
        fontFamily: fonts.medium,
        color: colors.info,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      muted: {
        fontSize: 10,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
    },

    // List items
    listItem: {
      title: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: colors.text,
      },
      subtitle: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      description: {
        fontSize: 12,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      value: {
        fontSize: 16,
        fontFamily: fonts.semiBold,
        color: colors.text,
      },
    },

    // Form elements
    form: {
      label: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: colors.text,
        marginBottom: spacing.xs,
      },
      hint: {
        fontSize: 12,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        marginTop: spacing.xs,
      },
      error: {
        fontSize: 12,
        fontFamily: fonts.regular,
        color: colors.error,
        marginTop: spacing.xs,
      },
      placeholder: {
        fontSize: 16,
        fontFamily: fonts.regular,
        color: colors.textDisabled,
      },
    },

    // Button text
    button: {
      large: {
        fontSize: 18,
        fontFamily: fonts.semiBold,
      },
      medium: {
        fontSize: 16,
        fontFamily: fonts.semiBold,
      },
      small: {
        fontSize: 14,
        fontFamily: fonts.semiBold,
      },
      xsmall: {
        fontSize: 12,
        fontFamily: fonts.semiBold,
      },
    },

    // Navigation
    navigation: {
      title: {
        fontSize: 20,
        fontFamily: fonts.semiBold,
        color: colors.text,
      },
      subtitle: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      tab: {
        active: {
          fontSize: 12,
          fontFamily: fonts.semiBold,
          color: colors.primary,
        },
        inactive: {
          fontSize: 12,
          fontFamily: fonts.medium,
          color: colors.textSecondary,
        },
      },
    },

    // Card text
    card: {
      title: {
        fontSize: 18,
        fontFamily: fonts.semiBold,
        color: colors.text,
      },
      subtitle: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      description: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        lineHeight: 20,
      },
      value: {
        fontSize: 24,
        fontFamily: fonts.bold,
        color: colors.text,
      },
      label: {
        fontSize: 12,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
    },

    // Statistics/Data
    stat: {
      value: {
        large: {
          fontSize: 48,
          fontFamily: fonts.bold,
          color: colors.text,
        },
        medium: {
          fontSize: 32,
          fontFamily: fonts.bold,
          color: colors.text,
        },
        small: {
          fontSize: 24,
          fontFamily: fonts.semiBold,
          color: colors.text,
        },
      },
      label: {
        large: {
          fontSize: 16,
          fontFamily: fonts.medium,
          color: colors.textSecondary,
        },
        medium: {
          fontSize: 14,
          fontFamily: fonts.medium,
          color: colors.textSecondary,
        },
        small: {
          fontSize: 12,
          fontFamily: fonts.medium,
          color: colors.textSecondary,
        },
      },
      change: {
        positive: {
          fontSize: 14,
          fontFamily: fonts.semiBold,
          color: colors.success,
        },
        negative: {
          fontSize: 14,
          fontFamily: fonts.semiBold,
          color: colors.error,
        },
        neutral: {
          fontSize: 14,
          fontFamily: fonts.semiBold,
          color: colors.textSecondary,
        },
      },
    },

    // Empty states
    emptyState: {
      title: {
        fontSize: 20,
        fontFamily: fonts.semiBold,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.sm,
      },
      description: {
        fontSize: 16,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
      },
      action: {
        fontSize: 16,
        fontFamily: fonts.semiBold,
        color: colors.primary,
        textAlign: 'center',
      },
    },

    // Loading states
    loading: {
      title: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: colors.text,
        textAlign: 'center',
      },
      subtitle: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        textAlign: 'center',
      },
    },

    // Onboarding
    onboarding: {
      title: {
        fontSize: 32,
        fontFamily: fonts.bold,
        color: colors.text,
        textAlign: 'center',
        lineHeight: 40,
      },
      subtitle: {
        fontSize: 18,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 28,
      },
      step: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
    },

    // Settings
    settings: {
      section: {
        fontSize: 12,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
      },
      item: {
        title: {
          fontSize: 16,
          fontFamily: fonts.medium,
          color: colors.text,
        },
        description: {
          fontSize: 14,
          fontFamily: fonts.regular,
          color: colors.textSecondary,
        },
        value: {
          fontSize: 14,
          fontFamily: fonts.regular,
          color: colors.textSecondary,
        },
      },
    },
  },

  // ===== TEXT WITH ICONS =====
  withIcon: {
    left: {
      marginLeft: spacing.xs,
    },
    right: {
      marginRight: spacing.xs,
    },
    both: {
      marginHorizontal: spacing.xs,
    },
  },

  // ===== TEXT TRUNCATION =====
  truncation: {
    truncate: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    clamp1: {
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 1,
      WebkitBoxOrient: 'vertical',
    },
    clamp2: {
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
    },
    clamp3: {
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
    },
    clamp4: {
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 4,
      WebkitBoxOrient: 'vertical',
    },
  },

  // ===== TEXT SHADOWS =====
  shadow: {
    none: {
      textShadowColor: 'transparent',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 0,
    },
    sm: {
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    md: {
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    lg: {
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 3 },
      textShadowRadius: 6,
    },
  },

  // ===== ACCESSIBILITY =====
  accessibility: {
    large: {
      fontSize: 18,
    },
    extraLarge: {
      fontSize: 20,
    },
    bold: {
      fontFamily: fonts.bold,
    },
    highContrast: {
      color: colors.text,
    },
  },
});

// Helper function to create text styles dynamically
const createTextStyle = (
  scale: keyof typeof textStyles.scale,
  size: keyof any = 'md',
  color: keyof typeof textStyles.color = 'text',
  weight: keyof typeof textStyles.weight = 'regular',
  align: keyof typeof textStyles.align = 'left',
  transform: keyof typeof textStyles.transform = 'none',
  lineHeight: keyof typeof textStyles.lineHeight = 'normal',
  letterSpacing: keyof typeof textStyles.letterSpacing = 'normal'
) => {
  const scaleObj = textStyles.scale[scale];
  const sizeObj = (scaleObj as any)[size] || scaleObj;

  return StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      sizeObj,
      textStyles.color[color],
      textStyles.weight[weight],
      textStyles.align[align],
      textStyles.transform[transform],
      textStyles.lineHeight[lineHeight],
      textStyles.letterSpacing[letterSpacing]
    ),
  });
};

// Pre-defined text style combinations for common use cases
const textPresets = {
  // Display text
  display: createTextStyle('display', 'md', 'text', 'bold', 'left', 'none', 'tight', 'normal'),
  displayLarge: createTextStyle('display', 'lg', 'text', 'bold', 'left', 'none', 'tight', 'normal'),
  displaySmall: createTextStyle('display', 'sm', 'text', 'bold', 'left', 'none', 'tight', 'normal'),

  // Headings
  h1: createTextStyle('heading', 'h1', 'text', 'bold', 'left', 'none', 'tight', 'normal'),
  h2: createTextStyle('heading', 'h2', 'text', 'bold', 'left', 'none', 'tight', 'normal'),
  h3: createTextStyle('heading', 'h3', 'text', 'semiBold', 'left', 'none', 'tight', 'normal'),
  h4: createTextStyle('heading', 'h4', 'text', 'semiBold', 'left', 'none', 'tight', 'normal'),
  h5: createTextStyle('heading', 'h5', 'text', 'semiBold', 'left', 'none', 'tight', 'normal'),
  h6: createTextStyle('heading', 'h6', 'text', 'semiBold', 'left', 'none', 'tight', 'normal'),

  // Body text
  body: createTextStyle('body', 'md', 'text', 'regular', 'left', 'none', 'normal', 'normal'),
  bodyLarge: createTextStyle('body', 'lg', 'text', 'regular', 'left', 'none', 'relaxed', 'normal'),
  bodySmall: createTextStyle('body', 'sm', 'text', 'regular', 'left', 'none', 'normal', 'normal'),
  bodyXSmall: createTextStyle('body', 'xs', 'textSecondary', 'regular', 'left', 'none', 'normal', 'normal'),

  // Labels
  label: createTextStyle('label', 'md', 'textSecondary', 'medium', 'left', 'uppercase', 'tight', 'wide'),
  labelLarge: createTextStyle('label', 'lg', 'textSecondary', 'medium', 'left', 'uppercase', 'tight', 'wide'),
  labelSmall: createTextStyle('label', 'sm', 'textSecondary', 'medium', 'left', 'uppercase', 'tight', 'wide'),

  // Captions
  caption: createTextStyle('caption', 'md', 'textSecondary', 'regular', 'left', 'none', 'normal', 'normal'),
  captionLarge: createTextStyle('caption', 'lg', 'textSecondary', 'regular', 'left', 'none', 'normal', 'normal'),
  captionSmall: createTextStyle('caption', 'sm', 'textSecondary', 'regular', 'left', 'none', 'normal', 'normal'),

  // Button text
  button: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.button.medium,
      textStyles.color.white
    ),
  }),
  buttonSmall: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.button.small,
      textStyles.color.white
    ),
  }),
  buttonLarge: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.button.large,
      textStyles.color.white
    ),
  }),

  // Price text
  priceLarge: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.price.large,
      textStyles.weight.bold
    ),
  }),
  priceMedium: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.price.medium,
      textStyles.weight.semiBold
    ),
  }),
  priceSmall: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.price.small,
      textStyles.weight.medium
    ),
  }),

  // Card text
  cardTitle: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.card.title,
      textStyles.weight.semiBold
    ),
  }),
  cardSubtitle: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.card.subtitle,
      textStyles.weight.regular
    ),
  }),
  cardValue: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.card.value,
      textStyles.weight.bold
    ),
  }),

  // Stat text
  statValue: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.stat.value.medium,
      textStyles.weight.bold
    ),
  }),
  statLabel: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.stat.label.medium,
      textStyles.weight.medium
    ),
  }),

  // List item text
  listItemTitle: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.listItem.title,
      textStyles.weight.medium
    ),
  }),
  listItemSubtitle: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.listItem.subtitle,
      textStyles.weight.regular
    ),
  }),

  // Form text
  formLabel: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.form.label,
      textStyles.weight.medium
    ),
  }),
  formError: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.form.error,
      textStyles.weight.regular
    ),
  }),

  // Navigation text
  navTitle: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.navigation.title,
      textStyles.weight.semiBold
    ),
  }),
  navTabActive: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.navigation.tab.active,
      textStyles.weight.semiBold
    ),
  }),
  navTabInactive: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.navigation.tab.inactive,
      textStyles.weight.medium
    ),
  }),

  // Empty state text
  emptyStateTitle: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.emptyState.title,
      textStyles.weight.semiBold,
      textStyles.align.center
    ),
  }),
  emptyStateDescription: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.emptyState.description,
      textStyles.weight.regular,
      textStyles.align.center
    ),
  }),

  // Settings text
  settingsSection: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.settings.section,
      textStyles.weight.medium,
      textStyles.transform.uppercase
    ),
  }),
  settingsItemTitle: StyleSheet.create({
    text: combineStyles(
      textStyles.base,
      textStyles.useCases.settings.item.title,
      textStyles.weight.medium
    ),
  }),
};

export { createTextStyle, textPresets, textStyles };
