import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { Colors } from '../constants/colors';
import { Typography } from '../constants/typo';
import { spacing } from '../design-system/spacing';

interface GarageBadgeProps {
  garageName?: string | null;
  variant?: 'light' | 'soft';
}

const GarageBadge: React.FC<GarageBadgeProps> = ({ garageName, variant = 'soft' }) => {
  if (!garageName?.trim()) {
    return null;
  }

  const isLight = variant === 'light';

  return (
    <View style={[styles.badge, isLight ? styles.badgeLight : styles.badgeSoft]}>
      <Ionicons
        name="business-outline"
        size={12}
        color={isLight ? Colors.background.light : Colors.primary}
      />
      <Text
        style={[styles.badgeText, isLight ? styles.badgeTextLight : styles.badgeTextSoft]}
        numberOfLines={1}
      >
        {garageName.trim()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: '100%',
  },
  badgeSoft: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.alpha.primary12,
  },
  badgeLight: {
    backgroundColor: Colors.alpha.white18,
    borderWidth: 1,
    borderColor: Colors.alpha.white30,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    flexShrink: 1,
  },
  badgeTextSoft: {
    color: Colors.primary,
  },
  badgeTextLight: {
    color: Colors.background.light,
  },
});

export default React.memo(GarageBadge);
