import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../hooks/useCurrency';

export default function BudgetScreen() {
  const { theme, colors } = useTheme();
  const { formatAmount } = useCurrency();
  
  const [monthlyBudget, setMonthlyBudget] = useState('0');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const handleSetBudget = () => {
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount');
      return;
    }
    setMonthlyBudget(amount.toString());
    setShowBudgetModal(false);
    setBudgetAmount('');
  };

  const handleEditBudget = () => {
    setBudgetAmount(monthlyBudget);
    setShowBudgetModal(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Budget</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track and manage your subscription budget
          </Text>
        </View>

        {/* Main Budget Card */}
        <Card style={styles.mainBudgetCard}>
          <View style={styles.budgetHeader}>
            <View>
              <Text style={[styles.monthTitle, { color: colors.text }]}>
                Monthly Budget
              </Text>
              <Text style={[styles.budgetAmount, { color: colors.text }]}>
                {formatAmount(parseFloat(monthlyBudget))}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleEditBudget}
              style={[styles.editButton, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {parseFloat(monthlyBudget) > 0 && (
            <View style={styles.budgetStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Allocated
                </Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {formatAmount(parseFloat(monthlyBudget))}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Remaining
                </Text>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {formatAmount(parseFloat(monthlyBudget))}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {parseFloat(monthlyBudget) === 0 && (
          <View style={styles.noBudgetContainer}>
            <Ionicons name="calculator-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.noBudgetTitle, { color: colors.text }]}>
              No Budget Set
            </Text>
            <Text style={[styles.noBudgetText, { color: colors.textSecondary }]}>
              Set a monthly budget to start tracking your spending
            </Text>
            <Button
              title="Set Budget"
              onPress={() => setShowBudgetModal(true)}
              style={styles.setBudgetButton}
            />
          </View>
        )}

        {/* Budget Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsTitleContainer}>
              <Text style={[styles.tipsTitle, { color: colors.text }]}>
                💡 Budget Tips
              </Text>
            </View>
          </View>
          <View style={styles.tipsContent}>
            <Text style={[styles.tipItem, { color: colors.textSecondary }]}>
              • Review your subscriptions monthly
            </Text>
            <Text style={[styles.tipItem, { color: colors.textSecondary }]}>
              • Cancel unused services
            </Text>
            <Text style={[styles.tipItem, { color: colors.textSecondary }]}>
              • Set realistic budget limits
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Budget Modal */}
      <Modal
        visible={showBudgetModal}
        onClose={() => {
          setShowBudgetModal(false);
          setBudgetAmount('');
        }}
        title="Set Monthly Budget">
        <View style={styles.modalContent}>
          <Input
            label="Monthly Budget Amount"
            placeholder="Enter amount"
            value={budgetAmount}
            onChangeText={setBudgetAmount}
            keyboardType="decimal-pad"
          />
          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={() => {
                setShowBudgetModal(false);
                setBudgetAmount('');
              }}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Set Budget"
              onPress={handleSetBudget}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  mainBudgetCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  budgetAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  noBudgetContainer: {
    marginHorizontal: 20,
    marginVertical: 40,
    alignItems: 'center',
  },
  noBudgetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  noBudgetText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  setBudgetButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  tipsCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitleContainer: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContent: {
    gap: 8,
  },
  tipItem: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalContent: {
    padding: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
});
