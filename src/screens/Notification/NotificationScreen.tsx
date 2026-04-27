import React, { useEffect, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { RootState } from "../../redux/types";
import { PerformanceConfig } from "../../config/performance";
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
} from "../../services/notificationApi";
import {
  setNotifications,
  deleteNotification as deleteNotificationAction,
  setUnreadCount,
} from "../../redux/slices/notificationSlice";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { Colors } from "../../constants/colors";
import { Screen } from "../../components/layout";
import Item from "../../components/Item";
import ErrorView from "../../components/Loading/ErrorView";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const getNotificationOrderId = (item: any) => {
  const rawOrderId = item?.order_id ?? item?.metadata?.order_id ?? (item?.ref_type === 'order' ? item?.ref_id : undefined);

  if (rawOrderId !== undefined && rawOrderId !== null && rawOrderId !== '') {
    return String(rawOrderId);
  }

  const message = String(item?.message || '');
  const orderMatch = message.match(/#(\d+)/);
  return orderMatch?.[1];
};

const NotificationScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { refreshing, onRefresh: baseOnRefresh } = useAutoRefresh({ tags: ['Notification'] });
  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isLoggedIn);
  const userType = useAppSelector((state: RootState) => state.auth.userType || 'customer');
  const customerId = useAppSelector((state: RootState) => state.auth.userId || '');
  const recipientParams =
    userType === 'customer'
      ? { customer_id: customerId, user_type: 'customer' as const }
      : { user_type: userType };

  const {
    data: notifications,
    isLoading,
    error,
    refetch: refetchNotifications,
    isFetching: isFetchingNotifications,
  } = useGetNotificationsQuery(
    recipientParams,
    { skip: !isLoggedIn || (userType === 'customer' && !customerId) },
  );

  const {
    data: unreadCount,
    refetch: refetchUnreadCount,
    isFetching: isFetchingUnreadCount,
  } = useGetUnreadCountQuery(
    recipientParams,
    { skip: !isLoggedIn || (userType === 'customer' && !customerId) },
  );

  const actualRefreshing = refreshing || isFetchingNotifications || isFetchingUnreadCount;

  const handleRefresh = async () => {
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
    } catch (refreshError) {
      console.error('NotificationScreen: Error during refetch:', refreshError);
    }
  };

  const [deleteNotificationApi] = useDeleteNotificationMutation();
  const [markNotificationReadApi] = useMarkNotificationReadMutation();

  useEffect(() => {
    if (notifications) {
      dispatch(setNotifications(notifications));
    }
  }, [notifications, dispatch]);

  useEffect(() => {
    if (unreadCount !== undefined) {
      dispatch(setUnreadCount(unreadCount));
    }
  }, [unreadCount, dispatch]);

  const handlePress = async (item: any) => {
    try {
      if (item?.id) {
        await markNotificationReadApi({ id: String(item.id), user_type: userType }).unwrap();
      }
    } catch (markReadError) {
      console.error('NotificationScreen: Failed to mark notification as read:', markReadError);
    }

    const dataType = item?.type;
    const orderId = getNotificationOrderId(item);

    if (dataType === 'service_reminder' && item?.ref_id) {
      if ((userType === 'dealer' || userType === 'garage_manager' || userType === 'garage_admin')) {
        navigation.navigate('Category');
        return;
      }

      navigation.navigate('ServiceDetail', { serviceId: Number(item.ref_id) });
      return;
    }

    if (dataType === 'warranty_reminder') {
      if (orderId) {
        if (userType === 'employee') {
          navigation.navigate('EmployeeOrderDetail', { id: orderId });
        } else if ((userType === 'dealer' || userType === 'garage_manager' || userType === 'garage_admin')) {
          navigation.navigate('Category');
        } else {
          navigation.navigate('OrderDetail', { id: orderId });
        }
        return;
      }

      navigation.navigate('Warranty');
      return;
    }

    if (
      dataType === 'order_available_for_claim' ||
      dataType === 'order_claimed' ||
      dataType === 'order_assigned' ||
      dataType === 'order_status_update' ||
      dataType === 'order_created' ||
      dataType === 'order_completed'
    ) {
      if (orderId) {
        if (userType === 'employee') {
          navigation.navigate('EmployeeOrderDetail', { id: orderId });
        } else if ((userType === 'dealer' || userType === 'garage_manager' || userType === 'garage_admin')) {
          navigation.navigate('Category');
        } else {
          navigation.navigate('OrderDetail', { id: orderId });
        }
        return;
      }

      navigation.navigate('Home');
      return;
    }

    if (orderId) {
      if (userType === 'employee') {
        navigation.navigate('EmployeeOrderDetail', { id: orderId });
      } else if ((userType === 'dealer' || userType === 'garage_manager' || userType === 'garage_admin')) {
        navigation.navigate('Category');
      } else {
        navigation.navigate('OrderDetail', { id: orderId });
      }
    }
  };

  const handleDelete = async (notificationId: string) => {
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
              await deleteNotificationApi({ id: notificationId, user_type: userType }).unwrap();
              dispatch(deleteNotificationAction(notificationId));
            } catch (deleteError) {
              Alert.alert('Lỗi', 'Không thể xóa thông báo');
              console.error('NotificationScreen: Failed to delete notification:', deleteError);
            }
          },
        },
      ],
    );
  };

  const TAB_BAR_HEIGHT = 76;

  const renderItem = ({ item }: { item: any }) => {
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
            backgroundColor: Colors.alpha.slate15,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
          onPress={() => handleDelete(String(item.id))}
        >
          <Ionicons name="close-outline" size={16} color={Colors.status.error} />
        </TouchableOpacity>
      </View>
    );
  };

  const keyExtractor = (item: { id: string }) => item.id;

  const getItemLayout = (_: any, index: number) => ({
    length: 110 + 12,
    offset: (110 + 12) * index,
    index,
  });

  const renderSeparator = () => <View style={{ height: 12 }} />;

  const headerTitle = `Thông báo${unreadCount && unreadCount > 0 ? ` (${unreadCount})` : ''}`;

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

  return (
    <Screen
      headerTitle={headerTitle}
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
      useScrollView={false}
      contentStyle={{ paddingBottom: 0 }}
    >
      <FlatList
        alwaysBounceVertical={true}
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: TAB_BAR_HEIGHT + bottomInset,
            paddingHorizontal: 16,
          },
        ]}
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

