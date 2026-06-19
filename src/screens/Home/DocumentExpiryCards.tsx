import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { Vehicle } from "../../types/api.types";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { useGetCustomerVehiclesQuery } from "../../services/vehicleApi";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ExpiryState = "missing" | "valid" | "expired";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getExpiryMeta = (expiryDate?: string | null) => {
  const parsed = parseDate(expiryDate);
  if (!parsed) return { state: "missing" as ExpiryState, label: "Chưa cập nhật", daysLabel: "" };

  const diffDays = Math.ceil((parsed.getTime() - Date.now()) / 86400000);
  if (diffDays < 0) {
    return { state: "expired" as ExpiryState, label: "Hết hạn", daysLabel: `${Math.abs(diffDays)} ngày` };
  }
  return { state: "valid" as ExpiryState, label: "Còn hạn", daysLabel: `${diffDays} ngày` };
};

// ─── Card config ──────────────────────────────────────────────────────────────

const CARDS = [
  { key: "license",    label: "Bằng lái",   icon: "document-text-outline" as const,    accent: "#16A34A", screen: "VehicleDetail" as const },
  { key: "inspection", label: "Đăng kiểm",  icon: "shield-checkmark-outline" as const, accent: "#EAB308", screen: "VehicleEdit" as const },
  { key: "insurance",  label: "Bảo hiểm",   icon: "card-outline" as const,             accent: "#7C3AED", screen: "VehicleEdit" as const },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

const DocumentExpiryCards: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = useWindowDimensions();
  const userId    = useAppSelector((s) => s.auth.userId);
  const userType  = useAppSelector((s) => s.auth.userType);
  const isLoggedIn = useAppSelector((s) => s.auth.isLoggedIn);

  // Thẻ xe dùng padding 16 mỗi bên → 3 ô chia đều phần còn lại, gap 8×2
  const cellWidth = Math.floor((screenWidth - 32 - 16) / 3);

  const isCustomer = isLoggedIn && userType === "customer" && !!userId;
  const { data: customerVehiclesData } = useGetCustomerVehiclesQuery(
    isCustomer ? { customer_id: userId } : undefined,
    { skip: !isCustomer },
  );

  const vehicle: Vehicle | null = useMemo(
    () => customerVehiclesData?.data?.[0] ?? null,
    [customerVehiclesData?.data],
  );

  const navigateToVehicle = (screen: "VehicleDetail" | "VehicleEdit") => {
    if (!vehicle?.id || !vehicle?.license_plate) return;
    navigation.navigate(screen, { vehicleId: String(vehicle.id), licensePlate: vehicle.license_plate });
  };

  const metas = {
    license:    getExpiryMeta(vehicle?.license_expiry_date),
    inspection: getExpiryMeta(vehicle?.inspection_expiry_date),
    insurance:  getExpiryMeta(vehicle?.insurance_expiry_date),
  };

  return (
    <View style={styles.row}>
      {CARDS.map((card) => {
        const meta      = metas[card.key];
        const isMissing = meta.state === "missing";
        const isExpired = meta.state === "expired";
        const textColor = isMissing ? Colors.text.secondary : isExpired ? Colors.status.error : Colors.status.success;

        return (
          <TouchableOpacity
            key={card.key}
            activeOpacity={0.85}
            style={[styles.card, { borderColor: card.accent + "55", width: cellWidth }]}
            onPress={() => navigateToVehicle(card.screen)}
          >
            {/* Icon + label */}
            <View style={styles.headerRow}>
              <View style={[styles.iconWrap, { backgroundColor: card.accent + "18" }]}>
                <Ionicons name={card.icon} size={11} color={card.accent} />
              </View>
              <Text style={[styles.title, { color: card.accent }]} numberOfLines={1}>
                {card.label}
              </Text>
            </View>

            {/* Status */}
            <Text style={[styles.statusText, { color: textColor }]} numberOfLines={1}>
              {meta.label}
            </Text>

            {/* Days */}
            {meta.daysLabel ? (
              <Text style={[styles.daysText, { color: textColor }]} numberOfLines={1}>
                {meta.daysLabel}
              </Text>
            ) : (
              // placeholder để giữ height đồng đều
              <Text style={styles.daysPlaceholder}> </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    borderRadius: 16,
    paddingHorizontal: 9,
    paddingTop: 9,
    paddingBottom: 9,
    borderWidth: 1,
    backgroundColor: Colors.background.light,
    shadowColor: Colors.shadow?.primary ?? "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    // KHÔNG dùng gap hay justifyContent: 'space-between'
    // để tránh khoảng trắng thừa
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  iconWrap: {
    width: 15,
    height: 15,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontSize: 11,
    lineHeight: 13,
    fontFamily: Typography.fontFamily.bold,
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Typography.fontFamily.semibold,
    marginBottom: 2,
  },
  daysText: {
    fontSize: 10,
    lineHeight: 13,
    fontFamily: Typography.fontFamily.bold,
  },
  daysPlaceholder: {
    fontSize: 10,
    lineHeight: 13,
  },
});

export default React.memo(DocumentExpiryCards);
