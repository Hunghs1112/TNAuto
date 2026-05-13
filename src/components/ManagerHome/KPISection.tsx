import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../design-system/spacing';
import SectionHeader from '../../screens/Home/SectionHeader';
import { KPICard } from './KPICard';
import { KPI } from '../../types/managerHome';

interface KPISectionProps {
  kpis: KPI[];
  isLoading?: boolean;
  testID?: string;
}

/**
 * KPISection Component
 * 
 * Displays the dashboard overview section with 5 KPI cards in a responsive grid layout.
 * Uses SectionHeader with "Tổng quan" title and KPICard components for each metric.
 * Passes `isAlert` and `onPress` from each KPI entry down to KPICard.
 * 
 * **Validates: Requirements 1.1, 2.1, 2.4, 2.5, 2.6, 7.1, 7.2**
 */
export const KPISection: React.FC<KPISectionProps> = ({
  kpis,
  isLoading = false,
  testID = 'kpi-section',
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <SectionHeader title="Tổng quan" />
      <View style={styles.kpiGrid} testID={`${testID}-grid`}>
        {kpis.map((kpi) => (
          <View key={kpi.key} style={styles.kpiCardWrapper}>
            <KPICard
              label={kpi.label}
              value={kpi.value}
              isLoading={isLoading}
              isAlert={kpi.isAlert}
              onPress={kpi.onPress}
              testID={`kpi-card-${kpi.key}`}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  kpiCardWrapper: {
    width: '48%',
  },
});
