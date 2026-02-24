// src/screens/Customers/CustomerDetailScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/layout';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useGetAssignedOrdersQuery } from '../../services/employeeApi';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import ServiceOrderCard from '../../components/ServiceOrderCard';
import { PerformanceConfig } from '../../config/performance';
import { styles } from './styles';
import { useAutoRefresh } from '../../redux/hooks/useAutoRefresh';
import { useRefreshQueries } from '../../hooks/useRefreshQueries';
import { RefreshControl } from 'react-native';

type CustomerDetailRouteProp = RouteProp<AppStackParamList, 'CustomerDetail'>;
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const CustomerDetailScreen: React.FC = () => {
  const route = useRoute<CustomerDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { refreshing: autoRefreshing, onRefresh: baseOnRefresh } = useAutoRefresh();
  const { customerId, customerName, customerPhone } = route.params;
  const userId = useAppSelector((state) => state.auth.userId);
  const currentEmployee = useAppSelector((state) => state.auth.currentEmployee);
  const services = useAppSelector((state) => state.services.services);
  
  const employeeId = currentEmployee?.id || userId;
  
  const { data: assignedResponse, isLoading, refetch, isFetching } = useGetAssignedOrdersQuery(
    { employee_id: employeeId || '' },
    { skip: !employeeId }
  );

  // Filter orders by customer_id
  const customerOrders = useMemo(() => {
    const orders = assignedResponse?.success && assignedResponse.data 
      ? assignedResponse.data 
      : Array.isArray(assignedResponse) 
        ? assignedResponse 
        : [];

    return orders.filter((order: any) => order.customer_id === customerId);
  }, [assignedResponse, customerId]);

  // Get customer info from first order
  const customerInfo = useMemo(() => {
    if (customerOrders.length === 0) return null;
    const firstOrder = customerOrders[0];
    return {
      name: customerName || firstOrder.customer_name || 'Khách hàng không tên',
      phone: customerPhone || firstOrder.customer_phone || '',
      totalOrders: customerOrders.length,
      activeOrders: customerOrders.filter((o: any) => 
        o.status !== 'completed' && o.status !== 'cancelled'
      ).length,
      vehicles: new Set(customerOrders.map((o: any) => o.license_plate)).size,
    };
  }, [customerOrders, customerName, customerPhone]);

  const getServiceName = (item: any) => {
    if (item.service_name) return item.service_name;
    if (item.service_id && services) {
      const service = services.find(s => s.id === Number(item.service_id));
      if (service) return service.name;
    }
    return 'Dịch vụ không xác định';
  };

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('EmployeeOrderDetail', { id: orderId });
  };

  const { refreshing: queryRefreshing, onRefresh: queryOnRefresh } = useRefreshQueries([
    { refetch, isFetching },
  ]);

  const handleRefresh = async () => {
    baseOnRefresh();
    await queryOnRefresh();
  };


  if (isLoading && customerOrders.length === 0) {
    return (
      <Screen
        headerTitle="Chi tiết khách hàng"
        showBackButton
        safeAreaTopColor={Colors.primary}
        statusBarStyle="light-content"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      headerTitle="Chi tiết khách hàng"
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
    >
      <View style={styles.customerDetailContainer}>
        {/* Customer Info Section */}
        {customerInfo && (
          <View style={styles.customerInfoSection}>
            <View style={styles.customerDetailHeader}>
              <View style={styles.customerDetailAvatar}>
                <Ionicons name="person" size={32} color={Colors.primary} />
              </View>
              <View style={styles.customerDetailInfo}>
                <Text style={styles.customerDetailName}>{customerInfo.name}</Text>
                {customerInfo.phone && (
                  <Text style={styles.customerDetailPhone}>{customerInfo.phone}</Text>
                )}
              </View>
            </View>
            <View style={styles.customerDetailMeta}>
              <View style={styles.customerDetailMetaRow}>
                <Ionicons name="document-text-outline" size={18} color={Colors.text.secondary} />
                <Text style={styles.customerDetailMetaText}>
                  Tổng đơn: {customerInfo.totalOrders}
                </Text>
              </View>
              <View style={styles.customerDetailMetaRow}>
                <Ionicons name="time-outline" size={18} color={Colors.primary} />
                <Text style={[styles.customerDetailMetaText, { color: Colors.primary }]}>
                  Đang xử lý: {customerInfo.activeOrders}
                </Text>
              </View>
              <View style={styles.customerDetailMetaRow}>
                <Ionicons name="car-outline" size={18} color={Colors.text.secondary} />
                <Text style={styles.customerDetailMetaText}>
                  Số xe: {customerInfo.vehicles}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Orders List */}
        <View style={styles.ordersSection}>
          <Text style={styles.ordersSectionTitle}>Danh sách đơn hàng</Text>
          {customerOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color={Colors.text.secondary} />
              <Text style={styles.emptyText}>Khách hàng chưa có đơn hàng nào</Text>
            </View>
          ) : (
            <FlatList
              alwaysBounceVertical={true}
              data={customerOrders}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ServiceOrderCard
                  serviceName={getServiceName(item)}
                  secondaryName={`Ngày nhận: ${new Date(item.receive_date).toLocaleDateString('vi-VN')}`}
                  receiveDate={item.receive_date}
                  scheduleDate={item.delivery_date || 'Chưa xác định'}
                  status={item.status}
                  onPress={() => handleOrderPress(item.id.toString())}
                />
              )}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={autoRefreshing || queryRefreshing} onRefresh={handleRefresh} />
              }
              contentContainerStyle={{ gap: 12, flexGrow: 1 }}
              initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
              maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
              windowSize={PerformanceConfig.flatList.windowSize}
              removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
            />
          )}
        </View>
      </View>
    </Screen>
  );
};

export default CustomerDetailScreen;


