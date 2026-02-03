// src/components/ServiceOrderCard/ServiceOrderCard.tsx
import React, { useMemo } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { OptimizedImage } from "../OptimizedImage"
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
  serviceImageUrl?: string | null
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
      return Colors.status.pending;
    case 'ready_for_pickup':
      return Colors.status.warning;
    case 'in_progress':
      return Colors.status.inProgress;
    case 'completed':
      return Colors.status.success;
    case 'cancelled':
    case 'canceled':
      return Colors.status.cancelled;
    default:
      return Colors.status.pending;
  }
};

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({ serviceName, secondaryName, receiveDate, scheduleDate, status, serviceImageUrl, onPress }) => {
  const statusText = useMemo(() => getStatusText(status), [status]);
  const statusColor = useMemo(() => getStatusColor(status), [status]);
  const isCompleted = status === 'completed';

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
                <View style={styles.iconContainer}>
                  {serviceImageUrl ? (
                    <OptimizedImage
                      source={{ uri: serviceImageUrl }}
                      width={styles.iconContainer.width as number}
                      height={styles.iconContainer.height as number}
                      borderRadius={styles.iconContainer.borderRadius as number}
                    />
                  ) : (
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryLight]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconContainer}
                    >
                      <Ionicons name="settings" size={28} color={Colors.background.light} />
                    </LinearGradient>
                  )}
                </View>
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
            <View style={[styles.dateIconContainer, isCompleted ? styles.scheduleDateIcon : styles.receiveDateIcon]}>
              <Ionicons
                name={isCompleted ? "calendar" : "calendar-outline"}
                size={18}
                color={isCompleted ? "#DA1C12" : Colors.secondary}
              />
            </View>
            <Text style={styles.dateLabel} numberOfLines={1}>
              {isCompleted ? "Đã nhận ngày" : "Ngày nhận dự kiến"}
            </Text>
            <Text style={styles.dateValue} numberOfLines={1}>
              {isCompleted ? receiveDate : scheduleDate}
            </Text>
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
    backgroundColor: Colors.primarySoft,
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
    color: Colors.background.light,
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
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
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
  dateLabel: {
    color: Colors.text.secondary,
    ...textStyles.bodySmall,
    flexShrink: 0,
  },
  dateValue: {
    color: Colors.text.primary,
    ...textStyles.bodySmall,
    flex: 1,
    fontWeight: Typography.weight.semibold,
  },
})
