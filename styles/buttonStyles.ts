import { colors, fonts, spacing } from '@/config/theme';
import { StyleSheet } from 'react-native';
import { combineStyles, globalStyles } from './globalStyles';

const buttonStyles = StyleSheet.create({
  // ===== BASE BUTTON STYLES =====
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },

  // ===== BUTTON SIZES =====
  size: {
    xs: {
      height: 32,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    sm: {
      height: 40,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    md: {
      height: 48,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    lg: {
      height: 56,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
    },
    xl: {
      height: 64,
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.xl,
    },
  },

  // ===== BUTTON VARIANTS =====
  variant: {
    // Primary (Solid)
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    primaryText: {
      color: colors.surface,
      fontFamily: fonts.semiBold,
    },
    primaryIcon: {
      color: colors.surface,
    },

    // Primary Light
    primaryLight: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primaryLight,
    },
    primaryLightText: {
      color: colors.primary,
      fontFamily: fonts.semiBold,
    },
    primaryLightIcon: {
      color: colors.primary,
    },

    // Secondary
    secondary: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
    },
    secondaryText: {
      color: colors.surface,
      fontFamily: fonts.semiBold,
    },
    secondaryIcon: {
      color: colors.surface,
    },

    // Outline
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
    },
    outlineText: {
      color: colors.primary,
      fontFamily: fonts.semiBold,
    },
    outlineIcon: {
      color: colors.primary,
    },

    // Ghost
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    ghostText: {
      color: colors.primary,
      fontFamily: fonts.semiBold,
    },
    ghostIcon: {
      color: colors.primary,
    },

    // Danger
    danger: {
      backgroundColor: colors.error,
      borderColor: colors.error,
    },
    dangerText: {
      color: colors.surface,
      fontFamily: fonts.semiBold,
    },
    dangerIcon: {
      color: colors.surface,
    },

    // Danger Outline
    dangerOutline: {
      backgroundColor: 'transparent',
      borderColor: colors.error,
    },
    dangerOutlineText: {
      color: colors.error,
      fontFamily: fonts.semiBold,
    },
    dangerOutlineIcon: {
      color: colors.error,
    },

    // Success
    success: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    successText: {
      color: colors.surface,
      fontFamily: fonts.semiBold,
    },
    successIcon: {
      color: colors.surface,
    },

    // Success Outline
    successOutline: {
      backgroundColor: 'transparent',
      borderColor: colors.success,
    },
    successOutlineText: {
      color: colors.success,
      fontFamily: fonts.semiBold,
    },
    successOutlineIcon: {
      color: colors.success,
    },

    // Warning
    warning: {
      backgroundColor: colors.warning,
      borderColor: colors.warning,
    },
    warningText: {
      color: colors.text,
      fontFamily: fonts.semiBold,
    },
    warningIcon: {
      color: colors.text,
    },

    // Warning Outline
    warningOutline: {
      backgroundColor: 'transparent',
      borderColor: colors.warning,
    },
    warningOutlineText: {
      color: colors.warning,
      fontFamily: fonts.semiBold,
    },
    warningOutlineIcon: {
      color: colors.warning,
    },

    // Info
    info: {
      backgroundColor: colors.info,
      borderColor: colors.info,
    },
    infoText: {
      color: colors.surface,
      fontFamily: fonts.semiBold,
    },
    infoIcon: {
      color: colors.surface,
    },

    // Info Outline
    infoOutline: {
      backgroundColor: 'transparent',
      borderColor: colors.info,
    },
    infoOutlineText: {
      color: colors.info,
      fontFamily: fonts.semiBold,
    },
    infoOutlineIcon: {
      color: colors.info,
    },

    // Muted
    muted: {
      backgroundColor: colors.disabled,
      borderColor: colors.disabled,
    },
    mutedText: {
      color: colors.textDisabled,
      fontFamily: fonts.semiBold,
    },
    mutedIcon: {
      color: colors.textDisabled,
    },

    // Text Only (Link style)
    text: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
    textText: {
      color: colors.primary,
      fontFamily: fonts.medium,
    },
    textIcon: {
      color: colors.primary,
    },
  },

  // ===== BUTTON STATES =====
  state: {
    pressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    disabled: {
      opacity: 0.5,
    },
    loading: {
      opacity: 0.8,
    },
    focused: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
  },

  // ===== BUTTON SHAPES =====
  shape: {
    square: {
      borderRadius: 0,
    },
    rounded: {
      borderRadius: 8,
    },
    pill: {
      borderRadius: 9999,
    },
    circle: {
      borderRadius: 9999,
      width: 48,
      height: 48,
      paddingHorizontal: 0,
      paddingVertical: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
  },

  // ===== BUTTON ELEVATION =====
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

  // ===== BUTTON CONTENT =====
  content: {
    center: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    spaceBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  },

  // ===== ICON POSITIONS =====
  icon: {
    left: {
      marginRight: spacing.xs,
    },
    right: {
      marginLeft: spacing.xs,
    },
    only: {
      marginHorizontal: 0,
    },
  },

  // ===== TEXT STYLES =====
  text: {
    xs: {
      fontSize: 12,
      fontFamily: fonts.semiBold,
    },
    sm: {
      fontSize: 14,
      fontFamily: fonts.semiBold,
    },
    md: {
      fontSize: 16,
      fontFamily: fonts.semiBold,
    },
    lg: {
      fontSize: 18,
      fontFamily: fonts.semiBold,
    },
    xl: {
      fontSize: 20,
      fontFamily: fonts.semiBold,
    },
  },

  // ===== BUTTON WITH LOADING =====
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },

  // ===== BUTTON GROUPS =====
  group: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    item: {
      borderRadius: 0,
      marginRight: -1,
    },
    itemFirst: {
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    itemLast: {
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
      marginRight: 0,
    },
    itemMiddle: {
      borderRadius: 0,
    },
  },

  // ===== FLOATING ACTION BUTTON =====
  fab: {
    container: {
      position: 'absolute',
      right: spacing.lg,
      bottom: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      ...globalStyles.shadowLg,
    },
    mini: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    extended: {
      width: 'auto',
      height: 48,
      borderRadius: 24,
      paddingHorizontal: spacing.xl,
    },
  },

  // ===== SPECIFIC BUTTON TYPES =====
  types: {
    // Add Subscription Button (for SubTrack)
    addSubscription: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      ...globalStyles.shadowMd,
    },
    addSubscriptionText: {
      color: colors.surface,
      fontFamily: fonts.semiBold,
    },
    addSubscriptionIcon: {
      color: colors.surface,
    },

    // Cancel Button
    cancel: {
      backgroundColor: colors.errorLight,
      borderColor: colors.errorLight,
    },
    cancelText: {
      color: colors.error,
      fontFamily: fonts.semiBold,
    },
    cancelIcon: {
      color: colors.error,
    },

    // Save Button
    save: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    saveText: {
      color: colors.surface,
      fontFamily: fonts.semiBold,
    },
    saveIcon: {
      color: colors.surface,
    },

    // Upgrade Button (for premium features)
    upgrade: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
      ...globalStyles.shadowMd,
    },
    upgradeText: {
      color: colors.surface,
      fontFamily: fonts.bold,
    },
    upgradeIcon: {
      color: colors.surface,
    },

    // Filter Button
    filter: {
      backgroundColor: colors.surfaceVariant,
      borderColor: colors.border,
    },
    filterText: {
      color: colors.text,
      fontFamily: fonts.medium,
    },
    filterIcon: {
      color: colors.text,
    },

    // Share Button
    share: {
      backgroundColor: colors.info,
      borderColor: colors.info,
    },
    shareText: {
      color: colors.surface,
      fontFamily: fonts.semiBold,
    },
    shareIcon: {
      color: colors.surface,
    },

    // Delete Button
    delete: {
      backgroundColor: colors.error,
      borderColor: colors.error,
    },
    deleteText: {
      color: colors.surface,
      fontFamily: fonts.semiBold,
    },
    deleteIcon: {
      color: colors.surface,
    },

    // Edit Button
    edit: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primaryLight,
    },
    editText: {
      color: colors.primary,
      fontFamily: fonts.semiBold,
    },
    editIcon: {
      color: colors.primary,
    },

    // View Details Button
    viewDetails: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
    },
    viewDetailsText: {
      color: colors.primary,
      fontFamily: fonts.medium,
    },
    viewDetailsIcon: {
      color: colors.primary,
    },

    // Quick Action Button (small, rounded)
    quickAction: {
      width: 36,
      height: 36,
      borderRadius: 18,
      paddingHorizontal: 0,
      paddingVertical: 0,
      backgroundColor: colors.surfaceVariant,
      borderColor: colors.border,
    },
    quickActionIcon: {
      color: colors.text,
    },
  },
});

// Helper function to create button styles dynamically
const createButtonStyle = (
  variant: keyof typeof buttonStyles.variant,
  size: keyof typeof buttonStyles.size = 'md',
  shape: keyof typeof buttonStyles.shape = 'rounded',
  elevation: keyof typeof buttonStyles.elevation = 'none',
  contentAlign: keyof typeof buttonStyles.content = 'center',
  iconPosition?: 'left' | 'right' | 'only'
) => {
  return StyleSheet.create({
    button: combineStyles(
      buttonStyles.base,
      buttonStyles.size[size],
      buttonStyles.variant[variant],
      buttonStyles.shape[shape],
      buttonStyles.elevation[elevation],
      buttonStyles.content[contentAlign]
    ),
    text: combineStyles(
      buttonStyles.text[size],
      buttonStyles.variant[`${variant}Text` as keyof typeof buttonStyles.variant]
    ),
    icon: combineStyles(
      buttonStyles.variant[`${variant}Icon` as keyof typeof buttonStyles.variant],
      iconPosition && buttonStyles.icon[iconPosition]
    ),
  });
};

// Pre-defined button style combinations for common use cases
const buttonPresets = {
  // Primary buttons
  primary: createButtonStyle('primary', 'md', 'rounded', 'sm'),
  primarySmall: createButtonStyle('primary', 'sm', 'rounded', 'sm'),
  primaryLarge: createButtonStyle('primary', 'lg', 'rounded', 'md'),
  primaryPill: createButtonStyle('primary', 'md', 'pill', 'sm'),
  primaryOutline: createButtonStyle('outline', 'md', 'rounded', 'none'),
  primaryGhost: createButtonStyle('ghost', 'md', 'rounded', 'none'),

  // Secondary buttons
  secondary: createButtonStyle('secondary', 'md', 'rounded', 'sm'),
  secondaryOutline: createButtonStyle('outline', 'md', 'rounded', 'none'),

  // Action buttons
  danger: createButtonStyle('danger', 'md', 'rounded', 'sm'),
  dangerOutline: createButtonStyle('dangerOutline', 'md', 'rounded', 'none'),
  success: createButtonStyle('success', 'md', 'rounded', 'sm'),
  successOutline: createButtonStyle('successOutline', 'md', 'rounded', 'none'),
  warning: createButtonStyle('warning', 'md', 'rounded', 'sm'),
  warningOutline: createButtonStyle('warningOutline', 'md', 'rounded', 'none'),

  // UI buttons
  muted: createButtonStyle('muted', 'md', 'rounded', 'none'),
  text: createButtonStyle('text', 'md', 'rounded', 'none'),

  // Special buttons for SubTrack
  addSubscription: StyleSheet.create({
    button: combineStyles(
      buttonStyles.base,
      buttonStyles.size.md,
      buttonStyles.types.addSubscription,
      buttonStyles.shape.rounded,
      buttonStyles.elevation.md
    ),
    text: combineStyles(
      buttonStyles.text.md,
      buttonStyles.types.addSubscriptionText
    ),
    icon: buttonStyles.types.addSubscriptionIcon,
  }),

  filter: StyleSheet.create({
    button: combineStyles(
      buttonStyles.base,
      buttonStyles.size.sm,
      buttonStyles.types.filter,
      buttonStyles.shape.rounded,
      buttonStyles.elevation.sm
    ),
    text: combineStyles(
      buttonStyles.text.sm,
      buttonStyles.types.filterText
    ),
    icon: buttonStyles.types.filterIcon,
  }),

  quickAction: StyleSheet.create({
    button: combineStyles(
      buttonStyles.base,
      buttonStyles.types.quickAction
    ),
    icon: buttonStyles.types.quickActionIcon,
  }),
};

export { buttonPresets, buttonStyles, createButtonStyle };
