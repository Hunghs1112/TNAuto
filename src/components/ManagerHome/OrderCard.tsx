import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { spacing } from '../../design-system/spacing';
import { borderRadius } from '../../design-system/borders';
import { textStyles } from '../../design-system/typography';
import { ServiceOrder } from '../../types/api.types';

interface OrderCardProps {
  order: ServiceOrder;
  onPress: (id: string | number) => void;
  showClaimButton?: boolean;
  onClaim?: (id: string | number) => void;
  isClaiming?: boolean;
}

/**
 * OrderCard Component
 * 
 * Displays order information in a card format for the Manager Home screen.
 * Shows customer name, license plate, service name, and timestamp.
 * Supports optional claim button for available orders.
 * 
 * **Validates: Requirements 2.5, 2.6, 7.5**
 */
export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  showClaimButton = false,
  onClaim,
  isClaiming = false,
}) => {
  const handlePress = () => {
    onPress(order.id);
  };

  const handleClaim = (e: any) => {
    e.stopPropagation();
    if (onClaim && !isClaiming) {
      onClaim(order.id);
    }
  };

  // Format timestamp to readable format
  const formatTimestamp = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        return `${diffMins} phút trước`;
      }
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return `${diffHours} giờ trước`;
      }
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ngày trước`;
    } catch {
      return dateString;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Đơn hàng ${order.service_name || 'dịch vụ'} cho ${order.customer_name || 'khách hàng'}`}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      testID={`order-card-${order.id}`}
    >
      <View style={styles.content}>
        {/* Header with customer info */}
        <View style={styles.header}>
          <View style={styles.customerInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={40} color={Colors.primary} />
            </View>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName} numberOfLines={1}>
                {order.customer_name || order.receiver_name || 'Khách hàng'}
              </Text>
              <Text style={styles.licensePlate} numberOfLines={1}>
                {order.license_plate}
              </Text>
            </View>
          </View>
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
          </View>
        </View>

        {/* Service info */}
        <View style={styles.serviceSection}>
          <View style={styles.serviceIconContainer}>
            <Ionicons name="construct" size={16} color={Colors.primary} />
          </View>
          <Text style={styles.serviceName} numberOfLines={2}>
            {order.service_name || 'Dịch vụ'}
          </Text>
        </View>

        {/* Footer with timestamp and optional claim button */}
        <View style={styles.footer}>
          <View style={styles.timestampContainer}>
            <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.timestamp}>
              {formatTimestamp(order.created_at)}
            </Text>
          </View>
          
          {showClaimButton && onClaim && (
            <Pressable
              onPress={handleClaim}
              disabled={isClaiming}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Nhận đơn"
              style={({ pressed }) => [
                styles.claimButton,
                pressed && styles.claimButtonPressed,
                isClaiming && styles.claimButtonDisabled,
              ]}
              testID={`claim-button-${order.id}`}
            >
              {isClaiming ? (
                <ActivityIndicator size="small" color={Colors.background.light} />
              ) : (
                <Text style={styles.claimButtonText}>Nhận đơn</Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginBottom: spacing.base,
    shadowColor: Colors.shadow.default,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  content: {
    padding: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: spacing.sm,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    ...textStyles.bodyMedium,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    marginBottom: spacing.xs / 2,
  },
  licensePlate: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.medium,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  serviceIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  serviceName: {
    ...textStyles.bodySmall,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timestamp: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
    fontSize: 12,
  },
  claimButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 80,
    minHeight: 44, // WCAG minimum touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimButtonPressed: {
    opacity: 0.8,
  },
  claimButtonDisabled: {
    opacity: 0.6,
  },
  claimButtonText: {
    ...textStyles.bodySmall,
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
  },
});
