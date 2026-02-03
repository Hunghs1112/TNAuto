// src/screens/Home/components/CustomersList.tsx
import React, { useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typo';
import { PerformanceConfig } from '../../../config/performance';
import { styles } from '../styles';
import { OptimizedImage } from '../../../components/OptimizedImage';

interface Order {
  id: number | string;
  customer_id: number;
  customer_name?: string | null;
  customer_phone?: string;
  license_plate?: string;
  vehicle_type?: string | null;
  status: string;
  service_id?: number;
}

interface CustomersListProps {
  orders: Order[];
  services?: Array<{ id: number; name: string; image_url?: string | null }>;
  onCustomerPress?: (customerId: number, customerName: string) => void;
}

const CustomersList: React.FC<CustomersListProps> = ({ orders, services, onCustomerPress }) => {
  // Group orders by customer
  const customersMap = useMemo(() => {
    const map = new Map<
      number,
      {
        customer_id: number;
        customer_name: string;
        customer_phone?: string;
        orders: Order[];
        activeOrders: number;
        serviceImageUrl?: string | null;
      }
    >();

    orders.forEach((order) => {
      if (!order.customer_id) return;

      const imageUrl = order.service_id
        ? services?.find((s) => s.id === Number(order.service_id))?.image_url || null
        : null;

      const existing = map.get(order.customer_id);
      if (existing) {
        existing.orders.push(order);
        if (order.status !== 'completed' && order.status !== 'cancelled') {
          existing.activeOrders += 1;
        }
        if (!existing.serviceImageUrl && imageUrl) {
          existing.serviceImageUrl = imageUrl;
        }
      } else {
        map.set(order.customer_id, {
          customer_id: order.customer_id,
          customer_name: order.customer_name || 'Khách hàng không tên',
          customer_phone: order.customer_phone,
          orders: [order],
          activeOrders: order.status !== 'completed' && order.status !== 'cancelled' ? 1 : 0,
          serviceImageUrl: imageUrl,
        });
      }
    });

    return Array.from(map.values());
  }, [orders, services]);

  const renderCustomerItem = useCallback(
    ({ item }: { item: (typeof customersMap)[0] }) => (
      <TouchableOpacity
        style={styles.customerCard}
        onPress={() => onCustomerPress?.(item.customer_id, item.customer_name)}
        activeOpacity={0.7}
      >
        <View style={styles.customerCardHeader}>
          <View style={localStyles.serviceImageWrap}>
            {item.serviceImageUrl ? (
              <OptimizedImage
                source={{ uri: item.serviceImageUrl }}
                width={localStyles.serviceImageWrap.width as number}
                height={localStyles.serviceImageWrap.height as number}
                borderRadius={localStyles.serviceImageWrap.borderRadius as number}
              />
            ) : (
              <View style={styles.customerAvatar}>
                <Ionicons name="person" size={24} color={Colors.primary} />
              </View>
            )}
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.customer_name}</Text>
            {item.customer_phone && <Text style={styles.customerPhone}>{item.customer_phone}</Text>}
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
            <Text style={styles.customerStatText}>{new Set(item.orders.map((o) => o.license_plate)).size} xe</Text>
          </View>
          <View style={styles.customerStatItem}>
            <Ionicons name="document-text-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.customerStatText}>{item.orders.length} đơn</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [customersMap, onCustomerPress]
  );

  const keyExtractor = useCallback((item: (typeof customersMap)[0]) => item.customer_id.toString(), []);

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

const localStyles = StyleSheet.create({
  serviceImageWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(CustomersList);
