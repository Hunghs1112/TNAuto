import type React from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Colors } from "../../constants/colors"
import { Typography } from "../../constants/typo"
import { useGetCustomerVehiclesQuery } from "../../services/vehicleApi"
import { AppStackParamList } from "../../navigation/AppNavigator"

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
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.background.light} />
      </View>
    );
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
            <View style={styles.iconContainer}>
              <Ionicons name="car-sport" size={28} color={Colors.background.light} />
            </View>
            <Text style={styles.vehicleTitle}>Thông tin xe</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.background.light} />
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
            <View style={styles.iconContainer}>
              <Ionicons name="car-sport" size={28} color={Colors.background.light} />
            </View>
            <Text style={styles.vehicleTitle}>Thông tin xe</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={48} color={Colors.background.light} />
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
          <View style={styles.iconContainer}>
            <Ionicons name="car-sport" size={28} color={Colors.background.light} />
          </View>
          <Text style={styles.vehicleTitle}>Thông tin xe</Text>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color={Colors.background.light} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.vehicleContent}>
        <View style={styles.avatarContainer}>
          {firstVehicle.image_url ? (
            <Image 
              source={{ uri: firstVehicle.image_url }} 
              style={styles.vehicleAvatar}
              resizeMode="cover"
              onError={(error) => console.log('VehicleInfoCard - Image load error:', error.nativeEvent.error)}
            />
          ) : (
            <View style={[styles.vehicleAvatar, styles.placeholderFrame]}>
              <Ionicons name="camera-outline" size={32} color={Colors.background.light} />
            </View>
          )}
        </View>

        <View style={styles.vehicleInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={16} color={Colors.background.light} />
            <Text style={styles.licensePlate}>{firstVehicle.license_plate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={16} color={Colors.background.light} />
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
          <Ionicons name="arrow-forward" size={16} color={Colors.background.light} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.red,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.background.light,
    marginTop: 12,
    opacity: 0.8,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    gap: 8,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.background.light,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vehicleTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    marginVertical: 16,
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
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  placeholderFrame: {
    borderStyle: "dashed",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    color: Colors.background.light,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  vehicleType: {
    fontSize: 16,
    color: Colors.background.light,
    marginLeft: 8,
    opacity: 0.9,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
})

export default VehicleInfoCard
