import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { textStyles } from '../../design-system/typography';
import { spacing } from '../../design-system/spacing';
import { borderRadius } from '../../design-system/borders';
import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader';

interface KPICardProps {
  label: string;
  value: number;
  isLoading?: boolean;
  testID?: string;
}

/**
 * KPICard Component
 * 
 * Displays a Key Performance Indicator with label and formatted value.
 * Shows skeleton loader during loading state.
 * 
 * **Validates: Requirements 1.1, 1.5, 5.1**
 */
export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  isLoading = false,
  testID,
}) => {
  // Format number with comma separator (1000 → "1,000")
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  return (
    <View style={styles.container} testID={testID}>
      {isLoading ? (
        <>
          <SkeletonLoader width={60} height={32} style={styles.valueSkeleton} />
          <SkeletonLoader width="80%" height={16} />
        </>
      ) : (
        <>
          <Text style={styles.value} testID={`${testID}-value`}>
            {formatNumber(value)}
          </Text>
          <Text style={styles.label} testID={`${testID}-label`}>
            {label}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    padding: spacing.base,
    minHeight: 90,
    justifyContent: 'center',
    shadowColor: Colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  value: {
    ...textStyles.h2,
    color: Colors.primary,
    marginBottom: spacing.xs,
  },
  label: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
  },
  valueSkeleton: {
    marginBottom: spacing.xs,
  },
});
