import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";
import { textStyles } from "../../design-system/typography";

interface UserHeaderProps {
  userName?: string;
  garageName?: string;
  onLoginPress?: () => void;
  onGaragePress?: () => void;
  isLoggedIn?: boolean;
  canChangeGarage?: boolean;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  userName,
  garageName,
  onLoginPress,
  onGaragePress,
  isLoggedIn = true,
  canChangeGarage = false,
}) => {
  const greetingText = isLoggedIn ? `Xin chào, ${userName || "Người dùng"}` : "GaraOne xin chào";

  return (
    <View style={styles.container}>
      <View style={styles.topSpacing} />
      <View style={styles.content}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{greetingText}</Text>

          {isLoggedIn && garageName && (
            <TouchableOpacity 
              style={styles.garageSelector} 
              onPress={canChangeGarage ? onGaragePress : undefined}
              activeOpacity={canChangeGarage ? 0.7 : 1}
              disabled={!canChangeGarage}
            >
              <Ionicons name="business-outline" size={14} color={Colors.background.light} />
              <Text style={styles.garageName} numberOfLines={1}>{garageName}</Text>
              {canChangeGarage && (
                <Ionicons name="chevron-down" size={14} color={Colors.background.light} />
              )}
            </TouchableOpacity>
          )}

          {!isLoggedIn && (
            <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
              <Ionicons name="log-in-outline" size={20} color={Colors.background.light} />
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%" },
  topSpacing: { height: 0 },
  content: {
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
    width: "100%",
    position: "relative",
    zIndex: 1,
  },
  headerContent: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: "center", 
    width: "100%" 
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  greeting: {
    color: Colors.background.light,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    opacity: 0.95,
    flex: 1,
  },
  garageSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.alpha.white12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 160,
  },
  garageName: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    flexShrink: 1,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: Colors.alpha.white25,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.alpha.white40,
  },
  loginButtonText: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: Typography.weight.bold,
  },
});

export default React.memo(UserHeader);
