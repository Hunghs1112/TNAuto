import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import ServiceOrderCard from '../../../components/ServiceOrderCard';
import { Colors } from '../../../constants/colors';
import { PerformanceConfig } from '../../../config/performance';
import { styles } from '../styles';

interface Order {
  id: number | string;
  service_id?: number;
  service_name?: string;
  service_image_url?: string | null;
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

type OrderStatus =
  | 'received'
  | 'in_progress'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled'
  | 'canceled'
  | 'all';

const STATUS_OPTIONS: Array<{ label: string; value: OrderStatus; icon: string }> = [
  { label: 'Tất cả', value: 'all', icon: 'list-outline' },
  { label: 'Đang xử lý', value: 'in_progress', icon: 'construct-outline' },
  { label: 'Chờ bàn giao', value: 'ready_for_pickup', icon: 'car-outline' },
  { label: 'Hoàn thành', value: 'completed', icon: 'checkmark-done-circle-outline' },
  { label: 'Đã hủy', value: 'cancelled', icon: 'close-circle-outline' },
];

const EmployeeOrdersList = ({
  orders,
  isLoading,
  services,
  onOrderPress,
  emptyMessage = 'Chưa có đơn giao nào',
}: EmployeeOrdersListProps) => {
  const [selectedStatus, setSelectedStatus] = useState('all' as OrderStatus);

  const filteredOrders = useMemo(() => {
    if (selectedStatus === 'all') {
      return orders;
    }

    return orders.filter((order) => order.status === selectedStatus);
  }, [orders, selectedStatus]);

  const getServiceName = useCallback(
    (item: Order) => {
      if (item.service_name) {
        return item.service_name;
      }

      if (item.service_id && services) {
        const service = services.find((entry) => entry.id === Number(item.service_id));
        if (service) {
          return service.name;
        }
      }

      return 'Dịch vụ không xác định';
    },
    [services],
  );

  const getServiceImageUrl = useCallback(
    (item: Order) => {
      if (item.service_image_url) {
        return item.service_image_url;
      }

      if (item.service_id && services) {
        const service = services.find((entry) => entry.id === Number(item.service_id));
        return service?.image_url || null;
      }

      return null;
    },
    [services],
  );

  const renderOrderItem = useCallback(
    ({ item }: { item: Order }) => (
      <ServiceOrderCard
        serviceName={getServiceName(item)}
        secondaryName={`Khách hàng: ${item.customer_name || 'Không xác định'}`}
        receiveDate={item.receive_date}
        scheduleDate={item.delivery_date || 'Chưa xác định'}
        status={item.status}
        serviceImageUrl={getServiceImageUrl(item)}
        onPress={() => onOrderPress(item.id.toString())}
      />
    ),
    [getServiceImageUrl, getServiceName, onOrderPress],
  );

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
      <View style={styles.statusFilterContainer}>
        <FlatList
          alwaysBounceVertical={true}
          data={STATUS_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.statusFilterButton,
                selectedStatus === item.value && styles.statusFilterButtonActive,
              ]}
              onPress={() => setSelectedStatus(item.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon as any}
                size={16}
                color={
                  selectedStatus === item.value
                    ? Colors.background.light
                    : Colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.statusFilterText,
                  selectedStatus === item.value && styles.statusFilterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={[styles.statusFilterContent, { flexGrow: 1 }]}
        />
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={48} color={Colors.text.secondary} />
          <Text style={styles.emptyText}>
            {selectedStatus === 'all'
              ? emptyMessage
              : `Không có đơn ở trạng thái "${STATUS_OPTIONS.find((entry) => entry.value === selectedStatus)?.label}"`}
          </Text>
        </View>
      ) : (
        <FlatList
          alwaysBounceVertical={true}
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          nestedScrollEnabled={false}
          style={styles.servicesContainer}
          contentContainerStyle={{ flexGrow: 1 }}
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
