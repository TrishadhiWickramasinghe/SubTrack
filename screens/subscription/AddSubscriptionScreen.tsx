import { useCurrency } from '@hooks/useCurrency';
import { useSubscriptions } from '@hooks/useSubscriptions';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView as RNSafeAreaView,
    TextInput as RNTextInput,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export const AddSubscriptionScreen = () => {
  const navigation = useNavigation();
  const { addSubscription, isLoading } = useSubscriptions();
  const { formatAmount } = useCurrency();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    currency: 'USD',
    category: 'entertainment',
    billingCycle: 'monthly',
    billingDate: new Date(),
    icon: 'streaming',
    color: '#3B82F6',
    notes: '',
    notificationDays: 1,
    isActive: true,
    trialEndDate: null as any,
  });

  const handleQuickAdd = useCallback((service: any) => {
    setFormData(prev => ({
      ...prev,
      name: service.name,
      category: service.category,
      icon: service.icon,
      amount: service.price.toString(),
      currency: service.currency,
    }));
  }, []);

  const onSubmit = async () => {
    if (isSubmitting || !formData.name.trim() || !formData.amount.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const subscriptionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save subscription
      const subscriptionId = await addSubscription(subscriptionData);
      
      // Show success message
      Alert.alert(
        'Success',
        `${formData.name} subscription added successfully`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Failed to add subscription:', error);
      
      Alert.alert(
        'Error',
        'Failed to add subscription. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.name.trim() || formData.amount.trim()) {
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <RNSafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </RNSafeAreaView>
    );
  }

  return (
    <RNSafeAreaView style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Add Subscription</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Name field */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: '600', marginBottom: 6 }}>
              Subscription Name *
            </Text>
            <RNTextInput
              placeholder="e.g., Netflix"
              value={formData.name}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, name: text }))}
              editable={!isSubmitting}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                paddingHorizontal: 12,
                height: 44,
                fontSize: 16,
              }}
            />
          </View>

          {/* Amount field */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: '600', marginBottom: 6 }}>
              Amount *
            </Text>
            <RNTextInput
              placeholder="e.g., 9.99"
              value={formData.amount}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, amount: text }))}
              keyboardType="decimal-pad"
              editable={!isSubmitting}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                paddingHorizontal: 12,
                height: 44,
                fontSize: 16,
              }}
            />
          </View>

          {/* Category field */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: '600', marginBottom: 6 }}>
              Category
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                paddingHorizontal: 12,
                height: 44,
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#666' }}>
                {formData.category}
              </Text>
            </View>
          </View>

          {/* Billing Cycle field */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: '600', marginBottom: 6 }}>
              Billing Cycle
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                paddingHorizontal: 12,
                height: 44,
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#666' }}>
                {formData.billingCycle}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={{ marginTop: 24, gap: 12 }}>
            <TouchableOpacity
              onPress={onSubmit}
              disabled={isSubmitting}
              style={{
                backgroundColor: isSubmitting ? '#ccc' : '#007AFF',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                {isSubmitting ? 'Adding...' : 'Add Subscription'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleCancel}
              disabled={isSubmitting}
              style={{
                backgroundColor: '#f5f5f5',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ddd',
              }}
            >
              <Text style={{ color: '#333', fontWeight: '600', fontSize: 16 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </RNSafeAreaView>
  );
};

export default AddSubscriptionScreen;