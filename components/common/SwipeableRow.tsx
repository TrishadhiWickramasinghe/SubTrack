import { colors, fonts, spacing } from '@/config/theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    LayoutChangeEvent,
    PanResponder,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';

export type SwipeDirection = 'left' | 'right' | 'both';
export type SwipeActionType = 'default' | 'destructive' | 'secondary' | 'custom';
export type SwipeAnimationType = 'spring' | 'timing' | 'none';

interface SwipeAction {
  text?: string;
  icon?: string;
  iconColor?: string;
  backgroundColor?: string;
  textColor?: string;
  type?: SwipeActionType;
  onPress: () => void;
  width?: number | string;
  confirm?: boolean;
  confirmText?: string;
  confirmIcon?: string;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  swipeThreshold?: number;
  swipeThresholdPercentage?: number;
  swipeEnabled?: boolean;
  direction?: SwipeDirection;
  animationDuration?: number;
  animationType?: SwipeAnimationType;
  overshootFriction?: number;
  overshootTension?: number;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  onSwipeOpen?: (direction: 'left' | 'right') => void;
  onSwipeClose?: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  closeOnActionPress?: boolean;
  closeOnBackdropPress?: boolean;
  backdropColor?: string;
  backdropOpacity?: number;
  showBackdrop?: boolean;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  actionContainerStyle?: ViewStyle;
  actionStyle?: ViewStyle;
  actionTextStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  disableHapticFeedback?: boolean;
  hapticOnOpen?: boolean;
  hapticOnClose?: boolean;
  dragFromEdgeOnly?: boolean;
  edgeWidth?: number;
  bounceOnOpen?: boolean;
  bounceOnClose?: boolean;
  friction?: number;
  tension?: number;
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  swipeThreshold = 60,
  swipeThresholdPercentage,
  swipeEnabled = true,
  direction = 'both',
  animationDuration = 300,
  animationType = 'spring',
  overshootFriction = 8,
  overshootTension = 40,
  onSwipeStart,
  onSwipeEnd,
  onSwipeOpen,
  onSwipeClose,
  onPress,
  onLongPress,
  closeOnActionPress = true,
  closeOnBackdropPress = true,
  backdropColor = '#000',
  backdropOpacity = 0.3,
  showBackdrop = true,
  style,
  containerStyle,
  actionContainerStyle,
  actionStyle,
  actionTextStyle,
  testID = 'swipeable-row',
  accessibilityLabel,
  disableHapticFeedback = false,
  hapticOnOpen = true,
  hapticOnClose = true,
  dragFromEdgeOnly = false,
  edgeWidth = 30,
  bounceOnOpen = true,
  bounceOnClose = true,
  friction = 8,
  tension = 40,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState<'left' | 'right' | null>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [actionWidths, setActionWidths] = useState({ left: 0, right: 0 });
  const translateX = useRef(new Animated.Value(0)).current;
  const backdropOpacityAnim = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!swipeEnabled) return false;
        
        if (dragFromEdgeOnly) {
          return Math.abs(gestureState.dx) > edgeWidth;
        }
        
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        onSwipeStart?.();
      },
      onPanResponderMove: (_, gestureState) => {
        if (!swipeEnabled) return;

        const { dx } = gestureState;
        let newTranslateX = dx;

        // Apply boundaries
        if (direction === 'left' || (openDirection === 'left' && isOpen)) {
          newTranslateX = Math.min(0, Math.max(dx, -actionWidths.left));
        } else if (direction === 'right' || (openDirection === 'right' && isOpen)) {
          newTranslateX = Math.max(0, Math.min(dx, actionWidths.right));
        } else {
          // Both directions
          if (dx > 0) {
            newTranslateX = Math.min(dx, actionWidths.right);
          } else {
            newTranslateX = Math.max(dx, -actionWidths.left);
          }
        }

        translateX.setValue(newTranslateX);
        
        // Update backdrop opacity
        const maxOpacity = Math.max(actionWidths.left, actionWidths.right);
        const currentOpacity = Math.min(Math.abs(newTranslateX) / maxOpacity, 1) * backdropOpacity;
        backdropOpacityAnim.setValue(currentOpacity);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!swipeEnabled) return;

        const { dx, vx } = gestureState;
        const threshold = swipeThresholdPercentage 
          ? contentWidth * (swipeThresholdPercentage / 100)
          : swipeThreshold;

        let shouldOpen = false;
        let targetX = 0;
        let direction: 'left' | 'right' | null = null;

        // Determine direction and if should open
        if (dx > 0) {
          // Swiping right
          direction = 'right';
          shouldOpen = dx > threshold || vx > 0.5;
          targetX = shouldOpen ? actionWidths.right : 0;
        } else if (dx < 0) {
          // Swiping left
          direction = 'left';
          shouldOpen = Math.abs(dx) > threshold || vx < -0.5;
          targetX = shouldOpen ? -actionWidths.left : 0;
        }

        // Animate to target position
        animateTo(targetX, () => {
          setIsOpen(shouldOpen);
          setOpenDirection(shouldOpen ? direction : null);
          
          if (shouldOpen && direction) {
            onSwipeOpen?.(direction);
            if (hapticOnOpen && !disableHapticFeedback) {
              // Add haptic feedback
            }
          } else if (!shouldOpen && isOpen) {
            onSwipeClose?.();
            if (hapticOnClose && !disableHapticFeedback) {
              // Add haptic feedback
            }
          }
        });

        onSwipeEnd?.();
      },
    })
  ).current;

  const { width: screenWidth } = Dimensions.get('window');

  // Calculate action widths
  useEffect(() => {
    let leftWidth = 0;
    let rightWidth = 0;

    leftActions.forEach(action => {
      if (typeof action.width === 'string' && action.width.includes('%')) {
        const percentage = parseFloat(action.width) / 100;
        leftWidth += screenWidth * percentage;
      } else {
        leftWidth += (action.width as number) || 80;
      }
    });

    rightActions.forEach(action => {
      if (typeof action.width === 'string' && action.width.includes('%')) {
        const percentage = parseFloat(action.width) / 100;
        rightWidth += screenWidth * percentage;
      } else {
        rightWidth += (action.width as number) || 80;
      }
    });

    setActionWidths({ left: leftWidth, right: rightWidth });
  }, [leftActions, rightActions, screenWidth]);

  // Animate to position
  const animateTo = (toValue: number, callback?: () => void) => {
    translateX.stopAnimation();

    if (animationType === 'spring') {
      Animated.spring(translateX, {
        toValue,
        friction: bounceOnOpen || bounceOnClose ? overshootFriction : friction,
        tension: bounceOnOpen || bounceOnClose ? overshootTension : tension,
        useNativeDriver: true,
      }).start(callback);
    } else if (animationType === 'timing') {
      Animated.timing(translateX, {
        toValue,
        duration: animationDuration,
        useNativeDriver: true,
      }).start(callback);
    } else {
      translateX.setValue(toValue);
      callback?.();
    }

    // Animate backdrop
    const targetOpacity = toValue !== 0 ? backdropOpacity : 0;
    Animated.timing(backdropOpacityAnim, {
      toValue: targetOpacity,
      duration: animationDuration,
      useNativeDriver: true,
    }).start();
  };

  // Handle action press
  const handleActionPress = (action: SwipeAction) => {
    if (action.confirm) {
      // Show confirmation dialog
      // For now, just execute the action
      action.onPress();
    } else {
      action.onPress();
    }

    if (closeOnActionPress) {
      close();
    }
  };

  // Close swipeable
  const close = () => {
    animateTo(0, () => {
      setIsOpen(false);
      setOpenDirection(null);
      onSwipeClose?.();
    });
  };

  // Open swipeable
  const open = (dir: 'left' | 'right') => {
    const targetX = dir === 'left' ? -actionWidths.left : actionWidths.right;
    animateTo(targetX, () => {
      setIsOpen(true);
      setOpenDirection(dir);
      onSwipeOpen?.(dir);
    });
  };

  // Handle content press
  const handleContentPress = () => {
    if (isOpen) {
      close();
    } else {
      onPress?.();
    }
  };

  // Handle content long press
  const handleContentLongPress = () => {
    onLongPress?.();
  };

  // Handle backdrop press
  const handleBackdropPress = () => {
    if (closeOnBackdropPress && isOpen) {
      close();
    }
  };

  // Get action styles based on type
  const getActionStyle = (action: SwipeAction) => {
    const baseStyle: ViewStyle = {
      backgroundColor: action.backgroundColor || (getDefaultActionColor(action.type) as unknown as string),
    };

    return baseStyle;
  };

  const getDefaultActionColor = (type?: SwipeActionType) => {
    switch (type) {
      case 'destructive':
        return colors.error;
      case 'secondary':
        return colors.secondary;
      case 'custom':
        return colors.primary;
      default:
        return colors.primary;
    }
  };

  const getActionTextColor = (action: SwipeAction) => {
    if (action.textColor) return action.textColor;
    if (action.type === 'destructive') return colors.neutral[0];
    return colors.neutral[0];
  };

  const getActionIconColor = (action: SwipeAction) => {
    if (action.iconColor) return action.iconColor;
    return getActionTextColor(action);
  };

  // Render action button
  const renderAction = (action: SwipeAction, index: number, isLeft: boolean) => {
    const width = typeof action.width === 'string' 
      ? action.width 
      : (action.width || 80);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.action,
          getActionStyle(action),
          { width },
          isLeft ? styles.leftAction : styles.rightAction,
          actionStyle,
        ]}
        onPress={() => handleActionPress(action)}
        activeOpacity={0.7}>
        {action.icon && (
          <Icon
            name={action.icon as any}
            size={24}
            color={getActionIconColor(action)}
            style={styles.actionIcon}
          />
        )}
        {action.text && (
          <Text
            style={[
              styles.actionText,
              { color: getActionTextColor(action) },
              actionTextStyle,
            ]}>
            {action.text}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Render actions container
  const renderActions = (actions: SwipeAction[], isLeft: boolean) => {
    if (actions.length === 0) return null;

    return (
      <View style={[
        styles.actionsContainer as any,
        isLeft ? styles.leftActions : styles.rightActions,
        actionContainerStyle,
      ]}>
        {actions.map((action, index) => renderAction(action, index, isLeft))}
      </View>
    );
  };

  // Handle content layout
  const handleContentLayout = (event: LayoutChangeEvent) => {
    setContentWidth(event.nativeEvent.layout.width);
  };

  const leftActionsContainer = renderActions(leftActions, true);
  const rightActionsContainer = renderActions(rightActions, false);

  const accessibilityProps = {
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel || 'Swipeable row',
    accessibilityState: { disabled: !swipeEnabled },
    accessibilityActions: [
      { name: 'activate' },
      { name: 'swipeLeft' },
      { name: 'swipeRight' },
    ],
    onAccessibilityAction: (event: any) => {
      switch (event.nativeEvent.actionName) {
        case 'activate':
          handleContentPress();
          break;
        case 'swipeLeft':
          open('left');
          break;
        case 'swipeRight':
          open('right');
          break;
      }
    },
  };

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {/* Backdrop */}
      {showBackdrop && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleBackdropPress}
          activeOpacity={1}>
          <Animated.View
            style={[
              styles.backdrop as any,
              {
                backgroundColor: backdropColor,
                opacity: backdropOpacityAnim,
              },
            ]}
          />
        </TouchableOpacity>
      )}

      {/* Left Actions (hidden behind content) */}
      {leftActionsContainer}

      {/* Content */}
      <Animated.View
        style={[
          styles.contentContainer as any,
          {
            transform: [{ translateX }],
          },
          style,
        ]}
        onLayout={handleContentLayout}
        {...panResponder.panHandlers}>
        <TouchableOpacity
          onPress={handleContentPress}
          onLongPress={handleContentLongPress}
          activeOpacity={onPress ? 0.7 : 1}
          delayLongPress={500}
          {...accessibilityProps}>
          {children}
        </TouchableOpacity>
      </Animated.View>

      {/* Right Actions (hidden behind content) */}
      {rightActionsContainer}
    </View>
  );
};

const styles = StyleSheet.create<any>({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    zIndex: 1,
    backgroundColor: colors.neutral[0],
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  leftActions: {
    left: 0,
  },
  rightActions: {
    right: 0,
  },
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  leftAction: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
  },
  rightAction: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
  },
  actionIcon: {
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: 12,
    fontFamily: fonts.medium.fontFamily,
    textAlign: 'center',
  },
});

export default SwipeableRow;