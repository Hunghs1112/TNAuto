// src/screens/Customers/CustomersScreen.tsx
import React, { useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/layout';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useGetAssignedOrdersQuery } from '../../services/employeeApi';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { PerformanceConfig } from '../../config/performance';
import { styles } from './styles';
import { useAutoRefresh } from '../../redux/hooks/useAutoRefresh';
import { useRefreshQueries } from '../../hooks/useRefreshQueries';
import { RefreshControl } from 'react-native';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const CustomersScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const userId = useAppSelector((state) => state.auth.userId);
  const currentEmployee = useAppSelector((state) => state.employee.currentEmployee);
  
  const employeeId = currentEmployee?.id || userId;
  
  const { data: assignedResponse, isLoading, refetch, isFetching } = useGetAssignedOrdersQuery(
    { employee_id: employeeId || '' },
    { skip: !employeeId }
  );

  const { refreshing: autoRefreshing, onRefresh: baseOnRefresh } = useAutoRefresh({ tags: ['Customer', 'ServiceOrder'] });

  const { refreshing: queryRefreshing, onRefresh: queryOnRefresh } = useRefreshQueries([
    { refetch, isFetching },
  ]);

  // Group orders by customer
  const customersMap = useMemo(() => {
    const map = new Map<number, {
      customer_id: number;
      customer_name: string;
      customer_phone?: string;
      orders: any[];
      activeOrders: number;
      totalOrders: number;
    }>();

    const orders = assignedResponse?.success && assignedResponse.data 
      ? assignedResponse.data 
      : Array.isArray(assignedResponse) 
        ? assignedResponse 
        : [];

    orders.forEach((order: any) => {
      if (!order.customer_id) return;
      
      const existing = map.get(order.customer_id);
      if (existing) {
        existing.orders.push(order);
        existing.totalOrders += 1;
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
          totalOrders: 1,
        });
      }
    });

    return Array.from(map.values());
  }, [assignedResponse]);

  const handleCustomerPress = useCallback((customerId: number, customerName: string, customerPhone?: string) => {
    navigation.navigate('CustomerDetail', { 
      customerId,
      customerName,
      customerPhone: customerPhone || '',
    });
  }, [navigation]);

  const renderCustomerItem = useCallback(({ item }: { item: typeof customersMap[0] }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => handleCustomerPress(item.customer_id, item.customer_name, item.customer_phone)}
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
            {new Set(item.orders.map((o: any) => o.license_plate)).size} xe
          </Text>
        </View>
        <View style={styles.customerStatItem}>
          <Ionicons name="document-text-outline" size={16} color={Colors.text.secondary} />
          <Text style={styles.customerStatText}>
            {item.totalOrders} đơn
          </Text>
        </View>
        {item.activeOrders > 0 && (
          <View style={styles.customerStatItem}>
            <Ionicons name="time-outline" size={16} color={Colors.primary} />
            <Text style={[styles.customerStatText, styles.customerStatTextActive]}>
              {item.activeOrders} đang xử lý
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [handleCustomerPress]);

  const keyExtractor = useCallback((item: typeof customersMap[0]) => item.customer_id.toString(), []);

  const handleRefresh = useCallback(async () => {
    baseOnRefresh();
    await queryOnRefresh();
  }, [baseOnRefresh, queryOnRefresh]);

  if (isLoading && customersMap.length === 0) {
    return (
      <Screen
        headerTitle="Khách hàng"
        showBackButton={false}
        safeAreaTopColor={Colors.primary}
        statusBarStyle="light-content"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách khách hàng...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      headerTitle="Khách hàng"
      showBackButton={false}
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
    >
      <FlatList
        alwaysBounceVertical={true}
        data={customersMap}
        keyExtractor={keyExtractor}
        renderItem={renderCustomerItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
        refreshControl={
          <RefreshControl refreshing={autoRefreshing || queryRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={Colors.text.secondary} />
            <Text style={styles.emptyText}>Chưa có khách hàng nào</Text>
          </View>
        }
        initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
        maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
        windowSize={PerformanceConfig.flatList.windowSize}
        removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
      />
    </Screen>
  );
};

export default CustomersScreen;

