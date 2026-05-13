// src/screens/Warranty/WarrantyScreen.tsx
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Screen } from '../../components/layout';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';
import ErrorView from '../../components/Loading/ErrorView';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { RootState } from '../../redux/types';
import { useGetWarrantiesQuery, type Warranty as WarrantyApiItem } from '../../services/warrantyApi';
import { useAutoRefresh } from '../../redux/hooks/useAutoRefresh';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { isManagerRole } from '../../navigation/rolePolicy';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

// ─── Pure helpers (không phụ thuộc state) ────────────────────────────────────

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const calculateDaysRemaining = (endDate: string): number => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getWarrantyPeriodLabel = (period?: number | null): string => {
  if (period == null) return '--';
  return `${period} tháng`;
};

const getWarrantyStatus = (endDate: string): { status: string; color: string } => {
  const daysRemaining = calculateDaysRemaining(endDate);
  if (daysRemaining < 0) return { status: 'Hết hạn', color: Colors.warranty.expired };
  if (daysRemaining <= 30) return { status: 'Sắp hết hạn', color: Colors.warranty.expiring };
  return { status: 'Còn hiệu lực', color: Colors.warranty.active };
};

const resolveWarrantyStatus = (item: WarrantyApiItem) => {
  const fallbackDays = calculateDaysRemaining(item.end_date);
  const computed = getWarrantyStatus(item.end_date);
  const normalized = item.warranty_status?.toLowerCase();

  if (normalized === 'expired') return { status: 'Hết hạn', color: Colors.warranty.expired };
  if (normalized === 'active') {
    return fallbackDays <= 30
      ? { status: 'Sắp hết hạn', color: Colors.warranty.expiring }
      : { status: 'Còn hiệu lực', color: Colors.warranty.active };
  }
  return computed;
};

// ─── WarrantyCard — top-level component, không gọi hook bên trong renderItem ─

interface WarrantyCardProps {
  item: WarrantyApiItem;
  onPress: (orderId: string) => void;
}

const WarrantyCard = React.memo(({ item, onPress }: WarrantyCardProps) => {
  const status = resolveWarrantyStatus(item);
  const daysRemaining = item.days_remaining ?? calculateDaysRemaining(item.end_date);

  // Dùng trực tiếp fields từ warranty response — không cần gọi thêm API
  const serviceName = item.service_name;
  const licensePlate = item.license_plate;

  return (
    <TouchableOpacity
      style={styles.warrantyCard}
      onPress={() => onPress(item.order_id.toString())}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.warrantyInfo}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.background.red} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.warrantyTitle}>Bảo hành #{item.id}</Text>
            {serviceName ? (
              <Text style={styles.serviceName}>{serviceName}</Text>
            ) : (
              <Text style={styles.orderId}>Đơn hàng: #{item.order_id}</Text>
            )}
            {licensePlate ? (
              <Text style={styles.licensePlate}>Biển số: {licensePlate}</Text>
            ) : null}
            {item.product_name ? (
              <Text style={styles.orderId}>Sản phẩm: {item.product_name}</Text>
            ) : null}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
          <Text style={styles.statusText}>{status.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardContent}>
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.dateLabel}>Bắt đầu:</Text>
            <Text style={styles.dateValue}>{formatDate(item.start_date)}</Text>
          </View>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.dateLabel}>Kết thúc:</Text>
            <Text style={styles.dateValue}>{formatDate(item.end_date)}</Text>
          </View>
        </View>

        {item.dealer_name ? (
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.infoLabel}>Gara:</Text>
            <Text style={styles.infoValue}>{item.dealer_name}</Text>
          </View>
        ) : null}

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.detailLabel}>Thời hạn:</Text>
            <Text style={styles.detailValue}>{getWarrantyPeriodLabel(item.warranty_period)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="hourglass-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.detailLabel}>Còn lại:</Text>
            <Text style={[styles.detailValue, { color: status.color }]}>
              {daysRemaining > 0 ? `${daysRemaining} ngày` : 'Đã hết hạn'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

WarrantyCard.displayName = 'WarrantyCard';

// ─── Main Screen ──────────────────────────────────────────────────────────────

const WarrantyScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh({ tags: ['Warranty'] });
  const userId = useAppSelector((state: RootState) => state.auth.userId);
  const userType = useAppSelector((state: RootState) => state.auth.userType);
  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isLoggedIn);
  const garageCode = useAppSelector((state: RootState) => state.garageContext.garageCode);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 76;

  const isManager = isManagerRole(userType);

  // Redirect non-customer roles
  useEffect(() => {
    if (isManager || userType === 'dealer') {
      navigation.replace('Category');
    }
  }, [isManager, userType, navigation]);

  const queryArgs = useMemo(
    () =>
      userType === 'customer' && isLoggedIn && userId && garageCode
        ? {
            userType: 'customer' as const,
            userId,
            garageCode,
            status: 'all' as const,
          }
        : undefined,
    [userType, isLoggedIn, userId, garageCode],
  );

  const {
    data: warrantiesData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetWarrantiesQuery(queryArgs, {
    skip: !queryArgs,
  });

  // Render trực tiếp từ query data — không cần Redux slice trung gian
  const warranties = useMemo(() => warrantiesData ?? [], [warrantiesData]);

  const handleOrderPress = useCallback(
    (orderId: string) => {
      navigation.navigate('OrderDetail', { id: orderId });
    },
    [navigation],
  );

  const keyExtractor = useCallback((item: WarrantyApiItem) => item.id.toString(), []);

  const renderItem = useCallback(
    ({ item }: { item: WarrantyApiItem }) => (
      <WarrantyCard item={item} onPress={handleOrderPress} />
    ),
    [handleOrderPress],
  );

  // Early return cho non-customer
  if (isManager || userType === 'dealer') return null;

  if (isLoading) {
    return (
      <Screen
        headerTitle="Bảo hành"
        showBackButton
        safeAreaTopColor={Colors.primary}
        statusBarStyle="light-content"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin bảo hành...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen
        headerTitle="Bảo hành"
        showBackButton
        safeAreaTopColor={Colors.primary}
        statusBarStyle="light-content"
      >
        <View style={styles.errorContainer}>
          <ErrorView
            message="Lỗi tải thông tin bảo hành"
            onRetry={refetch}
            icon="shield-outline"
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      headerTitle="Bảo hành"
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
      useScrollView={false}
      contentStyle={{ paddingBottom: 0 }}
    >
      <View style={styles.content}>
        {warranties.length > 0 ? (
          <FlatList
            data={warranties}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContainer,
              {
                flexGrow: 1,
                paddingBottom: TAB_BAR_HEIGHT + bottomInset,
                paddingHorizontal: 16,
              },
            ]}
            alwaysBounceVertical
            refreshControl={
              <RefreshControl refreshing={refreshing || isFetching} onRefresh={onRefresh} />
            }
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-outline" size={64} color={Colors.text.secondary} />
            <Text style={styles.emptyTitle}>Chưa có bảo hành nào</Text>
            <Text style={styles.emptySubtitle}>
              Bảo hành sẽ được tạo tự động khi hoàn thành dịch vụ
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
};

export default WarrantyScreen;
