import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Typography } from "../constants/typo";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HeaderProps = {
  title?: string;
  subtitle?: string;
  hideBackButton?: boolean;
  hideRightButton?: boolean;
  onPressRight?: () => void;
};

const Header = ({
  title = "",
  subtitle,
  hideBackButton = false,
  hideRightButton = false,
  onPressRight,
}: HeaderProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const insets = useSafeAreaInsets();

  const handleBackPress = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch {
      try {
        navigation.navigate("Home" as never);
      } catch {
        // silent fail
      }
    }
  }, [navigation]);

  const canGoBack = useMemo(() => navigation.canGoBack(), [navigation]);
  const showBackButton = useMemo(
    () => !hideBackButton && canGoBack,
    [hideBackButton, canGoBack]
  );

  return (
    <View
      style={[
        styles.header,
        // Thêm paddingTop bằng safe area nếu Screen không tự xử lý
        { paddingTop: Math.max(insets.top > 0 ? 12 : 16, 12) },
      ]}
    >
      {/* Nút back */}
      <View style={styles.leftSlot}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <View style={styles.centerSlot}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right slot */}
      <View style={styles.rightSlot}>
        {!hideRightButton && onPressRight && (
          <TouchableOpacity
            onPress={onPressRight}
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    // Shadow
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    zIndex: 10,
  },
  leftSlot: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  centerSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  rightSlot: {
    width: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    textAlign: "center",
  },
});

Header.displayName = "Header";

export default React.memo(Header);
