import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import React, { memo, useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Types
import Trial from '@models/Trial';

// Hooks
import useTheme from '@hooks/useTheme';

interface ActiveTrialsProps {
  trials: Trial[];
  loading?: boolean;
  onRefresh?: () => void;
  onTrialPress?: (trial: Trial) => void;
  onExtend?: (trial: Trial) => void;
  onConvert?: (trial: Trial) => void;
  onCancel?: (trial: Trial) => void;
  sortBy?: 'daysRemaining' | 'engagement' | 'conversion' | 'churn';
  filterHighRisk?: boolean;
  filterHighEngagement?: boolean;
  showMetrics?: boolean;
  compactMode?: boolean;
}

interface ActiveTrialData {
  trial: Trial;
  daysRemaining: number;
  isExpiringSoon: boolean;
  engagementLevel: 'high' | 'medium' | 'low';
  conversionLevel: 'high' | 'medium' | 'low';
  churnLevel: 'high' | 'medium' | 'low';
}

const ActiveTrials: React.FC<ActiveTrialsProps> = memo(
  ({
    trials,
    loading = false,
    onRefresh,
    onTrialPress,
    onExtend,
    onConvert,
    onCancel,
    sortBy = 'daysRemaining',
    filterHighRisk = false,
    filterHighEngagement = false,
    showMetrics = true,
    compactMode = false,
  }) => {
    const theme = useTheme();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Process active trials
    const processedTrials = useMemo(() => {
      const now = new Date();
      const activeTrialData: ActiveTrialData[] = [];

      trials
        .filter((trial) => trial.status === 'active')
        .forEach((trial) => {
          const endDate = new Date(trial.endDate);
          const daysUntilEnd = Math.ceil(
            (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Skip expired trials
          if (daysUntilEnd <= 0) return;

          const engagementLevel =
            trial.engagementScore >= 70
              ? 'high'
              : trial.engagementScore >= 40
                ? 'medium'
                : 'low';

          const conversionLevel =
            trial.conversionLikelihood >= 70
              ? 'high'
              : trial.conversionLikelihood >= 40
                ? 'medium'
                : 'low';

          const churnLevel =
            trial.churnRiskScore >= 70
              ? 'high'
              : trial.churnRiskScore >= 40
                ? 'medium'
                : 'low';

          activeTrialData.push({
            trial,
            daysRemaining: daysUntilEnd,
            isExpiringSoon: daysUntilEnd <= 3,
            engagementLevel,
            conversionLevel,
            churnLevel,
          });
        });

      // Apply filters
      let filtered = activeTrialData;

      if (filterHighRisk) {
        filtered = filtered.filter((item) => item.churnLevel === 'high');
      }

      if (filterHighEngagement) {
        filtered = filtered.filter((item) => item.engagementLevel === 'high');
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'daysRemaining':
            return a.daysRemaining - b.daysRemaining;
          case 'engagement':
            return b.trial.engagementScore - a.trial.engagementScore;
          case 'conversion':
            return b.trial.conversionLikelihood - a.trial.conversionLikelihood;
          case 'churn':
            return b.trial.churnRiskScore - a.trial.churnRiskScore;
          default:
            return a.daysRemaining - b.daysRemaining;
        }
      });

      return filtered;
    }, [trials, sortBy, filterHighRisk, filterHighEngagement]);

    // Calculate summary metrics
    const metrics = useMemo(() => {
      if (processedTrials.length === 0) {
        return {
          total: 0,
          expiringSoon: 0,
          highEngagement: 0,
          highChurnRisk: 0,
          avgEngagement: 0,
          avgConversion: 0,
        };
      }

      return {
        total: processedTrials.length,
        expiringSoon: processedTrials.filter((item) => item.isExpiringSoon).length,
        highEngagement: processedTrials.filter((item) => item.engagementLevel === 'high').length,
        highChurnRisk: processedTrials.filter((item) => item.churnLevel === 'high').length,
        avgEngagement: Math.round(
          processedTrials.reduce((sum, item) => sum + item.trial.engagementScore, 0) /
            processedTrials.length
        ),
        avgConversion: Math.round(
          processedTrials.reduce((sum, item) => sum + item.trial.conversionLikelihood, 0) /
            processedTrials.length
        ),
      };
    }, [processedTrials]);

    // Get engagement color
    const getEngagementColor = useCallback((level: string): string => {
      switch (level) {
        case 'high':
          return '#4CAF50';
        case 'medium':
          return '#FF9800';
        case 'low':
          return '#F44336';
        default:
          return '#757575';
      }
    }, []);

    // Render metric card
    const renderMetricCard = useCallback(
      (
        label: string,
        value: number | string,
        icon: string,
        color: string
      ) => (
        <View style={[styles.metricCard, { backgroundColor: color + '15' }]}>
          <View style={[styles.metricCardIcon, { backgroundColor: color }]}>
            <Icon name={icon as any} size={18} color="#fff" />
          </View>
          <View style={styles.metricCardContent}>
            <Text style={[styles.metricCardLabel, { color: theme.theme.colors.textSecondary }]}>
              {label}
            </Text>
            <Text style={[styles.metricCardValue, { color }]}>
              {value}
            </Text>
          </View>
        </View>
      ),
      [theme.theme.colors.textSecondary]
    );

    // Render trial item
    const renderTrialItem = useCallback(
      ({ item }: { item: ActiveTrialData }) => {
        const isExpanded = expandedId === item.trial.id;
        const progressPercentage =
          ((item.trial.totalDays - item.daysRemaining) / item.trial.totalDays) * 100;

        return (
          <TouchableOpacity
            style={[
              styles.trialItem,
              {
                backgroundColor: theme.theme.colors.card,
                borderColor: item.isExpiringSoon ? '#FF9800' : theme.theme.colors.border,
              },
            ]}
            onPress={() => {
              setExpandedId(isExpanded ? null : item.trial.id);
              if (onTrialPress && !isExpanded) {
                onTrialPress(item.trial);
              }
            }}
            activeOpacity={0.7}
          >
            {/* Main Trial Info */}
            <View style={styles.trialItemHeader}>
              {/* Left Content */}
              <View style={styles.trialItemLeft}>
                <View
                  style={[
                    styles.trialTypeIcon,
                    { backgroundColor: getEngagementColor(item.engagementLevel) + '20' },
                  ]}
                >
                  <Icon
                    name="play-circle-outline"
                    size={20}
                    color={getEngagementColor(item.engagementLevel)}
                  />
                </View>

                <View style={styles.trialItemTexts}>
                  <Text
                    style={[
                      styles.trialItemTitle,
                      { color: theme.theme.colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {item.trial.subscriptionName}
                  </Text>
                  <Text
                    style={[
                      styles.trialItemPlan,
                      { color: theme.theme.colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {item.trial.planName || 'Free Trial'}
                  </Text>
                </View>
              </View>

              {/* Right Content */}
              <View style={styles.trialItemRight}>
                <View style={styles.daysRemainingBadge}>
                  <Text
                    style={[
                      styles.daysRemainingText,
                      {
                        color: item.isExpiringSoon ? '#FF9800' : '#4CAF50',
                      },
                    ]}
                  >
                    {item.daysRemaining}d
                  </Text>
                </View>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.theme.colors.textSecondary}
                />
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.theme.colors.border },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progressPercentage}%`,
                      backgroundColor: item.isExpiringSoon ? '#FF9800' : '#4CAF50',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.theme.colors.textSecondary }]}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>

            {/* Quick Metrics */}
            {showMetrics && !compactMode && (
              <View style={styles.quickMetrics}>
                <View style={styles.metricItem}>
                  <Icon
                    name="lightning-bolt"
                    size={14}
                    color={getEngagementColor(item.engagementLevel)}
                  />
                  <Text
                    style={[
                      styles.metricItemText,
                      { color: getEngagementColor(item.engagementLevel) },
                    ]}
                  >
                    {item.trial.engagementScore}%
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Icon
                    name="target"
                    size={14}
                    color={getEngagementColor(item.conversionLevel)}
                  />
                  <Text
                    style={[
                      styles.metricItemText,
                      { color: getEngagementColor(item.conversionLevel) },
                    ]}
                  >
                    {item.trial.conversionLikelihood}%
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Icon
                    name="alert-octagon"
                    size={14}
                    color={getEngagementColor(item.churnLevel)}
                  />
                  <Text
                    style={[
                      styles.metricItemText,
                      { color: getEngagementColor(item.churnLevel) },
                    ]}
                  >
                    {item.trial.churnRiskScore}%
                  </Text>
                </View>
              </View>
            )}

            {/* Expanded Actions */}
            {isExpanded && !compactMode && (
              <View style={[styles.expandedContent, { borderTopColor: theme.theme.colors.border }]}>
                {/* Details */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailGridItem}>
                    <Text style={[styles.detailLabel, { color: theme.theme.colors.textSecondary }]}>
                      End Date
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.theme.colors.text }]}>
                      {new Date(item.trial.endDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={[styles.detailLabel, { color: theme.theme.colors.textSecondary }]}>
                      Days Elapsed
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.theme.colors.text }]}>
                      {item.trial.totalDays - item.daysRemaining}
                    </Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={[styles.detailLabel, { color: theme.theme.colors.textSecondary }]}>
                      Trial Price
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.theme.colors.text }]}>
                      {item.trial.currency} {item.trial.trialPrice}
                    </Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={[styles.detailLabel, { color: theme.theme.colors.textSecondary }]}>
                      Full Price
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.theme.colors.text }]}>
                      {item.trial.currency} {item.trial.fullPrice}
                    </Text>
                  </View>
                </View>

                {/* Promo Code */}
                {item.trial.promoCode && (
                  <View style={[styles.promoSection, { backgroundColor: '#FF980010' }]}>
                    <Icon name="tag" size={16} color="#FF9800" />
                    <Text style={[styles.promoCode, { color: '#FF9800' }]}>
                      {item.trial.promoCode}
                    </Text>
                    <Text style={[styles.promoDescription, { color: theme.theme.colors.textSecondary }]}>
                      {item.trial.promoDescription}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtonsGrid}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.extendAction]}
                    onPress={() => onExtend && onExtend(item.trial)}
                  >
                    <Icon name="clock-plus" size={16} color="#4CAF50" />
                    <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>
                      Extend
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.convertAction]}
                    onPress={() => onConvert && onConvert(item.trial)}
                  >
                    <Icon name="credit-card" size={16} color="#2196F3" />
                    <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>
                      Convert
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelAction]}
                    onPress={() => onCancel && onCancel(item.trial)}
                  >
                    <Icon name="close-circle" size={16} color="#F44336" />
                    <Text style={[styles.actionButtonText, { color: '#F44336' }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      },
      [
        theme.theme.colors.card,
        theme.theme.colors.border,
        theme.theme.colors.text,
        theme.theme.colors.textSecondary,
        expandedId,
        onTrialPress,
        onExtend,
        onConvert,
        onCancel,
        showMetrics,
        compactMode,
        getEngagementColor,
      ]
    );

    // Empty state
    if (!loading && processedTrials.length === 0) {
      return (
        <View style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
          <View style={styles.emptyState}>
            <Icon
              name="play-circle-outline"
              size={48}
              color={theme.theme.colors.textSecondary}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.theme.colors.text }]}>
              No Active Trials
            </Text>
            <Text style={[styles.emptyStateText, { color: theme.theme.colors.textSecondary }]}>
              {filterHighRisk
                ? 'No high-risk trials at the moment'
                : filterHighEngagement
                  ? 'No highly engaged trials'
                  : 'All your trial subscriptions have ended'}
            </Text>
          </View>
        </View>
      );
    }

    // Compact mode
    if (compactMode) {
      return (
        <FlatList
          data={processedTrials}
          renderItem={renderTrialItem}
          keyExtractor={(item) => item.trial.id}
          scrollEnabled={false}
          style={{ marginHorizontal: 12, marginVertical: 8 }}
        />
      );
    }

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.theme.colors.background }]}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {/* Metrics Section */}
        {showMetrics && (
          <View style={styles.metricsSection}>
            <Text style={[styles.sectionTitle, { color: theme.theme.colors.text }]}>
              Overview
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.metricsScroll}
            >
              {renderMetricCard('Active Trials', metrics.total, 'play-circle', '#4CAF50')}
              {renderMetricCard('Expiring Soon', metrics.expiringSoon, 'alert', '#FF9800')}
              {renderMetricCard('High Engagement', metrics.highEngagement, 'lightning-bolt', '#4CAF50')}
              {renderMetricCard('High Churn Risk', metrics.highChurnRisk, 'alert-octagon', '#F44336')}
            </ScrollView>

            <View style={styles.averageMetrics}>
              <View style={styles.avgMetricItem}>
                <Text style={[styles.avgMetricLabel, { color: theme.theme.colors.textSecondary }]}>
                  Avg Engagement
                </Text>
                <Text style={[styles.avgMetricValue, { color: '#4CAF50' }]}>
                  {metrics.avgEngagement}%
                </Text>
              </View>
              <View style={styles.avgMetricDivider} />
              <View style={styles.avgMetricItem}>
                <Text style={[styles.avgMetricLabel, { color: theme.theme.colors.textSecondary }]}>
                  Avg Conversion
                </Text>
                <Text style={[styles.avgMetricValue, { color: '#2196F3' }]}>
                  {metrics.avgConversion}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Trials List */}
        <View style={styles.trialsSection}>
          <Text style={[styles.sectionTitle, { color: theme.theme.colors.text }]}>
            {filterHighRisk
              ? 'High Risk Trials'
              : filterHighEngagement
                ? 'Highly Engaged Trials'
                : 'Active Trials'}
          </Text>
          <FlatList
            data={processedTrials}
            renderItem={renderTrialItem}
            keyExtractor={(item) => item.trial.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    );
  }
);

ActiveTrials.displayName = 'ActiveTrials';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  metricsSection: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  metricsScroll: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 140,
  },
  metricCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  metricCardContent: {
    flex: 1,
  },
  metricCardLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  metricCardValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  averageMetrics: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-around',
  },
  avgMetricItem: {
    alignItems: 'center',
    flex: 1,
  },
  avgMetricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  avgMetricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  avgMetricDivider: {
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginHorizontal: 16,
  },
  trialsSection: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  trialItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  trialItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trialItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  trialTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trialItemTexts: {
    flex: 1,
  },
  trialItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  trialItemPlan: {
    fontSize: 12,
  },
  trialItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  daysRemainingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  daysRemainingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 30,
  },
  quickMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricItemText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandedContent: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 12,
  },
  detailGridItem: {
    flex: 1,
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  promoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
    gap: 8,
  },
  promoCode: {
    fontSize: 12,
    fontWeight: '700',
  },
  promoDescription: {
    fontSize: 11,
  },
  actionButtonsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  extendAction: {
    borderColor: '#4CAF50',
  },
  convertAction: {
    borderColor: '#2196F3',
  },
  cancelAction: {
    borderColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 13,
  },
});

export default ActiveTrials;
