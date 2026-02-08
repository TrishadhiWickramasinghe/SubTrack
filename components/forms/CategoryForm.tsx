/**
 * DEPRECATED: This form component is no longer used.
 * Category management has been moved to individual screens.
 * 
 * These use native React Native components and hooks instead of react-hook-form.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const CategoryForm: React.FC = () => (
  <View style={styles.container}>
    <Text>This component is deprecated. Use category management screens instead.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default CategoryForm;