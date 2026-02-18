import React, { useCallback, useMemo, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@context/ThemeContext';

export interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
  testID?: string;
}

interface ThemeMode {
  id: string;
  label: string;
  icon: string;
  description: string;
}

interface AccentColor {
  name: string;
  value: string;
}

const THEME_MODES: ThemeMode[] = [
  {
    id: 'light',
    label: 'Light',
    icon: 'white-balance-sunny',
    description: 'Light theme',
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: 'moon-waning-crescent',
    description: 'Dark theme',
  },
  {
    id: 'system',
    label: 'System',
    icon: 'cellphone-cog',
    description: 'Follow device settings',
  },
];

const ACCENT_COLORS: AccentColor[] = [
  { name: 'Teal', value: '#4ECDC4' },
  { name: 'Coral', value: '#FF6B6B' },
  { name: 'Purple', value: '#6C5CE7' },
  { name: 'Blue', value: '#74B9FF' },
  { name: 'Green', value: '#00B894' },
  { name: 'Yellow', value: '#FDCB6E' },
  { name: 'Pink', value: '#FD79A8' },
  { name: 'Orange', value: '#E17055' },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  visible,
  onClose,
  testID,
}) => {
  const { colors, setThemeModeWithSave, setAccentColorWithSave, toggleHighContrast, getThemeInfo } = useTheme();
  const insets = useSafeAreaInsets();

  const themeInfo = getThemeInfo();
  const [selectedMode, setSelectedMode] = useState(themeInfo.mode);
  const [selectedAccent, setSelectedAccent] = useState(themeInfo.accentColor);
  const [highContrast, setHighContrast] = useState(themeInfo.isHighContrast);

  // Handle theme mode change
  const handleModeChange = useCallback(
    async (modeId: string) => {
      setSelectedMode(modeId);
      try {
        await setThemeModeWithSave(modeId);
      } catch (error) {
        console.error('Error changing theme mode:', error);
        setSelectedMode(themeInfo.mode);
      }
    },
    [setThemeModeWithSave, themeInfo.mode]
  );

  // Handle accent color change
  const handleAccentChange = useCallback(
    async (colorValue: string) => {
      setSelectedAccent(colorValue);
      try {
        await setAccentColorWithSave(colorValue);
      } catch (error) {
        console.error('Error changing accent color:', error);
        setSelectedAccent(themeInfo.accentColor);
      }
    },
    [setAccentColorWithSave, themeInfo.accentColor]
  );

  // Handle high contrast toggle
  const handleHighContrastToggle = useCallback(async () => {
    setHighContrast(!highContrast);
    try {
      await toggleHighContrast();
    } catch (error) {
      console.error('Error toggling high contrast:', error);
      setHighContrast(highContrast);
    }
  }, [toggleHighContrast, highContrast]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        },
        content: {
          backgroundColor: colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 24,
          paddingHorizontal: 16,
          paddingBottom: Math.max(insets.bottom, 16),
          maxHeight: '90%',
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        },
        title: {
          fontSize: 20,
          fontWeight: '600',
          color: colors.text,
        },
        closeButton: {
          padding: 8,
        },
        section: {
          marginBottom: 32,
        },
        sectionTitle: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.textSecondary,
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        modeGrid: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 12,
        },
        modeButton: {
          flex: 1,
          paddingVertical: 16,
          paddingHorizontal: 12,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        modeButtonActive: {
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}15`,
        },
        modeIcon: {
          fontSize: 32,
          marginBottom: 8,
        },
        modeLabel: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 4,
        },
        modeDescription: {
          fontSize: 10,
          color: colors.textSecondary,
        },
        colorGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
        },
        colorButton: {
          width: '23%',
          aspectRatio: 1,
          borderRadius: 12,
          marginBottom: 8,
          borderWidth: 3,
          borderColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        },
        colorButtonActive: {
          borderColor: colors.text,
        },
        colorCheckmark: {
          fontSize: 20,
          color: '#FFFFFF',
          fontWeight: 'bold',
          textShadowColor: 'rgba(0, 0, 0, 0.3)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        },
        contrastSection: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 12,
          backgroundColor: colors.backgroundSecondary,
          borderRadius: 12,
          marginBottom: 24,
        },
        contrastLabel: {
          flex: 1,
        },
        contrastTitle: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 2,
        },
        contrastDescription: {
          fontSize: 12,
          color: colors.textSecondary,
        },
        toggle: {
          width: 50,
          height: 28,
          borderRadius: 14,
          justifyContent: 'center',
          paddingHorizontal: 2,
        },
        toggleInner: {
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
        },
        footerButton: {
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 12,
          backgroundColor: colors.primary,
          alignItems: 'center',
          marginTop: 8,
          marginBottom: 8,
        },
        footerButtonText: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.textInverse,
        },
      }),
    [colors, insets]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
    >
      <Animated.View style={styles.container} entering={FadeIn} exiting={FadeOut}>
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
        />

        <Animated.ScrollView
          style={styles.content}
          scrollEnabled
          showsVerticalScrollIndicator={true}
          entering={FadeIn}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Theme Settings</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Theme Mode Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <View style={styles.modeGrid}>
              {THEME_MODES.map((mode) => (
                <AnimatedTouchable
                  key={mode.id}
                  style={[
                    styles.modeButton,
                    selectedMode === mode.id && styles.modeButtonActive,
                  ]}
                  onPress={() => handleModeChange(mode.id)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={mode.icon}
                    size={32}
                    color={
                      selectedMode === mode.id ? colors.primary : colors.textSecondary
                    }
                    style={styles.modeIcon}
                  />
                  <Text style={styles.modeLabel}>{mode.label}</Text>
                  <Text style={styles.modeDescription}>{mode.description}</Text>
                </AnimatedTouchable>
              ))}
            </View>
          </View>

          {/* Accent Color Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accent Color</Text>
            <View style={styles.colorGrid}>
              {ACCENT_COLORS.map((color) => (
                <AnimatedTouchable
                  key={color.value}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color.value },
                    selectedAccent === color.value && styles.colorButtonActive,
                  ]}
                  onPress={() => handleAccentChange(color.value)}
                  activeOpacity={0.8}
                  testID={`accent-${color.name}`}
                >
                  {selectedAccent === color.value && (
                    <Text style={styles.colorCheckmark}>✓</Text>
                  )}
                </AnimatedTouchable>
              ))}
            </View>
          </View>

          {/* High Contrast Section */}
          <View style={styles.contrastSection}>
            <View style={styles.contrastLabel}>
              <Text style={styles.contrastTitle}>High Contrast</Text>
              <Text style={styles.contrastDescription}>
                Improve readability with enhanced colors
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                {
                  backgroundColor: highContrast ? colors.primary : colors.border,
                },
              ]}
              onPress={handleHighContrastToggle}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.toggleInner,
                  {
                    alignSelf: highContrast ? 'flex-end' : 'flex-start',
                  },
                ]}
              />
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.footerButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.footerButtonText}>Done</Text>
          </TouchableOpacity>
        </Animated.ScrollView>
      </Animated.View>
    </Modal>
  );
};

export default ThemeSelector;
