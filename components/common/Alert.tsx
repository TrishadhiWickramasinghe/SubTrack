import { colors, fonts, spacing } from '@config/theme';
import { BlurView } from '@react-native-community/blur';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'custom';

interface AlertAction {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  disabled?: boolean;
}

interface AlertProps {
  type?: AlertType;
  title: string;
  message?: string;
  actions?: AlertAction[];
  duration?: number;
  autoDismiss?: boolean;
  showIcon?: boolean;
  showClose?: boolean;
  onDismiss?: () => void;
  backdropDismiss?: boolean;
  animation?: 'fade' | 'slide' | 'scale';
  position?: 'top' | 'center' | 'bottom';
  maxWidth?: number;
  testID?: string;
  hapticFeedback?: boolean;
  customIcon?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  show?: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  actions = [],
  duration = 5000,
  autoDismiss = true,
  showIcon = true,
  showClose = true,
  onDismiss,
  backdropDismiss = true,
  animation = 'fade',
  position = 'center',
  maxWidth = 400,
  testID = 'alert',
  hapticFeedback = true,
  customIcon,
  backgroundColor,
  textColor,
  borderColor,
  show = true,
  onShow,
  onHide,
}) => {
  const [visible, setVisible] = useState(show);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout>();

  const { width: screenWidth } = Dimensions.get('window');

  const getTypeConfig = () => {
    const configs = {
      info: {
        icon: 'ℹ️',
        bgColor: colors.info,
        lightBg: colors.infoLight,
        text: colors.infoText,
        border: colors.infoBorder,
      },
      success: {
        icon: '✅',
        bgColor: colors.success,
        lightBg: colors.successLight,
        text: colors.successText,
        border: colors.successBorder,
      },
      warning: {
        icon: '⚠️',
        bgColor: colors.warning,
        lightBg: colors.warningLight,
        text: colors.warningText,
        border: colors.warningBorder,
      },
      error: {
        icon: '❌',
        bgColor: colors.error,
        lightBg: colors.errorLight,
        text: colors.errorText,
        border: colors.errorBorder,
      },
      custom: {
        icon: '📌',
        bgColor: backgroundColor || colors.primary,
        lightBg: backgroundColor || colors.surface,
        text: textColor || colors.text,
        border: borderColor || colors.border,
      },
    };

    return configs[type] || configs.info;
  };

  const config = getTypeConfig();

  const showAlert = () => {
    setVisible(true);
    onShow?.();

    if (hapticFeedback && Platform.OS === 'ios') {
      // You can add haptic feedback here
    }

    switch (animation) {
      case 'scale':
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.bezier(0.34, 1.56, 0.64, 1),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        break;
      case 'slide':
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.cubic),
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

    if (autoDismiss && duration > 0) {
      startProgressAnimation();
      timerRef.current = setTimeout(() => {
        hideAlert();
      }, duration);
    }
  };

  const hideAlert = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    switch (animation) {
      case 'scale':
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 200,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setVisible(false);
          onDismiss?.();
          onHide?.();
        });
        break;
      case 'slide':
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 100,
            duration: 200,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setVisible(false);
          onDismiss?.();
          onHide?.();
        });
        break;
      default:
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
          onDismiss?.();
          onHide?.();
        });
    }
  };

  const startProgressAnimation = () => {
    if (duration > 0) {
      Animated.timing(progressAnim, {
        toValue: 100,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleActionPress = (action: AlertAction) => {
    if (!action.disabled) {
      action.onPress();
      hideAlert();
    }
  };

  const handleBackdropPress = () => {
    if (backdropDismiss) {
      hideAlert();
    }
  };

  useEffect(() => {
    if (show) {
      showAlert();
    } else {
      hideAlert();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [show]);

  const getTransform = () => {
    switch (animation) {
      case 'scale':
        return [{ scale: scaleAnim }];
      case 'slide':
        const translateKey = position === 'top' ? 'translateY' : 'translateX';
        return [{ [translateKey]: slideAnim }];
      default:
        return [];
    }
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return styles.topPosition;
      case 'bottom':
        return styles.bottomPosition;
      default:
        return styles.centerPosition;
    }
  };

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} testID={testID}>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
        disabled={!backdropDismiss}>
        {Platform.OS === 'ios' ? (
          <BlurView
            style={styles.blurView}
            blurType="regular"
            blurAmount={8}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.5)"
          />
        ) : (
          <View style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} />
        )}
      </TouchableOpacity>

      {/* Alert Content */}
      <Animated.View
        style={[
          styles.alertContainer,
          getPositionStyle(),
          {
            opacity: fadeAnim,
            transform: getTransform(),
            maxWidth: Math.min(maxWidth, screenWidth - 40),
            backgroundColor: config.lightBg,
            borderColor: config.border,
          },
        ]}>
        {autoDismiss && duration > 0 && (
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: config.bgColor,
              },
            ]}
          />
        )}

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            {showIcon && (
              <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
                {customIcon ? (
                  customIcon
                ) : (
                  <Text style={styles.iconText}>{config.icon}</Text>
                )}
              </View>
            )}

            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: config.text }]}>{title}</Text>
              {message && <Text style={styles.message}>{message}</Text>}
            </View>

            {showClose && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={hideAlert}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Actions */}
          {actions.length > 0 && (
            <View style={styles.actionsContainer}>
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.actionButton,
                    action.style === 'destructive' && styles.destructiveButton,
                    action.style === 'cancel' && styles.cancelButton,
                    action.disabled && styles.disabledButton,
                  ]}
                  onPress={() => handleActionPress(action)}
                  disabled={action.disabled}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.actionText,
                      action.style === 'destructive' && styles.destructiveText,
                      action.style === 'cancel' && styles.cancelText,
                      action.disabled && styles.disabledText,
                    ]}>
                    {action.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  alertContainer: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
  },
  centerPosition: {
    justifyContent: 'center',
  },
  topPosition: {
    position: 'absolute',
    top: spacing.xl + (Platform.OS === 'ios' ? 40 : 20),
  },
  bottomPosition: {
    position: 'absolute',
    bottom: spacing.xl,
  },
  progressBar: {
    height: 3,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
  },
  closeIcon: {
    fontSize: 24,
    color: colors.text,
    fontFamily: fonts.regular,
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  actionButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  destructiveButton: {
    backgroundColor: colors.error,
  },
  cancelButton: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
    opacity: 0.5,
  },
  actionText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.surface,
  },
  destructiveText: {
    color: colors.surface,
  },
  cancelText: {
    color: colors.text,
  },
  disabledText: {
    color: colors.textDisabled,
  },
});

export default Alert;