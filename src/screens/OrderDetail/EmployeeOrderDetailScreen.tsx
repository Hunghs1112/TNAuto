// src/screens/OrderDetail/EmployeeOrderDetailScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StatusBar, FlatList, Image, ActivityIndicator, ScrollView, TouchableOpacity, Alert, RefreshControl, Modal } from 'react-native';
import { RootView } from "../../components/layout";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import Header from '../../components/Header';
import ConfirmButton from '../../components/ConfirmButton';
import ErrorView from '../../components/Loading/ErrorView';
import { 
  useGetEmployeeOrderDetailsQuery,
  useUpdateEmployeeOrderStatusMutation 
} from '../../services/employeeApi';
import { 
  useUploadSingleImageMutation, 
  useUploadServiceOrderImageMutation 
} from '../../services/imageApi';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { RootState } from '../../redux/types';
import { ServiceOrderImage } from '../../types/api.types';
import { 
  pickImageFromGallery, 
  pickImageFromCamera,
  showImagePickerOptions,
  createImageFormData,
  validateImageSize
} from '../../utils/imageUpload';
import { styles } from './styles';
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import { useFocusEffect } from '@react-navigation/native';

const EmployeeOrderDetailScreen = ({ route }: { route: { params: { id: string } } }) => {
  const { id } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const { data: orderData, isLoading, error, refetch, isFetching } = useGetEmployeeOrderDetailsQuery(id);
  const [uploadSingleImage] = useUploadSingleImageMutation();
  const [uploadServiceOrderImage] = useUploadServiceOrderImageMutation();
  const [updateEmployeeOrderStatus] = useUpdateEmployeeOrderStatusMutation();
  const currentEmployee = useAppSelector((state: RootState) => state.employee.currentEmployee);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // == Helpers ==
  // MUST be declared before any early returns to keep hook order stable.
  const getImageUrl = useCallback((url: string) => {
    return url;
  }, []);

  if (isLoading) {
    return (
      <RootView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <Header title="Xử lí yêu cầu" />
        <View style={[styles.whiteSection, styles.centerContent]}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
        </View>
      </RootView>
    );
  }

  if (error || !orderData) {
    return (
      <RootView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <Header title="Xử lí yêu cầu" />
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <ErrorView 
              message="Không tìm thấy đơn hàng"
              onRetry={refetch}
              icon="document-text-outline"
            />
          </View>
        </View>
      </RootView>
    );
  }

  const handleUploadImageFromCamera = async (status_at_time: string) => {
    if (uploading) {
      Alert.alert('Thông báo', 'Đang tải ảnh lên, vui lòng đợi...');
      return;
    }

    try {
      setUploading(true);
      
      // Pick image from camera
      const asset = await pickImageFromCamera({
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
      });

      if (!asset || !asset.uri) {
        setUploading(false);
        return;
      }

      // Validate file size (max 5MB)
      if (!validateImageSize(asset, 5)) {
        setUploading(false);
        return;
      }

      // Step 1: Upload image file to server
      const formData = createImageFormData(asset, 'image');
      const uploadResult = await uploadSingleImage(formData).unwrap();

      // Step 2: Save image metadata with service order
      await uploadServiceOrderImage({
        order_id: id,
        image_url: uploadResult.url,
        status_at_time,
        uploaded_by: currentEmployee?.id || '0',
        description: '',
      }).unwrap();

      Alert.alert('Thành công', 'Tải ảnh lên thành công!');
      refetch();
      
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      Alert.alert('Lỗi', err?.data?.message || 'Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadImageFromGallery = async (status_at_time: string) => {
    if (uploading) {
      Alert.alert('Thông báo', 'Đang tải ảnh lên, vui lòng đợi...');
      return;
    }

    try {
      setUploading(true);
      
      // Pick image from gallery
      const assets = await pickImageFromGallery({
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        selectionLimit: 1,
      });

      if (!assets || assets.length === 0) {
        setUploading(false);
        return;
      }

      const asset = assets[0];

      // Validate file size (max 5MB)
      if (!validateImageSize(asset, 5)) {
        setUploading(false);
        return;
      }

      // Step 1: Upload image file to server
      const formData = createImageFormData(asset, 'image');
      const uploadResult = await uploadSingleImage(formData).unwrap();

      // Step 2: Save image metadata with service order
      await uploadServiceOrderImage({
        order_id: id,
        image_url: uploadResult.url,
        status_at_time,
        uploaded_by: currentEmployee?.id || '0',
        description: '',
      }).unwrap();

      Alert.alert('Thành công', 'Tải ảnh lên thành công!');
      refetch();
      
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      Alert.alert('Lỗi', err?.data?.message || 'Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadImage = (status_at_time: string) => {
    showImagePickerOptions(
      () => handleUploadImageFromCamera(status_at_time),
      () => handleUploadImageFromGallery(status_at_time)
    );
  };

  const handleUpdateStatus = async () => {
    if (!currentEmployee?.id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin nhân viên');
      return;
    }

    try {
      await updateEmployeeOrderStatus({ 
        id, 
        status: 'ready_for_pickup',
        employee_id: currentEmployee.id 
      }).unwrap();
      Alert.alert('Thành công', 'Cập nhật trạng thái thành công');
      refetch();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      const errorMessage = err?.data?.error || err?.data?.message || 'Cập nhật trạng thái thất bại';
      Alert.alert('Lỗi', errorMessage);
    }
  };

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
        return Colors.background.yellow;
      case 'ready_for_pickup':
        return Colors.status.warning;
      case 'in_progress':
        return Colors.background.red;
      case 'completed':
        return Colors.background.green;
      case 'cancelled':
        return Colors.background.gray;
      case 'canceled':
        return Colors.background.gray;
      default:
        return Colors.background.yellow;
    }
  };

  // Render data row
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
            onError={(error) => {
            }}
          />
          {item.description && <Text style={styles.imageDesc}>{item.description} ({item.status_at_time})</Text>}
          {item.created_at && <Text style={styles.imageDate}>Ngày chụp: {new Date(item.created_at).toLocaleDateString('vi-VN')}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const isCompleted = orderData.status === 'completed';

  return (
    <RootView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <Header title="Phiếu dịch vụ" />
      
      <View style={styles.whiteSection}>
        <View style={[styles.body, { paddingHorizontal: 16 }]}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing || isFetching} onRefresh={handleRefresh} />}>
            <View style={styles.billCard}>
              {renderRow('Khách hàng', orderData.customer_name || orderData.receiver_name)}
              {renderRow('Loại dịch vụ', orderData.service_name)}
              {orderData.employee_name && renderRow('Nhân viên hỗ trợ', orderData.employee_name)}
              {orderData.note && renderRow('Ghi chú', orderData.note)}
              {orderData.address && renderRow('Địa chỉ', orderData.address)}
              {renderRow('Số điện thoại', orderData.receiver_phone || orderData.customer_phone)}
              {renderRow('Biển số xe', orderData.license_plate)}
              {orderData.vehicle_type && renderRow('Loại xe', orderData.vehicle_type)}
              {renderRow('Ngày đặt lịch', orderData.receive_date)}
              {renderRow('Ngày nhận', orderData.delivery_date, { color: Colors.text.primary })}
              {renderRow('Ngày tạo đơn', orderData.created_at)}
              <View style={styles.divider} />
              <View style={styles.imageSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.imageLabel}>Ảnh khi nhận xe:</Text>
                  <TouchableOpacity 
                    style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]} 
                    onPress={() => handleUploadImage('received')}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color={Colors.text.primary} />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload-outline" size={20} color={Colors.text.primary} />
                        <Text style={styles.uploadButtonText}>Tải lên</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
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
              <View style={styles.imageSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.imageLabel}>Ảnh khi bàn giao xe:</Text>
                  <TouchableOpacity 
                    style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]} 
                    onPress={() => handleUploadImage('completed')}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color={Colors.text.primary} />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload-outline" size={20} color={Colors.text.primary} />
                        <Text style={styles.uploadButtonText}>Tải lên</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
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
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Tình trạng:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                  <Text style={styles.statusText}>{getStatusText()}</Text>
                </View>
              </View>
              {orderData.status !== 'ready_for_pickup' && orderData.status !== 'completed' && (
                <ConfirmButton
                  title="Cập nhật trạng thái"
                  onPress={handleUpdateStatus}
                  buttonColor={Colors.primary}
                  textColor={Colors.text.inverted}
                />
              )}
            </View>
          </ScrollView>
        </View>
      </View>

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
    </RootView>
  );
};

export default EmployeeOrderDetailScreen;