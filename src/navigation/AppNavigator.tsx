// src/navigation/AppNavigator.tsx (Updated: Added Warranty route)
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { RootState } from "../redux/types";
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
import WarrantyScreen from "../screens/Warranty/WarrantyScreen"; // Added

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  Service: undefined;
  Offer: undefined;
  Product: undefined;
  MyService: undefined;
  Booking: undefined;
  OrderDetail: { id: string };
  EmployeeOrderDetail: { id: string };
  NotificationScreen: undefined;
  Warranty: undefined; // Added
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  const userType = useSelector((state: RootState) => state.auth.userType);

  console.log('AppNavigator debug - userType:', userType); // Debug

  const initialRouteName = userType === 'employee' ? 'Home' : 'Home';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Service" component={ServiceScreen} />
      <Stack.Screen name="Offer" component={OfferScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="MyService" component={MyServiceScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="EmployeeOrderDetail" component={EmployeeOrderDetailScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen name="Warranty" component={WarrantyScreen} /> 
    </Stack.Navigator>
  );
}