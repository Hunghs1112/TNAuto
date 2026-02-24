// src/screens/Vehicle/VehicleListScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { RootView } from '../../components/layout';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import Header from '../../components/Header';
import { useGetCustomerVehiclesQuery } from '../../services/vehicleApi';
import { Vehicle } from '../../types/api.types';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useAutoRefresh } from '../../redux/hooks/useAutoRefresh';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface VehicleListScreenProps {
  route: {
    params: {
      userId: string;
      userPhone: string;
    };
  };
}

const VehicleListScreen: React.FC<VehicleListScreenProps> = ({ route }) => {
  const { userPhone } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh({ tags: ['Customer'] });
  const { data: vehiclesData, isLoading, refetch } = useGetCustomerVehiclesQuery({ phone: userPhone });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const imageUrls = useMemo(
    () => (vehiclesData?.data ?? []).map((v) => v.image_url).filter((u): u is string => !!u),
    [vehiclesData?.data],
  );

  useEffect(() => {
    // Warm up image cache for faster first paint when scrolling
    imageUrls.slice(0, 12).forEach((url) => {
      Image.prefetch(url);
    });
  }, [imageUrls]);

  const keyExtractor = useCallback((item: Vehicle) => item.id.toString(), []);

  const handleVehiclePress = (vehicle: Vehicle) => {
    navigation.navigate('VehicleDetail', {
      vehicleId: vehicle.id.toString(),
      licensePlate: vehicle.license_plate,
    });
  };

  const renderVehicleCard = ({ item }: { item: Vehicle }) => {
    const status = item.has_active_order ? 'Đang sửa chữa' : 'Bình thường';
    const statusColor = item.has_active_order ? Colors.accent.yellow : Colors.accent.green;
    const statusIcon = item.has_active_order ? 'construct' : 'checkmark-circle';

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleVehiclePress(item)}
        activeOpacity={0.8}
      >
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={() => item.image_url && setSelectedImage(item.image_url)}
          activeOpacity={0.9}
        >
          {item.image_url ? (
            <Image 
              source={{ uri: item.image_url }} 
              style={styles.vehicleImage}
              resizeMode="cover"
              onError={() => {}}
            />
          ) : (
            <View style={[styles.vehicleImage, styles.placeholderImage]}>
              <Ionicons name="car-outline" size={40} color={Colors.neutral[400]} />
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon} size={14} color={Colors.text.white} />
          </View>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <View style={styles.licensePlateContainer}>
            <Ionicons name="document-text-outline" size={16} color={Colors.text.primary} />
            <Text style={styles.licensePlate}>{item.license_plate}</Text>
          </View>

          <View style={styles.modelContainer}>
            <Ionicons name="car-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.model}>{item.model || 'Chưa cập nhật'}</Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
          </View>

          {item.active_order_count ? (
            <Text style={styles.orderCount}>{item.active_order_count} đơn đang xử lý</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <RootView style={styles.root}>
        <View style={styles.header}>
          <Header title="Danh sách xe" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </RootView>
    );
  }

  return (
    <RootView style={styles.root}>
      <View style={styles.header}>
        <Header title="Danh sách xe" />
      </View>

      <View style={styles.body}>
        {!vehiclesData?.data || vehiclesData.data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={80} color={Colors.neutral[300]} />
            <Text style={styles.emptyTitle}>Chưa có xe nào</Text>
            <Text style={styles.emptySubtitle}>
              Xe sẽ tự động được thêm khi bạn tạo đơn dịch vụ
            </Text>
          </View>
        ) : (
          <FlatList
            alwaysBounceVertical={true}
            data={vehiclesData.data}
            renderItem={renderVehicleCard}
            keyExtractor={keyExtractor}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            removeClippedSubviews
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            updateCellsBatchingPeriod={50}
            windowSize={7}
          />
        )}
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
    backgroundColor: Colors.background.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
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
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContainer: {
    padding: 12,
  },
  licensePlateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  licensePlate: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginLeft: 6,
    fontFamily: Typography.fontFamily.bold,
  },
  modelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  model: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginLeft: 6,
  },
  statusContainer: {
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.bold,
  },
  orderCount: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 20,
    fontFamily: Typography.fontFamily.bold,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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

export default VehicleListScreen;

