// src/screens/Profile/components/SettingsSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typo';
import { spacing } from '../../../design-system/spacing';
import { textStyles } from '../../../design-system/typography';
import { SettingsSectionProps } from '../types';
import SettingRow from './SettingRow';

const SettingsSection = ({ section }: SettingsSectionProps) => {
  return (
    <View style={styles.container}>
      {/* Section label — outside the card */}
      <Text style={styles.label}>{section.label.toUpperCase()}</Text>

      {/* Section card — groups all rows */}
      <View style={styles.card}>
        {section.items.map((item, index) => (
          <SettingRow
            key={item.id}
            item={item}
            isFirst={index === 0}
            isLast={index === section.items.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    ...textStyles.caption,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.tertiary,
    letterSpacing: 0.8,
    paddingHorizontal: spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
    overflow: 'hidden',
  },
});

export default React.memo(SettingsSection);
