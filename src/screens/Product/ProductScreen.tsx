// src/screens/Product/ProductScreen.tsx (Optimized with new loading pattern)
import React, { useMemo } from "react";
import { View, FlatList, RefreshControl, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  console.log('ProductScreen: Rendering', {
    isLoading: query.isLoading,
    totalProducts: query.data?.length,
    filteredCount: filteredProducts.length,
    categoryId,
    categoryName
  });

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
      
      <View style={styles.redSection}>
        <Header title={headerTitle} />
      </View>
      
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
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <Item
                        key={item.id}
                        title={item.title}
                        description={item.description}
                        onPress={item.onPress}
                      />
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                    showsVerticalScrollIndicator={false}
                    style={styles.servicesContainer}
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
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
    </SafeAreaView>
  );
};

export default ProductScreen;