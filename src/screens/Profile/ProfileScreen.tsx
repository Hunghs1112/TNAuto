// screens/ProfileScreen.tsx
import React from "react";
import { View, Text, Pressable, Image, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import Header from "../../components/Header/Header";
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

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { refreshing, onRefresh } = useAutoRefresh();
  const userName = useAppSelector((state: RootState) => state.auth.userName || 'User');
  const userType = useAppSelector((state: RootState) => state.auth.userType || 'customer');
  const avatarUrl = useAppSelector((state: RootState) => state.auth.avatarUrl || 'https://i.pravatar.cc/150?img=12'); // Use auth avatarUrl directly

  console.log('ProfileScreen debug - userType:', userType, 'avatarUrl from auth:', avatarUrl); // Debug avatar

  const handleLogout = () => {
    console.log('ProfileScreen debug - Logging out user:', userName); // Debug trước logout
    dispatch(logout());
    console.log('ProfileScreen debug - Logout dispatched, state reset to initial'); // Debug sau dispatch
  };

  const renderMenuItems = () => {
    const commonItems = [
      { icon: 'calendar-outline', text: 'Đổi mật khẩu', onPress: () => console.log("Đổi mật khẩu") },
      { icon: 'notifications-outline', text: 'Cài đặt thông báo', onPress: () => console.log("Cài đặt thông báo") },
      { icon: 'person-outline', text: 'Thông tin tài khoản', onPress: () => console.log("Thông tin tài khoản") },
    ];

    const employeeItems = [
      { icon: 'list-outline', text: 'Quản lý đơn hàng', onPress: () => console.log("Quản lý đơn hàng") },
    ];

    return [...commonItems, ...(userType === 'employee' ? employeeItems : [])].map((item, index) => (
      <View key={index} style={styles.menuItemWrapper}>
        <Pressable style={styles.menuItem} onPress={item.onPress}>
          <View style={styles.menuContent}>
            <Ionicons name={item.icon} size={20} color={Colors.text.primary} />
            <Text style={styles.menuText}>{item.text}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color={Colors.text.secondary} />
        </Pressable>
        <View style={styles.divider} />
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
      
      <Header title="Cài đặt" />
      
      <View style={styles.body}>
        <View style={styles.form}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: avatarUrl }} 
              style={styles.avatar}
            />
          </View>
          
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userTypeText}>{userType === 'customer' ? 'Khách hàng' : 'Nhân viên'}</Text>
          
          <View style={styles.menuContainer}>
            {renderMenuItems()}
            <View style={styles.spacer} />
            <Pressable style={styles.logoutItem} onPress={handleLogout}>
              <View style={styles.logoutIconContainer}>
                <Ionicons name="log-out-outline" size={16} color={Colors.error} />
              </View>
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </Pressable>
          </View>
        </View>


      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;