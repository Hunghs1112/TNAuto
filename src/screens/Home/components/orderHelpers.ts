export type ServiceSummary = { id: number; name: string; image_url?: string | null };

export type OrderLike = {
  service_id?: number;
  service_name?: string;
  service_image_url?: string | null;
  customer_name?: string | null;
  employee_name?: string | null;
  receiver_name?: string | null;
  license_plate?: string | null;
};

export const getServiceName = (item: OrderLike, services: ServiceSummary[]) => {
  if (item.service_name) return item.service_name;
  const service = item.service_id ? services.find((entry) => entry.id === Number(item.service_id)) : undefined;
  return service?.name || 'Dịch vụ không xác định';
};

export const getServiceImageUrl = (item: OrderLike, services: ServiceSummary[]) => {
  if (item.service_image_url) return item.service_image_url;
  const service = item.service_id ? services.find((entry) => entry.id === Number(item.service_id)) : undefined;
  return service?.image_url || null;
};
