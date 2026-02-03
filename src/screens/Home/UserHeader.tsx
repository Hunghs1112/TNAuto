// src/components/UserHeader/UserHeader.tsx
import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { spacing } from "../../design-system/spacing";
import { textStyles } from "../../design-system/typography";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface UserHeaderProps {
  userName: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
  isLoggedIn?: boolean;
}

const UserHeader: React.FC<UserHeaderProps> = ({ userName, notificationCount, onNotificationPress, isLoggedIn = true }) => {
  const navigation = useNavigation<NavigationProp>();
  const showBadge = useMemo(() => notificationCount && notificationCount > 0, [notificationCount]);
  const badgeText = useMemo(() => {
    if (!notificationCount) return '';
    return notificationCount > 99 ? '99+' : notificationCount.toString();
  }, [notificationCount]);

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

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
              <Pressable style={styles.notificationButton} onPress={onNotificationPress}>
                <Ionicons name="notifications-outline" size={24} color={Colors.background.light} />
                {showBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeText}</Text>
                  </View>
                )}
              </Pressable>
            ) : (
              <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
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
  container: {
    width: "100%",
  },
  topSpacing: {
    height: spacing.lg,
  },
  content: {
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    width: "100%",
    position: 'relative',
    zIndex: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  greetingContainer: {
    gap: spacing.xs,
    flex: 1,
  },
  greeting: {
    color: Colors.background.light,
    ...textStyles.body,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    opacity: 0.95,
  },
  userName: {
    color: Colors.background.light,
    ...textStyles.h2,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.2,
  },
  actionContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background.light,
  },
  badgeText: {
    color: Colors.text.inverted,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 9,
    fontWeight: Typography.weight.bold,
    lineHeight: 11,
    paddingHorizontal: spacing.xs / 2,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  loginButtonText: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: Typography.weight.bold,
  },
});

export default React.memo(UserHeader);