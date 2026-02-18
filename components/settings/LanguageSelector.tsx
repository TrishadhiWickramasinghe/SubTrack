import React, { useCallback, useMemo, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@context/ThemeContext';
import settingsStorage from '@services/storage/settingsStorage';

export interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
  onLanguageChange?: (language: Language) => void;
  testID?: string;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  icon: string;
}

const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    icon: 'language-english',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    icon: 'language-spanish',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    icon: 'language-french',
  },
  {
    code: 'si',
    name: 'Sinhala',
    nativeName: 'සිංහල',
    flag: '🇱🇰',
    icon: 'language',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    icon: 'language',
  },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  visible,
  onClose,
  onLanguageChange,
  testID,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);

  // Load current language on mount
  React.useEffect(() => {
    const loadCurrentLanguage = async () => {
      try {
        const settings = await settingsStorage.getSettings();
        if (settings?.preferences?.language) {
          setSelectedLanguage(settings.preferences.language);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };

    if (visible) {
      loadCurrentLanguage();
    }
  }, [visible]);

  // Handle language change
  const handleLanguageChange = useCallback(
    async (language: Language) => {
      setLoading(true);
      try {
        await settingsStorage.setLanguage(language.code);
        setSelectedLanguage(language.code);
        onLanguageChange?.(language);

        // Close after a brief delay for UX
        setTimeout(() => {
          setLoading(false);
          onClose();
        }, 300);
      } catch (error) {
        console.error('Error changing language:', error);
        setLoading(false);
      }
    },
    [onClose, onLanguageChange]
  );

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
          marginBottom: 16,
        },
        sectionTitle: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.textSecondary,
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        languageList: {
          marginBottom: 24,
        },
        languageButton: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 12,
          marginBottom: 8,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.border,
          backgroundColor: colors.backgroundSecondary,
        },
        languageButtonActive: {
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}15`,
        },
        languageContent: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
        },
        flag: {
          fontSize: 28,
          marginRight: 12,
        },
        languageInfo: {
          flex: 1,
        },
        languageName: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 2,
        },
        languageNative: {
          fontSize: 12,
          color: colors.textSecondary,
        },
        checkmark: {
          fontSize: 20,
          color: colors.primary,
          fontWeight: 'bold',
          marginLeft: 8,
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
        footerButtonDisabled: {
          opacity: 0.6,
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
            <Text style={styles.title}>Select Language</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={loading}
            >
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Languages Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Languages</Text>
            <View style={styles.languageList}>
              {LANGUAGES.map((language) => (
                <AnimatedTouchable
                  key={language.code}
                  style={[
                    styles.languageButton,
                    selectedLanguage === language.code && styles.languageButtonActive,
                  ]}
                  onPress={() => handleLanguageChange(language)}
                  activeOpacity={0.7}
                  disabled={loading}
                  testID={`language-${language.code}`}
                >
                  <View style={styles.languageContent}>
                    <Text style={styles.flag}>{language.flag}</Text>
                    <View style={styles.languageInfo}>
                      <Text style={styles.languageName}>{language.name}</Text>
                      <Text style={styles.languageNative}>{language.nativeName}</Text>
                    </View>
                  </View>
                  {selectedLanguage === language.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </AnimatedTouchable>
              ))}
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.footerButton, loading && styles.footerButtonDisabled]}
            onPress={onClose}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.footerButtonText}>
              {loading ? 'Changing Language...' : 'Done'}
            </Text>
          </TouchableOpacity>
        </Animated.ScrollView>
      </Animated.View>
    </Modal>
  );
};

export default LanguageSelector;
