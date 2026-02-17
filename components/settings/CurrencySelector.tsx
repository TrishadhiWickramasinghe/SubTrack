import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@context/ThemeContext';
import { useCurrency } from '@hooks/useCurrency';
import { useDebounce } from '@hooks/useDebounce';

// Currency type definition
interface Currency {
  code: string;
  name: string;
  symbol: string;
  [key: string]: any;
}

export interface CurrencySelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
  selectedCurrencyCode?: string;
  title?: string;
  showFavorites?: boolean;
  allowSearch?: boolean;
  showFlags?: boolean;
  showRecent?: boolean;
  testID?: string;
}

interface SectionData {
  title: string;
  data: Currency[];
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCurrencyCode,
  title = 'Select Currency',
  showFavorites = true,
  allowSearch = true,
  showFlags = true,
  showRecent = true,
  testID,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    getAllCurrencies,
    getPopularCurrencies,
    getCurrencyInfo,
    searchCurrencies,
    getCurrencyColor,
    getCurrencyIcon,
  } = useCurrency();

  const [searchQuery, setSearchQuery] = useState('');
  const [recentCurrencies, setRecentCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load recent currencies from storage (simulated)
  React.useEffect(() => {
    loadRecentCurrencies();
  }, []);

  const loadRecentCurrencies = async () => {
    // In a real app, this would load from AsyncStorage
    // For now, using mock data
    setRecentCurrencies([
      getCurrencyInfo('USD'),
      getCurrencyInfo('EUR'),
      getCurrencyInfo('GBP'),
    ]);
  };

  const saveRecentCurrency = async (currency: Currency) => {
    // Update recent currencies (max 5)
    setRecentCurrencies(prev => {
      const filtered = prev.filter(c => c.code !== currency.code);
      const updated = [currency, ...filtered].slice(0, 5);
      // In real app, save to AsyncStorage here
      return updated;
    });
  };

  // Get filtered currencies based on search
  const filteredCurrencies = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return getAllCurrencies();
    }
    return searchCurrencies(debouncedSearch);
  }, [debouncedSearch, getAllCurrencies, searchCurrencies]);

  // Organize currencies into sections
  const sections = useMemo(() => {
    const sectionsData: SectionData[] = [];
    
    // Popular section
    if (showFavorites) {
      const popular = getPopularCurrencies();
      sectionsData.push({
        title: '⭐ Popular Currencies',
        data: popular,
      });
    }

    // Recent section
    if (showRecent && recentCurrencies.length > 0) {
      sectionsData.push({
        title: '🕒 Recently Used',
        data: recentCurrencies,
      });
    }

    // Group by region (simplified - in real app, you'd have region data)
    const byRegion: Record<string, Currency[]> = {};
    filteredCurrencies.forEach((currency: Currency) => {
      let region = 'Other';
      if (['USD', 'CAD', 'MXN'].includes(currency.code)) region = 'North America';
      else if (['EUR', 'GBP', 'CHF'].includes(currency.code)) region = 'Europe';
      else if (['JPY', 'CNY', 'KRW'].includes(currency.code)) region = 'Asia';
      else if (['AUD', 'NZD'].includes(currency.code)) region = 'Oceania';
      else if (['BRL', 'ARS'].includes(currency.code)) region = 'South America';
      else if (['AED', 'SAR'].includes(currency.code)) region = 'Middle East';
      else if (['ZAR', 'NGN'].includes(currency.code)) region = 'Africa';
      
      if (!byRegion[region]) {
        byRegion[region] = [];
      }
      byRegion[region].push(currency);
    });

    // Add regional sections
    Object.entries(byRegion).forEach(([region, currencies]) => {
      if (currencies.length > 0) {
        sectionsData.push({
          title: `🌍 ${region}`,
          data: currencies.sort((a, b) => a.code.localeCompare(b.code)),
        });
      }
    });

    return sectionsData;
  }, [filteredCurrencies, getPopularCurrencies, showFavorites, showRecent, recentCurrencies]);

  // Handle currency selection
  const handleSelect = useCallback(async (currency: Currency) => {
    setIsLoading(true);
    await saveRecentCurrency(currency);
    onSelect(currency);
    setIsLoading(false);
    onClose();
  }, [onSelect, onClose]);

  // Render currency item
  const renderCurrencyItem = useCallback(({ item }: { item: Currency }) => {
    const isSelected = item.code === selectedCurrencyCode;
    const currencyColor = getCurrencyColor(item.code);
    const icon = getCurrencyIcon(item.code);
    
    return (
      <TouchableOpacity
        style={[
          styles.currencyItem,
          { backgroundColor: theme.colors.surface },
          isSelected && {
            backgroundColor: `${currencyColor}20`,
            borderColor: currencyColor,
            borderWidth: 1,
          },
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
        testID={`currency-item-${item.code}`}
      >
        <View style={styles.currencyLeft}>
          {showFlags ? (
            <Text style={styles.flag}>{item.flag}</Text>
          ) : (
            <View style={[styles.iconContainer, { backgroundColor: `${currencyColor}20` }]}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
          )}
          
          <View style={styles.currencyInfo}>
            <Text style={[styles.currencyCode, { color: theme.colors.text }]}>
              {item.code}
            </Text>
            <Text style={[styles.currencyName, { color: theme.colors.textSecondary }]}>
              {item.name}
            </Text>
          </View>
        </View>

        <View style={styles.currencyRight}>
          <Text style={[styles.currencySymbol, { color: theme.colors.textSecondary }]}>
            {item.symbol}
          </Text>
          
          {isSelected && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <Icon name="check-circle" size={24} color={currencyColor} />
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [selectedCurrencyCode, theme, showFlags, handleSelect, getCurrencyColor, getCurrencyIcon]);

  // Render section header
  const renderSectionHeader = useCallback(({ section }: { section: SectionData }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        {section.title}
      </Text>
      <Text style={[styles.sectionCount, { color: theme.colors.textSecondary }]}>
        {section.data.length} currencies
      </Text>
    </View>
  ), [theme]);

  // Animated style for modal
  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(visible ? 0 : 1000, { damping: 15 }) }],
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      testID={testID}
    >
      <View
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} onPress={onClose} />
        
        <Animated.View
          style={[
            styles.modalContent,
            modalAnimatedStyle,
            {
              backgroundColor: theme.colors.background,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          {allowSearch && (
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
              <Icon name="magnify" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder="Search currencies..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close-circle" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}

          {/* Currency List */}
          {!isLoading && (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.code}
              renderItem={renderCurrencyItem}
              renderSectionHeader={renderSectionHeader}
              stickySectionHeadersEnabled
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
              getItemLayout={(_: any, index: number) => ({
                length: 72,
                offset: 72 * index,
                index,
              })}
              SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="currency-usd-off" size={48} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    No currencies found
                  </Text>
                </View>
              }
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 12,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  flag: {
    fontSize: 28,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 12,
  },
  currencyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default CurrencySelector;