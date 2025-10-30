// screens/ProfileScreen.tsx - Profile screen with FCM token cleanup on logout
import React from "react";
import { View, Text, Pressable, Image, StatusBar } from "react-native";
import { RootView } from "../../components/layout";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import Header from "../../components/Header";
import { AppStackParamList } from "../../navigation/AppNavigator";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from "./styles";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { RootState } from "../../redux/stores";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { logout } from "../../redux/slices/authSlice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import { clearAuthStorage } from "../../utils/authStorage";
import { unregisterFCMTokenOnLogout } from "../../utils/fcmTokenManager";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { refreshing, onRefresh } = useAutoRefresh();
  const userName = useAppSelector((state: RootState) => state.auth.userName || 'User');
  const userType = useAppSelector((state: RootState) => state.auth.userType || 'customer');
  const avatarUrl = useAppSelector((state: RootState) => state.auth.avatarUrl || 'https://i.pravatar.cc/150?img=12'); // Use auth avatarUrl directly

  console.log('ProfileScreen debug - userType:', userType, 'avatarUrl from auth:', avatarUrl); // Debug avatar

  const handleLogout = async () => {
    console.log('ProfileScreen debug - Logging out user:', userName); // Debug trước logout
    
    // Unregister FCM token first
    try {
      await unregisterFCMTokenOnLogout();
      console.log('ProfileScreen: FCM token unregistered successfully');
    } catch (error) {
      console.error('ProfileScreen: Failed to unregister FCM token:', error);
      // Continue with logout even if FCM unregistration fails
    }
    
    await clearAuthStorage(); // Xóa dữ liệu persist trước
    dispatch(logout()); // Dispatch logout action
    console.log('ProfileScreen debug - Logout dispatched, state reset to initial'); // Debug sau dispatch
  };

  const renderMenuItems = () => {
    // Customer menu items (không có đổi mật khẩu)
    const customerItems = [
      { icon: 'person-outline', text: 'Thông tin tài khoản', onPress: () => navigation.navigate('AccountInfo') },
      { icon: 'notifications-outline', text: 'Cài đặt thông báo', onPress: () => console.log("Cài đặt thông báo") },
      { icon: 'help-circle-outline', text: 'Trợ giúp & Hỗ trợ', onPress: () => console.log("Trợ giúp") },
    ];

    // Employee menu items (có đổi mật khẩu)
    const employeeItems = [
      { icon: 'person-outline', text: 'Thông tin tài khoản', onPress: () => navigation.navigate('AccountInfo') },
      { icon: 'key-outline', text: 'Đổi mật khẩu', onPress: () => console.log("Đổi mật khẩu") },
      { icon: 'list-outline', text: 'Quản lý đơn hàng', onPress: () => console.log("Quản lý đơn hàng") },
      { icon: 'notifications-outline', text: 'Cài đặt thông báo', onPress: () => console.log("Cài đặt thông báo") },
    ];

    const items = userType === 'employee' ? employeeItems : customerItems;

    return items.map((item, index) => (
      <View key={index} style={styles.menuItemWrapper}>
        <Pressable 
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: pressed ? Colors.neutral[50] : 'transparent' }
          ]} 
          onPress={item.onPress}
        >
          <View style={styles.menuContent}>
            <Ionicons name={item.icon} size={20} color={Colors.text.primary} />
            <Text style={styles.menuText}>{item.text}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color={Colors.text.secondary} />
        </Pressable>
        {index < items.length - 1 && <View style={styles.divider} />}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <RootView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        
        <Header title="Cài đặt" />
        
        <View style={styles.body}>
          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: avatarUrl }} 
                style={styles.avatar}
                resizeMode="cover"
                onError={(error) => console.log('ProfileScreen - Avatar load error:', error.nativeEvent.error)}
              />
            </View>
            
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userTypeText}>{userType === 'customer' ? 'Khách hàng' : 'Nhân viên'}</Text>
            
            <View style={styles.menuContainer}>
              {renderMenuItems()}
              <View style={styles.spacer} />
              <Pressable style={styles.logoutItem} onPress={handleLogout}>
                <View style={styles.logoutIconContainer}>
                  <Ionicons name="log-out-outline" size={16} color={Colors.background.red} />
                </View>
                <Text style={styles.logoutText}>Đăng xuất</Text>
              </Pressable>
            </View>
          </View>


        </View>
      </RootView>
    </View>
  );
};

export default ProfileScreen;