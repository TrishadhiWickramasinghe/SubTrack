import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useMemo } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

// Types
import Trial from '@models/Trial';

// Hooks
import { useCurrency } from '@hooks/useCurrency';
import useTheme from '@hooks/useTheme';

// Utils

interface TrialCardProps {
  trial: Trial;
  onPress?: (trial: Trial) => void;
  onEdit?: (trial: Trial) => void;
  onDelete?: (trial: Trial) => void;
  onConvert?: (trial: Trial) => void;
  onExtend?: (trial: Trial) => void;
  onCancel?: (trial: Trial) => void;
  onApplyPromo?: (trial: Trial) => void;
  showEngagementScore?: boolean;
  showConversionLikelihood?: boolean;
  showChurnRisk?: boolean;
  compactMode?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

const TrialCard: React.FC<TrialCardProps> = memo(
  ({
    trial,
    onPress,
    onEdit,
    onDelete,
    onConvert,
    onExtend,
    onCancel,
    onApplyPromo,
    showEngagementScore = true,
    showConversionLikelihood = true,
    showChurnRisk = true,
    compactMode = false,
    onSwipeStart,
    onSwipeEnd,
  }) => {
    const theme = useTheme();
    const { formatAmount, primaryCurrency } = useCurrency();

    // Memoized calculations
    const {
      daysRemaining,
      daysElapsed,
      isExpiringSoon,
      isExpired,
      isConverted,
      isCancelled,
      isActive,
      endDate,
      formattedTrialPrice,
      formattedFullPrice,
      trialProgressPercentage,
      gradientColors,
      statusColor,
      engagementColor,
      conversionColor,
      churnRiskColor,
    } = useMemo(() => {
      const now = new Date();
      const start = new Date(trial.startDate);
      const end = new Date(trial.endDate);

      const totalMs = end.getTime() - start.getTime();
      const elapsedMs = now.getTime() - start.getTime();
      const remainingMs = Math.max(0, end.getTime() - now.getTime());

      const daysRemain = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      const daysElaps = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));

      const progress = totalMs > 0 ? (elapsedMs / totalMs) * 100 : 0;

      const isExp = now > end;
      const isExpiringSoonStatus = daysRemain <= 3 && daysRemain > 0;

      return {
        daysRemaining: isExp ? 0 : daysRemain,
        daysElapsed: Math.max(0, daysElaps),
        isExpiringSoon: isExpiringSoonStatus,
        isExpired: isExp,
        isConverted: trial.status === 'converted',
        isCancelled: trial.status === 'cancelled',
        isActive: trial.status === 'active',
        endDate: end,
        formattedTrialPrice: formatAmount(
          trial.trialPrice,
          trial.currency || primaryCurrency
        ),
        formattedFullPrice: formatAmount(
          trial.fullPrice,
          trial.currency || primaryCurrency
        ),
        trialProgressPercentage: Math.min(100, progress),
        gradientColors: getGradientColors(trial.status, theme.theme.colors),
        statusColor: getStatusColor(trial.status, theme.theme.colors),
        engagementColor: getScoreColor(trial.engagementScore, theme.theme.colors),
        conversionColor: getScoreColor(
          trial.conversionLikelihood,
          theme.theme.colors
        ),
        churnRiskColor: getScoreColor(trial.churnRiskScore, theme.theme.colors),
      };
    }, [trial, theme, formatAmount, primaryCurrency]);

    // Handlers
    const handlePress = useCallback(() => {
      if (onPress) {
        onPress(trial);
      }
    }, [onPress, trial]);

    const handleLongPress = useCallback(() => {
      Vibration.vibrate(50);
    }, []);

    const handleEdit = useCallback(() => {
      if (onEdit) onEdit(trial);
    }, [onEdit, trial]);

    const handleDelete = useCallback(() => {
      if (onDelete) onDelete(trial);
    }, [onDelete, trial]);

    const handleConvert = useCallback(() => {
      if (onConvert) onConvert(trial);
    }, [onConvert, trial]);

    const handleExtend = useCallback(() => {
      if (onExtend) onExtend(trial);
    }, [onExtend, trial]);

    const handleCancel = useCallback(() => {
      if (onCancel) onCancel(trial);
    }, [onCancel, trial]);

    const handleApplyPromo = useCallback(() => {
      if (onApplyPromo) onApplyPromo(trial);
    }, [onApplyPromo, trial]);

    // Swipe actions
    const renderRightActions = useCallback(
      (
        progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
      ) => {
        const scale = dragX.interpolate({
          inputRange: [-100, 0],
          outputRange: [1, 0],
          extrapolate: 'clamp',
        });

        return (
          <View style={styles.swipeActions}>
            {/* Convert Action */}
            {isActive && (
              <Animated.View style={{ transform: [{ scale }] }}>
                <TouchableOpacity
                  style={[styles.swipeAction, styles.convertAction]}
                  onPress={handleConvert}
                >
                  <Icon name="credit-card" size={20} color="#fff" />
                  <Text style={styles.swipeActionText}>Convert</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Extend Action */}
            {isActive && (
              <Animated.View style={{ transform: [{ scale }] }}>
                <TouchableOpacity
                  style={[styles.swipeAction, styles.extendAction]}
                  onPress={handleExtend}
                >
                  <Icon name="clock-plus" size={20} color="#fff" />
                  <Text style={styles.swipeActionText}>Extend</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Delete Action */}
            <Animated.View style={{ transform: [{ scale }] }}>
              <TouchableOpacity
                style={[styles.swipeAction, styles.deleteAction]}
                onPress={handleDelete}
              >
                <Icon name="trash-can" size={20} color="#fff" />
                <Text style={styles.swipeActionText}>Delete</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      },
      [isActive, handleConvert, handleExtend, handleDelete]
    );

    if (compactMode) {
      return (
        <Swipeable
          overshootRight={false}
          renderRightActions={renderRightActions}
          onSwipeableWillOpen={onSwipeStart}
          onSwipeableWillClose={onSwipeEnd}
        >
          <TouchableOpacity
            onPress={handlePress}
            onLongPress={handleLongPress}
            activeOpacity={0.7}
            style={styles.compactContainer}
          >
            <LinearGradient
              colors={gradientColors as unknown as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.compactGradient}
            >
              <View style={styles.compactHeader}>
                <View style={styles.compactTitleWrapper}>
                  <Text style={styles.compactTitle} numberOfLines={1}>
                    {trial.subscriptionName}
                  </Text>
                  <View style={styles.compactStatusBadge}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: statusColor },
                      ]}
                    />
                    <Text style={styles.compactStatusText}>
                      {isExpired
                        ? 'Expired'
                        : isConverted
                          ? 'Converted'
                          : isCancelled
                            ? 'Cancelled'
                            : `${daysRemaining}d left`}
                    </Text>
                  </View>
                </View>

                {isExpiringSoon && (
                  <Icon name="alert-circle" size={20} color="#FF9800" />
                )}
              </View>

              <View style={styles.compactFooter}>
                <Text style={styles.compactPrice}>{formattedTrialPrice}</Text>
                <View style={styles.compactProgressBar}>
                  <View
                    style={[
                      styles.compactProgressFill,
                      {
                        width: `${trialProgressPercentage}%`,
                        backgroundColor: statusColor,
                      },
                    ]}
                  />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Swipeable>
      );
    }

    return (
      <Swipeable
        overshootRight={false}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={onSwipeStart}
        onSwipeableWillClose={onSwipeEnd}
      >
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
          style={styles.container}
        >
          <LinearGradient
            colors={gradientColors as unknown as readonly [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title} numberOfLines={1}>
                  {trial.subscriptionName}
                </Text>
                <Text style={styles.planName} numberOfLines={1}>
                  {trial.planName || trial.type}
                </Text>
              </View>

              <View style={styles.headerRight}>
                {isExpiringSoon && (
                  <View style={styles.urgencyBadge}>
                    <Icon name="alert" size={16} color="#fff" />
                  </View>
                )}
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor + '20' },
                  ]}
                >
                  <View
                    style={[styles.statusDot, { backgroundColor: statusColor }]}
                  />
                  <Text
                    style={[styles.statusText, { color: statusColor }]}
                    numberOfLines={1}
                  >
                    {isExpired
                      ? 'Expired'
                      : isConverted
                        ? 'Converted'
                        : isCancelled
                          ? 'Cancelled'
                          : 'Active'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <View>
                  <Text style={styles.labelSmall}>Days elapsed</Text>
                  <Text style={styles.valueLarge}>{daysElapsed}</Text>
                </View>
                <View>
                  <Text style={styles.labelSmall}>Days remaining</Text>
                  <Text
                    style={[
                      styles.valueLarge,
                      { color: isExpiringSoon ? '#FF9800' : '#4CAF50' },
                    ]}
                  >
                    {daysRemaining}
                  </Text>
                </View>
                <View>
                  <Text style={styles.labelSmall}>Total days</Text>
                  <Text style={styles.valueLarge}>{trial.totalDays}</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${trialProgressPercentage}%`,
                      backgroundColor: statusColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(trialProgressPercentage)}% complete
              </Text>
            </View>

            {/* Pricing Section */}
            <View style={styles.pricingSection}>
              <View style={styles.priceRow}>
                <Text style={styles.labelMedium}>Trial Price:</Text>
                <Text style={styles.priceBold}>{formattedTrialPrice}</Text>
              </View>
              {trial.discountPercentage > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.labelMedium}>Discount:</Text>
                  <Text style={styles.discountText}>
                    {trial.discountPercentage}% off
                  </Text>
                </View>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.labelMedium}>Full Price:</Text>
                <Text style={styles.priceRegular}>{formattedFullPrice}</Text>
              </View>
            </View>

            {/* Metrics Section (if indicators enabled) */}
            {(showEngagementScore ||
              showConversionLikelihood ||
              showChurnRisk) && (
              <View style={styles.metricsSection}>
                {showEngagementScore && (
                  <View style={styles.metricItem}>
                    <View style={styles.metricHeader}>
                      <Icon
                        name="lightning-bolt"
                        size={16}
                        color={engagementColor}
                      />
                      <Text style={styles.metricLabel}>Engagement</Text>
                    </View>
                    <View style={styles.metricBar}>
                      <View
                        style={[
                          styles.metricFill,
                          {
                            width: `${trial.engagementScore}%`,
                            backgroundColor: engagementColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.metricValue}>
                      {trial.engagementScore}%
                    </Text>
                  </View>
                )}

                {showConversionLikelihood && (
                  <View style={styles.metricItem}>
                    <View style={styles.metricHeader}>
                      <Icon
                        name="target"
                        size={16}
                        color={conversionColor}
                      />
                      <Text style={styles.metricLabel}>Conversion</Text>
                    </View>
                    <View style={styles.metricBar}>
                      <View
                        style={[
                          styles.metricFill,
                          {
                            width: `${trial.conversionLikelihood}%`,
                            backgroundColor: conversionColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.metricValue}>
                      {trial.conversionLikelihood}%
                    </Text>
                  </View>
                )}

                {showChurnRisk && (
                  <View style={styles.metricItem}>
                    <View style={styles.metricHeader}>
                      <Icon
                        name="alert-octagon"
                        size={16}
                        color={churnRiskColor}
                      />
                      <Text style={styles.metricLabel}>Churn Risk</Text>
                    </View>
                    <View style={styles.metricBar}>
                      <View
                        style={[
                          styles.metricFill,
                          {
                            width: `${trial.churnRiskScore}%`,
                            backgroundColor: churnRiskColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.metricValue}>
                      {trial.churnRiskScore}%
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Action Buttons */}
            {isActive && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.convertButton]}
                  onPress={handleConvert}
                >
                  <Icon name="credit-card" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Convert</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.extendButton]}
                  onPress={handleExtend}
                >
                  <Icon name="clock-plus" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Extend</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Icon name="close" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Promo Code Section */}
            {trial.promoCode && (
              <View style={styles.promoSection}>
                <View style={styles.promoContent}>
                  <Icon name="tag" size={18} color="#FF9800" />
                  <View style={styles.promoText}>
                    <Text style={styles.promoCode}>{trial.promoCode}</Text>
                    <Text style={styles.promoDescription} numberOfLines={1}>
                      {trial.promoDescription}
                    </Text>
                  </View>
                </View>
                {!isConverted && (
                  <TouchableOpacity onPress={handleApplyPromo}>
                    <Icon name="chevron-right" size={20} color="#FF9800" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Swipeable>
    );
  }
);

TrialCard.displayName = 'TrialCard';

// Helper functions
function getGradientColors(
  status: string,
  colors: Record<string, string>
): string[] {
  switch (status) {
    case 'active':
      return ['#4CAF5020', '#45a04920'];
    case 'converted':
      return ['#2196F320', '#1976D220'];
    case 'expired':
      return ['#F4433620', '#E5393520'];
    case 'cancelled':
      return ['#95959520', '#75757520'];
    default:
      return [colors.primary + '20', colors.primary + '10'];
  }
}

function getStatusColor(status: string, colors: Record<string, string>): string {
  switch (status) {
    case 'active':
      return '#4CAF50';
    case 'converted':
      return '#2196F3';
    case 'expired':
      return '#F44336';
    case 'cancelled':
      return '#757575';
    default:
      return colors.primary;
  }
}

function getScoreColor(score: number, colors: Record<string, string>): string {
  if (score >= 70) return '#4CAF50'; // Green - High
  if (score >= 40) return '#FF9800'; // Orange - Medium
  return '#F44336'; // Red - Low
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    padding: 16,
  },
  compactContainer: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  compactGradient: {
    padding: 12,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactTitleWrapper: {
    flex: 1,
    marginRight: 8,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  compactStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactStatusText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  compactFooter: {
    marginTop: 8,
  },
  compactPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  compactProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  planName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgencyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  labelSmall: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  valueLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  pricingSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelMedium: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  priceBold: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  priceRegular: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'line-through',
  },
  discountText: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '600',
  },
  metricsSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  metricItem: {
    marginBottom: 10,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  metricBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 2,
  },
  metricFill: {
    height: '100%',
  },
  metricValue: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  convertButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
  },
  extendButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  cancelButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  promoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  promoText: {
    flex: 1,
  },
  promoCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: 2,
  },
  promoDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeAction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minWidth: 80,
  },
  convertAction: {
    backgroundColor: '#2196F3',
  },
  extendAction: {
    backgroundColor: '#4CAF50',
  },
  deleteAction: {
    backgroundColor: '#F44336',
  },
  swipeActionText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    marginTop: 4,
  },
});

export default TrialCard;
