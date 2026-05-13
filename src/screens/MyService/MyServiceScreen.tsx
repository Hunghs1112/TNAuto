// src/screens/MyService/MyServiceScreen.tsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, Text, StatusBar, ActivityIndicator, FlatList, ScrollView, TouchableOpacity, RefreshControl, SafeAreaView } from "react-native";
import { RootView } from "../../components/layout";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from "../../constants/colors";
import { PerformanceConfig } from "../../config/performance";
import Header from "../../components/Header";
import ErrorView from "../../components/Loading/ErrorView";
import { styles } from "./styles";
import SectionHeader from "../Home/SectionHeader";
import ServiceOrderCard from "../../components/ServiceOrderCard";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { RootState } from "../../redux/types";
import { useGetCustomerOrdersQuery } from "../../services/customerApi";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import { isManagerRole } from "../../navigation/rolePolicy";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const MyServiceScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh: baseOnRefresh } = useAutoRefresh({ tags: ['ServiceOrder'] });
  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isLoggedIn);
  const userType = useAppSelector((state: RootState) => state.auth.userType);
  const userPhone = useAppSelector((state: RootState) => state.auth.userPhone || '');
  const hasGarageContext = useAppSelector(
    (state: RootState) => Boolean(state.garageContext.garageCode && state.garageContext.resolved),
  );
  const services = useAppSelector((state: RootState) => state.services.services);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Redirect to Login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace('Login');
    }
  }, [isLoggedIn, navigation]);

  useEffect(() => {
    if (isManagerRole(userType) || userType === 'dealer') {
      navigation.replace('Category');
    }
  }, [userType, navigation]);

  useEffect(() => {
    if (isLoggedIn && userType === 'customer' && !hasGarageContext) {
      navigation.replace('SelectGarage');
    }
  }, [hasGarageContext, isLoggedIn, navigation, userType]);

  const { data: ordersResponse, isLoading, error, refetch, isFetching } = useGetCustomerOrdersQuery(userPhone, {
    skip: !userPhone || isManagerRole(userType) || userType === 'dealer' || !hasGarageContext,
  });

  const orders = useMemo(() => ordersResponse?.data ?? [], [ordersResponse?.data]);
  const statusFilters = useMemo(() => ([
    { key: 'all', label: 'Tất cả' },
    { key: 'received', label: 'Đã đặt lịch' },
    { key: 'ready_for_pickup', label: 'Chờ xác nhận' },
    { key: 'in_progress', label: 'Đang xử lý' },
    { key: 'completed', label: 'Hoàn thành' },
    // Merge cancelled + canceled thành 1 filter
    { key: 'cancelled', label: 'Đã hủy' },
  ]), []);

  const actualRefreshing = refreshing || isFetching;

  const handleRefresh = useCallback(async () => {
    baseOnRefresh();
    if (refetch) {
      try {
        await refetch();
      } catch (refetchError) {
        console.error('MyServiceScreen: Error during refetch:', refetchError);
      }
    }
  }, [baseOnRefresh, refetch]);

  // Sort descending — đơn mới nhất lên đầu
  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.receive_date).getTime() - new Date(a.receive_date).getTime()),
    [orders],
  );

  const filteredOrders = useMemo(
    () =>
      selectedStatus === 'all'
        ? sortedOrders
        : sortedOrders.filter(
            (order) =>
              order.status === selectedStatus ||
              // Merge cancelled + canceled vào cùng filter 'cancelled'
              (selectedStatus === 'cancelled' && order.status === 'canceled'),
          ),
    [selectedStatus, sortedOrders],
  );

  const sectionTitle = useMemo(() => {
    const filter = statusFilters.find(f => f.key === selectedStatus);
    return filter ? `${filter.label} dịch vụ` : 'Tất cả dịch vụ';
  }, [selectedStatus, statusFilters]);

  const handleStatusChange = useCallback((key: string) => {
    setSelectedStatus(key);
  }, []);

  const handleOrderPress = useCallback((orderId: number | string) => {
    navigation.navigate('OrderDetail', { id: orderId.toString() });
  }, [navigation]);

  const renderOrderItem = useCallback(({ item }: any) => {
    // Ưu tiên service_name từ order data, fallback vào redux store
    const serviceName =
      item.service_name ||
      services?.find((s: { id: number }) => s.id === Number(item.service_id))?.name ||
      'Dịch vụ không xác định';
    const secondaryName = `Nhân viên: ${item.employee_name || 'Chưa giao'}`;
    return (
      <ServiceOrderCard
        serviceName={serviceName}
        secondaryName={secondaryName}
        receiveDate={item.receive_date}
        scheduleDate={item.delivery_date || 'Chưa xác định'}
        status={item.status}
        garageName={item.garage_name || item.garage_code || null}
        onPress={() => handleOrderPress(item.id)}
      />
    );
  }, [services, handleOrderPress]);

  const keyExtractor = useCallback((item: any) => item.id.toString(), []);

  if (!isLoggedIn) return null;
  if (isManagerRole(userType) || userType === 'dealer') return null;
  if (userType === 'customer' && !hasGarageContext) return null;


  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.root}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
          <Header title="Dịch vụ của tôi" />
          <View style={[styles.whiteSection, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={Colors.text.primary} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error || !ordersResponse?.success) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.root}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
          <Header title="Dịch vụ của tôi" />
          <View style={styles.whiteSection}>
            <View style={styles.body}>
              <ErrorView 
                message="Lỗi tải dịch vụ"
                onRetry={refetch}
                icon="document-text-outline"
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (sortedOrders.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.root}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
          <Header title="Dịch vụ của tôi" />
          <View style={styles.whiteSection}>
            <View style={styles.body}>
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={48} color={Colors.text.secondary} />
                <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RootView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <Header title="Dịch vụ của tôi" />
        
      <View style={styles.whiteSection}>
        <View style={[styles.body, { paddingHorizontal: 16 }]}>
          {/* Status Filter Tabs */}
          <View style={styles.statusFilterContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.statusFilter}
              contentContainerStyle={styles.statusFilterContent}
            >
              {statusFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.statusTab,
                    selectedStatus === filter.key && styles.statusTabActive
                  ]}
                  onPress={() => handleStatusChange(filter.key)}
                >
                  <Text style={[
                    styles.statusTabText,
                    selectedStatus === filter.key && styles.statusTabTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.form}>
            <SectionHeader title={sectionTitle} />
            <FlatList
              alwaysBounceVertical={true}
              data={filteredOrders}
              keyExtractor={keyExtractor}
              renderItem={renderOrderItem}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              showsVerticalScrollIndicator={false}
              style={styles.servicesContainer}
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={<RefreshControl refreshing={actualRefreshing} onRefresh={handleRefresh} />}
              initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
              maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
              windowSize={PerformanceConfig.flatList.windowSize}
              removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
              updateCellsBatchingPeriod={PerformanceConfig.flatList.updateCellsBatchingPeriod}
            />
          </View>
        </View>
      </View>
      </RootView>
    </View>
  );
};

export default React.memo(MyServiceScreen);

