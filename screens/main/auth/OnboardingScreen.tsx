import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Button from '../../../components/common/Button';
import { useTheme } from '../../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  animation?: any;
  iconType?: 'ionicons' | 'material' | 'fontawesome';
  color: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Track All Subscriptions',
    description: 'Never miss a payment again. Add all your subscriptions in one place and get reminders before they renew.',
    icon: 'receipt-outline',
    iconType: 'ionicons',
    color: '#4F46E5',
  },
  {
    id: '2',
    title: 'Smart Budget Tracking',
    description: 'Set monthly budgets, get alerts when you\'re overspending, and optimize your subscription expenses.',
    icon: 'chart-pie',
    iconType: 'fontawesome',
    color: '#10B981',
  },
  {
    id: '3',
    title: 'Free Trial Manager',
    description: 'Track all your free trials in one place. Get reminders before they end so you never pay by accident.',
    icon: 'calendar-clock',
    iconType: 'material',
    color: '#F59E0B',
  },
  {
    id: '4',
    title: 'Multi-Currency Support',
    description: 'Track subscriptions in any currency. Automatic conversion with real-time exchange rates.',
    icon: 'currency-exchange',
    iconType: 'material',
    color: '#3B82F6',
  },
  {
    id: '5',
    title: 'AI-Powered Insights',
    description: 'Get smart suggestions to save money. Detect unused subscriptions and find better deals.',
    icon: 'robot',
    iconType: 'material',
    color: '#8B5CF6',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showGetStarted, setShowGetStarted] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNext = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < onboardingSlides.length) {
      flatListRef.current?.scrollToIndex({
        index: nextSlideIndex,
        animated: true,
      });
      setCurrentSlideIndex(nextSlideIndex);
      
      if (nextSlideIndex === onboardingSlides.length - 1) {
        setTimeout(() => setShowGetStarted(true), 300);
      }
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.slideContent}>
          {/* Icon/Animation */}
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            {item.iconType === 'ionicons' && (
              <Ionicons name={item.icon as any} size={80} color={item.color} />
            )}
            {item.iconType === 'material' && (
              <MaterialCommunityIcons name={item.icon as any} size={80} color={item.color} />
            )}
            {item.iconType === 'fontawesome' && (
              <FontAwesome5 name={item.icon as any} size={80} color={item.color} />
            )}
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {item.title}
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.description}
          </Text>

          {/* Feature Points */}
          {item.id === '1' && (
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={item.color} />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Automatic payment reminders
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={item.color} />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Visual spending charts
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={item.color} />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  One-tap subscription management
                </Text>
              </View>
            </View>
          )}

          {item.id === '2' && (
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={item.color} />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Category-wise budget limits
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={item.color} />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Real-time budget tracking
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={item.color} />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Overspending alerts
                </Text>
              </View>
            </View>
          )}

          {item.id === '3' && (
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={item.color} />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Trial end date reminders
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={item.color} />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Auto-cancel suggestions
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={item.color} />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Trial to paid conversion tracking
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const Pagination = () => {
    const dotPosition = Animated.divide(scrollX, width);

    return (
      <View style={styles.pagination}>
        {onboardingSlides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          
          const dotWidth = dotPosition.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = dotPosition.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          const backgroundColor = dotPosition.interpolate({
            inputRange,
            outputRange: [
              colors.textSecondary + '80',
              onboardingSlides[index].color,
              colors.textSecondary + '80'
            ],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const Footer = () => {
    return (
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Pagination />
        
        <View style={styles.footerButtons}>
          {currentSlideIndex < onboardingSlides.length - 1 ? (
            <>
              <TouchableOpacity
                style={[styles.skipButton, { borderColor: colors.border }]}
                onPress={handleSkip}>
                <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                  Skip
                </Text>
              </TouchableOpacity>
              
              <Button
                title="Next"
                onPress={handleNext}
                style={styles.nextButton}
                icon="arrow-forward"
                iconPosition="right"
              />
            </>
          ) : (
            <Animated.View
              style={[
                styles.getStartedContainer,
                {
                  opacity: showGetStarted ? 1 : 0,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}>
              <Button
                title="Get Started"
                onPress={handleGetStarted}
                style={styles.getStartedButton}
                icon="rocket-outline"
                iconPosition="right"
              />
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => (navigation as any).navigate('SignIn')}>
                <Text style={[styles.signInText, { color: colors.primary }]}>
                  Already have an account? Sign In
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.logoText, { color: colors.text }]}>SubTrack</Text>
        </TouchableOpacity>
        
        {currentSlideIndex < onboardingSlides.length - 1 && (
          <TouchableOpacity
            style={[styles.skipAllButton, { backgroundColor: colors.card }]}
            onPress={handleSkip}>
            <Text style={[styles.skipAllText, { color: colors.textSecondary }]}>
              Skip All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentSlideIndex(newIndex);
          
          if (newIndex === onboardingSlides.length - 1) {
            Animated.timing(slideAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }).start();
            setTimeout(() => setShowGetStarted(true), 300);
          } else {
            setShowGetStarted(false);
          }
        }}
        scrollEventThrottle={16}
      />

      {/* Footer */}
      <Footer />

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: scrollX.interpolate({
                  inputRange: [0, width * (onboardingSlides.length - 1)],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
                backgroundColor: onboardingSlides[currentSlideIndex].color,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {currentSlideIndex + 1} / {onboardingSlides.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
  },
  skipAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featureList: {
    width: '100%',
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    minWidth: 120,
  },
  getStartedContainer: {
    width: '100%',
    alignItems: 'center',
  },
  getStartedButton: {
    width: '100%',
    marginBottom: 16,
  },
  signInButton: {
    paddingVertical: 12,
  },
  signInText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
  },
});