// src/screens/Profile/components/SettingRow.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typo';
import { spacing } from '../../../design-system/spacing';
import { textStyles } from '../../../design-system/typography';
import { SettingRowProps } from '../types';

const SettingRow = ({ item, isLast }: SettingRowProps) => {
  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.row,
          pressed && styles.rowPressed,
        ]}
        onPress={item.onPress}
        android_ripple={{ color: Colors.neutral[100] }}
        accessibilityRole="button"
        accessibilityLabel={item.title}
      >
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons name={item.icon as any} size={18} color={Colors.primary} />
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>{item.title}</Text>
          {!!item.subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          )}
        </View>

        {/* Badge (optional) */}
        {!!item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}

        {/* Chevron */}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={Colors.text.tertiary}
        />
      </Pressable>

      {/* Divider — hidden on last item */}
      {!isLast && <View style={styles.divider} />}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: Colors.surface.elevated,
  },
  rowPressed: {
    backgroundColor: Colors.primarySoft,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...textStyles.body,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text.primary,
  },
  subtitle: {
    ...textStyles.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    marginRight: spacing.sm,
  },
  badgeText: {
    ...textStyles.caption,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.background.light,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.alpha.primary08,
    marginLeft: 52, // icon wrap (36) + marginRight (12) + paddingLeft (16) - 12
  },
});

export default React.memo(SettingRow);
