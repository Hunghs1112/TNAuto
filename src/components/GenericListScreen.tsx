// src/components/GenericListScreen/GenericListScreen.tsx
// Generic reusable component for list screens to reduce code duplication
import React, { useMemo, useCallback } from 'react';
import { View, Text, StatusBar, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { RootView } from '../components/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
}

const GenericListScreen: React.FC<GenericListScreenProps> = React.memo(({
  title,
  data,
  isLoading,
  error,
  emptyIcon = 'list-outline',
  emptyMessage = 'Chưa có dữ liệu',
  mapDataToItems,
  enableRefresh = true,
}) => {
  const { refreshing, onRefresh } = useAutoRefresh();

  // Memoize items to prevent re-computation
  const items = useMemo(() => data ? mapDataToItems(data) : [], [data, mapDataToItems]);

  // Memoize renderItem callback
  const renderItem = useCallback(({ item }: { item: ListItem }) => (
    <Item
      key={item.id}
      title={item.title}
      description={item.description}
      onPress={item.onPress}
    />
  ), []);

  // Memoize keyExtractor callback
  const keyExtractor = useCallback((item: ListItem) => item.id.toString(), []);

  // Loading state
  if (isLoading) {
    return (
      <View style={sharedStyles.container}>
        <RootView style={sharedStyles.root}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
          <Header title={title} />
          <View style={[sharedStyles.whiteSection, sharedStyles.centeredContent]}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </RootView>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={sharedStyles.container}>
        <RootView style={sharedStyles.root}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
          <Header title={title} />
          <View style={sharedStyles.whiteSection}>
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
        <RootView style={sharedStyles.root}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
          <Header title={title} />
          <View style={sharedStyles.whiteSection}>
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
      <RootView style={sharedStyles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <Header title={title} />
        
        <View style={sharedStyles.whiteSection}>
          <View style={sharedStyles.body}>
            <View style={sharedStyles.form}>
              <FlatList
                data={items}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                showsVerticalScrollIndicator={false}
                style={sharedStyles.listContainer}
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
            
            <View style={sharedStyles.bar}>
              <View style={sharedStyles.barInner} />
            </View>
          </View>
        </View>
      </RootView>
    </View>
  );
});

GenericListScreen.displayName = 'GenericListScreen';

export default GenericListScreen;

