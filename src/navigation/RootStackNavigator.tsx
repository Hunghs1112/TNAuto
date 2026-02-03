import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabsStacks from "./MainTabsStacks";
import ProductDetailScreen from "../screens/ProductDetail/ProductDetailScreen";
import ServiceDetailScreen from "../screens/Service/ServiceDetailScreen";
import OfferScreen from "../screens/Offer/OfferScreen";
import OfferDetailScreen from "../screens/Offer/OfferDetailScreen";
import LoginScreen from "../screens/Login/LoginScreen";
import RegisterScreen from "../screens/Register/RegisterScreen";
import OrderDetailScreen from "../screens/OrderDetail/OrderDetailScreen";
import EmployeeOrderDetailScreen from "../screens/OrderDetail/EmployeeOrderDetailScreen";
import NotificationScreen from "../screens/Notification/NotificationScreen";
import WarrantyScreen from "../screens/Warranty/WarrantyScreen";
import MyServiceScreen from "../screens/MyService/MyServiceScreen";
import VehicleListScreen from "../screens/Vehicle/VehicleListScreen";
import VehicleDetailScreen from "../screens/Vehicle/VehicleDetailScreen";
import EmployeePasswordScreen from "../screens/Login/EmployeePasswordScreen";

export type RootStackParamList = {
  MainTabs: undefined;
  Offer: undefined;
  OfferDetail: { offerId: number };
  ProductDetail: { productId: number };
  ServiceDetail: { serviceId: number };
  Login: undefined;
  Register: undefined;
  OrderDetail: { id: string };
  EmployeeOrderDetail: { id: string };
  Notification: undefined;
  MyService: undefined;
  Warranty: undefined;
  VehicleList: { userId: string; userPhone: string };
  VehicleDetail: { vehicleId: string; licensePlate: string };
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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MainTabs">
      {/* Tab Navigator with Navbar */}
      <Stack.Screen name="MainTabs" component={MainTabsStacks} />

      {/* Fullscreen screens (no Navbar) */}
      <Stack.Screen name="Offer" component={OfferScreen} />
      <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="EmployeePassword" component={EmployeePasswordScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="EmployeeOrderDetail" component={EmployeeOrderDetailScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="MyService" component={MyServiceScreen} />
      <Stack.Screen name="Warranty" component={WarrantyScreen} />
      <Stack.Screen name="VehicleList" component={VehicleListScreen} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
    </Stack.Navigator>
  );
}
