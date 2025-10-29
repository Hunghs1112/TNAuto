// src/components/SkeletonLoader/ListItemSkeleton.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { SkeletonLoader } from './SkeletonLoader';

export const ListItemSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SkeletonLoader width={48} height={48} borderRadius={24} />
        <View style={styles.textContainer}>
          <SkeletonLoader width="70%" height={18} borderRadius={6} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="50%" height={14} borderRadius={6} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 112,
    borderRadius: 12,
    backgroundColor: Colors.background.light,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  content: {
    width: '100%',
    height: '100%',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
});

