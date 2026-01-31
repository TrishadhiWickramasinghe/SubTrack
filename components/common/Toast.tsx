import { colors, fonts, spacing } from '@/config/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading';

interface ToastProps {
  type?: ToastType;
  message: string;
  title?: string;
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  animation?: 'slide' | 'fade' | 'scale';
  icon?: string;
  showProgress?: boolean;
  showClose?: boolean;
  swipeToClose?: boolean;
  onPress?: () => void;
  onClose?: () => void;
  renderContent?: () => React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  show?: boolean;
  id?: string;
  containerStyle?: any;
}

interface ToastManagerProps {
  toasts: ToastProps[];
  removeToast: (id?: string) => void;
}

const ToastManager: React.FC<ToastManagerProps> = ({ toasts, removeToast }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => toast.id && removeToast(toast.id)}
        />
      ))}
    </>
  );
};

const Toast: React.FC<ToastProps> = ({
  type = 'info',
  message,
  title,
  duration = 3000,
  position = 'bottom',
  animation = 'slide',
  icon,
  showProgress = true,
  showClose = false,
  swipeToClose = true,
  onPress,
  onClose,
  renderContent,
  backgroundColor,
  textColor,
  action,
  show = true,
  containerStyle,
}) => {
  const [visible, setVisible] = useState(show);
  const translateY = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(100)).current;
  const panAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout>();
  const startX = useRef(0);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const getTypeConfig = () => {
    const configs = {
      info: {
        icon: icon || 'information',
        color: colors.info,
        bgColor: colors.infoLight,
        textColor: colors.infoText,
      },
      success: {
        icon: icon || 'check-circle',
        color: colors.success,
        bgColor: colors.successLight,
        textColor: colors.successText,
      },
      warning: {
        icon: icon || 'alert',
        color: colors.warning,
        bgColor: colors.warningLight,
        textColor: colors.warningText,
      },
      error: {
        icon: icon || 'close-circle',
        color: colors.error,
        bgColor: colors.errorLight,
        textColor: colors.errorText,
      },
      loading: {
        icon: icon || 'loading',
        color: colors.primary,
        bgColor: colors.surfaceVariant,
        textColor: colors.text,
      },
    };

    return configs[type] || configs.info;
  };

  const config = getTypeConfig();

  const showToast = () => {
    setVisible(true);
    const startValue = position === 'top' ? -100 : 100;

    translateY.setValue(startValue);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);

    switch (animation) {
      case 'slide':
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.back(1)),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        break;
      case 'scale':
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.back(1)),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        break;
      default: // fade
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
    }

    if (showProgress && duration > 0) {
      Animated.timing(progressAnim, {
        toValue: 0,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }

    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    }
  };

  const hideToast = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const endValue = position === 'top' ? -100 : 100;

    switch (animation) {
      case 'slide':
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: endValue,
            duration: 250,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setVisible(false);
          onClose?.();
        });
        break;
      case 'scale':
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 250,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setVisible(false);
          onClose?.();
        });
        break;
      default:
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
          onClose?.();
        });
    }
  };

  const handlePress = () => {
    onPress?.();
    if (onPress && duration > 0) {
      hideToast();
    }
  };

  const handleClose = () => {
    hideToast();
  };

  const handlePanStart = (event: any) => {
    if (!swipeToClose) return;
    startX.current = event.nativeEvent.locationX;
  };

  const handlePanMove = (event: any) => {
    if (!swipeToClose) return;
    const deltaX = event.nativeEvent.locationX - startX.current;
    panAnim.setValue(deltaX);
  };

  const handlePanEnd = (event: any) => {
    if (!swipeToClose) return;
    const deltaX = event.nativeEvent.locationX - startX.current;
    
    if (Math.abs(deltaX) > 100) {
      // Swipe far enough to close
      Animated.timing(panAnim, {
        toValue: deltaX > 0 ? screenWidth : -screenWidth,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        hideToast();
      });
    } else {
      // Return to original position
      Animated.spring(panAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    if (show) {
      showToast();
    } else {
      hideToast();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [show]);

  if (!visible) return null;

  const getPositionStyle = () => {
    const statusBarHeight = StatusBar.currentHeight || 0;
    const safeAreaTop = Platform.OS === 'ios' ? 44 : statusBarHeight;

    switch (position) {
      case 'top':
        return {
          top: safeAreaTop + spacing.md,
        };
      case 'center':
        return {
          top: screenHeight / 2 - 50,
        };
      default: // bottom
        return {
          bottom: spacing.xl + (Platform.OS === 'ios' ? 34 : 0),
        };
    }
  };

  const getTransform = () => {
    const transforms = [];
    
    if (animation === 'slide') {
      transforms.push({ translateY });
    }
    
    if (animation === 'scale') {
      transforms.push({ scale: scaleAnim });
    }
    
    if (swipeToClose) {
      transforms.push({ translateX: panAnim });
    }
    
    return transforms;
  };

  const ToastContent = () => {
    if (renderContent) {
      return renderContent();
    }

    return (
      <Animated.View
        style={[
          styles.container,
          containerStyle,
          {
            opacity: fadeAnim,
            transform: getTransform(),
            backgroundColor: backgroundColor || config.bgColor,
            ...getPositionStyle(),
          },
        ]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handlePanStart}
        onResponderMove={handlePanMove}
        onResponderRelease={handlePanEnd}>
        {showProgress && duration > 0 && (
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: config.color,
              },
            ]}
          />
        )}

        <TouchableOpacity
          style={styles.content}
          onPress={handlePress}
          activeOpacity={onPress ? 0.7 : 1}>
          <View style={styles.iconContainer}>
            {type === 'loading' ? (
              <Animated.View style={styles.spinner}>
                <MaterialCommunityIcons
                  name="loading"
                  size={20}
                  color={config.color}
                  style={{ transform: [{ rotate: '0deg' }] }}
                />
              </Animated.View>
            ) : (
              <MaterialCommunityIcons name={config.icon} size={20} color={config.color} />
            )}
          </View>

          <View style={styles.textContainer}>
            {title && (
              <Text style={[styles.title, { color: textColor || config.textColor }]}>
                {title}
              </Text>
            )}
            <Text style={[styles.message, { color: textColor || config.textColor }]}>
              {message}
            </Text>
          </View>

          {action && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={action.onPress}
              activeOpacity={0.7}>
              <Text style={[styles.actionText, { color: config.color }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          )}

          {showClose && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="close" size={16} color={config.textColor} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <BlurView
            style={styles.blurBackground}
            blurType="regular"
            blurAmount={20}
            reducedTransparencyFallbackColor={config.bgColor}
          />
        )}
      </Animated.View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <ToastContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
    maxWidth: 500,
    alignSelf: 'center',
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  progressBar: {
    height: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 60,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  spinner: {
    transform: [{ rotate: '0deg' }],
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 18,
  },
  actionButton: {
    marginLeft: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  closeButton: {
    marginLeft: spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});

// Toast Hook for easy usage
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (toastProps: Omit<ToastProps, 'id' | 'show'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toastProps,
      id,
      show: true,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    if (toastProps.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toastProps.duration || 3000);
    }

    return id;
  };

  const removeToast = (id?: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return {
    showToast,
    removeToast,
    clearAllToasts,
    toasts,
    ToastManager: () => <ToastManager toasts={toasts} removeToast={removeToast} />,
  };
};

export default Toast;