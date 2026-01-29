import { colors } from '@config/theme';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    Platform,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

interface LoadingProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'shimmer' | 'lottie';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullscreen?: boolean;
  message?: string;
  customAnimation?: any;
  backgroundColor?: string;
  style?: ViewStyle;
  overlay?: boolean;
  testID?: string;
}

const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'medium',
  color = colors.primary,
  fullscreen = false,
  message,
  customAnimation,
  backgroundColor,
  style,
  overlay = false,
  testID = 'loading',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  // Pulse animation
  useEffect(() => {
    if (type === 'pulse') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }
  }, [type, pulseAnim]);

  // Shimmer animation
  useEffect(() => {
    if (type === 'shimmer') {
      const animation = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      animation.start();
      return () => animation.stop();
    }
  }, [type, shimmerAnim]);

  // Scale animation for dots
  useEffect(() => {
    if (type === 'dots') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 400,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }
  }, [type, scaleAnim]);

  const renderSpinner = () => (
    <ActivityIndicator
      size={Platform.OS === 'ios' ? size : getSize()}
      color={color}
      testID="loading-spinner"
    />
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {[0, 1, 2].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: color,
              marginHorizontal: 4,
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [1, 1.2],
                    outputRange: [1, index === 1 ? 1.2 : 1],
                  }),
                },
              ],
              opacity: scaleAnim.interpolate({
                inputRange: [1, 1.2],
                outputRange: [0.6, index === 1 ? 1 : 0.6],
              }),
            },
          ]}
        />
      ))}
    </View>
  );

  const renderPulse = () => (
    <Animated.View
      style={[
        styles.pulseCircle,
        {
          backgroundColor: color,
          width: getSize() * 2,
          height: getSize() * 2,
          opacity: pulseAnim.interpolate({
            inputRange: [0.5, 1],
            outputRange: [0.3, 0.7],
          }),
          transform: [
            {
              scale: pulseAnim.interpolate({
                inputRange: [0.5, 1],
                outputRange: [0.8, 1.2],
              }),
            },
          ],
        },
      ]}>
      <View
        style={[
          styles.innerCircle,
          {
            width: getSize(),
            height: getSize(),
            backgroundColor: color,
          },
        ]}
      />
    </Animated.View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View style={[styles.skeletonLine, { width: '70%' }]} />
      <View style={[styles.skeletonLine, { width: '90%' }]} />
      <View style={[styles.skeletonLine, { width: '60%' }]} />
    </View>
  );

  const renderShimmer = () => (
    <View style={styles.shimmerContainer}>
      <Animated.View
        style={[
          styles.shimmerEffect,
          {
            transform: [
              {
                translateX: shimmerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 300],
                }),
              },
            ],
          },
        ]}
      />
      <View style={styles.shimmerContent}>
        <View style={[styles.shimmerLine, { width: '70%' }]} />
        <View style={[styles.shimmerLine, { width: '90%' }]} />
        <View style={[styles.shimmerLine, { width: '60%' }]} />
      </View>
    </View>
  );

  const renderLottie = () => {
    if (customAnimation) {
      return (
        <LottieView
          source={customAnimation}
          autoPlay
          loop
          style={{ width: getSize() * 3, height: getSize() * 3 }}
        />
      );
    }
    return <ActivityIndicator size="large" color={color} />;
  };

  const renderLoadingContent = () => {
    switch (type) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      case 'shimmer':
        return renderShimmer();
      case 'lottie':
        return renderLottie();
      default:
        return renderSpinner();
    }
  };

  const containerStyle = [
    styles.container,
    fullscreen && styles.fullscreen,
    overlay && styles.overlay,
    backgroundColor && { backgroundColor },
    style,
  ];

  return (
    <View style={containerStyle} testID={testID}>
      <View style={styles.content}>
        {renderLoadingContent()}
        {message && <Animated.Text style={styles.message}>{message}</Animated.Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pulseCircle: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    borderRadius: 25,
  },
  skeletonContainer: {
    width: 200,
    padding: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginVertical: 6,
  },
  shimmerContainer: {
    width: 200,
    height: 100,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  shimmerContent: {
    padding: 16,
  },
  shimmerLine: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginVertical: 6,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});

export default Loading;