import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { isManagerRole } from '../../navigation/rolePolicy';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import {
  AdminServiceReminderConfig,
  AdminStats,
  AdminUiVisibilitySetting,
  useGetAdminServiceReminderConfigsQuery,
  useGetAdminStatsQuery,
  useGetAdminUiVisibilityQuery,
} from '../../services/adminGarageApi';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const toNumber = (value: unknown) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

const pickStat = (stats: AdminStats | undefined, keys: string[]) => {
  if (!stats) {
    return 0;
  }

  for (const key of keys) {
    if (stats[key] !== undefined) {
      return toNumber(stats[key]);
    }
  }

  return 0;
};

const isTruthyFlag = (value: unknown) =>
  value === true || value === 1 || value === '1' || value === 'true';

export default function GarageManagementScreen() {
  const navigation = useNavigation<NavigationProp>();
  const userType = useAppSelector((state) => state.auth.userType);
  const garageName = useAppSelector((state) => state.garageContext.garageName);
  const garageCode = useAppSelector((state) => state.garageContext.activeGarageCode || state.garageContext.garageCode);
  const canAccess = isManagerRole(userType);
  const [refreshing, setRefreshing] = useState(false);

  const customersStats = useGetAdminStatsQuery({ resource: 'customers' }, { skip: !canAccess });
  const ordersStats = useGetAdminStatsQuery({ resource: 'service-orders' }, { skip: !canAccess });
  const employeesStats = useGetAdminStatsQuery({ resource: 'employees' }, { skip: !canAccess });
  const servicesStats = useGetAdminStatsQuery({ resource: 'services' }, { skip: !canAccess });
  const serviceCategoriesStats = useGetAdminStatsQuery({ resource: 'service-categories' }, { skip: !canAccess });
  const productsStats = useGetAdminStatsQuery({ resource: 'products' }, { skip: !canAccess });
  const categoriesStats = useGetAdminStatsQuery({ resource: 'categories' }, { skip: !canAccess });
  const offersStats = useGetAdminStatsQuery({ resource: 'offers' }, { skip: !canAccess });
  const warrantiesStats = useGetAdminStatsQuery({ resource: 'warranties' }, { skip: !canAccess });
  const vehiclesStats = useGetAdminStatsQuery({ resource: 'vehicles' }, { skip: !canAccess });
  const notificationsStats = useGetAdminStatsQuery({ resource: 'notifications' }, { skip: !canAccess });
  const uiVisibilityQuery = useGetAdminUiVisibilityQuery(undefined, { skip: !canAccess });
  const reminderConfigsQuery = useGetAdminServiceReminderConfigsQuery(undefined, { skip: !canAccess });

  const reminderConfigs = useMemo(
    () => (reminderConfigsQuery.data || []) as AdminServiceReminderConfig[],
    [reminderConfigsQuery.data],
  );
  const uiVisibility = useMemo(
    () => (uiVisibilityQuery.data || []) as AdminUiVisibilitySetting[],
    [uiVisibilityQuery.data],
  );

  const enabledReminders = reminderConfigs.filter(
    (item) => isTruthyFlag(item.enabled) || isTruthyFlag(item.is_enabled),
  ).length;
  const hiddenSections = uiVisibility.filter((item) => isTruthyFlag(item.is_hidden)).length;

  const dashboardCards = useMemo(
    () => [
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
        subtitle: `${pickStat(employeesStats.data, ['active_employees', 'working_employees'])} đang làm việc`,
        onPress: () => navigation.navigate('GarageEmployees'),
      },
      {
        key: 'services',
        icon: 'construct-outline',
        title: 'Dịch vụ',
        value: pickStat(servicesStats.data, ['total_services', 'services_total', 'count']),
        subtitle: `${pickStat(serviceCategoriesStats.data, ['total_categories', 'categories_total', 'count'])} nhóm dịch vụ`,
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
    ],
    [
      categoriesStats.data,
      customersStats.data,
      employeesStats.data,
      navigation,
      notificationsStats.data,
      offersStats.data,
      ordersStats.data,
      productsStats.data,
      serviceCategoriesStats.data,
      servicesStats.data,
      vehiclesStats.data,
      warrantiesStats.data,
    ],
  );

  const isLoading =
    customersStats.isLoading ||
    ordersStats.isLoading ||
    employeesStats.isLoading ||
    servicesStats.isLoading ||
    productsStats.isLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        customersStats.refetch(),
        ordersStats.refetch(),
        employeesStats.refetch(),
        servicesStats.refetch(),
        serviceCategoriesStats.refetch(),
        productsStats.refetch(),
        categoriesStats.refetch(),
        offersStats.refetch(),
        warrantiesStats.refetch(),
        vehiclesStats.refetch(),
        notificationsStats.refetch(),
        uiVisibilityQuery.refetch(),
        reminderConfigsQuery.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  if (!canAccess) {
    return (
      <Screen
        headerTitle="Quản trị gara"
        showBackButton={false}
        statusBarStyle="light-content"
      >
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={40} color={Colors.text.secondary} />
          <Text style={styles.emptyTitle}>Bạn không có quyền truy cập màn này</Text>
        </View>
      </Screen>
    );
  }

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
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}>
            <Ionicons name="business-outline" size={24} color={Colors.background.light} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>
              {garageName || 'Garage admin dashboard'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {garageCode ? `Mã gara: ${garageCode}` : 'Đang dùng namespace /api/app/admin'}
            </Text>
          </View>
        </View>
        <Text style={styles.heroDescription}>
          Màn này tổng hợp số liệu và cấu hình quản trị đang được lấy từ nhóm endpoint app admin mới.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang đồng bộ dashboard quản trị...</Text>
        </View>
      ) : (
        <>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('GarageCustomers')}
              activeOpacity={0.85}
            >
              <Ionicons name="people-outline" size={18} color={Colors.primary} />
              <Text style={styles.quickActionText}>Khách hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('GarageOrders')}
              activeOpacity={0.85}
            >
              <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
              <Text style={styles.quickActionText}>Đơn hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Notification')}
              activeOpacity={0.85}
            >
              <Ionicons name="notifications-outline" size={18} color={Colors.primary} />
              <Text style={styles.quickActionText}>Thông báo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng quan nghiệp vụ</Text>
            <View style={styles.cardsGrid}>
              {dashboardCards.map((card) => (
                <TouchableOpacity
                  key={card.key}
                  style={styles.dashboardCard}
                  activeOpacity={card.onPress ? 0.85 : 1}
                  onPress={card.onPress}
                  disabled={!card.onPress}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Ionicons name={card.icon as any} size={18} color={Colors.primary} />
                    </View>
                    {card.onPress ? (
                      <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
                    ) : null}
                  </View>
                  <Text style={styles.cardValue}>{card.value}</Text>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
                  <Text style={styles.configValue}>{enabledReminders}/{reminderConfigs.length} đang bật</Text>
                </View>
                <Ionicons name="time-outline" size={18} color={Colors.secondary} />
              </View>

              <View style={styles.configDivider} />

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
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    gap: spacing.base,
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
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
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
  heroDescription: {
    color: Colors.alpha.white85,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickAction: {
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
  quickActionText: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dashboardCard: {
    width: '48%',
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  cardValue: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
  },
  cardTitle: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
  cardSubtitle: {
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    lineHeight: 18,
  },
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
  configDivider: {
    height: 1,
    backgroundColor: Colors.border.light,
  },
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
