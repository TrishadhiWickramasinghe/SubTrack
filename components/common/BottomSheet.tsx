import { colors, fonts, spacing } from '@config/theme';
import { BlurView } from '@react-native-community/blur';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Keyboard,
    KeyboardAvoidingView,
    PanResponder,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type BottomSheetType = 'modal' | 'picker' | 'action' | 'form' | 'custom';
export type BottomSheetSnapPoint = number | string; // number in pixels or percentage string like '50%'

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showDragHandle?: boolean;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  closeOnBackButtonPress?: boolean;
  backdropColor?: string;
  backdropOpacity?: number;
  backdropBlur?: boolean;
  type?: BottomSheetType;
  snapPoints?: BottomSheetSnapPoint[];
  initialSnap?: number;
  onSnapChange?: (index: number) => void;
  maxHeight?: number | string;
  minHeight?: number | string;
  height?: number | string;
  avoidKeyboard?: boolean;
  keyboardVerticalOffset?: number;
  scrollable?: boolean;
  scrollEnabled?: boolean;
  showOverlay?: boolean;
  overlayColor?: string;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  handleStyle?: ViewStyle;
  closeButtonStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  testID?: string;
  swipeToClose?: boolean;
  swipeThreshold?: number;
  hideStatusBar?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
  useSafeArea?: boolean;
  roundedCorners?: boolean;
  elevation?: number;
  onShow?: () => void;
  onDismiss?: () => void;
  animationDuration?: number;
  disablePan?: boolean;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  title,
  subtitle,
  showHeader = true,
  showDragHandle = true,
  showCloseButton = true,
  closeOnBackdropPress = true,
  closeOnBackButtonPress = true,
  backdropColor = '#000',
  backdropOpacity = 0.5,
  backdropBlur = false,
  type = 'modal',
  snapPoints = ['90%', '50%', '25%'],
  initialSnap = 0,
  onSnapChange,
  maxHeight = '90%',
  minHeight = 100,
  height,
  avoidKeyboard = true,
  keyboardVerticalOffset = 0,
  scrollable = false,
  scrollEnabled = true,
  showOverlay = true,
  overlayColor,
  style,
  containerStyle,
  headerStyle,
  contentStyle,
  handleStyle,
  closeButtonStyle,
  titleStyle,
  subtitleStyle,
  testID = 'bottom-sheet',
  swipeToClose = true,
  swipeThreshold = 100,
  hideStatusBar = false,
  statusBarStyle = 'light-content',
  useSafeArea = true,
  roundedCorners = true,
  elevation = 5,
  onShow,
  onDismiss,
  animationDuration = 300,
  disablePan = false,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [sheetHeight, setSheetHeight] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacityAnim = useRef(new Animated.Value(0)).current;
  const sheetRef = useRef<View>(null);
  const panResponderRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disablePan,
      onMoveShouldSetPanResponder: () => !disablePan,
      onPanResponderMove: (_, gestureState) => {
        if (!disablePan) {
          // Prevent moving above max position
          const newTranslateY = Math.max(gestureState.dy, 0);
          translateY.setValue(newTranslateY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (disablePan) return;

        const velocity = gestureState.vy;
        const dragDistance = gestureState.dy;
        
        // Calculate next snap point
        if (dragDistance > swipeThreshold || velocity > 1.5) {
          // Swipe down to close
          closeSheet();
        } else if (velocity < -1.5) {
          // Swipe up - go to higher snap point
          const nextSnap = Math.max(0, currentSnap - 1);
          snapToIndex(nextSnap);
        } else if (dragDistance < -swipeThreshold) {
          // Drag up - go to lower snap point
          const nextSnap = Math.min(snapPoints.length - 1, currentSnap + 1);
          snapToIndex(nextSnap);
        } else {
          // Return to current snap
          snapToIndex(currentSnap);
        }
      },
    }),
  ).current;

  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
  const statusBarHeight = StatusBar.currentHeight || 0;

  // Convert snap points to pixel values
  const getSnapPointsInPixels = useCallback(() => {
    return snapPoints.map(point => {
      if (typeof point === 'string' && point.includes('%')) {
        const percentage = parseFloat(point) / 100;
        return screenHeight * percentage;
      }
      return point;
    });
  }, [snapPoints, screenHeight]);

  // Get current snap point value in pixels
  const getCurrentSnapValue = useCallback(() => {
    const snapValues = getSnapPointsInPixels();
    return snapValues[currentSnap];
  }, [currentSnap, getSnapPointsInPixels]);

  // Calculate max and min heights
  const getMaxHeight = () => {
    if (typeof maxHeight === 'string' && maxHeight.includes('%')) {
      const percentage = parseFloat(maxHeight) / 100;
      return screenHeight * percentage;
    }
    return maxHeight;
  };

  const getMinHeight = () => {
    if (typeof minHeight === 'string' && minHeight.includes('%')) {
      const percentage = parseFloat(minHeight) / 100;
      return screenHeight * percentage;
    }
    return minHeight;
  };

  const getCustomHeight = () => {
    if (height) {
      if (typeof height === 'string' && height.includes('%')) {
        const percentage = parseFloat(height) / 100;
        return screenHeight * percentage;
      }
      return height;
    }
    return getCurrentSnapValue();
  };

  const showSheet = () => {
    setIsVisible(true);
    onShow?.();

    if (hideStatusBar) {
      StatusBar.setHidden(true, 'slide');
    } else {
      StatusBar.setBarStyle(statusBarStyle, true);
    }

    // Reset animations
    translateY.setValue(screenHeight);
    backdropOpacityAnim.setValue(0);

    // Animate backdrop
    Animated.timing(backdropOpacityAnim, {
      toValue: backdropOpacity,
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Animate sheet
    Animated.timing(translateY, {
      toValue: screenHeight - getCustomHeight(),
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      // Measure sheet height
      if (sheetRef.current) {
        sheetRef.current.measure((x, y, width, height) => {
          setSheetHeight(height);
        });
      }
    });
  };

  const closeSheet = () => {
    if (hideStatusBar) {
      StatusBar.setHidden(false, 'slide');
    }

    Animated.parallel([
      Animated.timing(backdropOpacityAnim, {
        toValue: 0,
        duration: animationDuration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: animationDuration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onClose();
      onDismiss?.();
    });
  };

  const snapToIndex = (index: number) => {
    if (index < 0 || index >= snapPoints.length) return;

    const snapValues = getSnapPointsInPixels();
    const targetY = screenHeight - snapValues[index];
    
    setCurrentSnap(index);
    onSnapChange?.(index);

    Animated.spring(translateY, {
      toValue: targetY,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      closeSheet();
    }
  };

  const handleCloseButtonPress = () => {
    closeSheet();
  };

  useEffect(() => {
    if (visible) {
      showSheet();
    } else {
      closeSheet();
    }
  }, [visible]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      
      // Adjust sheet position when keyboard appears
      if (avoidKeyboard) {
        const currentPosition = screenHeight - getCustomHeight();
        const newPosition = Math.max(currentPosition - keyboardHeight, 0);
        
        Animated.timing(translateY, {
          toValue: newPosition,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      
      // Return sheet to original position
      if (avoidKeyboard) {
        Animated.timing(translateY, {
          toValue: screenHeight - getCustomHeight(),
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [avoidKeyboard, getCustomHeight]);

  if (!isVisible) return null;

  const maxSheetHeight = getMaxHeight();
  const minSheetHeight = getMinHeight();
  const customHeight = getCustomHeight();
  const borderRadius = roundedCorners ? 20 : 0;

  const SheetContent = () => (
    <Animated.View
      ref={sheetRef}
      style={[
        styles.sheetContainer,
        {
          height: customHeight,
          maxHeight: maxSheetHeight,
          minHeight: minSheetHeight,
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
          transform: [{ translateY }],
          elevation,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        containerStyle,
      ]}
      {...panResponderRef.panHandlers}
      testID={testID}>
      {/* Drag Handle */}
      {showDragHandle && (
        <View style={[styles.dragHandleContainer, handleStyle]}>
          <View style={styles.dragHandle} />
        </View>
      )}

      {/* Header */}
      {showHeader && (title || subtitle || showCloseButton) && (
        <View style={[styles.header, headerStyle]}>
          <View style={styles.titleContainer}>
            {title && (
              <Text style={[styles.title, titleStyle]} numberOfLines={1}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </View>
          {showCloseButton && (
            <TouchableOpacity
              style={[styles.closeButton, closeButtonStyle]}
              onPress={handleCloseButtonPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right:10 }}
              testID="bottom-sheet-close-button">
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Content */}
      <View style={[styles.content, contentStyle]}>
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.scrollContent}>
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </View>

      {/* Snap Points Indicator */}
      {snapPoints.length > 1 && (
        <View style={styles.snapIndicator}>
          {snapPoints.map((_, index) => (
            <View
              key={index}
              style={[
                styles.snapDot,
                {
                  backgroundColor: index === currentSnap ? colors.primary : colors.border,
                  width: index === currentSnap ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );

  const Wrapper = useSafeArea ? SafeAreaView : View;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={handleBackdropPress}
        disabled={!closeOnBackdropPress}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: backdropColor,
              opacity: backdropOpacityAnim,
            },
          ]}>
          {backdropBlur && Platform.OS === 'ios' && (
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={10}
              reducedTransparencyFallbackColor={backdropColor}
            />
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Sheet */}
      <Wrapper style={styles.wrapper}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={keyboardVerticalOffset}
          enabled={avoidKeyboard}>
          <SheetContent />
        </KeyboardAvoidingView>
      </Wrapper>

      {/* Overlay (for non-scrollable areas) */}
      {showOverlay && (
        <Animated.View
          style={[
            styles.overlay,
            {
              backgroundColor: overlayColor || 'transparent',
              opacity: backdropOpacityAnim.interpolate({
                inputRange: [0, backdropOpacity],
                outputRange: [0, 0.3],
              }),
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    width: '100%',
    overflow: 'hidden',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  snapIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  snapDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    transitionProperty: 'width',
    transitionDuration: '200ms',
  },
});

export default BottomSheet;