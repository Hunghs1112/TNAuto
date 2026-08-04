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
import GarageManagementScreen from "../screens/GarageManagement/GarageManagementScreen";
import GarageCustomersScreen from "../screens/GarageManagement/GarageCustomersScreen";
import GarageOrdersScreen from "../screens/GarageManagement/GarageOrdersScreen";
import SuperAdminGaragesScreen from "../screens/GarageManagement/SuperAdminGaragesScreen";
import DealersScreen from "../screens/GarageManagement/DealersScreen";
import NotificationScreen from "../screens/Notification/NotificationScreen";
import EmployeeOrdersScreen from "../screens/EmployeeOrders/EmployeeOrdersScreen";

export type TabParamList = {
  HomeTab: undefined;
  Category: undefined;
  Booking: undefined;
  ServiceCategory: undefined;
  AccountInfo: undefined;
  Profile: undefined;
  GarageManagement: undefined;
  GarageCustomers: undefined;
  GarageOrders: undefined;
  /** Chỉ dành cho garage_admin (super admin) */
  SuperAdminGarages: undefined;
  /** Super admin — danh sách đại lý (cổng vào module đại lý + catalog) */
  Dealers: undefined;
  /** Tab thông báo — dùng cho employee */
  Notification: undefined;
  /** Tab đơn việc — dùng cho employee */
  EmployeeOrders: undefined;
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
      <Tab.Screen name="GarageManagement" component={GarageManagementScreen} />
      <Tab.Screen name="GarageCustomers" component={GarageCustomersScreen} />
      <Tab.Screen name="GarageOrders" component={GarageOrdersScreen} />
      {/* Super admin only — màn hình bị guard bên trong nếu không đủ quyền */}
      <Tab.Screen name="SuperAdminGarages" component={SuperAdminGaragesScreen} />
      <Tab.Screen name="Dealers" component={DealersScreen} />
      {/* Tab thông báo — dùng cho employee */}
      <Tab.Screen name="Notification" component={NotificationScreen} />
      {/* Tab đơn việc — dùng cho employee */}
      <Tab.Screen name="EmployeeOrders" component={EmployeeOrdersScreen} />
    </Tab.Navigator>
  );
}
