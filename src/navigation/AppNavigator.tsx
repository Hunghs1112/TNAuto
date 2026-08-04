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
import VehicleEditScreen from "../screens/Vehicle/VehicleEditScreen";
import AccountInfoScreen from "../screens/AccountInfo/AccountInfoScreen";
import LoginScreen from "../screens/Login/LoginScreen";
import RegisterScreen from "../screens/Register/RegisterScreen";
import EmployeePasswordScreen from "../screens/Login/EmployeePasswordScreen";
import ChangePasswordScreen from "../screens/Login/ChangePasswordScreen";
import DealerLoginScreen from "../screens/Login/DealerLoginScreen";
import RoleSelectScreen from "../screens/Login/RoleSelectScreen";
import ManagerPasswordScreen from "../screens/Login/ManagerPasswordScreen";
import DealerRegisterScreen from "../screens/Register/DealerRegisterScreen";
import EmployeeOrdersScreen from "../screens/EmployeeOrders/EmployeeOrdersScreen";
import { usePrefetchData } from "../redux/hooks/usePrefetchData";
import SelectGarageScreen from "../screens/Garage/SelectGarageScreen";
import GarageManagementScreen from "../screens/GarageManagement/GarageManagementScreen";
import GarageCustomersScreen from "../screens/GarageManagement/GarageCustomersScreen";
import GarageOrdersScreen from "../screens/GarageManagement/GarageOrdersScreen";
import GarageEmployeesScreen from "../screens/GarageManagement/GarageEmployeesScreen";
import EmployeeDetailScreen from "../screens/GarageManagement/EmployeeDetailScreen";
import AdminCatalogScreen from "../screens/GarageManagement/AdminCatalogScreen";
import AdminOperationsScreen from "../screens/GarageManagement/AdminOperationsScreen";
import AdminSettingsScreen from "../screens/GarageManagement/AdminSettingsScreen";
import SuperAdminGaragesScreen from "../screens/GarageManagement/SuperAdminGaragesScreen";
import GarageManagersScreen from "../screens/GarageManagement/GarageManagersScreen";
import DealersScreen from "../screens/GarageManagement/DealersScreen";
import DealerCatalogScreen from "../screens/GarageManagement/DealerCatalogScreen";
import { CheckPhoneRole } from "../services/authApi";
import { useAppSelector } from "../redux/hooks/useAppSelector";
import { AuthUserType } from "../redux/slices/authSlice";
import { MANAGER_ROLES, SUPER_ADMIN_ROLES } from "./rolePolicy";

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
  VehicleEdit: { vehicleId: string; licensePlate: string };
  Login: undefined;
  Register: undefined;
  EmployeePassword: {
    phone: string;
    employeeData?: {
      id: number;
      name: string;
      phone: string;
      avatar_url?: string;
      position?: string;
    };
  };
  ChangePassword: { phone: string };
  DealerLogin: {
    phone: string;
    garageCode?: string;
  };
  RoleSelect: {
    phone: string;
    roles: CheckPhoneRole[];
    accounts?: Record<string, any>;
  };
  ManagerPassword: {
    phone: string;
    expectedRole: "garage_manager" | "garage_admin";
  };
  DealerRegister: undefined;
  SelectGarage: undefined;
  GarageManagement: undefined;
  GarageCustomers: undefined;
  GarageOrders: undefined;
  /** Danh sách đơn hàng được giao cho nhân viên */
  EmployeeOrders: undefined;
  /** Danh sách nhân viên — chỉ dành cho manager */
  GarageEmployees: undefined;
  /** Chi tiết nhân viên */
  EmployeeDetail: { employeeId: string; employeeName: string };
  /** Quản lý danh mục (services, products, offers...) */
  AdminCatalog: undefined;
  /** Quản lý vận hành (warranties, vehicles, inspection) */
  AdminOperations: undefined;
  /** Cài đặt hệ thống (reminder configs, UI visibility) */
  AdminSettings: undefined;
  /** Chỉ dành cho garage_admin (super admin) */
  SuperAdminGarages: undefined;
  /** Quản lý tài khoản gara manager (super admin only) */
  GarageManagers: undefined;
  /** Danh sách đại lý (super admin only) */
  Dealers: undefined;
  /** Catalog đại lý: categories + products (super admin only) */
  DealerCatalog: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

function withRoleGuard<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  allowedRoles: AuthUserType[],
) {
  return function GuardedScreen(props: T & { navigation: any }) {
    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
    const userType = useAppSelector((state) => state.auth.userType);
    const canAccess = Boolean(isLoggedIn && userType && allowedRoles.includes(userType));

    React.useEffect(() => {
      if (!isLoggedIn) {
        props.navigation.replace("Login");
        return;
      }

      if (!canAccess) {
        props.navigation.navigate("Home");
      }
    }, [canAccess, isLoggedIn, props.navigation]);

    if (!canAccess) return null;

    return <WrappedComponent {...props} />;
  };
}

const managerAllowedRoles: AuthUserType[] = ["dealer", ...MANAGER_ROLES];
const superAdminAllowedRoles: AuthUserType[] = [...SUPER_ADMIN_ROLES];
const employeeAllowedRoles: AuthUserType[] = ["employee"];
const customerAllowedRoles: AuthUserType[] = ["customer"];

const GuardedCustomersScreen = withRoleGuard(CustomersScreen, managerAllowedRoles);
const GuardedCustomerDetailScreen = withRoleGuard(CustomerDetailScreen, managerAllowedRoles);
const GuardedEmployeeOrderDetailScreen = withRoleGuard(EmployeeOrderDetailScreen, employeeAllowedRoles);
const GuardedVehicleListScreen = withRoleGuard(VehicleListScreen, customerAllowedRoles);
const GuardedVehicleDetailScreen = withRoleGuard(VehicleDetailScreen, customerAllowedRoles);
const GuardedVehicleEditScreen = withRoleGuard(VehicleEditScreen, customerAllowedRoles);
const GuardedSuperAdminGaragesScreen = withRoleGuard(SuperAdminGaragesScreen, superAdminAllowedRoles);
const GuardedGarageManagersScreen = withRoleGuard(GarageManagersScreen, superAdminAllowedRoles);
const GuardedDealersScreen = withRoleGuard(DealersScreen, superAdminAllowedRoles);
const GuardedDealerCatalogScreen = withRoleGuard(DealerCatalogScreen, superAdminAllowedRoles);

export default function AppNavigator() {
  // Prefetch critical data (services, categories, offers) when app loads
  usePrefetchData();

  // Smooth screen transition configuration - Slide từ phải qua trái
  const screenOptions: NativeStackNavigationOptions = {
    headerShown: false,
    animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
    animationDuration: 250,
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
  };

  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="Home">
      <Stack.Screen name="SelectGarage" component={SelectGarageScreen} />
      <Stack.Screen name="EmployeeOrders" component={EmployeeOrdersScreen} />
      <Stack.Screen name="GarageManagement" component={GarageManagementScreen} />
      <Stack.Screen name="GarageEmployees" component={GarageEmployeesScreen} />
      <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} />
      <Stack.Screen name="AdminCatalog" component={AdminCatalogScreen} />
      <Stack.Screen name="AdminOperations" component={AdminOperationsScreen} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
      {/* Super admin only — redirect về Home nếu không đủ quyền */}
      <Stack.Screen name="SuperAdminGarages" component={GuardedSuperAdminGaragesScreen} />
      {/* Module Tài khoản & Đại lý (super admin only) */}
      <Stack.Screen name="GarageManagers" component={GuardedGarageManagersScreen} />
      <Stack.Screen name="Dealers" component={GuardedDealersScreen} />
      <Stack.Screen name="DealerCatalog" component={GuardedDealerCatalogScreen} />
      {/* Tabs with Navbar (bottom tab visible) */}
      <Stack.Screen name="Home" component={MainTabs} />

      {/* Fullscreen/detail screens (no Navbar) */}
      <Stack.Screen name="Service" component={ServiceScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="Customers" component={GuardedCustomersScreen} />
      <Stack.Screen name="CustomerDetail" component={GuardedCustomerDetailScreen} />
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
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="ManagerPassword" component={ManagerPasswordScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
      <Stack.Screen name="MyService" component={MyServiceScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="EmployeeOrderDetail" component={GuardedEmployeeOrderDetailScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="Warranty" component={WarrantyScreen} />
      <Stack.Screen name="VehicleList" component={GuardedVehicleListScreen} />
      <Stack.Screen name="VehicleDetail" component={GuardedVehicleDetailScreen} />
      <Stack.Screen name="VehicleEdit" component={GuardedVehicleEditScreen} />
    </Stack.Navigator>
  );
}
