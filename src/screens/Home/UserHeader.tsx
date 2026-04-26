// src/components/UserHeader/UserHeader.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";
import { textStyles } from "../../design-system/typography";

interface UserHeaderProps {
  userName: string;
  onNotificationPress?: () => void;
  onOfferPress?: () => void;
  onInsurancePress?: () => void;
  onLoginPress?: () => void;
  isLoggedIn?: boolean;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  userName,
  onNotificationPress,
  onOfferPress,
  onInsurancePress,
  onLoginPress,
  isLoggedIn = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topSpacing} />
      <View style={styles.content}>
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Xin chào!</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.actionContainer}>
            {isLoggedIn ? (
              <>
                <Pressable style={styles.notificationButton} onPress={onOfferPress}>
                  <Ionicons name="pricetag-outline" size={20} color={Colors.background.light} />
                </Pressable>
                <Pressable style={styles.notificationButton} onPress={onInsurancePress}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={Colors.background.light} />
                </Pressable>
                <Pressable style={styles.notificationButton} onPress={onNotificationPress}>
                  <Ionicons name="notifications-outline" size={20} color={Colors.background.light} />
                </Pressable>
              </>
            ) : (
              <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
                <Ionicons name="log-in-outline" size={20} color={Colors.background.light} />
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%" },
  topSpacing: { height: 0 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    width: "100%",
    position: 'relative',
    zIndex: 1,
  },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" },
  greetingContainer: { gap: spacing.xs, flex: 1 },
  greeting: { color: Colors.background.light, ...textStyles.body, fontFamily: Typography.fontFamily.medium, fontWeight: Typography.weight.medium, opacity: 0.95 },
  userName: { color: Colors.background.light, ...textStyles.h2, fontFamily: Typography.fontFamily.bold, fontWeight: Typography.weight.bold, letterSpacing: 0.2 },
  actionContainer: { flexDirection: "row", gap: 8, alignItems: "center", alignSelf: "flex-start", marginTop: 2 },
  notificationButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: Colors.alpha.white25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.alpha.white40,
  },
  loginButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: Colors.alpha.white25, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.alpha.white40 },
  loginButtonText: { color: Colors.background.light, fontFamily: Typography.fontFamily.bold, fontSize: 14, fontWeight: Typography.weight.bold },
});

export default React.memo(UserHeader);
