import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AppStackParamList } from "./AppNavigator";
import Navbar from "../components/Navbar";
import HomeScreen from "../screens/Home/HomeScreen";
import CategoryScreen from "../screens/Category/CategoryScreen";
import BookingScreen from "../screens/Booking/BookingScreen";
import ServiceCategoryScreen from "../screens/ServiceCategory/ServiceCategoryScreen";
import AccountInfoScreen from "../screens/AccountInfo/AccountInfoScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

export type TabParamList = {
  Home: undefined;
  Category: undefined;
  Booking: undefined;
  ServiceCategory: undefined;
  AccountInfo: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={() => <Navbar />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Category" component={CategoryScreen} />
      <Tab.Screen name="Booking" component={BookingScreen} />
      <Tab.Screen name="ServiceCategory" component={ServiceCategoryScreen} />
      <Tab.Screen name="AccountInfo" component={AccountInfoScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

