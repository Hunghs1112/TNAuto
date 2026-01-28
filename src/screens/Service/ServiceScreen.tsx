// src/screens/Service/ServiceScreen.tsx
import React, { useMemo, useCallback, useState, useRef } from "react";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppNavigator";
import GenericListScreen from "../../components/GenericListScreen";
import { useGetServicesQuery } from "../../services";
import { useGetServiceCategoryByIdQuery } from "../../services/serviceCategoryApi";
import { formatSecondsToDaysHours, secondsToMonths } from "../../utils/dateHelpers";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ServiceScreenRouteProp = RouteProp<AppStackParamList, 'Service'>;

const ServiceScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ServiceScreenRouteProp>();
  const dispatch = useAppDispatch();
  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;
  const [refreshing, setRefreshing] = useState(false);
  
  // Image cache busting timestamp - use state to trigger re-render
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  
  // Nếu có categoryId, lấy services từ category API
  const categoryQuery = useGetServiceCategoryByIdQuery(categoryId!, {
    skip: !categoryId,
  });
  
  // Nếu không có categoryId, lấy tất cả services
  const allServicesQuery = useGetServicesQuery(undefined, {
    skip: !!categoryId,
  });

  // Avoid refetch/invalidate on every focus to prevent too many requests.
  // Freshness is handled globally by API_CONFIG.refetchOnMountOrArgChange (30s).
  useFocusEffect(
    useCallback(() => {
      setImageTimestamp(Date.now());
    }, [])
  );
  
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

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate service tags to clear cache first
      dispatch(serviceApi.util.invalidateTags(['Service']));
      if (categoryId) {
        dispatch(serviceCategoryApi.util.invalidateTags([{ type: 'ServiceCategory', id: categoryId.toString() }]));
      }
      // Wait a bit for cache invalidation to take effect
      await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
      
      // Refetch the appropriate query based on whether we have a categoryId
      if (categoryId) {
        await categoryQuery.refetch();
      } else {
        await allServicesQuery.refetch();
      }
      
      // Update image timestamp to force reload after refetch completes
      setImageTimestamp(Date.now());
    } catch (error) {
      console.error('Error refreshing services:', error);
    } finally {
      setRefreshing(false);
    }
  }, [categoryId, categoryQuery, allServicesQuery, dispatch]);

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
      mapDataToItems={useCallback((data: any) => {
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
          
          // Add cache busting timestamp to image URL
          const imageUri = service.image_url 
            ? `${service.image_url}${service.image_url.includes('?') ? '&' : '?'}_t=${imageTimestamp}`
            : undefined;
          
          return {
            id: service.id,
            title: service.name,
            description: descriptionParts.join(' - '),
            imageUri: imageUri,
            onPress: () => {
              navigation.navigate('ServiceDetail', { serviceId: Number(service.id) });
            },
          };
        });
      }, [imageTimestamp, navigation])}
    />
  );
};

export default ServiceScreen;