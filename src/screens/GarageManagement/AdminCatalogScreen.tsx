/**
 * AdminCatalogScreen — Quản lý danh mục (Bước 5)
 * 5 tab: Services | ServiceCategories | Products | Categories | Offers
 * Mỗi tab: list + CRUD + upload image
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
import { useNavigation } from '@react-navigation/native';

import { Screen } from '../../components/layout';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';
import { isManagerRole } from '../../navigation/rolePolicy';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import ErrorView from '../../components/Loading/ErrorView';
import {
  AdminEntity,
  AdminListResource,
  useCreateAdminResourceMutation,
  useDeleteAdminResourceMutation,
  useGetAdminResourceListQuery,
  useUpdateAdminResourceMutation,
  useUploadAdminEntityAssetMutation,
} from '../../services/adminGarageApi';
import {
  createImageFormData,
  pickImageFromCamera,
  pickImageFromGallery,
  showImagePickerOptions,
  validateImageSize,
} from '../../utils/imageUpload';

// ─── Tab config ───────────────────────────────────────────────────────────────
type CatalogTab = 'services' | 'service-categories' | 'products' | 'categories' | 'offers';

const TABS: Array<{ key: CatalogTab; label: string; icon: string }> = [
  { key: 'services', label: 'Dịch vụ', icon: 'construct-outline' },
  { key: 'service-categories', label: 'Nhóm DV', icon: 'layers-outline' },
  { key: 'products', label: 'Sản phẩm', icon: 'cube-outline' },
  { key: 'categories', label: 'Danh mục', icon: 'grid-outline' },
  { key: 'offers', label: 'Ưu đãi', icon: 'pricetag-outline' },
];

// Resources that support upload-image via uploadAdminEntityAsset
type UploadableResource = 'services' | 'service-categories' | 'categories' | 'offers';
const UPLOADABLE: CatalogTab[] = ['services', 'service-categories', 'categories', 'offers'];

// Field definitions per tab for create/edit forms
type FieldDef = { key: string; label: string; placeholder?: string; multiline?: boolean; keyboard?: 'default' | 'numeric' | 'decimal-pad' };

const FIELDS: Record<CatalogTab, FieldDef[]> = {
  services: [
    { key: 'name', label: 'Tên dịch vụ *', placeholder: 'Nhập tên' },
    { key: 'description', label: 'Mô tả', placeholder: 'Mô tả dịch vụ', multiline: true },
    { key: 'estimated_time', label: 'Thời gian ước tính (giây)', placeholder: 'VD: 3600', keyboard: 'numeric' },
    { key: 'warranty_period', label: 'Bảo hành (giây)', placeholder: 'VD: 2592000' },
  ],
  'service-categories': [
    { key: 'name', label: 'Tên nhóm *', placeholder: 'Nhập tên nhóm' },
    { key: 'description', label: 'Mô tả', placeholder: 'Mô tả nhóm', multiline: true },
  ],
  products: [
    { key: 'name', label: 'Tên sản phẩm *', placeholder: 'Nhập tên' },
    { key: 'description', label: 'Mô tả', placeholder: 'Mô tả sản phẩm', multiline: true },
    { key: 'price', label: 'Giá (VNĐ) *', placeholder: 'VD: 150000', keyboard: 'numeric' },
  ],
  categories: [
    { key: 'name', label: 'Tên danh mục *', placeholder: 'Nhập tên' },
    { key: 'description', label: 'Mô tả', placeholder: 'Mô tả danh mục', multiline: true },
  ],
  offers: [
    { key: 'name', label: 'Tên ưu đãi *', placeholder: 'Nhập tên' },
    { key: 'description', label: 'Mô tả', placeholder: 'Mô tả ưu đãi', multiline: true },
    { key: 'discount', label: 'Giảm giá (%)', placeholder: 'VD: 10', keyboard: 'numeric' },
    { key: 'valid_from', label: 'Từ ngày (YYYY-MM-DD)', placeholder: '2026-01-01' },
    { key: 'valid_to', label: 'Đến ngày (YYYY-MM-DD)', placeholder: '2026-12-31' },
  ],
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AdminCatalogScreen() {
  const userType = useAppSelector((s) => s.auth.userType);
  const canAccess = isManagerRole(userType);
  const [activeTab, setActiveTab] = useState<CatalogTab>('services');

  if (!canAccess) {
    return (
      <Screen headerTitle="Danh mục" showBackButton statusBarStyle="light-content">
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={40} color={Colors.text.secondary} />
          <Text style={styles.emptyTitle}>Bạn không có quyền truy cập màn này</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      headerTitle="Quản lý danh mục"
      showBackButton
      statusBarStyle="light-content"
      useScrollView={false}
      backgroundColor={Colors.background.secondary}
    >
      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Ionicons name={tab.icon as any} size={14} color={isActive ? Colors.primary : Colors.text.secondary} />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tab content */}
      <CatalogTabContent tab={activeTab} />
    </Screen>
  );
}

// ─── Tab content ──────────────────────────────────────────────────────────────
function CatalogTabContent({ tab }: { tab: CatalogTab }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editItem, setEditItem] = useState<AdminEntity | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const listQuery = useGetAdminResourceListQuery({ resource: tab as AdminListResource });
  const [createItem] = useCreateAdminResourceMutation();
  const [updateItem] = useUpdateAdminResourceMutation();
  const [deleteItem] = useDeleteAdminResourceMutation();
  const [uploadAsset] = useUploadAdminEntityAssetMutation();

  const items = useMemo(() => listQuery.data || [], [listQuery.data]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await listQuery.refetch(); } finally { setRefreshing(false); }
  }, [listQuery]);

  const handleCreate = useCallback(async (data: Record<string, string>) => {
    await createItem({ resource: tab as AdminListResource, body: data }).unwrap();
    await listQuery.refetch();
  }, [createItem, listQuery, tab]);

  const handleUpdate = useCallback(async (id: string | number, data: Record<string, string>) => {
    await updateItem({ resource: tab as AdminListResource, id, body: data }).unwrap();
    await listQuery.refetch();
  }, [listQuery, tab, updateItem]);

  const handleDelete = useCallback((item: AdminEntity) => {
    const name = String(item.name || item.id);
    Alert.alert(
      'Xóa',
      `Bạn có chắc muốn xóa "${name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem({ resource: tab as AdminListResource, id: item.id as string | number }).unwrap();
              await listQuery.refetch();
              Alert.alert('Thành công', 'Đã xóa.');
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa. Vui lòng thử lại.');
            }
          },
        },
      ],
    );
  }, [deleteItem, listQuery, tab]);

  const handleUploadImage = useCallback((item: AdminEntity) => {
    if (!UPLOADABLE.includes(tab)) return;
    const doUpload = async (asset: any) => {
      if (!asset || !validateImageSize(asset)) return;
      try {
        const formData = createImageFormData(asset, 'image');
        await uploadAsset({
          resource: tab as UploadableResource,
          id: item.id as string | number,
          action: 'upload-image',
          body: formData,
        }).unwrap();
        await listQuery.refetch();
        Alert.alert('Thành công', 'Đã cập nhật ảnh.');
      } catch {
        Alert.alert('Lỗi', 'Không thể upload ảnh. Vui lòng thử lại.');
      }
    };
    showImagePickerOptions(
      async () => doUpload(await pickImageFromCamera()),
      async () => { const assets = await pickImageFromGallery(); doUpload(assets[0]); },
    );
  }, [listQuery, tab, uploadAsset]);

  const renderItem = useCallback(({ item }: { item: AdminEntity }) => {
    const name = String(item.name || `#${item.id}`);
    const imageUrl = String(item.image_url || item.primary_image || '');
    const sub = buildSubtitle(tab, item);
    const canUpload = UPLOADABLE.includes(tab);

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          {/* Thumbnail */}
          <TouchableOpacity
            style={styles.thumb}
            onPress={canUpload ? () => handleUploadImage(item) : undefined}
            activeOpacity={canUpload ? 0.8 : 1}
          >
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.thumbImage} />
            ) : (
              <View style={styles.thumbPlaceholder}>
                <Ionicons name="image-outline" size={20} color={Colors.text.secondary} />
              </View>
            )}
            {canUpload && (
              <View style={styles.thumbEditBadge}>
                <Ionicons name="camera" size={10} color={Colors.background.light} />
              </View>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
            {sub ? <Text style={styles.cardSub} numberOfLines={2}>{sub}</Text> : null}
          </View>

          {/* Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setEditItem(item)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="create-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleDelete(item)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.status.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [handleDelete, handleUploadImage, tab]);

  const isInitialLoading = listQuery.isLoading && items.length === 0;
  const isError = !listQuery.isLoading && !!listQuery.error && items.length === 0;

  return (
    <View style={{ flex: 1 }}>
      {isInitialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : isError ? (
        <ErrorView
          message="Không thể tải dữ liệu"
          onRetry={() => listQuery.refetch()}
          icon="folder-open-outline"
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || listQuery.isFetching}
              onRefresh={handleRefresh}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={40} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>Chưa có dữ liệu</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={26} color={Colors.background.light} />
      </TouchableOpacity>

      {/* Create modal */}
      {showCreateModal && (
        <CatalogFormModal
          tab={tab}
          title={`Tạo ${TABS.find((t) => t.key === tab)?.label}`}
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            await handleCreate(data);
            Alert.alert('Thành công', 'Đã tạo mới.');
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Edit modal */}
      {editItem && (
        <CatalogFormModal
          tab={tab}
          title={`Sửa ${TABS.find((t) => t.key === tab)?.label}`}
          initialValues={editItem}
          onClose={() => setEditItem(null)}
          onSave={async (data) => {
            await handleUpdate(editItem.id as string | number, data);
            Alert.alert('Thành công', 'Đã cập nhật.');
            setEditItem(null);
          }}
        />
      )}
    </View>
  );
}

// ─── Subtitle builder ─────────────────────────────────────────────────────────
function buildSubtitle(tab: CatalogTab, item: AdminEntity): string {
  switch (tab) {
    case 'services': {
      const parts: string[] = [];
      if (item.description) parts.push(String(item.description));
      if (item.estimated_time) parts.push(`~${Math.round(Number(item.estimated_time) / 3600)}h`);
      return parts.join(' · ');
    }
    case 'products': {
      const price = Number(item.price);
      return price ? `${price.toLocaleString('vi-VN')}đ` : '';
    }
    case 'offers': {
      const parts: string[] = [];
      if (item.discount) parts.push(`-${item.discount}%`);
      if (item.valid_to) parts.push(`Đến ${String(item.valid_to)}`);
      return parts.join(' · ');
    }
    default:
      return item.description ? String(item.description) : '';
  }
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
function CatalogFormModal({
  tab,
  title,
  initialValues,
  onClose,
  onSave,
}: {
  tab: CatalogTab;
  title?: string;
  initialValues?: AdminEntity;
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const fields = FIELDS[tab];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach((f) => {
      init[f.key] = initialValues ? String(initialValues[f.key] ?? '') : '';
    });
    return init;
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // Validate required fields (those with * in label)
    for (const f of fields) {
      if (f.label.includes('*') && !values[f.key]?.trim()) {
        Alert.alert('Lỗi', `${f.label.replace(' *', '')} không được để trống.`);
        return;
      }
    }
    setSaving(true);
    try {
      // Filter out empty optional fields
      const payload: Record<string, string> = {};
      fields.forEach((f) => {
        if (values[f.key]?.trim()) payload[f.key] = values[f.key].trim();
      });
      await onSave(payload);
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
          <Text style={modalStyles.title}>{title ?? 'Chỉnh sửa'}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {fields.map((f) => (
            <View key={f.key} style={modalStyles.field}>
              <Text style={modalStyles.label}>{f.label}</Text>
              <TextInput
                style={[modalStyles.input, f.multiline && modalStyles.inputMultiline]}
                value={values[f.key]}
                onChangeText={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.text.secondary}
                keyboardType={f.keyboard ?? 'default'}
                multiline={f.multiline}
                numberOfLines={f.multiline ? 3 : 1}
                textAlignVertical={f.multiline ? 'top' : 'center'}
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    flexGrow: 0,
  },
  tabBarContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.secondary,
  },
  tabItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  listContent: {
    padding: spacing.base,
    gap: spacing.sm,
    paddingBottom: spacing['4xl'],
  },
  card: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  thumb: {
    position: 'relative',
    width: 52,
    height: 52,
    borderRadius: borderRadius.xl,
    overflow: 'visible',
  },
  thumbImage: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.xl,
  },
  thumbPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.xl,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  thumbEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.background.light,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  cardSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
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
    maxHeight: '85%',
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
  field: { gap: spacing.xs, marginBottom: spacing.sm },
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
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
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
