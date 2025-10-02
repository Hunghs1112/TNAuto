import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { API_BASE_URL } from '../constants/config';

interface Warranty {
  id: string;
  order_id: string;
  customer_id: string;
  warranty_period: string;
  start_date: string;
  image_url?: string;
}

export const warrantyApi = createApi({
  reducerPath: 'warrantyApi' as const,
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Warranty'] as const,
  endpoints: (builder) => ({
    checkWarranties: builder.query<Warranty[], { customer_id?: string; license_plate?: string }>({
      query: (params) => ({ url: ENDPOINTS.checkWarranties.path, params }),
      providesTags: ['Warranty'],
    }),
    createWarranty: builder.mutation<{ id: string }, { order_id: string; customer_id: string; warranty_period: string; start_date: string; image_url?: string }>({
      query: (body) => ({ url: ENDPOINTS.createWarranty.path, method: 'POST', body }),
      invalidatesTags: ['Warranty'],
    }),
    getAllWarranties: builder.query<Warranty[], void>({
      query: () => ENDPOINTS.getAllWarranties.path,
      providesTags: ['Warranty'],
    }),
  }),
});

export const {
  useCheckWarrantiesQuery,
  useCreateWarrantyMutation,
  useGetAllWarrantiesQuery,
} = warrantyApi;