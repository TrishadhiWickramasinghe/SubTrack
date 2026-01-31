import { colors, spacing } from '@config/theme';
import { useTheme } from '@hooks/useTheme';
import { HeaderBackButton } from '@react-navigation/elements';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// Import tab navigator
import TabNavigator from './TabNavigator';

// Import stack navigators
import AnalyticsStackNavigator from './AnalyticsStackNavigator';
import BudgetStackNavigator from './BudgetStackNavigator';
import MarketplaceStackNavigator from './MarketplaceStackNavigator';
import ReportsStackNavigator from './ReportsStackNavigator';
import ScannerStackNavigator from './ScannerStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
import SplittingStackNavigator from './SplittingStackNavigator';
import SubscriptionStackNavigator from './SubscriptionStackNavigator';
import TrialStackNavigator from './TrialStackNavigator';

// Import screens
import BackupScreen from '@screens/misc/BackupScreen';
import CalendarScreen from '@screens/misc/CalendarScreen';
import HelpScreen from '@screens/misc/HelpScreen';
import NotificationsScreen from '@screens/misc/NotificationsScreen';
import SearchScreen from '@screens/misc/SearchScreen';
import SecurityScreen from '@screens/misc/SecurityScreen';

// Import components
import { Badge } from '@components/common/Badge';

// Import hooks
import { useNotifications } from '@hooks/useNotifications';

const Stack = createStackNavigator();

const MainStackNavigator: React.FC = () => {
  const { isDark } = useTheme();
  const { unreadNotificationsCount } = useNotifications();

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
    headerBackImage: ({ tintColor }: { tintColor: string }) => (
      <HeaderBackButton
        tintColor={tintColor}
        labelVisible={false}
        onPress={() => {}}
      />
    ),
    cardStyle: {
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
  };

  // Header right with notifications badge
  const notificationsHeaderRight = () => (
    <Badge
      count={unreadNotificationsCount}
      maxCount={99}
      color="primary"
      size="small"
      showZero={false}
      style={{ marginRight: spacing.md }}
    />
  );

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={commonScreenOptions}>
      {/* Main Tabs */}
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          headerShown: false,
        }}
      />

      {/* Subscription Stack */}
      <Stack.Screen
        name="SubscriptionStack"
        component={SubscriptionStackNavigator}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      {/* Analytics Stack */}
      <Stack.Screen
        name="AnalyticsStack"
        component={AnalyticsStackNavigator}
        options={{
          headerShown: false,
        }}
      />

      {/* Budget Stack */}
      <Stack.Screen
        name="BudgetStack"
        component={BudgetStackNavigator}
        options={{
          headerShown: false,
        }}
      />

      {/* Settings Stack */}
      <Stack.Screen
        name="SettingsStack"
        component={SettingsStackNavigator}
        options={{
          headerShown: false,
        }}
      />

      {/* Trial Stack */}
      <Stack.Screen
        name="TrialStack"
        component={TrialStackNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      {/* Marketplace Stack */}
      <Stack.Screen
        name="MarketplaceStack"
        component={MarketplaceStackNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      {/* Scanner Stack */}
      <Stack.Screen
        name="ScannerStack"
        component={ScannerStackNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      {/* Reports Stack */}
      <Stack.Screen
        name="ReportsStack"
        component={ReportsStackNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      {/* Splitting Stack */}
      <Stack.Screen
        name="SplittingStack"
        component={SplittingStackNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      {/* Misc Screens */}
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          headerRight: notificationsHeaderRight,
        }}
      />

      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'Payment Calendar',
        }}
      />

      <Stack.Screen
        name="Backup"
        component={BackupScreen}
        options={{
          title: 'Backup & Sync',
        }}
      />

      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{
          title: 'Security',
        }}
      />

      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{
          title: 'Help & Support',
        }}
      />

      {/* Modal Screens */}
      <Stack.Group
        screenOptions={{
          presentation: 'modal',
          headerShown: true,
          gestureEnabled: true,
          cardOverlayEnabled: true,
          cardStyle: {
            backgroundColor: isDark ? colors.surfaceDark : colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          },
        }}>
        {/* Quick Add Modal */}
        <Stack.Screen
          name="QuickAddModal"
          component={require('@screens/subscription/AddSubscriptionScreen').default}
          options={{
            title: 'Add Subscription',
            headerStyle: {
              backgroundColor: isDark ? colors.surfaceDark : colors.surface,
              borderBottomWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
          }}
        />

        {/* Filter Modal */}
        <Stack.Screen
          name="FilterModal"
          component={require('@screens/misc/FilterScreen').default}
          options={{
            title: 'Filter',
            headerStyle: {
              backgroundColor: isDark ? colors.surfaceDark : colors.surface,
              borderBottomWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
          }}
        />

        {/* Sort Modal */}
        <Stack.Screen
          name="SortModal"
          component={require('@screens/misc/SortScreen').default}
          options={{
            title: 'Sort By',
            headerStyle: {
              backgroundColor: isDark ? colors.surfaceDark : colors.surface,
              borderBottomWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
          }}
        />
      </Stack.Group>

      {/* Transparent Modal Screens */}
      <Stack.Group
        screenOptions={{
          presentation: 'transparentModal',
          headerShown: false,
          cardStyle: {
            backgroundColor: 'transparent',
          },
          cardOverlayEnabled: true,
          gestureEnabled: true,
        }}>
        {/* Loading Modal */}
        <Stack.Screen
          name="LoadingModal"
          component={require('@screens/misc/LoadingModal').default}
        />

        {/* Success Modal */}
        <Stack.Screen
          name="SuccessModal"
          component={require('@screens/misc/SuccessModal').default}
        />

        {/* Error Modal */}
        <Stack.Screen
          name="ErrorModal"
          component={require('@screens/misc/ErrorModal').default}
        />

        {/* Confirmation Modal */}
        <Stack.Screen
          name="ConfirmationModal"
          component={require('@screens/misc/ConfirmationModal').default}
        />
      </Stack.Group>

      {/* Full Screen Modal */}
      <Stack.Group
        screenOptions={{
          presentation: 'fullScreenModal',
          headerShown: true,
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}>
        {/* Image Viewer */}
        <Stack.Screen
          name="ImageViewer"
          component={require('@screens/misc/ImageViewer').default}
          options={{
            title: 'Receipt',
            headerStyle: {
              backgroundColor: '#000',
            },
            headerTintColor: colors.surface,
          }}
        />

        {/* PDF Viewer */}
        <Stack.Screen
          name="PDFViewer"
          component={require('@screens/misc/PDFViewer').default}
          options={{
            title: 'Report',
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default MainStackNavigator;