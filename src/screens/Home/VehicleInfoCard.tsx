import React, { useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { useGetCustomerVehiclesQuery } from "../../services/vehicleApi";
import { useGetCustomerVehicleViolationQuery } from "../../services/violationApi";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { VehicleCardSkeleton } from "../../components/SkeletonLoader";
import { OptimizedImage } from "../../components/OptimizedImage";
import { useAppSelector } from "../../redux/hooks/useAppSelector";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AppLogo = require("../../assets/logo.png");

const SCREEN_WIDTH = Dimensions.get("window").width;
const BLEED = 16;
const CARD_WIDTH = SCREEN_WIDTH;
const S = 8; // base spacing unit — tất cả khoảng cách trong section dùng bội số của S

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ExpiryState = "missing" | "valid" | "expired";

// ─── Expiry helpers ───────────────────────────────────────────────────────────

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const getExpiryMeta = (date?: string | null) => {
  const parsed = parseDate(date);
  if (!parsed)    return { state: "missing" as ExpiryState, label: "Chưa cập nhật",              color: "#9CA3AF" };
  const days = Math.ceil((parsed.getTime() - Date.now()) / 86400000);
  if (days < 0)   return { state: "expired" as ExpiryState, label: `Hết hạn ${Math.abs(days)} ngày`, color: "#EF4444" };
  if (days <= 30) return { state: "valid"   as ExpiryState, label: `Còn ${days} ngày`,           color: "#F59E0B" };
  return           { state: "valid"   as ExpiryState, label: `Còn ${days} ngày`,           color: "#22C55E" };
};

// ─── Violation tag ────────────────────────────────────────────────────────────

type ViolationStatus = "pending" | "violation" | "no_violation" | "check_error";

const getViolationCfg = (status: ViolationStatus, count: number) => {
  if (status === "violation")    return { color: "#fff", bg: "#EF4444",  text: count > 0 ? `${count} Vi phạm` : "Vi phạm" };
  if (status === "no_violation") return { color: "#fff", bg: "#22C55E",  text: "Không vi phạm" };
  if (status === "check_error")  return { color: "#fff", bg: "#9CA3AF",  text: "Lỗi tra cứu" };
  return                                { color: "#fff", bg: "#6B7280",  text: "Chưa kiểm tra" };
};

const ViolationTag: React.FC<{ status: ViolationStatus; count: number }> = ({ status, count }) => {
  const cfg = getViolationCfg(status, count);
  return (
    <View style={[vtStyles.tag, { backgroundColor: cfg.bg }]}>
      <View style={vtStyles.dot} />
      <Text style={vtStyles.text}>{cfg.text}</Text>
    </View>
  );
};
const vtStyles = StyleSheet.create({
  tag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingLeft: 20,
    paddingRight: 26,
    paddingVertical: 5,
    borderRadius: 20,
    flexShrink: 0,
  },
  dot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.7)" },
  text: { fontSize: 11, lineHeight: 15, color: "#fff", fontFamily: Typography.fontFamily.semibold, textAlign: "center" },
});

// ─── DocRow ───────────────────────────────────────────────────────────────────

const DocRow: React.FC<{
  icon: string;
  label: string;
  meta: ReturnType<typeof getExpiryMeta>;
  onPress: () => void;
}> = ({ icon, label, meta, onPress }) => (
  <TouchableOpacity style={dStyles.row} onPress={onPress} activeOpacity={0.75}>
    <Ionicons name={icon as any} size={12} color={meta.color} />
    <Text style={dStyles.label}>{label}:</Text>
    <Text style={[dStyles.value, { color: meta.color }]} numberOfLines={1}>
      {meta.label}
    </Text>
  </TouchableOpacity>
);
const dStyles = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", gap: 5 },
  label: { fontSize: 11, lineHeight: 15, color: "#fff", fontFamily: Typography.fontFamily.medium },
  value: { fontSize: 11, lineHeight: 15, fontFamily: Typography.fontFamily.semibold, flexShrink: 1 },
});

// ─── Single vehicle card ──────────────────────────────────────────────────────

type Vehicle = {
  id: number;
  license_plate: string;
  model?: string | null;
  production_year?: number | null;
  image_url?: string | null;
  license_expiry_date?: string | null;
  inspection_expiry_date?: string | null;
  insurance_expiry_date?: string | null;
};

const SingleVehicleCard: React.FC<{
  vehicle: Vehicle;
  isSlide?: boolean;
  onImagePress: (url: string) => void;
}> = ({ vehicle, isSlide, onImagePress }) => {
  const navigation = useNavigation<NavigationProp>();

  const vehicleIdStr = String(vehicle.id);
  const { data: violationData } = useGetCustomerVehicleViolationQuery(vehicleIdStr);

  const violationStatus = violationData?.violation_status ?? "pending";
  const violationCount  = violationData?.violation_count ?? 0;

  const goDetail = useCallback(() => {
    navigation.navigate("VehicleDetail", { vehicleId: vehicleIdStr, licensePlate: vehicle.license_plate });
  }, [navigation, vehicleIdStr, vehicle.license_plate]);

  const goEdit = useCallback(() => {
    navigation.navigate("VehicleEdit", { vehicleId: vehicleIdStr, licensePlate: vehicle.license_plate });
  }, [navigation, vehicleIdStr, vehicle.license_plate]);

  const licenseExpiry    = getExpiryMeta(vehicle.license_expiry_date);
  const inspectionExpiry = getExpiryMeta(vehicle.inspection_expiry_date);
  const insuranceExpiry  = getExpiryMeta(vehicle.insurance_expiry_date);

  const modelText = [
    vehicle.model,
    vehicle.production_year ? String(vehicle.production_year) : null,
  ].filter(Boolean).join(" - ") || "Chưa cập nhật";

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={goDetail}
      style={[styles.atmCardOuter, isSlide && { width: CARD_WIDTH }]}
    >
      <LinearGradient
        colors={["#1b3a6b", "#0e2550", "#091c3e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.atmCard}
      >
        {/* Decorative circles */}
        <View style={styles.dec1} />
        <View style={styles.dec2} />

        {/* Header */}
        <View style={styles.atmHeader}>
          <Image source={AppLogo} style={styles.atmLogo} resizeMode="contain" />
          <Text style={styles.atmModel} numberOfLines={1}>{modelText}</Text>
          <ViolationTag status={violationStatus} count={violationCount} />
        </View>

        <View style={styles.divider} />

        {/* Body */}
        <View style={styles.atmBody}>
          {/* Photo */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => vehicle.image_url && onImagePress(vehicle.image_url)}
          >
            {vehicle.image_url ? (
              <OptimizedImage
                source={{ uri: vehicle.image_url }}
                width={140}
                height={130}
                borderRadius={12}
              />
            ) : (
              <View style={{ width: 140, height: 130, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="camera-outline" size={28} color="rgba(255,255,255,0.4)" />
              </View>
            )}
          </TouchableOpacity>

          {/* Info column */}
          <View style={styles.infoCol}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Biển số:</Text>
              <Text style={styles.valuePlate} numberOfLines={1}>{vehicle.license_plate}</Text>
            </View>

            <View style={styles.miniGap} />

            <DocRow icon="document-text-outline"    label="Bằng lái"  meta={licenseExpiry}    onPress={goDetail} />
            <DocRow icon="shield-checkmark-outline" label="Đăng kiểm" meta={inspectionExpiry} onPress={goEdit} />
            <DocRow icon="card-outline"             label="Bảo hiểm"  meta={insuranceExpiry}  onPress={goEdit} />

            <View style={styles.checkedAtRow}>
              <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.35)" />
              <Text style={styles.checkedAtText} numberOfLines={1}>
                {violationData?.checked_at
                  ? (() => {
                      const d = new Date(violationData.checked_at);
                      const hh = String(d.getHours()).padStart(2, "0");
                      const mm = String(d.getMinutes()).padStart(2, "0");
                      const ss = String(d.getSeconds()).padStart(2, "0");
                      const dd = String(d.getDate()).padStart(2, "0");
                      const mo = String(d.getMonth() + 1).padStart(2, "0");
                      const yy = d.getFullYear();
                      return `Cập nhật: ${hh}:${mm}:${ss} ${dd}/${mo}/${yy}`;
                    })()
                  : "Cập nhật phạt nguội: Chưa kiểm tra"}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ─── Dot indicator ────────────────────────────────────────────────────────────

const DotIndicator: React.FC<{ count: number; activeIndex: number }> = ({ count, activeIndex }) => (
  <View style={dotStyles.row}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={[dotStyles.dot, i === activeIndex && dotStyles.dotActive]} />
    ))}
  </View>
);
const dotStyles = StyleSheet.create({
  row:       { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: S * 0.75 },
  dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(0,0,0,0.15)" },
  dotActive: { width: 18, backgroundColor: Colors.primary },
});

// ─── Main component ───────────────────────────────────────────────────────────

const VehicleInfoCard: React.FC = () => {
  const userId    = useAppSelector((s) => s.auth.userId);
  const userPhone = useAppSelector((s) => s.auth.userPhone);
  const navigation = useNavigation<NavigationProp>();
  const hasGarageContext = useAppSelector(
    (s) => Boolean(s.garageContext.garageCode && s.garageContext.resolved),
  );

  const queryParams = useMemo(() => {
    if (userId)    return { customer_id: userId };
    if (userPhone) return { phone: userPhone } as any;
    return undefined;
  }, [userId, userPhone]);

  const { data: vehiclesData, isLoading, error } = useGetCustomerVehiclesQuery(queryParams, {
    skip: !hasGarageContext || !queryParams,
    refetchOnMountOrArgChange: 30,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const flatListRef = useRef<FlatList>(null);

  const vehicles     = useMemo(() => vehiclesData?.data ?? [], [vehiclesData?.data]);
  const isMultiple   = vehicles.length > 1;

  const handleViewAllVehicles = useCallback(() => {
    if (!hasGarageContext) { navigation.navigate("SelectGarage"); return; }
    navigation.navigate("VehicleList", { userId, userPhone });
  }, [hasGarageContext, navigation, userId, userPhone]);

  const handleImagePress = useCallback((url: string) => setSelectedImage(url), []);
  const handleCloseModal = useCallback(() => setSelectedImage(null), []);

  const handleScroll = useCallback((e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(index);
  }, []);

  // ── Early returns ──────────────────────────────────────────────────────────

  if (!hasGarageContext) {
    return <View style={styles.stateCard}><Text style={styles.stateText}>Hãy chọn gara để xem danh sách xe của bạn.</Text></View>;
  }
  if (error && (error as any)?.status === 429) {
    return <View style={styles.stateCard}><Text style={styles.stateText}>Đang tải quá nhanh. Vui lòng thử lại sau.</Text></View>;
  }
  if (error && (error as any)?.status === "TIMEOUT_ERROR") {
    return (
      <View style={styles.stateCard}>
        <View style={styles.statePill}><Ionicons name="time-outline" size={18} color={Colors.primary} /><Text style={styles.statePillText}>Quá thời gian</Text></View>
        <Text style={styles.stateText}>Hệ thống phản hồi chậm, vui lòng thử lại.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.navigate("Home")} activeOpacity={0.85}>
          <Text style={styles.retryButtonText}>Tải lại</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (isLoading) return <VehicleCardSkeleton />;
  if (error) {
    const msg = "status" in error && (error as any).status === 404 ? "Endpoint chưa được hỗ trợ" : "Lỗi tải thông tin xe";
    return (
      <View style={styles.stateCard}>
        <View style={styles.statePill}><Ionicons name="alert-circle-outline" size={18} color={Colors.primary} /><Text style={styles.statePillText}>Lỗi</Text></View>
        <Text style={styles.stateText}>{msg}</Text>
      </View>
    );
  }
  if (vehicles.length === 0) {
    return (
      <View style={styles.stateCard}>
        <View style={styles.statePill}><Ionicons name="car-outline" size={18} color={Colors.primary} /><Text style={styles.statePillText}>Chưa có xe</Text></View>
        <Text style={styles.stateText}>Chưa có thông tin xe</Text>
        <Text style={styles.stateHint}>Xe sẽ tự động được thêm khi tạo đơn dịch vụ</Text>
      </View>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <View style={styles.wrapper}>
      {isMultiple ? (
        <>
          <FlatList
            ref={flatListRef}
            data={vehicles}
            keyExtractor={(v) => String(v.id)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <SingleVehicleCard
                vehicle={item}
                isSlide
                onImagePress={handleImagePress}
              />
            )}
          />
          <DotIndicator count={vehicles.length} activeIndex={activeIndex} />
        </>
      ) : (
        <SingleVehicleCard
          vehicle={vehicles[0]}
          onImagePress={handleImagePress}
        />
      )}

      {/* View all */}
      {isMultiple && (
        <TouchableOpacity style={styles.viewAllBtn} onPress={handleViewAllVehicles} activeOpacity={0.88}>
          <Text style={styles.viewAllBtnText}>Xem tất cả xe ({vehicles.length})</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      )}

      {/* Full Screen Image Modal */}
      <Modal visible={!!selectedImage} transparent onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalClose} onPress={handleCloseModal}>
            <Ionicons name="close-outline" size={30} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Wrapper — controls outer spacing of the whole section ──
  wrapper: {
    gap: S,                        // khoảng cách giữa card / dot / viewAllBtn
    marginHorizontal: -BLEED,
    marginTop: -S * 1.5,
    marginBottom: 16,
  },

  // ── ATM card ──
  atmCardOuter: {
    width: "100%",
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 14,
    overflow: "visible",
  },
  atmCard: {
    borderRadius: 22,
    paddingHorizontal: S * 2.5,
    paddingTop: S * 2,
    paddingBottom: S * 2,
    minHeight: 250,
    overflow: "hidden",
  },

  dec1: {
    position: "absolute",
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.04)",
    right: -90, top: -100,
  },
  dec2: {
    position: "absolute",
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.04)",
    left: -55, bottom: -60,
  },

  // ── Header ──
  atmHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: S * 0.75,
    marginBottom: S * 1.5,
  },
  atmHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: S,
    flex: 1,
  },
  atmLogo: {
    width: 30, height: 30,
    borderRadius: 8,
    flexShrink: 0,
  },
  atmModel: {
    fontSize: 14,
    lineHeight: 18,
    color: "#fff",
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.4,
    flex: 1,
    marginRight: S * 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: S * 1.5,
  },

  // ── Body ──
  atmBody: {
    flexDirection: "row",
    gap: S * 1.75,
    alignItems: "flex-start",
  },

  photoWrap: {
    width: 150, height: 130,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    flexShrink: 0,
  },
  photoPlaceholder: {
    width: "100%", height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Info column ──
  infoCol: {
    flex: 1,
    gap: S * 0.75,                 // khoảng cách đều giữa tất cả hàng
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S * 0.75,
  },
  infoLabel: {
    fontSize: 11, lineHeight: 15,
    color: "rgba(255,255,255,0.5)",
    fontFamily: Typography.fontFamily.medium,
  },
  valuePlate: {
    fontSize: 17, lineHeight: 21,
    color: "#fff",
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 1.8,
    flexShrink: 1,
  },
  valueNormal: {
    fontSize: 13, lineHeight: 17,
    color: "rgba(255,255,255,0.88)",
    fontFamily: Typography.fontFamily.medium,
    flexShrink: 1,
  },
  miniGap: { height: S * 0.5 },   // khoảng nhỏ sau biển số trước DocRows

  checkedAtRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S * 0.375,
  },
  checkedAtText: {
    fontSize: 10, lineHeight: 14,
    color: "#FBBF24",
    fontFamily: Typography.fontFamily.regular,
    flexShrink: 1,
  },

  // ── View all btn ──
  viewAllBtn: {
    marginHorizontal: BLEED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: S * 1.5,
    paddingHorizontal: S * 1.75,
    borderRadius: 16,
    backgroundColor: Colors.alpha.primary08,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  viewAllBtnText: {
    fontSize: 13, lineHeight: 16,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },

  // ── State views ──
  stateCard: {
    borderRadius: 20,
    padding: S * 1.75,
    backgroundColor: Colors.surface.elevated,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
    gap: S,
  },
  statePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: S,
    paddingHorizontal: S * 1.5,
    paddingVertical: S,
    borderRadius: 999,
    backgroundColor: Colors.alpha.primary08,
    alignSelf: "flex-start",
  },
  statePillText: {
    fontSize: 13, lineHeight: 16,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  stateText: {
    fontSize: 14, lineHeight: 18,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.medium,
  },
  stateHint: {
    fontSize: 12, lineHeight: 16,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
  },
  retryButton: {
    paddingHorizontal: S * 2,
    paddingVertical: S,
    borderRadius: 999,
    backgroundColor: Colors.alpha.primary12,
    alignSelf: "center",
  },
  retryButtonText: {
    fontSize: 13, lineHeight: 16,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 50, right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: S,
  },
  fullScreenImage: {
    width: "100%", height: "100%",
  },
});

VehicleInfoCard.displayName = "VehicleInfoCard";

export default React.memo(VehicleInfoCard);
