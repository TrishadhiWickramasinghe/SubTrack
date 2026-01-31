import { colors, fonts, spacing } from '@/config/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { forwardRef, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export type DropdownItem = {
  label: string;
  value: string | number;
  icon?: string;
  iconColor?: string;
  disabled?: boolean;
  customElement?: React.ReactNode;
  group?: string;
};

interface DropdownProps {
  items: DropdownItem[];
  selectedValue?: string | number;
  onSelect: (value: string | number, item: DropdownItem) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  multiSelect?: boolean;
  selectedValues?: (string | number)[];
  onMultiSelect?: (values: (string | number)[], items: DropdownItem[]) => void;
  showCheckbox?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  icon?: string;
  iconColor?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium' | 'large';
  dropdownHeight?: number;
  dropdownPosition?: 'auto' | 'top' | 'bottom';
  groupBy?: string;
  showClearButton?: boolean;
  onClear?: () => void;
  testID?: string;
  containerStyle?: any;
  dropdownStyle?: any;
  itemStyle?: any;
  selectedItemStyle?: any;
  labelStyle?: any;
  placeholderStyle?: any;
}

const Dropdown = forwardRef<View, DropdownProps>((props, ref) => {
  const {
    items,
    selectedValue,
    onSelect,
    placeholder = 'Select an option',
    label,
    error,
    success,
    required,
    disabled,
    searchable = false,
    multiSelect = false,
    selectedValues = [],
    onMultiSelect,
    showCheckbox = false,
    searchPlaceholder = 'Search...',
    emptyMessage = 'No items found',
    icon = 'chevron-down',
    iconColor,
    variant = 'outlined',
    size = 'medium',
    dropdownHeight = 200,
    dropdownPosition = 'auto',
    groupBy,
    showClearButton = false,
    onClear,
    testID = 'dropdown',
    containerStyle,
    dropdownStyle,
    itemStyle,
    selectedItemStyle,
    labelStyle,
    placeholderStyle,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownDirection, setDropdownDirection] = useState<'top' | 'bottom'>('bottom');
  const triggerRef = useRef<View>(null);
  const dropdownRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  const screenHeight = Dimensions.get('window').height;

  const getSelectedItem = () => {
    return items.find(item => item.value === selectedValue);
  };

  const getSelectedItems = () => {
    return items.filter(item => selectedValues.includes(item.value));
  };

  const getFilteredItems = () => {
    let filtered = items;
    
    if (searchText) {
      filtered = filtered.filter(item =>
        item.label.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  };

  const getGroupedItems = () => {
    if (!groupBy) return getFilteredItems();
    
    const groups: Record<string, DropdownItem[]> = {};
    
    getFilteredItems().forEach(item => {
      const group = item.group || 'Other';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
    });

    return groups;
  };

  const toggleDropdown = () => {
    if (disabled) return;

    if (!isOpen) {
      calculateDropdownPosition();
      setIsOpen(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(heightAnim, {
          toValue: dropdownHeight,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      closeDropdown();
    }
  };

  const closeDropdown = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIsOpen(false);
      setSearchText('');
    });
  };

  const calculateDropdownPosition = () => {
    if (triggerRef.current) {
      triggerRef.current.measure((fx, fy, width, height, px, py) => {
        const spaceBelow = screenHeight - py - height - 20;
        const spaceAbove = py - 20;
        
        let direction: 'top' | 'bottom' = 'bottom';
        let top = py + height + 5;

        if (dropdownPosition === 'auto') {
          if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            direction = 'top';
            top = py - dropdownHeight - 5;
          }
        } else if (dropdownPosition === 'top') {
          direction = 'top';
          top = py - dropdownHeight - 5;
        }

        setDropdownTop(top);
        setDropdownDirection(direction);
      });
    }
  };

  const handleSelect = (item: DropdownItem) => {
    if (item.disabled) return;

    if (multiSelect) {
      const newSelectedValues = selectedValues.includes(item.value)
        ? selectedValues.filter(val => val !== item.value)
        : [...selectedValues, item.value];

      const selectedItems = items.filter(item => newSelectedValues.includes(item.value));
      
      if (onMultiSelect) {
        onMultiSelect(newSelectedValues, selectedItems);
      }
    } else {
      onSelect(item.value, item);
      closeDropdown();
    }
  };

  const handleClear = () => {
    if (multiSelect && onMultiSelect) {
      onMultiSelect([], []);
    } else if (onClear) {
      onClear();
    }
    closeDropdown();
  };

  const getDisplayText = () => {
    if (multiSelect) {
      const selected = getSelectedItems();
      if (selected.length === 0) return placeholder;
      if (selected.length === 1) return selected[0].label;
      return `${selected.length} selected`;
    }

    const selected = getSelectedItem();
    return selected ? selected.label : placeholder;
  };

  const getBorderColor = () => {
    if (error) return colors.error;
    if (success) return colors.success;
    if (isOpen) return colors.primary;
    if (disabled) return colors.borderDisabled;
    return colors.border;
  };

  const getBackgroundColor = () => {
    if (variant === 'filled') return colors.surfaceVariant;
    if (disabled) return colors.disabled;
    return colors.surface;
  };

  const getHeight = () => {
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

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const renderItem = ({ item }: { item: DropdownItem }) => {
    const isSelected = multiSelect
      ? selectedValues.includes(item.value)
      : selectedValue === item.value;

    return (
      <TouchableOpacity
        style={[
          styles.item,
          itemStyle,
          isSelected && [styles.selectedItem, selectedItemStyle],
          item.disabled && styles.disabledItem,
        ]}
        onPress={() => handleSelect(item)}
        disabled={item.disabled}
        activeOpacity={0.7}>
        {showCheckbox && multiSelect && (
          <View style={styles.checkboxContainer}>
            <View style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected,
              item.disabled && styles.checkboxDisabled,
            ]}>
              {isSelected && (
                <MaterialCommunityIcons name="check" size={14} color={colors.surface} />
              )}
            </View>
          </View>
        )}

        {item.icon && (
          <MaterialCommunityIcons
            name={item.icon}
            size={20}
            color={item.iconColor || colors.textSecondary}
            style={styles.itemIcon}
          />
        )}

        {item.customElement ? (
          item.customElement
        ) : (
          <Text
            style={[
              styles.itemText,
              isSelected && styles.selectedItemText,
              item.disabled && styles.disabledItemText,
            ]}>
            {item.label}
          </Text>
        )}

        {isSelected && !multiSelect && (
          <MaterialCommunityIcons name="check" size={20} color={colors.primary} style={styles.selectedIcon} />
        )}
      </TouchableOpacity>
    );
  };

  const renderGroup = (group: string, groupItems: DropdownItem[]) => (
    <View key={group}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupText}>{group}</Text>
      </View>
      {groupItems.map(item => (
        <View key={item.value}>
          {renderItem({ item })}
        </View>
      ))}
    </View>
  );

  const filteredItems = getFilteredItems();
  const groupedItems = getGroupedItems();

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View ref={triggerRef}>
        <TouchableOpacity
          ref={ref}
          style={[
            styles.trigger,
            {
              borderColor: getBorderColor(),
              backgroundColor: getBackgroundColor(),
              height: getHeight(),
              borderWidth: variant === 'standard' ? 0 : 1,
              borderBottomWidth: variant === 'standard' ? 1 : 1,
            },
            disabled && styles.disabled,
          ]}
          onPress={toggleDropdown}
          disabled={disabled}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.triggerText,
              {
                fontSize: getFontSize(),
                color: disabled ? colors.textDisabled : colors.text,
              },
              !selectedValue && !selectedValues?.length && [styles.placeholder, placeholderStyle],
            ]}
            numberOfLines={1}>
            {getDisplayText()}
          </Text>

          <View style={styles.triggerIcons}>
            {showClearButton && (selectedValue || selectedValues?.length) && (
              <TouchableOpacity
                onPress={handleClear}
                style={styles.clearButton}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
              <MaterialCommunityIcons
                name={icon}
                size={24}
                color={iconColor || (disabled ? colors.textDisabled : colors.textSecondary)}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isOpen && (
        <View style={[StyleSheet.absoluteFill, styles.dropdownOverlay]}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeDropdown}
          />
          
          <Animated.View
            ref={dropdownRef}
            style={[
              styles.dropdown,
              {
                top: dropdownTop,
                opacity: fadeAnim,
                maxHeight: heightAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [dropdownDirection === 'top' ? -10 : 10, 0],
                    }),
                  },
                ],
              },
              dropdownStyle,
            ]}>
            {searchable && (
              <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.textDisabled}
                  value={searchText}
                  onChangeText={setSearchText}
                  autoFocus={false}
                />
                {searchText && (
                  <TouchableOpacity onPress={() => setSearchText('')}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}>
              {groupBy ? (
                Object.entries(groupedItems).map(([group, groupItems]) =>
                  renderGroup(group, groupItems)
                )
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <View key={item.value}>
                    {renderItem({ item })}
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="file-document-outline" size={40} color={colors.textDisabled} />
                  <Text style={styles.emptyText}>{emptyMessage}</Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.6,
  },
  triggerText: {
    flex: 1,
    fontFamily: fonts.regular,
  },
  placeholder: {
    color: colors.textDisabled,
  },
  triggerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    marginRight: spacing.sm,
  },
  errorText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.error,
    marginTop: spacing.xs,
  },
  dropdownOverlay: {
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dropdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    padding: 0,
  },
  scrollView: {
    maxHeight: 200,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  selectedItem: {
    backgroundColor: colors.primaryLight,
  },
  disabledItem: {
    opacity: 0.5,
  },
  checkboxContainer: {
    marginRight: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxDisabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.borderDisabled,
  },
  itemIcon: {
    marginRight: spacing.sm,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  selectedItemText: {
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  disabledItemText: {
    color: colors.textDisabled,
  },
  selectedIcon: {
    marginLeft: spacing.sm,
  },
  groupHeader: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceVariant,
  },
  groupText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

Dropdown.displayName = 'Dropdown';

export default Dropdown;