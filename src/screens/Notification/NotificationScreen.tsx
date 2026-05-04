import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
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
  AdminNotificationLog,
  AdminStats,
  useCreateAdminResourceMutation,
  useGetAdminNotificationLogsQuery,
  useGetAdminStatsQuery,
} from "../../services/adminGarageApi";
import {
  setNotifications,
  deleteNotification as deleteNotificationAction,
  setUnreadCount,
} from "../../redux/slices/notificationSlice";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { borderRadius } from "../../design-system/borders";
import { spacing } from "../../design-system/spacing";
import { Screen } from "../../components/layout";
import Item from "../../components/Item";
import ErrorView from "../../components/Loading/ErrorView";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import { isManagerRole } from "../../navigation/rolePolicy";

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

const pickAdminUnreadLikeCount = (stats?: AdminStats) => {
  if (!stats) {
    return 0;
  }

  const keys = ['alerts', 'pending_notifications', 'failed_notifications', 'unread_count'];
  for (const key of keys) {
    const value = Number(stats[key]);
    if (Number.isFinite(value)) {
      return value;
    }
  }

  return 0;
};

const NotificationScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { refreshing, onRefresh: baseOnRefresh } = useAutoRefresh({ tags: ['Notification'] });
  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isLoggedIn);
  const userType = useAppSelector((state: RootState) => state.auth.userType || 'customer');
  const isManagerUser = isManagerRole(userType);
  const customerId = useAppSelector((state: RootState) => state.auth.userId || '');
  const recipientParams =
    userType === 'customer'
      ? { customer_id: customerId, user_type: 'customer' as const }
      : { user_type: userType };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createNotification] = useCreateAdminResourceMutation();

  const adminNotificationsQuery = useGetAdminNotificationLogsQuery(undefined, {
    skip: !isLoggedIn || !isManagerUser,
  });
  const adminStatsQuery = useGetAdminStatsQuery(
    { resource: 'notifications' },
    { skip: !isLoggedIn || !isManagerUser },
  );
  const {
    data: standardNotifications,
    isLoading: standardLoading,
    error: standardError,
    refetch: refetchNotifications,
    isFetching: isFetchingNotifications,
  } = useGetNotificationsQuery(
    recipientParams,
    { skip: !isLoggedIn || isManagerUser || (userType === 'customer' && !customerId) },
  );

  const {
    data: standardUnreadCount,
    refetch: refetchUnreadCount,
    isFetching: isFetchingUnreadCount,
  } = useGetUnreadCountQuery(
    recipientParams,
    { skip: !isLoggedIn || isManagerUser || (userType === 'customer' && !customerId) },
  );

  const notifications = (isManagerUser
    ? adminNotificationsQuery.data
    : standardNotifications) as Array<AdminNotificationLog | any> | undefined;
  const unreadCount = isManagerUser
    ? pickAdminUnreadLikeCount(adminStatsQuery.data)
    : standardUnreadCount;
  const isLoading = isManagerUser ? adminNotificationsQuery.isLoading : standardLoading;
  const error = isManagerUser ? adminNotificationsQuery.error : standardError;

  const actualRefreshing =
    refreshing ||
    isFetchingNotifications ||
    isFetchingUnreadCount ||
    adminNotificationsQuery.isFetching ||
    adminStatsQuery.isFetching;

  const handleRefresh = async () => {
    baseOnRefresh();
    const refetchPromises: Promise<any>[] = [];

    if (isManagerUser) {
      refetchPromises.push(adminNotificationsQuery.refetch());
      refetchPromises.push(adminStatsQuery.refetch());
    } else if (refetchNotifications) {
      refetchPromises.push(refetchNotifications());
    }

    if (!isManagerUser && refetchUnreadCount) {
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
      if (!isManagerUser && item?.id) {
        await markNotificationReadApi({ id: String(item.id), user_type: userType }).unwrap();
      }
    } catch (markReadError) {
      console.error('NotificationScreen: Failed to mark notification as read:', markReadError);
    }

    const dataType = item?.type;
    const orderId = getNotificationOrderId(item);

    if (dataType === 'service_reminder' && item?.ref_id) {
      if (isManagerUser) {
        navigation.navigate('GarageManagement');
        return;
      }

      if (userType === 'dealer') {
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
        } else if (isManagerUser) {
          navigation.navigate('OrderDetail', { id: orderId });
        } else if (userType === 'dealer') {
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
        } else if (isManagerUser) {
          navigation.navigate('OrderDetail', { id: orderId });
        } else if (userType === 'dealer') {
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
      } else if (isManagerUser) {
        navigation.navigate('OrderDetail', { id: orderId });
      } else if (userType === 'dealer') {
        navigation.navigate('Category');
      } else {
        navigation.navigate('OrderDetail', { id: orderId });
      }
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (isManagerUser) {
      return;
    }

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
        {!isManagerUser ? (
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
        ) : null}
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

      {/* Admin FAB: tạo notification */}
      {isManagerUser && (
        <TouchableOpacity
          style={notifStyles.fab}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={26} color={Colors.background.light} />
        </TouchableOpacity>
      )}

      {showCreateModal && (
        <CreateNotificationModal
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            await createNotification({ resource: 'notifications', body: data }).unwrap();
            await adminNotificationsQuery.refetch();
            Alert.alert('Thành công', 'Đã gửi thông báo.');
            setShowCreateModal(false);
          }}
        />
      )}
    </Screen>
  );
};

export default NotificationScreen;

// ─── Create Notification Modal (admin only) ───────────────────────────────────
function CreateNotificationModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('general');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Lỗi', 'Tiêu đề không được để trống.'); return; }
    if (!body.trim()) { Alert.alert('Lỗi', 'Nội dung không được để trống.'); return; }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), body: body.trim(), message: body.trim(), type: type.trim() });
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi thông báo. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={notifStyles.overlay}>
      <View style={notifStyles.sheet}>
        <View style={notifStyles.sheetHeader}>
          <Text style={notifStyles.sheetTitle}>Tạo thông báo</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={notifStyles.field}>
          <Text style={notifStyles.label}>Tiêu đề *</Text>
          <TextInput
            style={notifStyles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Nhập tiêu đề thông báo"
            placeholderTextColor={Colors.text.secondary}
          />
        </View>
        <View style={notifStyles.field}>
          <Text style={notifStyles.label}>Nội dung *</Text>
          <TextInput
            style={[notifStyles.input, { height: 80, textAlignVertical: 'top' }]}
            value={body}
            onChangeText={setBody}
            placeholder="Nhập nội dung thông báo"
            placeholderTextColor={Colors.text.secondary}
            multiline
          />
        </View>
        <View style={notifStyles.field}>
          <Text style={notifStyles.label}>Loại thông báo</Text>
          <TextInput
            style={notifStyles.input}
            value={type}
            onChangeText={setType}
            placeholder="VD: general, service_reminder"
            placeholderTextColor={Colors.text.secondary}
            autoCapitalize="none"
          />
        </View>

        <View style={notifStyles.actions}>
          <TouchableOpacity style={notifStyles.cancelBtn} onPress={onClose}>
            <Text style={notifStyles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[notifStyles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color={Colors.background.light} />
              : <Text style={notifStyles.saveText}>Gửi</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const notifStyles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end', zIndex: 100,
  },
  sheet: {
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    padding: spacing.lg,
    gap: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  field: { gap: spacing.xs },
  label: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.text.secondary },
  input: {
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: Colors.border.light, alignItems: 'center' },
  cancelText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.base, color: Colors.text.secondary },
  saveBtn: { flex: 2, paddingVertical: spacing.md, borderRadius: borderRadius.xl, backgroundColor: Colors.primary, alignItems: 'center' },
  saveText: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.size.base, color: Colors.background.light, fontWeight: Typography.weight.bold },
});
