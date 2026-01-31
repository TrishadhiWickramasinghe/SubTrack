import { colors, fonts, spacing } from '@/config/theme';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    LayoutChangeEvent,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

export type DividerVariant = 'solid' | 'dashed' | 'dotted' | 'gradient';
export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerAlignment = 'center' | 'start' | 'end';

interface DividerProps {
  variant?: DividerVariant;
  orientation?: DividerOrientation;
  thickness?: number;
  color?: string;
  gradientColors?: string[];
  text?: string;
  textPosition?: DividerAlignment;
  textStyle?: TextStyle;
  textContainerStyle?: ViewStyle;
  showIcon?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right' | 'both';
  spacing?: number;
  marginVertical?: number;
  marginHorizontal?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  animated?: boolean;
  animationType?: 'fade' | 'slide' | 'grow' | 'none';
  animationDuration?: number;
  dashLength?: number;
  dashGap?: number;
  dotSize?: number;
  dotSpacing?: number;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  testID?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  inset?: boolean;
  insetSpacing?: number;
  decorative?: boolean;
}

const Divider: React.FC<DividerProps> = ({
  variant = 'solid',
  orientation = 'horizontal',
  thickness = 1,
  color = colors.neutral[200],
  gradientColors,
  text,
  textPosition = 'center',
  textStyle,
  textContainerStyle,
  showIcon = false,
  icon,
  iconPosition = 'left',
  spacing: spacingProp = spacing.md,
  marginVertical = 0,
  marginHorizontal = 0,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  animated = false,
  animationType = 'fade',
  animationDuration = 500,
  dashLength = 10,
  dashGap = 5,
  dotSize = 2,
  dotSpacing = 4,
  style,
  containerStyle,
  testID = 'divider',
  onLayout,
  inset = false,
  insetSpacing = spacing.lg,
  decorative = false,
}) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const growAnim = useRef(new Animated.Value(0)).current;

  // Get margin styles
  const getMarginStyles = (): ViewStyle => {
    return {
      marginTop: marginTop ?? marginVertical,
      marginBottom: marginBottom ?? marginVertical,
      marginLeft: marginLeft ?? marginHorizontal,
      marginRight: marginRight ?? marginHorizontal,
    };
  };

  // Get inset styles
  const getInsetStyles = (): ViewStyle => {
    if (!inset) return {};
    
    return {
      marginLeft: insetSpacing,
      marginRight: insetSpacing,
    };
  };

  // Get line style based on variant
  const getLineStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: variant === 'gradient' ? 'transparent' : color,
      width: orientation === 'horizontal' ? '100%' : thickness,
      height: orientation === 'vertical' ? '100%' : thickness,
    };

    if (variant === 'gradient' && gradientColors) {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
      };
    }

    return baseStyle;
  };

  // Render line based on variant
  const renderLine = () => {
    const lineStyle = getLineStyle();
    const isHorizontal = orientation === 'horizontal';

    switch (variant) {
      case 'dashed':
        return (
          <View style={[
            styles.lineContainer,
            isHorizontal ? styles.horizontal : styles.vertical,
          ]}>
            {Array.from({ length: Math.ceil(width / (dashLength + dashGap)) }).map((_, index) => (
              <View
                key={index}
                style={[
                  lineStyle,
                  styles.dash,
                  {
                    width: isHorizontal ? dashLength : thickness,
                    height: isHorizontal ? thickness : dashLength,
                    marginRight: isHorizontal ? dashGap : 0,
                    marginBottom: !isHorizontal ? dashGap : 0,
                  },
                ]}
              />
            ))}
          </View>
        );

      case 'dotted':
        return (
          <View style={[
            styles.lineContainer,
            isHorizontal ? styles.horizontal : styles.vertical,
          ]}>
            {Array.from({ length: Math.ceil(width / (dotSize + dotSpacing)) }).map((_, index) => (
              <View
                key={index}
                style={[
                  lineStyle,
                  styles.dot,
                  {
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    marginRight: isHorizontal ? dotSpacing : 0,
                    marginBottom: !isHorizontal ? dotSpacing : 0,
                  },
                ]}
              />
            ))}
          </View>
        );

      case 'gradient':
        if (!gradientColors || gradientColors.length < 2) {
          return <View style={lineStyle} />;
        }
        
        return (
          <View style={[
            lineStyle,
            isHorizontal ? styles.gradientHorizontal : styles.gradientVertical,
            {
              backgroundImage: isHorizontal
                ? `linear-gradient(to right, ${gradientColors.join(', ')})`
                : `linear-gradient(to bottom, ${gradientColors.join(', ')})`,
            } as any,
          ]} />
        );

      default: // solid
        return <View style={lineStyle} />;
    }
  };

  // Render text with divider
  const renderTextWithDivider = () => {
    if (!text && !showIcon) return renderLine();

    const lineStyle = getLineStyle();
    const isHorizontal = orientation === 'horizontal';

    return (
      <View style={[
        styles.textContainer,
        isHorizontal ? styles.horizontalContainer : styles.verticalContainer,
        textContainerStyle,
      ]}>
        {/* Left line/icon */}
        <View style={[
          styles.lineSection,
          { flex: textPosition === 'start' ? 0 : 1 },
        ]}>
          {textPosition !== 'start' && renderLine()}
        </View>

        {/* Text/Icon content */}
        <View style={styles.content}>
          {showIcon && iconPosition !== 'right' && icon}
          
          {text && (
            <Text
              style={[
                styles.text,
                { color: colors.neutral[500] as any },
                textStyle,
              ]}>
              {text}
            </Text>
          )}
          
          {showIcon && iconPosition === 'right' && icon}
        </View>

        {/* Right line */}
        <View style={[
          styles.lineSection,
          { flex: textPosition === 'end' ? 0 : 1 },
        ]}>
          {textPosition !== 'end' && renderLine()}
        </View>
      </View>
    );
  };

  // Handle layout
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: w, height: h } = event.nativeEvent.layout;
    setWidth(w);
    setHeight(h);
    onLayout?.(event);
  };

  // Animation effects
  useEffect(() => {
    if (!animated) return;

    switch (animationType) {
      case 'fade':
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animationDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
        break;

      case 'slide':
        const startValue = orientation === 'horizontal' ? -width : -height;
        slideAnim.setValue(startValue);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animationDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
        break;

      case 'grow':
        const growStart = orientation === 'horizontal' ? { scaleX: 0 } : { scaleY: 0 };
        Animated.timing(growAnim, {
          toValue: 1,
          duration: animationDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
        break;
    }
  }, [animated, animationType, width, height]);

  // Get animation styles
  const getAnimationStyle = () => {
    if (!animated) return {};

    switch (animationType) {
      case 'fade':
        return { opacity: fadeAnim };
      case 'slide':
        const transform = orientation === 'horizontal' 
          ? [{ translateX: slideAnim }] 
          : [{ translateY: slideAnim }];
        return { transform };
      case 'grow':
        const scale = orientation === 'horizontal' 
          ? { scaleX: growAnim } 
          : { scaleY: growAnim };
        return { transform: [scale] };
      default:
        return {};
    }
  };

  const isHorizontal = orientation === 'horizontal';
  const marginStyles = getMarginStyles();
  const insetStyles = getInsetStyles();
  const animationStyle = getAnimationStyle();

  const accessibilityProps = decorative ? {
    accessibilityRole: 'none' as any,
    accessibilityElementsHidden: true,
    importantForAccessibility: 'no-hide-descendants' as any,
  } : {
    accessibilityRole: 'separator' as any,
    accessibilityLabel: text || 'Divider',
  };

  return (
    <View
      style={[
        styles.container,
        isHorizontal ? styles.horizontal : styles.vertical,
        marginStyles,
        insetStyles,
        containerStyle,
      ]}
      onLayout={handleLayout}
      testID={testID}
      {...accessibilityProps}>
      <Animated.View
        style={[
          styles.animatedContainer,
          animationStyle,
          style,
        ]}>
        {text || showIcon ? renderTextWithDivider() : renderLine()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  horizontal: {
    width: '100%',
    height: 1,
  },
  vertical: {
    width: 1,
    height: '100%',
  },
  animatedContainer: {
    flex: 1,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
  dash: {},
  dot: {},
  gradientHorizontal: {
    width: '100%',
    height: '100%',
  },
  gradientVertical: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lineSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: 14,
    fontFamily: fonts.regular.fontFamily,
    marginHorizontal: spacing.xs,
  },
}) as any;

export default Divider;