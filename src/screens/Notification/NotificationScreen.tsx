// src/screens/Notification/NotificationScreen.tsx
import React, { useEffect, useCallback, useMemo } from "react";
import { View, FlatList, StatusBar, ActivityIndicator, Text, RefreshControl, TouchableOpacity, Alert } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { RootState } from "../../redux/types";
import { PerformanceConfig } from "../../config/performance";
import { useGetNotificationsQuery, useGetUnreadCountQuery, useDeleteNotificationMutation } from "../../services/notificationApi";
import { setNotifications, deleteNotification as deleteNotificationAction, setUnreadCount } from "../../redux/slices/notificationSlice";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors } from "../../constants/colors";
import Header from "../../components/Header";
import Item from "../../components/Item";
import { styles } from "./styles";
import { RootView } from "../../components/layout";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const NotificationScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh();
  const userType = useAppSelector((state: RootState) => state.auth.userType || 'customer');
  const userId = useAppSelector((state: RootState) => state.auth.userId || '');
  const recipientId = userId;
  const recipientType = userType;

  const { data: notifications, isLoading, error, refetch } = useGetNotificationsQuery(
    { recipient_id: recipientId, recipient_type: recipientType },
    { skip: !recipientId }
  );

  const { data: unreadCount } = useGetUnreadCountQuery(
    { recipient_id: recipientId, recipient_type: recipientType },
    { skip: !recipientId }
  );

  const [deleteNotificationApi] = useDeleteNotificationMutation();

  console.log('NotificationScreen debug - notifications:', notifications, 'isLoading:', isLoading, 'error:', error, 'unreadCount:', unreadCount); // Debug

  // Sync to slice on mount/refetch
  useEffect(() => {
    if (notifications) {
      dispatch(setNotifications(notifications));
      console.log('NotificationScreen: Synced notifications to slice'); // Debug
    }
  }, [notifications, dispatch]);

  // Sync unread count
  useEffect(() => {
    if (unreadCount !== undefined) {
      dispatch(setUnreadCount(unreadCount));
      console.log('NotificationScreen: Synced unreadCount to slice:', unreadCount); // Debug
    }
  }, [unreadCount, dispatch]);

  const handlePress = useCallback((message: string) => {
    // Parse order_id from message like "Đơn hàng #X ..."
    const orderMatch = message.match(/#(\d+)/);
    if (orderMatch) {
      const orderId = orderMatch[1];
      
      // Navigate to order detail based on user type
      if (userType === 'customer') {
        navigation.navigate('OrderDetail', { id: orderId });
      } else {
        navigation.navigate('EmployeeOrderDetail', { id: orderId });
      }
    }
  }, [navigation, userType]);

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
      <RootView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.header}>
          <Header title="Thông báo" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </RootView>
    );
  }

  // Show error only if no data available
  if (error && !notifications) {
    console.log('NotificationScreen: Showing error, error:', error); // Debug
    return (
      <RootView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.header}>
          <Header title="Thông báo" />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lỗi tải thông báo</Text>
        </View>
      </RootView>
    );
  }

  // Check if we have data
  if (!notifications || notifications.length === 0) {
    console.log('NotificationScreen: No notifications available'); // Debug
    return (
      <RootView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.header}>
          <Header title="Thông báo" />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
        </View>
      </RootView>
    );
  }

  const renderItem = useCallback(({ item }: { item: { id: string; message: string; read: boolean; created_at?: string; } }) => {
    let displayMessage = item.message.replace(/ bởi \d+/, ''); // Remove " bởi 1" or similar
    const title = displayMessage.split(':')[0].trim() || 'Thông báo mới';
    const time = item.created_at ? new Date(item.created_at).toLocaleString('vi-VN', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : 'Vừa xong';
    
    return (
      <View style={{ position: 'relative', opacity: item.read ? 0.6 : 1 }}>
        <Item
          title={title}
          description={`${displayMessage.replace(title + ':', '').trim()} • ${time}`}
          imageUri={undefined}
          onPress={() => handlePress(displayMessage)}
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
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="close-outline" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    );
  }, [handlePress, handleDelete]);

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  const headerTitle = useMemo(() => 
    `Thông báo${unreadCount && unreadCount > 0 ? ` (${unreadCount})` : ''}`, 
    [unreadCount]
  );

  return (
    <RootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <Header title={headerTitle} />
      </View>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
        maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
        windowSize={PerformanceConfig.flatList.windowSize}
        removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
        updateCellsBatchingPeriod={PerformanceConfig.flatList.updateCellsBatchingPeriod}
      />
    </RootView>
  );
};

export default NotificationScreen;