import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Card, Loading, Text } from '@components/common';
import { colors } from '@config/colors';
import { useCurrency } from '@hooks/useCurrency';

interface BudgetProgressProps {
  period?: 'monthly' | 'yearly' | 'custom';
  compact?: boolean;
}

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
}

interface BudgetSummary {
  totalBudgeted: number;
  totalSpent: number;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({
  period = 'monthly',
  compact = false,
}) => {
  const { formatAmount } = useCurrency();
  
  const [isLoading, setIsLoading] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Load budget data
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget Progress</Text>
        </View>
        <View style={styles.emptyState}>
          <Icon name="chart-box-outline" size={48} color={colors.neutral[600]} />
          <Text style={styles.emptyTitle}>No Budget Data</Text>
          <Text style={styles.emptyDescription}>Create a budget to get started</Text>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
  },
  compactCard: {
    padding: 12,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.neutral[900],
  },
  emptyState: {
    alignItems: 'center' as const,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.neutral[900],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center' as const,
  },
});

export default BudgetProgress;
