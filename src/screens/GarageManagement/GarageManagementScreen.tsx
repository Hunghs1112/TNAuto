import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '../../components/layout';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { isManagerRole, isSuperAdminRole } from '../../navigation/rolePolicy';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import {
  AdminServiceReminderConfig,
  AdminStats,
  AdminUiVisibilitySetting,
  TimePeriod,
  useGetAdminAnalyticsQuery,
  useGetAdminServiceReminderConfigsQuery,
  useGetAdminStatsQuery,
  useGetAdminUiVisibilityQuery,
} from '../../services/adminGarageApi';
import AnalyticsSkeleton from '../../components/ui/AnalyticsSkeleton';
import KpiCard from '../../components/ui/KpiCard';
import NewCustomersLineChart from '../../components/ui/NewCustomersLineChart';
import OrdersBarChart from '../../components/ui/OrdersBarChart';
import PeriodSelector from '../../components/ui/PeriodSelector';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const pickStat = (stats: AdminStats | undefined, keys: string[]) => {
  if (!stats) return 0;
  for (const k of keys) {
    if (stats[k] !== undefined) return toNum(stats[k]);
  }
  return 0;
};

const isTruthy = (v: unknown) =>
  v === true || v === 1 || v === '1' || v === 'true';

// ─── Component ────────────────────────────────────────────────────────────────

export default function GarageManagementScreen() {
  const navigation = useNavigation<Nav>();
  const userType   = useAppSelector(s => s.auth.userType);
  const isSuperAdmin = isSuperAdminRole(userType);
  const garageName = useAppSelector(s => s.garageContext.garageName);
  const garageCode = useAppSelector(
    s => s.garageContext.activeGarageCode || s.garageContext.garageCode,
  );
  const canAccess = isManagerRole(userType);

  const [refreshing,   setRefreshing]   = useState(false);
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('7d');

  // Sync-scroll: khi một chart scroll → chart kia scroll theo
  const ordersScrollRef    = useRef<ScrollView>(null);
  const customersScrollRef = useRef<ScrollView>(null);

  const syncFromOrders = useCallback((x: number) => {
    customersScrollRef.current?.scrollTo({ x, animated: false });
  }, []);

  const syncFromCustomers = useCallback((x: number) => {
    ordersScrollRef.current?.scrollTo({ x, animated: false });
  }, []);

  // ── Queries ────────────────────────────────────────────────────────────────
  const analyticsQ = useGetAdminAnalyticsQuery(
    { period: activePeriod },
    { skip: !canAccess },
  );

  const customersStats       = useGetAdminStatsQuery({ resource: 'customers' },         { skip: !canAccess });
  const ordersStats          = useGetAdminStatsQuery({ resource: 'service-orders' },     { skip: !canAccess });
  const employeesStats       = useGetAdminStatsQuery({ resource: 'employees' },          { skip: !canAccess });
  const servicesStats        = useGetAdminStatsQuery({ resource: 'services' },           { skip: !canAccess });
  const svcCategoriesStats   = useGetAdminStatsQuery({ resource: 'service-categories' }, { skip: !canAccess });
  const productsStats        = useGetAdminStatsQuery({ resource: 'products' },           { skip: !canAccess });
  const categoriesStats      = useGetAdminStatsQuery({ resource: 'categories' },         { skip: !canAccess });
  const offersStats          = useGetAdminStatsQuery({ resource: 'offers' },             { skip: !canAccess });
  const warrantiesStats      = useGetAdminStatsQuery({ resource: 'warranties' },         { skip: !canAccess });
  const vehiclesStats        = useGetAdminStatsQuery({ resource: 'vehicles' },           { skip: !canAccess });
  const notificationsStats   = useGetAdminStatsQuery({ resource: 'notifications' },      { skip: !canAccess });
  const uiVisibilityQ        = useGetAdminUiVisibilityQuery(undefined,                   { skip: !canAccess });
  const reminderConfigsQ     = useGetAdminServiceReminderConfigsQuery(undefined,         { skip: !canAccess });

  const reminderConfigs = useMemo(
    () => (reminderConfigsQ.data ?? []) as AdminServiceReminderConfig[],
    [reminderConfigsQ.data],
  );
  const uiVisibility = useMemo(
    () => (uiVisibilityQ.data ?? []) as AdminUiVisibilitySetting[],
    [uiVisibilityQ.data],
  );

  const enabledReminders = reminderConfigs.filter(
    c => isTruthy(c.enabled) || isTruthy(c.is_enabled),
  ).length;
  const hiddenSections = uiVisibility.filter(s => isTruthy(s.is_hidden)).length;

  const dashboardCards = useMemo(() => [
    {
      key: 'customers',
      icon: 'people-outline',
      title: 'Khách hàng',
      value: pickStat(customersStats.data, ['total_customers', 'customers_total', 'count']),
      subtitle: `${pickStat(customersStats.data, ['active_customers', 'customers_with_active_orders'])} đang hoạt động`,
      onPress: () => navigation.navigate('GarageCustomers'),
    },
    {
      key: 'orders',
      icon: 'receipt-outline',
      title: 'Đơn dịch vụ',
      value: pickStat(ordersStats.data, ['total_orders', 'orders_total', 'count']),
      subtitle: `${pickStat(ordersStats.data, ['processing_orders', 'in_progress_orders'])} đang xử lý`,
      onPress: () => navigation.navigate('GarageOrders'),
    },
    {
      key: 'employees',
      icon: 'people-circle-outline',
      title: 'Nhân sự',
      value: pickStat(employeesStats.data, ['total_employees', 'employees_total', 'count']),
      subtitle: `${pickStat(employeesStats.data, ['active_employees', 'working_employees', 'employees_with_active_orders'])} đang làm việc`,
      onPress: () => navigation.navigate('GarageEmployees'),
    },
    {
      key: 'services',
      icon: 'construct-outline',
      title: 'Dịch vụ',
      value: pickStat(servicesStats.data, ['total_services', 'services_total', 'count']),
      subtitle: `${pickStat(svcCategoriesStats.data, ['total_categories', 'categories_total', 'count'])} nhóm`,
      onPress: () => navigation.navigate('AdminCatalog'),
    },
    {
      key: 'products',
      icon: 'cube-outline',
      title: 'Sản phẩm',
      value: pickStat(productsStats.data, ['total_products', 'products_total', 'count']),
      subtitle: `${pickStat(categoriesStats.data, ['total_categories', 'categories_total', 'count'])} danh mục`,
      onPress: () => navigation.navigate('AdminCatalog'),
    },
    {
      key: 'offers',
      icon: 'pricetag-outline',
      title: 'Ưu đãi',
      value: pickStat(offersStats.data, ['total_offers', 'offers_total', 'count']),
      subtitle: `${pickStat(offersStats.data, ['active_offers', 'running_offers'])} đang chạy`,
      onPress: () => navigation.navigate('AdminCatalog'),
    },
    {
      key: 'warranties',
      icon: 'shield-checkmark-outline',
      title: 'Bảo hành',
      value: pickStat(warrantiesStats.data, ['total_warranties', 'warranties_total', 'count']),
      subtitle: `${pickStat(warrantiesStats.data, ['active_warranties', 'valid_warranties'])} còn hiệu lực`,
      onPress: () => navigation.navigate('AdminOperations'),
    },
    {
      key: 'vehicles',
      icon: 'car-sport-outline',
      title: 'Xe',
      value: pickStat(vehiclesStats.data, ['total_vehicles', 'vehicles_total', 'count']),
      subtitle: `${pickStat(vehiclesStats.data, ['vehicles_due_inspection', 'expiring_inspections'])} cần theo dõi`,
      onPress: () => navigation.navigate('AdminOperations'),
    },
    {
      key: 'notifications',
      icon: 'notifications-outline',
      title: 'Thông báo',
      value: pickStat(notificationsStats.data, ['total_notifications', 'notifications_total', 'count']),
      subtitle: `${pickStat(notificationsStats.data, ['alerts', 'pending_notifications', 'failed_notifications'])} cần chú ý`,
      onPress: () => navigation.navigate('Notification'),
    },
  ], [
    categoriesStats.data, customersStats.data, employeesStats.data,
    navigation, notificationsStats.data, offersStats.data, ordersStats.data,
    productsStats.data, svcCategoriesStats.data, servicesStats.data,
    vehiclesStats.data, warrantiesStats.data,
  ]);

  const staticLoading =
    customersStats.isLoading || ordersStats.isLoading ||
    employeesStats.isLoading || servicesStats.isLoading || productsStats.isLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        analyticsQ.refetch(),
        customersStats.refetch(), ordersStats.refetch(),
        employeesStats.refetch(), servicesStats.refetch(),
        svcCategoriesStats.refetch(), productsStats.refetch(),
        categoriesStats.refetch(), offersStats.refetch(),
        warrantiesStats.refetch(), vehiclesStats.refetch(),
        notificationsStats.refetch(),
        uiVisibilityQ.refetch(), reminderConfigsQ.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // ── Access guard ───────────────────────────────────────────────────────────
  if (!canAccess) {
    return (
      <Screen headerTitle="Quản trị gara" showBackButton={false} statusBarStyle="light-content">
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={40} color={Colors.text.secondary} />
          <Text style={styles.emptyTitle}>Bạn không có quyền truy cập màn này</Text>
        </View>
      </Screen>
    );
  }

  // ── Analytics section ──────────────────────────────────────────────────────
  const kpi    = analyticsQ.data?.kpi;
  const series = analyticsQ.data?.series;

  const renderAnalytics = () => (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Phân tích hoạt động</Text>
        {analyticsQ.isFetching && analyticsQ.data && (
          <ActivityIndicator size="small" color={Colors.primary} />
        )}
      </View>

      {/* Period selector — luôn hiển thị */}
      <PeriodSelector value={activePeriod} onChange={setActivePeriod} />

      {/* Loading lần đầu */}
      {analyticsQ.isLoading && !analyticsQ.data && <AnalyticsSkeleton />}

      {/* Error */}
      {analyticsQ.isError && (
        <View style={styles.errorBox}>
          <Ionicons name="cloud-offline-outline" size={28} color={Colors.text.secondary} />
          <Text style={styles.errorText}>Không tải được dữ liệu phân tích</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => analyticsQ.refetch()}
            activeOpacity={0.85}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Data */}
      {kpi && series && (
        <>
          {/* KPI grid 2×2 */}
          <View style={styles.kpiGrid}>
            <KpiCard
              title="Tổng đơn"
              value={kpi.total_orders}
              previousValue={kpi.previous_period_orders}
              icon="receipt-outline"
              onPress={() => navigation.navigate('GarageOrders')}
            />
            <KpiCard
              title="Khách mới"
              value={kpi.new_customers}
              previousValue={kpi.previous_period_new_customers}
              icon="person-add-outline"
              onPress={() => navigation.navigate('GarageCustomers')}
            />
            <KpiCard
              title="Hoàn thành"
              value={kpi.completed_orders}
              previousValue={kpi.previous_period_completed}
              icon="checkmark-circle-outline"
            />
            <KpiCard
              title="Đang xử lý"
              value={kpi.in_progress_orders}
              previousValue={kpi.previous_period_in_progress}
              icon="time-outline"
              onPress={() => navigation.navigate('GarageOrders')}
            />
          </View>

          {/* Biểu đồ đơn hàng */}
          <OrdersBarChart
            data={series.orders_by_status}
            period={activePeriod}
            scrollRef={ordersScrollRef}
            onSyncScroll={syncFromOrders}
          />

          {/* Biểu đồ khách hàng mới */}
          <NewCustomersLineChart
            data={series.new_customers}
            period={activePeriod}
            scrollRef={customersScrollRef}
            onSyncScroll={syncFromCustomers}
          />
        </>
      )}
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Screen
      hideHeader
      statusBarStyle="light-content"
      enablePullToRefresh
      refreshing={refreshing}
      onRefresh={handleRefresh}
      backgroundColor={Colors.background.secondary}
      contentStyle={styles.screenContent}
    >
      {/* Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}>
            <Ionicons name="business-outline" size={24} color={Colors.background.light} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{garageName || 'Garage admin dashboard'}</Text>
            <Text style={styles.heroSubtitle}>
              {garageCode ? `Mã gara: ${garageCode}` : 'Quản trị gara'}
            </Text>
          </View>
        </View>
      </View>

      {staticLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <>
          {/* Quick actions */}
          <View style={styles.quickRow}>
            {[
              { icon: 'people-outline',        label: 'Khách hàng', route: 'GarageCustomers' },
              { icon: 'receipt-outline',        label: 'Đơn hàng',  route: 'GarageOrders' },
              { icon: 'notifications-outline',  label: 'Thông báo', route: 'Notification' },
            ].map(({ icon, label, route }) => (
              <TouchableOpacity
                key={route}
                style={styles.quickBtn}
                onPress={() => navigation.navigate(route as any)}
                activeOpacity={0.85}
              >
                <Ionicons name={icon as any} size={18} color={Colors.primary} />
                <Text style={styles.quickLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Super admin quick cards — chỉ hiển thị với garage_admin */}
          {isSuperAdmin && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quản trị Super Admin</Text>
              <View style={styles.adminCardGrid}>
                <TouchableOpacity
                  style={styles.adminCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('GarageManagers' as any)}
                >
                  <View style={styles.adminCardIcon}>
                    <Ionicons name="person-circle-outline" size={22} color={Colors.primary} />
                  </View>
                  <View style={styles.adminCardBody}>
                    <Text style={styles.adminCardTitle}>Tài khoản quản lý</Text>
                    <Text style={styles.adminCardSub}>
                      Tạo / sửa / reset mật khẩu manager cho các gara.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.text.secondary} />
                </TouchableOpacity>

                {/* TẠM ẨN: nút "Đại lý & catalog" do backend danh sách đại lý đang lỗi — không thể tải danh sách đại lý.
                <TouchableOpacity
                  style={styles.adminCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Dealers' as any)}
                >
                  <View style={styles.adminCardIcon}>
                    <Ionicons name="storefront-outline" size={22} color={Colors.secondary} />
                  </View>
                  <View style={styles.adminCardBody}>
                    <Text style={styles.adminCardTitle}>Đại lý &amp; catalog</Text>
                    <Text style={styles.adminCardSub}>
                      Quản lý đại lý, danh mục và sản phẩm kèm upload ảnh.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.text.secondary} />
                </TouchableOpacity>
                */}
              </View>
            </View>
          )}

          {/* Analytics */}
          {renderAnalytics()}

          {/* Tổng quan nghiệp vụ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng quan nghiệp vụ</Text>
            <View style={styles.cardsGrid}>
              {dashboardCards.map(card => (
                <TouchableOpacity
                  key={card.key}
                  style={styles.dashCard}
                  activeOpacity={0.85}
                  onPress={card.onPress}
                >
                  <View style={styles.dashCardHeader}>
                    <View style={styles.dashCardIcon}>
                      <Ionicons name={card.icon as any} size={18} color={Colors.primary} />
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
                  </View>
                  <Text style={styles.dashCardValue}>{card.value}</Text>
                  <Text style={styles.dashCardTitle}>{card.title}</Text>
                  <Text style={styles.dashCardSub}>{card.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cấu hình quản trị */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cấu hình quản trị</Text>
            <TouchableOpacity
              style={styles.configCard}
              onPress={() => navigation.navigate('AdminSettings')}
              activeOpacity={0.85}
            >
              <View style={styles.configRow}>
                <View>
                  <Text style={styles.configLabel}>Service reminder configs</Text>
                  <Text style={styles.configValue}>
                    {enabledReminders}/{reminderConfigs.length} đang bật
                  </Text>
                </View>
                <Ionicons name="time-outline" size={18} color={Colors.secondary} />
              </View>
              <View style={styles.divider} />
              <View style={styles.configRow}>
                <View>
                  <Text style={styles.configLabel}>UI visibility settings</Text>
                  <Text style={styles.configValue}>{hiddenSections} mục đang ẩn</Text>
                </View>
                <Ionicons name="eye-off-outline" size={18} color={Colors.primaryLight} />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    padding: spacing.base,
    gap: spacing.base,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.alpha.white18,
  },
  heroText: { flex: 1, gap: spacing.xs },
  heroTitle: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  heroSubtitle: {
    color: Colors.alpha.white78,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
  },

  // ── Quick actions ─────────────────────────────────────────────────────────
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  quickLabel: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
  },

  // ── Super admin cards ─────────────────────────────────────────────────────
  adminCardGrid: {
    gap: spacing.sm,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  adminCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminCardBody: {
    flex: 1,
    gap: 2,
  },
  adminCardTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  adminCardSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
    lineHeight: 18,
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    flex: 1,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },

  // ── KPI grid ──────────────────────────────────────────────────────────────
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // ── Error box ─────────────────────────────────────────────────────────────
  errorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  errorText: {
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.primary,
  },
  retryText: {
    color: Colors.background.light,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },

  // ── Dashboard cards ───────────────────────────────────────────────────────
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dashCard: {
    width: '48%',
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: spacing.sm,
  },
  dashCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashCardIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  dashCardValue: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
  },
  dashCardTitle: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
  dashCardSub: {
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    lineHeight: 18,
  },

  // ── Config card ───────────────────────────────────────────────────────────
  configCard: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: spacing.base,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configLabel: {
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
  },
  configValue: {
    marginTop: spacing.xs,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
  },

  // ── Misc ──────────────────────────────────────────────────────────────────
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['4xl'],
  },
  loadingText: {
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
    textAlign: 'center',
  },
});
