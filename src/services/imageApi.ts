// src/services/imageApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_BASE_URL } from '../constants/config';

interface ServiceOrderImage {
  id: string;
  order_id: string;
  image_url: string;
  status_at_time: string;
  description?: string;
  uploaded_by: string;
  created_at?: string;
}

interface UploadServiceOrderImageResponse {
  success: boolean;
  image_id: string;
  message: string;
}

interface GetServiceOrderImagesResponse {
  success: boolean;
  data: ServiceOrderImage[];
  count: number;
}

export const imageApi = createApi({
  reducerPath: 'imageApi' as const,
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['ServiceOrderImage'] as const,
  endpoints: (builder) => ({
    uploadServiceOrderImage: builder.mutation<UploadServiceOrderImageResponse, { order_id: string; image_url: string; status_at_time: string; uploaded_by: string; description?: string }>({
      query: (body) => ({ 
        url: '/service-order-images', 
        method: 'POST', 
        body 
      }),
      invalidatesTags: ['ServiceOrderImage'],
    }),
    getServiceOrderImages: builder.query<GetServiceOrderImagesResponse, string>({
      query: (order_id) => `/service-order-images/${order_id}`,
      providesTags: ['ServiceOrderImage'],
    }),
  }),
});

export const {
  useUploadServiceOrderImageMutation,
  useGetServiceOrderImagesQuery,
} = imageApi;