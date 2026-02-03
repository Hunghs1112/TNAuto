import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoryScreen from "../../screens/Category/CategoryScreen";
import ProductScreen from "../../screens/Product/ProductScreen";
import ProductDetailScreen from "../../screens/ProductDetail/ProductDetailScreen";

export type CategoryStackParamList = {
  Category: undefined;
  Product: { categoryId?: number; categoryName?: string } | undefined;
  ProductDetail: { productId: number };
};

const Stack = createNativeStackNavigator<CategoryStackParamList>();

export default function CategoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}


