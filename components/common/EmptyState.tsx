import { colors, spacing } from '@config/theme';
import LottieView from 'lottie-react-native';
import React from 'react';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface EmptyStateProps {
  type?: 'subscription' | 'analytics' | 'budget' | 'trial' | 'search' | 'error' | 'custom';
  title?: string;
  message?: string;
  imageSource?: ImageSourcePropType;
  lottieAnimation?: any;
  actionLabel?: string;
  onActionPress?: () => void;
  secondaryActionLabel?: string;
  onSecondaryActionPress?: () => void;
  style?: ViewStyle;
  imageStyle?: any;
  testID?: string;
  compact?: boolean;
  icon?: React.ReactNode;
  showBorder?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'subscription',
  title,
  message,
  imageSource,
  lottieAnimation,
  actionLabel,
  onActionPress,
  secondaryActionLabel,
  onSecondaryActionPress,
  style,
  imageStyle,
  testID = 'empty-state',
  compact = false,
  icon,
  showBorder = false,
}) => {
  const getDefaultConfig = () => {
    const configs = {
      subscription: {
        title: 'No Subscriptions Yet',
        message: 'Start tracking your subscriptions by adding your first service.',
        lottie: require('@assets/animations/empty-subscription.json'),
        action: 'Add Subscription',
      },
      analytics: {
        title: 'No Data Available',
        message: 'Add subscriptions to see your spending analytics and insights.',
        lottie: require('@assets/animations/empty-analytics.json'),
        action: 'View Dashboard',
      },
      budget: {
        title: 'No Budget Set',
        message: 'Set up a budget to track your subscription spending against limits.',
        lottie: require('@assets/animations/empty-budget.json'),
        action: 'Create Budget',
      },
      trial: {
        title: 'No Active Trials',
        message: 'Add free trials to track them and get reminders before they end.',
        lottie: require('@assets/animations/empty-trial.json'),
        action: 'Add Free Trial',
      },
      search: {
        title: 'No Results Found',
        message: 'Try different keywords or filters to find what you\'re looking for.',
        lottie: require('@assets/animations/empty-search.json'),
        action: 'Clear Filters',
      },
      error: {
        title: 'Something Went Wrong',
        message: 'We couldn\'t load the data. Please check your connection and try again.',
        lottie: require('@assets/animations/empty-error.json'),
        action: 'Retry',
      },
      custom: {
        title: '',
        message: '',
        lottie: null,
        action: '',
      },
    };

    return configs[type] || configs.subscription;
  };

  const defaultConfig = getDefaultConfig();
  const finalTitle = title || defaultConfig.title;
  const finalMessage = message || defaultConfig.message;
  const finalActionLabel = actionLabel || defaultConfig.action;
  const finalLottieAnimation = lottieAnimation || defaultConfig.lottie;

  return (
    <View
      style={[
        styles.container,
        compact && styles.compactContainer,
        showBorder && styles.bordered,
        style,
      ]}
      testID={testID}>
      {/* Icon/Image/Lottie */}
      <View style={styles.imageContainer}>
        {icon ? (
          <View style={styles.iconContainer}>{icon}</View>
        ) : imageSource ? (
          <Image
            source={imageSource}
            style={[styles.image, imageStyle]}
            resizeMode="contain"
          />
        ) : finalLottieAnimation ? (
          <LottieView
            source={finalLottieAnimation}
            autoPlay
            loop
            style={[styles.lottie, compact && styles.compactLottie]}
          />
        ) : (
          <View style={[styles.placeholderIcon, compact && styles.compactIcon]}>
            <Text style={styles.placeholderText}>📊</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={[styles.title, compact && styles.compactTitle]}>{finalTitle}</Text>

      {/* Message */}
      <Text style={[styles.message, compact && styles.compactMessage]}>
        {finalMessage}
      </Text>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {actionLabel && onActionPress && (
          <TouchableOpacity
            style={[styles.actionButton, compact && styles.compactActionButton]}
            onPress={onActionPress}
            activeOpacity={0.7}>
            <Text style={styles.actionButtonText}>{finalActionLabel}</Text>
          </TouchableOpacity>
        )}

        {secondaryActionLabel && onSecondaryActionPress && (
          <TouchableOpacity
            style={[styles.secondaryActionButton, compact && styles.compactSecondaryButton]}
            onPress={onSecondaryActionPress}
            activeOpacity={0.7}>
            <Text style={styles.secondaryActionButtonText}>
              {secondaryActionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tips or Additional Info */}
      {!compact && type === 'subscription' && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Quick Tips:</Text>
          <Text style={styles.tip}>• Start with your streaming services</Text>
          <Text style={styles.tip}>• Add recurring bills like gym memberships</Text>
          <Text style={styles.tip}>• Don't forget free trials with end dates</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  compactContainer: {
    paddingVertical: spacing.lg,
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginHorizontal: spacing.md,
  },
  imageContainer: {
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 150,
    maxWidth: '100%',
  },
  lottie: {
    width: 200,
    height: 200,
  },
  compactLottie: {
    width: 120,
    height: 120,
  },
  placeholderIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderText: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  compactTitle: {
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  compactMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
    maxWidth: 250,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  compactActionButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 120,
  },
  actionButtonText: {
    color: colors.surface,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  secondaryActionButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 160,
    alignItems: 'center',
  },
  compactSecondaryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 120,
  },
  secondaryActionButtonText: {
    color: colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  tipsContainer: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.lg,
    borderRadius: 8,
    marginTop: spacing.lg,
    width: '100%',
    maxWidth: 320,
  },
  tipsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tip: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    marginVertical: 2,
  },
});

export default EmptyState;