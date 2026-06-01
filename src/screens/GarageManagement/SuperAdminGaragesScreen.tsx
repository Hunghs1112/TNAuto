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

import { Screen } from '../../components/layout';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';
import { isSuperAdminRole } from '../../navigation/rolePolicy';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import ErrorView from '../../components/Loading/ErrorView';
import {
  AdminEntity,
  useCreateAdminResourceMutation,
  useDeleteAdminResourceMutation,
  useGetAdminResourceListQuery,
  useUpdateAdminResourceMutation,
} from '../../services/adminGarageApi';
import { mapAdminGarage, AdminGarage } from '../../services/adminMappers';

const mapGarage = mapAdminGarage;
type MappedGarage = AdminGarage;

export default function SuperAdminGaragesScreen() {
  const userType = useAppSelector((state) => state.auth.userType);
  const canAccess = isSuperAdminRole(userType);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editGarage, setEditGarage] = useState<MappedGarage | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const garagesQuery = useGetAdminResourceListQuery(
    { resource: 'garages' },
    { skip: !canAccess },
  );
  const [createGarage] = useCreateAdminResourceMutation();
  const [updateGarage] = useUpdateAdminResourceMutation();
  const [deleteGarage] = useDeleteAdminResourceMutation();

  const garages = useMemo(
    () => (garagesQuery.data || []).map(mapGarage),
    [garagesQuery.data],
  );

  const filteredGarages = useMemo(() => {
    if (!searchQuery.trim()) return garages;
    const q = searchQuery.toLowerCase().trim();
    return garages.filter(
      (g) =>
        g.name?.toLowerCase().includes(q) ||
        g.code?.toLowerCase().includes(q) ||
        g.address?.toLowerCase().includes(q),
    );
  }, [garages, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await garagesQuery.refetch(); }
    finally { setRefreshing(false); }
  }, [garagesQuery]);

  const handleCreate = useCallback(async (data: Record<string, string>) => {
    await createGarage({ resource: 'garages', body: data }).unwrap();
    await garagesQuery.refetch();
  }, [createGarage, garagesQuery]);

  const handleUpdate = useCallback(async (id: string, data: Record<string, string>) => {
    await updateGarage({ resource: 'garages', id, body: data }).unwrap();
    await garagesQuery.refetch();
  }, [garagesQuery, updateGarage]);

  const handleDelete = useCallback((garage: MappedGarage) => {
    Alert.alert(
      'Xóa gara',
      `Bạn có chắc muốn xóa gara "${garage.name}"? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa', style: 'destructive',
          onPress: async () => {
            try {
              await deleteGarage({ resource: 'garages', id: garage.id }).unwrap();
              await garagesQuery.refetch();
              Alert.alert('Thành công', 'Đã xóa gara.');
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa gara. Vui lòng thử lại.');
            }
          },
        },
      ],
    );
  }, [deleteGarage, garagesQuery]);

  if (!canAccess) {
    return (
      <Screen
        headerTitle="Hệ thống gara"
        showBackButton={false}
        statusBarStyle="light-content"
      >
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

  const isInitialLoading = garagesQuery.isLoading && garages.length === 0;
  const isError = !garagesQuery.isLoading && !!garagesQuery.error && garages.length === 0;

  const renderGarage = ({ item }: { item: MappedGarage }) => (
    <View style={styles.garageCard}>
      <View style={styles.garageHeader}>
        <View style={styles.garageIcon}>
          <Ionicons
            name={item.is_super_garage ? 'star-outline' : 'business-outline'}
            size={20}
            color={item.is_super_garage ? Colors.status.warning : Colors.primary}
          />
        </View>
        <View style={styles.garageMeta}>
          <Text style={styles.garageName}>{item.name}</Text>
          {item.code ? (
            <Text style={styles.garageCode}>Mã: {item.code}</Text>
          ) : null}
        </View>
        <View style={[styles.statusBadge, item.status === 'active' && styles.statusBadgeActive]}>
          <Text style={[styles.statusText, item.status === 'active' && styles.statusTextActive]}>
            {item.status || 'N/A'}
          </Text>
        </View>
      </View>
      {item.address ? (
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
          <Text style={styles.addressText}>{item.address}</Text>
        </View>
      ) : null}
      {/* CRUD actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setEditGarage(item)}
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
          <Text style={[styles.actionBtnText, { color: Colors.status.error }]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Screen
      headerTitle="Hệ thống gara"
      showBackButton={false}
      statusBarStyle="light-content"
      useScrollView={false}
      backgroundColor={Colors.background.secondary}
    >
      {isInitialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách gara...</Text>
        </View>
      ) : isError ? (
        <ErrorView
          message="Không thể tải danh sách gara"
          onRetry={() => garagesQuery.refetch()}
          icon="storefront-outline"
        />
      ) : (
        <FlatList
          data={filteredGarages}
          keyExtractor={(item) => item.id}
          renderItem={renderGarage}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || garagesQuery.isFetching}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <Text style={styles.screenTitle}>Quản lý hệ thống gara</Text>

              {/* Search bar */}
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
                <TextInput
                  style={styles.searchInput}
                  value={searchInput}
                  onChangeText={setSearchInput}
                  onBlur={() => setSearchQuery(searchInput)}
                  onSubmitEditing={() => setSearchQuery(searchInput)}
                  placeholder="Tìm theo tên, mã, địa chỉ..."
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

              <View style={styles.statRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{filteredGarages.length}</Text>
                  <Text style={styles.statLabel}>Tổng gara</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {filteredGarages.filter((g) => g.status === 'active').length}
                  </Text>
                  <Text style={styles.statLabel}>Đang hoạt động</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {filteredGarages.filter((g) => g.is_super_garage).length}
                  </Text>
                  <Text style={styles.statLabel}>Super gara</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={40} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>Chưa có gara nào</Text>
              <Text style={styles.emptySubtitle}>
                Backend chưa trả về dữ liệu từ `/api/app/admin/garages`.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB tạo gara mới */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={26} color={Colors.background.light} />
      </TouchableOpacity>

      {showCreateModal && (
        <GarageFormModal
          title="Tạo gara mới"
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            await handleCreate(data);
            Alert.alert('Thành công', 'Đã tạo gara mới.');
            setShowCreateModal(false);
          }}
        />
      )}

      {editGarage && (
        <GarageFormModal
          title="Sửa gara"
          initialValues={editGarage}
          onClose={() => setEditGarage(null)}
          onSave={async (data) => {
            await handleUpdate(editGarage.id, data);
            Alert.alert('Thành công', 'Đã cập nhật gara.');
            setEditGarage(null);
          }}
        />
      )}
    </Screen>
  );
}

// ─── Garage Form Modal ────────────────────────────────────────────────────────
function GarageFormModal({
  title,
  initialValues,
  onClose,
  onSave,
}: {
  title: string;
  initialValues?: Partial<MappedGarage>;
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const [name, setName] = useState(initialValues?.name || '');
  const [code, setCode] = useState(initialValues?.code || '');
  const [address, setAddress] = useState(initialValues?.address || '');
  const [status, setStatus] = useState(initialValues?.status || 'active');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Lỗi', 'Tên gara không được để trống.'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), code: code.trim(), address: address.trim(), status: status.trim() });
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.sheet}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        {[
          { label: 'Tên gara *', value: name, set: setName, placeholder: 'Nhập tên gara' },
          { label: 'Mã gara', value: code, set: setCode, placeholder: 'VD: GARAGE01', caps: 'characters' as const },
          { label: 'Địa chỉ', value: address, set: setAddress, placeholder: 'Nhập địa chỉ' },
          { label: 'Trạng thái', value: status, set: setStatus, placeholder: 'active / inactive' },
        ].map((f) => (
          <View key={f.label} style={modalStyles.field}>
            <Text style={modalStyles.label}>{f.label}</Text>
            <TextInput
              style={modalStyles.input}
              value={f.value}
              onChangeText={f.set}
              placeholder={f.placeholder}
              placeholderTextColor={Colors.text.secondary}
              autoCapitalize={f.caps}
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
              : <Text style={modalStyles.saveText}>Lưu</Text>}
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
  roleTag: {
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
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
  garageCard: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: spacing.sm,
  },
  garageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  garageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  garageMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  garageName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  garageCode: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
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
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addressText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    flex: 1,
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
});

const modalStyles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end', zIndex: 100 },
  sheet: { backgroundColor: Colors.background.light, borderTopLeftRadius: borderRadius['3xl'], borderTopRightRadius: borderRadius['3xl'], padding: spacing.lg, gap: spacing.base, paddingBottom: spacing['3xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.size.lg, color: Colors.text.primary, fontWeight: Typography.weight.bold },
  field: { gap: spacing.xs },
  label: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.text.secondary },
  input: { backgroundColor: Colors.background.secondary, borderRadius: borderRadius.xl, paddingHorizontal: spacing.base, paddingVertical: spacing.md, fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.base, color: Colors.text.primary, borderWidth: 1, borderColor: Colors.border.light },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: Colors.border.light, alignItems: 'center' },
  cancelText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.base, color: Colors.text.secondary },
  saveBtn: { flex: 2, paddingVertical: spacing.md, borderRadius: borderRadius.xl, backgroundColor: Colors.primary, alignItems: 'center' },
  saveText: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.size.base, color: Colors.background.light, fontWeight: Typography.weight.bold },
});
