import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';
import { spacing } from '../../design-system/spacing';
import { borderRadius } from '../../design-system/borders';
import { textStyles } from '../../design-system/typography';
import { ActiveOrdersSectionProps } from '../../types/managerHome';
import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader';
import { OrderCard } from './OrderCard';

// ---------------------------------------------------------------------------
// Skeleton placeholder for a single order card
// ---------------------------------------------------------------------------
const OrderCardSkeleton: React.FC = () => (
  <View style={styles.skeletonCard}>
    {/* Avatar + name row */}
    <View style={styles.skeletonRow}>
      <SkeletonLoader width={40} height={40} borderRadius={20} />
      <View style={styles.skeletonTextGroup}>
        <SkeletonLoader width={120} height={14} borderRadius={7} />
        <SkeletonLoader width={80} height={12} borderRadius={6} style={styles.skeletonGap} />
      </View>
    </View>
    {/* Service name */}
    <SkeletonLoader width="90%" height={12} borderRadius={6} style={styles.skeletonGap} />
    {/* Footer */}
    <SkeletonLoader width="60%" height={12} borderRadius={6} style={styles.skeletonGap} />
  </View>
);

// ---------------------------------------------------------------------------
// ActiveOrdersSection
// ---------------------------------------------------------------------------
const ActiveOrdersSectionComponent: React.FC<ActiveOrdersSectionProps> = ({
  orders,
  isLoading,
  isError,
  onOrderPress,
  onRetry,
}) => {
  // ── Section header ──────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Đơn đang xử lý</Text>
      {!isLoading && !isError && (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{orders.length}</Text>
        </View>
      )}
    </View>
  );

  // ── Loading state ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.listContent}>
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </View>
      </View>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (isError) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.centeredState}>
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={Colors.status.error}
          />
          <Text style={styles.stateMessage}>Không thể tải danh sách đơn</Text>
          <Pressable
            onPress={onRetry}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Thử lại"
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.centeredState}>
          <Ionicons
            name="checkmark-circle-outline"
            size={40}
            color={Colors.status.success}
          />
          <Text style={styles.stateMessage}>Không có đơn nào đang xử lý</Text>
        </View>
      </View>
    );
  }

  // ── Data state ──────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {renderHeader()}
      <View style={styles.listContent}>
        {orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onPress={onOrderPress}
          />
        ))}
      </View>
    </View>
  );
};

export const ActiveOrdersSection = React.memo(ActiveOrdersSectionComponent);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.base,
  },
  sectionTitle: {
    ...textStyles.h3,
    color: Colors.text.primary,
    flex: 1,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    ...textStyles.caption,
    color: Colors.text.inverted,
    fontWeight: '700',
  },

  // Vertical list
  listContent: {
    gap: spacing.sm,
  },

  // Skeleton card (full width)
  skeletonCard: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.surface.default,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  skeletonTextGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  skeletonGap: {
    marginTop: spacing.xs,
  },

  // Centered states (error / empty)
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  stateMessage: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Retry button
  retryButton: {
    marginTop: spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    ...textStyles.button,
    color: Colors.text.inverted,
  },
});
