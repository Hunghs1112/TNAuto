// src/screens/Offer/OfferScreen.tsx
import React, { useCallback, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import GenericListScreen from "../../components/GenericListScreen";
import { useGetOffersQuery } from "../../services/offerApi";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { setOffers } from "../../redux/slices/offersSlice";

type OfferScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Offer'>;

const OfferScreen = () => {
  const navigation = useNavigation<OfferScreenNavigationProp>();
  const dispatch = useAppDispatch();

  const { data, isLoading, error } = useGetOffersQuery(undefined);

  // Sync offers to redux slice when fetched – for badge count
  useEffect(() => {
    if (data?.success && data?.data) {
      dispatch(setOffers({ data: data.data, count: data.count }));
    }
  }, [data, dispatch]);

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
          const primaryImageUrl = offer.primary_image?.image_url || offer.image_url;
          
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
      }, [navigation])}
    />
  );
};

export default OfferScreen;
