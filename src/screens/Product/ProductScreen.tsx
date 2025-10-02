// src/screens/Product/ProductScreen.tsx
import React, { useEffect } from "react";
import { View, Text, StatusBar, ActivityIndicator, FlatList, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typo";
import Header from "../../components/Header/Header";
import Item from "../../components/Item/Item";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Product, useGetProductsQuery } from "../../services/productApi";
import { useDispatch } from 'react-redux';
import { setProducts, setError, setLoading } from "../../redux/slices/productSlice";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const ProductScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { refreshing, onRefresh } = useAutoRefresh();
  const { data: products = [], isLoading, error } = useGetProductsQuery();

  useEffect(() => {
    console.log('ProductScreen: Products fetched:', products); // Debug
    if (isLoading) {
      dispatch(setLoading(true));
    } else if (products.length > 0) {
      dispatch(setProducts(products));
    } else if (error) {
      console.error('ProductScreen fetch error:', error); // Debug
      dispatch(setError('Failed to load products'));
      Alert.alert('Error', 'Failed to load products');
    }
  }, [products, isLoading, error, dispatch]);

  console.log('ProductScreen debug - data:', products);
  console.log('ProductScreen debug - isLoading:', isLoading);
  console.log('ProductScreen debug - error:', error);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Sản phẩm" />
        </View>
        <View style={[styles.whiteSection, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={Colors.text.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Sản phẩm" />
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <Text>Lỗi tải sản phẩm</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const productItems = products.map((product: Product) => ({
    id: product.id,
    title: product.name,
    description: `Giá: ${product.price} - Hình: ${product.images?.length || 0}`,
    onPress: () => console.log(`Product ${product.id} pressed`),
  }));

  console.log('ProductScreen debug - productItems:', productItems);

  if (productItems.length === 0) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
        <View style={styles.redSection}>
          <Header title="Sản phẩm" />
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.body}>
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={Colors.text.secondary} />
              <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.red} />
      
      <View style={styles.redSection}>
        <Header title="Sản phẩm" />
      </View>
      
      <View style={styles.whiteSection}>
        <View style={styles.body}>
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
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
          </View>
          
          <View style={styles.bar}>
            <View style={styles.barInner} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProductScreen;