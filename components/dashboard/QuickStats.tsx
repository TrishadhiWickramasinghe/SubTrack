import { MaterialCommunityIcons } from '@expo/vector-icons';
import { differenceInDays, format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Platform,
    Text as RNText,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

// Components
import Card from '@components/common/Card';
import Loading from '@components/common/Loading';
import StatCard from '@components/dashboard/StatCard';
import { colors } from '@config/colors';
import { useCurrency } from '@hooks/useCurrency';
import { useSubscriptions } from '@hooks/useSubscriptions';

interface QuickStatsProps {
  compact?: boolean;
  showAll?: boolean;
  animation?: boolean;
  onStatPress?: (stat: StatData) => void;
}

interface StatData {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: number;
  change?: string;
  suffix?: string;
  prefix?: string;
  badge?: string;
  details?: string;
  action?: () => void;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  compact = false,
  showAll = false,
  animation = true,
  onStatPress,
}) => {
  const { subscriptions, monthlySpending } = useSubscriptions();
  const { formatAmount } = useCurrency();
  
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const { width } = Dimensions.get('window');
  const cardWidth = (width - 48) / (compact ? 4 : 2);

  // Load stats
  useEffect(() => {
    loadStats();
  }, [subscriptions]);

  const loadStats = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Create mock stats from subscriptions
      const mockStats = {
        activeCount: subscriptions?.length || 0,
        totalCount: subscriptions?.length || 0,
        inactiveCount: 0,
        currentMonthTotal: 0,
        averageMonthly: 0,
        categoryTotals: {},
        overdueCount: 0,
      };
      setStats(mockStats);
      
      // Animate in
      if (animation) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error('Failed to load quick stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pulse animation for important stats
  useEffect(() => {
    if (stats.overdueCount && stats.overdueCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [stats.overdueCount, pulseAnim]);

  const handleStatPress = (stat: StatData): void => {
    setSelectedStat(stat.id);
    
    if (onStatPress) {
      onStatPress(stat);
    } else if (stat.action) {
      stat.action();
    }
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Reset selection after delay
    setTimeout(() => setSelectedStat(null), 300);
  };

  // Calculate all stats
  const allStats = useMemo((): StatData[] => {
    const today = new Date();
    const currentMonth = format(today, 'MMMM');
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Monthly change calculation
    const monthlyChange = stats.monthlyChange || 0;
    const monthlyTrend = monthlyChange >= 0 ? 1 : -1;
    
    // Yearly savings potential
    const yearlySavings = (stats.averageMonthly || 0) * 12 * 0.1; // Assume 10% savings
    
    // Upcoming payments count
    const upcomingCount = subscriptions.filter(sub => 
      sub.isActive && 
      new Date(sub.billingDate) > today &&
      differenceInDays(new Date(sub.billingDate), today) <= 7
    ).length;
    
    // Trial ending soon count
    const trialEndingCount = subscriptions.filter(sub => 
      sub.trialEndDate && 
      new Date(sub.trialEndDate) > today &&
      differenceInDays(new Date(sub.trialEndDate), today) <= 3
    ).length;
    
    // Category with highest spending
    const highestCategory = Object.entries(stats.categoryTotals || {})
      .sort(([, a], [, b]) => (b as number) - (a as number))[0];
    
    return [
      // Core Stats
      {
        id: 'monthly-total',
        title: 'This Month',
        value: formatAmount(0),
        icon: 'calendar-month',
        color: colors.primary[500],
        trend: monthlyTrend,
        change: `${Math.abs(monthlyChange).toFixed(1)}%`,
        details: `vs last month`,
        action: () => {
          // Navigate to monthly breakdown
        },
      },
      {
        id: 'active-subs',
        title: 'Active',
        value: stats.activeCount || 0,
        icon: 'check-circle',
        color: colors.success[500],
        badge: stats.inactiveCount ? `${stats.inactiveCount} paused` : undefined,
        details: `${stats.totalCount || 0} total`,
        action: () => {
          // Navigate to active subscriptions
        },
      },
      {
        id: 'upcoming',
        title: 'Upcoming',
        value: upcomingCount,
        icon: 'clock',
        color: colors.info[500],
        details: 'next 7 days',
        action: () => {
          // Navigate to upcoming payments
        },
      },
      {
        id: 'average',
        title: 'Monthly Avg',
        value: formatAmount(0),
        icon: 'chart-box',
        color: colors.warning[500],
        details: 'per subscription',
        action: () => {
          // Show subscription breakdown
        },
      },
      
      // Secondary Stats (shown when showAll is true)
      ...(showAll ? [
        {
          id: 'yearly-total',
          title: 'Yearly Total',
          value: formatAmount(0),
          icon: 'calendar-year',
          color: colors.secondary[500],
          details: 'projected',
          suffix: '/yr',
        },
        {
          id: 'savings-potential',
          title: 'Savings',
          value: formatAmount(0),
          icon: 'piggy-bank',
          color: colors.success[500],
          trend: 1,
          details: 'potential yearly',
          prefix: '~',
        },
        {
          id: 'overdue',
          title: 'Overdue',
          value: stats.overdueCount || 0,
          icon: 'alert-circle',
          color: colors.error[500],
          badge: stats.overdueCount ? 'Action needed' : undefined,
          details: 'payments pending',
        },
        {
          id: 'trials',
          title: 'Trials',
          value: trialEndingCount,
          icon: 'timer-sand',
          color: colors.info[500],
          badge: trialEndingCount ? 'Ending soon' : undefined,
          details: 'ending in 3 days',
        },
        {
          id: 'highest-category',
          title: highestCategory ? highestCategory[0].charAt(0).toUpperCase() + highestCategory[0].slice(1) : 'Top',
          value: highestCategory ? formatAmount(highestCategory[1] as number) : '-',
          icon: 'trophy',
          color: colors.warning[500],
          details: 'highest spending',
        },
        {
          id: 'subscriptions-added',
          title: 'Added',
          value: stats.subscriptionsAddedThisMonth || 0,
          icon: 'plus-circle',
          color: colors.primary[500],
          trend: stats.subscriptionsAddedThisMonth > 0 ? 1 : 0,
          details: `this ${currentMonth}`,
        },
      ] : []),
    ];
  }, [stats, subscriptions, showAll]);

  // Primary stats (always shown)
  const primaryStats = useMemo(() => 
    allStats.slice(0, compact ? 4 : showAll ? 8 : 4), 
    [allStats, compact, showAll]
  );

  // Group stats for grid layout
  const groupedStats = useMemo(() => {
    if (compact) {
      return [primaryStats];
    }
    
    const groups = [];
    for (let i = 0; i < primaryStats.length; i += 2) {
      groups.push(primaryStats.slice(i, i + 2));
    }
    return groups;
  }, [primaryStats, compact]);

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <Loading message="Loading quick stats..." />
      </Card>
    );
  }

  if (primaryStats.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="chart-box" size={32} color={colors.neutral[600]} />
          <RNText style={styles.emptyText}>No stats available yet</RNText>
        </View>
      </Card>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ] as any}
    >
      <Card style={[styles.card, compact && styles.compactCard] as any}>
        {/* Header */}
        <View style={styles.header}>
          <RNText style={styles.title}>Quick Stats</RNText>
          <RNText style={styles.subtitle}>
            {format(new Date(), 'MMM dd, yyyy')}
          </RNText>
        </View>

        {/* Stats Grid */}
        {compact ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalContent}
          >
            {primaryStats.map(stat => (
              <Animated.View
                key={stat.id}
                style={[
                  styles.statWrapper,
                  { width: cardWidth },
                  selectedStat === stat.id && styles.statSelected,
                  stat.id === 'overdue' && stats.overdueCount > 0 && {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  variant={selectedStat === stat.id ? 'highlight' : 'default'}
                  size="small"
                  trend={stat.trend}
                  change={stat.change}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  badge={stat.badge}
                  compact={true}
                  onPress={() => handleStatPress(stat)}
                />
                {stat.details && (
                  <RNText style={styles.statDetails}>
                    {stat.details}
                  </RNText>
                )}
              </Animated.View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.statsGrid}>
            {groupedStats.map((group, groupIndex) => (
              <View key={groupIndex} style={styles.statsRow}>
                {group.map(stat => (
                  <Animated.View
                    key={stat.id}
                    style={[
                      styles.statWrapper,
                      { width: cardWidth },
                      selectedStat === stat.id && styles.statSelected,
                      stat.id === 'overdue' && stats.overdueCount > 0 && {
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  >
                    <StatCard
                      title={stat.title}
                      value={stat.value}
                      icon={stat.icon}
                      color={stat.color}
                      variant={selectedStat === stat.id ? 'highlight' : 'default'}
                      size="medium"
                      trend={stat.trend}
                      change={stat.change}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                      badge={stat.badge}
                      onPress={() => handleStatPress(stat)}
                    />
                    {stat.details && (
                      <RNText style={styles.statDetails}>
                        {stat.details}
                      </RNText>
                    )}
                  </Animated.View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Insights */}
        {!compact && stats.insights && stats.insights.length > 0 && (
          <View style={styles.insights}>
            <RNText style={styles.insightsTitle}>Insights</RNText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.insightsContent}
            >
              {stats.insights.slice(0, 3).map((insight: string, index: number) => (
                <View key={index} style={styles.insightItem}>
                  <MaterialCommunityIcons name="lightbulb" size={16} color={colors.warning[500]} />
                  <RNText style={styles.insightText} numberOfLines={2}>
                    {insight}
                  </RNText>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadStats}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="refresh" size={16} color={colors.neutral[600]} />
          <RNText style={styles.refreshText}>Updated just now</RNText>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    padding: 16,
  } as any,
  compactCard: {
    padding: 12,
  } as any,
  header: {
    marginBottom: 16,
  } as any,
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
  } as any,
  subtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    marginTop: 2,
  } as any,
  horizontalScroll: {
    marginHorizontal: -16,
  } as any,
  horizontalContent: {
    paddingHorizontal: 16,
    gap: 12,
  } as any,
  statsGrid: {
    gap: 12,
  } as any,
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  } as any,
  statWrapper: {
    position: 'relative',
  } as any,
  statSelected: {
    zIndex: 1,
    elevation: 5,
  } as any,
  statDetails: {
    fontSize: 11,
    color: colors.neutral[600],
    textAlign: 'center',
    marginTop: 4,
  } as any,
  insights: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  } as any,
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 12,
  } as any,
  insightsContent: {
    gap: 12,
  } as any,
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    maxWidth: 200,
  } as any,
  insightText: {
    flex: 1,
    fontSize: 12,
    color: colors.neutral[900],
    lineHeight: 16,
  } as any,
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 8,
  } as any,
  refreshText: {
    fontSize: 12,
    color: colors.neutral[600],
  } as any,
  emptyState: {
    alignItems: 'center',
    padding: 32,
  } as any,
  emptyText: {
    fontSize: 14,
    color: colors.neutral[600],
    marginTop: 8,
  } as any,
});

export default QuickStats;