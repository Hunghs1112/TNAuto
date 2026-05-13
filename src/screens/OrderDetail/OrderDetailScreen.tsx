// src/screens/OrderDetail/OrderDetailScreen.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import {
  View, Text, FlatList, Image, ActivityIndicator, ScrollView,
  Modal, TouchableOpacity, RefreshControl, Alert, StyleSheet, TextInput,
} from 'react-native';
import Screen from '../../components/layout/Screen/Screen';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';
import ErrorView from '../../components/Loading/ErrorView';
import { useGetOrderDetailsQuery } from '../../services/customerApi';
import {
  useGetAdminResourceDetailQuery,
  useGetAdminResourceListQuery,
  useGetAdminResourceImagesQuery,
  useUpdateAdminServiceOrderStatusMutation,
  useAssignAdminServiceOrderMutation,
  useCompleteAdminServiceOrderMutation,
  useCreateAdminResourceMutation,
  useCreateAdminResourceImageMutation,
  useDeleteAdminResourceImageMutation,
} from '../../services/adminGarageApi';
import { useUploadSingleImageMutation } from '../../services/imageApi';
import { ServiceOrderImage } from '../../types/api.types';
import { styles } from './styles';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { isManagerRole } from '../../navigation/rolePolicy';
import {
  createImageFormData,
  pickImageFromCamera,
  pickImageFromGallery,
  showImagePickerOptions,
  validateImageSize,
} from '../../utils/imageUpload';

const OrderDetailScreen = ({ route }: { route: { params: { id: string } } }) => {
  const { id } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const hasGarageContext = useAppSelector(
    (state) => Boolean(state.garageContext.garageCode && state.garageContext.resolved),
  );
  const userType = useAppSelector((s) => s.auth.userType);
  const isAdminManager = isManagerRole(userType);
  const isDealerOnly = userType === 'dealer';
  const customerOrderQuery = useGetOrderDetailsQuery(id, {
    skip: isAdminManager || (userType === 'customer' && !hasGarageContext) || isDealerOnly,
  });
  const adminOrderQuery = useGetAdminResourceDetailQuery(
    { resource: 'service-orders', id },
    { skip: !isAdminManager },
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const orderData = (isAdminManager ? adminOrderQuery.data : customerOrderQuery.data) as any;
  const isLoading = isAdminManager ? adminOrderQuery.isLoading : customerOrderQuery.isLoading;
  const error = isAdminManager ? adminOrderQuery.error : customerOrderQuery.error;
  const refetch = isAdminManager ? adminOrderQuery.refetch : customerOrderQuery.refetch;
  const isFetching = isAdminManager ? adminOrderQuery.isFetching : customerOrderQuery.isFetching;

  // Admin mutations
  const [updateStatus] = useUpdateAdminServiceOrderStatusMutation();
  const [assignOrder] = useAssignAdminServiceOrderMutation();
  const [completeOrder] = useCompleteAdminServiceOrderMutation();

  // Admin image management
  const adminImagesQuery = useGetAdminResourceImagesQuery(
    { resource: 'service-orders', parentId: id },
    { skip: !isAdminManager },
  );
  const [createImage] = useCreateAdminResourceImageMutation();
  const [deleteImage] = useDeleteAdminResourceImageMutation();
  const [uploadSingleImage] = useUploadSingleImageMutation();
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Employees list for assign picker — fetch fresh, no transform
  const employeesQuery = useGetAdminResourceListQuery(
    { resource: 'employees' },
    { skip: !isAdminManager },
  );
  const rawEmployees = (employeesQuery.data || []) as any[];

  // Admin action modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    if (isDealerOnly) {
      navigation.replace('Category');
    }
  }, [isDealerOnly, navigation]);

  useEffect(() => {
    if (userType === 'customer' && !hasGarageContext) {
      navigation.replace('SelectGarage');
    }
  }, [hasGarageContext, navigation, userType]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (refreshError) {
      console.error('Error refreshing order:', refreshError);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Admin handlers
  const handleUpdateStatus = useCallback(async (status: string) => {
    try {
      await updateStatus({ id, body: { status } }).unwrap();
      await refetch();
      setShowStatusModal(false);
      Alert.alert('Thành công', `Đã cập nhật trạng thái thành "${status}".`);
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
    }
  }, [id, refetch, updateStatus]);

  const handleAssign = useCallback(async (employeeId: string | number) => {
    try {
      await assignOrder({ id, body: { employee_id: employeeId } }).unwrap();
      await refetch();
      setShowAssignModal(false);
      Alert.alert('Thành công', 'Đã gán nhân viên cho đơn hàng.');
    } catch {
      Alert.alert('Lỗi', 'Không thể gán nhân viên. Vui lòng thử lại.');
    }
  }, [assignOrder, id, refetch]);

  const handleComplete = useCallback(async (deliveryDate: string, note: string) => {
    try {
      await completeOrder({ id, body: { delivery_date: deliveryDate, note } }).unwrap();
      await refetch();
      setShowCompleteModal(false);
      Alert.alert('Thành công', 'Đơn hàng đã được hoàn thành.');
    } catch {
      Alert.alert('Lỗi', 'Không thể hoàn thành đơn. Vui lòng thử lại.');
    }
  }, [completeOrder, id, refetch]);

  const handleUploadImage = useCallback((statusAtTime: 'received' | 'completed') => {
    const doUpload = async (asset: any) => {
      if (!asset || !validateImageSize(asset)) return;
      setUploadingImage(true);
      try {
        // Bước 1: upload file lên /api/upload/single → lấy URL
        const formData = createImageFormData(asset, 'image');
        const uploadResult = await uploadSingleImage(formData).unwrap();
        const imageUrl = uploadResult.url || uploadResult.image_url;
        if (!imageUrl) throw new Error('Upload không trả về URL');

        // Bước 2: lưu metadata ảnh vào đơn hàng
        await createImage({
          resource: 'service-orders',
          body: {
            order_id: id,
            image_url: imageUrl,
            status_at_time: statusAtTime,
          },
        }).unwrap();
        await adminImagesQuery.refetch();
        await refetch();
        Alert.alert('Thành công', 'Đã thêm ảnh.');
      } catch {
        Alert.alert('Lỗi', 'Không thể upload ảnh. Vui lòng thử lại.');
      } finally {
        setUploadingImage(false);
      }
    };
    showImagePickerOptions(
      async () => doUpload(await pickImageFromCamera()),
      async () => { const assets = await pickImageFromGallery(); doUpload(assets[0]); },
    );
  }, [adminImagesQuery, createImage, id, refetch, uploadSingleImage]);

  const handleDeleteImage = useCallback((imageId: string | number) => {
    Alert.alert('Xóa ảnh', 'Bạn có chắc muốn xóa ảnh này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try {
            await deleteImage({ resource: 'service-orders', id: imageId }).unwrap();
            await adminImagesQuery.refetch();
            await refetch();
          } catch {
            Alert.alert('Lỗi', 'Không thể xóa ảnh.');
          }
        },
      },
    ]);
  }, [adminImagesQuery, deleteImage, refetch]);

  // MUST be called before any early returns
  const getImageUrl = useCallback((url: string) => {
    return url;
  }, []);

  if (isDealerOnly || (userType === 'customer' && !hasGarageContext)) {
    return null;
  }

  // Early returns MUST come after all hooks
  if (isLoading) {
    return (
      <Screen
        headerTitle="Phiếu dịch vụ"
        showBackButton
        safeAreaTopColor={Colors.primary}
        statusBarStyle="light-content"
      >
        <View style={[styles.whiteSection, styles.centerContent]}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
        </View>
      </Screen>
    );
  }

  if (error || !orderData) {
    return (
      <Screen
        headerTitle="Phiếu dịch vụ"
        showBackButton
        safeAreaTopColor={Colors.primary}
        statusBarStyle="light-content"
      >
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <ErrorView 
              message="Không tìm thấy đơn hàng"
              onRetry={refetch}
              icon="document-text-outline"
            />
          </View>
        </View>
      </Screen>
    );
  }

  const getStatusText = () => {
    switch (orderData.status) {
      case 'received':
        return 'Đã đặt lịch';
      case 'ready_for_pickup':
        return 'Chờ xác nhận';
      case 'in_progress':
        return 'Đang xử lý';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'canceled':
        return 'Đã hủy';
      default:
        return orderData.status;
    }
  };

  const getStatusColor = () => {
    switch (orderData.status) {
      case 'received':
        return Colors.background.yellow; // #feb052
      case 'ready_for_pickup':
        return Colors.status.warning; // #FFCC00
      case 'in_progress':
        return Colors.background.red; // #DA1C12
      case 'completed':
        return Colors.background.green; // #34C759
      case 'cancelled':
        return Colors.background.gray; // #9CA3AF
      case 'canceled':
        return Colors.background.gray; // #9CA3AF
      default:
        return Colors.background.yellow;
    }
  };

  const renderRow = (label: string, value: string | undefined | null | number, style?: any) => {
    if (value === null || value === undefined) return null;
    return (
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.valueText, style]}>
          {typeof value === 'string' && (label.includes('Ngày') || label.includes('Tạo')) 
            ? new Date(value).toLocaleDateString('vi-VN') 
            : value
          }
        </Text>
      </View>
    );
  };

  const renderImage = ({ item }: { item: ServiceOrderImage }) => {
    if (!item.image_url) {
      return (
        <View style={styles.imageContainer}>
          <View style={[styles.image, { backgroundColor: Colors.neutral[200], justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="image-outline" size={24} color={Colors.text.secondary} />
          </View>
          {item.description && <Text style={styles.imageDesc}>{item.description} ({item.status_at_time})</Text>}
        </View>
      );
    }
    const imageUrl = getImageUrl(item.image_url);
    return (
      <TouchableOpacity onPress={() => setSelectedImage(imageUrl)} activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image}
            resizeMode="cover"
            onError={() => {}}
            onLoad={() => {}}
          />
          {item.description && <Text style={styles.imageDesc}>{item.description} ({item.status_at_time})</Text>}
          {item.created_at && <Text style={styles.imageDate}>Ngày chụp: {new Date(item.created_at).toLocaleDateString('vi-VN')}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const isCompleted = orderData.status === 'completed';
  const showConfirmationRow = orderData.status !== 'ready_for_pickup' && orderData.status !== 'completed';
  const warrantyEndStr = orderData.warranty?.warranty_end || (orderData.warranty as any)?.end_date;
  const warrantyEndDate = warrantyEndStr ? new Date(warrantyEndStr) : null;
  const isWarrantyExpired = warrantyEndDate && warrantyEndDate < new Date();

  return (
    <Screen
      headerTitle="Phiếu dịch vụ"
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
    >
      
      <View style={styles.whiteSection}>
        <View style={styles.body}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing || isFetching} onRefresh={handleRefresh} />}>
            {/* Main Bill Card - Ticket Style */}
            <View style={styles.billCard}>
              {/* Customer Name */}
              {renderRow('Tên khách hàng', orderData.customer_name || orderData.receiver_name)}

              {/* Garage Name */}
              {(orderData.garage?.name || orderData.garage_name) ? renderRow('Gara', orderData.garage?.name || orderData.garage_name) : null}

              {/* Service Type */}
              {renderRow('Loại dịch vụ', orderData.service_name)}

              {/* Employee */}
              {orderData.employee_name && renderRow('Nhân viên hỗ trợ', orderData.employee_name)}

              {/* Notes */}
              {orderData.note && renderRow('Ghi chú', orderData.note)}

              {/* Address */}
              {orderData.address && renderRow('Địa chỉ', orderData.address)}

              {/* Phone */}
              {renderRow('Số điện thoại', orderData.receiver_phone || orderData.customer_phone)}

              {/* License Plate */}
              {renderRow('Biển số xe', orderData.license_plate)}

              {/* Vehicle Type */}
              {orderData.vehicle_type && renderRow('Loại xe', orderData.vehicle_type)}

              {/* Receive Date */}
              {renderRow('Ngày đặt lịch', orderData.receive_date)}

              {/* Delivery Date */}
              {renderRow('Ngày nhận', orderData.delivery_date, { color: Colors.text.primary })}

              {/* Created Date */}
              {renderRow('Ngày tạo đơn', orderData.created_at)}

              {/* Divider */}
              <View style={styles.divider} />

              {/* Receive Images */}
              <View style={styles.imageSection}>
                <Text style={styles.imageLabel}>Ảnh khi nhận xe:</Text>
                {(orderData.images || []).length > 0 ? (
                  <FlatList<ServiceOrderImage>
                    alwaysBounceVertical={true}
                    data={(orderData.images || []).filter((img: ServiceOrderImage) => img.status_at_time === 'received')}
                    keyExtractor={(item, index) => `receive-${index}`}
                    renderItem={renderImage}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.imageList, { flexGrow: 1 }]}
                  />
                ) : (
                  <Text style={styles.noImageText}>Chưa có ảnh</Text>
                )}
              </View>

              {/* Status */}
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Tình trạng:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                  <Text style={styles.statusText}>{getStatusText()}</Text>
                </View>
              </View>

              {/* Delivery Images */}
              <View style={styles.imageSection}>
                <Text style={styles.imageLabel}>Ảnh khi bàn giao xe:</Text>
                {(orderData.images || []).length > 0 ? (
                  <FlatList<ServiceOrderImage>
                    alwaysBounceVertical={true}
                    data={(orderData.images || []).filter((img: ServiceOrderImage) => img.status_at_time === 'completed')}
                    keyExtractor={(item, index) => `delivery-${index}`}
                    renderItem={renderImage}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.imageList, { flexGrow: 1 }]}
                  />
                ) : (
                  <Text style={styles.noImageText}>Chưa có ảnh</Text>
                )}
              </View>

              {/* Dashed Divider */}
              <View style={styles.dashedDivider} />

              {/* Confirmation Row */}
              {showConfirmationRow && (
                <View style={styles.confirmationRow}>
                  <Text style={styles.confirmationText}>Đã đặt lịch dịch vụ vào ngày</Text>
                  <Text style={styles.confirmationDate}>{new Date(orderData.receive_date).toLocaleDateString('vi-VN')}</Text>
                  <View style={styles.checkbox}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.background.red} />
                  </View>
                </View>
              )}

              {/* Warranty End Row (only for completed) */}
              {isCompleted && warrantyEndDate && (
                <View style={[
                  styles.warrantyEndRow,
                  isWarrantyExpired && { backgroundColor: Colors.alpha.expired12 }
                ]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons 
                      name="shield-checkmark-outline" 
                      size={20} 
                      color={isWarrantyExpired ? Colors.warranty.expired : Colors.warranty.active} 
                      style={{ marginRight: 8 }} 
                    />
                    <Text style={styles.warrantyEndLabel}>
                      {isWarrantyExpired ? 'Bảo hành đã hết hạn' : 'Hạn hết bảo hành'}
                    </Text>
                  </View>
                  <Text style={[
                    styles.warrantyEndDate,
                    isWarrantyExpired && { color: Colors.warranty.expired }
                  ]}>
                    {warrantyEndDate.toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              )}

              {/* Customer app: no confirm API here per new contract */}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Admin action bar */}
      {isAdminManager && orderData && orderData.status !== 'completed' && orderData.status !== 'cancelled' && orderData.status !== 'canceled' && (
        <View style={adminStyles.actionBar}>
          <TouchableOpacity style={adminStyles.actionBtn} onPress={() => setShowStatusModal(true)}>
            <Ionicons name="swap-horizontal-outline" size={18} color={Colors.primary} />
            <Text style={adminStyles.actionBtnText}>Trạng thái</Text>
          </TouchableOpacity>
          <TouchableOpacity style={adminStyles.actionBtn} onPress={() => setShowAssignModal(true)}>
            <Ionicons name="person-add-outline" size={18} color={Colors.primary} />
            <Text style={adminStyles.actionBtnText}>Gán NV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={adminStyles.actionBtn} onPress={() => setShowImagesModal(true)}>
            <Ionicons name="images-outline" size={18} color={Colors.primary} />
            <Text style={adminStyles.actionBtnText}>Ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[adminStyles.actionBtn, adminStyles.actionBtnPrimary]}
            onPress={() => setShowCompleteModal(true)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.background.light} />
            <Text style={[adminStyles.actionBtnText, adminStyles.actionBtnTextPrimary]}>Xong</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Admin: images modal */}
      {isAdminManager && showImagesModal && (
        <OrderImagesModal
          orderId={id}
          images={(adminImagesQuery.data || []) as any[]}
          loading={adminImagesQuery.isLoading}
          uploading={uploadingImage}
          onClose={() => setShowImagesModal(false)}
          onUpload={handleUploadImage}
          onDelete={handleDeleteImage}
          onFullscreen={(url) => setSelectedImage(url)}
        />
      )}

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close-outline" size={30} color={Colors.background.light} />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

      {/* Status picker modal */}
      {showStatusModal && (
        <StatusPickerModal
          currentStatus={orderData?.status}
          onClose={() => setShowStatusModal(false)}
          onSelect={handleUpdateStatus}
        />
      )}

      {/* Assign employee modal */}
      {showAssignModal && (
        <AssignEmployeeModal
          employees={rawEmployees}
          currentEmployeeId={orderData?.employee_id}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssign}
        />
      )}

      {/* Complete order modal */}
      {showCompleteModal && (
        <CompleteOrderModal
          onClose={() => setShowCompleteModal(false)}
          onComplete={handleComplete}
        />
      )}
    </Screen>
  );
};

export default OrderDetailScreen;

// ─── Admin modals ─────────────────────────────────────────────────────────────

// ── Order Images Modal ────────────────────────────────────────────────────────
function OrderImagesModal({
  orderId,
  images,
  loading,
  uploading,
  onClose,
  onUpload,
  onDelete,
  onFullscreen,
}: {
  orderId: string;
  images: any[];
  loading: boolean;
  uploading: boolean;
  onClose: () => void;
  onUpload: (statusAtTime: 'received' | 'completed') => void;
  onDelete: (imageId: string | number) => void;
  onFullscreen: (url: string) => void;
}) {
  const received = images.filter((img) => img.status_at_time === 'received');
  const completed = images.filter((img) => img.status_at_time === 'completed');

  const renderImageItem = (img: any) => (
    <View key={String(img.id)} style={imgStyles.imgWrapper}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => img.image_url && onFullscreen(img.image_url)}>
        {img.image_url ? (
          <Image source={{ uri: img.image_url }} style={imgStyles.thumb} resizeMode="cover" />
        ) : (
          <View style={[imgStyles.thumb, imgStyles.thumbPlaceholder]}>
            <Ionicons name="image-outline" size={24} color={Colors.text.secondary} />
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={imgStyles.deleteBtn}
        onPress={() => onDelete(img.id)}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <Ionicons name="close-circle" size={20} color={Colors.status.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={adminStyles.overlay}>
      <View style={[adminStyles.sheet, { maxHeight: '80%' }]}>
        <View style={adminStyles.sheetHeader}>
          <Text style={adminStyles.sheetTitle}>Quản lý ảnh đơn</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: spacing.xl }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Received images */}
            <View style={imgStyles.section}>
              <View style={imgStyles.sectionHeader}>
                <Text style={imgStyles.sectionTitle}>Ảnh khi nhận xe ({received.length})</Text>
                <TouchableOpacity
                  style={imgStyles.addBtn}
                  onPress={() => onUpload('received')}
                  disabled={uploading}
                >
                  {uploading
                    ? <ActivityIndicator size="small" color={Colors.primary} />
                    : <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              </View>
              {received.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={imgStyles.imgRow}>
                    {received.map(renderImageItem)}
                  </View>
                </ScrollView>
              ) : (
                <Text style={imgStyles.emptyText}>Chưa có ảnh. Nhấn + để thêm.</Text>
              )}
            </View>

            {/* Completed images */}
            <View style={imgStyles.section}>
              <View style={imgStyles.sectionHeader}>
                <Text style={imgStyles.sectionTitle}>Ảnh khi bàn giao ({completed.length})</Text>
                <TouchableOpacity
                  style={imgStyles.addBtn}
                  onPress={() => onUpload('completed')}
                  disabled={uploading}
                >
                  {uploading
                    ? <ActivityIndicator size="small" color={Colors.primary} />
                    : <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              </View>
              {completed.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={imgStyles.imgRow}>
                    {completed.map(renderImageItem)}
                  </View>
                </ScrollView>
              ) : (
                <Text style={imgStyles.emptyText}>Chưa có ảnh. Nhấn + để thêm.</Text>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const imgStyles = StyleSheet.create({
  section: { gap: spacing.sm, marginBottom: spacing.base },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  imgRow: { flexDirection: 'row', gap: spacing.sm },
  imgWrapper: { position: 'relative' },
  thumb: { width: 80, height: 80, borderRadius: borderRadius.xl },
  thumbPlaceholder: {
    backgroundColor: Colors.background.secondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border.light,
  },
  deleteBtn: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: Colors.background.light,
    borderRadius: 10,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});

const ORDER_STATUSES = [
  { key: 'received', label: 'Mới nhận' },
  { key: 'in_progress', label: 'Đang xử lý' },
  { key: 'ready_for_pickup', label: 'Chờ bàn giao' },
];

function StatusPickerModal({
  currentStatus,
  onClose,
  onSelect,
}: {
  currentStatus: string;
  onClose: () => void;
  onSelect: (status: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <View style={adminStyles.overlay}>
      <View style={adminStyles.sheet}>
        <View style={adminStyles.sheetHeader}>
          <Text style={adminStyles.sheetTitle}>Cập nhật trạng thái</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        {ORDER_STATUSES.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[adminStyles.statusRow, s.key === currentStatus && adminStyles.statusRowActive]}
            disabled={loading || s.key === currentStatus}
            onPress={async () => {
              setLoading(true);
              await onSelect(s.key);
              setLoading(false);
            }}
          >
            <Text style={[adminStyles.statusLabel, s.key === currentStatus && adminStyles.statusLabelActive]}>
              {s.label}
            </Text>
            {s.key === currentStatus && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
            {loading && s.key !== currentStatus && null}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function AssignEmployeeModal({
  employees,
  currentEmployeeId,
  onClose,
  onAssign,
}: {
  employees: any[];
  currentEmployeeId?: string | number | null;
  onClose: () => void;
  onAssign: (id: string | number) => Promise<void>;
}) {
  const [assigning, setAssigning] = React.useState<string | null>(null);

  const handlePick = async (empId: string | number) => {
    const key = String(empId);
    setAssigning(key);
    try {
      await onAssign(empId);
    } finally {
      setAssigning(null);
    }
  };

  return (
    <View style={adminStyles.overlay}>
      <View style={adminStyles.sheet}>
        {/* Header */}
        <View style={adminStyles.sheetHeader}>
          <Text style={adminStyles.sheetTitle}>Chọn nhân viên</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* List */}
        {employees.length === 0 ? (
          <Text style={adminStyles.emptyText}>Chưa có nhân viên nào.</Text>
        ) : (
          employees.map((emp) => {
            const empId = String(emp.id ?? '');
            const empName = String(emp.name ?? '');
            const empPhone = String(emp.phone ?? '');
            const isActive = empId === String(currentEmployeeId ?? '');
            const isBusy = assigning === empId;

            return (
              <TouchableOpacity
                key={empId}
                style={[assignStyles.row, isActive && assignStyles.rowActive]}
                disabled={isBusy || isActive}
                activeOpacity={0.75}
                onPress={() => handlePick(emp.id)}
              >
                {/* Avatar placeholder */}
                <View style={[assignStyles.avatar, isActive && assignStyles.avatarActive]}>
                  <Text style={[assignStyles.avatarText, isActive && assignStyles.avatarTextActive]}>
                    {empName ? empName.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>

                {/* Info */}
                <View style={assignStyles.info}>
                  <Text style={[assignStyles.name, isActive && assignStyles.nameActive]}>
                    {empName || `Nhân viên #${empId}`}
                  </Text>
                  {empPhone ? (
                    <Text style={assignStyles.phone}>{empPhone}</Text>
                  ) : null}
                </View>

                {/* Right indicator */}
                {isBusy ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : isActive ? (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={Colors.text.secondary} />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
}

const assignStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: spacing.sm,
    backgroundColor: Colors.background.light,
  },
  rowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  avatarActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  avatarTextActive: {
    color: Colors.background.light,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  nameActive: {
    color: Colors.primary,
  },
  phone: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
});

function CompleteOrderModal({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: (deliveryDate: string, note: string) => Promise<void>;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [deliveryDate, setDeliveryDate] = useState(today);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!deliveryDate.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày bàn giao.');
      return;
    }
    setLoading(true);
    await onComplete(deliveryDate.trim(), note.trim());
    setLoading(false);
  };

  return (
    <View style={adminStyles.overlay}>
      <View style={adminStyles.sheet}>
        <View style={adminStyles.sheetHeader}>
          <Text style={adminStyles.sheetTitle}>Hoàn thành đơn</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={adminStyles.field}>
          <Text style={adminStyles.fieldLabel}>Ngày bàn giao (YYYY-MM-DD) *</Text>
          <TextInput
            style={adminStyles.input}
            value={deliveryDate}
            onChangeText={setDeliveryDate}
            placeholder="VD: 2026-05-10"
            placeholderTextColor={Colors.text.secondary}
          />
        </View>
        <View style={adminStyles.field}>
          <Text style={adminStyles.fieldLabel}>Ghi chú</Text>
          <TextInput
            style={[adminStyles.input, { height: 80, textAlignVertical: 'top' }]}
            value={note}
            onChangeText={setNote}
            placeholder="Ghi chú hoàn thành (tuỳ chọn)"
            placeholderTextColor={Colors.text.secondary}
            multiline
          />
        </View>
        <View style={adminStyles.modalActions}>
          <TouchableOpacity style={adminStyles.cancelBtn} onPress={onClose}>
            <Text style={adminStyles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[adminStyles.confirmBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator size="small" color={Colors.background.light} />
              : <Text style={adminStyles.confirmText}>Xác nhận</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Admin styles ─────────────────────────────────────────────────────────────
const adminStyles = StyleSheet.create({
  actionBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.base,
    backgroundColor: Colors.background.light,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.background.light,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    flex: 1.4,
  },
  actionBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  actionBtnTextPrimary: {
    color: Colors.background.light,
  },
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
    gap: spacing.sm,
    paddingBottom: spacing['3xl'],
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  statusRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  statusLabel: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
  },
  statusLabelActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  empPhone: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  field: { gap: spacing.xs },
  fieldLabel: {
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
  modalActions: {
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
  confirmBtn: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.background.light,
    fontWeight: Typography.weight.bold,
  },
});
