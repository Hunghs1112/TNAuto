import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import {
  ActiveOrdersSection,
  KPISection,
  ManagementSection,
} from '../../components/ManagerHome';
import { ManagerHomeViewModel } from '../../types/managerHome';
import { Colors } from '../../constants/colors';
import { spacing } from '../../design-system/spacing';

// ─── ManagerHomeScreenView ────────────────────────────────────────────────────

/**
 * ManagerHomeScreenView
 *
 * Pure view component for the Manager Home Screen.
 * Receives the full ManagerHomeViewModel from the hook via props.
 * Does NOT call any APIs or read from Redux directly.
 *
 * Render order: Header → QuickActionsBar → ActiveOrdersSection → KPISection → ManagementSection
 *
 * **Validates: Requirements 1.1, 3.5, 4.2, 4.3, 5.1, 5.2, 5.3, 5.5, 7.1, 7.3, 7.4**
 */
const ManagerHomeScreenView: React.FC<ManagerHomeViewModel> = (props) => {
  const {
    // Header data
    garageName,
    userName,
    unreadNotificationsCount,
    onNotificationPress,
    onGaragePress,

    // Section data
    activeOrders,
    kpis,
    managementStats,

    // Loading / refresh
    isLoading,
    isRefreshing,
    onRefresh,

    // Handlers
    onOrderPress,
  } = props;

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* ── Gradient background ─────────────────────────────────────────── */}
      <LinearGradient
        colors={[...Colors.gradients.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      >
        {/* Decorative circles */}
        <View style={styles.decorativeContainer}>
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
          <View style={[styles.decorativeCircle, styles.circle3]} />
        </View>
      </LinearGradient>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        {/* Garage name + user name (pressable area) */}
        <Pressable
          style={styles.headerTextArea}
          onPress={onGaragePress}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Garage: ${garageName}`}
          accessibilityHint="Nhấn để xem thông tin garage"
          testID="manager-home-garage-press"
        >
          <Text style={styles.garageName} numberOfLines={1} testID="manager-home-garage-name">
            {garageName}
          </Text>
          <Text style={styles.userName} numberOfLines={1} testID="manager-home-user-name">
            {userName}
          </Text>
        </Pressable>

        {/* Notification bell */}
        <Pressable
          style={styles.notificationButton}
          onPress={onNotificationPress}
          accessible
          accessibilityRole="button"
          accessibilityLabel={
            unreadNotificationsCount > 0
              ? `Thông báo, ${unreadNotificationsCount} chưa đọc`
              : 'Thông báo'
          }
          testID="manager-home-notification-button"
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={Colors.text.inverted}
          />
          {unreadNotificationsCount > 0 && (
            <View style={styles.notificationBadge} testID="manager-home-notification-badge">
              <Text style={styles.notificationBadgeText} numberOfLines={1}>
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* ── Scrollable content ──────────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.text.inverted}
            colors={[Colors.primary]}
          />
        }
        testID="manager-home-scroll-view"
      >
        {/* Active Orders Section */}
        <View style={styles.section}>
          <ActiveOrdersSection
            orders={activeOrders}
            isLoading={isLoading}
            isError={false}
            onOrderPress={onOrderPress}
            onRetry={onRefresh}
          />
        </View>

        {/* KPI Section */}
        <View style={styles.section}>
          <KPISection kpis={kpis} isLoading={isLoading} />
        </View>

        {/* Management Section */}
        <View style={styles.section}>
          <ManagementSection sections={managementStats} isLoading={isLoading} />
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },

  // ── Decorative background ──
  decorativeContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.12,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: Colors.background.light,
  },
  circle1: {
    width: 220,
    height: 220,
    top: -80,
    right: -60,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 180,
    left: -50,
  },
  circle3: {
    width: 120,
    height: 120,
    top: '38%',
    right: 30,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.lg,
  },
  headerTextArea: {
    flex: 1,
    gap: 2,
  },
  garageName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.inverted,
    letterSpacing: 0.2,
  },
  userName: {
    fontSize: 14,
    color: Colors.alpha.white78,
    fontWeight: '400',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.alpha.white18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.background.dark,
  },
  notificationBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.text.inverted,
    lineHeight: 12,
  },

  // ── Scroll content ──
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingTop: spacing.lg,
  },

  // ── Sections ──
  section: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
});

export default React.memo(ManagerHomeScreenView);
export { ManagerHomeScreenView };
