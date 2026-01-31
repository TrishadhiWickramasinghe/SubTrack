import { colors, fonts, spacing } from '@/config/theme';
import { StyleSheet } from 'react-native';
import { combineStyles, globalStyles } from './globalStyles';

const cardStyles = StyleSheet.create({
  // ===== BASE CARD STYLES =====
  base: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },

  // ===== CARD SIZES =====
  size: {
    xs: {
      padding: spacing.sm,
    },
    sm: {
      padding: spacing.md,
    },
    md: {
      padding: spacing.lg,
    },
    lg: {
      padding: spacing.xl,
    },
    xl: {
      padding: spacing.xxl,
    },
    compact: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    spacious: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
    },
  },

  // ===== CARD VARIANTS =====
  variant: {
    // Default Card
    default: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Elevated Card
    elevated: {
      backgroundColor: colors.surface,
      ...globalStyles.shadowMd,
    },

    // Outlined Card
    outlined: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Filled Card
    filled: {
      backgroundColor: colors.surfaceVariant,
      borderWidth: 0,
    },

    // Gradient Card
    gradient: {
      borderWidth: 0,
    },

    // Interactive Card (hover/press effects)
    interactive: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Primary Card
    primary: {
      backgroundColor: colors.primary,
      borderWidth: 0,
    },
    primaryText: {
      color: colors.surface,
    },

    // Primary Light Card
    primaryLight: {
      backgroundColor: colors.primaryLight,
      borderWidth: 0,
    },
    primaryLightText: {
      color: colors.primary,
    },

    // Success Card
    success: {
      backgroundColor: colors.success,
      borderWidth: 0,
    },
    successText: {
      color: colors.surface,
    },

    // Success Light Card
    successLight: {
      backgroundColor: colors.successLight,
      borderWidth: 0,
    },
    successLightText: {
      color: colors.success,
    },

    // Error Card
    error: {
      backgroundColor: colors.error,
      borderWidth: 0,
    },
    errorText: {
      color: colors.surface,
    },

    // Error Light Card
    errorLight: {
      backgroundColor: colors.errorLight,
      borderWidth: 0,
    },
    errorLightText: {
      color: colors.error,
    },

    // Warning Card
    warning: {
      backgroundColor: colors.warning,
      borderWidth: 0,
    },
    warningText: {
      color: colors.text,
    },

    // Warning Light Card
    warningLight: {
      backgroundColor: colors.warningLight,
      borderWidth: 0,
    },
    warningLightText: {
      color: colors.warning,
    },

    // Info Card
    info: {
      backgroundColor: colors.info,
      borderWidth: 0,
    },
    infoText: {
      color: colors.surface,
    },

    // Info Light Card
    infoLight: {
      backgroundColor: colors.infoLight,
      borderWidth: 0,
    },
    infoLightText: {
      color: colors.info,
    },

    // Muted Card
    muted: {
      backgroundColor: colors.disabled,
      borderWidth: 0,
    },
    mutedText: {
      color: colors.textDisabled,
    },

    // Transparent Card
    transparent: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
  },

  // ===== CARD ELEVATION =====
  elevation: {
    none: {
      ...globalStyles.shadowNone,
    },
    sm: {
      ...globalStyles.shadowSm,
    },
    md: {
      ...globalStyles.shadowMd,
    },
    lg: {
      ...globalStyles.shadowLg,
    },
    xl: {
      ...globalStyles.shadowXl,
    },
  },

  // ===== CARD SHAPES =====
  shape: {
    square: {
      borderRadius: 0,
    },
    rounded: {
      borderRadius: 12,
    },
    roundedSm: {
      borderRadius: 8,
    },
    roundedLg: {
      borderRadius: 16,
    },
    roundedXl: {
      borderRadius: 20,
    },
    pill: {
      borderRadius: 9999,
    },
    circle: {
      borderRadius: 9999,
    },
  },

  // ===== CARD STATES =====
  state: {
    pressed: {
      opacity: 0.95,
      transform: [{ scale: 0.99 }],
    },
    selected: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    disabled: {
      opacity: 0.6,
    },
    focused: {
      borderColor: colors.primary,
      borderWidth: 2,
      ...globalStyles.shadowMd,
    },
  },

  // ===== CARD LAYOUT =====
  layout: {
    vertical: {
      flexDirection: 'column',
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    grid: {
      flexDirection: 'column',
      width: '100%',
    },
  },

  // ===== CARD HEADER =====
  header: {
    base: {
      marginBottom: spacing.md,
    },
    withDivider: {
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: spacing.md,
    },
    compact: {
      marginBottom: spacing.sm,
    },
    spacious: {
      marginBottom: spacing.lg,
    },
  },

  // ===== CARD CONTENT =====
  content: {
    base: {
      flex: 1,
    },
    compact: {
      marginVertical: spacing.xs,
    },
    spacious: {
      marginVertical: spacing.md,
    },
  },

  // ===== CARD FOOTER =====
  footer: {
    base: {
      marginTop: spacing.md,
    },
    withDivider: {
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.md,
    },
    compact: {
      marginTop: spacing.sm,
    },
    spacious: {
      marginTop: spacing.lg,
    },
  },

  // ===== CARD TITLE =====
  title: {
    base: {
      fontSize: 18,
      fontFamily: fonts.semiBold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    sm: {
      fontSize: 14,
      fontFamily: fonts.semiBold,
    },
    md: {
      fontSize: 18,
      fontFamily: fonts.semiBold,
    },
    lg: {
      fontSize: 24,
      fontFamily: fonts.bold,
    },
    xl: {
      fontSize: 30,
      fontFamily: fonts.bold,
    },
  },

  // ===== CARD SUBTITLE =====
  subtitle: {
    base: {
      fontSize: 14,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    sm: {
      fontSize: 12,
    },
    md: {
      fontSize: 14,
    },
    lg: {
      fontSize: 16,
    },
  },

  // ===== CARD DESCRIPTION =====
  description: {
    base: {
      fontSize: 14,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    sm: {
      fontSize: 12,
      lineHeight: 18,
    },
    md: {
      fontSize: 14,
      lineHeight: 20,
    },
    lg: {
      fontSize: 16,
      lineHeight: 24,
    },
  },

  // ===== CARD MEDIA =====
  media: {
    container: {
      marginBottom: spacing.md,
      borderRadius: 8,
      overflow: 'hidden',
    },
    cover: {
      width: '100%',
      height: 160,
      resizeMode: 'cover',
    },
    rounded: {
      borderRadius: 8,
    },
    circle: {
      borderRadius: 9999,
    },
  },

  // ===== CARD ACTIONS =====
  actions: {
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    left: {
      justifyContent: 'flex-start',
    },
    center: {
      justifyContent: 'center',
    },
    between: {
      justifyContent: 'space-between',
    },
    vertical: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: spacing.xs,
    },
  },

  // ===== CARD BADGE =====
  badge: {
    container: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      zIndex: 10,
    },
    topLeft: {
      top: spacing.sm,
      left: spacing.sm,
    },
    topRight: {
      top: spacing.sm,
      right: spacing.sm,
    },
    bottomLeft: {
      bottom: spacing.sm,
      left: spacing.sm,
    },
    bottomRight: {
      bottom: spacing.sm,
      right: spacing.sm,
    },
  },

  // ===== CARD DIVIDER =====
  divider: {
    horizontal: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.md,
    },
    vertical: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: spacing.md,
    },
  },

  // ===== SPECIFIC CARD TYPES FOR SUBTRACK =====
  types: {
    // Subscription Card
    subscription: {
      card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        ...globalStyles.shadowSm,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
      },
      icon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
      },
      title: {
        fontSize: 16,
        fontFamily: fonts.semiBold,
        color: colors.text,
        marginBottom: spacing.xs,
      },
      category: {
        fontSize: 12,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        backgroundColor: colors.surfaceVariant,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
      },
      amount: {
        fontSize: 20,
        fontFamily: fonts.bold,
        color: colors.primary,
      },
      nextPayment: {
        fontSize: 12,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      status: {
        active: {
          color: colors.success,
        },
        paused: {
          color: colors.warning,
        },
        cancelled: {
          color: colors.error,
        },
      },
    },

    // Dashboard Stat Card
    stat: {
      card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        ...globalStyles.shadowSm,
      },
      value: {
        fontSize: 32,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: spacing.xs,
      },
      label: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
      },
      change: {
        positive: {
          color: colors.success,
        },
        negative: {
          color: colors.error,
        },
        neutral: {
          color: colors.textSecondary,
        },
      },
      trendIcon: {
        marginRight: spacing.xs,
      },
    },

    // Budget Card
    budget: {
      card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        ...globalStyles.shadowSm,
      },
      progress: {
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.surfaceVariant,
        marginVertical: spacing.md,
        overflow: 'hidden',
      },
      progressFill: {
        height: '100%',
        borderRadius: 3,
      },
      amountSpent: {
        fontSize: 18,
        fontFamily: fonts.bold,
        color: colors.text,
      },
      amountTotal: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      percentage: {
        fontSize: 14,
        fontFamily: fonts.semiBold,
      },
    },

    // Upcoming Payment Card
    upcomingPayment: {
      card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primaryLight,
        ...globalStyles.shadowSm,
      },
      date: {
        fontSize: 12,
        fontFamily: fonts.semiBold,
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      service: {
        fontSize: 16,
        fontFamily: fonts.semiBold,
        color: colors.text,
        marginVertical: spacing.xs,
      },
      amount: {
        fontSize: 18,
        fontFamily: fonts.bold,
        color: colors.text,
      },
      reminder: {
        fontSize: 12,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        marginTop: spacing.sm,
      },
    },

    // Trial Card
    trial: {
      card: {
        backgroundColor: colors.infoLight,
        borderWidth: 1,
        borderColor: colors.info,
        ...globalStyles.shadowSm,
      },
      title: {
        fontSize: 16,
        fontFamily: fonts.semiBold,
        color: colors.info,
        marginBottom: spacing.xs,
      },
      daysLeft: {
        fontSize: 24,
        fontFamily: fonts.bold,
        color: colors.info,
        marginBottom: spacing.sm,
      },
      endDate: {
        fontSize: 12,
        fontFamily: fonts.regular,
        color: colors.info,
      },
      warning: {
        backgroundColor: colors.errorLight,
        borderColor: colors.error,
      },
    },

    // Insight Card
    insight: {
      card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        ...globalStyles.shadowSm,
      },
      icon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
      },
      title: {
        fontSize: 16,
        fontFamily: fonts.semiBold,
        color: colors.text,
        marginBottom: spacing.xs,
      },
      description: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        lineHeight: 20,
      },
      suggestion: {
        fontSize: 12,
        fontFamily: fonts.medium,
        color: colors.primary,
        marginTop: spacing.sm,
      },
    },

    // Empty State Card
    emptyState: {
      card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        ...globalStyles.shadowSm,
        alignItems: 'center',
        paddingVertical: spacing.xl,
      },
      icon: {
        marginBottom: spacing.lg,
      },
      title: {
        fontSize: 18,
        fontFamily: fonts.semiBold,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
      },
      description: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
        maxWidth: 300,
      },
    },
  },

  // ===== CARD GRID =====
  grid: {
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -spacing.sm,
    },
    item: {
      width: '100%',
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.md,
    },
    item2: {
      width: '50%',
    },
    item3: {
      width: '33.333%',
    },
    item4: {
      width: '25%',
    },
  },

  // ===== CARD ANIMATIONS =====
  animation: {
    fadeIn: {
      opacity: 1,
    },
    fadeOut: {
      opacity: 0,
    },
    slideUp: {
      transform: [{ translateY: 0 }],
    },
    slideDown: {
      transform: [{ translateY: 20 }],
    },
    scaleIn: {
      transform: [{ scale: 1 }],
    },
    scaleOut: {
      transform: [{ scale: 0.95 }],
    },
  },
});

// Helper function to create card styles dynamically
const createCardStyle = (
  variant: keyof typeof cardStyles.variant = 'default',
  size: keyof typeof cardStyles.size = 'md',
  shape: keyof typeof cardStyles.shape = 'rounded',
  elevation: keyof typeof cardStyles.elevation = 'none',
  layout: keyof typeof cardStyles.layout = 'vertical'
) => {
  return StyleSheet.create({
    card: combineStyles(
      cardStyles.base,
      cardStyles.size[size],
      cardStyles.variant[variant],
      cardStyles.shape[shape],
      cardStyles.elevation[elevation],
      cardStyles.layout[layout]
    ),
    text: cardStyles.variant[`${variant}Text` as keyof typeof cardStyles.variant] || {},
    header: cardStyles.header.base,
    content: cardStyles.content.base,
    footer: cardStyles.footer.base,
    title: cardStyles.title.base,
    subtitle: cardStyles.subtitle.base,
    description: cardStyles.description.base,
  });
};

// Pre-defined card style combinations for common use cases
const cardPresets = {
  // Default cards
  default: createCardStyle('default', 'md', 'rounded', 'sm'),
  defaultSmall: createCardStyle('default', 'sm', 'rounded', 'sm'),
  defaultLarge: createCardStyle('default', 'lg', 'rounded', 'md'),

  // Elevated cards
  elevated: createCardStyle('elevated', 'md', 'rounded', 'md'),
  elevatedLarge: createCardStyle('elevated', 'lg', 'rounded', 'lg'),

  // Filled cards
  filled: createCardStyle('filled', 'md', 'rounded', 'none'),
  filledCompact: createCardStyle('filled', 'compact', 'rounded', 'none'),

  // Interactive cards
  interactive: createCardStyle('interactive', 'md', 'rounded', 'sm'),

  // Colored cards
  primary: createCardStyle('primary', 'md', 'rounded', 'sm'),
  success: createCardStyle('success', 'md', 'rounded', 'sm'),
  error: createCardStyle('error', 'md', 'rounded', 'sm'),
  warning: createCardStyle('warning', 'md', 'rounded', 'sm'),
  info: createCardStyle('info', 'md', 'rounded', 'sm'),

  // Light colored cards
  primaryLight: createCardStyle('primaryLight', 'md', 'rounded', 'none'),
  successLight: createCardStyle('successLight', 'md', 'rounded', 'none'),
  errorLight: createCardStyle('errorLight', 'md', 'rounded', 'none'),
  warningLight: createCardStyle('warningLight', 'md', 'rounded', 'none'),
  infoLight: createCardStyle('infoLight', 'md', 'rounded', 'none'),

  // Special cards for SubTrack
  subscription: StyleSheet.create({
    card: combineStyles(
      cardStyles.base,
      cardStyles.size.md,
      cardStyles.types.subscription.card,
      cardStyles.shape.rounded,
      cardStyles.elevation.sm
    ),
    header: cardStyles.types.subscription.header,
    icon: cardStyles.types.subscription.icon,
    title: cardStyles.types.subscription.title,
    category: cardStyles.types.subscription.category,
    amount: cardStyles.types.subscription.amount,
    nextPayment: cardStyles.types.subscription.nextPayment,
    status: cardStyles.types.subscription.status,
  }),

  stat: StyleSheet.create({
    card: combineStyles(
      cardStyles.base,
      cardStyles.size.sm,
      cardStyles.types.stat.card,
      cardStyles.shape.rounded,
      cardStyles.elevation.sm
    ),
    value: cardStyles.types.stat.value,
    label: cardStyles.types.stat.label,
    change: cardStyles.types.stat.change,
    trendIcon: cardStyles.types.stat.trendIcon,
  }),

  budget: StyleSheet.create({
    card: combineStyles(
      cardStyles.base,
      cardStyles.size.md,
      cardStyles.types.budget.card,
      cardStyles.shape.rounded,
      cardStyles.elevation.sm
    ),
    progress: cardStyles.types.budget.progress,
    progressFill: cardStyles.types.budget.progressFill,
    amountSpent: cardStyles.types.budget.amountSpent,
    amountTotal: cardStyles.types.budget.amountTotal,
    percentage: cardStyles.types.budget.percentage,
  }),

  upcomingPayment: StyleSheet.create({
    card: combineStyles(
      cardStyles.base,
      cardStyles.size.sm,
      cardStyles.types.upcomingPayment.card,
      cardStyles.shape.rounded,
      cardStyles.elevation.sm
    ),
    date: cardStyles.types.upcomingPayment.date,
    service: cardStyles.types.upcomingPayment.service,
    amount: cardStyles.types.upcomingPayment.amount,
    reminder: cardStyles.types.upcomingPayment.reminder,
  }),

  trial: StyleSheet.create({
    card: combineStyles(
      cardStyles.base,
      cardStyles.size.md,
      cardStyles.types.trial.card,
      cardStyles.shape.rounded,
      cardStyles.elevation.sm
    ),
    title: cardStyles.types.trial.title,
    daysLeft: cardStyles.types.trial.daysLeft,
    endDate: cardStyles.types.trial.endDate,
    warning: cardStyles.types.trial.warning,
  }),

  insight: StyleSheet.create({
    card: combineStyles(
      cardStyles.base,
      cardStyles.size.md,
      cardStyles.types.insight.card,
      cardStyles.shape.rounded,
      cardStyles.elevation.sm
    ),
    icon: cardStyles.types.insight.icon,
    title: cardStyles.types.insight.title,
    description: cardStyles.types.insight.description,
    suggestion: cardStyles.types.insight.suggestion,
  }),

  emptyState: StyleSheet.create({
    card: combineStyles(
      cardStyles.base,
      cardStyles.size.lg,
      cardStyles.types.emptyState.card,
      cardStyles.shape.rounded,
      cardStyles.elevation.sm
    ),
    icon: cardStyles.types.emptyState.icon,
    title: cardStyles.types.emptyState.title,
    description: cardStyles.types.emptyState.description,
  }),
};

export { cardPresets, cardStyles, createCardStyle };

