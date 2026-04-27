/**
 * KPISection Usage Example
 * 
 * This file demonstrates how to use the KPISection component
 * in the ManagerHomeScreen.
 */

import React from 'react';
import { View } from 'react-native';
import { KPISection } from './KPISection';
import { useManagerHomeScreen } from '../../screens/Home/useManagerHomeScreen';

/**
 * Example 1: Basic usage with hook data
 */
export const BasicUsageExample = () => {
  const { kpis, isLoading } = useManagerHomeScreen({
    isEnabled: true,
    fallbackAvailableOrders: [],
    fallbackAssignedOrders: [],
  });

  return (
    <View>
      <KPISection kpis={kpis} isLoading={isLoading} />
    </View>
  );
};

/**
 * Example 2: Usage with mock data
 */
export const MockDataExample = () => {
  const mockKPIs = [
    { key: 'pending', label: 'Đơn chờ xử lý', value: 5 },
    { key: 'processing', label: 'Đơn đang xử lý', value: 3 },
    { key: 'overdue', label: 'Đơn quá hạn', value: 2 },
    { key: 'completed', label: 'Hoàn thành hôm nay', value: 10 },
    { key: 'notifications', label: 'Thông báo chưa đọc', value: 4 },
  ];

  return (
    <View>
      <KPISection kpis={mockKPIs} isLoading={false} />
    </View>
  );
};

/**
 * Example 3: Loading state
 */
export const LoadingStateExample = () => {
  const mockKPIs = [
    { key: 'pending', label: 'Đơn chờ xử lý', value: 0 },
    { key: 'processing', label: 'Đơn đang xử lý', value: 0 },
    { key: 'overdue', label: 'Đơn quá hạn', value: 0 },
    { key: 'completed', label: 'Hoàn thành hôm nay', value: 0 },
    { key: 'notifications', label: 'Thông báo chưa đọc', value: 0 },
  ];

  return (
    <View>
      <KPISection kpis={mockKPIs} isLoading={true} />
    </View>
  );
};

/**
 * Example 4: Integration in ManagerHomeScreen
 * 
 * Replace the existing KPI grid code in ManagerHomeScreen.tsx:
 * 
 * Before:
 * ```tsx
 * <View style={styles.section}>
 *   <SectionHeader title="Tong quan hom nay" />
 *   <View style={styles.managerKpiGrid}>
 *     {kpis.map((item) => (
 *       <View key={item.key} style={styles.managerKpiCard}>
 *         <Text style={styles.managerKpiValue}>{item.value}</Text>
 *         <Text style={styles.managerKpiLabel}>{item.label}</Text>
 *       </View>
 *     ))}
 *   </View>
 * </View>
 * ```
 * 
 * After:
 * ```tsx
 * <View style={styles.section}>
 *   <KPISection kpis={kpis} isLoading={isLoading} />
 * </View>
 * ```
 */
