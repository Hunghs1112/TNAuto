// src/screens/Notification/NotificationScreen.tsx
import React, { useEffect, useCallback, useMemo } from "react";
import { View, FlatList, ActivityIndicator, Text, RefreshControl, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { RootState } from "../../redux/types";
import { PerformanceConfig } from "../../config/performance";
import { useGetNotificationsQuery, useGetUnreadCountQuery, useDeleteNotificationMutation, useMarkNotificationReadMutation } from "../../services/notificationApi";
import { setNotifications, deleteNotification as deleteNotificationAction, setUnreadCount } from "../../redux/slices/notificationSlice";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors } from "../../constants/colors";
import { Screen } from "../../components/layout";
import Item from "../../components/Item";
import ErrorView from "../../components/Loading/ErrorView";
import { styles } from "./styles";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const NotificationScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh: baseOnRefresh } = useAutoRefresh({ tags: ['Notification'] });
  const userType = useAppSelector((state: RootState) => state.auth.userType || 'customer');
  const userId = useAppSelector((state: RootState) => state.auth.userId || '');
  const recipientId = userId;
  const recipientType = userType;

  const { 
    data: notifications, 
    isLoading, 
    error, 
    refetch: refetchNotifications,
    isFetching: isFetchingNotifications 
  } = useGetNotificationsQuery(
    { recipient_id: recipientId, recipient_type: recipientType },
    { skip: !recipientId }
  );

  const { 
    data: unreadCount, 
    refetch: refetchUnreadCount,
    isFetching: isFetchingUnreadCount 
  } = useGetUnreadCountQuery(
    { recipient_id: recipientId, recipient_type: recipientType },
    { skip: !recipientId }
  );

  // Use isFetching to determine actual refreshing state
  const actualRefreshing = refreshing || isFetchingNotifications || isFetchingUnreadCount;

  // Enhanced refresh handler that refetches all queries
  const handleRefresh = useCallback(async () => {
    baseOnRefresh();
    const refetchPromises: Promise<any>[] = [];
    
    if (refetchNotifications) {
      refetchPromises.push(refetchNotifications());
    }
    
    if (refetchUnreadCount) {
      refetchPromises.push(refetchUnreadCount());
    }
    
    try {
      await Promise.all(refetchPromises);
    } catch (error) {
      console.error('NotificationScreen: Error during refetch:', error);
    }
  }, [baseOnRefresh, refetchNotifications, refetchUnreadCount]);

  const [deleteNotificationApi] = useDeleteNotificationMutation();
  const [markNotificationReadApi] = useMarkNotificationReadMutation();

  // Sync to slice on mount/refetch
  useEffect(() => {
    if (notifications) {
      dispatch(setNotifications(notifications));
    }
  }, [notifications, dispatch]);

  // Sync unread count
  useEffect(() => {
    if (unreadCount !== undefined) {
      dispatch(setUnreadCount(unreadCount));
    }
  }, [unreadCount, dispatch]);

  const handlePress = useCallback(async (item: any) => {
    try {
      if (item?.id) {
        await markNotificationReadApi(String(item.id)).unwrap();
      }
    } catch (e) {
      // Ignore - keep navigation responsive
    }

    const dataType = item?.type;
    const message = String(item?.message || '');

    if (dataType === 'service_reminder' && item?.ref_id) {
      navigation.navigate('ServiceDetail', { serviceId: Number(item.ref_id) });
      return;
    }

    if (dataType === 'warranty_reminder') {
      if (item?.ref_type === 'order' && item?.ref_id) {
        if (userType === 'customer') {
          navigation.navigate('OrderDetail', { id: String(item.ref_id) });
        } else {
          navigation.navigate('EmployeeOrderDetail', { id: String(item.ref_id) });
        }
        return;
      }
      navigation.navigate('Warranty');
      return;
    }

    if (dataType && String(dataType).includes('order')) {
      const orderId = item?.ref_type === 'order' && item?.ref_id ? String(item.ref_id) : undefined;
      if (orderId) {
        if (userType === 'customer') {
          navigation.navigate('OrderDetail', { id: orderId });
        } else {
          navigation.navigate('EmployeeOrderDetail', { id: orderId });
        }
        return;
      }
    }

    // Legacy fallback: Parse order_id from message like "Đơn hàng #X ..."
    const orderMatch = message.match(/#(\d+)/);
    if (orderMatch) {
      const orderId = orderMatch[1];
      if (userType === 'customer') {
        navigation.navigate('OrderDetail', { id: orderId });
      } else {
        navigation.navigate('EmployeeOrderDetail', { id: orderId });
      }
    }
  }, [markNotificationReadApi, navigation, userType]);

  const handleDelete = useCallback(async (notificationId: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa thông báo này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotificationApi(notificationId).unwrap();
              dispatch(deleteNotificationAction(notificationId));
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa thông báo');
            }
          },
        },
      ]
    );
  }, [deleteNotificationApi, dispatch]);

  // Show loading only on initial load (no data yet)
  if (isLoading && !notifications) {
    return (
      <Screen
        headerTitle="Thông báo"
        showBackButton
        safeAreaTopColor={Colors.primary}
        statusBarStyle="light-content"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </Screen>
    );
  }

  // Show error only if no data available
  if (error && !notifications) {
    return (
      <Screen
        headerTitle="Thông báo"
        showBackButton
        safeAreaTopColor={Colors.primary}
        statusBarStyle="light-content"
      >
        <View style={styles.errorContainer}>
          <ErrorView 
            message="Lỗi tải thông báo"
            onRetry={refetchNotifications}
            icon="notifications-outline"
          />
        </View>
      </Screen>
    );
  }

  // Check if we have data
  if (!notifications || notifications.length === 0) {
    return (
      <Screen
        headerTitle="Thông báo"
        showBackButton
        safeAreaTopColor={Colors.primary}
        statusBarStyle="light-content"
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
        </View>
      </Screen>
    );
  }

  const renderItem = useCallback(({ item }: { item: any }) => {
    const rawTitle = item?.title ?? null;
    const rawBody = item?.body ?? null;
    const rawMessage = String(item?.message || '').replace(/ bởi \d+/, '');

    const title = (rawTitle && String(rawTitle).trim().length > 0)
      ? String(rawTitle)
      : (rawMessage.split(':')[0].trim() || (item?.type ? String(item.type) : 'Thông báo'));

    const body = (rawBody && String(rawBody).trim().length > 0)
      ? String(rawBody)
      : (rawMessage ? rawMessage.replace(title + ':', '').trim() : '');

    const time = (item?.created_at || item?.sent_at)
      ? new Date(item?.sent_at || item?.created_at).toLocaleString('vi-VN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Vừa xong';

    return (
      <View style={{ position: 'relative', opacity: item.read ? 0.6 : 1 }}>
        <Item
          title={title}
          description={`${body} • ${time}`}
          imageUri={item.image_url}
          onPress={() => handlePress(item)}
          isPressable={true}
        />
        <TouchableOpacity 
          style={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: 'rgba(128, 128, 128, 0.15)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
          onPress={() => handleDelete(String(item.id))}
        >
          <Ionicons name="close-outline" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    );
  }, [handlePress, handleDelete]);

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 110 + 12, // item minHeight + separator
      offset: (110 + 12) * index,
      index,
    }),
    []
  );

  const renderSeparator = useCallback(() => <View style={{ height: 12 }} />, []);

  const headerTitle = useMemo(() => 
    `Thông báo${unreadCount && unreadCount > 0 ? ` (${unreadCount})` : ''}`, 
    [unreadCount]
  );

  return (
    <Screen
      headerTitle={headerTitle}
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
    >
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={renderSeparator}
        refreshControl={<RefreshControl refreshing={actualRefreshing} onRefresh={handleRefresh} />}
        initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
        maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
        windowSize={PerformanceConfig.flatList.windowSize}
        removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
        updateCellsBatchingPeriod={PerformanceConfig.flatList.updateCellsBatchingPeriod}
      />
    </Screen>
  );
};

export default NotificationScreen;