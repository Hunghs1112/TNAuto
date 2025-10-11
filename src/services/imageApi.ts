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
  reducerPath: 'imageApi' as const,
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['ServiceOrderImage', 'UploadedImage'] as const,
  endpoints: (builder) => ({
    // Upload single image file
    uploadSingleImage: builder.mutation<UploadImageResponse, FormData>({
      query: (formData) => ({
        url: '/upload/single',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['UploadedImage'],
    }),
    // Upload multiple image files
    uploadMultipleImages: builder.mutation<UploadMultipleImagesResponse, FormData>({
      query: (formData) => ({
        url: '/upload/multiple',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['UploadedImage'],
    }),
    // Delete uploaded image file
    deleteUploadedImage: builder.mutation<DeleteImageResponse, string>({
      query: (filename) => ({
        url: `/upload/${filename}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UploadedImage'],
    }),
    // Save service order image metadata (after file upload)
    uploadServiceOrderImage: builder.mutation<UploadServiceOrderImageResponse, { order_id: string; image_url: string; status_at_time: string; uploaded_by: string; description?: string }>({
      query: (body) => ({ 
        url: '/service-order-images', 
        method: 'POST', 
        body 
      }),
      invalidatesTags: ['ServiceOrderImage'],
    }),
    // Get service order images
    getServiceOrderImages: builder.query<GetServiceOrderImagesResponse, string>({
      query: (order_id) => `/service-order-images/${order_id}`,
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