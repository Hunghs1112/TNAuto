import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
  AdminEmployee,
  AdminEntity,
  AdminStats,
  useCreateAdminResourceMutation,
  useGetAdminResourceListQuery,
  useGetAdminStatsQuery,
} from '../../services/adminGarageApi';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const getNumber = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const pickStat = (stats: AdminStats | undefined, keys: string[]) => {
  if (!stats) return 0;
  for (const k of keys) if (stats[k] !== undefined) return getNumber(stats[k]);
  return 0;
};

const mapEmployee = (item: AdminEntity): AdminEmployee => ({
  ...(item as unknown as AdminEmployee),
  id: String(item.id || ''),
  name: String(item.name || 'Nhân viên chưa đặt tên'),
  phone: String(item.phone || ''),
});

export default function GarageEmployeesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const userType = useAppSelector((s) => s.auth.userType);
  const canAccess = isManagerRole(userType);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');

  const employeesQuery = useGetAdminResourceListQuery(
    { resource: 'employees', params: search.trim() ? { search: search.trim() } : undefined },
    { skip: !canAccess },
  );
  const statsQuery = useGetAdminStatsQuery({ resource: 'employees' }, { skip: !canAccess });
  const [createEmployee] = useCreateAdminResourceMutation();

  const employees = useMemo(() => (employeesQuery.data || []).map(mapEmployee), [employeesQuery.data]);

  const total = pickStat(statsQuery.data, ['total_employees', 'employees_total', 'count']);
  const active = pickStat(statsQuery.data, ['active_employees', 'working_employees', 'employees_with_active_orders']);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await Promise.all([employeesQuery.refetch(), statsQuery.refetch()]); }
    finally { setRefreshing(false); }
  }, [employeesQuery, statsQuery]);

  const handleCreate = useCallback(async (data: Record<string, string>) => {
    await createEmployee({ resource: 'employees', body: data }).unwrap();
    await employeesQuery.refetch();
  }, [createEmployee, employeesQuery]);

  const renderEmployee = useCallback(({ item }: { item: AdminEmployee }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('EmployeeDetail', { employeeId: String(item.id), employeeName: item.name })}
    >
      <View style={styles.cardHeader}>
        {item.avatar_url
          ? <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-outline" size={22} color={Colors.primary} />
            </View>
          )}
        <View style={styles.cardMeta}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardPhone}>{item.phone || 'Chưa có SĐT'}</Text>
          {item.position ? <Text style={styles.cardPosition}>{String(item.position)}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.text.secondary} />
      </View>
      <View style={styles.metricsRow}>
        <View style={styles.pill}>
          <Ionicons name="receipt-outline" size={13} color={Colors.primaryLight} />
          <Text style={styles.pillText}>{getNumber(item.total_orders)} đơn</Text>
        </View>
        <View style={styles.pill}>
          <Ionicons name="time-outline" size={13} color={Colors.status.warning} />
          <Text style={styles.pillText}>{getNumber(item.active_order_count)} đang xử lý</Text>
        </View>
        {item.status ? (
          <View style={[styles.pill, item.status === 'active' && styles.pillActive]}>
            <Text style={[styles.pillText, item.status === 'active' && styles.pillTextActive]}>
              {String(item.status)}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  ), [navigation]);

  if (!canAccess) {
    return (
      <Screen headerTitle="Nhân sự" showBackButton statusBarStyle="light-content">
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={40} color={Colors.text.secondary} />
          <Text style={styles.emptyTitle}>Bạn không có quyền truy cập màn này</Text>
        </View>
      </Screen>
    );
  }

  const isInitialLoading = (employeesQuery.isLoading || statsQuery.isLoading) && employees.length === 0;
  const isError = !employeesQuery.isLoading && !!employeesQuery.error && employees.length === 0;

  return (
    <Screen
      headerTitle="Nhân sự"
      showBackButton
      statusBarStyle="light-content"
      useScrollView={false}
      backgroundColor={Colors.background.secondary}
    >
      {isInitialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách nhân viên...</Text>
        </View>
      ) : isError ? (
        <ErrorView
          message="Không thể tải danh sách nhân viên"
          onRetry={() => employeesQuery.refetch()}
          icon="people-circle-outline"
        />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderEmployee}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || employeesQuery.isFetching}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <Text style={styles.screenTitle}>Quản lý nhân sự</Text>

              {/* Search bar */}
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Tìm theo tên, SĐT..."
                  placeholderTextColor={Colors.text.secondary}
                  returnKeyType="search"
                  onSubmitEditing={() => employeesQuery.refetch()}
                />
                {search ? (
                  <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Ionicons name="close-circle" size={16} color={Colors.text.secondary} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{total}</Text>
                  <Text style={styles.statLabel}>Tổng NV</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{active}</Text>
                  <Text style={styles.statLabel}>Đang làm việc</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-circle-outline" size={40} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>Chưa có nhân viên nào</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
        <Ionicons name="person-add-outline" size={22} color={Colors.background.light} />
      </TouchableOpacity>

      {showCreateModal && (
        <CreateEmployeeModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
        />
      )}
    </Screen>
  );
}

// ─── Create Employee Modal ────────────────────────────────────────────────────
function CreateEmployeeModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Lỗi', 'Tên nhân viên không được để trống.'); return; }
    if (!phone.trim()) { Alert.alert('Lỗi', 'Số điện thoại không được để trống.'); return; }
    if (!password.trim()) { Alert.alert('Lỗi', 'Mật khẩu không được để trống.'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), phone: phone.trim(), password: password.trim(), position: position.trim() });
      Alert.alert('Thành công', 'Đã tạo nhân viên mới.');
      onClose();
    } catch {
      Alert.alert('Lỗi', 'Không thể tạo nhân viên. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.sheet}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Tạo nhân viên mới</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        {[
          { label: 'Tên *', value: name, set: setName, placeholder: 'Nhập tên nhân viên' },
          { label: 'Số điện thoại *', value: phone, set: setPhone, placeholder: 'Nhập SĐT', keyboard: 'phone-pad' as const },
          { label: 'Mật khẩu *', value: password, set: setPassword, placeholder: 'Nhập mật khẩu', secure: true },
          { label: 'Chức vụ', value: position, set: setPosition, placeholder: 'VD: Kỹ thuật viên' },
        ].map((f) => (
          <View key={f.label} style={modalStyles.field}>
            <Text style={modalStyles.label}>{f.label}</Text>
            <TextInput
              style={modalStyles.input}
              value={f.value}
              onChangeText={f.set}
              placeholder={f.placeholder}
              placeholderTextColor={Colors.text.secondary}
              keyboardType={f.keyboard}
              secureTextEntry={f.secure}
            />
          </View>
        ))}
        <View style={modalStyles.actions}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[modalStyles.saveBtn, saving && { opacity: 0.6 }]}
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
  listContent: { padding: spacing.base, gap: spacing.base },
  headerBlock: { gap: spacing.sm, marginBottom: spacing.sm },
  screenTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size['2xl'],
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
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
  card: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.base },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  cardMeta: { flex: 1, gap: 2 },
  cardName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  cardPhone: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  cardPosition: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  pillActive: { backgroundColor: Colors.primarySoft, borderWidth: 1, borderColor: Colors.primary },
  pillText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.primary,
  },
  pillTextActive: { color: Colors.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl },
  loadingText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing['4xl'], paddingHorizontal: spacing.xl, gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute', bottom: spacing.xl, right: spacing.xl,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginTop: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    padding: 0,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end', zIndex: 100,
  },
  sheet: {
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: borderRadius['3xl'], borderTopRightRadius: borderRadius['3xl'],
    padding: spacing.lg, gap: spacing.base, paddingBottom: spacing['3xl'],
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    borderWidth: 1, borderColor: Colors.border.light,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.xl,
    borderWidth: 1, borderColor: Colors.border.light, alignItems: 'center',
  },
  cancelText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.text.secondary,
  },
  saveBtn: {
    flex: 2, paddingVertical: spacing.md, borderRadius: borderRadius.xl,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  saveText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.background.light,
    fontWeight: Typography.weight.bold,
  },
});
