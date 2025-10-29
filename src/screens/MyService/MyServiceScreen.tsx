// src/screens/MyService/MyServiceScreen.tsx
import React, { useState, useCallback, useMemo } from "react";
import { View, Text, StatusBar, ActivityIndicator, FlatList, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { PerformanceConfig } from "../../config/performance";
import Header from "../../components/Header";
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

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const MyServiceScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh();
  const userPhone = useAppSelector((state: RootState) => state.auth.userPhone || '');
  const services = useAppSelector((state: RootState) => state.services.services);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { data: ordersResponse, isLoading, error } = useGetCustomerOrdersQuery(userPhone, {
    skip: !userPhone,
  });

  const orders = ordersResponse?.data || [];

  // Memoized sorted orders
  const sortedOrders = useMemo(() => 
    [...orders].sort((a, b) => new Date(a.receive_date).getTime() - new Date(b.receive_date).getTime()),
    [orders]
  );

  // Memoized filtered orders
  const filteredOrders = useMemo(() => 
    selectedStatus === 'all' 
      ? sortedOrders 
      : sortedOrders.filter(order => order.status === selectedStatus),
    [sortedOrders, selectedStatus]
  );

  const statusFilters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'received', label: 'Đã đặt lịch' },
    { key: 'ready_for_pickup', label: 'Chờ xác nhận' },
    { key: 'in_progress', label: 'Đang xử lý' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
    { key: 'canceled', label: 'Đã hủy' },
  ];

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
    const serviceName = services?.find((s: { id: number }) => s.id === Number(item.service_id))?.name || 'Dịch vụ không xác định';
    const secondaryName = `Nhân viên: ${item.employee_name || 'Chưa giao'}`;
    return (
      <ServiceOrderCard
        serviceName={serviceName}
        secondaryName={secondaryName}
        receiveDate={item.receive_date}
        scheduleDate={item.delivery_date || 'Chưa xác định'}
        status={item.status}
        onPress={() => handleOrderPress(item.id)}
      />
    );
  }, [services, handleOrderPress]);

  const keyExtractor = useCallback((item: any) => item.id.toString(), []);

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
              <Text>Lỗi tải dịch vụ</Text>
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
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.gradients.primary[0]} />
        <Header title="Dịch vụ của tôi" />
        
      <View style={styles.whiteSection}>
        <View style={styles.body}>
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
              data={filteredOrders}
              keyExtractor={keyExtractor}
              renderItem={renderOrderItem}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              showsVerticalScrollIndicator={false}
              style={styles.servicesContainer}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
              maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
              windowSize={PerformanceConfig.flatList.windowSize}
              removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
              updateCellsBatchingPeriod={PerformanceConfig.flatList.updateCellsBatchingPeriod}
            />
          </View>
        </View>
      </View>
      </SafeAreaView>
    </View>
  );
};

export default React.memo(MyServiceScreen);