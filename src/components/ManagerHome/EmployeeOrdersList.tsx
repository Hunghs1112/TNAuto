import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { spacing } from '../../design-system/spacing';
import { textStyles } from '../../design-system/typography';
import { ServiceOrder } from '../../types/api.types';
import SectionHeader from '../../screens/Home/SectionHeader';
import { OrderCard } from './OrderCard';

interface EmployeeOrdersListProps {
  orders: ServiceOrder[];
  isLoading?: boolean;
  onOrderPress: (id: string | number) => void;
  testID?: string;
}

/**
 * EmployeeOrdersList Component
 * 
 * Displays a list of processing orders (being worked on by employees) for the Manager Home screen.
 * Shows up to 5 orders maximum with empty state when no orders are available.
 * Displays skeleton loaders during loading state.
 * 
 * **Validates: Requirements 2.1, 2.4, 2.7, 5.1**
 */
export const EmployeeOrdersList: React.FC<EmployeeOrdersListProps> = ({
  orders,
  isLoading = false,
  onOrderPress,
  testID = 'employee-orders-list',
}) => {
  // Limit to maximum 5 orders
  const displayOrders = orders.slice(0, 5);

  return (
    <View style={styles.container} testID={testID}>
      <SectionHeader title="Đơn đang xử lý" />
      
      {isLoading ? (
        <View style={styles.loadingContainer} testID={`${testID}-loading`}>
          {[1, 2, 3].map((index) => (
            <View key={index} style={styles.skeletonCard} testID={`skeleton-loader-${index}`}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ))}
        </View>
      ) : displayOrders.length === 0 ? (
        <View style={styles.emptyContainer} testID={`${testID}-empty`}>
          <Text style={styles.emptyText}>Chưa có đơn nào</Text>
        </View>
      ) : (
        <View style={styles.ordersList} testID={`${testID}-content`}>
          {displayOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={onOrderPress}
              showClaimButton={false}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  loadingContainer: {
    marginTop: spacing.sm,
  },
  skeletonCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    padding: spacing.lg,
    marginBottom: spacing.base,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...textStyles.bodyMedium,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.medium,
  },
  ordersList: {
    marginTop: spacing.sm,
  },
});
