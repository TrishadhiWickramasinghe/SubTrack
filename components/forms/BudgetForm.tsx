import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { colors, spacing } from '@/config/theme';
import { useBudget } from '@/hooks/useBudget';

export type BudgetPeriod = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

interface BudgetFormProps {
  budgetId?: string;
  onSubmit?: (budget: any) => void | Promise<void>;
  onCancel?: () => void;
  onError?: (error: string) => void;
  variant?: 'default' | 'compact';
}

interface FormData {
  name: string;
  limit: string;
  category: string;
  period: BudgetPeriod;
  warningThreshold: string;
  currency: string;
  enableAlerts: boolean;
  alertFrequency: 'daily' | 'weekly' | 'instant';
  description: string;
}

interface FormErrors {
  name?: string;
  limit?: string;
  category?: string;
  warningThreshold?: string;
}

const BUDGET_CATEGORIES = [
  { id: 'subscriptions', label: 'Subscriptions', icon: 'netflix' },
  { id: 'entertainment', label: 'Entertainment', icon: 'popcorn' },
  { id: 'dining', label: 'Dining', icon: 'utensils' },
  { id: 'transport', label: 'Transport', icon: 'car' },
  { id: 'utilities', label: 'Utilities', icon: 'lightning-bolt' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag' },
  { id: 'health', label: 'Health', icon: 'hospital-box' },
  { id: 'education', label: 'Education', icon: 'school' },
  { id: 'other', label: 'Other', icon: 'tag' },
];

const BUDGET_PERIODS: BudgetPeriod[] = ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'];

export const BudgetForm: React.FC<BudgetFormProps> = ({
  budgetId,
  onSubmit,
  onCancel,
  onError,
  variant = 'default',
}) => {
  const { getBudgetById, createBudget, updateBudget } = useBudget();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    limit: '',
    category: 'other',
    period: 'monthly',
    warningThreshold: '80',
    currency: '$',
    enableAlerts: true,
    alertFrequency: 'instant',
    description: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [periodModalVisible, setPeriodModalVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Load existing budget if editing
  useEffect(() => {
    if (budgetId) {
      const budget = getBudgetById(budgetId);
      if (budget) {
        setFormData({
          name: budget.name || '',
          limit: budget.limit?.toString() || '',
          category: budget.category || 'other',
          period: budget.period || 'monthly',
          warningThreshold: budget.warningThreshold?.toString() || '80',
          currency: budget.currency || '$',
          enableAlerts: budget.enableAlerts !== false,
          alertFrequency: budget.alertFrequency || 'instant',
          description: budget.description || '',
        });
      }
    }

    // Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [budgetId, getBudgetById]);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    }

    const limit = parseFloat(formData.limit);
    if (isNaN(limit) || limit <= 0) {
      newErrors.limit = 'Please enter a valid budget limit';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    const threshold = parseFloat(formData.warningThreshold);
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      newErrors.warningThreshold = 'Warning threshold must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.selectionAsync();
    setIsLoading(true);

    try {
      const budgetData = {
        name: formData.name.trim(),
        limit: parseFloat(formData.limit),
        category: formData.category,
        period: formData.period,
        warningThreshold: parseFloat(formData.warningThreshold),
        currency: formData.currency,
        enableAlerts: formData.enableAlerts,
        alertFrequency: formData.alertFrequency,
        description: formData.description.trim(),
      };

      if (budgetId) {
        await updateBudget(budgetId, budgetData);
      } else {
        await createBudget(budgetData);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSubmit?.(budgetData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save budget';
      setErrors({ name: errorMessage });
      onError?.(errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, budgetId, validateForm, createBudget, updateBudget, onSubmit, onError]);

  const handleCancel = useCallback(() => {
    Haptics.selectionAsync();
    onCancel?.();
  }, [onCancel]);

  const categoryLabel = useMemo(() => {
    const cat = BUDGET_CATEGORIES.find(c => c.id === formData.category);
    return cat?.label || 'Select Category';
  }, [formData.category]);

  const periodLabel = formData.period.charAt(0).toUpperCase() + formData.period.slice(1);

  // Compact variant
  if (variant === 'compact') {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ] as any}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Name Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Budget Name *</Text>
            <View style={[styles.input, errors.name && styles.inputError]}>
              <MaterialCommunityIcons
                name="label" as any
                size={18}
                color={errors.name ? colors.error[600] : colors.neutral[500]}
              />
              <TextInput
                style={styles.inputField}
                placeholder="e.g., Monthly Subscriptions"
                placeholderTextColor={colors.neutral[400]}
                value={formData.name}
                onChangeText={name => {
                  setFormData(prev => ({ ...prev, name }));
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                editable={!isLoading}
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Limit Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Budget Limit *</Text>
            <View style={[styles.input, errors.limit && styles.inputError]}>
              <Text style={styles.currencySymbol}>{formData.currency}</Text>
              <TextInput
                style={[styles.inputField, styles.currencyInput]}
                placeholder="0.00"
                placeholderTextColor={colors.neutral[400]}
                keyboardType="decimal-pad"
                value={formData.limit}
                onChangeText={limit => {
                  setFormData(prev => ({ ...prev, limit }));
                  if (errors.limit) setErrors(prev => ({ ...prev, limit: undefined }));
                }}
                editable={!isLoading}
              />
            </View>
            {errors.limit && <Text style={styles.errorText}>{errors.limit}</Text>}
          </View>

          {/* Category Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Category *</Text>
            <TouchableOpacity
              style={[styles.selectInput, errors.category && styles.inputError]}
              onPress={() => setCategoryModalVisible(true)}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <MaterialCommunityIcons
                name={BUDGET_CATEGORIES.find(c => c.id === formData.category)?.icon as any}
                size={18}
                color={colors.neutral[700]}
              />
              <Text style={styles.selectInputText}>{categoryLabel}</Text>
              <MaterialCommunityIcons
                name="chevron-down" as any
                size={18}
                color={colors.neutral[500]}
              />
            </TouchableOpacity>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>

          {/* Period Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Period</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setPeriodModalVisible(true)}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <MaterialCommunityIcons
                name="calendar" as any
                size={18}
                color={colors.neutral[700]}
              />
              <Text style={styles.selectInputText}>{periodLabel}</Text>
              <MaterialCommunityIcons
                name="chevron-down" as any
                size={18}
                color={colors.neutral[500]}
              />
            </TouchableOpacity>
          </View>

          {/* Category & Period Modals */}
          {categoryModalVisible && (
            <View style={styles.modal}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <ScrollView
                  scrollEnabled={false}
                  style={styles.modalOptions}
                >
                  {BUDGET_CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.modalOption,
                        formData.category === cat.id && styles.modalOptionSelected,
                      ]}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, category: cat.id }));
                        setCategoryModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={cat.icon as any}
                        size={20}
                        color={
                          formData.category === cat.id
                            ? colors.primary[600]
                            : colors.neutral[700]
                        }
                      />
                      <Text
                        style={[
                          styles.modalOptionText,
                          formData.category === cat.id && styles.modalOptionTextSelected,
                        ]}
                      >
                        {cat.label}
                      </Text>
                      {formData.category === cat.id && (
                        <MaterialCommunityIcons
                          name="check" as any
                          size={20}
                          color={colors.primary[600]}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}

          {periodModalVisible && (
            <View style={styles.modal}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Period</Text>
                <ScrollView
                  scrollEnabled={false}
                  style={styles.modalOptions}
                >
                  {BUDGET_PERIODS.map(period => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.modalOption,
                        formData.period === period && styles.modalOptionSelected,
                      ]}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, period }));
                        setPeriodModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="calendar" as any
                        size={20}
                        color={
                          formData.period === period
                            ? colors.primary[600]
                            : colors.neutral[700]
                        }
                      />
                      <Text
                        style={[
                          styles.modalOptionText,
                          formData.period === period && styles.modalOptionTextSelected,
                        ]}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </Text>
                      {formData.period === period && (
                        <MaterialCommunityIcons
                          name="check" as any
                          size={20}
                          color={colors.primary[600]}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}

          {/* Warning Threshold */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>Warning Threshold</Text>
              <Text style={styles.fieldValue}>{formData.warningThreshold}%</Text>
            </View>
            <View style={styles.sliderContainer}>
              <View
                style={[
                  styles.sliderTrack,
                  {
                    width: `${Math.min(parseFloat(formData.warningThreshold) || 0, 100)}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>0%</Text>
              <Text style={styles.sliderLabel}>50%</Text>
              <Text style={styles.sliderLabel}>100%</Text>
            </View>
            {errors.warningThreshold && (
              <Text style={styles.errorText}>{errors.warningThreshold}</Text>
            )}
          </View>

          {/* Alerts Toggle */}
          <View style={styles.fieldGroup}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabel}>
                <MaterialCommunityIcons
                  name="bell" as any
                  size={18}
                  color={formData.enableAlerts ? colors.primary[600] : colors.neutral[500]}
                />
                <Text style={styles.fieldLabel}>Enable Alerts</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleSwitch,
                  formData.enableAlerts && styles.toggleSwitchActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, enableAlerts: !prev.enableAlerts }))}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.toggleThumb,
                    { backgroundColor: formData.enableAlerts ? colors.primary[600] : colors.neutral[300] },
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Alert Frequency */}
          {formData.enableAlerts && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Notification Frequency</Text>
              <View style={styles.frequencyOptions}>
                {(['daily', 'weekly', 'instant'] as const).map(freq => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyOption,
                      formData.alertFrequency === freq && styles.frequencyOptionSelected,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, alertFrequency: freq }))}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.frequencyOptionText,
                        formData.alertFrequency === freq && styles.frequencyOptionTextSelected,
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Description Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Description (Optional)</Text>
            <View style={styles.input}>
              <TextInput
                style={[styles.inputField, styles.descriptionInput]}
                placeholder="Add notes about this budget..."
                placeholderTextColor={colors.neutral[400]}
                value={formData.description}
                onChangeText={description => setFormData(prev => ({ ...prev, description }))}
                multiline
                numberOfLines={3}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={handleCancel}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            />
            <Button
              title={budgetId ? 'Update Budget' : 'Create Budget'}
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            />
          </View>

          <View style={{ height: spacing.lg }} />
        </ScrollView>
      </Animated.View>
    );
  }

  // Default variant (Full form)
  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ] as any}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {budgetId ? 'Edit Budget' : 'Create New Budget'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {budgetId ? 'Update your budget details' : 'Set up a new budget to track your spending'}
            </Text>
          </View>

          {/* Form Card */}
          <Card variant="elevated" padding="lg" style={styles.formCard}>
            {/* Name Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Budget Name *</Text>
              <View style={[styles.input, errors.name && styles.inputError]}>
                <MaterialCommunityIcons
                  name="label" as any
                  size={20}
                  color={errors.name ? colors.error[600] : colors.primary[600]}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g., Monthly Subscriptions"
                  placeholderTextColor={colors.neutral[400]}
                  value={formData.name}
                  onChangeText={name => {
                    setFormData(prev => ({ ...prev, name }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  editable={!isLoading}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Limit Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Budget Limit *</Text>
              <View style={[styles.input, errors.limit && styles.inputError]}>
                <Text style={styles.currencySymbol}>{formData.currency}</Text>
                <TextInput
                  style={[styles.inputField, styles.currencyInput]}
                  placeholder="0.00"
                  placeholderTextColor={colors.neutral[400]}
                  keyboardType="decimal-pad"
                  value={formData.limit}
                  onChangeText={limit => {
                    setFormData(prev => ({ ...prev, limit }));
                    if (errors.limit) setErrors(prev => ({ ...prev, limit: undefined }));
                  }}
                  editable={!isLoading}
                />
              </View>
              {errors.limit && <Text style={styles.errorText}>{errors.limit}</Text>}
            </View>

            {/* Category & Period Row */}
            <View style={styles.rowGroup}>
              {/* Category Field */}
              <View style={[styles.fieldGroup, { flex: 1, marginRight: spacing.md }]}>
                <Text style={styles.fieldLabel}>Category *</Text>
                <TouchableOpacity
                  style={[styles.selectInput, errors.category && styles.inputError]}
                  onPress={() => setCategoryModalVisible(true)}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <MaterialCommunityIcons
                    name={BUDGET_CATEGORIES.find(c => c.id === formData.category)?.icon as any}
                    size={20}
                    color={colors.primary[600]}
                  />
                  <Text style={styles.selectInputText}>{categoryLabel}</Text>
                  <MaterialCommunityIcons
                    name="chevron-down" as any
                    size={18}
                    color={colors.neutral[500]}
                  />
                </TouchableOpacity>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
              </View>

              {/* Period Field */}
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Period</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setPeriodModalVisible(true)}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <MaterialCommunityIcons
                    name="calendar" as any
                    size={20}
                    color={colors.primary[600]}
                  />
                  <Text style={styles.selectInputText}>{periodLabel}</Text>
                  <MaterialCommunityIcons
                    name="chevron-down" as any
                    size={18}
                    color={colors.neutral[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Modal */}
            {categoryModalVisible && (
              <View style={styles.modal}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Category</Text>
                    <TouchableOpacity
                      onPress={() => setCategoryModalVisible(false)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="close" as any
                        size={24}
                        color={colors.neutral[700]}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.modalOptions}>
                    {BUDGET_CATEGORIES.map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.modalOption,
                          formData.category === cat.id && styles.modalOptionSelected,
                        ]}
                        onPress={() => {
                          setFormData(prev => ({ ...prev, category: cat.id }));
                          setCategoryModalVisible(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.modalOptionIcon}>
                          <MaterialCommunityIcons
                            name={cat.icon as any}
                            size={24}
                            color={
                              formData.category === cat.id
                                ? colors.primary[600]
                                : colors.neutral[700]
                            }
                          />
                        </View>
                        <Text
                          style={[
                            styles.modalOptionText,
                            formData.category === cat.id && styles.modalOptionTextSelected,
                          ]}
                        >
                          {cat.label}
                        </Text>
                        {formData.category === cat.id && (
                          <MaterialCommunityIcons
                            name="check-circle" as any
                            size={24}
                            color={colors.primary[600]}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Period Modal */}
            {periodModalVisible && (
              <View style={styles.modal}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Period</Text>
                    <TouchableOpacity
                      onPress={() => setPeriodModalVisible(false)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="close" as any
                        size={24}
                        color={colors.neutral[700]}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.modalOptions}>
                    {BUDGET_PERIODS.map(period => (
                      <TouchableOpacity
                        key={period}
                        style={[
                          styles.modalOption,
                          formData.period === period && styles.modalOptionSelected,
                        ]}
                        onPress={() => {
                          setFormData(prev => ({ ...prev, period }));
                          setPeriodModalVisible(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.modalOptionIcon}>
                          <MaterialCommunityIcons
                            name="calendar" as any
                            size={24}
                            color={
                              formData.period === period
                                ? colors.primary[600]
                                : colors.neutral[700]
                            }
                          />
                        </View>
                        <Text
                          style={[
                            styles.modalOptionText,
                            formData.period === period && styles.modalOptionTextSelected,
                          ]}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </Text>
                        {formData.period === period && (
                          <MaterialCommunityIcons
                            name="check-circle" as any
                            size={24}
                            color={colors.primary[600]}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Warning Threshold */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Warning Threshold</Text>
                <View style={styles.thresholdBadge}>
                  <Text style={styles.thresholdValue}>{formData.warningThreshold}%</Text>
                </View>
              </View>
              <View style={styles.sliderContainer}>
                <View
                  style={[
                    styles.sliderTrack,
                    {
                      width: `${Math.min(parseFloat(formData.warningThreshold) || 0, 100)}%`,
                      backgroundColor: getThresholdColor(parseFloat(formData.warningThreshold)),
                    },
                  ]}
                />
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0%</Text>
                <Text style={styles.sliderLabel}>50%</Text>
                <Text style={styles.sliderLabel}>100%</Text>
              </View>
              <TextInput
                style={styles.thresholdInput}
                placeholder="Enter threshold value"
                keyboardType="decimal-pad"
                value={formData.warningThreshold}
                onChangeText={threshold => {
                  setFormData(prev => ({ ...prev, warningThreshold: threshold }));
                  if (errors.warningThreshold)
                    setErrors(prev => ({ ...prev, warningThreshold: undefined }));
                }}
                editable={!isLoading}
              />
              {errors.warningThreshold && (
                <Text style={styles.errorText}>{errors.warningThreshold}</Text>
              )}
            </View>

            {/* Alerts Section */}
            <View style={styles.alertsSection}>
              <View style={styles.alertsHeader}>
                <MaterialCommunityIcons
                  name="bell-outline" as any
                  size={20}
                  color={colors.primary[600]}
                />
                <Text style={styles.alertsTitle}>Alert Settings</Text>
              </View>

              {/* Alerts Toggle */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleLabel}>
                  <Text style={styles.toggleLabelText}>Enable Alerts</Text>
                  <Text style={styles.toggleLabelSubtext}>
                    Get notified when approaching budget limit
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    formData.enableAlerts && styles.toggleSwitchActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, enableAlerts: !prev.enableAlerts }))}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.toggleThumb,
                      {
                        backgroundColor: formData.enableAlerts ? colors.primary[600] : colors.neutral[300],
                      },
                    ]}
                  />
                </TouchableOpacity>
              </View>

              {/* Alert Frequency */}
              {formData.enableAlerts && (
                <View style={styles.frequencySection}>
                  <Text style={styles.frequencyLabel}>Notification Frequency</Text>
                  <View style={styles.frequencyOptions}>
                    {(['instant', 'daily', 'weekly'] as const).map(freq => (
                      <TouchableOpacity
                        key={freq}
                        style={[
                          styles.frequencyOption,
                          formData.alertFrequency === freq && styles.frequencyOptionSelected,
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, alertFrequency: freq }))}
                        disabled={isLoading}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons
                          name={freq === 'instant' ? 'lightning-bolt' : freq === 'daily' ? 'calendar-today' : 'calendar-week'} as any
                          size={16}
                          color={
                            formData.alertFrequency === freq
                              ? colors.primary[600]
                              : colors.neutral[600]
                          }
                        />
                        <Text
                          style={[
                            styles.frequencyOptionText,
                            formData.alertFrequency === freq && styles.frequencyOptionTextSelected,
                          ]}
                        >
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Description Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Description (Optional)</Text>
              <View style={styles.input}>
                <TextInput
                  style={[styles.inputField, styles.descriptionInput]}
                  placeholder="Add notes about this budget..."
                  placeholderTextColor={colors.neutral[400]}
                  value={formData.description}
                  onChangeText={description => setFormData(prev => ({ ...prev, description }))}
                  multiline
                  numberOfLines={3}
                  editable={!isLoading}
                />
              </View>
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={handleCancel}
              loading={isLoading}
              disabled={isLoading}
              style={styles.actionButton}
            />
            <Button
              title={budgetId ? 'Update Budget' : 'Create Budget'}
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.actionButton}
            />
          </View>

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

// Helper function to get threshold color
const getThresholdColor = (threshold: number): string => {
  if (threshold >= 90) return colors.error[600];
  if (threshold >= 70) return colors.warning[600];
  return colors.success[600];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.neutral[50],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.neutral[600],
  },

  // Form Card
  formCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },

  // Fields
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  rowGroup: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary[600],
  },

  // Input
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  inputField: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[900],
  },
  inputError: {
    borderColor: colors.error[300],
    backgroundColor: colors.error[50],
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary[600],
  },
  currencyInput: {
    marginLeft: spacing.xs,
    textAlignVertical: 'center',
  },
  descriptionInput: {
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
  },

  // Select Input
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  selectInputText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[900],
  },

  // Error
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.error[600],
    marginTop: spacing.xs,
  },

  // Modal
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.neutral[50],
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingTop: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  modalOptions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  modalOptionSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
  },
  modalOptionIcon: {
    marginRight: spacing.md,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[900],
  },
  modalOptionTextSelected: {
    fontWeight: '700',
    color: colors.primary[600],
  },

  // Slider
  sliderContainer: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  sliderTrack: {
    height: '100%',
    backgroundColor: colors.success[600],
    borderRadius: 3,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sliderLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  thresholdInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    fontSize: 13,
    fontWeight: '500',
    color: colors.neutral[900],
  },
  thresholdBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    backgroundColor: colors.primary[100],
  },
  thresholdValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary[600],
  },

  // Alerts Section
  alertsSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginBottom: spacing.lg,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[200],
  },
  alertsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary[900],
    marginLeft: spacing.sm,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    flex: 1,
  },
  toggleLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  toggleLabelSubtext: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary[200],
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[300],
  },

  // Frequency
  frequencySection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.primary[200],
  },
  frequencyLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  frequencyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing.xs,
  },
  frequencyOptionSelected: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[300],
  },
  frequencyOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  frequencyOptionTextSelected: {
    fontWeight: '700',
    color: colors.primary[600],
  },

  // Buttons
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.lg,
  },
  button: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});

export default BudgetForm;
