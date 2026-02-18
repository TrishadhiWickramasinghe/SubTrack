import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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

import SearchBar from '@components/common/SearchBar';
import { useTheme } from '@context/ThemeContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: string;
}

interface HelpTopic {
  title: string;
  description: string;
  icon: string;
  color: string;
}

const FAQ_ITEMS: FAQ[] = [
  {
    id: '1',
    category: 'Getting Started',
    question: 'How do I add a new subscription?',
    answer:
      'Tap the + button on the Subscriptions tab, enter the subscription details (name, amount, billing cycle), and save. You can also categorize your subscription and set up reminders.',
    icon: 'plus-circle-outline',
  },
  {
    id: '2',
    category: 'Getting Started',
    question: 'How do I edit an existing subscription?',
    answer:
      'Go to the subscription list, swipe left on any subscription, and tap Edit. Update the details you want to change and save.',
    icon: 'pencil-box-outline',
  },
  {
    id: '3',
    category: 'Billing & Payments',
    question: 'What billing cycles are supported?',
    answer:
      'SubTrack supports daily, weekly, biweekly, monthly, quarterly, semi-annually, and annually billing cycles. You can also set custom cycles for unusual subscription patterns.',
    icon: 'calendar-multiple-check',
  },
  {
    id: '4',
    category: 'Billing & Payments',
    question: 'How are renewal dates calculated?',
    answer:
      'Renewal dates are calculated based on your subscription start date and the selected billing cycle. You can view upcoming renewals in the Calendar view.',
    icon: 'calendar-clock',
  },
  {
    id: '5',
    category: 'Notifications',
    question: 'How do I set up renewal reminders?',
    answer:
      'When adding or editing a subscription, enable notifications and select how many days before renewal you want to be reminded. You can customize reminders for each subscription.',
    icon: 'bell-check-outline',
  },
  {
    id: '6',
    category: 'Notifications',
    question: 'Why am I not receiving notifications?',
    answer:
      'Make sure notifications are enabled in your device settings for SubTrack. Go to Settings > Apps > SubTrack > Notifications and ensure they are turned on.',
    icon: 'bell-off-outline',
  },
  {
    id: '7',
    category: 'Data & Privacy',
    question: 'Where is my data stored?',
    answer:
      'Your data is stored securely on Supabase servers with encryption. You can also enable auto-backup to protect your data with cloud backup services.',
    icon: 'cloud-check-outline',
  },
  {
    id: '8',
    category: 'Data & Privacy',
    question: 'How do I export my data?',
    answer:
      'Go to Settings > Backup & Restore, and tap "Backup Now" to create a backup of all your subscriptions. You can export to Google Drive, iCloud, or Dropbox.',
    icon: 'download-outline',
  },
  {
    id: '9',
    category: 'Features',
    question: 'How does the analytics feature work?',
    answer:
      'Analytics tracks your spending patterns, shows trends over time, and categorizes your expenses. Visit the Analytics tab to see detailed insights and charts.',
    icon: 'chart-pie',
  },
  {
    id: '10',
    category: 'Features',
    question: 'Can I categorize my subscriptions?',
    answer:
      'Yes! You can assign each subscription to a category (Entertainment, Productivity, etc.). Categories help organize your subscriptions and provide better spending insights.',
    icon: 'folder-outline',
  },
  {
    id: '11',
    category: 'Customization',
    question: 'How do I change the app theme?',
    answer:
      'Go to Settings > Theme Selector to choose between Light, Dark, or System theme. You can also select from 8 different accent colors.',
    icon: 'palette-outline',
  },
  {
    id: '12',
    category: 'Customization',
    question: 'Can I change the default currency?',
    answer:
      'Yes! Go to Settings > Preferences and select your preferred currency. SubTrack supports 6+ currencies with real-time exchange rates.',
    icon: 'currency-usd',
  },
];

const HELP_TOPICS: HelpTopic[] = [
  {
    title: 'Getting Started',
    description: 'Learn basics about adding and managing subscriptions',
    icon: 'lightbulb-on-outline',
    color: '#F59E0B',
  },
  {
    title: 'Billing & Payments',
    description: 'Questions about billing cycles and renewal dates',
    icon: 'credit-card-outline',
    color: '#3B82F6',
  },
  {
    title: 'Notifications',
    description: 'Set up and troubleshoot subscription reminders',
    icon: 'bell-outline',
    color: '#8B5CF6',
  },
  {
    title: 'Data & Privacy',
    description: 'Learn about data storage, backup, and security',
    icon: 'shield-check-outline',
    color: '#10B981',
  },
  {
    title: 'Features',
    description: 'Discover all app features and how to use them',
    icon: 'star-outline',
    color: '#EC4899',
  },
  {
    title: 'Customization',
    description: 'Personalize your app experience',
    icon: 'palette-outline',
    color: '#06B6D4',
  },
];

const CONTACT_OPTIONS = [
  {
    label: 'Email Support',
    icon: 'email-outline',
    url: 'mailto:support@subtrack-app.com',
  },
  {
    label: 'Discord Community',
    icon: 'chat-outline',
    url: 'https://discord.gg/subtrack',
  },
  {
    label: 'Report a Bug',
    icon: 'bug-outline',
    url: 'https://subtrack-app.com/bug-report',
  },
  {
    label: 'Feature Request',
    icon: 'lightbulb-on-outline',
    url: 'https://subtrack-app.com/features',
  },
];

const HelpScreen: React.FC = () => {
  const { colors } = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    'Getting Started'
  );

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
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    searchBar: {
      marginBottom: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    topicsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    topicCard: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    topicIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    topicTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    topicDescription: {
      fontSize: 10,
      color: colors.lightText,
      textAlign: 'center',
      lineHeight: 14,
    },
    categoryHeader: {
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
    categoryTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    faqItem: {
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    faqQuestion: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 18,
    },
    faqAnswer: {
      fontSize: 12,
      color: colors.lightText,
      lineHeight: 18,
      marginTop: 8,
    },
    contactSection: {
      marginBottom: 24,
    },
    contactGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    contactCard: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    contactIcon: {
      fontSize: 28,
      color: colors.accent,
      marginBottom: 8,
    },
    contactLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    emptyState: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    emptyStateIcon: {
      fontSize: 40,
      color: colors.lightText,
      marginBottom: 12,
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.lightText,
      textAlign: 'center',
    },
    expansionIcon: {
      fontSize: 20,
      color: colors.accent,
    },
  });

  // Filter FAQs based on search query and selected category
  const filteredFAQs = useMemo(() => {
    let filtered = FAQ_ITEMS.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !expandedCategory || item.category === expandedCategory;
      return matchesSearch && matchesCategory;
    });

    return filtered;
  }, [searchQuery, expandedCategory]);

  // Get unique categories from FAQs
  const categories = useMemo(() => {
    return Array.from(new Set(FAQ_ITEMS.map((item) => item.category)));
  }, []);

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

  const TopicCard: React.FC<{ topic: HelpTopic; index: number }> = ({ topic, index }) => (
    <AnimatedTouchable
      activeOpacity={0.7}
      onPress={() => setExpandedCategory(topic.title)}
      entering={FadeInDown.delay(100 * index)}
      style={styles.topicCard}
    >
      <Text style={[styles.topicIcon, { color: topic.color }]}>
        <Icon name={topic.icon} size={32} />
      </Text>
      <Text style={styles.topicTitle}>{topic.title}</Text>
      <Text style={styles.topicDescription}>{topic.description}</Text>
    </AnimatedTouchable>
  );

  const ContactCard: React.FC<{ option: { label: string; icon: string; url: string }; index: number }> = ({
    option,
    index,
  }) => (
    <AnimatedTouchable
      activeOpacity={0.7}
      onPress={() => handleOpenLink(option.url)}
      entering={FadeInDown.delay(300 + 100 * index)}
      style={styles.contactCard}
    >
      <Icon name={option.icon} style={styles.contactIcon} />
      <Text style={styles.contactLabel}>{option.label}</Text>
    </AnimatedTouchable>
  );

  const FAQItemComponent: React.FC<{ item: FAQ; index: number }> = ({ item, index }) => (
    <AnimatedView entering={FadeInDown.delay(200 + 50 * index)} style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{item.question}</Text>
      <Text style={styles.faqAnswer}>{item.answer}</Text>
    </AnimatedView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <AnimatedView entering={FadeIn} style={styles.header}>
        <AnimatedTouchable activeOpacity={0.7} onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color={colors.accent} />
        </AnimatedTouchable>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </AnimatedView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <AnimatedView entering={FadeInDown.delay(50)} style={styles.content}>
          {/* Search Bar */}
          <AnimatedView entering={FadeInDown.delay(100)} style={styles.searchBar}>
            <SearchBar
              placeholder="Search help topics..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </AnimatedView>

          {/* Help Topics */}
          {!searchQuery && (
            <AnimatedView entering={FadeInDown.delay(150)} style={styles.section}>
              <Text style={styles.sectionTitle}>Browse Topics</Text>
              <View style={styles.topicsGrid}>
                {HELP_TOPICS.map((topic, index) => (
                  <TopicCard key={`topic-${index}`} topic={topic} index={index} />
                ))}
              </View>
            </AnimatedView>
          )}

          {/* FAQ Section */}
          <AnimatedView entering={FadeInDown.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : 'Frequently Asked Questions'}
            </Text>

            {searchQuery ? (
              <>
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((item, index) => (
                    <FAQItemComponent key={item.id} item={item} index={index} />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Icon name="magnify-close" style={styles.emptyStateIcon} />
                    <Text style={styles.emptyStateText}>
                      No results found for "{searchQuery}"
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                {categories.map((category, catIndex) => (
                  <AnimatedView
                    key={`category-${category}`}
                    entering={FadeInDown.delay(250 + 50 * catIndex)}
                    style={styles.section}
                  >
                    <AnimatedTouchable
                      activeOpacity={0.7}
                      onPress={() =>
                        setExpandedCategory(
                          expandedCategory === category ? null : category
                        )
                      }
                      style={styles.categoryHeader}
                    >
                      <Text style={styles.categoryTitle}>{category}</Text>
                      <Icon
                        name={
                          expandedCategory === category
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                        style={styles.expansionIcon}
                      />
                    </AnimatedTouchable>

                    {expandedCategory === category && (
                      <AnimatedView entering={FadeIn}>
                        {FAQ_ITEMS.filter((item) => item.category === category).map(
                          (item, index) => (
                            <FAQItemComponent key={item.id} item={item} index={index} />
                          )
                        )}
                      </AnimatedView>
                    )}
                  </AnimatedView>
                ))}
              </>
            )}
          </AnimatedView>

          {/* Contact Section */}
          <AnimatedView entering={FadeInDown.delay(300)} style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Still Need Help?</Text>
            <View style={styles.contactGrid}>
              {CONTACT_OPTIONS.map((option, index) => (
                <ContactCard key={`contact-${index}`} option={option} index={index} />
              ))}
            </View>
          </AnimatedView>

          {/* Tips Section */}
          <AnimatedView entering={FadeInDown.delay(350)} style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Tips</Text>
            <AnimatedView entering={FadeInDown.delay(400)} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>💡 Sync Your Data</Text>
              <Text style={styles.faqAnswer}>
                Enable auto-backup in Settings to keep your data safe across devices.
              </Text>
            </AnimatedView>
            <AnimatedView entering={FadeInDown.delay(450)} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>🔔 Stay Updated</Text>
              <Text style={styles.faqAnswer}>
                Turn on notifications to never miss a subscription renewal. Customize
                reminder times per subscription.
              </Text>
            </AnimatedView>
            <AnimatedView entering={FadeInDown.delay(500)} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>📊 Analyze Spending</Text>
              <Text style={styles.faqAnswer}>
                Visit the Analytics tab to see your spending trends and identify
                subscriptions you might not be using.
              </Text>
            </AnimatedView>
          </AnimatedView>
        </AnimatedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpScreen;
