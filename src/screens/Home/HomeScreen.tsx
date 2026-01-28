// src/screens/Home/HomeScreen.tsx (Optimized)
import React, { useEffect, useMemo, useCallback } from 'react';
import { View, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Screen } from '../../components/layout';
import { Colors } from '../../constants/colors';
import { PerformanceConfig } from '../../config/performance';
import Navbar from '../../components/Navbar';
import { styles } from './styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../design-system/spacing';
import UserHeader from './UserHeader';
import VehicleInfoCard from './VehicleInfoCard';
import ServiceMenu from './ServiceMenu';
import SectionHeader from './SectionHeader';
import QuickBookingForm from './QuickBookingForm';
import OrdersList from './components/OrdersList';
import EmployeeOrdersList from './components/EmployeeOrdersList';
import WarrantyInfo from './components/WarrantyInfo';
import ViewMoreButton from './ViewMoreButton';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { 
  selectUserType, 
  selectUserName, 
  selectUserPhone, 
  selectUserId,
  selectCurrentEmployee,
  selectServicesList,
  selectUnreadCount
} from '../../redux/selectors';
import { RootState } from '../../redux/types';
import { useGetNotificationsQuery, useGetUnreadCountQuery } from '../../services/notificationApi';
import { setNotifications, setUnreadCount } from '../../redux/slices/notificationSlice';
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
  const { refreshing, onRefresh: baseOnRefresh } = useAutoRefresh();
  const insets = useSafeAreaInsets();
  
  // Tính padding bottom để tránh bị navbar che
  // Navbar: wrapper paddingTop (md) + container padding (sm*2) + centerButton height (64) + wrapper paddingBottom (insets.bottom) + wrapper paddingHorizontal (lg*2)
  // CenterButton có marginBottom -20 nên thực tế nhô lên, cần thêm padding để đảm bảo không bị che
  const navbarHeight = spacing.md + (spacing.sm * 2) + 64 + insets.bottom + spacing.lg + spacing.md;

  // Selectors - using memoized selectors for better performance
  const userType = useAppSelector(selectUserType);
  const userName = useAppSelector(selectUserName);
  const userPhone = useAppSelector(selectUserPhone);
  const userId = useAppSelector(selectUserId);
  const currentEmployee = useAppSelector(selectCurrentEmployee);
  const services = useAppSelector(selectServicesList);
  const unreadCount = useAppSelector(selectUnreadCount);

  // Use userId for employee if currentEmployee?.id is not available
  // This ensures we can fetch orders even if currentEmployee is not persisted
  const employeeId = currentEmployee?.id || (userType === 'employee' ? userId : undefined);

  // Custom hook for orders data
  const {
    sortedOrders,
    displayedOrders,
    ordersLoading,
    sortedAssignedOrders,
    assignedLoading,
    refetchOrders,
    refetchAssignedOrders,
    isFetchingOrders,
    isFetchingAssignedOrders,
  } = useOrdersData({
    userType,
    userPhone,
    currentEmployeeId: employeeId,
  });

  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isLoggedIn);

  // Fetch notifications and unread count only if logged in
  const { 
    data: notifications, 
    refetch: refetchNotifications,
    isFetching: isFetchingNotifications 
  } = useGetNotificationsQuery(
    { recipient_id: userId, recipient_type: userType },
    { skip: !userId || !isLoggedIn }
  );

  const { 
    data: apiUnreadCount, 
    refetch: refetchUnreadCount,
    isFetching: isFetchingUnreadCount 
  } = useGetUnreadCountQuery(
    { recipient_id: userId, recipient_type: userType },
    { skip: !userId || !isLoggedIn }
  );

  // Determine if any query is fetching
  const isAnyFetching = isFetchingOrders || isFetchingAssignedOrders || isFetchingNotifications || isFetchingUnreadCount;
  const actualRefreshing = refreshing || isAnyFetching;

  // Enhanced refresh handler that refetches all queries
  const handleRefresh = useCallback(async () => {
    baseOnRefresh();
    
    const refetchPromises: Promise<any>[] = [];
    
    if (refetchOrders) {
      refetchPromises.push(refetchOrders());
    }
    
    if (refetchAssignedOrders) {
      refetchPromises.push(refetchAssignedOrders());
    }
    
    if (refetchNotifications) {
      refetchPromises.push(refetchNotifications());
    }
    
    if (refetchUnreadCount) {
      refetchPromises.push(refetchUnreadCount());
    }
    
    try {
      await Promise.all(refetchPromises);
    } catch (error) {
      console.error('HomeScreen: Error during refetch:', error);
    }
  }, [baseOnRefresh, refetchOrders, refetchAssignedOrders, refetchNotifications, refetchUnreadCount]);

  // Sync notifications to Redux
  useEffect(() => {
    if (notifications) {
      dispatch(setNotifications(notifications));
    }
  }, [notifications, dispatch]);

  // Sync unread count to Redux
  useEffect(() => {
    if (apiUnreadCount !== undefined) {
      dispatch(setUnreadCount(apiUnreadCount));
    }
  }, [apiUnreadCount, dispatch]);

  // Navigation handlers
  const handleNotificationPress = useCallback(() => {
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
            userName={isLoggedIn ? userName : 'Khách'}
            notificationCount={isLoggedIn ? unreadCount : undefined}
            onNotificationPress={isLoggedIn ? handleNotificationPress : undefined}
            isLoggedIn={isLoggedIn}
          />
        ),
      },
    ];

    // Employee-specific sections
    if (isLoggedIn && userType === 'employee') {

      // Danh sách dịch vụ được giao với filter
      result.push({
        type: 'employeeOrders',
        component: (
          <View style={styles.section}>
            <SectionHeader title="Dịch vụ được giao xử lý" />
            <EmployeeOrdersList
              orders={sortedAssignedOrders as any}
              isLoading={assignedLoading}
              services={services}
              onOrderPress={handleOrderPress}
              emptyMessage="Chưa có đơn giao nào"
            />
          </View>
        ),
      });

      // Thông tin bảo hành
      result.push({
        type: 'warranty',
        component: (
          <View style={styles.section}>
            <SectionHeader title="Thông tin bảo hành" />
            <WarrantyInfo
              orders={sortedAssignedOrders as any}
              onWarrantyPress={(orderId) => {
                handleOrderPress(orderId);
              }}
            />
          </View>
        ),
      });
    } else {
      // Customer sections
      // ServiceMenu is always visible for customers
      result.push({
        type: 'serviceMenu',
        component: <ServiceMenu />,
      });

      // Only show customer-specific sections if logged in as customer
      if (isLoggedIn && userType === 'customer') {
        result.push({
          type: 'vehicle',
          component: <VehicleInfoCard userId={userId} userPhone={userPhone} />,
        });
      }

      // Only show orders if logged in
      if (isLoggedIn) {
        result.push({
          type: 'orders',
          component: (
            <View style={styles.section}>
              <SectionHeader title="Dịch vụ đang sử dụng" />
              <OrdersList
                orders={displayedOrders as any}
                isLoading={ordersLoading}
                services={services}
                userType={userType}
                onOrderPress={handleOrderPress}
                emptyMessage="Chưa có đơn hàng nào"
              />
              {sortedOrders.length > 2 && (
                <ViewMoreButton onPress={handleViewMore} title="Xem tất cả đơn hàng" />
              )}
            </View>
          ),
        });
      }
    }

    // Only show booking form if logged in as customer
    if (isLoggedIn && userType === 'customer') {
      result.push({
        type: 'booking',
        component: (
          <View style={styles.section}>
            <QuickBookingForm />
          </View>
        ),
      });
    } else if (!isLoggedIn) {
      // Show login prompt for non-logged-in users
      result.push({
        type: 'loginPrompt',
        component: (
          <View style={styles.section}>
            <View style={styles.loginPromptCard}>
              <Ionicons name="calendar-outline" size={48} color={Colors.primary} />
              <Text style={styles.loginPromptTitle}>Đăng nhập để đặt lịch dịch vụ</Text>
              <Text style={styles.loginPromptDescription}>
                Đăng nhập để đặt lịch dịch vụ, xem lịch sử đơn hàng và quản lý thông tin xe của bạn
              </Text>
              <TouchableOpacity 
                style={styles.loginPromptButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginPromptButtonText}>Đăng nhập / Đăng ký</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.background.light} />
              </TouchableOpacity>
            </View>
          </View>
        ),
      });
    }

    return result;
  }, [
    isLoggedIn,
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
    <Screen hideHeader statusBarStyle="light-content">
      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: navbarHeight }]}
        scrollIndicatorInsets={{ right: 1 }}
        refreshControl={<RefreshControl refreshing={actualRefreshing} onRefresh={handleRefresh} />}
        removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
        maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
        windowSize={PerformanceConfig.flatList.windowSize}
        initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
        updateCellsBatchingPeriod={PerformanceConfig.flatList.updateCellsBatchingPeriod}
      />
      <Navbar />
    </Screen>
  );
}
