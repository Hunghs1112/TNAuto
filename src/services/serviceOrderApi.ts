// src/services/serviceOrderApi.ts (Fixed: Change method to 'PUT' for updateServiceOrderStatus to match backend route)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_BASE_URL } from '../constants/config';

interface BaseServiceOrder {
  id: number;
  customer_id: number;
  service_id: number;
  license_plate: string;
  receive_date: string;
  status?: string;
  vehicle_type?: string | null;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  address?: string | null;
  delivery_date?: string | null;
  note?: string | null;
  created_at?: string;
}

interface ExtendedServiceOrder extends BaseServiceOrder {
  customer_name?: string;
  customer_phone?: string;
  customer_license_plate?: string;
  employee_name?: string | null;
  service_name?: string;
  service_description?: string;
  estimated_time?: number;
  image_count?: number;
}

interface ServiceOrderImage {
  id: number;
  order_id: number;
  image_url: string;
  status_at_time: string;
  uploaded_by: number;
  created_at: string;
}

interface Warranty {
  id: number;
  order_id: number;
  customer_id: number;
  warranty_period: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface Notification {
  id: number;
  recipient_id: number;
  recipient_type: 'customer' | 'employee';
  message: string;
  is_read: boolean;
  created_at: string;
}

interface DetailedServiceOrder extends ExtendedServiceOrder {
  images: ServiceOrderImage[];
  warranty: Warranty[];
  notifications: Notification[];
}

interface ApiResponse<T> {
  order_id: number | undefined;
  warranty_id: number | undefined;
  success: boolean;
  data?: T;
  count?: number;
  filters?: Record<string, string>;
  message?: string;
  error?: string;
}

export const serviceOrderApi = createApi({
  reducerPath: 'serviceOrderApi' as const,
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['ServiceOrder', 'Warranty'] as const,
  endpoints: (builder) => ({
    createServiceOrder: builder.mutation<{ id: number }, { 
      customer_id: number; 
      service_id: number; 
      license_plate: string; 
      vehicle_type?: string | null;
      receiver_name?: string | null;
      receiver_phone?: string | null;
      address?: string | null;
      receive_date: string;
      note?: string | null;
    }>({
      query: (body) => ({ url: ENDPOINTS.createServiceOrder.path, method: 'POST', body }),
      invalidatesTags: ['ServiceOrder'],
      transformResponse: (response: ApiResponse<{ id: number }>) => {
        console.log('createServiceOrder response:', response);
        if (!response.success) throw new Error(response.error || 'Failed to create service order');
        return { id: response.data?.id || response.order_id || 0 };
      },
    }),
    getAllServiceOrders: builder.query<ExtendedServiceOrder[], { status?: string; customer_phone?: string; employee_id?: string }>({
      query: (params) => ({ 
        url: ENDPOINTS.getAllServiceOrders.path, 
        params: { 
          status: params.status, 
          customer_phone: params.customer_phone, 
          employee_id: params.employee_id 
        } 
      }),
      providesTags: ['ServiceOrder'],
      transformResponse: (response: ApiResponse<ExtendedServiceOrder[]>) => {
        console.log('getAllServiceOrders response:', response);
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch service orders');
        return response.data;
      },
    }),
    getServiceOrderById: builder.query<DetailedServiceOrder, string>({
      query: (id) => buildEndpointUrl('getServiceOrderById', { id }),
      providesTags: (result, error, id) => [{ type: 'ServiceOrder' as const, id }],
      transformResponse: (response: ApiResponse<DetailedServiceOrder>) => {
        console.log('getServiceOrderById response:', response);
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch service order details');
        return response.data;
      },
    }),
    updateServiceOrderStatus: builder.mutation<void, { id: string; status: string; employee_id?: string; delivery_date?: string }>({
      query: ({ id, ...body }) => ({ 
        url: buildEndpointUrl('updateServiceOrderStatus', { id }), 
        method: 'PUT', 
        body 
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ServiceOrder' as const, id }],
      transformResponse: (response: ApiResponse<void>) => {
        console.log('updateServiceOrderStatus response:', response);
        if (!response.success) throw new Error(response.error || 'Failed to update service order status');
      },
    }),
    completeServiceOrder: builder.mutation<{ warranty_id: number }, { id: string; delivery_date: string; warranty_period: number }>({
      query: ({ id, ...body }) => ({ 
        url: buildEndpointUrl('completeServiceOrder', { id }), 
        method: 'PATCH', 
        body 
      }),
      invalidatesTags: ['ServiceOrder', 'Warranty'],
      transformResponse: (response: ApiResponse<{ warranty_id: number }>) => {
        console.log('completeServiceOrder response:', response);
        if (!response.success) throw new Error(response.error || 'Failed to complete service order');
        return { warranty_id: response.warranty_id || response.data?.warranty_id || 0 };
      },
    }),
  }),
});

export const {
  useCreateServiceOrderMutation,
  useGetAllServiceOrdersQuery,
  useGetServiceOrderByIdQuery,
  useUpdateServiceOrderStatusMutation,
  useCompleteServiceOrderMutation,
} = serviceOrderApi;