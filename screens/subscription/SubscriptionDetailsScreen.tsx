import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Hooks
import { useSubscriptions } from '@hooks/useSubscriptions';

// Utilities
import currencyHelpers from '@utils/currencyHelpers';

// Types
import Subscription from '@models/Subscription';

// Route params interface
interface SubscriptionDetailsScreenRouteParams {
  subscriptionId: string;
}

const SubscriptionDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { subscriptionId } = route.params as SubscriptionDetailsScreenRouteParams;
  
  const { subscriptions, deleteSubscription } = useSubscriptions();
  
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [subscriptionId]);

  const loadSubscription = async () => {
    try {
      const found = subscriptions.find(s => s.id === subscriptionId);
      if (found) {
        setSubscription(found);
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

  const handleEdit = () => {
    navigation.goBack();
  };

  const handleDuplicate = async () => {
    try {
      Alert.alert('Duplicate', 'Subscription duplication feature coming soon');
    } catch (error) {
      Alert.alert('Error', 'Failed to duplicate subscription');
    }
  };

  const handleShare = async () => {
    if (!subscription) return;

    try {
      const shareContent = {
        title: subscription.name,
        message: `Check out my ${subscription.name} subscription:\n\n` +
                `Amount: ${currencyHelpers.formatAmount(subscription.amount, subscription.currency)}\n` +
                `Billing: ${subscription.billingCycle}\n` +
                `Category: ${subscription.category}`,
      };
      
      await Share.share(shareContent);
      setShowActionsModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to share subscription');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubscription(subscriptionId);
      Alert.alert('Success', 'Subscription deleted', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete subscription');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const calculateTotalSpent = (): number => {
    if (!subscription) return 0;
    if (!subscription.createdAt) return subscription.amount;
    
    const monthsActive = Math.ceil(
      (new Date().getTime() - new Date(subscription.createdAt).getTime()) / 
      (30 * 24 * 60 * 60 * 1000)
    );
    
    return subscription.amount * Math.max(1, monthsActive);
  };

  if (isLoading || !subscription) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const totalSpent = calculateTotalSpent();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subscription.name}</Text>
        <TouchableOpacity onPress={() => setShowActionsModal(true)}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subscription Info Card */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={24} color="#007AFF" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Amount</Text>
            <Text style={styles.infoValue}>{currencyHelpers.formatAmount(subscription.amount, subscription.currency)}</Text>
          </View>
        </View>

        {/* Status Info */}
        <View style={styles.statusCard}>
          <Text style={styles.cardLabel}>Status</Text>
          <Text style={[styles.statusBadge, subscription.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
            {subscription.status === 'active' ? '● Active' : '● ' + subscription.status}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Monthly Cost</Text>
            <Text style={styles.statValue}>{currencyHelpers.formatAmount(subscription.amount, subscription.currency)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>{currencyHelpers.formatAmount(totalSpent, subscription.currency)}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardLabel}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{subscription.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Billing Cycle:</Text>
            <Text style={styles.detailValue}>{subscription.billingCycle}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Currency:</Text>
            <Text style={styles.detailValue}>{subscription.currency}</Text>
          </View>
          {subscription.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes:</Text>
              <Text style={styles.detailValue}>{subscription.notes}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleEdit}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleShare}>
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Actions Modal */}
      {showActionsModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Actions</Text>
            
            <TouchableOpacity style={styles.modalItem} onPress={handleDuplicate}>
              <MaterialCommunityIcons name="content-copy" size={20} color="#007AFF" />
              <Text style={styles.modalItemText}>Duplicate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalItem} onPress={handleShare}>
              <MaterialCommunityIcons name="share-variant" size={20} color="#007AFF" />
              <Text style={styles.modalItemText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalItem, styles.modalDeleteItem]} 
              onPress={() => {
                setShowActionsModal(false);
                setShowDeleteModal(true);
              }}
            >
              <MaterialCommunityIcons name="trash-can" size={20} color="#FF3B30" />
              <Text style={styles.modalDeleteText}>Delete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowActionsModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Subscription?</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to delete "{subscription.name}"? This cannot be undone.
            </Text>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalDangerButton]}
                onPress={handleDelete}
              >
                <Text style={styles.modalDangerText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  headerButton: {
    fontSize: 14,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  statusCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  inactiveBadge: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  detailsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
  },
  modalItemText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  modalDeleteItem: {
    backgroundColor: '#ffe5e5',
  },
  modalDeleteText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalDangerButton: {
    backgroundColor: '#FF3B30',
  },
  modalDangerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SubscriptionDetailsScreen;