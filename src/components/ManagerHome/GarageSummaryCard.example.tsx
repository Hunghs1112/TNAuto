import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GarageSummaryCard } from './GarageSummaryCard';
import { spacing } from '../../design-system/spacing';

/**
 * Example usage of GarageSummaryCard component
 * 
 * This file demonstrates various use cases for the GarageSummaryCard component.
 */

export const GarageSummaryCardExamples = () => {
  const handleGaragePress = () => {
    console.log('Garage card pressed - navigate to garage selection');
  };

  return (
    <View style={styles.container}>
      {/* Example 1: Complete garage information with change capability */}
      <GarageSummaryCard
        name="Garage TN Auto"
        address="123 Nguyễn Văn Linh, Quận 7, TP.HCM"
        avatarUrl="https://example.com/garage-avatar.jpg"
        bannerUrl="https://example.com/garage-banner.jpg"
        canChangeGarage={true}
        onPress={handleGaragePress}
        testID="example-complete-garage"
      />

      {/* Example 2: Garage without banner (garage_admin role) */}
      <GarageSummaryCard
        name="Garage ABC"
        address="456 Lê Văn Việt, Quận 9, TP.HCM"
        avatarUrl="https://example.com/garage-avatar-2.jpg"
        canChangeGarage={false}
        testID="example-admin-garage"
      />

      {/* Example 3: Minimal garage information */}
      <GarageSummaryCard
        name="Garage XYZ"
        canChangeGarage={false}
        testID="example-minimal-garage"
      />

      {/* Example 4: Garage with banner but no avatar */}
      <GarageSummaryCard
        name="Garage Premium"
        address="789 Võ Văn Ngân, Thủ Đức, TP.HCM"
        bannerUrl="https://example.com/garage-banner-2.jpg"
        canChangeGarage={true}
        onPress={handleGaragePress}
        testID="example-banner-only"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
    gap: spacing.base,
  },
});
