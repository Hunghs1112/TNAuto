import React, { useCallback, useMemo } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from "react-native"
import { Ionicons } from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Colors } from "../../constants/colors"
import { Typography } from "../../constants/typo"
import { useGetCustomerVehiclesQuery } from "../../services/vehicleApi"
import { AppStackParamList } from "../../navigation/AppNavigator"
import { VehicleCardSkeleton } from "../../components/SkeletonLoader"
import { OptimizedImage } from "../../components/OptimizedImage"

interface VehicleInfoCardProps {
  userId: string
  userPhone: string
}

type NavigationProp = NativeStackNavigationProp<AppStackParamList>

const VehicleInfoCard: React.FC<VehicleInfoCardProps> = ({
  userId,
  userPhone,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { data: vehiclesData, isLoading, error } = useGetCustomerVehiclesQuery({ 
    phone: userPhone 
  });
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  // All hooks must be called before any early returns
  const firstVehicle = useMemo(() => vehiclesData?.data?.[0], [vehiclesData?.data]);
  const hasMultipleVehicles = useMemo(() => (vehiclesData?.data?.length || 0) > 1, [vehiclesData?.data?.length]);
  const status = useMemo(() => firstVehicle?.has_active_order ? "Đang sửa chữa" : "Bình thường", [firstVehicle?.has_active_order]);
  const statusIcon = useMemo(() => firstVehicle?.has_active_order ? "construct" : "checkmark-circle", [firstVehicle?.has_active_order]);

  const handleViewAllVehicles = useCallback(() => {
    navigation.navigate('VehicleList', { userId, userPhone });
  }, [navigation, userId, userPhone]);

  const handleViewVehicleDetail = useCallback(() => {
    if (firstVehicle) {
      navigation.navigate('VehicleDetail', { 
        vehicleId: firstVehicle.id.toString(),
        licensePlate: firstVehicle.license_plate 
      });
    }
  }, [navigation, firstVehicle]);

  const handleImagePress = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // Early returns after all hooks
  if (isLoading) {
    return <VehicleCardSkeleton />;
  }

  // Check for API errors
  if (error) {
    console.error('VehicleInfoCard - API Error:', error);
    const errorMessage = 'status' in error && error.status === 404 
      ? 'Endpoint chưa được hỗ trợ' 
      : 'Lỗi tải thông tin xe';
    
    return (
      <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.vehicleTitleContainer}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Ionicons name="car-sport" size={28} color={Colors.background.light} />
          </LinearGradient>
          <Text style={styles.vehicleTitle}>Thông tin xe</Text>
        </View>
      </View>
      <LinearGradient
        colors={['rgba(12, 119, 121, 0)', 'rgba(12, 119, 121, 0.15)', 'rgba(12, 119, 121, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.divider}
      />
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.primary} />
          <Text style={styles.emptyText}>{errorMessage}</Text>
          <Text style={[styles.emptyText, styles.hintText]}>
            Vui lòng kiểm tra backend API
          </Text>
        </View>
      </View>
    );
  }

  // Check for empty data
  if (!vehiclesData?.data || vehiclesData.data.length === 0) {
    return (
      <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.vehicleTitleContainer}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Ionicons name="car-sport" size={28} color={Colors.background.light} />
          </LinearGradient>
          <Text style={styles.vehicleTitle}>Thông tin xe</Text>
        </View>
      </View>
      <LinearGradient
        colors={['rgba(12, 119, 121, 0)', 'rgba(12, 119, 121, 0.15)', 'rgba(12, 119, 121, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.divider}
      />
      <View style={styles.emptyContainer}>
        <Ionicons name="car-outline" size={48} color={Colors.primary} />
          <Text style={styles.emptyText}>Chưa có thông tin xe</Text>
          <Text style={[styles.emptyText, styles.hintText]}>
            Xe sẽ tự động được thêm khi tạo đơn dịch vụ
          </Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleViewVehicleDetail}
    >
      <View style={styles.header}>
        <View style={styles.vehicleTitleContainer}>
          <View style={styles.iconContainerShadow}>
            <LinearGradient
              colors={Colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <Ionicons name="car-sport" size={28} color={Colors.background.light} />
            </LinearGradient>
          </View>
          <Text style={styles.vehicleTitle}>Thông tin xe</Text>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </View>
      </View>

      <LinearGradient
        colors={['rgba(12, 119, 121, 0)', 'rgba(12, 119, 121, 0.15)', 'rgba(12, 119, 121, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.divider}
      />

      <View style={styles.vehicleContent}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => firstVehicle?.image_url && handleImagePress(firstVehicle.image_url)}
        >
          <View style={styles.vehicleAvatarOuter}>
            <View style={styles.vehicleAvatarInner}>
              {firstVehicle.image_url ? (
                <OptimizedImage
                  source={{ uri: firstVehicle.image_url }}
                  width={styles.vehicleAvatarInner.width as number}
                  height={styles.vehicleAvatarInner.height as number}
                  borderRadius={(styles.vehicleAvatarInner.width as number) / 2}
                />
              ) : (
                <View style={styles.placeholderFrame}>
                  <Ionicons name="camera-outline" size={32} color={Colors.primary} />
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.vehicleInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
            <Text style={styles.licensePlate}>{firstVehicle.license_plate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.vehicleType}>{firstVehicle.model || 'Chưa cập nhật'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons 
              name={statusIcon} 
              size={16} 
              color={firstVehicle.has_active_order ? Colors.accent.yellow : Colors.accent.green} 
            />
            <Text style={[
              styles.statusText, 
              { color: firstVehicle.has_active_order ? Colors.accent.yellow : Colors.accent.green }
            ]}>
              {status}
            </Text>
          </View>
        </View>
      </View>

      {hasMultipleVehicles && (
        <TouchableOpacity 
          style={styles.viewAllButton} 
          onPress={handleViewAllVehicles}
        >
          <Text style={styles.viewAllText}>
            Xem tất cả xe ({vehiclesData.data.length})
          </Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      )}

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={handleCloseModal}
          >
            <Ionicons name="close-outline" size={30} color={Colors.background.light} />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: 24,
    padding: 28,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    gap: 8,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
   
  },
  vehicleTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainerShadow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    overflow: 'hidden',
  },
  vehicleTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  vehicleContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 20,
  },
  vehicleAvatarOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  vehicleAvatarInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    overflow: 'hidden',
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderFrame: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleInfo: {
    flex: 1,
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  licensePlate: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  vehicleType: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
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
  hintText: {
    fontSize: 11,
    marginTop: 8,
    color: Colors.text.secondary,
  },
})

VehicleInfoCard.displayName = 'VehicleInfoCard';

export default React.memo(VehicleInfoCard);
