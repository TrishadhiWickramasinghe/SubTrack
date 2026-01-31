import { colors, spacing } from '@/config/theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@hooks/useTheme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

// Import subscription screens
import AddSubscriptionScreen from '@screens/subscription/AddSubscriptionScreen';
import DuplicateSubscriptionScreen from '@screens/subscription/DuplicateSubscriptionScreen';
import EditSubscriptionScreen from '@screens/subscription/EditSubscriptionScreen';
import SubscriptionDetailsScreen from '@screens/subscription/SubscriptionDetailsScreen';
import SubscriptionHistoryScreen from '@screens/subscription/SubscriptionHistoryScreen';
import SubscriptionListScreen from '@screens/subscription/SubscriptionListScreen';

// Import components
import { Badge } from '@components/common/Badge';
import { SearchBar } from '@components/common/SearchBar';

// Import hooks
import { useNotifications } from '@hooks/useNotifications';
import { useSubscriptions } from '@hooks/useSubscriptions';

const Stack = createStackNavigator();

const SubscriptionStackNavigator: React.FC = () => {
  const { isDark } = useTheme();
  const { upcomingPaymentsCount, activeSubscriptionsCount } = useSubscriptions();
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
    cardStyle: {
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
  };

  // Header right component for subscription list
  const SubscriptionListHeaderRight = () => {
    const navigation = useNavigation();
    
    return (
      <View style={styles.headerRight}>
        {/* Search Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Search' as any)}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon
            name="magnify"
            size={24}
            color={isDark ? colors.textDark : colors.text}
          />
        </TouchableOpacity>

        {/* Filter Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('FilterModal' as any)}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon
            name="filter-variant"
            size={24}
            color={isDark ? colors.textDark : colors.text}
          />
        </TouchableOpacity>

        {/* Add Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AddSubscription' as any)}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon
            name="plus"
            size={24}
            color={isDark ? colors.textDark : colors.text}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Header title with count for subscription list
  const SubscriptionListHeaderTitle = () => (
    <View style={styles.headerTitleContainer}>
      <Icon
        name="credit-card-multiple"
        size={20}
        color={colors.primary}
        style={styles.headerTitleIcon}
      />
      <View>
        <View style={styles.headerTitleRow}>
          <Icon
            name="credit-card"
            size={16}
            color={isDark ? colors.textDark : colors.text}
            style={styles.headerTitleIcon}
          />
          <Badge
            count={activeSubscriptionsCount}
            maxCount={99}
            color="primary"
            size="small"
            showZero={true}
            style={styles.headerTitleBadge}
          />
        </View>
        <View style={styles.headerTitleRow}>
          <Icon
            name="calendar-clock"
            size={16}
            color={isDark ? colors.textDark : colors.text}
            style={styles.headerTitleIcon}
          />
          <Badge
            count={upcomingPaymentsCount}
            maxCount={99}
            color="info"
            size="small"
            showZero={false}
            style={styles.headerTitleBadge}
          />
        </View>
      </View>
    </View>
  );

  // Header right for subscription details
  const SubscriptionDetailsHeaderRight = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { subscriptionId } = route.params as { subscriptionId: string };

    return (
      <View style={styles.headerRight}>
        {/* Edit Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('EditSubscription', { subscriptionId })}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon
            name="pencil"
            size={22}
            color={isDark ? colors.textDark : colors.text}
          />
        </TouchableOpacity>

        {/* More Options */}
        <TouchableOpacity
          onPress={() => {
            // Show action sheet with options
          }}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon
            name="dots-vertical"
            size={22}
            color={isDark ? colors.textDark : colors.text}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Search header component
  const SearchHeader = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = React.useState('');

    return (
      <View style={styles.searchHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.searchBackButton}>
          <Icon
            name="arrow-left"
            size={24}
            color={isDark ? colors.textDark : colors.text}
          />
        </TouchableOpacity>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search subscriptions..."
          style={styles.searchBar}
          showClearButton
          autoFocus
        />
      </View>
    );
  };

  return (
    <Stack.Navigator
      initialRouteName="SubscriptionList"
      screenOptions={commonScreenOptions}>
      {/* Subscription List */}
      <Stack.Screen
        name="SubscriptionList"
        component={SubscriptionListScreen}
        options={{
          headerTitle: SubscriptionListHeaderTitle,
          headerTitleAlign: 'center',
          headerRight: SubscriptionListHeaderRight,
        }}
      />

      {/* Add Subscription */}
      <Stack.Screen
        name="AddSubscription"
        component={AddSubscriptionScreen}
        options={{
          title: 'Add Subscription',
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Badge
                count={unreadNotificationsCount}
                maxCount={99}
                color="info"
                size="small"
                showZero={false}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Edit Subscription */}
      <Stack.Screen
        name="EditSubscription"
        component={EditSubscriptionScreen}
        options={({ route }) => ({
          title: 'Edit Subscription',
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon
                  name="content-save"
                  size={24}
                  color={isDark ? colors.textDark : colors.text}
                />
              </TouchableOpacity>
            </View>
          ),
        })}
      />

      {/* Subscription Details */}
      <Stack.Screen
        name="SubscriptionDetails"
        component={SubscriptionDetailsScreen}
        options={{
          title: 'Subscription Details',
          headerRight: SubscriptionDetailsHeaderRight,
        }}
      />

      {/* Subscription History */}
      <Stack.Screen
        name="SubscriptionHistory"
        component={SubscriptionHistoryScreen}
        options={{
          title: 'Payment History',
        }}
      />

      {/* Duplicate Subscription */}
      <Stack.Screen
        name="DuplicateSubscription"
        component={DuplicateSubscriptionScreen}
        options={{
          title: 'Duplicate Subscription',
        }}
      />

      {/* Search Screen */}
      <Stack.Screen
        name="Search"
        component={require('@screens/misc/SearchScreen').default}
        options={{
          headerTitle: SearchHeader,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: isDark ? colors.surfaceDark : colors.surface,
            elevation: 0,
            shadowOpacity: 0,
            height: 80,
          },
        }}
      />

      {/* Filter Modal */}
      <Stack.Screen
        name="FilterModal"
        component={require('@screens/misc/FilterScreen').default}
        options={{
          title: 'Filter Subscriptions',
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

      {/* Sort Modal */}
      <Stack.Screen
        name="SortModal"
        component={require('@screens/misc/SortScreen').default}
        options={{
          title: 'Sort By',
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

      {/* Quick Add Modal */}
      <Stack.Screen
        name="QuickAddModal"
        component={AddSubscriptionScreen}
        options={{
          title: 'Quick Add',
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

      {/* Category Modal */}
      <Stack.Screen
        name="CategoryModal"
        component={require('@screens/subscription/CategoryModal').default}
        options={{
          title: 'Select Category',
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

      {/* Icon Picker Modal */}
      <Stack.Screen
        name="IconPickerModal"
        component={require('@screens/subscription/IconPickerModal').default}
        options={{
          title: 'Select Icon',
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

      {/* Color Picker Modal */}
      <Stack.Screen
        name="ColorPickerModal"
        component={require('@screens/subscription/ColorPickerModal').default}
        options={{
          title: 'Select Color',
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

      {/* Billing Cycle Modal */}
      <Stack.Screen
        name="BillingCycleModal"
        component={require('@screens/subscription/BillingCycleModal').default}
        options={{
          title: 'Billing Cycle',
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
        {/* Delete Confirmation Modal */}
        <Stack.Screen
          name="DeleteConfirmationModal"
          component={require('@screens/subscription/DeleteConfirmationModal').default}
        />

        {/* Status Change Modal */}
        <Stack.Screen
          name="StatusChangeModal"
          component={require('@screens/subscription/StatusChangeModal').default}
        />

        {/* Payment Confirmation Modal */}
        <Stack.Screen
          name="PaymentConfirmationModal"
          component={require('@screens/subscription/PaymentConfirmationModal').default}
        />

        {/* Receipt Upload Modal */}
        <Stack.Screen
          name="ReceiptUploadModal"
          component={require('@screens/subscription/ReceiptUploadModal').default}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerButton: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleIcon: {
    marginRight: spacing.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleBadge: {
    marginLeft: spacing.xs,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  searchBackButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  searchBar: {
    flex: 1,
    marginRight: spacing.md,
  },
});

export default SubscriptionStackNavigator;