// src/screens/Service/ServiceScreen.tsx
import React from "react";
import GenericListScreen from "../../components/GenericListScreen";
import { useGetServicesQuery } from "../../services";

const ServiceScreen = () => {
  const { data, isLoading, error } = useGetServicesQuery();

  return (
    <GenericListScreen
      title="Dịch vụ"
      data={data}
      isLoading={isLoading}
      error={error}
      emptyIcon="construct-outline"
      emptyMessage="Chưa có dịch vụ nào"
      mapDataToItems={(data) => {
        if (!data?.success || !data?.data) {
          return [];
        }
        
        return data.data.map((service: any) => ({
          id: service.id,
          title: service.name,
          description: `${service.description} - Thời gian ước tính: ${service.estimated_time} ngày`,
          onPress: () => console.log(`Service ${service.id} pressed`),
        }));
      }}
    />
  );
};

export default ServiceScreen;