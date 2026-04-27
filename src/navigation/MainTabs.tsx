import React from "react";
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Navbar from "../components/Navbar";
import { useNavbarPolicy } from "../components/useNavbarPolicy";
import HomeScreen from "../screens/Home/HomeScreen";
import CategoryScreen from "../screens/Category/CategoryScreen";
import BookingScreen from "../screens/Booking/BookingScreen";
import ServiceCategoryScreen from "../screens/ServiceCategory/ServiceCategoryScreen";
import AccountInfoScreen from "../screens/AccountInfo/AccountInfoScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

export type TabParamList = {
  HomeTab: undefined;
  Category: undefined;
  Booking: undefined;
  ServiceCategory: undefined;
  AccountInfo: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function NavbarContainer(props: BottomTabBarProps) {
  const policy = useNavbarPolicy(props);

  return <Navbar tabs={policy.tabs} activeTab={policy.activeTab} onTabPress={policy.onTabPress} />;
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <NavbarContainer {...props} />}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="Category" component={CategoryScreen} />
      <Tab.Screen name="Booking" component={BookingScreen} />
      <Tab.Screen name="ServiceCategory" component={ServiceCategoryScreen} />
      <Tab.Screen name="AccountInfo" component={AccountInfoScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
