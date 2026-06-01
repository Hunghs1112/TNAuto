/**
 * KpiCard
 *
 * Hiển thị một chỉ số KPI với trend so với kỳ trước.
 * - Trend up/down/neutral dựa trên value vs previousValue
 * - Hiển thị % thay đổi nếu previousValue > 0
 * - Nhấn để navigate nếu onPress được truyền vào
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typo';
import { borderRadius } from '../../design-system/borders';
import { spacing } from '../../design-system/spacing';

export interface KpiCardProps {
  title: string;
  value: number;
  previousValue: number;
  /** Ionicons icon name */
  icon: string;
  onPress?: () => void;
}

type Trend = 'up' | 'down' | 'neutral';

function getTrend(value: number, prev: number): Trend {
  if (value > prev) return 'up';
  if (value < prev) return 'down';
  return 'neutral';
}

const TREND: Record<Trend, { icon: string; color: string }> = {
  up:      { icon: 'trending-up',    color: '#16a34a' },
  down:    { icon: 'trending-down',  color: Colors.status.error },
  neutral: { icon: 'remove-outline', color: Colors.text.secondary },
};

function formatPct(value: number, prev: number): string | null {
  if (prev <= 0) return null;
  const pct = Math.round(((value - prev) / prev) * 100);
  return `${pct > 0 ? '+' : ''}${pct}%`;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  previousValue,
  icon,
  onPress,
}) => {
  const trend = getTrend(value, previousValue);
  const { icon: trendIcon, color: trendColor } = TREND[trend];
  const pct = formatPct(value, previousValue);

  const inner = (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon as any} size={20} color={Colors.primary} />
        </View>
        <View style={[styles.badge, { borderColor: trendColor + '40' }]}>
          <Ionicons name={trendIcon as any} size={12} color={trendColor} />
          {pct !== null && (
            <Text style={[styles.badgeText, { color: trendColor }]}>{pct}</Text>
          )}
        </View>
      </View>

      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value.toLocaleString('vi-VN')}
      </Text>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.wrapper}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {inner}
      </TouchableOpacity>
    );
  }
  return <View style={styles.wrapper}>{inner}</View>;
};

const styles = StyleSheet.create({
  wrapper: { width: '48%' },
  card: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
  },
  value: {
    fontSize: Typography.size['2xl'],
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
  },
  title: {
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
  },
});

export default KpiCard;
