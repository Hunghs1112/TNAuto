// src/screens/Product/ProductScreen.tsx (Optimized with new loading pattern)
import React, { useMemo, useCallback, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { Screen } from "../../components/layout";
import { Colors } from "../../constants/colors";
import Item from "../../components/Item";
import { QueryWrapper, ScreenLoader } from "../../components/Loading";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Product, useGetProductsQuery, productApi } from "../../services/productApi";
import { useGetCategoryByIdQuery, categoryApi } from "../../services/categoryApi";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import { ListItemSkeleton } from "../../components/SkeletonLoader";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ProductScreenRouteProp = RouteProp<AppStackParamList, 'Product'>;

const ProductScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProductScreenRouteProp>();
  const dispatch = useAppDispatch();
  const { refreshing, onRefresh: baseOnRefresh } = useAutoRefresh({ tags: ['Product', 'Category'] });
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  
  // Get category filter from route params
  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;

  // Use appropriate API based on whether we have a categoryId
  const allProductsQuery = useGetProductsQuery(undefined, { 
    skip: !!categoryId,
  });
  const categoryQuery = useGetCategoryByIdQuery(categoryId!, { 
    skip: !categoryId,
  });

  // Avoid refetch/invalidate on every focus to prevent too many requests.
  // Freshness is handled globally by API_CONFIG.refetchOnMountOrArgChange (30s).
  useFocusEffect(
    useCallback(() => {
      setImageTimestamp(Date.now());
    }, [])
  );

  // Determine which query to use and get products
  const activeQuery = categoryId ? categoryQuery : allProductsQuery;

  // Use isFetching to determine actual refreshing state
  const actualRefreshing = refreshing || activeQuery.isFetching;

  // Enhanced refresh handler that refetches the active query
  const handleRefresh = useCallback(async () => {
    baseOnRefresh();
    
    const refetchPromises: Promise<any>[] = [];
    
    if (categoryId && categoryQuery.refetch) {
      refetchPromises.push(categoryQuery.refetch());
    } else if (allProductsQuery.refetch) {
      refetchPromises.push(allProductsQuery.refetch());
    }
    
    try {
      await Promise.all(refetchPromises);
    } catch (error) {
      console.error('ProductScreen: Error during refetch:', error);
    }
  }, [baseOnRefresh, categoryId, categoryQuery, allProductsQuery]);
  
  // Extract products from the appropriate source
  const filteredProducts = useMemo(() => {
    if (categoryId && categoryQuery.data) {
      // When viewing category, get products from category query
      return categoryQuery.data.products || [];
    }
    // When viewing all products, use all products query
    return allProductsQuery.data || [];
  }, [categoryId, categoryQuery.data, allProductsQuery.data]);

  // Determine the header title
  const headerTitle = categoryName || categoryQuery.data?.name || "Sản phẩm";

  // Optimized FlatList callbacks
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 110 + 12, // item minHeight + separator
      offset: (110 + 12) * index,
      index,
    }),
    []
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
    []
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
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
    >
        <View style={styles.whiteSection}>
        <View style={styles.body}>
          <QueryWrapper
            query={activeQuery}
            errorMessage={categoryId ? "Lỗi tải sản phẩm trong danh mục" : "Lỗi tải sản phẩm"}
            checkEmpty={() => filteredProducts.length === 0}
            emptyMessage={categoryId ? "Chưa có sản phẩm trong danh mục này" : "Chưa có sản phẩm nào"}
            emptyIcon="cube-outline"
            loadingComponent={
              <View style={[styles.form, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
                <ScreenLoader />
              </View>
            }
          >
            {() => {
              const productItems = filteredProducts.map((product: Product) => {
                // Add cache busting timestamp to image URL
                let imageUri = product.primary_image;
                if (imageUri) {
                  imageUri = `${imageUri}${imageUri.includes('?') ? '&' : '?'}_t=${imageTimestamp}`;
                }
                
                return {
                  id: product.id,
                  title: product.name,
                  description: product.description || (product.images?.length ? `${product.images.length} ảnh` : 'Xem chi tiết'),
                  imageUri: imageUri,
                  onPress: () => {
                    navigation.navigate('ProductDetail', { productId: product.id });
                  },
                };
              });

              return (
                <View style={styles.form}>
                  <FlatList
                    data={productItems}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    getItemLayout={getItemLayout}
                    ItemSeparatorComponent={renderSeparator}
                    ListEmptyComponent={renderListEmpty}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                      <RefreshControl refreshing={actualRefreshing} onRefresh={handleRefresh} />
                    }
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={21}
                    initialNumToRender={10}
                    updateCellsBatchingPeriod={50}
                  />
                </View>
              );
            }}
          </QueryWrapper>
        </View>
      </View>
    </Screen>
  );
};

ProductScreen.displayName = 'ProductScreen';

export default React.memo(ProductScreen);