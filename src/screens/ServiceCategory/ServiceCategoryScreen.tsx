// src/screens/ServiceCategory/ServiceCategoryScreen.tsx
import React, { useCallback, useEffect, useMemo } from "react";
import { View, FlatList, RefreshControl, Image } from "react-native";
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
              const categoryItems = categories.map((category: ServiceCategory) => {
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
                      categoryName: category.name 
                    });
                  },
                };
              });

              return (
                <View style={styles.form}>
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
