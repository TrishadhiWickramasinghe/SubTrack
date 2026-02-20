import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import React, { memo, useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Types
import Trial from '@models/Trial';

// Hooks
import useTheme from '@hooks/useTheme';

interface TrialReminderProps {
  trials: Trial[];
  visible: boolean;
  onDismiss?: () => void;
  onAction?: (trial: Trial, action: 'extend' | 'convert' | 'cancel') => void;
  onSnooze?: (trial: Trial, hours: number) => void;
  showInlineReminders?: boolean;
  maxRemindersToShow?: number;
}

interface ReminderTrialData {
  trial: Trial;
  type: 'expiring' | 'expired' | 'high_churn_risk';
  priority: 'critical' | 'warning' | 'info';
  message: string;
  daysRemaining: number;
  suggestedAction: string;
}

const TrialReminder: React.FC<TrialReminderProps> = memo(
  ({
    trials,
    visible,
    onDismiss,
    onAction,
    onSnooze,
    showInlineReminders = false,
    maxRemindersToShow = 3,
  }) => {
    const theme = useTheme();
    const [snoozedTrials, setSnoozedTrials] = useState<Set<string>>(new Set());
    const [selectedReminder, setSelectedReminder] = useState<ReminderTrialData | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Get active reminders
    const activeReminders = useMemo(() => {
      const now = new Date();
      const reminders: ReminderTrialData[] = [];

      trials.forEach((trial) => {
        // Skip snoozed trials
        if (snoozedTrials.has(trial.id)) return;

        const endDate = new Date(trial.endDate);
        const daysUntilEnd = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Expired trials
        if (trial.status === 'active' && daysUntilEnd <= 0) {
          reminders.push({
            trial,
            type: 'expired',
            priority: 'critical',
            message: 'Trial has expired',
            daysRemaining: 0,
            suggestedAction: 'Convert to paid or cancel',
          });
        }
        // Expiring soon (within 3 days)
        else if (trial.status === 'active' && daysUntilEnd <= 3 && daysUntilEnd > 0) {
          reminders.push({
            trial,
            type: 'expiring',
            priority: 'warning',
            message: `Expires in ${daysUntilEnd} day${daysUntilEnd !== 1 ? 's' : ''}`,
            daysRemaining: daysUntilEnd,
            suggestedAction: 'Extend or convert trial',
          });
        }
        // High churn risk
        else if (trial.status === 'active' && trial.churnRiskScore >= 70) {
          reminders.push({
            trial,
            type: 'high_churn_risk',
            priority: 'warning',
            message: 'High risk of cancellation',
            daysRemaining: daysUntilEnd,
            suggestedAction: 'Consider retention offer',
          });
        }
      });

      // Sort by priority then by days remaining
      reminders.sort((a, b) => {
        const priorityOrder = { critical: 0, warning: 1, info: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.daysRemaining - b.daysRemaining;
      });

      return reminders;
    }, [trials, snoozedTrials]);

    // Handle snooze
    const handleSnooze = useCallback(
      (trial: Trial, hours: number) => {
        setSnoozedTrials((prev) => new Set([...prev, trial.id]));

        if (onSnooze) {
          onSnooze(trial, hours);
        }

        // Auto-unsnooze after specified hours
        setTimeout(() => {
          setSnoozedTrials((prev) => {
            const updated = new Set(prev);
            updated.delete(trial.id);
            return updated;
          });
        }, hours * 60 * 60 * 1000);
      },
      [onSnooze]
    );

    // Handle action
    const handleAction = useCallback(
      (trial: Trial, action: 'extend' | 'convert' | 'cancel') => {
        if (onAction) {
          onAction(trial, action);
        }
        setShowDetailsModal(false);
      },
      [onAction]
    );

    // Get priority color
    const getPriorityColor = useCallback((priority: string): string => {
      switch (priority) {
        case 'critical':
          return '#F44336';
        case 'warning':
          return '#FF9800';
        case 'info':
          return '#2196F3';
        default:
          return '#757575';
      }
    }, []);

    // Get priority icon
    const getPriorityIcon = useCallback((priority: string) => {
      switch (priority) {
        case 'critical':
          return 'alert-circle' as const;
        case 'warning':
          return 'alert' as const;
        case 'info':
          return 'information' as const;
        default:
          return 'close-circle' as const;
      }
    }, []);

    // Render reminder item
    const renderReminderItem = useCallback(
      ({ item }: { item: ReminderTrialData }) => (
        <TouchableOpacity
          style={[
            styles.reminderItem,
            {
              borderLeftColor: getPriorityColor(item.priority),
              backgroundColor:
                getPriorityColor(item.priority) + '10',
            },
          ]}
          onPress={() => {
            setSelectedReminder(item);
            setShowDetailsModal(true);
          }}
        >
          <View style={styles.reminderItemLeft}>
            <View
              style={[
                styles.priorityIcon,
                {
                  backgroundColor: getPriorityColor(item.priority),
                },
              ]}
            >
              <Icon
                name={getPriorityIcon(item.priority)}
                size={16}
                color="#fff"
              />
            </View>

            <View style={styles.reminderItemContent}>
              <Text
                style={[
                  styles.reminderItemTitle,
                  { color: theme.theme.colors.text },
                ]}
                numberOfLines={1}
              >
                {item.trial.subscriptionName}
              </Text>
              <Text
                style={[
                  styles.reminderItemMessage,
                  { color: theme.theme.colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {item.message}
              </Text>
            </View>
          </View>

          <View style={styles.reminderItemRight}>
            <TouchableOpacity
              onPress={() => handleSnooze(item.trial, 24)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon
                name="clock-outline"
                size={18}
                color={theme.theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <Icon
              name="chevron-right"
              size={18}
              color={theme.theme.colors.textSecondary}
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableOpacity>
      ),
      [
        theme.theme.colors.text,
        theme.theme.colors.textSecondary,
        getPriorityColor,
        getPriorityIcon,
        handleSnooze,
      ]
    );

    // Render details modal
    const renderDetailsModal = () => {
      if (!selectedReminder) return null;

      const { trial, type, priority, message, daysRemaining } = selectedReminder;

      return (
        <Modal
          visible={showDetailsModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDetailsModal(false)}
        >
          <View style={styles.detailsModalOverlay}>
            <View
              style={[
                styles.detailsModalContent,
                { backgroundColor: theme.theme.colors.card },
              ]}
            >
              {/* Header */}
              <View style={styles.detailsModalHeader}>
                <View
                  style={[
                    styles.detailsModalIcon,
                    { backgroundColor: getPriorityColor(priority) },
                  ]}
                >
                  <Icon
                    name={getPriorityIcon(priority)}
                    size={24}
                    color="#fff"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.detailsModalTitle,
                      { color: theme.theme.colors.text },
                    ]}
                  >
                    {trial.subscriptionName}
                  </Text>
                  <Text
                    style={[
                      styles.detailsModalSubtitle,
                      { color: getPriorityColor(priority) },
                    ]}
                  >
                    {message}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowDetailsModal(false)}
                  style={styles.detailsModalCloseButton}
                >
                  <Icon
                    name="close"
                    size={20}
                    color={theme.theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Details */}
              <View style={styles.detailsModalBody}>
                <View style={styles.detailItem}>
                  <Icon
                    name="calendar-clock"
                    size={16}
                    color={theme.theme.colors.textSecondary}
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.theme.colors.textSecondary },
                      ]}
                    >
                      Trial End Date
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: theme.theme.colors.text },
                      ]}
                    >
                      {new Date(trial.endDate).toLocaleDateString()} (
                      {daysRemaining > 0
                        ? `${daysRemaining} days left`
                        : 'Expired'}
                      )
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Icon
                    name="lightning-bolt"
                    size={16}
                    color={theme.theme.colors.textSecondary}
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.theme.colors.textSecondary },
                      ]}
                    >
                      Engagement Score
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: theme.theme.colors.text },
                      ]}
                    >
                      {trial.engagementScore}% ·{' '}
                      {trial.engagementScore >= 70
                        ? 'High'
                        : trial.engagementScore >= 40
                          ? 'Medium'
                          : 'Low'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Icon
                    name="target"
                    size={16}
                    color={theme.theme.colors.textSecondary}
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.theme.colors.textSecondary },
                      ]}
                    >
                      Conversion Likelihood
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: theme.theme.colors.text },
                      ]}
                    >
                      {trial.conversionLikelihood}%
                    </Text>
                  </View>
                </View>

                {trial.churnRiskScore >= 40 && (
                  <View style={styles.detailItem}>
                    <Icon
                      name="alert-octagon"
                      size={16}
                      color="#FF9800"
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: theme.theme.colors.textSecondary },
                        ]}
                      >
                        Churn Risk
                      </Text>
                      <Text style={[styles.detailValue, { color: '#FF9800' }]}>
                        {trial.churnRiskScore}% Risk
                      </Text>
                    </View>
                  </View>
                )}

                {trial.promoCode && (
                  <View style={[styles.detailItem, styles.promoHighlight]}>
                    <Icon name="tag" size={16} color="#FF9800" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: theme.theme.colors.textSecondary },
                        ]}
                      >
                        Promo Code Available
                      </Text>
                      <Text style={[styles.detailValue, { color: '#FF9800' }]}>
                        {trial.promoCode} - {trial.promoDescription}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.detailsModalActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.extendButton]}
                  onPress={() => handleAction(trial, 'extend')}
                >
                  <Icon name="clock-plus" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Extend</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.convertButton]}
                  onPress={() => handleAction(trial, 'convert')}
                >
                  <Icon name="credit-card" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Convert</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => handleAction(trial, 'cancel')}
                >
                  <Icon name="close" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>

              {/* Snooze Options */}
              <View style={styles.snoozeOptions}>
                <Text
                  style={[
                    styles.snoozeTitle,
                    { color: theme.theme.colors.textSecondary },
                  ]}
                >
                  Snooze Reminder
                </Text>
                <View style={styles.snoozeButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.snoozeButton,
                      { borderColor: theme.theme.colors.textSecondary },
                    ]}
                    onPress={() => {
                      handleSnooze(trial, 1);
                      setShowDetailsModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.snoozeButtonText,
                        { color: theme.theme.colors.text },
                      ]}
                    >
                      1h
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.snoozeButton,
                      { borderColor: theme.theme.colors.textSecondary },
                    ]}
                    onPress={() => {
                      handleSnooze(trial, 24);
                      setShowDetailsModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.snoozeButtonText,
                        { color: theme.theme.colors.text },
                      ]}
                    >
                      1d
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.snoozeButton,
                      { borderColor: theme.theme.colors.textSecondary },
                    ]}
                    onPress={() => {
                      handleSnooze(trial, 72);
                      setShowDetailsModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.snoozeButtonText,
                        { color: theme.theme.colors.text },
                      ]}
                    >
                      3d
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      );
    };

    // Inline reminders view
    if (showInlineReminders) {
      const displayReminders = activeReminders.slice(0, maxRemindersToShow);

      if (displayReminders.length === 0) {
        return null;
      }

      return (
        <View style={styles.inlineContainer}>
          <FlatList
            data={displayReminders}
            renderItem={renderReminderItem}
            keyExtractor={(item) => item.trial.id}
            scrollEnabled={false}
          />
          {activeReminders.length > maxRemindersToShow && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => {
                if (onDismiss) onDismiss();
              }}
            >
              <Text style={styles.viewAllText}>
                View all {activeReminders.length} reminders
              </Text>
              <Icon name="chevron-right" size={16} color="#2196F3" />
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // Modal reminders view
    return (
      <>
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={onDismiss}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.theme.colors.card },
              ]}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <Icon
                    name="bell-alert"
                    size={24}
                    color="#FF9800"
                    style={{ marginRight: 12 }}
                  />
                  <View>
                    <Text
                      style={[
                        styles.modalHeaderTitle,
                        { color: theme.theme.colors.text },
                      ]}
                    >
                      Trial Reminders
                    </Text>
                    <Text
                      style={[
                        styles.modalHeaderSubtitle,
                        { color: theme.theme.colors.textSecondary },
                      ]}
                    >
                      {activeReminders.length} action{activeReminders.length !== 1 ? 's' : ''}{' '}
                      needed
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                  <Icon
                    name="close"
                    size={20}
                    color={theme.theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Reminders List */}
              {activeReminders.length > 0 ? (
                <FlatList
                  data={activeReminders}
                  renderItem={renderReminderItem}
                  keyExtractor={(item) => item.trial.id}
                  scrollEnabled={true}
                  style={styles.remindersList}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Icon
                    name="check-circle"
                    size={48}
                    color={theme.theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.emptyStateText,
                      { color: theme.theme.colors.text },
                    ]}
                  >
                    No trial reminders
                  </Text>
                  <Text
                    style={[
                      styles.emptyStateSubtext,
                      { color: theme.theme.colors.textSecondary },
                    ]}
                  >
                    All your trials are in good standing
                  </Text>
                </View>
              )}

              {/* Footer */}
              <TouchableOpacity
                style={[
                  styles.dismissButton,
                  { backgroundColor: theme.theme.colors.primary },
                ]}
                onPress={onDismiss}
              >
                <Text style={styles.dismissButtonText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Details Modal */}
        {renderDetailsModal()}
      </>
    );
  }
);

TrialReminder.displayName = 'TrialReminder';

const styles = StyleSheet.create({
  // Modal Overlay Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  modalHeaderSubtitle: {
    fontSize: 12,
  },
  closeButton: {
    padding: 8,
  },

  // Reminders List
  remindersList: {
    maxHeight: 400,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  reminderItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  priorityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderItemContent: {
    flex: 1,
  },
  reminderItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  reminderItemMessage: {
    fontSize: 12,
  },
  reminderItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    marginTop: 4,
  },

  // Dismiss Button
  dismissButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Details Modal
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  detailsModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  detailsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailsModalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  detailsModalSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailsModalCloseButton: {
    marginLeft: 'auto',
    padding: 8,
  },

  // Details Body
  detailsModalBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  promoHighlight: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: -16,
  },

  // Action Buttons
  detailsModalActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  extendButton: {
    backgroundColor: '#4CAF50',
  },
  convertButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Snooze Options
  snoozeOptions: {
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 12,
  },
  snoozeTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  snoozeButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  snoozeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  snoozeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Inline Reminders
  inlineContainer: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    marginRight: 4,
  },
});

export default TrialReminder;
