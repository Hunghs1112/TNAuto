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
import { Typography } from '../../constants/typo';
import ErrorView from '../../components/Loading/ErrorView';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { useAppDispatch } from '../../redux/hooks/useAppDispatch';
import { RootState } from '../../redux/types';
import { useGetWarrantiesQuery } from '../../services/warrantyApi';
import { useGetServiceOrderByIdQuery } from '../../services/serviceOrderApi';

import { useAutoRefresh } from '../../redux/hooks/useAutoRefresh';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface WarrantyItem {
  id: number;
  order_id: number;
  customer_id: number;
  warranty_period: number;
  start_date: string;
  end_date: string;
  note?: string;
  created_at: string;
  updated_at: string;
  // Populated fields from API
  service_name?: string;
  employee_name?: string;
  license_plate?: string;
  vehicle_type?: string;
}

const WarrantyScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh({ tags: ['Warranty'] });
  const userId = useAppSelector((state: RootState) => state.auth.userId);
  const userType = useAppSelector((state: RootState) => state.auth.userType);
  const warranties = useAppSelector((state: RootState) => state.warranty.items);

  const {
    data: warrantiesData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetWarrantiesQuery(
    userType === 'customer' ? { userType: userType as any, userId } : undefined
  );

  // Sync query data into local slice for rendering
  useEffect(() => {
    if (warrantiesData) {
      dispatch(setWarranties(warrantiesData));
    }
  }, [warrantiesData, dispatch]);

  useEffect(() => {
    if (userType === 'dealer') {
      // Dealer không được phép xem/điều hướng các chức năng liên quan dịch vụ/bảo hành.
      navigation.replace('Category' as never);
    }
  }, [userType, navigation]);

  if (userType === 'dealer') {
    return null;
  }

  const { bottom: bottomInset } = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 76;

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
    const status = getWarrantyStatus(item.end_date);
    const daysRemaining = calculateDaysRemaining(item.end_date);
    
    // Fetch order details to enrich warranty data
    const { data: orderData } = useGetServiceOrderByIdQuery(item.order_id.toString(), {
      skip: !item.order_id || !!item.service_name, // Skip if no order_id or already has service_name
    });

    // Merge order data into warranty item
    const enrichedItem: WarrantyItem = {
      ...item,
      service_name: item.service_name || orderData?.service_name,
      employee_name: item.employee_name || orderData?.employee_name || null,
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

          {enrichedItem.employee_name && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.infoLabel}>Nhân viên:</Text>
              <Text style={styles.infoValue}>{enrichedItem.employee_name}</Text>
            </View>
          )}

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.detailLabel}>Thời hạn:</Text>
              <Text style={styles.detailValue}>{enrichedItem.warranty_period} tháng</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="hourglass-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.detailLabel}>Còn lại:</Text>
              <Text style={[styles.detailValue, { color: status.color }]}>
                {daysRemaining > 0 ? `${daysRemaining} ngày` : 'Đã hết hạn'}
              </Text>
            </View>
          </View>

          {enrichedItem.note && (
            <View style={styles.noteContainer}>
              <Ionicons name="document-text-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.noteText}>{enrichedItem.note}</Text>
            </View>
          )}
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