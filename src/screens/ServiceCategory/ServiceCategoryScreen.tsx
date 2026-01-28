// src/screens/ServiceCategory/ServiceCategoryScreen.tsx
import React, { useCallback, useMemo } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { Screen } from "../../components/layout";
import { Colors } from "../../constants/colors";
import Item from "../../components/Item";
import { QueryWrapper, ScreenLoader, ErrorView } from "../../components/Loading";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import { PerformanceConfig } from "../../config/performance";
import { useGetServiceCategoriesQuery, ServiceCategory } from "../../services/serviceCategoryApi";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const ServiceCategoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh: baseOnRefresh } = useAutoRefresh({ tags: ['ServiceCategory'] });
  const query = useGetServiceCategoriesQuery();

  // Use isFetching to determine actual refreshing state
  const actualRefreshing = refreshing || query.isFetching;

  // Enhanced refresh handler that refetches the query
  const handleRefresh = useCallback(async () => {
    baseOnRefresh();
    
    if (query.refetch) {
      try {
        await query.refetch();
      } catch (error) {
        console.error('ServiceCategoryScreen: Error during refetch:', error);
      }
    }
  }, [baseOnRefresh, query]);

  return (
    <Screen
      headerTitle="Danh mục dịch vụ"
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
    >
      <View style={styles.whiteSection}>
        <View style={styles.body}>
          <QueryWrapper
            query={query}
            errorMessage="Lỗi tải danh mục dịch vụ"
            checkEmpty={(categories) => categories.length === 0}
            emptyMessage="Chưa có danh mục nào"
            emptyIcon="grid-outline"
            loadingComponent={
              <View style={[styles.form, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
                <ScreenLoader />
              </View>
            }
            children={(categories: ServiceCategory[]) => {
              const categoryItems = useMemo(() => categories.map((category: ServiceCategory) => {
                const descriptionParts = [
                  category.description || 'Xem tất cả dịch vụ trong danh mục này',
                ];
                
                if (category.service_count !== undefined && category.service_count !== null) {
                  descriptionParts.push(`${category.service_count} dịch vụ`);
                }
                
                return {
                  id: category.id,
                  title: category.name,
                  description: descriptionParts.join(' - '),
                  imageUri: category.image_url || undefined,
                  onPress: () => {
                    navigation.navigate('Service', { 
                      categoryId: category.id, 
                      categoryName: category.name 
                    });
                  },
                };
              }), [categories, navigation]);

              const keyExtractor = useCallback((item: typeof categoryItems[0]) => item.id.toString(), [categoryItems]);
              
              const renderItem = useCallback(({ item }: { item: typeof categoryItems[0] }) => (
                <Item
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  imageUri={item.imageUri}
                  onPress={item.onPress}
                />
              ), []);

              const renderSeparator = useCallback(() => <View style={{ height: 12 }} />, []);

              const getItemLayout = useCallback(
                (_: any, index: number) => ({
                  length: 110 + 12,
                  offset: (110 + 12) * index,
                  index,
                }),
                []
              );

              return (
                <View style={styles.form}>
                  <FlatList
                    data={categoryItems}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    getItemLayout={getItemLayout}
                    ItemSeparatorComponent={renderSeparator}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                      <RefreshControl refreshing={actualRefreshing} onRefresh={handleRefresh} />
                    }
                    initialNumToRender={PerformanceConfig.flatList.initialNumToRender}
                    maxToRenderPerBatch={PerformanceConfig.flatList.maxToRenderPerBatch}
                    windowSize={PerformanceConfig.flatList.windowSize}
                    removeClippedSubviews={PerformanceConfig.flatList.removeClippedSubviews}
                    updateCellsBatchingPeriod={PerformanceConfig.flatList.updateCellsBatchingPeriod}
                  />
                </View>
              );
            }}
          />
        </View>
      </View>
    </Screen>
  );
};

ServiceCategoryScreen.displayName = 'ServiceCategoryScreen';

export default React.memo(ServiceCategoryScreen);

