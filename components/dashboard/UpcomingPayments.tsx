import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { addDays, differenceInDays, format, isToday, isTomorrow } from 'date-fns';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Animated,
    Easing,
    LayoutAnimation,
    Platform,
    Text as RNText,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

// Components
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import Loading from '@components/common/Loading';
import { colors } from '@config/colors';
import { useCurrency } from '@hooks/useCurrency';
import { useSubscriptions } from '@hooks/useSubscriptions';

interface UpcomingPaymentsProps {
  daysAhead?: number;
  maxItems?: number;
  showAll?: boolean;
  compact?: boolean;
  showActions?: boolean;
  animation?: boolean;
  onPaymentPress?: (subscription: any) => void;
  onMarkPaid?: (subscription: any) => Promise<void>;
}

type UpcomingPayment = any & {
  daysUntil: number;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  relativeDate: string;
}

export const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({
  daysAhead = 7,
  maxItems = 5,
  showAll = false,
  compact = false,
  showActions = true,
  animation = true,
  onPaymentPress,
  onMarkPaid,
}) => {
  const navigation = useNavigation<any>();
  const { subscriptions, updateSubscription } = useSubscriptions();
  const { formatAmount } = useCurrency();
  
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  const [swipeableRefs] = useState<Map<string, Swipeable>>(new Map());
  const [pulsingItems, setPulsingItems] = useState<Set<string>>(new Set());

  // Enable LayoutAnimation
  if (Platform.OS === 'android' && LayoutAnimation) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }

  // Load upcoming payments
  useEffect(() => {
    loadUpcomingPayments();
  }, [subscriptions, daysAhead]);

  const loadUpcomingPayments = (): void => {
    setIsLoading(true);
    
    try {
      const today = new Date();
      const cutoffDate = addDays(today, daysAhead);
      
      const upcoming = subscriptions
        .filter(sub => {
          if (!sub.isActive) return false;
          
          const billingDate = new Date(sub.billingDate);
          return billingDate <= cutoffDate;
        })
        .map(sub => {
          const billingDate = new Date(sub.billingDate);
          const today = new Date();
          const daysUntil = differenceInDays(billingDate, today);
          const isOverdue = daysUntil < 0;
          const isTodayVal = isToday(billingDate);
          const isTomorrowVal = isTomorrow(billingDate);
          
          return {
            ...sub,
            daysUntil,
            isOverdue,
            isToday: isTodayVal,
            isTomorrow: isTomorrowVal,
            relativeDate: format(billingDate, 'MMM dd'),
          };
        })
        .sort((a, b) => {
          // Sort by: overdue first, then today, then tomorrow, then by date
          if (a.isOverdue && !b.isOverdue) return -1;
          if (!a.isOverdue && b.isOverdue) return 1;
          if (a.isToday && !b.isToday) return -1;
          if (!a.isToday && b.isToday) return 1;
          if (a.isTomorrow && !b.isTomorrow) return -1;
          if (!a.isTomorrow && b.isTomorrow) return 1;
          return a.daysUntil - b.daysUntil;
        });
      
      setUpcomingPayments(upcoming);
      
      // Identify items that need pulsing (today, tomorrow, overdue)
      const pulsing = new Set<string>();
      upcoming.forEach(payment => {
        if (payment.isToday || payment.isTomorrow || payment.isOverdue) {
          pulsing.add(payment.id);
        }
      });
      setPulsingItems(pulsing);
      
      // Animate in
      if (animation && upcoming.length > 0) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error('Failed to load upcoming payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentPress = (payment: UpcomingPayment): void => {
    if (onPaymentPress) {
      onPaymentPress(payment);
    }
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleMarkPaid = async (payment: UpcomingPayment): Promise<void> => {
    if (onMarkPaid) {
      await onMarkPaid(payment);
      return;
    }

    Alert.alert(
      'Mark as Paid',
      `Mark "${payment.name}" as paid for ${format(new Date(payment.billingDate), 'MMM dd, yyyy')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
          onPress: async () => {
            try {
              // Calculate next billing date
              const nextBillingDate = calculateNextBillingDate(
                new Date(payment.billingDate),
                payment.billingCycle
              );
              
              await updateSubscription(payment.id, {
                billingDate: nextBillingDate.toISOString(),
                lastPaidDate: new Date().toISOString(),
              });
              
              // Reschedule notification
              if (payment.notificationDays > 0) {
                // Notification scheduling removed
              }
              
              Alert.alert('Success', 'Payment marked as paid');
            } catch (error) {
              Alert.alert('Error', 'Failed to mark payment as paid');
            }
          },
        },
      ]
    );
  };

  const handleSnooze = (payment: UpcomingPayment, days: number): void => {
    Alert.alert(
      'Snooze Payment',
      `Snooze "${payment.name}" for ${days} day${days !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Snooze',
          onPress: async () => {
            try {
              const newDate = addDays(new Date(payment.billingDate), days);
              await updateSubscription(payment.id, {
                billingDate: newDate.toISOString(),
              });
              
              // Reschedule notification
              if (payment.notificationDays > 0) {
                // Notification scheduling removed
              }
              
              Alert.alert('Success', `Payment snoozed for ${days} day${days !== 1 ? 's' : ''}`);
            } catch (error) {
              Alert.alert('Error', 'Failed to snooze payment');
            }
          },
        },
      ]
    );
  };

  const handleViewAll = (): void => {
    //  Navigation removed
  };

  const handleAddReminder = (payment: UpcomingPayment): void => {
    Alert.alert(
      'Add Reminder',
      `Set a custom reminder for "${payment.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '1 Day Before', onPress: () => updateReminder(payment, 1) },
        { text: '3 Days Before', onPress: () => updateReminder(payment, 3) },
        { text: 'Custom', onPress: () => showCustomReminderDialog(payment) },
      ]
    );
  };

  const updateReminder = async (payment: UpcomingPayment, days: number): Promise<void> => {
    try {
      await updateSubscription(payment.id, {
        notificationDays: days,
      });
      
      // Reschedule notification removed
      
      Alert.alert('Success', `Reminder set for ${days} day${days !== 1 ? 's' : ''} before`);
    } catch (error) {
      Alert.alert('Error', 'Failed to set reminder');
    }
  };

  const showCustomReminderDialog = (payment: UpcomingPayment): void => {
    // Implement custom reminder dialog
    Alert.prompt(
      'Custom Reminder',
      'Enter number of days before payment:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set',
          onPress: (days: string | undefined) => {
            const daysNum = parseInt(days || '1', 10);
            if (daysNum > 0 && daysNum <= 30) {
              updateReminder(payment, daysNum);
            }
          },
        },
      ],
      'plain-text',
      payment.notificationDays?.toString() || '1'
    );
  };

  const calculateNextBillingDate = (currentDate: Date, cycle: string): Date => {
    const nextDate = new Date(currentDate);
    
    switch (cycle) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    return nextDate;
  };

  // Calculate totals
  const totals = useMemo(() => {
    const totalAmount = upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const overdueAmount = upcomingPayments
      .filter(p => p.isOverdue)
      .reduce((sum, p) => sum + p.amount, 0);
    const todayAmount = upcomingPayments
      .filter(p => p.isToday)
      .reduce((sum, p) => sum + p.amount, 0);
    const tomorrowAmount = upcomingPayments
      .filter(p => p.isTomorrow)
      .reduce((sum, p) => sum + p.amount, 0);
    
    return {
      totalAmount,
      overdueAmount,
      todayAmount,
      tomorrowAmount,
      count: upcomingPayments.length,
      overdueCount: upcomingPayments.filter(p => p.isOverdue).length,
      todayCount: upcomingPayments.filter(p => p.isToday).length,
      tomorrowCount: upcomingPayments.filter(p => p.isTomorrow).length,
    };
  }, [upcomingPayments]);

  // Get items to display
  const displayItems = useMemo(() => {
    const items = showAll || expanded ? upcomingPayments : upcomingPayments.slice(0, maxItems);
    return items;
  }, [upcomingPayments, showAll, expanded, maxItems]);

  // Render right swipe actions
  const renderRightActions = (payment: UpcomingPayment) => (
    <View style={styles.swipeActions as any}>
      <TouchableOpacity
        style={[styles.swipeButton, styles.markPaidButton] as any}
        onPress={() => handleMarkPaid(payment)}
      >
        <MaterialCommunityIcons name="check" size={24} color={colors.neutral[50]} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.swipeButton, styles.snoozeButton] as any}
        onPress={() => handleSnooze(payment, 3)}
      >
        <MaterialCommunityIcons name="alarm-snooze" size={24} color={colors.neutral[50]} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.swipeButton, styles.reminderButton] as any}
        onPress={() => handleAddReminder(payment)}
      >
        <MaterialCommunityIcons name="bell" size={24} color={colors.neutral[50]} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <Loading message="Loading upcoming payments..." />
      </Card>
    );
  }

  if (upcomingPayments.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={{ alignItems: 'center', padding: 32 }}>
          <MaterialCommunityIcons name="calendar-check" size={48} color={colors.neutral[400]} />
          <RNText style={{ fontSize: 16, fontWeight: '600', marginTop: 16, color: colors.neutral[900] }}>
            No Upcoming Payments
          </RNText>
          <RNText style={{ fontSize: 14, color: colors.neutral[600], marginTop: 8, textAlign: 'center' }}>
            You don't have any payments due in the next {daysAhead} days
          </RNText>
        </View>
      </Card>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={[styles.card, compact && styles.compactCard] as any}>
        {/* Header */}
        <View style={styles.header as any}>
          <View style={styles.headerLeft as any}>
            <RNText style={styles.title}>Upcoming Payments</RNText>
            <RNText style={styles.subtitle}>
              Next {daysAhead} days • {formatAmount(totals.totalAmount)}
            </RNText>
          </View>
          
          <View style={styles.headerRight as any}>
            {totals.overdueCount > 0 && (
              <Badge
                text={`${totals.overdueCount} overdue`}
                style={styles.overdueBadge}
              />
            )}
            {totals.todayCount > 0 && (
              <Badge
                text={`${totals.todayCount} today`}
                size="small"
              />
            )}
          </View>
        </View>

        {/* Totals Summary */}
        {!compact && (
          <View style={styles.totalsSummary as any}>
            <View style={styles.totalItem as any}>
              <RNText style={styles.totalLabel}>Total Due</RNText>
              <RNText style={styles.totalValue}>
                {formatAmount(totals.totalAmount)}
              </RNText>
            </View>
            
            {totals.overdueAmount > 0 && (
              <View style={styles.totalItem as any}>
                <RNText style={[styles.totalLabel, styles.overdueLabel]}>Overdue</RNText>
                <RNText style={[styles.totalValue, styles.overdueValue]}>
                  {formatAmount(totals.overdueAmount)}
                </RNText>
              </View>
            )}
            
            {totals.todayAmount > 0 && (
              <View style={styles.totalItem as any}>
                <RNText style={[styles.totalLabel, styles.todayLabel]}>Today</RNText>
                <RNText style={[styles.totalValue, styles.todayValue]}>
                  {formatAmount(totals.todayAmount)}
                </RNText>
              </View>
            )}
          </View>
        )}

        {/* Payments List */}
        <View style={styles.paymentsList as any}>
          {displayItems.map(payment => (
            <PulsingWrapper
              key={payment.id}
              isPulsing={pulsingItems.has(payment.id)}
            >
              <Swipeable
                ref={(ref) => {
                  if (ref) {
                    swipeableRefs.set(payment.id, ref);
                  } else {
                    swipeableRefs.delete(payment.id);
                  }
                }}
                renderRightActions={() => showActions && renderRightActions(payment)}
                overshootRight={false}
                onSwipeableWillOpen={() => {
                  // Close other swipeables
                  swipeableRefs.forEach((ref, id) => {
                    if (id !== payment.id && ref) ref.close();
                  });
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.paymentItem,
                    payment.isOverdue && styles.overdueItem,
                    payment.isToday && styles.todayItem,
                    payment.isTomorrow && styles.tomorrowItem,
                  ]}
                  onPress={() => handlePaymentPress(payment)}
                  activeOpacity={0.7}
                >
                  {/* Date Badge */}
                  {/* Date Badge */}
                  <View style={styles.dateBadge as any}>
                    <RNText style={[
                      styles.dateText,
                      payment.isOverdue && styles.overdueDateText,
                      payment.isToday && styles.todayDateText,
                      payment.isTomorrow && styles.tomorrowDateText,
                    ]}>
                      {payment.relativeDate}
                    </RNText>
                    {payment.isOverdue && (
                      <MaterialCommunityIcons name="alert-circle" size={12} color={colors.error[500]} />
                    )}
                  </View>

                  {/* Payment Info */}
                  <View style={styles.paymentInfo as any}>
                    <RNText style={styles.paymentName} numberOfLines={1}>
                      {payment.name}
                    </RNText>
                    <RNText style={styles.paymentCategory}>
                      {payment.category.charAt(0).toUpperCase() + payment.category.slice(1)}
                    </RNText>
                  </View>

                  {/* Amount */}
                  <View style={styles.paymentAmount as any}>
                    <RNText style={[
                      styles.amountText,
                      payment.isOverdue && styles.overdueAmountText,
                    ]}>
                      {formatAmount(payment.amount)}
                    </RNText>
                    <RNText style={styles.billingCycle}>
                      {payment.billingCycle}
                    </RNText>
                  </View>
                  {/* Quick Actions */}
                  {showActions && (
                    <TouchableOpacity
                      style={styles.quickAction}
                      onPress={() => handleMarkPaid(payment)}
                    >
                      <MaterialCommunityIcons name="check-circle" size={24} color={colors.success[500]} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </Swipeable>
            </PulsingWrapper>
          ))}
        </View>

        {/* Footer */}
        {/* Footer */}
        {!showAll && upcomingPayments.length > maxItems && (
          <TouchableOpacity
            style={styles.footer as any}
            onPress={() => setExpanded(!expanded)}
          >
            <RNText style={styles.footerText}>
              {expanded ? 'Show Less' : `Show All ${upcomingPayments.length} Payments`}
            </RNText>
            <MaterialCommunityIcons 
              name={expanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={colors.primary[500]} 
            />
          </TouchableOpacity>
        )}
        {/* Actions */}
        {showActions && (
          <View style={styles.actions as any}>
            <Button
              title="Mark All Today as Paid"
              onPress={() => {
                const todayPayments = upcomingPayments.filter(p => p.isToday);
                todayPayments.forEach(p => handleMarkPaid(p));
              }}
              variant="outline"
              size="small"
              icon="check-all"
              disabled={totals.todayCount === 0}
            />
            
            <Button
              title="View Calendar"
              onPress={() => {}}
              variant="ghost"
              size="small"
              icon="calendar"
            />
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

// Pulsing Animation Wrapper
const PulsingWrapper: React.FC<{ isPulsing: boolean; children: React.ReactNode }> = ({ 
  isPulsing, 
  children 
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isPulsing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isPulsing, pulseAnim]);

  if (!isPulsing) {
    return <>{children}</>;
  }

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    padding: 16,
  },
  compactCard: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
  } as any,
  subtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    marginTop: 2,
  } as any,
  overdueBadge: {
    marginRight: 8,
  },
  totalsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    gap: 16,
  } as any,
  totalItem: {
    flex: 1,
    alignItems: 'center',
  } as any,
  totalLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    marginBottom: 4,
  } as any,
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
  } as any,
  overdueLabel: {
    color: colors.error[500],
  } as any,
  overdueValue: {
    color: colors.error[500],
  } as any,
  todayLabel: {
    color: colors.warning[500],
  } as any,
  todayValue: {
    color: colors.warning[500],
  } as any,
  paymentsList: {
    gap: 8,
  } as any,
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  } as any,
  overdueItem: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[200],
  } as any,
  todayItem: {
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
  } as any,
  tomorrowItem: {
    backgroundColor: colors.info[50],
    borderColor: colors.info[200],
  } as any,
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    marginRight: 12,
  } as any,
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[600],
  } as any,
  overdueDateText: {
    color: colors.error[500],
  } as any,
  todayDateText: {
    color: colors.warning[500],
  } as any,
  tomorrowDateText: {
    color: colors.info[500],
  } as any,
  paymentInfo: {
    flex: 1,
    marginRight: 12,
  } as any,
  paymentName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral[900],
    marginBottom: 2,
  } as any,
  paymentCategory: {
    fontSize: 12,
    color: colors.neutral[600],
  } as any,
  paymentAmount: {
    alignItems: 'flex-end',
    marginRight: 12,
  } as any,
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  } as any,
  overdueAmountText: {
    color: colors.error[500],
  } as any,
  billingCycle: {
    fontSize: 11,
    color: colors.neutral[600],
  } as any,
  quickAction: {
    padding: 4,
  } as any,
  swipeActions: {
    flexDirection: 'row',
    height: '100%',
  } as any,
  swipeButton: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  } as any,
  markPaidButton: {
    backgroundColor: colors.success[500],
  } as any,
  snoozeButton: {
    backgroundColor: colors.info[500],
  } as any,
  reminderButton: {
    backgroundColor: colors.primary[500],
  } as any,
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
  } as any,
  footerText: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '500',
  } as any,
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  } as any,
});

export default UpcomingPayments;
