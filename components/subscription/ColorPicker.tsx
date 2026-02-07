import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useTheme } from '@hooks/useTheme';

// Preset colors
const PRESET_COLORS = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30',
  '#5856D6', '#FF2D55', '#5AC8FA', '#FFCC00',
  '#8E8E93', '#32D74B', '#64D2FF', '#FF6B6B',
  '#AF52DE', '#FF9F0A', '#30B0C7', '#FF453A',
];

interface ColorPickerProps {
  selectedColor?: string;
  onSelectColor: (color: string) => void;
  showColorNames?: boolean;
  showRecentColors?: boolean;
  recentColors?: string[];
  maxHeight?: number;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor = '#007AFF',
  onSelectColor,
  showColorNames = true,
  showRecentColors = true,
  recentColors: propRecentColors = [],
  maxHeight = 300,
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors || {};

  const [recentColors, setRecentColors] = useState<string[]>(propRecentColors);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectColor = (color: string) => {
    onSelectColor(color);
    // Add to recent colors
    const filtered = recentColors.filter(c => c !== color);
    setRecentColors([color, ...filtered.slice(0, 9)]);
  };

  const renderColorItem = (color: string) => {
    const isSelected = color === selectedColor;
    return (
      <TouchableOpacity
        key={color}
        style={styles.colorItem}
        onPress={() => handleSelectColor(color)}
        activeOpacity={0.7}>
        <View
          style={[
            styles.colorBox,
            { backgroundColor: color },
            isSelected && styles.colorBoxSelected,
          ]}>
          {isSelected && <Text style={styles.checkmark}></Text>}
        </View>
        {showColorNames && (
          <Text style={[styles.colorLabel, { color: colors.text || '#000' }]}>
            {color}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background || '#FFF' }]}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInput,
            { backgroundColor: colors.inputBackground || '#F5F5F5' },
          ]}>
          <Text style={{ fontSize: 16 }}></Text>
          <TextInput
            style={[styles.searchText, { color: colors.text || '#000' }]}
            placeholder="Search colors..."
            placeholderTextColor={colors.textSecondary || '#999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Preset colors grid */}
      <ScrollView style={{ maxHeight }} showsVerticalScrollIndicator={false}>
        <View style={styles.colorsGrid}>
          {PRESET_COLORS.map(renderColorItem)}
        </View>

        {/* Recent colors */}
        {showRecentColors && recentColors.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: colors.text || '#000' }]}>
              Recently Used
            </Text>
            <View style={styles.colorsGrid}>
              {recentColors.map(renderColorItem)}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Preview */}
      <View style={styles.previewSection}>
        <View
          style={[
            styles.previewColor,
            { backgroundColor: selectedColor },
          ]}
        />
        <View style={styles.previewInfo}>
          <Text style={[styles.previewLabel, { color: colors.text || '#000' }]}>
            Selected
          </Text>
          <Text style={[styles.previewValue, { color: colors.textSecondary || '#999' }]}>
            {selectedColor}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchContainer: {
    padding: 12,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 12,
    justifyContent: 'flex-start',
  },
  colorItem: {
    width: '20%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  colorBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorBoxSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  colorLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: 12,
    marginTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  previewColor: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  previewInfo: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default ColorPicker;
