import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types
interface QuickAddOption {
  id: string;
  label: string;
  icon: string;
  color: string;
  description?: string;
  shortcut?: string;
  action: () => void;
}

interface QuickAddButtonProps {
  onAddSubscription?: () => void;
  onAddTrial?: () => void;
  onAddExpense?: () => void;
  onScanReceipt?: () => void;
  onQuickNote?: () => void;
  onVoiceInput?: () => void;
  onImportFromPhoto?: () => void;
  onImportFromFile?: () => void;
  onAddFromMarketplace?: () => void;
  showLabels?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  distanceFromEdge?: number;
  primaryColor?: string;
  secondaryColor?: string;
  size?: 'small' | 'medium' | 'large';
  vibrationEnabled?: boolean;
  soundEnabled?: boolean;
  animationType?: 'spring' | 'ease' | 'bounce';
  showBadge?: boolean;
  badgeCount?: number;
  customOptions?: QuickAddOption[];
  onCustomOptionPress?: (optionId: string) => void;
  showSpeedDial?: boolean;
  speedDialOptions?: QuickAddOption[];
  compactMode?: boolean;
  disabled?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const QuickAddButton: React.FC<QuickAddButtonProps> = memo(
  ({
    onAddSubscription,
    onAddTrial,
    onAddExpense,
    onScanReceipt,
    onQuickNote,
    onVoiceInput,
    onImportFromPhoto,
    onImportFromFile,
    onAddFromMarketplace,
    showLabels = true,
    position = 'bottom-right',
    distanceFromEdge = 20,
    primaryColor = '#007AFF',
    secondaryColor = '#5856D6',
    size = 'medium',
    vibrationEnabled = true,
    soundEnabled = true,
    animationType = 'spring',
    showBadge = false,
    badgeCount = 0,
    customOptions = [],
    onCustomOptionPress,
    showSpeedDial = true,
    speedDialOptions,
    compactMode = false,
    disabled = false,
  }) => {
    const insets = useSafeAreaInsets();

    // State
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    // Animation values
    const rotationAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const badgeScaleAnim = useRef(new Animated.Value(0)).current;
    const optionAnimations = useRef<Animated.Value[]>([]).current;

    // Default options
    const DEFAULT_OPTIONS = useMemo<QuickAddOption[]>(() => {
      const options: QuickAddOption[] = [];

      if (onAddSubscription) {
        options.push({
          id: 'subscription',
          label: 'Add Subscription',
          icon: 'plus-circle',
          color: '#007AFF',
          description: 'Track a new subscription',
          shortcut: 'S',
          action: onAddSubscription,
        });
      }

      if (onAddTrial) {
        options.push({
          id: 'trial',
          label: 'Add Free Trial',
          icon: 'clock-plus',
          color: '#34C759',
          description: 'Track a free trial',
          shortcut: 'T',
          action: onAddTrial,
        });
      }

      if (onAddExpense) {
        options.push({
          id: 'expense',
          label: 'Add Expense',
          icon: 'currency-usd',
          color: '#FF9500',
          description: 'Record a one-time expense',
          shortcut: 'E',
          action: onAddExpense,
        });
      }

      if (onScanReceipt) {
        options.push({
          id: 'scan',
          label: 'Scan Receipt',
          icon: 'camera',
          color: '#5856D6',
          description: 'Scan with camera',
          shortcut: 'R',
          action: onScanReceipt,
        });
      }

      if (onQuickNote) {
        options.push({
          id: 'note',
          label: 'Quick Note',
          icon: 'note-plus',
          color: '#FF2D55',
          description: 'Add a quick note',
          shortcut: 'N',
          action: onQuickNote,
        });
      }

      if (onVoiceInput) {
        options.push({
          id: 'voice',
          label: 'Voice Input',
          icon: 'microphone',
          color: '#5AC8FA',
          description: 'Use voice commands',
          shortcut: 'V',
          action: onVoiceInput,
        });
      }

      if (onImportFromPhoto) {
        options.push({
          id: 'import_photo',
          label: 'Import from Photo',
          icon: 'image',
          color: '#32D74B',
          description: 'Import from gallery',
          shortcut: 'P',
          action: onImportFromPhoto,
        });
      }

      if (onImportFromFile) {
        options.push({
          id: 'import_file',
          label: 'Import from File',
          icon: 'file-import',
          color: '#FF6B6B',
          description: 'Import CSV/Excel',
          shortcut: 'F',
          action: onImportFromFile,
        });
      }

      if (onAddFromMarketplace) {
        options.push({
          id: 'marketplace',
          label: 'Browse Marketplace',
          icon: 'store',
          color: '#AF52DE',
          description: 'Discover services',
          shortcut: 'M',
          action: onAddFromMarketplace,
        });
      }

      // Add custom options
      return [...options, ...customOptions];
    }, [
      onAddSubscription,
      onAddTrial,
      onAddExpense,
      onScanReceipt,
      onQuickNote,
      onVoiceInput,
      onImportFromPhoto,
      onImportFromFile,
      onAddFromMarketplace,
      customOptions,
    ]);

    // All options including speed dial
    const ALL_OPTIONS = useMemo(() => {
      if (speedDialOptions) return speedDialOptions;
      return DEFAULT_OPTIONS;
    }, [DEFAULT_OPTIONS, speedDialOptions]);

    // Size values
    const SIZE_VALUES = useMemo(() => {
      switch (size) {
        case 'small':
          return { button: 44, icon: 20, option: 40, fontSize: 12 };
        case 'large':
          return { button: 64, icon: 28, option: 56, fontSize: 14 };
        default: // medium
          return { button: 56, icon: 24, option: 48, fontSize: 13 };
      }
    }, [size]);

    // Position styles
    const positionStyle = useMemo(() => {
      const bottomDistance = distanceFromEdge + insets.bottom;
      const topDistance = distanceFromEdge + insets.top;

      switch (position) {
        case 'bottom-left':
          return {
            bottom: bottomDistance,
            left: distanceFromEdge,
          };
        case 'top-right':
          return {
            top: topDistance,
            right: distanceFromEdge,
          };
        case 'top-left':
          return {
            top: topDistance,
            left: distanceFromEdge,
          };
        default: // bottom-right
          return {
            bottom: bottomDistance,
            right: distanceFromEdge,
          };
      }
    }, [position, distanceFromEdge, insets]);

    // Handle button press
    const handleButtonPress = useCallback(() => {
      if (disabled) return;

      if (vibrationEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (showSpeedDial && ALL_OPTIONS.length > 0) {
        setIsExpanded(!isExpanded);
        
        // Rotation animation
        Animated.timing(rotationAnim, {
          toValue: isExpanded ? 0 : 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();

        // Scale animation
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            easing: Easing.elastic(1),
            useNativeDriver: true,
          }),
        ]).start();

        // Options animation
        ALL_OPTIONS.forEach((_, index) => {
          if (!optionAnimations[index]) {
            optionAnimations[index] = new Animated.Value(0);
          }

          Animated.spring(optionAnimations[index], {
            toValue: isExpanded ? 0 : 1,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
            delay: index * 50,
          }).start();
        });
      } else {
        // Default action
        onAddSubscription?.();
      }
    }, [
      disabled,
      vibrationEnabled,
      showSpeedDial,
      ALL_OPTIONS,
      isExpanded,
      rotationAnim,
      scaleAnim,
      optionAnimations,
      onAddSubscription,
    ]);

    // Handle option press
    const handleOptionPress = useCallback((option: QuickAddOption) => {
      if (disabled) return;

      if (vibrationEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Close speed dial
      setIsExpanded(false);
      Animated.timing(rotationAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Call action
      option.action();
      
      // Call custom handler if provided
      if (onCustomOptionPress) {
        onCustomOptionPress(option.id);
      }
    }, [disabled, vibrationEnabled, rotationAnim, onCustomOptionPress]);

    // Handle long press
    const handleLongPress = useCallback(() => {
      if (disabled) return;

      if (vibrationEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      setShowOptionsModal(true);
    }, [disabled, vibrationEnabled]);

    // Badge animation
    const animateBadge = useCallback(() => {
      Animated.sequence([
        Animated.timing(badgeScaleAnim, {
          toValue: 1.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(badgeScaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }, [badgeScaleAnim]);

    // Bounce animation
    const animateBounce = useCallback(() => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          tension: 200,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }, [bounceAnim]);

    // Render speed dial option
    const renderSpeedDialOption = useCallback((option: QuickAddOption, index: number) => {
      if (!optionAnimations[index]) {
        optionAnimations[index] = new Animated.Value(0);
      }

      const translateY = optionAnimations[index].interpolate({
        inputRange: [0, 1],
        outputRange: [0, -(index + 1) * (SIZE_VALUES.option + 12)],
      });

      const opacity = optionAnimations[index];

      return (
        <Animated.View
          key={option.id}
          style={[
            styles.speedDialOption,
            {
              width: SIZE_VALUES.option,
              height: SIZE_VALUES.option,
              opacity,
              transform: [{ translateY }],
            },
          ]}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              { backgroundColor: option.color },
            ]}
            onPress={() => handleOptionPress(option)}
            activeOpacity={0.8}>
            <Icon name={option.icon as any} size={SIZE_VALUES.icon * 0.8} color="#fff" />
          </TouchableOpacity>
          
          {showLabels && (
            <Animated.View
              style={[
                styles.optionLabelContainer,
                {
                  opacity: optionAnimations[index],
                  transform: [
                    {
                      translateX: position.includes('right')
                        ? -SIZE_VALUES.option - 8
                        : SIZE_VALUES.option + 8,
                    },
                  ],
                },
              ]}>
              <View style={[
                styles.optionLabel,
                position.includes('right')
                  ? styles.optionLabelRight
                  : styles.optionLabelLeft,
              ]}>
                <Text style={[styles.optionLabelText, { fontSize: SIZE_VALUES.fontSize }]}>
                  {option.label}
                </Text>
                {option.shortcut && (
                  <View style={styles.optionShortcut}>
                    <Text style={styles.optionShortcutText}>{option.shortcut}</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}
        </Animated.View>
      );
    }, [SIZE_VALUES, optionAnimations, showLabels, position, handleOptionPress]);

    // Render options modal
    const renderOptionsModal = useCallback(() => (
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}>
          {Platform.OS === 'ios' && (
            <View
              style={[styles.blurView, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
            />
          )}
          
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[primaryColor, secondaryColor]}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Text style={styles.modalTitle}>Quick Add Options</Text>
              <TouchableOpacity onPress={() => setShowOptionsModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            
            <ScrollView style={styles.modalOptions}>
              {ALL_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setShowOptionsModal(false);
                    setTimeout(() => handleOptionPress(option), 300);
                  }}
                  activeOpacity={0.7}>
                  <View style={[styles.modalOptionIcon, { backgroundColor: option.color + '20' }]}>
                    <Icon name={option.icon as any} size={24} color={option.color} />
                  </View>
                  
                  <View style={styles.modalOptionInfo}>
                    <Text style={styles.modalOptionLabel}>{option.label}</Text>
                    {option.description && (
                      <Text style={styles.modalOptionDescription}>{option.description}</Text>
                    )}
                  </View>
                  
                  {option.shortcut && (
                    <View style={styles.modalOptionShortcut}>
                      <Text style={styles.modalOptionShortcutText}>{option.shortcut}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowOptionsModal(false)}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    ), [showOptionsModal, ALL_OPTIONS, primaryColor, secondaryColor, handleOptionPress]);

    // Main button rotation
    const rotation = rotationAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '135deg'],
    });

    // Bounce transform
    const bounceTransform = {
      transform: [
        { translateY: bounceAnim },
      ],
    };

    // Badge scale
    const badgeScale = badgeScaleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <>
        {/* Speed dial options */}
        {isExpanded && showSpeedDial && (
          <View style={[styles.speedDialContainer, positionStyle]}>
            {ALL_OPTIONS.map((option, index) => renderSpeedDialOption(option, index))}
          </View>
        )}

        {/* Main button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            positionStyle,
            bounceTransform,
            { zIndex: 1000 },
          ]}>
          {/* Glow effect */}
          {isPressed && (
            <Animated.View style={[
              styles.buttonGlow,
              {
                backgroundColor: primaryColor + '40',
                transform: [{ scale: scaleAnim.interpolate({
                  inputRange: [0.9, 1],
                  outputRange: [1.2, 1],
                }) }],
              },
            ]} />
          )}
          
          <TouchableOpacity
            style={[
              styles.mainButton,
              {
                width: SIZE_VALUES.button,
                height: SIZE_VALUES.button,
                backgroundColor: primaryColor,
              },
              disabled && styles.buttonDisabled,
            ]}
            onPress={handleButtonPress}
            onLongPress={handleLongPress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            activeOpacity={0.8}
            delayLongPress={500}
            disabled={disabled}>
            <LinearGradient
              colors={[primaryColor, secondaryColor]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Icon
                name={isExpanded ? 'close' : 'plus'}
                size={SIZE_VALUES.icon}
                color="#fff"
              />
            </Animated.View>
            
            {/* Badge */}
            {showBadge && badgeCount > 0 && (
              <Animated.View
                style={[
                  styles.badge,
                  {
                    transform: [{ scale: badgeScale }],
                  },
                ]}>
                <Text style={styles.badgeText}>
                  {badgeCount > 99 ? '99+' : badgeCount}
                </Text>
              </Animated.View>
            )}
          </TouchableOpacity>
          
          {/* Ripple effect */}
          {isPressed && (
            <Animated.View
              style={[
                styles.ripple,
                {
                  width: SIZE_VALUES.button * 1.5,
                  height: SIZE_VALUES.button * 1.5,
                  borderColor: primaryColor + '40',
                  opacity: opacityAnim,
                },
              ]}
            />
          )}
        </Animated.View>

        {/* Options modal */}
        {renderOptionsModal()}
      </>
    );
  }
);

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    zIndex: 1000,
  },
  buttonGlow: {
    position: 'absolute',
    width: '130%',
    height: '130%',
    borderRadius: 100,
    opacity: 0.5,
  },
  mainButton: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  ripple: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
  },
  speedDialContainer: {
    position: 'absolute',
    zIndex: 999,
    alignItems: 'center',
  },
  speedDialOption: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButton: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  optionLabelContainer: {
    position: 'absolute',
    top: 0,
    height: '100%',
    justifyContent: 'center',
  },
  optionLabel: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: 200,
  },
  optionLabelRight: {
    marginRight: 8,
  },
  optionLabelLeft: {
    marginLeft: 8,
  },
  optionLabelText: {
    color: '#fff',
    fontWeight: '600',
  },
  optionShortcut: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
  },
  optionShortcutText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  modalOptions: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalOptionInfo: {
    flex: 1,
  },
  modalOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  modalOptionDescription: {
    fontSize: 12,
    color: '#8E8E93',
  },
  modalOptionShortcut: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
  },
  modalOptionShortcutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

QuickAddButton.displayName = 'QuickAddButton';

export default QuickAddButton;
