import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import React, { memo, useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Components
import { Card } from '@components/common';
import { colors } from '@config/colors';
import { spacing } from '@config/theme';

type AlertType = 'error' | 'warning' | 'info' | 'success';
type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

interface BudgetAlertProps {
  type: AlertType;
  title: string;
  message?: string;
  severity?: AlertSeverity;
  icon?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  variant?: 'compact' | 'detailed';
  animated?: boolean;
  style?: any;
  testID?: string;
}

export const BudgetAlert: React.FC<BudgetAlertProps> = memo(({
  type,
  title,
  message,
  severity = 'medium',
  icon,
  dismissible = true,
  onDismiss,
  onAction,
  actionLabel = 'View Details',
  variant = 'compact',
  animated = true,
  style,
  testID = 'budget-alert',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Get color based on type
  const getAlertColor = () => {
    switch (type) {
      case 'error':
        return colors.error[500];
      case 'warning':
        return colors.warning[500];
      case 'success':
        return colors.success[500];
      default:
        return colors.info?.[500] || colors.primary[500];
    }
  };

  // Get background color
  const getAlertBgColor = () => {
    switch (type) {
      case 'error':
        return colors.error[50];
      case 'warning':
        return colors.warning[50];
      case 'success':
        return colors.success[50];
      default:
        return colors.primary[50];
    }
  };

  // Get default icon
  const getDefaultIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      case 'success':
        return 'check-circle';
      default:
        return 'information';
    }
  };

  // Get border color
  const getBorderColor = () => {
    const alertColor = getAlertColor();
    return alertColor + '30';
  };

  // Animate on mount
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
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
    } else {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [fadeAnim, slideAnim, scaleAnim, animated]);

  const handleDismiss = () => {
    if (onDismiss) {
      Haptics.selectionAsync();
      onDismiss();
    }
  };

  const handleAction = () => {
    if (onAction) {
      Haptics.selectionAsync();
      onAction();
    }
  };

  // Dynamic style functions
  const getAlertContainerStyle = () => ({
    borderLeftWidth: 4,
    borderLeftColor: getAlertColor(),
    backgroundColor: getAlertBgColor(),
    borderRadius: 8,
  });

  const getDetailedIconContainerStyle = (bgColor: string) => ({
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: bgColor,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    flexShrink: 0,
  });

  const getSeverityBadgeStyle = (color: string) => ({
    alignSelf: 'flex-start' as const,
    backgroundColor: color + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
  });

  const getDetailedActionButtonStyle = (color: string) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    backgroundColor: color + '10',
    marginTop: spacing.md,
  });

  // Compact variant
  if (variant === 'compact') {
    return (
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
          style,
        ]}
        testID={testID}
      >
        <Card
          variant="outlined"
          padding="md"
          style={[
            getAlertContainerStyle(),
            { borderWidth: 0, paddingLeft: spacing.md },
          ] as any}
        >
          <View style={styles.compactContainer}>
            {/* Icon and Content */}
            <View style={styles.compactContent}>
              <View style={styles.compactHeader}>
                <MaterialCommunityIcons
                  name={getDefaultIcon() as any}
                  size={18}
                  color={getAlertColor()}
                />
                <Text
                  style={[
                    styles.compactTitle,
                    { color: getAlertColor() },
                  ]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              </View>
              {message && (
                <Text style={styles.compactMessage} numberOfLines={2}>
                  {message}
                </Text>
              )}
            </View>

            {/* Action Button */}
            {dismissible && (
              <TouchableOpacity
                onPress={handleDismiss}
                style={styles.compactCloseButton}
                activeOpacity={0.6}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={18}
                  color={getAlertColor()}
                />
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </Animated.View>
    );
  }

  // Detailed variant
  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
        style,
      ]}
      testID={testID}
    >
      <Card
        variant="outlined"
        padding="lg"
        style={[
          getAlertContainerStyle(),
          { borderWidth: 1, borderColor: getBorderColor() },
        ] as any}
      >
        {/* Header */}
        <View style={styles.detailedHeader}>
          <View style={getDetailedIconContainerStyle(getAlertBgColor())}>
            <MaterialCommunityIcons
              name={getDefaultIcon() as any}
              size={24}
              color={getAlertColor()}
            />
          </View>
          <View style={styles.detailedTitleContainer}>
            <Text style={[
              styles.detailedTitle,
              { color: getAlertColor() },
            ]}>
              {title}
            </Text>
            {severity === 'critical' && (
              <View style={getSeverityBadgeStyle(getAlertColor())}>
                <Text style={styles.severityText}>Critical</Text>
              </View>
            )}
          </View>
          {dismissible && (
            <TouchableOpacity
              onPress={handleDismiss}
              style={styles.detailedCloseButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={getAlertColor()}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Message */}
        {message && (
          <Text style={styles.detailedMessage}>
            {message}
          </Text>
        )}

        {/* Action Footer */}
        {onAction && (
          <TouchableOpacity
            onPress={handleAction}
            style={getDetailedActionButtonStyle(getAlertColor())}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.detailedActionText,
              { color: getAlertColor() },
            ]}>
              {actionLabel}
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color={getAlertColor()}
            />
          </TouchableOpacity>
        )}
      </Card>
    </Animated.View>
  );
});

BudgetAlert.displayName = 'BudgetAlert';

const styles = StyleSheet.create({
  // Compact Styles
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  compactContent: {
    flex: 1,
    gap: spacing.xs,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  compactMessage: {
    fontSize: 12,
    color: colors.neutral[700],
    lineHeight: 16,
  },
  compactCloseButton: {
    padding: 4,
    marginTop: -4,
  },

  // Detailed Styles
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  detailedTitleContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  detailedTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  detailedCloseButton: {
    padding: 8,
    marginRight: -8,
    marginTop: -8,
  },

  detailedMessage: {
    fontSize: 13,
    color: colors.neutral[700],
    lineHeight: 20,
    marginBottom: spacing.md,
  },

  detailedActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default BudgetAlert;
