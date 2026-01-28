// src/screens/Offer/OfferScreen.tsx
import React, { useState, useCallback, useRef } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import GenericListScreen from "../../components/GenericListScreen";
import { useGetOffersQuery } from "../../services/offerApi";
import { AppStackParamList } from "../../navigation/AppNavigator";

type OfferScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Offer'>;

const OfferScreen = () => {
  const navigation = useNavigation<OfferScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const { data, isLoading, error } = useGetOffersQuery(undefined);

  // Avoid refetch/invalidate on every focus to prevent too many requests.
  // Freshness is handled globally by API_CONFIG.refetchOnMountOrArgChange (30s).
  useFocusEffect(
    useCallback(() => {
      // Only update image timestamp to avoid stale image caching.
      setImageTimestamp(Date.now());
    }, [])
  );

  return (
    <GenericListScreen
      title="Ưu đãi"
      data={data}
      isLoading={isLoading}
      error={error}
      emptyIcon="pricetag-outline"
      emptyMessage="Chưa có ưu đãi nào"
      mapDataToItems={useCallback((data: any) => {
        if (!data?.success || !data?.data) {
          return [];
        }
        
        return data.data.map((offer: any) => {
          // Lấy ảnh chính hoặc fallback về image_url
          let primaryImageUrl = offer.primary_image?.image_url || offer.image_url;
          
          // Add cache busting timestamp to image URL
          if (primaryImageUrl) {
            primaryImageUrl = `${primaryImageUrl}${primaryImageUrl.includes('?') ? '&' : '?'}_t=${imageTimestamp}`;
          }
          
          return {
            id: offer.id,
            title: offer.name,
            description: offer.service_name ? `Dịch vụ: ${offer.service_name}` : 'Ưu đãi',
            imageUri: primaryImageUrl,
            onPress: () => {
              navigation.navigate('OfferDetail', { offerId: offer.id });
            },
          };
        });
      }, [imageTimestamp, navigation])}
    />
  );
};

export default OfferScreen;