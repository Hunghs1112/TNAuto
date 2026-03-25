// src/screens/Product/ProductScreen.tsx (Optimized with new loading pattern)
import React, { useMemo, useCallback } from "react";
import { View, FlatList, RefreshControl, Image } from "react-native";
import Screen from "../../components/layout/Screen/Screen";
import Item from "../../components/Item";
import { QueryWrapper, ScreenLoader } from "../../components/Loading";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Product, useGetProductsQuery } from "../../services/productApi";
import { useGetCategoryByIdQuery } from "../../services/categoryApi";
import { DealerProduct, useGetDealerProductsQuery } from "../../services/dealerProductApi";
import { useGetDealerCategoryByIdQuery } from "../../services/dealerCategoryApi";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import { useRefreshQueries } from "../../hooks/useRefreshQueries";
import { ListItemSkeleton } from "../../components/SkeletonLoader";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { getPrimaryCatalogProductImageUrl } from "../../utils/catalog";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ProductScreenRouteProp = RouteProp<AppStackParamList, "Product">;
type CatalogProduct = Product | DealerProduct;

const ProductScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProductScreenRouteProp>();
  const userType = useAppSelector((state) => state.auth.userType);
  const isDealer = userType === "dealer";
  const { refreshing: autoRefreshing, onRefresh: baseOnRefresh } = useAutoRefresh({ tags: ["Product", "Category"] });

  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;

  const allProductsQuery = useGetProductsQuery(undefined, {
    skip: isDealer || !!categoryId,
  });
  const categoryQuery = useGetCategoryByIdQuery(categoryId!, {
    skip: isDealer || !categoryId,
  });
  const dealerProductsQuery = useGetDealerProductsQuery(undefined, {
    skip: !isDealer || !!categoryId,
  });
  const dealerCategoryQuery = useGetDealerCategoryByIdQuery(categoryId!, {
    skip: !isDealer || !categoryId,
  });

  const activeQuery = isDealer
    ? categoryId
      ? dealerCategoryQuery
      : dealerProductsQuery
    : categoryId
      ? categoryQuery
      : allProductsQuery;

  const { refreshing: queryRefreshing, onRefresh: queryOnRefresh } = useRefreshQueries([
    { refetch: activeQuery.refetch, isFetching: activeQuery.isFetching },
  ]);

  const actualRefreshing = autoRefreshing || queryRefreshing;

  const handleRefresh = useCallback(async () => {
    baseOnRefresh();
    await queryOnRefresh();
  }, [baseOnRefresh, queryOnRefresh]);

  const filteredProducts = useMemo(() => {
    if (isDealer) {
      if (categoryId && dealerCategoryQuery.data) {
        return dealerCategoryQuery.data.products || [];
      }

      return dealerProductsQuery.data || [];
    }

    if (categoryId && categoryQuery.data) {
      return categoryQuery.data.products || [];
    }

    return (allProductsQuery.data || []) as CatalogProduct[];
  }, [
    allProductsQuery.data,
    categoryId,
    categoryQuery.data,
    dealerCategoryQuery.data,
    dealerProductsQuery.data,
    isDealer,
  ]);

  React.useEffect(() => {
    if (filteredProducts.length > 0) {
      filteredProducts.slice(0, 10).forEach((product) => {
        const uri = getPrimaryCatalogProductImageUrl(product as any);

        if (uri) {
          Image.prefetch(uri).catch(() => {});
        }
      });
    }
  }, [filteredProducts]);

  const headerTitle =
    categoryName ||
    (isDealer ? dealerCategoryQuery.data?.name : categoryQuery.data?.name) ||
    "Sản phẩm";

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 110 + 12,
      offset: (110 + 12) * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback((item: any) => item.id.toString(), []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
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

  const renderListEmpty = useCallback(() => {
    if (activeQuery.isLoading) {
      return (
        <View>
          <ListItemSkeleton />
          <View style={{ height: 16 }} />
          <ListItemSkeleton />
          <View style={{ height: 16 }} />
          <ListItemSkeleton />
        </View>
      );
    }

    return null;
  }, [activeQuery.isLoading]);

  return (
    <Screen
      headerTitle={headerTitle}
      showBackButton
      statusBarStyle="light-content"
      useScrollView={false}
    >
      <View style={styles.whiteSection}>
        <View style={styles.body}>
          <QueryWrapper
            query={activeQuery as any}
            errorMessage={categoryId ? "Lỗi tải sản phẩm trong danh mục" : "Lỗi tải sản phẩm"}
            checkEmpty={() => filteredProducts.length === 0}
            emptyMessage={categoryId ? "Chưa có sản phẩm trong danh mục này" : "Chưa có sản phẩm nào"}
            emptyIcon="cube-outline"
            loadingComponent={
              <View style={[styles.form, { justifyContent: "center", alignItems: "center", flex: 1 }]}>
                <ScreenLoader />
              </View>
            }
            children={() => {
              const productItems = filteredProducts.map((product: CatalogProduct) => ({
                id: product.id,
                title: product.name,
                description: product.description || (product.images?.length ? `${product.images.length} ảnh` : "Xem chi tiết"),
                imageUri: getPrimaryCatalogProductImageUrl(product as any),
                onPress: () => {
                  navigation.navigate("ProductDetail", { productId: product.id });
                },
              }));

              return (
                <View style={styles.form}>
                  <FlatList
                    alwaysBounceVertical={true}
                    data={productItems}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    getItemLayout={getItemLayout}
                    ItemSeparatorComponent={renderSeparator}
                    ListEmptyComponent={renderListEmpty}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.listContent, { flexGrow: 1, paddingHorizontal: 16 }]}
                    refreshControl={<RefreshControl refreshing={actualRefreshing} onRefresh={handleRefresh} />}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={21}
                    initialNumToRender={10}
                    updateCellsBatchingPeriod={50}
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

ProductScreen.displayName = "ProductScreen";

export default React.memo(ProductScreen);
