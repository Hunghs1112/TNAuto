import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
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
import ErrorView from '../../components/Loading/ErrorView';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';
import { isSuperAdminRole } from '../../navigation/rolePolicy';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import {
  useCreateAdminResourceMutation,
  useDeleteAdminResourceMutation,
  useGetAdminResourceListQuery,
  useUpdateAdminResourceMutation,
  useUploadAdminDealerCategoryImageMutation,
  useUploadAdminEntityAssetMutation,
} from '../../services/adminGarageApi';
import {
  createImageFormData,
  pickImageFromGallery,
  showImagePickerOptions,
  validateImageSize,
} from '../../utils/imageUpload';
import { DealerCategory, DealerProduct, DealerProductImage } from '../../services/dealerCatalog.types';

type Tab = 'categories' | 'products';

export default function DealerCatalogScreen() {
  const userType = useAppSelector((state) => state.auth.userType);
  const canAccess = isSuperAdminRole(userType);

  const [tab, setTab] = useState<Tab>('categories');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const dealersQuery = useGetAdminResourceListQuery(
    { resource: 'dealers' },
    { skip: !canAccess },
  );

  const dealers = useMemo(() => {
    const list = (dealersQuery.data || []) as any[];
    return list.map((d) => ({
      id: String(d.id),
      name: String(d.name || d.garage_name || 'Đại lý'),
      code: String(d.garage_code || ''),
    }));
  }, [dealersQuery.data]);

  if (!canAccess) {
    return (
      <Screen headerTitle="Catalog đại lý" statusBarStyle="light-content">
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

  return (
    <Screen
      headerTitle="Catalog đại lý"
      statusBarStyle="light-content"
      useScrollView={false}
      backgroundColor={Colors.background.secondary}
    >
      <View style={styles.tabsRow}>
        <TabButton
          label="Danh mục"
          icon="grid-outline"
          active={tab === 'categories'}
          onPress={() => setTab('categories')}
        />
        <TabButton
          label="Sản phẩm"
          icon="cube-outline"
          active={tab === 'products'}
          onPress={() => setTab('products')}
        />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          value={searchInput}
          onChangeText={setSearchInput}
          onBlur={() => setSearchQuery(searchInput)}
          onSubmitEditing={() => setSearchQuery(searchInput)}
          placeholder={
            tab === 'categories' ? 'Tìm danh mục...' : 'Tìm sản phẩm...'
          }
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

      {tab === 'categories' ? (
        <CategoriesTab
          dealers={dealers}
          searchQuery={searchQuery}
          refreshing={refreshing}
          setRefreshing={setRefreshing}
        />
      ) : (
        <ProductsTab
          dealers={dealers}
          searchQuery={searchQuery}
          refreshing={refreshing}
          setRefreshing={setRefreshing}
        />
      )}
    </Screen>
  );
}

// ─── Tab Button ────────────────────────────────────────────────────────────────
function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons
        name={icon}
        size={16}
        color={active ? Colors.primary : Colors.text.secondary}
      />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────
function CategoriesTab({
  dealers,
  searchQuery,
  refreshing,
  setRefreshing,
}: {
  dealers: { id: string; name: string; code: string }[];
  searchQuery: string;
  refreshing: boolean;
  setRefreshing: (v: boolean) => void;
}) {
  const categoriesQuery = useGetAdminResourceListQuery(
    { resource: 'dealer-categories' },
  );
  const [createCategory] = useCreateAdminResourceMutation();
  const [updateCategory] = useUpdateAdminResourceMutation();
  const [deleteCategory] = useDeleteAdminResourceMutation();
  const [uploadImage] = useUploadAdminDealerCategoryImageMutation();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCategory, setEditCategory] = useState<DealerCategory | null>(null);

  const categories = useMemo<DealerCategory[]>(() => {
    const raw = (categoriesQuery.data || []) as any[];
    return raw.map((c) => ({
      id: Number(c.id),
      name: String(c.name || 'Danh mục'),
      description: c.description ?? null,
      image_url: c.image_url ?? null,
      created_at: String(c.created_at || ''),
      updated_at: c.updated_at,
      product_count: c.product_count != null ? Number(c.product_count) : undefined,
    }));
  }, [categoriesQuery.data]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q),
    );
  }, [categories, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await categoriesQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [categoriesQuery, setRefreshing]);

  const handleDelete = useCallback(
    (c: DealerCategory) => {
      Alert.alert(
        'Xóa danh mục',
        `Bạn có chắc muốn xóa danh mục "${c.name}"?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteCategory({
                  resource: 'dealer-categories',
                  id: c.id,
                }).unwrap();
                await categoriesQuery.refetch();
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Không thể xóa.';
                Alert.alert('Lỗi', msg);
              }
            },
          },
        ],
      );
    },
    [categoriesQuery, deleteCategory],
  );

  const isInitialLoading = categoriesQuery.isLoading && categories.length === 0;
  const isError =
    !categoriesQuery.isLoading && !!categoriesQuery.error && categories.length === 0;

  const renderCategory = ({ item }: { item: DealerCategory }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.thumb}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.thumbImg} />
          ) : (
            <Ionicons name="image-outline" size={20} color={Colors.text.secondary} />
          )}
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          {item.product_count != null ? (
            <Text style={styles.cardBadge}>{item.product_count} sản phẩm</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setEditCategory(item)}
        >
          <Ionicons name="create-outline" size={14} color={Colors.primary} />
          <Text style={styles.actionBtnText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={async () => {
            const asset = await pickImageFromGallery();
            if (!asset) return;
            if (!validateImageSize(asset, 5)) return;
            try {
              await uploadImage({
                id: item.id,
                body: createImageFormData(asset, 'image'),
              }).unwrap();
              await categoriesQuery.refetch();
              Alert.alert('Thành công', 'Đã upload ảnh danh mục.');
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Không thể upload.';
              Alert.alert('Lỗi', msg);
            }
          }}
        >
          <Ionicons name="cloud-upload-outline" size={14} color={Colors.status.info} />
          <Text style={[styles.actionBtnText, { color: Colors.status.info }]}>Upload ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDanger]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={14} color={Colors.status.error} />
          <Text style={[styles.actionBtnText, { color: Colors.status.error }]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {isInitialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh mục...</Text>
        </View>
      ) : isError ? (
        <ErrorView
          message="Không thể tải danh mục"
          onRetry={() => categoriesQuery.refetch()}
          icon="grid-outline"
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCategory}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || categoriesQuery.isFetching}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="grid-outline" size={40} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>Chưa có danh mục</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={26} color={Colors.background.light} />
      </TouchableOpacity>

      {showCreateModal && (
        <CategoryFormModal
          title="Tạo danh mục mới"
          dealers={dealers}
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            try {
              await createCategory({ resource: 'dealer-categories', body: data }).unwrap();
              await categoriesQuery.refetch();
              setShowCreateModal(false);
              Alert.alert('Thành công', 'Đã tạo danh mục.');
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Không thể tạo.';
              Alert.alert('Lỗi', msg);
            }
          }}
        />
      )}

      {editCategory && (
        <CategoryFormModal
          title="Sửa danh mục"
          initialValues={editCategory}
          dealers={dealers}
          onClose={() => setEditCategory(null)}
          onSave={async (data) => {
            try {
              await updateCategory({
                resource: 'dealer-categories',
                id: editCategory.id,
                body: data,
              }).unwrap();
              await categoriesQuery.refetch();
              setEditCategory(null);
              Alert.alert('Thành công', 'Đã cập nhật danh mục.');
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Không thể cập nhật.';
              Alert.alert('Lỗi', msg);
            }
          }}
        />
      )}
    </View>
  );
}

// ─── Products Tab ──────────────────────────────────────────────────────────────
function ProductsTab({
  dealers,
  searchQuery,
  refreshing,
  setRefreshing,
}: {
  dealers: { id: string; name: string; code: string }[];
  searchQuery: string;
  refreshing: boolean;
  setRefreshing: (v: boolean) => void;
}) {
  const productsQuery = useGetAdminResourceListQuery(
    { resource: 'dealer-products' },
  );
  const categoriesQuery = useGetAdminResourceListQuery(
    { resource: 'dealer-categories' },
  );
  const [createProduct] = useCreateAdminResourceMutation();
  const [updateProduct] = useUpdateAdminResourceMutation();
  const [deleteProduct] = useDeleteAdminResourceMutation();
  const [uploadEntityAsset] = useUploadAdminEntityAssetMutation();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editProduct, setEditProduct] = useState<DealerProduct | null>(null);

  const categories = useMemo<DealerCategory[]>(() => {
    const raw = (categoriesQuery.data || []) as any[];
    return raw.map((c) => ({
      id: Number(c.id),
      name: String(c.name || 'Danh mục'),
      description: c.description ?? null,
      image_url: c.image_url ?? null,
      created_at: String(c.created_at || ''),
    }));
  }, [categoriesQuery.data]);

  const products = useMemo<DealerProduct[]>(() => {
    const raw = (productsQuery.data || []) as any[];
    return raw.map((p) => ({
      id: Number(p.id),
      name: String(p.name || 'Sản phẩm'),
      description: p.description ?? null,
      price: p.price != null ? Number(p.price) : 0,
      category_id: Number(p.category_id || 0),
      video_url: p.video_url ?? null,
      created_at: String(p.created_at || ''),
      images: Array.isArray(p.images) ? (p.images as DealerProductImage[]) : [],
      primary_image: p.primary_image
        ? ({
            id: Number(p.primary_image.id || p.primary_image.image_id || 0),
            image_url: String(p.primary_image.image_url || ''),
            is_primary: 1,
          } as DealerProductImage)
        : null,
    }));
  }, [productsQuery.data]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q),
    );
  }, [products, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await productsQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [productsQuery, setRefreshing]);

  const handleDelete = useCallback(
    (p: DealerProduct) => {
      Alert.alert(
        'Xóa sản phẩm',
        `Bạn có chắc muốn xóa sản phẩm "${p.name}"?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteProduct({
                  resource: 'dealer-products',
                  id: p.id,
                }).unwrap();
                await productsQuery.refetch();
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Không thể xóa.';
                Alert.alert('Lỗi', msg);
              }
            },
          },
        ],
      );
    },
    [deleteProduct, productsQuery],
  );

  const isInitialLoading = productsQuery.isLoading && products.length === 0;
  const isError =
    !productsQuery.isLoading && !!productsQuery.error && products.length === 0;

  const renderProduct = ({ item }: { item: DealerProduct }) => {
    const primary = item.primary_image?.image_url || item.images?.[0]?.image_url;
    const category = categories.find((c) => c.id === item.category_id);
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.thumb}>
            {primary ? (
              <Image source={{ uri: primary }} style={styles.thumbImg} />
            ) : (
              <Ionicons name="cube-outline" size={20} color={Colors.text.secondary} />
            )}
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>
              {category?.name || 'Chưa phân danh mục'}
            </Text>
            {item.price ? (
              <Text style={styles.cardBadge}>{formatPrice(item.price)} đ</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setEditProduct(item)}
          >
            <Ionicons name="create-outline" size={14} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              showImagePickerOptions(
                () => handlePickProductImage(item.id, 'camera'),
                () => handlePickProductImage(item.id, 'gallery'),
              );
            }}
          >
            <Ionicons name="cloud-upload-outline" size={14} color={Colors.status.info} />
            <Text style={[styles.actionBtnText, { color: Colors.status.info }]}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={14} color={Colors.status.error} />
            <Text style={[styles.actionBtnText, { color: Colors.status.error }]}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handlePickProductImage = async (productId: number, source: 'camera' | 'gallery') => {
    const asset =
      source === 'camera'
        ? (await import('../../utils/imageUpload')).pickImageFromCamera
          ? (await import('../../utils/imageUpload')).pickImageFromCamera()
          : null
        : (await pickImageFromGallery())[0] || null;
    if (!asset) return;
    if (!validateImageSize(asset, 5)) return;
    try {
      await uploadEntityAsset({
        resource: 'dealer-products',
        id: productId,
        action: 'upload-image',
        body: createImageFormData(asset, 'image'),
      }).unwrap();
      await productsQuery.refetch();
      Alert.alert('Thành công', 'Đã upload ảnh sản phẩm.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể upload.';
      Alert.alert('Lỗi', msg);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {isInitialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : isError ? (
        <ErrorView
          message="Không thể tải sản phẩm"
          onRetry={() => productsQuery.refetch()}
          icon="cube-outline"
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProduct}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || productsQuery.isFetching}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={40} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>Chưa có sản phẩm</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={26} color={Colors.background.light} />
      </TouchableOpacity>

      {showCreateModal && (
        <ProductFormModal
          title="Tạo sản phẩm"
          dealers={dealers}
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            try {
              await createProduct({ resource: 'dealer-products', body: data }).unwrap();
              await productsQuery.refetch();
              setShowCreateModal(false);
              Alert.alert('Thành công', 'Đã tạo sản phẩm.');
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Không thể tạo.';
              Alert.alert('Lỗi', msg);
            }
          }}
        />
      )}

      {editProduct && (
        <ProductFormModal
          title="Sửa sản phẩm"
          initialValues={editProduct}
          dealers={dealers}
          categories={categories}
          onClose={() => setEditProduct(null)}
          onSave={async (data) => {
            try {
              await updateProduct({
                resource: 'dealer-products',
                id: editProduct.id,
                body: data,
              }).unwrap();
              await productsQuery.refetch();
              setEditProduct(null);
              Alert.alert('Thành công', 'Đã cập nhật sản phẩm.');
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Không thể cập nhật.';
              Alert.alert('Lỗi', msg);
            }
          }}
        />
      )}
    </View>
  );
}

// ─── Category Form Modal ───────────────────────────────────────────────────────
function CategoryFormModal({
  title,
  initialValues,
  dealers,
  onClose,
  onSave,
}: {
  title: string;
  initialValues?: Partial<DealerCategory>;
  dealers: { id: string; name: string; code: string }[];
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}) {
  const isEdit = Boolean(initialValues?.id);
  const [dealerId, setDealerId] = useState(
    initialValues && 'dealer_id' in initialValues
      ? String((initialValues as any).dealer_id || '')
      : '',
  );
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [imageUrl, setImageUrl] = useState(initialValues?.image_url || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục.');
      return;
    }
    if (!isEdit && !dealerId) {
      Alert.alert('Lỗi', 'Vui lòng chọn đại lý.');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      };
      if (!isEdit) payload.dealer_id = dealerId;
      await onSave(payload);
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
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {!isEdit && (
            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Đại lý *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={modalStyles.chipRow}>
                  {dealers.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      style={[
                        modalStyles.chip,
                        dealerId === d.id && modalStyles.chipActive,
                      ]}
                      onPress={() => setDealerId(d.id)}
                    >
                      <Text
                        style={[
                          modalStyles.chipText,
                          dealerId === d.id && modalStyles.chipTextActive,
                        ]}
                      >
                        {d.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Tên danh mục *</Text>
            <TextInput
              style={modalStyles.input}
              value={name}
              onChangeText={setName}
              placeholder="VD: Phụ tùng"
              placeholderTextColor={Colors.text.secondary}
            />
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Mô tả</Text>
            <TextInput
              style={modalStyles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả danh mục"
              placeholderTextColor={Colors.text.secondary}
              multiline
            />
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>URL ảnh</Text>
            <TextInput
              style={modalStyles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://..."
              placeholderTextColor={Colors.text.secondary}
              autoCapitalize="none"
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

// ─── Product Form Modal ────────────────────────────────────────────────────────
function ProductFormModal({
  title,
  initialValues,
  dealers,
  categories,
  onClose,
  onSave,
}: {
  title: string;
  initialValues?: Partial<DealerProduct>;
  dealers: { id: string; name: string; code: string }[];
  categories: DealerCategory[];
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}) {
  const isEdit = Boolean(initialValues?.id);
  const [dealerId, setDealerId] = useState(
    initialValues && 'dealer_id' in initialValues
      ? String((initialValues as any).dealer_id || '')
      : '',
  );
  const [categoryId, setCategoryId] = useState<number | null>(
    initialValues?.category_id ?? null,
  );
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [price, setPrice] = useState(
    initialValues?.price != null ? String(initialValues.price) : '',
  );
  const [videoUrl, setVideoUrl] = useState(initialValues?.video_url || '');
  const [saving, setSaving] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!dealerId) return categories;
    return categories.filter(
      (c) => String((c as any).dealer_id || '') === dealerId,
    );
  }, [categories, dealerId]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (!isEdit && !dealerId) {
      Alert.alert('Lỗi', 'Vui lòng chọn đại lý.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục.');
      return;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá hợp lệ.');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        category_id: categoryId,
        name: name.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        video_url: videoUrl.trim() || undefined,
      };
      if (!isEdit) payload.dealer_id = dealerId;
      await onSave(payload);
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
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {!isEdit && (
            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Đại lý *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={modalStyles.chipRow}>
                  {dealers.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      style={[
                        modalStyles.chip,
                        dealerId === d.id && modalStyles.chipActive,
                      ]}
                      onPress={() => {
                        setDealerId(d.id);
                        setCategoryId(null);
                      }}
                    >
                      <Text
                        style={[
                          modalStyles.chipText,
                          dealerId === d.id && modalStyles.chipTextActive,
                        ]}
                      >
                        {d.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Danh mục *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={modalStyles.chipRow}>
                {filteredCategories.length === 0 ? (
                  <Text style={modalStyles.emptyText}>
                    {!dealerId
                      ? 'Chọn đại lý trước'
                      : 'Đại lý chưa có danh mục'}
                  </Text>
                ) : (
                  filteredCategories.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        modalStyles.chip,
                        categoryId === c.id && modalStyles.chipActive,
                      ]}
                      onPress={() => setCategoryId(c.id)}
                    >
                      <Text
                        style={[
                          modalStyles.chipText,
                          categoryId === c.id && modalStyles.chipTextActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </ScrollView>
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Tên sản phẩm *</Text>
            <TextInput
              style={modalStyles.input}
              value={name}
              onChangeText={setName}
              placeholder="VD: Lọc gió điều hòa"
              placeholderTextColor={Colors.text.secondary}
            />
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Giá *</Text>
            <TextInput
              style={modalStyles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="VD: 250000"
              placeholderTextColor={Colors.text.secondary}
              keyboardType="numeric"
            />
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Mô tả</Text>
            <TextInput
              style={modalStyles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả sản phẩm"
              placeholderTextColor={Colors.text.secondary}
              multiline
            />
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Video URL</Text>
            <TextInput
              style={modalStyles.input}
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="https://..."
              placeholderTextColor={Colors.text.secondary}
              autoCapitalize="none"
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

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(p: number): string {
  if (!Number.isFinite(p)) return '0';
  return p.toLocaleString('vi-VN');
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  tabActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.weight.bold,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    marginHorizontal: spacing.base,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
  listContent: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  cardMeta: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  cardSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  cardBadge: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.xs,
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
    gap: 4,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
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
    maxHeight: '90%',
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
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  chipActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weight.bold,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
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