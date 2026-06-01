/**
 * AnalyticsSkeleton
 *
 * Skeleton placeholder cho AnalyticsSection khi đang load lần đầu.
 * Layout khớp với PeriodSelector + 4 KpiCard + 2 charts.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';

const AnalyticsSkeleton: React.FC = () => (
  <View style={styles.container}>
    {/* PeriodSelector placeholder */}
    <SkeletonLoader height={36} borderRadius={borderRadius.full} />

    {/* 4 KPI cards 2×2 */}
    <View style={styles.kpiGrid}>
      <SkeletonLoader width="48%" height={88} borderRadius={16} />
      <SkeletonLoader width="48%" height={88} borderRadius={16} />
      <SkeletonLoader width="48%" height={88} borderRadius={16} />
      <SkeletonLoader width="48%" height={88} borderRadius={16} />
    </View>

    {/* Orders chart placeholder */}
    <SkeletonLoader height={240} borderRadius={16} />

    {/* Customers chart placeholder */}
    <SkeletonLoader height={200} borderRadius={16} />
  </View>
);

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});

export default AnalyticsSkeleton;
