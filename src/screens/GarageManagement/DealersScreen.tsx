import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { Screen } from '../../components/layout';
import ErrorView from '../../components/Loading/ErrorView';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';
import { isSuperAdminRole } from '../../navigation/rolePolicy';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import {
  useCreateAdminDealerMutation,
  useDeleteAdminResourceMutation,
  useGetAdminResourceListQuery,
  useUpdateAdminResourceMutation,
} from '../../services/adminGarageApi';

interface DealerItem {
  id: string | number;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  garage_id?: string | number | null;
  garage_code?: string | null;
  garage_name?: string | null;
  status?: string;
  created_at?: string;
}

export default function DealersScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const userType = useAppSelector((state) => state.auth.userType);
  const canAccess = isSuperAdminRole(userType);

  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editDealer, setEditDealer] = useState<DealerItem | null>(null);

  const dealersQuery = useGetAdminResourceListQuery(
    { resource: 'dealers' },
    { skip: !canAccess },
  );

  const [createDealer] = useCreateAdminDealerMutation();
  const [updateDealer] = useUpdateAdminResourceMutation();
  const [deleteDealer] = useDeleteAdminResourceMutation();

  const dealers = useMemo<DealerItem[]>(() => {
    const raw = (dealersQuery.data || []) as any[];
    return raw.map((item) => ({
      id: item.id,
      name: item.name || 'Đại lý chưa đặt tên',
      phone: item.phone || '',
      email: item.email ?? null,
      address: item.address ?? null,
      avatar_url: item.avatar_url ?? null,
      garage_id: item.garage_id ?? null,
      garage_code: item.garage_code ?? null,
      garage_name: item.garage_name ?? null,
      status: item.status ?? 'active',
      created_at: item.created_at,
    }));
  }, [dealersQuery.data]);

  const filteredDealers = useMemo(() => {
    if (!searchQuery.trim()) return dealers;
    const q = searchQuery.toLowerCase().trim();
    return dealers.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        (d.garage_name || '').toLowerCase().includes(q) ||
        (d.garage_code || '').toLowerCase().includes(q),
    );
  }, [dealers, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dealersQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [dealersQuery]);

  const handleCreate = useCallback(
    async (data: Record<string, unknown>) => {
      await createDealer(data).unwrap();
      await dealersQuery.refetch();
    },
    [createDealer, dealersQuery],
  );

  const handleUpdate = useCallback(
    async (id: string | number, data: Record<string, unknown>) => {
      await updateDealer({ resource: 'dealers', id, body: data }).unwrap();
      await dealersQuery.refetch();
    },
    [dealersQuery, updateDealer],
  );

  const handleDelete = useCallback(
    (d: DealerItem) => {
      Alert.alert(
        'Vô hiệu hóa đại lý',
        `Bạn có chắc muốn vô hiệu hóa đại lý "${d.name}"?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Vô hiệu hóa',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteDealer({ resource: 'dealers', id: d.id }).unwrap();
                await dealersQuery.refetch();
                Alert.alert('Thành công', 'Đã vô hiệu hóa đại lý.');
              } catch (err) {
                const msg =
                  err instanceof Error ? err.message : 'Không thể vô hiệu hóa.';
                Alert.alert('Lỗi', msg);
              }
            },
          },
        ],
      );
    },
    [deleteDealer, dealersQuery],
  );

  if (!canAccess) {
    return (
      <Screen headerTitle="Đại lý" statusBarStyle="light-content">
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={40} color={Colors.text.secondary} />
          <Text style={styles.emptyTitle}>Chỉ dành cho Super Admin</Text>
          <Text style={styles.emptySubtitle}>
            Bạn cần quyền garage_admin để truy cập màn này.
          </Text>
        </View>
      </Screen>
    );
  }

  const isInitialLoading = dealersQuery.isLoading && dealers.length === 0;
  const isError =
    !dealersQuery.isLoading && !!dealersQuery.error && dealers.length === 0;

  const renderDealer = ({ item }: { item: DealerItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Ionicons name="storefront-outline" size={22} color={Colors.primary} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.dealerName}>{item.name}</Text>
          <Text style={styles.dealerPhone}>{item.phone}</Text>
          {item.garage_name ? (
            <Text style={styles.dealerGarage}>
              {item.garage_name}
              {item.garage_code ? ` · ${item.garage_code}` : ''}
            </Text>
          ) : null}
          {item.address ? (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={12} color={Colors.text.secondary} />
              <Text style={styles.addressText}>{item.address}</Text>
            </View>
          ) : null}
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === 'active' && styles.statusBadgeActive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === 'active' && styles.statusTextActive,
            ]}
          >
            {item.status || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setEditDealer(item)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="create-outline" size={16} color={Colors.primary} />
          <Text style={styles.actionBtnText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDanger]}
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.status.error} />
          <Text style={[styles.actionBtnText, { color: Colors.status.error }]}>
            Vô hiệu
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Screen
      headerTitle="Đại lý"
      statusBarStyle="light-content"
      useScrollView={false}
      backgroundColor={Colors.background.secondary}
      onHeaderRightPress={() => navigation.navigate('DealerCatalog')}
    >
      {isInitialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách đại lý...</Text>
        </View>
      ) : isError ? (
        <ErrorView
          message="Không thể tải danh sách đại lý"
          onRetry={() => dealersQuery.refetch()}
          icon="storefront-outline"
        />
      ) : (
        <FlatList
          data={filteredDealers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderDealer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || dealersQuery.isFetching}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <Text style={styles.screenTitle}>Quản lý đại lý</Text>
              <Text style={styles.screenSubtitle}>
                Tạo và quản lý tài khoản đại lý cho hệ thống.
              </Text>

              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
                <TextInput
                  style={styles.searchInput}
                  value={searchInput}
                  onChangeText={setSearchInput}
                  onBlur={() => setSearchQuery(searchInput)}
                  onSubmitEditing={() => setSearchQuery(searchInput)}
                  placeholder="Tìm theo tên, SĐT, gara..."
                  placeholderTextColor={Colors.text.secondary}
                  returnKeyType="search"
                />
                {searchInput ? (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchInput('');
                      setSearchQuery('');
                    }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close-circle" size={16} color={Colors.text.secondary} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.statRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{filteredDealers.length}</Text>
                  <Text style={styles.statLabel}>Tổng đại lý</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {filteredDealers.filter((d) => d.status === 'active').length}
                  </Text>
                  <Text style={styles.statLabel}>Đang hoạt động</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {filteredDealers.filter((d) => d.email).length}
                  </Text>
                  <Text style={styles.statLabel}>Có email</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={40} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>Chưa có đại lý nào</Text>
              <Text style={styles.emptySubtitle}>
                Bấm nút + để tạo tài khoản đại lý.
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color={Colors.background.light} />
      </TouchableOpacity>

      {showCreateModal && (
        <DealerFormModal
          title="Tạo đại lý mới"
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            try {
              await handleCreate(data);
              Alert.alert('Thành công', 'Đã tạo đại lý mới.');
              setShowCreateModal(false);
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Không thể tạo.';
              Alert.alert('Lỗi', msg);
            }
          }}
        />
      )}

      {editDealer && (
        <DealerFormModal
          title="Sửa đại lý"
          initialValues={editDealer}
          onClose={() => setEditDealer(null)}
          onSave={async (data) => {
            try {
              await handleUpdate(editDealer.id, data);
              Alert.alert('Thành công', 'Đã cập nhật đại lý.');
              setEditDealer(null);
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Không thể cập nhật.';
              Alert.alert('Lỗi', msg);
            }
          }}
        />
      )}
    </Screen>
  );
}

// ─── Dealer Form Modal ─────────────────────────────────────────────────────────
function DealerFormModal({
  title,
  initialValues,
  onClose,
  onSave,
}: {
  title: string;
  initialValues?: Partial<DealerItem>;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}) {
  const isEdit = Boolean(initialValues?.id);
  const [name, setName] = useState(initialValues?.name || '');
  const [phone, setPhone] = useState(initialValues?.phone || '');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(initialValues?.email || '');
  const [address, setAddress] = useState(initialValues?.address || '');
  const [garageCode, setGarageCode] = useState(initialValues?.garage_code || '');
  const [status, setStatus] = useState(initialValues?.status || 'active');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đại lý.');
      return;
    }
    if (!isEdit && !phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại.');
      return;
    }
    if (!isEdit && !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu.');
      return;
    }
    if (!isEdit && password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (!isEdit && !garageCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã gara.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await onSave({
          name: name.trim(),
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          status,
        });
      } else {
        await onSave({
          garage_code: garageCode.trim(),
          name: name.trim(),
          phone: phone.trim(),
          password,
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          status,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu.';
      Alert.alert('Lỗi', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <Pressable style={modalStyles.sheet} onPress={() => {}}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Tên đại lý *</Text>
            <TextInput
              style={modalStyles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nhập tên đại lý"
              placeholderTextColor={Colors.text.secondary}
            />
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>
              Số điện thoại {isEdit ? '(không thể đổi)' : '*'}
            </Text>
            <TextInput
              style={[modalStyles.input, isEdit && modalStyles.inputDisabled]}
              value={phone}
              onChangeText={setPhone}
              placeholder="VD: 0987654321"
              placeholderTextColor={Colors.text.secondary}
              keyboardType="phone-pad"
              editable={!isEdit}
            />
          </View>

          {!isEdit && (
            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Mật khẩu *</Text>
              <TextInput
                style={modalStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Tối thiểu 6 ký tự"
                placeholderTextColor={Colors.text.secondary}
                secureTextEntry
              />
            </View>
          )}

          {!isEdit && (
            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Mã gara *</Text>
              <TextInput
                style={modalStyles.input}
                value={garageCode}
                onChangeText={(t) => setGarageCode(t.toUpperCase())}
                placeholder="VD: HQ"
                placeholderTextColor={Colors.text.secondary}
                autoCapitalize="characters"
              />
            </View>
          )}

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Email</Text>
            <TextInput
              style={modalStyles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@domain.com"
              placeholderTextColor={Colors.text.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Địa chỉ</Text>
            <TextInput
              style={modalStyles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ"
              placeholderTextColor={Colors.text.secondary}
              multiline
            />
          </View>

          <View style={modalStyles.switchRow}>
            <Text style={modalStyles.label}>Đang hoạt động</Text>
            <Switch
              value={status === 'active'}
              onValueChange={(v) => setStatus(v ? 'active' : 'inactive')}
              trackColor={{ false: Colors.border.light, true: Colors.primarySoft }}
              thumbColor={status === 'active' ? Colors.primary : Colors.background.light}
            />
          </View>

          <View style={modalStyles.actions}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={Colors.background.light} />
              ) : (
                <Text style={modalStyles.saveText}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: 100,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginTop: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
  statRow: {
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
  card: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: {
    flex: 1,
    gap: 2,
  },
  dealerName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  dealerPhone: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  dealerGarage: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  addressText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  statusBadgeActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  statusText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
  },
  statusTextActive: {
    color: Colors.primary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  actionBtnDanger: {
    borderColor: Colors.status.error,
    backgroundColor: '#FEF2F2',
  },
  actionBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
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
    minHeight: 48,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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