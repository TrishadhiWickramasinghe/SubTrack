import { colors, fonts, spacing } from '@/config/theme';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    LayoutChangeEvent,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

export type ProgressBarVariant = 'linear' | 'circular' | 'semi-circular';
export type ProgressBarColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gradient' | 'custom';
export type ProgressBarSize = 'small' | 'medium' | 'large' | 'xlarge';
export type ProgressBarLabelPosition = 'none' | 'top' | 'bottom' | 'left' | 'right' | 'inside' | 'center';

interface ProgressBarProps {
  progress: number; // 0 to 100
  variant?: ProgressBarVariant;
  color?: ProgressBarColor;
  size?: ProgressBarSize;
  showLabel?: boolean;
  labelPosition?: ProgressBarLabelPosition;
  labelFormat?: (progress: number) => string;
  labelStyle?: TextStyle;
  showPercentage?: boolean;
  animated?: boolean;
  animationDuration?: number;
  indeterminate?: boolean;
  indeterminateDuration?: number;
  height?: number;
  width?: number;
  thickness?: number;
  trackColor?: string;
  progressColor?: string;
  gradientColors?: string[];
  showTrack?: boolean;
  rounded?: boolean;
  striped?: boolean;
  stripedAnimated?: boolean;
  stripedAnimationDuration?: number;
  steps?: number;
  currentStep?: number;
  showSteps?: boolean;
  stepLabels?: string[];
  onProgressChange?: (progress: number) => void;
  style?: ViewStyle;
  trackStyle?: ViewStyle;
  progressStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  minimumValue?: number;
  maximumValue?: number;
  bufferProgress?: number;
  showBuffer?: boolean;
  bufferColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress: rawProgress,
  variant = 'linear',
  color = 'primary',
  size = 'medium',
  showLabel = true,
  labelPosition = 'top',
  labelFormat,
  labelStyle,
  showPercentage = true,
  animated = true,
  animationDuration = 500,
  indeterminate = false,
  indeterminateDuration = 1000,
  height,
  width,
  thickness,
  trackColor = colors.neutral[100],
  progressColor,
  gradientColors,
  showTrack = true,
  rounded = true,
  striped = false,
  stripedAnimated = false,
  stripedAnimationDuration = 1000,
  steps,
  currentStep,
  showSteps = false,
  stepLabels,
  onProgressChange,
  style,
  trackStyle,
  progressStyle,
  containerStyle,
  testID = 'progress-bar',
  accessibilityLabel,
  minimumValue = 0,
  maximumValue = 100,
  bufferProgress,
  showBuffer = false,
  bufferColor = colors.neutral[200],
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [indeterminateProgress, setIndeterminateProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const indeterminateAnim = useRef(new Animated.Value(0)).current;
  const stripedAnim = useRef(new Animated.Value(0)).current;
  const circularProgress = useRef(new Animated.Value(0)).current;
  const circularRotation = useRef(new Animated.Value(0)).current;
  
  const { width: screenWidth } = Dimensions.get('window');

  // Clamp progress between 0 and 100
  const progress = Math.max(0, Math.min(100, rawProgress));

  // Get size configuration
  const getSizeConfig = () => {
    const sizeConfigs = {
      small: {
        height: 4,
        thickness: 4,
        fontSize: 10,
        circularSize: 40,
      },
      medium: {
        height: 8,
        thickness: 8,
        fontSize: 12,
        circularSize: 60,
      },
      large: {
        height: 12,
        thickness: 12,
        fontSize: 14,
        circularSize: 80,
      },
      xlarge: {
        height: 16,
        thickness: 16,
        fontSize: 16,
        circularSize: 100,
      },
    };

    const config = sizeConfigs[size] || sizeConfigs.medium;
    
    return {
      ...config,
      height: height || config.height,
      thickness: thickness || config.thickness,
    };
  };

  const sizeConfig = getSizeConfig();

  // Get color configuration
  const getColorConfig = () => {
    const colorConfigs = {
      primary: colors.primary,
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      info: colors.info,
      gradient: 'transparent',
      custom: progressColor || colors.primary,
    };

    return colorConfigs[color] || colors.primary;
  };

  const colorConfig = getColorConfig();

  // Get formatted label
  const getFormattedLabel = () => {
    if (labelFormat) {
      return labelFormat(progress);
    }
    
    if (steps && currentStep !== undefined) {
      return `${currentStep}/${steps}`;
    }
    
    if (showPercentage) {
      return `${Math.round(progress)}%`;
    }
    
    return '';
  };

  // Handle layout
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: w, height: h } = event.nativeEvent.layout;
    setDimensions({ width: w, height: h });
  };

  // Animate progress
  useEffect(() => {
    if (animated && !indeterminate) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, animated, indeterminate]);

  // Indeterminate animation
  useEffect(() => {
    if (indeterminate) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(indeterminateAnim, {
            toValue: 100,
            duration: indeterminateDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(indeterminateAnim, {
            toValue: 0,
            duration: indeterminateDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
      
      return () => animation.stop();
    }
  }, [indeterminate]);

  // Striped animation
  useEffect(() => {
    if (striped && stripedAnimated) {
      const animation = Animated.loop(
        Animated.timing(stripedAnim, {
          toValue: 1,
          duration: stripedAnimationDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
      
      return () => animation.stop();
    }
  }, [striped, stripedAnimated]);

  // Circular animation
  useEffect(() => {
    if (variant === 'circular' || variant === 'semi-circular') {
      Animated.timing(circularProgress, {
        toValue: progress,
        duration: animated ? animationDuration : 0,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      
      if (indeterminate) {
        const rotation = Animated.loop(
          Animated.timing(circularRotation, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
        rotation.start();
        
        return () => rotation.stop();
      }
    }
  }, [progress, variant, indeterminate]);

  // Render linear progress bar
  const renderLinearProgress = () => {
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    const indeterminateWidth = indeterminateAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    const stripedTransform = stripedAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-30, 30],
    });

    return (
      <View style={[styles.linearContainer, containerStyle]}>
        {showTrack && (
          <View
            style={[
              styles.track,
              {
                backgroundColor: trackColor,
                height: sizeConfig.height,
                borderRadius: rounded ? sizeConfig.height / 2 : 0,
              },
              trackStyle,
            ]}
          />
        )}
        
        {/* Buffer progress */}
        {showBuffer && bufferProgress !== undefined && (
          <View
            style={[
              styles.buffer,
              {
                backgroundColor: bufferColor,
                height: sizeConfig.height,
                borderRadius: rounded ? sizeConfig.height / 2 : 0,
                width: `${bufferProgress}%`,
              },
            ]}
          />
        )}
        
        {/* Main progress */}
        <Animated.View
          style={[
            styles.progress,
            {
              backgroundColor: colorConfig,
              height: sizeConfig.height,
              borderRadius: rounded ? sizeConfig.height / 2 : 0,
              width: indeterminate ? indeterminateWidth : progressWidth,
            },
            gradientColors && styles.gradient,
            gradientColors && {
              backgroundImage: `linear-gradient(to right, ${gradientColors.join(', ')})`,
            } as any,
            striped && styles.striped,
            stripedAnimated && {
              transform: [{ translateX: stripedTransform }],
            },
            progressStyle,
          ]}
        />
        
        {/* Steps */}
        {steps && showSteps && (
          <View style={styles.stepsContainer}>
            {Array.from({ length: steps }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.step,
                  {
                    backgroundColor: index < (currentStep || 0) ? colorConfig : trackColor,
                    width: dimensions.width / steps - 4,
                    height: sizeConfig.height,
                    borderRadius: rounded ? sizeConfig.height / 2 : 0,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // Render circular progress bar
  const renderCircularProgress = () => {
    const isSemiCircular = variant === 'semi-circular';
    const circularSize = width || sizeConfig.circularSize;
    const strokeWidth = sizeConfig.thickness;
    const radius = (circularSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const maxAngle = isSemiCircular ? 180 : 360;
    
    const progressAngle = circularProgress.interpolate({
      inputRange: [0, 100],
      outputRange: ['0deg', `${maxAngle}deg`],
    });

    const rotation = circularRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={[styles.circularContainer, { width: circularSize, height: circularSize }, containerStyle]}>
        {showTrack && (
          <View
            style={[
              styles.circularTrack,
              {
                width: circularSize,
                height: circularSize,
                borderRadius: circularSize / 2,
                borderWidth: strokeWidth,
                borderColor: trackColor,
              },
              isSemiCircular && styles.semiCircular,
            ]}
          />
        )}
        
        <Animated.View
          style={[
            styles.circularProgressContainer,
            {
              width: circularSize,
              height: circularSize,
              borderRadius: circularSize / 2,
              transform: indeterminate ? [{ rotate: rotation }] : [],
            },
          ]}>
          <View
            style={[
              styles.circularProgress,
              {
                width: circularSize,
                height: circularSize,
                borderRadius: circularSize / 2,
                borderWidth: strokeWidth,
                borderColor: colorConfig,
                borderLeftColor: 'transparent',
                borderBottomColor: isSemiCircular ? 'transparent' : colorConfig,
                transform: [{ rotate: progressAngle }],
              },
            ]}
          />
        </Animated.View>
        
        {/* Center label */}
        {showLabel && labelPosition === 'inside' && (
          <View style={styles.circularLabelContainer}>
            <Text style={[styles.label, { fontSize: sizeConfig.fontSize }, labelStyle]}>
              {getFormattedLabel()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render label
  const renderLabel = () => {
    if (!showLabel || !getFormattedLabel()) return null;

    return (
      <Text
        style={[
          styles.label,
          {
            fontSize: sizeConfig.fontSize,
            color: colors.neutral[900] as any,
            textAlign: labelPosition === 'center' ? 'center' : 'auto',
          },
          labelStyle,
        ]}>
        {getFormattedLabel()}
      </Text>
    );
  };

  // Render step labels
  const renderStepLabels = () => {
    if (!stepLabels || !showSteps) return null;

    return (
      <View style={styles.stepLabelsContainer}>
        {stepLabels.map((label, index) => (
          <Text
            key={index}
            style={[
              styles.stepLabel,
              {
                color: (index <= (currentStep || 0) ? colorConfig : colors.neutral[500]) as any,
                fontWeight: index === (currentStep || 0) ? 'bold' : 'normal',
              },
            ]}>
            {label}
          </Text>
        ))}
      </View>
    );
  };

  // Get container style based on label position
  const getContainerStyle = () => {
    const isLinear = variant === 'linear';
    const isCircular = variant === 'circular' || variant === 'semi-circular';
    
    switch (labelPosition) {
      case 'top':
        return isLinear ? styles.labelTopContainer : {};
      case 'bottom':
        return isLinear ? styles.labelBottomContainer : {};
      case 'left':
        return isLinear ? styles.labelLeftContainer : {};
      case 'right':
        return isLinear ? styles.labelRightContainer : {};
      default:
        return {};
    }
  };

  const progressBar = variant === 'linear' ? renderLinearProgress() : renderCircularProgress();
  const label = renderLabel();
  const stepLabelsComponent = renderStepLabels();

  const accessibilityProps = {
    accessibilityRole: 'progressbar' as const,
    accessibilityValue: {
      min: minimumValue,
      max: maximumValue,
      now: progress,
    },
    accessibilityLabel: accessibilityLabel || `Progress: ${progress}%`,
  };

  return (
    <View
      style={[getContainerStyle(), style]}
      onLayout={handleLayout}
      testID={testID}
      {...accessibilityProps}>
      {labelPosition === 'top' && label}
      {labelPosition === 'left' && label}
      
      <View style={styles.progressContainer}>
        {progressBar}
        {labelPosition === 'center' && label}
      </View>
      
      {labelPosition === 'right' && label}
      {labelPosition === 'bottom' && label}
      {stepLabelsComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  linearContainer: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressContainer: {
    position: 'relative',
  },
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  buffer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progress: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gradient: {
    // Gradient is applied via backgroundImage
  },
  striped: {
    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
    backgroundSize: '30px 30px',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  step: {
    marginHorizontal: 2,
  },
  circularTrack: {
    position: 'absolute',
  },
  semiCircular: {
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  circularProgressContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgress: {
    position: 'absolute',
  },
  circularLabelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.medium.fontFamily,
  },
  stepLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: fonts.regular.fontFamily,
    textAlign: 'center',
    flex: 1,
  },
  labelTopContainer: {
    marginBottom: spacing.sm,
  },
  labelBottomContainer: {
    marginTop: spacing.sm,
  },
  labelLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}) as any;

export default ProgressBar;