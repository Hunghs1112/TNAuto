// src/screens/Vehicle/VehicleListScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import Header from '../../components/Header';
import { useGetCustomerVehiclesQuery } from '../../services/vehicleApi';
import { Vehicle } from '../../types/api.types';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useAutoRefresh } from '../../redux/hooks/useAutoRefresh';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface VehicleListScreenProps {
  route: {
    params: {
      userId: string;
      userPhone: string;
    };
  };
}

const VehicleListScreen: React.FC<VehicleListScreenProps> = ({ route }) => {
  const { userPhone } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh();
  const { data: vehiclesData, isLoading, refetch } = useGetCustomerVehiclesQuery({ phone: userPhone });

  const handleVehiclePress = (vehicle: Vehicle) => {
    navigation.navigate('VehicleDetail', {
      vehicleId: vehicle.id.toString(),
      licensePlate: vehicle.license_plate,
    });
  };

  const renderVehicleCard = ({ item }: { item: Vehicle }) => {
    const status = item.has_active_order ? 'Đang sửa chữa' : 'Bình thường';
    const statusColor = item.has_active_order ? Colors.accent.yellow : Colors.accent.green;
    const statusIcon = item.has_active_order ? 'construct' : 'checkmark-circle';

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleVehiclePress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image 
              source={{ uri: item.image_url }} 
              style={styles.vehicleImage}
              resizeMode="cover"
              onError={(error) => console.log('VehicleListScreen - Image load error for', item.license_plate, ':', error.nativeEvent.error)}
            />
          ) : (
            <View style={[styles.vehicleImage, styles.placeholderImage]}>
              <Ionicons name="car-outline" size={40} color={Colors.neutral[400]} />
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon} size={14} color={Colors.text.white} />
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.licensePlateContainer}>
            <Ionicons name="document-text-outline" size={16} color={Colors.text.primary} />
            <Text style={styles.licensePlate}>{item.license_plate}</Text>
          </View>

          <View style={styles.modelContainer}>
            <Ionicons name="car-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.model}>{item.model || 'Chưa cập nhật'}</Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
          </View>

          {item.active_order_count ? (
            <Text style={styles.orderCount}>{item.active_order_count} đơn đang xử lý</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <Header title="Danh sách xe" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Header title="Danh sách xe" />
      </View>

      <View style={styles.body}>
        {!vehiclesData?.data || vehiclesData.data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={80} color={Colors.neutral[300]} />
            <Text style={styles.emptyTitle}>Chưa có xe nào</Text>
            <Text style={styles.emptySubtitle}>
              Xe sẽ tự động được thêm khi bạn tạo đơn dịch vụ
            </Text>
          </View>
        ) : (
          <FlatList
            data={vehiclesData.data}
            renderItem={renderVehicleCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  header: {
    backgroundColor: Colors.background.red,
  },
  body: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContainer: {
    padding: 12,
  },
  licensePlateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  licensePlate: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginLeft: 6,
    fontFamily: Typography.fontFamily.bold,
  },
  modelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  model: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginLeft: 6,
  },
  statusContainer: {
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.bold,
  },
  orderCount: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 20,
    fontFamily: Typography.fontFamily.bold,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default VehicleListScreen;

