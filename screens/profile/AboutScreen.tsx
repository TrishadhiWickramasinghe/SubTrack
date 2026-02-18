import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@context/ThemeContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

interface LinkItem {
  label: string;
  icon: string;
  url: string;
}

interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

const APP_VERSION = '1.0.0';
const APP_BUILD = '1';
const RELEASE_DATE = 'February 2026';

const FEATURES: FeatureItem[] = [
  {
    title: 'Subscription Tracking',
    description: 'Monitor all your subscription services in one place',
    icon: 'clipboard-list-outline',
  },
  {
    title: 'Expense Analytics',
    description: 'Visualize spending patterns and trends over time',
    icon: 'chart-line',
  },
  {
    title: 'Budget Management',
    description: 'Set and track budgets across different categories',
    icon: 'wallet-outline',
  },
  {
    title: 'Smart Notifications',
    description: 'Get reminders before subscription renewals',
    icon: 'bell-outline',
  },
  {
    title: 'Multi-Currency Support',
    description: 'Track subscriptions in your preferred currencies',
    icon: 'currency-usd',
  },
  {
    title: 'Secure Backup',
    description: 'Automated backups to protect your data',
    icon: 'cloud-check-outline',
  },
];

const SOCIAL_LINKS: LinkItem[] = [
  {
    label: 'Website',
    icon: 'globe',
    url: 'https://subtrack-app.com',
  },
  {
    label: 'Twitter',
    icon: 'twitter',
    url: 'https://twitter.com/SubTrackApp',
  },
  {
    label: 'Facebook',
    icon: 'facebook',
    url: 'https://facebook.com/SubTrackApp',
  },
  {
    label: 'Instagram',
    icon: 'instagram',
    url: 'https://instagram.com/SubTrackApp',
  },
];

const USEFUL_LINKS: LinkItem[] = [
  {
    label: 'Privacy Policy',
    icon: 'shield-lock-outline',
    url: 'https://subtrack-app.com/privacy',
  },
  {
    label: 'Terms of Service',
    icon: 'file-document-outline',
    url: 'https://subtrack-app.com/terms',
  },
  {
    label: 'Contact Support',
    icon: 'email-outline',
    url: 'mailto:support@subtrack-app.com',
  },
  {
    label: 'Report a Bug',
    icon: 'bug-outline',
    url: 'https://subtrack-app.com/bug-report',
  },
];

interface ChangelogVersion {
  version: string;
  date: string;
  changes: string[];
}

const CHANGELOG: ChangelogVersion[] = [
  {
    version: '1.0.0',
    date: 'February 2026',
    changes: [
      'Initial release of SubTrack',
      'Core subscription tracking features',
      'Multi-currency support',
      'Analytics and reporting',
      'Secure backup and restore',
      'Comprehensive settings and preferences',
    ],
  },
];

const LICENSES = [
  {
    name: 'React Native',
    license: 'MIT License',
    url: 'https://github.com/facebook/react-native/blob/main/LICENSE',
  },
  {
    name: 'Expo',
    license: 'MIT License',
    url: 'https://github.com/expo/expo/blob/main/LICENSE',
  },
  {
    name: 'React Native Reanimated',
    license: 'MIT License',
    url: 'https://github.com/software-mansion/react-native-reanimated/blob/main/LICENSE',
  },
  {
    name: 'Supabase',
    license: 'Apache 2.0',
    url: 'https://github.com/supabase/supabase/blob/master/LICENSE',
  },
];

const AboutScreen: React.FC = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [expandedChangelog, setExpandedChangelog] = useState(false);
  const [expandedLicenses, setExpandedLicenses] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 12,
      flex: 1,
    },
    content: {
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    section: {
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.lightText,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    developedBy: {
      fontSize: 13,
      color: colors.lightText,
      lineHeight: 20,
      marginTop: 4,
    },
    featureGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    featureCard: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    featureIcon: {
      fontSize: 28,
      color: colors.accent,
      marginBottom: 8,
    },
    featureTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    featureDescription: {
      fontSize: 11,
      color: colors.lightText,
      textAlign: 'center',
      lineHeight: 16,
    },
    linkRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    linkLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    linkIcon: {
      fontSize: 20,
      color: colors.accent,
    },
    socialGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 8,
    },
    socialButton: {
      width: '23%',
      aspectRatio: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    socialIcon: {
      fontSize: 32,
      color: colors.accent,
    },
    changelogHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    changelogTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    versionBadge: {
      backgroundColor: colors.accent,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginRight: 8,
    },
    versionBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#ffffff',
    },
    expandButton: {
      fontSize: 18,
      color: colors.accent,
    },
    changelogContent: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    changelogVersion: {
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    changelogVersionLast: {
      marginBottom: 0,
      paddingBottom: 0,
      borderBottomWidth: 0,
    },
    changelogVersionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    changelogVersionDate: {
      fontSize: 12,
      color: colors.lightText,
      marginBottom: 6,
    },
    changelogChangeItem: {
      fontSize: 12,
      color: colors.lightText,
      marginLeft: 8,
      marginBottom: 4,
      lineHeight: 18,
    },
    bullet: {
      color: colors.accent,
      fontWeight: '600',
    },
    licenseItem: {
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    licenseName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    licenseLicense: {
      fontSize: 12,
      color: colors.lightText,
      marginBottom: 6,
    },
    licenseLink: {
      fontSize: 12,
      color: colors.accent,
      fontWeight: '500',
      textDecorationLine: 'underline',
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 24,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerText: {
      fontSize: 12,
      color: colors.lightText,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 4,
    },
    footerHighlight: {
      fontWeight: '600',
      color: colors.accent,
    },
  });

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleSocialPress = (url: string) => {
    handleOpenLink(url);
  };

  const handleLicensePress = (url: string) => {
    handleOpenLink(url);
  };

  const FeatureCard: React.FC<{ item: FeatureItem }> = ({ item }) => (
    <AnimatedView
      entering={FadeInDown.delay(200)}
      style={styles.featureCard}
    >
      <Icon name={item.icon} style={styles.featureIcon} />
      <Text style={styles.featureTitle}>{item.title}</Text>
      <Text style={styles.featureDescription}>{item.description}</Text>
    </AnimatedView>
  );

  const LinkButton: React.FC<{ item: LinkItem; onPress: () => void }> = ({ item, onPress }) => (
    <AnimatedTouchable
      activeOpacity={0.7}
      onPress={onPress}
      entering={FadeInDown.delay(150)}
      style={styles.linkRow}
    >
      <Text style={styles.linkLabel}>{item.label}</Text>
      <Icon name="chevron-right" style={styles.linkIcon} />
    </AnimatedTouchable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <AnimatedView entering={FadeIn} style={styles.header}>
        <AnimatedTouchable
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={24} color={colors.accent} />
        </AnimatedTouchable>
        <Text style={styles.headerTitle}>About SubTrack</Text>
      </AnimatedView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <AnimatedView entering={FadeInDown.delay(100)} style={styles.content}>
          {/* App Info Section */}
          <AnimatedView entering={FadeInDown.delay(150)} style={styles.section}>
            <Text style={styles.sectionTitle}>App Information</Text>
            <AnimatedView style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version</Text>
                <Text style={styles.infoValue}>{APP_VERSION}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Build</Text>
                <Text style={styles.infoValue}>{APP_BUILD}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Release Date</Text>
                <Text style={styles.infoValue}>{RELEASE_DATE}</Text>
              </View>
              <Text style={styles.developedBy}>
                SubTrack is a modern subscription management app designed to help you track,
                organize, and optimize your subscriptions. We're committed to providing a secure,
                user-friendly experience.
              </Text>
            </AnimatedView>
          </AnimatedView>

          {/* Features Section */}
          <AnimatedView entering={FadeInDown.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.featureGrid}>
              {FEATURES.map((feature, index) => (
                <FeatureCard key={`feature-${index}`} item={feature} />
              ))}
            </View>
          </AnimatedView>

          {/* Social Links Section */}
          <AnimatedView entering={FadeInDown.delay(250)} style={styles.section}>
            <Text style={styles.sectionTitle}>Follow Us</Text>
            <View style={styles.socialGrid}>
              {SOCIAL_LINKS.map((link, index) => (
                <AnimatedTouchable
                  key={`social-${index}`}
                  activeOpacity={0.7}
                  onPress={() => handleSocialPress(link.url)}
                  entering={FadeInDown.delay(300 + index * 50)}
                  style={styles.socialButton}
                >
                  <Icon name={link.icon} style={styles.socialIcon} />
                </AnimatedTouchable>
              ))}
            </View>
          </AnimatedView>

          {/* Useful Links Section */}
          <AnimatedView entering={FadeInDown.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>Help & Support</Text>
            {USEFUL_LINKS.map((link, index) => (
              <LinkButton
                key={`useful-${index}`}
                item={link}
                onPress={() => handleOpenLink(link.url)}
              />
            ))}
          </AnimatedView>

          {/* Changelog Section */}
          <AnimatedView entering={FadeInDown.delay(350)} style={styles.section}>
            <Text style={styles.sectionTitle}>Changelog</Text>
            <AnimatedTouchable
              activeOpacity={0.7}
              onPress={() => setExpandedChangelog(!expandedChangelog)}
              style={styles.changelogHeader}
            >
              <View style={{ flex: 1 }}>
                {CHANGELOG.map((entry) => (
                  <View key={`version-badge-${entry.version}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.versionBadge}>
                      <Text style={styles.versionBadgeText}>{entry.version}</Text>
                    </View>
                    <Text style={styles.changelogTitle}>{entry.date}</Text>
                  </View>
                ))}
              </View>
              <Icon
                name={expandedChangelog ? 'chevron-up' : 'chevron-down'}
                style={styles.expandButton}
              />
            </AnimatedTouchable>
            {expandedChangelog && (
              <AnimatedView entering={FadeIn} style={styles.changelogContent}>
                {CHANGELOG.map((entry, versionIndex) => (
                  <View
                    key={`changelog-${entry.version}`}
                    style={[
                      styles.changelogVersion,
                      versionIndex === CHANGELOG.length - 1 && styles.changelogVersionLast,
                    ]}
                  >
                    <Text style={styles.changelogVersionTitle}>{entry.version}</Text>
                    <Text style={styles.changelogVersionDate}>{entry.date}</Text>
                    {entry.changes.map((change, changeIndex) => (
                      <Text key={`change-${changeIndex}`} style={styles.changelogChangeItem}>
                        <Text style={styles.bullet}>• </Text>
                        {change}
                      </Text>
                    ))}
                  </View>
                ))}
              </AnimatedView>
            )}
          </AnimatedView>

          {/* Licenses Section */}
          <AnimatedView entering={FadeInDown.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Open Source Licenses</Text>
            <AnimatedTouchable
              activeOpacity={0.7}
              onPress={() => setExpandedLicenses(!expandedLicenses)}
              style={styles.changelogHeader}
            >
              <Text style={styles.changelogTitle}>
                {LICENSES.length} Dependencies
              </Text>
              <Icon
                name={expandedLicenses ? 'chevron-up' : 'chevron-down'}
                style={styles.expandButton}
              />
            </AnimatedTouchable>
            {expandedLicenses && (
              <AnimatedView entering={FadeIn} style={{ marginTop: 12 }}>
                {LICENSES.map((license, index) => (
                  <AnimatedTouchable
                    key={`license-${index}`}
                    activeOpacity={0.7}
                    onPress={() => handleLicensePress(license.url)}
                    entering={FadeInDown.delay(450 + index * 50)}
                    style={styles.licenseItem}
                  >
                    <Text style={styles.licenseName}>{license.name}</Text>
                    <Text style={styles.licenseLicense}>{license.license}</Text>
                    <Text style={styles.licenseLink}>View License →</Text>
                  </AnimatedTouchable>
                ))}
              </AnimatedView>
            )}
          </AnimatedView>

          {/* Footer */}
          <AnimatedView entering={FadeInDown.delay(500)} style={styles.footer}>
            <Text style={styles.footerText}>
              Made with <Text style={styles.footerHighlight}>❤</Text> by the SubTrack Team
            </Text>
            <Text style={styles.footerText}>
              © 2026 SubTrack. All rights reserved.
            </Text>
          </AnimatedView>
        </AnimatedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;
