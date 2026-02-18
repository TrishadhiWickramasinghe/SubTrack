import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    Layout,
    LinearTransition,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@context/ThemeContext';
import settingsStorage from '@services/storage/settingsStorage';

interface PreferenceData {
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  country: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  defaultCurrency: string;
  currencyFormat: string;
  compactView: boolean;
  defaultView: 'dashboard' | 'subscriptions' | 'analytics';
  reduceAnimations: boolean;
  showAmounts: boolean;
}

interface PreferenceOption {
  label: string;
  value: string;
  description?: string;
}

const FONT_SIZES: PreferenceOption[] = [
  { label: 'Small', value: 'small', description: 'Compact text size' },
  { label: 'Medium', value: 'medium', description: 'Default text size' },
  { label: 'Large', value: 'large', description: 'Larger text size' },
];

const LANGUAGES: PreferenceOption[] = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
];

const DATE_FORMATS: PreferenceOption[] = [
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  { label: 'DD-MMM-YYYY', value: 'DD-MMM-YYYY' },
];

const CURRENCIES: PreferenceOption[] = [
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' },
  { label: 'JPY - Japanese Yen', value: 'JPY' },
  { label: 'CAD - Canadian Dollar', value: 'CAD' },
  { label: 'AUD - Australian Dollar', value: 'AUD' },
];

const CURRENCY_FORMATS: PreferenceOption[] = [
  { label: 'Symbol ($)', value: 'symbol', description: '$1,000.00' },
  { label: 'Code (USD)', value: 'code', description: 'USD 1,000.00' },
  { label: 'Symbol with space ($ )', value: 'symbol_with_space', description: '$ 1,000.00' },
];

const DEFAULT_VIEWS: PreferenceOption[] = [
  { label: 'Dashboard', value: 'dashboard', description: 'Overview and stats' },
  { label: 'Subscriptions', value: 'subscriptions', description: 'All subscriptions' },
  { label: 'Analytics', value: 'analytics', description: 'Charts and reports' },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const PreferencesScreen: React.FC = () => {
  const { colors } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<PreferenceData>({
    fontSize: 'medium',
    language: 'en',
    country: 'US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    defaultCurrency: 'USD',
    currencyFormat: 'symbol',
    compactView: false,
    defaultView: 'dashboard',
    reduceAnimations: false,
    showAmounts: true,
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    display: false,
    regional: false,
    currency: false,
    view: false,
    data: false,
  });

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const settings = await settingsStorage.getSettings();
        if (settings?.preferences) {
          setPreferences((prev) => ({
            ...prev,
            ...settings.preferences,
          }));
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Save preference
  const savePreference = useCallback(
    async (key: keyof PreferenceData, value: any) => {
      try {
        const updatedPrefs = { ...preferences, [key]: value };
        setPreferences(updatedPrefs);
        await settingsStorage.updateSetting(`preferences.${key}`, value);
      } catch (error) {
        console.error('Error saving preference:', error);
        Alert.alert('Error', 'Failed to save preference');
      }
    },
    [preferences]
  );

  // Toggle section
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Handle preference change
  const handlePreferenceChange = useCallback(
    (key: keyof PreferenceData, value: any) => {
      savePreference(key, value);
    },
    [savePreference]
  );

  // Handle save all
  const handleSaveAll = useCallback(async () => {
    setLoading(true);
    try {
      await settingsStorage.updateSetting('preferences', preferences);
      Alert.alert('Success', 'All preferences saved successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  }, [preferences, router]);

  // Handle reset to defaults
  const handleResetDefaults = useCallback(() => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all preferences to defaults?',
      [
        {
          text: 'Reset',
          onPress: async () => {
            const defaults: PreferenceData = {
              fontSize: 'medium',
              language: 'en',
              country: 'US',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              dateFormat: 'MM/DD/YYYY',
              timeFormat: '12h',
              defaultCurrency: 'USD',
              currencyFormat: 'symbol',
              compactView: false,
              defaultView: 'dashboard',
              reduceAnimations: false,
              showAmounts: true,
            };
            setPreferences(defaults);
            try {
              await settingsStorage.updateSetting('preferences', defaults);
              Alert.alert('Success', 'Preferences reset to defaults');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset preferences');
            }
          },
          style: 'destructive',
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const PreferenceSection = useCallback(
    (props: {
      title: string;
      icon: string;
      section: string;
      children: React.ReactNode;
    }) => (
      <Animated.View
        style={styles.section}
        entering={FadeInDown}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(props.section)}
        >
          <View style={styles.sectionHeaderLeft}>
            <Icon name={props.icon} size={20} color={colors.primary} style={{ marginRight: 10 }} />
            <Text style={styles.sectionTitle}>{props.title}</Text>
          </View>
          <Icon
            name={expandedSections[props.section] ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {expandedSections[props.section] && (
          <Animated.View entering={FadeIn} layout={LinearTransition}>
            <View style={styles.sectionContent}>{props.children}</View>
          </Animated.View>
        )}
      </Animated.View>
    ),
    [colors, expandedSections, toggleSection]
  );

  const OptionSelector = useCallback(
    (props: {
      label: string;
      value: string;
      options: PreferenceOption[];
      onChange: (value: string) => void;
    }) => (
      <View style={styles.optionGroup}>
        <Text style={styles.optionLabel}>{props.label}</Text>
        <View style={styles.optionsContainer}>
          {props.options.map((option) => (
            <AnimatedTouchable
              key={option.value}
              style={[
                styles.optionButton,
                props.value === option.value && styles.optionButtonActive,
              ]}
              onPress={() => props.onChange(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  props.value === option.value && styles.optionButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
              {option.description && (
                <Text style={styles.optionDescription}>{option.description}</Text>
              )}
            </AnimatedTouchable>
          ))}
        </View>
      </View>
    ),
    []
  );

  const ToggleOption = useCallback(
    (props: {
      label: string;
      description?: string;
      value: boolean;
      onChange: (value: boolean) => void;
      icon?: string;
    }) => (
      <View style={styles.toggleGroup}>
        <View style={styles.toggleContent}>
          {props.icon && (
            <Icon name={props.icon} size={18} color={colors.primary} style={{ marginRight: 10 }} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>{props.label}</Text>
            {props.description && (
              <Text style={styles.toggleDescription}>{props.description}</Text>
            )}
          </View>
        </View>
        <Switch
          value={props.value}
          onValueChange={props.onChange}
          trackColor={{ false: colors.border, true: `${colors.primary}40` }}
          thumbColor={props.value ? colors.primary : colors.textSecondary}
        />
      </View>
    ),
    [colors]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scrollView: {
          flexGrow: 1,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
        },
        closeButton: {
          padding: 8,
        },
        content: {
          paddingHorizontal: 16,
          paddingVertical: 20,
        },
        section: {
          marginBottom: 16,
          borderRadius: 12,
          backgroundColor: colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        },
        sectionHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 14,
        },
        sectionHeaderLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        },
        sectionTitle: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.text,
        },
        sectionContent: {
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        optionGroup: {
          marginBottom: 16,
        },
        optionLabel: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 10,
        },
        optionsContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        },
        optionButton: {
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.backgroundSecondary,
          minWidth: '30%',
        },
        optionButtonActive: {
          backgroundColor: `${colors.primary}20`,
          borderColor: colors.primary,
        },
        optionButtonText: {
          fontSize: 12,
          fontWeight: '500',
          color: colors.text,
        },
        optionButtonTextActive: {
          color: colors.primary,
          fontWeight: '600',
        },
        optionDescription: {
          fontSize: 10,
          color: colors.textSecondary,
          marginTop: 2,
        },
        toggleGroup: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: colors.background,
          marginBottom: 8,
        },
        toggleContent: {
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        },
        toggleLabel: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 2,
        },
        toggleDescription: {
          fontSize: 11,
          color: colors.textSecondary,
        },
        infoBox: {
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginTop: 16,
          marginBottom: 16,
          borderRadius: 8,
          backgroundColor: `${colors.info}15`,
          flexDirection: 'row',
          alignItems: 'flex-start',
        },
        infoBoxIcon: {
          marginRight: 10,
          marginTop: 2,
        },
        infoBoxText: {
          flex: 1,
          fontSize: 12,
          color: colors.text,
          lineHeight: 16,
        },
        footerButtons: {
          flexDirection: 'row',
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        button: {
          flex: 1,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
        resetButton: {
          backgroundColor: `${colors.error}15`,
          borderWidth: 1,
          borderColor: colors.error,
        },
        resetButtonText: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.error,
        },
        saveButton: {
          backgroundColor: colors.primary,
        },
        saveButtonText: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.textInverse,
        },
      }),
    [colors]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Preferences</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Icon name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        scrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={styles.content} entering={FadeIn} layout={LinearTransition}>
          {/* Display Preferences */}
          <PreferenceSection title="Display" icon="palette" section="display">
            <OptionSelector
              label="Font Size"
              value={preferences.fontSize}
              options={FONT_SIZES}
              onChange={(value) =>
                handlePreferenceChange('fontSize', value as 'small' | 'medium' | 'large')
              }
            />

            <ToggleOption
              label="Reduce Animations"
              description="Minimize motion and transitions"
              icon="motion-pause"
              value={preferences.reduceAnimations}
              onChange={(value) => handlePreferenceChange('reduceAnimations', value)}
            />

            <ToggleOption
              label="Compact View"
              description="Show more items per screen"
              icon="view-dashboard-compact"
              value={preferences.compactView}
              onChange={(value) => handlePreferenceChange('compactView', value)}
            />

            <ToggleOption
              label="Show Amounts"
              description="Display subscription amounts throughout the app"
              icon="eye"
              value={preferences.showAmounts}
              onChange={(value) => handlePreferenceChange('showAmounts', value)}
            />
          </PreferenceSection>

          {/* Regional Settings */}
          <PreferenceSection title="Regional" icon="map" section="regional">
            <OptionSelector
              label="Language"
              value={preferences.language}
              options={LANGUAGES}
              onChange={(value) => handlePreferenceChange('language', value)}
            />

            <OptionSelector
              label="Date Format"
              value={preferences.dateFormat}
              options={DATE_FORMATS}
              onChange={(value) => handlePreferenceChange('dateFormat', value)}
            />

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Time Format</Text>
              <View style={styles.optionsContainer}>
                {[
                  { label: '12-Hour (AM/PM)', value: '12h' },
                  { label: '24-Hour', value: '24h' },
                ].map((option) => (
                  <AnimatedTouchable
                    key={option.value}
                    style={[
                      styles.optionButton,
                      preferences.timeFormat === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() => handlePreferenceChange('timeFormat', option.value as '12h' | '24h')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        preferences.timeFormat === option.value && styles.optionButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </AnimatedTouchable>
                ))}
              </View>
            </View>
          </PreferenceSection>

          {/* Currency Settings */}
          <PreferenceSection title="Currency" icon="cash" section="currency">
            <OptionSelector
              label="Default Currency"
              value={preferences.defaultCurrency}
              options={CURRENCIES}
              onChange={(value) => handlePreferenceChange('defaultCurrency', value)}
            />

            <OptionSelector
              label="Currency Format"
              value={preferences.currencyFormat}
              options={CURRENCY_FORMATS}
              onChange={(value) => handlePreferenceChange('currencyFormat', value)}
            />
          </PreferenceSection>

          {/* View Preferences */}
          <PreferenceSection title="Default View" icon="home" section="view">
            <OptionSelector
              label="When Opening App"
              value={preferences.defaultView}
              options={DEFAULT_VIEWS}
              onChange={(value) =>
                handlePreferenceChange('defaultView', value as 'dashboard' | 'subscriptions' | 'analytics')
              }
            />
          </PreferenceSection>

          {/* Data Preferences */}
          <PreferenceSection title="Data & Sync" icon="cloud" section="data">
            <ToggleOption
              label="Auto-Sync"
              description="Automatically sync data across devices"
              icon="cloud-sync"
              value={true}
              onChange={() => {}}
            />

            <ToggleOption
              label="Analytics"
              description="Help improve the app by sharing usage data"
              icon="chart-box"
              value={true}
              onChange={() => {}}
            />
          </PreferenceSection>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Icon
              name="information"
              size={16}
              color={colors.info}
              style={styles.infoBoxIcon}
            />
            <Text style={styles.infoBoxText}>
              Your preferences are automatically saved. Changes will take effect immediately or after refreshing the app.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleResetDefaults}
          disabled={loading}
        >
          <Icon name="restart" size={18} color={colors.error} style={{ marginRight: 6 }} />
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, loading && { opacity: 0.6 }]}
          onPress={handleSaveAll}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} size="small" />
          ) : (
            <>
              <Icon name="check" size={18} color={colors.textInverse} style={{ marginRight: 6 }} />
              <Text style={styles.saveButtonText}>Save All</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PreferencesScreen;
