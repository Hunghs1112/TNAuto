// src/screens/OrderDetail/OrderDetailScreen.tsx
import React, { useState } from 'react';
import { View, Text, StatusBar, FlatList, Image, ActivityIndicator, ScrollView, Modal, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import Header from '../../components/Header/Header';
import ConfirmButton from '../../components/Button/ConfirmButton';
import { useGetOrderDetailsQuery } from '../../services/customerApi';
import { useCompleteServiceOrderMutation } from '../../services/serviceOrderApi';
import { styles } from './styles';
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

const OrderDetailScreen = ({ route }: { route: { params: { id: string } } }) => {
  const { id } = route.params;
  const { refreshing, onRefresh } = useAutoRefresh();
  const { data: orderData, isLoading, error, refetch } = useGetOrderDetailsQuery(id);
  const [completeServiceOrder] = useCompleteServiceOrderMutation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  console.log('OrderDetailScreen: Loading order', id, { isLoading, error, data: orderData });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Phiếu dịch vụ" />
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
          <Header title="Phiếu dịch vụ" />
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
      case 'cancelled':
        return 'Đã hủy';
      default:
        return orderData.status;
    }
  };

  const getStatusColor = () => {
    console.log('getStatusColor: status =', orderData.status);
    switch (orderData.status) {
      case 'received':
        return Colors.background.yellow; // #feb052
      case 'ready_for_pickup':
        return Colors.warning; // #FFCC00
      case 'in_progress':
        return Colors.background.red; // #DA1C12
      case 'completed':
        return Colors.background.green; // #34C759
      case 'canceled':
        return Colors.background.gray; // #9CA3AF
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
      <TouchableOpacity onPress={() => setSelectedImage(item.image_url)} activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image_url }} style={styles.image} />
          {item.description && <Text style={styles.imageDesc}>{item.description} ({item.status_at_time})</Text>}
          {item.created_at && <Text style={styles.imageDate}>Ngày chụp: {new Date(item.created_at).toLocaleDateString('vi-VN')}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const handleConfirm = async () => {
    console.log('Confirm order:', id);
    try {
      await completeServiceOrder({
        id,
        delivery_date: new Date().toISOString().split('T')[0],
        warranty_period: 12,
      }).unwrap();
      console.log('Service order completed successfully');
      refetch();
    } catch (err) {
      console.error('Failed to complete service order:', err);
    }
  };

  const isCompleted = orderData.status === 'completed';
  console.log('isCompleted:', isCompleted);

  const showConfirmationRow = orderData.status !== 'ready_for_pickup' && orderData.status !== 'completed';

  const warrantyEndDate = orderData.warranty_end ? new Date(orderData.warranty_end) : null;
  const isWarrantyExpired = warrantyEndDate && warrantyEndDate < new Date();
  console.log('Warranty expired:', isWarrantyExpired, warrantyEndDate);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
      
      <View style={styles.redSection}>
        <Header title="Phiếu dịch vụ" />
      </View>
      
      <View style={styles.whiteSection}>
        <View style={styles.body}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            {/* Main Bill Card - Ticket Style */}
            <View style={styles.billCard}>
              {/* Customer Name */}
              {renderRow('Tên khách hàng', orderData.customer_name || orderData.receiver_name)}

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
              {renderRow('Ngày nhận', orderData.receive_date)}

              {/* Delivery Date */}
              {renderRow('Ngày bàn giao', orderData.delivery_date, { color: Colors.text.primary })}

              {/* Created Date */}
              {renderRow('Ngày đặt lịch', orderData.created_at)}

              {/* Divider */}
              <View style={styles.divider} />

              {/* Receive Images */}
              <View style={styles.imageSection}>
                <Text style={styles.imageLabel}>Ảnh khi nhận xe:</Text>
                {(orderData.images || []).length > 0 ? (
                  <FlatList
                    data={(orderData.images || []).filter(img => img.status_at_time === 'received')}
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
                  <FlatList
                    data={(orderData.images || []).filter(img => img.status_at_time === 'completed')}
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

              {/* Dashed Divider */}
              <View style={styles.dashedDivider} />

              {/* Confirmation Row */}
              {showConfirmationRow && (
                <View style={styles.confirmationRow}>
                  <Text style={styles.confirmationText}>Đã đặt lịch sửa chữa vào ngày</Text>
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
                  isWarrantyExpired && { backgroundColor: Colors.error + '20' }
                ]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons 
                      name="shield-checkmark-outline" 
                      size={20} 
                      color={isWarrantyExpired ? Colors.error : Colors.background.green} 
                      style={{ marginRight: 8 }} 
                    />
                    <Text style={styles.warrantyEndLabel}>
                      {isWarrantyExpired ? 'Bảo hành đã hết hạn' : 'Hạn hết bảo hành'}
                    </Text>
                  </View>
                  <Text style={[
                    styles.warrantyEndDate,
                    isWarrantyExpired && { color: Colors.error }
                  ]}>
                    {warrantyEndDate.toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              )}

              {/* Confirm Button (only for ready_for_pickup status) */}
              {orderData.status === 'ready_for_pickup' && (
                <ConfirmButton
                  title="Xác nhận"
                  onPress={handleConfirm}
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
            <Ionicons name="close-outline" size={30} color={Colors.text.primary} />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;