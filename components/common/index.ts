// Export all common components
export { Alert } from './Alert';
export { Avatar } from './Avatar';
export { Badge } from './Badge';
export { BottomSheet } from './BottomSheet';
export { Button } from './Button';
export { Card, CardHeader, CardBody, CardFooter, CardTitle, CardSubtitle, CardDivider, CardImage, CardActions, CardStats } from './Card';
export { Checkbox } from './Checkbox';
export { Chip } from './Chip';
export { Divider } from './Divider';
export { Dropdown } from './Dropdown';
export { EmptyState } from './EmptyState';
export { Loading } from './Loading';
export { Modal } from './Modal';
export { ProgressBar } from './ProgressBar';
export { RadioButton } from './RadioButton';
export { SearchBar } from './SearchBar';
export { Slider } from './Slider';
export { SwipeableRow } from './SwipeableRow';
export { Switch } from './Switch';
export { TabBar } from './TabBar';
export { TextArea } from './TextArea';
export { Toast } from './Toast';

// Re-export Text from react-native for convenience
export { Text } from 'react-native';

// Create a simple Tooltip stub since it doesn't exist
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface TooltipProps {
  x?: number;
  y?: number;
  title?: string;
  value?: string;
  color?: string;
  onClose?: () => void;
}

export const Tooltip: React.FC<TooltipProps> = ({ x, y, title, value, color, onClose }) => {
  return (
    <View style={[styles.tooltip, { left: x, top: y }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
