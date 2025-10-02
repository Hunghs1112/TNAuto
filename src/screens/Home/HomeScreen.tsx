// src/screens/Home/HomeScreen.tsx
import React, { useEffect } from "react";
import { View, StatusBar, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from "../../constants/colors";
import Navbar from "../../components/Navbar/Navbar";
import { styles } from "./styles";
import UserHeader from "./UserHeader";
import VehicleInfoCard from "./VehicleInfoCard";
import ServiceMenu from "./ServiceMenu";
import SectionHeader from "./SectionHeader";
import Frame12 from "./Frame12";
import QuickBookingForm from "./QuickBookingForm";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { RootState } from "../../redux/types";
import { FlatList } from "react-native";
import { useGetCustomerOrdersQuery } from "../../services/customerApi";
import { useGetAssignedOrdersQuery } from "../../services/employeeApi";
import { useGetNotificationsQuery } from "../../services/notificationApi";
import { setNotifications } from "../../redux/slices/notificationSlice";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh();
  const userType = useAppSelector((state: RootState) => state.auth.userType || 'customer');
  const userName = useAppSelector((state: RootState) => state.auth.userName || 'User');
  const userPhone = useAppSelector((state: RootState) => state.auth.userPhone || '');
  const userId = useAppSelector((state: RootState) => state.auth.userId || ''); // Add userId selector
  const currentEmployee = useAppSelector((state: RootState) => state.employee.currentEmployee);
  const services = useAppSelector((state: RootState) => state.services.services);
  const unreadCount = useAppSelector((state: RootState) => state.notification.unreadCount);
  const recipientId = userId; // Use unified userId for notifications
  const recipientType = userType;

  console.log('HomeScreen debug - userType:', userType, 'userPhone:', userPhone, 'userId:', userId, 'currentEmployee:', currentEmployee);
  console.log('HomeScreen debug - services:', services);
  console.log('HomeScreen debug - unreadCount:', unreadCount, 'recipientId:', recipientId, 'recipientType:', recipientType);

  const { data: ordersResponse, isLoading: ordersLoading, error: ordersError } = useGetCustomerOrdersQuery(userPhone, {
    skip: userType !== 'customer' || !userPhone,
  });

  console.log('HomeScreen debug - ordersResponse:', ordersResponse);
  console.log('HomeScreen debug - ordersLoading:', ordersLoading);
  console.log('HomeScreen debug - ordersError:', ordersError);

  const orders = ordersResponse?.data || [];

  console.log('HomeScreen debug - orders:', orders);

  // Employee assigned orders
  const { data: assignedResponse, isLoading: assignedLoading, error: assignedError } = useGetAssignedOrdersQuery(
    { employee_id: currentEmployee?.id || '' },
    { skip: userType !== 'employee' || !currentEmployee }
  );

  console.log('HomeScreen debug - assignedResponse:', assignedResponse);
  console.log('HomeScreen debug - assignedLoading:', assignedLoading);
  console.log('HomeScreen debug - assignedError:', assignedError);

  const assignedOrders = assignedResponse?.data || [];

  console.log('HomeScreen debug - assignedOrders:', assignedOrders);

  // Fetch notifications for sync unreadCount (handles both customer and employee)
  const { data: notifications, isFetching: notificationsLoading } = useGetNotificationsQuery(
    { recipient_id: recipientId, recipient_type: recipientType },
    { skip: !recipientId }
  );

  console.log('HomeScreen debug - notifications query:', { notifications, notificationsLoading, recipientId, recipientType });

  useEffect(() => {
    if (notifications) {
      dispatch(setNotifications(notifications));
      const calculatedUnread = notifications.filter(n => !n.read).length;
      console.log('HomeScreen: Synced notifications to slice for', userType, 'unreadCount:', calculatedUnread); // Debug for both types
    }
  }, [notifications, dispatch, userType]);

  // Derive vehicle info from first order if exists (customer only)
  const firstOrder = orders[0];
  const licensePlate = firstOrder?.license_plate || '12A2222';
  const vehicleType = firstOrder?.vehicle_type || 'Toyota Camry 2023';
  const isUnderRepair = orders.length > 0;

  console.log('HomeScreen debug - vehicle info:', { licensePlate, vehicleType, isUnderRepair });

  // Sort orders by receive_date ascending (customer)
  const sortedOrders = [...orders].sort((a, b) => new Date(a.receive_date).getTime() - new Date(b.receive_date).getTime());
  const displayedOrders = sortedOrders.slice(0, 2);

  // Sort assigned orders by receive_date ascending (employee) - full list
  const sortedAssignedOrders = [...assignedOrders].sort((a, b) => new Date(a.receive_date).getTime() - new Date(b.receive_date).getTime());

  console.log('HomeScreen debug - sortedAssignedOrders:', sortedAssignedOrders);

  const data = [
    { type: 'header', component: (
      <UserHeader 
        userName={userName} 
        notificationCount={unreadCount}
        onNotificationPress={() => {
          console.log('HomeScreen: Navigate to NotificationScreen for', userType);
          navigation.navigate('NotificationScreen');
        }}
      />
    ) },
    { type: 'vehicle', component: userType === 'customer' ? (
      <VehicleInfoCard 
        licensePlate={licensePlate} 
        vehicleType={vehicleType} 
        isUnderRepair={isUnderRepair} 
      />
    ) : null },
    { type: 'serviceMenu', component: userType === 'customer' ? <ServiceMenu /> : null },
    { type: 'services', component: userType === 'customer' ? (
      <View style={styles.section}>
        <SectionHeader title="Dịch vụ đang sử dụng" />
        {ordersLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.text.primary} />
            <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
          </View>
        ) : sortedOrders.length > 0 ? (
          <View>
            <FlatList
              data={displayedOrders}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                console.log('HomeScreen debug - mapping customer order:', item);
                console.log('HomeScreen debug - customer service_id (raw):', item.service_id, 'type:', typeof item.service_id);
                console.log('HomeScreen debug - customer service_id (parsed):', Number(item.service_id));
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
                      console.log('HomeScreen: Navigate to OrderDetail', item.id);
                      navigation.navigate('OrderDetail', { id: item.id.toString() });
                    }}
                  />
                );
              }}
              showsVerticalScrollIndicator={false}
              style={styles.servicesContainer}
            />
            {sortedOrders.length > 2 && (
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => navigation.navigate('MyService')}
              >
                <Text style={styles.viewMoreText}>Xem thêm</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color={Colors.text.secondary} />
            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          </View>
        )}
      </View>
    ) : (
      <View style={styles.section}>
        <SectionHeader title="Dịch vụ được giao xử lí" />
        {assignedLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.text.primary} />
            <Text style={styles.loadingText}>Đang tải đơn giao...</Text>
          </View>
        ) : sortedAssignedOrders.length > 0 ? (
          <View>
            <FlatList
              data={sortedAssignedOrders}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                console.log('HomeScreen debug - mapping assigned order:', item);
                console.log('HomeScreen debug - assigned service_name (direct):', item.service_name, 'service_id (fallback):', item.service_id);
                console.log('HomeScreen debug - assigned customer_name:', item.customer_name, 'currentEmployee:', currentEmployee);
                const serviceName = item.service_name || (services?.find((s: { id: number; name: string; }) => s.id === Number(item.service_id))?.name) || 'Dịch vụ không xác định';
                const secondaryName = `Khách hàng: ${item.customer_name || 'Không xác định'}`;
                return (
                  <Frame12
                    serviceName={serviceName}
                    secondaryName={secondaryName}
                    receiveDate={item.receive_date}
                    scheduleDate={item.delivery_date || 'Chưa xác định'}
                    status={item.status}
                    onPress={() => {
                      console.log('HomeScreen: Navigate to EmployeeOrderDetail from assigned', item.id);
                      navigation.navigate('EmployeeOrderDetail', { id: item.id.toString() });
                    }}
                  />
                );
              }}
              showsVerticalScrollIndicator={false}
              style={styles.servicesContainer}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color={Colors.text.secondary} />
            <Text style={styles.emptyText}>Chưa có đơn giao nào</Text>
          </View>
        )}
      </View>
    ) },
    { type: 'booking', component: userType === 'customer' ? <View style={styles.section}><QuickBookingForm /></View> : null },
  ].filter(item => item.component !== null);

  const renderItem = ({ item }: { item: { type: string; component: React.ReactNode } }) => (
    <View>{item.component}</View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
      
      <FlatList 
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        scrollIndicatorInsets={{ right: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <Navbar />
    </SafeAreaView>
  );
}