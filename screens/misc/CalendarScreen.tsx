import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, startOfMonth, subMonths } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    LinearTransition,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import EmptyState from '@components/common/EmptyState';
import { useTheme } from '@context/ThemeContext';
import { useCurrency } from '@hooks/useCurrency';
import { useSubscriptions } from '@hooks/useSubscriptions';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

interface CalendarEvent {
  id: string;
  date: Date;
  type: 'renewal' | 'upcoming' | 'overdue';
  subscriptionId: string;
  subscriptionName: string;
  amount: number;
  currency: string;
  status: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EVENT_COLORS = {
  renewal: '#10B981',
  upcoming: '#3B82F6',
  overdue: '#EF4444',
};

const CalendarScreen: React.FC = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const { subscriptions } = useSubscriptions();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    monthNavigation: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    monthButton: {
      padding: 8,
    },
    monthText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      minWidth: 180,
      textAlign: 'center',
    },
    weekdayContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    weekday: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: colors.lightText,
      textAlign: 'center',
    },
    calendarGrid: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    calendarRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8,
    },
    dayButton: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
    },
    dayButtonSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    dayButtonToday: {
      borderColor: colors.accent,
      borderWidth: 2,
    },
    dayButtonOtherMonth: {
      opacity: 0.4,
    },
    dayText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    dayTextSelected: {
      color: '#ffffff',
    },
    dayTextOtherMonth: {
      color: colors.lightText,
    },
    eventIndicator: {
      position: 'absolute',
      bottom: 4,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 3,
    },
    eventDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 11,
      color: colors.lightText,
      fontWeight: '500',
    },
    eventList: {
      flex: 1,
      paddingHorizontal: 16,
    },
    eventCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginVertical: 8,
      borderLeftWidth: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    eventCardRenewal: {
      borderLeftColor: EVENT_COLORS.renewal,
    },
    eventCardUpcoming: {
      borderLeftColor: EVENT_COLORS.upcoming,
    },
    eventCardOverdue: {
      borderLeftColor: EVENT_COLORS.overdue,
    },
    eventTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    eventDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    eventAmount: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.accent,
    },
    eventStatus: {
      fontSize: 11,
      fontWeight: '500',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: colors.background,
      color: colors.lightText,
    },
    eventMeta: {
      fontSize: 12,
      color: colors.lightText,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 40,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accent,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 11,
      color: colors.lightText,
      fontWeight: '500',
    },
  });

  // Calculate calendar events from subscriptions
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    const today = new Date();

    subscriptions.forEach((sub) => {
      if (sub.status !== 'active') return;

      // Calculate next billing date
      let nextBillingDate = new Date(sub.billingDate);
      
      // Add months based on billing cycle to get dates in current month view
      for (let i = 0; i < 12; i++) {
        if (isSameMonth(nextBillingDate, currentDate)) {
          const daysUntil = Math.floor((nextBillingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let eventType: 'renewal' | 'upcoming' | 'overdue' = 'upcoming';
          if (daysUntil < 0) eventType = 'overdue';
          else if (daysUntil === 0) eventType = 'renewal';

          events.push({
            id: `${sub.id}-${i}`,
            date: new Date(nextBillingDate),
            type: eventType,
            subscriptionId: sub.id,
            subscriptionName: sub.name,
            amount: sub.amount,
            currency: sub.currency || 'USD',
            status: sub.status,
          });
        }

        // Calculate next billing date based on cycle
        const nextDate = new Date(nextBillingDate);
        switch (sub.billingCycle) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'biweekly':
            nextDate.setDate(nextDate.getDate() + 14);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case 'quarterly':
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
          case 'semiannually':
            nextDate.setMonth(nextDate.getMonth() + 6);
            break;
          case 'annually':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }
        nextBillingDate = nextDate;
      }
    });

    return events;
  }, [subscriptions, currentDate]);

  // Get all days in current month
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    // Add padding days from previous/next month
    const firstDay = start.getDay();
    const lastDay = end.getDay();
    
    const paddedDays = [
      ...Array(firstDay).fill(null).map((_, i) => subMonths(start, 1).getDate() - (firstDay - 1 - i)).map(d => new Date(subMonths(start, 1).getFullYear(), subMonths(start, 1).getMonth(), d)),
      ...days,
      ...Array(6 - lastDay).fill(null).map((_, i) => new Date(addMonths(end, 1).getFullYear(), addMonths(end, 1).getMonth(), i + 1)),
    ];

    return paddedDays;
  }, [currentDate]);

  // Get events for specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return calendarEvents.filter(event => isSameDay(event.date, date));
  };

  // Get stats for selected date
  const selectedDateStats = useMemo(() => {
    if (!selectedDate) return null;

    const events = getEventsForDate(selectedDate);
    const totalAmount = events.reduce((sum, event) => sum + event.amount, 0);
    const renewalCount = events.filter(e => e.type === 'renewal').length;
    const overdueCount = events.filter(e => e.type === 'overdue').length;

    return {
      eventCount: events.length,
      totalAmount,
      renewalCount,
      overdueCount,
    };
  }, [selectedDate, calendarEvents]);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const EventCard: React.FC<{ event: CalendarEvent; index: number }> = ({ event, index }) => (
    <AnimatedView
      entering={FadeInDown.delay(100 * index)}
      style={[
        styles.eventCard,
        event.type === 'renewal' && styles.eventCardRenewal,
        event.type === 'upcoming' && styles.eventCardUpcoming,
        event.type === 'overdue' && styles.eventCardOverdue,
      ]}
    >
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle}>{event.subscriptionName}</Text>
        <Text style={styles.eventAmount}>
          {formatAmount(event.amount, event.currency)}
        </Text>
      </View>
      <View style={[styles.eventDetails, { marginBottom: 0 }]}>
        <Text style={styles.eventMeta}>
          {format(event.date, 'MMMM d, yyyy')}
        </Text>
        <Text
          style={[
            styles.eventStatus,
            {
              color:
                event.type === 'renewal'
                  ? EVENT_COLORS.renewal
                  : event.type === 'upcoming'
                  ? EVENT_COLORS.upcoming
                  : EVENT_COLORS.overdue,
            },
          ]}
        >
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
        </Text>
      </View>
    </AnimatedView>
  );

  const DayCell: React.FC<{ date: Date; index: number }> = ({ date, index }) => {
    const isCurrentMonth = isSameMonth(date, currentDate);
    const isToday = isSameDay(date, new Date());
    const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
    const events = getEventsForDate(date);
    const hasEvents = events.length > 0;

    return (
      <AnimatedTouchable
        entering={FadeInDown.delay(index * 20)}
        activeOpacity={0.7}
        onPress={() => setSelectedDate(date)}
        style={[
          styles.dayButton,
          !isCurrentMonth && styles.dayButtonOtherMonth,
          isSelected && styles.dayButtonSelected,
          isToday && !isSelected && styles.dayButtonToday,
        ]}
      >
        <Text
          style={[
            styles.dayText,
            !isCurrentMonth && styles.dayTextOtherMonth,
            isSelected && styles.dayTextSelected,
          ]}
        >
          {date.getDate()}
        </Text>
        {hasEvents && (
          <View style={styles.eventIndicator}>
            {events.slice(0, 3).map((event, i) => (
              <View
                key={`dot-${i}`}
                style={[
                  styles.eventDot,
                  {
                    backgroundColor:
                      event.type === 'renewal'
                        ? EVENT_COLORS.renewal
                        : event.type === 'upcoming'
                        ? EVENT_COLORS.upcoming
                        : EVENT_COLORS.overdue,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </AnimatedTouchable>
    );
  };

  const calendarRows = [];
  for (let i = 0; i < monthDays.length; i += 7) {
    calendarRows.push(monthDays.slice(i, i + 7));
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <AnimatedView entering={FadeIn} style={styles.header}>
        <AnimatedTouchable activeOpacity={0.7} onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color={colors.accent} />
        </AnimatedTouchable>
        <Text style={styles.headerTitle}>Billing Calendar</Text>
        <AnimatedTouchable activeOpacity={0.7} onPress={handleToday}>
          <Icon name="calendar-today" size={24} color={colors.accent} />
        </AnimatedTouchable>
      </AnimatedView>

      {/* Month Navigation */}
      <AnimatedView entering={FadeInDown.delay(100)} style={styles.monthNavigation}>
        <TouchableOpacity activeOpacity={0.7} onPress={handlePreviousMonth} style={styles.monthButton}>
          <Icon name="chevron-left" size={24} color={colors.accent} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{format(currentDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={handleNextMonth} style={styles.monthButton}>
          <Icon name="chevron-right" size={24} color={colors.accent} />
        </TouchableOpacity>
      </AnimatedView>

      {/* Weekday Labels */}
      <AnimatedView entering={FadeInDown.delay(150)} style={styles.weekdayContainer}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </AnimatedView>

      {/* Calendar Grid */}
      <AnimatedView entering={FadeInDown.delay(200)} style={styles.calendarGrid}>
        {calendarRows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.calendarRow}>
            {row.map((date, dayIndex) => (
              <DayCell key={`day-${rowIndex}-${dayIndex}`} date={date} index={rowIndex * 7 + dayIndex} />
            ))}
          </View>
        ))}
      </AnimatedView>

      {/* Legend */}
      <AnimatedView entering={FadeInDown.delay(250)} style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: EVENT_COLORS.renewal }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: EVENT_COLORS.upcoming }]} />
          <Text style={styles.legendText}>Upcoming</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: EVENT_COLORS.overdue }]} />
          <Text style={styles.legendText}>Overdue</Text>
        </View>
      </AnimatedView>

      {/* Stats for Selected Date */}
      {selectedDate && selectedDateStats && (
        <AnimatedView entering={FadeInDown.delay(300)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{selectedDateStats.eventCount}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{selectedDateStats.renewalCount}</Text>
            <Text style={styles.statLabel}>Renewals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{selectedDateStats.overdueCount}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </AnimatedView>
      )}

      {/* Event List */}
      {selectedDate ? (
        selectedEvents.length > 0 ? (
          <Animated.FlatList
            data={selectedEvents}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => <EventCard event={item} index={index} />}
            contentContainerStyle={styles.eventList}
            scrollEventThrottle={16}
            itemLayoutAnimation={LinearTransition}
            ListHeaderComponent={
              <AnimatedView entering={FadeIn}>
                <Text style={[styles.headerTitle, { paddingVertical: 12 }]}>
                  {format(selectedDate, 'EEEE, MMMM d')}
                </Text>
              </AnimatedView>
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <EmptyState
              icon="calendar-blank"
              title="No Events"
              message="No subscriptions due on this date"
            />
          </View>
        )
      ) : (
        <View style={styles.emptyState}>
          <EmptyState
            icon="calendar-search"
            title="Select a Date"
            message="Tap a date to view subscription renewals"
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default CalendarScreen;
