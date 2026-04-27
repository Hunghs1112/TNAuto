import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../design-system/spacing';
import SectionHeader from '../../screens/Home/SectionHeader';
import { KPICard } from './KPICard';

interface KPI {
  key: string;
  label: string;
  value: number;
}

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
 * 
 * **Validates: Requirements 1.1, 7.1, 7.2**
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
