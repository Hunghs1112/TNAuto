// src/components/GenericListScreen/GenericListScreen.tsx
// Generic reusable component for list screens to reduce code duplication
import React, { ReactNode, useMemo, useCallback, useState } from 'react';
import { View, Text, StatusBar, ActivityIndicator, FlatList, RefreshControl, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { RootView } from '../components/layout';
import { Colors } from '../constants/colors';
import { PerformanceConfig } from '../config/performance';
import Header from './Header';
import Item from './Item';
import ErrorView from './Loading/ErrorView';
import { sharedStyles } from '../styles/sharedStyles';
import { useAutoRefresh } from '../redux/hooks/useAutoRefresh';
import { Ionicons } from '@react-native-vector-icons/ionicons';

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
  /** Placeholder cho search bar. Nếu không truyền thì không hiển thị search bar. */
  searchPlaceholder?: string;
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
  searchPlaceholder,
}) => {
  const { refreshing: autoRefreshing, onRefresh: autoOnRefresh } = useAutoRefresh();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use custom refresh if provided, otherwise use auto refresh
  const refreshing = customRefreshing !== undefined ? customRefreshing : autoRefreshing;
  const onRefresh = customOnRefresh || autoOnRefresh;

  // Memoize items to prevent re-computation
  const allItems = useMemo(() => data ? mapDataToItems(data) : [], [data, mapDataToItems]);

  // Filter theo search query (chỉ áp dụng khi out focus)
  const items = useMemo(() => {
    if (!searchPlaceholder || !searchQuery.trim()) return allItems;
    const q = searchQuery.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q),
    );
  }, [allItems, searchQuery, searchPlaceholder]);

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

  // Error state — dùng ErrorView có nút retry nhất quán với các màn khác
  if (error) {
    return (
      <View style={sharedStyles.container}>
        <RootView style={{ backgroundColor: Colors.background.light }} bottomColor={Colors.background.light}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
          <Header title={title} />
          <View style={[sharedStyles.whiteSection, { paddingHorizontal: 16 }]}>
            {topContent}
            <View style={sharedStyles.body}>
              <ErrorView
                message="Lỗi tải dữ liệu"
                onRetry={typeof onRefresh === 'function' ? onRefresh : undefined}
                icon="alert-circle-outline"
              />
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
              {searchPlaceholder ? (
                <View style={genericSearchStyles.searchBar}>
                  <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
                  <TextInput
                    style={genericSearchStyles.searchInput}
                    value={searchInput}
                    onChangeText={setSearchInput}
                    onBlur={() => setSearchQuery(searchInput)}
                    onSubmitEditing={() => setSearchQuery(searchInput)}
                    placeholder={searchPlaceholder}
                    placeholderTextColor={Colors.text.secondary}
                    returnKeyType="search"
                  />
                  {searchInput ? (
                    <TouchableOpacity
                      onPress={() => { setSearchInput(''); setSearchQuery(''); }}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="close-circle" size={16} color={Colors.text.secondary} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
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

const genericSearchStyles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
});
