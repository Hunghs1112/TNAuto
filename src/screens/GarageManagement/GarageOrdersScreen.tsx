import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ServiceOrderCard from '../../components/ServiceOrderCard';
import { Screen } from '../../components/layout';
import ErrorView from '../../components/Loading/ErrorView';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { isManagerRole } from '../../navigation/rolePolicy';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import {
  AdminEntity,
  AdminStats,
  useCreateAdminResourceMutation,
  useGetAdminResourceListQuery,
  useGetAdminStatsQuery,
} from '../../services/adminGarageApi';
import { mapAdminServiceOrder, AdminServiceOrder } from '../../services/adminMappers';
import { ServiceOrder } from '../../types/api.types';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type OrderFilter = 'all' | 'received' | 'in_progress' | 'ready_for_pickup' | 'completed';

const FILTERS: Array<{ key: OrderFilter; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'received', label: 'Mới nhận' },
  { key: 'in_progress', label: 'Đang sửa' },
  { key: 'ready_for_pickup', label: 'Chờ bàn giao' },
  { key: 'completed', label: 'Hoàn thành' },
];

const getNumber = (value: unknown) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

const pickStat = (stats: AdminStats | undefined, keys: string[]) => {
  if (!stats) {
    return 0;
  }

  for (const key of keys) {
    if (stats[key] !== undefined) {
      return getNumber(stats[key]);
    }
  }

  return 0;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Chưa xác định';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('vi-VN');
};

export default function GarageOrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const userType = useAppSelector((state) => state.auth.userType);
  const [statusFilter, setStatusFilter] = useState<OrderFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const canAccess = isManagerRole(userType);

  const ordersQuery = useGetAdminResourceListQuery(
    {
      resource: 'service-orders',
      params: statusFilter === 'all' ? undefined : { status: statusFilter },
    },
    { skip: !canAccess },
  );
  const statsQuery = useGetAdminStatsQuery(
    { resource: 'service-orders' },
    { skip: !canAccess },
  );

  const [createOrder] = useCreateAdminResourceMutation();

  const orders = useMemo(
    () => (ordersQuery.data || []).map(mapAdminServiceOrder),
    [ordersQuery.data],
  );

  const totalOrders = pickStat(statsQuery.data, ['total_orders', 'orders_total', 'count']);
  const pendingOrders = pickStat(statsQuery.data, ['pending_orders', 'received_orders']);
  const processingOrders = pickStat(statsQuery.data, ['processing_orders', 'in_progress_orders']);
  const completedToday = pickStat(statsQuery.data, ['completed_today', 'completed_orders_today']);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([ordersQuery.refetch(), statsQuery.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [ordersQuery, statsQuery]);

  const handleCreateOrder = useCallback(
    async (data: Record<string, string>) => {
      await createOrder({ resource: 'service-orders', body: data }).unwrap();
      await ordersQuery.refetch();
    },
    [createOrder, ordersQuery],
  );

  const renderFilter = useCallback(
    (filter: { key: OrderFilter; label: string }) => {
      const isActive = statusFilter === filter.key;

      return (
        <TouchableOpacity
          key={filter.key}
          style={[styles.filterPill, isActive && styles.filterPillActive]}
          onPress={() => setStatusFilter(filter.key)}
          activeOpacity={0.85}
        >
          <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      );
    },
    [statusFilter],
  );

  const renderOrder = useCallback(
    ({ item }: { item: AdminServiceOrder }) => (
      <ServiceOrderCard
        serviceName={item.service_name || `Đơn dịch vụ #${item.id}`}
        secondaryName={item.customer_name || item.license_plate || 'Khách hàng chưa xác định'}
        receiveDate={formatDate(item.receive_date)}
        scheduleDate={formatDate(item.delivery_date)}
        status={item.status}
        garageName={item.garage_name ?? undefined}
        serviceImageUrl={item.service_image_url ?? undefined}
        onPress={() => navigation.navigate('OrderDetail', { id: String(item.id) })}
      />
    ),
    [navigation],
  );

  if (!canAccess) {
    return (
      <Screen
        headerTitle="Đơn hàng gara"
        showBackButton={false}
        statusBarStyle="light-content"
      >
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={40} color={Colors.text.secondary} />
          <Text style={styles.emptyTitle}>Bạn không có quyền truy cập màn này</Text>
        </View>
      </Screen>
    );
  }

  const isInitialLoading =
    (ordersQuery.isLoading || statsQuery.isLoading) &&
    orders.length === 0;
  const isError = !ordersQuery.isLoading && !!ordersQuery.error && orders.length === 0;

  return (
    <Screen
      headerTitle="Đơn hàng gara"
      showBackButton={false}
      statusBarStyle="light-content"
      useScrollView={false}
      backgroundColor={Colors.background.secondary}
    >
      {isInitialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      ) : isError ? (
        <ErrorView
          message="Không thể tải danh sách đơn hàng"
          onRetry={() => ordersQuery.refetch()}
          icon="receipt-outline"
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || ordersQuery.isFetching || statsQuery.isFetching}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <Text style={styles.screenTitle}>Luồng xử lý dịch vụ</Text>
              <Text style={styles.screenSubtitle}>
                Danh sách và trạng thái lấy từ `/api/app/admin/service-orders`.
              </Text>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{totalOrders}</Text>
                  <Text style={styles.statLabel}>Tổng đơn</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{pendingOrders}</Text>
                  <Text style={styles.statLabel}>Đơn mới</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{processingOrders}</Text>
                  <Text style={styles.statLabel}>Đang xử lý</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{completedToday}</Text>
                  <Text style={styles.statLabel}>Xong hôm nay</Text>
                </View>
              </View>

              <View style={styles.filtersRow}>
                {FILTERS.map(renderFilter)}
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={40} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>Không có đơn nào theo bộ lọc hiện tại</Text>
              <Text style={styles.emptySubtitle}>
                Hãy đổi trạng thái lọc hoặc tạo đơn mới từ backend admin.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB tạo đơn mới */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color={Colors.background.light} />
      </TouchableOpacity>

      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateOrder}
        />
      )}
    </Screen>
  );
}

// ─── Create Order Modal ───────────────────────────────────────────────────────
function CreateOrderModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const [licensePlate, setLicensePlate] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!licensePlate.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập biển số xe.'); return; }
    if (!receiverName.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập tên khách hàng.'); return; }
    if (!receiverPhone.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại.'); return; }
    setSaving(true);
    try {
      await onSave({
        license_plate: licensePlate.trim().toUpperCase(),
        receiver_name: receiverName.trim(),
        receiver_phone: receiverPhone.trim(),
        receive_date: receiveDate.trim(),
        note: note.trim(),
      });
      Alert.alert('Thành công', 'Đã tạo đơn dịch vụ mới.');
      onClose();
    } catch {
      Alert.alert('Lỗi', 'Không thể tạo đơn. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={createOrderStyles.overlay}>
      <View style={createOrderStyles.sheet}>
        <View style={createOrderStyles.header}>
          <Text style={createOrderStyles.title}>Tạo đơn dịch vụ</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        {[
          { label: 'Biển số xe *', value: licensePlate, set: setLicensePlate, placeholder: 'VD: 51A-12345', caps: 'characters' as const },
          { label: 'Tên khách hàng *', value: receiverName, set: setReceiverName, placeholder: 'Nhập tên' },
          { label: 'Số điện thoại *', value: receiverPhone, set: setReceiverPhone, placeholder: 'Nhập SĐT', keyboard: 'phone-pad' as const },
          { label: 'Ngày nhận (YYYY-MM-DD)', value: receiveDate, set: setReceiveDate, placeholder: '2026-05-10' },
          { label: 'Ghi chú', value: note, set: setNote, placeholder: 'Tuỳ chọn' },
        ].map((f) => (
          <View key={f.label} style={createOrderStyles.field}>
            <Text style={createOrderStyles.label}>{f.label}</Text>
            <TextInput
              style={createOrderStyles.input}
              value={f.value}
              onChangeText={f.set}
              placeholder={f.placeholder}
              placeholderTextColor={Colors.text.secondary}
              keyboardType={f.keyboard}
              autoCapitalize={f.caps}
            />
          </View>
        ))}
        <View style={createOrderStyles.actions}>
          <TouchableOpacity style={createOrderStyles.cancelBtn} onPress={onClose}>
            <Text style={createOrderStyles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[createOrderStyles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color={Colors.background.light} />
              : <Text style={createOrderStyles.saveText}>Tạo đơn</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.base,
    gap: spacing.base,
  },
  headerBlock: {
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  screenTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size['2xl'],
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  screenSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  statValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
    fontWeight: Typography.weight.bold,
  },
  statLabel: {
    marginTop: spacing.xs,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.background.light,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  loadingText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  },
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
});

const createOrderStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  sheet: {
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    padding: spacing.lg,
    gap: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  field: { gap: spacing.xs },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
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
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.text.secondary,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.background.light,
    fontWeight: Typography.weight.bold,
  },
});
