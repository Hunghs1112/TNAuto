// src/screens/Home/components/WarrantyInfo.tsx
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typo';
import { styles } from '../styles';
import { secondsToMonths } from '../../../utils/dateHelpers';

interface Order {
  id: number | string;
  warranty?: {
    id?: number;
    warranty_period?: number;
    start_date?: string;
    end_date?: string;
    warranty_start?: string;
    warranty_end?: string;
    note?: string | null;
  };
  service_name?: string;
  license_plate?: string;
  customer_name?: string;
}

interface WarrantyInfoProps {
  orders: Order[];
  onWarrantyPress?: (orderId: string) => void;
}

const WarrantyInfo: React.FC<WarrantyInfoProps> = ({
  orders,
  onWarrantyPress,
}) => {
  // Filter orders with warranty
  const ordersWithWarranty = useMemo(() => {
    return orders.filter(order => {
      const warranty = order.warranty;
      return warranty && (
        warranty.warranty_period ||
        warranty.start_date ||
        warranty.end_date ||
        warranty.warranty_start ||
        warranty.warranty_end
      );
    });
  }, [orders]);

  if (ordersWithWarranty.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="shield-outline" size={48} color={Colors.text.secondary} />
        <Text style={styles.emptyText}>Chưa có thông tin bảo hành nào</Text>
      </View>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Chưa xác định';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.warrantyContainer}>
      {ordersWithWarranty.map((order) => {
        const warranty = order.warranty;
        if (!warranty) return null;

        const startDate = warranty.start_date || warranty.warranty_start;
        const endDate = warranty.end_date || warranty.warranty_end;
        const warrantyPeriod = warranty.warranty_period 
          ? secondsToMonths(warranty.warranty_period) 
          : null;

        // Check if warranty is expired
        const isExpired = endDate ? new Date(endDate) < new Date() : false;
        const isExpiringSoon = endDate 
          ? new Date(endDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000 // 30 days
          : false;

        return (
          <TouchableOpacity
            key={order.id}
            style={[
              styles.warrantyCard,
              isExpired && styles.warrantyCardExpired,
              isExpiringSoon && !isExpired && styles.warrantyCardExpiring
            ]}
            onPress={() => onWarrantyPress?.(order.id.toString())}
            activeOpacity={0.7}
          >
            <View style={styles.warrantyCardHeader}>
              <View style={styles.warrantyIconContainer}>
                <Ionicons 
                  name={isExpired ? "shield-outline" : "shield-checkmark-outline"} 
                  size={24} 
                  color={isExpired ? Colors.status.error : Colors.primary} 
                />
              </View>
              <View style={styles.warrantyInfo}>
                <Text style={styles.warrantyServiceName}>
                  {order.service_name || 'Dịch vụ không xác định'}
                </Text>
                {order.customer_name && (
                  <Text style={styles.warrantyCustomerName}>
                    Khách hàng: {order.customer_name}
                  </Text>
                )}
                {order.license_plate && (
                  <Text style={styles.warrantyLicensePlate}>
                    Biển số: {order.license_plate}
                  </Text>
                )}
              </View>
              {isExpired && (
                <View style={styles.warrantyBadge}>
                  <Text style={styles.warrantyBadgeText}>Hết hạn</Text>
                </View>
              )}
              {isExpiringSoon && !isExpired && (
                <View style={[styles.warrantyBadge, styles.warrantyBadgeWarning]}>
                  <Text style={styles.warrantyBadgeText}>Sắp hết hạn</Text>
                </View>
              )}
            </View>
            <View style={styles.warrantyDetails}>
              {warrantyPeriod && (
                <View style={styles.warrantyDetailRow}>
                  <Ionicons name="time-outline" size={16} color={Colors.text.secondary} />
                  <Text style={styles.warrantyDetailText}>
                    Thời hạn: {warrantyPeriod} tháng
                  </Text>
                </View>
              )}
              {startDate && (
                <View style={styles.warrantyDetailRow}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.text.secondary} />
                  <Text style={styles.warrantyDetailText}>
                    Bắt đầu: {formatDate(startDate)}
                  </Text>
                </View>
              )}
              {endDate && (
                <View style={styles.warrantyDetailRow}>
                  <Ionicons name="calendar-clear-outline" size={16} color={Colors.text.secondary} />
                  <Text style={[
                    styles.warrantyDetailText,
                    isExpired && styles.warrantyDetailTextExpired
                  ]}>
                    Kết thúc: {formatDate(endDate)}
                  </Text>
                </View>
              )}
              {warranty.note && (
                <View style={styles.warrantyNote}>
                  <Text style={styles.warrantyNoteText}>{warranty.note}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default React.memo(WarrantyInfo);


