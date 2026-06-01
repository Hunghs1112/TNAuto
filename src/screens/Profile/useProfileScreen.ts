// src/screens/Profile/useProfileScreen.ts
import { useEffect, useMemo } from 'react';
import { Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { useAppDispatch } from '../../redux/hooks/useAppDispatch';
import { logout } from '../../redux/slices/authSlice';
import { AuthUserType } from '../../redux/slices/authSlice';
import { clearCurrentEmployee } from '../../redux/slices/employeeSlice';
import { clearGarageContext } from '../../redux/slices/garageContextSlice';
import { clearWarranties } from '../../redux/slices/warrantySlice';
import { warrantyApi } from '../../services/warrantyApi';
import { vehicleApi } from '../../services/vehicleApi';
import { clearAuthStorage } from '../../utils/authStorage';
import { unregisterFCMTokenOnLogout } from '../../utils/fcmTokenManager';
import { useDeleteAccountMutation } from '../../services/customerApi';
import { AppStackParamList } from '../../navigation/AppNavigator';

import {
  ProfileScreenData,
  RoleMenuConfig,
  SettingItem,
  SettingsSection,
} from './types';

// ─── App version ──────────────────────────────────────────────────────────────

const appJson = require('../../../app.json');
const APP_VERSION: string =
  appJson?.expo?.version || appJson?.version || '1.0.0';

// ─── Role label mapping ───────────────────────────────────────────────────────

export const ROLE_LABELS: Record<AuthUserType, string> = {
  customer: 'Khách hàng',
  employee: 'Nhân viên',
  dealer: 'Đại lý',
  garage_manager: 'Quản lý Gara',
  garage_admin: 'Super Admin',
};

export const getRoleLabel = (userType: AuthUserType | null | undefined): string => {
  if (!userType || !(userType in ROLE_LABELS)) return 'Người dùng';
  return ROLE_LABELS[userType];
};

// ─── Change password routing ──────────────────────────────────────────────────

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export const getChangePasswordHandler = (
  userType: AuthUserType,
  userPhone: string,
  navigation: NavigationProp,
): (() => void) => {
  switch (userType) {
    case 'employee':
      return () => navigation.navigate('ChangePassword', { phone: userPhone });
    case 'dealer':
      return () => navigation.navigate('DealerLogin', { phone: userPhone });
    case 'garage_manager':
      return () =>
        navigation.navigate('ManagerPassword', {
          phone: userPhone,
          expectedRole: 'garage_manager',
        });
    case 'garage_admin':
      return () =>
        navigation.navigate('ManagerPassword', {
          phone: userPhone,
          expectedRole: 'garage_admin',
        });
    case 'customer':
    default:
      return () =>
        Alert.alert('Thông báo', 'Tính năng đang phát triển.');
  }
};

// ─── Role menu config builder ─────────────────────────────────────────────────

interface MenuHandlers {
  navigateToAccountInfo: () => void;
  navigateToVehicleList: () => void;
  navigateToSelectGarage: () => void;
  navigateToGarageOrders: () => void;
  navigateToEmployeeOrders: () => void;
  navigateToGarageCustomers: () => void;
  navigateToGarageEmployees: () => void;
  navigateToAdminCatalog: () => void;
  navigateToAdminOperations: () => void;
  navigateToAdminSettings: () => void;
  navigateToSuperAdminGarages: () => void;
  navigateToNotification: () => void;
  handleChangePassword: () => void;
}

export const buildRoleMenuConfig = (
  userType: AuthUserType | null | undefined,
  handlers: MenuHandlers,
): RoleMenuConfig => {
  const accountSection: SettingsSection = {
    id: 'account',
    label: 'Tài khoản',
    items: [
      {
        id: 'accountInfo',
        title: 'Thông tin tài khoản',
        subtitle: 'Chỉnh sửa hồ sơ cá nhân',
        icon: 'person-outline',
        onPress: handlers.navigateToAccountInfo,
      },
      {
        id: 'changePassword',
        title: 'Đổi mật khẩu',
        subtitle: 'Cập nhật mật khẩu của bạn',
        icon: 'key-outline',
        onPress: handlers.handleChangePassword,
      },
      {
        id: 'notification',
        title: 'Cài đặt thông báo',
        subtitle: 'Quản lý thông báo ứng dụng',
        icon: 'notifications-outline',
        onPress: handlers.navigateToNotification,
      },
    ],
  };

  switch (userType) {
    case 'customer':
      return [
        {
          // Khách hàng: chỉ hiển thị Thông tin tài khoản
          // TODO: bật lại 'changePassword' khi tính năng đổi mật khẩu hoàn thiện
          // TODO: bật lại 'notification' khi tính năng cài đặt thông báo hoàn thiện
          id: 'account',
          label: 'Tài khoản',
          items: [
            {
              id: 'accountInfo',
              title: 'Thông tin tài khoản',
              subtitle: 'Chỉnh sửa hồ sơ cá nhân',
              icon: 'person-outline',
              onPress: handlers.navigateToAccountInfo,
            },
          ],
        },
        {
          id: 'vehicle',
          label: 'Xe của tôi',
          items: [
            {
              id: 'vehicleList',
              title: 'Thông tin xe',
              subtitle: 'Cập nhật xe và giấy tờ xe',
              icon: 'car-outline',
              onPress: handlers.navigateToVehicleList,
            },
            {
              id: 'selectGarage',
              title: 'Gara hiện tại',
              subtitle: 'Chọn gara đang sử dụng',
              icon: 'business-outline',
              onPress: handlers.navigateToSelectGarage,
            },
          ],
        },
      ];

    case 'employee':
      return [
        {
          id: 'account',
          label: 'Tài khoản',
          items: [
            {
              id: 'accountInfo',
              title: 'Thông tin tài khoản',
              subtitle: 'Chỉnh sửa hồ sơ cá nhân',
              icon: 'person-outline',
              onPress: handlers.navigateToAccountInfo,
            },
            {
              id: 'changePassword',
              title: 'Đổi mật khẩu',
              subtitle: 'Cập nhật mật khẩu của bạn',
              icon: 'key-outline',
              onPress: handlers.handleChangePassword,
            },
          ],
        },
      ];

    case 'dealer':
      return [
        accountSection,
        {
          id: 'business',
          label: 'Kinh doanh',
          items: [
            {
              id: 'garageCustomers',
              title: 'Danh sách khách hàng',
              subtitle: 'Quản lý khách hàng của bạn',
              icon: 'people-outline',
              onPress: handlers.navigateToGarageCustomers,
            },
            {
              id: 'selectGarage',
              title: 'Gara hiện tại',
              subtitle: 'Chọn gara đang hoạt động',
              icon: 'business-outline',
              onPress: handlers.navigateToSelectGarage,
            },
          ],
        },
      ];

    case 'garage_manager':
      return [
        accountSection,
        {
          id: 'management',
          label: 'Quản lý Gara',
          items: [
            {
              id: 'garageEmployees',
              title: 'Quản lý nhân viên',
              subtitle: 'Danh sách và phân công nhân viên',
              icon: 'people-circle-outline',
              onPress: handlers.navigateToGarageEmployees,
            },
            {
              id: 'garageOrders',
              title: 'Quản lý đơn hàng',
              subtitle: 'Theo dõi và xử lý đơn hàng',
              icon: 'list-outline',
              onPress: handlers.navigateToGarageOrders,
            },
            {
              id: 'garageCustomers',
              title: 'Quản lý khách hàng',
              subtitle: 'Danh sách khách hàng gara',
              icon: 'people-outline',
              onPress: handlers.navigateToGarageCustomers,
            },
            {
              id: 'adminSettings',
              title: 'Cài đặt hệ thống',
              subtitle: 'Cấu hình và tùy chỉnh gara',
              icon: 'settings-outline',
              onPress: handlers.navigateToAdminSettings,
            },
          ],
        },
        {
          id: 'garage',
          label: 'Gara',
          items: [
            {
              id: 'selectGarage',
              title: 'Gara hiện tại',
              subtitle: 'Chọn gara đang quản lý',
              icon: 'business-outline',
              onPress: handlers.navigateToSelectGarage,
            },
          ],
        },
      ];

    case 'garage_admin':
      return [
        accountSection,
        {
          id: 'system',
          label: 'Quản lý Hệ thống',
          items: [
            {
              id: 'superAdminGarages',
              title: 'Quản lý tất cả Gara',
              subtitle: 'Xem và quản lý toàn bộ hệ thống gara',
              icon: 'storefront-outline',
              onPress: handlers.navigateToSuperAdminGarages,
            },
            {
              id: 'garageEmployees',
              title: 'Quản lý nhân viên',
              subtitle: 'Danh sách và phân công nhân viên',
              icon: 'people-circle-outline',
              onPress: handlers.navigateToGarageEmployees,
            },
            {
              id: 'garageOrders',
              title: 'Quản lý đơn hàng',
              subtitle: 'Theo dõi và xử lý đơn hàng',
              icon: 'list-outline',
              onPress: handlers.navigateToGarageOrders,
            },
            {
              id: 'garageCustomers',
              title: 'Quản lý khách hàng',
              subtitle: 'Danh sách khách hàng toàn hệ thống',
              icon: 'people-outline',
              onPress: handlers.navigateToGarageCustomers,
            },
          ],
        },
        {
          id: 'config',
          label: 'Cấu hình',
          items: [
            {
              id: 'adminCatalog',
              title: 'Danh mục dịch vụ & sản phẩm',
              subtitle: 'Quản lý dịch vụ, sản phẩm, ưu đãi',
              icon: 'grid-outline',
              onPress: handlers.navigateToAdminCatalog,
            },
            {
              id: 'adminOperations',
              title: 'Vận hành',
              subtitle: 'Bảo hành, xe, kiểm tra định kỳ',
              icon: 'construct-outline',
              onPress: handlers.navigateToAdminOperations,
            },
            {
              id: 'adminSettings',
              title: 'Cài đặt hệ thống',
              subtitle: 'Cấu hình toàn bộ hệ thống',
              icon: 'settings-outline',
              onPress: handlers.navigateToAdminSettings,
            },
          ],
        },
      ];

    default:
      // Fallback: chỉ section Tài khoản với AccountInfo
      return [
        {
          id: 'account',
          label: 'Tài khoản',
          items: [
            {
              id: 'accountInfo',
              title: 'Thông tin tài khoản',
              icon: 'person-outline',
              onPress: handlers.navigateToAccountInfo,
            },
          ],
        },
      ];
  }
};

// ─── Main hook ────────────────────────────────────────────────────────────────

export const useProfileScreen = (): ProfileScreenData => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();

  // Redux state
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const userName = useAppSelector((state) => state.auth.userName || 'Người dùng');
  const userType = useAppSelector(
    (state) => (state.auth.userType || 'customer') as AuthUserType,
  );
  const userId = useAppSelector((state) => state.auth.userId || '');
  const avatarUrl = useAppSelector((state) => state.auth.avatarUrl || '');
  const userPhone = useAppSelector((state) => state.auth.userPhone || '');

  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace('Login');
    }
  }, [isLoggedIn, navigation]);

  // ── Logout ──────────────────────────────────────────────────────────────────

  const performLogout = async () => {
    try {
      await unregisterFCMTokenOnLogout();
    } catch (error) {
      console.error('useProfileScreen: Failed to unregister FCM token:', error);
    }
    await clearAuthStorage();
    dispatch(clearWarranties());
    dispatch(warrantyApi.util.resetApiState());
    dispatch(vehicleApi.util.resetApiState());
    dispatch(clearCurrentEmployee());
    dispatch(clearGarageContext());
    dispatch(logout());
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: performLogout },
      ],
    );
  };

  // ── Delete account ───────────────────────────────────────────────────────────

  const confirmDeleteAccount = async () => {
    try {
      const result = await deleteAccount({ phone: userPhone, confirm: true }).unwrap();
      if (result.success) {
        Alert.alert(
          'Tài khoản đã bị xóa',
          'Tài khoản của bạn đã được xóa thành công.',
          [{ text: 'OK', onPress: performLogout }],
        );
      }
    } catch (error: any) {
      console.error('useProfileScreen: Error deleting account:', error);
      const errorMessage = error.data?.error || 'Không thể xóa tài khoản.';
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Xác nhận xóa tài khoản',
      'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu của bạn.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tài khoản',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ],
    );
  };

  // ── Navigation handlers ──────────────────────────────────────────────────────

  const navigateToAccountInfo = () => navigation.navigate('AccountInfo');
  const navigateToVehicleList = () =>
    navigation.navigate('VehicleList', { userId, userPhone });
  const navigateToSelectGarage = () => navigation.navigate('SelectGarage');
  const navigateToGarageOrders = () => navigation.navigate('GarageOrders');
  const navigateToEmployeeOrders = () => navigation.navigate('EmployeeOrders');
  const navigateToGarageCustomers = () => navigation.navigate('GarageCustomers');
  const navigateToGarageEmployees = () => navigation.navigate('GarageEmployees');
  const navigateToAdminCatalog = () => navigation.navigate('AdminCatalog');
  const navigateToAdminOperations = () => navigation.navigate('AdminOperations');
  const navigateToAdminSettings = () => navigation.navigate('AdminSettings');
  const navigateToSuperAdminGarages = () => navigation.navigate('SuperAdminGarages');
  const navigateToNotification = () => navigation.navigate('Notification');
  const handleChangePassword = getChangePasswordHandler(userType, userPhone, navigation);

  // ── Build menu config ────────────────────────────────────────────────────────

  const sections = useMemo(
    () =>
      buildRoleMenuConfig(userType, {
        navigateToAccountInfo,
        navigateToVehicleList,
        navigateToSelectGarage,
        navigateToGarageOrders,
        navigateToEmployeeOrders,
        navigateToGarageCustomers,
        navigateToGarageEmployees,
        navigateToAdminCatalog,
        navigateToAdminOperations,
        navigateToAdminSettings,
        navigateToSuperAdminGarages,
        navigateToNotification,
        handleChangePassword,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userType, userId, userPhone],
  );

  return {
    userName,
    userPhone,
    userType,
    avatarUrl,
    roleLabel: getRoleLabel(userType),
    sections,
    handleLogout,
    handleDeleteAccount,
    isDeleting,
    navigateToAccountInfo,
    isLoggedIn,
    appVersion: APP_VERSION,
  };
};
