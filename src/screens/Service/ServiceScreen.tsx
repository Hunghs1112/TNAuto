// src/screens/Service/ServiceScreen.tsx
import React, { useEffect, useMemo, useCallback } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppNavigator";
import GenericListScreen from "../../components/GenericListScreen";
import { useGetServicesQuery } from "../../services";
import { useGetServiceCategoryByIdQuery } from "../../services/serviceCategoryApi";
import { useRefreshQueries } from "../../hooks/useRefreshQueries";
import { formatSecondsToDaysHours, secondsToMonths } from "../../utils/dateHelpers";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { useAppSelector } from "../../redux/hooks/useAppSelector";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ServiceScreenRouteProp = RouteProp<AppStackParamList, 'Service'>;

const ServiceScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ServiceScreenRouteProp>();
  const dispatch = useAppDispatch();
  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;
  const userType = useAppSelector((s) => s.auth.userType);
  const isDealer = userType === "dealer";

  
  
  // Nếu có categoryId, lấy services từ category API
  const categoryQuery = useGetServiceCategoryByIdQuery(categoryId!, {
    skip: !categoryId || isDealer,
  });
  
  // Nếu không có categoryId, lấy tất cả services
  const allServicesQuery = useGetServicesQuery(undefined, {
    skip: !!categoryId || isDealer,
  });

  const { refreshing, onRefresh } = useRefreshQueries([
    categoryId
      ? { refetch: categoryQuery.refetch, isFetching: categoryQuery.isFetching }
      : { refetch: allServicesQuery.refetch, isFetching: allServicesQuery.isFetching },
  ]);

  
  // Sử dụng data từ category nếu có, nếu không thì từ all services
  const isLoading = categoryId ? categoryQuery.isLoading : allServicesQuery.isLoading;
  const error = categoryId ? categoryQuery.error : allServicesQuery.error;
  
  // Transform data từ category hoặc all services
  const data = useMemo(() => {
    if (categoryId && categoryQuery.data) {
      // Data từ category API có format khác
      return {
        success: true,
        data: categoryQuery.data.services || [],
        count: categoryQuery.data.services?.length || 0,
      };
    }
    return allServicesQuery.data;
  }, [categoryId, categoryQuery.data, allServicesQuery.data]);

  // Handle pull-to-refresh: single grouped refetch via hook
  const handleRefresh = useCallback(async () => {
    await onRefresh();
  }, [onRefresh]);

  useEffect(() => {
    if (isDealer) {
      // Dealer không được phép xem/điều hướng dịch vụ.
      navigation.replace("Category" as never);
    }
  }, [isDealer, navigation]);

  const mapDataToItems = useCallback(
    (data: any) => {
      if (!data?.success || !data?.data) {
        return [];
      }

      return data.data.map((service: any) => {
        const descriptionParts = [
          service.description,
          `Thời gian ước tính: ${formatSecondsToDaysHours(service.estimated_time)}`,
        ];

        if (service.warranty_period) {
          const warrantyMonths = secondsToMonths(service.warranty_period);
          descriptionParts.push(`Thời gian bảo hành: ${warrantyMonths} tháng`);
        }

        const imageUri =
          typeof service.image_url === "string" && service.image_url.length > 0 ? service.image_url : undefined;

        return {
          id: service.id,
          title: service.name,
          description: descriptionParts.join(" - "),
          imageUri,
          onPress: () => {
            navigation.navigate("ServiceDetail", { serviceId: Number(service.id) });
          },
        };
      });
    },
    [navigation],
  );

  if (isDealer) {
    return null;
  }

  return (
    <GenericListScreen
      title={categoryName || "Dịch vụ"}
      data={data}
      isLoading={isLoading}
      error={error}
      emptyIcon="construct-outline"
      emptyMessage="Chưa có dịch vụ nào"
      refreshing={refreshing}
      onRefresh={handleRefresh}
      mapDataToItems={mapDataToItems}
    />
  );
};

export default ServiceScreen;