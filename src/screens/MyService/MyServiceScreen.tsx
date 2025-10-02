// src/screens/MyService/MyServiceScreen.tsx
import React, { useState } from "react";
import { View, Text, StatusBar, ActivityIndicator, FlatList, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import Header from "../../components/Header/Header";
import { styles } from "./styles";
import SectionHeader from "../Home/SectionHeader";
import Frame12 from "../Home/Frame12";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { RootState } from "../../redux/types";
import { useGetCustomerOrdersQuery } from "../../services/customerApi";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const MyServiceScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh();
  const userPhone = useAppSelector((state: RootState) => state.auth.userPhone || '');
  const services = useAppSelector((state: RootState) => state.services.services);
  const [selectedStatus, setSelectedStatus] = useState('all');

  console.log('MyServiceScreen debug - userPhone:', userPhone);

  const { data: ordersResponse, isLoading, error } = useGetCustomerOrdersQuery(userPhone, {
    skip: !userPhone,
  });

  console.log('MyServiceScreen debug - ordersResponse:', ordersResponse);
  console.log('MyServiceScreen debug - isLoading:', isLoading);
  console.log('MyServiceScreen debug - error:', error);

  const orders = ordersResponse?.data || [];

  // Sort orders by receive_date ascending
  const sortedOrders = [...orders].sort((a, b) => new Date(a.receive_date).getTime() - new Date(b.receive_date).getTime());

  // Filter orders based on selected status
  const filteredOrders = selectedStatus === 'all' 
    ? sortedOrders 
    : sortedOrders.filter(order => order.status === selectedStatus);

  const statusFilters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'received', label: 'Đã đặt lịch' },
    { key: 'ready_for_pickup', label: 'Chờ xác nhận' },
    { key: 'in_progress', label: 'Đang xử lý' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'canceled', label: 'Đã hủy' },
  ];

  const getSectionTitle = () => {
    const filter = statusFilters.find(f => f.key === selectedStatus);
    return filter ? `${filter.label} dịch vụ` : 'Tất cả dịch vụ';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Dịch vụ của tôi" />
        </View>
        <View style={[styles.whiteSection, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !ordersResponse?.success) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Dịch vụ của tôi" />
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <Text>Lỗi tải dịch vụ</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  console.log('MyServiceScreen debug - sortedOrders:', sortedOrders);
  console.log('MyServiceScreen debug - filteredOrders:', filteredOrders);
  console.log('MyServiceScreen debug - selectedStatus:', selectedStatus);

  if (sortedOrders.length === 0) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Dịch vụ của tôi" />
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color={Colors.text.secondary} />
              <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
      
      <View style={styles.redSection}>
        <Header title="Dịch vụ của tôi" />
      </View>
      
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
                  onPress={() => {
                    console.log('MyServiceScreen: Filter by status', filter.key);
                    setSelectedStatus(filter.key);
                  }}
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
            <SectionHeader title={getSectionTitle()} />
            <FlatList
              data={filteredOrders}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                console.log('MyServiceScreen debug - mapping order:', item);
                console.log('MyServiceScreen debug - service_id (raw):', item.service_id, 'type:', typeof item.service_id);
                const serviceName = services?.find((s: { id: number; name: string; }) => s.id === Number(item.service_id))?.name || 'Dịch vụ không xác định';
                const secondaryName = `Nhân viên: ${item.employee_name || 'Chưa giao'}`;
                return (
                  <Frame12
                    serviceName={serviceName}
                    secondaryName={secondaryName}
                    receiveDate={item.receive_date}
                    scheduleDate={item.delivery_date || 'Chưa xác định'}
                    status={item.status}
                    onPress={() => {
                      console.log('MyServiceScreen: Navigate to OrderDetail', item.id);
                      navigation.navigate('OrderDetail', { id: item.id.toString() });
                    }}
                  />
                );
              }}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              showsVerticalScrollIndicator={false}
              style={styles.servicesContainer}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MyServiceScreen;