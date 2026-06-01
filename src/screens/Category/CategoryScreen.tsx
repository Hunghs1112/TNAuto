// src/screens/Category/CategoryScreen.tsx (Optimized with new loading pattern)
import React, { useCallback, useState } from "react";
import { View, FlatList, RefreshControl, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
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
import { selectGarageCode, selectHasGarageContext, selectSavedGarages } from "../../redux/selectors";
import GarageTabs from "../../components/GarageTabs";
import GarageSelectionPrompt from "../../components/GarageSelectionPrompt";
import useCustomerGarageSelection from "../../hooks/useCustomerGarageSelection";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type CatalogCategory = Category | DealerCategory;

const CategoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { activateGarage } = useCustomerGarageSelection();
  const userType = useAppSelector((state) => state.auth.userType);
  const currentGarageCode = useAppSelector(selectGarageCode);
  const hasGarageContext = useAppSelector(selectHasGarageContext);
  const savedGarages = useAppSelector(selectSavedGarages);
  const isDealer = (userType === "dealer" || userType === "garage_manager" || userType === "garage_admin");
  const { refreshing, onRefresh: baseOnRefresh } = useAutoRefresh({ tags: ["Category"] });
  const categoryQuery = useGetCategoriesQuery({ garageCode: currentGarageCode }, { skip: isDealer || !hasGarageContext });
  const dealerCategoryQuery = useGetDealerCategoriesQuery(undefined, { skip: !isDealer });
  const query = isDealer ? dealerCategoryQuery : categoryQuery;
  const showGarageTabs = !isDealer && savedGarages.length > 1;
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleGarageChange = useCallback(
    async (garageCode: string) => {
      const garage = savedGarages.find((item) => item.garageCode === garageCode);

      if (!garage) {
        return;
      }

      await activateGarage(
        {
          garageId: garage.garageId,
          garageCode: garage.garageCode,
          garageName: garage.garageName,
          address: garage.address,
          avatarUrl: garage.avatarUrl,
          status: garage.status,
        },
        'tab',
      );
    },
    [activateGarage, savedGarages],
  );

  if (!isDealer && !hasGarageContext) {
    return (
      <Screen
        headerTitle="Danh mục sản phẩm"
        useScrollView={false}
        showBackButton
        safeAreaTopColor={Colors.primary}
        statusBarStyle="light-content"
      >
        <View style={styles.whiteSection}>
          <GarageSelectionPrompt onPress={() => navigation.navigate("SelectGarage")} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      headerTitle="Danh mục sản phẩm"
      useScrollView={false}
      showBackButton
      safeAreaTopColor={Colors.primary}
      statusBarStyle="light-content"
    >
      <View style={styles.whiteSection}>
        {showGarageTabs && (
          <GarageTabs
            garages={savedGarages}
            activeGarageCode={currentGarageCode}
            onChangeGarage={handleGarageChange}
          />
        )}
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
              const categoryItems = categories
                .filter((category: CatalogCategory) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase().trim();
                  return (
                    category.name?.toLowerCase().includes(q) ||
                    category.description?.toLowerCase().includes(q)
                  );
                })
                .map((category: CatalogCategory) => {
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
              });

              return (
                <View style={styles.form}>
                  {/* Search bar */}
                  <View style={catSearchStyles.searchBar}>
                    <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
                    <TextInput
                      style={catSearchStyles.searchInput}
                      value={searchInput}
                      onChangeText={setSearchInput}
                      onBlur={() => setSearchQuery(searchInput)}
                      onSubmitEditing={() => setSearchQuery(searchInput)}
                      placeholder="Tìm danh mục..."
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
                  <FlatList
                    alwaysBounceVertical={true}
                    data={categoryItems}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <Item
                        key={item.id}
                        title={item.title}
                        description={item.description}
                        imageUri={item.imageUri}
                        onPress={item.onPress}
                      />
                    )}
                    getItemLayout={(_, index) => ({
                      length: 110 + 12,
                      offset: (110 + 12) * index,
                      index,
                    })}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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

const catSearchStyles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
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

