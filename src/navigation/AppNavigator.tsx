// src/navigation/AppNavigator.tsx (App stack: Home tabs + detail screens)
import React from "react";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import MainTabs from "./MainTabs";

import ProfileScreen from "../screens/Profile/ProfileScreen";
import ServiceScreen from "../screens/Service/ServiceScreen";
import ServiceDetailScreen from "../screens/Service/ServiceDetailScreen";
import CustomersScreen from "../screens/Customers/CustomersScreen";
import CustomerDetailScreen from "../screens/Customers/CustomerDetailScreen";
import OfferScreen from "../screens/Offer/OfferScreen";
import OfferDetailScreen from "../screens/Offer/OfferDetailScreen";
import ProductScreen from "../screens/Product/ProductScreen";
import MyServiceScreen from "../screens/MyService/MyServiceScreen";
import BookingScreen from "../screens/Booking/BookingScreen";
import OrderDetailScreen from "../screens/OrderDetail/OrderDetailScreen";
import EmployeeOrderDetailScreen from "../screens/OrderDetail/EmployeeOrderDetailScreen";
import NotificationScreen from "../screens/Notification/NotificationScreen";
import WarrantyScreen from "../screens/Warranty/WarrantyScreen";
import CategoryScreen from "../screens/Category/CategoryScreen";
import ProductDetailScreen from "../screens/ProductDetail/ProductDetailScreen";
import VehicleListScreen from "../screens/Vehicle/VehicleListScreen";
import VehicleDetailScreen from "../screens/Vehicle/VehicleDetailScreen";
import AccountInfoScreen from "../screens/AccountInfo/AccountInfoScreen";
import LoginScreen from "../screens/Login/LoginScreen";
import RegisterScreen from "../screens/Register/RegisterScreen";
import EmployeePasswordScreen from "../screens/Login/EmployeePasswordScreen";
import DealerLoginScreen from "../screens/Login/DealerLoginScreen";
import DealerRegisterScreen from "../screens/Register/DealerRegisterScreen";
import { usePrefetchData } from "../redux/hooks/usePrefetchData";

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  AccountInfo: undefined;
  Service: { categoryId?: number; categoryName?: string } | undefined;
  ServiceDetail: { serviceId: number };
  ServiceCategory: undefined;
  Customers: undefined;
  CustomerDetail: { customerId: number; customerName: string; customerPhone: string };
  Offer: undefined;
  OfferDetail: { offerId: number };
  Category: undefined;
  Product: { categoryId?: number; categoryName?: string } | undefined;
  ProductDetail: { productId: number };
  MyService: undefined;
  Booking: { serviceId?: number } | undefined;
  OrderDetail: { id: string };
  EmployeeOrderDetail: { id: string };
  Notification: undefined;
  Warranty: undefined;
  VehicleList: { userId: string; userPhone: string };
  VehicleDetail: { vehicleId: string; licensePlate: string };
  Login: undefined;
  Register: undefined;
  EmployeePassword: {
    phone: string;
    employeeData: {
      id: number;
      name: string;
      phone: string;
      avatar_url?: string;
      position?: string;
    };
  };
  DealerLogin: {
    phone: string;
  };
  DealerRegister: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {

  // Prefetch critical data (services, categories, offers) when app loads
  usePrefetchData();

  // Luồng hiện tại: luôn vào Home (MainTabs), không chặn bằng auth
  const initialRouteName: keyof AppStackParamList = "Home";

  // Smooth screen transition configuration - Slide từ phải qua trái
  const screenOptions: NativeStackNavigationOptions = {
    headerShown: false,
    animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
    animationDuration: 250,
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
  };

  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName={initialRouteName}>
      {/* Tabs with Navbar (bottom tab visible) */}
      <Stack.Screen name="Home" component={MainTabs} />

      {/* Fullscreen/detail screens (no Navbar) */}
      <Stack.Screen name="Service" component={ServiceScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="Customers" component={CustomersScreen} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
      <Stack.Screen name="Offer" component={OfferScreen} />
      <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="DealerLogin" component={DealerLoginScreen} />
      <Stack.Screen name="DealerRegister" component={DealerRegisterScreen} />
      <Stack.Screen name="EmployeePassword" component={EmployeePasswordScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
      <Stack.Screen name="MyService" component={MyServiceScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="EmployeeOrderDetail" component={EmployeeOrderDetailScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="Warranty" component={WarrantyScreen} />
      <Stack.Screen name="VehicleList" component={VehicleListScreen} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
    </Stack.Navigator>
  );
}
