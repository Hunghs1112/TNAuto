// src/screens/OrderDetail/EmployeeOrderDetailScreen.tsx
import React from 'react';
import { View, Text, StatusBar, FlatList, Image, ActivityIndicator, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import Header from '../../components/Header/Header';
import ConfirmButton from '../../components/Button/ConfirmButton';
import { useGetEmployeeOrderDetailsQuery } from '../../services/employeeApi';
import { useUploadServiceOrderImageMutation } from '../../services/imageApi';
import { useUpdateServiceOrderStatusMutation } from '../../services/serviceOrderApi';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { RootState } from '../../redux/types';
import { launchImageLibrary, MediaType, Asset } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';
import { styles } from './styles';
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

const EmployeeOrderDetailScreen = ({ route }: { route: { params: { id: string } } }) => {
  const { id } = route.params;
  const { refreshing, onRefresh } = useAutoRefresh();
  const { data: responseData, isLoading, error, refetch } = useGetEmployeeOrderDetailsQuery(id);
  const [uploadServiceOrderImage] = useUploadServiceOrderImageMutation();
  const [updateServiceOrderStatus] = useUpdateServiceOrderStatusMutation();
  const currentEmployee = useAppSelector((state: RootState) => state.employee.currentEmployee);

  const orderData = responseData?.data;

  console.log('EmployeeOrderDetailScreen: Loading order', id, { isLoading, error, responseData, orderData });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Xử lí yêu cầu" />
        </View>
        <View style={[styles.whiteSection, styles.centerContent]}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !orderData) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Xử lí yêu cầu" />
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const requestStoragePermission = async () => {
    console.log('EmployeeOrderDetailScreen: Requesting storage permission');
    if (Platform.OS === 'android') {
      let permissionKey = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      if (Platform.Version >= 33) {
        permissionKey = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
      }
      const status = await check(permissionKey);
      console.log('EmployeeOrderDetailScreen: Permission status:', status);
      if (status !== RESULTS.GRANTED) {
        const result = await request(permissionKey);
        console.log('EmployeeOrderDetailScreen: Permission result:', result);
        return result === RESULTS.GRANTED;
      }
      return true;
    }
    return true;
  };

  const handleUploadImage = async (status_at_time: string) => {
    console.log('EmployeeOrderDetailScreen: Starting image upload for status', status_at_time);
    
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Cannot access storage for image selection. Please enable in settings.');
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      console.log('EmployeeOrderDetailScreen: Image picker response', response);
      
      if (response.didCancel || response.errorMessage) {
        console.log('EmployeeOrderDetailScreen: User cancelled or error:', response.errorMessage);
        return;
      }

      if (!response.assets || response.assets.length === 0) {
        Alert.alert('Error', 'No image selected.');
        return;
      }

      const asset: Asset = response.assets[0];
      if (!asset.uri) {
        Alert.alert('Error', 'Failed to get image URI.');
        return;
      }

      const mockImageUrl = asset.uri;
      const description = '';

      uploadServiceOrderImage({
        order_id: id,
        image_url: mockImageUrl,
        status_at_time,
        uploaded_by: currentEmployee?.id || '0',
        description,
      })
        .unwrap()
        .then(() => {
          console.log('EmployeeOrderDetailScreen: Image uploaded successfully');
          Alert.alert('Success', 'Image uploaded successfully');
          refetch();
        })
        .catch((err) => {
          console.error('EmployeeOrderDetailScreen: Failed to upload image:', err);
          Alert.alert('Error', 'Failed to upload image');
        });
    });
  };

  const handleUpdateStatus = async () => {
    console.log('EmployeeOrderDetailScreen: Updating status to ready_for_pickup');
    try {
      await updateServiceOrderStatus({ id, status: 'ready_for_pickup' }).unwrap();
      console.log('EmployeeOrderDetailScreen: Status updated successfully');
      Alert.alert('Thành công', 'Cập nhật trạng thái thành công');
      refetch();
    } catch (err) {
      console.error('EmployeeOrderDetailScreen: Failed to update status:', err);
      Alert.alert('Lỗi', 'Cập nhật trạng thái thất bại');
    }
  };

  const getStatusText = () => {
    console.log('getStatusText: status =', orderData.status);
    switch (orderData.status) {
      case 'received':
        return 'Đã đặt lịch';
      case 'ready_for_pickup':
        return 'Chờ xác nhận';
      case 'in_progress':
        return 'Đang xử lý';
      case 'completed':
        return 'Hoàn thành';
      case 'canceled':
        return 'Đã hủy';
      default:
        return orderData.status;
    }
  };

  const getStatusColor = () => {
    console.log('getStatusColor: status =', orderData.status);
    switch (orderData.status) {
      case 'received':
        return Colors.background.yellow;
      case 'ready_for_pickup':
        return Colors.warning;
      case 'in_progress':
        return Colors.background.red;
      case 'completed':
        return Colors.background.green;
      case 'canceled':
        return Colors.background.gray;
      default:
        return Colors.background.yellow;
    }
  };

  const renderRow = (label: string, value: string | undefined | null | number, style?: any) => {
    console.log('renderRow:', label, value);
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

  const renderImage = ({ item }: { item: { image_url: string; description?: string; status_at_time: string; created_at?: string } }) => {
    console.log('renderImage:', item);
    return (
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image_url }} style={styles.image} />
        {item.description && <Text style={styles.imageDesc}>{item.description} ({item.status_at_time})</Text>}
        {item.created_at && <Text style={styles.imageDate}>Ngày chụp: {new Date(item.created_at).toLocaleDateString('vi-VN')}</Text>}
      </View>
    );
  };

  const isCompleted = orderData.status === 'completed';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
      
      <View style={styles.redSection}>
        <Header title="Phiếu dịch vụ" />
      </View>
      
      <View style={styles.whiteSection}>
        <View style={styles.body}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <View style={styles.billCard}>
              {renderRow('Khách hàng', orderData.customer_name || orderData.receiver_name)}
              {renderRow('Loại dịch vụ', orderData.service_name)}
              {orderData.employee_name && renderRow('Nhân viên hỗ trợ', orderData.employee_name)}
              {orderData.note && renderRow('Ghi chú', orderData.note)}
              {orderData.address && renderRow('Địa chỉ', orderData.address)}
              {renderRow('Số điện thoại', orderData.receiver_phone || orderData.customer_phone)}
              {renderRow('Biển số xe', orderData.license_plate)}
              {orderData.vehicle_type && renderRow('Loại xe', orderData.vehicle_type)}
              {renderRow('Ngày nhận', orderData.receive_date)}
              {renderRow('Ngày bàn giao', orderData.delivery_date, { color: Colors.text.primary })}
              {renderRow('Ngày đặt lịch', orderData.created_at)}
              <View style={styles.divider} />
              <View style={styles.imageSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.imageLabel}>Ảnh khi nhận xe:</Text>
                  <TouchableOpacity 
                    style={styles.uploadButton} 
                    onPress={() => handleUploadImage('received')}
                  >
                    <Ionicons name="cloud-upload-outline" size={20} color={Colors.text.primary} />
                    <Text style={styles.uploadButtonText}>Tải lên</Text>
                  </TouchableOpacity>
                </View>
                {(orderData.images || []).length > 0 ? (
                  <FlatList
                    data={(orderData.images || []).filter((img: { status_at_time: string; }) => img.status_at_time === 'received')}
                    keyExtractor={(item, index) => `receive-${index}`}
                    renderItem={renderImage}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.imageList}
                  />
                ) : (
                  <Text style={styles.noImageText}>Chưa có ảnh</Text>
                )}
              </View>
              <View style={styles.imageSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.imageLabel}>Ảnh khi bàn giao xe:</Text>
                  <TouchableOpacity 
                    style={styles.uploadButton} 
                    onPress={() => handleUploadImage('completed')}
                  >
                    <Ionicons name="cloud-upload-outline" size={20} color={Colors.text.primary} />
                    <Text style={styles.uploadButtonText}>Tải lên</Text>
                  </TouchableOpacity>
                </View>
                {(orderData.images || []).length > 0 ? (
                  <FlatList
                    data={(orderData.images || []).filter((img: { status_at_time: string; }) => img.status_at_time === 'completed')}
                    keyExtractor={(item, index) => `delivery-${index}`}
                    renderItem={renderImage}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.imageList}
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
    </SafeAreaView>
  );
};

export default EmployeeOrderDetailScreen;