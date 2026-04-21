import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { Vehicle } from "../../types/api.types";
import { AppStackParamList } from "../../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type ExpiryState = "missing" | "valid" | "expired";

type ExpiryItem = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  expiryDate?: string | null;
  route: keyof AppStackParamList;
  routeParams: Record<string, any>;
};

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getExpiryMeta = (expiryDate?: string | null) => {
  const parsed = parseDate(expiryDate);

  if (!parsed) {
    return {
      state: "missing" as ExpiryState,
      label: "Chưa cập nhật",
      daysLabel: "",
      color: Colors.text.secondary,
    };
  }

  const diffMs = parsed.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      state: "expired" as ExpiryState,
      label: "Hết hạn",
      daysLabel: `${Math.abs(diffDays)} ngày`,
      color: Colors.status.error,
    };
  }

  return {
    state: "valid" as ExpiryState,
    label: "Còn",
    daysLabel: `${diffDays} ngày`,
    color: Colors.status.success,
  };
};

const buildExpiryItems = (vehicle?: Vehicle | null): ExpiryItem[] => [
  {
    id: "license",
    title: "Bằng lái",
    icon: "document-text-outline",
    accent: "#16A34A",
    expiryDate: vehicle?.license_expiry_date,
    route: "VehicleDetail",
    routeParams: { vehicleId: String(vehicle?.id ?? ""), licensePlate: vehicle?.license_plate ?? "" },
  },
  {
    id: "inspection",
    title: "Đăng kiểm",
    icon: "shield-checkmark-outline",
    accent: "#EAB308",
    expiryDate: vehicle?.inspection_expiry_date,
    route: "VehicleEdit",
    routeParams: { vehicleId: String(vehicle?.id ?? ""), licensePlate: vehicle?.license_plate ?? "" },
  },
  {
    id: "insurance",
    title: "Bảo hiểm",
    icon: "card-outline",
    accent: "#7C3AED",
    expiryDate: vehicle?.insurance_expiry_date,
    route: "VehicleEdit",
    routeParams: { vehicleId: String(vehicle?.id ?? ""), licensePlate: vehicle?.license_plate ?? "" },
  },
];

export type DocumentExpiryCardsProps = {
  vehicle?: Vehicle | null;
};

const DocumentExpiryCards = ({ vehicle }: DocumentExpiryCardsProps) => {
  const items = useMemo(() => buildExpiryItems(vehicle), [vehicle]);
  const navigation = useNavigation<NavigationProp>();

  const handlePress = (item: ExpiryItem) => {
    if (!item.routeParams.vehicleId || !item.routeParams.licensePlate) return;
    navigation.navigate(item.route as any, item.routeParams as any);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.wrapper}
    >
      {items.map((item) => {
        const expiryMeta = getExpiryMeta(item.expiryDate);
        const isMissing = expiryMeta.state === "missing";

        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            style={[styles.card, { borderColor: item.accent + "66" }]}
            onPress={() => handlePress(item)}
          >
            <View style={styles.headerRow}>
              <View style={[styles.iconWrap, { backgroundColor: item.accent + "14" }]}>
                <Ionicons name={item.icon} size={12} color={item.accent} />
              </View>
              <Text style={[styles.title, { color: item.accent }]} numberOfLines={1}>
                {item.title}
              </Text>
            </View>

            <View style={styles.countdownWrap}>
              <Text
                style={[
                  styles.countdownText,
                  isMissing
                    ? styles.countdownMissing
                    : expiryMeta.state === "expired"
                      ? styles.countdownExpired
                      : styles.countdownValid,
                ]}
                numberOfLines={1}
              >
                {expiryMeta.label}
              </Text>
              {expiryMeta.daysLabel ? (
                <Text
                  style={[
                    styles.daysText,
                    isMissing
                      ? styles.daysMissing
                      : expiryMeta.state === "expired"
                        ? styles.daysExpired
                        : styles.daysValid,
                  ]}
                  numberOfLines={1}
                >
                  {expiryMeta.daysLabel}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 4,
  },
  card: {
    width: 108,
    aspectRatio: 1,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    backgroundColor: Colors.background.light,
    shadowColor: Colors.shadow.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconWrap: {
    width: 16,
    height: 16,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontSize: 12,
    lineHeight: 14,
    fontFamily: Typography.fontFamily.bold,
  },
  countdownWrap: {
    gap: 2,
  },
  countdownText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Typography.fontFamily.semibold,
  },
  countdownMissing: {
    color: Colors.text.secondary,
  },
  countdownValid: {
    color: Colors.status.success,
  },
  countdownExpired: {
    color: Colors.status.error,
  },
  daysText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Typography.fontFamily.bold,
  },
  daysMissing: {
    color: Colors.text.secondary,
  },
  daysValid: {
    color: Colors.status.success,
  },
  daysExpired: {
    color: Colors.status.error,
  },
});

export default React.memo(DocumentExpiryCards);
