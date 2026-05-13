// src/services/imageApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';

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

interface UploadImageResponse {
  success: boolean;
  message: string;
  url: string;
  filename: string;
}

interface UploadMultipleImagesResponse {
  success: boolean;
  message: string;
  files: Array<{
    url: string;
    filename: string;
  }>;
  count: number;
}

interface DeleteImageResponse {
  success: boolean;
  message: string;
}

export const imageApi = createApi({
  ...API_CONFIG,
  reducerPath: 'imageApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: ['ServiceOrderImage', 'UploadedImage'] as const,
  endpoints: (builder) => ({
    // Upload single image file
    uploadSingleImage: builder.mutation<UploadImageResponse, FormData>({
      query: (formData) => ({
        url: '/api/upload/single',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['UploadedImage'],
    }),
    // Upload multiple image files
    uploadMultipleImages: builder.mutation<UploadMultipleImagesResponse, FormData>({
      query: (formData) => ({
        url: '/api/upload/multiple',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['UploadedImage'],
    }),
    // Delete uploaded image file
    deleteUploadedImage: builder.mutation<DeleteImageResponse, string>({
      query: (filename) => ({
        url: `/api/upload/${filename}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UploadedImage'],
    }),
    // Save service order image metadata (after file upload) — employee scope
    uploadServiceOrderImage: builder.mutation<UploadServiceOrderImageResponse, { order_id: string; image_url: string; status_at_time: string; uploaded_by: string; description?: string }>({
      query: (body) => ({ 
        url: '/api/app/employee/orders/images', 
        method: 'POST', 
        body 
      }),
      invalidatesTags: ['ServiceOrderImage'],
    }),
    // Get service order images — employee scope
    getServiceOrderImages: builder.query<GetServiceOrderImagesResponse, string>({
      query: (order_id) => `/api/app/employee/orders/${order_id}/images`,
      providesTags: ['ServiceOrderImage'],
    }),
  }),
});

export const {
  useUploadSingleImageMutation,
  useUploadMultipleImagesMutation,
  useDeleteUploadedImageMutation,
  useUploadServiceOrderImageMutation,
  useGetServiceOrderImagesQuery,
} = imageApi;