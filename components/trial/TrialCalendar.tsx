import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import React, { memo, useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types
import Trial from '@models/Trial';

// Hooks
import useTheme from '@hooks/useTheme';

interface TrialCalendarProps {
  trials: Trial[];
  onTrialPress?: (trial: Trial) => void;
  onDatePress?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  loading?: boolean;
  highlightStatus?: boolean;
  compactMode?: boolean;
}

interface DayData {
  date: Date;
  dateString: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  trials: Trial[];
  hasEvents: boolean;
  status: 'active' | 'expiring' | 'expired' | 'converted' | 'none';
}

const TrialCalendar: React.FC<TrialCalendarProps> = memo(
  ({
    trials,
    onTrialPress,
    onDatePress,
    onMonthChange,
    loading = false,
    highlightStatus = true,
    compactMode = false,
  }) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Calendar data
    const calendarData = useMemo(() => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Get first day of month and number of days
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      // Get days from previous month
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      const previousMonthDays = [];
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i);
        previousMonthDays.push(date);
      }

      // Get days of current month
      const currentMonthDays = [];
      for (let i = 1; i <= daysInMonth; i++) {
        currentMonthDays.push(new Date(year, month, i));
      }

      // Get days from next month
      const totalCells = previousMonthDays.length + currentMonthDays.length;
      const remainingCells = 42 - totalCells; // 6 rows * 7 days
      const nextMonthDays = [];
      for (let i = 1; i <= remainingCells; i++) {
        nextMonthDays.push(new Date(year, month + 1, i));
      }

      const allDays = [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];

      // Map trials to dates
      const now = new Date();
      const trialsPerDate = new Map<string, Trial[]>();

      trials.forEach((trial) => {
        const startDate = new Date(trial.startDate);
        const endDate = new Date(trial.endDate);

        // Add trial to all dates it spans
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          const dateString = d.toISOString().split('T')[0];
          if (!trialsPerDate.has(dateString)) {
            trialsPerDate.set(dateString, []);
          }
          trialsPerDate.get(dateString)!.push(trial);
        }
      });

      // Create day data
      const dayDataList: DayData[] = allDays.map((date) => {
        const dateString = date.toISOString().split('T')[0];
        const trialsList = trialsPerDate.get(dateString) || [];
        const isCurrentMonth = date.getMonth() === month;
        const isToday =
          date.toDateString() === new Date().toDateString();

        // Determine status
        let status: 'active' | 'expiring' | 'expired' | 'converted' | 'none' =
          'none';

        if (trialsList.length > 0) {
          const activeTrials = trialsList.filter((t) => t.status === 'active');
          const convertedTrials = trialsList.filter((t) => t.status === 'converted');

          if (activeTrials.length > 0) {
            // Check if expiring soon
            const expiringTrials = activeTrials.filter((t) => {
              const endDate = new Date(t.endDate);
              const daysUntilEnd = Math.ceil(
                (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );
              return daysUntilEnd <= 3 && daysUntilEnd > 0;
            });

            if (expiringTrials.length > 0) {
              status = 'expiring';
            } else {
              status = 'active';
            }
          } else if (convertedTrials.length > 0) {
            status = 'converted';
          } else {
            status = 'expired';
          }
        }

        return {
          date,
          dateString,
          dayOfMonth: date.getDate(),
          isCurrentMonth,
          isToday,
          trials: trialsList,
          hasEvents: trialsList.length > 0,
          status,
        };
      });

      return dayDataList;
    }, [currentDate, trials]);

    // Get status color
    const getStatusColor = useCallback((status: string): string => {
      switch (status) {
        case 'active':
          return '#4CAF50';
        case 'expiring':
          return '#FF9800';
        case 'expired':
          return '#F44336';
        case 'converted':
          return '#2196F3';
        default:
          return theme.theme.colors.textSecondary;
      }
    }, [theme.theme.colors.textSecondary]);

    // Navigate to previous month
    const handlePreviousMonth = useCallback(() => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setCurrentDate(newDate);
      if (onMonthChange) {
        onMonthChange(newDate);
      }
    }, [currentDate, onMonthChange]);

    // Navigate to next month
    const handleNextMonth = useCallback(() => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setCurrentDate(newDate);
      if (onMonthChange) {
        onMonthChange(newDate);
      }
    }, [currentDate, onMonthChange]);

    // Go to today
    const handleToday = useCallback(() => {
      const today = new Date();
      setCurrentDate(today);
      setSelectedDate(today);
      if (onMonthChange) {
        onMonthChange(today);
      }
      if (onDatePress) {
        onDatePress(today);
      }
    }, [onMonthChange, onDatePress]);

    // Handle day press
    const handleDayPress = useCallback(
      (day: DayData) => {
        setSelectedDate(day.date);
        if (onDatePress) {
          onDatePress(day.date);
        }
      },
      [onDatePress]
    );

    // Render day cell
    const renderDayCell = useCallback(
      (day: DayData) => {
        const isSelected = selectedDate?.toDateString() === day.date.toDateString();
        const statusColor = getStatusColor(day.status);

        return (
          <TouchableOpacity
            key={day.dateString}
            style={[
              styles.dayCell,
              !day.isCurrentMonth && styles.dayCellOtherMonth,
              isSelected && styles.dayCellSelected,
              day.isToday && styles.dayCellToday,
            ]}
            onPress={() => handleDayPress(day)}
          >
            <View
              style={[
                styles.dayContent,
                isSelected && { backgroundColor: theme.theme.colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  !day.isCurrentMonth && styles.dayNumberOtherMonth,
                  isSelected && styles.dayNumberSelected,
                  day.isToday && styles.dayNumberToday,
                ]}
              >
                {day.dayOfMonth}
              </Text>

              {/* Status indicator */}
              {day.hasEvents && highlightStatus && (
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: statusColor },
                  ]}
                />
              )}

              {/* Trial count */}
              {day.trials.length > 0 && (
                <Text
                  style={[
                    styles.trialCount,
                    isSelected && styles.trialCountSelected,
                  ]}
                >
                  {day.trials.length}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      },
      [
        selectedDate,
        getStatusColor,
        theme.theme.colors.primary,
        highlightStatus,
      ]
    );

    // Selected date trials
    const selectedDateTrials = useMemo(() => {
      if (!selectedDate) return [];

      const dateString = selectedDate.toISOString().split('T')[0];
      return (
        calendarData.find((day) => day.dateString === dateString)?.trials || []
      );
    }, [selectedDate, calendarData]);

    const monthName = currentDate.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });

    if (compactMode) {
      return (
        <View style={styles.compactContainer}>
          {/* Mini Calendar Header */}
          <View style={styles.compactHeader}>
            <Text style={[styles.compactMonthTitle, { color: theme.theme.colors.text }]}>
              {monthName}
            </Text>
            <View style={styles.compactNavigation}>
              <TouchableOpacity onPress={handlePreviousMonth}>
                <Icon name="chevron-left" size={20} color={theme.theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleToday}>
                <Icon name="calendar-today" size={20} color={theme.theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNextMonth}>
                <Icon name="chevron-right" size={20} color={theme.theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Compact Grid */}
          <View style={styles.compactGrid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={[styles.weekdayCompact, { color: theme.theme.colors.textSecondary }]}>
                {day.charAt(0)}
              </Text>
            ))}
            {calendarData.map((day) => renderDayCell(day))}
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={handlePreviousMonth}
              style={styles.navigationButton}
            >
              <Icon name="chevron-left" size={24} color={theme.theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.monthContainer}>
              <Text style={[styles.monthTitle, { color: theme.theme.colors.text }]}>
                {monthName}
              </Text>
            </View>

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                onPress={handleToday}
                style={styles.todayButton}
              >
                <Icon name="calendar-today" size={20} color={theme.theme.colors.primary} />
                <Text style={[styles.todayButtonText, { color: theme.theme.colors.primary }]}>
                  Today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNextMonth}
                style={styles.navigationButton}
              >
                <Icon name="chevron-right" size={24} color={theme.theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={[styles.legendText, { color: theme.theme.colors.textSecondary }]}>
                Active
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
              <Text style={[styles.legendText, { color: theme.theme.colors.textSecondary }]}>
                Expiring
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
              <Text style={[styles.legendText, { color: theme.theme.colors.textSecondary }]}>
                Converted
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={[styles.legendText, { color: theme.theme.colors.textSecondary }]}>
                Expired
              </Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {/* Weekday Headers */}
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
              (day) => (
                <View key={`header-${day}`} style={styles.weekdayHeader}>
                  <Text
                    style={[
                      styles.weekdayText,
                      { color: theme.theme.colors.textSecondary },
                    ]}
                  >
                    {day.substring(0, 3)}
                  </Text>
                </View>
              )
            )}

            {/* Day Cells */}
            {calendarData.map((day) => renderDayCell(day))}
          </View>

          {/* Selected Date Details */}
          {selectedDate && selectedDateTrials.length > 0 && (
            <View style={[styles.detailsContainer, { backgroundColor: theme.theme.colors.card }]}>
              <View style={styles.detailsHeader}>
                <Text style={[styles.detailsTitle, { color: theme.theme.colors.text }]}>
                  {selectedDate.toLocaleDateString('default', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text
                  style={[
                    styles.detailsCount,
                    { color: theme.theme.colors.textSecondary },
                  ]}
                >
                  {selectedDateTrials.length} trial
                  {selectedDateTrials.length > 1 ? 's' : ''}
                </Text>
              </View>

              <FlatList
                data={selectedDateTrials}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.trialItem, { borderLeftColor: getStatusColor(item.status) }]}
                    onPress={() => {
                      if (onTrialPress) {
                        onTrialPress(item);
                      }
                    }}
                  >
                    <View style={styles.trialItemContent}>
                      <Text
                        style={[
                          styles.trialItemTitle,
                          { color: theme.theme.colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {item.subscriptionName}
                      </Text>
                      <View style={styles.trialItemMeta}>
                        <View style={styles.trialItemMetaItem}>
                          <Icon
                            name="calendar-clock"
                            size={12}
                            color={theme.theme.colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.trialItemMetaText,
                              { color: theme.theme.colors.textSecondary },
                            ]}
                          >
                            {item.daysRemaining}d left
                          </Text>
                        </View>
                        <View style={styles.trialItemMetaItem}>
                          <Icon
                            name="check-circle"
                            size={12}
                            color={theme.theme.colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.trialItemMetaText,
                              {
                                color: getStatusColor(item.status),
                              },
                            ]}
                          >
                            {item.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Icon
                      name="chevron-right"
                      size={18}
                      color={theme.theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
              />
            </View>
          )}

          {selectedDate && selectedDateTrials.length === 0 && (
            <View style={styles.emptyDetailsContainer}>
              <Icon
                name="calendar-blank"
                size={32}
                color={theme.theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.emptyDetailsText,
                  { color: theme.theme.colors.textSecondary },
                ]}
              >
                No trials on this date
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
);

TrialCalendar.displayName = 'TrialCalendar';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navigationButton: {
    padding: 8,
  },
  monthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    fontSize: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  weekdayHeader: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayCellSelected: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 8,
  },
  dayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    overflow: 'hidden',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  dayNumberOtherMonth: {
    color: 'rgba(0, 0, 0, 0.3)',
  },
  dayNumberSelected: {
    color: '#fff',
  },
  dayNumberToday: {
    color: '#2196F3',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  trialCount: {
    position: 'absolute',
    bottom: 1,
    right: 2,
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
  },
  trialCountSelected: {
    color: '#fff',
  },
  detailsContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsHeader: {
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailsCount: {
    fontSize: 12,
  },
  trialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  trialItemContent: {
    flex: 1,
    marginRight: 8,
  },
  trialItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  trialItemMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  trialItemMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trialItemMetaText: {
    fontSize: 11,
  },
  emptyDetailsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyDetailsText: {
    fontSize: 14,
    marginTop: 8,
  },
  compactContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactMonthTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  compactNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekdayCompact: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default TrialCalendar;
