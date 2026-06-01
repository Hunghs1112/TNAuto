/**
 * NewCustomersLineChart
 *
 * Area line chart hiển thị số khách hàng mới theo thời gian.
 *
 * Features:
 * - Luôn render chart kể cả khi tất cả value = 0 (đường nằm ngang)
 * - Trục Y cố định khi scroll ngang (sticky Y-axis pattern)
 * - scrollRef + onSyncScroll để đồng bộ scroll với OrdersBarChart
 */

import React, { useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { TimePeriod, TimeSeriesPoint } from '../../services/adminGarageApi';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';

export interface NewCustomersLineChartProps {
  data: TimeSeriesPoint[];
  period: TimePeriod;
  isLoading?: boolean;
  scrollRef?: React.RefObject<ScrollView>;
  onSyncScroll?: (x: number) => void;
}

const CHART_HEIGHT  = 160;
const Y_AXIS_WIDTH  = 36;
const POINT_SPACING = 48;

const NewCustomersLineChart: React.FC<NewCustomersLineChartProps> = ({
  data,
  isLoading: _isLoading,
  scrollRef: externalRef,
  onSyncScroll,
}) => {
  const internalRef   = useRef<ScrollView>(null);
  const scrollViewRef = externalRef ?? internalRef;

  // Nếu không có data points → hiển thị empty state
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Khách hàng mới</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }

  const lineData = data.map(p => ({ value: p.value, label: p.label }));

  // Tính maxValue và noOfSections sao cho các tick Y luôn là số nguyên.
  // Nếu noOfSections > maxValue thì step < 1 → tick bị trùng.
  // Giải pháp: noOfSections = min(4, maxValue), maxValue làm tròn lên.
  const rawMax      = Math.max(...lineData.map(p => p.value), 1);
  const noOfSections = Math.min(4, rawMax);
  // Làm tròn maxValue lên bội số của noOfSections để step là số nguyên
  const maxValue    = Math.ceil(rawMax / noOfSections) * noOfSections;

  const needsScroll = data.length > 7;
  const chartWidth  = needsScroll ? data.length * POINT_SPACING + 40 : undefined;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    onSyncScroll?.(e.nativeEvent.contentOffset.x);

  const renderChart = () => (
    <LineChart
      data={lineData}
      height={CHART_HEIGHT}
      width={chartWidth}
      color={Colors.primaryLight}
      thickness={2}
      dataPointsColor={Colors.primary}
      dataPointsRadius={4}
      isAnimated
      hideRules={false}
      rulesColor={Colors.border.light}
      rulesType="solid"
      xAxisLabelTextStyle={styles.axisLabel}
      hideYAxisText={needsScroll}
      yAxisColor="transparent"
      xAxisColor={Colors.border.light}
      noOfSections={noOfSections}
      maxValue={maxValue}
      startFillColor={Colors.primarySoft}
      endFillColor={Colors.background.light}
      areaChart
      spacing={POINT_SPACING}
      yAxisLabelWidth={needsScroll ? 0 : Y_AXIS_WIDTH}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Khách hàng mới</Text>

      {needsScroll ? (
        <View style={styles.chartRow}>
          {/* Sticky Y-axis */}
          <View style={{ width: Y_AXIS_WIDTH, height: CHART_HEIGHT, overflow: 'hidden' }}>
            <LineChart
              data={lineData}
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

export default NewCustomersLineChart;
