import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {
    addDays,
    addMonths,
    addYears,
    eachDayOfInterval,
    endOfMonth,
    format,
    isFuture,
    isPast,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    subDays,
    subYears
} from 'date-fns';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types
interface DatePickerProps {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  showTimePicker?: boolean;
  showQuickDates?: boolean;
  showRecurringOptions?: boolean;
  modalMode?: boolean;
  visible?: boolean;
  onClose?: () => void;
  title?: string;
  mode?: 'date' | 'datetime' | 'time';
  dateFormat?: string;
  compactMode?: boolean;
  allowPastDates?: boolean;
  allowFutureDates?: boolean;
  highlightToday?: boolean;
  showWeekNumbers?: boolean;
  showMonthYearPicker?: boolean;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  disabledDates?: Date[];
  markedDates?: Record<string, { color: string; textColor: string }>;
  recurringPattern?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  onRecurringChange?: (pattern: string) => void;
  showPaymentHistory?: boolean;
  paymentDates?: Date[];
  animationType?: 'slide' | 'fade' | 'none';
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DAY_SIZE = 40;
const MONTH_WIDTH = SCREEN_WIDTH - 40;

const DatePicker: React.FC<DatePickerProps> = memo(
  ({
    selectedDate = new Date(),
    onSelectDate,
    minDate = subYears(new Date(), 1),
    maxDate = addYears(new Date(), 1),
    showTimePicker = true,
    showQuickDates = true,
    showRecurringOptions = false,
    modalMode = false,
    visible = false,
    onClose,
    title = 'Select Date',
    mode = 'date',
    dateFormat = 'EEE, MMM d, yyyy',
    compactMode = false,
    allowPastDates = true,
    allowFutureDates = true,
    highlightToday = true,
    showWeekNumbers = false,
    showMonthYearPicker = true,
    firstDayOfWeek = 0,
    disabledDates = [],
    markedDates = {},
    recurringPattern = 'none',
    onRecurringChange,
    showPaymentHistory = false,
    paymentDates = [],
    animationType = 'slide',
  }) => {
    const insets = useSafeAreaInsets();

    // State
    const [currentDate, setCurrentDate] = useState(selectedDate);
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
    const [selectedTime, setSelectedTime] = useState({
      hour: selectedDate.getHours(),
      minute: selectedDate.getMinutes(),
    });
    const [viewMode, setViewMode] = useState<'calendar' | 'monthYear' | 'time'>('calendar');
    const [quickDateRange, setQuickDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
    const [selectedRecurring, setSelectedRecurring] = useState(recurringPattern);

    // Animation values
    const modalTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const calendarScale = useRef(new Animated.Value(1)).current;
    const monthSlideAnim = useRef(new Animated.Value(0)).current;
    const timePickerHeight = useRef(new Animated.Value(0)).current;

    // Pan responder for month swipe
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          Animated.spring(calendarScale, {
            toValue: 0.98,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderMove: (evt, gestureState) => {
          monthSlideAnim.setValue(gestureState.dx);
        },
        onPanResponderRelease: (evt, gestureState) => {
          Animated.spring(calendarScale, {
            toValue: 1,
            useNativeDriver: true,
          }).start();

          if (Math.abs(gestureState.dx) > 50) {
            const direction = gestureState.dx > 0 ? -1 : 1;
            const newMonth = addMonths(currentMonth, direction);
            setCurrentMonth(newMonth);
            
            Animated.sequence([
              Animated.timing(monthSlideAnim, {
                toValue: direction * SCREEN_WIDTH,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(monthSlideAnim, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ]).start();
          } else {
            Animated.spring(monthSlideAnim, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      })
    ).current;

    // Quick date options
    const QUICK_DATE_OPTIONS = useMemo(() => [
      {
        id: 'today',
        label: 'Today',
        date: new Date(),
        icon: 'calendar-today',
        color: '#34C759',
      },
      {
        id: 'tomorrow',
        label: 'Tomorrow',
        date: addDays(new Date(), 1),
        icon: 'calendar-arrow-right',
        color: '#007AFF',
      },
      {
        id: 'next_week',
        label: 'Next Week',
        date: addDays(new Date(), 7),
        icon: 'calendar-week',
        color: '#5856D6',
      },
      {
        id: 'next_month',
        label: 'Next Month',
        date: addMonths(new Date(), 1),
        icon: 'calendar-month',
        color: '#FF9500',
      },
      {
        id: 'next_quarter',
        label: 'Next Quarter',
        date: addMonths(new Date(), 3),
        icon: 'calendar-text',
        color: '#FF2D55',
      },
      {
        id: 'next_year',
        label: 'Next Year',
        date: addYears(new Date(), 1),
        icon: 'calendar-star',
        color: '#AF52DE',
      },
    ], []);

    // Recurring options
    const RECURRING_OPTIONS = useMemo(() => [
      { id: 'none', label: 'No Repeat', icon: 'repeat-off', color: '#8E8E93' },
      { id: 'daily', label: 'Daily', icon: 'calendar-today', color: '#34C759' },
      { id: 'weekly', label: 'Weekly', icon: 'calendar-week', color: '#007AFF' },
      { id: 'monthly', label: 'Monthly', icon: 'calendar-month', color: '#5856D6' },
      { id: 'yearly', label: 'Yearly', icon: 'calendar-star', color: '#FF9500' },
      { id: 'custom', label: 'Custom...', icon: 'calendar-cog', color: '#FF2D55' },
    ], []);

    // Days in current month
    const monthDays = useMemo(() => {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const days = eachDayOfInterval({ start, end });

      // Add padding for previous month
      const firstDay = start.getDay();
      const prevMonthDays = firstDayOfWeek > firstDay ? 7 : firstDay;
      for (let i = 1; i < prevMonthDays; i++) {
        days.unshift(subDays(start, i));
      }

      // Add padding for next month
      const totalCells = Math.ceil(days.length / 7) * 7;
      while (days.length < totalCells) {
        days.push(addDays(end, days.length - totalCells + 1));
      }

      return days;
    }, [currentMonth, firstDayOfWeek]);

    // Weeks for rendering
    const weeks = useMemo(() => {
      const weeksArray = [];
      for (let i = 0; i < monthDays.length; i += 7) {
        weeksArray.push(monthDays.slice(i, i + 7));
      }
      return weeksArray;
    }, [monthDays]);

    // Weekday headers
    const WEEKDAYS = useMemo(() => {
      const baseDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return [...baseDays.slice(firstDayOfWeek), ...baseDays.slice(0, firstDayOfWeek)];
    }, [firstDayOfWeek]);

    // Month/year picker options
    const MONTHS = useMemo(() => [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ], []);

    const YEARS = useMemo(() => {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let i = currentYear - 10; i <= currentYear + 10; i++) {
        years.push(i);
      }
      return years;
    }, []);

    // Time picker hours
    const HOURS = useMemo(() => {
      const hours = [];
      for (let i = 0; i < 24; i++) {
        hours.push({
          value: i,
          display: i === 0 ? '12' : i > 12 ? (i - 12).toString() : i.toString(),
          period: i < 12 ? 'AM' : 'PM',
        });
      }
      return hours;
    }, []);

    const MINUTES = useMemo(() => {
      const minutes = [];
      for (let i = 0; i < 60; i += 5) {
        minutes.push(i);
      }
      return minutes;
    }, []);

    // Handle date selection
    const handleSelectDate = useCallback((date: Date) => {
      if (!allowPastDates && isPast(date) && !isToday(date)) return;
      if (!allowFutureDates && isFuture(date) && !isToday(date)) return;
      if (disabledDates.some(d => isSameDay(d, date))) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newDate = new Date(date);
      newDate.setHours(selectedTime.hour);
      newDate.setMinutes(selectedTime.minute);

      setCurrentDate(newDate);
      onSelectDate(newDate);

      if (modalMode && onClose && !showRecurringOptions) {
        setTimeout(() => onClose(), 300);
      }
    }, [allowPastDates, allowFutureDates, disabledDates, selectedTime, onSelectDate, modalMode, onClose, showRecurringOptions]);

    // Handle quick date selection
    const handleQuickDateSelect = useCallback((date: Date) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      handleSelectDate(date);
    }, [handleSelectDate]);

    // Handle time change
    const handleTimeChange = useCallback((hour: number, minute: number) => {
      setSelectedTime({ hour, minute });
      const newDate = new Date(currentDate);
      newDate.setHours(hour);
      newDate.setMinutes(minute);
      setCurrentDate(newDate);
      onSelectDate(newDate);
    }, [currentDate, onSelectDate]);

    // Handle recurring pattern change
    const handleRecurringChange = useCallback((pattern: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom') => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedRecurring(pattern as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly');
      if (onRecurringChange) {
        onRecurringChange(pattern);
      }
    }, [onRecurringChange]);

    // Toggle view mode
    const toggleViewMode = useCallback((mode: 'calendar' | 'monthYear' | 'time') => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setViewMode(mode);
    }, []);

    // Navigate months
    const navigateMonth = useCallback((direction: -1 | 1) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newMonth = addMonths(currentMonth, direction);
      setCurrentMonth(newMonth);
      
      Animated.sequence([
        Animated.timing(monthSlideAnim, {
          toValue: direction * 50,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(monthSlideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }, [currentMonth, monthSlideAnim]);

    // Animation effects
    useEffect(() => {
      if (modalMode && visible) {
        Animated.parallel([
          Animated.timing(modalTranslateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.timing(modalOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (modalMode && !visible) {
        Animated.parallel([
          Animated.timing(modalTranslateY, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.timing(modalOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [modalMode, visible, modalTranslateY, modalOpacity]);

    // Render day cell
    const renderDayCell = useCallback((date: Date, weekIndex: number, dayIndex: number) => {
      const isSelected = isSameDay(date, currentDate);
      const isCurrentMonth = isSameMonth(date, currentMonth);
      const isTodayDate = isToday(date);
      const isDisabled = disabledDates.some(d => isSameDay(d, date)) ||
        (!allowPastDates && isPast(date) && !isTodayDate) ||
        (!allowFutureDates && isFuture(date) && !isTodayDate);
      const isPaymentDate = paymentDates.some(d => isSameDay(d, date));
      const markedDate = markedDates[format(date, 'yyyy-MM-dd')];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      return (
        <TouchableOpacity
          key={`${weekIndex}-${dayIndex}`}
          style={[
            styles.dayCell,
            isSelected && styles.dayCellSelected,
            isTodayDate && highlightToday && styles.dayCellToday,
            isDisabled && styles.dayCellDisabled,
            isPaymentDate && styles.dayCellPayment,
            markedDate && { backgroundColor: markedDate.color },
            isWeekend && styles.dayCellWeekend,
          ]}
          onPress={() => !isDisabled && handleSelectDate(date)}
          disabled={isDisabled}
          activeOpacity={0.7}>
          <Animated.View style={[
            styles.dayContent,
            isSelected && { transform: [{ scale: calendarScale }] },
          ]}>
            <Text style={[
              styles.dayText,
              !isCurrentMonth && styles.dayTextOtherMonth,
              isSelected && styles.dayTextSelected,
              isTodayDate && styles.dayTextToday,
              isDisabled && styles.dayTextDisabled,
              markedDate && { color: markedDate.textColor },
              isWeekend && styles.dayTextWeekend,
            ]}>
              {date.getDate()}
            </Text>
            
            {/* Payment indicator */}
            {isPaymentDate && (
              <View style={styles.paymentIndicator}>
                <Icon name="currency-usd" size={8} color="#34C759" />
              </View>
            )}
            
            {/* Marked date indicator */}
            {markedDate && !isSelected && (
              <View style={[styles.markedIndicator, { backgroundColor: markedDate.textColor }]} />
            )}
          </Animated.View>
        </TouchableOpacity>
      );
    }, [currentDate, currentMonth, disabledDates, allowPastDates, allowFutureDates, paymentDates, markedDates, highlightToday, calendarScale, handleSelectDate]);

    // Render week row
    const renderWeek = useCallback((week: Date[], weekIndex: number) => (
      <View key={weekIndex} style={styles.weekRow}>
        {showWeekNumbers && (
          <View style={styles.weekNumberCell}>
            <Text style={styles.weekNumberText}>
              {Math.floor(weekIndex / 4) + 1}
            </Text>
          </View>
        )}
        {week.map((date, dayIndex) => renderDayCell(date, weekIndex, dayIndex))}
      </View>
    ), [renderDayCell, showWeekNumbers]);

    // Render time picker
    const renderTimePicker = useCallback(() => (
      <Animated.View style={[styles.timePicker, { height: timePickerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200],
      }) }]}>
        <View style={styles.timePickerHeader}>
          <Text style={styles.timePickerTitle}>Select Time</Text>
          <TouchableOpacity onPress={() => {
            Animated.timing(timePickerHeight, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }).start(() => setViewMode('calendar'));
          }}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.timePickerContent}>
          {/* Hour picker */}
          <ScrollView
            style={styles.timeScrollView}
            showsVerticalScrollIndicator={false}
            snapToInterval={40}>
            {HOURS.map((hour) => (
              <TouchableOpacity
                key={hour.value}
                style={[
                  styles.timeOption,
                  selectedTime.hour === hour.value && styles.timeOptionSelected,
                ]}
                onPress={() => handleTimeChange(hour.value, selectedTime.minute)}>
                <Text style={[
                  styles.timeOptionText,
                  selectedTime.hour === hour.value && styles.timeOptionTextSelected,
                ]}>
                  {hour.display}
                </Text>
                <Text style={styles.timePeriodText}>{hour.period}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Minute picker */}
          <ScrollView
            style={styles.timeScrollView}
            showsVerticalScrollIndicator={false}
            snapToInterval={40}>
            {MINUTES.map((minute) => (
              <TouchableOpacity
                key={minute}
                style={[
                  styles.timeOption,
                  selectedTime.minute === minute && styles.timeOptionSelected,
                ]}
                onPress={() => handleTimeChange(selectedTime.hour, minute)}>
                <Text style={[
                  styles.timeOptionText,
                  selectedTime.minute === minute && styles.timeOptionTextSelected,
                ]}>
                  {minute.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Time display */}
          <View style={styles.timeDisplay}>
            <Text style={styles.timeDisplayText}>
              {format(new Date().setHours(selectedTime.hour, selectedTime.minute), 'h:mm a')}
            </Text>
          </View>
        </View>
      </Animated.View>
    ), [timePickerHeight, HOURS, MINUTES, selectedTime, handleTimeChange]);

    // Render month/year picker
    const renderMonthYearPicker = useCallback(() => (
      <View style={styles.monthYearPicker}>
        <View style={styles.monthYearHeader}>
          <Text style={styles.monthYearTitle}>Select Month & Year</Text>
          <TouchableOpacity onPress={() => setViewMode('calendar')}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.monthYearGrid}>
          {MONTHS.map((month, index) => {
            const isSelected = currentMonth.getMonth() === index;
            return (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthOption,
                  isSelected && styles.monthOptionSelected,
                ]}
                onPress={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(index);
                  setCurrentMonth(newMonth);
                  setViewMode('calendar');
                }}>
                <Text style={[
                  styles.monthOptionText,
                  isSelected && styles.monthOptionTextSelected,
                ]}>
                  {month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          style={styles.yearScrollView}
          showsVerticalScrollIndicator={false}>
          {YEARS.map((year) => {
            const isSelected = currentMonth.getFullYear() === year;
            return (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearOption,
                  isSelected && styles.yearOptionSelected,
                ]}
                onPress={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setFullYear(year);
                  setCurrentMonth(newMonth);
                }}>
                <Text style={[
                  styles.yearOptionText,
                  isSelected && styles.yearOptionTextSelected,
                ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    ), [currentMonth, MONTHS, YEARS]);

    // Render quick dates
    const renderQuickDates = useCallback(() => (
      <View style={styles.quickDatesContainer}>
        <Text style={styles.quickDatesTitle}>Quick Select</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.quickDatesList}>
            {QUICK_DATE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.quickDateButton}
                onPress={() => handleQuickDateSelect(option.date)}>
                <LinearGradient
                  colors={[option.color + '20', option.color + '10']}
                  style={styles.quickDateGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <Icon name={option.icon as any} size={20} color={option.color} />
                  <Text style={[styles.quickDateText, { color: option.color }]}>
                    {option.label}
                  </Text>
                  <Text style={styles.quickDateSubtext}>
                    {format(option.date, 'MMM d')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    ), [QUICK_DATE_OPTIONS, handleQuickDateSelect]);

    // Render recurring options
    const renderRecurringOptions = useCallback(() => (
      <View style={styles.recurringContainer}>
        <Text style={styles.recurringTitle}>Repeat</Text>
        <View style={styles.recurringOptions}>
          {RECURRING_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.recurringOption,
                selectedRecurring === option.id && styles.recurringOptionSelected,
              ]}
              onPress={() => handleRecurringChange(option.id as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom')}>
              <Icon
                name={option.icon as any}
                size={20}
                color={selectedRecurring === option.id ? '#fff' : option.color}
              />
              <Text style={[
                styles.recurringOptionText,
                selectedRecurring === option.id && styles.recurringOptionTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ), [RECURRING_OPTIONS, selectedRecurring, handleRecurringChange]);

    // Render content
    const renderContent = useCallback(() => (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              {modalMode && onClose && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
              )}
              <Text style={styles.title}>{title}</Text>
            </View>
            
            {/* Selected date preview */}
            <View style={styles.selectedPreview}>
              <Text style={styles.selectedDate}>
                {format(currentDate, dateFormat)}
              </Text>
              {mode === 'datetime' && (
                <Text style={styles.selectedTime}>
                  {format(currentDate, 'h:mm a')}
                </Text>
              )}
            </View>
          </View>

          {/* Month navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth(-1)}>
              <Icon name="chevron-left" size={24} color="#007AFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.monthYearDisplay}
              onPress={() => toggleViewMode('monthYear')}>
              <Text style={styles.monthYearText}>
                {format(currentMonth, 'MMMM yyyy')}
              </Text>
              <Icon name="chevron-down" size={16} color="#007AFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth(1)}>
              <Icon name="chevron-right" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Weekday headers */}
          <View style={styles.weekdayHeaders}>
            {showWeekNumbers && (
              <View style={styles.weekdayHeader}>
                <Text style={styles.weekdayHeaderText}>Wk</Text>
              </View>
            )}
            {WEEKDAYS.map((day) => (
              <View key={day} style={styles.weekdayHeader}>
                <Text style={styles.weekdayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Calendar */}
        <Animated.View
          style={[
            styles.calendarContainer,
            { transform: [{ translateX: monthSlideAnim }] },
          ]}
          {...panResponder.panHandlers}>
          <ScrollView style={styles.calendarScroll}>
            {weeks.map(renderWeek)}
          </ScrollView>
        </Animated.View>

        {/* Quick dates */}
        {showQuickDates && !compactMode && renderQuickDates()}

        {/* Time picker toggle */}
        {showTimePicker && mode === 'datetime' && !compactMode && (
          <TouchableOpacity
            style={styles.timePickerToggle}
            onPress={() => {
              Animated.timing(timePickerHeight, {
                toValue: viewMode === 'time' ? 0 : 1,
                duration: 300,
                useNativeDriver: false,
              }).start(() => {
                setViewMode(viewMode === 'time' ? 'calendar' : 'time');
              });
            }}>
            <Icon name="clock" size={20} color="#007AFF" />
            <Text style={styles.timePickerToggleText}>
              {format(currentDate, 'h:mm a')}
            </Text>
            <Icon
              name={viewMode === 'time' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#007AFF"
            />
          </TouchableOpacity>
        )}

        {/* Time picker */}
        {viewMode === 'time' && renderTimePicker()}

        {/* Month/Year picker */}
        {viewMode === 'monthYear' && renderMonthYearPicker()}

        {/* Recurring options */}
        {showRecurringOptions && !compactMode && renderRecurringOptions()}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: '#007AFF' }]}
            onPress={() => {
              if (modalMode && onClose) onClose();
            }}>
            <Text style={styles.doneButtonText}>Select Date</Text>
          </TouchableOpacity>
        </View>
      </View>
    ), [
      insets,
      modalMode,
      onClose,
      title,
      currentDate,
      dateFormat,
      mode,
      currentMonth,
      navigateMonth,
      toggleViewMode,
      showWeekNumbers,
      WEEKDAYS,
      monthSlideAnim,
      panResponder.panHandlers,
      weeks,
      renderWeek,
      showQuickDates,
      compactMode,
      renderQuickDates,
      showTimePicker,
      viewMode,
      timePickerHeight,
      renderTimePicker,
      renderMonthYearPicker,
      showRecurringOptions,
      renderRecurringOptions,
    ]);

    // Modal wrapper
    if (modalMode) {
      return (
        <Modal
          visible={visible}
          transparent
          animationType="none"
          onRequestClose={onClose}
          statusBarTranslucent>
          <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
            {Platform.OS === 'ios' && (
              <View
                style={[styles.blurView, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
              />
            )}
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ translateY: modalTranslateY }],
                  maxHeight: SCREEN_HEIGHT * 0.9,
                },
              ]}>
              {renderContent()}
            </Animated.View>
          </Animated.View>
        </Modal>
      );
    }

    return renderContent();
  }
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
  },
  selectedPreview: {
    alignItems: 'flex-end',
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  selectedTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  monthYearDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  weekdayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  calendarContainer: {
    flex: 1,
  },
  calendarScroll: {
    flex: 1,
  },
  weekRow: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  weekNumberCell: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekNumberText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: '#007AFF',
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#34C759',
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayCellPayment: {
    borderWidth: 1,
    borderColor: '#34C75920',
  },
  dayCellWeekend: {
    backgroundColor: '#F9F9F9',
  },
  dayContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  dayTextOtherMonth: {
    color: '#8E8E93',
    opacity: 0.5,
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  dayTextToday: {
    color: '#34C759',
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: '#8E8E93',
  },
  dayTextWeekend: {
    color: '#FF3B30',
  },
  paymentIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  markedIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  quickDatesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  quickDatesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  quickDatesList: {
    flexDirection: 'row',
    gap: 12,
  },
  quickDateButton: {
    width: 100,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickDateGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  quickDateText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  quickDateSubtext: {
    fontSize: 12,
    color: '#8E8E93',
  },
  timePickerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    gap: 8,
  },
  timePickerToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  timePicker: {
    overflow: 'hidden',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  timePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  timePickerContent: {
    flexDirection: 'row',
    height: 150,
  },
  timeScrollView: {
    flex: 1,
  },
  timeOption: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: '#007AFF20',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#000',
  },
  timeOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '700',
  },
  timePeriodText: {
    fontSize: 10,
    color: '#8E8E93',
  },
  timeDisplay: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#F2F2F7',
  },
  timeDisplayText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  monthYearPicker: {
    flex: 1,
    paddingHorizontal: 20,
  },
  monthYearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  monthYearTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  monthYearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  monthOption: {
    width: '25%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  monthOptionSelected: {
    backgroundColor: '#007AFF',
  },
  monthOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  monthOptionTextSelected: {
    color: '#FFFFFF',
  },
  yearScrollView: {
    marginTop: 12,
    maxHeight: 200,
  },
  yearOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: '#F2F2F7',
  },
  yearOptionSelected: {
    backgroundColor: '#007AFF',
  },
  yearOptionText: {
    fontSize: 16,
    color: '#000',
  },
  yearOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  recurringContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  recurringTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  recurringOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recurringOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    gap: 6,
  },
  recurringOptionSelected: {
    backgroundColor: '#007AFF',
  },
  recurringOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  recurringOptionTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
