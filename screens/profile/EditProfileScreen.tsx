import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    LinearTransition,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@hooks/useAuth';
import settingsStorage from '@services/storage/settingsStorage';

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
}

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const EditProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [selectedGender, setSelectedGender] = useState('');

  // Load user profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const settings = await settingsStorage.getSettings();
        if (settings?.profile) {
          setFormData((prev) => ({
            ...prev,
            ...settings.profile,
          }));
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    loadProfileData();
  }, []);

  // Validation functions
  const validateField = useCallback((name: string, value: string): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        if (value.trim().length > 100) return 'Full name must not exceed 100 characters';
        return undefined;
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Invalid email address';
        return undefined;
      case 'phone':
        if (value && !/^\+?[\d\s\-()]{10,}$/.test(value)) return 'Invalid phone number';
        return undefined;
      case 'bio':
        if (value && value.length > 500) return 'Bio must not exceed 500 characters';
        return undefined;
      default:
        return undefined;
    }
  }, []);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Handle field change
  const handleFieldChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev: FormErrors) => ({
        ...prev,
        [name]: error,
      }));
    }
  }, [touched, validateField]);

  // Handle field blur
  const handleFieldBlur = useCallback((name: string) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, formData[name as keyof ProfileFormData]);
    setErrors((prev: FormErrors) => ({
      ...prev,
      [name]: error,
    }));
  }, [formData, validateField]);

  // Handle gender selection
  const handleGenderSelect = useCallback((gender: string) => {
    setSelectedGender(gender);
    handleFieldChange('gender', gender);
    setShowGenderPicker(false);
  }, [handleFieldChange]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix all errors before saving');
      return;
    }

    setLoading(true);
    try {
      await settingsStorage.updateSetting('profile', formData);
      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, router]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    Alert.alert('Discard Changes', 'Are you sure you want to discard changes?', [
      {
        text: 'Discard',
        onPress: () => router.back(),
        style: 'destructive',
      },
      { text: 'Keep Editing', style: 'cancel' },
    ]);
  }, [router]);

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
          paddingVertical: 24,
        },
        section: {
          marginBottom: 24,
        },
        sectionTitle: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginBottom: 12,
        },
        formGroup: {
          marginBottom: 16,
        },
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 6,
        },
        labelOptional: {
          fontSize: 11,
          fontWeight: '400',
          color: colors.textSecondary,
          marginTop: 2,
        },
        input: {
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.backgroundSecondary,
          color: colors.text,
          fontSize: 14,
          fontFamily: 'System',
        },
        inputError: {
          borderColor: colors.error,
        },
        inputFocused: {
          borderColor: colors.primary,
        },
        multilineInput: {
          minHeight: 100,
          textAlignVertical: 'top',
        },
        errorText: {
          fontSize: 12,
          color: colors.error,
          marginTop: 4,
        },
        selectButton: {
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.backgroundSecondary,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        selectButtonText: {
          fontSize: 14,
          color: colors.text,
          fontWeight: '500',
        },
        selectButtonPlaceholder: {
          color: colors.textSecondary,
        },
        charCount: {
          fontSize: 11,
          color: colors.textSecondary,
          marginTop: 4,
          textAlign: 'right',
        },
        charCountWarning: {
          color: colors.warning,
        },
        charCountError: {
          color: colors.error,
        },
        infoBox: {
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginTop: 8,
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
        genderPickerContainer: {
          marginTop: 8,
          borderRadius: 8,
          backgroundColor: colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        },
        genderPickerItem: {
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        genderPickerItemLast: {
          borderBottomWidth: 0,
        },
        genderPickerItemText: {
          fontSize: 14,
          color: colors.text,
        },
        genderPickerItemActive: {
          fontWeight: '600',
          color: colors.primary,
        },
        footerButtons: {
          flexDirection: 'row',
          gap: 12,
          paddingHorizontal: 16,
          paddingBottom: 24,
        },
        button: {
          flex: 1,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
        cancelButton: {
          backgroundColor: colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: colors.border,
        },
        cancelButtonText: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
        },
        saveButton: {
          backgroundColor: colors.primary,
        },
        saveButtonText: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.textInverse,
        },
        readOnlyInput: {
          opacity: 0.6,
        },
      }),
    [colors]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleCancel}
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
          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            {/* Full Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  touched.fullName && errors.fullName && styles.inputError,
                  touched.fullName && !errors.fullName && styles.inputFocused,
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                value={formData.fullName}
                onChangeText={(text) => handleFieldChange('fullName', text)}
                onBlur={() => handleFieldBlur('fullName')}
                editable={!loading}
              />
              {touched.fullName && errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            {/* Email (Read-only) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={formData.email}
                editable={false}
              />
              <Text style={styles.labelOptional}>Email cannot be changed</Text>
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[
                  styles.input,
                  touched.phone && errors.phone && styles.inputError,
                ]}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={colors.textSecondary}
                value={formData.phone}
                onChangeText={(text) => handleFieldChange('phone', text)}
                onBlur={() => handleFieldBlur('phone')}
                editable={!loading}
                keyboardType="phone-pad"
              />
              {touched.phone && errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            {/* Date of Birth */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={[styles.input]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={formData.dateOfBirth}
                onChangeText={(text) => handleFieldChange('dateOfBirth', text)}
                onBlur={() => handleFieldBlur('dateOfBirth')}
                editable={!loading}
                keyboardType="default"
              />
            </View>

            {/* Gender */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowGenderPicker(!showGenderPicker)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    !selectedGender && styles.selectButtonPlaceholder,
                  ]}
                >
                  {selectedGender || 'Select gender'}
                </Text>
                <Icon
                  name={showGenderPicker ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>

              {showGenderPicker && (
                <Animated.View
                  style={styles.genderPickerContainer}
                  entering={FadeIn}
                  layout={LinearTransition}
                >
                  {GENDERS.map((gender, index) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderPickerItem,
                        index === GENDERS.length - 1 && styles.genderPickerItemLast,
                      ]}
                      onPress={() => handleGenderSelect(gender)}
                    >
                      <Text
                        style={[
                          styles.genderPickerItemText,
                          selectedGender === gender && styles.genderPickerItemActive,
                        ]}
                      >
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}
            </View>
          </View>

          {/* Bio Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About You</Text>

            {/* Bio */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                  touched.bio && errors.bio && styles.inputError,
                ]}
                placeholder="Tell us about yourself (optional)"
                placeholderTextColor={colors.textSecondary}
                value={formData.bio}
                onChangeText={(text) => handleFieldChange('bio', text)}
                onBlur={() => handleFieldBlur('bio')}
                editable={!loading}
                multiline
                maxLength={500}
              />
              <Text
                style={[
                  styles.charCount,
                  formData.bio.length > 400 && styles.charCountWarning,
                  formData.bio.length > 500 && styles.charCountError,
                ]}
              >
                {formData.bio.length}/500
              </Text>
              {touched.bio && errors.bio && (
                <Text style={styles.errorText}>{errors.bio}</Text>
              )}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Icon
                name="information"
                size={16}
                color={colors.info}
                style={styles.infoBoxIcon}
              />
              <Text style={styles.infoBoxText}>
                Your profile information helps personalize your experience and is only visible
                to you unless you share it with others.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer Buttons */}
      <Animated.View style={styles.footerButtons} entering={FadeInDown}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
