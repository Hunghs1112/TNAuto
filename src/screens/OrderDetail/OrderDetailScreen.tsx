// src/screens/OrderDetail/OrderDetailScreen.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { View, Text, FlatList, Image, ActivityIndicator, ScrollView, Modal, TouchableOpacity, RefreshControl } from 'react-native';
import Screen from '../../components/layout/Screen/Screen';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import ErrorView from '../../components/Loading/ErrorView';
import { useGetOrderDetailsQuery } from '../../services/customerApi';
import { ServiceOrderImage } from '../../types/api.types';
import { styles } from './styles';
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import { useAppSelector } from '../../redux/hooks/useAppSelector';

const OrderDetailScreen = ({ route }: { route: { params: { id: string } } }) => {
  const { id } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const hasGarageContext = useAppSelector(
    (state) => Boolean(state.garageContext.garageCode && state.garageContext.resolved),
  );
  const userType = useAppSelector((s) => s.auth.userType);
  const { data: orderData, isLoading, error, refetch, isFetching } = useGetOrderDetailsQuery(id, {
    skip: userType === 'customer' && !hasGarageContext,
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const isDealer = userType === 'dealer';

  useEffect(() => {
    if (isDealer) {
      navigation.replace('Category');
    }
  }, [isDealer, navigation]);

  useEffect(() => {
    if (userType === 'customer' && !hasGarageContext) {
      navigation.replace('SelectGarage');
    }
  }, [hasGarageContext, navigation, userType]);

  if (isDealer || (userType === 'customer' && !hasGarageContext)) {
    return null;
  }

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refetch order data
      await refetch();
    } catch (error) {
      console.error('Error refreshing order:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // MUST be called before any early returns
  const getImageUrl = useCallback((url: string) => {
    return url;
  }, []);

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
    </Screen>
  );
};

export default OrderDetailScreen;
