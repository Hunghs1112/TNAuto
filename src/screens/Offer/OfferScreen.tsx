// src/screens/Offer/OfferScreen.tsx
import React from "react";
import GenericListScreen from "../../components/GenericListScreen";
import { useGetOffersQuery } from "../../services/offerApi";

const OfferScreen = () => {
  const { data, isLoading, error } = useGetOffersQuery();

  return (
    <GenericListScreen
      title="Ưu đãi"
      data={data}
      isLoading={isLoading}
      error={error}
      emptyIcon="pricetag-outline"
      emptyMessage="Chưa có ưu đãi nào"
      mapDataToItems={(data) => {
        if (!data?.success || !data?.data) {
          return [];
        }
        
        return data.data.map((offer: any) => ({
          id: offer.id,
          title: offer.name,
          description: `Dịch vụ: ${offer.service_name}`,
          onPress: () => console.log(`Offer ${offer.id} pressed`),
        }));
      }}
    />
  );
};

export default OfferScreen;