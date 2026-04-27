// src/screens/Warranty/WarrantyScreen.tsx
import React, { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setWarranties } from '../../redux/slices/warrantySlice';
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
import { useAppDispatch } from '../../redux/hooks/useAppDispatch';
import { RootState } from '../../redux/types';
import { useGetWarrantiesQuery, type Warranty as WarrantyApiItem } from '../../services/warrantyApi';
import { useGetOrderDetailsQuery } from '../../services/customerApi';

import { useAutoRefresh } from '../../redux/hooks/useAutoRefresh';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type WarrantyItem = WarrantyApiItem;

const WarrantyScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh({ tags: ['Warranty'] });
  const userId = useAppSelector((state: RootState) => state.auth.userId);
  const userType = useAppSelector((state: RootState) => state.auth.userType);
  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isLoggedIn);
  const warranties = useAppSelector((state: RootState) => state.warranty.items);
  const garageCode = useAppSelector((state: RootState) => state.garageContext.garageCode);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 76;

  // 🔍 DEBUG: Log trạng thái auth và warranty
  console.log('🛡️ [WarrantyScreen] === RENDER ===');
  console.log('🛡️ [WarrantyScreen] isLoggedIn:', isLoggedIn);
  console.log('🛡️ [WarrantyScreen] userType:', userType);
  console.log('🛡️ [WarrantyScreen] userId:', userId);
  console.log('🛡️ [WarrantyScreen] warranties count (redux):', warranties?.length);

  const queryArgs = userType === 'customer'
    ? {
        userType: 'customer' as const,
        userId,
        garageCode: garageCode || 'DEFAULT',
        status: 'all' as const,
      }
    : undefined;

  console.log('🛡️ [WarrantyScreen] queryArgs:', JSON.stringify(queryArgs));
  console.log('🛡️ [WarrantyScreen] skip query:', userType !== 'customer' || !isLoggedIn || !userId);

  const {
    data: warrantiesData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetWarrantiesQuery(queryArgs, {
    skip: userType !== 'customer' || !isLoggedIn || !userId,
  });

  // 🔍 DEBUG: Log kết quả query
  console.log('🛡️ [WarrantyScreen] isLoading:', isLoading);
  console.log('🛡️ [WarrantyScreen] isFetching:', isFetching);
  console.log('🛡️ [WarrantyScreen] error:', error ? JSON.stringify(error) : 'none');
  console.log('🛡️ [WarrantyScreen] garageCode:', garageCode);
  console.log('🛡️ [WarrantyScreen] warrantiesData:', warrantiesData ? `${warrantiesData.length} items` : 'null/undefined');
  if (warrantiesData && warrantiesData.length > 0) {
    console.log('🛡️ [WarrantyScreen] first warranty:', JSON.stringify(warrantiesData[0]));
  }

  // Sync query data into local slice for rendering
  useEffect(() => {
    console.log('🛡️ [WarrantyScreen] useEffect: warrantiesData changed, syncing to redux...');
    if (warrantiesData) {
      console.log('🛡️ [WarrantyScreen] Dispatching setWarranties with', warrantiesData.length, 'items');
      dispatch(setWarranties(warrantiesData));
    }
  }, [warrantiesData, dispatch]);

  useEffect(() => {
    if ((userType === 'dealer' || userType === 'garage_manager' || userType === 'garage_admin')) {
      // Dealer không được phép xem/điều hướng các chức năng liên quan dịch vụ/bảo hành.
      navigation.replace('Category');
    }
  }, [userType, navigation]);

  if ((userType === 'dealer' || userType === 'garage_manager' || userType === 'garage_admin')) {
    return null;
  }

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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getWarrantyPeriodLabel = (period?: number | null): string => {
    if (period == null) return '--';
    return `${period} tháng`;
  };

  const getWarrantyStatus = (endDate: string): { status: string; color: string } => {
    const daysRemaining = calculateDaysRemaining(endDate);
    
    if (daysRemaining < 0) {
      return { status: 'Hết hạn', color: Colors.warranty.expired };
    } else if (daysRemaining <= 30) {
      return { status: 'Sắp hết hạn', color: Colors.warranty.expiring };
    } else {
      return { status: 'Còn hiệu lực', color: Colors.warranty.active };
    }
  };

  // Component for each warranty item to allow using hooks
  const WarrantyItemComponent = ({ item }: { item: WarrantyItem }) => {
    const fallbackDaysRemaining = calculateDaysRemaining(item.end_date);
    const computedStatus = getWarrantyStatus(item.end_date);
    const normalizedStatus = item.warranty_status?.toLowerCase();
    const status = normalizedStatus === 'expired'
      ? { status: 'Hết hạn', color: Colors.warranty.expired }
      : normalizedStatus === 'active'
        ? fallbackDaysRemaining <= 30
          ? { status: 'Sắp hết hạn', color: Colors.warranty.expiring }
          : { status: 'Còn hiệu lực', color: Colors.warranty.active }
        : computedStatus;
    const daysRemaining = item.days_remaining ?? fallbackDaysRemaining;
    
    // Fetch order details to enrich warranty data
    const { data: orderData } = useGetOrderDetailsQuery(item.order_id.toString(), {
      skip: !item.order_id || !!item.service_name, // Skip if no order_id or already has service_name
    });

    // Merge order data into warranty item
    const enrichedItem: WarrantyItem = {
      ...item,
      service_name: item.service_name || orderData?.service_name,
      license_plate: item.license_plate || orderData?.license_plate,
    };

    return (
      <TouchableOpacity
        style={styles.warrantyCard}
        onPress={() => {
          navigation.navigate('OrderDetail', { id: enrichedItem.order_id.toString() });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.warrantyInfo}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.background.red} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.warrantyTitle}>Bảo hành #{enrichedItem.id}</Text>
              {enrichedItem.service_name ? (
                <Text style={styles.serviceName}>{enrichedItem.service_name}</Text>
              ) : (
                <Text style={styles.orderId}>Đơn hàng: #{enrichedItem.order_id}</Text>
              )}
              {enrichedItem.license_plate && (
                <Text style={styles.licensePlate}>Biển số: {enrichedItem.license_plate}</Text>
              )}
              {enrichedItem.product_name ? (
                <Text style={styles.orderId}>Sản phẩm: {enrichedItem.product_name}</Text>
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
              <Text style={styles.dateValue}>{formatDate(enrichedItem.start_date)}</Text>
            </View>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.dateLabel}>Kết thúc:</Text>
              <Text style={styles.dateValue}>{formatDate(enrichedItem.end_date)}</Text>
            </View>
          </View>

          {enrichedItem.dealer_name && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.infoLabel}>Gara:</Text>
              <Text style={styles.infoValue}>{enrichedItem.dealer_name}</Text>
            </View>
          )}

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.detailLabel}>Thời hạn:</Text>
              <Text style={styles.detailValue}>{getWarrantyPeriodLabel(enrichedItem.warranty_period)}</Text>
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
  };

  const renderWarrantyItem = ({ item }: { item: WarrantyItem }) => {
    return <WarrantyItemComponent item={item} />;
  };

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
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderWarrantyItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContainer,
              {
                flexGrow: 1,
                paddingBottom: TAB_BAR_HEIGHT + bottomInset,
                paddingHorizontal: 16,
              },
            ]}
            alwaysBounceVertical={true}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
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

