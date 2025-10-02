import type React from "react"
import { View, Text, StyleSheet, Image } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { Colors } from "../../constants/colors"
import { Typography } from "../../constants/typo"

interface VehicleInfoCardProps {
  licensePlate: string
  vehicleType: string
  imageUri?: string
  isUnderRepair?: boolean
}

const VehicleInfoCard: React.FC<VehicleInfoCardProps> = ({
  licensePlate,
  vehicleType,
  imageUri,
  isUnderRepair = false,
}) => {
  const status = isUnderRepair ? "Đang sửa chữa" : "Bình thường"
  const statusIcon = isUnderRepair ? "construct" : "checkmark-circle"

  return (
    <View style={styles.container}>
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
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.vehicleAvatar} />
          ) : (
            <View style={[styles.vehicleAvatar, styles.placeholderFrame]}>
              <Ionicons name="camera-outline" size={32} color={Colors.background.light} />
            </View>
          )}
        </View>

        <View style={styles.vehicleInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={16} color={Colors.background.light} />
            <Text style={styles.licensePlate}>{licensePlate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={16} color={Colors.background.light} />
            <Text style={styles.vehicleType}>{vehicleType}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name={statusIcon} size={16} color={isUnderRepair ? Colors.accent.yellow : Colors.accent.green} />
            <Text style={[styles.statusText, { color: isUnderRepair ? Colors.accent.yellow : Colors.accent.green }]}>
              {status}
            </Text>
          </View>
        </View>
      </View>
    </View>
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
