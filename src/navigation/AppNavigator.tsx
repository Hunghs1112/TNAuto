// src/navigation/AppNavigator.tsx (Updated: Added Warranty route)
import React from "react";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { RootState } from "../redux/types";
import { Platform } from "react-native";
import HomeScreen from "../screens/Home/HomeScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import ServiceScreen from "../screens/Service/ServiceScreen";
import OfferScreen from "../screens/Offer/OfferScreen";
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
import { Product } from "../services/productApi";
import { usePrefetchData } from "../redux/hooks/usePrefetchData";

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  AccountInfo: undefined;
  Service: undefined;
  Offer: undefined;
  Category: undefined;
  Product: { categoryId?: number; categoryName?: string } | undefined;
  ProductDetail: { product: Product };
  MyService: undefined;
  Booking: undefined;
  OrderDetail: { id: string };
  EmployeeOrderDetail: { id: string };
  Notification: undefined;
  Warranty: undefined;
  VehicleList: { userId: string; userPhone: string };
  VehicleDetail: { vehicleId: string; licensePlate: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  const userType = useSelector((state: RootState) => state.auth.userType);

  // Prefetch critical data (services, categories, offers) when app loads
  usePrefetchData();

  console.log('AppNavigator debug - userType:', userType); // Debug

  const initialRouteName = userType === 'employee' ? 'Home' : 'Home';

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
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
      <Stack.Screen name="Service" component={ServiceScreen} />
      <Stack.Screen name="Offer" component={OfferScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
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