/**
 * AdminOperationsScreen — Bước 6: Warranties + Vehicles + Inspection
 * 2 tab: Warranties | Vehicles
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
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
import { isManagerRole } from '../../navigation/rolePolicy';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import {
  AdminEntity,
  useCreateAdminResourceMutation,
  useDeleteAdminResourceMutation,
  useGetAdminResourceDetailQuery,
  useGetAdminResourceListQuery,
  useGetAdminVehicleInspectionQuery,
  useUpdateAdminResourceMutation,
  useUploadAdminEntityAssetMutation,
  useUpsertAdminVehicleInspectionMutation,
  useDeleteAdminVehicleInspectionMutation,
} from '../../services/adminGarageApi';
import {
  createImageFormData,
  pickImageFromCamera,
  pickImageFromGallery,
  showImagePickerOptions,
  validateImageSize,
} from '../../utils/imageUpload';

type OpsTab = 'warranties' | 'vehicles';

const TABS: Array<{ key: OpsTab; label: string; icon: string }> = [
  { key: 'warranties', label: 'Bảo hành', icon: 'shield-checkmark-outline' },
  { key: 'vehicles', label: 'Xe', icon: 'car-sport-outline' },
];

export default function AdminOperationsScreen() {
  const userType = useAppSelector((s) => s.auth.userType);
  const canAccess = isManagerRole(userType);
  const [activeTab, setActiveTab] = useState<OpsTab>('warranties');

  if (!canAccess) {
    return (
      <Screen headerTitle="Vận hành" showBackButton statusBarStyle="light-content">
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={40} color={Colors.text.secondary} />
          <Text style={styles.emptyTitle}>Bạn không có quyền truy cập màn này</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      headerTitle="Vận hành"
      showBackButton
      statusBarStyle="light-content"
      useScrollView={false}
      backgroundColor={Colors.background.secondary}
    >
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Ionicons name={tab.icon as any} size={16} color={isActive ? Colors.primary : Colors.text.secondary} />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === 'warranties' && <WarrantiesTab />}
        {activeTab === 'vehicles' && <VehiclesTab />}
      </View>
    </Screen>
  );
}

// ─── Warranties Tab ───────────────────────────────────────────────────────────
function WarrantiesTab() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editItem, setEditItem] = useState<AdminEntity | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const listQuery = useGetAdminResourceListQuery({ resource: 'warranties' });
  const [createItem] = useCreateAdminResourceMutation();
  const [updateItem] = useUpdateAdminResourceMutation();
  const [deleteItem] = useDeleteAdminResourceMutation();

  const items = useMemo(() => {
    const all = listQuery.data || [];
    if (!search.trim()) return all;
    const q = search.trim().toLowerCase();
    return all.filter((item) =>
      String(item.license_plate || '').toLowerCase().includes(q) ||
      String(item.customer_name || '').toLowerCase().includes(q) ||
      String(item.service_name || '').toLowerCase().includes(q),
    );
  }, [listQuery.data, search]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await listQuery.refetch(); } finally { setRefreshing(false); }
  }, [listQuery]);

  const handleDelete = useCallback((item: AdminEntity) => {
    Alert.alert('Xóa bảo hành', 'Bạn có chắc muốn xóa bảo hành này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try {
            await deleteItem({ resource: 'warranties', id: item.id as string | number }).unwrap();
            await listQuery.refetch();
          } catch { Alert.alert('Lỗi', 'Không thể xóa.'); }
        },
      },
    ]);
  }, [deleteItem, listQuery]);

  const renderItem = useCallback(({ item }: { item: AdminEntity }) => {
    const plate = String(item.license_plate || '');
    const service = String(item.service_name || '');
    const endDate = String(item.end_date || item.warranty_end || '');
    const isExpired = !!endDate && new Date(endDate) < new Date();
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={[styles.iconCircle, isExpired && styles.iconCircleExpired]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={isExpired ? Colors.status.error : Colors.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{plate || `Bảo hành #${item.id}`}</Text>
            {service ? <Text style={styles.cardSub}>{service}</Text> : null}
            {endDate ? (
              <Text style={[styles.cardSub, isExpired && { color: Colors.status.error }]}>
                {isExpired ? 'Hết hạn: ' : 'Đến: '}{endDate}
              </Text>
            ) : null}
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setEditItem(item)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="create-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="trash-outline" size={18} color={Colors.status.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [handleDelete]);

  return (
    <View style={{ flex: 1 }}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm biển số, khách hàng, dịch vụ..."
          placeholderTextColor={Colors.text.secondary}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Ionicons name="close-circle" size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing || listQuery.isFetching} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          listQuery.isLoading ? (
            <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="shield-outline" size={40} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>Chưa có bảo hành nào</Text>
            </View>
          )
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={26} color={Colors.background.light} />
      </TouchableOpacity>
      {showCreateModal && (
        <WarrantyFormModal
          title="Tạo bảo hành"
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            await createItem({ resource: 'warranties', body: data }).unwrap();
            await listQuery.refetch();
            Alert.alert('Thành công', 'Đã tạo bảo hành.');
            setShowCreateModal(false);
          }}
        />
      )}
      {editItem && (
        <WarrantyFormModal
          title="Sửa bảo hành"
          initialValues={editItem}
          onClose={() => setEditItem(null)}
          onSave={async (data) => {
            await updateItem({ resource: 'warranties', id: editItem.id as string | number, body: data }).unwrap();
            await listQuery.refetch();
            Alert.alert('Thành công', 'Đã cập nhật.');
            setEditItem(null);
          }}
        />
      )}
    </View>
  );
}

// ─── Vehicles Tab ─────────────────────────────────────────────────────────────
function VehiclesTab() {
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<AdminEntity | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const listQuery = useGetAdminResourceListQuery(
    { resource: 'vehicles', params: search.trim() ? { q: search.trim() } : undefined },
  );
  const [updateItem] = useUpdateAdminResourceMutation();
  const [deleteItem] = useDeleteAdminResourceMutation();
  const [uploadAsset] = useUploadAdminEntityAssetMutation();

  const items = useMemo(() => listQuery.data || [], [listQuery.data]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await listQuery.refetch(); } finally { setRefreshing(false); }
  }, [listQuery]);

  const handleDelete = useCallback((item: AdminEntity) => {
    Alert.alert('Xóa xe', `Xóa xe "${item.license_plate}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try {
            await deleteItem({ resource: 'vehicles', id: item.id as string | number }).unwrap();
            await listQuery.refetch();
          } catch { Alert.alert('Lỗi', 'Không thể xóa.'); }
        },
      },
    ]);
  }, [deleteItem, listQuery]);

  const handleUploadImage = useCallback((item: AdminEntity) => {
    const doUpload = async (asset: any) => {
      if (!asset || !validateImageSize(asset)) return;
      try {
        const formData = createImageFormData(asset, 'image');
        await uploadAsset({ resource: 'vehicles', id: item.id as string | number, action: 'upload-image', body: formData }).unwrap();
        await listQuery.refetch();
        Alert.alert('Thành công', 'Đã cập nhật ảnh xe.');
      } catch { Alert.alert('Lỗi', 'Không thể upload ảnh.'); }
    };
    showImagePickerOptions(
      async () => doUpload(await pickImageFromCamera()),
      async () => { const assets = await pickImageFromGallery(); doUpload(assets[0]); },
    );
  }, [listQuery, uploadAsset]);

  const renderItem = useCallback(({ item }: { item: AdminEntity }) => {
    const plate = String(item.license_plate || '');
    const model = String(item.model || '');
    const imageUrl = String(item.image_url || '');
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <TouchableOpacity style={styles.thumb} onPress={() => handleUploadImage(item)} activeOpacity={0.8}>
            {imageUrl
              ? <Image source={{ uri: imageUrl }} style={styles.thumbImage} />
              : <View style={styles.thumbPlaceholder}><Ionicons name="car-outline" size={20} color={Colors.text.secondary} /></View>}
            <View style={styles.thumbEditBadge}><Ionicons name="camera" size={10} color={Colors.background.light} /></View>
          </TouchableOpacity>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{plate}</Text>
            {model ? <Text style={styles.cardSub}>{model}</Text> : null}
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setSelectedVehicle(item)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="trash-outline" size={18} color={Colors.status.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [handleDelete, handleUploadImage]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm theo biển số..."
          placeholderTextColor={Colors.text.secondary}
          returnKeyType="search"
          onSubmitEditing={() => listQuery.refetch()}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing || listQuery.isFetching} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          listQuery.isLoading ? (
            <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={40} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>Chưa có xe nào</Text>
            </View>
          )
        }
      />
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onUpdate={async (data) => {
            await updateItem({ resource: 'vehicles', id: selectedVehicle.id as string | number, body: data }).unwrap();
            await listQuery.refetch();
            Alert.alert('Thành công', 'Đã cập nhật xe.');
            setSelectedVehicle(null);
          }}
        />
      )}
    </View>
  );
}

// ─── Warranty Form Modal ──────────────────────────────────────────────────────
function WarrantyFormModal({
  title,
  initialValues,
  onClose,
  onSave,
}: {
  title: string;
  initialValues?: AdminEntity;
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const fields = [
    { key: 'order_id', label: 'Mã đơn hàng (order_id)', placeholder: 'VD: 123' },
    { key: 'customer_id', label: 'Mã khách hàng (customer_id)', placeholder: 'VD: 45' },
    { key: 'warranty_period', label: 'Thời hạn bảo hành (tháng)', placeholder: 'VD: 12' },
    { key: 'start_date', label: 'Ngày bắt đầu (YYYY-MM-DD)', placeholder: '2026-01-01' },
    { key: 'note', label: 'Ghi chú', placeholder: 'Tuỳ chọn' },
  ];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach((f) => { init[f.key] = initialValues ? String(initialValues[f.key] ?? '') : ''; });
    return init;
  });
  const [saving, setSaving] = useState(false);

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.sheet}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {fields.map((f) => (
            <View key={f.key} style={modalStyles.field}>
              <Text style={modalStyles.label}>{f.label}</Text>
              <TextInput
                style={modalStyles.input}
                value={values[f.key]}
                onChangeText={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.text.secondary}
              />
            </View>
          ))}
        </ScrollView>
        <View style={modalStyles.actions}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[modalStyles.saveBtn, saving && { opacity: 0.6 }]}
            disabled={saving}
            onPress={async () => {
              setSaving(true);
              try {
                const payload: Record<string, string> = {};
                fields.forEach((f) => { if (values[f.key]?.trim()) payload[f.key] = values[f.key].trim(); });
                await onSave(payload);
              } catch { Alert.alert('Lỗi', 'Không thể lưu.'); }
              finally { setSaving(false); }
            }}
          >
            {saving ? <ActivityIndicator size="small" color={Colors.background.light} /> : <Text style={modalStyles.saveText}>Lưu</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Vehicle Detail + Inspection Modal ───────────────────────────────────────
function VehicleDetailModal({
  vehicle,
  onClose,
  onUpdate,
}: {
  vehicle: AdminEntity;
  onClose: () => void;
  onUpdate: (data: Record<string, string>) => Promise<void>;
}) {
  const vehicleId = vehicle.id as string | number;
  const inspectionQuery = useGetAdminVehicleInspectionQuery(vehicleId);
  const [upsertInspection] = useUpsertAdminVehicleInspectionMutation();
  const [deleteInspection] = useDeleteAdminVehicleInspectionMutation();

  const [model, setModel] = useState(String(vehicle.model || ''));
  const [inspCert, setInspCert] = useState('');
  const [inspDate, setInspDate] = useState('');
  const [inspExpiry, setInspExpiry] = useState('');
  const [saving, setSaving] = useState(false);

  // Populate inspection fields when data loads
  React.useEffect(() => {
    if (inspectionQuery.data) {
      const d = inspectionQuery.data as Record<string, unknown>;
      setInspCert(String(d.certificate_number || ''));
      setInspDate(String(d.inspection_date || ''));
      setInspExpiry(String(d.expiry_date || ''));
    }
  }, [inspectionQuery.data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (model.trim()) await onUpdate({ model: model.trim() });
      if (inspCert.trim() || inspDate.trim()) {
        await upsertInspection({
          vehicleId,
          body: {
            certificate_number: inspCert.trim(),
            inspection_date: inspDate.trim(),
            expiry_date: inspExpiry.trim(),
          },
        }).unwrap();
      }
      Alert.alert('Thành công', 'Đã cập nhật xe.');
      onClose();
    } catch { Alert.alert('Lỗi', 'Không thể lưu.'); }
    finally { setSaving(false); }
  };

  const handleDeleteInspection = () => {
    Alert.alert('Xóa kiểm định', 'Bạn có chắc muốn xóa thông tin kiểm định?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try {
            await deleteInspection(vehicleId).unwrap();
            Alert.alert('Thành công', 'Đã xóa kiểm định.');
            onClose();
          } catch { Alert.alert('Lỗi', 'Không thể xóa.'); }
        },
      },
    ]);
  };

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.sheet}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Xe: {String(vehicle.license_plate || '')}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={modalStyles.sectionLabel}>Thông tin xe</Text>
          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Mẫu xe</Text>
            <TextInput style={modalStyles.input} value={model} onChangeText={setModel} placeholder="VD: Toyota Vios" placeholderTextColor={Colors.text.secondary} />
          </View>

          <Text style={[modalStyles.sectionLabel, { marginTop: spacing.base }]}>Kiểm định</Text>
          {inspectionQuery.isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: spacing.sm }} />
          ) : (
            <>
              <View style={modalStyles.field}>
                <Text style={modalStyles.label}>Số giấy kiểm định</Text>
                <TextInput style={modalStyles.input} value={inspCert} onChangeText={setInspCert} placeholder="Nhập số" placeholderTextColor={Colors.text.secondary} />
              </View>
              <View style={modalStyles.field}>
                <Text style={modalStyles.label}>Ngày kiểm định (YYYY-MM-DD)</Text>
                <TextInput style={modalStyles.input} value={inspDate} onChangeText={setInspDate} placeholder="2026-01-01" placeholderTextColor={Colors.text.secondary} />
              </View>
              <View style={modalStyles.field}>
                <Text style={modalStyles.label}>Ngày hết hạn (YYYY-MM-DD)</Text>
                <TextInput style={modalStyles.input} value={inspExpiry} onChangeText={setInspExpiry} placeholder="2028-01-01" placeholderTextColor={Colors.text.secondary} />
              </View>
              {inspectionQuery.data && (
                <TouchableOpacity style={modalStyles.dangerBtn} onPress={handleDeleteInspection}>
                  <Ionicons name="trash-outline" size={16} color={Colors.status.error} />
                  <Text style={modalStyles.dangerText}>Xóa kiểm định</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
        <View style={modalStyles.actions}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[modalStyles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color={Colors.background.light} /> : <Text style={modalStyles.saveText}>Lưu</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tabItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: Colors.border.light,
    backgroundColor: Colors.background.secondary,
  },
  tabItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  tabLabel: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.xs, color: Colors.text.secondary },
  tabLabelActive: { color: Colors.primary, fontFamily: Typography.fontFamily.bold },
  listContent: { padding: spacing.base, gap: spacing.sm, paddingBottom: spacing['4xl'] },
  card: { backgroundColor: Colors.background.light, borderRadius: borderRadius['2xl'], padding: spacing.base, borderWidth: 1, borderColor: Colors.border.light },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.base },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  iconCircleExpired: { backgroundColor: '#FEE2E2' },
  thumb: { position: 'relative', width: 52, height: 52, borderRadius: borderRadius.xl, overflow: 'visible' },
  thumbImage: { width: 52, height: 52, borderRadius: borderRadius.xl },
  thumbPlaceholder: { width: 52, height: 52, borderRadius: borderRadius.xl, backgroundColor: Colors.background.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border.light },
  thumbEditBadge: { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.background.light },
  cardInfo: { flex: 1, gap: 3 },
  cardName: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.size.base, color: Colors.text.primary, fontWeight: Typography.weight.bold },
  cardSub: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.text.secondary, lineHeight: 16 },
  cardActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  iconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.secondary },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, margin: spacing.base, backgroundColor: Colors.background.light, borderRadius: borderRadius.xl, paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderWidth: 1, borderColor: Colors.border.light },
  searchInput: { flex: 1, fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.base, color: Colors.text.primary, padding: 0 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['4xl'], paddingHorizontal: spacing.xl, gap: spacing.sm },
  emptyTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.size.lg, color: Colors.text.primary, textAlign: 'center' },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
});

const modalStyles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end', zIndex: 100 },
  sheet: { backgroundColor: Colors.background.light, borderTopLeftRadius: borderRadius['3xl'], borderTopRightRadius: borderRadius['3xl'], padding: spacing.lg, gap: spacing.base, paddingBottom: spacing['3xl'], maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.size.lg, color: Colors.text.primary, fontWeight: Typography.weight.bold },
  sectionLabel: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.size.base, color: Colors.text.primary, fontWeight: Typography.weight.bold, marginBottom: spacing.sm },
  field: { gap: spacing.xs, marginBottom: spacing.sm },
  label: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.text.secondary },
  input: { backgroundColor: Colors.background.secondary, borderRadius: borderRadius.xl, paddingHorizontal: spacing.base, paddingVertical: spacing.md, fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.base, color: Colors.text.primary, borderWidth: 1, borderColor: Colors.border.light },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: Colors.border.light, alignItems: 'center' },
  cancelText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.base, color: Colors.text.secondary },
  saveBtn: { flex: 2, paddingVertical: spacing.md, borderRadius: borderRadius.xl, backgroundColor: Colors.primary, alignItems: 'center' },
  saveText: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.size.base, color: Colors.background.light, fontWeight: Typography.weight.bold },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  dangerText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.status.error },
});
