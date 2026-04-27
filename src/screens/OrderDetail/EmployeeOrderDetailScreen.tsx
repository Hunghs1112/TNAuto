import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { RootView } from '../../components/layout';
import Header from '../../components/Header';
import ConfirmButton from '../../components/ConfirmButton';
import ErrorView from '../../components/Loading/ErrorView';
import { Colors } from '../../constants/colors';
import {
  useClaimEmployeeOrderMutation,
  useGetEmployeeOrderDetailsQuery,
  useUpdateEmployeeOrderStatusMutation,
} from '../../services/employeeApi';
import {
  useUploadSingleImageMutation,
  useUploadServiceOrderImageMutation,
} from '../../services/imageApi';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { RootState } from '../../redux/types';
import { ServiceOrderImage } from '../../types/api.types';
import {
  pickImageFromGallery,
  pickImageFromCamera,
  showImagePickerOptions,
  createImageFormData,
  validateImageSize,
} from '../../utils/imageUpload';
import { styles } from './styles';

const getApiErrorMessage = (error: any, fallback: string) =>
  error?.data?.error || error?.data?.message || error?.error || fallback;

const EmployeeOrderDetailScreen = ({ route }: { route: { params: { id: string } } }) => {
  const { id } = route.params;
  const navigation = useNavigation<any>();
  const currentEmployee = useAppSelector((state: RootState) => state.employee.currentEmployee);
  const userType = useAppSelector((state: RootState) => state.auth.userType);
  const isDealer = (userType === 'dealer' || userType === 'garage_manager' || userType === 'garage_admin');
  const currentEmployeeId = currentEmployee?.id ? String(currentEmployee.id) : null;

  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null as string | null);
  const [claiming, setClaiming] = useState(false);

  const {
    data: orderData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetEmployeeOrderDetailsQuery(id);
  const [claimEmployeeOrder] = useClaimEmployeeOrderMutation();
  const [uploadSingleImage] = useUploadSingleImageMutation();
  const [uploadServiceOrderImage] = useUploadServiceOrderImageMutation();
  const [updateEmployeeOrderStatus] = useUpdateEmployeeOrderStatusMutation();

  const getImageUrl = useCallback((url: string) => url, []);

  useEffect(() => {
    if (isDealer) {
      navigation.replace('Category' as never);
    }
  }, [isDealer, navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const orderEmployeeId =
    orderData?.employee_id !== undefined && orderData?.employee_id !== null
      ? String(orderData.employee_id)
      : null;
  const isClaimable = Boolean(
    orderData &&
      orderData.status === 'received' &&
      !orderEmployeeId &&
      orderData.claimable !== false,
  );
  const isOwnedByCurrentEmployee = Boolean(
    currentEmployeeId && orderEmployeeId && currentEmployeeId === orderEmployeeId,
  );
  const canUpdateStatus = Boolean(orderData && isOwnedByCurrentEmployee && orderData.status === 'in_progress');
  const canUploadImages = isOwnedByCurrentEmployee;

  if (isDealer) {
    return null;
  }

  if (isLoading) {
    return (
      <RootView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <Header title="Xử lý yêu cầu" />
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
        <Header title="Xử lý yêu cầu" />
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

  const handleUploadImageFromCamera = async (statusAtTime: string) => {
    if (!canUploadImages) {
      Alert.alert('Thông báo', 'Bạn chỉ có thể tải ảnh lên khi đơn thuộc về mình.');
      return;
    }

    if (uploading) {
      Alert.alert('Thông báo', 'Đang tải ảnh lên, vui lòng đợi...');
      return;
    }

    try {
      setUploading(true);

      const asset = await pickImageFromCamera({
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
      });

      if (!asset || !asset.uri) {
        return;
      }

      if (!validateImageSize(asset, 5)) {
        return;
      }

      const formData = createImageFormData(asset, 'image');
      const uploadResult = await uploadSingleImage(formData).unwrap();

      await uploadServiceOrderImage({
        order_id: id,
        image_url: uploadResult.url,
        status_at_time: statusAtTime,
        uploaded_by: currentEmployeeId || '0',
        description: '',
      }).unwrap();

      Alert.alert('Thành công', 'Tải ảnh lên thành công.');
      await refetch();
    } catch (uploadError: any) {
      console.error('Failed to upload image:', uploadError);
      Alert.alert('Lỗi', getApiErrorMessage(uploadError, 'Tải ảnh lên thất bại. Vui lòng thử lại.'));
    } finally {
      setUploading(false);
    }
  };

  const handleUploadImageFromGallery = async (statusAtTime: string) => {
    if (!canUploadImages) {
      Alert.alert('Thông báo', 'Bạn chỉ có thể tải ảnh lên khi đơn thuộc về mình.');
      return;
    }

    if (uploading) {
      Alert.alert('Thông báo', 'Đang tải ảnh lên, vui lòng đợi...');
      return;
    }

    try {
      setUploading(true);

      const assets = await pickImageFromGallery({
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        selectionLimit: 1,
      });

      if (!assets || assets.length === 0) {
        return;
      }

      const asset = assets[0];

      if (!validateImageSize(asset, 5)) {
        return;
      }

      const formData = createImageFormData(asset, 'image');
      const uploadResult = await uploadSingleImage(formData).unwrap();

      await uploadServiceOrderImage({
        order_id: id,
        image_url: uploadResult.url,
        status_at_time: statusAtTime,
        uploaded_by: currentEmployeeId || '0',
        description: '',
      }).unwrap();

      Alert.alert('Thành công', 'Tải ảnh lên thành công.');
      await refetch();
    } catch (uploadError: any) {
      console.error('Failed to upload image:', uploadError);
      Alert.alert('Lỗi', getApiErrorMessage(uploadError, 'Tải ảnh lên thất bại. Vui lòng thử lại.'));
    } finally {
      setUploading(false);
    }
  };

  const handleUploadImage = (statusAtTime: string) => {
    if (!canUploadImages) {
      Alert.alert('Thông báo', 'Bạn chỉ có thể tải ảnh lên khi đơn thuộc về mình.');
      return;
    }

    showImagePickerOptions(
      () => handleUploadImageFromCamera(statusAtTime),
      () => handleUploadImageFromGallery(statusAtTime),
    );
  };

  const handleClaimOrder = async () => {
    if (!currentEmployeeId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin nhân viên.');
      return;
    }

    try {
      setClaiming(true);
      await claimEmployeeOrder({
        id,
        employee_id: currentEmployeeId,
      }).unwrap();

      await refetch();
      Alert.alert('Thành công', 'Nhận việc thành công.');
    } catch (claimError: any) {
      console.error('Failed to claim order:', claimError);
      await refetch();

      const statusCode = claimError?.status || claimError?.originalStatus;
      const message = getApiErrorMessage(claimError, 'Không thể nhận đơn này.');

      if (statusCode === 409) {
        Alert.alert('Đơn đã có người nhận', message);
        return;
      }

      Alert.alert('Không thể nhận đơn', message);
    } finally {
      setClaiming(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentEmployeeId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin nhân viên.');
      return;
    }

    if (!canUpdateStatus) {
      Alert.alert('Thông báo', 'Chỉ nhân viên đang giữ đơn mới được cập nhật trạng thái.');
      return;
    }

    try {
      await updateEmployeeOrderStatus({
        id,
        status: 'ready_for_pickup',
        employee_id: currentEmployeeId,
      }).unwrap();

      Alert.alert('Thành công', 'Cập nhật trạng thái thành công.');
      await refetch();
    } catch (updateError: any) {
      console.error('Failed to update status:', updateError);
      Alert.alert('Lỗi', getApiErrorMessage(updateError, 'Cập nhật trạng thái thất bại.'));
    }
  };

  const getStatusText = () => {
    switch (orderData.status) {
      case 'received':
        return 'Đang chờ nhận';
      case 'ready_for_pickup':
        return 'Sẵn sàng bàn giao';
      case 'in_progress':
        return 'Đang xử lý';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
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
      case 'canceled':
        return Colors.background.gray;
      default:
        return Colors.background.yellow;
    }
  };

  const renderRow = (label: string, value: string | undefined | null | number, style?: any) => {
    if (value === null || value === undefined) {
      return null;
    }

    return (
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.valueText, style]}>
          {typeof value === 'string' && (label.includes('Ngày') || label.includes('Tạo'))
            ? new Date(value).toLocaleDateString('vi-VN')
            : value}
        </Text>
      </View>
    );
  };

  const renderImage = ({ item }: { item: ServiceOrderImage }) => {
    if (!item.image_url) {
      return (
        <View style={styles.imageContainer}>
          <View
            style={[
              styles.image,
              {
                backgroundColor: Colors.neutral[200],
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <Ionicons name="image-outline" size={24} color={Colors.text.secondary} />
          </View>
          {item.description ? (
            <Text style={styles.imageDesc}>
              {item.description} ({item.status_at_time})
            </Text>
          ) : null}
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
          />
          {item.description ? (
            <Text style={styles.imageDesc}>
              {item.description} ({item.status_at_time})
            </Text>
          ) : null}
          {item.created_at ? (
            <Text style={styles.imageDate}>
              Ngày chụp: {new Date(item.created_at).toLocaleDateString('vi-VN')}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderImageSection = (title: string, statusAtTime: string, emptyText: string) => {
    const filteredImages = (orderData.images || []).filter(
      (image: ServiceOrderImage) => image.status_at_time === statusAtTime,
    );

    return (
      <View style={styles.imageSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.imageLabel}>{title}</Text>
          {canUploadImages ? (
            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={() => handleUploadImage(statusAtTime)}
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
          ) : null}
        </View>

        {filteredImages.length > 0 ? (
          <FlatList
            alwaysBounceVertical={true}
            data={filteredImages}
            keyExtractor={(item, index) => `${statusAtTime}-${item.id || index}`}
            renderItem={renderImage}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.imageList, { flexGrow: 1 }]}
          />
        ) : (
          <Text style={styles.noImageText}>{emptyText}</Text>
        )}
      </View>
    );
  };

  return (
    <RootView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <Header title="Phiếu dịch vụ" />

      <View style={styles.whiteSection}>
        <View style={[styles.body, { paddingHorizontal: 16 }]}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing || isFetching} onRefresh={handleRefresh} />
            }
          >
            <View style={styles.billCard}>
              {isClaimable ? (
                <View style={[styles.noteSection, { marginBottom: 16 }]}>
                  <Text style={styles.noteText}>
                    Chỉ đơn mới tạo, chưa giao ai mới có thể nhận việc. Bạn cần nhận việc trước khi cập nhật trạng thái hoặc tải ảnh.
                  </Text>
                </View>
              ) : null}

              {renderRow('Khách hàng', orderData.customer_name || orderData.receiver_name)}
              {renderRow('Loại dịch vụ', orderData.service_name)}
              {orderData.employee_name ? renderRow('Nhân viên hỗ trợ', orderData.employee_name) : null}
              {orderData.note ? renderRow('Ghi chú', orderData.note) : null}
              {orderData.address ? renderRow('Địa chỉ', orderData.address) : null}
              {renderRow('Số điện thoại', orderData.receiver_phone || orderData.customer_phone)}
              {renderRow('Biển số xe', orderData.license_plate)}
              {orderData.vehicle_type ? renderRow('Loại xe', orderData.vehicle_type) : null}
              {orderData.vehicle_model ? renderRow('Dòng xe', orderData.vehicle_model) : null}
              {renderRow('Ngày đặt lịch', orderData.receive_date)}
              {renderRow('Ngày nhận', orderData.delivery_date, { color: Colors.text.primary })}
              {renderRow('Ngày tạo đơn', orderData.created_at)}

              <View style={styles.divider} />

              {renderImageSection('Ảnh khi nhận xe:', 'received', 'Chưa có ảnh khi nhận xe')}
              {renderImageSection('Ảnh khi bàn giao xe:', 'completed', 'Chưa có ảnh khi bàn giao xe')}

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Tình trạng:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                  <Text style={styles.statusText}>{getStatusText()}</Text>
                </View>
              </View>

              {isClaimable ? (
                <ConfirmButton
                  title="Nhận việc"
                  onPress={handleClaimOrder}
                  buttonColor={Colors.primary}
                  textColor={Colors.text.inverted}
                  loading={claiming}
                  disabled={claiming}
                />
              ) : null}

              {canUpdateStatus ? (
                <ConfirmButton
                  title="Cập nhật trạng thái"
                  onPress={handleUpdateStatus}
                  buttonColor={Colors.primary}
                  textColor={Colors.text.inverted}
                />
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>

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
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </RootView>
  );
};

export default EmployeeOrderDetailScreen;

