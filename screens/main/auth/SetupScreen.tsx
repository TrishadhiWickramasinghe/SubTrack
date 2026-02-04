import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Checkbox from '../../../components/common/Checkbox';
import Dropdown from '../../../components/common/Dropdown';
import { Input } from '../../../components/common/Input';
import { useTheme } from '../../../context/ThemeContext';
import { useCurrency } from '../../../hooks/useCurrency';

interface SetupStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
}

const SetupScreen = () => {
  const navigation = useNavigation();
  const { theme, colors } = useTheme();
  const { getAllCurrencies, ...currencyMethods } = useCurrency();
  const currencies: any[] = getAllCurrencies();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [budget, setBudget] = useState('');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const scrollViewRef = useRef<ScrollView>(null);

  const steps: SetupStep[] = [
    {
      id: 1,
      title: 'Personal Info',
      description: 'Tell us a bit about yourself',
      icon: 'person-outline',
      completed: false,
    },
    {
      id: 2,
      title: 'Currency',
      description: 'Choose your preferred currency',
      icon: 'cash-outline',
      completed: false,
    },
    {
      id: 3,
      title: 'Budget Setup',
      description: 'Set your monthly spending goal',
      icon: 'wallet-outline',
      completed: false,
    },
    {
      id: 4,
      title: 'Preferences',
      description: 'Customize your experience',
      icon: 'settings-outline',
      completed: false,
    },
    {
      id: 5,
      title: 'Review',
      description: 'Confirm your settings',
      icon: 'checkmark-done-outline',
      completed: false,
    },
  ];

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Update progress animation
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / steps.length,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Scroll to current step
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentStep * 20,
        animated: true,
      });
    }
  }, [currentStep]);

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        if (!name.trim()) {
          Alert.alert('Required', 'Please enter your name');
          return false;
        }
        if (!email.trim()) {
          Alert.alert('Required', 'Please enter your email');
          return false;
        }
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Alert.alert('Invalid Email', 'Please enter a valid email address');
          return false;
        }
        break;
      case 2:
        if (budget && parseFloat(budget) <= 0) {
          Alert.alert('Invalid Budget', 'Please enter a valid budget amount');
          return false;
        }
        break;
      case 4:
        if (!acceptedTerms) {
          Alert.alert('Terms Required', 'Please accept the terms and conditions to continue');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteSetup();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCompleteSetup = async () => {
    try {
      // Save settings
      const userSettings = {
        name,
        email,
        currency: selectedCurrency,
        budget: budget ? parseFloat(budget) : null,
        enableNotifications,
        enableAnalytics,
        setupCompleted: true,
        setupDate: new Date().toISOString(),
      };

      await AsyncStorage.setItem('userSettings', JSON.stringify(userSettings));
      await AsyncStorage.setItem('hasCompletedSetup', 'true');
      
      // Set currency in context
      // setCurrency(selectedCurrency);

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' } as any],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.border,
            },
          ]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </Animated.View>

        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <TouchableOpacity
              key={step.id}
              style={styles.stepWrapper}
              onPress={() => {
                if (index <= currentStep) {
                  setCurrentStep(index);
                }
              }}
              disabled={index > currentStep}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor:
                      index === currentStep
                        ? colors.primary
                        : index < currentStep
                        ? colors.primary + '40'
                        : colors.border,
                    borderColor:
                      index === currentStep
                        ? colors.primary
                        : colors.border,
                  },
                ]}>
                {index < currentStep ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      {
                        color:
                          index === currentStep
                            ? '#FFFFFF'
                            : colors.textSecondary,
                      },
                    ]}>
                    {step.id}
                  </Text>
                )}
              </View>
              <View style={styles.stepInfo}>
                <Text
                  style={[
                    styles.stepTitle,
                    {
                      color:
                        index === currentStep
                          ? colors.text
                          : colors.textSecondary,
                      fontWeight: index === currentStep ? '600' : '400',
                    },
                  ]}>
                  {step.title}
                </Text>
                {index === currentStep && (
                  <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                    {step.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View>
            <Card style={[styles.stepCard, { backgroundColor: colors.card }] as any}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="person" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.stepCardTitle, { color: colors.text }]}>
                    Personal Information
                  </Text>
                  <Text style={[styles.stepCardDescription, { color: colors.textSecondary }]}>
                    This helps us personalize your experience
                  </Text>
                </View>
              </View>

              <View style={styles.form}>
                <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  required
                  autoFocus
                />
                
                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  required
                />

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    We'll use this email to send you important updates and reminders
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        );

      case 1:
        return (
          <View>
            <Card style={[styles.stepCard, { backgroundColor: colors.card }] as any}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="cash" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.stepCardTitle, { color: colors.text }]}>
                    Select Currency
                  </Text>
                  <Text style={[styles.stepCardDescription, { color: colors.textSecondary }]}>
                    Choose your primary currency for tracking subscriptions
                  </Text>
                </View>
              </View>

              <View style={styles.form}>
                <Dropdown
                  label="Currency"
                  placeholder="Select currency"
                  selectedValue={selectedCurrency}
                  items={currencies.map((curr: any) => ({
                    label: `${curr.code} - ${curr.name}`,
                    value: curr.code,
                    icon: curr.symbol,
                  }))}
                  onSelect={(value: any) => setSelectedCurrency(value as string)}
                  icon="globe-outline"
                />

                <View style={styles.currencyInfo}>
                  <View style={styles.currencyPreview}>
                    <Text style={[styles.currencySymbol, { color: colors.text }]}>
                      {currencies.find((c: any) => c.code === selectedCurrency)?.symbol || '$'}
                    </Text>
                    <View>
                      <Text style={[styles.currencyCode, { color: colors.text }]}>
                        {selectedCurrency}
                      </Text>
                      <Text style={[styles.currencyName, { color: colors.textSecondary }]}>
                        {currencies.find((c: any) => c.code === selectedCurrency)?.name || 'US Dollar'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoBox}>
                    <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                      You can change this anytime in settings. All amounts will be converted automatically.
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        );

      case 2:
        return (
          <View>
            <Card style={[styles.stepCard, { backgroundColor: colors.card }] as any}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="wallet" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.stepCardTitle, { color: colors.text }]}>
                    Monthly Budget
                  </Text>
                  <Text style={[styles.stepCardDescription, { color: colors.textSecondary }]}>
                    Set a monthly spending goal (optional)
                  </Text>
                </View>
              </View>

              <View style={styles.form}>
                <Input
                  label="Monthly Budget Amount"
                  placeholder="e.g., 100"
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                />

                {budget && (
                  <View style={styles.budgetPreview}>
                    <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>
                      Your monthly budget will be:
                    </Text>
                    <Text style={[styles.budgetAmount, { color: colors.text }]}>
                      {currencies.find((c: any) => c.code === selectedCurrency)?.symbol || '$'}
                      {parseFloat(budget).toLocaleString()}
                    </Text>
                  </View>
                )}

                <View style={styles.budgetSuggestions}>
                  <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>
                    Quick suggestions:
                  </Text>
                  <View style={styles.suggestionChips}>
                    {['50', '100', '200', '300', '500'].map((amount) => (
                      <TouchableOpacity
                        key={amount}
                        style={[
                          styles.suggestionChip,
                          {
                            backgroundColor:
                              budget === amount
                                ? colors.primary
                                : colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => setBudget(amount)}>
                        <Text
                          style={[
                            styles.suggestionChipText,
                            {
                              color:
                                budget === amount
                                  ? '#FFFFFF'
                                  : colors.primary,
                            },
                          ]}>
                          {currencies.find((c: any) => c.code === selectedCurrency)?.symbol || '$'}
                          {amount}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <Ionicons name="bulb-outline" size={20} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Setting a budget helps you track spending and get alerts when you're close to your limit
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        );

      case 3:
        return (
          <View>
            <Card style={[styles.stepCard, { backgroundColor: colors.card }] as any}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="settings" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.stepCardTitle, { color: colors.text }]}>
                    Preferences
                  </Text>
                  <Text style={[styles.stepCardDescription, { color: colors.textSecondary }]}>
                    Customize how SubTrack works for you
                  </Text>
                </View>
              </View>

              <View style={styles.form}>
                <View style={styles.preferenceItem}>
                  <View style={styles.preferenceInfo}>
                    <Ionicons name="notifications" size={20} color={colors.primary} />
                    <View style={styles.preferenceText}>
                      <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                        Push Notifications
                      </Text>
                      <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                        Get reminders before subscription renewals
                      </Text>
                    </View>
                  </View>
                  <Checkbox
                    checked={enableNotifications}
                    onValueChange={setEnableNotifications}
                  />
                </View>

                <View style={styles.preferenceItem}>
                  <View style={styles.preferenceInfo}>
                    <Ionicons name="analytics" size={20} color={colors.primary} />
                    <View style={styles.preferenceText}>
                      <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                        Usage Analytics
                      </Text>
                      <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                        Help us improve by sharing anonymous usage data
                      </Text>
                    </View>
                  </View>
                  <Checkbox
                    checked={enableAnalytics}
                    onValueChange={setEnableAnalytics}
                  />
                </View>

                <View style={styles.preferenceItem}>
                  <View style={styles.preferenceInfo}>
                    <MaterialCommunityIcons name="theme-light-dark" size={20} color={colors.primary} />
                    <View style={styles.preferenceText}>
                      <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                        Theme
                      </Text>
                      <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                        Auto theme based on system settings
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.themeValue, { color: colors.textSecondary }]}>
                    {theme === 'dark' ? 'Dark' : 'Light'}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        );

      case 4:
        return (
          <View>
            <Card style={[styles.stepCard, { backgroundColor: colors.card }] as any}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.stepCardTitle, { color: colors.text }]}>
                    Review & Finish
                  </Text>
                  <Text style={[styles.stepCardDescription, { color: colors.textSecondary }]}>
                    Confirm your settings and complete setup
                  </Text>
                </View>
              </View>

              <View style={styles.reviewSection}>
                <Text style={[styles.reviewTitle, { color: colors.text }]}>
                  Your Settings
                </Text>
                
                <View style={styles.reviewItem}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Name</Text>
                  <Text style={[styles.reviewValue, { color: colors.text }]}>{name}</Text>
                </View>
                
                <View style={styles.reviewItem}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Email</Text>
                  <Text style={[styles.reviewValue, { color: colors.text }]}>{email}</Text>
                </View>
                
                <View style={styles.reviewItem}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Currency</Text>
                  <Text style={[styles.reviewValue, { color: colors.text }]}>{selectedCurrency}</Text>
                </View>
                
                <View style={styles.reviewItem}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Monthly Budget</Text>
                  <Text style={[styles.reviewValue, { color: colors.text }]}>
                    {budget 
                      ? `${currencies.find((c: any) => c.code === selectedCurrency)?.symbol || '$'}${parseFloat(budget).toLocaleString()}`
                      : 'Not set'}
                  </Text>
                </View>
                
                <View style={styles.reviewItem}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Notifications</Text>
                  <Text style={[styles.reviewValue, { color: colors.text }]}>
                    {enableNotifications ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>

              <View style={styles.termsSection}>
                <Checkbox
                  label="I agree to the Terms of Service and Privacy Policy"
                  checked={acceptedTerms}
                  onValueChange={setAcceptedTerms}
                />
                
                <TouchableOpacity
                  style={styles.termsLink}
                  onPress={() => {/* Open terms */}}>
                  <Text style={[styles.termsLinkText, { color: colors.primary }]}>
                    Read Terms & Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.readySection}>
                <Ionicons name="rocket" size={48} color={colors.primary} />
                <Text style={[styles.readyTitle, { color: colors.text }]}>
                  Ready to Go!
                </Text>
                <Text style={[styles.readyDescription, { color: colors.textSecondary }]}>
                  Complete setup to start tracking your subscriptions
                </Text>
              </View>
            </Card>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={currentStep > 0 ? handleBack : () => navigation.goBack()}>
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                Setup Your Account
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Step {currentStep + 1} of {steps.length}
              </Text>
            </View>
            
            {currentStep < steps.length - 1 && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkipStep}>
                <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                  Skip
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {renderStepContent()}
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.navigation}>
            <Button
              title={currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
              onPress={handleNext}
              style={styles.nextButton}
              icon={currentStep === steps.length - 1 ? 'rocket-outline' : 'arrow-forward'}
              iconPosition="right"
              disabled={currentStep === steps.length - 1 && !acceptedTerms}
            />
            
            {currentStep < steps.length - 1 && (
              <TouchableOpacity
                style={styles.skipStepButton}
                onPress={handleSkipStep}>
                <Text style={[styles.skipStepText, { color: colors.textSecondary }]}>
                  Skip this step
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  stepIndicatorContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepInfo: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  stepCard: {
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepCardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  currencyInfo: {
    marginTop: 16,
  },
  currencyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 12,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: '600',
  },
  currencyName: {
    fontSize: 14,
    marginTop: 2,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  budgetPreview: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  budgetSuggestions: {
    marginTop: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceText: {
    flex: 1,
    marginLeft: 12,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  themeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  reviewLabel: {
    fontSize: 14,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  termsSection: {
    marginBottom: 24,
  },
  termsLink: {
    marginTop: 12,
    paddingVertical: 8,
  },
  termsLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  readySection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  readyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  readyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  navigation: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  nextButton: {
    marginBottom: 12,
  },
  skipStepButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipStepText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SetupScreen;