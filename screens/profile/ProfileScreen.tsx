import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    LinearTransition
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@hooks/useAuth';
import { useSubscriptions } from '@hooks/useSubscriptions';

interface ProfileStat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

interface ProfileAction {
  id: string;
  icon: string;
  label: string;
  description?: string;
  onPress: () => void;
  color?: string;
  badge?: string;
  isDangerous?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const { subscriptions } = useSubscriptions();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // Mock avatar URL - replace with actual user avatar
  const avatarUrl = 'https://via.placeholder.com/120/6366F1/FFFFFF?text=' + (user?.fullName?.[0] || 'U');

  // Calculate profile stats
  const profileStats = useMemo((): ProfileStat[] => {
    const totalSubscriptions = subscriptions?.length || 0;
    const activeSubscriptions = subscriptions?.filter((s: any) => s.status === 'active').length || 0;
    const totalSpending = subscriptions
      ?.filter((s: any) => s.status === 'active')
      .reduce((sum: number, s: any) => sum + (s.amount || 0), 0) || 0;

    const memberSinceDate = user?.createdAt ? new Date(user.createdAt) : new Date();
    const monthsSince = Math.floor(
      (new Date().getTime() - memberSinceDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    return [
      {
        label: 'Active Subscriptions',
        value: activeSubscriptions,
        icon: 'check-circle',
        color: colors.success,
      },
      {
        label: 'Total Subscriptions',
        value: totalSubscriptions,
        icon: 'list-box',
        color: colors.info,
      },
      {
        label: 'Monthly Spend',
        value: `$${totalSpending.toFixed(2)}`,
        icon: 'cash',
        color: colors.warning,
      },
      {
        label: 'Member Since',
        value: `${monthsSince} months`,
        icon: 'calendar',
        color: colors.primary,
      },
    ];
  }, [subscriptions, user?.createdAt, colors]);

  // Profile actions
  const profileActions = useMemo((): ProfileAction[] => {
    return [
      {
        id: 'edit-profile',
        icon: 'pencil',
        label: 'Edit Profile',
        description: 'Update your personal information',
        onPress: () => {
          Alert.alert('Edit Profile', 'Feature coming soon');
        },
        color: colors.primary,
      },
      {
        id: 'preferences',
        icon: 'cog',
        label: 'Preferences',
        description: 'Manage app settings',
        onPress: () => {
          Alert.alert('Preferences', 'Feature coming soon');
        },
        color: colors.info,
      },
      {
        id: 'billing',
        icon: 'credit-card',
        label: 'Billing & Subscription',
        description: 'Manage payment methods',
        onPress: () => {
          Alert.alert('Billing', 'Feature coming soon');
        },
        color: colors.success,
      },
      {
        id: 'notifications',
        icon: 'bell',
        label: 'Notifications',
        description: 'Notification preferences',
        onPress: () => {
          Alert.alert('Notifications', 'Feature coming soon');
        },
        color: colors.warning,
      },
      {
        id: 'privacy',
        icon: 'shield-check',
        label: 'Privacy & Security',
        description: 'Manage security settings',
        onPress: () => {
          Alert.alert('Privacy & Security', 'Feature coming soon');
        },
        color: colors.primary,
      },
      {
        id: 'help',
        icon: 'help-circle',
        label: 'Help & Support',
        description: 'Get help or report issues',
        onPress: () => {
          Alert.alert('Help & Support', 'Feature coming soon');
        },
        color: colors.info,
      },
    ];
  }, [colors]);

  // Handle logout
  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Logout',
        onPress: async () => {
          setLoading(true);
          try {
            await signOut();
            router.replace('/auth/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          } finally {
            setLoading(false);
          }
        },
        style: 'destructive',
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [signOut, router]);

  // Handle delete account
  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Delete',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted');
          },
          style: 'destructive',
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scrollView: {
          flexGrow: 1,
        },
        header: {
          paddingHorizontal: 16,
          paddingVertical: 24,
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        avatarContainer: {
          marginBottom: 16,
          position: 'relative',
        },
        avatar: {
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 3,
          borderColor: colors.primary,
        },
        avatarImage: {
          width: 120,
          height: 120,
          borderRadius: 60,
        },
        avatarPlaceholder: {
          fontSize: 48,
          color: colors.textInverse,
          fontWeight: 'bold',
        },
        editAvatarButton: {
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: colors.card,
        },
        headerContent: {
          alignItems: 'center',
        },
        userName: {
          fontSize: 24,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 4,
        },
        userEmail: {
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 12,
        },
        userTier: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 12,
          backgroundColor: `${colors.primary}20`,
        },
        userTierText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.primary,
        },
        statsContainer: {
          paddingHorizontal: 16,
          paddingVertical: 24,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        },
        statCard: {
          width: '48%',
          paddingHorizontal: 12,
          paddingVertical: 16,
          borderRadius: 12,
          backgroundColor: colors.backgroundSecondary,
          marginBottom: 12,
          justifyContent: 'center',
          alignItems: 'center',
        },
        statIconContainer: {
          width: 40,
          height: 40,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 8,
        },
        statValue: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 4,
        },
        statLabel: {
          fontSize: 11,
          fontWeight: '600',
          color: colors.textSecondary,
          textAlign: 'center',
        },
        section: {
          marginTop: 24,
          paddingHorizontal: 16,
        },
        sectionTitle: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginBottom: 12,
        },
        actionItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 12,
          marginBottom: 8,
          borderRadius: 12,
          backgroundColor: colors.backgroundSecondary,
        },
        actionIcon: {
          width: 40,
          height: 40,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        },
        actionContent: {
          flex: 1,
        },
        actionLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 2,
        },
        actionDescription: {
          fontSize: 12,
          color: colors.textSecondary,
        },
        actionBadge: {
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
          backgroundColor: colors.warning,
        },
        actionBadgeText: {
          fontSize: 10,
          fontWeight: '600',
          color: colors.textInverse,
        },
        logoutButton: {
          marginHorizontal: 16,
          marginVertical: 24,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 12,
          backgroundColor: `${colors.error}15`,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
        },
        logoutButtonText: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.error,
          marginLeft: 8,
        },
        deleteAccountButton: {
          marginHorizontal: 16,
          marginBottom: 24,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 12,
          backgroundColor: colors.backgroundSecondary,
          borderWidth: 1.5,
          borderColor: colors.error,
          alignItems: 'center',
        },
        deleteAccountButtonText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.error,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        chevron: {
          marginLeft: 8,
        },
      }),
    [colors]
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        scrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={styles.header} entering={FadeIn} layout={LinearTransition}>
          <Animated.View style={styles.avatarContainer} entering={FadeInDown}>
            <View style={styles.avatar}>
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                defaultSource={require('@assets/images/avatar-placeholder.png')}
              />
            </View>
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => Alert.alert('Change Avatar', 'Feature coming soon')}
            >
              <Icon name="camera" size={18} color={colors.textInverse} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={styles.headerContent} entering={FadeInDown.delay(100)}>
            <Text style={styles.userName}>{user.fullName || 'User'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.userTier}>
              <Text style={styles.userTierText}>FREE MEMBER</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Stats */}
        <Animated.View
          style={styles.statsContainer}
          entering={FadeInDown.delay(200)}
          layout={LinearTransition}
        >
          {profileStats.map((stat, index) => (
            <Animated.View
              key={stat.label}
              style={styles.statCard}
              entering={FadeInDown.delay(250 + index * 50)}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: `${stat.color}20` },
                ]}
              >
                <Icon name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Profile Actions */}
        <Animated.View
          style={styles.section}
          entering={FadeInDown.delay(400)}
          layout={LinearTransition}
        >
          <Text style={styles.sectionTitle}>Account</Text>
          {profileActions.map((action, index) => (
            <AnimatedTouchable
              key={action.id}
              style={styles.actionItem}
              onPress={action.onPress}
              activeOpacity={0.7}
              entering={FadeInDown.delay(450 + index * 50)}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: `${action.color}20` },
                ]}
              >
                <Icon name={action.icon} size={20} color={action.color} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionLabel}>{action.label}</Text>
                {action.description && (
                  <Text style={styles.actionDescription}>{action.description}</Text>
                )}
              </View>
              {action.badge && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>{action.badge}</Text>
                </View>
              )}
              <Icon
                name="chevron-right"
                size={20}
                color={colors.textSecondary}
                style={styles.chevron}
              />
            </AnimatedTouchable>
          ))}
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.delay(650)}>
          <AnimatedTouchable
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.error} size="small" />
            ) : (
              <>
                <Icon name="logout" size={18} color={colors.error} />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </>
            )}
          </AnimatedTouchable>
        </Animated.View>

        {/* Delete Account Button */}
        <Animated.View entering={FadeInDown.delay(700)}>
          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
