// src/components/ServiceOrderCard/ServiceOrderCard.tsx
import React, { useCallback, useRef, useMemo } from "react"
import { View, Text, Pressable, StyleSheet, Animated } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import LinearGradient from 'react-native-linear-gradient'
import { Colors } from "../../constants/colors"
import { Typography } from "../../constants/typo"
import { HapticFeedback } from "../../utils/haptics"

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
    case 'canceled':
      return Colors.background.gray;
    default:
      return Colors.background.yellow;
  }
};

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({ serviceName, secondaryName, receiveDate, scheduleDate, status, onPress }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const statusText = useMemo(() => getStatusText(status), [status]);
  const statusColor = useMemo(() => getStatusColor(status), [status]);

  const handlePressIn = useCallback(() => {
    HapticFeedback.light();
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleValue]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleValue]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${serviceName} - ${secondaryName} - ${statusText}`}
    >
      <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
      <View style={styles.content}>
        <View style={styles.upperSection}>
          <View style={styles.header}>
            <View style={styles.serviceInfo}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <Ionicons name="settings" size={28} color={Colors.background.light} />
              </LinearGradient>
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
              <Ionicons name="calendar" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.scheduleDate}>{scheduleDate}</Text>
          </View>
        </View>
      </View>
      </Animated.View>
    </Pressable>
  )
}

export default React.memo(ServiceOrderCard)

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    width: "100%",
    minHeight: 190,
    shadowColor: Colors.shadow.red,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    padding: 24,
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
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    marginVertical: 18,
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
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    flex: 1,
    fontWeight: "600",
  },
  scheduleDate: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    flex: 1,
    fontWeight: "600",
  },
})
