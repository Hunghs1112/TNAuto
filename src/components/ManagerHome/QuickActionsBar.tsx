import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';
import { spacing } from '../../design-system/spacing';
import { borderRadius } from '../../design-system/borders';
import { textStyles } from '../../design-system/typography';
import { QuickActionsBarProps } from '../../types/managerHome';

/**
 * QuickActionsBar Component
 *
 * Renders 3 quick-action buttons in a horizontal row:
 * - "Tạo đơn mới"     (create new order)
 * - "Thêm khách hàng" (add customer)
 * - "Xem tất cả đơn"  (view all orders)
 *
 * Each button meets the WCAG 2.5.5 minimum 44×44 px touch target requirement.
 *
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
 */
const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onCreateOrder,
  onAddCustomer,
  onViewAllOrders,
}) => {
  return (
    <View style={styles.container} testID="quick-actions-bar">
      {/* Tạo đơn mới */}
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onCreateOrder}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Tạo đơn mới"
        accessibilityHint="Tạo một đơn dịch vụ mới"
        testID="quick-actions-bar-create-order"
      >
        <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
        <Text style={styles.buttonText}>Tạo đơn mới</Text>
      </Pressable>

      {/* Thêm khách hàng */}
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onAddCustomer}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Thêm khách hàng"
        accessibilityHint="Thêm một khách hàng mới"
        testID="quick-actions-bar-add-customer"
      >
        <Ionicons name="person-add-outline" size={22} color={Colors.primary} />
        <Text style={styles.buttonText}>Thêm khách hàng</Text>
      </Pressable>

      {/* Xem tất cả đơn */}
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onViewAllOrders}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Xem tất cả đơn"
        accessibilityHint="Xem danh sách tất cả đơn hàng"
        testID="quick-actions-bar-view-all-orders"
      >
        <Ionicons name="receipt-outline" size={22} color={Colors.primary} />
        <Text style={styles.buttonText}>Xem tất cả đơn</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: borderRadius.lg,
    backgroundColor: Colors.background.light,
    // WCAG 2.5.5: minimum 44px touch target
    minHeight: 44,
    minWidth: 44,
  },
  buttonPressed: {
    backgroundColor: Colors.interactive.pressed,
  },
  buttonText: {
    ...textStyles.caption,
    color: Colors.text.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default React.memo(QuickActionsBar);
export { QuickActionsBar };
