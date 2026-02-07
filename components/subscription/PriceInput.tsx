import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useTheme } from '@hooks/useTheme';

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  maxValue?: number;
  minValue?: number;
}

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  currency = 'USD',
  label = 'Price',
  placeholder = '0.00',
  error,
  disabled = false,
  maxValue = 999999.99,
  minValue = 0,
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors || {};

  const [inputValue, setInputValue] = useState(value.toString());

  const handleInputChange = (text: string) => {
    // Remove non-numeric except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    setInputValue(cleaned);
    const num = parseFloat(cleaned) || 0;
    if (num >= minValue && num <= maxValue) {
      onChange(num);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setInputValue(amount.toString());
    onChange(amount);
  };

  const getCurrencySymbol = () => {
    const symbols: Record<string, string> = {
      'USD': '\$',
      'EUR': '',
      'GBP': '',
      'JPY': '',
      'CAD': 'C\$',
      'AUD': 'A\$',
    };
    return symbols[currency] || currency;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background || '#FFF' }]}>
      {label && (
        <Text style={[styles.label, { color: colors.text || '#000' }]}>
          {label}
        </Text>
      )}

      <View style={[styles.inputContainer, error && styles.inputError]}>
        <Text style={[styles.currencySymbol, { color: colors.textSecondary || '#999' }]}>
          {getCurrencySymbol()}
        </Text>
        <TextInput
          style={[styles.input, { color: colors.text || '#000' }]}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary || '#999'}
          keyboardType="decimal-pad"
          editable={!disabled}
          maxLength={10}
        />
      </View>

      {error && (
        <Text style={[styles.errorText, { color: '#FF3B30' }]}>
          {error}
        </Text>
      )}

      {/* Quick amount buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickAmounts}>
        {QUICK_AMOUNTS.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[
              styles.quickButton,
              value === amount && styles.quickButtonActive,
              { backgroundColor: value === amount ? colors.primary || '#007AFF' : colors.inputBackground || '#F5F5F5' },
            ]}
            onPress={() => handleQuickAmount(amount)}
            disabled={disabled}>
            <Text style={[
              styles.quickButtonText,
              value === amount && styles.quickButtonTextActive,
              { color: value === amount ? '#FFF' : colors.text || '#000' },
            ]}>
              {getCurrencySymbol()}{amount}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Display current value */}
      <View style={styles.preview}>
        <Text style={[styles.previewLabel, { color: colors.textSecondary || '#999' }]}>
          Total
        </Text>
        <Text style={[styles.previewValue, { color: colors.text || '#000' }]}>
          {getCurrencySymbol()}{value.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
  },
  quickAmounts: {
    paddingVertical: 12,
    gap: 8,
  },
  quickButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  quickButtonActive: {
    opacity: 1,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickButtonTextActive: {
    color: '#FFF',
  },
  preview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 24,
    fontWeight: '700',
  },
});

export default PriceInput;
