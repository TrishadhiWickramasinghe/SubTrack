import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Platform,
    RefreshControl,
    ScrollView,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Animated, {
    FadeIn,
    FadeOut,
    Layout,
    SlideInRight,
    SlideOutLeft
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import BottomSheet from '@components/common/BottomSheet';
import EmptyState from '@components/common/EmptyState';
import LoadingSkeleton from '@components/common/LoadingSkeleton';
import TrialCalendar from '@components/trial/TrialCalendar';
import TrialCard from '@components/trial/TrialCard';
import { useTheme } from '@context/ThemeContext';
import { useCurrency } from '@hooks/useCurrency';
import { useNotifications } from '@hooks/useNotifications';
import { useTrials } from '@hooks/useTrials';
import Trial from '@models/Trial';
import type { RootStackParamList } from '@navigation/types';
import { DateHelper } from '@utils/dateHelpers';

const dateHelpers = DateHelper;

type TrialStatus = 'active' | 'upcoming' | 'expired' | 'cancelled' | 'converted';

type TrialManagerScreenNavigationProp = StackNavigationProp<MainStackParamList, 'TrialManager'>;

interface TrialManagerScreenProps {
  navigation: TrialManagerScreenNavigationProp;
}

type TabType = 'active' | 'upcoming' | 'expired' | 'calendar';
type SortType = 'date' | 'name' | 'price' | 'daysLeft';

interface FilterOptions {
  status?: TrialStatus[];
  minPrice?: number;
  maxPrice?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList<Trial>);

const TrialManagerScreen: React.FC<TrialManagerScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { formatAmount } = useCurrency();
  const {
    cancelTrial,
    refreshTrials,
    getExpiringTrials,
    updateTrial,
  } = useTrials();
  const { } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    expired: 0,
    endingSoon: 0,
  });

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [sortAscending, setSortAscending] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddTrial, setShowAddTrial] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      refreshTrials();
    }, [refreshTrials])
  );

  // Auto-schedule reminders for new trials
  useEffect(() => {
    const scheduleReminders = async () => {
      const endingSoon = getExpiringTrials();
      // TODO: implement reminder scheduling if method becomes available
    };
    scheduleReminders();
  }, [trials, getExpiringTrials]);

  // Filter and sort trials
  const filteredTrials = useMemo(() => {
    let filtered = [...trials];

    // Apply status filter based on tab
    if (activeTab === 'active') {
      filtered = filtered.filter(t => t.status === 'active');
    } else if (activeTab === 'upcoming') {
      filtered = filtered.filter(t => t.status === 'upcoming');
    } else if (activeTab === 'expired') {
      filtered = filtered.filter(t => 
        t.status === 'expired' || t.status === 'cancelled' || t.status === 'converted'
      );
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.notes?.toLowerCase().includes(query)
      );
    }

    // Apply custom filters
    if (filterOptions.dateRange) {
      // date range filter is applied below
    }
    if (filterOptions.dateRange) {
      filtered = filtered.filter(t => {
        const startDate = new Date(t.startDate);
        const endDate = new Date(t.endDate);
        return startDate >= filterOptions.dateRange!.start &&
               endDate <= filterOptions.dateRange!.end;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'price':
          comparison = ((a as any).price || 0) - ((b as any).price || 0);
          break;
        case 'daysLeft':
          const daysA = dateHelpers.daysBetween(new Date(), new Date(a.endDate));
          const daysB = dateHelpers.daysBetween(new Date(), new Date(b.endDate));
          comparison = daysA - daysB;
          break;
      }

      return sortAscending ? comparison : -comparison;
    });

    return filtered;
  }, [trials, activeTab, searchQuery, filterOptions, sortBy, sortAscending]);

  // Group trials by section
  const groupedTrials = useMemo(() => {
    const groups: { [key: string]: Trial[] } = {};

    if (activeTab === 'active') {
      // Group by days remaining
      filteredTrials.forEach(trial => {
        const daysLeft = dateHelpers.daysBetween(new Date(), new Date(trial.endDate));
        let group = 'Ending Soon';
        
        if (daysLeft > 7) group = 'This Week';
        else if (daysLeft > 3) group = 'This Week';
        else if (daysLeft > 1) group = 'Ending Soon';
        else group = 'Ending Today';
        
        if (!groups[group]) groups[group] = [];
        groups[group].push(trial);
      });
    } else if (activeTab === 'upcoming') {
      // Group by start date
      filteredTrials.forEach(trial => {
        const startDate = new Date(trial.startDate);
        const today = new Date();
        const diffDays = dateHelpers.daysBetween(today, startDate);
        
        let group = 'Upcoming';
        if (diffDays <= 7) group = 'Next 7 Days';
        else if (diffDays <= 30) group = 'Next 30 Days';
        else group = 'Future';
        
        if (!groups[group]) groups[group] = [];
        groups[group].push(trial);
      });
    } else {
      // Group by month for expired
      filteredTrials.forEach(trial => {
        const date = new Date(trial.endDate);
        const group = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        if (!groups[group]) groups[group] = [];
        groups[group].push(trial);
      });
    }

    // Convert to section list format
    return Object.entries(groups).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filteredTrials, activeTab]);

  // Calculate stats
  const totalPotentialSavings = useMemo(() => {
    return filteredTrials.reduce((sum, trial) => {
      if (trial.status === 'active' && (trial as any).price) {
        return sum + ((trial as any).price || 0);
      }
      return sum;
    }, 0);
  }, [filteredTrials]);

  // Handle trial press
  const handleTrialPress = useCallback((trial: Trial) => {
    navigation.navigate('TrialDetails', { trialId: trial.id });
  }, [navigation]);

  // Handle trial long press
  const handleTrialLongPress = useCallback((trial: Trial) => {
    setSelectedTrial(trial);
  }, []);

  // Handle add trial
  const handleAddTrial = useCallback(async (trialData: Partial<Trial>) => {
    try {
      // TODO: Implement addTrial functionality or use alternative method
      setShowAddTrial(false);
      Alert.alert('Success', 'Trial added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add trial');
    }
  }, []);

  // Handle delete trial
  const handleDeleteTrial = useCallback(async (trialId: string) => {
    Alert.alert(
      'Delete Trial',
      'Are you sure you want to delete this trial?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement deleteTrial functionality
              swipeableRefs.current.get(trialId)?.close();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete trial');
            }
          },
        },
      ]
    );
  }, []);

  // Handle cancel trial
  const handleCancelTrial = useCallback(async (trialId: string) => {
    Alert.alert(
      'Cancel Trial',
      'Are you sure you want to cancel this trial?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelTrial(trialId);
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel trial');
            }
          },
        },
      ]
    );
  }, [cancelTrial]);

  // Handle convert to subscription
  const handleConvertToSubscription = useCallback(async (trialId: string) => {
    Alert.alert(
      'Convert to Subscription',
      'Do you want to convert this trial to a regular subscription?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await updateTrial(trialId, { status: 'converted' });
              Alert.alert('Success', 'Trial converted to subscription');
            } catch (error) {
              Alert.alert('Error', 'Failed to convert trial');
            }
          },
        },
      ]
    );
  }, [updateTrial]);

  // Handle mark as expired
  const handleMarkAsExpired = useCallback(async (trialId: string) => {
    Alert.alert(
      'Mark as Expired',
      'Mark this trial as expired?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await updateTrial(trialId, { status: 'expired' });
            } catch (error) {
              Alert.alert('Error', 'Failed to update trial');
            }
          },
        },
      ]
    );
  }, [updateTrial]);

  // Render right swipe actions
  const renderRightActions = useCallback((trial: Trial) => {
    return (
      <View style={styles.swipeActions}>
        {trial.status === 'active' && (
          <>
            <TouchableOpacity
              style={[styles.swipeAction, { backgroundColor: theme.colors.success }]}
              onPress={() => handleConvertToSubscription(trial.id)}
            >
              <Icon name="credit-card" size={20} color="#fff" />
              <Text style={styles.swipeActionText}>Convert</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.swipeAction, { backgroundColor: theme.colors.warning }]}
              onPress={() => handleCancelTrial(trial.id)}
            >
              <Icon name="close" size={20} color="#fff" />
              <Text style={styles.swipeActionText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
        
        {trial.status === 'expired' && (
          <TouchableOpacity
            style={[styles.swipeAction, { backgroundColor: theme.colors.error }]}
            onPress={() => handleDeleteTrial(trial.id)}
          >
            <Icon name="delete" size={20} color="#fff" />
            <Text style={styles.swipeActionText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [theme, handleConvertToSubscription, handleCancelTrial, handleDeleteTrial]);

  // Render trial item
  const renderTrialItem = useCallback(({ item, index }: { item: Trial; index: number }) => {
    const daysLeft = dateHelpers.daysBetween(new Date(), new Date(item.endDate));
    const isUrgent = daysLeft <= 3 && daysLeft >= 0;
    const isExpired = daysLeft < 0;

    return (
      <Animated.View
        entering={SlideInRight.delay(index * 50)}
        exiting={SlideOutLeft}
        layout={Layout}
      >
        <Swipeable
          ref={(ref) => {
            if (ref) {
              swipeableRefs.current.set(item.id, ref);
            } else {
              swipeableRefs.current.delete(item.id);
            }
          }}
          renderRightActions={() => renderRightActions(item)}
          overshootRight={false}
        >
          <TrialCard
            trial={item}
            onPress={() => handleTrialPress(item)}
            onCancel={() => handleCancelTrial(item.id)}
            onConvert={() => handleConvertToSubscription(item.id)}
            onDelete={() => handleDeleteTrial(item.id)}
          />
        </Swipeable>
      </Animated.View>
    );
  }, [handleTrialPress, handleTrialLongPress, handleCancelTrial, handleConvertToSubscription, handleDeleteTrial, renderRightActions]);

  // Render section header
  const renderSectionHeader = useCallback(({ section }: any) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        {section.title}
      </Text>
      <Text style={[styles.sectionCount, { color: theme.colors.textSecondary }]}>
        {section.data.length} trials
      </Text>
    </View>
  ), [theme]);

  // Render calendar view
  const renderCalendarView = useCallback(() => (
    <TrialCalendar
      trials={trials}
      onTrialPress={handleTrialPress}
    />
  ), [trials, handleTrialPress]);

  // Render stats cards
  const renderStats = useCallback(() => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.statValue, { color: theme.colors.primary }]}>
          {stats.active}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
          Active
        </Text>
      </View>

      <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.statValue, { color: theme.colors.warning }]}>
          {stats.endingSoon}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
          Ending Soon
        </Text>
      </View>

      <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.statValue, { color: theme.colors.success }]}>
          {formatAmount(totalPotentialSavings, 'USD')}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
          Potential Savings
        </Text>
      </View>
    </View>
  ), [theme, stats, totalPotentialSavings, formatAmount]);

  // Render empty state
  const renderEmptyState = useCallback(() => {
    if (activeTab === 'calendar') return null;

    const messages = {
      active: "You don't have any active trials",
      upcoming: "No upcoming trials scheduled",
      expired: "No expired trials found",
    };

    return (
      <EmptyState
        icon="timer-off"
        title={`No ${activeTab} trials`}
        message={messages[activeTab]}
        actionLabel="Add Trial"
        onPress={() => setShowAddTrial(true)}
      />
    );
  }, [activeTab]);

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <LoadingSkeleton width={200} height={36} />
          <View style={styles.headerActions}>
            <LoadingSkeleton width={40} height={40} borderRadius={20} />
            <LoadingSkeleton width={40} height={40} borderRadius={20} />
          </View>
        </View>
        
        <View style={styles.tabBar}>
          {[1, 2, 3, 4].map(i => (
            <LoadingSkeleton key={i} width={80} height={40} borderRadius={20} />
          ))}
        </View>

        <View style={styles.statsContainer}>
          {[1, 2, 3].map(i => (
            <LoadingSkeleton key={i} flex={1} height={80} borderRadius={12} />
          ))}
        </View>

        {[1, 2, 3].map(i => (
          <LoadingSkeleton key={i} width="100%" height={120} style={styles.skeleton} />
        ))}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Trial Manager
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {stats.total} total trials
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon 
              name={showFilters ? "filter-remove" : "filter"} 
              size={20} 
              color={showFilters ? theme.colors.primary : theme.colors.text} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowAddTrial(true)}
          >
            <Icon name="plus" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showFilters && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
            <Icon name="magnify" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search trials..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Sort Options */}
          <View style={styles.sortContainer}>
            <Text style={[styles.sortLabel, { color: theme.colors.textSecondary }]}>
              Sort by:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(['date', 'name', 'price', 'daysLeft'] as SortType[]).map((sort) => (
                <TouchableOpacity
                  key={sort}
                  style={[
                    styles.sortChip,
                    { backgroundColor: theme.colors.surface },
                    sortBy === sort && { backgroundColor: theme.colors.primary + '20' },
                  ]}
                  onPress={() => {
                    if (sortBy === sort) {
                      setSortAscending(!sortAscending);
                    } else {
                      setSortBy(sort);
                      setSortAscending(true);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      { color: theme.colors.textSecondary },
                      sortBy === sort && { color: theme.colors.primary, fontWeight: '600' },
                    ]}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </Text>
                  {sortBy === sort && (
                    <Icon
                      name={sortAscending ? 'arrow-up' : 'arrow-down'}
                      size={14}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      )}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(['active', 'upcoming', 'expired', 'calendar'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && [styles.activeTab, { borderBottomColor: theme.colors.primary }],
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                { color: theme.colors.textSecondary },
                activeTab === tab && { color: theme.colors.primary, fontWeight: '600' },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {tab !== 'calendar' && (
              <View
                style={[
                  styles.tabBadge,
                  { backgroundColor: activeTab === tab ? theme.colors.primary : theme.colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    { color: activeTab === tab ? '#fff' : theme.colors.text },
                  ]}
                >
                  {tab === 'active' ? stats.active : tab === 'upcoming' ? stats.upcoming : stats.expired}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      {activeTab !== 'calendar' && renderStats()}

      {/* Main Content */}
      {activeTab === 'calendar' ? (
        renderCalendarView()
      ) : (
        <AnimatedSectionList
          sections={groupedTrials}
          keyExtractor={(item, index) => (item as Trial).id}
          renderItem={renderTrialItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshTrials}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Trial Bottom Sheet */}
      <BottomSheet
        visible={showAddTrial}
        onClose={() => setShowAddTrial(false)}
        snapPoints={['90%']}
      >
        <AddTrialForm
          onSubmit={handleAddTrial}
          onCancel={() => setShowAddTrial(false)}
        />
      </BottomSheet>

      {/* Trial Actions Bottom Sheet */}
      <BottomSheet
        visible={!!selectedTrial}
        onClose={() => setSelectedTrial(null)}
        snapPoints={['auto']}
      >
        {selectedTrial && (
          <TrialActionsSheet
            trial={selectedTrial}
            onClose={() => setSelectedTrial(null)}
            onCancel={handleCancelTrial}
            onConvert={handleConvertToSubscription}
            onDelete={handleDeleteTrial}
            onEdit={(trialId) => {
              setSelectedTrial(null);
              navigation.navigate('EditTrial', { trialId });
            }}
          />
        )}
      </BottomSheet>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event: any, date?: Date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
    </GestureHandlerRootView>
  );
};

// Add Trial Form Component
const AddTrialForm: React.FC<{
  onSubmit: (trial: Partial<Trial>) => Promise<void>;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Partial<Trial> & { name?: string; price?: number; reminderDays?: number[] }>({
    name: '',
    price: 0,
    currency: 'USD',
    startDate: new Date().toISOString(),
    endDate: dateHelpers.addDays(new Date(), 14).toISOString(),
    status: 'upcoming',
    reminderDays: [3, 1, 0],
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleSubmit = () => {
    if (!(formData as any).name || !(formData as any).price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <View style={styles.formContainer}>
      <Text style={[styles.formTitle, { color: theme.colors.text }]}>
        Add New Trial
      </Text>

      {/* Service Name */}
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
          Service Name *
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          }]}
          placeholder="e.g., Netflix, Spotify"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
      </View>

      {/* Price */}
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
          Price *
        </Text>
        <View style={styles.priceInput}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border,
              flex: 1,
            }]}
            placeholder="0.00"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.price?.toString()}
            onChangeText={(text) => setFormData({ ...formData, price: parseFloat(text) || 0 })}
            keyboardType="numeric"
          />
          <View style={[styles.currencySelector, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.currencyText, { color: theme.colors.text }]}>
              {formData.currency}
            </Text>
          </View>
        </View>
      </View>

      {/* Dates */}
      <View style={styles.formRow}>
        <View style={[styles.formField, { flex: 1 }]}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Start Date
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowStartPicker(true)}
          >
            <Icon name="calendar" size={20} color={theme.colors.primary} />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {new Date(formData.startDate!).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.formField, { flex: 1 }]}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            End Date
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowEndPicker(true)}
          >
            <Icon name="calendar-end" size={20} color={theme.colors.primary} />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {new Date(formData.endDate!).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reminder Days */}
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
          Remind me before
        </Text>
        <View style={styles.reminderOptions}>
          {[7, 3, 1, 0].map((days) => (
            <TouchableOpacity
              key={days}
              style={[
                styles.reminderChip,
                { backgroundColor: theme.colors.surface },
                formData.reminderDays?.includes(days) && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => {
                const current = formData.reminderDays || [];
                const updated = current.includes(days)
                  ? current.filter((d: number) => d !== days)
                  : [...current, days];
                setFormData({ ...formData, reminderDays: updated });
              }}
            >
              <Text
                style={[
                  styles.reminderChipText,
                  { color: theme.colors.textSecondary },
                  formData.reminderDays?.includes(days) && { color: '#fff' },
                ]}
              >
                {days === 0 ? 'Same day' : `${days} days`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
          Notes (Optional)
        </Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          }]}
          placeholder="Add any notes about this trial"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Buttons */}
      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.surface }]}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>
            Add Trial
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={new Date(formData.startDate!)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event: any, date?: Date) => {
            setShowStartPicker(false);
            if (date) setFormData({ ...formData, startDate: date.toISOString() });
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={new Date(formData.endDate!)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event: any, date?: Date) => {
            setShowEndPicker(false);
            if (date) setFormData({ ...formData, endDate: date.toISOString() });
          }}
        />
      )}
    </View>
  );
};

// Trial Actions Sheet Component
const TrialActionsSheet: React.FC<{
  trial: Trial;
  onClose: () => void;
  onCancel: (id: string) => void;
  onConvert: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}> = ({ trial, onClose, onCancel, onConvert, onDelete, onEdit }) => {
  const { theme } = useTheme();
  const daysLeft = dateHelpers.daysBetween(new Date(), new Date(trial.endDate));

  return (
    <View style={styles.actionSheet}>
      <View style={styles.actionSheetHeader}>
        <View style={styles.actionSheetIcon}>
          <Icon name="timer" size={32} color={theme.colors.primary} />
        </View>
        <View style={styles.actionSheetInfo}>
          <Text style={[styles.actionSheetTitle, { color: theme.colors.text }]}>
                {(trial as any).name || 'Trial'}
              </Text>
          <Text style={[styles.actionSheetSubtitle, { color: theme.colors.textSecondary }]}>
            {daysLeft >= 0 ? `${daysLeft} days left` : 'Expired'}
          </Text>
        </View>
      </View>

      <View style={styles.actionSheetActions}>
        {trial.status === 'active' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
              onPress={() => {
                onConvert(trial.id);
                onClose();
              }}
            >
              <Icon name="credit-card" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Convert to Subscription</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.warning }]}
              onPress={() => {
                onCancel(trial.id);
                onClose();
              }}
            >
              <Icon name="close" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Cancel Trial</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => {
            onEdit(trial.id);
            onClose();
          }}
        >
          <Icon name="pencil" size={20} color={theme.colors.text} />
          <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
            Edit Trial
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={() => {
            onDelete(trial.id);
            onClose();
          }}
        >
          <Icon name="delete" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Delete Trial</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    padding: 0,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sortLabel: {
    fontSize: 12,
    marginRight: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 4,
  },
  sortChipText: {
    fontSize: 12,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 12,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  swipeAction: {
    width: 70,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 4,
  },
  swipeActionText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
  },
  skeleton: {
    marginBottom: 8,
    borderRadius: 12,
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formField: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 80,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencySelector: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  currencyText: {
    fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  reminderChipText: {
    fontSize: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  submitButton: {
    // No additional styles needed
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSheet: {
    padding: 20,
  },
  actionSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionSheetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionSheetInfo: {
    flex: 1,
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSheetSubtitle: {
    fontSize: 14,
  },
  actionSheetActions: {
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});

export default TrialManagerScreen;
