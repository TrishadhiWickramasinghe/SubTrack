import React, { useCallback, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Animated, {
    Layout,
    SlideInRight,
    SlideOutLeft,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import BottomSheet from '@components/common/BottomSheet';
import EmptyState from '@components/common/EmptyState';
import NotificationSettings from '@components/settings/NotificationSettings';
import { useTheme } from '@context/ThemeContext';
import { NotificationGroup, NotificationItem, useNotifications } from '@hooks/useNotifications';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Mock LoadingSkeleton component
const LoadingSkeleton = ({ width, height, borderRadius, style }: any) => (
  <View
    style={[
      {
        width: typeof width === 'string' ? width : width,
        height,
        borderRadius: borderRadius || 0,
        backgroundColor: '#e0e0e0',
      },
      style,
    ]}
  />
);

const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    groupedNotifications,
    unreadCount,
    loading,
    refreshing,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications,
    sendTestNotification,
    getNotificationIcon,
    getNotificationColor,
    formatNotificationTime,
    handleNotificationPress,
  } = useNotifications();

  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount === 0) {
      Alert.alert('No Unread', 'All notifications are already read.');
      return;
    }

    Alert.alert(
      'Mark All as Read',
      `Mark all ${unreadCount} notification${unreadCount > 1 ? 's' : ''} as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: async () => {
            await markAllAsRead();
          },
        },
      ]
    );
  }, [unreadCount, markAllAsRead]);

  // Handle clear all
  const handleClearAll = useCallback(() => {
    if (groupedNotifications.length === 0) {
      return;
    }

    const totalCount = groupedNotifications.reduce(
      (sum, group) => sum + group.notifications.length,
      0
    );

    Alert.alert(
      'Clear All Notifications',
      `Delete all ${totalCount} notification${totalCount > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await deleteAllNotifications();
          },
        },
      ]
    );
  }, [groupedNotifications, deleteAllNotifications]);

  // Handle notification long press
  const handleLongPress = useCallback((notification: NotificationItem) => {
    setSelectedNotification(notification);
  }, []);

  // Handle delete with swipe
  const handleDelete = useCallback(async (id: string) => {
    await deleteNotification(id);
    swipeableRefs.current.get(id)?.close();
  }, [deleteNotification]);

  // Render right swipe actions
  const renderRightActions = useCallback((notification: NotificationItem) => {
    return (
      <View style={styles.swipeActions}>
        {!notification.read && (
          <TouchableOpacity
            style={[styles.swipeAction, { backgroundColor: theme.colors.primary }]}
            onPress={() => markAsRead(notification.id)}
          >
            <Icon name="check" size={24} color="#fff" />
            <Text style={styles.swipeActionText}>Read</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: theme.colors.error }]}
          onPress={() => handleDelete(notification.id)}
        >
          <Icon name="delete" size={24} color="#fff" />
          <Text style={styles.swipeActionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  }, [theme, markAsRead, handleDelete]);

  // Render notification item
  const renderNotificationItem = useCallback(({ item, index }: { item: NotificationItem; index: number }) => {
    const icon = getNotificationIcon(item.type);
    const color = getNotificationColor(item.type);

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
          <AnimatedTouchable
            style={[
              styles.notificationItem,
              { backgroundColor: theme.colors.surface },
              !item.read && { backgroundColor: `${color}10` },
            ]}
            onPress={() => {
              handleNotificationPress(item);
              if (!item.read) markAsRead(item.id);
            }}
            onLongPress={() => handleLongPress(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
              <Text style={styles.icon}>{icon}</Text>
            </View>

            <View style={styles.content}>
              <View style={styles.itemHeader}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
                  {formatNotificationTime(item.timestamp)}
                </Text>
              </View>

              <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
                {item.body}
              </Text>

              {item.actions && item.actions.length > 0 && (
                <View style={styles.actions}>
                  {item.actions.map((action) => (
                    <TouchableOpacity
                      key={action.id}
                      style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => {
                        action.onPress();
                        markAsRead(item.id);
                      }}
                    >
                      <Text style={styles.actionText}>{action.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {!item.read && (
              <View style={[styles.unreadDot, { backgroundColor: color }]} />
            )}
          </AnimatedTouchable>
        </Swipeable>
      </Animated.View>
    );
  }, [theme, getNotificationIcon, getNotificationColor, formatNotificationTime, handleNotificationPress, markAsRead, handleLongPress, renderRightActions]);

  // Render group header
  const renderGroupHeader = useCallback(({ section }: { section: NotificationGroup }) => (
    <View style={[styles.groupHeader, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.groupTitle, { color: theme.colors.textSecondary }]}>
        {section.date}
      </Text>
      {section.date === 'Today' && unreadCount > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
        </View>
      )}
    </View>
  ), [theme, unreadCount]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <EmptyState
      icon="bell-off"
      title="No Notifications"
      message="You're all caught up! Check back later for updates."
      actionLabel="Send Test"
      onActionPress={sendTestNotification}
    />
  ), [sendTestNotification]);

  // Render loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <LoadingSkeleton width={200} height={32} />
          <View style={styles.headerActions}>
            <LoadingSkeleton width={40} height={40} borderRadius={20} />
            <LoadingSkeleton width={40} height={40} borderRadius={20} />
          </View>
        </View>
        <View style={styles.list}>
          {[1, 2, 3, 4, 5].map((i) => (
            <LoadingSkeleton key={i} width="100%" height={100} style={styles.skeleton} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <Icon
              name="check-all"
              size={20}
              color={unreadCount > 0 ? theme.colors.primary : theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowSettings(true)}
          >
            <Icon name="cog" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleClearAll}
            disabled={groupedNotifications.length === 0}
          >
            <Icon
              name="delete-sweep"
              size={20}
              color={groupedNotifications.length > 0 ? theme.colors.error : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      <AnimatedFlatList
        data={groupedNotifications}
        keyExtractor={(item: any) => item.date}
        renderItem={({ item }: any) => (
          <View>
            {renderGroupHeader({ section: item })}
            {item.notifications.map((notification: any, index: number) => (
              <View key={notification.id}>
                {renderNotificationItem({ item: notification, index })}
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshNotifications}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Settings Bottom Sheet */}
      <BottomSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        snapPoints={['90%']}
      >
        <NotificationSettings onClose={() => setShowSettings(false)} />
      </BottomSheet>

      {/* Notification Action Sheet (for long press) */}
      <BottomSheet
        visible={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        snapPoints={['auto']}
      >
        {selectedNotification && (
          <View style={styles.actionSheet}>
            <View style={styles.actionSheetHeader}>
              <View style={[styles.actionSheetIcon, { backgroundColor: `${getNotificationColor(selectedNotification.type)}20` }]}>
                <Text style={styles.actionSheetIconText}>
                  {getNotificationIcon(selectedNotification.type)}
                </Text>
              </View>
              <View style={styles.actionSheetInfo}>
                <Text style={[styles.actionSheetTitle, { color: theme.colors.text }]}>
                  {selectedNotification.title}
                </Text>
                <Text style={[styles.actionSheetTime, { color: theme.colors.textSecondary }]}>
                  {formatNotificationTime(selectedNotification.timestamp)}
                </Text>
              </View>
            </View>

            <Text style={[styles.actionSheetBody, { color: theme.colors.textSecondary }]}>
              {selectedNotification.body}
            </Text>

            <View style={styles.actionSheetActions}>
              {!selectedNotification.read && (
                <TouchableOpacity
                  style={[styles.actionSheetButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    markAsRead(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                >
                  <Icon name="check" size={20} color="#fff" />
                  <Text style={styles.actionSheetButtonText}>Mark as Read</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionSheetButton, { backgroundColor: theme.colors.error }]}
                onPress={() => {
                  handleDelete(selectedNotification.id);
                  setSelectedNotification(null);
                }}
              >
                <Icon name="delete" size={20} color="#fff" />
                <Text style={styles.actionSheetButtonText}>Delete</Text>
              </TouchableOpacity>

              {selectedNotification.actions?.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionSheetButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => {
                    action.onPress();
                    setSelectedNotification(null);
                  }}
                >
                  <Text style={[styles.actionSheetButtonText, { color: theme.colors.text }]}>
                    {action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </BottomSheet>
    </GestureHandlerRootView>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
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
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
  body: {
    fontSize: 14,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  swipeAction: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
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
  actionSheet: {
    padding: 20,
  },
  actionSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionSheetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionSheetIconText: {
    fontSize: 24,
  },
  actionSheetInfo: {
    flex: 1,
  },
  actionSheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSheetTime: {
    fontSize: 12,
  },
  actionSheetBody: {
    fontSize: 14,
    marginBottom: 20,
  },
  actionSheetActions: {
    gap: 8,
  },
  actionSheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionSheetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NotificationsScreen;