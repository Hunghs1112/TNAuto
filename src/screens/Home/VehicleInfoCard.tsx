import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
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

  console.log('VehicleInfoCard - Debug:', { 
    userPhone, 
    isLoading, 
    error, 
    vehiclesData,
    hasData: vehiclesData?.data,
    dataLength: vehiclesData?.data?.length,
    success: vehiclesData?.success,
    count: vehiclesData?.count
  });

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
        colors={['rgba(218, 28, 18, 0)', 'rgba(218, 28, 18, 0.15)', 'rgba(218, 28, 18, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.divider}
      />
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.primary} />
          <Text style={styles.emptyText}>{errorMessage}</Text>
          <Text style={[styles.emptyText, { fontSize: 11, marginTop: 8, opacity: 0.7 }]}>
            Vui lòng kiểm tra backend API
          </Text>
        </View>
      </View>
    );
  }

  // Check for empty data
  if (!vehiclesData?.data || vehiclesData.data.length === 0) {
    console.log('VehicleInfoCard - Empty State:', { 
      hasData: !!vehiclesData?.data,
      dataLength: vehiclesData?.data?.length,
      success: vehiclesData?.success
    });
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
        colors={['rgba(218, 28, 18, 0)', 'rgba(218, 28, 18, 0.15)', 'rgba(218, 28, 18, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.divider}
      />
      <View style={styles.emptyContainer}>
        <Ionicons name="car-outline" size={48} color={Colors.primary} />
          <Text style={styles.emptyText}>Chưa có thông tin xe</Text>
          <Text style={[styles.emptyText, { fontSize: 12, marginTop: 8, opacity: 0.7 }]}>
            Xe sẽ tự động được thêm khi tạo đơn dịch vụ
          </Text>
        </View>
      </View>
    );
  }

  const firstVehicle = vehiclesData.data[0];
  const hasMultipleVehicles = vehiclesData.data.length > 1;
  const status = firstVehicle.has_active_order ? "Đang sửa chữa" : "Bình thường"
  const statusIcon = firstVehicle.has_active_order ? "construct" : "checkmark-circle"

  const handleViewAllVehicles = () => {
    navigation.navigate('VehicleList', { userId, userPhone });
  };

  const handleViewVehicleDetail = () => {
    navigation.navigate('VehicleDetail', { 
      vehicleId: firstVehicle.id.toString(),
      licensePlate: firstVehicle.license_plate 
    });
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleViewVehicleDetail}
      activeOpacity={0.9}
    >
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
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </View>
      </View>

      <LinearGradient
        colors={['rgba(218, 28, 18, 0)', 'rgba(218, 28, 18, 0.15)', 'rgba(218, 28, 18, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.divider}
      />

      <View style={styles.vehicleContent}>
        <View style={styles.avatarContainer}>
          {firstVehicle.image_url ? (
            <OptimizedImage 
              source={{ uri: firstVehicle.image_url }} 
              width={88}
              height={88}
              borderRadius={44}
              style={styles.vehicleAvatar}
            />
          ) : (
            <View style={[styles.vehicleAvatar, styles.placeholderFrame]}>
              <Ionicons name="camera-outline" size={32} color={Colors.primary} />
            </View>
          )}
        </View>

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
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>
            Xem tất cả xe ({vehiclesData.data.length})
          </Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: 24,
    padding: 28,
    shadowColor: Colors.shadow.red,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
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
  vehicleAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  placeholderFrame: {
    borderStyle: "dashed",
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
})

export default VehicleInfoCard
