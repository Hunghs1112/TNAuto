/**
 * OrdersBarChart
 *
 * Multi-line chart hiển thị đơn hàng theo từng trạng thái.
 *
 * Features:
 * - Legend toggle: nhấn để isolate một status
 * - Trục Y cố định khi scroll ngang (sticky Y-axis pattern)
 * - scrollRef + onSyncScroll để đồng bộ scroll với chart khác
 * - Empty state khi không có dữ liệu
 */

import React, { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { AdminAnalyticsResponse, TimePeriod } from '../../services/adminGarageApi';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'received' | 'in_progress' | 'ready_for_pickup' | 'completed' | 'cancelled';

interface StatusConfig {
  key: OrderStatus;
  label: string;
  color: string;
}

export interface OrdersBarChartProps {
  data: AdminAnalyticsResponse['series']['orders_by_status'];
  period: TimePeriod;
  isLoading?: boolean;
  scrollRef?: React.RefObject<ScrollView>;
  onSyncScroll?: (x: number) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIGS: StatusConfig[] = [
  { key: 'received',         label: 'Mới nhận',     color: Colors.palette.cobalt },
  { key: 'in_progress',      label: 'Đang sửa',     color: Colors.palette.goldDark },
  { key: 'ready_for_pickup', label: 'Chờ bàn giao', color: Colors.palette.bronze },
  { key: 'completed',        label: 'Hoàn thành',   color: '#16a34a' },
  { key: 'cancelled',        label: 'Đã hủy',       color: Colors.palette.slate },
];

const CHART_HEIGHT  = 200;
const Y_AXIS_WIDTH  = 36;
const POINT_SPACING = 48;

// ─── Component ────────────────────────────────────────────────────────────────

const OrdersBarChart: React.FC<OrdersBarChartProps> = ({
  data,
  scrollRef: externalRef,
  onSyncScroll,
}) => {
  const internalRef  = useRef<ScrollView>(null);
  const scrollViewRef = externalRef ?? internalRef;

  const [activeStatus, setActiveStatus] = useState<OrderStatus | null>(null);

  const toggleStatus = (key: OrderStatus) =>
    setActiveStatus(prev => (prev === key ? null : key));

  const visibleConfigs = activeStatus
    ? STATUS_CONFIGS.filter(c => c.key === activeStatus)
    : STATUS_CONFIGS;

  // Lấy labels từ status đầu tiên có data
  const labels = (() => {
    for (const cfg of STATUS_CONFIGS) {
      const pts = data[cfg.key];
      if (pts && pts.length > 0) return pts.map(p => p.label);
    }
    return [];
  })();

  const isEmpty = labels.length === 0;

  const lineDataSets = visibleConfigs.map(cfg => ({
    data: (data[cfg.key] ?? []).map(p => ({ value: p.value })),
    color: cfg.color,
    thickness: 2,
    dataPointsColor: cfg.color,
    dataPointsRadius: 3,
    key: cfg.key,
  }));

  const xAxisData = labels.map(label => ({ value: 0, label }));
  const allValues = visibleConfigs.flatMap(cfg =>
    (data[cfg.key] ?? []).map(p => p.value),
  );
  const rawMax       = allValues.length > 0 ? Math.max(...allValues, 1) : 1;
  const noOfSections = Math.min(4, rawMax);
  const maxValue     = Math.ceil(rawMax / noOfSections) * noOfSections;
  const needsScroll  = labels.length > 7;
  const chartWidth   = needsScroll ? labels.length * POINT_SPACING + 40 : undefined;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    onSyncScroll?.(e.nativeEvent.contentOffset.x);

  const renderChart = () => (
    <LineChart
      data={xAxisData}
      dataSet={lineDataSets}
      height={CHART_HEIGHT}
      width={chartWidth}
      maxValue={maxValue}
      noOfSections={noOfSections}
      isAnimated
      hideRules={false}
      rulesColor={Colors.border.light}
      rulesType="solid"
      xAxisLabelTextStyle={styles.axisLabel}
      hideYAxisText={needsScroll}
      yAxisColor="transparent"
      xAxisColor={Colors.border.light}
      curved
      spacing={POINT_SPACING}
      yAxisLabelWidth={needsScroll ? 0 : Y_AXIS_WIDTH}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đơn hàng theo trạng thái</Text>

      {/* Legend */}
      <View style={styles.legendRow}>
        {STATUS_CONFIGS.map(cfg => {
          const isActive = activeStatus === null || activeStatus === cfg.key;
          return (
            <TouchableOpacity
              key={cfg.key}
              style={[styles.legendItem, !isActive && styles.legendItemDim]}
              onPress={() => toggleStatus(cfg.key)}
              activeOpacity={0.75}
            >
              <View style={[styles.dot, { backgroundColor: cfg.color }]} />
              <Text style={[styles.legendText, !isActive && styles.legendTextDim]}>
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chart */}
      {isEmpty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Không có dữ liệu</Text>
        </View>
      ) : needsScroll ? (
        <View style={styles.chartRow}>
          {/* Sticky Y-axis */}
          <View style={{ width: Y_AXIS_WIDTH, height: CHART_HEIGHT, overflow: 'hidden' }}>
            <LineChart
              data={xAxisData}
              dataSet={lineDataSets}
              height={CHART_HEIGHT}
              maxValue={maxValue}
              noOfSections={noOfSections}
              hideRules
              hideDataPoints
              xAxisColor="transparent"
              yAxisColor={Colors.border.light}
              yAxisTextStyle={styles.axisLabel}
              yAxisLabelWidth={Y_AXIS_WIDTH}
              width={1}
              spacing={0}
              initialSpacing={0}
              endSpacing={0}
              xAxisLabelsVerticalShift={-9999}
              disableForeignObject
            />
          </View>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollArea}
            scrollEventThrottle={16}
            onScroll={handleScroll}
          >
            {renderChart()}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.chartRow}>
          <View style={styles.scrollArea}>{renderChart()}</View>
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: spacing.sm,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.secondary,
  },
  legendItemDim: { opacity: 0.4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.primary,
  },
  legendTextDim: { color: Colors.text.secondary },
  chartRow: { flexDirection: 'row', alignItems: 'flex-start' },
  scrollArea: { flex: 1, overflow: 'hidden' },
  empty: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  axisLabel: { color: Colors.text.secondary, fontSize: 10 },
});

export default OrdersBarChart;
