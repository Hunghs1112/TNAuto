// src/components/Loading/EmptyView.tsx - Unified empty state component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';

interface EmptyViewProps {
  /**
   * Empty state message to display
   * @default "Không có dữ liệu"
   */
  message?: string;
  
  /**
   * Optional icon name from Ionicons
   * @default "document-outline"
   */
  icon?: string;
  
  /**
   * Optional secondary message
   */
  subtitle?: string;
}

/**
 * Centered empty state view
 * 
 * Usage:
 * ```tsx
 * if (data.length === 0) {
 *   return <EmptyView message="Chưa có đơn hàng nào" icon="cart-outline" />;
 * }
 * ```
 */
export default function EmptyView({ 
  message = 'Không có dữ liệu',
  icon = 'document-outline',
  subtitle
}: EmptyViewProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={Colors.text.secondary} />
      <Text style={styles.message}>{message}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.placeholder,
    textAlign: 'center',
    marginTop: 8,
  },
});

