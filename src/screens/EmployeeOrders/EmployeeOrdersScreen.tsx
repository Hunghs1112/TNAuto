// src/screens/EmployeeOrders/EmployeeOrdersScreen.tsx
// Màn hình danh sách đơn hàng được giao cho nhân viên
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '../../components/layout';
import ServiceOrderCard from '../../components/ServiceOrderCard';
import ErrorView from '../../components/Loading/ErrorView';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { RootState } from '../../redux/types';
import { useGetAssignedOrdersQuery } from '../../services/employeeApi';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type OrderFilter = 'all' | 'received' | 'in_progress' | 'ready_for_pickup' | 'completed';

const FILTERS: Array<{ key: OrderFilter; label: string }> = [
  { key: 'received', label: 'Mới nhận' },
  { key: 'in_progress', label: 'Đang xử lý' },
  { key: 'ready_for_pickup', label: 'Chờ bàn giao' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'all', label: 'Tất cả' },
];

export default function EmployeeOrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const navType = useNavigationState((state) => state?.type);
  const currentEmployee = useAppSelector((state: RootState) => state.employee.currentEmployee);
  const employeeId = currentEmployee?.id ? String(currentEmployee.id) : '';

  const [statusFilter, setStatusFilter] = useState<OrderFilter>('in_progress');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useGetAssignedOrdersQuery(
    { employee_id: employeeId },
    { skip: !employeeId },
  );

  const orders = data?.data || [];
  const filteredOrders = (() => {
    const byStatus = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);
    if (!search.trim()) return byStatus;
    const q = search.trim().toLowerCase();
    return byStatus.filter(
      (o) =>
        String(o.license_plate || '').toLowerCase().includes(q) ||
        String(o.customer_name || o.receiver_name || '').toLowerCase().includes(q) ||
        String(o.service_name || '').toLowerCase().includes(q),
    );
  })();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const renderFilter = useCallback(
    (filter: { key: OrderFilter; label: string }) => {
      const isActive = statusFilter === filter.key;
      return (
        <TouchableOpacity
          key={filter.key}
          style={[styles.filterPill, isActive && styles.filterPillActive]}
          onPress={() => setStatusFilter(filter.key)}
          activeOpacity={0.85}
        >
          <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      );
    },
    [statusFilter],
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof orders)[0] }) => (
      <ServiceOrderCard
        serviceName={item.service_name || `Đơn #${item.id}`}
        secondaryName={item.customer_name || item.receiver_name || 'Khách hàng'}
        receiveDate={item.receive_date}
        scheduleDate={item.delivery_date || 'Chưa xác định'}
        status={item.status}
        serviceImageUrl={item.service_image_url ?? undefined}
        onPress={() => navigation.navigate('EmployeeOrderDetail', { id: String(item.id) })}
      />
    ),
    [navigation],
  );

  if (!employeeId) {
    return (
      <Screen headerTitle="Đơn hàng của tôi" showBackButton={navType !== 'tab'} statusBarStyle="light-content">
        <View style={styles.centered}>
          <Ionicons name="person-outline" size={40} color={Colors.text.secondary} />
          <Text style={styles.emptyTitle}>Không tìm thấy thông tin nhân viên</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      headerTitle="Đơn hàng của tôi"
      showBackButton={navType !== 'tab'}
      statusBarStyle="light-content"
      useScrollView={false}
      backgroundColor={Colors.background.secondary}
    >
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      ) : error ? (
        <ErrorView
          message="Không thể tải danh sách đơn hàng"
          onRetry={refetch}
          icon="receipt-outline"
        />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isFetching}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersRow}
                style={styles.filtersScroll}
              >
                {FILTERS.map(renderFilter)}
              </ScrollView>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Tìm biển số, tên KH, dịch vụ..."
                  placeholderTextColor={Colors.text.secondary}
                  returnKeyType="search"
                />
                {search ? (
                  <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Ionicons name="close-circle" size={16} color={Colors.text.secondary} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={40} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>
                {statusFilter === 'all'
                  ? 'Chưa có đơn hàng nào được giao'
                  : 'Không có đơn ở trạng thái này'}
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.base,
    gap: spacing.base,
  },
  headerBlock: {
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  filtersScroll: {
    marginBottom: spacing.base,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.background.light,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  loadingText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    padding: 0,
  },
});
