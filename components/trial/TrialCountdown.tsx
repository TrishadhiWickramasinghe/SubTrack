import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Types
import Trial from '@models/Trial';

// Hooks
import useTheme from '@hooks/useTheme';

interface TrialCountdownProps {
  trial: Trial;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showIcon?: boolean;
  variant?: 'circular' | 'linear' | 'compact';
  animateProgress?: boolean;
  onWarning?: (trial: Trial, daysRemaining: number) => void;
  onExpired?: (trial: Trial) => void;
  onPress?: (trial: Trial) => void;
}

interface TimeData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  progressPercentage: number;
  statusColor: string;
  statusLabel: string;
}

const TrialCountdown: React.FC<TrialCountdownProps> = memo(
  ({
    trial,
    size = 'medium',
    showLabel = true,
    showIcon = true,
    variant = 'circular',
    animateProgress = true,
    onWarning,
    onExpired,
    onPress,
  }) => {
    const theme = useTheme();
    const [timeData, setTimeData] = useState<TimeData | null>(null);
    const animationValue = useRef(new Animated.Value(0)).current;
    const warningFiredRef = useRef(false);
    const expiredFiredRef = useRef(false);

    // Calculate time remaining
    const calculateTimeRemaining = useCallback((): TimeData => {
      const now = new Date();
      const endDate = new Date(trial.endDate);
      const startDate = new Date(trial.startDate);

      const timeDiff = endDate.getTime() - now.getTime();
      const totalTrialTime = endDate.getTime() - startDate.getTime();

      if (timeDiff <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: true,
          isExpiringSoon: false,
          progressPercentage: 100,
          statusColor: '#F44336',
          statusLabel: 'Expired',
        };
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      const totalSeconds = Math.floor(timeDiff / 1000);

      const isExpiringSoon = days <= 3;
      const progressPercentage = (1 - timeDiff / totalTrialTime) * 100;

      let statusColor = '#4CAF50'; // Green - Active
      let statusLabel = 'Active';

      if (isExpiringSoon) {
        statusColor = '#FF9800'; // Orange - Expiring soon
        statusLabel = 'Expiring Soon';
      }

      if (trial.status === 'converted') {
        statusColor = '#2196F3'; // Blue - Converted
        statusLabel = 'Converted';
      } else if (trial.status === 'cancelled') {
        statusColor = '#757575'; // Gray - Cancelled
        statusLabel = 'Cancelled';
      }

      return {
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
        isExpired: false,
        isExpiringSoon,
        progressPercentage,
        statusColor,
        statusLabel,
      };
    }, [trial]);

    // Update timer
    useEffect(() => {
      const data = calculateTimeRemaining();
      setTimeData(data);

      // Fire warnings and expiration callbacks
      if (data.isExpired && !expiredFiredRef.current) {
        expiredFiredRef.current = true;
        if (onExpired) {
          onExpired(trial);
        }
      } else if (data.isExpiringSoon && !warningFiredRef.current) {
        warningFiredRef.current = true;
        if (onWarning) {
          onWarning(trial, data.days);
        }
      }

      // Set up interval for countdown
      const interval = setInterval(() => {
        const updatedData = calculateTimeRemaining();
        setTimeData(updatedData);

        if (updatedData.isExpired && !expiredFiredRef.current) {
          expiredFiredRef.current = true;
          if (onExpired) {
            onExpired(trial);
          }
        } else if (updatedData.isExpiringSoon && !warningFiredRef.current) {
          warningFiredRef.current = true;
          if (onWarning) {
            onWarning(trial, updatedData.days);
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }, [trial, calculateTimeRemaining, onWarning, onExpired]);

    // Animate progress
    useEffect(() => {
      if (animateProgress && timeData && !timeData.isExpired) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(animationValue, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: false,
            }),
            Animated.timing(animationValue, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }
    }, [animateProgress, timeData, animationValue]);

    if (!timeData) {
      return null;
    }

    // Size configurations
    const sizeConfig = useMemo(() => {
      switch (size) {
        case 'small':
          return {
            circleSize: 60,
            fontSize: 14,
            labelSize: 11,
            strokeWidth: 4,
          };
        case 'large':
          return {
            circleSize: 140,
            fontSize: 24,
            labelSize: 13,
            strokeWidth: 6,
          };
        case 'medium':
        default:
          return {
            circleSize: 100,
            fontSize: 18,
            labelSize: 12,
            strokeWidth: 5,
          };
      }
    }, [size]);

    const getDisplayText = useCallback(() => {
      if (timeData.isExpired) {
        return 'Expired';
      }
      if (timeData.days > 0) {
        return `${timeData.days}d`;
      }
      if (timeData.hours > 0) {
        return `${timeData.hours}h`;
      }
      return `${timeData.minutes}m`;
    }, [timeData]);

    const renderCircularCountdown = () => {
      const radius = sizeConfig.circleSize / 2 - sizeConfig.strokeWidth / 2;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference - (timeData.progressPercentage / 100) * circumference;

      const opacity = animateProgress
        ? animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.7, 1],
          })
        : 1;

      return (
        <TouchableOpacity
          onPress={() => onPress && onPress(trial)}
          disabled={!onPress}
          activeOpacity={onPress ? 0.7 : 1}
        >
          <View style={styles.circularContainer}>
            {/* Background Circle */}
            <Animated.View
              style={[
                styles.svgContainer,
                {
                  width: sizeConfig.circleSize,
                  height: sizeConfig.circleSize,
                  opacity,
                },
              ]}
            >
              <View
                style={[
                  styles.circleBackground,
                  {
                    width: sizeConfig.circleSize,
                    height: sizeConfig.circleSize,
                    borderRadius: sizeConfig.circleSize / 2,
                    borderWidth: sizeConfig.strokeWidth,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  },
                ]}
              >
                {/* Progress Ring using BorderRadius trick */}
                <View
                  style={[
                    styles.progressRing,
                    {
                      width: sizeConfig.circleSize,
                      height: sizeConfig.circleSize,
                      borderRadius: sizeConfig.circleSize / 2,
                      borderWidth: sizeConfig.strokeWidth,
                      borderColor: 'transparent',
                      borderTopColor: timeData.statusColor,
                      borderRightColor: timeData.statusColor,
                      transform: [
                        {
                          rotateZ: `${(timeData.progressPercentage / 100) * 360}deg`,
                        },
                      ],
                    },
                  ]}
                />
              </View>
            </Animated.View>

            {/* Center Content */}
            <View
              style={[
                styles.centerContent,
                {
                  width: sizeConfig.circleSize,
                  height: sizeConfig.circleSize,
                  marginTop: -(sizeConfig.circleSize),
                },
              ]}
            >
              {showIcon && (
                <Icon
                  name={timeData.isExpired ? 'alert-circle' : 'clock-outline'}
                  size={sizeConfig.fontSize}
                  color={timeData.statusColor}
                  style={{ marginBottom: 4 }}
                />
              )}
              <Text
                style={[
                  styles.countdownText,
                  {
                    fontSize: sizeConfig.fontSize,
                    color: timeData.statusColor,
                  },
                ]}
              >
                {getDisplayText()}
              </Text>
              {showLabel && (
                <Text
                  style={[
                    styles.statusLabel,
                    {
                      fontSize: sizeConfig.labelSize,
                      color: timeData.statusColor,
                    },
                  ]}
                >
                  {timeData.statusLabel}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    };

    const renderLinearCountdown = () => {
      return (
        <TouchableOpacity
          onPress={() => onPress && onPress(trial)}
          disabled={!onPress}
          activeOpacity={onPress ? 0.7 : 1}
          style={styles.linearContainer}
        >
          <View style={styles.linearHeader}>
            {showIcon && (
              <Icon
                name={timeData.isExpired ? 'alert-circle' : 'clock-outline'}
                size={16}
                color={timeData.statusColor}
                style={{ marginRight: 8 }}
              />
            )}
            <Text
              style={[
                styles.linearTitle,
                { color: theme.theme.colors.text },
              ]}
              numberOfLines={1}
            >
              {trial.subscriptionName}
            </Text>
          </View>

          <View style={styles.linearProgressBar}>
            <Animated.View
              style={[
                styles.linearProgressFill,
                {
                  width: `${Math.min(100, timeData.progressPercentage)}%`,
                  backgroundColor: timeData.statusColor,
                },
              ]}
            />
          </View>

          <View style={styles.linearFooter}>
            <Text
              style={[
                styles.linearTimeText,
                { color: timeData.statusColor, fontWeight: '700' },
              ]}
            >
              {timeData.isExpired
                ? 'Expired'
                : `${timeData.days}d ${timeData.hours}h ${timeData.minutes}m`}
            </Text>
            {showLabel && (
              <Text
                style={[
                  styles.linearStatusText,
                  { color: theme.theme.colors.textSecondary },
                ]}
              >
                {timeData.statusLabel}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    };

    const renderCompactCountdown = () => {
      return (
        <TouchableOpacity
          onPress={() => onPress && onPress(trial)}
          disabled={!onPress}
          activeOpacity={onPress ? 0.7 : 1}
          style={[
            styles.compactContainer,
            { backgroundColor: timeData.statusColor + '15' },
          ]}
        >
          <View style={styles.compactContent}>
            {showIcon && (
              <Icon
                name={timeData.isExpired ? 'alert-circle' : 'clock-outline'}
                size={14}
                color={timeData.statusColor}
                style={{ marginRight: 6 }}
              />
            )}
            <Text
              style={[
                styles.compactText,
                { color: timeData.statusColor, fontWeight: '700' },
              ]}
            >
              {getDisplayText()}
            </Text>
            {showLabel && (
              <Text
                style={[
                  styles.compactLabel,
                  { color: timeData.statusColor },
                ]}
              >
                {' '}· {timeData.statusLabel}
              </Text>
            )}
          </View>

          {/* Micro progress indicator */}
          <View style={styles.compactProgressBar}>
            <View
              style={[
                styles.compactProgressFill,
                {
                  width: `${Math.min(100, timeData.progressPercentage)}%`,
                  backgroundColor: timeData.statusColor,
                },
              ]}
            />
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <View>
        {variant === 'circular' && renderCircularCountdown()}
        {variant === 'linear' && renderLinearCountdown()}
        {variant === 'compact' && renderCompactCountdown()}
      </View>
    );
  }
);

TrialCountdown.displayName = 'TrialCountdown';

const styles = StyleSheet.create({
  // Circular Styles
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBackground: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressRing: {
    position: 'absolute',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontWeight: '700',
  },
  statusLabel: {
    marginTop: 4,
    fontWeight: '500',
  },

  // Linear Styles
  linearContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  linearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  linearTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  linearProgressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  linearProgressFill: {
    height: '100%',
  },
  linearFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linearTimeText: {
    fontSize: 13,
  },
  linearStatusText: {
    fontSize: 11,
  },

  // Compact Styles
  compactContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactText: {
    fontSize: 13,
  },
  compactLabel: {
    fontSize: 11,
  },
  compactProgressBar: {
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
  },
});

export default TrialCountdown;
