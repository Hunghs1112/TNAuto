import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, FlatList, RefreshControl, Image, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Screen } from "../../components/layout";
import { Colors } from "../../constants/colors";
import Item from "../../components/Item";
import { QueryWrapper, ScreenLoader } from "../../components/Loading";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { styles } from "./styles";
import { useAutoRefresh } from "../../redux/hooks/useAutoRefresh";
import { PerformanceConfig } from "../../config/performance";
import { useGetServiceCategoriesQuery, ServiceCategory } from "../../services/serviceCategoryApi";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { selectGarageCode, selectHasGarageContext, selectSavedGarages } from "../../redux/selectors";
import GarageTabs from "../../components/GarageTabs";
import GarageSelectionPrompt from "../../components/GarageSelectionPrompt";
import useCustomerGarageSelection from "../../hooks/useCustomerGarageSelection";
import { Ionicons } from "@react-native-vector-icons/ionicons";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const ServiceCategoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { activateGarage } = useCustomerGarageSelection();
  const { refreshing, onRefresh: baseOnRefresh } = useAutoRefresh({ tags: ['ServiceCategory'] });
  const userType = useAppSelector((state) => state.auth.userType);
  const currentGarageCode = useAppSelector(selectGarageCode);
  const hasGarageContext = useAppSelector(selectHasGarageContext);
  const savedGarages = useAppSelector(selectSavedGarages);
  const query = useGetServiceCategoriesQuery({ garageCode: currentGarageCode }, { skip: userType === "dealer" || !hasGarageContext });
  const showGarageTabs = userType !== "dealer" && savedGarages.length > 1;
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Use isFetching to determine actual refreshing state
  const actualRefreshing = refreshing || query.isFetching;

  useEffect(() => {
    if (userType === "dealer") {
      // Dealer không được phép xem/đặt dịch vụ.
      navigation.replace("Category");
    }
  }, [userType, navigation]);

  const imageUrls = useMemo(
    () => (query.data ?? []).map((c: any) => c.image_url).filter((u: any): u is string => typeof u === 'string' && u.length > 0),
    [query.data],
  );

  // Tính categoryItems ở level component — không tính lại trong children callback mỗi render
  const categoryItems = useMemo(
    () =>
      (query.data ?? [])
        .filter((category: ServiceCategory) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase().trim();
          return (
            category.name?.toLowerCase().includes(q) ||
            category.description?.toLowerCase().includes(q)
          );
        })
        .map((category: ServiceCategory) => {
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
              categoryName: category.name,
            });
          },
        };
      }),
    [query.data, navigation],
  );

  const renderCategoryItem = useCallback(
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

  const getItemLayout = useCallback(
    (_: any, index: number) => ({ length: 110 + 12, offset: (110 + 12) * index, index }),
    [],
  );

  useEffect(() => {
    imageUrls.slice(0, 12).forEach((url) => {
      Image.prefetch(url).catch(() => {});
    });
  }, [imageUrls]);

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

  if (userType === "dealer") {
    return null;
  }

  if (!hasGarageContext) {
    return (
      <Screen
        headerTitle="Danh mục dịch vụ"
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
      headerTitle="Danh mục dịch vụ"
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
              return (
                <View style={styles.form}>
                  {/* Search bar */}
                  <View style={svcCatSearchStyles.searchBar}>
                    <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
                    <TextInput
                      style={svcCatSearchStyles.searchInput}
                      value={searchInput}
                      onChangeText={setSearchInput}
                      onBlur={() => setSearchQuery(searchInput)}
                      onSubmitEditing={() => setSearchQuery(searchInput)}
                      placeholder="Tìm danh mục dịch vụ..."
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
                    renderItem={renderCategoryItem}
                    getItemLayout={getItemLayout}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.listContent, { flexGrow: 1, paddingHorizontal: 16 }]}
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

const svcCatSearchStyles = StyleSheet.create({
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
