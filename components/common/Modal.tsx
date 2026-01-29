import { colors, fonts, spacing } from '@config/theme';
import { BlurView } from '@react-native-community/blur';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    GestureResponderEvent,
    Keyboard,
    KeyboardAvoidingView,
    PanResponder,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';
export type ModalAnimation = 'slide' | 'fade' | 'scale' | 'none';
export type ModalPosition = 'center' | 'bottom' | 'top';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  closeOnBackButtonPress?: boolean;
  backdropColor?: string;
  backdropOpacity?: number;
  backdropBlur?: boolean;
  animation?: ModalAnimation;
  animationDuration?: number;
  size?: ModalSize;
  position?: ModalPosition;
  customWidth?: number;
  customHeight?: number;
  avoidKeyboard?: boolean;
  keyboardVerticalOffset?: number;
  scrollable?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  footerContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  footerStyle?: ViewStyle;
  closeButtonStyle?: ViewStyle;
  testID?: string;
  swipeToClose?: boolean;
  swipeThreshold?: number;
  hideStatusBar?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
  useSafeArea?: boolean;
  roundedCorners?: boolean;
  elevation?: number;
  preventBackdropPress?: boolean;
  onShow?: () => void;
  onDismiss?: () => void;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  title,
  subtitle,
  showCloseButton = true,
  closeOnBackdropPress = true,
  closeOnBackButtonPress = true,
  backdropColor = '#000',
  backdropOpacity = 0.5,
  backdropBlur = false,
  animation = 'slide',
  animationDuration = 300,
  size = 'medium',
  position = 'center',
  customWidth,
  customHeight,
  avoidKeyboard = true,
  keyboardVerticalOffset = 0,
  scrollable = false,
  showHeader = true,
  showFooter = false,
  footerContent,
  headerContent,
  style,
  containerStyle,
  contentStyle,
  headerStyle,
  footerStyle,
  closeButtonStyle,
  testID = 'modal',
  swipeToClose = false,
  swipeThreshold = 100,
  hideStatusBar = false,
  statusBarStyle = 'light-content',
  useSafeArea = true,
  roundedCorners = true,
  elevation = 5,
  preventBackdropPress = false,
  onShow,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const panAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const statusBarAnim = useRef(new Animated.Value(0)).current;

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const statusBarHeight = StatusBar.currentHeight || 0;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => swipeToClose,
      onMoveShouldSetPanResponder: () => swipeToClose,
      onPanResponderMove: (_, gestureState) => {
        if (swipeToClose && position === 'bottom') {
          panAnim.setValue({ x: 0, y: Math.max(0, gestureState.dy) });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (swipeToClose && position === 'bottom' && gestureState.dy > swipeThreshold) {
          hideModal();
        } else {
          Animated.spring(panAnim, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const getModalSize = () => {
    const sizes = {
      small: { width: screenWidth * 0.8, height: 'auto' },
      medium: { width: screenWidth * 0.9, height: 'auto' },
      large: { width: screenWidth * 0.95, height: screenHeight * 0.8 },
      fullscreen: { width: screenWidth, height: screenHeight },
    };

    const sizeConfig = sizes[size] || sizes.medium;

    return {
      width: customWidth || sizeConfig.width,
      height: customHeight || sizeConfig.height,
      maxHeight: screenHeight * 0.9,
    };
  };

  const getModalPosition = () => {
    const { height } = getModalSize();
    const modalHeight = typeof height === 'string' ? screenHeight * 0.5 : height;

    switch (position) {
      case 'top':
        return {
          top: statusBarHeight + spacing.xl,
          left: (screenWidth - getModalSize().width) / 2,
        };
      case 'bottom':
        return {
          bottom: keyboardHeight + spacing.xl,
          left: (screenWidth - getModalSize().width) / 2,
        };
      default: // center
        return {
          top: (screenHeight - modalHeight - keyboardHeight) / 2,
          left: (screenWidth - getModalSize().width) / 2,
        };
    }
  };

  const getAnimationStyle = () => {
    const baseStyle = {
      opacity: fadeAnim,
      transform: [],
    };

    switch (animation) {
      case 'slide':
        const translateKey = position === 'bottom' ? 'translateY' : 'translateY';
        const startValue = position === 'bottom' ? 300 : -300;
        baseStyle.transform.push({
          [translateKey]: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [startValue, 0],
          }),
        });
        break;
      case 'scale':
        baseStyle.transform.push({ scale: scaleAnim });
        break;
      case 'none':
        // No animation
        break;
      default: // fade
        // Already handled by opacity
        break;
    }

    if (swipeToClose && position === 'bottom') {
      baseStyle.transform.push({ translateY: panAnim.y });
    }

    return baseStyle;
  };

  const showModal = () => {
    setIsVisible(true);
    onShow?.();

    if (hideStatusBar) {
      StatusBar.setHidden(true, 'slide');
    } else {
      StatusBar.setBarStyle(statusBarStyle, true);
    }

    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(0);
    scaleAnim.setValue(0.9);
    panAnim.setValue({ x: 0, y: 0 });

    // Animate backdrop
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: animationDuration,
      useNativeDriver: true,
    }).start();

    // Animate modal content
    switch (animation) {
      case 'slide':
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: animationDuration,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }).start();
        break;
      case 'scale':
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: animationDuration,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }).start();
        break;
      default:
        // No additional animation needed for fade
        break;
    }
  };

  const hideModal = () => {
    if (hideStatusBar) {
      StatusBar.setHidden(false, 'slide');
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      animation === 'slide'
        ? Animated.timing(slideAnim, {
            toValue: 0,
            duration: animationDuration,
            useNativeDriver: true,
          })
        : Animated.timing(fadeAnim, { toValue: 0, useNativeDriver: true }),
      animation === 'scale'
        ? Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: animationDuration,
            useNativeDriver: true,
          })
        : Animated.timing(fadeAnim, { toValue: 0, useNativeDriver: true }),
    ]).start(() => {
      setIsVisible(false);
      onClose();
      onDismiss?.();
    });
  };

  const handleBackdropPress = (event: GestureResponderEvent) => {
    if (event.target === event.currentTarget && closeOnBackdropPress && !preventBackdropPress) {
      hideModal();
    }
  };

  const handleCloseButtonPress = () => {
    hideModal();
  };

  useEffect(() => {
    if (visible) {
      showModal();
    } else {
      hideModal();
    }
  }, [visible]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (!isVisible) return null;

  const modalSize = getModalSize();
  const modalPosition = getModalPosition();
  const animationStyle = getAnimationStyle();

  const ModalContent = () => (
    <View
      style={[
        styles.modalContainer,
        {
          width: modalSize.width,
          maxHeight: modalSize.maxHeight,
          borderRadius: roundedCorners ? 16 : 0,
          elevation,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        containerStyle,
      ]}
      {...(swipeToClose && position === 'bottom' ? panResponder.panHandlers : {})}
      testID={testID}>
      {/* Header */}
      {showHeader && (title || subtitle || headerContent || showCloseButton) && (
        <View style={[styles.header, headerStyle]}>
          {headerContent ? (
            headerContent
          ) : (
            <>
              <View style={styles.titleContainer}>
                {title && <Text style={styles.title}>{title}</Text>}
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
              {showCloseButton && (
                <TouchableOpacity
                  style={[styles.closeButton, closeButtonStyle]}
                  onPress={handleCloseButtonPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  testID="modal-close-button">
                  <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}

      {/* Content */}
      <View style={[styles.content, contentStyle]}>
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </View>

      {/* Footer */}
      {showFooter && footerContent && (
        <View style={[styles.footer, footerStyle]}>{footerContent}</View>
      )}
    </View>
  );

  const Wrapper = useSafeArea ? SafeAreaView : View;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: backdropColor,
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, backdropOpacity],
              }),
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
      </TouchableWithoutFeedback>

      {/* Modal */}
      <Wrapper style={styles.wrapper}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={keyboardVerticalOffset}
          enabled={avoidKeyboard}>
          <Animated.View
            style={[
              styles.modalWrapper,
              modalPosition,
              animationStyle,
              style,
              {
                maxHeight: modalSize.maxHeight - keyboardHeight,
              },
            ]}>
            <ModalContent />
          </Animated.View>
        </KeyboardAvoidingView>
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  wrapper: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalWrapper: {
    position: 'absolute',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
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
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceVariant,
  },
});

export default Modal;