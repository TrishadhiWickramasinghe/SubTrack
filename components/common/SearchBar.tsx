import { colors, fonts, spacing } from '@/config/theme';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface SearchSuggestion {
  id: string | number;
  text: string;
  icon?: string;
  category?: string;
  recent?: boolean;
}

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  autoFocus?: boolean;
  showCancelButton?: boolean;
  showClearButton?: boolean;
  showSearchIcon?: boolean;
  showResults?: boolean;
  suggestions?: SearchSuggestion[];
  recentSearches?: SearchSuggestion[];
  onSuggestionPress?: (suggestion: SearchSuggestion) => void;
  onClearRecent?: () => void;
  maxSuggestions?: number;
  disabled?: boolean;
  loading?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  variant?: 'default' | 'minimal' | 'rounded';
  size?: 'small' | 'medium' | 'large';
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  borderColor?: string;
  showFilters?: boolean;
  onFilterPress?: () => void;
  filterCount?: number;
  debounceTime?: number;
  onSubmitEditing?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;
  containerStyle?: any;
  inputStyle?: any;
  cancelButtonStyle?: any;
  clearButtonStyle?: any;
  suggestionsContainerStyle?: any;
  suggestionItemStyle?: any;
  testID?: string;
  accessibilityLabel?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  blurOnSubmit?: boolean;
}

const SearchBar = forwardRef<TextInput, SearchBarProps>((props, ref) => {
  const {
    value,
    onChangeText,
    onSearch,
    placeholder = 'Search...',
    placeholderTextColor,
    autoFocus = false,
    showCancelButton = true,
    showClearButton = true,
    showSearchIcon = true,
    showResults = false,
    suggestions = [],
    recentSearches = [],
    onSuggestionPress,
    onClearRecent,
    maxSuggestions = 5,
    disabled = false,
    loading = false,
    theme = 'light',
    variant = 'default',
    size = 'medium',
    height,
    backgroundColor,
    textColor,
    iconColor,
    borderColor,
    showFilters = false,
    onFilterPress,
    filterCount = 0,
    debounceTime = 300,
    onSubmitEditing,
    onFocus,
    onBlur,
    style,
    containerStyle,
    inputStyle,
    cancelButtonStyle,
    clearButtonStyle,
    suggestionsContainerStyle,
    suggestionItemStyle,
    testID = 'search-bar',
    accessibilityLabel = 'Search input',
    autoCapitalize = 'none',
    autoCorrect = false,
    keyboardType = 'default',
    returnKeyType = 'search',
    blurOnSubmit = true,
  } = props;

  const [isFocused, setIsFocused] = useState(autoFocus);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchSuggestion[]>([]);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const inputRef = useRef<TextInput>(null);
  const cancelAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { width: screenWidth } = Dimensions.get('window');

  const getThemeColors = () => {
    const themes = {
      light: {
        bg: colors.surface,
        text: colors.text,
        icon: colors.textSecondary,
        border: colors.border,
        placeholder: colors.textDisabled,
        suggestionBg: colors.surface,
      },
      dark: {
        bg: colors.surfaceVariant,
        text: colors.text,
        icon: colors.textSecondary,
        border: colors.border,
        placeholder: colors.textDisabled,
        suggestionBg: colors.surfaceVariant,
      },
      auto: {
        bg: colors.surface,
        text: colors.text,
        icon: colors.textSecondary,
        border: colors.border,
        placeholder: colors.textDisabled,
        suggestionBg: colors.surface,
      },
    };

    return themes[theme] || themes.light;
  };

  const getHeight = () => {
    if (height) return height;
    switch (size) {
      case 'small': return 40;
      case 'large': return 56;
      default: return 48;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 16;
      default: return 15;
    }
  };

  const getBorderRadius = () => {
    switch (variant) {
      case 'minimal': return 4;
      case 'rounded': return 50;
      default: return 8;
    }
  };

  const colorsConfig = getThemeColors();
  const searchHeight = getHeight();
  const fontSize = getFontSize();
  const borderRadius = getBorderRadius();

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
    
    if (showCancelButton) {
      Animated.timing(cancelAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }

    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    if (!value && showCancelButton) {
      Animated.timing(cancelAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }

    onBlur?.();
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);

    // Debounce
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedValue(text);
      if (onSearch && text.trim().length > 0) {
        onSearch(text);
      }
    }, debounceTime);
  };

  const handleClear = () => {
    onChangeText('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCancel = () => {
    onChangeText('');
    Keyboard.dismiss();
    setShowSuggestions(false);
    
    Animated.timing(cancelAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const handleSubmit = () => {
    if (value.trim()) {
      // Add to search history
      const newSearch: SearchSuggestion = {
        id: Date.now(),
        text: value,
        recent: true,
      };
      setSearchHistory(prev => [newSearch, ...prev.filter(s => s.text !== value).slice(0, 4)]);
    }
    
    Keyboard.dismiss();
    onSubmitEditing?.();
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    onChangeText(suggestion.text);
    onSuggestionPress?.(suggestion);
    Keyboard.dismiss();
    setShowSuggestions(false);
  };

  const handleClearRecent = () => {
    setSearchHistory([]);
    onClearRecent?.();
  };

  const renderSuggestionItem = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, suggestionItemStyle]}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}>
      {item.icon && (
        <MaterialCommunityIcons
          name={item.icon}
          size={20}
          color={colorsConfig.icon}
          style={styles.suggestionIcon}
        />
      )}
      <Text style={[styles.suggestionText, { color: colorsConfig.text }]}>
        {item.text}
      </Text>
      {item.recent && (
        <MaterialCommunityIcons name="clock-outline" size={16} color={colorsConfig.icon} />
      )}
    </TouchableOpacity>
  );

  const renderSuggestions = () => {
    const hasRecent = searchHistory.length > 0;
    const hasSuggestions = suggestions.length > 0;
    const allSuggestions = [...searchHistory, ...suggestions].slice(0, maxSuggestions);

    if (!hasRecent && !hasSuggestions) return null;

    return (
      <Animated.View
        style={[
          styles.suggestionsContainer,
          suggestionsContainerStyle,
          {
            opacity: fadeAnim,
            transform: [{ scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            })}],
            backgroundColor: colorsConfig.suggestionBg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          },
        ]}>
        {hasRecent && (
          <View style={styles.suggestionsHeader}>
            <Text style={[styles.suggestionsTitle, { color: colorsConfig.text }]}>
              Recent Searches
            </Text>
            <TouchableOpacity onPress={handleClearRecent}>
              <Text style={[styles.clearRecent, { color: colorsConfig.icon }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <ScrollView
          style={styles.suggestionsList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}>
          {allSuggestions.map((item) => (
            <View key={item.id}>
              {renderSuggestionItem({ item })}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const cancelWidth = cancelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  const cancelOpacity = cancelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  useEffect(() => {
    if (showSuggestions) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [showSuggestions]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchWrapper,
            {
              height: searchHeight,
              borderRadius,
              backgroundColor: backgroundColor || colorsConfig.bg,
              borderWidth: variant === 'minimal' ? 0 : 1,
              borderColor: borderColor || (isFocused ? colors.primary : colorsConfig.border),
            },
            style,
          ]}>
          {showSearchIcon && (
            <MaterialCommunityIcons
              name={loading ? 'loading' : 'magnify'}
              size={fontSize + 4}
              color={iconColor || (disabled ? colors.textDisabled : colorsConfig.icon)}
              style={styles.searchIcon}
            />
          )}

          <TextInput
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              inputRef.current = node;
            }}
            style={[
              styles.input,
              {
                fontSize,
                color: textColor || colorsConfig.text,
                paddingLeft: showSearchIcon ? 0 : spacing.md,
              },
              inputStyle,
            ]}
            value={value}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor || colorsConfig.placeholder}
            autoFocus={autoFocus}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmit}
            returnKeyType={returnKeyType}
            blurOnSubmit={blurOnSubmit}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            keyboardType={keyboardType}
            accessibilityLabel={accessibilityLabel}
            testID="search-input"
          />

          {showClearButton && value && !disabled && (
            <TouchableOpacity
              style={[styles.clearButton, clearButtonStyle]}
              onPress={handleClear}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={iconColor || colorsConfig.icon}
              />
            </TouchableOpacity>
          )}

          {showFilters && onFilterPress && (
            <TouchableOpacity
              style={styles.filterButton}
              onPress={onFilterPress}
              activeOpacity={0.7}>
              <MaterialCommunityIcons
                name="filter-variant"
                size={20}
                color={iconColor || colorsConfig.icon}
              />
              {filterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{filterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Animated.View
          style={[
            styles.cancelButtonContainer,
            {
              width: cancelWidth,
              opacity: cancelOpacity,
            },
            cancelButtonStyle,
          ]}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: colors.primary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {showResults && showSuggestions && renderSuggestions()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    paddingVertical: 0,
    paddingHorizontal: spacing.sm,
    margin: 0,
    includeFontPadding: false,
  },
  clearButton: {
    marginLeft: spacing.sm,
  },
  filterButton: {
    marginLeft: spacing.sm,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: colors.surface,
    fontSize: 10,
    fontFamily: fonts.semiBold,
  },
  cancelButtonContainer: {
    overflow: 'hidden',
  },
  cancelButton: {
    paddingLeft: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 8,
    maxHeight: 300,
    zIndex: 1000,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontFamily: fonts.medium,
    opacity: 0.7,
  },
  clearRecent: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  suggestionsList: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionIcon: {
    marginRight: spacing.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;