import { differenceInDays, isToday, isTomorrow } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
    Animated,
    LayoutAnimation,
    PanResponder,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    Vibration,
    View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Reanimated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

// Types
import Subscription from '@models/Subscription';

// Hooks
import { useCurrency } from '@hooks/useCurrency';
import { useTheme } from '@hooks/useTheme';

// Utils

// Components
import Badge from '@components/common/Badge';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SubscriptionItemProps {
  subscription: Subscription;
  index?: number;
  totalItems?: number;
  onPress?: (subscription: Subscription) => void;
  onLongPress?: (subscription: Subscription) => void;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  onDuplicate?: (subscription: Subscription) => void;
  onToggleStatus?: (subscription: Subscription) => void;
  onToggleNotification?: (subscription: Subscription) => void;
  onQuickNote?: (subscription: Subscription) => void;
  onShare?: (subscription: Subscription) => void;
  onDragStart?: (index: number) => void;
  onDragEnd?: (fromIndex: number, toIndex: number) => void;
  isDragging?: boolean;
  isSelected?: boolean;
  showCategory?: boolean;
  showNextBilling?: boolean;
  showUsage?: boolean;
  showNotificationToggle?: boolean;
  compactMode?: boolean;
  dragEnabled?: boolean;
  showSelectionIndicator?: boolean;
  showTrialBadge?: boolean;
  showSplitBadge?: boolean;
  showValueScore?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = memo(
  ({
    subscription,
    index = 0,
    totalItems = 0,
    onPress,
    onLongPress,
    onEdit,
    onDelete,
    onDuplicate,
    onToggleStatus,
    onToggleNotification,
    onQuickNote,
    onShare,
    onDragStart,
    onDragEnd,
    isDragging = false,
    isSelected = false,
    showCategory = true,
    showNextBilling = true,
    showUsage = false,
    showNotificationToggle = true,
    compactMode = false,
    dragEnabled = false,
    showSelectionIndicator = false,
    showTrialBadge = true,
    showSplitBadge = true,
    showValueScore = false,
    onSwipeStart,
    onSwipeEnd,
  }) => {
    const { theme, isDark } = useTheme();
    const colors = theme?.colors || {};
    const { convertAmount, formatAmount: formatAmountUtil } = useCurrency();
    const primaryCurrency = 'USD';

    // State
    const [isSwiped, setIsSwiped] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);

    // Reanimated values
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const rotation = useSharedValue(0);

    // Refs
    const swipeableRef = useRef<Swipeable>(null);
    const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const vibrationTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Memoized calculations
    const {
      nextBillingDate,
      daysUntilBilling,
      isDueSoon,
      isOverdue,
      isDueToday,
      isDueTomorrow,
      formattedAmount,
      categoryColor,
      isActive,
      isPaused,
      isCancelled,
      isTrial,
      daysUntilTrialEnds,
      isSplitCalculated,
      splitMembersCount,
      valueScore: calculatedValueScore,
      usagePercentage,
    }: any = useMemo((): any => {
      try {
        // Calculate next billing date based on current date and billing cycle
        const today = new Date();
        const nextDate = new Date(subscription.nextBillingDate || today);
        const daysUntil = differenceInDays(nextDate, today);

        // Trial info - use simpler approach
        const isTrialActive = subscription.hasTrial && new Date() < new Date(subscription.trialEndDate || today);
        const daysUntilTrialEnds = subscription.trialEndDate
          ? differenceInDays(new Date(subscription.trialEndDate), today)
          : null;

        // Value score calculation
        const valueScore = subscription.valueScore || 0;
        
        // Usage percentage
        const usagePercentage = showUsage
          ? Math.min((subscription.usageCount / 30) * 100, 100)
          : 0;

        return {
          nextBillingDate: nextDate,
          daysUntilBilling: daysUntil,
          isDueSoon: daysUntil <= 3 && daysUntil >= 0,
          isOverdue: daysUntil < 0,
          isDueToday: isToday(nextDate),
          isDueTomorrow: isTomorrow(nextDate),
          formattedAmount: formatAmountUtil(subscription.amount, subscription.currency || primaryCurrency),
          categoryColor: '#6366F1',
          isActive: subscription.status === 'active',
          isPaused: subscription.status === 'paused',
          isCancelled: subscription.status === 'cancelled',
          isTrial: isTrialActive,
          daysUntilTrialEnds,
          isSplitCalculated: subscription.isShared,
          splitMembersCount: (subscription.sharedWith?.length || 0) + 1,
          valueScore,
          usagePercentage,
        };
      } catch (error) {
        return {
          nextBillingDate: new Date(),
          daysUntilBilling: 0,
          isDueSoon: false,
          isOverdue: false,
          isDueToday: false,
          isDueTomorrow: false,
          formattedAmount: '0',
          categoryColor: '#6366F1',
          isActive: false,
          isPaused: false,
          isCancelled: false,
          isTrial: false,
          daysUntilTrialEnds: null,
          isSplitCalculated: false,
          splitMembersCount: 0,
          valueScore: 0,
          usagePercentage: 0,
        };
      }
    }, [subscription, primaryCurrency, formatAmountUtil, showUsage]);

    // Local notifications state  
    const notificationEnabled = subscription.notificationEnabled || false;
    const isSplit = isSplitCalculated;
    const valueScore = calculatedValueScore;
    const currency = primaryCurrency;

    // Animated styles
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
    }));

    // Pan responder for drag & drop
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => dragEnabled && !isSwiped,
        onMoveShouldSetPanResponder: () => dragEnabled && !isSwiped,
        onPanResponderGrant: () => {
          if (dragEnabled) {
            Vibration.vibrate(50);
            scale.value = withSpring(1.05);
            opacity.value = withTiming(0.9);
            rotation.value = withSpring(1);
            if (onDragStart && index !== undefined) {
              runOnJS(onDragStart)(index);
            }
          }
        },
        onPanResponderMove: (_, gestureState) => {
          if (dragEnabled) {
            translateY.value = gestureState.dy;
            translateX.value = gestureState.dx * 0.1; // Slight horizontal movement
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (dragEnabled) {
            const dropIndex = calculateDropIndex(gestureState.dy, index, totalItems);
            
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            scale.value = withSpring(1);
            opacity.value = withTiming(1);
            rotation.value = withSpring(0);

            if (onDragEnd && index !== undefined && dropIndex !== index) {
              runOnJS(onDragEnd)(index, dropIndex);
            }
          }
        },
        onPanResponderTerminate: () => {
          if (dragEnabled) {
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            scale.value = withSpring(1);
            opacity.value = withTiming(1);
            rotation.value = withSpring(0);
          }
        },
      })
    ).current;

    // Handlers
    const handlePress = useCallback(() => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
      if (vibrationTimerRef.current) {
        clearTimeout(vibrationTimerRef.current);
        vibrationTimerRef.current = null;
      }

      if (onPress) {
        onPress(subscription);
      }
    }, [onPress, subscription]);

    const handleLongPress = useCallback(() => {
      if (onLongPress) {
        onLongPress(subscription);
      }
      
      // Show quick actions menu
      setShowQuickActions(true);
      
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate([0, 50]);
      } else {
        Vibration.vibrate(50);
      }
    }, [onLongPress, subscription]);

    const handlePressIn = useCallback(() => {
      setIsPressed(true);
      scale.value = withSpring(0.98);
      
      // Start long press timer
      pressTimerRef.current = setTimeout((): void => {
        handleLongPress();
      }, 500) as unknown as NodeJS.Timeout;
    }, [handleLongPress, scale]);

    const handlePressOut = useCallback(() => {
      setIsPressed(false);
      scale.value = withSpring(1);
      
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
    }, [scale]);

    const handleEdit = useCallback(() => {
      swipeableRef.current?.close();
      if (onEdit) onEdit(subscription);
    }, [onEdit, subscription]);

    const handleDelete = useCallback(() => {
      swipeableRef.current?.close();
      
      // Confirmation with animation
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      if (onDelete) onDelete(subscription);
    }, [onDelete, subscription]);

    const handleDuplicate = useCallback(() => {
      swipeableRef.current?.close();
      if (onDuplicate) onDuplicate(subscription);
    }, [onDuplicate, subscription]);

    const handleToggleStatus = useCallback(() => {
      if (onToggleStatus) onToggleStatus(subscription);
    }, [onToggleStatus, subscription]);

    const handleToggleNotification = useCallback(() => {
      if (onToggleNotification) onToggleNotification(subscription);
    }, [onToggleNotification, subscription]);

    const handleQuickNote = useCallback(() => {
      if (onQuickNote) onQuickNote(subscription);
    }, [onQuickNote, subscription]);

    const handleShare = useCallback(() => {
      if (onShare) onShare(subscription);
    }, [onShare, subscription]);

    const handleSwipeStart = useCallback(() => {
      setIsSwiped(true);
      if (onSwipeStart) onSwipeStart();
    }, [onSwipeStart]);

    const handleSwipeEnd = useCallback(() => {
      setIsSwiped(false);
      if (onSwipeEnd) onSwipeEnd();
    }, [onSwipeEnd]);

    // Quick action buttons
    const quickActions = [
      {
        id: 'edit',
        icon: 'pencil',
        label: 'Edit',
        color: colors.primary,
        onPress: handleEdit,
      },
      {
        id: 'duplicate',
        icon: 'content-copy',
        label: 'Duplicate',
        color: colors.success,
        onPress: handleDuplicate,
      },
      {
        id: 'share',
        icon: '📤',
        label: 'Share',
        color: colors.secondary,
        onPress: handleShare,
      },
      {
        id: 'note',
        icon: '📝',
        label: 'Add Note',
        color: colors.warning || '#FF9500',
        onPress: handleQuickNote,
      },
      {
        id: 'notification',
        icon: notificationEnabled ? '🔇' : '🔔',
        label: notificationEnabled ? 'Mute' : 'Enable Notif',
        color: notificationEnabled ? colors.error : colors.success,
        onPress: handleToggleNotification,
      },
      {
        id: 'status',
        icon: isActive ? '⏸' : '▶️',
        label: isActive ? 'Pause' : 'Activate',
        color: isActive ? (colors.warning || '#FF9500') : colors.success,
        onPress: handleToggleStatus,
      },
    ];

    // Swipe actions
    const renderRightActions = useCallback(
      (
        progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
      ) => {
        const trans = dragX.interpolate({
          inputRange: [-100, 0],
          outputRange: [0, 100],
          extrapolate: 'clamp',
        });

        return (
          <View style={styles.swipeActionsContainer}>
            {/* Delete action (red) */}
            <Animated.View
              style={[
                styles.swipeActionWrapper,
                {
                  transform: [{ translateX: trans }],
                },
              ]}>
              <TouchableOpacity
                style={[styles.swipeAction, styles.deleteAction]}
                onPress={handleDelete}
                activeOpacity={0.8}>
                <Text style={[styles.swipeActionLabel, { fontSize: 24 }]}>🗑️</Text>
                <Text style={styles.swipeActionLabel}>Delete</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Duplicate action (green) */}
            <Animated.View
              style={[
                styles.swipeActionWrapper,
                {
                  transform: [{ translateX: trans.interpolate({
                    inputRange: [-100, 0],
                    outputRange: [0, 50],
                  }) }],
                },
              ]}>
              <TouchableOpacity
                style={[styles.swipeAction, styles.duplicateAction]}
                onPress={handleDuplicate}
                activeOpacity={0.8}>
                <Text style={[styles.swipeActionLabel, { fontSize: 20 }]}>📋</Text>
                <Text style={styles.swipeActionLabel}>Duplicate</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Edit action (blue) */}
            <Animated.View
              style={[
                styles.swipeActionWrapper,
                {
                  transform: [{ translateX: trans.interpolate({
                    inputRange: [-100, 0],
                    outputRange: [0, 0],
                  }) }],
                },
              ]}>
              <TouchableOpacity
                style={[styles.swipeAction, styles.editAction]}
                onPress={handleEdit}
                activeOpacity={0.8}>
                <Text style={[styles.swipeActionLabel, { fontSize: 20 }]}>✏️</Text>
                <Text style={styles.swipeActionLabel}>Edit</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      },
      [handleDelete, handleDuplicate, handleEdit]
    );

    const renderLeftActions = useCallback(
      (
        progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
      ) => {
        const trans = dragX.interpolate({
          inputRange: [0, 100],
          outputRange: [-100, 0],
          extrapolate: 'clamp',
        });

        return (
          <View style={styles.swipeActionsContainer}>
            {/* Status toggle */}
            <Animated.View
              style={[
                styles.swipeActionWrapper,
                {
                  transform: [{ translateX: trans }],
                },
              ]}>
              <TouchableOpacity
                style={[
                  styles.swipeAction,
                  isActive ? styles.pauseAction : styles.activateAction,
                ]}
                onPress={handleToggleStatus}
                activeOpacity={0.8}>
                <Text style={[styles.swipeActionLabel, { fontSize: 24 }]}>{isActive ? '⏸' : '▶️'}</Text>
                <Text style={styles.swipeActionLabel}>
                  {isActive ? 'Pause' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Notification toggle */}
            <Animated.View
              style={[
                styles.swipeActionWrapper,
                {
                  transform: [{ translateX: trans.interpolate({
                    inputRange: [0, 100],
                    outputRange: [-50, 0],
                  }) }],
                },
              ]}>
              <TouchableOpacity
                style={[
                  styles.swipeAction,
                  notificationEnabled ? styles.muteAction : styles.notifyAction,
                ]}
                onPress={handleToggleNotification}
                activeOpacity={0.8}>
                <Text style={[styles.swipeActionLabel, { fontSize: 20 }]}>{notificationEnabled ? '🔇' : '🔔'}</Text>
                <Text style={styles.swipeActionLabel}>
                  {notificationEnabled ? 'Mute' : 'Notify'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      },
      [isActive, notificationEnabled, handleToggleStatus, handleToggleNotification]
    );

    // Quick actions overlay
    const renderQuickActions = useCallback(() => {
      if (!showQuickActions) return null;

      return (
        <View style={styles.quickActionsOverlay}>
          <View style={styles.quickActionsContainer}>
            {quickActions.slice(0, 4).map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionButton, { backgroundColor: action.color }]}
                onPress={() => {
                  action.onPress();
                  setShowQuickActions(false);
                }}
                activeOpacity={0.8}>
                <Text style={[styles.swipeActionLabel, { fontSize: 20 }]}>{action.icon}</Text>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.quickActionsClose}
            onPress={() => setShowQuickActions(false)}>
            <Text style={{ fontSize: 16, color: colors.textSecondary }}>✕</Text>
          </TouchableOpacity>
        </View>
      );
    }, [showQuickActions, quickActions, colors.textSecondary]);

    // Main content
    const renderContent = useCallback(() => (
      <Reanimated.View
        style={[
          styles.contentContainer,
          animatedStyle,
          isPressed && styles.pressed,
          isDragging && styles.dragging,
          isSelected && styles.selected,
        ]}
        {...panResponder.panHandlers}>
        {/* Drag handle */}
        {dragEnabled && !compactMode && (
          <View style={styles.dragHandle}>
            <Text style={[styles.dragHandle, { color: colors.textSecondary }]}>⋮⋮</Text>
          </View>
        )}

        {/* Icon with status indicator */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[
              categoryColor,
              categoryColor + (isDark ? 'CC' : 'EE'),
            ]}
            style={[
              styles.iconGradient,
              (isPaused || isCancelled) && styles.inactiveIcon,
            ]}>
            {subscription.icon ? (
            <Text style={{ fontSize: 16 }}>{subscription.icon || '📦'}</Text>
            ) : (
            <Text style={{ fontSize: 16 }}>🏷️</Text>
            )}
          </LinearGradient>

          {/* Status indicator dot */}
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: getStatusColor(subscription.status, colors),
              },
            ]}
          />

          {/* Trial badge */}
          {showTrialBadge && isTrial && daysUntilTrialEnds !== null && (
            <Badge
              text={`Trial: ${daysUntilTrialEnds}d`}
              color={colors.warning || '#FF9500' as any}
              size="small"
              style={styles.trialBadge}
            />
          )}

          {/* Split badge */}
          {showSplitBadge && isSplit && (
            <Badge
              text={`Split: ${splitMembersCount}`}
              color={colors.secondary || '#5856D6' as any}
              size="small"
              style={styles.splitBadge}
            />
          )}
        </View>

        {/* Main info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: colors.text },
                (isPaused || isCancelled) && styles.inactiveText,
              ]}
              numberOfLines={1}>
              {subscription.name}
            </Text>

            {/* Value score */}
            {showValueScore && valueScore > 0 && (
              <View style={styles.valueScoreContainer}>
                <Text style={[styles.valueScoreText, { color: colors.textSecondary }]}>
                  💯 {valueScore.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Category and billing info */}
          <View style={styles.detailsRow}>
            {showCategory && subscription.category && (
              <View style={styles.categoryContainer}>
                <View
                  style={[styles.categoryDot, { backgroundColor: categoryColor }]}
                />
                <Text style={[styles.category, { color: colors.textSecondary }]}>
                  {subscription.category || 'Other'}
                </Text>
              </View>
            )}

            {/* Next billing info */}
            {showNextBilling && !compactMode && (
              <View style={styles.billingContainer}>
                <Text
                  style={[styles.nextBilling, { color: colors.textSecondary }]}>
                  📅 {isDueToday
                    ? 'Due today'
                    : isDueTomorrow
                    ? 'Due tomorrow'
                    : isOverdue
                    ? `Overdue ${Math.abs(daysUntilBilling)}d`
                    : `Due in ${daysUntilBilling}d`}
                </Text>
              </View>
            )}
          </View>

          {/* Notes preview */}
          {!compactMode && subscription.notes && (
            <Text
              style={[styles.notes, { color: colors.textSecondary }]}
              numberOfLines={1}>
              📝 {subscription.notes.substring(0, 40)}
            </Text>
          )}

          {/* Usage bar (if enabled) */}
          {showUsage && usagePercentage > 0 && (
            <View style={styles.usageContainer}>
              <View style={[styles.usageBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.usageFill,
                    {
                      width: `${usagePercentage}%`,
                      backgroundColor: getUsageColor(usagePercentage),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.usageText, { color: colors.textSecondary }]}>
                Used {Math.round(usagePercentage)}% this month
              </Text>
            </View>
          )}
        </View>

        {/* Amount and action buttons */}
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: colors.text }]}>
            {formatAmountUtil(subscription.amount, subscription.currency || currency)}
          </Text>
          <Text style={[styles.billingCycle, { color: colors.textSecondary }]}>
            /{subscription.billingCycle}
          </Text>

          {/* Notification toggle button */}
          {showNotificationToggle && (
            <TouchableOpacity
              style={[
                styles.notificationButton,
                {
                  backgroundColor: notificationEnabled
                    ? colors.primary + '20'
                    : colors.border,
                },
              ]}
              onPress={handleToggleNotification}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ fontSize: 16, color: notificationEnabled ? colors.primary : colors.textSecondary }}>
                {notificationEnabled ? '🔔' : '🔕'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Selection indicator */}
        {showSelectionIndicator && (
          <View style={styles.selectionIndicator}>
            {isSelected ? (
                  <Text style={{ fontSize: 16 }}>✓</Text>
            ) : (
              <View style={[styles.selectionCircle, { borderColor: colors.border }]} />
            )}
          </View>
        )}

        {/* Quick actions hint */}
        {!compactMode && (
          <View style={styles.quickActionsHint}>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>⋯</Text>
          </View>
        )}
      </Reanimated.View>
    ), [
      animatedStyle,
      isPressed,
      isDragging,
      isSelected,
      dragEnabled,
      compactMode,
      colors,
      categoryColor,
      isDark,
      isPaused,
      isCancelled,
      subscription,
      showTrialBadge,
      isTrial,
      daysUntilTrialEnds,
      showSplitBadge,
      isSplit,
      splitMembersCount,
      showValueScore,
      valueScore,
      showCategory,
      showNextBilling,
      isOverdue,
      daysUntilBilling,
      isDueSoon,
      isDueToday,
      isDueTomorrow,
      showUsage,
      usagePercentage,
      formatAmountUtil,
      currency,
      notificationEnabled,
      handleToggleNotification,
      showSelectionIndicator,
      panResponder.panHandlers,
    ]);

    return (
      <View style={styles.container}>
        <Swipeable
          ref={swipeableRef}
          renderRightActions={onDelete || onDuplicate || onEdit ? renderRightActions : undefined}
          renderLeftActions={onToggleStatus || onToggleNotification ? renderLeftActions : undefined}
          friction={1}
          overshootRight={false}
          overshootLeft={false}
          onSwipeableWillOpen={handleSwipeStart}
          onSwipeableWillClose={handleSwipeEnd}
          onSwipeableClose={handleSwipeEnd}
          containerStyle={styles.swipeableContainer}
          enabled={!isDragging && !isSelected}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            delayLongPress={300}
            disabled={isDragging}>
            {renderContent()}
          </TouchableOpacity>
        </Swipeable>

        {/* Quick actions overlay */}
        {renderQuickActions()}
      </View>
    );
  }
);

// Helper functions
const getStatusColor = (status: string, colors: any) => {
  switch (status) {
    case 'active':
      return colors.success;
    case 'paused':
      return colors.warning;
    case 'cancelled':
      return colors.error;
    default:
      return colors.textSecondary;
  }
};

const calculateValueScore = (subscription: Subscription, usageCount: number, lastUsedDays: number | null): number => {
  const { amount, billingCycle } = subscription;
  
  // Calculate cost per use
  let costPerUse = amount;
  if (usageCount > 0) {
    costPerUse = amount / usageCount;
  }
  
  // Adjust for billing cycle
  const billingCycleStr = typeof billingCycle === 'string' ? billingCycle : 'monthly';
  const cycleMultiplier = {
    daily: 30,
    weekly: 4,
    monthly: 1,
    yearly: 1/12,
    custom: 1,
  }[billingCycleStr as keyof typeof billingCycleMap] || 1;
  
  const billingCycleMap = {
    daily: 30,
    weekly: 4,
    monthly: 1,
    yearly: 1/12,
    custom: 1,
  };
  
  const monthlyCost = amount * cycleMultiplier;
  
  // Calculate score (1-10)
  let score = 10;
  
  // Penalize high cost per use
  if (costPerUse > 10) score -= 3;
  else if (costPerUse > 5) score -= 2;
  else if (costPerUse > 2) score -= 1;
  
  // Penalize if not used recently
  if (lastUsedDays !== null) {
    if (lastUsedDays > 30) score -= 4;
    else if (lastUsedDays > 14) score -= 2;
    else if (lastUsedDays > 7) score -= 1;
  }
  
  // Penalize high monthly cost
  if (monthlyCost > 50) score -= 2;
  else if (monthlyCost > 20) score -= 1;
  
  return Math.max(1, Math.min(10, score));
};

const getValueScoreColor = (score: number): string => {
  if (score >= 8) return '#34C759'; // Green
  if (score >= 6) return '#FF9500'; // Orange
  if (score >= 4) return '#FF3B30'; // Red
  return '#8E8E93'; // Gray
};

const getUsageColor = (percentage: number): string => {
  if (percentage >= 80) return '#34C759'; // Green - high usage
  if (percentage >= 50) return '#FF9500'; // Orange - moderate usage
  if (percentage >= 20) return '#FFD60A'; // Yellow - low usage
  return '#8E8E93'; // Gray - very low usage
};

const calculateDropIndex = (dy: number, currentIndex: number, totalItems: number): number => {
  const itemHeight = 80; // Approximate item height
  const itemsToMove = Math.round(dy / itemHeight);
  return Math.max(0, Math.min(totalItems - 1, currentIndex + itemsToMove));
};

// Styles
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 8,
  },
  swipeableContainer: {
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  dragging: {
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  selected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  dragHandle: {
    marginRight: 12,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  iconGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveIcon: {
    opacity: 0.6,
  },
  statusDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  trialBadge: {
    position: 'absolute',
    bottom: -4,
    left: -4,
  },
  splitBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  valueScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  valueScoreText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
  },
  billingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextBilling: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  notes: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  usageContainer: {
    marginTop: 4,
  },
  usageBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 2,
  },
  usageFill: {
    height: '100%',
    borderRadius: 2,
  },
  usageText: {
    fontSize: 10,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  billingCycle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  notificationButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  selectionIndicator: {
    marginLeft: 8,
  },
  selectionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  quickActionsHint: {
    marginLeft: 8,
  },
  inactiveText: {
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  swipeActionsContainer: {
    flexDirection: 'row',
    width: 200,
    marginLeft: 8,
  },
  swipeActionWrapper: {
    flex: 1,
  },
  swipeAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 2,
  },
  swipeActionLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
  },
  duplicateAction: {
    backgroundColor: '#34C759',
  },
  editAction: {
    backgroundColor: '#007AFF',
  },
  pauseAction: {
    backgroundColor: '#FF9500',
  },
  activateAction: {
    backgroundColor: '#34C759',
  },
  muteAction: {
    backgroundColor: '#FF3B30',
  },
  notifyAction: {
    backgroundColor: '#007AFF',
  },
  quickActionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 300,
    gap: 8,
  },
  quickActionButton: {
    width: 70,
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  quickActionLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsClose: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

SubscriptionItem.displayName = 'SubscriptionItem';

export default SubscriptionItem;