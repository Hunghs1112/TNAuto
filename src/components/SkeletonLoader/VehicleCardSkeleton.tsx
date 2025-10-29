// src/components/SkeletonLoader/VehicleCardSkeleton.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { SkeletonLoader } from './SkeletonLoader';

export const VehicleCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <SkeletonLoader width={44} height={44} borderRadius={22} />
          <SkeletonLoader width={120} height={24} borderRadius={8} style={{ marginLeft: 12 }} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        <SkeletonLoader width={88} height={88} borderRadius={44} />
        <View style={styles.info}>
          <SkeletonLoader width="80%" height={20} borderRadius={6} style={{ marginBottom: 12 }} />
          <SkeletonLoader width="70%" height={18} borderRadius={6} style={{ marginBottom: 12 }} />
          <SkeletonLoader width="60%" height={18} borderRadius={6} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.red,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginVertical: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 20,
  },
});

