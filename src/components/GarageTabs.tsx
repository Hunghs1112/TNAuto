import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { Colors } from '../constants/colors';
import { Typography } from '../constants/typo';
import { spacing } from '../design-system/spacing';
import type { SavedGarage } from '../redux/slices/garageContextSlice';

interface GarageTabsProps {
  garages: SavedGarage[];
  activeGarageCode?: string;
  onChangeGarage: (garageCode: string) => void;
}

const GarageTabs: React.FC<GarageTabsProps> = ({ garages, activeGarageCode, onChangeGarage }) => {
  // Deduplicate theo garageId (fallback garageCode) để tránh hiển thị 2 tab cùng 1 gara khi đổi mã
  const uniqueGarages = useMemo(() => {
    const seen = new Set<string>();
    return garages.filter((g) => {
      const key = g.garageId ? `id:${g.garageId}` : `code:${g.garageCode}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [garages]);

  if (uniqueGarages.length <= 1) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {uniqueGarages.map((garage) => {
          const isActive = garage.garageCode === activeGarageCode;

          return (
            <Pressable
              key={garage.garageCode}
              style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}
              onPress={() => onChangeGarage(garage.garageCode)}
            >
              <Ionicons
                name={isActive ? 'business' : 'business-outline'}
                size={14}
                color={isActive ? Colors.background.light : Colors.primary}
              />
              <Text
                style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}
                numberOfLines={1}
              >
                {garage.garageName || garage.garageCode}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    maxWidth: 220,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tabInactive: {
    backgroundColor: Colors.surface.muted,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  label: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    flexShrink: 1,
  },
  labelActive: {
    color: Colors.background.light,
  },
  labelInactive: {
    color: Colors.primary,
  },
});

export default React.memo(GarageTabs);
