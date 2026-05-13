import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { textStyles } from '../../design-system/typography';
import { spacing } from '../../design-system/spacing';
import { borderRadius } from '../../design-system/borders';
import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader';

interface KPICardProps {
  label: string;
  value: number;
  isLoading?: boolean;
  isAlert?: boolean;
  onPress?: () => void;
  testID?: string;
}

/**
 * KPICard Component
 * 
 * Displays a Key Performance Indicator with label and formatted value.
 * Shows skeleton loader during loading state.
 * When `isAlert` is true, renders with warning colors (amber/orange) to draw attention.
 * When `onPress` is provided, wraps the card in a Pressable with a minimum 44px touch target.
 * 
 * **Validates: Requirements 1.1, 1.5, 2.1, 2.4, 2.5, 2.6, 5.1**
 */
export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  isLoading = false,
  isAlert = false,
  onPress,
  testID,
}) => {
  // Format number with comma separator (1000 → "1,000")
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  const cardContent = (
    <View
      style={[styles.container, isAlert && styles.containerAlert]}
      testID={testID}
    >
      {isLoading ? (
        <>
          <SkeletonLoader width={60} height={32} style={styles.valueSkeleton} />
          <SkeletonLoader width="80%" height={16} />
        </>
      ) : (
        <>
          <Text
            style={[styles.value, isAlert && styles.valueAlert]}
            testID={`${testID}-value`}
          >
            {formatNumber(value)}
          </Text>
          <Text style={styles.label} testID={`${testID}-label`}>
            {label}
          </Text>
        </>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatNumber(value)}`}
        testID={`${testID}-pressable`}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  pressable: {
    // Ensure minimum 44px touch target per WCAG 2.5.5
    minHeight: 44,
  },
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
  containerAlert: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondarySoft,
  },
  value: {
    ...textStyles.h2,
    color: Colors.primary,
    marginBottom: spacing.xs,
  },
  valueAlert: {
    color: Colors.secondary,
  },
  label: {
    ...textStyles.bodySmall,
    color: Colors.text.secondary,
  },
  valueSkeleton: {
    marginBottom: spacing.xs,
  },
});
