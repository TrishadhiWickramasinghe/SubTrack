import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Button from '../../../components/common/Button';
import { useTheme } from '../../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { theme, colors } = useTheme();
  
  const [activeFeature, setActiveFeature] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const featureAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const features = [
    {
      id: 1,
      title: 'Track Everything',
      description: 'Monitor all your subscriptions in one place',
      icon: 'list-check',
      color: '#4F46E5',
      iconType: 'fontawesome',
    },
    {
      id: 2,
      title: 'Save Money',
      description: 'Get alerts before payments and find savings',
      icon: 'piggy-bank',
      color: '#10B981',
      iconType: 'fontawesome',
    },
    {
      id: 3,
      title: 'Stay Organized',
      description: 'Beautiful charts and insights to understand spending',
      icon: 'chart-pie',
      color: '#F59E0B',
      iconType: 'fontawesome',
    },
  ];

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Feature rotation
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate feature change
    featureAnim.setValue(0);
    Animated.spring(featureAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [activeFeature]);

  const handleGetStarted = () => {
    (navigation as any).navigate('Setup');
  };

  const handleSignIn = () => {
    (navigation as any).navigate('SignIn');
  };

  const renderFeatureDot = (index: number) => {
    const isActive = index === activeFeature;
    const scale = featureAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [isActive ? 0.8 : 1, isActive ? 1.2 : 1],
    });

    return (
      <TouchableOpacity
        key={index}
        onPress={() => setActiveFeature(index)}>
        <Animated.View
          style={[
            styles.featureDot,
            {
              backgroundColor: isActive ? features[index].color : colors.border,
              transform: [{ scale }],
            },
          ]}
        />
      </TouchableOpacity>
    );
  };

  const currentFeature = features[activeFeature];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View style={styles.logoContainer}>
            <View
              style={[styles.logo, { backgroundColor: colors.primary }]}>
              <Ionicons name="wallet-outline" size={32} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[styles.appName, { color: colors.text }]}>
                SubTrack
              </Text>
              <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
                Smart Subscription Manager
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.skipButton, { backgroundColor: colors.card }]}
            onPress={handleSignIn}>
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Take Control of Your{' '}
            <Text style={{ color: colors.primary }}>Subscriptions</Text>
          </Text>
          
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Track, manage, and optimize all your subscriptions in one beautiful app.
            Save money and never miss a payment again.
          </Text>
        </Animated.View>

        {/* Animated Feature Showcase */}
        <View style={styles.featureShowcase}>
          <Animated.View
            style={[
              styles.featureCard,
              {
                backgroundColor: colors.card,
                transform: [
                  { translateX: featureAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })},
                  { scale: featureAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  })},
                ],
              },
            ]}>
            <View style={styles.featureContent}>
              {/* Icon */}
              <View style={styles.animationContainer}>
                <View style={[styles.iconContainer, { backgroundColor: currentFeature.color + '20' }]}>
                  {currentFeature.iconType === 'fontawesome' ? (
                    <FontAwesome5
                      name={currentFeature.icon as any}
                      size={48}
                      color={currentFeature.color}
                    />
                  ) : (
                    <Ionicons
                      name={currentFeature.icon as any}
                      size={48}
                      color={currentFeature.color}
                    />
                  )}
                </View>
              </View>

              {/* Feature Info */}
              <View style={styles.featureInfo}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {currentFeature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {currentFeature.description}
                </Text>
              </View>

              {/* Feature Dots */}
              <View style={styles.featureDots}>
                {features.map((_, index) => renderFeatureDot(index))}
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Stats Section */}
        <View
          style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#4F46E5' + '20' }]}>
              <Ionicons name="checkmark-done" size={24} color="#4F46E5" />
            </View>
            <View>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                95%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Users save money
              </Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#10B981' + '20' }]}>
              <Ionicons name="time" size={24} color="#10B981" />
            </View>
            <View>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                30+
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Minutes saved weekly
              </Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B' + '20' }]}>
              <MaterialCommunityIcons name="currency-usd" size={24} color="#F59E0B" />
            </View>
            <View>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                $200+
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Average annual savings
              </Text>
            </View>
          </View>
        </View>

        {/* Key Features */}
        <View
          style={styles.keyFeatures}>
          <Text style={[styles.featuresTitle, { color: colors.text }]}>
            Why Choose SubTrack?
          </Text>
          
          {[
            {
              icon: 'notifications',
              title: 'Smart Reminders',
              description: 'Get alerts before payments with customizable timing',
              color: '#3B82F6',
            },
            {
              icon: 'analytics',
              title: 'AI Insights',
              description: 'Smart suggestions to optimize your subscriptions',
              color: '#8B5CF6',
            },
            {
              icon: 'globe',
              title: 'Multi-Currency',
              description: 'Track in any currency with real-time exchange rates',
              color: '#10B981',
            },
            {
              icon: 'shield-checkmark',
              title: 'Secure & Private',
              description: 'Your data stays on your device. No cloud tracking.',
              color: '#EF4444',
            },
          ].map((feature, index) => (
            <View
              key={index}
              style={[styles.featureItem, { backgroundColor: colors.card }]}>
              <View style={[styles.featureItemIcon, { backgroundColor: feature.color + '20' }]}>
                <Ionicons name={feature.icon as any} size={22} color={feature.color} />
              </View>
              <View style={styles.featureItemContent}>
                <Text style={[styles.featureItemTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureItemDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Testimonials */}
        <View
          style={styles.testimonials}>
          <Text style={[styles.testimonialsTitle, { color: colors.text }]}>
            Loved by Thousands
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsScroll}>
            {[
              {
                name: 'Sarah M.',
                role: 'Freelancer',
                text: 'Saved $500 in the first 3 months! The trial reminders alone are worth it.',
                rating: 5,
              },
              {
                name: 'James L.',
                role: 'Student',
                text: 'Finally organized all my streaming services. The budget feature is a lifesaver.',
                rating: 5,
              },
              {
                name: 'Priya K.',
                role: 'Small Business Owner',
                text: 'Perfect for tracking business subscriptions. The reports make taxes so much easier.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <View
                key={index}
                style={[styles.testimonialCard, { backgroundColor: colors.card }]}>
                <View style={styles.testimonialHeader}>
                  <View style={styles.testimonialAvatar}>
                    <Text style={styles.testimonialInitial}>
                      {testimonial.name.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.testimonialName, { color: colors.text }]}>
                      {testimonial.name}
                    </Text>
                    <Text style={[styles.testimonialRole, { color: colors.textSecondary }]}>
                      {testimonial.role}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.testimonialText, { color: colors.textSecondary }]}>
                  "{testimonial.text}"
                </Text>
                <View style={styles.testimonialStars}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Ionicons key={i} name="star" size={16} color="#FBBF24" />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* CTA Section */}
        <View
          style={styles.ctaSection}>
          <Animated.View
            style={[
              styles.ctaCard,
              {
                backgroundColor: colors.primary,
                transform: [{ scale: pulseAnim }],
              },
            ]}>
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>
                Ready to Save Money?
              </Text>
              <Text style={styles.ctaSubtitle}>
                Join thousands who have taken control of their subscriptions
              </Text>
              
              <View style={styles.ctaButtons}>
                <Button
                  title="Get Started Free"
                  onPress={handleGetStarted}
                  style={styles.ctaButton}
                  variant="secondary"
                  icon="rocket-outline"
                  size="large"
                />
                
                <TouchableOpacity
                  style={styles.signInCta}
                  onPress={handleSignIn}>
                  <Text style={styles.signInCtaText}>
                    Already have an account?{' '}
                    <Text style={styles.signInCtaHighlight}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.ctaFeatures}>
                <View style={styles.ctaFeature}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.ctaFeatureText}>No credit card required</Text>
                </View>
                <View style={styles.ctaFeature}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.ctaFeatureText}>Free forever plan</Text>
                </View>
                <View style={styles.ctaFeature}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.ctaFeatureText}>30-day premium trial</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Footer */}
        <View
          style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            By continuing, you agree to our{' '}
            <Text
              style={[styles.footerLink, { color: colors.primary }]}
              onPress={() => {}}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text
              style={[styles.footerLink, { color: colors.primary }]}
              onPress={() => {}}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
  },
  appTagline: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  featureShowcase: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featureCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  featureContent: {
    alignItems: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  featureDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  keyFeatures: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  featureItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureItemContent: {
    flex: 1,
  },
  featureItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureItemDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  testimonials: {
    marginBottom: 40,
  },
  testimonialsTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  testimonialsScroll: {
    paddingHorizontal: 20,
  },
  testimonialCard: {
    width: width * 0.8,
    padding: 20,
    borderRadius: 20,
    marginRight: 16,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  testimonialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testimonialInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '600',
  },
  testimonialRole: {
    fontSize: 14,
    marginTop: 2,
  },
  testimonialText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  testimonialStars: {
    flexDirection: 'row',
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  ctaCard: {
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButtons: {
    width: '100%',
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    marginBottom: 16,
  },
  signInCta: {
    paddingVertical: 12,
  },
  signInCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  signInCtaHighlight: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  ctaFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 24,
  },
  ctaFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  ctaFeatureText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    fontWeight: '600',
  },
});

export default WelcomeScreen;
