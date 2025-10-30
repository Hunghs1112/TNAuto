// src/screens/Product/ProductScreen.tsx (Optimized with new loading pattern)
import React, { useMemo, useCallback } from "react";
import { View, FlatList, RefreshControl, StatusBar } from "react-native";
import { RootView } from "../../components/layout";
import { Colors } from "../../constants/colors";
import Header from "../../components/Header";
import Item from "../../components/Item";
import { QueryWrapper, ScreenLoader } from "../../components/Loading";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Product, useGetProductsQuery } from "../../services/productApi";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import { ListItemSkeleton } from "../../components/SkeletonLoader";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ProductScreenRouteProp = RouteProp<AppStackParamList, 'Product'>;

const ProductScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProductScreenRouteProp>();
  const { refreshing, onRefresh } = useAutoRefresh({ tags: ['Product'] });
  const query = useGetProductsQuery();
  
  // Get category filter from route params
  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;

  // Determine the header title
  const headerTitle = categoryName || "Sản phẩm";

  // Filter products by category if categoryId is provided
  const filteredProducts = useMemo(() => {
    if (!query.data) return [];
    if (categoryId) {
      return query.data.filter((product: Product) => product.category_id === categoryId);
    }
    return query.data;
  }, [query.data, categoryId]);

  // Optimized FlatList callbacks
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 112 + 16, // item height + separator
      offset: (112 + 16) * index,
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
        imageUri={item.image}
        onPress={item.onPress}
      />
    ),
    []
  );

  const renderSeparator = useCallback(() => <View style={{ height: 16 }} />, []);

  const renderListEmpty = useCallback(() => {
    if (query.isLoading) {
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
  }, [query.isLoading]);

  console.log('ProductScreen: Rendering', {
    isLoading: query.isLoading,
    totalProducts: query.data?.length,
    filteredCount: filteredProducts.length,
    categoryId,
    categoryName
  });

  return (
    <View style={styles.container}>
      <RootView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <Header title={headerTitle} />
        
        <View style={styles.whiteSection}>
        <View style={styles.body}>
          <QueryWrapper
            query={query}
            errorMessage="Lỗi tải sản phẩm"
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
              const productItems = filteredProducts.map((product: Product) => ({
                id: product.id,
                title: product.name,
                description: product.description || (product.images?.length ? `${product.images.length} ảnh` : 'Xem chi tiết'),
                onPress: () => {
                  console.log(`Navigate to ProductDetail for product ${product.id}`);
                  navigation.navigate('ProductDetail', { product });
                },
                image: product.primary_image, // Use primary_image from backend
              }));

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
                    style={styles.servicesContainer}
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
          
          <View style={styles.bar}>
            <View style={styles.barInner} />
          </View>
        </View>
      </View>
      </RootView>
    </View>
  );
};

export default ProductScreen;