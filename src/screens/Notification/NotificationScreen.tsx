import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
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

const getNotificationMeta = (type: string, title: string) => {
  const t = (type + title).toLowerCase();
  if (t.includes('order_completed') || t.includes('hoàn thành'))
    return { icon: 'checkmark-circle', color: '#16A34A', bg: '#F0FDF4' };
  if (t.includes('order') || t.includes('đơn'))
    return { icon: 'receipt-outline', color: '#2563EB', bg: '#EFF6FF' };
  if (t.includes('warranty') || t.includes('bảo hành'))
    return { icon: 'shield-checkmark', color: '#7C3AED', bg: '#F5F3FF' };
  if (t.includes('service_reminder') || t.includes('dịch vụ') || t.includes('nhắc'))
    return { icon: 'build', color: '#D97706', bg: '#FFFBEB' };
  if (t.includes('promo') || t.includes('ưu đãi') || t.includes('giảm'))
    return { icon: 'pricetag', color: '#DB2777', bg: '#FDF2F8' };
  return { icon: 'notifications', color: Colors.primary, bg: Colors.primarySoft };
};

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
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter notifications theo search query (chỉ áp dụng khi out focus)
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim() || !notifications) return notifications;
    const q = searchQuery.toLowerCase().trim();
    return notifications.filter((item: any) => {
      const title = String(item?.title || item?.message || '').toLowerCase();
      const body = String(item?.body || item?.message || '').toLowerCase();
      const type = String(item?.type || '').toLowerCase();
      return title.includes(q) || body.includes(q) || type.includes(q);
    });
  }, [notifications, searchQuery]);

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

    const isUnread = !item.read;
    const meta = getNotificationMeta(item?.type || '', title);

    return (
      <TouchableOpacity
        activeOpacity={0.82}
        style={[notifItemStyles.card, isUnread && notifItemStyles.cardUnread]}
        onPress={() => handlePress(item)}
      >
        {/* Unread bar */}
        {isUnread && <View style={notifItemStyles.unreadBar} />}

        {/* Icon */}
        <View style={[notifItemStyles.iconWrap, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon as any} size={20} color={meta.color} />
        </View>

        {/* Content */}
        <View style={notifItemStyles.content}>
          <View style={notifItemStyles.topRow}>
            <Text style={[notifItemStyles.title, !isUnread && notifItemStyles.titleRead]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={notifItemStyles.time}>{time}</Text>
          </View>
          {body ? (
            <Text style={notifItemStyles.body} numberOfLines={2}>{body}</Text>
          ) : null}
        </View>

        {/* Delete button */}
        {!isManagerUser && (
          <TouchableOpacity
            style={notifItemStyles.deleteBtn}
            onPress={() => handleDelete(String(item.id))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={14} color={Colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
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
      {/* Search bar */}
      <View style={notifSearchStyles.searchBar}>
        <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
        <TextInput
          style={notifSearchStyles.searchInput}
          value={searchInput}
          onChangeText={setSearchInput}
          onBlur={() => setSearchQuery(searchInput)}
          onSubmitEditing={() => setSearchQuery(searchInput)}
          placeholder="Tìm thông báo..."
          placeholderTextColor={Colors.text.secondary}
          returnKeyType="search"
        />
        {searchInput ? (
          <TouchableOpacity
            onPress={() => { setSearchInput(''); setSearchQuery(''); }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="close-circle" size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        alwaysBounceVertical={true}
        data={filteredNotifications}
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

const notifSearchStyles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
});

const notifItemStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardUnread: {
    borderColor: Colors.alpha.primary12,
    backgroundColor: Colors.primarySoft,
    ...Platform.select({
      ios: { shadowOpacity: 0.1 },
      android: { elevation: 3 },
    }),
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary,
    lineHeight: 19,
  },
  titleRead: {
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text.secondary,
  },
  time: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[400],
    flexShrink: 0,
    marginTop: 2,
  },
  body: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  deleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});
