// src/components/ServiceOrderCard/ServiceOrderCard.tsx
import React, { useMemo } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { Ionicons } from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient'
import { Colors } from "../../constants/colors"
import { Typography } from "../../constants/typo"
import { spacing } from "../../design-system/spacing"
import { borderRadius } from "../../design-system/borders"
import { getRedShadowStyle } from "../../design-system/shadows"
import { textStyles } from "../../design-system/typography"

interface ServiceOrderCardProps {
  serviceName: string
  secondaryName: string
  receiveDate: string
  scheduleDate: string
  status?: string
  onPress?: () => void
}

const getStatusText = (status?: string) => {
  switch (status) {
    case 'received':
      return 'Đã đặt lịch';
    case 'ready_for_pickup':
      return 'Chờ xác nhận';
    case 'in_progress':
      return 'Đang xử lý';
    case 'completed':
      return 'Hoàn thành';
    case 'cancelled':
    case 'canceled':
      return 'Đã hủy';
    default:
      return status || '';
  }
};

const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'received':
      return '#FEB052'; // Vàng cam
    case 'ready_for_pickup':
      return '#FF6B6B'; // Đỏ nhạt
    case 'in_progress':
      return '#DA1C12'; // Đỏ
    case 'completed':
      return '#34C759'; // Xanh lá
    case 'cancelled':
    case 'canceled':
      return '#9CA3AF'; // Xám
    default:
      return '#FEB052'; // Vàng cam
  }
};

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({ serviceName, secondaryName, receiveDate, scheduleDate, status, onPress }) => {
  const statusText = useMemo(() => getStatusText(status), [status]);
  const statusColor = useMemo(() => getStatusColor(status), [status]);

  return (
    <Pressable
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${serviceName} - ${secondaryName} - ${statusText}`}
    >
      <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.upperSection}>
          <View style={styles.header}>
            <View style={styles.serviceInfo}>
              <View style={styles.iconContainerShadow}>
                <LinearGradient
                  colors={['#DA1C12', '#FF6B6B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconContainer}
                >
                  <Ionicons name="settings" size={28} color={Colors.background.light} />
                </LinearGradient>
              </View>
              <View style={styles.textContainer}>
                <View style={styles.serviceText}>
                  <Text style={styles.serviceName}>{serviceName}</Text>
                  <Text style={styles.secondaryName}>{secondaryName}</Text>
                  {status && (
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                      <Text style={styles.statusText}>{statusText}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward-circle" size={24} color={Colors.text.secondary} />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.dateItem}>
            <View style={[styles.dateIconContainer, styles.receiveDateIcon]}>
              <Ionicons name="calendar-outline" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.receiveDate}>{receiveDate}</Text>
          </View>
          <View style={styles.dateItem}>
            <View style={[styles.dateIconContainer, styles.scheduleDateIcon]}>
              <Ionicons name="calendar" size={18} color="#DA1C12" />
            </View>
            <Text style={styles.scheduleDate}>{scheduleDate}</Text>
          </View>
        </View>
      </View>
      </View>
    </Pressable>
  )
}

export default React.memo(ServiceOrderCard)

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    width: "100%",
    minHeight: 190,
    ...getRedShadowStyle('lg'),
  },
  content: {
    padding: spacing.xl,
    flex: 1,
    justifyContent: "space-between",
  },
  upperSection: {
    flex: 2,
    justifyContent: "flex-start",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  serviceInfo: {
    flexDirection: "row",
    gap: spacing.base,
    flex: 1,
  },
  iconContainerShadow: {
    width: 52,
    height: 52,
    borderRadius: 26,
    ...getRedShadowStyle('sm'),
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    overflow: 'hidden',
  },
  arrowContainer: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.neutral[50],
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  serviceText: {
    gap: spacing.sm,
  },
  serviceName: {
    color: Colors.text.primary,
    ...textStyles.bodyLarge,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
  },
  secondaryName: {
    color: Colors.text.secondary,
    ...textStyles.bodySmall,
    opacity: 0.8,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  statusText: {
    color: Colors.text.inverted,
    ...textStyles.bodySmall,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 0,
    marginVertical: spacing.md,
  },
  footer: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  dateItem: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    flex: 1,
  },
  dateIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  receiveDateIcon: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)', // Orange soft background
  },
  scheduleDateIcon: {
    backgroundColor: 'rgba(218, 28, 18, 0.1)', // Red soft background
  },
  receiveDate: {
    color: Colors.secondary,
    ...textStyles.bodySmall,
    flex: 1,
    fontWeight: Typography.weight.semibold,
  },
  scheduleDate: {
    color: '#DA1C12',
    ...textStyles.bodySmall,
    flex: 1,
    fontWeight: Typography.weight.semibold,
  },
})
