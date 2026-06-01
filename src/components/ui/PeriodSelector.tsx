/**
 * PeriodSelector
 *
 * Thanh chọn khoảng thời gian: Ngày / 3 Ngày / 7 Ngày / Tháng / Năm
 * Hiển thị dạng pill ngang, scroll ngang nếu màn nhỏ.
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { TimePeriod } from '../../services/adminGarageApi';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';

interface PeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

const PERIODS: Array<{ key: TimePeriod; label: string }> = [
  { key: '1d', label: 'Hôm nay' },
  { key: '3d', label: '3 Ngày' },
  { key: '7d', label: '7 Ngày' },
  { key: '1m', label: 'Tháng' },
  { key: '1y', label: 'Năm' },
];

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ value, onChange }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.row}
  >
    {PERIODS.map(({ key, label }) => {
      const active = value === key;
      return (
        <TouchableOpacity
          key={key}
          style={[styles.pill, active && styles.pillActive]}
          onPress={() => onChange(key)}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={[styles.label, active && styles.labelActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  labelActive: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.background.light,
  },
});

export default PeriodSelector;
