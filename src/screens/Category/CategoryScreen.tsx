// src/screens/Category/CategoryScreen.tsx (Optimized with new loading pattern)
import React from "react";
import { View, FlatList, RefreshControl, StatusBar } from "react-native";
import { RootView } from "../../components/layout";
import { Colors } from "../../constants/colors";
import Header from "../../components/Header";
import Item from "../../components/Item";
import { QueryWrapper, ScreenLoader, ErrorView, EmptyView } from "../../components/Loading";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Category, useGetCategoriesQuery } from "../../services/categoryApi";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const CategoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { refreshing, onRefresh } = useAutoRefresh({ tags: ['Category'] });
  const query = useGetCategoriesQuery();

  console.log('CategoryScreen: Rendering with query state:', {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    categoriesCount: query.data?.length
  });

  return (
    <View style={styles.container}>
      <RootView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <Header title="Danh mục sản phẩm" />
        
        <View style={styles.whiteSection}>
        <View style={styles.body}>
          <QueryWrapper
            query={query}
            errorMessage="Lỗi tải danh mục sản phẩm"
            checkEmpty={(categories) => categories.length === 0}
            emptyMessage="Chưa có danh mục nào"
            emptyIcon="grid-outline"
            loadingComponent={
              <View style={[styles.form, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
                <ScreenLoader />
              </View>
            }
            children={(categories: Category[]) => {
              const categoryItems = categories.map((category: Category) => ({
                id: category.id,
                title: category.name,
                description: category.description || 'Xem tất cả sản phẩm trong danh mục này',
                onPress: () => {
                  console.log(`Navigate to Product with category ${category.id}`);
                  navigation.navigate('Product', { 
                    categoryId: category.id, 
                    categoryName: category.name 
                  });
                },
              }));

              return (
                <View style={styles.form}>
                  <FlatList
                    data={categoryItems}
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
                    style={styles.categoriesContainer}
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                  />
                </View>
              );
            }}
          />
          
          <View style={styles.bar}>
            <View style={styles.barInner} />
          </View>
        </View>
      </View>
      </RootView>
    </View>
  );
};

export default CategoryScreen;

