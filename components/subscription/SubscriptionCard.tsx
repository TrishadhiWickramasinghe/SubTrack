import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useMemo } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

// Types
import Subscription from '@models/Subscription';

// Hooks
import { useCurrency } from '@hooks/useCurrency';
import useTheme from '@hooks/useTheme';

// Utils
import { CATEGORIES } from '@config/categories';
import dateHelpers from '@utils/dateHelpers';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress?: (subscription: Subscription) => void;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  onDuplicate?: (subscription: Subscription) => void;
  onToggleStatus?: (subscription: Subscription) => void;
  onQuickAddNote?: (subscription: Subscription) => void;
  showStatusBadge?: boolean;
  showCategory?: boolean;
  showNextBilling?: boolean;
  compactMode?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = memo(
  ({
    subscription,
    onPress,
    onEdit,
    onDelete,
    onDuplicate,
    onToggleStatus,
    onQuickAddNote,
    showStatusBadge = true,
    showCategory = true,
    showNextBilling = true,
    compactMode = false,
    onSwipeStart,
    onSwipeEnd,
  }) => {
    const theme = useTheme();
    const { formatAmount, primaryCurrency } = useCurrency();

    // Memoized calculations
    const {
      nextBillingDate,
      daysUntilBilling,
      isDueSoon,
      isOverdue,
      isActive,
      isPaused,
      isCancelled,
      categoryColor,
      formattedAmount,
      gradientColors,
    } = useMemo(() => {
      const nextDate = dateHelpers.getNextBillingDate(subscription);
      const daysUntil = nextDate ? Math.floor(
        (nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ) : 0;

      return {
        nextBillingDate: nextDate || new Date(),
        daysUntilBilling: daysUntil,
        isDueSoon: daysUntil <= 3 && daysUntil >= 0,
        isOverdue: daysUntil < 0,
        isActive: subscription.status === 'active',
        isPaused: subscription.status === 'paused',
        isCancelled: subscription.status === 'cancelled',
        categoryColor: CATEGORIES.find((c: { id: string; color: string }) => c.id === subscription.category)?.color || theme.theme.colors.primary,
        formattedAmount: formatAmount(
          subscription.amount,
          subscription.currency || primaryCurrency
        ),
        gradientColors: getGradientColors(subscription.status, theme.theme.colors),
      };
    }, [subscription, primaryCurrency, theme, formatAmount]);

    // Handlers
    const handlePress = useCallback(() => {
      if (onPress) {
        onPress(subscription);
      }
    }, [onPress, subscription]);

    const handleLongPress = useCallback(() => {
      Vibration.vibrate(50);
      // Show quick actions menu
      // This could trigger a bottom sheet or context menu
    }, []);

    const handleEdit = useCallback(() => {
      if (onEdit) onEdit(subscription);
    }, [onEdit, subscription]);

    const handleDelete = useCallback(() => {
      if (onDelete) onDelete(subscription);
    }, [onDelete, subscription]);

    const handleDuplicate = useCallback(() => {
      if (onDuplicate) onDuplicate(subscription);
    }, [onDuplicate, subscription]);

    const handleToggleStatus = useCallback(() => {
      if (onToggleStatus) onToggleStatus(subscription);
    }, [onToggleStatus, subscription]);

    const handleQuickAddNote = useCallback(() => {
      if (onQuickAddNote) onQuickAddNote(subscription);
    }, [onQuickAddNote, subscription]);

    // Swipe actions
    const renderRightActions = useCallback(
      (
        progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
      ) => {
        const scale = dragX.interpolate({
          inputRange: [-100, 0],
          outputRange: [1, 0],
          extrapolate: 'clamp',
        });

        return (
          <View style={styles.swipeActions}>
            {/* Duplicate Action */}
            <Animated.View style={{ transform: [{ scale }] }}>
              <TouchableOpacity
                style={[styles.swipeAction, styles.duplicateAction]}
                onPress={handleDuplicate}>
                <Icon name="content-copy" size={20} color="#fff" />
                <Text style={styles.swipeActionText}>Duplicate</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Edit Action */}
            <Animated.View style={{ transform: [{ scale }] }}>
              <TouchableOpacity
                style={[styles.swipeAction, styles.editAction]}
                onPress={handleEdit}>
                <Icon name="pencil" size={20} color="#fff" />
                <Text style={styles.swipeActionText}>Edit</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Delete Action */}
            <Animated.View style={{ transform: [{ scale }] }}>
              <TouchableOpacity
                style={[styles.swipeAction, styles.deleteAction]}
                onPress={handleDelete}>
                <Icon name="trash-can-outline" size={20} color="#fff" />
                <Text style={styles.swipeActionText}>Delete</Text>
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
        const scale = dragX.interpolate({
          inputRange: [0, 100],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });

        return (
          <View style={styles.swipeActions}>
            {/* Status Toggle */}
            <Animated.View style={{ transform: [{ scale }] }}>
              <TouchableOpacity
                style={[
                  styles.swipeAction,
                  isActive
                    ? styles.pauseAction
                    : isPaused
                    ? styles.activateAction
                    : styles.activateAction,
                ]}
                onPress={handleToggleStatus}>
                <Icon
                  name={isActive ? 'pause' : 'play'}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.swipeActionText}>
                  {isActive ? 'Pause' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Quick Note */}
            <Animated.View style={{ transform: [{ scale }] }}>
              <TouchableOpacity
                style={[styles.swipeAction, styles.noteAction]}
                onPress={handleQuickAddNote}>
                <Icon name="note-plus" size={20} color="#fff" />
                <Text style={styles.swipeActionText}>Note</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      },
      [handleToggleStatus, handleQuickAddNote, isActive, isPaused]
    );

    // Component content
    const cardContent = (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}>
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.card,
            compactMode && styles.compactCard,
            {
              backgroundColor: theme.theme.colors.card,
              borderColor: theme.theme.colors.border,
            },
          ]}>
          {/* Icon & Main Info */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: categoryColor + '20' },
                ]}>
                {subscription.icon ? (
                  <Icon
                    name={subscription.icon as any}
                    size={compactMode ? 20 : 24}
                    color={categoryColor}
                  />
                ) : (
                  <Icon
                    name="tag-outline"
                    size={compactMode ? 20 : 24}
                    color={categoryColor}
                  />
                )}
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.title,
                    { color: theme.theme.colors.text },
                    (isPaused || isCancelled) && styles.inactiveTitle,
                  ]}
                  numberOfLines={1}>
                  {subscription.name}
                </Text>

                {/* Status Badge */}
                {showStatusBadge && (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(
                          subscription.status,
                          theme.theme.colors
                        ),
                      },
                    ]}>
                    <Text style={styles.statusText}>
                      {subscription.status.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              {/* Category */}
              {showCategory && subscription.category && (
                <View style={styles.categoryRow}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: categoryColor },
                    ]}
                  />
                  <Text style={[styles.category, { color: theme.theme.colors.textSecondary }]}>
                    {CATEGORIES.find((c: any) => c.id === subscription.category)?.name || subscription.category}
                  </Text>
                </View>
              )}

              {/* Notes Preview */}
              {!compactMode && subscription.notes && (
                <Text
                  style={[styles.notes, { color: theme.theme.colors.textSecondary }]}
                  numberOfLines={1}>
                  <Icon name="note-text" size={12} /> {subscription.notes}
                </Text>
              )}
            </View>

            <View style={styles.amountContainer}>
              <Text
                style={[
                  styles.amount,
                  { color: theme.theme.colors.text },
                  (isPaused || isCancelled) && styles.inactiveAmount,
                ]}>
                {formattedAmount}
              </Text>
              <Text style={[styles.billingCycle, { color: theme.theme.colors.textSecondary }]}>
                /{subscription.billingCycle}
              </Text>
            </View>
          </View>

          {/* Footer with next billing info */}
          {!compactMode && showNextBilling && (
            <View style={styles.footer}>
              <View style={styles.billingInfo}>
                <Icon
                  name="calendar"
                  size={14}
                  color={
                    isOverdue
                      ? theme.theme.colors.error
                      : isDueSoon
                      ? theme.theme.colors.warning
                      : theme.theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.nextBilling,
                    {
                      color: isOverdue
                        ? theme.theme.colors.error
                        : isDueSoon
                        ? theme.theme.colors.warning
                        : theme.theme.colors.textSecondary,
                    },
                  ]}>
                  {isOverdue
                    ? `Overdue by ${Math.abs(daysUntilBilling)} days`
                    : `Due in ${daysUntilBilling} days`}
                </Text>
              </View>

              <Text style={[styles.date, { color: theme.theme.colors.textSecondary }]}>
                {dateHelpers.formatDate(nextBillingDate, 'MMM d, yyyy')}
              </Text>
            </View>
          )}

          {/* Quick actions indicator */}
          <View style={styles.quickActionsIndicator}>
            <Icon
              name="dots-horizontal"
              size={16}
              color={theme.theme.colors.textSecondary}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );

    if (onEdit || onDelete || onDuplicate) {
      return (
        <Swipeable
          renderRightActions={renderRightActions}
          renderLeftActions={renderLeftActions}
          friction={2}
          overshootRight={false}
          overshootLeft={false}
          onSwipeableWillOpen={onSwipeStart}
          onSwipeableClose={onSwipeEnd}
          containerStyle={styles.swipeableContainer}>
          {cardContent}
        </Swipeable>
      );
    }

    return cardContent;
  }
);

// Helper functions
const getGradientColors = (status: string, colors: any) => {
  switch (status) {
    case 'active':
      return [colors.card, colors.card];
    case 'paused':
      return ['#F5F5F5', '#F0F0F0'];
    case 'cancelled':
      return ['#F9F9F9', '#F5F5F5'];
    default:
      return [colors.card, colors.card];
  }
};

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

// Styles
const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  compactCard: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginRight: 8,
  },
  inactiveTitle: {
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  category: {
    fontSize: 12,
  },
  notes: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  inactiveAmount: {
    opacity: 0.6,
  },
  billingCycle: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  billingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextBilling: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
  },
  quickActionsIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
    opacity: 0.5,
  },
  swipeActions: {
    flexDirection: 'row',
    width: 200,
    marginLeft: 12,
  },
  swipeAction: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 2,
  },
  swipeActionText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
  },
  editAction: {
    backgroundColor: '#007AFF',
  },
  duplicateAction: {
    backgroundColor: '#34C759',
  },
  pauseAction: {
    backgroundColor: '#FF9500',
  },
  activateAction: {
    backgroundColor: '#34C759',
  },
  noteAction: {
    backgroundColor: '#5856D6',
  },
});

// Display name for debugging
SubscriptionCard.displayName = 'SubscriptionCard';

export default SubscriptionCard;