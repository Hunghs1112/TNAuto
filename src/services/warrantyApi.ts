// src/services/warrantyApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { API_BASE_URL } from '../constants/config';

export interface Warranty {
  id: number;
  order_id: number;
  customer_id: number;
  warranty_period: number;
  start_date: string;
  end_date: string;
  note?: string | null;
  created_at?: string;
  customer_name: string;
  customer_phone: string;
  customer_avatar_url?: string | null;
  service_name?: string;
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

export const warrantyApi = createApi({
  reducerPath: 'warrantyApi' as const,
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Warranty'] as const,
  endpoints: (builder) => ({
    getAllWarranties: builder.query<Warranty[], { customer_id?: number }>({
      query: (params) => {
        const url = params.customer_id ? `${ENDPOINTS.getAllWarranties.path}?customer_id=${params.customer_id}` : ENDPOINTS.getAllWarranties.path;
        console.log('warrantyApi: getAllWarranties URL', url); // Debug URL
        return { url };
      },
      providesTags: ['Warranty'],
      transformResponse: (response: { success: boolean; data: Warranty[]; count: number }) => {
        console.log('warrantyApi: getAllWarranties response', response); // Debug response
        if (!response.success || !response.data) throw new Error('Failed to fetch warranties');
        return response.data;
      },
    }),
    createWarranty: builder.mutation<{ warranty_id: number }, CreateWarrantyRequest>({
      query: (body) => ({ url: ENDPOINTS.createWarranty.path, method: 'POST', body }),
      invalidatesTags: ['Warranty'],
      transformResponse: (response: { success: boolean; warranty_id: number; message: string }) => {
        console.log('warrantyApi: createWarranty response', response); // Debug response
        if (!response.success) throw new Error('Failed to create warranty');
        return { warranty_id: response.warranty_id };
      },
    }),
    getWarrantyById: builder.query<Warranty, number>({
      query: (id) => ({ url: `${ENDPOINTS.getWarrantyById.path.replace(':id', id.toString())}` }),
      providesTags: (result, error, id) => [{ type: 'Warranty' as const, id }],
      transformResponse: (response: { success: boolean; data: Warranty }) => {
        console.log('warrantyApi: getWarrantyById response', response); // Debug response
        if (!response.success || !response.data) throw new Error('Failed to fetch warranty');
        return response.data;
      },
    }),
    updateWarranty: builder.mutation<void, { id: number } & UpdateWarrantyRequest>({
      query: ({ id, ...body }) => ({ 
        url: `${ENDPOINTS.updateWarranty.path.replace(':id', id.toString())}`, 
        method: 'PATCH', 
        body 
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Warranty' as const, id }, 'Warranty'],
      transformResponse: (response: { success: boolean; message: string }) => {
        console.log('warrantyApi: updateWarranty response', response); // Debug response
        if (!response.success) throw new Error('Failed to update warranty');
      },
    }),
    deleteWarranty: builder.mutation<void, number>({
      query: (id) => ({ 
        url: `${ENDPOINTS.deleteWarranty.path.replace(':id', id.toString())}`, 
        method: 'DELETE' 
      }),
      invalidatesTags: ['Warranty'],
      transformResponse: (response: { success: boolean; message: string }) => {
        console.log('warrantyApi: deleteWarranty response', response); // Debug response
        if (!response.success) throw new Error('Failed to delete warranty');
      },
    }),
  }),
});

export const { 
  useGetAllWarrantiesQuery, 
  useCreateWarrantyMutation, 
  useGetWarrantyByIdQuery, 
  useUpdateWarrantyMutation, 
  useDeleteWarrantyMutation 
} = warrantyApi;