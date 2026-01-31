import { colors, fonts } from '@/config/theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    LayoutChangeEvent,
    PanResponder,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';

export type SliderVariant = 'default' | 'range' | 'vertical' | 'stepped';
export type SliderSize = 'small' | 'medium' | 'large';
export type SliderThumbStyle = 'default' | 'circle' | 'square' | 'icon' | 'custom';

interface SliderProps {
  value: number;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  onSlidingStart?: () => void;
  onSlidingComplete?: (value: number) => void;
  disabled?: boolean;
  variant?: SliderVariant;
  size?: SliderSize;
  thumbStyle?: SliderThumbStyle;
  thumbColor?: string;
  thumbSize?: number;
  thumbIcon?: string;
  thumbIconColor?: string;
  thumbIconSize?: number;
  trackColor?: string;
  minimumTrackColor?: string;
  maximumTrackColor?: string;
  trackHeight?: number;
  showValue?: boolean;
  valuePosition?: 'top' | 'bottom' | 'left' | 'right' | 'tooltip';
  valueFormat?: (value: number) => string;
  valueStyle?: TextStyle;
  showMarks?: boolean;
  marks?: number[];
  markColor?: string;
  markSize?: number;
  showLabels?: boolean;
  labelPosition?: 'top' | 'bottom';
  minLabel?: string;
  maxLabel?: string;
  labelStyle?: TextStyle;
  showSteps?: boolean;
  stepColor?: string;
  stepSize?: number;
  animated?: boolean;
  animationDuration?: number;
  hapticFeedback?: boolean;
  vertical?: boolean;
  reverse?: boolean;
  inverted?: boolean;
  borderRadius?: number;
  shadow?: boolean;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  style?: ViewStyle;
  trackStyle?: ViewStyle;
  thumbStyleCustom?: ViewStyle;
  containerStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityValue?: { min?: number; max?: number; now?: number };
  onLayout?: (event: LayoutChangeEvent) => void;
}

interface RangeSliderProps extends Omit<SliderProps, 'value' | 'onValueChange'> {
  values: [number, number];
  onValuesChange?: (values: [number, number]) => void;
  onSlidingComplete?: (values: [number, number]) => void;
}

const Slider: React.FC<SliderProps | RangeSliderProps> = (props) => {
  const isRangeSlider = 'values' in props;
  
  // Common props
  const {
    minimumValue = 0,
    maximumValue = 100,
    step = 0,
    disabled = false,
    variant = 'default',
    size = 'medium',
    thumbStyle = 'default',
    thumbColor = colors.primary,
    thumbSize,
    thumbIcon = 'circle',
    thumbIconColor = colors.neutral[0],
    thumbIconSize,
    trackColor = colors.neutral[100],
    minimumTrackColor = colors.primary,
    maximumTrackColor = colors.neutral[100],
    trackHeight,
    showValue = true,
    valuePosition = 'top',
    valueFormat,
    valueStyle,
    showMarks = false,
    marks,
    markColor = colors.neutral[200],
    markSize = 4,
    showLabels = false,
    labelPosition = 'bottom',
    minLabel,
    maxLabel,
    labelStyle,
    showSteps = false,
    stepColor = colors.neutral[200],
    stepSize = 2,
    animated = true,
    animationDuration = 200,
    hapticFeedback = true,
    vertical = false,
    reverse = false,
    inverted = false,
    borderRadius = 4,
    shadow = true,
    shadowColor = '#000',
    shadowOffset = { width: 0, height: 2 },
    shadowOpacity = 0.25,
    shadowRadius = 3.84,
    style,
    trackStyle,
    thumbStyleCustom,
    containerStyle,
    testID = 'slider',
    accessibilityLabel,
    accessibilityValue,
    onLayout,
  } = props;

  // State for single slider
  const [singleValue, setSingleValue] = useState(
    !isRangeSlider ? (props as SliderProps).value : minimumValue
  );
  
  // State for range slider
  const [rangeValues, setRangeValues] = useState(
    isRangeSlider ? (props as RangeSliderProps).values : [minimumValue, maximumValue]
  );
  
  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderHeight, setSliderHeight] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
  const thumbPosition = useRef(new Animated.Value(0)).current;
  const thumbScale = useRef(new Animated.Value(1)).current;
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const tooltipScale = useRef(new Animated.Value(0.8)).current;

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Get size configuration
  const getSizeConfig = () => {
    const sizeConfigs = {
      small: {
        trackHeight: 4,
        thumbSize: 16,
        thumbIconSize: 8,
        fontSize: 12,
        valueFontSize: 10,
      },
      medium: {
        trackHeight: 6,
        thumbSize: 24,
        thumbIconSize: 12,
        fontSize: 14,
        valueFontSize: 12,
      },
      large: {
        trackHeight: 8,
        thumbSize: 32,
        thumbIconSize: 16,
        fontSize: 16,
        valueFontSize: 14,
      },
    };

    return sizeConfigs[size] || sizeConfigs.medium;
  };

  const sizeConfig = getSizeConfig();

  // Get thumb size
  const getThumbSize = () => {
    if (thumbSize) return thumbSize;
    return sizeConfig.thumbSize;
  };

  const thumbSizeCalculated = getThumbSize();

  // Get track height
  const getTrackHeight = () => {
    if (trackHeight) return trackHeight;
    return sizeConfig.trackHeight;
  };

  const trackHeightCalculated = getTrackHeight();

  // Handle layout
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSliderWidth(width);
    setSliderHeight(height);
    onLayout?.(event);
  };

  // Handle thumb layout
  const handleThumbLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setThumbWidth(width);
  };

  // Calculate value from position
  const calculateValue = (position: number) => {
    const maxPosition = vertical ? sliderHeight : sliderWidth;
    let percentage = position / maxPosition;
    
    if (reverse) {
      percentage = 1 - percentage;
    }
    
    if (inverted) {
      percentage = 1 - percentage;
    }
    
    let value = minimumValue + (maximumValue - minimumValue) * percentage;
    
    // Apply step
    if (step > 0) {
      value = Math.round(value / step) * step;
    }
    
    // Clamp value
    value = Math.max(minimumValue, Math.min(maximumValue, value));
    
    return value;
  };

  // Calculate position from value
  const calculatePosition = (value: number) => {
    const percentage = (value - minimumValue) / (maximumValue - minimumValue);
    let position = (vertical ? sliderHeight : sliderWidth) * percentage;
    
    if (reverse) {
      position = (vertical ? sliderHeight : sliderWidth) - position;
    }
    
    if (inverted) {
      position = (vertical ? sliderHeight : sliderWidth) - position;
    }
    
    return position;
  };

  // Pan responder for single slider
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (_, gestureState) => {
        if (disabled) return;
        
        setActiveThumb('min');
        
        // Animate thumb scale
        Animated.spring(thumbScale, {
          toValue: 1.2,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }).start();
        
        // Show tooltip
        if (valuePosition === 'tooltip') {
          Animated.parallel([
            Animated.spring(tooltipScale, {
              toValue: 1,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.timing(tooltipOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
        
        (props as SliderProps).onSlidingStart?.();
        
        if (hapticFeedback) {
          // Add haptic feedback
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (disabled) return;
        
        const position = vertical ? gestureState.moveY : gestureState.moveX;
        const newValue = calculateValue(position);
        
        if (!isRangeSlider) {
          setSingleValue(newValue);
          (props as SliderProps).onValueChange?.(newValue);
          
          // Update thumb position
          const newPosition = calculatePosition(newValue);
          thumbPosition.setValue(newPosition);
        }
      },
      onPanResponderRelease: () => {
        if (disabled) return;
        
        // Animate thumb back to normal
        Animated.spring(thumbScale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }).start();
        
        // Hide tooltip
        if (valuePosition === 'tooltip') {
          Animated.parallel([
            Animated.spring(tooltipScale, {
              toValue: 0.8,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.timing(tooltipOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
        
        if (!isRangeSlider) {
          (props as SliderProps).onSlidingComplete?.(singleValue);
        }
        
        setActiveThumb(null);
      },
    })
  ).current;

  // Render thumb
  const renderThumb = (value: number, index?: number) => {
    const position = calculatePosition(value);
    const thumbStyles: ViewStyle[] = [
      styles.thumb,
      {
        width: thumbSizeCalculated,
        height: thumbSizeCalculated,
        borderRadius: thumbStyle === 'circle' ? thumbSizeCalculated / 2 : 
                    thumbStyle === 'square' ? 4 : thumbSizeCalculated / 2,
        backgroundColor: thumbColor as any,
        transform: [
          { translateX: vertical ? 0 : position - thumbSizeCalculated / 2 },
          { translateY: vertical ? position - thumbSizeCalculated / 2 : 0 },
          { scale: thumbScale },
        ],
      },
    ];

    if (shadow) {
      thumbStyles.push({
        shadowColor,
        shadowOffset,
        shadowOpacity,
        shadowRadius,
        elevation: 4,
      });
    }

    if (thumbStyle === 'icon' && thumbIcon) {
      return (
        <Animated.View
          key={index}
          style={thumbStyles}
          onLayout={index === 0 ? handleThumbLayout : undefined}>
          <Icon
            name={thumbIcon as any}
            size={thumbIconSize || sizeConfig.thumbIconSize}
            color={thumbIconColor}
          />
        </Animated.View>
      );
    }

    if (thumbStyle === 'custom' && thumbStyleCustom) {
      return (
        <Animated.View
          key={index}
          style={[thumbStyles, thumbStyleCustom]}
          onLayout={index === 0 ? handleThumbLayout : undefined}>
          {thumbStyleCustom}
        </Animated.View>
      );
    }

    return (
      <Animated.View
        key={index}
        style={thumbStyles}
        onLayout={index === 0 ? handleThumbLayout : undefined}
      />
    );
  };

  // Render value display
  const renderValue = (value: number) => {
    if (!showValue) return null;

    const formattedValue = valueFormat ? valueFormat(value) : value.toFixed(step === 0 ? 0 : 1);
    const position = calculatePosition(value);

    const valueStyles = [
      styles.value,
      {
        fontSize: sizeConfig.valueFontSize,
        color: colors.neutral[900],
        fontFamily: fonts.medium.fontFamily,
      },
      valueStyle,
    ];

    if (valuePosition === 'tooltip') {
      return (
        <Animated.View
          style={[
            styles.tooltip,
            {
              opacity: tooltipOpacity,
              transform: [
                { translateX: vertical ? 0 : position - 20 },
                { translateY: vertical ? position - 20 : -30 },
                { scale: tooltipScale },
              ],
            },
          ]}>
          <Text style={valueStyles}>{formattedValue}</Text>
        </Animated.View>
      );
    }

    const positionStyle = {
      [valuePosition === 'top' ? 'top' : 'bottom']: -20,
      [valuePosition === 'left' ? 'left' : 'right']: vertical ? 0 : position,
    };

    return (
      <Text style={[valueStyles, positionStyle]}>
        {formattedValue}
      </Text>
    );
  };

  // Render marks
  const renderMarks = () => {
    if (!showMarks) return null;

    const markPositions = marks || [minimumValue, maximumValue];
    
    return markPositions.map((mark, index) => {
      const position = calculatePosition(mark);
      
      return (
        <View
          key={index}
          style={[
            styles.mark,
            {
              width: markSize,
              height: markSize,
              borderRadius: markSize / 2,
              backgroundColor: markColor,
              [vertical ? 'top' : 'left']: position - markSize / 2,
            },
          ]}
        />
      );
    });
  };

  // Render steps
  const renderSteps = () => {
    if (!showSteps || step === 0) return null;

    const steps = [];
    const stepCount = (maximumValue - minimumValue) / step;
    
    for (let i = 0; i <= stepCount; i++) {
      const value = minimumValue + i * step;
      const position = calculatePosition(value);
      
      steps.push(
        <View
          key={i}
          style={[
            styles.step,
            {
              width: stepSize,
              height: stepSize,
              borderRadius: stepSize / 2,
              backgroundColor: stepColor,
              [vertical ? 'top' : 'left']: position - stepSize / 2,
            },
          ]}
        />
      );
    }
    
    return steps;
  };

  // Render labels
  const renderLabels = () => {
    if (!showLabels) return null;

    const labelStyles = [
      styles.label,
      {
        fontSize: sizeConfig.fontSize,
        color: colors.neutral[500],
        fontFamily: fonts.regular.fontFamily,
      },
      labelStyle,
    ];

    return (
      <View style={[
        styles.labelsContainer,
        labelPosition === 'top' ? styles.labelsTop : styles.labelsBottom,
      ]}>
        <Text style={labelStyles}>{minLabel || minimumValue}</Text>
        <Text style={labelStyles}>{maxLabel || maximumValue}</Text>
      </View>
    );
  };

  // Get current values
  const currentValues = isRangeSlider ? rangeValues : [singleValue];
  const currentValue = isRangeSlider ? rangeValues[activeThumb === 'min' ? 0 : 1] : singleValue;

  return (
    <View
      style={[
        styles.container,
        vertical ? styles.verticalContainer : styles.horizontalContainer,
        containerStyle,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || 'Slider'}
      accessibilityValue={{
        min: minimumValue,
        max: maximumValue,
        now: currentValue,
        ...accessibilityValue,
      }}
      accessibilityRole="adjustable">
      {renderLabels()}
      
      <View
        style={[
          styles.sliderContainer,
          vertical ? { height: sliderHeight || 200 } : { width: sliderWidth || 200 },
          style,
        ]}
        onLayout={handleLayout}
        {...(!isRangeSlider ? panResponder.panHandlers : {})}>
        {/* Track */}
        <View
          style={[
            styles.track,
            {
              height: vertical ? '100%' : trackHeightCalculated,
              width: vertical ? trackHeightCalculated : '100%',
              borderRadius,
              backgroundColor: trackColor,
            },
            trackStyle,
          ]}>
          {/* Minimum track (filled portion) */}
          {!isRangeSlider && (
            <View
              style={[
                styles.minimumTrack,
                {
                  height: vertical ? calculatePosition(singleValue) : trackHeightCalculated,
                  width: vertical ? trackHeightCalculated : calculatePosition(singleValue),
                  borderRadius,
                  backgroundColor: minimumTrackColor,
                },
              ]}
            />
          )}
        </View>
        
        {/* Marks */}
        {renderMarks()}
        
        {/* Steps */}
        {renderSteps()}
        
        {/* Thumbs */}
        {currentValues.map((value, index) => renderThumb(value, index))}
        
        {/* Value display */}
        {!isRangeSlider && renderValue(singleValue)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalContainer: {
    width: '100%',
  },
  verticalContainer: {
    height: '100%',
  },
  sliderContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    position: 'absolute',
  },
  minimumTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  thumb: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  value: {
    position: 'absolute',
    textAlign: 'center',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 20,
  },
  mark: {
    position: 'absolute',
    zIndex: 5,
  },
  step: {
    position: 'absolute',
    zIndex: 5,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  labelsTop: {
    marginBottom: 8,
  },
  labelsBottom: {
    marginTop: 8,
  },
  label: {
    textAlign: 'center',
  },
});

// Export RangeSlider as a separate component
const RangeSlider: React.FC<RangeSliderProps> = (props) => {
  return <Slider {...props} />;
};

export { RangeSlider };
export default Slider;