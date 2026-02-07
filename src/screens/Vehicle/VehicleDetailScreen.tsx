// src/screens/Vehicle/VehicleDetailScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { RootView } from '../../components/layout';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import Header from '../../components/Header';
import { useGetVehicleByIdQuery } from '../../services/vehicleApi';
import { useGetCustomerOrdersQuery, useGetServicesQuery } from '../../services/customerApi';
import { ServiceOrder } from '../../types/api.types';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useAutoRefresh } from '../../redux/hooks/useAutoRefresh';
import { useAppSelector } from '../../redux/hooks/useAppSelector';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface VehicleDetailScreenProps {
  route: {
    params: {
      vehicleId: string;
      licensePlate: string;
    };
  };
}

const VehicleDetailScreen: React.FC<VehicleDetailScreenProps> = ({ route }) => {
  const { vehicleId, licensePlate } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh();
  const userPhone = useAppSelector((state) => state.auth.userPhone);
  const { data: vehicle, isLoading: vehicleLoading, refetch: refetchVehicle } = useGetVehicleByIdQuery(vehicleId);
  
  // Fetch all customer orders
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useGetCustomerOrdersQuery(
    userPhone || '',
    { skip: !userPhone }
  );
  
  // Fetch services to get service names
  const { data: servicesData } = useGetServicesQuery();
  
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Create service map: service_id -> service_name
  const serviceMap = useMemo(() => {
    const map = new Map<number, string>();
    if (servicesData?.data) {
      servicesData.data.forEach((service: any) => {
        map.set(service.id, service.name);
      });
    }
    return map;
  }, [servicesData?.data]);

  // Filter orders by vehicle license plate and enrich with service names
  const vehicleOrders = useMemo(() => {
    if (!ordersData?.data || !licensePlate) return [];
    return ordersData.data
      .filter((order: ServiceOrder) => 
        order.license_plate?.toUpperCase() === licensePlate.toUpperCase()
      )
      .map((order: ServiceOrder) => {
        // If service_name is missing, get it from serviceMap
        if (!order.service_name && order.service_id && serviceMap.has(order.service_id)) {
          return {
            ...order,
            service_name: serviceMap.get(order.service_id)
          };
        }
        return order;
      });
  }, [ordersData?.data, licensePlate, serviceMap]);

  // Filter orders by selected status
  const filteredOrders = useMemo(() => {
    if (selectedStatus === 'all') return vehicleOrders;
    // Handle both 'cancelled' and 'canceled' status
    if (selectedStatus === 'cancelled') {
      return vehicleOrders.filter(order => order.status === 'cancelled' || order.status === 'canceled');
    }
    return vehicleOrders.filter(order => order.status === selectedStatus);
  }, [vehicleOrders, selectedStatus]);

  // Enhanced refresh handler
  const handleRefresh = async () => {
    onRefresh();
    // Note: services are cached, no need to refetch unless needed
    await Promise.all([
      refetchVehicle(),
      refetchOrders()
    ]);
  };

  const handleOrderPress = (orderId: string | number) => {
    navigation.navigate('OrderDetail', { id: orderId.toString() });
  };

  const getStatusText = (status: string) => {
    switch (status) {
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
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const renderOrderCard = (order: ServiceOrder) => {
    return (
      <TouchableOpacity
        key={order.id}
        style={styles.orderCard}
        onPress={() => handleOrderPress(order.id)}
        activeOpacity={0.8}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderTitleContainer}>
            <Ionicons name="construct-outline" size={20} color={Colors.text.primary} />
            <Text style={styles.orderTitle}>{order.service_name}</Text>
          </View>
          <View style={[styles.orderStatusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.orderStatusText}>{getStatusText(order.status)}</Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <View style={styles.orderInfoRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.orderInfoText}>
              Ngày đặt lịch: {new Date(order.receive_date).toLocaleDateString('vi-VN')}
            </Text>
          </View>

          {order.delivery_date && (
            <View style={styles.orderInfoRow}>
              <Ionicons name="checkmark-circle-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.orderInfoText}>
                Ngày nhận: {new Date(order.delivery_date).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}

          {order.employee_name && (
            <View style={styles.orderInfoRow}>
              <Ionicons name="person-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.orderInfoText}>NV: {order.employee_name}</Text>
            </View>
          )}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderDate}>
            {new Date(order.created_at).toLocaleDateString('vi-VN')}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
        </View>
      </TouchableOpacity>
    );
  };

  const isLoading = vehicleLoading || ordersLoading;

  if (isLoading && !vehicle) {
    return (
      <RootView style={styles.root}>
        <View style={styles.header}>
          <Header title={licensePlate} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </RootView>
    );
  }

  if (!vehicle) {
    return (
      <RootView style={styles.root}>
        <View style={styles.header}>
          <Header title={licensePlate} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy thông tin xe</Text>
        </View>
      </RootView>
    );
  }

  return (
    <RootView style={styles.root}>
      <View style={styles.header}>
        <Header title={vehicle.license_plate} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={handleRefresh} />}
      >
        {/* Vehicle Info Card */}
        <View style={styles.vehicleCard}>
          <TouchableOpacity 
            style={styles.vehicleImageContainer}
            onPress={() => vehicle.image_url && setSelectedImage(vehicle.image_url)}
            activeOpacity={0.9}
          >
            {vehicle.image_url ? (
              <Image 
                source={{ uri: vehicle.image_url }} 
                style={styles.vehicleImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.vehicleImage, styles.placeholderImage]}>
                <Ionicons name="car-outline" size={80} color={Colors.neutral[400]} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.vehicleInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="document-text" size={18} color={Colors.text.primary} />
              <Text style={styles.infoLabel}>Biển số:</Text>
              <Text style={styles.infoValue}>{vehicle.license_plate}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="car" size={18} color={Colors.text.primary} />
              <Text style={styles.infoLabel}>Model:</Text>
              <Text style={styles.infoValue}>{vehicle.model || 'Chưa cập nhật'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons 
                name={vehicle.has_active_order ? "construct" : "checkmark-circle"} 
                size={18} 
                color={vehicle.has_active_order ? Colors.accent.yellow : Colors.accent.green} 
              />
              <Text style={styles.infoLabel}>Trạng thái:</Text>
              <Text style={[
                styles.infoValue,
                { color: vehicle.has_active_order ? Colors.accent.yellow : Colors.accent.green }
              ]}>
                {vehicle.has_active_order ? 'Đang sửa chữa' : 'Bình thường'}
              </Text>
            </View>

            {vehicle.last_service_date && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color={Colors.text.secondary} />
                <Text style={styles.infoLabel}>Dịch vụ gần nhất:</Text>
                <Text style={styles.infoValue}>
                  {new Date(vehicle.last_service_date).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Orders Section */}
        <View style={styles.ordersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sử dịch vụ</Text>
            <Text style={styles.orderCount}>
              {vehicleOrders.length} đơn
            </Text>
          </View>

          {/* Status Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            <TouchableOpacity
              style={[styles.filterChip, selectedStatus === 'all' && styles.filterChipActive]}
              onPress={() => setSelectedStatus('all')}
            >
              <Text style={[styles.filterText, selectedStatus === 'all' && styles.filterTextActive]}>
                Tất cả
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, selectedStatus === 'received' && styles.filterChipActive]}
              onPress={() => setSelectedStatus('received')}
            >
              <Text style={[styles.filterText, selectedStatus === 'received' && styles.filterTextActive]}>
                Đã đặt lịch
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, selectedStatus === 'in_progress' && styles.filterChipActive]}
              onPress={() => setSelectedStatus('in_progress')}
            >
              <Text style={[styles.filterText, selectedStatus === 'in_progress' && styles.filterTextActive]}>
                Đang xử lý
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, selectedStatus === 'completed' && styles.filterChipActive]}
              onPress={() => setSelectedStatus('completed')}
            >
              <Text style={[styles.filterText, selectedStatus === 'completed' && styles.filterTextActive]}>
                Hoàn thành
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, (selectedStatus === 'cancelled' || selectedStatus === 'canceled') && styles.filterChipActive]}
              onPress={() => setSelectedStatus('cancelled')}
            >
              <Text style={[styles.filterText, (selectedStatus === 'cancelled' || selectedStatus === 'canceled') && styles.filterTextActive]}>
                Đã hủy
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Orders List */}
          <View style={styles.ordersList}>
            {filteredOrders.length === 0 ? (
              <View style={styles.emptyOrders}>
                <Ionicons name="document-outline" size={48} color={Colors.neutral[300]} />
                <Text style={styles.emptyOrdersText}>Chưa có đơn dịch vụ nào</Text>
              </View>
            ) : (
              filteredOrders.map(order => renderOrderCard(order))
            )}
          </View>
        </View>
      </ScrollView>

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  header: {
    backgroundColor: Colors.background.red,
  },
  body: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  vehicleCard: {
    backgroundColor: Colors.background.light,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  vehicleImageContainer: {
    width: '100%',
    height: 200,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    flex: 1,
  },
  ordersSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  orderCount: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  filterContainer: {
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.background.light,
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
    flex: 1,
  },
  orderStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  orderInfo: {
    gap: 8,
    marginBottom: 12,
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderInfoText: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginLeft: 6,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  orderDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  emptyOrders: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyOrdersText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  // Modal styles for full screen image
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default VehicleDetailScreen;

