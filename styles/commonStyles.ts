import { colors, fonts, spacing } from '@config/theme';
import { StyleSheet } from 'react-native';
import { combineStyles, globalStyles } from './globalStyles';

const commonStyles = StyleSheet.create({
  // ===== COMMON LAYOUT COMPONENTS =====
  
  // Screen wrapper
  screenWrapper: {
    ...globalStyles.container,
    backgroundColor: colors.background,
  },
  
  // Content container with safe padding
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  // Scrollable content
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  
  // Section container
  section: {
    marginBottom: spacing.xl,
  },
  
  // Section header
  sectionHeader: {
    ...globalStyles.rowBetween,
    marginBottom: spacing.md,
  },
  
  sectionTitle: {
    ...globalStyles.textLg,
    ...globalStyles.textBold,
    color: colors.text,
  },
  
  sectionAction: {
    ...globalStyles.textSm,
    ...globalStyles.textPrimary,
    ...globalStyles.textSemiBold,
  },
  
  // Form container
  formContainer: {
    marginTop: spacing.xl,
  },
  
  formGroup: {
    marginBottom: spacing.lg,
  },
  
  formLabel: {
    ...globalStyles.textSm,
    ...globalStyles.textMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  
  formError: {
    ...globalStyles.textSm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  
  formHint: {
    ...globalStyles.textSm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // ===== CARD STYLES =====
  
  card: {
    ...globalStyles.card,
    marginBottom: spacing.md,
  },
  
  cardHeader: {
    ...globalStyles.rowBetween,
    marginBottom: spacing.md,
  },
  
  cardTitle: {
    ...globalStyles.textLg,
    ...globalStyles.textBold,
    color: colors.text,
  },
  
  cardSubtitle: {
    ...globalStyles.textSm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  cardContent: {
    marginTop: spacing.md,
  },
  
  cardFooter: {
    ...globalStyles.rowBetween,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  // ===== LIST STYLES =====
  
  list: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  listItem: {
    ...globalStyles.rowBetween,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  listItemFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  
  listItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  
  listItemContent: {
    flex: 1,
  },
  
  listItemTitle: {
    ...globalStyles.textMd,
    ...globalStyles.textMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  
  listItemSubtitle: {
    ...globalStyles.textSm,
    color: colors.textSecondary,
  },
  
  listItemTrailing: {
    marginLeft: spacing.md,
  },

  // ===== GRID STYLES =====
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  
  gridItem: {
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  
  gridItem2: {
    width: '50%',
  },
  
  gridItem3: {
    width: '33.333%',
  },
  
  gridItem4: {
    width: '25%',
  },

  // ===== HEADER STYLES =====
  
  header: {
    ...globalStyles.rowBetween,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  headerTitle: {
    ...globalStyles.textLg,
    ...globalStyles.textBold,
    color: colors.text,
    textAlign: 'center',
  },
  
  headerSubtitle: {
    ...globalStyles.textSm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // ===== TAB STYLES =====
  
  tabBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  tabItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  
  tabLabel: {
    ...globalStyles.textMd,
    ...globalStyles.textMedium,
    color: colors.textSecondary,
  },
  
  tabLabelActive: {
    color: colors.primary,
    ...globalStyles.textSemiBold,
  },

  // ===== MODAL STYLES =====
  
  modalOverlay: {
    ...globalStyles.absolute,
    ...globalStyles.inset0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...globalStyles.shadowLg,
  },
  
  modalHeader: {
    ...globalStyles.rowBetween,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  modalTitle: {
    ...globalStyles.textLg,
    ...globalStyles.textBold,
    color: colors.text,
  },
  
  modalContent: {
    padding: spacing.lg,
  },
  
  modalFooter: {
    ...globalStyles.rowBetween,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // ===== LOADING & EMPTY STATES =====
  
  loadingContainer: {
    ...globalStyles.centeredContainer,
    padding: spacing.xl,
  },
  
  emptyState: {
    ...globalStyles.centeredContainer,
    padding: spacing.xl,
  },
  
  emptyStateIcon: {
    marginBottom: spacing.lg,
  },
  
  emptyStateTitle: {
    ...globalStyles.textLg,
    ...globalStyles.textBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  emptyStateMessage: {
    ...globalStyles.textMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // ===== BUTTON VARIANTS =====
  
  buttonPrimary: {
    ...globalStyles.button,
    backgroundColor: colors.primary,
  },
  
  buttonPrimaryText: {
    ...globalStyles.buttonText,
    color: colors.surface,
  },
  
  buttonSecondary: {
    ...globalStyles.button,
    backgroundColor: colors.secondary,
  },
  
  buttonSecondaryText: {
    ...globalStyles.buttonText,
    color: colors.surface,
  },
  
  buttonOutline: {
    ...globalStyles.button,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  
  buttonOutlineText: {
    ...globalStyles.buttonText,
    color: colors.primary,
  },
  
  buttonGhost: {
    ...globalStyles.button,
    backgroundColor: 'transparent',
  },
  
  buttonGhostText: {
    ...globalStyles.buttonText,
    color: colors.primary,
  },
  
  buttonDanger: {
    ...globalStyles.button,
    backgroundColor: colors.error,
  },
  
  buttonDangerText: {
    ...globalStyles.buttonText,
    color: colors.surface,
  },
  
  buttonSuccess: {
    ...globalStyles.button,
    backgroundColor: colors.success,
  },
  
  buttonSuccessText: {
    ...globalStyles.buttonText,
    color: colors.surface,
  },
  
  buttonDisabled: {
    ...globalStyles.button,
    backgroundColor: colors.disabled,
  },
  
  buttonDisabledText: {
    ...globalStyles.buttonText,
    color: colors.textDisabled,
  },
  
  buttonSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  
  buttonSmallText: {
    fontSize: 14,
  },
  
  buttonLarge: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  
  buttonLargeText: {
    fontSize: 18,
  },
  
  buttonFullWidth: {
    width: '100%',
  },

  // ===== BADGE VARIANTS =====
  
  badgePrimary: {
    ...globalStyles.badge,
    backgroundColor: colors.primary,
  },
  
  badgePrimaryText: {
    ...globalStyles.badgeText,
    color: colors.surface,
  },
  
  badgeSecondary: {
    ...globalStyles.badge,
    backgroundColor: colors.secondary,
  },
  
  badgeSecondaryText: {
    ...globalStyles.badgeText,
    color: colors.surface,
  },
  
  badgeSuccess: {
    ...globalStyles.badge,
    backgroundColor: colors.success,
  },
  
  badgeSuccessText: {
    ...globalStyles.badgeText,
    color: colors.surface,
  },
  
  badgeError: {
    ...globalStyles.badge,
    backgroundColor: colors.error,
  },
  
  badgeErrorText: {
    ...globalStyles.badgeText,
    color: colors.surface,
  },
  
  badgeWarning: {
    ...globalStyles.badge,
    backgroundColor: colors.warning,
  },
  
  badgeWarningText: {
    ...globalStyles.badgeText,
    color: colors.text,
  },
  
  badgeInfo: {
    ...globalStyles.badge,
    backgroundColor: colors.info,
  },
  
  badgeInfoText: {
    ...globalStyles.badgeText,
    color: colors.surface,
  },
  
  badgeOutline: {
    ...globalStyles.badge,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  
  badgeOutlineText: {
    ...globalStyles.badgeText,
    color: colors.primary,
  },

  // ===== INPUT VARIANTS =====
  
  inputDefault: {
    ...globalStyles.input,
  },
  
  inputFocused: {
    ...globalStyles.input,
    borderColor: colors.primary,
  },
  
  inputError: {
    ...globalStyles.input,
    borderColor: colors.error,
  },
  
  inputSuccess: {
    ...globalStyles.input,
    borderColor: colors.success,
  },
  
  inputDisabled: {
    ...globalStyles.input,
    backgroundColor: colors.disabled,
    color: colors.textDisabled,
  },

  // ===== AVATAR SIZES =====
  
  avatarXs: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  
  avatarSm: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  
  avatarMd: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  
  avatarLg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  
  avatarXl: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  
  avatarXxl: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },

  // ===== ICON SIZES =====
  
  iconXs: {
    fontSize: 12,
  },
  
  iconSm: {
    fontSize: 16,
  },
  
  iconMd: {
    fontSize: 20,
  },
  
  iconLg: {
    fontSize: 24,
  },
  
  iconXl: {
    fontSize: 32,
  },
  
  iconXxl: {
    fontSize: 40,
  },

  // ===== SPACING SCALE =====
  
  spacingScale: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    xxl: spacing.xxl,
  },

  // ===== TYPOGRAPHY SCALE =====
  
  typographyScale: {
    h1: {
      fontSize: 32,
      fontFamily: fonts.bold,
      lineHeight: 40,
      color: colors.text,
    },
    h2: {
      fontSize: 28,
      fontFamily: fonts.bold,
      lineHeight: 36,
      color: colors.text,
    },
    h3: {
      fontSize: 24,
      fontFamily: fonts.semiBold,
      lineHeight: 32,
      color: colors.text,
    },
    h4: {
      fontSize: 20,
      fontFamily: fonts.semiBold,
      lineHeight: 28,
      color: colors.text,
    },
    h5: {
      fontSize: 18,
      fontFamily: fonts.semiBold,
      lineHeight: 24,
      color: colors.text,
    },
    h6: {
      fontSize: 16,
      fontFamily: fonts.semiBold,
      lineHeight: 22,
      color: colors.text,
    },
    body: {
      fontSize: 16,
      fontFamily: fonts.regular,
      lineHeight: 24,
      color: colors.text,
    },
    bodySm: {
      fontSize: 14,
      fontFamily: fonts.regular,
      lineHeight: 20,
      color: colors.text,
    },
    bodyXs: {
      fontSize: 12,
      fontFamily: fonts.regular,
      lineHeight: 18,
      color: colors.text,
    },
    caption: {
      fontSize: 12,
      fontFamily: fonts.medium,
      lineHeight: 16,
      color: colors.textSecondary,
    },
    overline: {
      fontSize: 10,
      fontFamily: fonts.medium,
      lineHeight: 14,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
  },

  // ===== SHADOW PRESETS =====
  
  shadowPresets: {
    card: globalStyles.shadowMd,
    button: globalStyles.shadowSm,
    floating: globalStyles.shadowLg,
    modal: globalStyles.shadowXl,
    navbar: globalStyles.shadowSm,
  },

  // ===== ANIMATION PRESETS =====
  
  animationPresets: {
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
      transform: [{ scale: 0.9 }],
    },
  },

  // ===== UTILITY CLASSES =====
  
  // Text truncation
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  
  // Text line clamp
  lineClamp1: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
  },
  
  lineClamp2: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  
  lineClamp3: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
  },
  
  // Cursor pointer
  cursorPointer: {
    cursor: 'pointer',
  },
  
  // User select none
  selectNone: {
    userSelect: 'none',
  },
  
  // Pointer events
  pointerEventsNone: {
    pointerEvents: 'none',
  },
  
  pointerEventsAuto: {
    pointerEvents: 'auto',
  },
});

// Helper functions for common patterns
const commonHelpers = {
  // Create a flex row with spacing
  flexRow: (justifyContent: string = 'flex-start', alignItems: string = 'center') => ({
    flexDirection: 'row' as const,
    justifyContent,
    alignItems,
  }),
  
  // Create a flex column with spacing
  flexColumn: (justifyContent: string = 'flex-start', alignItems: string = 'stretch') => ({
    flexDirection: 'column' as const,
    justifyContent,
    alignItems,
  }),
  
  // Create a grid item
  gridItem: (columns: number, spacing: number = spacing.md) => ({
    width: `${100 / columns}%`,
    paddingHorizontal: spacing / 2,
  }),
  
  // Create a responsive width
  responsiveWidth: (base: number, sm?: number, md?: number, lg?: number) => {
    const screenWidth = globalStyles.wScreen.width;
    if (screenWidth >= 1024 && lg !== undefined) return lg;
    if (screenWidth >= 768 && md !== undefined) return md;
    if (screenWidth >= 640 && sm !== undefined) return sm;
    return base;
  },
  
  // Create elevation with shadow
  elevation: (level: number) => {
    const shadows = [
      globalStyles.shadowNone,
      globalStyles.shadowSm,
      globalStyles.shadowMd,
      globalStyles.shadowLg,
      globalStyles.shadowXl,
    ];
    return shadows[Math.min(level, shadows.length - 1)];
  },
  
  // Create a gradient background
  gradient: (colors: string[], direction: string = 'to right') => ({
    backgroundImage: `linear-gradient(${direction}, ${colors.join(', ')})`,
  }),
  
  // Create a border with different sides
  border: (width: number, color: string, sides?: ('top' | 'right' | 'bottom' | 'left')[]) => {
    const borderStyle: any = {};
    if (!sides || sides.length === 0) {
      borderStyle.borderWidth = width;
      borderStyle.borderColor = color;
    } else {
      sides.forEach(side => {
        borderStyle[`border${side.charAt(0).toUpperCase() + side.slice(1)}Width`] = width;
        borderStyle[`border${side.charAt(0).toUpperCase() + side.slice(1)}Color`] = color;
      });
    }
    return borderStyle;
  },
};

export { combineStyles, commonHelpers, commonStyles };
