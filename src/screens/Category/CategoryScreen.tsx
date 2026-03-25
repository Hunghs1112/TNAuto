// src/screens/Category/CategoryScreen.tsx (Optimized with new loading pattern)
import React, { useCallback, useMemo } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { Screen } from "../../components/layout";
import { Colors } from "../../constants/colors";
import Item from "../../components/Item";
import { QueryWrapper, ScreenLoader } from "../../components/Loading";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Category, useGetCategoriesQuery } from "../../services/categoryApi";
import { DealerCategory, useGetDealerCategoriesQuery } from "../../services/dealerCategoryApi";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import { PerformanceConfig } from "../../config/performance";
import { useAppSelector } from "../../redux/hooks/useAppSelector";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type CatalogCategory = Category | DealerCategory;

const CategoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const userType = useAppSelector((state) => state.auth.userType);
  const isDealer = userType === "dealer";
  const { refreshing, onRefresh: baseOnRefresh } = useAutoRefresh({ tags: ["Category"] });
  const categoryQuery = useGetCategoriesQuery(undefined, { skip: isDealer });
  const dealerCategoryQuery = useGetDealerCategoriesQuery(undefined, { skip: !isDealer });
  const query = isDealer ? dealerCategoryQuery : categoryQuery;

  const actualRefreshing = refreshing || query.isFetching;

  const handleRefresh = useCallback(async () => {
    baseOnRefresh();

    if (query.refetch) {
      try {
        await query.refetch();
      } catch (error) {
        console.error("CategoryScreen: Error during refetch:", error);
      }
    }
  }, [baseOnRefresh, query]);

  return (
    <Screen
      headerTitle="Danh mục sản phẩm"
      useScrollView={false}
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
    >
      <View style={styles.whiteSection}>
        <View style={styles.body}>
          <QueryWrapper
            query={query as any}
            errorMessage="Lỗi tải danh mục sản phẩm"
            checkEmpty={(categories) => categories.length === 0}
            emptyMessage="Chưa có danh mục nào"
            emptyIcon="grid-outline"
            loadingComponent={
              <View style={[styles.form, { justifyContent: "center", alignItems: "center", flex: 1 }]}>
                <ScreenLoader />
              </View>
            }
            children={(categories: CatalogCategory[]) => {
              const categoryItems = useMemo(
                () =>
                  categories.map((category: CatalogCategory) => {
                    const descriptionParts = [
                      category.description || "Xem tất cả sản phẩm trong danh mục này",
                    ];

                    if (category.product_count !== undefined && category.product_count !== null) {
                      descriptionParts.push(`${category.product_count} sản phẩm`);
                    }

                    return {
                      id: category.id,
                      title: category.name,
                      description: descriptionParts.join(" - "),
                      imageUri: category.image_url ? category.image_url : undefined,
                      onPress: () => {
                        navigation.navigate("Product", {
                          categoryId: category.id,
                          categoryName: category.name,
                        });
                      },
                    };
                  }),
                [categories, navigation],
              );

              const keyExtractor = useCallback((item: (typeof categoryItems)[0]) => item.id.toString(), []);

              const renderItem = useCallback(
                ({ item }: { item: (typeof categoryItems)[0] }) => (
                  <Item
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    imageUri={item.imageUri}
                    onPress={item.onPress}
                  />
                ),
                [],
              );

              const renderSeparator = useCallback(() => <View style={{ height: 12 }} />, []);

              const getItemLayout = useCallback(
                (_: any, index: number) => ({
                  length: 110 + 12,
                  offset: (110 + 12) * index,
                  index,
                }),
                [],
              );

              return (
                <View style={styles.form}>
                  <FlatList
                    alwaysBounceVertical={true}
                    data={categoryItems}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    getItemLayout={getItemLayout}
                    ItemSeparatorComponent={renderSeparator}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.listContent, { flexGrow: 1, paddingHorizontal: 16 }]}
                    refreshControl={<RefreshControl refreshing={actualRefreshing} onRefresh={handleRefresh} />}
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

CategoryScreen.displayName = "CategoryScreen";

export default React.memo(CategoryScreen);
