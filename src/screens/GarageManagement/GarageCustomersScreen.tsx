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
  AdminCustomer,
  AdminEntity,
  AdminStats,
  useCreateAdminResourceMutation,
  useGetAdminResourceListQuery,
  useGetAdminStatsQuery,
} from '../../services/adminGarageApi';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

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

const mapCustomer = (item: AdminEntity): AdminCustomer => ({
  ...(item as unknown as AdminCustomer),
  id: Number(item.id || 0),
  name: String(item.name || 'Khách hàng chưa đặt tên'),
  phone: item.phone ? String(item.phone) : '',
});

export default function GarageCustomersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const userType = useAppSelector((state) => state.auth.userType);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const canAccess = isManagerRole(userType);

  const customersQuery = useGetAdminResourceListQuery(
    { resource: 'customers' },
    { skip: !canAccess },
  );
  const statsQuery = useGetAdminStatsQuery(
    { resource: 'customers' },
    { skip: !canAccess },
  );

  const [createCustomer] = useCreateAdminResourceMutation();

  const customers = useMemo(
    () => (customersQuery.data || []).map(mapCustomer),
    [customersQuery.data],
  );

  const totalCustomers = pickStat(statsQuery.data, ['total_customers', 'customers_total', 'count']);
  const newCustomers = pickStat(statsQuery.data, ['new_customers_30d', 'new_customers', 'created_30d']);
  const activeCustomers = pickStat(statsQuery.data, ['active_customers', 'customers_with_active_orders']);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([customersQuery.refetch(), statsQuery.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [customersQuery, statsQuery]);

  const handleCreateCustomer = useCallback(
    async (data: { name: string; phone: string; email: string }) => {
      await createCustomer({ resource: 'customers', body: data }).unwrap();
      await customersQuery.refetch();
    },
    [createCustomer, customersQuery],
  );

  const handleCustomerPress = useCallback(
    (customer: AdminCustomer) => {
      navigation.navigate('CustomerDetail', {
        customerId: Number(customer.id),
        customerName: customer.name || 'Khách hàng',
        customerPhone: customer.phone || '',
      });
    },
    [navigation],
  );

  const renderCustomer = useCallback(
    ({ item }: { item: AdminCustomer }) => {
      const vehicleCount = getNumber(item.vehicle_count);
      const activeOrders = getNumber(item.active_order_count);
      const totalOrders = getNumber(item.total_orders);

      return (
        <TouchableOpacity
          style={styles.customerCard}
          activeOpacity={0.85}
          onPress={() => handleCustomerPress(item)}
        >
          <View style={styles.customerHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.customerMeta}>
              <Text style={styles.customerName}>{item.name}</Text>
              <Text style={styles.customerPhone}>
                {item.phone || 'Chưa có số điện thoại'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricPill}>
              <Ionicons name="car-outline" size={14} color={Colors.secondary} />
              <Text style={styles.metricText}>{vehicleCount} xe</Text>
            </View>
            <View style={styles.metricPill}>
              <Ionicons name="receipt-outline" size={14} color={Colors.primaryLight} />
              <Text style={styles.metricText}>{totalOrders} đơn</Text>
            </View>
            <View style={styles.metricPill}>
              <Ionicons name="time-outline" size={14} color={Colors.status.warning} />
              <Text style={styles.metricText}>{activeOrders} đang xử lý</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleCustomerPress],
  );

  if (!canAccess) {
    return (
      <Screen
        headerTitle="Khách hàng gara"
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
    (customersQuery.isLoading || statsQuery.isLoading) &&
    customers.length === 0;
  const isError = !customersQuery.isLoading && !!customersQuery.error && customers.length === 0;

  return (
    <Screen
      headerTitle="Khách hàng gara"
      showBackButton={false}
      statusBarStyle="light-content"
      useScrollView={false}
      backgroundColor={Colors.background.secondary}
    >
      {isInitialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách khách hàng...</Text>
        </View>
      ) : isError ? (
        <ErrorView
          message="Không thể tải danh sách khách hàng"
          onRetry={() => customersQuery.refetch()}
          icon="people-outline"
        />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCustomer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || customersQuery.isFetching || statsQuery.isFetching}
              onRefresh={handleRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <Text style={styles.screenTitle}>Tệp khách hàng</Text>
              <Text style={styles.screenSubtitle}>
                Dữ liệu lấy trực tiếp từ namespace quản trị `/api/app/admin/customers`.
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{totalCustomers}</Text>
                  <Text style={styles.statLabel}>Tổng khách</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{newCustomers}</Text>
                  <Text style={styles.statLabel}>Mới gần đây</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{activeCustomers}</Text>
                  <Text style={styles.statLabel}>Đang hoạt động</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={40} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>Chưa có khách hàng nào</Text>
              <Text style={styles.emptySubtitle}>
                Backend chưa trả về bản ghi khách hàng cho gara hiện tại.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB tạo khách hàng mới */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="person-add-outline" size={22} color={Colors.background.light} />
      </TouchableOpacity>

      {/* Create customer modal */}
      {showCreateModal && (
        <CreateCustomerModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateCustomer}
        />
      )}
    </Screen>
  );
}

// ─── Create Customer Modal ────────────────────────────────────────────────────
interface CreateCustomerModalProps {
  onClose: () => void;
  onSave: (data: { name: string; phone: string; email: string }) => Promise<void>;
}

function CreateCustomerModal({ onClose, onSave }: CreateCustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên khách hàng không được để trống.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Lỗi', 'Số điện thoại không được để trống.');
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), phone: phone.trim(), email: email.trim() });
      Alert.alert('Thành công', 'Đã tạo khách hàng mới.');
      onClose();
    } catch {
      Alert.alert('Lỗi', 'Không thể tạo khách hàng. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.sheet}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Tạo khách hàng mới</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Tên *</Text>
          <TextInput
            style={modalStyles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên khách hàng"
            placeholderTextColor={Colors.text.secondary}
          />
        </View>
        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Số điện thoại *</Text>
          <TextInput
            style={modalStyles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại"
            placeholderTextColor={Colors.text.secondary}
            keyboardType="phone-pad"
          />
        </View>
        <View style={modalStyles.field}>
          <Text style={modalStyles.label}>Email</Text>
          <TextInput
            style={modalStyles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email (tuỳ chọn)"
            placeholderTextColor={Colors.text.secondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={modalStyles.actions}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[modalStyles.saveBtn, saving && modalStyles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color={Colors.background.light} />
              : <Text style={modalStyles.saveText}>Tạo</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.base,
    gap: spacing.md,
  },
  headerBlock: {
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statCard: {
    flex: 1,
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
  customerCard: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: spacing.base,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  customerName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  customerPhone: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  metricText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.primary,
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
    shadowColor: Colors.shadow?.default ?? '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  sheet: {
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  field: {
    gap: spacing.xs,
  },
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
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.background.light,
    fontWeight: Typography.weight.bold,
  },
});
