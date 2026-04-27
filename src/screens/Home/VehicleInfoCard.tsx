import React, { useCallback, useMemo, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Image } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { useGetCustomerVehiclesQuery } from "../../services/vehicleApi";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { VehicleCardSkeleton } from "../../components/SkeletonLoader";
import { OptimizedImage } from "../../components/OptimizedImage";
import { useAppSelector } from "../../redux/hooks/useAppSelector";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const VehicleInfoCard: React.FC = () => {
  const userId = useAppSelector((state) => state.auth.userId);
  const userPhone = useAppSelector((state) => state.auth.userPhone);
  const navigation = useNavigation<NavigationProp>();
  const hasGarageContext = useAppSelector(
    (state) => Boolean(state.garageContext.garageCode && state.garageContext.resolved),
  );
  const queryParams = useMemo(() => {
    if (userId) {
      return { customer_id: userId };
    }

    if (userPhone) {
      return { phone: userPhone } as any;
    }

    return undefined;
  }, [userId, userPhone]);

  const { data: vehiclesData, isLoading, error } = useGetCustomerVehiclesQuery(
    queryParams,
    {
      skip: !hasGarageContext || !queryParams,
      refetchOnMountOrArgChange: 30,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  // All hooks must be called before any early returns
  const firstVehicle = useMemo(() => vehiclesData?.data?.[0], [vehiclesData?.data]);
  const hasMultipleVehicles = useMemo(
    () => (vehiclesData?.data?.length || 0) > 1,
    [vehiclesData?.data?.length]
  );

  const handleViewAllVehicles = useCallback(() => {
    if (!hasGarageContext) {
      navigation.navigate("SelectGarage");
      return;
    }
    navigation.navigate("VehicleList", { userId, userPhone });
  }, [hasGarageContext, navigation, userId, userPhone]);

  const handleViewVehicleDetail = useCallback(() => {
    if (firstVehicle) {
      navigation.navigate("VehicleDetail", {
        vehicleId: firstVehicle.id.toString(),
        licensePlate: firstVehicle.license_plate,
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
  if (!hasGarageContext) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Thông tin xe</Text>
        </View>
        <View style={styles.grid}>
          <Text style={styles.stateText}>Hãy chọn gara để xem danh sách xe của bạn.</Text>
        </View>
      </View>
    );
  }

  if (error && (error as any)?.status === 429) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Thông tin xe</Text>
        </View>
        <View style={styles.grid}>
          <Text style={styles.stateText}>Đang tải quá nhanh. Vui lòng thử lại sau.</Text>
        </View>
      </View>
    );
  }

  if (error && (error as any)?.status === 'TIMEOUT_ERROR') {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Thông tin xe</Text>
        </View>
        <View style={styles.grid}>
          <View style={styles.statePill}>
            <Ionicons name="time-outline" size={18} color={Colors.primary} />
            <Text style={styles.statePillText}>Quá thời gian</Text>
          </View>
          <Text style={styles.stateText} numberOfLines={2}>
            Hệ thống phản hồi chậm, vui lòng thử lại.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
            <Text style={styles.retryButtonText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return <VehicleCardSkeleton />;
  }

  const Header = ({ showCount }: { showCount: boolean }) => (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <View style={styles.headerIconWrap}>
          <LinearGradient
            colors={Colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIcon}
          >
            <Ionicons name="car-sport" size={18} color={Colors.background.light} />
          </LinearGradient>
        </View>
        <Text style={styles.headerTitle}>Thông tin xe</Text>
      </View>

      <View style={styles.headerRight}>
        {showCount && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{vehiclesData?.data?.length ?? 0}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
      </View>
    </View>
  );

  // Check for API errors
  if (error) {
    console.error("VehicleInfoCard - API Error:", error);
    const errorMessage =
      "status" in error && (error as any).status === 404 ? "Endpoint chưa được hỗ trợ" : "Lỗi tải thông tin xe";

    return (
      <View style={styles.card}>
        <Header showCount={false} />
        <View style={styles.grid}>
          <View style={styles.statePill}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.statePillText}>Lỗi</Text>
          </View>
          <Text style={styles.stateText} numberOfLines={2}>
            {errorMessage}
          </Text>
          <Text style={styles.stateHint} numberOfLines={2}>
            Vui lòng kiểm tra backend API
          </Text>
        </View>
      </View>
    );
  }

  // Check for empty data
  if (!vehiclesData?.data || vehiclesData.data.length === 0) {
    return (
      <View style={styles.card}>
        <Header showCount={false} />
        <View style={styles.grid}>
          <View style={styles.statePill}>
            <Ionicons name="car-outline" size={18} color={Colors.primary} />
            <Text style={styles.statePillText}>Chưa có xe</Text>
          </View>
          <Text style={styles.stateText} numberOfLines={2}>
            Chưa có thông tin xe
          </Text>
          <Text style={styles.stateHint} numberOfLines={2}>
            Xe sẽ tự động được thêm khi tạo đơn dịch vụ
          </Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handleViewVehicleDetail} activeOpacity={0.9}>
      <Header showCount={hasMultipleVehicles} />

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.imageTile}
          onPress={() => firstVehicle?.image_url && handleImagePress(firstVehicle.image_url)}
          activeOpacity={0.9}
        >
          <View style={styles.imageTileInner}>
            {firstVehicle.image_url ? (
              <OptimizedImage
                source={{ uri: firstVehicle.image_url }}
                width={92}
                height={92}
                borderRadius={16}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={22} color={Colors.primary} />
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.infoTile}>
          <Text style={styles.label}>Biển số</Text>
          <Text style={styles.valuePrimary} numberOfLines={1}>
            {firstVehicle.license_plate}
          </Text>
        </View>

        <View style={styles.infoTile}>
          <Text style={styles.label}>Dòng xe</Text>
          <Text style={styles.value} numberOfLines={1}>
            {firstVehicle.model || "Chưa cập nhật"}
          </Text>
        </View>

        {hasMultipleVehicles && (
          <TouchableOpacity style={styles.fullWidthCta} onPress={handleViewAllVehicles} activeOpacity={0.9}>
            <Text style={styles.fullWidthCtaText}>Xem tất cả xe ({vehiclesData.data.length})</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Full Screen Image Modal */}
      <Modal visible={!!selectedImage} transparent={true} onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={handleCloseModal}>
            <Ionicons name="close-outline" size={30} color={Colors.background.light} />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: Colors.surface.elevated,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
    gap: 12,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    overflow: "hidden",
  },
  headerIcon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    lineHeight: 20,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: "800",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.secondaryLight,
  },
  countBadgeText: {
    fontSize: 12,
    lineHeight: 14,
    color: Colors.secondaryLight,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: "800",
    textShadowColor: Colors.background.light,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1.2,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  imageTile: {
    width: "30%",
    minWidth: 96,
  },
  imageTileInner: {
    width: "100%",
    height: 92,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.primarySoft,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  infoTile: {
    flex: 1,
    minWidth: 140,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.alpha.black03,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: "600",
    marginBottom: 6,
  },
  valuePrimary: {
    fontSize: 16,
    lineHeight: 20,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  value: {
    fontSize: 14,
    lineHeight: 18,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: "700",
  },

  fullWidthCta: {
    width: "100%",
    marginTop: 2,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.alpha.primary08,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fullWidthCtaText: {
    fontSize: 13,
    lineHeight: 16,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: "800",
  },

  statePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.alpha.primary08,
  },
  statePillText: {
    fontSize: 13,
    lineHeight: 16,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: "800",
  },
  stateText: {
    width: "100%",
    fontSize: 14,
    lineHeight: 18,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: "700",
  },
  stateHint: {
    width: "100%",
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.alpha.primary12,
    alignSelf: 'center',
    marginTop: 4,
  },
  retryButtonText: {
    fontSize: 13,
    lineHeight: 16,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
  },

  // Modal styles for full screen image
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.alpha.black90,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: Colors.alpha.black50,
    borderRadius: 20,
    padding: 10,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});

VehicleInfoCard.displayName = "VehicleInfoCard";

export default React.memo(VehicleInfoCard);
