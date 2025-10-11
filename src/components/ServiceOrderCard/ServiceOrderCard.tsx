// src/components/ServiceOrderCard/ServiceOrderCard.tsx
import type React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { Colors } from "../../constants/colors"
import { Typography } from "../../constants/typo"

interface ServiceOrderCardProps {
  serviceName: string
  secondaryName: string
  receiveDate: string
  scheduleDate: string
  status?: string
  onPress?: () => void
}

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({ serviceName, secondaryName, receiveDate, scheduleDate, status, onPress }) => {
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
        return 'Đã hủy';
      case 'canceled':
        return 'Đã hủy';
      default:
        return status || '';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'received':
        return Colors.background.yellow;
      case 'ready_for_pickup':
        return Colors.background.orange;
      case 'in_progress':
        return Colors.background.red;
      case 'completed':
        return Colors.background.green;
      case 'cancelled':
        return Colors.background.gray;
      case 'canceled':
        return Colors.background.gray;
      default:
        return Colors.background.yellow;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${serviceName} - ${secondaryName} - ${getStatusText(status)}`}
    >
      <View style={styles.content}>
        <View style={styles.upperSection}>
          <View style={styles.header}>
            <View style={styles.serviceInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="settings" size={26} color={Colors.text.primary} />
              </View>
              <View style={styles.textContainer}>
                <View style={styles.serviceText}>
                  <Text style={styles.serviceName}>{serviceName}</Text>
                  <Text style={styles.secondaryName}>{secondaryName}</Text>
                  {status && (
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                      <Text style={styles.statusText}>{getStatusText(status)}</Text>
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
            <View style={styles.dateIconContainer}>
              <Ionicons name="calendar-outline" size={18} color={Colors.background.yellow} />
            </View>
            <Text style={styles.receiveDate}>{receiveDate}</Text>
          </View>
          <View style={styles.dateItem}>
            <View style={styles.dateIconContainer}>
              <Ionicons name="calendar" size={18} color={Colors.background.indigo} />
            </View>
            <Text style={styles.scheduleDate}>{scheduleDate}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    width: "100%",
    minHeight: 180,
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  content: {
    padding: 20,
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
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  arrowContainer: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: Colors.neutral[50],
  },
  textContainer: {
    flex: 1,
    marginLeft: 4,
  },
  serviceText: {
    gap: 8,
  },
  serviceName: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.lg,
    lineHeight: 24,
  },
  secondaryName: {
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    opacity: 0.8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    color: Colors.text.inverted,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 0,
    marginVertical: 16,
  },
  footer: {
    flex: 1,
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    paddingVertical: 8,
  },
  dateItem: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    flex: 1,
  },
  dateIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral[50],
    justifyContent: "center",
    alignItems: "center",
  },
  receiveDate: {
    color: Colors.background.yellow,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    flex: 1,
    fontWeight: "500",
  },
  scheduleDate: {
    color: Colors.background.indigo,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    flex: 1,
    fontWeight: "500",
  },
})

export default ServiceOrderCard

