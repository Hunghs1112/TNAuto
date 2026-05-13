import { useMemo, useEffect, useState, useCallback } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import {
  useGetManagerHomeSummaryQuery,
  useGetManagerHomeOrdersQuery,
  useGetManagerHomeNotificationsQuery,
} from '../services/managerApi';
import { useGetAdminStatsQuery } from '../services/adminGarageApi';
import { AdminStats } from '../services/adminGarageApi';
import { ServiceOrder } from '../types/api.types';
import {
  ACTIVE_ORDER_STATUSES,
  CLOSED_STATUSES,
  KPI,
  ManagerHomeSummary,
  ManagerHomeViewModel,
  ManagementSectionData,
  PENDING_STATUSES,
  PROCESSING_STATUSES,
  QuickActionKey,
} from '../types/managerHome';
import { useAppSelector } from '../redux/hooks/useAppSelector';
import { isManagerRole, isSuperAdminRole } from '../navigation/rolePolicy';
import { AppStackParamList } from '../navigation/AppNavigator';

interface UseManagerHomeScreenInput {
  isEnabled: boolean;
}

// ==================== Pure helper functions (exported for tests) ====================

export function categorizeOrders(orders: ServiceOrder[]) {
  const now = new Date();
  const pending = orders.filter((order) => PENDING_STATUSES.has(order.status?.toLowerCase()));
  const processing = orders.filter((order) => PROCESSING_STATUSES.has(order.status?.toLowerCase()));
  const overdue = orders.filter((order) => {
    if (CLOSED_STATUSES.has(order.status?.toLowerCase())) {
      return false;
    }

    if (order.delivery_date) {
      const deliveryDate = new Date(order.delivery_date);
      return deliveryDate < now;
    }

    return false;
  });
  const active = orders.filter((order) =>
    ACTIVE_ORDER_STATUSES.has(order.status?.toLowerCase()),
  );

  return { pending, processing, overdue, active };
}

export function computeKPIs(
  summary: ManagerHomeSummary | null | undefined,
  orders?: ServiceOrder[],
  unreadNotifications?: number,
): KPI[] {
  // ManagerHomeSummary.stats is typed as ManagerSummaryStats which has known keys
  const stats = summary?.stats || summary?.summary || summary?.statistics || {};
  // Cast to a plain record so we can safely access numeric fields
  const s = stats as Record<string, number | string | null | undefined>;

  const hasSummaryStats =
    s.pending_orders !== undefined ||
    s.processing_orders !== undefined ||
    s.overdue_orders !== undefined ||
    s.completed_today !== undefined;

  let pendingVal: number;
  let processingVal: number;
  let overdueVal: number;
  let completedTodayVal: number;

  if (hasSummaryStats) {
    pendingVal = Number(s.pending_orders) || 0;
    processingVal = Number(s.processing_orders) || 0;
    overdueVal = Number(s.overdue_orders) || 0;
    completedTodayVal = Number(s.completed_today) || 0;
  } else if (orders && orders.length > 0) {
    // Fallback: compute from orders list
    const { pending, processing, overdue } = categorizeOrders(orders);
    pendingVal = pending.length;
    processingVal = processing.length;
    overdueVal = overdue.length;
    completedTodayVal = 0; // cannot compute from orders list alone
  } else {
    pendingVal = 0;
    processingVal = 0;
    overdueVal = 0;
    completedTodayVal = 0;
  }

  const notificationsVal =
    unreadNotifications !== undefined
      ? unreadNotifications
      : Number(s.alerts) || 0;

  return [
    {
      key: 'pending',
      label: 'Đơn chờ xử lý',
      value: pendingVal,
    },
    {
      key: 'processing',
      label: 'Đơn đang xử lý',
      value: processingVal,
    },
    {
      key: 'overdue',
      label: 'Đơn quá hạn',
      value: overdueVal,
      isAlert: overdueVal > 0,
    },
    {
      key: 'completed_today',
      label: 'Hoàn thành hôm nay',
      value: completedTodayVal,
    },
  ];
}

export function buildManagementStats(
  statsMap: Record<string, AdminStats | null | undefined>,
  navigation: NavigationProp<AppStackParamList>,
  isSuperAdmin: boolean,
): ManagementSectionData[] {
  const safeNum = (val: unknown): number => {
    const n = Number(val);
    return isFinite(n) && n >= 0 ? n : 0;
  };

  const sections: ManagementSectionData[] = [];

  // customers
  const customerStats = statsMap['customers'];
  const totalCustomers = customerStats ? safeNum(customerStats.total_customers) : 0;
  const activeCustomers = customerStats ? safeNum(customerStats.active_customers) : 0;
  sections.push({
    key: 'customers',
    icon: 'people-outline',
    title: 'Khách hàng',
    totalCount: totalCustomers,
    activeCount: activeCustomers,
    subtitle: `${activeCustomers} đang hoạt động`,
    onPress: () => navigation.navigate('GarageCustomers'),
  });

  // employees
  const employeeStats = statsMap['employees'];
  const totalEmployees = employeeStats ? safeNum(employeeStats.total_employees) : 0;
  const activeEmployees = employeeStats ? safeNum(employeeStats.active_employees) : 0;
  sections.push({
    key: 'employees',
    icon: 'person-outline',
    title: 'Nhân sự',
    totalCount: totalEmployees,
    activeCount: activeEmployees,
    subtitle: `${activeEmployees} đang hoạt động`,
    onPress: () => navigation.navigate('GarageEmployees'),
  });

  // orders (service-orders)
  const orderStats = statsMap['service-orders'];
  const totalOrders = orderStats ? safeNum(orderStats.total_orders) : 0;
  const processingOrders = orderStats ? safeNum(orderStats.processing_orders) : 0;
  sections.push({
    key: 'orders',
    icon: 'receipt-outline',
    title: 'Đơn dịch vụ',
    totalCount: totalOrders,
    activeCount: processingOrders,
    subtitle: `${processingOrders} đang xử lý`,
    onPress: () => navigation.navigate('GarageOrders'),
  });

  // catalog (services + products + offers grouped)
  const serviceStats = statsMap['services'];
  const totalServices = serviceStats ? safeNum(serviceStats.total_services) : 0;
  sections.push({
    key: 'catalog',
    icon: 'grid-outline',
    title: 'Catalog',
    totalCount: totalServices,
    activeCount: 0,
    subtitle: `${totalServices} dịch vụ`,
    onPress: () => navigation.navigate('AdminCatalog'),
  });

  // operations (vehicles + warranties grouped)
  const vehicleStats = statsMap['vehicles'];
  const totalVehicles = vehicleStats ? safeNum(vehicleStats.total_vehicles) : 0;
  const vehiclesDueInspection = vehicleStats
    ? safeNum(vehicleStats.vehicles_due_inspection)
    : 0;
  sections.push({
    key: 'operations',
    icon: 'car-outline',
    title: 'Vận hành',
    totalCount: totalVehicles,
    activeCount: vehiclesDueInspection,
    subtitle: `${vehiclesDueInspection} cần kiểm tra`,
    onPress: () => navigation.navigate('AdminOperations'),
  });

  // notifications
  const notificationStats = statsMap['notifications'];
  const totalNotifications = notificationStats
    ? safeNum(notificationStats.total_notifications)
    : 0;
  const alertsCount = notificationStats ? safeNum(notificationStats.alerts) : 0;
  sections.push({
    key: 'notifications',
    icon: 'notifications-outline',
    title: 'Thông báo',
    totalCount: totalNotifications,
    activeCount: alertsCount,
    subtitle: `${alertsCount} cảnh báo`,
    onPress: () => navigation.navigate('Notification'),
  });

  // super admin section — only when isSuperAdmin
  if (isSuperAdmin) {
    sections.push({
      key: 'garages',
      icon: 'business-outline',
      title: 'Hệ thống Gara',
      totalCount: 0,
      activeCount: 0,
      subtitle: 'Quản lý tất cả gara',
      onPress: () => navigation.navigate('SuperAdminGarages'),
    });
  }

  return sections;
}

// ==================== Hook ====================

export function useManagerHomeScreen({
  isEnabled,
}: UseManagerHomeScreenInput): ManagerHomeViewModel {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  // Redux state
  const userType = useAppSelector((state) => state.auth.userType);
  const userName = useAppSelector((state) => state.auth.userName);
  const garageNameRaw = useAppSelector((state) => state.garageContext.garageName);
  const garageName = garageNameRaw || 'Garage Dashboard';

  const isSuperAdmin = isSuperAdminRole(userType);

  // Role guard — navigate to Home if not a manager
  useEffect(() => {
    if (isEnabled && !isManagerRole(userType)) {
      navigation.navigate('Home');
    }
  }, [isEnabled, userType, navigation]);

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetManagerHomeSummaryQuery(undefined, { skip: !isEnabled });

  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useGetManagerHomeOrdersQuery(undefined, { skip: !isEnabled });

  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useGetManagerHomeNotificationsQuery(undefined, { skip: !isEnabled });

  // Management stats queries — one per resource
  const {
    data: customersStats,
    refetch: refetchCustomersStats,
  } = useGetAdminStatsQuery({ resource: 'customers' }, { skip: !isEnabled });

  const {
    data: employeesStats,
    refetch: refetchEmployeesStats,
  } = useGetAdminStatsQuery({ resource: 'employees' }, { skip: !isEnabled });

  const {
    data: serviceOrdersStats,
    refetch: refetchServiceOrdersStats,
  } = useGetAdminStatsQuery({ resource: 'service-orders' }, { skip: !isEnabled });

  const {
    data: servicesStats,
    refetch: refetchServicesStats,
  } = useGetAdminStatsQuery({ resource: 'services' }, { skip: !isEnabled });

  const {
    data: productsStats,
    refetch: refetchProductsStats,
  } = useGetAdminStatsQuery({ resource: 'products' }, { skip: !isEnabled });

  const {
    data: offersStats,
    refetch: refetchOffersStats,
  } = useGetAdminStatsQuery({ resource: 'offers' }, { skip: !isEnabled });

  const {
    data: vehiclesStats,
    refetch: refetchVehiclesStats,
  } = useGetAdminStatsQuery({ resource: 'vehicles' }, { skip: !isEnabled });

  const {
    data: warrantiesStats,
    refetch: refetchWarrantiesStats,
  } = useGetAdminStatsQuery({ resource: 'warranties' }, { skip: !isEnabled });

  const {
    data: notificationsStats,
    refetch: refetchNotificationsStats,
  } = useGetAdminStatsQuery({ resource: 'notifications' }, { skip: !isEnabled });

  // ── 401 handling ─────────────────────────────────────────────────────────

  useEffect(() => {
    const is401 = (err: unknown) => {
      if (!err || typeof err !== 'object') return false;
      const e = err as Record<string, unknown>;
      return e.status === 401 || (e as any)?.originalStatus === 401;
    };

    if (is401(summaryError)) {
      navigation.navigate('Login');
    }
  }, [summaryError, navigation]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const orders: ServiceOrder[] = ordersData ?? [];

  const activeOrders = useMemo(
    () => orders.filter((o) => ACTIVE_ORDER_STATUSES.has(o.status?.toLowerCase())),
    [orders],
  );

  const { pending: pendingOrders, processing: processingOrders, overdue: overdueOrders } =
    useMemo(() => categorizeOrders(orders), [orders]);

  const unreadNotificationsCount = useMemo(() => {
    if (!notificationsData) return 0;
    return notificationsData.filter(
      (n) => n.is_read === false || n.is_read === 0,
    ).length;
  }, [notificationsData]);

  const kpis = useMemo(
    () => computeKPIs(summaryData, orders, unreadNotificationsCount),
    [summaryData, orders, unreadNotificationsCount],
  );

  const statsMap = useMemo<Record<string, AdminStats | null | undefined>>(
    () => ({
      customers: customersStats,
      employees: employeesStats,
      'service-orders': serviceOrdersStats,
      services: servicesStats,
      products: productsStats,
      offers: offersStats,
      vehicles: vehiclesStats,
      warranties: warrantiesStats,
      notifications: notificationsStats,
    }),
    [
      customersStats,
      employeesStats,
      serviceOrdersStats,
      servicesStats,
      productsStats,
      offersStats,
      vehiclesStats,
      warrantiesStats,
      notificationsStats,
    ],
  );

  const managementStats = useMemo(
    () => buildManagementStats(statsMap, navigation, isSuperAdmin),
    [statsMap, navigation, isSuperAdmin],
  );

  const completedTodayCount = useMemo(() => {
    const rawStats =
      summaryData?.stats || summaryData?.summary || summaryData?.statistics || {};
    const s = rawStats as Record<string, number | string | null | undefined>;
    return Number(s.completed_today) || 0;
  }, [summaryData]);

  const alertsCount = useMemo(() => {
    const rawStats =
      summaryData?.stats || summaryData?.summary || summaryData?.statistics || {};
    const s = rawStats as Record<string, number | string | null | undefined>;
    return Number(s.alerts) || 0;
  }, [summaryData]);

  // ── isRefreshing state ────────────────────────────────────────────────────

  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── onRefresh ─────────────────────────────────────────────────────────────

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchSummary(),
        refetchOrders(),
        refetchNotifications(),
        refetchCustomersStats(),
        refetchEmployeesStats(),
        refetchServiceOrdersStats(),
        refetchServicesStats(),
        refetchProductsStats(),
        refetchOffersStats(),
        refetchVehiclesStats(),
        refetchWarrantiesStats(),
        refetchNotificationsStats(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    refetchSummary,
    refetchOrders,
    refetchNotifications,
    refetchCustomersStats,
    refetchEmployeesStats,
    refetchServiceOrdersStats,
    refetchServicesStats,
    refetchProductsStats,
    refetchOffersStats,
    refetchVehiclesStats,
    refetchWarrantiesStats,
    refetchNotificationsStats,
  ]);

  // ── Auto-refresh interval (60s) ───────────────────────────────────────────

  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      refetchSummary();
      refetchOrders();
      refetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [isEnabled, refetchSummary, refetchOrders, refetchNotifications]);

  // ── Debug logging ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (summaryData) {
      console.log('[ManagerHome] summary payload', JSON.stringify(summaryData));
    }
  }, [summaryData]);

  // ── Navigation handlers ───────────────────────────────────────────────────

  const onOrderPress = useCallback(
    (orderId: string | number) => {
      navigation.navigate('OrderDetail', { id: String(orderId) });
    },
    [navigation],
  );

  const onSectionPress = useCallback(
    (sectionKey: string) => {
      switch (sectionKey) {
        case 'customers':
          navigation.navigate('GarageCustomers');
          break;
        case 'employees':
          navigation.navigate('GarageEmployees');
          break;
        case 'orders':
          navigation.navigate('GarageOrders');
          break;
        case 'catalog':
          navigation.navigate('AdminCatalog');
          break;
        case 'operations':
          navigation.navigate('AdminOperations');
          break;
        case 'notifications':
          navigation.navigate('Notification');
          break;
        case 'garages':
          navigation.navigate('SuperAdminGarages');
          break;
        default:
          break;
      }
    },
    [navigation],
  );

  const onQuickAction = useCallback(
    (action: QuickActionKey) => {
      switch (action) {
        case 'create_order':
          navigation.navigate('GarageOrders');
          break;
        case 'add_customer':
          navigation.navigate('GarageCustomers');
          break;
        case 'view_all_orders':
          navigation.navigate('GarageOrders');
          break;
        default:
          break;
      }
    },
    [navigation],
  );

  const onNotificationPress = useCallback(() => {
    navigation.navigate('Notification');
  }, [navigation]);

  const onGaragePress = useCallback(() => {
    navigation.navigate('GarageManagement');
  }, [navigation]);

  // ── Loading state ─────────────────────────────────────────────────────────

  const isLoading = summaryLoading || ordersLoading || notificationsLoading;

  // ── Return view-model ─────────────────────────────────────────────────────

  return {
    // Data
    activeOrders,
    pendingOrders,
    processingOrders,
    overdueOrders,
    completedTodayCount,
    alertsCount,
    kpis,
    managementStats,
    isSuperAdmin,

    // Loading states
    isLoading,
    isRefreshing,

    // Handlers
    onRefresh,
    onOrderPress,
    onSectionPress,
    onQuickAction,
    onNotificationPress,
    onGaragePress,

    // Header data
    garageName,
    userName,
    unreadNotificationsCount,
  };
}
