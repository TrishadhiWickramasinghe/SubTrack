import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
    addDays,
    differenceInDays,
    differenceInHours,
    format,
    isToday,
    isTomorrow
} from 'date-fns';
import * as Haptics from 'expo-haptics';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Types
import Payment from '@models/Payment';
import Subscription from '@models/Subscription';

// Hooks
import { useCurrency } from '@hooks/useCurrency';
import { useSubscriptions } from '@hooks/useSubscriptions';
import { useTheme } from '@hooks/useTheme';

// Components

// Utils

// Config

interface UpcomingPaymentCardProps {
  subscription: Subscription;
  payment?: Payment;
  index?: number;
  totalItems?: number;
  onPress?: (subscription: Subscription) => void;
  onMarkAsPaid?: (subscription: Subscription) => void;
  onSnooze?: (subscription: Subscription, days: number) => void;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  onShare?: (subscription: Subscription) => void;
  showCategory?: boolean;
  showDueTime?: boolean;
  showSnoozeOptions?: boolean;
  showMarkAsPaid?: boolean;
  showPaymentHistory?: boolean;
  showSplitDetails?: boolean;
  compactMode?: boolean;
  isFirstInList?: boolean;
  isLastInList?: boolean;
  animated?: boolean;
  pulseEffect?: boolean;
  glowEffect?: boolean;
  shadowDepth?: 'light' | 'medium' | 'heavy';
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

const UpcomingPaymentCard: React.FC<UpcomingPaymentCardProps> = memo(
  ({
    subscription,
    payment,
    index = 0,
    totalItems = 0,
    onPress,
    onMarkAsPaid,
    onSnooze,
    onEdit,
    onDelete,
    onShare,
    showCategory = true,
    showDueTime = true,
    showSnoozeOptions = true,
    showMarkAsPaid = true,
    showPaymentHistory = true,
    showSplitDetails = true,
    compactMode = false,
    isFirstInList = false,
    isLastInList = false,
    animated = true,
    pulseEffect = false,
    glowEffect = true,
    shadowDepth = 'medium',
    onSwipeStart,
    onSwipeEnd,
  }) => {
    const { theme, isDark } = useTheme();
    const { formatAmount } = useCurrency();
    const { updateSubscription } = useSubscriptions();
    const colors = theme.colors;
    const navigation = useNavigation();

    // State
    const [isPressed, setIsPressed] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [snoozeDays, setSnoozeDays] = useState<number | null>(null);
    const [showTimeOptions, setShowTimeOptions] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');

    // Refs
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const translateXAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Memoized calculations
    const {
      nextBillingDate,
      daysUntilDue,
      hoursUntilDue,
      isDueToday,
      isDueTomorrow,
      isPastDue,
      isDueSoon,
      isUrgent,
      formattedAmount,
      categoryColor,
      isActive,
      isSplit,
      splitMembersCount,
      myShareAmount,
      notificationEnabled,
      paymentMethod,
      recurringStatus,
      lastPaymentDate,
      daysSinceLastPayment,
      estimatedMonthlyCost,
      yearlySavingsPotential,
      canBePaused,
      hasFreeTrial,
      trialDaysRemaining,
      valueScore,
      paymentConfidence,
      upcomingPaymentsCount,
      nextPaymentInSequence,
      paymentStreak,
    } = useMemo(() => {
      const nextDate = (payment as any)?.date || (subscription.nextBillingDate ? new Date(subscription.nextBillingDate) : addDays(new Date(), 30));
      const daysUntil = differenceInDays(nextDate, new Date());
      const hoursUntil = differenceInHours(nextDate, new Date());

      // Estimated costs
      const cycleMultiplierMap: Record<string, number> = {
        daily: 30,
        weekly: 4.345,
        monthly: 1,
        yearly: 1/12,
        custom: 30 / (subscription.customDays || 30),
      };
      const cycleMultiplier = cycleMultiplierMap[subscription.billingCycle] || 1;
      const monthlyCost = subscription.amount * cycleMultiplier;
      const yearlyCost = monthlyCost * 12;

      return {
        nextBillingDate: nextDate,
        daysUntilDue: daysUntil,
        hoursUntilDue: hoursUntil,
        isDueToday: isToday(nextDate),
        isDueTomorrow: isTomorrow(nextDate),
        isPastDue: daysUntil < 0,
        isDueSoon: daysUntil <= 3 && daysUntil >= 0,
        isUrgent: daysUntil <= 1 && daysUntil >= 0,
        formattedAmount: formatAmount(
          (payment as any)?.amount || subscription.amount,
          (payment as any)?.currency || subscription.currency
        ),
        categoryColor: colors.primary,
        isActive: subscription.status === 'active',
        isSplit: false,
        splitMembersCount: 0,
        myShareAmount: subscription.amount,
        notificationEnabled: false,
        paymentMethod: subscription.paymentMethod || 'card',
        recurringStatus: subscription.autoRenew ? 'auto-renew' : 'manual',
        lastPaymentDate: null,
        daysSinceLastPayment: null,
        estimatedMonthlyCost: monthlyCost,
        yearlySavingsPotential: yearlyCost * 0.1,
        canBePaused: subscription.status === 'active',
        hasFreeTrial: false,
        trialDaysRemaining: null,
        valueScore: 7.5,
        paymentConfidence: 100,
        upcomingPaymentsCount: 0,
        nextPaymentInSequence: null,
        paymentStreak: 0,
      };
    }, [subscription, payment, formatAmount, colors]);

    // Animation setup
    useEffect(() => {
      if (animated) {
        // Staggered entrance animation
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.parallel([
            Animated.spring(translateXAnim, {
              toValue: 0,
              tension: 60,
              friction: 7,
              useNativeDriver: true,
              delay: index * 50,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 300,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }

      // Pulse animation for urgent payments
      if (pulseEffect && isUrgent) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }

      // Progress animation for time until due
      if (isDueSoon) {
        const progress = Math.max(0, Math.min(1, daysUntilDue / 3));
        Animated.timing(progressAnim, {
          toValue: progress,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: false,
        }).start();
      }
    }, [animated, index, pulseEffect, isUrgent, isDueSoon, daysUntilDue]);

    // Handlers
    const handlePress = useCallback(() => {
      if (onPress) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(subscription);
      }
    }, [onPress, subscription]);

    const handlePressIn = useCallback(() => {
      setIsPressed(true);
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      setIsPressed(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const handleMarkAsPaid = useCallback(async () => {
      if (isProcessing) return;
      
      setIsProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      try {
        if (onMarkAsPaid) {
          onMarkAsPaid(subscription);
        }
        
        // Success animation
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 200,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error marking as paid:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsProcessing(false);
      }
    }, [isProcessing, onMarkAsPaid, subscription, scaleAnim]);

    const handleSnooze = useCallback((days: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (onSnooze) {
        onSnooze(subscription, days);
      } else {
        // Update subscription with new date
        const newDate = addDays(nextBillingDate, days);
        updateSubscription(subscription.id, {
          billingDate: newDate,
        });
      }
      
      setSnoozeDays(days);
      setShowActions(false);
      
      // Animation
      Animated.sequence([
        Animated.timing(translateXAnim, {
          toValue: -20,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(translateXAnim, {
          toValue: 0,
          tension: 200,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }, [onSnooze, subscription, nextBillingDate, updateSubscription, translateXAnim]);

    const handleShare = useCallback(async () => {
      if (onShare) {
        onShare(subscription);
        return;
      }

      try {
        const shareResult = await Share.share({
          message: `💳 Payment due for ${subscription.name}\n` +
                   `💰 Amount: ${formattedAmount}\n` +
                   `📅 Due: ${format(nextBillingDate, 'MMM d, yyyy')}\n` +
                   `⏰ ${isDueToday ? 'Due today!' : isDueTomorrow ? 'Due tomorrow' : `Due in ${daysUntilDue} days`}\n` +
                   `\nTracked via SubTrack App`,
          title: `Share Payment Info for ${subscription.name}`,
        });

        if (shareResult.action === Share.sharedAction) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (error) {
        console.error('Error sharing:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }, [onShare, subscription, formattedAmount, nextBillingDate, isDueToday, isDueTomorrow, daysUntilDue]);

    const handleQuickActions = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowActions(!showActions);
    }, [showActions]);

    const handleViewPaymentHistory = useCallback(() => {
      (navigation as any).navigate('PaymentHistory', { subscriptionId: subscription.id });
    }, [navigation, subscription.id]);

    const handleViewSplitDetails = useCallback(() => {
      (navigation as any).navigate('SplitDetails', { subscriptionId: subscription.id });
    }, [navigation, subscription.id]);

    // Snooze options
    const SNOOZE_OPTIONS = useMemo(() => [
      { days: 1, label: '1 day', icon: 'clock-outline' },
      { days: 3, label: '3 days', icon: 'clock' },
      { days: 7, label: '1 week', icon: 'calendar-week' },
      { days: 30, label: '1 month', icon: 'calendar-month' },
    ], []);

    // Urgency level
    const urgencyLevel = useMemo(() => {
      if (isPastDue) return { level: 'past-due', color: colors.error, icon: 'alert-circle' };
      if (isUrgent) return { level: 'urgent', color: colors.warning, icon: 'alert' };
      if (isDueToday) return { level: 'today', color: colors.warning, icon: 'calendar-today' };
      if (isDueTomorrow) return { level: 'tomorrow', color: colors.primary, icon: 'calendar-arrow-right' };
      if (isDueSoon) return { level: 'soon', color: colors.primary, icon: 'calendar-clock' };
      return { level: 'upcoming', color: colors.success, icon: 'calendar' };
    }, [isPastDue, isUrgent, isDueToday, isDueTomorrow, isDueSoon, colors]);

    // Time display
    const timeDisplay = useMemo(() => {
      if (isPastDue) return `${Math.abs(daysUntilDue)} days overdue`;
      if (isDueToday) return 'Due today';
      if (isDueTomorrow) return 'Due tomorrow';
      if (daysUntilDue === 0) return 'Due today';
      if (daysUntilDue === 1) return 'Due tomorrow';
      return `Due in ${daysUntilDue} days`;
    }, [isPastDue, isDueToday, isDueTomorrow, daysUntilDue]);

    // Pulse animation style
    const pulseStyle = {
      opacity: pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.8],
      }),
      transform: [
        {
          scale: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.05],
          }),
        },
      ],
    };

    // Glow animation style
    const glowStyle = {
      opacity: glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
      transform: [
        {
          scale: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          }),
        },
      ],
    };

    // Progress width
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateX: translateXAnim },
              { scale: scaleAnim },
            ],
            opacity: opacityAnim,
            marginTop: isFirstInList ? 16 : 8,
            marginBottom: isLastInList ? 16 : 8,
          },
        ]}>
        {/* Glow effect */}
        {glowEffect && isUrgent && (
          <Animated.View
            style={[
              styles.glowEffect,
              { backgroundColor: urgencyLevel.color },
              glowStyle,
            ]}
          />
        )}

        {/* Pulse effect */}
        {pulseEffect && isUrgent && (
          <Animated.View
            style={[
              styles.pulseEffect,
              { backgroundColor: urgencyLevel.color },
              pulseStyle,
            ]}
          />
        )}

        {/* Main card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handleQuickActions}
          delayLongPress={500}
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: isPressed ? colors.primary : colors.border,
              shadowColor: colors.textSecondary,
            },
            shadowDepth === 'light' && styles.shadowLight,
            shadowDepth === 'medium' && styles.shadowMedium,
            shadowDepth === 'heavy' && styles.shadowHeavy,
            isPastDue && styles.pastDueCard,
            isUrgent && styles.urgentCard,
          ]}>
          {/* Progress bar for due soon */}
          {isDueSoon && !isPastDue && (
            <Animated.View
              style={[
                styles.progressBar,
                {
                  backgroundColor: urgencyLevel.color + '30',
                  width: progressWidth,
                },
              ]}
            />
          )}

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {/* Service icon */}
              <View style={[styles.iconContainer, { backgroundColor: categoryColor + '20' }]}>
                <Icon
                  name={subscription.icon as any || 'tag-outline'}
                  size={compactMode ? 20 : 24}
                  color={categoryColor}
                />
              </View>

              {/* Service info */}
              <View style={styles.serviceInfo}>
                <View style={styles.serviceRow}>
                  <Text
                    style={[styles.serviceName, { color: colors.text }]}
                    numberOfLines={1}>
                    {subscription.name}
                  </Text>
                  
                  {/* Urgency badge */}
                  <View style={[styles.urgencyBadge, { backgroundColor: urgencyLevel.color }]}>
                    <Icon name={urgencyLevel.icon as any} size={12} color="#fff" />
                    <Text style={styles.urgencyText}>
                      {urgencyLevel.level.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Category and notification status */}
                <View style={styles.metaRow}>
                  {showCategory && subscription.category && (
                    <View style={styles.categoryContainer}>
                      <View
                        style={[styles.categoryDot, { backgroundColor: categoryColor }]}
                      />
                      <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
                        {subscription.category}
                      </Text>
                    </View>
                  )}

                  {notificationEnabled && (
                    <View style={styles.notificationIndicator}>
                      <Icon name="bell" size={12} color={colors.success} />
                    </View>
                  )}

                  {/* Split indicator */}
                  {isSplit && showSplitDetails && (
                    <View style={styles.splitIndicator}>
                      <Icon name="account-group" size={12} color={colors.primary} />
                      <Text style={[styles.splitText, { color: colors.textSecondary }]}>
                        {splitMembersCount}
                      </Text>
                    </View>
                  )}

                  {/* Payment streak */}
                  {paymentStreak > 0 && (
                    <View style={styles.streakIndicator}>
                      <Icon name="fire" size={12} color={colors.warning} />
                      <Text style={[styles.streakText, { color: colors.textSecondary }]}>
                        {paymentStreak}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Quick actions */}
            <TouchableOpacity
              style={styles.quickActionsButton}
              onPress={handleQuickActions}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon
                name={showActions ? 'chevron-up' : 'dots-horizontal'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Amount and due info */}
            <View style={styles.amountSection}>
              <View style={styles.amountContainer}>
                <Text style={[styles.amount, { color: colors.text }]}>
                  {formatAmount((payment as any)?.amount || subscription.amount, (payment as any)?.currency || subscription.currency)}
                </Text>
                <Text style={[styles.billingCycle, { color: colors.textSecondary }]}>
                  /{subscription.billingCycle}
                </Text>
              </View>

              {/* Due time */}
              <View style={styles.dueTimeContainer}>
                <Icon
                  name="calendar-clock"
                  size={14}
                  color={urgencyLevel.color}
                />
                <Text style={[styles.dueTime, { color: urgencyLevel.color }]}>
                  {timeDisplay}
                </Text>
                {showDueTime && !compactMode && (
                  <Text style={[styles.dueDate, { color: colors.textSecondary }]}>
                    {format(nextBillingDate, 'MMM d')}
                  </Text>
                )}
              </View>
            </View>

            {/* Split amount if applicable */}
            {isSplit && myShareAmount !== subscription.amount && (
              <View style={styles.splitAmountContainer}>
                <Text style={[styles.splitAmountLabel, { color: colors.textSecondary }]}>
                  Your share:
                </Text>
                <Text style={[styles.splitAmount, { color: colors.text }]}>
                  {formatAmount(myShareAmount, subscription.currency)}
                </Text>
              </View>
            )}

            {/* Payment confidence */}
            {!compactMode && (
              <View style={styles.confidenceContainer}>
                <Text style={[styles.confidenceLabel, { color: colors.textSecondary }]}>
                  Payment confidence:
                </Text>
                <View style={[styles.progressCircle, { borderColor: paymentConfidence > 80 ? colors.success : paymentConfidence > 60 ? colors.warning : colors.error }]}>
                  <Text style={{fontSize: 10, color: colors.text}}>{Math.round(paymentConfidence)}</Text>
                </View>
                <Text style={[styles.confidenceValue, { color: colors.text }]}>
                  {Math.round(paymentConfidence)}%
                </Text>
              </View>
            )}

            {/* Action buttons */}
            {showActions && (
              <Animated.View
                style={[
                  styles.actionsContainer,
                  {
                    opacity: opacityAnim,
                    transform: [{ translateY: opacityAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }) }],
                  },
                ]}>
                {/* Mark as paid */}
                {showMarkAsPaid && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.paidButton]}
                    onPress={handleMarkAsPaid}
                    disabled={isProcessing}>
                    <Icon name="check-circle" size={18} color={colors.success} />
                    <Text style={[styles.actionText, { color: colors.success }]}>
                      {isProcessing ? 'Processing...' : 'Mark Paid'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Snooze options */}
                {showSnoozeOptions && (
                  <View style={styles.snoozeContainer}>
                    <Text style={[styles.snoozeLabel, { color: colors.textSecondary }]}>
                      Snooze:
                    </Text>
                    <View style={styles.snoozeButtons}>
                      {SNOOZE_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option.days}
                          style={[
                            styles.snoozeButton,
                            { backgroundColor: colors.card },
                          ]}
                          onPress={() => handleSnooze(option.days)}>
                          <Icon name={option.icon as any} size={14} color={colors.primary} />
                          <Text style={[styles.snoozeButtonText, { color: colors.primary }]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Additional actions */}
                <View style={styles.secondaryActions}>
                  <TouchableOpacity
                    style={[styles.secondaryButton, { backgroundColor: colors.card }]}
                    onPress={handleShare}>
                    <Icon name="share-variant" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  
                  {showPaymentHistory && (
                    <TouchableOpacity
                      style={[styles.secondaryButton, { backgroundColor: colors.card }]}
                      onPress={handleViewPaymentHistory}>
                      <Icon name="history" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                  
                  {isSplit && showSplitDetails && (
                    <TouchableOpacity
                      style={[styles.secondaryButton, { backgroundColor: colors.card }]}
                      onPress={handleViewSplitDetails}>
                      <Icon name="account-group" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            )}

            {/* Due time progress */}
            {!compactMode && isDueSoon && (
              <View style={styles.timeProgressContainer}>
                <View style={styles.timeLabels}>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                    {format(new Date(), 'MMM d')}
                  </Text>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                    Due: {format(nextBillingDate, 'MMM d')}
                  </Text>
                </View>
                <View style={[styles.timeProgressBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.timeProgressFill,
                      { backgroundColor: urgencyLevel.color },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Value score */}
            <View style={styles.footerItem}>
              <View style={[styles.progressCircle, { borderColor: getValueScoreColor(valueScore) }]}>
                <Text style={[styles.progressText, { color: colors.text }]}>
                  {valueScore.toFixed(1)}
                </Text>
              </View>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Value: {valueScore.toFixed(1)}/10
              </Text>
            </View>

            {/* Estimated monthly */}
            <View style={styles.footerItem}>
              <Icon name="calendar-month" size={14} color={colors.textSecondary} />
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                {formatAmount(estimatedMonthlyCost, subscription.currency)}/mo
              </Text>
            </View>

            {/* Savings potential */}
            {yearlySavingsPotential > 0 && (
              <View style={styles.footerItem}>
                <Icon name="trending-down" size={14} color={colors.success} />
                <Text style={[styles.footerText, { color: colors.success }]}>
                  Save {formatAmount(yearlySavingsPotential, subscription.currency)}/yr
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// Helper functions
const getValueScoreColor = (score: number): string => {
  if (score >= 8) return '#34C759'; // Green
  if (score >= 6) return '#FF9500'; // Orange
  if (score >= 4) return '#FF3B30'; // Red
  return '#8E8E93'; // Gray
};

// Styles
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginHorizontal: 16,
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 20,
    zIndex: -1,
  },
  pulseEffect: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 16,
    zIndex: -1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  shadowLight: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shadowMedium: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowHeavy: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  pastDueCard: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  urgentCard: {
    borderColor: '#FF9500',
    borderWidth: 2,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  urgencyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notificationIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  splitText: {
    fontSize: 11,
    fontWeight: '500',
  },
  streakIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '500',
  },
  quickActionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amount: {
    fontSize: 24,
    fontWeight: '800',
  },
  billingCycle: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  dueTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueTime: {
    fontSize: 14,
    fontWeight: '700',
  },
  dueDate: {
    fontSize: 12,
    marginLeft: 4,
  },
  splitAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  splitAmountLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  splitAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  paidButton: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  snoozeContainer: {
    marginBottom: 12,
  },
  snoozeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  snoozeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  snoozeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  snoozeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeProgressContainer: {
    marginTop: 12,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  timeProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  timeProgressFill: {
    height: '100%',
    width: '50%', // This would be dynamic based on days remaining
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

UpcomingPaymentCard.displayName = 'UpcomingPaymentCard';

export default UpcomingPaymentCard;