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
import GarageBadge from "../GarageBadge"

interface ServiceOrderCardProps {
  serviceName: string
  secondaryName: string
  receiveDate: string
  scheduleDate: string
  status?: string
  garageName?: string | null
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
      return '#3B82F6'; // blue
    case 'ready_for_pickup':
      return '#F59E0B'; // amber
    case 'in_progress':
      return '#8B5CF6'; // violet
    case 'completed':
      return '#22C55E'; // green
    case 'cancelled':
    case 'canceled':
      return '#EF4444'; // red
    default:
      return Colors.status.pending;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return dateStr;
  // Nếu đã là định dạng DD/MM/YYYY thì giữ nguyên
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  // Parse và format lại thành DD/MM/YYYY
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({
  serviceName,
  secondaryName,
  receiveDate,
  scheduleDate,
  status,
  garageName,
  serviceImageUrl,
  onPress,
}) => {
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
        {/* Badge trạng thái — góc trên phải */}
        {status && (
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        )}

        <View style={styles.content}>
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
                      <Ionicons name="settings" size={26} color={Colors.background.light} />
                    </LinearGradient>
                  )}
                </View>
              </View>
              <View style={styles.textContainer}>
                <View style={styles.serviceText}>
                  <Text style={styles.serviceName} numberOfLines={1}>{serviceName}</Text>
                  <Text style={styles.secondaryName} numberOfLines={1}>{secondaryName}</Text>
                  <GarageBadge garageName={garageName} />
                </View>
              </View>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={18} color={Colors.text.secondary} />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.footer}>
            <View style={styles.dateItem}>
              <View style={[styles.dateIconContainer, isCompleted ? styles.scheduleDateIcon : styles.receiveDateIcon]}>
                <Ionicons
                  name={isCompleted ? "calendar" : "calendar-outline"}
                  size={14}
                  color={isCompleted ? Colors.primaryLight : Colors.secondary}
                />
              </View>
              <Text style={styles.dateLabel} numberOfLines={1}>
                {isCompleted ? "Đã nhận:" : "Dự kiến:"}
              </Text>
              <Text style={styles.dateValue} numberOfLines={1}>
                {isCompleted ? formatDate(receiveDate) : formatDate(scheduleDate)}
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
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    width: "100%",
    overflow: "hidden",
    ...getRedShadowStyle('sm'),
  },
  content: {
    padding: spacing.base,
    flex: 1,
  },
  upperSection: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceInfo: {
    flexDirection: "row",
    gap: spacing.base,
    flex: 1,
    alignItems: "center",
  },
  iconContainerShadow: {
    width: 56,
    height: 56,
    borderRadius: 16,
    ...getRedShadowStyle('sm'),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: 'hidden',
    backgroundColor: Colors.primarySoft,
  },
  arrowContainer: {
    padding: spacing.xs,
  },
  textContainer: {
    flex: 1,
  },
  serviceText: {
    gap: 4,
  },
  serviceName: {
    color: Colors.text.primary,
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    lineHeight: 18,
  },
  secondaryName: {
    color: Colors.text.secondary,
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
  },
  statusBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopRightRadius: borderRadius['2xl'],
    borderBottomLeftRadius: borderRadius.md,
    zIndex: 1,
  },
  statusText: {
    color: Colors.background.light,
    fontSize: 11,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 0,
    marginVertical: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  dateIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  receiveDateIcon: {
    backgroundColor: Colors.secondarySoft,
  },
  scheduleDateIcon: {
    backgroundColor: Colors.primarySoft,
  },
  receiveDate: {
    color: Colors.secondary,
    fontSize: 12,
    flex: 1,
    fontWeight: Typography.weight.semibold,
  },
  scheduleDate: {
    color: Colors.primaryLight,
    fontSize: 12,
    flex: 1,
    fontWeight: Typography.weight.semibold,
  },
  dateLabel: {
    color: Colors.text.secondary,
    fontSize: 11,
    flexShrink: 0,
  },
  dateValue: {
    color: Colors.text.primary,
    fontSize: 12,
    flex: 1,
    fontWeight: Typography.weight.semibold,
  },
})
