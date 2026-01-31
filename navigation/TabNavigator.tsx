import { colors } from '@/config/theme';
import { Badge } from '@components/common/Badge';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@hooks/useTheme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

// Import stack navigators
import AnalyticsStackNavigator from './AnalyticsStackNavigator';
import BudgetStackNavigator from './BudgetStackNavigator';
import DashboardStackNavigator from './DashboardStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
import SubscriptionStackNavigator from './SubscriptionStackNavigator';

// Import hooks
import { useBudget } from '@hooks/useBudget';
import { useNotifications } from '@hooks/useNotifications';
import { useSubscriptions } from '@hooks/useSubscriptions';
import { useTrials } from '@hooks/useTrials';

const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  const { isDark } = useTheme();
  const { upcomingPaymentsCount } = useSubscriptions();
  const { unreadNotificationsCount } = useNotifications();
  const { isOverBudget } = useBudget();
  const { activeTrialsCount } = useTrials();

  // Tab bar configuration
  const tabBarOptions = {
    activeTintColor: colors.primary,
    inactiveTintColor: isDark ? colors.textDisabledDark : colors.textDisabled,
    style: {
      backgroundColor: isDark ? colors.surfaceDark : colors.surface,
      borderTopColor: isDark ? colors.borderDark : colors.border,
      borderTopWidth: 1,
      height: Platform.OS === 'ios' ? 85 : 60,
      paddingBottom: Platform.OS === 'ios' ? 25 : 8,
      paddingTop: 8,
      ...styles.shadow,
    },
    labelStyle: {
      fontSize: 11,
      fontWeight: '500',
      marginTop: 4,
    },
    tabStyle: {
      paddingVertical: 4,
    },
    safeAreaInsets: {
      bottom: 0,
    },
  };

  // Custom tab bar button with badge
  const TabBarIcon = ({
    focused,
    iconName,
    badgeCount,
    badgeType = 'default',
  }: {
    focused: boolean;
    iconName: string;
    badgeCount?: number;
    badgeType?: 'default' | 'warning' | 'danger' | 'info';
  }) => {
    const getBadgeColor = () => {
      switch (badgeType) {
        case 'warning':
          return colors.warning;
        case 'danger':
          return colors.error;
        case 'info':
          return colors.info;
        default:
          return colors.primary;
      }
    };

    return (
      <View style={styles.iconContainer}>
        <Icon
          name={iconName}
          size={24}
          color={
            focused
              ? colors.primary
              : isDark
              ? colors.textDisabledDark
              : colors.textDisabled
          }
        />
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={styles.badgeContainer}>
            <Badge
              count={badgeCount}
              maxCount={99}
              color="custom"
              backgroundColor={getBadgeColor()}
              textColor={colors.surface}
              size="small"
              showZero={false}
              style={styles.badge}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';
          let badgeCount: number | undefined;
          let badgeType: 'default' | 'warning' | 'danger' | 'info' = 'default';

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              // Show total upcoming payments on dashboard
              badgeCount = upcomingPaymentsCount;
              badgeType = 'default';
              break;

            case 'Subscriptions':
              iconName = focused ? 'credit-card' : 'credit-card-outline';
              // Show notifications for subscriptions tab
              badgeCount = unreadNotificationsCount;
              badgeType = 'info';
              break;

            case 'Analytics':
              iconName = focused ? 'chart-line' : 'chart-line';
              // No badge for analytics
              break;

            case 'Budget':
              iconName = focused ? 'wallet' : 'wallet-outline';
              // Show warning if over budget
              badgeCount = isOverBudget ? 1 : undefined;
              badgeType = 'warning';
              break;

            case 'Settings':
              iconName = focused ? 'cog' : 'cog-outline';
              // Show active trials count
              badgeCount = activeTrialsCount;
              badgeType = 'info';
              break;
          }

          return (
            <TabBarIcon
              focused={focused}
              iconName={iconName}
              badgeCount={badgeCount}
              badgeType={badgeType}
            />
          );
        },
        tabBarLabel: ({ focused, color }) => {
          let label = '';

          switch (route.name) {
            case 'Dashboard':
              label = 'Dashboard';
              break;
            case 'Subscriptions':
              label = 'Subscriptions';
              break;
            case 'Analytics':
              label = 'Analytics';
              break;
            case 'Budget':
              label = 'Budget';
              break;
            case 'Settings':
              label = 'Settings';
              break;
          }

          return (
            <View style={styles.labelContainer}>
              <Icon
                name={
                  focused
                    ? 'circle-small'
                    : isDark
                    ? 'circle-outline'
                    : 'circle-outline'
                }
                size={12}
                color={focused ? colors.primary : 'transparent'}
                style={styles.labelIndicator}
              />
            </View>
          );
        },
      })}
      tabBarOptions={tabBarOptions}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />

      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionStackNavigator}
        options={{
          tabBarLabel: 'Subscriptions',
        }}
      />

      <Tab.Screen
        name="Analytics"
        component={AnalyticsStackNavigator}
        options={{
          tabBarLabel: 'Analytics',
        }}
      />

      <Tab.Screen
        name="Budget"
        component={BudgetStackNavigator}
        options={{
          tabBarLabel: 'Budget',
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelIndicator: {
    marginTop: 4,
  },
});

export default TabNavigator;