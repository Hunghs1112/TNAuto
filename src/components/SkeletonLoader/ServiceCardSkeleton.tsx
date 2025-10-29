// src/components/SkeletonLoader/ServiceCardSkeleton.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { SkeletonLoader } from './SkeletonLoader';

export const ServiceCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.serviceInfo}>
            <SkeletonLoader width={48} height={48} borderRadius={24} />
            <View style={styles.textContainer}>
              <SkeletonLoader width="70%" height={20} borderRadius={6} style={{ marginBottom: 8 }} />
              <SkeletonLoader width="50%" height={16} borderRadius={6} style={{ marginBottom: 8 }} />
              <SkeletonLoader width={80} height={24} borderRadius={12} />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.dateItem}>
            <SkeletonLoader width={28} height={28} borderRadius={14} />
            <SkeletonLoader width="60%" height={16} borderRadius={6} style={{ marginLeft: 8 }} />
          </View>
          <View style={styles.dateItem}>
            <SkeletonLoader width={28} height={28} borderRadius={14} />
            <SkeletonLoader width="60%" height={16} borderRadius={6} style={{ marginLeft: 8 }} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    width: '100%',
    minHeight: 180,
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});

