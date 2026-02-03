// screens/Profile/ProfileScreen.tsx - Modern Profile & Settings Screen with original logic
import React, { useEffect } from "react";
import { View, Text, Pressable, Image, ScrollView, Alert, ActivityIndicator } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { Screen } from "../../components/layout";
import { Colors } from "../../constants/colors";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { logout } from "../../redux/slices/authSlice";
import { clearCurrentEmployee } from "../../redux/slices/employeeSlice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { clearAuthStorage } from "../../utils/authStorage";
import { unregisterFCMTokenOnLogout } from "../../utils/fcmTokenManager";
import { useDeleteAccountMutation } from "../../services/customerApi";

import { styles } from "./styles";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();

  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const userName = useAppSelector((state) => state.auth.userName || "Người dùng");
  const userType = useAppSelector((state) => state.auth.userType || "customer");
  const avatarUrl = useAppSelector(
    (state) => state.auth.avatarUrl || "https://i.pravatar.cc/150?img=12",
  );
  const userPhone = useAppSelector((state) => state.auth.userPhone || "");

  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace("Login");
    }
  }, [isLoggedIn, navigation]);

  if (!isLoggedIn) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await unregisterFCMTokenOnLogout();
    } catch (error) {
      console.error("ProfileScreen: Failed to unregister FCM token:", error);
    }

    await clearAuthStorage();
    dispatch(clearCurrentEmployee());
    dispatch(logout());
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Xác nhận xóa tài khoản",
      "Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu của bạn.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa tài khoản",
          style: "destructive",
          onPress: () => confirmDeleteAccount(),
        },
      ],
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      const result = await deleteAccount({ phone: userPhone, confirm: true }).unwrap();
      if (result.success) {
        Alert.alert("Tài khoản đã bị xóa", "Tài khoản của bạn đã được xóa thành công.", [
          { text: "OK", onPress: handleLogout },
        ]);
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      const errorMessage = error.data?.error || "Không thể xóa tài khoản.";
      Alert.alert("Lỗi", errorMessage);
    }
  };

  const settingsItems =
    userType === "employee"
      ? [
          {
            id: "account",
            title: "Thông tin tài khoản",
            subtitle: "Chỉnh sửa hồ sơ, thông tin cá nhân",
            icon: "person-outline",
            onPress: () => navigation.navigate("AccountInfo"),
          },
          {
            id: "changePassword",
            title: "Đổi mật khẩu",
            subtitle: "Cập nhật mật khẩu của bạn",
            icon: "key-outline",
            onPress: () => {},
          },
          {
            id: "orders",
            title: "Quản lý đơn hàng",
            subtitle: "Xem và quản lý các đơn hàng",
            icon: "list-outline",
            onPress: () => {},
          },
          {
            id: "notifications",
            title: "Cài đặt thông báo",
            subtitle: "Quản lý thông báo ứng dụng",
            icon: "notifications-outline",
            onPress: () => {},
          },
        ]
      : [
          {
            id: "account",
            title: "Thông tin tài khoản",
            subtitle: "Chỉnh sửa hồ sơ, xem các mục yêu thích",
            icon: "person-outline",
            onPress: () => navigation.navigate("AccountInfo"),
          },
        ];

  return (
    <Screen hideHeader statusBarStyle="light-content">
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={[...Colors.gradients.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroContainer}
        >
          <View style={styles.heroRow}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
            <View style={styles.heroText}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userPhone}>{userPhone}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.bodyInner}>
            <View style={styles.settingsCard}>
              {settingsItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]}
                  onPress={item.onPress}
                  android_ripple={{ color: Colors.neutral[100] }}
                >
                  <View style={styles.settingIconContainer}>
                    <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
                </Pressable>
              ))}
            </View>

            <View style={styles.actionSection}>
              {userType !== "employee" && (
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.deleteButton,
                    pressed && styles.actionButtonPressed,
                    isDeleting && styles.actionButtonDisabled,
                  ]}
                  onPress={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator color={Colors.background.light} size="small" />
                  ) : (
                    <>
                      <View style={[styles.actionIconWrap, styles.deleteIconWrap]}>
                        <Ionicons name="trash-outline" size={18} color={Colors.background.light} />
                      </View>
                      <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
                    </>
                  )}
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.logoutButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={handleLogout}
              >
                <View style={[styles.actionIconWrap, styles.logoutIconWrap]}>
                  <Ionicons name="log-out-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default React.memo(ProfileScreen);
