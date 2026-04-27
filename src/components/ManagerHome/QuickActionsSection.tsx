import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { spacing } from '../../design-system/spacing';
import SectionHeader from '../../screens/Home/SectionHeader';

interface QuickActionsSectionProps {
  onManageOrdersPress: () => void;
  onOffersPress: () => void;
  onWarrantyPress: () => void;
  testID?: string;
}

/**
 * QuickActionsSection Component
 * 
 * Displays 3 quick action buttons for common manager tasks:
 * - Quản lý đơn (Manage Orders)
 * - Offers
 * - Warranty
 * 
 * Each button has an icon and text label with WCAG-compliant 44x44 minimum touch targets.
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.5**
 */
export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  onManageOrdersPress,
  onOffersPress,
  onWarrantyPress,
  testID = 'quick-actions-section',
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <SectionHeader title="Quick actions" />
      <View style={styles.actionsRow} testID={`${testID}-row`}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onManageOrdersPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Quản lý đơn"
          accessibilityHint="Điều hướng đến màn hình danh sách đơn hàng đầy đủ"
          testID={`${testID}-manage-orders`}
        >
          <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Quản lý đơn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onOffersPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Offers"
          accessibilityHint="Điều hướng đến màn hình quản lý ưu đãi"
          testID={`${testID}-offers`}
        >
          <Ionicons name="pricetag-outline" size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Offers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onWarrantyPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Warranty"
          accessibilityHint="Điều hướng đến màn hình quản lý bảo hành"
          testID={`${testID}-warranty`}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Warranty</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44, // WCAG minimum touch target
    minWidth: 44, // WCAG minimum touch target
  },
  actionText: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
});
