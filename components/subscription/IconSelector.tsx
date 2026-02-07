import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useTheme } from '@hooks/useTheme';

// Default icon categories
const iconCategories = [
  {
    id: 'common',
    name: 'Common',
    icon: '📍',
    icons: ['📦', '🎁', '💰', '📱', '💻', '🎮', '📺', '🎵', '📚', '📷'],
  },
  {
    id: 'business',
    name: 'Business',
    icon: '💼',
    icons: ['💼', '📊', '📈', '📉', '💳', '💸', '🏦', '🏢', '📞', '✉️'],
  },
  {
    id: 'social',
    name: 'Social',
    icon: '👥',
    icons: ['👥', '👨', '👩', '🤝', '💬', '📢', '📣', '❤️', '👍', '⭐'],
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍕',
    icons: ['🍕', '🍔', '🍜', '🍱', '🍰', '☕', '🍺', '🥗', '🍖', '🍛'],
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: '✈️',
    icons: ['✈️', '🚗', '🚂', '🏨', '🗺️', '🎫', '⛰️', '🏖️', '🎢', '🧳'],
  },
];

const GRID_COLUMNS = 5;
const ICON_SIZE = 48;
const COLOR_OPTIONS = [
  '#007AFF',
  '#34C759',
  '#FF9500',
  '#FF3B30',
  '#5856D6',
  '#FF2D55',
];

interface IconSelectorProps {
  selectedIcon?: string;
  onSelectIcon: (iconName: string) => void;
  color?: string;
  showColorPicker?: boolean;
  onSelectColor?: (color: string) => void;
  customIcons?: any[];
  showSearch?: boolean;
  maxHeight?: number;
}

const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon = '📍',
  onSelectIcon,
  color: selectedColor = '#007AFF',
  showColorPicker = true,
  onSelectColor,
  customIcons = [],
  showSearch = true,
  maxHeight = 400,
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter icons based on search and category
  const filteredIcons = React.useMemo(() => {
    let icons: string[] = [];

    if (selectedCategory === 'all') {
      iconCategories.forEach((category: any) => {
        icons = [...icons, ...category.icons];
      });
    } else {
      const category = iconCategories.find((c: any) => c.id === selectedCategory);
      if (category) {
        icons = category.icons;
      }
    }

    icons = [...icons, ...customIcons.map((icon: any) => icon.name)];

    if (searchQuery.trim()) {
      icons = icons.filter((iconName: string) =>
        iconName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return icons;
  }, [selectedCategory, searchQuery, customIcons]);

  const renderColorOption = (color: string) => {
    const isSelected = color === selectedColor;
    return (
      <TouchableOpacity
        key={color}
        style={[
          styles.colorOption,
          { backgroundColor: color },
          isSelected && styles.colorSelected,
        ]}
        onPress={() => onSelectColor && onSelectColor(color)}
        activeOpacity={0.7}>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  const renderIconItem = ({ item: iconName }: { item: string }) => {
    const isSelected = iconName === selectedIcon;
    return (
      <TouchableOpacity
        style={styles.iconItem}
        onPress={() => onSelectIcon(iconName)}
        activeOpacity={0.7}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isSelected ? selectedColor + '20' : colors.inputBackground || '#F5F5F5',
            },
          ]}>
          <Text style={{ fontSize: 24 }}>{iconName}</Text>
        </View>
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: selectedColor }]}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCategoryTab = (category: any) => {
    const isSelected = category.id === selectedCategory;
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryTab,
          isSelected && { backgroundColor: selectedColor + '20' },
        ]}
        onPress={() => setSelectedCategory(category.id)}
        activeOpacity={0.7}>
        <Text style={{ fontSize: 16 }}>{category.icon}</Text>
        <Text
          style={[
            styles.categoryTabText,
            {
              color: isSelected ? selectedColor : colors.textSecondary || '#999',
            },
          ]}>
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background || '#FFF' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text || '#000' }]}>
          Select Icon
        </Text>
      </View>

      {/* Color picker */}
      {showColorPicker && onSelectColor && (
        <View style={styles.colorPickerSection}>
          <Text style={[styles.sectionTitle, { color: colors.text || '#000' }]}>
            Color
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.colorOptions}>
            {COLOR_OPTIONS.map(renderColorOption)}
          </ScrollView>
        </View>
      )}

      {/* Search */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchInput,
              { backgroundColor: colors.inputBackground || '#F5F5F5' },
            ]}>
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <TextInput
              style={[styles.searchText, { color: colors.text || '#000' }]}
              placeholder="Search icons..."
              placeholderTextColor={colors.textSecondary || '#999'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      )}

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabs}>
        <TouchableOpacity
          style={[
            styles.categoryTab,
            selectedCategory === 'all' && { backgroundColor: selectedColor + '20' },
          ]}
          onPress={() => setSelectedCategory('all')}
          activeOpacity={0.7}>
          <Text style={{ fontSize: 16 }}>📱</Text>
          <Text
            style={[
              styles.categoryTabText,
              {
                color:
                  selectedCategory === 'all'
                    ? selectedColor
                    : colors.textSecondary || '#999',
              },
            ]}>
            All
          </Text>
        </TouchableOpacity>

        {iconCategories.map(renderCategoryTab)}
      </ScrollView>

      {/* Icons grid */}
      <FlatList
        data={filteredIcons}
        renderItem={renderIconItem}
        keyExtractor={(item: string, index: number) => `${item}-${index}`}
        numColumns={GRID_COLUMNS}
        contentContainerStyle={styles.iconsGrid}
        showsVerticalScrollIndicator={false}
        style={{ maxHeight }}
      />

      {/* Selected icon preview */}
      <View style={[styles.previewSection, { backgroundColor: colors.card || '#FFF' }]}>
        <View style={styles.previewContent}>
          <View
            style={[
              styles.previewIcon,
              { backgroundColor: selectedColor + '20' },
            ]}>
            <Text style={{ fontSize: 40 }}>{selectedIcon}</Text>
          </View>
          <View style={styles.previewInfo}>
            <Text
              style={[styles.previewName, { color: colors.text || '#000' }]}>
              Selected Icon
            </Text>
            <Text
              style={[
                styles.previewValue,
                { color: colors.textSecondary || '#999' },
              ]}>
              {selectedIcon}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: selectedColor }]}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  colorPickerSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorOptions: {
    flexDirection: 'row' as const,
    gap: 12,
    paddingRight: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInput: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  categoryTabs: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  iconsGrid: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  iconItem: {
    width: `${100 / GRID_COLUMNS}%`,
    alignItems: 'center' as const,
    padding: 8,
    position: 'relative' as const,
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  selectedIndicator: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  previewSection: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  previewContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
    gap: 16,
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 14,
  },
  confirmButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

export default IconSelector;