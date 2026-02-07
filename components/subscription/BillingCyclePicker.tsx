import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useTheme } from '@hooks/useTheme';

// Billing cycles
const BILLING_CYCLES = [
  {
    id: 'daily',
    name: 'Daily',
    days: 1,
    multiplier: 365,
    color: '#FF3B30',
  },
  {
    id: 'weekly',
    name: 'Weekly',
    days: 7,
    multiplier: 52,
    color: '#FF9500',
  },
  {
    id: 'biweekly',
    name: 'Biweekly',
    days: 14,
    multiplier: 26,
    color: '#FFCC00',
  },
  {
    id: 'monthly',
    name: 'Monthly',
    days: 30,
    multiplier: 12,
    color: '#34C759',
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    days: 90,
    multiplier: 4,
    color: '#5856D6',
  },
  {
    id: 'semiannual',
    name: 'Semiannual',
    days: 180,
    multiplier: 2,
    color: '#007AFF',
  },
  {
    id: 'annual',
    name: 'Annual',
    days: 365,
    multiplier: 1,
    color: '#5AC8FA',
  },
];

interface BillingCyclePickerProps {
  selectedCycle?: string;
  onSelectCycle: (cycleId: string) => void;
  showCostPreview?: boolean;
  baseAmount?: number;
  currency?: string;
  maxHeight?: number;
}

const BillingCyclePicker: React.FC<BillingCyclePickerProps> = ({
  selectedCycle = 'monthly',
  onSelectCycle,
  showCostPreview = true,
  baseAmount = 0,
  currency = 'USD',
  maxHeight = 400,
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors || {};

  const renderCycleItem = (cycle: typeof BILLING_CYCLES[0]) => {
    const isSelected = cycle.id === selectedCycle;
    const annualCost = baseAmount * cycle.multiplier;

    return (
      <TouchableOpacity
        key={cycle.id}
        style={[
          styles.cycleItem,
          isSelected && styles.cycleItemSelected,
          { borderColor: isSelected ? cycle.color : colors.border || '#E5E5EA' },
        ]}
        onPress={() => onSelectCycle(cycle.id)}
        activeOpacity={0.7}>
        <View
          style={[
            styles.cycleIcon,
            { backgroundColor: cycle.color + '20' },
          ]}>
          <Text style={styles.cycleEmoji}></Text>
        </View>

        <View style={styles.cycleInfo}>
          <Text style={[styles.cycleName, { color: colors.text || '#000' }]}>
            {cycle.name}
          </Text>
          <Text style={[styles.cycleDescription, { color: colors.textSecondary || '#999' }]}>
            Every {cycle.days} days
          </Text>
        </View>

        {showCostPreview && baseAmount > 0 && (
          <View style={styles.costInfo}>
            <Text style={[styles.costLabel, { color: colors.textSecondary || '#999' }]}>
              {currency}
            </Text>
            <Text style={[styles.costAmount, { color: cycle.color }]}>
              {annualCost.toFixed(2)}
            </Text>
            <Text style={[styles.costPeriod, { color: colors.textSecondary || '#999' }]}>
              /year
            </Text>
          </View>
        )}

        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: cycle.color }]}>
            <Text style={styles.checkmark}></Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background || '#FFF' }]}>
      <ScrollView
        style={{ maxHeight }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {BILLING_CYCLES.map(renderCycleItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 12,
    gap: 12,
  },
  cycleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  cycleItemSelected: {
    backgroundColor: '#F0F0F0',
  },
  cycleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cycleEmoji: {
    fontSize: 24,
  },
  cycleInfo: {
    flex: 1,
  },
  cycleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cycleDescription: {
    fontSize: 13,
  },
  costInfo: {
    alignItems: 'flex-end',
  },
  costLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  costAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  costPeriod: {
    fontSize: 11,
    marginTop: 2,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default BillingCyclePicker;
