/**
 * Navbar - Modern Floating Bottom Navigation
 * Creative design with elevated home button
 * Only shows on main navigation screens
 */

import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from "../constants/colors";
import { Typography } from "../constants/typo";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppNavigator";
import { spacing } from "../design-system/spacing";
import { borderRadius } from "../design-system/borders";
import { useAppSelector } from "../redux/hooks/useAppSelector";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

// Danh sách các trang hiển thị navbar
const NAVBAR_VISIBLE_ROUTES: (keyof AppStackParamList)[] = [
  'Home',
  'Service',
  'Product',
  'Customers', // Thêm cho nhân viên
];

const Navbar: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const userType = useAppSelector((state) => state.auth.userType);
  const insets = useSafeAreaInsets();

  // Chỉ hiển thị navbar ở các trang được phép
  const shouldShow = NAVBAR_VISIBLE_ROUTES.includes(route.name as keyof AppStackParamList);

  const requireAuth = useCallback((action: () => void) => {
    if (!isLoggedIn) {
      Alert.alert("Cần đăng nhập", "Vui lòng đăng nhập để tiếp tục.", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng nhập", onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }
    action();
  }, [isLoggedIn, navigation]);

  // Không render nếu không phải trang được phép
  if (!shouldShow) {
    return null;
  }

  // Navbar đơn giản cho nhân viên - có Trang chủ, Khách hàng và Hồ sơ
  if (userType === 'employee') {
    const isHome = route.name === 'Home';
    const isCustomers = route.name === 'Customers';
    const isProfile = route.name === 'Profile';
    
    return (
      <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
        <View style={styles.container}>
          {/* Nút Trang chủ */}
          <Pressable 
            onPress={() => navigation.navigate('Home')} 
            style={[styles.employeeButton, isHome && styles.employeeButtonActive]}
          >
            <Ionicons 
              name="home" 
              size={24} 
              color={isHome ? Colors.primary : Colors.text.secondary} 
            />
            <Text style={[styles.sideButtonText, isHome && styles.employeeButtonTextActive]}>
              Trang chủ
            </Text>
          </Pressable>

          {/* Nút Khách hàng */}
          <Pressable 
            onPress={() => requireAuth(() => navigation.navigate('Customers'))} 
            style={[styles.employeeButton, isCustomers && styles.employeeButtonActive]}
          >
            <Ionicons 
              name="people-outline" 
              size={24} 
              color={isCustomers ? Colors.primary : Colors.text.secondary} 
            />
            <Text style={[styles.sideButtonText, isCustomers && styles.employeeButtonTextActive]}>
              Khách hàng
            </Text>
          </Pressable>

          {/* Nút Hồ sơ */}
          <Pressable 
            onPress={() => requireAuth(() => navigation.navigate('Profile'))} 
            style={[styles.employeeButton, isProfile && styles.employeeButtonActive]}
          >
            <Ionicons 
              name="person-outline" 
              size={24} 
              color={isProfile ? Colors.primary : Colors.text.secondary} 
            />
            <Text style={[styles.sideButtonText, isProfile && styles.employeeButtonTextActive]}>
              Hồ sơ
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Navbar đầy đủ cho khách hàng
  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.container}>
        {/* 2 nút bên trái */}
        <View style={styles.leftSection}>
          <Pressable 
            onPress={() => requireAuth(() => navigation.navigate('Booking'))} 
            style={styles.sideButton}
          >
            <Ionicons name="calendar-outline" size={24} color={Colors.text.secondary} />
            <Text style={styles.sideButtonText}>Đặt lịch</Text>
          </Pressable>

          <Pressable 
            onPress={() => navigation.navigate('Category')} 
            style={styles.sideButton}
          >
            <Ionicons name="cube-outline" size={24} color={Colors.text.secondary} />
            <Text style={styles.sideButtonText}>Sản phẩm</Text>
          </Pressable>
        </View>

        {/* Nút Trang chủ nổi bật ở giữa */}
        <Pressable 
          onPress={() => navigation.navigate('Home')} 
          style={styles.centerButton}
        >
          <LinearGradient
            colors={[...Colors.gradients.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.centerGradient}
          >
            <Ionicons name="home" size={28} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>

        {/* 2 nút bên phải */}
        <View style={styles.rightSection}>
          <Pressable 
            onPress={() => navigation.navigate('ServiceCategory')} 
            style={styles.sideButton}
          >
            <Ionicons name="construct-outline" size={24} color={Colors.text.secondary} />
            <Text style={styles.sideButtonText}>Dịch vụ</Text>
          </Pressable>

          <Pressable 
            onPress={() => requireAuth(() => navigation.navigate('Profile'))} 
            style={styles.sideButton}
          >
            <Ionicons name="person-outline" size={24} color={Colors.text.secondary} />
            <Text style={styles.sideButtonText}>Hồ sơ</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.shadow.default,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sideButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    minWidth: 60,
  },
  sideButtonText: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '500',
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginHorizontal: spacing.sm,
    marginBottom: -20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  centerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Employee navbar styles
  employeeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    minWidth: 80,
  },
  employeeButtonActive: {
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
  },
  employeeButtonTextActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  employeeButtonLeft: {
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  employeeButtonRight: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
});

export default React.memo(Navbar);
