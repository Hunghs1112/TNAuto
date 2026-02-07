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
import { clearWarranties } from "../../redux/slices/warrantySlice";
import { warrantyApi } from "../../services/warrantyApi";
import { serviceOrderApi } from "../../services/serviceOrderApi";
import { vehicleApi } from "../../services/vehicleApi";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { clearAuthStorage } from "../../utils/authStorage";
import { unregisterFCMTokenOnLogout } from "../../utils/fcmTokenManager";
import { useDeleteAccountMutation } from "../../services/customerApi";

import { styles } from "./styles";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type SettingItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
};

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

    // Clear cached/persisted user-scoped data to avoid leaking previous account data
    dispatch(clearWarranties());
    dispatch(warrantyApi.util.resetApiState());
    dispatch(serviceOrderApi.util.resetApiState());
    dispatch(vehicleApi.util.resetApiState());

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

  const settingsItems: SettingItem[] =
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
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={[...Colors.gradients.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroTopRow}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
              <View style={styles.heroText}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userPhone}>{userPhone}</Text>
                <Text style={styles.userRole}>
                  {userType === "employee" ? "Nhân viên" : "Khách hàng"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.sheet}>
          <View style={styles.sheetContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cài đặt</Text>
              <View style={styles.listCard}>
                {settingsItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <Pressable
                      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                      onPress={item.onPress}
                      android_ripple={{ color: Colors.neutral[100] }}
                    >
                      <View style={styles.rowIcon}>
                        <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
                      </View>
                      <View style={styles.rowText}>
                        <Text style={styles.rowTitle}>{item.title}</Text>
                        {!!item.subtitle && <Text style={styles.rowSubtitle}>{item.subtitle}</Text>}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
                    </Pressable>
                    {index < settingsItems.length - 1 && <View style={styles.rowDivider} />}
                  </React.Fragment>
                ))}
              </View>
            </View>

            <View style={styles.actions}>
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
