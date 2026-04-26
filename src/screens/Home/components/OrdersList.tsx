import React, { memo, useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';

import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../../constants/colors';
import { PerformanceConfig } from '../../../config/performance';
import ServiceOrderCard from '../../../components/ServiceOrderCard';
import { styles } from '../styles';
import { getServiceImageUrl, getServiceName, type OrderLike, type ServiceSummary } from './orderHelpers';

interface Order extends OrderLike {
  id: number | string;
  receive_date: string;
  delivery_date?: string | null;
  status: string;
  garage_name?: string | null;
  garage_code?: string | null;
}

interface OrdersListProps {
  orders: Order[];
  isLoading: boolean;
  services: ServiceSummary[];
  userType: 'customer' | 'employee';
  onOrderPress: (id: string) => void;
  emptyMessage?: string;
}

const ORDER_ITEM_SPACING = 10;

const OrdersList: React.FC<OrdersListProps> = memo(({ orders, isLoading, services, userType, onOrderPress, emptyMessage = 'Chưa có đơn hàng nào' }) => {
  const renderOrderItem = useCallback(
    ({ item }: { item: Order }) => (
      <ServiceOrderCard
        serviceName={getServiceName(item, services)}
        secondaryName={userType === 'customer' ? `Nhân viên: ${item.employee_name || 'Chưa giao'}` : `Khách hàng: ${item.customer_name || 'Không xác định'}`}
        receiveDate={item.receive_date}
        scheduleDate={item.delivery_date || 'Chưa xác định'}
        status={item.status}
        garageName={item.garage_name || item.garage_code || null}
        serviceImageUrl={getServiceImageUrl(item, services)}
        onPress={() => onOrderPress(item.id.toString())}
      />
    ),
    [onOrderPress, services, userType],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.text.primary} />
        <Text style={styles.loadingText}>{userType === 'customer' ? 'Đang tải đơn hàng...' : 'Đang tải đơn giao...'}</Text>
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
    <FlatList
      alwaysBounceVertical
      contentContainerStyle={{ flexGrow: 1 }}
      data={orders}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderOrderItem}
      ItemSeparatorComponent={() => <View style={{ height: ORDER_ITEM_SPACING }} />}
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
  );
});

OrdersList.displayName = 'OrdersList';

export default OrdersList;
