import { colors, fonts, spacing } from '@/config/theme';
import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Platform-specific styles
const platformStyles = {
  ios: {
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    headerHeight: 44,
    safeAreaTop: 44,
    safeAreaBottom: 34,
  },
  android: {
    shadow: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    headerHeight: 56,
    safeAreaTop: 24,
    safeAreaBottom: 0,
  },
};

const currentPlatform = isIOS ? platformStyles.ios : platformStyles.android;

const globalStyles = StyleSheet.create({
  // ===== LAYOUT =====
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    paddingTop: currentPlatform.safeAreaTop,
    paddingBottom: currentPlatform.safeAreaBottom,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing.lg,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowAround: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  columnBetween: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  wrap: {
    flexWrap: 'wrap',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  flex3: {
    flex: 3,
  },
  flexGrow: {
    flexGrow: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  flexNone: {
    flex: 0,
  },

  // ===== SPACING =====
  m0: { margin: 0 },
  m4: { margin: spacing.xs },
  m8: { margin: spacing.sm },
  m12: { margin: spacing.md },
  m16: { margin: spacing.lg },
  m20: { margin: spacing.xl },
  m24: { margin: spacing.xxl },
  
  mx0: { marginHorizontal: 0 },
  mx4: { marginHorizontal: spacing.xs },
  mx8: { marginHorizontal: spacing.sm },
  mx12: { marginHorizontal: spacing.md },
  mx16: { marginHorizontal: spacing.lg },
  mx20: { marginHorizontal: spacing.xl },
  mx24: { marginHorizontal: spacing.xxl },
  
  my0: { marginVertical: 0 },
  my4: { marginVertical: spacing.xs },
  my8: { marginVertical: spacing.sm },
  my12: { marginVertical: spacing.md },
  my16: { marginVertical: spacing.lg },
  my20: { marginVertical: spacing.xl },
  my24: { marginVertical: spacing.xxl },
  
  mt0: { marginTop: 0 },
  mt4: { marginTop: spacing.xs },
  mt8: { marginTop: spacing.sm },
  mt12: { marginTop: spacing.md },
  mt16: { marginTop: spacing.lg },
  mt20: { marginTop: spacing.xl },
  mt24: { marginTop: spacing.xxl },
  mt32: { marginTop: 32 },
  mt40: { marginTop: 40 },
  mt48: { marginTop: 48 },
  
  mb0: { marginBottom: 0 },
  mb4: { marginBottom: spacing.xs },
  mb8: { marginBottom: spacing.sm },
  mb12: { marginBottom: spacing.md },
  mb16: { marginBottom: spacing.lg },
  mb20: { marginBottom: spacing.xl },
  mb24: { marginBottom: spacing.xxl },
  mb32: { marginBottom: 32 },
  mb40: { marginBottom: 40 },
  mb48: { marginBottom: 48 },
  
  ml0: { marginLeft: 0 },
  ml4: { marginLeft: spacing.xs },
  ml8: { marginLeft: spacing.sm },
  ml12: { marginLeft: spacing.md },
  ml16: { marginLeft: spacing.lg },
  ml20: { marginLeft: spacing.xl },
  ml24: { marginLeft: spacing.xxl },
  
  mr0: { marginRight: 0 },
  mr4: { marginRight: spacing.xs },
  mr8: { marginRight: spacing.sm },
  mr12: { marginRight: spacing.md },
  mr16: { marginRight: spacing.lg },
  mr20: { marginRight: spacing.xl },
  mr24: { marginRight: spacing.xxl },
  
  p0: { padding: 0 },
  p4: { padding: spacing.xs },
  p8: { padding: spacing.sm },
  p12: { padding: spacing.md },
  p16: { padding: spacing.lg },
  p20: { padding: spacing.xl },
  p24: { padding: spacing.xxl },
  
  px0: { paddingHorizontal: 0 },
  px4: { paddingHorizontal: spacing.xs },
  px8: { paddingHorizontal: spacing.sm },
  px12: { paddingHorizontal: spacing.md },
  px16: { paddingHorizontal: spacing.lg },
  px20: { paddingHorizontal: spacing.xl },
  px24: { paddingHorizontal: spacing.xxl },
  
  py0: { paddingVertical: 0 },
  py4: { paddingVertical: spacing.xs },
  py8: { paddingVertical: spacing.sm },
  py12: { paddingVertical: spacing.md },
  py16: { paddingVertical: spacing.lg },
  py20: { paddingVertical: spacing.xl },
  py24: { paddingVertical: spacing.xxl },
  
  pt0: { paddingTop: 0 },
  pt4: { paddingTop: spacing.xs },
  pt8: { paddingTop: spacing.sm },
  pt12: { paddingTop: spacing.md },
  pt16: { paddingTop: spacing.lg },
  pt20: { paddingTop: spacing.xl },
  pt24: { paddingTop: spacing.xxl },
  pt32: { paddingTop: 32 },
  pt40: { paddingTop: 40 },
  pt48: { paddingTop: 48 },
  
  pb0: { paddingBottom: 0 },
  pb4: { paddingBottom: spacing.xs },
  pb8: { paddingBottom: spacing.sm },
  pb12: { paddingBottom: spacing.md },
  pb16: { paddingBottom: spacing.lg },
  pb20: { paddingBottom: spacing.xl },
  pb24: { paddingBottom: spacing.xxl },
  pb32: { paddingBottom: 32 },
  pb40: { paddingBottom: 40 },
  pb48: { paddingBottom: 48 },
  
  pl0: { paddingLeft: 0 },
  pl4: { paddingLeft: spacing.xs },
  pl8: { paddingLeft: spacing.sm },
  pl12: { paddingLeft: spacing.md },
  pl16: { paddingLeft: spacing.lg },
  pl20: { paddingLeft: spacing.xl },
  pl24: { paddingLeft: spacing.xxl },
  
  pr0: { paddingRight: 0 },
  pr4: { paddingRight: spacing.xs },
  pr8: { paddingRight: spacing.sm },
  pr12: { paddingRight: spacing.md },
  pr16: { paddingRight: spacing.lg },
  pr20: { paddingRight: spacing.xl },
  pr24: { paddingRight: spacing.xxl },

  // ===== TEXT STYLES =====
  textXs: {
    fontSize: 10,
    fontFamily: fonts.regular.fontFamily,
    color: colors.neutral[900],
  },
  textSm: {
    fontSize: 12,
    fontFamily: fonts.regular.fontFamily,
    color: colors.neutral[900],
  },
  textMd: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  textLg: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  textXl: {
    fontSize: 18,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  text2xl: {
    fontSize: 20,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  text3xl: {
    fontSize: 24,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  text4xl: {
    fontSize: 30,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  
  // Text weights
  textThin: {
    fontFamily: fonts.light,
  },
  textRegular: {
    fontFamily: fonts.regular,
  },
  textMedium: {
    fontFamily: fonts.medium,
  },
  textSemiBold: {
    fontFamily: fonts.semiBold,
  },
  textBold: {
    fontFamily: fonts.bold,
  },
  
  // Text alignment
  textLeft: {
    textAlign: 'left',
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  textJustify: {
    textAlign: 'justify',
  },
  
  // Text colors
  textPrimary: {
    color: colors.primary,
  },
  textSecondary: {
    color: colors.textSecondary,
  },
  textSuccess: {
    color: colors.success,
  },
  textError: {
    color: colors.error,
  },
  textWarning: {
    color: colors.warning,
  },
  textInfo: {
    color: colors.info,
  },
  textMuted: {
    color: colors.textDisabled,
  },
  textWhite: {
    color: colors.surface,
  },
  textBlack: {
    color: colors.text,
  },
  
  // Text transforms
  uppercase: {
    textTransform: 'uppercase',
  },
  lowercase: {
    textTransform: 'lowercase',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  
  // Line heights
  leadingNone: {
    lineHeight: 1,
  },
  leadingTight: {
    lineHeight: 1.25,
  },
  leadingSnug: {
    lineHeight: 1.375,
  },
  leadingNormal: {
    lineHeight: 1.5,
  },
  leadingRelaxed: {
    lineHeight: 1.625,
  },
  leadingLoose: {
    lineHeight: 2,
  },

  // ===== SHADOWS & ELEVATION =====
  shadowNone: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  shadowSm: {
    ...currentPlatform.shadow,
    elevation: 1,
    shadowOpacity: 0.05,
  },
  shadowMd: {
    ...currentPlatform.shadow,
    elevation: 2,
    shadowOpacity: 0.1,
  },
  shadowLg: {
    ...currentPlatform.shadow,
    elevation: 4,
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  shadowXl: {
    ...currentPlatform.shadow,
    elevation: 6,
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  shadowInner: {
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    inset: true,
  },

  // ===== BORDERS =====
  border0: { borderWidth: 0 },
  border: { borderWidth: 1 },
  border2: { borderWidth: 2 },
  border4: { borderWidth: 4 },
  
  borderPrimary: { borderColor: colors.primary },
  borderSecondary: { borderColor: colors.secondary },
  borderSuccess: { borderColor: colors.success },
  borderError: { borderColor: colors.error },
  borderWarning: { borderColor: colors.warning },
  borderInfo: { borderColor: colors.info },
  borderLight: { borderColor: colors.border },
  borderDark: { borderColor: colors.borderDark },
  borderWhite: { borderColor: colors.surface },
  borderBlack: { borderColor: colors.text },
  
  roundedNone: { borderRadius: 0 },
  roundedSm: { borderRadius: 4 },
  rounded: { borderRadius: 6 },
  roundedMd: { borderRadius: 8 },
  roundedLg: { borderRadius: 12 },
  roundedXl: { borderRadius: 16 },
  rounded2xl: { borderRadius: 20 },
  rounded3xl: { borderRadius: 24 },
  roundedFull: { borderRadius: 9999 },
  
  roundedTopNone: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  roundedTopSm: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  roundedTop: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  roundedTopLg: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  roundedTopXl: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  
  roundedBottomNone: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  roundedBottomSm: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  roundedBottom: {
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  roundedBottomLg: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  roundedBottomXl: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  // ===== BACKGROUND COLORS =====
  bgTransparent: { backgroundColor: 'transparent' },
  bgPrimary: { backgroundColor: colors.primary },
  bgPrimaryLight: { backgroundColor: colors.primaryLight },
  bgPrimaryDark: { backgroundColor: colors.primaryDark },
  bgSecondary: { backgroundColor: colors.secondary },
  bgSuccess: { backgroundColor: colors.success },
  bgSuccessLight: { backgroundColor: colors.successLight },
  bgError: { backgroundColor: colors.error },
  bgErrorLight: { backgroundColor: colors.errorLight },
  bgWarning: { backgroundColor: colors.warning },
  bgWarningLight: { backgroundColor: colors.warningLight },
  bgInfo: { backgroundColor: colors.info },
  bgInfoLight: { backgroundColor: colors.infoLight },
  bgSurface: { backgroundColor: colors.surface },
  bgBackground: { backgroundColor: colors.background },
  bgSurfaceVariant: { backgroundColor: colors.surfaceVariant },
  bgMuted: { backgroundColor: colors.disabled },
  bgWhite: { backgroundColor: colors.surface },
  bgBlack: { backgroundColor: colors.text },
  bgOverlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },

  // ===== OPACITY =====
  opacity0: { opacity: 0 },
  opacity25: { opacity: 0.25 },
  opacity50: { opacity: 0.5 },
  opacity75: { opacity: 0.75 },
  opacity100: { opacity: 1 },

  // ===== POSITIONING =====
  absolute: { position: 'absolute' },
  relative: { position: 'relative' },
  fixed: { position: 'absolute' },
  
  top0: { top: 0 },
  top4: { top: spacing.xs },
  top8: { top: spacing.sm },
  top12: { top: spacing.md },
  top16: { top: spacing.lg },
  top20: { top: spacing.xl },
  
  bottom0: { bottom: 0 },
  bottom4: { bottom: spacing.xs },
  bottom8: { bottom: spacing.sm },
  bottom12: { bottom: spacing.md },
  bottom16: { bottom: spacing.lg },
  bottom20: { bottom: spacing.xl },
  
  left0: { left: 0 },
  left4: { left: spacing.xs },
  left8: { left: spacing.sm },
  left12: { left: spacing.md },
  left16: { left: spacing.lg },
  left20: { left: spacing.xl },
  
  right0: { right: 0 },
  right4: { right: spacing.xs },
  right8: { right: spacing.sm },
  right12: { right: spacing.md },
  right16: { right: spacing.lg },
  right20: { right: spacing.xl },
  
  inset0: { top: 0, right: 0, bottom: 0, left: 0 },
  inset4: { top: spacing.xs, right: spacing.xs, bottom: spacing.xs, left: spacing.xs },
  inset8: { top: spacing.sm, right: spacing.sm, bottom: spacing.sm, left: spacing.sm },

  // ===== Z-INDEX =====
  z0: { zIndex: 0 },
  z10: { zIndex: 10 },
  z20: { zIndex: 20 },
  z30: { zIndex: 30 },
  z40: { zIndex: 40 },
  z50: { zIndex: 50 },
  zAuto: { zIndex: 'auto' },

  // ===== OVERFLOW =====
  overflowVisible: { overflow: 'visible' },
  overflowHidden: { overflow: 'hidden' },
  overflowScroll: { overflow: 'scroll' },

  // ===== WIDTH & HEIGHT =====
  wFull: { width: '100%' },
  wScreen: { width: screenWidth },
  wAuto: { width: 'auto' },
  w0: { width: 0 },
  w4: { width: spacing.xs },
  w8: { width: spacing.sm },
  w12: { width: spacing.md },
  w16: { width: spacing.lg },
  w20: { width: spacing.xl },
  w24: { width: spacing.xxl },
  w32: { width: 32 },
  w40: { width: 40 },
  w48: { width: 48 },
  w64: { width: 64 },
  w80: { width: 80 },
  w96: { width: 96 },
  
  hFull: { height: '100%' },
  hScreen: { height: screenHeight },
  hAuto: { height: 'auto' },
  h0: { height: 0 },
  h4: { height: spacing.xs },
  h8: { height: spacing.sm },
  h12: { height: spacing.md },
  h16: { height: spacing.lg },
  h20: { height: spacing.xl },
  h24: { height: spacing.xxl },
  h32: { height: 32 },
  h40: { height: 40 },
  h48: { height: 48 },
  h64: { height: 64 },
  h80: { height: 80 },
  h96: { height: 96 },
  
  minW0: { minWidth: 0 },
  minWFull: { minWidth: '100%' },
  
  maxWFull: { maxWidth: '100%' },
  maxWScreen: { maxWidth: screenWidth },
  maxWSm: { maxWidth: 640 },
  maxWMd: { maxWidth: 768 },
  maxWLg: { maxWidth: 1024 },
  maxWXl: { maxWidth: 1280 },
  maxW2xl: { maxWidth: 1536 },
  
  minH0: { minHeight: 0 },
  minHFull: { minHeight: '100%' },
  minHScreen: { minHeight: screenHeight },
  
  maxHFull: { maxHeight: '100%' },
  maxHScreen: { maxHeight: screenHeight },

  // ===== DISPLAY =====
  hidden: { display: 'none' },
  flex: { display: 'flex' },
  inlineFlex: { display: 'inline-flex' },

  // ===== ALIGNMENT =====
  itemsStart: { alignItems: 'flex-start' },
  itemsEnd: { alignItems: 'flex-end' },
  itemsCenter: { alignItems: 'center' },
  itemsBaseline: { alignItems: 'baseline' },
  itemsStretch: { alignItems: 'stretch' },
  
  justifyStart: { justifyContent: 'flex-start' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifyCenter: { justifyContent: 'center' },
  justifyBetween: { justifyContent: 'space-between' },
  justifyAround: { justifyContent: 'space-around' },
  justifyEvenly: { justifyContent: 'space-evenly' },
  
  selfStart: { alignSelf: 'flex-start' },
  selfEnd: { alignSelf: 'flex-end' },
  selfCenter: { alignSelf: 'center' },
  selfStretch: { alignSelf: 'stretch' },
  selfAuto: { alignSelf: 'auto' },

  // ===== COMMON COMPONENT STYLES =====
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    ...currentPlatform.shadow,
  },
  cardSm: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    ...currentPlatform.shadow,
  },
  cardLg: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    ...currentPlatform.shadow,
  },
  
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    fontFamily: fonts.regular,
  },
  
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: colors.surface,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  // ===== ANIMATION HELPERS =====
  transitionFast: {
    transitionDuration: '150ms',
  },
  transitionNormal: {
    transitionDuration: '300ms',
  },
  transitionSlow: {
    transitionDuration: '500ms',
  },

  // ===== ACCESSIBILITY =====
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
});

// Helper function to combine multiple styles
const combineStyles = (...styles: any[]) => {
  return StyleSheet.flatten(styles);
};

// Responsive helper functions
const responsive = {
  // Screen size breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  // Check if screen is small
  isSmallScreen: () => screenWidth < 640,
  
  // Check if screen is medium
  isMediumScreen: () => screenWidth >= 640 && screenWidth < 1024,
  
  // Check if screen is large
  isLargeScreen: () => screenWidth >= 1024,
  
  // Responsive padding
  padding: (base: number, sm?: number, md?: number, lg?: number) => {
    if (screenWidth >= 1024 && lg !== undefined) return lg;
    if (screenWidth >= 768 && md !== undefined) return md;
    if (screenWidth >= 640 && sm !== undefined) return sm;
    return base;
  },
  
  // Responsive font size
  fontSize: (base: number, sm?: number, md?: number, lg?: number) => {
    if (screenWidth >= 1024 && lg !== undefined) return lg;
    if (screenWidth >= 768 && md !== undefined) return md;
    if (screenWidth >= 640 && sm !== undefined) return sm;
    return base;
  },
  
  // Responsive width percentage
  widthPercent: (percent: number) => {
    return (screenWidth * percent) / 100;
  },
  
  // Responsive height percentage
  heightPercent: (percent: number) => {
    return (screenHeight * percent) / 100;
  },
};

export { combineStyles, currentPlatform, globalStyles, responsive };

