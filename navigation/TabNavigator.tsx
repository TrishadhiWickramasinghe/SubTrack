import { colors } from '@/config/theme';
import Badge from '@components/common/Badge';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '@hooks/useTheme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

// Import stack navigators
import AnalyticsStackNavigator from './AnalyticsStackNavigator';
import MainStackNavigator from './MainStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
import SubscriptionStackNavigator from './SubscriptionStackNavigator';

// Import hooks
import { useSubscriptions } from '@hooks/useSubscriptions';

const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  const { isDark } = useTheme();
  const { upcomingPayments } = useSubscriptions();
  
  // Calculate badge counts from available data
  const upcomingPaymentsCount = upcomingPayments?.length ?? 0;
  const unreadNotificationsCount = 0;
  const isOverBudget = false;
  const activeTrialsCount = 0;

  // Tab bar configuration
  const tabBarOptions = {
    activeTintColor: colors.primary[500],
    inactiveTintColor: isDark ? colors.neutral[400] : colors.neutral[500],
    style: {
      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
      borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200],
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
          return colors.warning[500];
        case 'danger':
          return colors.error[500];
        case 'info':
          return colors.info[500];
        default:
          return colors.primary[500];
      }
    };

    return (
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={iconName as any}
          size={24}
          color={
            focused
              ? colors.primary[500]
              : isDark
              ? colors.neutral[400]
              : colors.neutral[500]
          }
        />
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={styles.badgeContainer}>
            <Badge
              text={badgeCount.toString()}
              size="small"
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
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: isDark ? colors.neutral[400] : colors.neutral[500],
        tabBarStyle: {
          backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
          borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200],
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
          ...styles.shadow,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
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

          const getColorValue = (colorVal: any): string => {
            return typeof colorVal === 'string' ? colorVal : 'transparent';
          };

          return (
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons
                name={
                  focused
                    ? 'circle-small'
                    : isDark
                    ? 'circle-outline'
                    : 'circle-outline'
                }
                size={12}
                color={focused ? getColorValue(colors.primary[500]) : 'transparent'}
                style={styles.labelIndicator}
              />
            </View>
          );
        },
      })}>
      <Tab.Screen
        name="Dashboard"
        component={MainStackNavigator}
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
        component={MainStackNavigator}
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