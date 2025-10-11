// src/screens/Home/HomeScreen.tsx (Optimized)
import React, { useEffect, useMemo, useCallback } from 'react';
import { View, StatusBar, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import Navbar from '../../components/Navbar';
import { styles } from './styles';
import UserHeader from './UserHeader';
import VehicleInfoCard from './VehicleInfoCard';
import ServiceMenu from './ServiceMenu';
import SectionHeader from './SectionHeader';
import QuickBookingForm from './QuickBookingForm';
import OrdersList from './components/OrdersList';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { RootState } from '../../redux/types';
import { useGetNotificationsQuery } from '../../services/notificationApi';
import { setNotifications } from '../../redux/slices/notificationSlice';
import { useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '../../redux/hooks/useAppDispatch';
import { useAutoRefresh } from '../../redux/hooks/useAutoRefresh';
import { useOrdersData } from './hooks/useOrdersData';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh();

  // Selectors
  const userType = useAppSelector((state: RootState) => state.auth.userType || 'customer');
  const userName = useAppSelector((state: RootState) => state.auth.userName || 'User');
  const userPhone = useAppSelector((state: RootState) => state.auth.userPhone || '');
  const userId = useAppSelector((state: RootState) => state.auth.userId || '');
  const currentEmployee = useAppSelector((state: RootState) => state.employee.currentEmployee);
  const services = useAppSelector((state: RootState) => state.services.services);
  const unreadCount = useAppSelector((state: RootState) => state.notification.unreadCount);

  // Custom hook for orders data
  const {
    sortedOrders,
    displayedOrders,
    ordersLoading,
    sortedAssignedOrders,
    assignedLoading,
  } = useOrdersData({
    userType,
    userPhone,
    currentEmployeeId: currentEmployee?.id,
  });

  // Fetch notifications
  const { data: notifications } = useGetNotificationsQuery(
    { recipient_id: userId, recipient_type: userType },
    { skip: !userId }
  );

  // Sync notifications to Redux
  useEffect(() => {
    if (notifications) {
      dispatch(setNotifications(notifications));
    }
  }, [notifications, dispatch]);

  // Navigation handlers
  const handleNotificationPress = useCallback(() => {
    console.log('HomeScreen: Navigating to Notification screen');
    navigation.navigate('Notification');
  }, [navigation]);

  const handleOrderPress = useCallback((id: string) => {
    if (userType === 'customer') {
      navigation.navigate('OrderDetail', { id });
    } else {
      navigation.navigate('EmployeeOrderDetail', { id });
    }
  }, [navigation, userType]);

  const handleViewMore = useCallback(() => {
    navigation.navigate('MyService');
  }, [navigation]);

  // Memoized sections
  const sections = useMemo(() => {
    const result: Array<{ type: string; component: React.ReactNode }> = [
      {
        type: 'header',
        component: (
          <UserHeader
            userName={userName}
            notificationCount={unreadCount}
            onNotificationPress={handleNotificationPress}
          />
        ),
      },
    ];

    if (userType === 'customer') {
      result.push({
        type: 'vehicle',
        component: <VehicleInfoCard userId={userId} userPhone={userPhone} />,
      });
      result.push({
        type: 'serviceMenu',
        component: <ServiceMenu />,
      });
    }

    result.push({
      type: 'orders',
      component: (
        <View style={styles.section}>
          <SectionHeader 
            title={userType === 'customer' ? 'Dịch vụ đang sử dụng' : 'Dịch vụ được giao xử lí'} 
          />
          <OrdersList
            orders={userType === 'customer' ? displayedOrders as any : sortedAssignedOrders as any}
            isLoading={userType === 'customer' ? ordersLoading : assignedLoading}
            services={services}
            userType={userType}
            onOrderPress={handleOrderPress}
            onViewMore={userType === 'customer' ? handleViewMore : undefined}
            showViewMore={userType === 'customer' && sortedOrders.length > 2}
            emptyMessage={userType === 'customer' ? 'Chưa có đơn hàng nào' : 'Chưa có đơn giao nào'}
          />
        </View>
      ),
    });

    if (userType === 'customer') {
      result.push({
        type: 'booking',
        component: (
          <View style={styles.section}>
            <QuickBookingForm />
          </View>
        ),
      });
    }

    return result;
  }, [
    userName,
    unreadCount,
    handleNotificationPress,
    userType,
    userId,
    userPhone,
    services,
    displayedOrders,
    sortedAssignedOrders,
    ordersLoading,
    assignedLoading,
    handleOrderPress,
    handleViewMore,
    sortedOrders.length,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: { type: string; component: React.ReactNode } }) => (
      <View>{item.component}</View>
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: { type: string }, index: number) => `${item.type}-${index}`,
    []
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />

      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        scrollIndicatorInsets={{ right: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
      />

      <Navbar />
    </SafeAreaView>
  );
}
