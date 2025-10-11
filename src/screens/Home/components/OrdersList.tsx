// src/screens/Home/components/OrdersList.tsx
import React, { memo, useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../constants/colors';
import ServiceOrderCard from '../../../components/ServiceOrderCard';
import { styles } from '../styles';

interface Order {
  id: number | string;
  service_id?: number;
  service_name?: string;
  employee_name?: string | null;
  customer_name?: string | null;
  receive_date: string;
  delivery_date?: string | null;
  status: string;
  license_plate?: string;
  vehicle_type?: string;
}

interface OrdersListProps {
  orders: Order[];
  isLoading: boolean;
  services: Array<{ id: number; name: string }>;
  userType: 'customer' | 'employee';
  onOrderPress: (id: string) => void;
  onViewMore?: () => void;
  showViewMore?: boolean;
  emptyMessage?: string;
}

const OrdersList: React.FC<OrdersListProps> = memo(({
  orders,
  isLoading,
  services,
  userType,
  onOrderPress,
  onViewMore,
  showViewMore = false,
  emptyMessage = 'Chưa có đơn hàng nào',
}) => {
  const getServiceName = useCallback((item: Order) => {
    if (item.service_name) return item.service_name;
    
    if (item.service_id && services) {
      const service = services.find(s => s.id === Number(item.service_id));
      if (service) return service.name;
    }
    
    return 'Dịch vụ không xác định';
  }, [services]);

  const getSecondaryName = useCallback((item: Order) => {
    if (userType === 'customer') {
      return `Nhân viên: ${item.employee_name || 'Chưa giao'}`;
    }
    return `Khách hàng: ${item.customer_name || 'Không xác định'}`;
  }, [userType]);

  const renderOrderItem = useCallback(({ item }: { item: Order }) => (
    <ServiceOrderCard
      serviceName={getServiceName(item)}
      secondaryName={getSecondaryName(item)}
      receiveDate={item.receive_date}
      scheduleDate={item.delivery_date || 'Chưa xác định'}
      status={item.status}
      onPress={() => onOrderPress(item.id.toString())}
    />
  ), [getServiceName, getSecondaryName, onOrderPress]);

  const keyExtractor = useCallback((item: Order) => item.id.toString(), []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.text.primary} />
        <Text style={styles.loadingText}>
          {userType === 'customer' ? 'Đang tải đơn hàng...' : 'Đang tải đơn giao...'}
        </Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-outline" size={48} color={Colors.text.secondary} />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={orders}
        keyExtractor={keyExtractor}
        renderItem={renderOrderItem}
        showsVerticalScrollIndicator={false}
        style={styles.servicesContainer}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
      {showViewMore && onViewMore && (
        <TouchableOpacity style={styles.viewMoreButton} onPress={onViewMore}>
          <Text style={styles.viewMoreText}>Xem thêm</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

OrdersList.displayName = 'OrdersList';

export default OrdersList;

