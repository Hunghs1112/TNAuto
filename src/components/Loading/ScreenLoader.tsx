// src/components/Loading/ScreenLoader.tsx - Unified screen loading component
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface ScreenLoaderProps {
  /**
   * Optional color for the activity indicator
   * @default Colors.text.primary
   */
  color?: string;
  
  /**
   * Optional size for the activity indicator
   * @default "large"
   */
  size?: 'small' | 'large';
}

/**
 * Centered screen loader for full-screen loading states
 * 
 * Usage:
 * ```tsx
 * if (isLoading) {
 *   return <ScreenLoader />;
 * }
 * ```
 */
export default function ScreenLoader({ 
  color = Colors.text.primary,
  size = 'large'
}: ScreenLoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
  },
});

