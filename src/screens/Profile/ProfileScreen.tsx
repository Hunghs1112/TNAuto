// screens/ProfileScreen.tsx - Profile screen with FCM token cleanup on logout
import React, { useEffect } from "react";
import { View, Text, Pressable, Image, Alert, ActivityIndicator, ScrollView } from "react-native";
import { Screen } from "../../components/layout";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { styles } from "./styles";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { RootState } from "../../redux/stores";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { logout } from "../../redux/slices/authSlice";
import { clearCurrentEmployee } from "../../redux/slices/employeeSlice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import { clearAuthStorage } from "../../utils/authStorage";
import { unregisterFCMTokenOnLogout } from "../../utils/fcmTokenManager";
import { useDeleteAccountMutation } from "../../services/customerApi";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { refreshing, onRefresh } = useAutoRefresh();
  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isLoggedIn);
  const userName = useAppSelector((state: RootState) => state.auth.userName || 'User');
  const userType = useAppSelector((state: RootState) => state.auth.userType || 'customer');
  const avatarUrl = useAppSelector((state: RootState) => state.auth.avatarUrl || 'https://i.pravatar.cc/150?img=12');
  const userPhone = useAppSelector((state: RootState) => state.auth.userPhone || '');
  
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  // Redirect to Login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace('Login');
    }
  }, [isLoggedIn, navigation]);

  // Don't render if not logged in (will redirect)
  if (!isLoggedIn) {
    return null;
  }

  const handleLogout = async () => {
    // Unregister FCM token first
    try {
      await unregisterFCMTokenOnLogout();
    } catch (error) {
      console.error('ProfileScreen: Failed to unregister FCM token:', error);
    }
    
    await clearAuthStorage();
    dispatch(clearCurrentEmployee());
    dispatch(logout());
  };

  // Handle delete account with confirmation
  const handleDeleteAccount = () => {
    Alert.alert(
      'Xác nhận xóa tài khoản',
      'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu của bạn bao gồm:\n\n• Thông tin tài khoản\n• Danh sách xe\n• Lịch sử đơn hàng\n• Bảo hành\n• Thông báo\n\nLưu ý: Nếu bạn có đơn hàng đang xử lý, bạn không thể xóa tài khoản.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tài khoản',
          style: 'destructive',
          onPress: () => confirmDeleteAccount(),
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      const result = await deleteAccount({ phone: userPhone, confirm: true }).unwrap();

      if (result.success) {
        Alert.alert(
          'Tài khoản đã bị xóa',
          `Tài khoản của bạn đã được xóa thành công.\n\nDữ liệu đã xóa:\n• Xe: ${result.deleted_data.vehicles_deleted}\n• Đơn hàng: ${result.deleted_data.orders_deleted}\n• Bảo hành: ${result.deleted_data.warranties_deleted}\n• Thông báo: ${result.deleted_data.notifications_deleted}`,
          [
            {
              text: 'OK',
              onPress: async () => {
                await clearAuthStorage();
                dispatch(logout());
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      
      const errorMessage = error.message || error.data?.error || 'Không thể xóa tài khoản.';
      
      if (errorMessage.includes('đơn hàng đang hoạt động') || errorMessage.includes('active orders')) {
        Alert.alert(
          'Không thể xóa tài khoản',
          'Bạn có đơn hàng đang được xử lý. Vui lòng hoàn thành hoặc hủy các đơn hàng này trước khi xóa tài khoản.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Lỗi', errorMessage);
      }
    }
  };

  const renderMenuItems = () => {
    // Customer menu items (không có đổi mật khẩu)
    const customerItems = [
      { icon: 'person-outline', text: 'Thông tin tài khoản', onPress: () => navigation.navigate('AccountInfo') },
    ];

    // Employee menu items (có đổi mật khẩu)
    const employeeItems = [
      { icon: 'person-outline', text: 'Thông tin tài khoản', onPress: () => navigation.navigate('AccountInfo') },
      { icon: 'key-outline', text: 'Đổi mật khẩu', onPress: () => {} },
      { icon: 'list-outline', text: 'Quản lý đơn hàng', onPress: () => {} },
      { icon: 'notifications-outline', text: 'Cài đặt thông báo', onPress: () => {} },
    ];

    const items = userType === 'employee' ? employeeItems : customerItems;

    return items.map((item, index) => (
      <Pressable 
        key={index}
        style={({ pressed }) => [
          styles.menuItem,
          pressed && styles.menuItemPressed
        ]} 
        onPress={item.onPress}
      >
        <View style={styles.menuContent}>
          <View style={styles.menuIconContainer}>
            <Ionicons name={item.icon} size={22} color={Colors.primary} />
          </View>
          <Text style={styles.menuText}>{item.text}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
      </Pressable>
    ));
  };

  return (
    <Screen
      headerTitle="Cài đặt"
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
    >
      <ScrollView 
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section - Ngay dưới header */}
        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Image 
                source={{ uri: avatarUrl }} 
                style={styles.avatar}
                resizeMode="cover"
                onError={(error) => console.log('ProfileScreen - Avatar load error:', error.nativeEvent.error)}
              />
              <View style={styles.avatarBorder} />
            </View>
            <Text style={styles.userName}>{userName}</Text>
            <View style={styles.userTypeBadge}>
              <Ionicons 
                name={userType === 'customer' ? 'person-outline' : 'briefcase-outline'} 
                size={14} 
                color={Colors.primary} 
              />
              <Text style={styles.userTypeText}>
                {userType === 'customer' ? 'Khách hàng' : 'Nhân viên'}
              </Text>
            </View>
            {userPhone && (
              <View style={styles.phoneContainer}>
                <Ionicons name="call-outline" size={14} color={Colors.text.secondary} />
                <Text style={styles.phoneText}>{userPhone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            {renderMenuItems()}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <Pressable 
              style={({ pressed }) => [
                styles.actionButton,
                styles.deleteButton,
                pressed && styles.actionButtonPressed,
                isDeleting && styles.actionButtonDisabled
              ]} 
              onPress={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color={Colors.status.error} size="small" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color={Colors.status.error} />
                  <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
                </>
              )}
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.actionButton,
                styles.logoutButton,
                pressed && styles.actionButtonPressed
              ]} 
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color={Colors.background.red} />
              <Text style={styles.logoutButtonText}>Đăng xuất</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default ProfileScreen;