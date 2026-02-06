import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    Vibration,
    View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import {
    useSharedValue
} from 'react-native-reanimated';

// Types
import Subscription from '@models/Subscription';

// Hooks
import { useCurrency } from '@hooks/useCurrency';
import useTheme from '@hooks/useTheme';

// Utilities
import { CATEGORIES } from '@config/categories';

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
    const theme = useTheme();
    const themeColors = theme.theme.colors;
    const { formatAmount } = useCurrency();

    // State
    const [isSwiped, setIsSwiped] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    // Reanimated values
    const translateX = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    // Refs
    const swipeableRef = useRef<Swipeable>(null);
    const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Memoized calculations
    const calculatedValues = useMemo(() => {
      // Status calculations
      const isActive = subscription.status === 'active';
      const isPaused = subscription.status === 'paused';
      const isCancelled = subscription.status === 'cancelled';

      // Category info
      const category = CATEGORIES.find((cat) => cat.id === subscription.category);
      const categoryColor = category?.color || themeColors.primary;
      const categoryName = category?.name || subscription.category;

      // Amount formatting
      const formattedAmount = formatAmount(
        subscription.amount,
        subscription.currency || 'USD'
      );

      // Billing cycle type check
      const billingCycle = subscription.billingCycle as
        | 'daily'
        | 'weekly'
        | 'monthly'
        | 'yearly'
        | 'custom';

      return {
        isActive,
        isPaused,
        isCancelled,
        categoryColor,
        categoryName,
        formattedAmount,
        billingCycle,
      };
    }, [subscription, themeColors, formatAmount]);

    const handlePress = useCallback(() => {
      setIsPressed(true);
      Vibration.vibrate(10);

      pressTimerRef.current = setTimeout(() => {
        onPress?.(subscription);
        setIsPressed(false);
      }, 100) as unknown as NodeJS.Timeout;
    }, [subscription, onPress]);

    const handleLongPress = useCallback(() => {
      Vibration.vibrate([0, 10, 5, 10]);
      onLongPress?.(subscription);
    }, [subscription, onLongPress]);

    const handleEdit = useCallback(() => {
      onEdit?.(subscription);
      swipeableRef.current?.close();
    }, [subscription, onEdit]);

    const handleDelete = useCallback(() => {
      onDelete?.(subscription);
      swipeableRef.current?.close();
    }, [subscription, onDelete]);

    const handleToggleStatus = useCallback(() => {
      onToggleStatus?.(subscription);
      swipeableRef.current?.close();
    }, [subscription, onToggleStatus]);

    const renderRightActions = useCallback(() => {
      return (
        <View style={styles.swipeActions}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.swipeButton, { backgroundColor: themeColors.primary }]}
              onPress={handleEdit}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          {onToggleStatus && (
            <TouchableOpacity
              style={[
                styles.swipeButton,
                {
                  backgroundColor: calculatedValues.isActive
                    ? themeColors.warning
                    : themeColors.success,
                },
              ]}
              onPress={handleToggleStatus}
            >
              <MaterialCommunityIcons
                name={calculatedValues.isActive ? 'pause' : 'play'}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.swipeButton, { backgroundColor: themeColors.error }]}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons name="delete" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      );
    }, [
      onEdit,
      onToggleStatus,
      onDelete,
      handleEdit,
      handleToggleStatus,
      handleDelete,
      themeColors,
      calculatedValues.isActive,
    ]);

    const statusStyle = useMemo(
      () =>
        calculatedValues.isPaused
          ? styles.paused
          : calculatedValues.isCancelled
            ? styles.cancelled
            : styles.active,
      [calculatedValues.isPaused, calculatedValues.isCancelled]
    );

    const statusBgColor = useMemo(
      () =>
        calculatedValues.isPaused
          ? themeColors.warning
          : calculatedValues.isCancelled
            ? themeColors.error
            : themeColors.success,
      [calculatedValues.isPaused, calculatedValues.isCancelled, themeColors]
    );

    const statusLabel = useMemo(
      () =>
        calculatedValues.isPaused
          ? 'Paused'
          : calculatedValues.isCancelled
            ? 'Cancelled'
            : 'Active',
      [calculatedValues.isPaused, calculatedValues.isCancelled]
    );

    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        onSwipeableOpen={onSwipeStart}
        onSwipeableClose={onSwipeEnd}
      >
        <TouchableOpacity
          style={[
            styles.container,
            isSelected && styles.selected,
            isDragging && styles.dragging,
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[
              calculatedValues.categoryColor,
              `${calculatedValues.categoryColor}66`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Selection Indicator */}
            {showSelectionIndicator && (
              <View
                style={[
                  styles.selectionIndicator,
                  isSelected && styles.selectionIndicatorActive,
                ]}
              >
                {isSelected && (
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color="#fff"
                  />
                )}
              </View>
            )}

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <MaterialCommunityIcons
                  name={(subscription.icon || 'package') as any}
                  size={24}
                  color="#fff"
                />
                <View style={styles.headerContent}>
                  <Text style={[styles.serviceName, { color: '#fff' }]}>
                    {subscription.name}
                  </Text>
                  {showCategory && (
                    <Text style={[styles.category, { color: '#fff' }]}>
                      {calculatedValues.categoryName}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.headerRight}>
                <Text style={[styles.amount, { color: '#fff' }]}>
                  {calculatedValues.formattedAmount}
                </Text>
                <Badge
                  text={statusLabel}
                  color={statusBgColor as any}
                  textColor="#fff"
                />
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {showNextBilling && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="calendar-month"
                    size={16}
                    color="#fff"
                  />
                  <Text style={[styles.infoText, { color: '#fff' }]}>
                    {subscription.billingDate || 'N/A'}
                  </Text>
                </View>
              )}

              {subscription.description && (
                <View style={styles.infoRow}>
                  <Text style={[styles.description, { color: '#fff' }]}>
                    {subscription.description}
                  </Text>
                </View>
              )}

              {showValueScore && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="star"
                    size={16}
                    color="#fff"
                  />
                  <Text style={[styles.infoText, { color: '#fff' }]}>
                    Value Score
                  </Text>
                </View>
              )}
            </View>

            {/* Footer Actions */}
            {showNotificationToggle && onToggleNotification && (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.notificationToggle}
                  onPress={() => onToggleNotification(subscription)}
                >
                  <MaterialCommunityIcons
                    name="bell"
                    size={18}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Swipeable>
    );
  }
);

SubscriptionItem.displayName = 'SubscriptionItem';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selected: {
    opacity: 0.8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  dragging: {
    opacity: 0.5,
  },
  gradient: {
    padding: 16,
    minHeight: 160,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIndicatorActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    opacity: 0.8,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 8,
  },
  description: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationToggle: {
    padding: 8,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  swipeButton: {
    width: 80,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    opacity: 1,
  },
  paused: {
    opacity: 0.6,
  },
  cancelled: {
    opacity: 0.4,
  },
});

export default SubscriptionItem;
