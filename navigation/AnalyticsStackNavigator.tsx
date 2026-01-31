import { colors, spacing } from '@config/theme';
import { useTheme } from '@hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import analytics screens
import AnalyticsOverviewScreen from '@screens/analytics/AnalyticsOverviewScreen';
import CategoryAnalysisScreen from '@screens/analytics/CategoryAnalysisScreen';
import CustomReportScreen from '@screens/analytics/CustomReportScreen';
import MonthlyReportScreen from '@screens/analytics/MonthlyReportScreen';
import SpendingTrendsScreen from '@screens/analytics/SpendingTrendsScreen';
import YearlyReportScreen from '@screens/analytics/YearlyReportScreen';

// Import components
import { Badge } from '@components/common/Badge';
import { Dropdown } from '@components/common/Dropdown';
import { Text } from '@components/common/Text';

// Import hooks
import { useAnalytics } from '@hooks/useAnalytics';
import { useSubscriptions } from '@hooks/useSubscriptions';

const Stack = createStackNavigator();

const AnalyticsStackNavigator: React.FC = () => {
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const { 
    totalSpentThisMonth, 
    spendingChange, 
    topCategory,
    insights 
  } = useAnalytics();
  const { activeSubscriptionsCount } = useSubscriptions();

  const [timeRange, setTimeRange] = useState('month');
  const [reportType, setReportType] = useState('overview');

  // Common screen options
  const commonScreenOptions = {
    headerStyle: {
      backgroundColor: isDark ? colors.surfaceDark : colors.surface,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.borderDark : colors.border,
    },
    headerTintColor: isDark ? colors.textDark : colors.text,
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? colors.textDark : colors.text,
    },
    headerBackTitleVisible: false,
    cardStyle: {
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
  };

  // Header title for analytics overview
  const AnalyticsHeaderTitle = () => (
    <View style={styles.analyticsHeaderTitle}>
      <Icon
        name="chart-areaspline"
        size={20}
        color={colors.primary}
        style={styles.headerIcon}
      />
      <View>
        <Text style={[styles.headerTitle, { color: isDark ? colors.textDark : colors.text }]}>
          Analytics
        </Text>
        <View style={styles.headerSubtitleRow}>
          <Icon
            name="trending-up"
            size={14}
            color={spendingChange >= 0 ? colors.success : colors.error}
            style={styles.headerSubtitleIcon}
          />
          <Text style={[
            styles.headerSubtitle,
            { 
              color: spendingChange >= 0 ? colors.success : colors.error,
              fontSize: 12 
            }
          ]}>
            {spendingChange >= 0 ? '+' : ''}{spendingChange}% from last month
          </Text>
        </View>
      </View>
    </View>
  );

  // Header right for analytics overview
  const AnalyticsHeaderRight = () => {
    const timeRangeOptions = [
      { label: 'This Month', value: 'month' },
      { label: 'This Quarter', value: 'quarter' },
      { label: 'This Year', value: 'year' },
      { label: 'All Time', value: 'all' },
    ];

    return (
      <View style={styles.analyticsHeaderRight}>
        {/* Time Range Dropdown */}
        <Dropdown
          items={timeRangeOptions}
          selectedValue={timeRange}
          onSelect={(value) => setTimeRange(value.toString())}
          variant="ghost"
          size="small"
          icon="calendar-range"
          style={styles.timeRangeDropdown}
        />

        {/* Export Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ExportModal' as any)}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon
            name="export"
            size={22}
            color={isDark ? colors.textDark : colors.text}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Header title for monthly report
  const MonthlyReportHeaderTitle = () => {
    const currentDate = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    return (
      <View style={styles.reportHeaderTitle}>
        <Icon
          name="file-chart"
          size={20}
          color={colors.primary}
          style={styles.headerIcon}
        />
        <View>
          <Text style={[styles.headerTitle, { color: isDark ? colors.textDark : colors.text }]}>
            Monthly Report
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary, fontSize: 12 }]}>
            {currentMonth} {currentYear}
          </Text>
        </View>
      </View>
    );
  };

  // Header right for reports
  const ReportHeaderRight = () => (
    <View style={styles.analyticsHeaderRight}>
      {/* Share Button */}
      <TouchableOpacity
        onPress={() => {
          // Share report
        }}
        style={styles.headerButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Icon
          name="share-variant"
          size={22}
          color={isDark ? colors.textDark : colors.text}
        />
      </TouchableOpacity>

      {/* Print Button */}
      <TouchableOpacity
        onPress={() => {
          // Print report
        }}
        style={styles.headerButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Icon
          name="printer"
          size={22}
          color={isDark ? colors.textDark : colors.text}
        />
      </TouchableOpacity>
    </View>
  );

  // Insights badge for header
  const InsightsBadge = () => {
    const insightsCount = insights?.length || 0;
    
    if (insightsCount === 0) return null;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('InsightsModal' as any)}
        style={styles.insightsBadgeContainer}>
        <Badge
          count={insightsCount}
          maxCount={9}
          color="info"
          size="small"
          showZero={false}
          variant="dot"
        />
        <Icon
          name="lightbulb-on"
          size={16}
          color={colors.info}
          style={styles.insightsIcon}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Stack.Navigator
      initialRouteName="AnalyticsOverview"
      screenOptions={commonScreenOptions}>
      {/* Analytics Overview */}
      <Stack.Screen
        name="AnalyticsOverview"
        component={AnalyticsOverviewScreen}
        options={{
          headerTitle: AnalyticsHeaderTitle,
          headerTitleAlign: 'center',
          headerRight: AnalyticsHeaderRight,
          headerLeft: InsightsBadge,
        }}
      />

      {/* Monthly Report */}
      <Stack.Screen
        name="MonthlyReport"
        component={MonthlyReportScreen}
        options={{
          headerTitle: MonthlyReportHeaderTitle,
          headerTitleAlign: 'center',
          headerRight: ReportHeaderRight,
        }}
      />

      {/* Yearly Report */}
      <Stack.Screen
        name="YearlyReport"
        component={YearlyReportScreen}
        options={{
          title: 'Yearly Report',
          headerRight: ReportHeaderRight,
        }}
      />

      {/* Custom Report */}
      <Stack.Screen
        name="CustomReport"
        component={CustomReportScreen}
        options={{
          title: 'Custom Report',
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon
                name="content-save"
                size={24}
                color={isDark ? colors.textDark : colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Spending Trends */}
      <Stack.Screen
        name="SpendingTrends"
        component={SpendingTrendsScreen}
        options={{
          title: 'Spending Trends',
          headerRight: () => (
            <View style={styles.analyticsHeaderRight}>
              <Dropdown
                items={[
                  { label: '6 Months', value: '6m' },
                  { label: '1 Year', value: '1y' },
                  { label: '2 Years', value: '2y' },
                  { label: 'All Time', value: 'all' },
                ]}
                selectedValue="1y"
                onSelect={(value) => console.log(value)}
                variant="ghost"
                size="small"
                icon="chart-line"
              />
            </View>
          ),
        }}
      />

      {/* Category Analysis */}
      <Stack.Screen
        name="CategoryAnalysis"
        component={CategoryAnalysisScreen}
        options={{
          title: 'Category Analysis',
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon
                name="filter-variant"
                size={22}
                color={isDark ? colors.textDark : colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Modal Screens */}
      <Stack.Group
        screenOptions={{
          presentation: 'modal',
          headerStyle: {
            backgroundColor: isDark ? colors.surfaceDark : colors.surface,
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          cardStyle: {
            backgroundColor: isDark ? colors.surfaceDark : colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          },
        }}>
        {/* Export Modal */}
        <Stack.Screen
          name="ExportModal"
          component={require('@screens/analytics/ExportModal').default}
          options={{
            title: 'Export Report',
          }}
        />

        {/* Insights Modal */}
        <Stack.Screen
          name="InsightsModal"
          component={require('@screens/analytics/InsightsModal').default}
          options={{
            title: 'AI Insights',
            headerRight: () => (
              <TouchableOpacity
                style={styles.headerButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon
                  name="robot"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ),
          }}
        />

        {/* Comparison Modal */}
        <Stack.Screen
          name="ComparisonModal"
          component={require('@screens/analytics/ComparisonModal').default}
          options={{
            title: 'Compare Periods',
          }}
        />

        {/* Forecast Modal */}
        <Stack.Screen
          name="ForecastModal"
          component={require('@screens/analytics/ForecastModal').default}
          options={{
            title: 'Spending Forecast',
          }}
        />

        {/* Savings Tips Modal */}
        <Stack.Screen
          name="SavingsTipsModal"
          component={require('@screens/analytics/SavingsTipsModal').default}
          options={{
            title: 'Savings Tips',
          }}
        />
      </Stack.Group>

      {/* Full Screen Modals */}
      <Stack.Group
        screenOptions={{
          presentation: 'fullScreenModal',
          headerShown: true,
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}>
        {/* Chart Full Screen */}
        <Stack.Screen
          name="ChartFullScreen"
          component={require('@screens/analytics/ChartFullScreen').default}
          options={{
            title: 'Detailed Chart',
            headerStyle: {
              backgroundColor: '#000',
            },
            headerTintColor: colors.surface,
          }}
        />

        {/* PDF Viewer */}
        <Stack.Screen
          name="PDFViewer"
          component={require('@screens/analytics/PDFViewer').default}
          options={{
            title: 'Report PDF',
          }}
        />
      </Stack.Group>

      {/* Date Range Picker */}
      <Stack.Screen
        name="DateRangePicker"
        component={require('@screens/analytics/DateRangePicker').default}
        options={{
          title: 'Select Date Range',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: isDark ? colors.surfaceDark : colors.surface,
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          cardStyle: {
            backgroundColor: isDark ? colors.surfaceDark : colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          },
        }}
      />

      {/* Category Filter Modal */}
      <Stack.Screen
        name="CategoryFilterModal"
        component={require('@screens/analytics/CategoryFilterModal').default}
        options={{
          title: 'Filter Categories',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: isDark ? colors.surfaceDark : colors.surface,
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          cardStyle: {
            backgroundColor: isDark ? colors.surfaceDark : colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          },
        }}
      />

      {/* Transparent Modals */}
      <Stack.Group
        screenOptions={{
          presentation: 'transparentModal',
          headerShown: false,
          cardStyle: {
            backgroundColor: 'transparent',
          },
          cardOverlayEnabled: true,
        }}>
        {/* Chart Tooltip Modal */}
        <Stack.Screen
          name="ChartTooltipModal"
          component={require('@screens/analytics/ChartTooltipModal').default}
        />

        {/* Data Point Details Modal */}
        <Stack.Screen
          name="DataPointDetailsModal"
          component={require('@screens/analytics/DataPointDetailsModal').default}
        />

        {/* Loading Analytics Modal */}
        <Stack.Screen
          name="LoadingAnalyticsModal"
          component={require('@screens/analytics/LoadingAnalyticsModal').default}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  analyticsHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerSubtitleIcon: {
    marginRight: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 11,
  },
  analyticsHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerButton: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
  timeRangeDropdown: {
    minWidth: 120,
  },
  insightsBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  insightsIcon: {
    marginLeft: spacing.xs,
  },
});

export default AnalyticsStackNavigator;