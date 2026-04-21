// src/components/GenericListScreen/GenericListScreen.tsx
// Generic reusable component for list screens to reduce code duplication
import React, { ReactNode, useMemo, useCallback } from 'react';
import { View, Text, StatusBar, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { RootView } from '../components/layout';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../constants/colors';
import { PerformanceConfig } from '../config/performance';
import Header from './Header';
import Item from './Item';
import { sharedStyles } from '../styles/sharedStyles';
import { useAutoRefresh } from '../redux/hooks/useAutoRefresh';

export interface ListItem {
  id: number | string;
  title: string;
  description: string;
  imageUri?: string;
  onPress: () => void;
}

interface GenericListScreenProps {
  title: string;
  data?: any;
  isLoading: boolean;
  error: any;
  emptyIcon?: string;
  emptyMessage?: string;
  mapDataToItems: (data: any) => ListItem[];
  enableRefresh?: boolean;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  topContent?: ReactNode;
}

const GenericListScreen: React.FC<GenericListScreenProps> = ({
  title,
  data,
  isLoading,
  error,
  emptyIcon = 'list-outline',
  emptyMessage = 'Chưa có dữ liệu',
  mapDataToItems,
  enableRefresh = true,
  onRefresh: customOnRefresh,
  refreshing: customRefreshing,
  topContent,
}) => {
  const { refreshing: autoRefreshing, onRefresh: autoOnRefresh } = useAutoRefresh();
  
  // Use custom refresh if provided, otherwise use auto refresh
  const refreshing = customRefreshing !== undefined ? customRefreshing : autoRefreshing;
  const onRefresh = customOnRefresh || autoOnRefresh;

  // Memoize items to prevent re-computation
  const items = useMemo(() => data ? mapDataToItems(data) : [], [data, mapDataToItems]);

  // Memoize renderItem callback
  const renderItem = useCallback(({ item }: { item: ListItem }) => (
    <Item
      key={item.id}
      title={item.title}
      description={item.description}
      imageUri={item.imageUri}
      onPress={item.onPress}
    />
  ), []);

  // Memoize keyExtractor callback
  const keyExtractor = useCallback((item: ListItem) => item.id.toString(), []);

  // Optimized getItemLayout for consistent item heights (110px item + 12px separator)
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 110 + 12, // item minHeight + separator
      offset: (110 + 12) * index,
      index,
    }),
    []
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={sharedStyles.container}>
        <RootView style={{ backgroundColor: Colors.background.light }} bottomColor={Colors.background.light}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
          <Header title={title} />
          <View style={[sharedStyles.whiteSection, { paddingHorizontal: 16 }]}>
            {topContent}
            <View style={sharedStyles.centeredContent}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          </View>
        </RootView>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={sharedStyles.container}>
        <RootView style={{ backgroundColor: Colors.background.light }} bottomColor={Colors.background.light}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
          <Header title={title} />
          <View style={[sharedStyles.whiteSection, { paddingHorizontal: 16 }]}>
            {topContent}
            <View style={sharedStyles.body}>
              <View style={sharedStyles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.primary} />
                <Text style={sharedStyles.errorText}>Lỗi tải dữ liệu</Text>
              </View>
            </View>
          </View>
        </RootView>
      </View>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <View style={sharedStyles.container}>
        <RootView style={{ backgroundColor: Colors.background.light }} bottomColor={Colors.background.light}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
          <Header title={title} />
          <View style={[sharedStyles.whiteSection, { paddingHorizontal: 16 }]}>
            {topContent}
            <View style={sharedStyles.body}>
              <View style={sharedStyles.emptyContainer}>
                <Ionicons name={emptyIcon} size={48} color={Colors.primary} />
                <Text style={sharedStyles.emptyText}>{emptyMessage}</Text>
              </View>
            </View>
          </View>
        </RootView>
      </View>
    );
  }

  // List state
  return (
    <View style={sharedStyles.container}>
      <RootView style={{ backgroundColor: Colors.background.light }} bottomColor={Colors.background.light}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <Header title={title} />
        
        <View style={[sharedStyles.whiteSection, { paddingHorizontal: 16 }]}>
          {topContent}
          <View style={sharedStyles.body}>
            <View style={sharedStyles.form}>
              <FlatList
                alwaysBounceVertical={true}
                data={items}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[sharedStyles.listContent, { flexGrow: 1 }]}
                refreshControl={
                  enableRefresh ? (
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  ) : undefined
                }
                initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
                maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
                windowSize={PerformanceConfig.flatList.windowSize}
                removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
                updateCellsBatchingPeriod={PerformanceConfig.flatList.updateCellsBatchingPeriod}
              />
            </View>
          </View>
        </View>
      </RootView>
    </View>
  );
};

GenericListScreen.displayName = 'GenericListScreen';

export default React.memo(GenericListScreen);
