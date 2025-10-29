// src/screens/Warranty/WarrantyScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import Header from '../../components/Header';
import { useAppSelector } from '../../redux/hooks/useAppSelector';
import { useAppDispatch } from '../../redux/hooks/useAppDispatch';
import { RootState } from '../../redux/types';
import { useGetWarrantiesQuery } from '../../services/warrantyApi';
import { setWarranties } from '../../redux/slices/warrantySlice';
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
}

const WarrantyScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh();
  const userId = useAppSelector((state: RootState) => state.auth.userId);
  const userType = useAppSelector((state: RootState) => state.auth.userType);
  const warranties = useAppSelector((state: RootState) => state.warranty.items);

  const {
    data: warrantiesData,
    isLoading,
    error,
    refetch,
  } = useGetWarrantiesQuery();

  useEffect(() => {
    if (warrantiesData) {
      dispatch(setWarranties(warrantiesData));
      console.log('WarrantyScreen: Warranties loaded:', warrantiesData.length);
    }
  }, [warrantiesData, dispatch]);

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

  const renderWarrantyItem = ({ item }: { item: WarrantyItem }) => {
    const status = getWarrantyStatus(item.end_date);
    const daysRemaining = calculateDaysRemaining(item.end_date);

    return (
      <TouchableOpacity
        style={styles.warrantyCard}
        onPress={() => {
          console.log('WarrantyScreen: Navigate to OrderDetail for order:', item.order_id);
          navigation.navigate('OrderDetail', { id: item.order_id.toString() });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.warrantyInfo}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.background.red} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.warrantyTitle}>Bảo hành #{item.id}</Text>
              <Text style={styles.orderId}>Đơn hàng: #{item.order_id}</Text>
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

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.detailLabel}>Thời hạn:</Text>
              <Text style={styles.detailValue}>{item.warranty_period} tháng</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="hourglass-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.detailLabel}>Còn lại:</Text>
              <Text style={[styles.detailValue, { color: status.color }]}>
                {daysRemaining > 0 ? `${daysRemaining} ngày` : 'Đã hết hạn'}
              </Text>
            </View>
          </View>

          {item.note && (
            <View style={styles.noteContainer}>
              <Ionicons name="document-text-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.noteText}>{item.note}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.header}>
          <Header title="Bảo hành" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin bảo hành...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.header}>
          <Header title="Bảo hành" />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.status.error} />
          <Text style={styles.errorText}>Lỗi tải thông tin bảo hành</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <View style={styles.header}>
        <Header title="Bảo hành" />
      </View>

      <View style={styles.content}>
        {warranties.length > 0 ? (
          <FlatList
            data={warranties}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderWarrantyItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
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
    </SafeAreaView>
  );
};

export default WarrantyScreen;