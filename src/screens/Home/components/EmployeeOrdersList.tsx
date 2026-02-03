// src/screens/Home/components/EmployeeOrdersList.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typo';
import ServiceOrderCard from '../../../components/ServiceOrderCard';
import { PerformanceConfig } from '../../../config/performance';
import { styles } from '../styles';

interface Order {
  id: number | string;
  service_id?: number;
  service_name?: string;
  customer_name?: string | null;
  customer_phone?: string;
  receive_date: string;
  delivery_date?: string | null;
  status: string;
  license_plate?: string;
  vehicle_type?: string | null;
  warranty?: any;
}

interface EmployeeOrdersListProps {
  orders: Order[];
  isLoading: boolean;
  services: Array<{ id: number; name: string; image_url?: string | null }>;
  onOrderPress: (id: string) => void;
  emptyMessage?: string;
}

type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'all';

const STATUS_OPTIONS: Array<{ label: string; value: OrderStatus; icon: string }> = [
  { label: 'Tất cả', value: 'all', icon: 'list-outline' },
  { label: 'Chờ xác nhận', value: 'pending', icon: 'time-outline' },
  { label: 'Đã xác nhận', value: 'confirmed', icon: 'checkmark-circle-outline' },
  { label: 'Đang xử lý', value: 'in_progress', icon: 'construct-outline' },
  { label: 'Hoàn thành', value: 'completed', icon: 'checkmark-done-circle-outline' },
  { label: 'Đã hủy', value: 'cancelled', icon: 'close-circle-outline' },
];

const EmployeeOrdersList: React.FC<EmployeeOrdersListProps> = ({
  orders,
  isLoading,
  services,
  onOrderPress,
  emptyMessage = 'Chưa có đơn giao nào',
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    if (selectedStatus === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === selectedStatus);
  }, [orders, selectedStatus]);

  // Get service name
  const getServiceName = useCallback((item: Order) => {
    if (item.service_name) return item.service_name;
    if (item.service_id && services) {
      const service = services.find(s => s.id === Number(item.service_id));
      if (service) return service.name;
    }
    return 'Dịch vụ không xác định';
  }, [services]);

  const getServiceImageUrl = useCallback((item: Order) => {
    if (item.service_id && services) {
      const service = services.find(s => s.id === Number(item.service_id));
      return service?.image_url || null;
    }
    return null;
  }, [services]);

  const renderOrderItem = useCallback(({ item }: { item: Order }) => (
    <ServiceOrderCard
      serviceName={getServiceName(item)}
      secondaryName={`Khách hàng: ${item.customer_name || 'Không xác định'}`}
      receiveDate={item.receive_date}
      scheduleDate={item.delivery_date || 'Chưa xác định'}
      status={item.status}
      serviceImageUrl={getServiceImageUrl(item)}
      onPress={() => onOrderPress(item.id.toString())}
    />
  ), [getServiceName, getServiceImageUrl, onOrderPress]);

  const keyExtractor = useCallback((item: Order) => item.id.toString(), []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.text.primary} />
        <Text style={styles.loadingText}>Đang tải đơn giao...</Text>
      </View>
    );
  }

  return (
    <View style={styles.employeeOrdersContainer}>
      {/* Filter Buttons */}
      <View style={styles.statusFilterContainer}>
        <FlatList
          data={STATUS_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.statusFilterButton,
                selectedStatus === item.value && styles.statusFilterButtonActive
              ]}
              onPress={() => setSelectedStatus(item.value)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={item.icon as any} 
                size={16} 
                color={selectedStatus === item.value ? Colors.background.light : Colors.text.secondary} 
              />
              <Text style={[
                styles.statusFilterText,
                selectedStatus === item.value && styles.statusFilterTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.statusFilterContent}
        />
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={48} color={Colors.text.secondary} />
          <Text style={styles.emptyText}>
            {selectedStatus === 'all' ? emptyMessage : `Không có đơn ở trạng thái "${STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label}"`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={keyExtractor}
          renderItem={renderOrderItem}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          nestedScrollEnabled={false}
          style={styles.servicesContainer}
          initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
          maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
          windowSize={PerformanceConfig.flatList.windowSize}
          removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
          updateCellsBatchingPeriod={PerformanceConfig.flatList.updateCellsBatchingPeriod}
        />
      )}
    </View>
  );
};

export default React.memo(EmployeeOrdersList);


