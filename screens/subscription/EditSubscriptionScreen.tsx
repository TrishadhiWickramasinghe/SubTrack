import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Hooks
import { useCurrency } from '@hooks/useCurrency';
import { useSubscriptions } from '@hooks/useSubscriptions';

// Utilities

// Types
import Subscription from '@models/Subscription';

// Route params interface
interface EditSubscriptionScreenRouteParams {
  subscriptionId: string;
}

const EditSubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { subscriptionId } = route.params as EditSubscriptionScreenRouteParams;
  
  const { subscriptions, updateSubscription, deleteSubscription } = useSubscriptions();
  const { formatAmount } = useCurrency();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    currency: 'USD',
    category: '',
    billingCycle: 'monthly',
    billingDate: '',
    notes: '',
  });

  useEffect(() => {
    loadSubscription();
  }, [subscriptionId]);

  const loadSubscription = async () => {
    try {
      const found = subscriptions.find(s => s.id === subscriptionId);
      if (found) {
        setSubscription(found);
        setFormData({
          name: found.name,
          amount: found.amount.toString(),
          currency: found.currency || 'USD',
          category: found.category,
          billingCycle: found.billingCycle || 'monthly',
          billingDate: found.billingDate,
          notes: found.notes || '',
        });
      } else {
        Alert.alert('Error', 'Subscription not found');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load subscription');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.amount || !formData.category) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updatedData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      
      await updateSubscription(subscriptionId, updatedData);
      
      Alert.alert('Success', 'Subscription updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await deleteSubscription(subscriptionId);
      
      Alert.alert('Success', 'Subscription deleted', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete subscription');
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Subscription',
      `Are you sure you want to delete "${subscription?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => setShowDeleteModal(true) },
      ]
    );
  };

  if (isLoading || !subscription) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <TextInput
            editable={false}
            value="Loading..."
            style={styles.loadingText}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <TextInput editable={false} value="← Back" style={styles.headerButton} />
        </TouchableOpacity>
        <TextInput editable={false} value="Edit Subscription" style={styles.headerTitle} />
        <TouchableOpacity onPress={confirmDelete}>
          <TextInput editable={false} value="Delete" style={[styles.headerButton, styles.deleteButton]} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Form Fields */}
          <View style={styles.formGroup}>
            <TextInput
              style={styles.label}
              editable={false}
              value="Name *"
            />
            <TextInput
              style={styles.input}
              placeholder="Subscription name"
              value={formData.name}
              onChangeText={(text: string) => setFormData({ ...formData, name: text })}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.label}
              editable={false}
              value="Amount *"
            />
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={formData.amount}
              onChangeText={(text: string) => setFormData({ ...formData, amount: text })}
              keyboardType="decimal-pad"
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.label}
              editable={false}
              value="Currency"
            />
            <TextInput
              style={styles.input}
              placeholder="USD"
              value={formData.currency}
              onChangeText={(text: string) => setFormData({ ...formData, currency: text })}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.label}
              editable={false}
              value="Category *"
            />
            <TextInput
              style={styles.input}
              placeholder="Select category"
              value={formData.category}
              onChangeText={(text: string) => setFormData({ ...formData, category: text })}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.label}
              editable={false}
              value="Billing Cycle"
            />
            <TextInput
              style={styles.input}
              placeholder="monthly"
              value={formData.billingCycle}
              onChangeText={(text: string) => setFormData({ ...formData, billingCycle: text })}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.label}
              editable={false}
              value="Billing Date"
            />
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.billingDate}
              onChangeText={(text: string) => setFormData({ ...formData, billingDate: text })}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.label}
              editable={false}
              value="Notes"
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Add notes..."
              value={formData.notes}
              onChangeText={(text: string) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={3}
              editable={!isSubmitting}
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton, isSubmitting && styles.disabledButton]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <TextInput
                editable={false}
                value={isSubmitting ? 'Saving...' : 'Save Changes'}
                style={styles.buttonText}
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.goBack()}
              disabled={isSubmitting}
            >
              <TextInput
                editable={false}
                value="Cancel"
                style={styles.secondaryButtonText}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              editable={false}
              value="Confirm Delete"
              style={styles.modalTitle}
            />
            <TextInput
              editable={false}
              value="This will permanently delete the subscription and all associated data."
              style={styles.modalDescription}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.dangerButton, isSubmitting && styles.disabledButton]}
                onPress={handleDelete}
                disabled={isSubmitting}
              >
                <TextInput
                  editable={false}
                  value={isSubmitting ? 'Deleting...' : 'Delete'}
                  style={styles.buttonText}
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setShowDeleteModal(false)}
                disabled={isSubmitting}
              >
                <TextInput
                  editable={false}
                  value="Cancel"
                  style={styles.secondaryButtonText}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerButton: {
    fontSize: 14,
    color: '#007AFF',
    padding: 8,
  },
  deleteButton: {
    color: '#FF3B30',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '80%',
    minHeight: 200,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    gap: 12,
    marginTop: 16,
  },
});

export default EditSubscriptionScreen;
