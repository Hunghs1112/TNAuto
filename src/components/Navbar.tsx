import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Colors } from "../constants/colors";
import { Typography } from "../constants/typo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavbarTabItem, splitNavbarTabs } from "./navbarPolicy";

const ACTIVE_COLOR   = Colors.primary;   // navy #112552 — màu chủ đạo app
const INACTIVE_COLOR = "#6E6E73";

// ─── Tab button thường ────────────────────────────────────────────────────────
const TabButton = React.memo(function TabButton({
  label,
  icon,
  isActive,
  onPress,
}: {
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const resolvedIcon = isActive
    ? icon.replace(/-outline$/, "")
    : icon.endsWith("-outline") ? icon : `${icon}-outline`;

  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={resolvedIcon as any}
          size={26}
          color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
      </View>
      <Text
        style={[styles.menuText, { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

// ─── Nút giữa — bo góc vuông như mẫu, gradient màu app ───────────────────────
const CenterButton = React.memo(function CenterButton({
  tab,
  onPress,
}: {
  tab: NavbarTabItem;
  onPress: () => void;
}) {
  const resolvedIcon = tab.icon.replace(/-outline$/, "");

  return (
    <View style={styles.searchContainer}>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[...Colors.gradients.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.searchGradient}
        >
          <Ionicons name={resolvedIcon as any} size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
});

// ─── Navbar ───────────────────────────────────────────────────────────────────
type NavbarProps = {
  tabs: NavbarTabItem[];
  activeTab: string;
  onTabPress: (tab: NavbarTabItem) => void;
};

const Navbar = ({ tabs, activeTab, onTabPress }: NavbarProps) => {
  const insets = useSafeAreaInsets();
  const { leftTabs, rightTabs, centerTab } = splitNavbarTabs(tabs);

  // Cách đáy sát hơn
  const bottomOffset = 25;

  return (
    <View
      style={[styles.bottomMenuContainer, { bottom: bottomOffset }]}
      pointerEvents="box-none"
    >
      <View style={styles.bottomMenu}>
        {/* Left tabs */}
        {leftTabs.map((t) => (
          <TabButton
            key={t.key}
            label={t.label}
            icon={t.icon}
            isActive={activeTab === t.routeName}
            onPress={() => onTabPress(t)}
          />
        ))}

        {/* Center button */}
        {centerTab ? (
          <CenterButton
            tab={centerTab}
            onPress={() => onTabPress(centerTab)}
          />
        ) : (
          <View style={styles.searchContainer} />
        )}

        {/* Right tabs */}
        {rightTabs.map((t) => (
          <TabButton
            key={t.key}
            label={t.label}
            icon={t.icon}
            isActive={activeTab === t.routeName}
            onPress={() => onTabPress(t)}
          />
        ))}
      </View>
    </View>
  );
};

// ─── Styles — sát với mẫu ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bottomMenuContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  bottomMenu: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffffff",
    width: "100%",
    paddingVertical: 8,
    borderRadius: 15,          // bo góc pill như mẫu
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  menuItem: {
    alignItems: "center",
    padding: 8,
    flex: 1,
  },
  menuText: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: Typography.fontFamily.medium,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  // Nút giữa
  searchContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  searchButton: {
    width: 56,
    height: 56,
    borderRadius: 20,          // bo góc vuông như mẫu — KHÔNG tròn hoàn toàn
    overflow: "hidden",
    elevation: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  searchGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(Navbar);
