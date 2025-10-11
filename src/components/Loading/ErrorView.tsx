// src/components/Loading/ErrorView.tsx - Unified error display component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';

interface ErrorViewProps {
  /**
   * Error message to display
   * @default "Đã xảy ra lỗi"
   */
  message?: string;
  
  /**
   * Callback function for retry button
   */
  onRetry?: () => void;
  
  /**
   * Optional icon name from Ionicons
   * @default "alert-circle-outline"
   */
  icon?: string;
}

/**
 * Centered error view with retry button
 * 
 * Usage:
 * ```tsx
 * if (error) {
 *   return <ErrorView message="Lỗi tải dữ liệu" onRetry={refetch} />;
 * }
 * ```
 */
export default function ErrorView({ 
  message = 'Đã xảy ra lỗi',
  onRetry,
  icon = 'alert-circle-outline'
}: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={Colors.status.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="reload-outline" size={20} color={Colors.background.light} />
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    paddingHorizontal: 40,
  },
  message: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.background.light,
  },
});

