// src/services/warrantyApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_BASE_URL } from '../constants/config';

interface Warranty {
  id: number;
  order_id: number;
  customer_id: number;
  warranty_period: number;
  start_date: string;
  end_date: string;
  note?: string;
  created_at: string;
  updated_at: string;
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
  warranty_period: number;
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
  error?: string;
}

export const warrantyApi = createApi({
  reducerPath: 'warrantyApi' as const,
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Warranty'] as const,
  endpoints: (builder) => ({
    // 1. GET /api/warranties - Lấy danh sách warranty
    getWarranties: builder.query<Warranty[], void>({
      query: () => ENDPOINTS.getAllWarranties?.path || '/api/warranties',
      providesTags: ['Warranty'],
      transformResponse: (response: ApiResponse<Warranty[]>) => {
        console.log('getWarranties response:', response);
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch warranties');
        return response.data;
      },
    }),

    // 2. POST /api/warranties - Tạo warranty mới
    createWarranty: builder.mutation<Warranty, CreateWarrantyRequest>({
      query: (body) => ({ 
        url: ENDPOINTS.createWarranty?.path || '/api/warranties', 
        method: 'POST', 
        body 
      }),
      invalidatesTags: ['Warranty'],
      transformResponse: (response: ApiResponse<Warranty>) => {
        console.log('createWarranty response:', response);
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to create warranty');
        return response.data;
      },
    }),

    // 3. GET /api/warranties/:id - Lấy chi tiết warranty theo ID
    getWarrantyById: builder.query<Warranty, string>({
      query: (id) => buildEndpointUrl('getWarrantyById', { id }) || `/api/warranties/${id}`,
      providesTags: (result, error, id) => [{ type: 'Warranty' as const, id }],
      transformResponse: (response: ApiResponse<Warranty>) => {
        console.log('getWarrantyById response:', response);
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
        console.log('updateWarranty response:', response);
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
        console.log('deleteWarranty response:', response);
        if (!response.success) throw new Error(response.error || 'Failed to delete warranty');
      },
    }),

    // 6. PATCH /api/service-orders/:id/complete - Hoàn thành service order và tạo warranty tự động
    completeServiceOrder: builder.mutation<CompleteServiceOrderResponse, { id: string; data: CompleteServiceOrderRequest }>({
      query: ({ id, data }) => ({ 
        url: buildEndpointUrl('completeServiceOrder', { id }) || `/api/service-orders/${id}/complete`, 
        method: 'PATCH', 
        body: data 
      }),
      invalidatesTags: ['Warranty'],
      transformResponse: (response: ApiResponse<CompleteServiceOrderResponse>) => {
        console.log('completeServiceOrder response:', response);
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