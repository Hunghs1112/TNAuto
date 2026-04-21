// src/services/warrantyApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';

export interface Warranty {
  id: number;
  order_id: number;
  service_id?: number | null;
  product_id?: number | null;
  dealer_id?: number | null;
  license_plate?: string | null;
  service_name?: string | null;
  product_name?: string | null;
  dealer_name?: string | null;
  warranty_period: number;
  start_date: string;
  end_date: string;
  warranty_type?: string | null;
  warranty_status?: string | null;
  days_remaining?: number | null;
}

interface CreateWarrantyRequest {
  order_id: number;
  customer_id: number;
  warranty_period: number;
  start_date: string;
  note?: string;
}

interface UpdateWarrantyRequest {
  warranty_period?: number;
  start_date?: string;
  note?: string;
}

interface CompleteServiceOrderRequest {
  delivery_date: string;
  warranty_period?: number; // Optional - backend will auto-fetch from service if not provided
}

interface CompleteServiceOrderResponse {
  success: boolean;
  warranty_id: number;
  message?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  filters?: Record<string, unknown>;
  customer?: Record<string, unknown>;
  garage?: Record<string, unknown>;
  pagination?: Record<string, unknown>;
  error?: string;
}

interface CustomerWarrantiesQueryArgs {
  userType: 'customer';
  userId: string;
  garageCode?: string;
  status?: 'all' | 'active' | 'expired';
  page?: number;
  limit?: number;
}

export const warrantyApi = createApi({
  ...API_CONFIG,
  reducerPath: 'warrantyApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Warranty'] as const,
  endpoints: (builder) => ({
    // 1. GET /api/customers/:id/warranties - Lấy danh sách warranty theo customer hiện tại
    getWarranties: builder.query<Warranty[], CustomerWarrantiesQueryArgs | undefined>({
      query: (args) => {
        return {
          url: ENDPOINTS.getCustomerWarranties.path,
          params: {
            // customer context is provided via x-customer-id header in baseApi
            garage_code: args?.garageCode,
            status: args?.status,
            page: args?.page,
            limit: args?.limit,
          },
        };
      },
      providesTags: ['Warranty'],
      transformResponse: (response: ApiResponse<Warranty[]>) => {
        if (!response.success) throw new Error(response.error || 'Failed to fetch warranties');
        return response.data || [];
      },
    }),

    // 2. POST /api/warranties - Tạo warranty mới
    createWarranty: builder.mutation<Warranty, CreateWarrantyRequest>({
      query: (body) => ({ 
        url: ENDPOINTS.createWarranty.path, 
        method: 'POST', 
        body 
      }),
      invalidatesTags: ['Warranty'],
      transformResponse: (response: ApiResponse<Warranty>) => {
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to create warranty');
        return response.data;
      },
    }),

    // 3. GET /api/warranties/:id - Lấy chi tiết warranty theo ID
    getWarrantyById: builder.query<Warranty, string>({
      query: (id) => buildEndpointUrl('getWarrantyById', { id }) || `/api/warranties/${id}`,
      providesTags: (result, error, id) => [{ type: 'Warranty' as const, id }],
      transformResponse: (response: ApiResponse<Warranty>) => {
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch warranty details');
        return response.data;
      },
    }),

    // 4. PATCH /api/warranties/:id - Cập nhật warranty
    updateWarranty: builder.mutation<Warranty, { id: string; data: UpdateWarrantyRequest }>({
      query: ({ id, data }) => ({ 
        url: buildEndpointUrl('updateWarranty', { id }) || `/api/warranties/${id}`, 
        method: 'PATCH', 
        body: data 
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Warranty' as const, id }],
      transformResponse: (response: ApiResponse<Warranty>) => {
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to update warranty');
        return response.data;
      },
    }),

    // 5. DELETE /api/warranties/:id - Xóa warranty
    deleteWarranty: builder.mutation<void, string>({
      query: (id) => ({ 
        url: buildEndpointUrl('deleteWarranty', { id }) || `/api/warranties/${id}`, 
        method: 'DELETE' 
      }),
      invalidatesTags: ['Warranty'],
      transformResponse: (response: ApiResponse<void>) => {
        if (!response.success) throw new Error(response.error || 'Failed to delete warranty');
      },
    }),

    // 6. PATCH /api/service-orders/admin/:id/complete - Hoàn thành service order và tạo warranty tự động
    completeServiceOrder: builder.mutation<CompleteServiceOrderResponse, { id: string; data: CompleteServiceOrderRequest }>({
      query: ({ id, data }) => ({ 
        url: buildEndpointUrl('completeServiceOrder', { id }) || `/api/service-orders/admin/${id}/complete`, 
        method: 'PATCH', 
        body: data 
      }),
      invalidatesTags: ['Warranty'],
      transformResponse: (response: ApiResponse<CompleteServiceOrderResponse>) => {
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to complete service order');
        return response.data;
      },
    }),
  }),
});

export const {
  useGetWarrantiesQuery,
  useCreateWarrantyMutation,
  useGetWarrantyByIdQuery,
  useUpdateWarrantyMutation,
  useDeleteWarrantyMutation,
  useCompleteServiceOrderMutation: useCompleteServiceOrderWithWarrantyMutation,
} = warrantyApi;
