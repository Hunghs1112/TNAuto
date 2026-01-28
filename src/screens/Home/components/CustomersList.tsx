// src/screens/Home/components/CustomersList.tsx
import React, { useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typo';
import { PerformanceConfig } from '../../../config/performance';
import { styles } from '../styles';

interface Order {
  id: number | string;
  customer_id: number;
  customer_name?: string | null;
  customer_phone?: string;
  license_plate?: string;
  vehicle_type?: string | null;
  status: string;
}

interface CustomersListProps {
  orders: Order[];
  onCustomerPress?: (customerId: number, customerName: string) => void;
}

const CustomersList: React.FC<CustomersListProps> = ({
  orders,
  onCustomerPress,
}) => {
  // Group orders by customer
  const customersMap = useMemo(() => {
    const map = new Map<number, {
      customer_id: number;
      customer_name: string;
      customer_phone?: string;
      orders: Order[];
      activeOrders: number;
    }>();

    orders.forEach(order => {
      if (!order.customer_id) return;
      
      const existing = map.get(order.customer_id);
      if (existing) {
        existing.orders.push(order);
        if (order.status !== 'completed' && order.status !== 'cancelled') {
          existing.activeOrders += 1;
        }
      } else {
        map.set(order.customer_id, {
          customer_id: order.customer_id,
          customer_name: order.customer_name || 'Khách hàng không tên',
          customer_phone: order.customer_phone,
          orders: [order],
          activeOrders: (order.status !== 'completed' && order.status !== 'cancelled') ? 1 : 0,
        });
      }
    });

    return Array.from(map.values());
  }, [orders]);

  const renderCustomerItem = useCallback(({ item }: { item: typeof customersMap[0] }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => onCustomerPress?.(item.customer_id, item.customer_name)}
      activeOpacity={0.7}
    >
      <View style={styles.customerCardHeader}>
        <View style={styles.customerAvatar}>
          <Ionicons name="person" size={24} color={Colors.primary} />
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.customer_name}</Text>
          {item.customer_phone && (
            <Text style={styles.customerPhone}>{item.customer_phone}</Text>
          )}
        </View>
        {item.activeOrders > 0 && (
          <View style={styles.activeOrdersBadge}>
            <Text style={styles.activeOrdersBadgeText}>{item.activeOrders}</Text>
          </View>
        )}
      </View>
      <View style={styles.customerStats}>
        <View style={styles.customerStatItem}>
          <Ionicons name="car-outline" size={16} color={Colors.text.secondary} />
          <Text style={styles.customerStatText}>
            {new Set(item.orders.map(o => o.license_plate)).size} xe
          </Text>
        </View>
        <View style={styles.customerStatItem}>
          <Ionicons name="document-text-outline" size={16} color={Colors.text.secondary} />
          <Text style={styles.customerStatText}>
            {item.orders.length} đơn
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [onCustomerPress]);

  const keyExtractor = useCallback((item: typeof customersMap[0]) => item.customer_id.toString(), []);

  if (customersMap.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={48} color={Colors.text.secondary} />
        <Text style={styles.emptyText}>Chưa có khách hàng nào</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={customersMap}
      keyExtractor={keyExtractor}
      renderItem={renderCustomerItem}
      showsVerticalScrollIndicator={false}
      style={styles.customersContainer}
      contentContainerStyle={styles.customersContent}
      initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
      maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
      windowSize={PerformanceConfig.flatList.windowSize}
      removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
      scrollEnabled={false}
    />
  );
};

export default React.memo(CustomersList);

