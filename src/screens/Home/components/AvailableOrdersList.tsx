import React, { useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import ConfirmButton from '../../../components/ConfirmButton';
import ServiceOrderCard from '../../../components/ServiceOrderCard';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typo';
import { PerformanceConfig } from '../../../config/performance';
import { borderRadius } from '../../../design-system/borders';
import { spacing } from '../../../design-system/spacing';
import { textStyles } from '../../../design-system/typography';
import { ServiceOrder } from '../../../types/api.types';
import { styles as homeStyles } from '../styles';
import { getServiceImageUrl, getServiceName, type ServiceSummary } from './orderHelpers';

interface AvailableOrdersListProps {
  orders: ServiceOrder[];
  isLoading: boolean;
  services: ServiceSummary[];
  onOrderPress: (id: string) => void;
  onClaimPress: (id: string) => void;
  claimingOrderId?: string | null;
  emptyMessage?: string;
}

const AvailableOrdersList = ({ orders, isLoading, services, onOrderPress, onClaimPress, claimingOrderId, emptyMessage = 'Chưa có đơn chờ nhận' }: AvailableOrdersListProps) => {
  const renderOrderItem = useCallback(
    ({ item }: { item: ServiceOrder }) => {
      const orderId = String(item.id);
      const isClaiming = claimingOrderId === orderId;
      const isUnassigned = item.status === 'received' && (item.employee_id === null || item.employee_id === undefined || item.employee_id === '') && item.claimable !== false;
      const secondaryParts = [item.customer_name || item.receiver_name, item.license_plate].filter(Boolean);

      return (
        <View style={styles.cardWrapper}>
          <ServiceOrderCard
            serviceName={getServiceName(item, services)}
            secondaryName={secondaryParts.join(' • ') || 'Đơn chờ nhân viên nhận'}
            receiveDate={item.receive_date}
            scheduleDate={item.delivery_date || item.receive_date}
            status={item.status}
            serviceImageUrl={getServiceImageUrl(item, services)}
            onPress={() => onOrderPress(orderId)}
          />

          <View style={styles.actionPanel}>
            <Text style={styles.actionHint}>Xem chi tiết đơn hoặc nhận việc ngay tại đây.</Text>
            {isUnassigned ? (
              <ConfirmButton
                title="Nhận việc"
                onPress={() => onClaimPress(orderId)}
                disabled={isClaiming}
                loading={isClaiming}
                buttonColor={Colors.primary}
                textColor={Colors.text.inverted}
                height={42}
                borderRadius={14}
              />
            ) : (
              <Text style={styles.assignedText}>Đơn này đã có người nhận.</Text>
            )}
          </View>
        </View>
      );
    },
    [claimingOrderId, onClaimPress, onOrderPress, services],
  );

  if (isLoading) {
    return (
      <View style={homeStyles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.text.primary} />
        <Text style={homeStyles.loadingText}>Đang tải đơn chờ nhận...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={homeStyles.emptyContainer}>
        <Ionicons name="file-tray-outline" size={48} color={Colors.text.secondary} />
        <Text style={homeStyles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      alwaysBounceVertical
      data={orders}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderOrderItem}
      scrollEnabled={false}
      nestedScrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
      maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
      windowSize={PerformanceConfig.flatList.windowSize}
      removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
      updateCellsBatchingPeriod={PerformanceConfig.flatList.updateCellsBatchingPeriod}
    />
  );
};

const styles = StyleSheet.create({
  listContent: { gap: spacing.md, width: '100%' },
  cardWrapper: { gap: spacing.sm },
  actionPanel: { backgroundColor: Colors.neutral[50], borderRadius: borderRadius.xl, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: Colors.neutral[200] },
  actionHint: { color: Colors.text.secondary, ...textStyles.bodySmall, fontFamily: Typography.fontFamily.regular },
  assignedText: { color: Colors.text.secondary, ...textStyles.bodySmall, fontFamily: Typography.fontFamily.medium },
});

export default React.memo(AvailableOrdersList);
